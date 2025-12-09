#!/bin/bash

echo "=== Testing Domain Access ==="
echo ""

echo "1. Testing from server with domain..."
curl -I http://gaigo1.net 2>&1 | head -10
echo ""

echo "2. Testing from server with www..."
curl -I http://www.gaigo1.net 2>&1 | head -10
echo ""

echo "3. Testing from server with IP..."
curl -I http://207.148.78.56 2>&1 | head -10
echo ""

echo "4. Checking DNS resolution..."
nslookup gaigo1.net 2>&1 | head -10
echo ""

echo "5. Checking if port 80 is accessible externally..."
echo "   (This will timeout if firewall blocks, that's OK)"
timeout 3 bash -c 'cat < /dev/null > /dev/tcp/207.148.78.56/80' 2>&1 && echo "✓ Port 80 is accessible" || echo "⚠ Port 80 may be blocked or timeout"
echo ""

echo "6. Checking Nginx access logs for recent requests..."
tail -5 /var/log/nginx/access.log 2>/dev/null || echo "No access log"
echo ""

echo "=== Test Complete ==="
echo ""
echo "If server-side tests work but browser doesn't:"
echo "1. Clear browser cache (Ctrl+Shift+Delete)"
echo "2. Try incognito/private mode"
echo "3. Check DNS on your computer: nslookup gaigo1.net"
echo "4. Try different browser"
echo "5. Check if your ISP/router blocks the domain"

