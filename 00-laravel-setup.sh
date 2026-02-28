#!/bin/sh
set -e

# ---------------------------------------------------------------------------
# 1. Ensure Laravel's required directory structure exists
# ---------------------------------------------------------------------------
mkdir -p \
    /var/www/html/storage/app/public \
    /var/www/html/storage/framework/cache/data \
    /var/www/html/storage/framework/sessions \
    /var/www/html/storage/framework/views \
    /var/www/html/storage/logs \
    /var/www/html/public/storage \
    /var/www/html/database \
    /var/www/html/storage/app/patterns \
    /var/www/html/storage/app/private \
    /var/www/html/storage/app/public

# Initial permission fix so migrations can run
chown -R www-data:www-data /var/www/html/storage /var/www/html/bootstrap/cache /var/www/html/public/storage /var/www/html/database
chmod -R 775 /var/www/html/storage /var/www/html/bootstrap/cache /var/www/html/public/storage /var/www/html/database

# ---------------------------------------------------------------------------
# 2. Warn loudly if APP_KEY is missing
# ---------------------------------------------------------------------------
if [ -z "${APP_KEY}" ]; then
    echo ""
    echo "❌ ERROR: APP_KEY is not set."
    echo ""
    exit 1
fi

echo "Laravel setup complete (Phase 1)."
