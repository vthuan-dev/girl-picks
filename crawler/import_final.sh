#!/bin/bash

# Script import cuối cùng - fix tất cả vấn đề
# Usage: ./import_final.sh

set -e

SQL_FILE="data/albums_insert.sql"
FIXED_SQL="data/albums_insert_ubuntu.sql"
DB_NAME="girl_pick_db"
DB_USER="root"

echo "=== IMPORT ALBUMS SQL (FINAL FIX) ==="
echo ""

# Kiểm tra file
if [ ! -f "$SQL_FILE" ]; then
    echo "✗ File không tồn tại: $SQL_FILE"
    exit 1
fi

# Fix file SQL bằng Python script
if [ ! -f "$FIXED_SQL" ]; then
    echo "Đang fix file SQL..."
    
    # Nếu có Python
    if command -v python3 >/dev/null 2>&1; then
        python3 fix_sql_complete.py "$SQL_FILE" "$FIXED_SQL"
    else
        # Fallback: dùng sed và awk
        echo "Dùng sed để fix..."
        sed -e "s/'2025-/'2024-/g" \
            -e "s/START TRANSACTION;//g" \
            -e "1i SET SESSION sql_mode = '';\nSET FOREIGN_KEY_CHECKS = 0;\nSET AUTOCOMMIT = 0;\nSET UNIQUE_CHECKS = 0;" \
            "$SQL_FILE" > "$FIXED_SQL"
        
        # Thêm COMMIT ở cuối nếu chưa có
        if ! grep -q "COMMIT;" "$FIXED_SQL"; then
            echo "" >> "$FIXED_SQL"
            echo "COMMIT;" >> "$FIXED_SQL"
            echo "SET FOREIGN_KEY_CHECKS = 1;" >> "$FIXED_SQL"
            echo "SET AUTOCOMMIT = 1;" >> "$FIXED_SQL"
        fi
        
        echo "✓ File đã được fix bằng sed"
    fi
else
    echo "✓ File fixed đã tồn tại, bỏ qua bước fix"
fi

echo ""

# Import
echo "Đang import (sẽ hỏi password)..."
mysql -u "$DB_USER" -p "$DB_NAME" < "$FIXED_SQL"

if [ $? -eq 0 ]; then
    echo ""
    echo "✓ Import thành công!"
    echo ""
    echo "Kiểm tra dữ liệu:"
    mysql -u "$DB_USER" -p "$DB_NAME" -e "
    SELECT COUNT(*) as total_albums FROM albums;
    SELECT COUNT(*) as total_images FROM album_images;
    " 2>/dev/null || echo "Chạy lệnh kiểm tra thủ công"
else
    echo ""
    echo "✗ Import thất bại!"
    echo "File fixed vẫn ở: $FIXED_SQL (để debug)"
    exit 1
fi

