# Python Crawler cho gaigu1.net

Crawler Python để crawl dữ liệu từ gaigu1.net/gai-goi và lưu vào file JSON

## Chiến lược Crawl

Crawler hoạt động theo 2 giai đoạn:

1. **Giai đoạn 1: Crawl Listing Pages** - Lấy danh sách girls với `detailUrl`
2. **Giai đoạn 2: Crawl Detail Pages** - Dùng `detailUrl` để crawl thông tin chi tiết

Xem chi tiết: [CRAWL_STRATEGY.md](./CRAWL_STRATEGY.md)

## Cài đặt

### 1. Cài đặt Python dependencies
```bash
cd crawler
pip install -r requirements.txt
```

### 2. Cài đặt Playwright browsers
```bash
playwright install chromium
```

## Sử dụng

### 🚀 Chế độ tự động (1 lần chạy - khuyến nghị)

Tự động crawl listing + detail trong 1 lần chạy:

```bash
# Crawl tất cả listing + detail tự động
python main.py --auto --save-individual

# Crawl tối đa 10 trang listing + detail
python main.py --auto --save-individual 10

# Tùy chỉnh concurrent và delay
python main.py --auto --save-individual --concurrent 5 --delay-min 1 --delay-max 3

# Crawl theo batch (an toàn hơn)
python main.py --auto --save-individual --batch-size 20
```

**Workflow tự động:**
1. Crawl tất cả listing pages → Lưu vào `data/listing_*.json`
2. Tự động crawl detail cho tất cả girls → Lưu vào `data/details/TEN_GAI.json`

### 🎯 Chiến lược thủ công (2 giai đoạn)

#### Giai đoạn 1: Crawl tất cả listing pages
```bash
# Crawl tất cả trang (tự động detect)
python main.py --all-listing

# Crawl tối đa 10 trang
python main.py --all-listing 10
```

Kết quả: File `data/listing_YYYYMMDD_HHMMSS.json` chứa danh sách tất cả girls với `detailUrl`

#### Giai đoạn 2: Crawl detail từ file listing (lưu riêng từng file)
```bash
# Mặc định: 3 concurrent, delay 2-5s
python main.py --detail-from-file "data/listing_20251206_120000.json" --save-individual

# Tùy chỉnh: 5 concurrent, delay 1-3s
python main.py --detail-from-file "data/listing_20251206_120000.json" --save-individual --concurrent 5 --delay-min 1 --delay-max 3

# Crawl theo batch (an toàn hơn, tránh bị block)
python main.py --detail-from-file "data/listing_20251206_120000.json" --save-individual --batch-size 20
```

Kết quả: Mỗi gái được lưu vào file riêng trong `data/details/` với tên là tên gái (ví dụ: `Yen_Nhi_Hang_Moi_Cho_Anh_Em.json`)

**Lưu ý về rate limiting:**
- `--concurrent N`: Số requests đồng thời (mặc định: 3, khuyến nghị: 3-5)
- `--delay-min X --delay-max Y`: Delay ngẫu nhiên giữa các requests (giây)
- `--batch-size N`: Crawl theo batch, mỗi batch N girls (an toàn hơn)

---

### 📋 Các mode khác

#### Crawl listing only (chỉ lấy danh sách với detailUrl)
```bash
python main.py              # Trang 1, 60 items
python main.py 1            # Trang 1, 60 items
python main.py 1 5          # Trang 1 đến 5
```

#### Crawl listing + detail (đầy đủ thông tin, lưu vào 1 file)
```bash
python main.py --detail     # Trang 1, crawl cả detail
python main.py 1 --detail   # Trang 1, crawl cả detail
python main.py 1 5 --detail # Trang 1-5, crawl cả detail
```

#### Crawl listing + detail (lưu riêng từng file)
```bash
python main.py 1 5 --detail --save-individual
```

#### Test crawl 1 detail URL cụ thể
```bash
python test_detail.py "https://gaigu1.net/gai-goi/30725/..."
```

## Lưu dữ liệu

### File listing (danh sách)
- `data/listing_YYYYMMDD_HHMMSS.json` - Danh sách girls từ listing pages

### File detail (chi tiết)
- **Lưu chung**: `data/crawled_girls_YYYYMMDD_HHMMSS.json` - Tất cả girls trong 1 file
- **Lưu riêng**: `data/details/TEN_GAI.json` - Mỗi gái 1 file (tên file = tên gái đã sanitize)

## Thông tin được crawl

### Từ Listing Page:
- ✅ Name, 1 thumbnail image
- ✅ Location, Province
- ✅ Price
- ✅ Rating, Reviews
- ✅ Views
- ✅ **Detail URL** (quan trọng!)

### Từ Detail Page (khi dùng `--detail`):
- ✅ **Tất cả ảnh** từ gallery (15-20+ ảnh)
- ✅ Phone, Password
- ✅ Birth Year, Age
- ✅ Height, Weight, Measurements (3 vòng)
- ✅ Origin (Xuất xứ)
- ✅ Address (Địa chỉ)
- ✅ Working Hours (Làm việc)
- ✅ Services (Dịch vụ)
- ✅ Bio/Description

