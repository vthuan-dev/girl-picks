# 🔍 Kiểm Tra Bảng - Cách Đơn Giản

## Vấn Đề

Lỗi MySQL access denied do biến môi trường không được load đúng.

## Giải Pháp: Dùng Prisma (Không Cần MySQL Password)

### Cách 1: Chạy Script Đơn Giản (Khuyến nghị)

```bash
# SSH vào VPS
ssh user@your-vps-ip

cd /var/www/girl-pick/backend
bash check-tables-simple.sh
```

### Cách 2: Chạy Thủ Công

```bash
# SSH vào VPS
cd /var/www/girl-pick/backend

# Load env
set -a && . .env.production && set +a

# Kiểm tra bằng Prisma (không cần MySQL password)
npx prisma db execute --stdin <<< "SHOW TABLES LIKE 'community_posts';"

# Hoặc kiểm tra tất cả bảng community
npx prisma db execute --stdin <<< "SHOW TABLES LIKE '%community%';"
```

### Cách 3: Dùng Prisma Studio (GUI)

```bash
cd /var/www/girl-pick/backend
set -a && . .env.production && set +a
npx prisma studio
```

Sau đó mở browser tại `http://localhost:5555` để xem tất cả tables.

## Nếu Bảng Chưa Có

```bash
cd /var/www/girl-pick/backend
set -a && . .env.production && set +a

# Tạo bảng bằng Prisma DB Push
npx prisma db push --accept-data-loss

# Generate Prisma Client
npx prisma generate

# Restart backend
cd /var/www/girl-pick
pm2 restart girl-pick-backend
```

