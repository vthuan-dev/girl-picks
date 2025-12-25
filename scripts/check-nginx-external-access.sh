#!/bin/bash

# Script to check why external access is refused while localhost works

set -e

echo "=== KIỂM TRA TẠI SAO KHÔNG TRUY CẬP ĐƯỢC TỪ BÊN NGOÀI ==="
echo ""

# Check if running as root
if [ "$EUID" -ne 0 ]; then 
    echo "✗ Vui lòng chạy script này với quyền root (sudo)"
    exit 1
fi

echo "1. Kiểm tra Nginx có đang chạy không..."
if systemctl is-active --quiet nginx; then
    echo "✓ Nginx đang chạy"
    systemctl status nginx --no-pager | head -5
else
    echo "✗ Nginx KHÔNG chạy!"
    echo "  Đang khởi động..."
    systemctl start nginx
    sleep 2
    if systemctl is-active --quiet nginx; then
        echo "✓ Đã khởi động Nginx"
    else
        echo "✗ Không thể khởi động Nginx"
        exit 1
    fi
fi

echo ""
echo "2. Kiểm tra Nginx có listen trên port 80 không..."
if ss -tlnp 2>/dev/null | grep -E ":80 " | grep nginx; then
    echo "✓ Nginx đang listen trên port 80"
    ss -tlnp 2>/dev/null | grep -E ":80 " | grep nginx
elif netstat -tlnp 2>/dev/null | grep -E ":80 " | grep nginx; then
    echo "✓ Nginx đang listen trên port 80"
    netstat -tlnp 2>/dev/null | grep -E ":80 " | grep nginx
else
    echo "✗ Nginx KHÔNG listen trên port 80!"
    echo "  Kiểm tra config..."
    nginx -T 2>/dev/null | grep -E "listen.*80" | head -5
fi

echo ""
echo "3. Kiểm tra Nginx config cho domain gaigo1.net..."
if grep -q "server_name gaigo1.net" /etc/nginx/sites-available/gaigo1.net; then
    echo "✓ Config có server_name gaigo1.net"
    echo "  Chi tiết server block:"
    grep -A 10 "server_name gaigo1.net" /etc/nginx/sites-available/gaigo1.net | head -15
else
    echo "✗ Không tìm thấy server_name gaigo1.net trong config!"
fi

echo ""
echo "4. Kiểm tra Nginx có enabled site không..."
if [ -L /etc/nginx/sites-enabled/gaigo1.net ]; then
    echo "✓ Site đã được enable"
    ls -la /etc/nginx/sites-enabled/ | grep gaigo1
else
    echo "✗ Site CHƯA được enable!"
    echo "  Đang tạo symlink..."
    ln -sf /etc/nginx/sites-available/gaigo1.net /etc/nginx/sites-enabled/gaigo1.net
    nginx -t && systemctl reload nginx
    echo "✓ Đã enable site"
fi

echo ""
echo "5. Kiểm tra firewall..."
if command -v ufw &> /dev/null; then
    echo "UFW status:"
    ufw status | head -10
    if ufw status | grep -q "Status: active"; then
        if ufw status | grep -q "80/tcp"; then
            echo "✓ Port 80 đã được mở trong UFW"
        else
            echo "✗ Port 80 CHƯA được mở trong UFW!"
            echo "  Chạy: sudo ufw allow 80/tcp"
        fi
    else
        echo "⚠ UFW không active"
    fi
fi

echo ""
echo "6. Kiểm tra iptables..."
if iptables -L -n 2>/dev/null | grep -q "80"; then
    echo "IPTables rules cho port 80:"
    iptables -L -n | grep -E "80|ACCEPT|DROP" | head -5
else
    echo "⚠ Không thấy rules iptables cho port 80"
fi

echo ""
echo "7. Test từ server (localhost) qua nginx..."
if curl -s -o /dev/null -w "%{http_code}" http://localhost 2>/dev/null | grep -q "200\|301\|302"; then
    echo "✓ Nginx phản hồi từ localhost"
    curl -I http://localhost 2>/dev/null | head -3
else
    echo "✗ Nginx KHÔNG phản hồi từ localhost!"
    echo "  Response:"
    curl -I http://localhost 2>/dev/null || echo "  Connection refused"
fi

echo ""
echo "8. Test với domain name từ server..."
if curl -s -o /dev/null -w "%{http_code}" -H "Host: gaigo1.net" http://localhost 2>/dev/null | grep -q "200\|301\|302"; then
    echo "✓ Nginx phản hồi với domain name"
    curl -I -H "Host: gaigo1.net" http://localhost 2>/dev/null | head -3
else
    echo "⚠ Nginx không phản hồi với domain name"
    echo "  Response:"
    curl -I -H "Host: gaigo1.net" http://localhost 2>/dev/null || echo "  Connection refused"
fi

echo ""
echo "9. Kiểm tra IP server..."
SERVER_IP=$(curl -s ifconfig.me || curl -s ipinfo.io/ip || echo "Không lấy được")
echo "Server IP: $SERVER_IP"
echo "Domain gaigo1.net nên trỏ về IP này"

echo ""
echo "10. Kiểm tra DNS..."
if command -v dig &> /dev/null; then
    echo "DNS record cho gaigo1.net:"
    dig +short gaigo1.net || echo "  Không resolve được"
elif command -v nslookup &> /dev/null; then
    echo "DNS record cho gaigo1.net:"
    nslookup gaigo1.net | grep -A 2 "Name:" || echo "  Không resolve được"
else
    echo "⚠ Không có dig hoặc nslookup để kiểm tra DNS"
fi

echo ""
echo "=== TÓM TẮT ==="
echo "Nếu vẫn lỗi, thử các bước sau:"
echo ""
echo "1. Mở port 80 trong firewall:"
echo "   sudo ufw allow 80/tcp"
echo "   sudo ufw allow 443/tcp"
echo ""
echo "2. Đảm bảo nginx listen trên tất cả interfaces:"
echo "   Kiểm tra trong config có 'listen 80;' (không chỉ localhost)"
echo ""
echo "3. Restart nginx:"
echo "   sudo systemctl restart nginx"
echo ""
echo "4. Kiểm tra từ bên ngoài:"
echo "   curl -I http://gaigo1.net"
echo "   hoặc từ browser: http://gaigo1.net"

