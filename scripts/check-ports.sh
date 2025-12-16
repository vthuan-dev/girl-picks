#!/bin/bash

echo "=========================================="
echo "Checking Backend and Frontend Ports on VPS"
echo "=========================================="
echo ""

# Check PM2 processes
echo "1. PM2 Processes:"
echo "-------------------"
pm2 list
echo ""

# Check what ports are listening
echo "2. Listening Ports:"
echo "-------------------"
echo "Checking ports 3000, 3001, 8000..."
netstat -tulpn 2>/dev/null | grep -E ':(3000|3001|8000)' || ss -tulpn 2>/dev/null | grep -E ':(3000|3001|8000)'
echo ""

# Check backend process details
echo "3. Backend Process Details:"
echo "-------------------"
if pm2 describe girl-pick-backend > /dev/null 2>&1; then
    echo "Backend PM2 info:"
    pm2 describe girl-pick-backend | grep -E 'script|exec_mode|port|env' || pm2 describe girl-pick-backend
    echo ""
    echo "Backend environment variables:"
    pm2 env girl-pick-backend | grep -E 'PORT|NODE_ENV' || echo "No PORT found in env"
else
    echo "Backend process not found in PM2"
fi
echo ""

# Check frontend process details
echo "4. Frontend Process Details:"
echo "-------------------"
if pm2 describe girl-pick-frontend > /dev/null 2>&1; then
    echo "Frontend PM2 info:"
    pm2 describe girl-pick-frontend | grep -E 'script|exec_mode|port|env' || pm2 describe girl-pick-frontend
    echo ""
    echo "Frontend environment variables:"
    pm2 env girl-pick-frontend | grep -E 'PORT|NODE_ENV' || echo "No PORT found in env"
else
    echo "Frontend process not found in PM2"
fi
echo ""

# Test backend ports
echo "5. Testing Backend Ports:"
echo "-------------------"
for port in 3001 8000; do
    echo -n "Testing port $port: "
    if curl -s -o /dev/null -w "%{http_code}" --max-time 2 http://localhost:$port/health 2>/dev/null | grep -q "200\|404\|401"; then
        echo "✓ Port $port is responding"
        curl -s http://localhost:$port/health | head -c 100
        echo ""
    else
        echo "✗ Port $port is not responding"
    fi
done
echo ""

# Test frontend port
echo "6. Testing Frontend Port:"
echo "-------------------"
echo -n "Testing port 3000: "
if curl -s -o /dev/null -w "%{http_code}" --max-time 2 http://localhost:3000 2>/dev/null | grep -q "200\|404\|301\|302"; then
    echo "✓ Port 3000 is responding"
else
    echo "✗ Port 3000 is not responding"
fi
echo ""

# Check nginx config
echo "7. Nginx Configuration:"
echo "-------------------"
if [ -f /etc/nginx/sites-available/gaigo1.net.conf ]; then
    echo "Backend proxy_pass in nginx config:"
    grep -n "proxy_pass.*127.0.0.1" /etc/nginx/sites-available/gaigo1.net.conf | head -5
    echo ""
    echo "Frontend proxy_pass in nginx config:"
    grep -n "proxy_pass.*localhost:3000" /etc/nginx/sites-available/gaigo1.net.conf | head -3
else
    echo "Nginx config file not found at /etc/nginx/sites-available/gaigo1.net.conf"
fi
echo ""

echo "=========================================="
echo "Check Complete!"
echo "=========================================="


















