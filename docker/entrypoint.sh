#!/bin/sh

# Set working directory permissions
chown -R www-data:www-data /var/www/storage /var/www/bootstrap/cache

# Wait for DB to be ready (optional but recommended)
echo "Waiting for database..."
# sleep 5

# Run migrations
echo "Running migrations..."
php artisan migrate --force

# Create storage link
echo "Creating storage link..."
php artisan storage:link --force

# Cache configuration and routes
echo "Caching configuration..."
php artisan config:cache
php artisan route:cache
php artisan view:cache

echo "Entrypoint finished, starting PHP-FPM..."
exec php-fpm
