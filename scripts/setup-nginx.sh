#!/bin/bash

set -e

APP_DIR=/var/www/girl-pick
NGINX_CONFIG_SOURCE="$APP_DIR/nginx/gaigo1.net.conf"
NGINX_CONFIG_DEST="/etc/nginx/sites-available/gaigo1.net"
NGINX_ENABLED="/etc/nginx/sites-enabled/gaigo1.net"

echo "=== CÀI ĐẶT VÀ CẤU HÌNH NGINX ==="

# Kiểm tra file cấu hình nguồn
if [ ! -f "$NGINX_CONFIG_SOURCE" ]; then
    echo "✗ Không tìm thấy file cấu hình tại: $NGINX_CONFIG_SOURCE"
    echo "Vui lòng đảm bảo đã clone repository và file tồn tại."
    exit 1
fi

# Copy cấu hình
echo "1. Copy cấu hình Nginx..."
cp "$NGINX_CONFIG_SOURCE" "$NGINX_CONFIG_DEST"
echo "✓ Đã copy cấu hình"

# Tạo symlink
echo "2. Tạo symlink để enable site..."
ln -sf "$NGINX_CONFIG_DEST" "$NGINX_ENABLED"
echo "✓ Đã tạo symlink"

# Xóa default site nếu có
if [ -L "/etc/nginx/sites-enabled/default" ]; then
    echo "3. Xóa default site..."
    rm -f /etc/nginx/sites-enabled/default
    echo "✓ Đã xóa default site"
fi

# Test cấu hình
echo "4. Kiểm tra cấu hình Nginx..."
if nginx -t; then
    echo "✓ Cấu hình hợp lệ"
else
    echo "✗ Cấu hình có lỗi!"
    exit 1
fi

# Reload Nginx
echo "5. Reload Nginx..."
systemctl reload nginx || systemctl restart nginx
echo "✓ Đã reload Nginx"

# Mở firewall
echo "6. Mở firewall cho port 80 và 443..."
if command -v ufw >/dev/null 2>&1; then
    ufw allow 80/tcp || true
    ufw allow 443/tcp || true
    echo "✓ Đã mở firewall"
else
    echo "UFW chưa được cài đặt, bỏ qua firewall"
fi

echo ""
echo "=== HOÀN TẤT ==="
echo "Kiểm tra ứng dụng có đang chạy trên port 3000:"
pm2 list || echo "PM2 chưa được cài đặt hoặc không có process nào"

