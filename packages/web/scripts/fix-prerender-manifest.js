#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const prerenderManifestPath = path.join(__dirname, '..', '.next', 'prerender-manifest.json');

// Check if prerender-manifest.json exists
if (!fs.existsSync(prerenderManifestPath)) {
  console.log('⚠️  prerender-manifest.json not found, creating minimal version...');

  // Create minimal prerender manifest
  const minimalManifest = {
    version: 4,
    routes: {},
    dynamicRoutes: {},
    notFoundRoutes: [],
    preview: {
      previewModeId: 'development-id',
      previewModeSigningKey: 'development-signing-key',
      previewModeEncryptionKey: 'development-encryption-key'
    }
  };

  fs.writeFileSync(prerenderManifestPath, JSON.stringify(minimalManifest, null, 2));
  console.log('✅ Created prerender-manifest.json');
} else {
  console.log('✅ prerender-manifest.json already exists');
}
