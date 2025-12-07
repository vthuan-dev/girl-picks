# 🚀 Hướng dẫn nhanh: Đưa website lên Google Index

## Bước 1: Đăng ký Google Search Console (5 phút)

1. Vào: https://search.google.com/search-console
2. Click **"Add Property"**
3. **Chọn "URL prefix"** (khuyến nghị - dễ verify hơn)
4. Nhập: `https://gaigu1.net` (không có www, không có dấu / ở cuối)
5. Click **"CONTINUE"**

## Bước 2: Verify Website (10 phút)

### Cách nhanh nhất: HTML Tag

1. Google sẽ hiển thị một meta tag:
   ```html
   <meta name="google-site-verification" content="ABC123XYZ..." />
   ```

2. Mở file: `frontend/src/app/layout.tsx`

3. Tìm dòng:
   ```typescript
   verification: {
     // google: 'your-google-verification-code-here',
   },
   ```

4. Thay bằng:
   ```typescript
   verification: {
     google: 'ABC123XYZ...', // Paste code từ Google
   },
   ```

5. Deploy lại website

6. Quay lại Google Search Console → Click **"Verify"**

✅ Nếu thành công, bạn sẽ thấy dashboard của Google Search Console!

## Bước 3: Submit Sitemap (2 phút)

1. Trong Google Search Console, click **"Sitemaps"** (menu bên trái)
2. Nhập: `sitemap.xml`
3. Click **"Submit"**
4. Đợi vài phút, status sẽ hiển thị **"Success"**

## Bước 4: Kiểm tra Index (1 phút)

1. Vào **"URL Inspection"** (thanh tìm kiếm trên cùng)
2. Nhập: `https://gaigu1.net`
3. Click **"Test Live URL"**
4. Nếu thấy **"URL is on Google"** = ✅ Đã index!

Hoặc tìm trên Google: `site:gaigu1.net`

## ⏱️ Timeline

- **Verify website**: Ngay lập tức
- **Submit sitemap**: Vài phút
- **Google crawl**: 1-7 ngày
- **Index hoàn toàn**: 1-4 tuần

## 🔍 Kiểm tra tiến độ

1. Vào Google Search Console → **"Pages"**
2. Xem số lượng pages đã được index
3. Xem các lỗi (nếu có) và fix

## ⚠️ Lưu ý quan trọng

- ✅ Website phải đã deploy và có thể truy cập được
- ✅ Sitemap phải accessible tại: `https://gaigu1.net/sitemap.xml`
- ✅ Robots.txt không chặn các trang quan trọng
- ✅ Đợi ít nhất 1 tuần để Google crawl và index

## 🆘 Gặp vấn đề?

Xem file chi tiết: `SEO_GOOGLE_INDEX_GUIDE.md`

---

**Chúc bạn thành công! 🎉**

