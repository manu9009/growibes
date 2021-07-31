#
# Drupal 8 with composer and drush
#
FROM php:7-apache

# Drupal php setup from https://hub.docker.com/_/drupal/
# install the PHP extensions we need
RUN set -ex; \
	\
	if command -v a2enmod; then \
		a2enmod rewrite; \
	fi; \
	\
	savedAptMark="$(apt-mark showmanual)"; \
	\
	apt-get update; \
	apt-get install -y --no-install-recommends \
		libjpeg-dev \
		libpng-dev \
		libpq-dev \
		libfreetype6-dev \
		libjpeg62-turbo-dev \
		libzip-dev \
	; \
	\
	docker-php-ext-configure gd --with-freetype --with-jpeg; \
	docker-php-ext-install -j "$(nproc)" \
		gd \
		opcache \
		pdo_mysql \
		pdo_pgsql \
		zip \
	; \
	\
# reset apt-mark's "manual" list so that "purge --auto-remove" will remove all build dependencies
	apt-mark auto '.*' > /dev/null; \
	apt-mark manual $savedAptMark; \
	ldd "$(php -r 'echo ini_get("extension_dir");')"/*.so \
		| awk '/=>/ { print $3 }' \
		| sort -u \
		| xargs -r dpkg-query -S \
		| cut -d: -f1 \
		| sort -u \
		| xargs -rt apt-mark manual; \
	\
	apt-get purge -y --auto-remove -o APT::AutoRemove::RecommendsImportant=false; \
	rm -rf /var/lib/apt/lists/*


RUN pecl install xdebug && docker-php-ext-enable xdebug
RUN docker-php-ext-install mysqli && docker-php-ext-enable mysqli

RUN apt-get update && apt-get install python-pip -y
RUN pip install awscli


# set recommended PHP.ini settings
# see https://secure.php.net/manual/en/opcache.installation.php
RUN { \
		echo 'opcache.memory_consumption=128'; \
		echo 'opcache.interned_strings_buffer=8'; \
		echo 'opcache.max_accelerated_files=4000'; \
		echo 'opcache.revalidate_freq=60'; \
		echo 'opcache.fast_shutdown=1'; \
		echo 'opcache.enable_cli=1'; \
	} > /usr/local/etc/php/conf.d/opcache-recommended.ini

# increase php memory and caching
RUN { \
    echo 'memory_limit = 768M'; \
		echo 'realpath_cache_size = 4M'; \
		echo 'realpath_cache_ttl = 480'; \
		echo 'sendmail_path = /usr/sbin/ssmtp -t'; \
	} > /usr/local/etc/php/conf.d/d8-settings.ini

# install composer
ENV COMPOSER_ALLOW_SUPERUSER 1

RUN curl -sS https://getcomposer.org/installer | php -- --install-dir=/usr/local/bin --filename=composer


# install unzip and git
RUN apt-get update && apt-get install -y git zip unzip

RUN apt install -y libmagickwand-dev --no-install-recommends 

RUN pecl install imagick && docker-php-ext-enable imagick

ARG AWS_ACCESS_KEY_ID=local
ARG AWS_SECRET_ACCESS_KEY=local

ENV AWS_ACCESS_KEY_ID $AWS_ACCESS_KEY_ID
ENV AWS_SECRET_ACCESS_KEY $AWS_SECRET_ACCESS_KEY

COPY . /var/www/html

WORKDIR /var/www/html



RUN aws s3 cp s3://atrc-php-env-tii.ae/qa/.env /var/www/html

RUN chown www-data:www-data /var/www/html


RUN composer --verbose validate
RUN composer --verbose install
RUN composer --verbose update


#Commands need to be run in code-pipline to make application up and running

RUN vendor/bin/drush updb -y
RUN vendor/bin/drush cr
RUN vendor/bin/drush cim -y
RUN vendor/bin/drush cr

RUN mkdir -p web/sites/default/files

RUN chmod -Rf a+w web/sites/default/files


# override default-site
RUN { \
		echo '<VirtualHost *:80>'; \
		echo '        ServerAdmin webmaster@localhost'; \
		echo '        DocumentRoot /var/www/html/web'; \
		echo '        ErrorLog ${APACHE_LOG_DIR}/error.log'; \
		echo '        CustomLog ${APACHE_LOG_DIR}/access.log combined'; \
		echo '</VirtualHost>'; \
	} > /etc/apache2/sites-available/000-default.conf

# now expose files

EXPOSE 80 443

# By default start up apache in the foreground, override with /bin/bash for interative.
CMD /usr/sbin/apache2ctl -D FOREGROUND


