# Ví dụ sử dụng Crawler

## 🚀 Chế độ tự động (1 lần chạy - Đơn giản nhất)

### Crawl tất cả listing + detail tự động
```bash
python main.py --auto --save-individual
```

**Kết quả:**
- Tự động crawl tất cả listing pages
- Tự động crawl detail cho tất cả girls
- Mỗi gái được lưu vào: `data/details/TEN_GAI.json`

### Crawl với giới hạn số trang
```bash
# Chỉ crawl 10 trang đầu
python main.py --auto --save-individual 10
```

### Crawl nhanh hơn (cẩn thận rate limit)
```bash
python main.py --auto --save-individual --concurrent 5 --delay-min 1 --delay-max 3
```

### Crawl an toàn (batch mode)
```bash
python main.py --auto --save-individual --batch-size 20
```

---

## 🎯 Workflow thủ công (2 giai đoạn)

### Bước 1: Crawl tất cả listing pages
```bash
cd crawler
python main.py --all-listing
```

**Kết quả:**
- File: `data/listing_20251206_120000.json`
- Chứa: Danh sách tất cả girls với `detailUrl`
- Thời gian: Nhanh (chỉ crawl listing, không crawl detail)

### Bước 2: Crawl detail từ file listing (lưu riêng từng file)

#### An toàn (khuyến nghị):
```bash
# Mặc định: 3 concurrent, delay 2-5s
python main.py --detail-from-file "data/listing_20251206_120000.json" --save-individual
```

#### Nhanh hơn (cẩn thận rate limit):
```bash
# 5 concurrent, delay ngắn hơn
python main.py --detail-from-file "data/listing_20251206_120000.json" --save-individual --concurrent 5 --delay-min 1 --delay-max 3
```

#### Rất an toàn (crawl theo batch):
```bash
# Crawl 20 girls mỗi batch, delay 5-10s giữa các batch
python main.py --detail-from-file "data/listing_20251206_120000.json" --save-individual --batch-size 20
```

**Kết quả:**
- Mỗi gái được lưu vào: `data/details/TEN_GAI.json`
- Ví dụ:
  - `data/details/Yen_Nhi_Hang_Moi_Cho_Anh_Em.json`
  - `data/details/Be_Miu_Hang_Non_To_Hot_Girl.json`
- Thời gian: Nhanh hơn với concurrent (3-5x so với tuần tự)

---

## 📝 Các ví dụ khác

### Crawl 10 trang listing đầu tiên
```bash
python main.py --all-listing 10
```

### Crawl trang 1-5 và crawl detail luôn (lưu chung)
```bash
python main.py 1 5 --detail
```

### Crawl trang 1-5 và crawl detail luôn (lưu riêng từng file)
```bash
python main.py 1 5 --detail --save-individual
```

### Crawl detail từ file listing (lưu chung vào 1 file)
```bash
python main.py --detail-from-file "data/listing_20251206_120000.json"
```

### Test crawl 1 URL cụ thể
```bash
python test_detail.py "https://gaigu1.net/gai-goi/30725/Yen-Nhi-Hang-Moi-Cho-Anh-Em"
```

---

## 📂 Cấu trúc thư mục sau khi crawl

```
crawler/
├── data/
│   ├── listing_20251206_120000.json          # Danh sách listing
│   ├── crawled_girls_20251206_130000.json   # Tất cả detail (nếu lưu chung)
│   └── details/                             # Chi tiết từng gái (nếu lưu riêng)
│       ├── Yen_Nhi_Hang_Moi_Cho_Anh_Em.json
│       ├── Be_Miu_Hang_Non_To_Hot_Girl.json
│       └── ...
```

---

## ⚡ Tips

1. **Crawl listing trước**: Nhanh, không tốn nhiều thời gian
2. **Crawl detail sau**: Có thể retry nếu lỗi, không phải crawl lại listing
3. **Lưu riêng từng file**: Dễ quản lý, có thể xóa/update từng gái
4. **Concurrent crawling**: 
   - Mặc định: 3 concurrent (an toàn)
   - Có thể tăng lên 5-7 nếu muốn nhanh hơn
   - Không nên quá 10 (dễ bị block)
5. **Delay**: 
   - Mặc định: 2-5 giây (random)
   - Có thể giảm xuống 1-3s nếu cần nhanh
   - Không nên < 1s (dễ bị detect)
6. **Batch mode**: 
   - Dùng `--batch-size` để crawl theo batch
   - An toàn hơn, có delay giữa các batch
   - Phù hợp khi crawl số lượng lớn

