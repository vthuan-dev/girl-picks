# Crawler Chat Sex - gaigu1.net

## Mô Tả

Crawler để lấy dữ liệu từ trang chat-sex của gaigu1.net:
1. **Listing Crawler**: Lấy tất cả link gái chat sex từ các trang listing
2. **Detail Crawler**: Lấy thông tin chi tiết của từng gái chat sex

## Cách Sử Dụng

### Bước 1: Crawl Listing (Lấy Tất Cả Links)

```bash
cd crawler
python chat_sex_listing_crawler.py
```

**Kết quả:**
- File JSON: `data/chat_sex_links_YYYYMMDD_HHMMSS.json`
- File TXT: `data/chat_sex_links_YYYYMMDD_HHMMSS.txt`

### Bước 2: Crawl Details (Lấy Thông Tin Chi Tiết)

```bash
python chat_sex_detail_crawler.py
```

**Kết quả:**
- File tổng hợp: `data/chat_sex_details_all_YYYYMMDD_HHMMSS.json`
- File từng gái: `data/chat_sex_details/chat_sex_*.json`

## Cấu Trúc Dữ Liệu

### Listing Output
```json
[
  "https://gaigu1.net/chat-sex/12345/gai-chat-1",
  "https://gaigu1.net/chat-sex/12346/gai-chat-2",
  ...
]
```

### Detail Output
```json
{
  "url": "https://gaigu1.net/chat-sex/12345/gai-chat-1",
  "title": "Gái Chat Sex - Tên Gái",
  "name": "Tên Gái",
  "age": 25,
  "location": "Hà Nội",
  "price": "500k",
  "description": "Mô tả chi tiết...",
  "images": [
    "https://gaigu1.net/media/chat/12345/1.jpg",
    ...
  ],
  "phone": "0123456789",
  "zalo": "zalo_id",
  "telegram": "@telegram_id",
  "services": ["Chat video", "Chat audio", ...],
  "workingHours": "24/7",
  "verified": true,
  "rating": 4.5,
  "viewCount": 1234,
  "tags": ["tag1", "tag2", ...],
  "crawled_at": "2024-12-12T10:30:00",
  "total_images": 5
}
```

## Tùy Chỉnh

### Thay Đổi Delay
```python
crawler = ChatSexListingCrawler(
    delay_min=1.0,  # Delay tối thiểu (giây)
    delay_max=2.5,  # Delay tối đa (giây)
    headless=False  # True = ẩn browser, False = hiện browser
)
```

### Giới Hạn Số Trang
```python
# Chỉ crawl 10 trang đầu
links = await crawler.crawl_all_pages(base_url, max_pages=10)
```

## Lưu Ý

- Crawler sử dụng Playwright, cần cài đặt: `pip install playwright`
- Chạy `playwright install chromium` lần đầu
- Delay giữa các request để tránh bị block
- Có thể cần điều chỉnh selectors nếu website thay đổi cấu trúc

## Xử Lý Lỗi

- Nếu không tìm thấy links: Kiểm tra selectors trong `extract_chat_sex_links_from_page()`
- Nếu không lấy được detail: Kiểm tra selectors trong `crawl_chat_sex_detail()`
- Nếu bị block: Tăng delay hoặc thêm proxy

