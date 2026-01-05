# Hướng dẫn cấu hình SMTP cho tính năng Quên mật khẩu

## Vấn đề
Nếu bạn thấy lỗi `SMTP not configured` hoặc `Email service is not configured`, nghĩa là SMTP chưa được cấu hình đúng.

## Cách cấu hình

### 1. Tạo file `.env` trong thư mục `backend/`

Tạo file `.env` (nếu chưa có) trong thư mục `backend/` với nội dung:

```env
# Email Configuration (SMTP)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
SMTP_FROM=Girl Pick <noreply@girlpick.com>
```

### 2. Cấu hình Gmail App Password

Nếu bạn dùng Gmail, bạn cần:

1. **Bật 2-Step Verification** cho Gmail account
2. **Tạo App Password**:
   - Vào https://myaccount.google.com/apppasswords
   - Chọn "Mail" và "Other (Custom name)"
   - Nhập tên: "Girl Pick Backend"
   - Copy App Password (16 ký tự, có khoảng trắng)
   - Dán vào `SMTP_PASS` trong file `.env` (có thể bỏ khoảng trắng)

### 3. Cập nhật file `.env`

Thay thế các giá trị trong file `.env`:

```env
SMTP_USER=hotrogaigoi123@gmail.com
SMTP_PASS=cwvo upsa rqrt gwbe
SMTP_FROM=Gaigo1 <hotrogaigoi123@gmail.com>
```

**Lưu ý**: 
- `SMTP_PASS` phải là App Password, không phải mật khẩu Gmail thông thường
- Nếu App Password có khoảng trắng, bạn có thể bỏ khoảng trắng hoặc giữ nguyên

### 4. Restart Backend

Sau khi cập nhật `.env`, bạn **PHẢI restart backend** để load các biến môi trường mới:

```bash
# Dừng backend (Ctrl+C)
# Sau đó start lại
npm run dev
```

### 5. Kiểm tra logs

Khi backend start, bạn sẽ thấy log:

- ✅ **Nếu cấu hình đúng**: `✅ SMTP configured successfully: smtp.gmail.com:587 (user: hotrogaigoi123@gmail.com)`
- ❌ **Nếu chưa cấu hình**: `❌ SMTP credentials not configured` và các dòng log chi tiết

## Test

Sau khi cấu hình xong:

1. Restart backend
2. Thử tính năng quên mật khẩu với email có trong database
3. Kiểm tra logs để xem email có được gửi không
4. Kiểm tra hộp thư đến (và cả Spam folder) của email đó

## Troubleshooting

### Lỗi: "Invalid login"
- Kiểm tra lại App Password (không phải mật khẩu Gmail)
- Đảm bảo 2-Step Verification đã được bật

### Lỗi: "Connection timeout"
- Kiểm tra firewall/antivirus có chặn port 587 không
- Thử đổi `SMTP_PORT=465` và `SMTP_SECURE=true`

### Email không đến
- Kiểm tra Spam folder
- Kiểm tra logs xem có lỗi gì không
- Đảm bảo `FRONTEND_URL` đúng trong `.env`

