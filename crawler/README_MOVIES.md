# Crawler Phim Sex

Crawler để crawl phim sex từ `gaigu1.net/phim-sex`

## Cài đặt

Đã có sẵn trong project, không cần cài thêm gì.

## Sử dụng

### Crawl trang 1 (mặc định, 60 phim)
```bash
cd crawler
python movie_crawler.py
```

### Crawl trang cụ thể
```bash
python movie_crawler.py 1        # Trang 1
python movie_crawler.py 2        # Trang 2
```

### Crawl nhiều trang
```bash
python movie_crawler.py 1 5      # Trang 1 đến 5
```

### Crawl tất cả trang (tự động)
```bash
python movie_crawler.py --auto   # Crawl tất cả trang
python movie_crawler.py --all    # Tương tự --auto
python movie_crawler.py --auto 10  # Crawl tối đa 10 trang
```

## Lưu dữ liệu

Dữ liệu sẽ được lưu tự động vào file JSON trong thư mục `crawler/data/` với tên file:
- `crawled_movies_YYYYMMDD_HHMMSS.json` - Khi crawl 1 trang
- `listing_movies_YYYYMMDD_HHMMSS.json` - Khi crawl nhiều trang (--auto)

## Thông tin được crawl

- ✅ Title (Tiêu đề phim)
- ✅ Thumbnail (Ảnh thumbnail)
- ✅ Duration (Thời lượng, ví dụ: "02:20")
- ✅ Views (Lượt xem, ví dụ: 1800, 35200)
- ✅ Rating (Đánh giá, ví dụ: "100%")
- ✅ Detail URL (Link đến trang chi tiết)
- ✅ Category (Thể loại, nếu có)

## Ví dụ dữ liệu

### Từ Listing Page:
```json
{
  "title": "Em hàng thích cưỡi ngựa",
  "thumbnail": "https://gaigu1.net/media/...",
  "duration": "02:20",
  "views": 1800,
  "rating": "100%",
  "detailUrl": "https://gaigu1.net/phim-sex/12345/...",
  "category": ""
}
```

### Từ Detail Page (sau khi crawl detail):
```json
{
  "title": "Em hàng thích cưỡi ngựa",
  "thumbnail": "https://gaigu1.net/media/...",
  "duration": "02:20",
  "views": 1800,
  "rating": "100%",
  "detailUrl": "https://gaigu1.net/phim-sex/12345/...",
  "videoUrl": "https://gaigu1.net/media/videos/h264/77759_SD.mp4",
  "videoSources": [
    {
      "url": "https://gaigu1.net/media/videos/h264/77759_SD.mp4",
      "type": "video/mp4",
      "label": "SD",
      "resolution": "360"
    }
  ],
  "poster": "https://gaigu1.net/media/videos/tmb2/77759/default.jpg",
  "description": "...",
  "tags": ["..."]
}
```

## Workflow khuyến nghị

### Bước 1: Crawl listing (lấy danh sách với detailUrl)
```bash
python movie_crawler.py --all
```

### Bước 2: Crawl detail (lấy video URL từ detailUrl)
```bash
python movie_crawler.py --detail-from-file "data/listing_movies_20251206_120000.json" --save-individual
```

### Hoặc tự động cả 2 bước:
```bash
python movie_crawler.py --auto --save-individual
```

