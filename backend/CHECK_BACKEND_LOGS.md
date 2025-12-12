# Check Backend Logs để Debug Lỗi 500

## Cách check logs trên VPS

### 1. Check PM2 logs (nhanh nhất)
```bash
# SSH vào VPS
pm2 logs girl-pick-backend --lines 100
```

### 2. Check logs real-time
```bash
pm2 logs girl-pick-backend --lines 0
# Nhấn Ctrl+C để dừng
```

### 3. Check error logs cụ thể
```bash
pm2 logs girl-pick-backend --err --lines 50
```

### 4. Check status
```bash
pm2 status
pm2 info girl-pick-backend
```

## Các lỗi thường gặp

### Lỗi Prisma Client
```
Error: Unknown arg `birthYear` in where.birthYear
```
→ Prisma Client chưa được regenerate

**Fix:**
```bash
cd /var/www/girl-pick/backend
npx prisma generate
pm2 restart girl-pick-backend
```

### Lỗi Database Connection
```
Error: Can't reach database server
```
→ Check DATABASE_URL trong .env.production

### Lỗi JSON Parse
```
SyntaxError: Unexpected token
```
→ Data trong database không hợp lệ

## Test API trực tiếp

```bash
# Test API trên VPS
curl http://localhost:3001/chat-sex?page=1&limit=12&isActive=true

# Hoặc từ bên ngoài
curl https://gaigo1.net/api/chat-sex?page=1&limit=12&isActive=true
```

## Nếu vẫn lỗi

1. Check backend logs: `pm2 logs girl-pick-backend --lines 100`
2. Copy error message và gửi cho tôi
3. Hoặc check database có data không:
```bash
mysql -u root -p girl_pick_db -e "SELECT COUNT(*) FROM chat_sex_girls;"
```

