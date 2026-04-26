# ========================
# 1. Vendor (Composer)
# ========================
FROM php:8.3-cli AS vendor

WORKDIR /app

# Install system deps + PHP extensions
RUN apt-get update && apt-get install -y \
    git unzip \
    libpng-dev libjpeg-dev libfreetype6-dev \
    libzip-dev \
    libonig-dev \
    autoconf \
    g++ \
    make \
    pkg-config \
    && docker-php-ext-configure gd --with-freetype --with-jpeg \
    && docker-php-ext-install gd zip mbstring

# Install Composer
COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

# Copy dependency files
COPY composer.json composer.lock ./

RUN composer install \
    --no-dev \
    --no-interaction \
    --optimize-autoloader \
    --no-scripts

# Copy full source
COPY . .

RUN composer dump-autoload --optimize --no-dev  --no-scripts

# ========================
# 2. Frontend Build (Node 24)
# ========================
FROM node:24 AS frontend

WORKDIR /app

# Pastikan npm v11 (default biasanya sudah v11 di Node 24, tapi kita paksa biar konsisten)
RUN npm install -g npm@11

COPY package.json package-lock.json ./

RUN npm ci

COPY . .

RUN npm run build

# ========================
# 3. Final (PHP-FPM)
# ========================
FROM php:8.3-fpm

WORKDIR /var/www/html

# Install system deps + PHP extensions
RUN apt-get update && apt-get install -y \
    nginx \
    supervisor \
    libpng-dev libjpeg-dev libfreetype6-dev \
    libzip-dev \
    libonig-dev \
    curl \
    && docker-php-ext-configure gd --with-freetype --with-jpeg \
    && docker-php-ext-install \
    pdo \
    pdo_mysql \
    mbstring \
    zip \
    exif \
    pcntl \
    bcmath \
    gd

# Copy app
COPY --from=vendor --chown=www-data:www-data /app /var/www/html
COPY --from=frontend --chown=www-data:www-data /app/public/build /var/www/html/public/build

# Permissions
#RUN chown -R www-data:www-data /var/www/html \
# && chmod -R 775 storage bootstrap/cache
RUN mkdir -p storage bootstrap/cache \
    && chown -R www-data:www-data storage bootstrap/cache \
    && chmod -R 775 storage bootstrap/cache

EXPOSE 9000

CMD ["php-fpm"]

