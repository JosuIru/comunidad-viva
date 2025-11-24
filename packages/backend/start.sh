#!/bin/bash
# Disable exit on error temporarily to log all steps
set +e

echo "=== STARTING TRUK BACKEND ==="
echo "Current directory: $(pwd)"
echo "Node version: $(node --version)"
echo "npm version: $(npm --version)"
echo ""
echo "Environment variables:"
echo "  DATABASE_URL: ${DATABASE_URL:+SET (${#DATABASE_URL} chars)}"
echo "  JWT_SECRET: ${JWT_SECRET:+SET (${#JWT_SECRET} chars)}"
echo "  PORT: ${PORT:-NOT SET (will use 4000)}"
echo "  NODE_ENV: ${NODE_ENV:-NOT SET}"
echo ""

echo "Step 1: Checking dist/main.js..."
if [ ! -f "dist/main.js" ]; then
  echo "❌ CRITICAL: dist/main.js not found!"
  echo "Current directory contents:"
  ls -la
  echo "Dist directory:"
  ls -la dist/ 2>&1 || echo "dist/ directory does not exist"
  exit 1
fi
echo "✓ dist/main.js found ($(ls -lh dist/main.js | awk '{print $5}'))"

echo ""
echo "Step 2: Generating Prisma Client..."
npx prisma generate
PRISMA_GEN_EXIT=$?
if [ $PRISMA_GEN_EXIT -ne 0 ]; then
  echo "❌ Prisma generate failed with exit code $PRISMA_GEN_EXIT"
  echo "Trying to continue anyway..."
fi

echo ""
echo "Step 3: Database Schema Sync..."
echo "Attempting db push (skip-generate)..."
npx prisma db push --accept-data-loss --skip-generate
DB_PUSH_EXIT=$?
if [ $DB_PUSH_EXIT -ne 0 ]; then
  echo "⚠️  DB push failed (exit $DB_PUSH_EXIT), trying migrate deploy..."
  npx prisma migrate deploy
  MIGRATE_EXIT=$?
  if [ $MIGRATE_EXIT -ne 0 ]; then
    echo "⚠️  Migrate also failed (exit $MIGRATE_EXIT)"
    echo "Continuing to start server anyway - may fail if DB schema is wrong"
  fi
fi

echo ""
echo "Step 4: Starting NestJS Application..."
echo "Command: node dist/main.js"
echo "Listening on PORT: ${PORT:-4000}"
echo "==========================================="
echo ""

# Re-enable exit on error for the actual app
set -e
exec node dist/main.js
