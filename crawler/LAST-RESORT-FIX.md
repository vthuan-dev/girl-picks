# Last Resort Fix - Import SQL

## Vấn Đề Vẫn Tồn Tại

Lỗi vẫn ở dòng 25278 với datetime. Có thể do:
1. MySQL version trên Ubuntu quá strict
2. Có ký tự đặc biệt hoặc encoding issue
3. Cấu trúc INSERT statement không tương thích

## Giải Pháp Cuối Cùng

### Cách 1: Import Với --force (Bỏ Qua Lỗi)

```bash
cd /var/www/girl-pick/crawler/data

# Import với --force (sẽ bỏ qua lỗi và tiếp tục)
mysql -u root -p girl_pick_db --force < albums_insert_ubuntu.sql 2> import_errors.log

# Kiểm tra số lỗi
grep -c "ERROR" import_errors.log

# Kiểm tra dữ liệu đã import
mysql -u root -p girl_pick_db -e "SELECT COUNT(*) FROM albums; SELECT COUNT(*) FROM album_images;"
```

### Cách 2: Import Từng Phần Nhỏ

```bash
cd /var/www/girl-pick/crawler/data

# Tách file thành nhiều phần nhỏ (mỗi phần 1000 dòng)
split -l 1000 albums_insert_ubuntu.sql albums_part_

# Import từng phần
for file in albums_part_*; do
    echo "Importing $file..."
    mysql -u root -p girl_pick_db --force < "$file" 2>> import_errors.log || true
done

# Kiểm tra
mysql -u root -p girl_pick_db -e "SELECT COUNT(*) FROM albums;"
```

### Cách 3: Fix Dòng Lỗi Cụ Thể

```bash
cd /var/www/girl-pick/crawler/data

# Xem dòng 25278 và context
sed -n '25270,25285p' albums_insert_ubuntu.sql

# Fix dòng đó (nếu cần)
# Có thể cần escape datetime hoặc dùng STR_TO_DATE()
```

### Cách 4: Import Bằng MySQL Workbench (GUI)

1. Kết nối MySQL Workbench đến VPS
2. Server → Data Import
3. Chọn file `albums_insert_ubuntu.sql`
4. Chọn database `girl_pick_db`
5. Tick "Continue on SQL errors"
6. Start Import

### Cách 5: Dùng mysqldump Format (Nếu có)

Nếu có file backup từ Windows, có thể dùng format đó:

```bash
# Import từ Windows backup (nếu có)
mysql -u root -p girl_pick_db < backup_from_windows.sql
```

## Debug Chi Tiết

```bash
# Xem dòng lỗi cụ thể
cd /var/www/girl-pick/crawler/data
sed -n '25276,25285p' albums_insert_ubuntu.sql | cat -A

# Kiểm tra encoding
file albums_insert_ubuntu.sql
head -n 1 albums_insert_ubuntu.sql | od -c

# Kiểm tra MySQL version và mode
mysql -u root -p -e "SELECT VERSION(); SELECT @@sql_mode;"
```

## Import Với Verbose Logging

```bash
mysql -u root -p girl_pick_db --verbose < albums_insert_ubuntu.sql 2>&1 | tee import_log.txt
```

## Nếu Vẫn Không Được - Tạo Lại File SQL

Có thể cần tạo lại file SQL từ JSON với format khác:

```bash
cd /var/www/girl-pick/crawler
python3 generate_sql.py data/albums_batch_20251212_003851 data/albums_insert_new.sql

# Sau đó fix datetime
sed "s/'2025-/'2024-/g" data/albums_insert_new.sql > data/albums_insert_new_fixed.sql

# Import
mysql -u root -p girl_pick_db < data/albums_insert_new_fixed.sql
```

## Kiểm Tra Sau Khi Import

```bash
mysql -u root -p girl_pick_db << 'SQL'
SELECT COUNT(*) as albums FROM albums;
SELECT COUNT(*) as images FROM album_images;
SELECT 
    COUNT(DISTINCT a.id) as albums,
    COUNT(ai.id) as images,
    ROUND(COUNT(ai.id) / COUNT(DISTINCT a.id), 2) as avg_per_album
FROM albums a
LEFT JOIN album_images ai ON a.id = ai.albumId;
SQL
```

