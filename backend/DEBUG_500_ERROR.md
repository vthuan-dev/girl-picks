# Debug 500 Error trên VPS - Chat Sex API

## Nguyên nhân có thể

### 1. Prisma Client chưa được regenerate
Sau khi có migration mới, Prisma Client cần được regenerate để nhận các field mới.

**Fix:**
```bash
# Trên VPS, trong Docker container
docker-compose -f docker-compose.prod.yml exec backend npx prisma generate
```

### 2. Migration chưa được apply
Database schema chưa có các field mới (birthYear, height, weight, etc.)

**Fix:**
```bash
# Trên VPS
docker-compose -f docker-compose.prod.yml exec backend npx prisma migrate deploy
```

### 3. Lỗi parse JSON fields
Có thể có data không hợp lệ trong database.

**Fix:** Đã thêm error handling trong service, nhưng cần check logs.

### 4. Response format không đúng
Backend có thể đang return format khác với frontend expect.

## Cách debug

### Bước 1: Check backend logs
```bash
# Trên VPS
docker-compose -f docker-compose.prod.yml logs backend --tail=100
```

Tìm các dòng có:
- `Error parsing JSON fields`
- `PrismaClientKnownRequestError`
- `Cannot read property`

### Bước 2: Test API trực tiếp
```bash
# Trên VPS hoặc local
curl -X GET "https://gaigo1.net/api/chat-sex?page=1&limit=12&isActive=true" \
  -H "Content-Type: application/json"
```

### Bước 3: Check database schema
```bash
# Trong MySQL container
docker-compose -f docker-compose.prod.yml exec mysql mysql -u root -p${MYSQL_ROOT_PASSWORD} ${MYSQL_DATABASE}

# Kiểm tra schema
DESCRIBE chat_sex_girls;
```

Xem có các column:
- `birthYear`
- `height`
- `weight`
- `price15min`
- `paymentInfo`
- `instruction`
- `videos`

### Bước 4: Check Prisma Client
```bash
# Trong backend container
docker-compose -f docker-compose.prod.yml exec backend npx prisma generate
docker-compose -f docker-compose.prod.yml exec backend npx prisma migrate status
```

## Quick Fix

Nếu vẫn lỗi, thử restart backend:
```bash
docker-compose -f docker-compose.prod.yml restart backend
```

## Checklist trước khi deploy

- [ ] Migration files đã commit vào git
- [ ] Prisma schema đã sync với database
- [ ] Prisma Client đã được generate
- [ ] Backend đã được rebuild với code mới
- [ ] Database có đầy đủ columns mới

