# Crawler Module

Module để crawl dữ liệu từ website gaigu1.net/gai-goi

## Tính năng

- ✅ Crawl danh sách girls từ trang listing
- ✅ Crawl thông tin chi tiết từ trang detail
- ✅ Tự động lưu vào database
- ✅ Tự động tạo districts nếu chưa có
- ✅ Tránh duplicate (kiểm tra theo tên)
- ✅ Crawl đầy đủ thông tin: name, images, bio, location, rating, verified, tags, age, price

## API Endpoints

### 1. Test Crawler
```bash
GET /api/crawler/test
```
Test kết nối và crawl thử 10 girls đầu tiên

### 2. Crawl Single Page
```bash
POST /api/crawler/crawl
Authorization: Bearer {admin_token}
Content-Type: application/json

{
  "page": 1,
  "limit": 60,
  "crawlDetails": false
}
```

### 3. Crawl Multiple Pages
```bash
POST /api/crawler/crawl-multiple
Authorization: Bearer {admin_token}
Content-Type: application/json

{
  "startPage": 1,
  "endPage": 5
}
```

### 4. Close Browser
```bash
POST /api/crawler/close
Authorization: Bearer {admin_token}
```

## Thông tin được crawl

- **Name**: Tên girl
- **Images**: Tất cả ảnh trong card/detail page
- **Bio**: Mô tả/giới thiệu
- **Location**: Địa điểm/quận huyện
- **Province**: Tỉnh thành
- **Rating**: Điểm đánh giá
- **Total Reviews**: Số lượng đánh giá
- **Verified**: Trạng thái xác thực
- **Tags**: Hashtags
- **Age**: Tuổi (nếu có)
- **Price**: Giá (nếu có)
- **Is Available**: Trạng thái online/available
- **Detail URL**: Link đến trang chi tiết

## Cách sử dụng

### Cách 1: Dùng Script (Khuyến nghị)

#### Windows:
```bash
cd backend
npm run crawl          # Crawl page 1, 60 items
npm run crawl 1        # Crawl page 1, 60 items
npm run crawl 1 60     # Crawl page 1, 60 items
npm run crawl 1 60 5   # Crawl pages 1 to 5
```

#### Linux/Mac:
```bash
cd backend
chmod +x scripts/crawl.sh
./scripts/crawl.sh          # Crawl page 1, 60 items
./scripts/crawl.sh 1        # Crawl page 1, 60 items
./scripts/crawl.sh 1 60     # Crawl page 1, 60 items
./scripts/crawl.sh 1 60 5   # Crawl pages 1 to 5
```

### Cách 2: Dùng API (Cần đăng nhập ADMIN)

#### 1. Đăng nhập với tài khoản ADMIN
```bash
POST /api/auth/login
{
  "email": "admin@example.com",
  "password": "password"
}
```

#### 2. Crawl trang đầu tiên (60 girls)
```bash
POST /api/crawler/crawl
Headers: {
  "Authorization": "Bearer {accessToken}"
}
Body: {
  "page": 1,
  "limit": 60
}
```

#### 3. Crawl nhiều trang
```bash
POST /api/crawler/crawl-multiple
Headers: {
  "Authorization": "Bearer {accessToken}"
}
Body: {
  "startPage": 1,
  "endPage": 10
}
```

#### 4. Test crawler (không cần crawl thật)
```bash
GET /api/crawler/test
Headers: {
  "Authorization": "Bearer {accessToken}"
}
```

## Lưu ý

- ⚠️ Crawler cần quyền ADMIN
- ⚠️ Có delay giữa các requests để tránh rate limiting
- ⚠️ Browser sẽ được giữ mở để tối ưu performance
- ⚠️ Nên đóng browser sau khi crawl xong bằng endpoint `/crawler/close`
- ⚠️ Crawl detail pages sẽ chậm hơn nhưng có nhiều thông tin hơn

## Troubleshooting

### Lỗi "Executable doesn't exist"
```bash
cd backend
npx playwright install chromium
```

### Crawl không tìm thấy data
- Website có thể đã thay đổi cấu trúc HTML
- Cần cập nhật selectors trong `crawler.service.ts`

### Browser không đóng
- Gọi endpoint `/crawler/close` để đóng browser thủ công

