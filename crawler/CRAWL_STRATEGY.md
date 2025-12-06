# Chiến lược Crawl Data

## Tổng quan

Chiến lược crawl được chia thành 2 giai đoạn:

1. **Giai đoạn 1: Crawl Listing Pages** - Lấy danh sách tất cả girls với URL detail
2. **Giai đoạn 2: Crawl Detail Pages** - Dùng URL từ giai đoạn 1 để crawl thông tin chi tiết

---

## Giai đoạn 1: Crawl Listing Pages

### Mục tiêu
- Crawl tất cả các trang listing (`/gai-goi`, `/gai-goi?page=2`, ...)
- Extract thông tin cơ bản từ mỗi card:
  - Name
  - Detail URL (quan trọng nhất!)
  - 1 ảnh thumbnail
  - Location, Province
  - Price
  - Rating, Reviews
  - Views

### Cấu trúc HTML
```html
<div class="list-escorts">
  <a href="/gai-goi/31871/Be-Miu-Hang-Non-To-Hot-girl">
    <img src="..." class="img-escort-res">
  </a>
  <span class="content-title">Bé Miu Hàng Non Tơ Hot Girl</span>
  <span class="es-city"><a href="...">Quận 12</a></span>
  <span class="left-price">600K</span>
  <span class="content-rating">...</span>
  <span class="viewed-in">1.2K</span>
</div>
```

### Selector
- Cards: `div.list-escorts`
- Name: `.content-title`
- Detail URL: `a[href*="/gai-goi/"]`
- Image: `img.img-escort-res`
- Location: `.es-city a`
- Price: `.left-price`
- Rating: `.content-rating`
- Views: `.viewed-in`

### Output
File JSON chứa danh sách girls với `detailUrl`:
```json
[
  {
    "name": "...",
    "detailUrl": "https://gaigu1.net/gai-goi/31871/...",
    "images": ["..."],
    "location": "...",
    "price": "...",
    ...
  }
]
```

---

## Giai đoạn 2: Crawl Detail Pages

### Mục tiêu
- Đọc file JSON từ Giai đoạn 1
- Với mỗi `detailUrl`, crawl thông tin chi tiết:
  - **Tất cả ảnh** từ gallery
  - **Thông tin đầy đủ**: Phone, Password, Birth Year, Height, Weight, Measurements, Origin, Address, Working Hours, Services
  - Bio/Description
  - Rating, Reviews chi tiết

### Cấu trúc HTML
- **Gallery Images**: XPath `/html/body/div[7]/div[3]`
- **Attributes**: XPath `/html/body/div[5]/div[6]/div[3]/div[1]/div[2]`
  - Giá, SĐT, Pass, Năm sinh, Chiều cao, Cân nặng, Số đo 3 vòng, Xuất xứ, Khu vực, Địa chỉ, Làm việc, Dịch vụ

### Process
1. Đọc file JSON từ Giai đoạn 1
2. Với mỗi girl có `detailUrl`:
   - Gọi `crawl_girl_detail(detailUrl)`
   - Merge thông tin detail vào data của girl
   - Delay 2-3 giây giữa các request để tránh bị block
3. Lưu kết quả vào file JSON mới

### Output
File JSON chứa girls với đầy đủ thông tin:
```json
[
  {
    "name": "...",
    "images": ["...", "...", ...], // Tất cả ảnh
    "phone": "...",
    "password": "...",
    "birthYear": 2005,
    "age": 20,
    "height": "158cm",
    "weight": "46kg",
    "measurements": "85-60-90",
    "origin": "Miền Bắc",
    "address": "...",
    "workingHours": "24/24",
    "services": ["Qua đêm", "Hôn môi", ...],
    ...
  }
]
```

---

## Workflow

### Option 1: Crawl tuần tự (hiện tại)
```
Listing Page 1 → Extract 60 girls → Crawl detail từng girl → Lưu
Listing Page 2 → Extract 60 girls → Crawl detail từng girl → Lưu
...
```

**Ưu điểm**: Đơn giản, dễ debug
**Nhược điểm**: Chậm (phải đợi detail xong mới sang trang tiếp)

### Option 2: Crawl 2 giai đoạn riêng biệt (khuyến nghị)
```
Giai đoạn 1:
  Listing Page 1 → Extract 60 girls → Lưu vào file A
  Listing Page 2 → Extract 60 girls → Lưu vào file A
  ...
  → File A: Danh sách tất cả girls với detailUrl

Giai đoạn 2:
  Đọc file A → Với mỗi detailUrl → Crawl detail → Merge → Lưu vào file B
  → File B: Danh sách girls với đầy đủ thông tin
```

**Ưu điểm**: 
- Nhanh hơn (crawl listing nhanh, không phải đợi detail)
- Có thể retry crawl detail nếu lỗi
- Có thể crawl detail theo batch
- Dễ monitor progress

**Nhược điểm**: Cần 2 lần chạy

---

## Implementation

### Hiện tại (main.py)
- `crawl_girls_list()`: Crawl listing page
- `crawl_girl_detail()`: Crawl detail page
- `crawl_and_save()`: Crawl listing + detail (nếu `crawl_details=True`)

### Cải thiện đề xuất
1. **Tách riêng 2 mode**:
   - Mode 1: `--listing-only` - Chỉ crawl listing, lưu detailUrl
   - Mode 2: `--detail-only <file>` - Đọc file listing, crawl detail
   - Mode 3: `--full` - Crawl listing + detail (như hiện tại)

2. **Batch processing**:
   - Crawl detail theo batch (ví dụ: 10 girls/batch)
   - Retry mechanism nếu lỗi
   - Progress tracking

3. **Resume capability**:
   - Lưu checkpoint để có thể resume nếu bị gián đoạn
   - Skip những girls đã crawl detail rồi

---

## Best Practices

1. **Rate Limiting**:
   - Delay 2-3 giây giữa các detail page
   - Delay 5 giây giữa các listing page

2. **Error Handling**:
   - Retry 3 lần nếu lỗi
   - Log lỗi để debug
   - Continue với girl tiếp theo nếu 1 girl lỗi

3. **Data Validation**:
   - Kiểm tra name không phải "Sài Gòn", "Tags phổ biến"
   - Validate images URL
   - Validate detailUrl format

4. **Storage**:
   - Lưu file JSON theo timestamp
   - Backup file trước khi merge
   - Có thể lưu vào database sau

