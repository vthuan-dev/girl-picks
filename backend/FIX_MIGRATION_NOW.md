# 🔴 FIX NGAY: Chạy Migration cho Community Posts

## Vấn đề
Bảng `community_posts` chưa tồn tại trong database production, gây ra lỗi 500.

## Giải pháp nhanh (chạy trên Production Server)

### Bước 1: SSH vào VPS
```bash
ssh user@your-vps-ip
```

### Bước 2: Vào thư mục backend
```bash
cd /var/www/girl-pick/backend
```

### Bước 3: Load environment variables
```bash
set -a
. .env.production
set +a
```

### Bước 4: Kiểm tra migration status
```bash
npx prisma migrate status
```

### Bước 5: Chạy migration
```bash
npx prisma migrate deploy
```

### Bước 6: Verify tables đã được tạo
```bash
# Kiểm tra bảng community_posts
npx prisma db execute --stdin <<< "SHOW TABLES LIKE 'community_posts';"

# Hoặc kiểm tra bằng MySQL
mysql -u $DB_USER -p$DB_PASSWORD $DB_NAME -e "SHOW TABLES LIKE 'community_posts';"
```

### Bước 7: Restart backend
```bash
cd /var/www/girl-pick
pm2 restart girl-pick-backend
```

### Bước 8: Kiểm tra log
```bash
pm2 logs girl-pick-backend --lines 50
```

## Nếu migration bị lỗi

### Option 1: Chạy migration thủ công bằng SQL
```bash
cd /var/www/girl-pick/backend
mysql -u $DB_USER -p$DB_PASSWORD $DB_NAME < prisma/migrations/20250119000000_add_community_posts/migration.sql
```

### Option 2: Dùng Prisma db push (nếu migration có vấn đề)
```bash
cd /var/www/girl-pick/backend
set -a && . .env.production && set +a
npx prisma db push --accept-data-loss
npx prisma generate
pm2 restart girl-pick-backend
```

### Option 3: Mark migration as applied (nếu đã chạy thủ công)
```bash
cd /var/www/girl-pick/backend
set -a && . .env.production && set +a
npx prisma migrate resolve --applied 20250119000000_add_community_posts
```

## Kiểm tra sau khi fix

1. **Kiểm tra bảng đã tồn tại:**
```bash
mysql -u $DB_USER -p$DB_PASSWORD $DB_NAME -e "DESCRIBE community_posts;"
```

2. **Test API endpoint:**
```bash
curl -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  https://gaigo1.net/api/admin/community-posts?status=PENDING&page=1&limit=20
```

3. **Kiểm tra trong browser:**
- Vào `https://gaigo1.net/admin/community-posts`
- Nếu không còn lỗi 500, đã fix thành công!

## Lưu ý quan trọng

- ✅ Luôn backup database trước khi chạy migration
- ✅ Đảm bảo environment variables đã được load
- ✅ Kiểm tra migration status trước khi deploy
- ✅ Restart backend sau khi migration xong

## Troubleshooting

### Lỗi: "Migration already applied"
```bash
npx prisma migrate resolve --applied 20250119000000_add_community_posts
```

### Lỗi: "Table already exists"
```bash
# Kiểm tra xem bảng có tồn tại không
mysql -u $DB_USER -p$DB_PASSWORD $DB_NAME -e "SHOW TABLES LIKE 'community_posts';"

# Nếu có, mark migration as applied
npx prisma migrate resolve --applied 20250119000000_add_community_posts
```

### Lỗi: "DATABASE_URL not found"
```bash
# Đảm bảo đã load env
set -a && . .env.production && set +a
echo $DATABASE_URL  # Kiểm tra xem có giá trị không
```

