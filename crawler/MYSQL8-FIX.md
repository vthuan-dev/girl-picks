# Fix Cho MySQL 8.0 trên Ubuntu

## Vấn Đề

MySQL 8.0.44 có strict mode mặc định, không chấp nhận một số format SQL.

## Giải Pháp Cho MySQL 8.0

### Cách 1: Set SQL Mode Trước Khi Import (Khuyến nghị)

```bash
cd /var/www/girl-pick/crawler/data

# Set SQL mode cho toàn bộ session
mysql -u root -p girl_pick_db << 'EOF'
SET SESSION sql_mode = '';
SET GLOBAL sql_mode = '';
SET SESSION FOREIGN_KEY_CHECKS = 0;
SET GLOBAL FOREIGN_KEY_CHECKS = 0;
SET SESSION AUTOCOMMIT = 0;
SET SESSION UNIQUE_CHECKS = 0;
EOF

# Import
mysql -u root -p girl_pick_db < albums_insert_ubuntu.sql

# Restore
mysql -u root -p girl_pick_db << 'EOF'
SET SESSION FOREIGN_KEY_CHECKS = 1;
SET GLOBAL FOREIGN_KEY_CHECKS = 1;
SET SESSION AUTOCOMMIT = 1;
SET SESSION UNIQUE_CHECKS = 1;
EOF
```

### Cách 2: Fix Vĩnh Viễn Trong MySQL Config

```bash
# Chỉnh file config
sudo nano /etc/mysql/mysql.conf.d/mysqld.cnf

# Thêm vào [mysqld]:
[mysqld]
sql_mode = ""

# Restart MySQL
sudo systemctl restart mysql

# Sau đó import bình thường
mysql -u root -p girl_pick_db < albums_insert_ubuntu.sql
```

### Cách 3: Import Với --force (Bỏ Qua Lỗi)

```bash
cd /var/www/girl-pick/crawler/data

# Import với force
mysql -u root -p girl_pick_db --force < albums_insert_ubuntu.sql 2> errors.log

# Kiểm tra
mysql -u root -p girl_pick_db -e "SELECT COUNT(*) FROM albums; SELECT COUNT(*) FROM album_images;"
```

### Cách 4: Dùng STR_TO_DATE() Cho Datetime

Nếu vẫn lỗi datetime, có thể cần convert:

```bash
# Tạo file với STR_TO_DATE()
cd /var/www/girl-pick/crawler/data

# Fix datetime format
sed "s/'\(2024-[0-9][0-9]-[0-9][0-9] [0-9][0-9]:[0-9][0-9]:[0-9][0-9]\)'/STR_TO_DATE('\1', '%Y-%m-%d %H:%i:%s')/g" albums_insert_ubuntu.sql > albums_with_strtodate.sql

# Import
mysql -u root -p girl_pick_db < albums_with_strtodate.sql
```

## Kiểm Tra SQL Mode

```bash
# Xem SQL mode hiện tại
mysql -u root -p -e "SELECT @@sql_mode; SELECT @@GLOBAL.sql_mode;"

# Xem MySQL version
mysql --version
```

## Lệnh Import Hoàn Chỉnh Cho MySQL 8.0

```bash
cd /var/www/girl-pick/crawler/data

# Bước 1: Set SQL mode
mysql -u root -p girl_pick_db -e "
SET SESSION sql_mode = '';
SET GLOBAL sql_mode = '';
SET SESSION FOREIGN_KEY_CHECKS = 0;
SET GLOBAL FOREIGN_KEY_CHECKS = 0;
"

# Bước 2: Import
mysql -u root -p girl_pick_db --force < albums_insert_ubuntu.sql 2> /tmp/import_errors.log

# Bước 3: Restore
mysql -u root -p girl_pick_db -e "
SET SESSION FOREIGN_KEY_CHECKS = 1;
SET GLOBAL FOREIGN_KEY_CHECKS = 1;
"

# Bước 4: Kiểm tra
mysql -u root -p girl_pick_db -e "
SELECT COUNT(*) as albums FROM albums;
SELECT COUNT(*) as images FROM album_images;
"
```

## Nếu Vẫn Lỗi - Debug Chi Tiết

```bash
# Xem dòng lỗi cụ thể
sed -n '25276,25285p' albums_insert_ubuntu.sql

# Xem với hexdump để tìm ký tự đặc biệt
sed -n '25278p' albums_insert_ubuntu.sql | hexdump -C

# Test import từng dòng
mysql -u root -p girl_pick_db -e "$(sed -n '25276,25291p' albums_insert_ubuntu.sql)"
```

