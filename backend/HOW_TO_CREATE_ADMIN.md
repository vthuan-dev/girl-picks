# 🔐 Hướng dẫn tạo Admin User

## Cách 1: Sử dụng Script (Khuyến nghị)

### Bước 1: Chạy script tạo admin

```bash
cd backend
npm run create-admin
```

Script sẽ tạo admin với thông tin mặc định:
- **Email**: `admin@example.com`
- **Password**: `admin123`
- **Name**: `Admin User`

### Bước 2: Tùy chỉnh thông tin (Optional)

Bạn có thể set environment variables trước khi chạy:

```bash
# Windows PowerShell
$env:ADMIN_EMAIL="admin@yourdomain.com"
$env:ADMIN_PASSWORD="YourSecurePassword123"
$env:ADMIN_NAME="Your Admin Name"
npm run create-admin

# Linux/Mac
export ADMIN_EMAIL="admin@yourdomain.com"
export ADMIN_PASSWORD="YourSecurePassword123"
export ADMIN_NAME="Your Admin Name"
npm run create-admin
```

---

## Cách 2: Sử dụng API Register

### Bước 1: Gọi API register với role ADMIN

```bash
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "Admin123",
    "fullName": "Admin User",
    "role": "ADMIN"
  }'
```

**Lưu ý**: Password phải đáp ứng yêu cầu:
- Tối thiểu 8 ký tự
- Có ít nhất 1 chữ hoa
- Có ít nhất 1 chữ thường
- Có ít nhất 1 số

---

## Cách 3: Sử dụng Prisma Studio

### Bước 1: Mở Prisma Studio

```bash
cd backend
npx prisma studio
```

### Bước 2: Tạo User mới

1. Mở tab **User**
2. Click **Add record**
3. Điền thông tin:
   - `email`: admin@example.com
   - `password`: (hash password bằng bcrypt)
   - `fullName`: Admin User
   - `role`: ADMIN
   - `isActive`: true
4. Click **Save 1 change**

**Lưu ý**: Bạn cần hash password trước. Có thể dùng script này:

```typescript
import * as bcrypt from 'bcrypt';
const hash = await bcrypt.hash('your-password', 10);
console.log(hash);
```

---

## Cách 4: Sử dụng Prisma Client trực tiếp

Tạo file `create-admin-manual.ts`:

```typescript
import { PrismaClient, UserRole } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const hashedPassword = await bcrypt.hash('admin123', 10);
  
  const admin = await prisma.user.create({
    data: {
      email: 'admin@example.com',
      password: hashedPassword,
      fullName: 'Admin User',
      role: UserRole.ADMIN,
      isActive: true,
    },
  });
  
  console.log('Admin created:', admin);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
```

Chạy:
```bash
ts-node -r tsconfig-paths/register create-admin-manual.ts
```

---

## ✅ Sau khi tạo Admin

### 1. Login vào Frontend

1. Mở `http://localhost:3001/auth/login`
2. Nhập email và password của admin
3. Click "Đăng nhập"
4. Sẽ tự động redirect đến `/admin/dashboard`

### 2. Truy cập Admin Dashboard

Sau khi login, bạn có thể truy cập:
- **Dashboard**: `http://localhost:3001/admin/dashboard`
- **Users Management**: `http://localhost:3001/admin/users`
- **Content Approval**: `http://localhost:3001/admin/content-approval`
- **Crawler**: `http://localhost:3001/admin/crawler`

---

## 🔒 Security Notes

1. **Đổi password mặc định** ngay sau khi tạo admin
2. **Không commit** thông tin admin vào git
3. **Sử dụng environment variables** cho production
4. **Tạo admin riêng** cho mỗi môi trường (dev, staging, production)

---

## 🐛 Troubleshooting

### Lỗi: "User with this email already exists"
- Admin đã tồn tại, bạn có thể login trực tiếp
- Hoặc xóa user cũ và tạo lại

### Lỗi: "Invalid credentials"
- Kiểm tra lại email và password
- Đảm bảo password đã được hash đúng cách

### Lỗi: "Account is deactivated"
- Set `isActive: true` trong database

---

## 📝 Quick Commands

```bash
# Tạo admin với thông tin mặc định
npm run create-admin

# Tạo admin với thông tin tùy chỉnh
ADMIN_EMAIL="admin@test.com" ADMIN_PASSWORD="Test123" npm run create-admin

# Kiểm tra admin đã tồn tại
npx prisma studio
# Mở tab User và tìm email admin
```

