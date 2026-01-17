#!/bin/bash

# ===========================================
# Let's Encrypt SSL Certificate Initialization
# ===========================================
# Run this script once on the VPS to obtain initial SSL certificates
# Usage: ./init-letsencrypt.sh

set -e

# Load environment variables
if [ -f .env ]; then
    export $(cat .env | grep -v '#' | xargs)
fi

# Configuration
domains=(${DOMAIN:-onehealth.cm} www.${DOMAIN:-onehealth.cm} admin.${DOMAIN:-onehealth.cm})
rsa_key_size=4096
data_path="./docker/certbot"
email="${LETSENCRYPT_EMAIL:-admin@onehealth.cm}"
staging=0 # Set to 1 for testing to avoid rate limits

echo "### One Health CMS - SSL Certificate Setup ###"
echo ""

# Check if certificates already exist
if [ -d "$data_path/conf/live/${domains[0]}" ]; then
    read -p "Existing certificates found. Continue and replace? (y/N) " decision
    if [ "$decision" != "Y" ] && [ "$decision" != "y" ]; then
        exit 0
    fi
fi

# Create required directories
echo "### Creating directories..."
mkdir -p "$data_path/conf"
mkdir -p "$data_path/www"

# Download recommended TLS parameters
if [ ! -e "$data_path/conf/options-ssl-nginx.conf" ] || [ ! -e "$data_path/conf/ssl-dhparams.pem" ]; then
    echo "### Downloading recommended TLS parameters..."
    curl -s https://raw.githubusercontent.com/certbot/certbot/master/certbot-nginx/certbot_nginx/_internal/tls_configs/options-ssl-nginx.conf > "$data_path/conf/options-ssl-nginx.conf"
    curl -s https://raw.githubusercontent.com/certbot/certbot/master/certbot/certbot/ssl-dhparams.pem > "$data_path/conf/ssl-dhparams.pem"
fi

# Create dummy certificates for nginx to start
echo "### Creating dummy certificates for ${domains[0]}..."
path="/etc/letsencrypt/live/${domains[0]}"
mkdir -p "$data_path/conf/live/${domains[0]}"

docker compose -f docker-compose.prod.yml run --rm --entrypoint "\
    openssl req -x509 -nodes -newkey rsa:$rsa_key_size -days 1\
    -keyout '$path/privkey.pem' \
    -out '$path/fullchain.pem' \
    -subj '/CN=localhost'" certbot

echo "### Starting nginx..."
docker compose -f docker-compose.prod.yml up --force-recreate -d nginx

echo "### Deleting dummy certificates..."
docker compose -f docker-compose.prod.yml run --rm --entrypoint "\
    rm -Rf /etc/letsencrypt/live/${domains[0]} && \
    rm -Rf /etc/letsencrypt/archive/${domains[0]} && \
    rm -Rf /etc/letsencrypt/renewal/${domains[0]}.conf" certbot

echo "### Requesting Let's Encrypt certificates..."

# Build domain arguments
domain_args=""
for domain in "${domains[@]}"; do
    domain_args="$domain_args -d $domain"
done

# Select staging or production server
if [ $staging != "0" ]; then
    staging_arg="--staging"
else
    staging_arg=""
fi

# Request certificates
docker compose -f docker-compose.prod.yml run --rm --entrypoint "\
    certbot certonly --webroot -w /var/www/certbot \
    $staging_arg \
    --email $email \
    --rsa-key-size $rsa_key_size \
    --agree-tos \
    --no-eff-email \
    --force-renewal \
    $domain_args" certbot

echo "### Reloading nginx..."
docker compose -f docker-compose.prod.yml exec nginx nginx -s reload

echo ""
echo "### SSL Setup Complete! ###"
echo ""
echo "Your certificates have been obtained and nginx has been reloaded."
echo "Certificates will auto-renew via the certbot container."
echo ""
echo "You can now access your site at:"
echo "  - https://${domains[0]}"
echo "  - https://admin.${domains[0]}"
