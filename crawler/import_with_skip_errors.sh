#!/bin/bash

# Import với skip errors và log chi tiết
# Usage: ./import_with_skip_errors.sh

set -e

SQL_FILE="data/albums_insert_ubuntu.sql"
DB_NAME="girl_pick_db"
DB_USER="root"

echo "=== IMPORT VỚI SKIP ERRORS ==="
echo ""

# Kiểm tra file
if [ ! -f "$SQL_FILE" ]; then
    echo "✗ File không tồn tại: $SQL_FILE"
    exit 1
fi

# Tạo file log
LOG_FILE="/tmp/mysql_import.log"
ERROR_LOG="/tmp/mysql_errors.log"

echo "Đang import (sẽ hỏi password)..."
echo "Log sẽ được lưu tại: $LOG_FILE"
echo "Errors sẽ được lưu tại: $ERROR_LOG"
echo ""

# Import với force và log errors
mysql -u "$DB_USER" -p "$DB_NAME" --force < "$SQL_FILE" > "$LOG_FILE" 2> "$ERROR_LOG" || true

# Kiểm tra kết quả
if [ -s "$ERROR_LOG" ]; then
    ERROR_COUNT=$(grep -c "ERROR" "$ERROR_LOG" || echo "0")
    echo "⚠️  Có $ERROR_COUNT lỗi trong quá trình import"
    echo ""
    echo "10 lỗi đầu tiên:"
    head -n 20 "$ERROR_LOG"
    echo ""
    echo "Xem toàn bộ lỗi: cat $ERROR_LOG"
else
    echo "✓ Không có lỗi trong log"
fi

# Kiểm tra dữ liệu đã import
echo ""
echo "Kiểm tra dữ liệu đã import:"
mysql -u "$DB_USER" -p "$DB_NAME" -e "
SELECT COUNT(*) as total_albums FROM albums;
SELECT COUNT(*) as total_images FROM album_images;
" 2>/dev/null || echo "Chạy lệnh kiểm tra thủ công"

