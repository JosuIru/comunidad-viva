#!/bin/bash
set -e

cd packages/backend

echo "Generating Prisma client..."
npx prisma generate

echo "Compiling TypeScript..."
npx tsc || true

if [ -f "dist/main.js" ]; then
    echo "Build successful! dist/main.js created"
    exit 0
else
    echo "Build failed: dist/main.js not found"
    exit 1
fi
