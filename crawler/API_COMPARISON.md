# So sánh các API xóa watermark/logo

## Yêu cầu: ~$20 cho 10,000 ảnh ($0.002/ảnh)

### 1. **Pixian.AI** ⭐ (GẦN NHẤT)
- **Giá**: $0.0023/ảnh (cho ảnh 2MP)
- **10,000 ảnh**: ~$23 (gần với yêu cầu $20)
- **Website**: https://vi.pixian.ai/pricing
- **API**: Có (đã implement script Python)
- **API Docs**: https://vi.pixian.ai/api
- **Endpoint**: `https://api.pixian.ai/api/v2/remove-background`
- **Authentication**: Basic Auth (API Key + Secret)
- **Ưu điểm**: 
  - Giá rẻ nhất trong các option có API
  - Có API đầy đủ, dễ tích hợp
- **Nhược điểm**: 
  - **Đây là API xóa NỀN, KHÔNG PHẢI xóa watermark/logo**
  - Giá phụ thuộc vào kích thước ảnh (megapixel)
  - Chỉ phù hợp nếu watermark ở nền ảnh

### 2. **WatermarkRemover.io**
- **Giá**: $139.99 cho 12,000 credits = $0.0117/ảnh
- **10,000 ảnh**: ~$117
- **Website**: https://www.watermarkremover.io/vi/pricing
- **API**: Có
- **Nhược điểm**: Đắt hơn nhiều so với yêu cầu

### 3. **Erase.bg**
- **Giá**: $30 cho 1,000 credits = $0.03/ảnh
- **10,000 ảnh**: ~$300
- **Website**: https://www.erase.bg/vi/pricing
- **API**: Có
- **Nhược điểm**: Đắt nhất

### 4. **Dewatermark.AI** (hiện tại)
- **Giá**: 1 credit = 1 ảnh
- **10,000 ảnh**: Cần 10,000 credits
- **Website**: https://dewatermark.ai/vi/api-pricing
- **API**: Có (đã implement)
- **Nhược điểm**: Giá không rõ, có thể đắt

### 5. **PicWish**
- **Giá**: Không công khai, cần liên hệ
- **Website**: https://picwish.com/vn/image-watermark-removal-api
- **API**: Có
- **Ưu điểm**: Có thể có giá tùy chỉnh cho số lượng lớn

### 6. **SnapEdit**
- **Giá**: Không công khai, cần liên hệ
- **Website**: https://snapedit.app/vi/api-pricing
- **API**: Có
- **Ưu điểm**: Có thể có giá tùy chỉnh

### 7. **Supawork.ai** ⭐ (MỚI - HỨA HẸN)
- **Giá**: Không công khai, tự nhận "giá thấp nhất trên thị trường"
- **Website**: https://supawork.ai/vi/api-doc
- **API**: Có (Sora2 Pro - Công cụ xóa watermark)
- **Ưu điểm**: 
  - Tự nhận là giá thấp nhất
  - Có API đầy đủ
- **Nhược điểm**: 
  - Giá không công khai, cần liên hệ
  - Chưa rõ giá cụ thể

### 8. **Kaze.ai**
- **Giá**: Không công khai, cần liên hệ
- **Website**: https://kaze.ai/vi/watermark-removal
- **API**: Có
- **Ưu điểm**: Có thể có giá tốt cho số lượng lớn
- **Nhược điểm**: Giá không công khai

### 9. **PicWish** (Có free trial)
- **Giá**: 50 credits miễn phí khi đăng ký, sau đó cần liên hệ
- **Website**: https://picwish.com/vn/image-watermark-removal-api
- **API**: Có
- **Ưu điểm**: 
  - Có 50 credits miễn phí để test
  - Có thể có giá tùy chỉnh cho số lượng lớn
- **Nhược điểm**: Giá không công khai

### 10. **Dewatermark.AI** (Có free daily)
- **Giá**: 3 credits miễn phí mỗi ngày (~1,095 ảnh/năm)
- **Website**: https://dewatermark.ai/vi/api-pricing
- **API**: Có (đã implement)
- **Ưu điểm**: 
  - Có 3 credits miễn phí mỗi ngày
  - Đã có script Python sẵn
- **Nhược điểm**: 
  - Giá không công khai cho số lượng lớn
  - Free chỉ đủ test, không đủ cho production

## Kết luận

### Option tốt nhất hiện tại:

1. **Pixian.AI** - ~$23 cho 10,000 ảnh (NHƯNG chỉ xóa nền, không xóa watermark)
2. **Supawork.ai** - Cần liên hệ để biết giá (tự nhận giá thấp nhất)
3. **PicWish** - Có 50 credits free để test, sau đó liên hệ
4. **Dewatermark.AI** - Đã có script, có 3 credits free/ngày

### Khuyến nghị:

1. **Test miễn phí trước**: 
   - PicWish: 50 credits free
   - Dewatermark.AI: 3 credits/ngày free
   
2. **Liên hệ để thương lượng giá**:
   - Supawork.ai (tự nhận giá thấp nhất)
   - PicWish
   - Kaze.ai
   - Dewatermark.AI (cho số lượng lớn)

3. **Lưu ý**: 
   - Giá $0.002/ảnh ($20 cho 10,000 ảnh) là rất thấp, khó tìm được dịch vụ nào đáp ứng chính xác
   - Có thể liên hệ trực tiếp các nhà cung cấp để thương lượng giá cho số lượng lớn
   - Cân nhắc tự host model AI nếu có nhiều ảnh cần xử lý thường xuyên

