#!/bin/bash

echo "=== KIỂM TRA REDIS ==="
echo ""

echo "1. Kiểm tra Redis service có chạy không:"
if systemctl is-active --quiet redis; then
    echo "✓ Redis service đang chạy"
    systemctl status redis --no-pager | head -5
elif systemctl is-active --quiet redis-server; then
    echo "✓ Redis server đang chạy"
    systemctl status redis-server --no-pager | head -5
else
    echo "✗ Redis service không chạy"
fi
echo ""

echo "2. Kiểm tra Redis có listen trên port 6379 không:"
if ss -tlnp | grep :6379 > /dev/null 2>&1; then
    echo "✓ Redis đang listen trên port 6379:"
    ss -tlnp | grep :6379
elif netstat -tlnp 2>/dev/null | grep :6379 > /dev/null 2>&1; then
    echo "✓ Redis đang listen trên port 6379:"
    netstat -tlnp | grep :6379
else
    echo "✗ Redis không listen trên port 6379"
fi
echo ""

echo "3. Kiểm tra Redis trong Docker (nếu có):"
if docker ps | grep redis > /dev/null 2>&1; then
    echo "✓ Redis container đang chạy:"
    docker ps | grep redis
else
    echo "✗ Không có Redis container"
fi
echo ""

echo "4. Test kết nối Redis:"
if command -v redis-cli >/dev/null 2>&1; then
    # Thử kết nối không password
    if redis-cli ping > /dev/null 2>&1; then
        echo "✓ Redis kết nối được (không cần password)"
        redis-cli ping
        redis-cli info server | grep -E "(redis_version|uptime_in_days)" | head -2
    else
        # Thử với password từ env
        if [ -f "/var/www/girl-pick/.env.production" ]; then
            source /var/www/girl-pick/.env.production
            if [ -n "$REDIS_PASSWORD" ]; then
                if redis-cli -a "$REDIS_PASSWORD" ping > /dev/null 2>&1; then
                    echo "✓ Redis kết nối được (với password)"
                    redis-cli -a "$REDIS_PASSWORD" ping
                    redis-cli -a "$REDIS_PASSWORD" info server | grep -E "(redis_version|uptime_in_days)" | head -2
                else
                    echo "✗ Redis không kết nối được (có thể password sai)"
                fi
            else
                echo "✗ Redis có password nhưng không tìm thấy REDIS_PASSWORD trong env"
            fi
        else
            echo "✗ Không tìm thấy .env.production"
        fi
    fi
else
    echo "✗ redis-cli chưa được cài đặt"
    echo "Cài đặt: apt-get install -y redis-tools"
fi
echo ""

echo "5. Kiểm tra backend có kết nối được Redis không:"
if pm2 list | grep girl-pick-backend > /dev/null 2>&1; then
    echo "Backend logs (tìm Redis errors):"
    pm2 logs girl-pick-backend --lines 50 --nostream | grep -i redis | tail -5 || echo "Không thấy Redis errors trong logs"
else
    echo "Backend không chạy"
fi
echo ""

echo "6. Kiểm tra cấu hình Redis trong .env.production:"
if [ -f "/var/www/girl-pick/.env.production" ]; then
    echo "Redis config:"
    grep -E "REDIS" /var/www/girl-pick/.env.production | grep -v "^#" || echo "Không tìm thấy REDIS config"
else
    echo "Không tìm thấy .env.production"
fi
echo ""

echo "=== KẾT THÚC KIỂM TRA ==="

