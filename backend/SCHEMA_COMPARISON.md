# So sánh Schema Database vs Crawler Data

## Schema Database (Prisma) - Model Girl

### ✅ Các field đã có sẵn và mapping được:

| DB Field | Type | JSON Field | Mapping Notes |
|----------|------|------------|---------------|
| `name` | `String?` | `name` | ✅ Trực tiếp |
| `age` | `Int?` | `age` | ✅ Trực tiếp |
| `bio` | `String?` | `bio` | ✅ Trực tiếp |
| `phone` | `String?` | `phone` | ✅ Trực tiếp |
| `birthYear` | `Int?` | `birthYear` | ✅ Trực tiếp |
| `height` | `String?` | `height` | ✅ Trực tiếp (e.g., "160cm") |
| `weight` | `String?` | `weight` | ✅ Trực tiếp (e.g., "52kg") |
| `measurements` | `String?` | `measurements` | ✅ Trực tiếp (e.g., "89-64-92") |
| `origin` | `String?` | `origin` | ✅ Trực tiếp (e.g., "Miền Tây") |
| `address` | `String?` | `address` | ✅ Trực tiếp |
| `location` | `String?` | `location` | ✅ Trực tiếp (e.g., "Sài Gòn/Bình Tân") |
| `province` | `String?` | `province` | ✅ Trực tiếp (e.g., "Sài Gòn") |
| `price` | `String?` | `price` | ✅ Trực tiếp (e.g., "200K") |
| `workingHours` | `String?` | `workingHours` | ✅ Trực tiếp (e.g., "24/24") |
| `isAvailable` | `Boolean` | `isAvailable` | ✅ Trực tiếp |
| `images` | `Json` | `images` | ✅ Array of strings → JSON |
| `tags` | `Json` | `tags` | ✅ Array of strings → JSON |
| `services` | `Json` | `services` | ✅ Array of strings → JSON |

### 🔄 Các field cần transform:

| DB Field | Type | JSON Field | Transformation |
|----------|------|------------|----------------|
| `ratingAverage` | `Float` | `rating` | ✅ `rating` → `ratingAverage` |
| `totalReviews` | `Int` | `totalReviews` | ✅ Trực tiếp |
| `viewCount` | `Int` | `views` | ✅ `views` → `viewCount` |
| `verificationStatus` | `VerificationStatus` | `verified` | ⚠️ `verified: true` → `VERIFIED`, `false` → `PENDING` |
| `districts` | `Json` | `location`/`province` | ⚠️ Cần parse từ `location` hoặc `province` để tìm district IDs |

### ❌ Các field trong JSON nhưng KHÔNG có trong DB:

| JSON Field | Description | Action |
|------------|-------------|--------|
| `detailUrl` | URL chi tiết từ crawler | ⚠️ Có thể lưu vào `bio` hoặc bỏ qua (chỉ dùng để crawl) |
| `password` | Password của user | ⚠️ Không thuộc Girl model, thuộc User model khi tạo account |

### ➕ Các field trong DB nhưng KHÔNG có trong JSON (cần set default):

| DB Field | Type | Default Value | Notes |
|----------|------|---------------|-------|
| `id` | `String` | `uuid()` | ✅ Auto-generated |
| `userId` | `String?` | `null` | ✅ Optional - Girl là product, không cần user |
| `managedById` | `String?` | `null` | ✅ Sẽ set khi staff upload |
| `verificationDocuments` | `Json` | `[]` | ✅ Empty array |
| `verificationRequestedAt` | `DateTime?` | `null` | ✅ Optional |
| `verificationVerifiedAt` | `DateTime?` | `null` | ✅ Set nếu `verified: true` |
| `favoriteCount` | `Int` | `0` | ✅ Default 0 |
| `isFeatured` | `Boolean` | `false` | ✅ Default false |
| `isPremium` | `Boolean` | `false` | ✅ Default false |
| `isActive` | `Boolean` | `true` | ✅ Default true |
| `lastActiveAt` | `DateTime?` | `null` | ✅ Optional |
| `createdAt` | `DateTime` | `now()` | ✅ Auto-generated |
| `updatedAt` | `DateTime` | `now()` | ✅ Auto-updated |

## Mapping Logic cho Import

```typescript
// Pseudo-code mapping
const mapCrawlerDataToGirl = (crawlerData: CrawlerGirlData, managedById?: string) => {
  return {
    // Direct mappings
    name: crawlerData.name,
    age: crawlerData.age,
    bio: crawlerData.bio,
    phone: crawlerData.phone,
    birthYear: crawlerData.birthYear,
    height: crawlerData.height,
    weight: crawlerData.weight,
    measurements: crawlerData.measurements,
    origin: crawlerData.origin,
    address: crawlerData.address,
    location: crawlerData.location,
    province: crawlerData.province,
    price: crawlerData.price,
    workingHours: crawlerData.workingHours,
    isAvailable: crawlerData.isAvailable,
    
    // JSON fields
    images: JSON.stringify(crawlerData.images || []),
    tags: JSON.stringify(crawlerData.tags || []),
    services: JSON.stringify(crawlerData.services || []),
    
    // Transformations
    ratingAverage: crawlerData.rating || 0,
    totalReviews: crawlerData.totalReviews || 0,
    viewCount: crawlerData.views || 0,
    verificationStatus: crawlerData.verified ? 'VERIFIED' : 'PENDING',
    verificationVerifiedAt: crawlerData.verified ? new Date() : null,
    
    // Defaults
    districts: JSON.stringify([]), // TODO: Parse from location/province
    verificationDocuments: JSON.stringify([]),
    favoriteCount: 0,
    isFeatured: false,
    isPremium: false,
    isActive: true,
    
    // Relations
    userId: null, // Girl is a product, not a user
    managedById: managedById || null, // Set if imported by staff
  };
};
```

## Các vấn đề cần xử lý:

1. **Districts Mapping**: 
   - JSON có `location: "Sài Gòn/Bình Tân"` và `province: "Sài Gòn"`
   - DB cần `districts` là array of district IDs (JSON)
   - ⚠️ Cần tạo logic để map `location`/`province` → district IDs từ bảng `District`

2. **Verification Status**:
   - JSON: `verified: boolean`
   - DB: `verificationStatus: VerificationStatus` (PENDING | VERIFIED | REJECTED)
   - ✅ Mapping: `true` → `VERIFIED`, `false` → `PENDING`

3. **Rating**:
   - JSON: `rating: number` (single value)
   - DB: `ratingAverage: Float` (calculated from reviews)
   - ✅ Có thể dùng `rating` từ crawler làm initial `ratingAverage`

4. **Views**:
   - JSON: `views: number`
   - DB: `viewCount: Int`
   - ✅ Simple rename

5. **Detail URL**:
   - JSON có `detailUrl` nhưng DB không có field này
   - ⚠️ Có thể bỏ qua hoặc lưu vào một field metadata khác

## Kết luận:

✅ **Schema DB đã đầy đủ** để lưu trữ tất cả dữ liệu từ crawler (trừ `detailUrl` và `password`)

⚠️ **Cần xử lý**:
- Mapping `location`/`province` → `districts` (array of IDs)
- Transform `verified` boolean → `verificationStatus` enum
- Parse và validate các JSON fields (images, tags, services)

