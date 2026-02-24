#!/bin/sh
set -e

# ---------------------------------------------------------------------------
# 1. Ensure Laravel's required storage directory structure exists on first run
# ---------------------------------------------------------------------------
mkdir -p \
    /app/storage/app/public \
    /app/storage/framework/cache/data \
    /app/storage/framework/sessions \
    /app/storage/framework/views \
    /app/storage/logs

chown -R www-data:www-data /app/storage /app/bootstrap/cache
chmod -R 775 /app/storage /app/bootstrap/cache

# ---------------------------------------------------------------------------
# 2. Warn loudly if APP_KEY is missing — serversideup automations won't
#    generate one, and the app will fail to start without it.
# ---------------------------------------------------------------------------
if [ -z "${APP_KEY}" ]; then
    echo ""
    echo "❌ ERROR: APP_KEY is not set."
    echo ""
    echo "   Generate one with:"
    echo "   docker compose exec senn php artisan key:generate --show"
    # trunk-ignore(shellcheck/SC2016)
    echo '   or: echo "base64:$(openssl rand -base64 32)"'
    echo ""
    echo "   Then add it to your .env or compose environment and restart."
    echo ""
    exit 1
fi

echo "Laravel init complete. Handing off to S6..."
