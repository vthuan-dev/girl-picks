# Fix Community Posts 500 Error

## Vấn đề
Lỗi 500 khi gọi `/api/admin/community-posts` có thể do:
1. Prisma Client chưa được generate (model `CommunityPost` chưa có)
2. Migration chưa chạy (bảng `community_posts` chưa tồn tại)
3. Backend chưa được restart sau khi generate

## Cách fix trên Production Server

### Bước 1: SSH vào VPS
```bash
ssh user@your-vps-ip
```

### Bước 2: Vào thư mục project
```bash
cd /var/www/girl-pick
```

### Bước 3: Pull code mới nhất
```bash
git pull origin master
```

### Bước 4: Generate Prisma Client và chạy migration
```bash
cd backend

# Load environment variables
set -a
. .env.production
set +a

# Generate Prisma Client (quan trọng!)
npx prisma generate

# Chạy migration
npx prisma migrate deploy

# Verify: Kiểm tra xem bảng đã tồn tại chưa
npx prisma db execute --stdin <<< "SHOW TABLES LIKE 'community_posts';"
```

### Bước 5: Restart backend
```bash
cd /var/www/girl-pick
pm2 restart girl-pick-backend

# Kiểm tra log
pm2 logs girl-pick-backend --lines 50
```

### Bước 6: Kiểm tra lỗi
Nếu vẫn lỗi, kiểm tra log backend:
```bash
pm2 logs girl-pick-backend --lines 100 | grep -i "community\|error"
```

## Kiểm tra nhanh

### Kiểm tra Prisma Client có model CommunityPost không:
```bash
cd /var/www/girl-pick/backend
node -e "const { PrismaClient } = require('@prisma/client'); const prisma = new PrismaClient(); console.log('CommunityPost' in prisma ? 'OK' : 'MISSING');"
```

### Kiểm tra database có bảng không:
```bash
cd /var/www/girl-pick/backend
npx prisma db execute --stdin <<< "SELECT COUNT(*) as count FROM community_posts;"
```

## Nếu vẫn lỗi

1. **Kiểm tra migration file có tồn tại không:**
```bash
ls -la /var/www/girl-pick/backend/prisma/migrations/ | grep community
```

2. **Chạy migration thủ công nếu cần:**
```bash
cd /var/www/girl-pick/backend
npx prisma migrate resolve --applied 20250119000000_add_community_posts
npx prisma migrate deploy
```

3. **Hoặc dùng db push (nếu migration có vấn đề):**
```bash
cd /var/www/girl-pick/backend
set -a && . .env.production && set +a
npx prisma db push --accept-data-loss
npx prisma generate
pm2 restart girl-pick-backend
```

## Lưu ý
- Luôn chạy `npx prisma generate` trước `npx prisma migrate deploy`
- Đảm bảo environment variables đã được load trước khi chạy Prisma commands
- Restart backend sau khi generate Prisma Client

