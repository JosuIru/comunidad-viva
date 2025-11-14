#!/bin/bash
set -e

echo "=== STARTING APPLICATION ==="
echo "Current directory: $(pwd)"
echo "DATABASE_URL is set: ${DATABASE_URL:+YES}"

# Function to wait for database connection
wait_for_db() {
  local max_attempts=30
  local attempt=1
  local wait_time=3

  echo "Waiting for database to be ready..."

  while [ $attempt -le $max_attempts ]; do
    echo "Attempt $attempt/$max_attempts: Checking database connection..."

    if npx prisma db execute --stdin <<< "SELECT 1;" > /dev/null 2>&1; then
      echo "✓ Database is ready!"
      return 0
    fi

    if [ $attempt -eq $max_attempts ]; then
      echo "✗ Failed to connect to database after $max_attempts attempts"
      return 1
    fi

    echo "  Database not ready yet, waiting ${wait_time}s..."
    sleep $wait_time
    attempt=$((attempt + 1))
  done
}

echo ""
echo "Step 1: Generating Prisma Client..."
npx prisma generate

echo ""
echo "Step 2: Waiting for Database..."
wait_for_db || {
  echo "ERROR: Could not connect to database"
  echo "Please check:"
  echo "  1. DATABASE_URL is set correctly"
  echo "  2. Database service is running"
  echo "  3. Network connectivity to database"
  exit 1
}

echo ""
echo "Step 3: Running Database Migrations..."
npx prisma migrate deploy

echo ""
echo "Step 4: Starting Server..."
echo "Using 'nest start' to compile and run TypeScript on-the-fly"
npm run start
