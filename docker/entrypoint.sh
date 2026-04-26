#!/bin/sh
set -e

chown -R www-data:www-data /var/www/storage /var/www/bootstrap/cache || true
chmod -R 775 /var/www/storage /var/www/bootstrap/cache || true

php artisan optimize:clear || true
php artisan migrate --force || true
php artisan config:cache || true
php artisan route:cache || true
php artisan view:cache || true

supervisord -c /etc/supervisord.conf

