#!/bin/sh
set -e

# ---------------------------------------------------------------------------
# Final Permission Fix
# This runs AFTER serversideup's 50-laravel-automations.sh (migrations, etc.)
# ---------------------------------------------------------------------------

echo "Applying final permission fixes..."

# Ensure the database and storage (potentially created by root during migrations or app usage) are owned by www-data
chown -R www-data:www-data /var/www/html/storage /var/www/html/bootstrap/cache /var/www/html/public/storage /var/www/html/database
chmod -R 775 /var/www/html/storage /var/www/html/bootstrap/cache /var/www/html/public/storage /var/www/html/database

# Ensure any existing wal files or shm files for SQLite are also writable
if [ -d "/var/www/html/database" ]; then
    find /var/www/html/database -type f -name "*.sqlite*" -exec chown www-data:www-data {} +
    find /var/www/html/database -type f -name "*.sqlite*" -exec chmod 664 {} +
fi

echo "Laravel permission fix complete (Phase 2). Handing off to S6..."
