#!/bin/bash

set -e

# Script để import database vào MySQL trên VPS
# Usage: ./scripts/import-database.sh [database_name] [sql_file]

APP_DIR=/var/www/girl-pick
SQL_FILE=${1:-"$APP_DIR/full_backup.sql"}
DB_NAME=${2:-"girl_pick_db"}

# Load environment variables
if [ -f "$APP_DIR/.env.production" ]; then
    set -a
    source "$APP_DIR/.env.production"
    set +a
fi

echo "=== IMPORT DATABASE ==="
echo "SQL File: $SQL_FILE"
echo "Database: $DB_NAME"
echo ""

# Kiểm tra file SQL có tồn tại không
if [ ! -f "$SQL_FILE" ]; then
    echo "✗ File SQL không tồn tại: $SQL_FILE"
    exit 1
fi

# Kiểm tra MySQL có chạy không
if ! command -v mysql >/dev/null 2>&1; then
    echo "✗ MySQL client chưa được cài đặt"
    echo "Cài đặt MySQL client: apt-get install -y mysql-client"
    exit 1
fi

# Lấy thông tin database từ env hoặc sử dụng mặc định
DB_USER=${MYSQL_USER:-"root"}
DB_PASSWORD=${MYSQL_ROOT_PASSWORD:-""}
DB_HOST=${DATABASE_URL:-"localhost"}

# Parse DATABASE_URL nếu có (format: mysql://user:password@host:port/database)
if [[ "$DATABASE_URL" == mysql://* ]]; then
    DB_URL=$(echo $DATABASE_URL | sed 's|mysql://||')
    DB_USER=$(echo $DB_URL | cut -d: -f1)
    DB_PASSWORD=$(echo $DB_URL | cut -d: -f2 | cut -d@ -f1)
    DB_HOST=$(echo $DB_URL | cut -d@ -f2 | cut -d: -f1)
    DB_PORT=$(echo $DB_URL | cut -d: -f3 | cut -d/ -f1)
    DB_NAME=$(echo $DB_URL | cut -d/ -f2)
fi

echo "Database Info:"
echo "  Host: ${DB_HOST:-localhost}"
echo "  Port: ${DB_PORT:-3306}"
echo "  User: $DB_USER"
echo "  Database: $DB_NAME"
echo ""

# Test kết nối MySQL
echo "Kiểm tra kết nối MySQL..."
if [ -n "$DB_PASSWORD" ]; then
    mysql -h"${DB_HOST:-localhost}" -P"${DB_PORT:-3306}" -u"$DB_USER" -p"$DB_PASSWORD" -e "SELECT 1;" 2>/dev/null || {
        echo "✗ Không thể kết nối MySQL. Vui lòng kiểm tra thông tin kết nối."
        exit 1
    }
else
    mysql -h"${DB_HOST:-localhost}" -P"${DB_PORT:-3306}" -u"$DB_USER" -e "SELECT 1;" 2>/dev/null || {
        echo "✗ Không thể kết nối MySQL. Vui lòng kiểm tra thông tin kết nối."
        exit 1
    }
fi

echo "✓ Kết nối MySQL thành công"
echo ""

# Tạo database nếu chưa có
echo "Tạo database nếu chưa tồn tại..."
if [ -n "$DB_PASSWORD" ]; then
    mysql -h"${DB_HOST:-localhost}" -P"${DB_PORT:-3306}" -u"$DB_USER" -p"$DB_PASSWORD" -e "CREATE DATABASE IF NOT EXISTS \`$DB_NAME\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;" 2>/dev/null || true
else
    mysql -h"${DB_HOST:-localhost}" -P"${DB_PORT:-3306}" -u"$DB_USER" -e "CREATE DATABASE IF NOT EXISTS \`$DB_NAME\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;" 2>/dev/null || true
fi

echo "✓ Database đã sẵn sàng"
echo ""

# Import database
echo "Đang import database (có thể mất vài phút)..."
if [ -n "$DB_PASSWORD" ]; then
    mysql -h"${DB_HOST:-localhost}" -P"${DB_PORT:-3306}" -u"$DB_USER" -p"$DB_PASSWORD" "$DB_NAME" < "$SQL_FILE"
else
    mysql -h"${DB_HOST:-localhost}" -P"${DB_PORT:-3306}" -u"$DB_USER" "$DB_NAME" < "$SQL_FILE"
fi

if [ $? -eq 0 ]; then
    echo ""
    echo "✓ Import database thành công!"
    echo ""
    echo "Kiểm tra số bảng đã import:"
    if [ -n "$DB_PASSWORD" ]; then
        mysql -h"${DB_HOST:-localhost}" -P"${DB_PORT:-3306}" -u"$DB_USER" -p"$DB_PASSWORD" "$DB_NAME" -e "SHOW TABLES;" | wc -l
    else
        mysql -h"${DB_HOST:-localhost}" -P"${DB_PORT:-3306}" -u"$DB_USER" "$DB_NAME" -e "SHOW TABLES;" | wc -l
    fi
else
    echo ""
    echo "✗ Import database thất bại!"
    exit 1
fi

