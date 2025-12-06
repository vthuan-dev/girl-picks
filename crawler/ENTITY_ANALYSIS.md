# Phân tích cấu trúc Entity từ dữ liệu đã crawl

## Tổng quan
Mỗi entity trong file JSON đại diện cho một "girl" được crawl từ gaigu1.net/gai-goi.

## Cấu trúc Entity

```json
{
  "name": string,              // Tên của girl
  "images": string[],         // Mảng các URL ảnh
  "tags": string[],           // Mảng các tags/hashtags
  "isAvailable": boolean,     // Trạng thái có sẵn hay không
  "location": string,         // Địa điểm (quận/huyện)
  "province": string,         // Tỉnh/thành phố (có thể rỗng)
  "rating": number,           // Điểm đánh giá (0-5 hoặc số reviews)
  "totalReviews": number,     // Tổng số reviews
  "verified": boolean,        // Đã được xác minh hay chưa
  "bio": string,              // Mô tả/bio (thường rỗng trong listing)
  "age": number | null,       // Tuổi (có thể null)
  "price": string,            // Giá (ví dụ: "300K", "500K", "2500K")
  "detailUrl": string,        // URL chi tiết (có thể rỗng)
  "views": number             // Số lượt xem (mới thêm)
}
```

## Chi tiết từng thuộc tính

### 1. `name` (string)
- **Mô tả**: Tên của girl
- **Ví dụ**: 
  - "❤️MI LAN❤️DÂM NỮ XINH TRẮNG VÚ TO,TÌNH CẢM NHIỆT T"
  - "Gái Non"
  - "Bé Miu Hàng Non Tơ Hot Girl"
- **Lưu ý**: Có thể chứa emoji và ký tự đặc biệt

### 2. `images` (string[])
- **Mô tả**: Mảng các URL ảnh của girl
- **Format**: Array of strings
- **Ví dụ**: 
  ```json
  [
    "https://gaigu1.net/media/photos/tmb/1372294.jpg",
    "https://gaigu1.net/media/photos/tmb/1373071.jpg"
  ]
  ```
- **Lưu ý**: 
  - Có thể có 1 hoặc nhiều ảnh
  - URL thường có pattern: `https://gaigu1.net/media/photos/tmb/{ID}.jpg`
  - Một số entity có thể có rất nhiều ảnh (60+ ảnh) - có thể là lỗi crawl

### 3. `tags` (string[])
- **Mô tả**: Mảng các tags/hashtags liên quan
- **Ví dụ**: 
  ```json
  [
    "Tags phổ biến",
    "470  gái gọi",
    "470",
    "451  gaigu"
  ]
  ```
- **Lưu ý**: 
  - Có thể rỗng `[]`
  - Một số tags có format "số  text" (ví dụ: "470  gái gọi")
  - Có thể chứa số đơn thuần (ví dụ: "470")

### 4. `isAvailable` (boolean)
- **Mô tả**: Trạng thái có sẵn để đặt lịch hay không
- **Giá trị**: `true` hoặc `false`
- **Lưu ý**: Hầu hết các entity có giá trị `false`

### 5. `location` (string)
- **Mô tả**: Địa điểm cụ thể (quận, huyện, khu vực)
- **Ví dụ**: 
  - "Vũng Tàu"
  - "Cầu Giấy"
  - "Quận 12"
  - "Bình Tân"
  - "Thủ Dầu Một"
- **Lưu ý**: Có thể rỗng `""`

### 6. `province` (string)
- **Mô tả**: Tỉnh/thành phố
- **Ví dụ**: 
  - "Sài Gòn"
  - "" (rỗng - chưa được extract)
- **Lưu ý**: 
  - Thường rỗng trong dữ liệu hiện tại
  - Có thể được suy ra từ `location` (ví dụ: "Quận 12" → "Sài Gòn")

### 7. `rating` (number)
- **Mô tả**: Điểm đánh giá
- **Ví dụ**: 
  - `0` - Chưa có đánh giá
  - `1`, `2`, `4` - Có đánh giá
  - `18`, `26`, `29`, `53` - Có thể là số reviews thay vì rating
- **Lưu ý**: 
  - Có vẻ như đôi khi lưu số reviews thay vì rating
  - Cần kiểm tra lại logic extract

### 8. `totalReviews` (number)
- **Mô tả**: Tổng số reviews/đánh giá
- **Ví dụ**: 
  - `0` - Chưa có review
  - `1`, `2`, `4`, `9`, `11`, `18`, `26`, `29`, `53`
- **Lưu ý**: Thường khớp với `rating` trong một số trường hợp

### 9. `verified` (boolean)
- **Mô tả**: Đã được xác minh hay chưa
- **Giá trị**: `true` hoặc `false`
- **Ví dụ**: 
  - `true` - Đã được xác minh
  - `false` - Chưa được xác minh

### 10. `bio` (string)
- **Mô tả**: Mô tả/bio của girl
- **Ví dụ**: `""` (thường rỗng trong listing page)
- **Lưu ý**: 
  - Thường rỗng trong dữ liệu từ listing page
  - Có thể cần crawl detail page để lấy bio đầy đủ

### 11. `age` (number | null)
- **Mô tả**: Tuổi của girl
- **Ví dụ**: 
  - `18` - Có tuổi
  - `null` - Chưa có thông tin tuổi
- **Lưu ý**: Hầu hết các entity có giá trị `null`

### 12. `price` (string)
- **Mô tả**: Giá dịch vụ
- **Ví dụ**: 
  - "300K"
  - "500K"
  - "2500K"
  - "1200K"
  - "" (rỗng - chưa có giá)
- **Format**: Số + "K" (nghìn VNĐ)
- **Lưu ý**: Có thể rỗng `""`

### 13. `detailUrl` (string)
- **Mô tả**: URL đến trang chi tiết
- **Ví dụ**: 
  - `"https://gaigu1.net/gai-goi/31252/NEW-NON---BE-QUYNH-MOI-MAT-TRINH-CHEN-CUC-SUONG"`
  - `"https://gaigu1.net/gai-goi/sai-gon"`
  - `""` (rỗng - chưa có URL)
- **Lưu ý**: 
  - Có thể rỗng trong nhiều trường hợp
  - Format: `https://gaigu1.net/gai-goi/{ID}/{slug}` hoặc `https://gaigu1.net/gai-goi/{slug}`

### 14. `views` (number)
- **Mô tả**: Số lượt xem profile
- **Ví dụ**: 
  - `1200` (từ "1.2K")
  - `8700` (từ "8.7K")
  - `0` (chưa có views)
- **Lưu ý**: 
  - Được convert từ format "K" (ví dụ: "1.2K" → 1200)
  - Mới được thêm vào entity structure

## Ví dụ Entity đầy đủ

```json
{
  "name": "❤️MI LAN❤️DÂM NỮ XINH TRẮNG VÚ TO,TÌNH CẢM NHIỆT T",
  "images": [
    "https://gaigu1.net/media/photos/tmb/1372294.jpg"
  ],
  "tags": [],
  "isAvailable": false,
  "location": "Vũng Tàu",
  "province": "",
  "rating": 2,
  "totalReviews": 2,
  "verified": false,
  "bio": "",
  "age": null,
  "price": "300K",
  "detailUrl": ""
}
```

## Vấn đề cần cải thiện

1. **Duplicate data**: Có nhiều entity trùng lặp (cùng name, images)
2. **Invalid data**: Một số entity có name là "Sài Gòn", "Tags phổ biến" - không phải tên girl
3. **Missing data**: 
   - `province` thường rỗng
   - `bio` thường rỗng
   - `age` thường null
   - `detailUrl` thường rỗng
4. **Image pollution**: Một số entity có quá nhiều ảnh (60+) - có thể là lỗi crawl từ sidebar/tags section
5. **Rating confusion**: `rating` đôi khi lưu số reviews thay vì điểm rating

## Đề xuất cải thiện

1. **Filter duplicates**: Loại bỏ các entity trùng lặp
2. **Validate data**: 
   - Loại bỏ entity có name không hợp lệ (ví dụ: "Sài Gòn", "Tags phổ biến")
   - Validate images (chỉ lấy ảnh trong card, không lấy từ sidebar)
3. **Improve extraction**:
   - Cải thiện extract `province` từ `location`
   - Crawl detail page để lấy `bio`, `age` đầy đủ
   - Đảm bảo extract đúng `detailUrl`
4. **Fix rating**: Phân biệt rõ `rating` (điểm) và `totalReviews` (số lượng)

