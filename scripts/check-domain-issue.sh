#!/bin/bash

echo "=== Checking Domain Access Issue ==="
echo ""

echo "1. Checking Nginx status..."
systemctl status nginx --no-pager | head -10
echo ""

echo "2. Checking if Nginx is listening on port 80..."
ss -tlnp | grep :80
echo ""

echo "3. Checking Nginx config files..."
ls -la /etc/nginx/sites-enabled/
echo ""

echo "4. Testing Nginx config..."
nginx -t
echo ""

echo "5. Checking active Nginx server blocks..."
nginx -T 2>/dev/null | grep -A 5 "server_name"
echo ""

echo "6. Testing DNS resolution from server..."
nslookup www.gaigo1.net
nslookup gaigo1.net
echo ""

echo "7. Testing local connection to frontend..."
curl -I http://localhost:3000 2>&1 | head -5
echo ""

echo "8. Testing local connection to backend..."
curl -I http://localhost:8000/health 2>&1 | head -5
echo ""

echo "9. Checking Nginx access logs (last 10 lines)..."
tail -10 /var/log/nginx/access.log 2>/dev/null || echo "No access log found"
echo ""

echo "10. Checking Nginx error logs (last 10 lines)..."
tail -10 /var/log/nginx/error.log 2>/dev/null || echo "No error log found"
echo ""

echo "11. Testing domain from server..."
curl -I -H "Host: www.gaigo1.net" http://localhost 2>&1 | head -10
echo ""

echo "12. Checking firewall rules..."
if command -v ufw >/dev/null 2>&1; then
    ufw status | head -10
else
    echo "UFW not installed"
fi
echo ""

echo "=== Check Complete ==="

