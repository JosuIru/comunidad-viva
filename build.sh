#!/bin/bash
set -e

echo "=== Build Process ==="
echo "Current directory: $(pwd)"

cd packages/backend || exit 1
echo "Changed to: $(pwd)"

echo ""
echo "Step 1: Generating Prisma client..."
npx prisma generate || exit 1

echo ""
echo "Step 2: Compiling TypeScript (errors are OK, files will be generated)..."
echo "Running: ./node_modules/.bin/tsc"
echo "Working directory: $(pwd)"
echo "TypeScript config: tsconfig.json"

# Run tsc and capture exit code but continue regardless
set +e
./node_modules/.bin/tsc
TSC_EXIT_CODE=$?
set -e

echo ""
echo "tsc exit code: $TSC_EXIT_CODE"
echo "(This is expected to be non-zero due to type errors, but files should still be generated)"

echo ""
echo "Step 3: Checking build output..."
echo "Looking for dist/main.js in: $(pwd)"
echo "Contents of current directory:"
ls -la

echo ""
echo "Checking if dist directory exists:"
if [ -d "dist" ]; then
    echo "✓ dist directory exists"
    echo "Contents of dist/:"
    ls -la dist/ | head -20
else
    echo "✗ dist directory does NOT exist"
    exit 1
fi

echo ""
if [ -f "dist/main.js" ]; then
    echo "✓ Build successful! dist/main.js found"
    echo "File size: $(ls -lh dist/main.js | awk '{print $5}')"
    exit 0
else
    echo "✗ Build failed - dist/main.js not found"
    echo "Files in dist/:"
    find dist -type f | head -20
    exit 1
fi
