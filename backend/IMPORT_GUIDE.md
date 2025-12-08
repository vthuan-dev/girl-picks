# Hướng dẫn Import Girls từ Crawler Data

## Tổng quan

Script này import dữ liệu girls từ JSON file (crawler data) vào database với đầy đủ transform và validation.

## Đặc điểm

✅ **Girl là sản phẩm, không phải user**
- `userId: null` - Girl không liên kết với User account
- `managedById` - Set tự động với staff/admin đang import

✅ **Transform đầy đủ**
- `rating` → `ratingAverage`
- `views` → `viewCount`
- `verified: boolean` → `verificationStatus: enum` + dates
- `location`/`province` → `districts` (array of IDs)

✅ **Validation**
- Age: 18-60
- BirthYear: 1950-2010
- Rating: 0-5
- Clean và trim tất cả strings

✅ **Districts Mapping**
- Tự động tìm districts từ `location`, `province`, `address`
- Parse format: "Sài Gòn/Bình Tân" → tìm district "Bình Tân"
- Fallback: tìm theo province nếu không tìm thấy district

## Cách sử dụng

### 1. Tạo Staff User (nếu chưa có)

```bash
npm run create-staff
```

### 2. Import Girls

```bash
# Sử dụng file mặc định
npm run import-girls

# Hoặc chỉ định file JSON cụ thể
npm run import-girls -- path/to/your/file.json
```

### 3. Xem kết quả

Script sẽ hiển thị:
- Progress: `✅ Imported 10/100 girls...`
- Summary: Success/Errors count
- Manager info: Staff user đang quản lý

## Mapping chi tiết

### Direct Mapping (không transform)

| JSON Field | DB Field | Notes |
|------------|----------|-------|
| `name` | `name` | Trim whitespace |
| `age` | `age` | Validate 18-60 |
| `bio` | `bio` | Trim, nullable |
| `phone` | `phone` | Trim, nullable |
| `birthYear` | `birthYear` | Validate 1950-2010 |
| `height` | `height` | Trim, nullable |
| `weight` | `weight` | Trim, nullable |
| `measurements` | `measurements` | Trim, nullable |
| `origin` | `origin` | Trim, nullable |
| `address` | `address` | Trim, nullable |
| `location` | `location` | Trim, nullable |
| `province` | `province` | Trim, nullable |
| `price` | `price` | Trim, nullable |
| `workingHours` | `workingHours` | Trim, nullable |
| `isAvailable` | `isAvailable` | Boolean |
| `images` | `images` | Array → JSON |
| `tags` | `tags` | Array → JSON |
| `services` | `services` | Array → JSON |

### Transformations

| JSON Field | DB Field | Transformation |
|------------|----------|---------------|
| `rating` | `ratingAverage` | `rating` (0-5) → `ratingAverage` |
| `views` | `viewCount` | `views` → `viewCount` |
| `verified` | `verificationStatus` | `true` → `VERIFIED` + set dates |
| `verified` | `verificationStatus` | `false` → `PENDING` |
| `location`/`province` | `districts` | Parse → find district IDs |

### Default Values

| Field | Default | Notes |
|-------|---------|-------|
| `userId` | `null` | Girl không phải user |
| `managedById` | Staff ID | Set tự động |
| `favoriteCount` | `0` | |
| `isFeatured` | `false` | |
| `isPremium` | `false` | |
| `isActive` | `true` | |
| `verificationDocuments` | `[]` | |
| `lastActiveAt` | `now()` | |
| `createdAt` | `now()` | Auto |
| `updatedAt` | `now()` | Auto |

## Districts Mapping Logic

Script tự động tìm districts từ:

1. **Location**: Parse "Sài Gòn/Bình Tân" → tìm "Bình Tân"
2. **Address**: Tìm patterns như "Bình", "Quận", "Huyện"
3. **Province**: Fallback nếu không tìm thấy district cụ thể

**Ví dụ:**
- Input: `location: "Sài Gòn/Bình Tân"`, `province: "Sài Gòn"`
- Process:
  1. Extract "Bình Tân" từ location
  2. Tìm districts có name chứa "Bình Tân"
  3. Nếu không tìm thấy, tìm districts trong province "Sài Gòn"
  4. Return array of district IDs

## Error Handling

Script sẽ:
- ✅ Skip girls không có name
- ✅ Continue khi gặp lỗi (không dừng toàn bộ)
- ✅ Log chi tiết lỗi (duplicate, validation, etc.)
- ✅ Hiển thị summary cuối cùng

## Lưu ý

⚠️ **Duplicate Handling**
- Nếu girl đã tồn tại (same name/phone), script sẽ bỏ qua và log error
- Có thể cần xử lý duplicate logic nếu cần update thay vì skip

⚠️ **Districts**
- Script cần districts đã được tạo sẵn trong database
- Nếu không tìm thấy district, `districts` sẽ là empty array `[]`

⚠️ **Performance**
- Script import từng girl một (sequential)
- Với file lớn (>1000 girls), có thể mất vài phút
- Có thể optimize bằng batch insert nếu cần

## Example Output

```
✅ Using staff user: staff@gaigo1.net (uuid-here)
📦 Found 50 girls to import
✅ Imported 10/50 girls...
✅ Imported 20/50 girls...
✅ Imported 30/50 girls...
✅ Imported 40/50 girls...
✅ Imported 50/50 girls...

📊 Import Summary:
✅ Success: 48
❌ Errors: 2
📦 Total: 50

💡 Note: Girls are imported as products (not users)
   Managed by: staff@gaigo1.net (STAFF_UPLOAD)
```

