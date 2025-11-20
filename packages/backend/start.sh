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

# Check if migrations are in a failed state and reset if needed
echo "Checking migration status..."
if npx prisma migrate status 2>&1 | grep -q "migration is failed\|cannot be applied"; then
  echo "⚠️  Migrations are in failed state. Resetting..."
  npx prisma migrate resolve --applied 20251120000000_add_social_integrations || true
fi

# Use db push to sync all missing tables (faster than migrations for catching up)
echo "Pushing schema to database..."
npx prisma db push --accept-data-loss --skip-generate || {
  echo "Warning: db push failed, trying migrate deploy..."
  npx prisma migrate deploy || {
    echo "Migration deploy also failed. Attempting to resolve..."
    npx prisma migrate resolve --applied 20251120000000_add_social_integrations || true
    npx prisma db push --accept-data-loss --skip-generate --force-reset
  }
}

echo ""
echo "Step 3: Starting Server..."
echo "Running pre-compiled JavaScript from dist/"
node dist/main.js
