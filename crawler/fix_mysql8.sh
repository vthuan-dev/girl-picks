#!/bin/bash

# Fix cho MySQL 8.0 trên Ubuntu
# Usage: ./fix_mysql8.sh

set -e

SQL_FILE="data/albums_insert_ubuntu.sql"
DB_NAME="girl_pick_db"
DB_USER="root"

echo "=== FIX CHO MYSQL 8.0 ==="
echo ""

# Kiểm tra SQL mode hiện tại
echo "SQL mode hiện tại:"
mysql -u "$DB_USER" -p -e "SELECT @@sql_mode;" 2>/dev/null || mysql -u "$DB_USER" -p -e "SELECT @@sql_mode;"

echo ""
echo "Đang set SQL mode cho session..."

# Set SQL mode cho toàn bộ session
mysql -u "$DB_USER" -p "$DB_NAME" << 'EOF'
SET SESSION sql_mode = '';
SET GLOBAL sql_mode = '';
SET SESSION FOREIGN_KEY_CHECKS = 0;
SET GLOBAL FOREIGN_KEY_CHECKS = 0;
SET SESSION AUTOCOMMIT = 0;
SET SESSION UNIQUE_CHECKS = 0;
EOF

echo "✓ Đã set SQL mode"
echo ""

# Import
echo "Đang import..."
mysql -u "$DB_USER" -p "$DB_NAME" < "$SQL_FILE"

# Restore
mysql -u "$DB_USER" -p "$DB_NAME" << 'EOF'
SET SESSION FOREIGN_KEY_CHECKS = 1;
SET GLOBAL FOREIGN_KEY_CHECKS = 1;
SET SESSION AUTOCOMMIT = 1;
SET SESSION UNIQUE_CHECKS = 1;
EOF

echo ""
echo "✓ Hoàn tất!"

