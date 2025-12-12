# Quick Fix - Import SQL Trên Ubuntu

## Vấn Đề

MySQL trên Ubuntu không chấp nhận date trong tương lai (2025) dù đã set SQL mode.

## Giải Pháp Nhanh (3 Bước)

### Bước 1: Fix datetime trong file SQL

```bash
cd /var/www/girl-pick/crawler/data

# Chuyển tất cả date 2025 về 2024
sed "s/'2025-/'2024-/g" albums_insert.sql > albums_insert_fixed.sql
```

### Bước 2: Set SQL mode và import

```bash
# Set SQL mode
mysql -u root -p girl_pick_db << 'EOF'
SET SESSION sql_mode = '';
SET FOREIGN_KEY_CHECKS = 0;
SET AUTOCOMMIT = 0;
EOF

# Import file đã fix
mysql -u root -p girl_pick_db < albums_insert_fixed.sql

# Restore settings
mysql -u root -p girl_pick_db << 'EOF'
SET FOREIGN_KEY_CHECKS = 1;
SET AUTOCOMMIT = 1;
EOF
```

### Bước 3: Kiểm tra

```bash
mysql -u root -p girl_pick_db -e "
SELECT COUNT(*) as albums FROM albums;
SELECT COUNT(*) as images FROM album_images;
"
```

## Hoặc Dùng Script Tự Động

```bash
cd /var/www/girl-pick/crawler
chmod +x import_with_datetime_fix.sh
./import_with_datetime_fix.sh
```

## Lệnh Một Dòng (Copy & Paste)

```bash
cd /var/www/girl-pick/crawler/data && sed "s/'2025-/'2024-/g" albums_insert.sql > albums_insert_fixed.sql && mysql -u root -p girl_pick_db -e "SET SESSION sql_mode = ''; SET FOREIGN_KEY_CHECKS = 0;" && mysql -u root -p girl_pick_db < albums_insert_fixed.sql && mysql -u root -p girl_pick_db -e "SET FOREIGN_KEY_CHECKS = 1;"
```

## Giải Thích

- **Vấn đề**: MySQL strict mode trên Ubuntu không cho phép date trong tương lai (2025)
- **Giải pháp**: Chuyển tất cả date 2025 về 2024 (hoặc date hiện tại)
- **Lý do**: Date trong SQL file là `2025-12-12` nhưng hiện tại là 2024, MySQL coi đây là date tương lai không hợp lệ

## Kiểm Tra Sau Khi Import

```bash
mysql -u root -p girl_pick_db -e "
SELECT 
    COUNT(*) as total_albums,
    MIN(createdAt) as earliest_date,
    MAX(createdAt) as latest_date
FROM albums;
"
```

