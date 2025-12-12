# Hướng Dẫn Import Chat Sex Data

## Cách Sử Dụng

### Bước 1: Lấy JWT Token

Đăng nhập vào admin panel và lấy token từ browser DevTools (Application > Cookies > token) hoặc từ API response.

### Bước 2: Chạy Script Import

```bash
cd crawler

# Dry run (kiểm tra dữ liệu trước khi import)
python import_chat_sex_to_db.py \
  --file data/chat_sex_details_all_20251212_084435.json \
  --token YOUR_JWT_TOKEN \
  --dry-run

# Import thực sự
python import_chat_sex_to_db.py \
  --file data/chat_sex_details_all_20251212_084435.json \
  --api-url http://localhost:3000/api/chat-sex \
  --token YOUR_JWT_TOKEN \
  --batch-size 10
```

## Tham Số

- `--file, -f`: Đường dẫn đến file JSON (bắt buộc)
- `--api-url`: URL API (mặc định: `http://localhost:3000/api/chat-sex`)
- `--token`: JWT token để authenticate (bắt buộc)
- `--batch-size`: Số lượng items import mỗi batch (mặc định: 10)
- `--dry-run`: Chạy thử không import thực sự

## Lưu Ý

- Script sẽ tự động filter các tags không hợp lệ (Color, Transparency, etc.)
- Dữ liệu không có name sẽ bị bỏ qua
- Import theo batch để tránh quá tải server
- Có thể import lại nếu lỗi (sẽ skip duplicate nếu có unique constraint)

## Troubleshooting

### Lỗi 401 Unauthorized
- Kiểm tra token có hợp lệ không
- Đảm bảo token chưa hết hạn
- Kiểm tra user có quyền ADMIN hoặc STAFF_UPLOAD

### Lỗi 500 Internal Server Error
- Kiểm tra backend đang chạy
- Kiểm tra database connection
- Xem logs backend để biết lỗi cụ thể

### Import chậm
- Giảm `--batch-size` xuống 5 hoặc 3
- Kiểm tra network connection
- Kiểm tra server performance

