# Fix Lỗi Import SQL - ERROR 1064

## Vấn Đề

Lỗi `ERROR 1064 (42000) at line 25276` khi import file `albums_insert.sql` vào MySQL.

## Nguyên Nhân

1. **SQL Mode Strict**: MySQL strict mode có thể không chấp nhận:
   - Date trong tương lai (2025)
   - Format datetime không đúng
   - NULL values không đúng chỗ

2. **Foreign Key Constraints**: Có thể bị lỗi nếu import không đúng thứ tự

## Giải Pháp

### Cách 1: Import Với SQL Mode Fix (Khuyến nghị)

```bash
# Chạy script tự động
chmod +x import_albums_fixed.sh
./import_albums_fixed.sh
```

### Cách 2: Import Thủ Công Với SET Commands

```bash
# Tạo file SQL với fixes
cat > /tmp/albums_fixed.sql << 'EOF'
SET SESSION sql_mode = '';
SET FOREIGN_KEY_CHECKS = 0;
SET AUTOCOMMIT = 0;
SET UNIQUE_CHECKS = 0;
EOF

# Thêm nội dung file gốc
cat albums_insert.sql >> /tmp/albums_fixed.sql

# Thêm commit
echo "SET FOREIGN_KEY_CHECKS = 1;" >> /tmp/albums_fixed.sql
echo "SET AUTOCOMMIT = 1;" >> /tmp/albums_fixed.sql

# Import
mysql -u root -p girl_pick_db < /tmp/albums_fixed.sql
```

### Cách 3: Set SQL Mode Trước Khi Import

```bash
# Kết nối MySQL và set mode
mysql -u root -p girl_pick_db << 'SQL'
SET SESSION sql_mode = '';
SET FOREIGN_KEY_CHECKS = 0;
SET AUTOCOMMIT = 0;
SOURCE /var/www/girl-pick/crawler/data/albums_insert.sql;
SET FOREIGN_KEY_CHECKS = 1;
SET AUTOCOMMIT = 1;
SQL
```

### Cách 4: Import Từng Phần (Nếu file quá lớn)

```bash
# Import albums trước
head -n 29595 albums_insert.sql | mysql -u root -p girl_pick_db

# Import images sau
tail -n +29597 albums_insert.sql | mysql -u root -p girl_pick_db
```

## Kiểm Tra SQL Mode Hiện Tại

```bash
mysql -u root -p -e "SELECT @@sql_mode;"
```

## Fix SQL Mode Vĩnh Viễn (Nếu cần)

```bash
# Chỉnh file my.cnf
sudo nano /etc/mysql/my.cnf

# Thêm vào [mysqld]:
[mysqld]
sql_mode = ""

# Restart MySQL
sudo systemctl restart mysql
```

## Lệnh Import Nhanh (Copy & Paste)

```bash
# Từ thư mục chứa albums_insert.sql
mysql -u root -p girl_pick_db << 'EOF'
SET SESSION sql_mode = '';
SET FOREIGN_KEY_CHECKS = 0;
SET AUTOCOMMIT = 0;
EOF

mysql -u root -p girl_pick_db < albums_insert.sql

mysql -u root -p girl_pick_db << 'EOF'
SET FOREIGN_KEY_CHECKS = 1;
SET AUTOCOMMIT = 1;
EOF
```

## Kiểm Tra Sau Khi Import

```bash
mysql -u root -p girl_pick_db -e "
SELECT COUNT(*) as albums FROM albums;
SELECT COUNT(*) as images FROM album_images;
SELECT 
    COUNT(DISTINCT a.id) as albums,
    COUNT(ai.id) as images,
    ROUND(COUNT(ai.id) / COUNT(DISTINCT a.id), 2) as avg_per_album
FROM albums a
LEFT JOIN album_images ai ON a.id = ai.albumId;
"
```

