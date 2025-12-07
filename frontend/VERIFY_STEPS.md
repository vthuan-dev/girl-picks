# 📝 Hướng dẫn Verify Google Search Console - Bước từng bước

## Bước hiện tại: Chọn HTML tag method

### 1. Trong Google Search Console:
- Click vào **"HTML tag"** (ở phần "Other verification methods")
- Bạn sẽ thấy một meta tag như:
  ```html
  <meta name="google-site-verification" content="ABC123XYZ..." />
  ```

### 2. Copy code verification:
- Copy phần code trong `content="..."` 
- Ví dụ: Nếu là `content="20b3f3f73b280cf8"` → Copy: `20b3f3f73b280cf8`

### 3. Mở file: `frontend/src/app/layout.tsx`

### 4. Tìm dòng 70:
```typescript
// google: 'your-google-verification-code-here',
```

### 5. Thay bằng (bỏ dấu // và thêm code của bạn):
```typescript
google: 'PASTE_CODE_HERE', // Code từ Google Search Console
```

**Ví dụ:**
```typescript
verification: {
  google: '20b3f3f73b280cf8', // Code của bạn
},
```

### 6. Save file và deploy lại website

### 7. Quay lại Google Search Console → Click **"VERIFY"**

✅ Nếu thành công, bạn sẽ vào được dashboard!

---

## ⚠️ Lưu ý:
- Code verification chỉ là một chuỗi ký tự, không có dấu ngoặc kép
- Đảm bảo website đã được deploy trước khi verify
- Nếu lỗi, kiểm tra lại code đã đúng chưa

