# 📊 So sánh JSON Crawler vs Database Schema

## ⚠️ LƯU Ý QUAN TRỌNG:
**Girl được xem như một vật phẩm/sản phẩm, KHÔNG phải User.**
- Girl là entity độc lập
- `userId` nên là optional (nullable)
- Không cần tạo User trước khi tạo Girl

## 🔍 Mapping giữa JSON Crawler và DB Schema

### ✅ Fields có thể map trực tiếp:

| JSON Field | DB Field | Type | Notes |
|------------|----------|------|-------|
| `name` | `name` | String? | ✅ Direct mapping |
| `age` | `age` | Int? | ✅ Direct mapping |
| `bio` | `bio` | String? | ✅ Direct mapping |
| `images` | `images` | Json (array) | ✅ Direct mapping - JSON array |
| `rating` | `ratingAverage` | Float | ⚠️ JSON: number, DB: Float |
| `totalReviews` | `totalReviews` | Int | ✅ Direct mapping |
| `views` | `viewCount` | Int | ⚠️ Field name khác |
| `verified` | `verificationStatus` | Enum | ⚠️ JSON: boolean, DB: Enum (PENDING/VERIFIED/REJECTED) |
| `isAvailable` | `isActive` | Boolean | ⚠️ Field name khác (có thể khác nghĩa) |

### ❌ Fields có trong JSON nhưng KHÔNG có trong DB:

1. **`tags`** - Array of strings
   - **Giải pháp**: Có thể lưu vào `districts` JSON hoặc tạo bảng `tags` riêng

2. **`location`** - String (e.g., "Sài Gòn/Bình Tân")
   - **Giải pháp**: Parse và lưu vào `districts` JSON array

3. **`province`** - String (e.g., "Sài Gòn")
   - **Giải pháp**: Parse và lưu vào `districts` JSON array

4. **`price`** - String (e.g., "200K")
   - **Giải pháp**: Có thể parse thành number hoặc lưu vào `bio`

5. **`detailUrl`** - String (URL)
   - **Giải pháp**: Không cần lưu, có thể generate từ `id`

6. **`phone`** - String
   - **Giải pháp**: Lưu vào User model (đã có `phone` field)

7. **`password`** - String
   - **Giải pháp**: Không nên lưu password của girl, đây là password để xem contact

8. **`birthYear`** - Number
   - **Giải pháp**: Có thể tính `age` từ `birthYear` hoặc lưu riêng

9. **`height`** - String (e.g., "160cm")
   - **Giải pháp**: Parse thành number (cm) hoặc lưu vào `bio`

10. **`weight`** - String (e.g., "52kg")
    - **Giải pháp**: Parse thành number (kg) hoặc lưu vào `bio`

11. **`measurements`** - String (e.g., "89-64-92")
    - **Giải pháp**: Parse thành array [bust, waist, hips] hoặc lưu vào `bio`

12. **`origin`** - String (e.g., "Miền Tây")
    - **Giải pháp**: Lưu vào `bio` hoặc tạo field mới

13. **`address`** - String (full address)
    - **Giải pháp**: Parse và lưu vào `districts` JSON array

14. **`workingHours`** - String (e.g., "24/24")
    - **Giải pháp**: Parse và lưu vào `timeSlots` relation

15. **`services`** - Array of strings
    - **Giải pháp**: Lưu vào `servicePackages` relation hoặc tạo bảng `services`

### ❌ Fields có trong DB nhưng KHÔNG có trong JSON:

1. **`id`** - UUID (auto-generated)
2. **`userId`** - String (cần tạo User trước)
3. **`districts`** - JSON array (cần parse từ `location`, `province`, `address`)
4. **`verificationDocuments`** - JSON array (empty by default)
5. **`verificationRequestedAt`** - DateTime (null by default)
6. **`verificationVerifiedAt`** - DateTime (null by default)
7. **`favoriteCount`** - Int (default: 0)
8. **`isFeatured`** - Boolean (default: false)
9. **`isPremium`** - Boolean (default: false)
10. **`lastActiveAt`** - DateTime (null by default)
11. **`createdAt`** - DateTime (auto-generated)
12. **`updatedAt`** - DateTime (auto-generated)

## 🔄 Transformation Logic cần thiết:

### 1. **Verification Status Mapping:**
```typescript
// JSON: verified = true/false
// DB: verificationStatus = PENDING | VERIFIED | REJECTED

const verificationStatus = json.verified 
  ? VerificationStatus.VERIFIED 
  : VerificationStatus.PENDING;
```

### 2. **Districts Parsing:**
```typescript
// Parse từ location, province, address
// Ví dụ: "Sài Gòn/Bình Tân" -> ["district-id-1", "district-id-2"]
// Cần lookup district IDs từ database
```

### 3. **Rating Mapping:**
```typescript
// JSON: rating = 5 (number)
// DB: ratingAverage = 5.0 (Float)
const ratingAverage = parseFloat(json.rating) || 0;
```

### 4. **Views Mapping:**
```typescript
// JSON: views = 13700
// DB: viewCount = 13700
const viewCount = json.views || 0;
```

### 5. **IsAvailable vs IsActive:**
```typescript
// JSON: isAvailable = true/false
// DB: isActive = true/false
// Có thể cùng nghĩa hoặc khác nghĩa (cần xác nhận)
const isActive = json.isAvailable ?? true;
```

## 📝 Đề xuất Migration Script:

```typescript
interface CrawlerGirlData {
  name: string;
  images: string[];
  tags: string[];
  isAvailable: boolean;
  location: string;
  province: string;
  rating: number;
  totalReviews: number;
  verified: boolean;
  bio: string;
  age: number;
  price: string;
  detailUrl: string;
  views: number;
  phone?: string;
  password?: string;
  birthYear?: number;
  height?: string;
  weight?: string;
  measurements?: string;
  origin?: string;
  address?: string;
  workingHours?: string;
  services: string[];
}

async function importGirlFromCrawler(
  crawlerData: CrawlerGirlData,
  userId?: string // Optional - Girl không cần User
) {
  // 1. Parse districts từ location/province/address
  const districtIds = await parseDistricts(
    crawlerData.location,
    crawlerData.province,
    crawlerData.address
  );

  // 2. Map verification status
  const verificationStatus = crawlerData.verified
    ? VerificationStatus.VERIFIED
    : VerificationStatus.PENDING;

  // 3. Combine additional info vào bio
  const enhancedBio = buildEnhancedBio(crawlerData);

  // 4. Create Girl record (as a product/item, not linked to User)
  const girl = await prisma.girl.create({
    data: {
      userId: userId || null, // Optional - Girl is independent
      name: crawlerData.name,
      age: crawlerData.age,
      bio: enhancedBio,
      districts: districtIds, // JSON array
      ratingAverage: crawlerData.rating || 0,
      totalReviews: crawlerData.totalReviews || 0,
      verificationStatus,
      viewCount: crawlerData.views || 0,
      favoriteCount: 0,
      isActive: crawlerData.isAvailable ?? true,
      images: crawlerData.images, // JSON array
      // Timestamps auto-generated
    },
  });

  // 5. Create service packages từ services array
  if (crawlerData.services?.length > 0) {
    await createServicePackages(girl.id, crawlerData.services);
  }

  // 6. Create time slots từ workingHours
  if (crawlerData.workingHours) {
    await parseAndCreateTimeSlots(girl.id, crawlerData.workingHours);
  }

  return girl;
}

function buildEnhancedBio(data: CrawlerGirlData): string {
  const parts = [data.bio];
  
  if (data.price) parts.push(`Giá: ${data.price}`);
  if (data.height) parts.push(`Chiều cao: ${data.height}`);
  if (data.weight) parts.push(`Cân nặng: ${data.weight}`);
  if (data.measurements) parts.push(`Số đo: ${data.measurements}`);
  if (data.origin) parts.push(`Xuất xứ: ${data.origin}`);
  if (data.address) parts.push(`Địa chỉ: ${data.address}`);
  
  return parts.filter(Boolean).join('\n');
}
```

## ⚠️ Lưu ý quan trọng:

1. **User phải được tạo trước** - Cần tạo User account trước khi tạo Girl profile
2. **District IDs** - Cần lookup district IDs từ database, không thể dùng tên trực tiếp
3. **Phone** - Lưu vào User model, không phải Girl model
4. **Password** - Không nên lưu password để xem contact, đây là thông tin nhạy cảm
5. **Services** - Cần tạo ServicePackage records hoặc Service relation
6. **Time Slots** - Cần parse `workingHours` và tạo TimeSlot records
7. **Tags** - Có thể lưu vào `districts` JSON hoặc tạo bảng tags riêng

## 🎯 Tóm tắt:

- **Có thể map trực tiếp**: 8 fields
- **Cần transformation**: 5 fields  
- **Không có trong DB**: 15 fields (cần xử lý đặc biệt)
- **Cần tạo trước**: User record
- **Cần parse/lookup**: Districts, Services, Time Slots

