#!/bin/bash
set -e

echo "=== STARTING TRUK BACKEND ==="
echo "Current directory: $(pwd)"
echo "Node version: $(node --version)"
echo "DATABASE_URL is set: ${DATABASE_URL:+YES}"
echo "JWT_SECRET is set: ${JWT_SECRET:+YES}"
echo "PORT is set to: ${PORT:-3000}"

echo ""
echo "Step 1: Generating Prisma Client..."
npx prisma generate || {
  echo "❌ Failed to generate Prisma Client"
  exit 1
}

echo ""
echo "Step 2: Synchronizing Database Schema..."
# Use db push for simplicity - it's idempotent and handles schema sync
npx prisma db push --accept-data-loss --skip-generate || {
  echo "⚠️  Database push failed, trying migrate deploy..."
  npx prisma migrate deploy || {
    echo "⚠️  Migration failed, but continuing anyway..."
  }
}

echo ""
echo "Step 3: Checking if dist/main.js exists..."
if [ ! -f "dist/main.js" ]; then
  echo "❌ dist/main.js not found! Build may have failed."
  echo "Contents of current directory:"
  ls -la
  exit 1
fi

echo "✓ dist/main.js found"
echo ""
echo "Step 4: Starting NestJS Server..."
echo "Running: node dist/main.js"
node dist/main.js
