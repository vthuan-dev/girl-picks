#!/bin/bash

# Script to diagnose API 404 errors

echo "=== KIỂM TRA TẠI SAO API BỊ 404 ==="
echo ""

echo "1. Kiểm tra Backend có chạy không..."
if curl -s http://127.0.0.1:8000/health > /dev/null 2>&1; then
    echo "✓ Backend đang chạy trên port 8000"
    curl -I http://127.0.0.1:8000/health 2>/dev/null | head -3
else
    echo "✗ Backend KHÔNG chạy trên port 8000!"
    echo "  Kiểm tra process:"
    ps aux | grep -E "node.*dist/main|nest|8000" | grep -v grep || echo "  Không tìm thấy process"
    echo ""
    echo "  Cần khởi động backend:"
    echo "  cd ~/girl-pick/backend && npm run start:prod"
fi

echo ""
echo "2. Test Backend API trực tiếp..."
echo "Test: curl http://127.0.0.1:8000/api/health"
if curl -s http://127.0.0.1:8000/api/health > /dev/null 2>&1; then
    echo "✓ Backend API phản hồi"
    curl -I http://127.0.0.1:8000/api/health 2>/dev/null | head -3
else
    echo "✗ Backend API không phản hồi"
    echo "  Response:"
    curl -v http://127.0.0.1:8000/api/health 2>&1 | head -10
fi

echo ""
echo "3. Test qua Nginx..."
echo "Test: curl https://gaigo1.net/api/health"
if curl -s -k https://gaigo1.net/api/health > /dev/null 2>&1; then
    echo "✓ Nginx proxy đúng"
    curl -I -k https://gaigo1.net/api/health 2>&1 | head -3
else
    echo "✗ Nginx proxy lỗi"
    echo "  Response:"
    curl -I -k https://gaigo1.net/api/health 2>&1 | head -5
fi

echo ""
echo "4. Kiểm tra Nginx config cho /api/..."
if grep -A 5 "location /api/" /etc/nginx/sites-available/gaigo1.net | grep -q "proxy_pass.*8000"; then
    echo "✓ Nginx config có proxy_pass đến 8000"
    echo "  Config:"
    grep -A 3 "location /api/" /etc/nginx/sites-available/gaigo1.net | head -5
else
    echo "✗ Nginx config KHÔNG có proxy_pass đến 8000!"
fi

echo ""
echo "5. Kiểm tra port 8000 có listen không..."
if ss -tlnp 2>/dev/null | grep -q ":8000"; then
    echo "✓ Port 8000 đang listen"
    ss -tlnp | grep :8000
else
    echo "✗ Port 8000 KHÔNG listen!"
fi

echo ""
echo "=== TÓM TẮT ==="
echo ""
echo "Nếu backend không chạy:"
echo "  cd ~/girl-pick/backend"
echo "  npm run start:prod"
echo "  hoặc nếu dùng PM2:"
echo "  pm2 restart backend"
echo ""
echo "Nếu backend chạy nhưng API vẫn 404:"
echo "  - Kiểm tra backend routes có đúng không"
echo "  - Kiểm tra nginx config"
echo "  - Xem logs: sudo tail -f /var/log/nginx/error.log"

