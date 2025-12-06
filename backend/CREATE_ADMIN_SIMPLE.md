# 🚀 Tạo Admin User - Cách Đơn Giản Nhất

## ✅ Đã sửa:
- ✅ Schema đã chuyển từ PostgreSQL → MySQL
- ✅ Prisma Client đã được generate
- ✅ Các array fields đã chuyển sang JSON (MySQL không hỗ trợ array)

## 📝 Cách 1: Sử dụng API Register (Khuyến nghị)

### Bước 1: Đảm bảo Backend đang chạy

```bash
cd backend
npm run start:dev
```

### Bước 2: Tạo Admin qua API

**Windows PowerShell:**
```powershell
$body = @{
    email = "admin@example.com"
    password = "Admin123"
    fullName = "Admin User"
    role = "ADMIN"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:3000/auth/register" -Method Post -Body $body -ContentType "application/json"
```

**Hoặc dùng curl:**
```bash
curl -X POST http://localhost:3000/auth/register ^
  -H "Content-Type: application/json" ^
  -d "{\"email\":\"admin@example.com\",\"password\":\"Admin123\",\"fullName\":\"Admin User\",\"role\":\"ADMIN\"}"
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

**Lưu ý:** Password phải:
- Tối thiểu 8 ký tự
- Có ít nhất 1 chữ hoa
- Có ít nhất 1 chữ thường  
- Có ít nhất 1 số

---

## 📝 Cách 2: Sử dụng Prisma Studio

### Bước 1: Mở Prisma Studio

```bash
cd backend
npx prisma studio
```

### Bước 2: Tạo User

1. Mở tab **User**
2. Click **Add record**
3. Điền:
   - `email`: admin@example.com
   - `password`: (hash bằng bcrypt, xem bên dưới)
   - `fullName`: Admin User
   - `role`: ADMIN
   - `isActive`: true
4. Click **Save**

### Hash Password:

Tạo file `hash-password.js`:
```javascript
const bcrypt = require('bcrypt');
bcrypt.hash('Admin123', 10).then(hash => console.log(hash));
```

Chạy: `node hash-password.js`

---

## 📝 Cách 3: Sử dụng MySQL Workbench

1. Mở MySQL Workbench
2. Connect với root/1001
3. Chọn database `girl_pick_db`
4. Chạy SQL:

```sql
-- Hash password: Admin123
INSERT INTO users (id, email, password, "fullName", role, "isActive", "createdAt", "updatedAt")
VALUES (
  gen_random_uuid(), -- hoặc UUID() trong MySQL
  'admin@example.com',
  '$2b$10$YourHashedPasswordHere', -- Hash từ bcrypt
  'Admin User',
  'ADMIN',
  true,
  NOW(),
  NOW()
);
```

**Lưu ý:** Cần hash password trước bằng bcrypt.

---

## ✅ Sau khi tạo Admin

1. Login tại: `http://localhost:3001/auth/login`
2. Email: `admin@example.com`
3. Password: `Admin123` (hoặc password bạn đã set)
4. Sẽ tự động redirect đến `/admin/dashboard`

---

## 🔧 Cấu hình .env

Đảm bảo file `.env` có:

```env
DATABASE_URL="mysql://root:1001@localhost:3306/girl_pick_db"
```

**Lưu ý:** 
- Thay `root` bằng username MySQL của bạn nếu khác
- Thay `1001` bằng password MySQL của bạn
- Thay `girl_pick_db` bằng tên database của bạn

---

## 🐛 Troubleshooting

### Lỗi: "Cannot connect to database"
- Kiểm tra MySQL đang chạy: `mysql -u root -p1001`
- Kiểm tra DATABASE_URL trong .env
- Kiểm tra database đã được tạo chưa

### Lỗi: "User already exists"
- Admin đã tồn tại, có thể login trực tiếp
- Hoặc xóa user cũ và tạo lại

### Lỗi: "Password validation failed"
- Password phải có: chữ hoa, chữ thường, số, tối thiểu 8 ký tự

