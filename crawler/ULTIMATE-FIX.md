# Ultimate Fix - Import SQL MySQL 8.0

## Vấn Đề Vẫn Tồn Tại

Lỗi ở dòng 25278 với datetime. Có thể do:
1. Cấu trúc INSERT statement không đúng
2. Ký tự đặc biệt hoặc encoding
3. MySQL 8.0 strict về format

## Giải Pháp Cuối Cùng

### Cách 1: Import Với --force (Bỏ Qua Lỗi)

```bash
cd /var/www/girl-pick/crawler/data

# Import với force - sẽ bỏ qua lỗi và tiếp tục
mysql -u root -p girl_pick_db --force < albums_insert_ubuntu.sql 2> errors.log

# Kiểm tra số lỗi
echo "Số lỗi: $(grep -c 'ERROR' errors.log || echo 0)"

# Kiểm tra dữ liệu đã import
mysql -u root -p girl_pick_db -e "
SELECT COUNT(*) as albums FROM albums;
SELECT COUNT(*) as images FROM album_images;
"
```

### Cách 2: Xem Và Fix Dòng Lỗi Cụ Thể

```bash
cd /var/www/girl-pick/crawler/data

# Xem dòng 25278 và context
sed -n '25270,25285p' albums_insert_ubuntu.sql

# Xem với cat -A để thấy ký tự đặc biệt
sed -n '25276,25285p' albums_insert_ubuntu.sql | cat -A

# Xem hex để debug
sed -n '25278p' albums_insert_ubuntu.sql | od -c
```

### Cách 3: Import Từng Phần (Bỏ Qua Dòng Lỗi)

```bash
cd /var/www/girl-pick/crawler/data

# Import phần trước dòng lỗi
head -n 25275 albums_insert_ubuntu.sql | mysql -u root -p girl_pick_db

# Bỏ qua dòng lỗi (25276-25291), import phần sau
tail -n +25292 albums_insert_ubuntu.sql | mysql -u root -p girl_pick_db --force
```

### Cách 4: Tạo Lại File SQL Với Format Khác

Có thể cần tạo lại file SQL từ JSON với format datetime khác:

```bash
cd /var/www/girl-pick/crawler

# Tạo lại file SQL với format datetime hiện tại
python3 -c "
import json
import glob
import uuid
from datetime import datetime

files = glob.glob('data/albums_batch_20251212_003851/*.json')
output = open('data/albums_insert_new.sql', 'w', encoding='utf-8')

output.write('SET SESSION sql_mode = \"\";\n')
output.write('SET FOREIGN_KEY_CHECKS = 0;\n')
output.write('SET AUTOCOMMIT = 0;\n\n')

for f in files:
    with open(f, 'r', encoding='utf-8') as file:
        data = json.load(file)
    
    album_id = str(uuid.uuid4())
    title = data.get('title', '').replace(\"'\", \"''\")
    images = data.get('images', [])
    if not images:
        continue
    
    cover_url = images[0].replace(\"'\", \"''\")
    now = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
    
    # INSERT album
    output.write(f\"INSERT INTO albums (id, title, coverUrl, category, isPublic, viewCount, createdAt, updatedAt) VALUES ('{album_id}', '{title}', '{cover_url}', 'album-anh-sex', 1, 0, '{now}', '{now}');\\n\")
    
    # INSERT images
    for idx, img_url in enumerate(images):
        img_id = str(uuid.uuid4())
        img_url_escaped = img_url.replace(\"'\", \"''\")
        output.write(f\"INSERT INTO album_images (id, albumId, url, thumbUrl, \`order\`, createdAt) VALUES ('{img_id}', '{album_id}', '{img_url_escaped}', '{img_url_escaped}', {idx}, '{now}');\\n\")

output.write('\\nCOMMIT;\\n')
output.write('SET FOREIGN_KEY_CHECKS = 1;\\n')
output.write('SET AUTOCOMMIT = 1;\\n')
output.close()

print('File đã được tạo: data/albums_insert_new.sql')
"

# Import file mới
mysql -u root -p girl_pick_db < data/albums_insert_new.sql
```

### Cách 5: Dùng MySQL Workbench (GUI)

1. Kết nối MySQL Workbench đến VPS
2. Server → Data Import
3. Chọn file `albums_insert_ubuntu.sql`
4. Chọn database `girl_pick_db`
5. **Quan trọng**: Tick "Continue on SQL errors"
6. Start Import

## Debug Chi Tiết Dòng Lỗi

```bash
cd /var/www/girl-pick/crawler/data

# Xem dòng 25278
sed -n '25278p' albums_insert_ubuntu.sql

# Xem context đầy đủ
sed -n '25276,25285p' albums_insert_ubuntu.sql

# Test import chỉ dòng đó
mysql -u root -p girl_pick_db -e "$(sed -n '25276,25291p' albums_insert_ubuntu.sql)"
```

## Import Với Verbose Logging

```bash
mysql -u root -p girl_pick_db --verbose < albums_insert_ubuntu.sql 2>&1 | tee import_full_log.txt
```

## Kiểm Tra Sau Khi Import Với --force

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

