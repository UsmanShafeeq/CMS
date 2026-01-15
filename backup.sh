#!/bin/bash

# ==========================================
# Backup Script for Database
# ==========================================

BACKUP_DIR="/home/appuser/backups"
DATABASE_NAME="myproject_db"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)

# Create backup directory if not exists
mkdir -p "$BACKUP_DIR"

echo "Starting database backup at $(date)"

# Database backup with compression
sudo -u postgres pg_dump -Fc "$DATABASE_NAME" > "$BACKUP_DIR/db_${TIMESTAMP}.dump"

if [ $? -eq 0 ]; then
    echo "✓ Database backup completed: $BACKUP_DIR/db_${TIMESTAMP}.dump"
    
    # Keep only last 30 days of backups
    find "$BACKUP_DIR" -name "db_*.dump" -mtime +30 -delete
    echo "✓ Old backups cleaned (>30 days)"
    
    # Show backup size
    du -h "$BACKUP_DIR/db_${TIMESTAMP}.dump"
else
    echo "✗ Database backup failed!"
    exit 1
fi

echo "Backup completed at $(date)"
