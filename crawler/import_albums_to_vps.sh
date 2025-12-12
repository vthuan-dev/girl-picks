#!/bin/bash

# Script để import file albums_insert.sql vào MySQL trên VPS Ubuntu
# Usage: ./import_albums_to_vps.sh [database_name] [mysql_user] [mysql_password] [mysql_host]

set -e

# Màu sắc cho output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Thông tin mặc định
SQL_FILE="data/albums_insert.sql"
DB_NAME=${1:-"girlpick"}
DB_USER=${2:-"girlpick"}
DB_PASSWORD=${3:-"girlpick123"}
DB_HOST=${4:-"localhost"}
DB_PORT=${5:-"3306"}

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}  IMPORT ALBUMS SQL TO MYSQL VPS${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""

# Kiểm tra file SQL có tồn tại không
if [ ! -f "$SQL_FILE" ]; then
    echo -e "${RED}✗ File SQL không tồn tại: $SQL_FILE${NC}"
    echo "Vui lòng đảm bảo bạn đang chạy script từ thư mục crawler/"
    exit 1
fi

echo -e "${YELLOW}Thông tin kết nối:${NC}"
echo "  SQL File: $SQL_FILE"
echo "  Database: $DB_NAME"
echo "  Host: $DB_HOST"
echo "  Port: $DB_PORT"
echo "  User: $DB_USER"
echo ""

# Kiểm tra MySQL client có cài đặt chưa
if ! command -v mysql >/dev/null 2>&1; then
    echo -e "${YELLOW}MySQL client chưa được cài đặt. Đang cài đặt...${NC}"
    sudo apt-get update -y
    sudo apt-get install -y mysql-client
fi

# Kiểm tra kết nối MySQL
echo -e "${YELLOW}Đang kiểm tra kết nối MySQL...${NC}"
if mysql -h"$DB_HOST" -P"$DB_PORT" -u"$DB_USER" -p"$DB_PASSWORD" -e "SELECT 1;" 2>/dev/null; then
    echo -e "${GREEN}✓ Kết nối MySQL thành công${NC}"
else
    echo -e "${RED}✗ Không thể kết nối MySQL${NC}"
    echo "Vui lòng kiểm tra:"
    echo "  - MySQL đang chạy"
    echo "  - Thông tin đăng nhập đúng"
    echo "  - Host và port đúng"
    exit 1
fi

# Tạo database nếu chưa có
echo ""
echo -e "${YELLOW}Đang tạo database nếu chưa tồn tại...${NC}"
mysql -h"$DB_HOST" -P"$DB_PORT" -u"$DB_USER" -p"$DB_PASSWORD" -e "CREATE DATABASE IF NOT EXISTS \`$DB_NAME\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;" 2>/dev/null || true
echo -e "${GREEN}✓ Database đã sẵn sàng${NC}"

# Kiểm tra kích thước file
FILE_SIZE=$(du -h "$SQL_FILE" | cut -f1)
echo ""
echo -e "${YELLOW}Kích thước file SQL: $FILE_SIZE${NC}"
echo -e "${YELLOW}Đang import database (có thể mất vài phút)...${NC}"
echo ""

# Import database
START_TIME=$(date +%s)
if mysql -h"$DB_HOST" -P"$DB_PORT" -u"$DB_USER" -p"$DB_PASSWORD" "$DB_NAME" < "$SQL_FILE" 2>&1; then
    END_TIME=$(date +%s)
    DURATION=$((END_TIME - START_TIME))
    
    echo ""
    echo -e "${GREEN}========================================${NC}"
    echo -e "${GREEN}✓ Import database thành công!${NC}"
    echo -e "${GREEN}========================================${NC}"
    echo ""
    echo "Thời gian import: ${DURATION} giây"
    echo ""
    
    # Kiểm tra số bảng và số record
    echo -e "${YELLOW}Đang kiểm tra dữ liệu đã import...${NC}"
    
    # Đếm số albums
    ALBUM_COUNT=$(mysql -h"$DB_HOST" -P"$DB_PORT" -u"$DB_USER" -p"$DB_PASSWORD" "$DB_NAME" -sN -e "SELECT COUNT(*) FROM albums;" 2>/dev/null || echo "0")
    echo "  Số albums: $ALBUM_COUNT"
    
    # Đếm số album_images
    IMAGE_COUNT=$(mysql -h"$DB_HOST" -P"$DB_PORT" -u"$DB_USER" -p"$DB_PASSWORD" "$DB_NAME" -sN -e "SELECT COUNT(*) FROM album_images;" 2>/dev/null || echo "0")
    echo "  Số ảnh: $IMAGE_COUNT"
    
    # Tính trung bình
    if [ "$ALBUM_COUNT" -gt 0 ]; then
        AVG_IMAGES=$(echo "scale=2; $IMAGE_COUNT / $ALBUM_COUNT" | bc)
        echo "  Trung bình ảnh/album: $AVG_IMAGES"
    fi
    
    echo ""
    echo -e "${GREEN}✓ Hoàn tất!${NC}"
else
    echo ""
    echo -e "${RED}✗ Import database thất bại!${NC}"
    echo "Vui lòng kiểm tra:"
    echo "  - File SQL có lỗi không"
    echo "  - Database có đủ quyền không"
    echo "  - Kết nối MySQL ổn định không"
    exit 1
fi

