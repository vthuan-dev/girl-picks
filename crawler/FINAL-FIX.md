# Final Fix - Import SQL Trên Ubuntu

## Vấn Đề

MySQL trên Ubuntu vẫn báo lỗi syntax dù đã fix datetime. Có thể do:
1. `START TRANSACTION;` không tương thích
2. SQL mode vẫn strict
3. Cấu trúc file SQL có vấn đề

## Giải Pháp Cuối Cùng

### Cách 1: Dùng Script Python (Khuyến nghị)

```bash
cd /var/www/girl-pick/crawler

# Fix file SQL
python3 fix_sql_complete.py data/albums_insert.sql data/albums_insert_ubuntu.sql

# Import
mysql -u root -p girl_pick_db < data/albums_insert_ubuntu.sql
```

### Cách 2: Fix Thủ Công Bằng Sed

```bash
cd /var/www/girl-pick/crawler/data

# Fix tất cả:
# 1. Bỏ START TRANSACTION
# 2. Fix datetime 2025 -> 2024
# 3. Thêm SET commands ở đầu
(
  echo "-- Fixed SQL for Ubuntu MySQL"
  echo "SET SESSION sql_mode = '';"
  echo "SET FOREIGN_KEY_CHECKS = 0;"
  echo "SET AUTOCOMMIT = 0;"
  echo "SET UNIQUE_CHECKS = 0;"
  echo ""
  sed -e "s/'2025-/'2024-/g" \
      -e "s/START TRANSACTION;//g" \
      -e "/^SET FOREIGN_KEY_CHECKS = 0;/d" \
      -e "/^SET AUTOCOMMIT = 0;/d" \
      albums_insert.sql
  echo ""
  echo "COMMIT;"
  echo "SET FOREIGN_KEY_CHECKS = 1;"
  echo "SET AUTOCOMMIT = 1;"
) > albums_insert_ubuntu.sql

# Import
mysql -u root -p girl_pick_db < albums_insert_ubuntu.sql
```

### Cách 3: Import Từng Phần (Nếu file quá lớn)

```bash
cd /var/www/girl-pick/crawler/data

# Tạo file chỉ có albums (không có images)
head -n 29595 albums_insert.sql | sed "s/'2025-/'2024-/g" | sed "s/START TRANSACTION;//g" > albums_only.sql

# Import albums trước
mysql -u root -p girl_pick_db << 'EOF'
SET SESSION sql_mode = '';
SET FOREIGN_KEY_CHECKS = 0;
EOF
mysql -u root -p girl_pick_db < albums_only.sql

# Import images sau
tail -n +29597 albums_insert.sql | sed "s/'2025-/'2024-/g" > images_only.sql
mysql -u root -p girl_pick_db < images_only.sql

# Restore
mysql -u root -p girl_pick_db -e "SET FOREIGN_KEY_CHECKS = 1;"
```

## Lệnh Một Dòng (Nhanh Nhất)

```bash
cd /var/www/girl-pick/crawler/data && (echo "SET SESSION sql_mode = ''; SET FOREIGN_KEY_CHECKS = 0; SET AUTOCOMMIT = 0;"; sed -e "s/'2025-/'2024-/g" -e "s/START TRANSACTION;//g" albums_insert.sql; echo "COMMIT; SET FOREIGN_KEY_CHECKS = 1;") > albums_fixed.sql && mysql -u root -p girl_pick_db < albums_fixed.sql
```

## Kiểm Tra MySQL Version

```bash
mysql --version
mysql -u root -p -e "SELECT VERSION();"
```

Nếu là MySQL 8.0, có thể cần thêm:

```bash
mysql -u root -p girl_pick_db -e "SET GLOBAL sql_mode = '';"
```

## Debug - Xem Dòng Lỗi

```bash
# Xem dòng 25276 trong file fixed
sed -n '25270,25285p' albums_insert_ubuntu.sql

# Hoặc xem context xung quanh
sed -n '25274,25292p' albums_insert_ubuntu.sql
```

## Nếu Vẫn Lỗi - Thử Import Bằng MySQL Client

```bash
mysql -u root -p girl_pick_db << 'SQL'
SET SESSION sql_mode = '';
SET FOREIGN_KEY_CHECKS = 0;
SET AUTOCOMMIT = 0;
SOURCE /var/www/girl-pick/crawler/data/albums_insert_ubuntu.sql;
SET FOREIGN_KEY_CHECKS = 1;
SET AUTOCOMMIT = 1;
SQL
```

