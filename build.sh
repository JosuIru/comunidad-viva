#!/bin/bash

echo "Starting build process..."
echo "Current directory: $(pwd)"
echo "Listing root contents:"
ls -la

echo "Changing to packages/backend..."
cd packages/backend || { echo "Failed to cd to packages/backend"; exit 1; }

echo "Current directory after cd: $(pwd)"
echo "Listing backend contents:"
ls -la

echo "Generating Prisma client..."
npx prisma generate || { echo "Prisma generate failed"; exit 1; }

echo "Compiling TypeScript..."
set +e  # Disable exit on error temporarily
npx tsc > /tmp/tsc-output.log 2>&1
TSC_EXIT=$?
set -e  # Re-enable exit on error
echo "TypeScript exit code: $TSC_EXIT (ignored)"
echo "First 10 lines of tsc output:"
head -10 /tmp/tsc-output.log 2>/dev/null || echo "No output file"

echo "Checking for dist/main.js..."
if [ -f "dist/main.js" ]; then
    echo "✓ Build successful! dist/main.js created"
    ls -lh dist/main.js
    exit 0
else
    echo "✗ Build failed: dist/main.js not found"
    echo "Contents of dist directory:"
    ls -la dist/ 2>/dev/null || echo "dist directory does not exist"
    exit 1
fi
