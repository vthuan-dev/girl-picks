# Hướng Dẫn Import File SQL vào MySQL trên VPS Ubuntu

## Cách 1: Sử dụng Script Tự Động (Khuyến nghị)

### Bước 1: Upload file SQL lên VPS

```bash
# Từ máy local (Windows), sử dụng SCP hoặc SFTP
# Ví dụ với SCP:
scp crawler/data/albums_insert.sql user@your-vps-ip:/home/user/

# Hoặc sử dụng PowerShell (nếu có script upload-to-vps.ps1)
```

### Bước 2: SSH vào VPS

```bash
ssh user@your-vps-ip
```

### Bước 3: Upload script import

```bash
# Tạo thư mục và upload script
mkdir -p ~/scripts
# Copy nội dung file import_albums_to_vps.sh vào VPS
nano ~/scripts/import_albums_to_vps.sh
# Paste nội dung script, sau đó Ctrl+O, Enter, Ctrl+X
```

### Bước 4: Chạy script

```bash
# Di chuyển file SQL vào thư mục crawler/data (hoặc chỉnh đường dẫn trong script)
mkdir -p ~/crawler/data
cp albums_insert.sql ~/crawler/data/

# Cấp quyền thực thi
chmod +x ~/scripts/import_albums_to_vps.sh

# Chạy script với thông tin mặc định
cd ~/crawler
~/scripts/import_albums_to_vps.sh

# Hoặc chỉ định thông tin cụ thể
~/scripts/import_albums_to_vps.sh girlpick root your_password localhost 3306
```

---

## Cách 2: Import Thủ Công (Nếu không dùng script)

### Bước 1: Upload file SQL lên VPS

```bash
# Sử dụng SCP
scp crawler/data/albums_insert.sql user@your-vps-ip:/tmp/
```

### Bước 2: SSH vào VPS

```bash
ssh user@your-vps-ip
```

### Bước 3: Kiểm tra MySQL đang chạy

```bash
# Kiểm tra MySQL service
sudo systemctl status mysql
# hoặc
sudo systemctl status mariadb

# Nếu chưa chạy, khởi động:
sudo systemctl start mysql
```

### Bước 4: Cài đặt MySQL Client (nếu chưa có)

```bash
sudo apt-get update
sudo apt-get install -y mysql-client
```

### Bước 5: Import file SQL

```bash
# Với MySQL root user
mysql -u root -p girlpick < /tmp/albums_insert.sql

# Hoặc với user cụ thể
mysql -u girlpick -p girlpick < /tmp/albums_insert.sql

# Hoặc chỉ định host và port
mysql -h localhost -P 3306 -u girlpick -p girlpick < /tmp/albums_insert.sql
```

**Lưu ý**: Sẽ hỏi password, nhập password của MySQL user.

### Bước 6: Kiểm tra dữ liệu đã import

```bash
# Kết nối MySQL
mysql -u girlpick -p girlpick

# Chạy các query kiểm tra
SELECT COUNT(*) as total_albums FROM albums;
SELECT COUNT(*) as total_images FROM album_images;
SELECT AVG(image_count) as avg_images_per_album 
FROM (
    SELECT albumId, COUNT(*) as image_count 
    FROM album_images 
    GROUP BY albumId
) as subquery;

# Thoát
exit
```

---

## Cách 3: Import qua Docker (Nếu dùng Docker)

### Bước 1: Copy file SQL vào container

```bash
# Copy file vào container
docker cp crawler/data/albums_insert.sql girl-pick-mysql:/tmp/

# Hoặc mount volume và copy vào
```

### Bước 2: Import vào container

```bash
# Vào trong container MySQL
docker exec -i girl-pick-mysql mysql -u root -prootpassword123 girlpick < /tmp/albums_insert.sql

# Hoặc từ bên ngoài
docker exec -i girl-pick-mysql mysql -u girlpick -pgirlpick123 girlpick < /path/to/albums_insert.sql
```

---

## Cách 4: Import với MySQL Workbench (GUI)

### Bước 1: Kết nối MySQL Workbench đến VPS

1. Mở MySQL Workbench
2. Tạo connection mới:
   - **Hostname**: IP của VPS
   - **Port**: 3306 (hoặc port MySQL của bạn)
   - **Username**: girlpick (hoặc root)
   - **Password**: password của bạn
3. Test connection và kết nối

### Bước 2: Import file SQL

1. Click menu **Server** → **Data Import**
2. Chọn **"Import from Self-Contained File"**
3. Browse và chọn file `albums_insert.sql`
4. Chọn database đích: `girlpick`
5. Click **"Start Import"**

---

## Xử Lý Lỗi Thường Gặp

### Lỗi 1: "Access denied for user"

```bash
# Kiểm tra user và password
mysql -u root -p -e "SELECT user, host FROM mysql.user;"

# Tạo user mới nếu cần
mysql -u root -p
CREATE USER 'girlpick'@'localhost' IDENTIFIED BY 'girlpick123';
GRANT ALL PRIVILEGES ON girlpick.* TO 'girlpick'@'localhost';
FLUSH PRIVILEGES;
```

### Lỗi 2: "Database doesn't exist"

```bash
# Tạo database
mysql -u root -p
CREATE DATABASE girlpick CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
exit
```

### Lỗi 3: "File too large" hoặc timeout

```bash
# Tăng max_allowed_packet trong MySQL
mysql -u root -p
SET GLOBAL max_allowed_packet=1073741824;  # 1GB
exit

# Hoặc chỉnh trong my.cnf
sudo nano /etc/mysql/my.cnf
# Thêm:
[mysqld]
max_allowed_packet=1G

# Restart MySQL
sudo systemctl restart mysql
```

### Lỗi 4: "Foreign key constraint fails"

File SQL đã có `SET FOREIGN_KEY_CHECKS = 0;` ở đầu, nhưng nếu vẫn lỗi:

```bash
# Import với tắt foreign key checks
mysql -u girlpick -p girlpick -e "SET FOREIGN_KEY_CHECKS=0; SOURCE /tmp/albums_insert.sql; SET FOREIGN_KEY_CHECKS=1;"
```

---

## Kiểm Tra Sau Khi Import

### 1. Kiểm tra số lượng albums

```sql
SELECT COUNT(*) as total_albums FROM albums;
-- Kỳ vọng: ~1849 albums
```

### 2. Kiểm tra số lượng ảnh

```sql
SELECT COUNT(*) as total_images FROM album_images;
-- Kỳ vọng: ~16978 images
```

### 3. Kiểm tra phân bố số ảnh/album

```sql
SELECT 
    CASE 
        WHEN image_count = 1 THEN '1 ảnh'
        WHEN image_count = 2 THEN '2 ảnh'
        WHEN image_count BETWEEN 3 AND 5 THEN '3-5 ảnh'
        WHEN image_count BETWEEN 6 AND 9 THEN '6-9 ảnh'
        WHEN image_count >= 10 THEN '10+ ảnh'
    END as category,
    COUNT(*) as album_count
FROM (
    SELECT albumId, COUNT(*) as image_count 
    FROM album_images 
    GROUP BY albumId
) as subquery
GROUP BY category
ORDER BY category;
```

### 4. Kiểm tra một album cụ thể

```sql
-- Tìm album "Yua mikami #1"
SELECT a.id, a.title, COUNT(ai.id) as image_count
FROM albums a
LEFT JOIN album_images ai ON a.id = ai.albumId
WHERE a.title LIKE '%Yua mikami%'
GROUP BY a.id, a.title;
```

---

## Lưu Ý Quan Trọng

⚠️ **Trước khi import:**
- Backup database hiện tại (nếu có dữ liệu quan trọng)
- Đảm bảo có đủ dung lượng ổ cứng
- Kiểm tra MySQL đang chạy ổn định

⚠️ **Khi import:**
- File SQL lớn (~216k dòng) có thể mất vài phút
- Không tắt terminal trong quá trình import
- Nếu bị timeout, tăng `max_allowed_packet`

⚠️ **Sau khi import:**
- Kiểm tra số lượng records đã import
- Test một vài query để đảm bảo dữ liệu đúng
- Kiểm tra foreign keys và indexes

---

## Thông Tin File SQL

- **File**: `crawler/data/albums_insert.sql`
- **Kích thước**: ~10-50MB (tùy vào số lượng albums)
- **Số dòng**: ~216,363 dòng
- **Nội dung**:
  - 1849 albums
  - 16978 album_images
  - Transaction với COMMIT ở cuối
  - Tự động tắt/bật FOREIGN_KEY_CHECKS

---

## Script Nhanh (Copy & Paste)

```bash
#!/bin/bash
# Quick import script

SQL_FILE="albums_insert.sql"
DB_NAME="girlpick"
DB_USER="girlpick"
DB_PASSWORD="girlpick123"

echo "Importing $SQL_FILE to $DB_NAME..."
mysql -u "$DB_USER" -p"$DB_PASSWORD" "$DB_NAME" < "$SQL_FILE"

if [ $? -eq 0 ]; then
    echo "✓ Import successful!"
    mysql -u "$DB_USER" -p"$DB_PASSWORD" "$DB_NAME" -e "SELECT COUNT(*) as albums FROM albums; SELECT COUNT(*) as images FROM album_images;"
else
    echo "✗ Import failed!"
fi
```

