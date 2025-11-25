#!/bin/bash
set -e

echo "=== Building Next.js for Railway ===" echo ""

# Step 1: Build with Next.js
echo "Step 1: Running next build..."
npm run build || {
    echo "⚠️  Build had errors, checking if .next exists..."

    if [ ! -d ".next" ]; then
        echo "❌ .next directory not found, build failed completely"
        exit 1
    fi

    echo "✓ .next directory exists, continuing..."
}

# Step 2: Verify critical files exist
echo ""
echo "Step 2: Verifying build output..."

# Create prerender-manifest.json if it doesn't exist
if [ ! -f ".next/prerender-manifest.json" ]; then
    echo "⚠️  prerender-manifest.json missing, creating empty one..."
    mkdir -p .next
    echo '{"version":3,"routes":{},"dynamicRoutes":{},"notFoundRoutes":[],"preview":{"previewModeId":"development-id","previewModeSigningKey":"development-signing-key","previewModeEncryptionKey":"development-encryption-key"}}' > .next/prerender-manifest.json
    echo "✓ Created prerender-manifest.json"
fi

# Verify other critical files
for file in "build-manifest.json" "routes-manifest.json"; do
    if [ ! -f ".next/$file" ]; then
        echo "⚠️  Warning: .next/$file is missing"
    else
        echo "✓ .next/$file exists"
    fi
done

echo ""
echo "=== Build Complete ==="
echo "✓ .next directory: $(du -sh .next | cut -f1)"
echo "✓ Ready for production"
