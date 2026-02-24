# Stage 1: Build application assets
FROM serversideup/php:8.4-fpm-nginx-alpine AS builder
WORKDIR /app

# serversideup images run as non-root by default; switch to root for setup
# trunk-ignore(hadolint/DL3002)
USER root

# Install build dependencies
# hadolint ignore=DL3018
RUN apk add --no-cache git unzip curl nodejs npm \
    && npm install -g pnpm@latest

# serversideup already includes: pcntl, pdo_pgsql, pdo_mysql, redis, zip, opcache
# official php image already includes: curl, mbstring, openssl, xml, etc.
# We only need to add what's missing:
RUN install-php-extensions \
    bcmath \
    gd \
    intl \
    pgsql \
    pdo_sqlite \
    sqlite3 \
    && rm -rf /usr/src/php*

# Install Composer
COPY --from=composer/composer:2-bin /composer /usr/bin/composer

# Cache Composer dependencies
COPY composer.json composer.lock ./
RUN composer install --no-dev --optimize-autoloader --prefer-dist --no-scripts

# Cache pnpm/npm dependencies
COPY package.json pnpm-lock.yaml* ./
RUN if [ -f pnpm-lock.yaml ]; then pnpm install --frozen-lockfile; \
    else npm ci; \
    fi

# Copy the rest of the application
COPY . .

# Optimize autoloader and prune vendor fluff
RUN composer dump-autoload --optimize --classmap-authoritative --no-dev \
    && find vendor -type f \( -name "*.md" -o -name "*.rst" -o -name "CHANGELOG*" -o -name "LICENSE*" -o -name "*.txt" \) -delete \
    && find vendor -type d \( -name "tests" -o -name "Tests" -o -name "docs" \) -exec rm -rf {} + 2>/dev/null || true

# Generate key and discover packages
RUN cp .env.example .env \
    && php artisan key:generate \
    && php artisan package:discover

# Build frontend assets
RUN if [ -f pnpm-lock.yaml ]; then pnpm run build; \
    else npm run build; \
    fi

# Remove build-only artifacts
RUN rm -rf node_modules .git .github tests \
    storage/framework/views/*.php \
    bootstrap/cache/*.php \
    storage/logs/*.log \
    .env


# Stage 2: Final Production Image
FROM serversideup/php:8.4-fpm-nginx-alpine AS final

WORKDIR /app

ENV OPCACHE_VALIDATE_TIMESTAMPS=0
ENV APP_ENV=production
ENV APP_DEBUG=false
ENV PHP_OPCACHE_ENABLE=1
# Tell serversideup where Laravel's public dir is
ENV WEBROOT=/app/public

# serversideup images run as non-root by default; switch to root for setup
USER root

# Enable PHP production settings (may not exist in this image, hence || true)
RUN mv "$PHP_INI_DIR/php.ini-production" "$PHP_INI_DIR/php.ini" 2>/dev/null || true

# hadolint ignore=DL3018
RUN apk add --no-cache ghostscript \
    && rm -rf /var/cache/apk/* /tmp/*

# Same extensions as builder — only what serversideup doesn't already ship.
# pdo_sqlite and sqlite3 are already bundled, so they're excluded here.
# /usr/src/php* cleanup is intentionally done after, as install-php-extensions needs it.
RUN install-php-extensions \
    bcmath \
    gd \
    intl \
    pgsql \
    && rm -rf /usr/src/php*

# Copy only necessary application files
COPY --from=builder /app/app /app/app
COPY --from=builder /app/bootstrap /app/bootstrap
COPY --from=builder /app/config /app/config
COPY --from=builder /app/database /app/database
COPY --from=builder /app/public /app/public
COPY --from=builder /app/resources/views /app/resources/views
COPY --from=builder /app/routes /app/routes
COPY --from=builder /app/storage /app/storage
COPY --from=builder /app/vendor /app/vendor
COPY --from=builder /app/artisan /app/artisan
COPY --from=builder /app/composer.json /app/composer.json
COPY --from=builder /app/composer.lock /app/composer.lock

# Correct permissions
RUN chown -R www-data:www-data /app/storage /app/bootstrap/cache

# Bundle custom nginx config
COPY nginx-headers.conf /etc/nginx/conf.d/nginx-headers.conf

# Drop init logic into serversideup's hook directory.
# Scripts here run before nginx/fpm start, in filename order.
COPY entrypoint.sh /etc/entrypoint.d/00-laravel-init.sh
RUN chmod +x /etc/entrypoint.d/00-laravel-init.sh

# No ENTRYPOINT or CMD needed — the base image's S6 supervisor handles it.

# Switch back to non-root user for security
USER www-data

# Healthcheck to verify nginx is responding
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD curl -f http://localhost/ || exit 1