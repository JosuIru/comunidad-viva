#!/bin/bash
set -e

echo "=== STARTING APPLICATION ==="
echo "Current directory: $(pwd)"
echo "DATABASE_URL is set: ${DATABASE_URL:+YES}"

echo ""
echo "Step 1: Generating Prisma Client..."
npx prisma generate

echo ""
echo "Step 2: Synchronizing Database Schema..."

# Check if migrations are in a failed state
echo "Checking migration status..."
MIGRATION_STATUS=$(npx prisma migrate status 2>&1 || true)

if echo "$MIGRATION_STATUS" | grep -q "migration.*failed\|cannot be applied\|P3009"; then
  echo "⚠️  Failed migration detected. Running fix script..."
  node scripts/fix-migration.js || {
    echo "Fix script failed. Trying manual resolution..."
    npx prisma migrate resolve --applied 20251120000000_add_social_integrations || true
    npx prisma db push --accept-data-loss --skip-generate
  }
else
  echo "✓ No failed migrations detected"
  # Normal migration flow
  npx prisma db push --accept-data-loss --skip-generate || npx prisma migrate deploy
fi

echo ""
echo "Step 3: Starting Server..."
echo "Running pre-compiled JavaScript from dist/"
node dist/main.js
