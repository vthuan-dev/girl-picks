# 🚀 Quick Start - Truy cập Admin UI

## Bước 1: Tạo Admin User

### Option A: Sử dụng Script (Dễ nhất)

```bash
cd backend
npm run create-admin
```

Sẽ tạo admin với:
- **Email**: `admin@example.com`
- **Password**: `admin123`

### Option B: Sử dụng API

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

---

## Bước 2: Login vào Frontend

1. Mở browser: `http://localhost:3001/auth/login`
2. Nhập:
   - Email: `admin@example.com`
   - Password: `admin123` (hoặc password bạn đã set)
3. Click "Đăng nhập"

---

## Bước 3: Truy cập Admin Dashboard

Sau khi login thành công, bạn sẽ tự động được redirect đến:

**`http://localhost:3001/admin/dashboard`**

---

## 📍 Các Admin Routes

- **Dashboard**: `/admin/dashboard`
- **Users**: `/admin/users`
- **Content Approval**: `/admin/content-approval`
- **Crawler**: `/admin/crawler`

---

## ✅ Checklist

- [ ] Backend đang chạy (`npm run start:dev` trong `backend/`)
- [ ] Frontend đang chạy (`npm run dev` trong `frontend/`)
- [ ] Đã tạo admin user
- [ ] Đã login thành công
- [ ] Có thể truy cập `/admin/dashboard`

---

## 🐛 Nếu gặp lỗi

### "Cannot access route"
- Đảm bảo đã login với role ADMIN
- Clear localStorage và login lại

### "User not found"
- Kiểm tra admin đã được tạo trong database
- Chạy lại script `npm run create-admin`

### "Invalid credentials"
- Kiểm tra lại email và password
- Đảm bảo password đúng format (có chữ hoa, chữ thường, số)

---

**Xem chi tiết**: `backend/HOW_TO_CREATE_ADMIN.md`

