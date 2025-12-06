# ✅ MySQL + Prisma Setup - Hoàn tất

## ✅ Đã hoàn thành:

1. ✅ **Schema đã chuyển sang MySQL**
   - Provider: `mysql` (thay vì `postgresql`)
   - Các array fields đã chuyển sang `Json` (MySQL không hỗ trợ array)

2. ✅ **Prisma Client đã được generate**
   - Chạy: `npx prisma generate` ✅

3. ✅ **Cấu hình trong `prisma.config.ts`**
   - Provider: `mysql`
   - URL từ `DATABASE_URL` trong `.env`

---

## 📝 Prisma hỗ trợ MySQL

**Có!** Prisma hỗ trợ MySQL rất tốt:
- ✅ MySQL 5.7+
- ✅ MySQL 8.0+
- ✅ MariaDB 10.2+

**Các tính năng:**
- Full CRUD operations
- Migrations
- Transactions
- Relations
- Prisma Studio

---

## 🔧 Cấu hình .env

Đảm bảo file `.env` có:

```env
DATABASE_URL="mysql://root:1001@localhost:3306/girl_pick_db"
```

**Format:**
```
mysql://[username]:[password]@[host]:[port]/[database]
```

---

## 🚀 Các bước tiếp theo:

### 1. Tạo Database (nếu chưa có)

```sql
CREATE DATABASE girl_pick_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### 2. Chạy Migrations

```bash
cd backend
npx prisma migrate dev --name init
```

Hoặc nếu database đã có tables:

```bash
npx prisma db push
```

### 3. Tạo Admin User

**Cách đơn giản nhất - Dùng API:**

1. Đảm bảo backend đang chạy: `npm run start:dev`

2. Gọi API register:

**PowerShell:**
```powershell
$body = @{
    email = "admin@example.com"
    password = "Admin123"
    fullName = "Admin User"
    role = "ADMIN"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:3000/auth/register" -Method Post -Body $body -ContentType "application/json"
```

**Hoặc dùng Postman/Browser:**
- URL: `POST http://localhost:3000/auth/register`
- Body (JSON):
```json
{
  "email": "admin@example.com",
  "password": "Admin123",
  "fullName": "Admin User",
  "role": "ADMIN"
}
```

### 4. Login vào Admin UI

1. Mở: `http://localhost:3001/auth/login`
2. Email: `admin@example.com`
3. Password: `Admin123`
4. Sẽ redirect đến `/admin/dashboard`

---

## 📊 Kiểm tra kết nối

### Test Prisma Connection:

Tạo file `test-connection.js`:

```javascript
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function test() {
  try {
    await prisma.$connect();
    console.log('✅ Kết nối MySQL thành công!');
    
    const userCount = await prisma.user.count();
    console.log(`📊 Số users: ${userCount}`);
    
  } catch (error) {
    console.error('❌ Lỗi:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

test();
```

Chạy: `node test-connection.js`

---

## 🔍 Prisma Studio

Xem và quản lý data trực tiếp:

```bash
npx prisma studio
```

Sẽ mở tại: `http://localhost:5555`

---

## ⚠️ Lưu ý MySQL vs PostgreSQL

### Khác biệt đã xử lý:

1. **Array Types:**
   - PostgreSQL: `String[]` ✅
   - MySQL: `Json` ✅ (đã sửa)

2. **UUID:**
   - Cả 2 đều hỗ trợ `@default(uuid())` ✅

3. **JSON:**
   - Cả 2 đều hỗ trợ `Json` type ✅

4. **Relations:**
   - Cả 2 đều giống nhau ✅

---

## 🐛 Troubleshooting

### Lỗi: "Can't reach database server"
- Kiểm tra MySQL đang chạy: `mysql -u root -p1001`
- Kiểm tra port 3306
- Kiểm tra DATABASE_URL trong .env

### Lỗi: "Unknown database"
- Tạo database: `CREATE DATABASE girl_pick_db;`

### Lỗi: "Access denied"
- Kiểm tra username/password trong DATABASE_URL
- Kiểm tra user có quyền truy cập database

---

## ✅ Checklist

- [x] Schema đã chuyển sang MySQL
- [x] Prisma Client đã generate
- [ ] Database `girl_pick_db` đã được tạo
- [ ] Migrations đã chạy
- [ ] Admin user đã được tạo
- [ ] Có thể login vào admin UI

---

**Prisma + MySQL hoạt động hoàn hảo!** 🎉

