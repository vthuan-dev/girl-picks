#!/bin/bash

# Script to diagnose and fix ERR_CONNECTION_REFUSED after nginx config update

set -e

echo "=== KIỂM TRA VÀ SỬA LỖI CONNECTION REFUSED ==="
echo ""

# Check if running as root
if [ "$EUID" -ne 0 ]; then 
    echo "✗ Vui lòng chạy script này với quyền root (sudo)"
    exit 1
fi

echo "1. Kiểm tra Nginx status..."
if systemctl is-active --quiet nginx; then
    echo "✓ Nginx đang chạy"
else
    echo "✗ Nginx KHÔNG chạy! Đang khởi động..."
    systemctl start nginx
    sleep 2
    if systemctl is-active --quiet nginx; then
        echo "✓ Đã khởi động Nginx thành công"
    else
        echo "✗ Không thể khởi động Nginx. Kiểm tra logs:"
        journalctl -u nginx -n 20 --no-pager
        exit 1
    fi
fi

echo ""
echo "2. Kiểm tra Nginx config..."
if nginx -t 2>&1; then
    echo "✓ Config hợp lệ"
else
    echo "✗ Config có lỗi! Đang xem chi tiết..."
    nginx -t
    echo ""
    echo "Đang kiểm tra file config..."
    cat /etc/nginx/sites-available/gaigo1.net | tail -20
    exit 1
fi

echo ""
echo "3. Kiểm tra Next.js app (port 3000)..."
if curl -s http://localhost:3000 > /dev/null 2>&1; then
    echo "✓ Next.js app đang chạy trên port 3000"
else
    echo "✗ Next.js app KHÔNG chạy trên port 3000!"
    echo "  Kiểm tra xem process có đang chạy không:"
    ps aux | grep -E "node|next" | grep -v grep || echo "  Không tìm thấy process"
    echo ""
    echo "  Bạn cần khởi động Next.js app:"
    echo "  cd ~/girl-pick/frontend && npm run start"
    echo "  hoặc"
    echo "  cd ~/girl-pick/frontend && pm2 start npm --name 'nextjs' -- start"
fi

echo ""
echo "4. Kiểm tra Backend API (port 8000)..."
if curl -s http://127.0.0.1:8000/health > /dev/null 2>&1; then
    echo "✓ Backend API đang chạy trên port 8000"
else
    echo "⚠ Backend API không phản hồi (có thể bình thường nếu không có /health endpoint)"
    echo "  Kiểm tra xem process có đang chạy không:"
    ps aux | grep -E "node.*dist/main|nest" | grep -v grep || echo "  Không tìm thấy process"
fi

echo ""
echo "5. Kiểm tra ports đang listen..."
echo "Port 80 (HTTP):"
netstat -tlnp 2>/dev/null | grep ":80 " || ss -tlnp 2>/dev/null | grep ":80 " || echo "  Không tìm thấy"
echo "Port 3000 (Next.js):"
netstat -tlnp 2>/dev/null | grep ":3000 " || ss -tlnp 2>/dev/null | grep ":3000 " || echo "  Không tìm thấy"
echo "Port 8000 (Backend):"
netstat -tlnp 2>/dev/null | grep ":8000 " || ss -tlnp 2>/dev/null | grep ":8000 " || echo "  Không tìm thấy"

echo ""
echo "6. Kiểm tra Nginx error logs (10 dòng cuối)..."
tail -10 /var/log/nginx/error.log 2>/dev/null || echo "  Không tìm thấy error log"

echo ""
echo "7. Thử reload Nginx lại..."
if systemctl reload nginx; then
    echo "✓ Đã reload Nginx"
else
    echo "✗ Lỗi khi reload. Thử restart..."
    systemctl restart nginx
    sleep 2
    if systemctl is-active --quiet nginx; then
        echo "✓ Đã restart Nginx thành công"
    else
        echo "✗ Không thể restart Nginx"
        exit 1
    fi
fi

echo ""
echo "=== TÓM TẮT ==="
echo "Nếu vẫn lỗi, thử các bước sau:"
echo ""
echo "1. Khởi động Next.js app:"
echo "   cd ~/girl-pick/frontend"
echo "   npm run start"
echo "   hoặc nếu dùng PM2:"
echo "   pm2 start npm --name 'nextjs' -- start"
echo ""
echo "2. Khởi động Backend (nếu cần):"
echo "   cd ~/girl-pick/backend"
echo "   npm run start:prod"
echo "   hoặc nếu dùng PM2:"
echo "   pm2 start npm --name 'backend' -- run start:prod"
echo ""
echo "3. Kiểm tra firewall:"
echo "   sudo ufw status"
echo "   sudo ufw allow 80/tcp"
echo "   sudo ufw allow 443/tcp"
echo ""
echo "4. Xem logs chi tiết:"
echo "   sudo tail -f /var/log/nginx/error.log"
echo "   sudo journalctl -u nginx -f"

