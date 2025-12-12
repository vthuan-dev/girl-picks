# Hướng Dẫn Import Chat Sex SQL

## File SQL đã tạo

- **File**: `data/chat_sex_insert.sql`
- **Tổng số**: 475 chat sex girls
- **Tổng dòng**: ~17,592 dòng

## Cách Import

### 1. Import vào MySQL Local (Windows)

```bash
# Vào thư mục crawler
cd crawler

# Import SQL
mysql -u root -p girl_pick_db < data/chat_sex_insert.sql
```

### 2. Import vào MySQL trên VPS Ubuntu

```bash
# Copy file lên VPS (hoặc đã có trên VPS)
cd /var/www/girl-pick/crawler/data

# Import với các settings để tránh lỗi
mysql -u root -p girl_pick_db << EOF
SET SESSION sql_mode = '';
SET GLOBAL sql_mode = '';
SET FOREIGN_KEY_CHECKS = 0;
SET AUTOCOMMIT = 0;
SET UNIQUE_CHECKS = 0;
SOURCE chat_sex_insert.sql;
SET FOREIGN_KEY_CHECKS = 1;
SET AUTOCOMMIT = 1;
SET UNIQUE_CHECKS = 1;
EOF
```

### 3. Import với Docker MySQL

```bash
# Nếu MySQL chạy trong Docker
docker exec -i mysql_container mysql -u root -p girl_pick_db < data/chat_sex_insert.sql
```

## Lưu Ý

1. **managedById**: File SQL để `NULL` cho `managedById`. Nếu muốn set admin cụ thể, có thể:
   - Chạy script với `--managed-by-id YOUR_ADMIN_ID`
   - Hoặc update sau khi import:
     ```sql
     UPDATE chat_sex_girls SET managedById = 'YOUR_ADMIN_ID' WHERE managedById IS NULL;
     ```

2. **Slug**: Script tự động generate slug từ name. Nếu có duplicate, MySQL sẽ báo lỗi unique constraint.

3. **Tags**: Script tự động filter các tag không hợp lệ (Color, Transparency, etc.)

4. **Datetime**: Script giữ nguyên datetime từ crawled_at, hoặc dùng thời gian hiện tại nếu không có.

## Troubleshooting

### Lỗi Duplicate Entry (Slug)
```sql
-- Xem các slug duplicate
SELECT slug, COUNT(*) as count 
FROM chat_sex_girls 
GROUP BY slug 
HAVING count > 1;

-- Fix: Thêm suffix cho duplicate
UPDATE chat_sex_girls 
SET slug = CONCAT(slug, '-', id) 
WHERE id IN (
    SELECT id FROM (
        SELECT id, slug, ROW_NUMBER() OVER (PARTITION BY slug ORDER BY createdAt) as rn
        FROM chat_sex_girls
    ) t WHERE rn > 1
);
```

### Lỗi Datetime
```sql
-- Fix datetime nếu có lỗi
UPDATE chat_sex_girls 
SET crawledAt = NOW(), createdAt = NOW(), updatedAt = NOW()
WHERE crawledAt IS NULL OR createdAt IS NULL;
```

## Tạo lại SQL

Nếu cần tạo lại file SQL:

```bash
cd crawler

# Tạo SQL từ JSON
python generate_chat_sex_sql.py \
  --input data/chat_sex_details_all_20251212_084435.json \
  --output data/chat_sex_insert.sql \
  --managed-by-id YOUR_ADMIN_ID  # Optional
```

## Kiểm tra sau khi import

```sql
-- Đếm số lượng
SELECT COUNT(*) as total FROM chat_sex_girls;

-- Xem một vài records
SELECT id, name, phone, zalo, isActive, viewCount 
FROM chat_sex_girls 
LIMIT 10;

-- Kiểm tra images
SELECT id, name, JSON_LENGTH(images) as image_count 
FROM chat_sex_girls 
WHERE JSON_LENGTH(images) > 0 
LIMIT 10;
```

