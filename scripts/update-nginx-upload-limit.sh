#!/bin/bash

# Script to update nginx config for large file uploads
# This fixes the 413 Request Entity Too Large error

set -e

echo "=== CẬP NHẬT NGINX CONFIG CHO UPLOAD FILE LỚN ==="
echo ""

# Check if running as root
if [ "$EUID" -ne 0 ]; then 
    echo "✗ Vui lòng chạy script này với quyền root (sudo)"
    exit 1
fi

NGINX_CONFIG_SOURCE="$HOME/girl-pick/nginx/gaigo1.net.conf"
NGINX_CONFIG_DEST="/etc/nginx/sites-available/gaigo1.net"

# Check if source file exists
if [ ! -f "$NGINX_CONFIG_SOURCE" ]; then
    echo "✗ Không tìm thấy file cấu hình tại: $NGINX_CONFIG_SOURCE"
    echo "  Vui lòng đảm bảo bạn đang ở đúng thư mục project"
    exit 1
fi

echo "1. Copy cấu hình Nginx mới..."
cp "$NGINX_CONFIG_SOURCE" "$NGINX_CONFIG_DEST"
echo "✓ Đã copy cấu hình"

# Test nginx config
echo ""
echo "2. Kiểm tra cấu hình Nginx..."
if nginx -t; then
    echo "✓ Cấu hình hợp lệ"
else
    echo "✗ Cấu hình có lỗi! Vui lòng kiểm tra lại"
    exit 1
fi

# Reload nginx
echo ""
echo "3. Reload Nginx..."
if systemctl reload nginx; then
    echo "✓ Đã reload Nginx thành công"
else
    echo "✗ Lỗi khi reload Nginx. Thử restart..."
    systemctl restart nginx
    echo "✓ Đã restart Nginx"
fi

echo ""
echo "=== HOÀN TẤT ==="
echo "Nginx đã được cấu hình để cho phép upload file lên đến 100MB"
echo "Bạn có thể thử upload video lại bây giờ"

