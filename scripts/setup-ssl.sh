#!/bin/bash

set -e

DOMAIN="gaigo1.net"
EMAIL="Quangcao160901@gmail.com"  # Thay đổi email của bạn nếu cần

echo "=== Setting up SSL for $DOMAIN ==="
echo ""

# 1. Install certbot
echo "1. Installing certbot..."
if ! command -v certbot >/dev/null 2>&1; then
  apt-get update -y
  apt-get install -y certbot python3-certbot-nginx
  echo "✓ Certbot installed"
else
  echo "✓ Certbot already installed"
fi
echo ""

# 2. Obtain SSL certificate using Nginx plugin (easier method)
echo "2. Obtaining SSL certificate for $DOMAIN and www.$DOMAIN..."
certbot --nginx \
  --non-interactive \
  --agree-tos \
  --email "$EMAIL" \
  -d "$DOMAIN" \
  -d "www.$DOMAIN" \
  --redirect
echo ""

# 3. Test auto-renewal
echo "3. Testing certificate renewal..."
certbot renew --dry-run
echo ""

# 4. Verify Nginx config
echo "4. Verifying Nginx configuration..."
nginx -t
systemctl reload nginx
echo ""

echo "=== SSL Setup Complete ==="
echo ""
echo "Your website is now available at:"
echo "  - https://$DOMAIN"
echo "  - https://www.$DOMAIN"
echo ""
echo "HTTP requests will automatically redirect to HTTPS."
echo ""
echo "Certificate will auto-renew via certbot timer."
