#!/bin/bash

echo "=== TÌM VÀ XỬ LÝ CONFLICT NGINX ==="
echo ""

echo "1. Tìm tất cả file cấu hình có chứa 'gaigo1.net':"
grep -r "gaigo1.net" /etc/nginx/sites-enabled/ /etc/nginx/sites-available/ 2>/dev/null || echo "Không tìm thấy"
echo ""

echo "2. Liệt kê tất cả file trong sites-enabled:"
ls -la /etc/nginx/sites-enabled/
echo ""

echo "3. Liệt kê tất cả file trong sites-available:"
ls -la /etc/nginx/sites-available/
echo ""

echo "4. Xem nội dung file default (nếu có):"
if [ -f "/etc/nginx/sites-enabled/default" ]; then
    echo "File default tồn tại:"
    cat /etc/nginx/sites-enabled/default
elif [ -f "/etc/nginx/sites-available/default" ]; then
    echo "File default trong sites-available:"
    cat /etc/nginx/sites-available/default
fi
echo ""

echo "5. Kiểm tra file cấu hình chính:"
grep -A 5 "server_name" /etc/nginx/nginx.conf | grep -E "(server_name|listen)" || echo "Không có trong nginx.conf"
echo ""

echo "=== KẾT THÚC ==="

