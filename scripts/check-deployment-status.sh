#!/bin/bash

echo "=== Checking Deployment Status ==="
echo ""

echo "1. Checking PM2 processes..."
pm2 list
echo ""

echo "2. Checking if frontend is listening on port 3000..."
ss -tlnp | grep 3000 || echo "❌ Port 3000 not listening"
echo ""

echo "3. Checking if backend is listening on port 8000..."
ss -tlnp | grep 8000 || echo "❌ Port 8000 not listening"
echo ""

echo "4. Testing frontend locally..."
curl -I http://localhost:3000 2>&1 | head -5
echo ""

echo "5. Testing backend locally..."
curl -I http://localhost:8000/health 2>&1 | head -5
echo ""

echo "6. Checking Nginx status..."
systemctl status nginx --no-pager | head -10
echo ""

echo "7. Testing Nginx with domain..."
curl -I -H "Host: gaigo1.net" http://localhost 2>&1 | head -5
curl -I -H "Host: www.gaigo1.net" http://localhost 2>&1 | head -5
echo ""

echo "8. Checking Nginx error logs..."
tail -10 /var/log/nginx/error.log 2>/dev/null || echo "No error log"
echo ""

echo "9. Checking frontend logs..."
pm2 logs girl-pick-frontend --lines 5 --nostream 2>&1 | tail -10
echo ""

echo "10. Checking backend logs..."
pm2 logs girl-pick-backend --lines 5 --nostream 2>&1 | tail -10
echo ""

echo "11. Testing from external (if possible)..."
echo "   Try: curl -I http://gaigo1.net"
echo "   Or: curl -I http://$(hostname -I | awk '{print $1}')"
echo ""

echo "12. Checking firewall status..."
if command -v ufw >/dev/null 2>&1; then
  ufw status | head -10
else
  echo "UFW not installed"
fi
echo ""

echo "13. Checking if Nginx is listening on port 80..."
ss -tlnp | grep :80 || echo "❌ Port 80 not listening"
echo ""

echo "=== Check Complete ==="
echo ""
echo "If server-side is OK but domain doesn't work from browser:"
echo "1. Check DNS: nslookup gaigo1.net"
echo "2. Clear browser cache"
echo "3. Try incognito mode"
echo "4. Check if port 80 is open: telnet gaigo1.net 80"

