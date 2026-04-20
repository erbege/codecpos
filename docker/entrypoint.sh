#!/bin/sh
# === docker/entrypoint.sh ===

# Fix Permissions
chown -R www-data:www-data /var/www/storage /var/www/bootstrap/cache

# SINKRONISASI FILE KE VOLUME (PENTING AGAR NGINX BISA BACA)
echo "Syncing files to volumes..."
mkdir -p /var/www/public/build
cp -ra /var/www/public/build_tmp/. /var/www/public/build/
cp -ra /var/www/public_tmp/. /var/www/public/
chown -R www-data:www-data /var/www/public

# Tunggu DB
echo "Waiting for database..."
until nc -z -v -w30 $DB_HOST ${DB_PORT:-3306}; do
  sleep 2
done

# Artisan commands
php artisan package:discover --ansi
php artisan migrate --force
php artisan storage:link --force || true

if [ "$APP_ENV" = "production" ]; then
    php artisan config:cache
    php artisan route:cache
    php artisan view:cache
fi

exec php-fpm

