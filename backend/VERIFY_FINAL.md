# ✅ Verify Table Exists - Final Check

## Từ Kết Quả Trước

- ✅ Prisma Client có `communityPost` model
- ⚠️ API trả về 401 (cần auth), không phải 500

## Kiểm Tra Chính Xác

### Option 1: Check Backend Logs (Chính Xác Nhất)

```bash
# Xem log backend để tìm lỗi "table does not exist"
pm2 logs girl-pick-backend --lines 100 --nostream | grep -i "community_posts\|table.*does not exist"
```

### Option 2: Test API và Xem Error Message

```bash
# Test API và xem response
curl -s https://gaigo1.net/api/admin/community-posts?status=PENDING&page=1&limit=1

# Nếu thấy: "The table `community_posts` does not exist"
# → Table chưa có
```

### Option 3: Query Trực Tiếp Bằng Prisma Client

```bash
cd /var/www/girl-pick/backend
set -a && . .env.production && set +a

# Query trực tiếp
node -e "
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
prisma.\$queryRaw\`SELECT COUNT(*) as count FROM community_posts\`.then(result => {
  console.log('✅ Table EXISTS - Count:', result[0]?.count);
  prisma.\$disconnect();
}).catch(err => {
  if (err.message.includes('does not exist')) {
    console.log('❌ Table DOES NOT EXIST');
  } else {
    console.log('Error:', err.message);
  }
  prisma.\$disconnect();
});
"
```

### Option 4: Chạy Script Verify

```bash
cd /var/www/girl-pick/backend
bash verify-table-exists.sh
```

## Nếu Table Chưa Có

```bash
cd /var/www/girl-pick/backend
set -a && . .env.production && set +a

# Tạo bảng
npx prisma db push --accept-data-loss

# Generate Prisma Client
npx prisma generate

# Restart backend
cd /var/www/girl-pick
pm2 restart girl-pick-backend

# Verify lại
bash verify-table-exists.sh
```

## Kết Luận

Nếu API trả về 401 thay vì 500, có khả năng table đã tồn tại. Nhưng cần verify bằng cách:
1. Check backend logs
2. Query trực tiếp bằng Prisma Client
3. Test API với auth token

