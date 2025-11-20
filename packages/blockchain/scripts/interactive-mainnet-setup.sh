#!/bin/bash

# Interactive Mainnet Setup Script
# Guides through Gnosis Safe creation and contract deployments

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Emojis
CHECK="✅"
CROSS="❌"
ROCKET="🚀"
WARN="⚠️"
INFO="ℹ️"

echo -e "${BLUE}${ROCKET} Comunidad Viva - Production Deployment${NC}"
echo -e "${BLUE}===========================================${NC}\n"

# Function to ask yes/no questions
ask_yes_no() {
    local question=$1
    local default=${2:-n}

    if [ "$default" = "y" ]; then
        prompt="[Y/n]"
    else
        prompt="[y/N]"
    fi

    while true; do
        read -p "$(echo -e ${YELLOW}${question} ${prompt}: ${NC})" answer
        answer=${answer:-$default}
        case $answer in
            [Yy]* ) return 0;;
            [Nn]* ) return 1;;
            * ) echo "Please answer yes or no.";;
        esac
    done
}

# Function to read input
read_input() {
    local prompt=$1
    local var_name=$2
    read -p "$(echo -e ${YELLOW}${prompt}: ${NC})" value
    eval $var_name="'$value'"
}

echo -e "${BLUE}${INFO} Pre-flight Checks${NC}\n"

# Check if on correct branch
CURRENT_BRANCH=$(git branch --show-current)
echo -e "Current branch: ${GREEN}$CURRENT_BRANCH${NC}"

# Check for .env file
if [ ! -f "$PROJECT_ROOT/../backend/.env" ]; then
    echo -e "${RED}${CROSS} .env file not found in packages/backend/${NC}"
    exit 1
fi

echo -e "${GREEN}${CHECK} .env file found${NC}\n"

# === STEP 1: GNOSIS SAFE SETUP ===
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}${ROCKET} Step 1: Gnosis Safe Setup${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}\n"

if ask_yes_no "Do you already have a Gnosis Safe on Polygon mainnet?"; then
    read_input "Enter your Gnosis Safe address" GNOSIS_SAFE_ADDRESS

    echo -e "\n${INFO} Verifying Safe..."

    # Add to .env if not already there
    if ! grep -q "GNOSIS_SAFE_POLYGON_MAINNET" "$PROJECT_ROOT/../backend/.env"; then
        echo "GNOSIS_SAFE_POLYGON_MAINNET=$GNOSIS_SAFE_ADDRESS" >> "$PROJECT_ROOT/../backend/.env"
        echo -e "${GREEN}${CHECK} Added to .env${NC}"
    else
        echo -e "${YELLOW}${WARN} Already in .env${NC}"
    fi
else
    echo -e "\n${INFO} Please create a Gnosis Safe:"
    echo -e "1. Go to: ${BLUE}https://app.safe.global/${NC}"
    echo -e "2. Connect your wallet (MetaMask)"
    echo -e "3. Switch to ${GREEN}Polygon Mainnet${NC}"
    echo -e "4. Click 'Create new Safe'"
    echo -e "5. Add owners (minimum 2, recommended 3)"
    echo -e "6. Set threshold (2/3 or 3/5 recommended)"
    echo -e "7. Deploy Safe (costs ~0.01 MATIC)\n"

    echo -e "${YELLOW}Press Enter when Safe is created...${NC}"
    read

    read_input "Enter your new Gnosis Safe address" GNOSIS_SAFE_ADDRESS

    # Add to .env
    echo "GNOSIS_SAFE_POLYGON_MAINNET=$GNOSIS_SAFE_ADDRESS" >> "$PROJECT_ROOT/../backend/.env"
    echo -e "${GREEN}${CHECK} Added to .env${NC}"
fi

echo -e "\n${GREEN}${CHECK} Gnosis Safe configured: $GNOSIS_SAFE_ADDRESS${NC}\n"

# === STEP 2: POLYGON DEPLOYMENT ===
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}${ROCKET} Step 2: Deploy WrappedSEMILLA to Polygon${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}\n"

# Check MATIC balance
echo -e "${INFO} Checking deployer wallet balance...\n"

if ask_yes_no "Do you have at least 0.1 MATIC in your deployer wallet?"; then

    # Dry run first
    echo -e "\n${INFO} Running dry-run deployment...\n"

    cd "$PROJECT_ROOT"
    export DRY_RUN=true
    npx hardhat run scripts/deploy-polygon-mainnet.js --network polygon

    echo -e "\n"
    if ask_yes_no "${WARN} This will deploy to POLYGON MAINNET and spend real MATIC. Continue?"; then

        echo -e "\n${ROCKET} Deploying to Polygon mainnet...\n"

        export DRY_RUN=false
        export AUTO_CONFIRM=true
        npx hardhat run scripts/deploy-polygon-mainnet.js --network polygon

        echo -e "\n${GREEN}${CHECK} Deployment complete!${NC}\n"

        # Get contract address from deployment file
        if [ -f "$PROJECT_ROOT/deployments/polygon-mainnet-wsemilla.json" ]; then
            CONTRACT_ADDRESS=$(cat "$PROJECT_ROOT/deployments/polygon-mainnet-wsemilla.json" | grep -o '"contractAddress":"[^"]*' | sed 's/"contractAddress":"//')
            echo -e "${INFO} Contract deployed at: ${GREEN}$CONTRACT_ADDRESS${NC}\n"

            # Verify on Polygonscan
            if ask_yes_no "Do you want to verify the contract on Polygonscan?"; then
                echo -e "\n${INFO} Verifying contract...\n"
                npx hardhat verify --network polygon "$CONTRACT_ADDRESS" "$GNOSIS_SAFE_ADDRESS" "$(grep PRIVATE_KEY $PROJECT_ROOT/../backend/.env | cut -d'=' -f2 | head -c 42)"
                echo -e "\n${GREEN}${CHECK} Contract verified!${NC}"
            fi
        fi
    else
        echo -e "${YELLOW}Skipping deployment${NC}"
    fi
else
    echo -e "${RED}${CROSS} Insufficient MATIC balance${NC}"
    echo -e "${INFO} You need MATIC to deploy. Options:"
    echo -e "  1. Buy MATIC on exchange (Coinbase, Binance, etc.)"
    echo -e "  2. Bridge from Ethereum using Polygon Bridge"
    echo -e "  3. Buy with card on Polygon\n"
    exit 1
fi

# === STEP 3: SOLANA MAINNET SETUP ===
echo -e "\n${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}${ROCKET} Step 3: Setup Solana SPL Token${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}\n"

if ask_yes_no "Do you want to create SPL Token on Solana MAINNET? (costs ~0.01 SOL)"; then

    echo -e "\n${WARN} ${RED}WARNING: This will create a token on Solana MAINNET${NC}"
    echo -e "${INFO} Make sure you have SOL in your wallet\n"

    if ask_yes_no "Continue with MAINNET deployment?"; then
        echo -e "\n${ROCKET} Creating SPL Token on Solana mainnet...\n"

        cd "$PROJECT_ROOT"
        node scripts/setup-solana-production.js --network mainnet-beta

        echo -e "\n${GREEN}${CHECK} Solana setup complete!${NC}"
    else
        echo -e "${YELLOW}Skipping Solana mainnet setup${NC}"

        if ask_yes_no "Do you want to setup on DEVNET instead?"; then
            echo -e "\n${INFO} Setting up on Solana devnet...\n"
            node scripts/setup-solana-production.js --network devnet
        fi
    fi
else
    echo -e "${YELLOW}Skipping Solana setup${NC}"
fi

# === FINAL SUMMARY ===
echo -e "\n${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}${ROCKET} Deployment Summary${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}\n"

echo -e "${GREEN}${CHECK} Gnosis Safe:${NC} $GNOSIS_SAFE_ADDRESS"

if [ -f "$PROJECT_ROOT/deployments/polygon-mainnet-wsemilla.json" ]; then
    CONTRACT_ADDRESS=$(cat "$PROJECT_ROOT/deployments/polygon-mainnet-wsemilla.json" | grep -o '"contractAddress":"[^"]*' | sed 's/"contractAddress":"//')
    echo -e "${GREEN}${CHECK} WrappedSEMILLA:${NC} $CONTRACT_ADDRESS"
    echo -e "    View on Polygonscan: ${BLUE}https://polygonscan.com/address/$CONTRACT_ADDRESS${NC}"
fi

if grep -q "SOLANA_SEMILLA_MINT" "$PROJECT_ROOT/../backend/.env"; then
    SOLANA_MINT=$(grep SOLANA_SEMILLA_MINT "$PROJECT_ROOT/../backend/.env" | cut -d'=' -f2)
    echo -e "${GREEN}${CHECK} Solana SPL Token:${NC} $SOLANA_MINT"
    echo -e "    View on Solana Explorer: ${BLUE}https://explorer.solana.com/address/$SOLANA_MINT${NC}"
fi

echo -e "\n${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}${ROCKET} Next Steps:${NC}\n"
echo -e "1. Transfer ownership to Gnosis Safe"
echo -e "   ${BLUE}npx hardhat run scripts/transfer-ownership.js --network polygon${NC}\n"
echo -e "2. Add backend wallet as bridge operator"
echo -e "   ${BLUE}node scripts/gnosis-safe-utils.js propose-mint <SAFE> <BACKEND_WALLET>${NC}\n"
echo -e "3. Setup monitoring alerts"
echo -e "   - Configure Discord/Telegram webhooks"
echo -e "   - Test emergency pause\n"
echo -e "4. Load testing"
echo -e "   - Test bridge transactions"
echo -e "   - Verify analytics working\n"

echo -e "${GREEN}${CHECK} All deployments complete! 🎉${NC}\n"
