#!/bin/bash

# Script import với fix datetime (2025 -> 2024)
# Usage: ./import_with_datetime_fix.sh

set -e

SQL_FILE="data/albums_insert.sql"
FIXED_SQL="data/albums_insert_fixed.sql"
DB_NAME="girl_pick_db"
DB_USER="root"

echo "=== IMPORT ALBUMS SQL (WITH DATETIME FIX) ==="
echo ""

# Kiểm tra file
if [ ! -f "$SQL_FILE" ]; then
    echo "✗ File không tồn tại: $SQL_FILE"
    exit 1
fi

# Fix datetime nếu chưa có file fixed
if [ ! -f "$FIXED_SQL" ]; then
    echo "Đang fix datetime (2025 -> 2024)..."
    
    # Sử dụng sed để thay thế
    sed "s/'2025-/'2024-/g" "$SQL_FILE" > "$FIXED_SQL"
    
    COUNT=$(grep -o "'2024-" "$FIXED_SQL" | wc -l)
    echo "✓ Đã fix $COUNT datetime"
else
    echo "✓ File fixed đã tồn tại, bỏ qua bước fix"
fi

echo ""

# Import với SQL mode fixes
echo "Đang import (sẽ hỏi password)..."
mysql -u "$DB_USER" -p "$DB_NAME" << 'EOF'
SET SESSION sql_mode = '';
SET FOREIGN_KEY_CHECKS = 0;
SET AUTOCOMMIT = 0;
EOF

mysql -u "$DB_USER" -p "$DB_NAME" < "$FIXED_SQL"

mysql -u "$DB_USER" -p "$DB_NAME" << 'EOF'
SET FOREIGN_KEY_CHECKS = 1;
SET AUTOCOMMIT = 1;
EOF

if [ $? -eq 0 ]; then
    echo ""
    echo "✓ Import thành công!"
    echo ""
    echo "Kiểm tra dữ liệu:"
    mysql -u "$DB_USER" -p "$DB_NAME" -e "
    SELECT COUNT(*) as total_albums FROM albums;
    SELECT COUNT(*) as total_images FROM album_images;
    " 2>/dev/null || echo "Chạy lệnh kiểm tra thủ công:"
    echo "  mysql -u $DB_USER -p $DB_NAME -e \"SELECT COUNT(*) FROM albums;\""
else
    echo ""
    echo "✗ Import thất bại!"
    exit 1
fi

