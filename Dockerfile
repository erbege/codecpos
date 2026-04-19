# syntax=docker/dockerfile:1

############################
# 1) Composer vendor stage
############################
FROM composer:2 AS vendor
WORKDIR /app
COPY composer.json composer.lock ./
RUN composer install --no-dev --prefer-dist --no-interaction --no-scripts --optimize-autoloader --ignore-platform-reqs
COPY . .
RUN composer dump-autoload --optimize --no-dev

############################
# 2) Node assets stage (Vite/Tailwind)
############################
FROM node:20-alpine AS assets
WORKDIR /app
COPY package*.json ./
RUN npm install --legacy-peer-deps
COPY . .
RUN npm run build

############################
# 3) Runtime stage (PHP-FPM + Nginx + Supervisor)
############################
FROM php:8.3-fpm-alpine

RUN apk add --no-cache \
    nginx supervisor bash curl git unzip \
    icu-dev oniguruma-dev libzip-dev tzdata \
    linux-headers $PHPIZE_DEPS \
    && docker-php-ext-install pdo pdo_mysql mbstring intl zip opcache \
    && pecl install redis \
    && docker-php-ext-enable redis \
    && apk del $PHPIZE_DEPS

WORKDIR /var/www/html

COPY . .
COPY --from=vendor /app/vendor ./vendor
COPY --from=assets /app/public/build ./public/build

RUN mkdir -p storage/logs storage/framework/cache storage/framework/sessions storage/framework/views bootstrap/cache \
    && chown -R www-data:www-data /var/www/html \
    && chmod -R 775 storage bootstrap/cache

COPY .docker/nginx.conf /etc/nginx/nginx.conf
COPY .docker/default.conf /etc/nginx/http.d/default.conf
COPY .docker/supervisord.conf /etc/supervisord.conf
COPY .docker/entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

EXPOSE 80
ENTRYPOINT ["/entrypoint.sh"]
