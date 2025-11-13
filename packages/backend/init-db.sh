#!/bin/bash
set -e

echo "========================================="
echo "🔧 Database Initialization Script"
echo "========================================="
echo ""

echo "📍 Current directory: $(pwd)"
echo "📂 Listing files:"
ls -la

echo ""
echo "🔍 Checking for Prisma schema..."
if [ -f "prisma/schema.prisma" ]; then
    echo "✅ Found prisma/schema.prisma"
else
    echo "❌ ERROR: prisma/schema.prisma not found!"
    exit 1
fi

echo ""
echo "🔍 Checking for migrations directory..."
if [ -d "prisma/migrations" ]; then
    echo "✅ Found prisma/migrations"
    echo "📋 Migrations found:"
    ls -1 prisma/migrations/
else
    echo "❌ ERROR: prisma/migrations directory not found!"
    exit 1
fi

echo ""
echo "🔗 Checking DATABASE_URL..."
if [ -z "$DATABASE_URL" ]; then
    echo "❌ ERROR: DATABASE_URL is not set!"
    exit 1
else
    echo "✅ DATABASE_URL is set"
fi

echo ""
echo "⚙️  Step 1: Generating Prisma Client..."
npx prisma generate

echo ""
echo "📦 Step 2: Running Prisma Migrations..."
npx prisma migrate deploy

echo ""
echo "✅ Database initialization complete!"
echo "========================================="
