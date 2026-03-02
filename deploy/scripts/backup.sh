#!/bin/sh
set -e

BACKUP_DIR="/backups"
TIMESTAMP=$(date +%Y%m%d-%H%M%S)
BACKUP_FILE="${BACKUP_DIR}/trackrapp-${TIMESTAMP}.sql"
RETENTION_DAYS=7

echo "Starting backup: ${BACKUP_FILE}"

pg_dump "${DATABASE_URL}" > "${BACKUP_FILE}"

echo "Backup complete: ${BACKUP_FILE}"

# Remove backups older than retention period
find "${BACKUP_DIR}" -name "trackrapp-*.sql" -mtime "+${RETENTION_DAYS}" -delete

echo "Cleanup done. Kept last ${RETENTION_DAYS} days of backups."
