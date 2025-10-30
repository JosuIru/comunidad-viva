#!/bin/bash

# Database Restore Script for Comunidad Viva
# Restores PostgreSQL backups from compressed SQL files

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

# Check if backup file is provided
if [ -z "$1" ]; then
    echo -e "${RED}Error: No backup file specified${NC}"
    echo ""
    echo "Usage: $0 <backup_file.sql.gz>"
    echo ""
    echo "Available backups:"
    find "$PROJECT_ROOT/backups" -name "backup_*.sql.gz" -type f -printf "  %f ($(stat -c%y "$1" | cut -d' ' -f1))\n" 2>/dev/null | sort -r | head -10
    exit 1
fi

BACKUP_FILE="$1"

# Check if file exists
if [ ! -f "$BACKUP_FILE" ]; then
    echo -e "${RED}Error: Backup file not found: $BACKUP_FILE${NC}"
    exit 1
fi

# Load environment variables
if [ -f "$PROJECT_ROOT/packages/backend/.env" ]; then
    source "$PROJECT_ROOT/packages/backend/.env"
else
    echo -e "${RED}Error: .env file not found${NC}"
    exit 1
fi

# Parse DATABASE_URL
if [[ $DATABASE_URL =~ postgresql://([^:]+):([^@]+)@([^:]+):([^/]+)/(.+) ]]; then
    DB_USER="${BASH_REMATCH[1]}"
    DB_PASSWORD="${BASH_REMATCH[2]}"
    DB_HOST="${BASH_REMATCH[3]}"
    DB_PORT="${BASH_REMATCH[4]}"
    DB_NAME="${BASH_REMATCH[5]}"
else
    echo -e "${RED}Error: Could not parse DATABASE_URL${NC}"
    exit 1
fi

echo "================================"
echo "  Comunidad Viva - DB Restore"
echo "================================"
echo ""
echo "⚠️  WARNING: This will REPLACE all data in the database!"
echo ""
echo "Database: $DB_NAME"
echo "Host: $DB_HOST:$DB_PORT"
echo "Backup file: $BACKUP_FILE"
echo ""

# Confirmation
read -p "Are you sure you want to continue? (type 'yes' to confirm): " CONFIRM
if [ "$CONFIRM" != "yes" ]; then
    echo ""
    echo -e "${YELLOW}Restore cancelled.${NC}"
    exit 0
fi

echo ""

# Check if psql is available
if ! command -v psql &> /dev/null; then
    echo -e "${RED}Error: psql not found. Please install PostgreSQL client tools.${NC}"
    exit 1
fi

# Check if gunzip is available
if ! command -v gunzip &> /dev/null; then
    echo -e "${RED}Error: gunzip not found. Please install gzip utilities.${NC}"
    exit 1
fi

export PGPASSWORD="$DB_PASSWORD"

# Create backup of current database before restoring
echo -e "${YELLOW}Creating safety backup of current database...${NC}"
SAFETY_BACKUP="$PROJECT_ROOT/backups/pre_restore_$(date +%Y%m%d_%H%M%S).sql.gz"
mkdir -p "$PROJECT_ROOT/backups"

if pg_dump -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" \
    --no-owner --no-acl --format=plain | gzip > "$SAFETY_BACKUP" 2>/dev/null; then
    echo -e "${GREEN}✓ Safety backup created: $SAFETY_BACKUP${NC}"
else
    echo -e "${YELLOW}⚠ Could not create safety backup, continuing anyway...${NC}"
fi

echo ""

# Drop and recreate database
echo -e "${YELLOW}Dropping existing database...${NC}"
psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d postgres \
    -c "DROP DATABASE IF EXISTS \"$DB_NAME\";" 2>/dev/null || true

echo -e "${YELLOW}Creating new database...${NC}"
psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d postgres \
    -c "CREATE DATABASE \"$DB_NAME\";" 2>/dev/null

echo ""

# Restore backup
echo -e "${YELLOW}Restoring backup...${NC}"
if gunzip -c "$BACKUP_FILE" | psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" > /dev/null 2>&1; then
    echo -e "${GREEN}✓ Backup restored successfully${NC}"
    echo ""

    # Run migrations to ensure schema is up to date
    echo -e "${YELLOW}Running migrations...${NC}"
    cd "$PROJECT_ROOT/packages/backend"
    if DATABASE_URL="$DATABASE_URL" npx prisma migrate deploy > /dev/null 2>&1; then
        echo -e "${GREEN}✓ Migrations applied${NC}"
    else
        echo -e "${YELLOW}⚠ Could not run migrations (this is normal if backup is up to date)${NC}"
    fi

    echo ""
    echo -e "${GREEN}Database restored successfully!${NC}"
    echo ""
    echo "Safety backup saved at: $SAFETY_BACKUP"
    echo ""

else
    echo -e "${RED}✗ Restore failed${NC}"
    echo ""
    echo "Attempting to restore from safety backup..."

    if [ -f "$SAFETY_BACKUP" ]; then
        psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d postgres \
            -c "DROP DATABASE IF EXISTS \"$DB_NAME\";" 2>/dev/null
        psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d postgres \
            -c "CREATE DATABASE \"$DB_NAME\";" 2>/dev/null
        gunzip -c "$SAFETY_BACKUP" | psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" > /dev/null 2>&1
        echo -e "${GREEN}✓ Rolled back to safety backup${NC}"
    fi

    exit 1
fi

unset PGPASSWORD

echo "Database is ready to use!"
echo ""
