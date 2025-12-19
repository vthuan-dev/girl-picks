# 🚨 CHẠY MIGRATION TRÊN VPS NGAY

## Vấn đề
Bảng `community_posts` chưa tồn tại trong database production, gây lỗi 500.

## Giải pháp: Chạy Migration Trực Tiếp

### Cách 1: Dùng Prisma Migrate (Khuyến nghị)

```bash
# SSH vào VPS
ssh user@your-vps-ip

# Vào thư mục backend
cd /var/www/girl-pick/backend

# Load environment variables
set -a
. .env.production
set +a

# Kiểm tra migration status
npx prisma migrate status

# Chạy migration
npx prisma migrate deploy

# Verify
npx prisma db execute --stdin <<< "SHOW TABLES LIKE 'community_posts';"

# Restart backend
cd /var/www/girl-pick
pm2 restart girl-pick-backend
```

### Cách 2: Chạy SQL Trực Tiếp (Nếu Prisma Migrate Fail)

```bash
# SSH vào VPS
ssh user@your-vps-ip

# Vào thư mục backend
cd /var/www/girl-pick/backend

# Load environment variables
set -a
. .env.production
set +a

# Chạy SQL file trực tiếp
mysql -u $DB_USER -p$DB_PASSWORD $DB_NAME < run-community-posts-migration.sql

# Hoặc nếu không có biến env:
mysql -u YOUR_DB_USER -pYOUR_DB_PASSWORD YOUR_DB_NAME < run-community-posts-migration.sql

# Sau đó mark migration as applied
npx prisma migrate resolve --applied 20250119000000_add_community_posts

# Generate Prisma Client
npx prisma generate

# Restart backend
cd /var/www/girl-pick
pm2 restart girl-pick-backend
```

### Cách 3: Dùng Prisma DB Push (Nếu migration có vấn đề)

```bash
# SSH vào VPS
ssh user@your-vps-ip

cd /var/www/girl-pick/backend

# Load env
set -a && . .env.production && set +a

# Push schema trực tiếp (sẽ tạo bảng nếu chưa có)
npx prisma db push --accept-data-loss

# Generate Prisma Client
npx prisma generate

# Restart backend
cd /var/www/girl-pick
pm2 restart girl-pick-backend
```

## Kiểm tra sau khi chạy

```bash
# Kiểm tra bảng đã tồn tại
mysql -u $DB_USER -p$DB_PASSWORD $DB_NAME -e "SHOW TABLES LIKE 'community_posts';"

# Kiểm tra cấu trúc bảng
mysql -u $DB_USER -p$DB_PASSWORD $DB_NAME -e "DESCRIBE community_posts;"

# Kiểm tra log backend
pm2 logs girl-pick-backend --lines 50
```

## Nếu vẫn lỗi

1. **Kiểm tra DATABASE_URL:**
```bash
cd /var/www/girl-pick/backend
set -a && . .env.production && set +a
echo $DATABASE_URL
```

2. **Kiểm tra quyền database user:**
```bash
mysql -u $DB_USER -p$DB_PASSWORD -e "SHOW GRANTS;"
```

3. **Kiểm tra migration đã được apply chưa:**
```bash
cd /var/www/girl-pick/backend
npx prisma migrate status
```

## Lưu ý

- ✅ Backup database trước khi chạy migration
- ✅ Đảm bảo DATABASE_URL đúng
- ✅ Kiểm tra user database có quyền CREATE TABLE
- ✅ Restart backend sau khi migration xong

