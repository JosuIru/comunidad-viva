#!/bin/bash
set -e

echo "=== INIT-DB.SH STARTING ==="
echo "Current directory: $(pwd)"
echo "DATABASE_URL set: ${DATABASE_URL:+YES}"

echo "Generating Prisma Client..."
npx prisma generate

echo "Deploying migrations..."
npx prisma migrate deploy

echo "=== INIT-DB.SH COMPLETE ==="
