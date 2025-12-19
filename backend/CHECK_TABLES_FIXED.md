# 🔍 Kiểm Tra Bảng - Cách Đã Sửa

## Vấn Đề

`prisma db execute` cần `--schema` parameter.

## Giải Pháp

### Cách 1: Dùng Schema Parameter (Đã Sửa)

```bash
# SSH vào VPS
cd /var/www/girl-pick/backend
set -a && . .env.production && set +a

# Kiểm tra với schema parameter
npx prisma db execute --schema=prisma/schema.prisma --stdin <<< "SHOW TABLES LIKE 'community_posts';"
```

### Cách 2: Dùng Prisma Client (Đơn Giản Nhất)

```bash
cd /var/www/girl-pick/backend
set -a && . .env.production && set +a

# Kiểm tra bằng Node.js với Prisma Client
node -e "
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
prisma.\$queryRaw\`SHOW TABLES LIKE 'community_posts'\`.then(result => {
  console.log(result.length > 0 ? '✅ EXISTS' : '❌ NOT FOUND');
  prisma.\$disconnect();
});
"
```

### Cách 3: Test API Trực Tiếp (Nhanh Nhất)

```bash
# Test API endpoint
curl -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  https://gaigo1.net/api/admin/community-posts?status=PENDING&page=1&limit=1

# Nếu trả về 200 OK → Table exists
# Nếu trả về 500 error → Table doesn't exist
```

### Cách 4: Dùng Prisma Studio (GUI)

```bash
cd /var/www/girl-pick/backend
set -a && . .env.production && set +a
npx prisma studio --schema=prisma/schema.prisma
```

Mở browser tại `http://your-vps-ip:5555` để xem tất cả tables.

## Nếu Bảng Chưa Có

```bash
cd /var/www/girl-pick/backend
set -a && . .env.production && set +a

# Tạo bảng
npx prisma db push --accept-data-loss --schema=prisma/schema.prisma

# Generate Prisma Client
npx prisma generate

# Restart backend
cd /var/www/girl-pick
pm2 restart girl-pick-backend
```

