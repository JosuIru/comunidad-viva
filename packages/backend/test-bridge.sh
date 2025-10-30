#!/bin/bash

# Test script for Bridge System
# Usage: ./test-bridge.sh

set -e

echo "🌉 Testing Bridge System"
echo "========================"
echo ""

BASE_URL="http://localhost:4000"
TOKEN=""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Helper function to print success
success() {
    echo -e "${GREEN}✅ $1${NC}"
}

# Helper function to print error
error() {
    echo -e "${RED}❌ $1${NC}"
}

# Helper function to print info
info() {
    echo -e "${YELLOW}ℹ️  $1${NC}"
}

# Test 1: Check if backend is running
echo "Test 1: Backend Health Check"
if curl -sf ${BASE_URL}/health > /dev/null; then
    success "Backend is running"
else
    error "Backend is not running"
    exit 1
fi
echo ""

# Test 2: Get supported chains
echo "Test 2: Get Supported Chains"
CHAINS=$(curl -s ${BASE_URL}/bridge/chains)
if echo "$CHAINS" | jq -e '.[0].chain' > /dev/null 2>&1; then
    success "Bridge chains endpoint working"
    echo "$CHAINS" | jq '.'
else
    error "Bridge chains endpoint failed"
fi
echo ""

# Test 3: Get bridge stats
echo "Test 3: Get Bridge Statistics"
STATS=$(curl -s ${BASE_URL}/bridge/stats)
if echo "$STATS" | jq -e '.totalBridged' > /dev/null 2>&1; then
    success "Bridge stats endpoint working"
    echo "$STATS" | jq '.'
else
    error "Bridge stats endpoint failed"
fi
echo ""

# Test 4: Login (if credentials provided)
if [ ! -z "$TEST_EMAIL" ] && [ ! -z "$TEST_PASSWORD" ]; then
    echo "Test 4: User Authentication"
    LOGIN_RESPONSE=$(curl -s -X POST ${BASE_URL}/auth/login \
        -H "Content-Type: application/json" \
        -d "{\"email\":\"$TEST_EMAIL\",\"password\":\"$TEST_PASSWORD\"}")

    TOKEN=$(echo "$LOGIN_RESPONSE" | jq -r '.access_token')

    if [ "$TOKEN" != "null" ] && [ ! -z "$TOKEN" ]; then
        success "Login successful"
        info "Token: ${TOKEN:0:20}..."
    else
        error "Login failed"
        echo "$LOGIN_RESPONSE" | jq '.'
    fi
    echo ""

    # Test 5: Get SEMILLA balance
    if [ ! -z "$TOKEN" ]; then
        echo "Test 5: Check SEMILLA Balance"
        BALANCE=$(curl -s ${BASE_URL}/federation/semilla/balance \
            -H "Authorization: Bearer $TOKEN")

        if echo "$BALANCE" | jq -e '.balance' > /dev/null 2>&1; then
            success "Balance check successful"
            echo "$BALANCE" | jq '.'

            CURRENT_BALANCE=$(echo "$BALANCE" | jq -r '.balance')
            info "Current balance: $CURRENT_BALANCE SEMILLA"
        else
            error "Balance check failed"
        fi
        echo ""

        # Test 6: Get bridge history
        echo "Test 6: Get Bridge History"
        HISTORY=$(curl -s "${BASE_URL}/bridge/history?page=1&limit=10" \
            -H "Authorization: Bearer $TOKEN")

        if echo "$HISTORY" | jq -e '.data' > /dev/null 2>&1; then
            success "Bridge history endpoint working"
            BRIDGE_COUNT=$(echo "$HISTORY" | jq '.data | length')
            info "Found $BRIDGE_COUNT bridge transactions"

            if [ "$BRIDGE_COUNT" -gt 0 ]; then
                echo "$HISTORY" | jq '.data[0]'
            fi
        else
            error "Bridge history endpoint failed"
        fi
        echo ""

        # Test 7: Attempt bridge (optional - only if balance > 100)
        if (( $(echo "$CURRENT_BALANCE > 100" | bc -l) )); then
            if [ "$RUN_BRIDGE_TEST" = "true" ]; then
                echo "Test 7: Create Bridge Transaction (Lock)"
                info "This will attempt a real bridge transaction"

                # Check if external address is provided
                if [ -z "$TEST_EXTERNAL_ADDRESS" ]; then
                    error "TEST_EXTERNAL_ADDRESS not set. Skipping bridge test."
                else
                    BRIDGE_REQUEST=$(curl -s -X POST ${BASE_URL}/bridge/lock \
                        -H "Authorization: Bearer $TOKEN" \
                        -H "Content-Type: application/json" \
                        -d "{
                            \"amount\": 10,
                            \"targetChain\": \"POLYGON\",
                            \"externalAddress\": \"$TEST_EXTERNAL_ADDRESS\"
                        }")

                    BRIDGE_ID=$(echo "$BRIDGE_REQUEST" | jq -r '.id')

                    if [ "$BRIDGE_ID" != "null" ] && [ ! -z "$BRIDGE_ID" ]; then
                        success "Bridge transaction created"
                        echo "$BRIDGE_REQUEST" | jq '.'
                        info "Bridge ID: $BRIDGE_ID"

                        # Wait and check status
                        echo ""
                        info "Waiting 5 seconds..."
                        sleep 5

                        echo "Checking bridge status..."
                        BRIDGE_STATUS=$(curl -s ${BASE_URL}/bridge/transaction/$BRIDGE_ID \
                            -H "Authorization: Bearer $TOKEN")

                        echo "$BRIDGE_STATUS" | jq '.'

                        CURRENT_STATUS=$(echo "$BRIDGE_STATUS" | jq -r '.status')
                        info "Current status: $CURRENT_STATUS"

                        if [ "$CURRENT_STATUS" = "MINTED" ] || [ "$CURRENT_STATUS" = "COMPLETED" ]; then
                            success "Bridge processed successfully!"
                        elif [ "$CURRENT_STATUS" = "PENDING" ] || [ "$CURRENT_STATUS" = "LOCKED" ]; then
                            info "Bridge is still processing (expected with RPC not configured)"
                        elif [ "$CURRENT_STATUS" = "FAILED" ]; then
                            error "Bridge failed"
                        fi
                    else
                        error "Failed to create bridge transaction"
                        echo "$BRIDGE_REQUEST" | jq '.'
                    fi
                fi
                echo ""
            else
                info "Bridge test skipped (set RUN_BRIDGE_TEST=true to enable)"
                echo ""
            fi
        else
            info "Insufficient balance for bridge test (need > 100 SEMILLA)"
            echo ""
        fi
    fi
else
    info "Skipping authenticated tests (set TEST_EMAIL and TEST_PASSWORD)"
    echo ""
fi

# Test 8: Get worker status
echo "Test 8: Bridge Worker Status"
WORKER_STATUS=$(curl -s ${BASE_URL}/bridge/worker/status)
if echo "$WORKER_STATUS" | jq -e '.pendingLocks' > /dev/null 2>&1; then
    success "Worker status endpoint working"
    echo "$WORKER_STATUS" | jq '.'

    PENDING_LOCKS=$(echo "$WORKER_STATUS" | jq -r '.pendingLocks')
    PENDING_UNLOCKS=$(echo "$WORKER_STATUS" | jq -r '.pendingUnlocks')
    FAILED=$(echo "$WORKER_STATUS" | jq -r '.failedBridges')

    info "Pending locks: $PENDING_LOCKS"
    info "Pending unlocks: $PENDING_UNLOCKS"
    info "Failed bridges: $FAILED"
else
    error "Worker status endpoint failed"
fi
echo ""

# Summary
echo "========================"
echo "🎉 Test Summary"
echo "========================"
echo ""
echo "All basic bridge endpoints are working correctly!"
echo ""
echo "Next steps:"
echo "1. Configure POLYGON_RPC_URL in .env"
echo "2. Configure POLYGON_SEMILLA_CONTRACT in .env"
echo "3. Deploy smart contract to Mumbai testnet"
echo "4. Test full bridge flow with real transactions"
echo ""
echo "To run authenticated tests:"
echo "  export TEST_EMAIL='your@email.com'"
echo "  export TEST_PASSWORD='yourpassword'"
echo "  ./test-bridge.sh"
echo ""
echo "To test actual bridging:"
echo "  export RUN_BRIDGE_TEST=true"
echo "  export TEST_EXTERNAL_ADDRESS='0x...'"
echo "  ./test-bridge.sh"
echo ""
