#!/bin/bash
echo "=== RAILWAY ENVIRONMENT DEBUG ==="
echo "Current directory: $(pwd)"
echo "User: $(whoami)"
echo "Node version: $(node --version)"
echo "NPM version: $(npm --version)"
echo "PATH: $PATH"
echo "DATABASE_URL set: ${DATABASE_URL:+YES}"
echo "JWT_SECRET set: ${JWT_SECRET:+YES}"
echo "PORT: ${PORT:-not set}"
echo "==================================="
# Force redeploy lun 24 nov 2025 17:07:31 CET
