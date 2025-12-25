#!/bin/bash

# Script to check why external access is blocked

echo "=== KIỂM TRA TẠI SAO KHÔNG TRUY CẬP ĐƯỢC TỪ BÊN NGOÀI ==="
echo ""

echo "1. Lấy IP server..."
SERVER_IP=$(curl -s ifconfig.me || curl -s ipinfo.io/ip || hostname -I | awk '{print $1}')
echo "Server IP: $SERVER_IP"
echo ""

echo "2. Kiểm tra DNS cho gaigo1.net..."
if command -v dig &> /dev/null; then
    DNS_IP=$(dig +short gaigo1.net | head -1)
    echo "DNS trỏ về: $DNS_IP"
    if [ "$DNS_IP" = "$SERVER_IP" ]; then
        echo "✓ DNS trỏ đúng IP server"
    else
        echo "✗ DNS KHÔNG trỏ đúng!"
        echo "  DNS: $DNS_IP"
        echo "  Server: $SERVER_IP"
        echo "  Cần cập nhật DNS record"
    fi
elif command -v nslookup &> /dev/null; then
    DNS_IP=$(nslookup gaigo1.net | grep -A 1 "Name:" | tail -1 | awk '{print $2}')
    echo "DNS trỏ về: $DNS_IP"
    if [ "$DNS_IP" = "$SERVER_IP" ]; then
        echo "✓ DNS trỏ đúng IP server"
    else
        echo "✗ DNS KHÔNG trỏ đúng!"
    fi
else
    echo "⚠ Không có dig/nslookup để kiểm tra DNS"
    echo "  Kiểm tra thủ công: https://dnschecker.org/#A/gaigo1.net"
fi

echo ""
echo "3. Kiểm tra UFW firewall..."
if command -v ufw &> /dev/null; then
    UFW_STATUS=$(ufw status | head -1)
    echo "UFW: $UFW_STATUS"
    if echo "$UFW_STATUS" | grep -q "Status: active"; then
        echo "UFW rules cho port 80:"
        ufw status | grep -E "80|443" || echo "  Không thấy rules"
    fi
else
    echo "⚠ UFW không được cài đặt"
fi

echo ""
echo "4. Kiểm tra iptables..."
if iptables -L -n 2>/dev/null | grep -q "ACCEPT.*80"; then
    echo "✓ iptables có rule cho port 80"
    iptables -L -n | grep -E "80|ACCEPT" | head -5
else
    echo "⚠ Không thấy iptables rules cho port 80"
fi

echo ""
echo "5. Test từ server với IP thực..."
echo "Test: curl -I http://$SERVER_IP"
if curl -s -o /dev/null -w "%{http_code}" --max-time 5 http://$SERVER_IP 2>/dev/null | grep -q "200\|301\|302"; then
    echo "✓ Server phản hồi từ IP thực"
    curl -I http://$SERVER_IP 2>/dev/null | head -3
else
    echo "✗ Server KHÔNG phản hồi từ IP thực"
    echo "  Có thể bị firewall của VPS provider chặn"
fi

echo ""
echo "=== TÓM TẮT ==="
echo ""
echo "Nếu vẫn không truy cập được từ bên ngoài:"
echo ""
echo "1. KIỂM TRA FIREWALL CỦA VULTR:"
echo "   - Đăng nhập Vultr dashboard"
echo "   - Vào Settings > Firewall"
echo "   - Đảm bảo có rule cho port 80 (HTTP) và 443 (HTTPS)"
echo "   - Hoặc tắt firewall tạm thời để test"
echo ""
echo "2. KIỂM TRA DNS:"
echo "   - Vào https://dnschecker.org/#A/gaigo1.net"
echo "   - Đảm bảo DNS trỏ về IP: $SERVER_IP"
echo "   - Nếu chưa đúng, cập nhật DNS record"
echo ""
echo "3. TEST TỪ MÁY LOCAL:"
echo "   curl -I http://gaigo1.net"
echo "   hoặc mở browser: http://gaigo1.net"
echo ""
echo "4. NẾU VẪN LỖI, KIỂM TRA LOGS:"
echo "   sudo tail -f /var/log/nginx/access.log"
echo "   sudo tail -f /var/log/nginx/error.log"

