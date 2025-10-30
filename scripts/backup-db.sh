#!/bin/bash

# Database Backup Script for Comunidad Viva
# Creates timestamped PostgreSQL backups

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
BACKUP_DIR="$PROJECT_ROOT/backups"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_FILE="$BACKUP_DIR/backup_$TIMESTAMP.sql"
BACKUP_COMPRESSED="$BACKUP_FILE.gz"

# Load environment variables
if [ -f "$PROJECT_ROOT/packages/backend/.env" ]; then
    source "$PROJECT_ROOT/packages/backend/.env"
else
    echo -e "${RED}Error: .env file not found${NC}"
    exit 1
fi

# Parse DATABASE_URL
# Format: postgresql://user:password@host:port/database
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
echo "  Comunidad Viva - DB Backup"
echo "================================"
echo ""
echo "Database: $DB_NAME"
echo "Host: $DB_HOST:$DB_PORT"
echo "Backup directory: $BACKUP_DIR"
echo ""

# Create backup directory if it doesn't exist
mkdir -p "$BACKUP_DIR"

# Check if pg_dump is available
if ! command -v pg_dump &> /dev/null; then
    echo -e "${RED}Error: pg_dump not found. Please install PostgreSQL client tools.${NC}"
    exit 1
fi

# Perform backup
echo -e "${YELLOW}Creating backup...${NC}"

export PGPASSWORD="$DB_PASSWORD"

if pg_dump -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" \
    --no-owner --no-acl --format=plain \
    > "$BACKUP_FILE" 2>/dev/null; then

    # Compress backup
    echo -e "${YELLOW}Compressing backup...${NC}"
    gzip "$BACKUP_FILE"

    # Get file size
    FILE_SIZE=$(du -h "$BACKUP_COMPRESSED" | cut -f1)

    echo -e "${GREEN}✓ Backup created successfully${NC}"
    echo ""
    echo "File: $BACKUP_COMPRESSED"
    echo "Size: $FILE_SIZE"
    echo ""

    # Clean up old backups (keep last 30 days)
    echo -e "${YELLOW}Cleaning up old backups (keeping last 30 days)...${NC}"
    find "$BACKUP_DIR" -name "backup_*.sql.gz" -type f -mtime +30 -delete

    # Count remaining backups
    BACKUP_COUNT=$(find "$BACKUP_DIR" -name "backup_*.sql.gz" -type f | wc -l)
    echo -e "${GREEN}✓ Cleanup complete. $BACKUP_COUNT backups retained.${NC}"
    echo ""

else
    echo -e "${RED}✗ Backup failed${NC}"
    exit 1
fi

unset PGPASSWORD

echo -e "${GREEN}Backup completed successfully!${NC}"
echo ""
echo "To restore this backup, run:"
echo "  ./scripts/restore-db.sh $BACKUP_COMPRESSED"
echo ""
