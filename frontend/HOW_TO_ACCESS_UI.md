# 🚀 Hướng dẫn truy cập UI các Role

## 📋 Yêu cầu

1. **Backend đang chạy** tại `http://localhost:3000`
2. **Frontend đang chạy** tại `http://localhost:3001`

## 🔧 Cách chạy Frontend

```bash
cd frontend
npm install  # Nếu chưa install
npm run dev
```

Frontend sẽ chạy tại: `http://localhost:3001`

## 👤 Truy cập theo Role

### 1. **CUSTOMER** (Khách hàng)

#### Routes:
- `/search` - Tìm kiếm gái gọi
- `/bookings` - Đặt lịch của tôi
- `/messages` - Tin nhắn

#### Cách truy cập:
1. Đăng nhập với tài khoản có role `CUSTOMER`
2. Hoặc đăng ký tài khoản mới (mặc định là CUSTOMER)
3. Sau khi login, sẽ tự động redirect đến `/search`

#### Test với mock data:
- Email: `customer@example.com`
- Password: `password123`

---

### 2. **GIRL** (Gái gọi)

#### Routes:
- `/profile` - Profile của tôi (Dashboard)
- `/bookings` - Đặt lịch
- `/service-packages` - Gói dịch vụ
- `/earnings` - Thu nhập

#### Cách truy cập:
1. Đăng nhập với tài khoản có role `GIRL`
2. Hoặc đăng ký và chọn role GIRL (nếu có option)
3. Sau khi login, sẽ tự động redirect đến `/profile`

#### Test với mock data:
- Email: `girl@example.com`
- Password: `password123`

**Note**: Cần tạo tài khoản GIRL từ backend hoặc seed database

---

### 3. **ADMIN** (Quản trị viên)

#### Routes:
- `/admin/dashboard` - Dashboard
- `/admin/users` - Quản lý người dùng
- `/admin/content-approval` - Duyệt nội dung
- `/admin/crawler` - Crawler tool

#### Cách truy cập:
1. Đăng nhập với tài khoản có role `ADMIN`
2. Sau khi login, sẽ tự động redirect đến `/admin/dashboard`

#### Test với mock data:
- Email: `admin@example.com`
- Password: `password123`

**Note**: Cần tạo tài khoản ADMIN từ backend hoặc seed database

---

## 🔐 Authentication Flow

### Login Process:
1. Vào `/auth/login`
2. Nhập email và password
3. Sau khi login thành công:
   - **CUSTOMER** → `/search`
   - **GIRL** → `/profile`
   - **ADMIN** → `/admin/dashboard`

### Protected Routes:
- Tất cả routes trong `(customer)`, `(girl)`, `(admin)` đều được protect
- Nếu chưa login hoặc sai role → redirect về `/auth/login`

---

## 🧪 Test với Mock Data

### Option 1: Tạo user từ Backend API

```bash
# Tạo CUSTOMER
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "customer@test.com",
    "password": "password123",
    "fullName": "Test Customer",
    "role": "CUSTOMER"
  }'

# Tạo GIRL
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "girl@test.com",
    "password": "password123",
    "fullName": "Test Girl",
    "role": "GIRL"
  }'

# Tạo ADMIN (cần quyền admin hoặc seed)
```

### Option 2: Sử dụng Prisma Studio

```bash
cd backend
npx prisma studio
```

Tạo users trực tiếp trong database với các role tương ứng.

---

## 📱 Navigation

### Sidebar Navigation:
- Mỗi role có sidebar riêng với menu items phù hợp
- Sidebar responsive: ẩn trên mobile, hiện trên desktop
- Click menu item để navigate

### Header Navigation:
- Header chung cho tất cả pages
- Có search bar, user menu, logout button

---

## 🐛 Troubleshooting

### Lỗi: "Cannot access route"
- **Nguyên nhân**: Chưa login hoặc sai role
- **Giải pháp**: Login lại với đúng role

### Lỗi: "Redirect loop"
- **Nguyên nhân**: Auth store không sync với backend
- **Giải pháp**: Clear localStorage và login lại

### Lỗi: "Sidebar không hiện"
- **Nguyên nhân**: Layout chưa được apply
- **Giải pháp**: Kiểm tra file `layout.tsx` trong folder `(role)`

### Lỗi: "404 Not Found"
- **Nguyên nhân**: Route không tồn tại
- **Giải pháp**: Kiểm tra cấu trúc folder trong `app/`

---

## 📝 Quick Start Checklist

- [ ] Backend đang chạy (`npm run start:dev` trong `backend/`)
- [ ] Frontend đang chạy (`npm run dev` trong `frontend/`)
- [ ] Database đã migrate (`npx prisma migrate dev` trong `backend/`)
- [ ] Có ít nhất 1 user cho mỗi role để test
- [ ] Browser console không có lỗi

---

## 🎯 Direct URLs

Sau khi login, bạn có thể truy cập trực tiếp:

### Customer:
- `http://localhost:3001/search`
- `http://localhost:3001/bookings`
- `http://localhost:3001/messages`

### Girl:
- `http://localhost:3001/profile`
- `http://localhost:3001/bookings`
- `http://localhost:3001/service-packages`
- `http://localhost:3001/earnings`

### Admin:
- `http://localhost:3001/admin/dashboard`
- `http://localhost:3001/admin/users`
- `http://localhost:3001/admin/content-approval`

---

**Lưu ý**: Tất cả routes đều được protect, nên cần login trước!

