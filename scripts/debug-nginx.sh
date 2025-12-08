#!/bin/bash

echo "=== KIỂM TRA CẤU HÌNH NGINX VÀ ỨNG DỤNG ==="
echo ""

echo "1. Kiểm tra Nginx đang chạy:"
systemctl status nginx --no-pager | head -5
echo ""

echo "2. Kiểm tra file cấu hình Nginx có tồn tại:"
if [ -f "/etc/nginx/sites-available/gaigo1.net" ]; then
    echo "✓ File cấu hình tồn tại: /etc/nginx/sites-available/gaigo1.net"
else
    echo "✗ File cấu hình KHÔNG tồn tại!"
fi

if [ -L "/etc/nginx/sites-enabled/gaigo1.net" ]; then
    echo "✓ Symlink đã được tạo: /etc/nginx/sites-enabled/gaigo1.net"
else
    echo "✗ Symlink CHƯA được tạo!"
fi
echo ""

echo "3. Kiểm tra ứng dụng có đang chạy trên port 3000:"
if command -v pm2 >/dev/null 2>&1; then
    echo "PM2 processes:"
    pm2 list
    echo ""
    echo "Kiểm tra port 3000:"
    netstat -tlnp | grep :3000 || ss -tlnp | grep :3000 || echo "Không có process nào listen trên port 3000!"
else
    echo "PM2 chưa được cài đặt"
fi
echo ""

echo "4. Kiểm tra Nginx có thể kết nối đến localhost:3000:"
curl -I http://localhost:3000 2>&1 | head -5 || echo "Không thể kết nối đến localhost:3000"
echo ""

echo "5. Kiểm tra cấu hình Nginx có lỗi không:"
nginx -t
echo ""

echo "6. Kiểm tra Nginx đang listen trên port nào:"
netstat -tlnp | grep nginx || ss -tlnp | grep nginx
echo ""

echo "7. Kiểm tra firewall:"
if command -v ufw >/dev/null 2>&1; then
    ufw status | grep -E "(80|443)" || echo "Port 80/443 chưa được mở trong firewall"
else
    echo "UFW chưa được cài đặt"
fi
echo ""

echo "8. Kiểm tra logs Nginx gần đây (lỗi):"
tail -20 /var/log/nginx/error.log 2>/dev/null || echo "Không tìm thấy error log"
echo ""

echo "9. Kiểm tra access log:"
tail -10 /var/log/nginx/access.log 2>/dev/null || echo "Không tìm thấy access log"
echo ""

echo "=== KẾT THÚC KIỂM TRA ==="

