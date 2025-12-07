# 🚀 Tạo Admin Account - Hướng Dẫn

## Cách 1: Sử dụng Script (Khuyến nghị) ⭐

### Bước 1: Đảm bảo Database đã setup
```bash
cd backend
npm install
npx prisma generate
npx prisma migrate dev
```

### Bước 2: Chạy script tạo admin

**Với thông tin mặc định:**
```bash
npm run create-admin
```

**Với thông tin tùy chỉnh:**
```bash
# Windows PowerShell
$env:ADMIN_EMAIL="admin@admin.com"; $env:ADMIN_PASSWORD="Admin123"; $env:ADMIN_NAME="Admin User"; npm run create-admin

# Windows CMD
set ADMIN_EMAIL=admin@admin.com && set ADMIN_PASSWORD=Admin123 && set ADMIN_NAME=Admin User && npm run create-admin

# Linux/Mac
ADMIN_EMAIL="admin@admin.com" ADMIN_PASSWORD="Admin123" ADMIN_NAME="Admin User" npm run create-admin
```

### Thông tin mặc định:
- **Email:** `admin@admin.com`
- **Password:** `Admin123`
- **Full Name:** `Admin User`

### Yêu cầu Password:
- ✅ Tối thiểu 8 ký tự
- ✅ Có ít nhất 1 chữ hoa
- ✅ Có ít nhất 1 chữ thường
- ✅ Có ít nhất 1 số

---

## Cách 2: Sử dụng API Register (Không khuyến nghị)

⚠️ **Lưu ý:** Backend đã chặn register ADMIN qua API để bảo mật. Chỉ có thể tạo ADMIN qua script hoặc trực tiếp trong database.

---

## Cách 3: Tạo trực tiếp trong Database

### Sử dụng Prisma Studio:
```bash
cd backend
npx prisma studio
```

1. Mở tab **User**
2. Click **Add record**
3. Điền thông tin:
   - `email`: admin@admin.com
   - `password`: (hash bằng bcrypt - xem bên dưới)
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

Chạy: `node hash-password.js` và copy hash vào database.

---

## ✅ Sau khi tạo Admin

1. **Login tại Frontend:**
   - URL: `http://localhost:3001/auth/login`
   - Email: `admin@admin.com`
   - Password: `Admin123`
   - Sẽ tự động redirect đến `/admin/dashboard`

2. **Hoặc test API:**
   ```bash
   curl -X POST http://localhost:3000/auth/login \
     -H "Content-Type: application/json" \
     -d '{"email":"admin@admin.com","password":"Admin123"}'
   ```

---

## 🔧 Troubleshooting

### Lỗi: "Cannot connect to database"
- Kiểm tra MySQL đang chạy
- Kiểm tra `DATABASE_URL` trong `.env`
- Chạy: `npx prisma migrate dev`

### Lỗi: "Email already exists"
- Admin đã tồn tại, có thể login trực tiếp
- Hoặc xóa user cũ và tạo lại

### Lỗi: "Password validation failed"
- Password phải có: chữ hoa, chữ thường, số, tối thiểu 8 ký tự

---

## 📝 Environment Variables

Bạn có thể tạo file `.env` với:
```env
DATABASE_URL="mysql://root:password@localhost:3306/girl_pick_db"
ADMIN_EMAIL="admin@admin.com"
ADMIN_PASSWORD="Admin123"
ADMIN_NAME="Admin User"
ADMIN_PHONE="0123456789"
```

Sau đó chạy: `npm run create-admin`

