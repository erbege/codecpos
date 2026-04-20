# === Dockerfile ===
FROM node:20-alpine as build-stage
WORKDIR /app
COPY package*.json ./
RUN npm install --legacy-peer-deps
COPY . .
RUN npm run build

FROM php:8.3-fpm-alpine
RUN apk add --no-cache \
    libpng-dev libjpeg-turbo-dev freetype-dev libzip-dev \
    zip unzip git curl oniguruma-dev libxml2-dev icu-dev

RUN docker-php-ext-configure gd --with-freetype --with-jpeg \
    && docker-php-ext-install -j$(nproc) \
    pdo_mysql mbstring exif pcntl bcmath gd zip intl opcache dom xml

COPY --from=composer:latest /usr/bin/composer /usr/bin/composer
WORKDIR /var/www
COPY docker/php/php.ini /usr/local/etc/php/conf.d/app-php.ini

# 1. Copy seluruh kode ke dalam image
COPY . .

# 2. Install vendor di dalam image
RUN composer install --no-interaction --no-dev --optimize-autoloader --no-scripts

# 3. Siapkan aset untuk disinkronkan nanti
COPY --from=build-stage /app/public/build /var/www/public/build_tmp
RUN cp -r public /var/www/public_tmp

COPY docker/entrypoint.sh /usr/local/bin/entrypoint.sh
RUN chmod +x /usr/local/bin/entrypoint.sh

ENTRYPOINT ["entrypoint.sh"]
EXPOSE 9000
CMD ["php-fpm"]
