#!/bin/bash
set -e

echo "=== Build Process for Railway ==="
echo "Generating Prisma client only..."

cd packages/backend

echo "Generating Prisma client..."
npx prisma generate

echo "✓ Build completed successfully (running with ts-node)"
echo "Note: TypeScript will be interpreted at runtime using ts-node"
exit 0
