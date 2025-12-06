# 🚀 Tạo Admin User Ngay Bây Giờ

## ✅ Đã hoàn thành:
- ✅ Database `girl_pick_db` đã được tạo
- ✅ Migrations đã chạy thành công
- ✅ Tables đã được tạo trong database

## 📝 Tạo Admin User

### Bước 1: Đảm bảo Backend đang chạy

```bash
cd backend
npm run start:dev
```

Backend sẽ chạy tại: `http://localhost:3000`

### Bước 2: Tạo Admin qua API

**Option A: PowerShell (Windows)**

```powershell
$body = @{
    email = "admin@example.com"
    password = "Admin123"
    fullName = "Admin User"
    role = "ADMIN"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:3000/auth/register" -Method Post -Body $body -ContentType "application/json"
```

**Option B: curl (nếu có)**

```bash
curl -X POST http://localhost:3000/auth/register ^
  -H "Content-Type: application/json" ^
  -d "{\"email\":\"admin@example.com\",\"password\":\"Admin123\",\"fullName\":\"Admin User\",\"role\":\"ADMIN\"}"
```

**Option C: Postman/Browser**

1. Mở Postman hoặc browser extension
2. Method: `POST`
3. URL: `http://localhost:3000/auth/register`
4. Headers: `Content-Type: application/json`
5. Body (raw JSON):
```json
{
  "email": "admin@example.com",
  "password": "Admin123",
  "fullName": "Admin User",
  "role": "ADMIN"
}
```

**Option D: Dùng Prisma Studio**

```bash
npx prisma studio
```

Sau đó:
1. Mở tab **User**
2. Click **Add record**
3. Điền thông tin (cần hash password trước)

---

## ✅ Sau khi tạo Admin

### Login vào Frontend:

1. Mở: `http://localhost:3001/auth/login`
2. Email: `admin@example.com`
3. Password: `Admin123`
4. Click "Đăng nhập"
5. Sẽ tự động redirect đến `/admin/dashboard`

---

## 🎯 Admin Routes

Sau khi login, bạn có thể truy cập:
- **Dashboard**: `http://localhost:3001/admin/dashboard`
- **Users**: `http://localhost:3001/admin/users`
- **Content Approval**: `http://localhost:3001/admin/content-approval`
- **Crawler**: `http://localhost:3001/admin/crawler`

---

## 🔑 Thông tin Admin mặc định

- **Email**: `admin@example.com`
- **Password**: `Admin123`
- **Role**: `ADMIN`

**Lưu ý**: Đổi password sau khi login lần đầu!

