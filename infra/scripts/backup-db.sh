#!/bin/bash

# Speakoo Database Backup Script
# This script backs up the PostgreSQL database
# Add to crontab: 0 2 * * * /var/www/Speakoo/infra/scripts/backup-db.sh

set -e

# Use home directory for backups (user-writable)
BACKUP_DIR="$HOME/speakoo-backups"
DATE=$(date +%Y%m%d_%H%M%S)
CONTAINER_NAME="speakoo-postgres"
DB_NAME="speakoo_prod"
DB_USER="speakoo"
RETENTION_DAYS=7

# Ensure backup directory exists
mkdir -p "$BACKUP_DIR"

# Create backup
echo "Starting database backup..."
docker exec "$CONTAINER_NAME" pg_dump -U "$DB_USER" "$DB_NAME" > "$BACKUP_DIR/speakoo_$DATE.sql"

# Compress backup
echo "Compressing backup..."
gzip "$BACKUP_DIR/speakoo_$DATE.sql"

# Calculate size
BACKUP_SIZE=$(du -h "$BACKUP_DIR/speakoo_$DATE.sql.gz" | cut -f1)
echo "Backup created: speakoo_$DATE.sql.gz ($BACKUP_SIZE)"

# Remove old backups
echo "Cleaning up old backups (older than $RETENTION_DAYS days)..."
find "$BACKUP_DIR" -name "speakoo_*.sql.gz" -mtime +$RETENTION_DAYS -delete

# List current backups
echo ""
echo "Current backups:"
ls -lh "$BACKUP_DIR" | grep "speakoo_"

echo ""
echo "✓ Backup completed successfully"
