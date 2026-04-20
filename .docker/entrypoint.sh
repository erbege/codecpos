#!/usr/bin/env sh
set -e

cd /var/www/html

if [ ! -f .env ]; then
  echo "ERROR: .env tidak ditemukan"
  exit 1
fi

if ! grep -q "^APP_KEY=base64:" .env; then
  echo "ERROR: APP_KEY belum valid di .env"
  exit 1
fi

php artisan config:clear || true
php artisan cache:clear || true
php artisan config:cache || true
php artisan route:cache || true
php artisan view:cache || true
php artisan migrate --force || true

exec /usr/bin/supervisord -c /etc/supervisord.conf
