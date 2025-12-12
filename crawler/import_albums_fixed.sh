#!/bin/bash

# Script import với fix SQL mode
# Usage: ./import_albums_fixed.sh

SQL_FILE="albums_insert.sql"
DB_NAME="girl_pick_db"
DB_USER="root"
DB_PASSWORD=""

echo "=== IMPORT ALBUMS SQL (WITH FIXES) ==="
echo ""

# Kiểm tra file
if [ ! -f "$SQL_FILE" ]; then
    echo "✗ File không tồn tại: $SQL_FILE"
    exit 1
fi

# Tạo file SQL tạm với fix SQL mode
TEMP_SQL="/tmp/albums_insert_fixed.sql"

echo "Đang tạo file SQL với SQL mode fixes..."

# Thêm SET commands ở đầu file
cat > "$TEMP_SQL" << 'EOF'
-- Disable strict mode và các checks có thể gây lỗi
SET SESSION sql_mode = '';
SET FOREIGN_KEY_CHECKS = 0;
SET AUTOCOMMIT = 0;
SET UNIQUE_CHECKS = 0;
SET sql_log_bin = 0;

EOF

# Thêm nội dung file gốc
cat "$SQL_FILE" >> "$TEMP_SQL"

# Thêm commit ở cuối nếu chưa có
echo "" >> "$TEMP_SQL"
echo "SET FOREIGN_KEY_CHECKS = 1;" >> "$TEMP_SQL"
echo "SET AUTOCOMMIT = 1;" >> "$TEMP_SQL"
echo "SET UNIQUE_CHECKS = 1;" >> "$TEMP_SQL"

echo "✓ File SQL đã được fix"
echo ""

# Import với password prompt
echo "Đang import (sẽ hỏi password)..."
if [ -z "$DB_PASSWORD" ]; then
    mysql -u "$DB_USER" -p "$DB_NAME" < "$TEMP_SQL"
else
    mysql -u "$DB_USER" -p"$DB_PASSWORD" "$DB_NAME" < "$TEMP_SQL"
fi

if [ $? -eq 0 ]; then
    echo ""
    echo "✓ Import thành công!"
    echo ""
    echo "Kiểm tra dữ liệu:"
    mysql -u "$DB_USER" -p"$DB_PASSWORD" "$DB_NAME" -e "
    SELECT COUNT(*) as total_albums FROM albums;
    SELECT COUNT(*) as total_images FROM album_images;
    " 2>/dev/null || mysql -u "$DB_USER" -p "$DB_NAME" -e "
    SELECT COUNT(*) as total_albums FROM albums;
    SELECT COUNT(*) as total_images FROM album_images;
    "
    
    # Xóa file tạm
    rm -f "$TEMP_SQL"
else
    echo ""
    echo "✗ Import thất bại!"
    echo "File tạm vẫn ở: $TEMP_SQL (để debug)"
    exit 1
fi

