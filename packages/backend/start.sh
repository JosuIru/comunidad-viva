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
# Use db push to sync all missing tables (faster than migrations for catching up)
npx prisma db push --accept-data-loss --skip-generate || {
  echo "Warning: db push failed, trying migrate deploy..."
  npx prisma migrate deploy
}

echo ""
echo "Step 3: Starting Server..."
echo "Running pre-compiled JavaScript from dist/"
node dist/main.js
