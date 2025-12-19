# 🔍 Kiểm Tra Bảng Trên VPS

## Chạy Script Kiểm Tra

```bash
# SSH vào VPS
ssh user@your-vps-ip

cd /var/www/girl-pick/backend
bash check-tables-on-vps.sh
```

## Hoặc Kiểm Tra Thủ Công

```bash
# SSH vào VPS
ssh user@your-vps-ip

cd /var/www/girl-pick/backend
set -a && . .env.production && set +a

# Kiểm tra bảng community_posts
mysql -u $DB_USER -p$DB_PASSWORD $DB_NAME -e "SHOW TABLES LIKE 'community_posts';"

# Kiểm tra cấu trúc bảng
mysql -u $DB_USER -p$DB_PASSWORD $DB_NAME -e "DESCRIBE community_posts;"

# Kiểm tra tất cả bảng community
mysql -u $DB_USER -p$DB_PASSWORD $DB_NAME -e "SHOW TABLES LIKE '%community%';"

# Kiểm tra migration status
npx prisma migrate status
```

## Nếu Bảng Chưa Có

Chạy lại migration:

```bash
cd /var/www/girl-pick/backend
set -a && . .env.production && set +a

# Option 1: Dùng db push
npx prisma db push --accept-data-loss

# Option 2: Chạy SQL trực tiếp
mysql -u $DB_USER -p$DB_PASSWORD $DB_NAME < run-community-posts-migration.sql

# Sau đó generate Prisma Client
npx prisma generate

# Restart backend
cd /var/www/girl-pick
pm2 restart girl-pick-backend
```

