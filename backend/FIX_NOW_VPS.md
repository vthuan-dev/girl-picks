# 🚨 FIX NGAY: Chạy Script Trên VPS

## Vấn đề
Migration đã được mark là "applied" nhưng bảng `community_posts` chưa tồn tại.

## Giải pháp: Chạy Script Trực Tiếp

### Cách 1: Chạy Script Tự Động (Khuyến nghị)

```bash
# SSH vào VPS
ssh user@your-vps-ip

# Chạy script
cd /var/www/girl-pick/backend
bash fix-community-posts-on-vps.sh
```

### Cách 2: Chạy Thủ Công

```bash
# SSH vào VPS
ssh user@your-vps-ip

cd /var/www/girl-pick/backend

# Load env
set -a && . .env.production && set +a

# Dùng Prisma DB Push để tạo bảng trực tiếp
npx prisma db push --accept-data-loss

# Generate Prisma Client
npx prisma generate

# Restart backend
cd /var/www/girl-pick
pm2 restart girl-pick-backend
```

### Cách 3: Chạy SQL Trực Tiếp (Nếu Prisma fail)

```bash
# SSH vào VPS
ssh user@your-vps-ip

cd /var/www/girl-pick/backend

# Load env
set -a && . .env.production && set +a

# Chạy SQL file
mysql -u $DB_USER -p$DB_PASSWORD $DB_NAME < run-community-posts-migration.sql

# Generate Prisma Client
npx prisma generate

# Restart backend
cd /var/www/girl-pick
pm2 restart girl-pick-backend
```

## Kiểm tra sau khi fix

```bash
# Kiểm tra bảng
mysql -u $DB_USER -p$DB_PASSWORD $DB_NAME -e "SHOW TABLES LIKE 'community_posts';"

# Kiểm tra log
pm2 logs girl-pick-backend --lines 50

# Test API (nếu có curl)
curl -H "Authorization: Bearer YOUR_TOKEN" \
  https://gaigo1.net/api/admin/community-posts?status=PENDING&page=1&limit=20
```

## Lưu ý

- `prisma db push` sẽ tạo bảng trực tiếp từ schema, không cần migration
- `--accept-data-loss` cho phép thay đổi schema mà không mất dữ liệu (trong trường hợp này không có dữ liệu cũ)
- Sau khi fix, migration sẽ được sync với database state

