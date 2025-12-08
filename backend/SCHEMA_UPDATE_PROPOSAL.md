# 🔄 Đề xuất cập nhật Schema cho Girl Model

## 📋 Vấn đề hiện tại:
- Girl model có `userId` là **required** và **unique**
- Girl được xem như một **vật phẩm/sản phẩm**, không phải User
- Cần import dữ liệu từ crawler mà không cần tạo User
- Cần có User (MODERATOR/STAFF_UPLOAD) để quản lý/update Girl
- Girl chỉ là sản phẩm để khách hàng sử dụng

## ✅ Đề xuất thay đổi:

### 1. Làm `userId` optional (nullable)

```prisma
model Girl {
  id                      String             @id @default(uuid())
  userId                  String?            @unique // ✅ Changed to optional
  // ... rest of fields
}
```

### 2. Thêm các fields từ JSON crawler

```prisma
model Girl {
  // ... existing fields ...
  
  // Thêm từ JSON crawler
  phone                   String?            // Phone number
  price                   String?            // e.g., "200K"
  height                  String?            // e.g., "160cm"
  weight                  String?            // e.g., "52kg"
  measurements            String?            // e.g., "89-64-92"
  origin                  String?            // e.g., "Miền Tây"
  address                 String?            // Full address
  birthYear               Int?               // Birth year
  tags                    Json               @default("[]") // Array of tag strings
  services                Json               @default("[]") // Array of service strings (temporary, sẽ chuyển sang relation)
  
  // ... rest of fields ...
}
```

### 3. Schema mới đề xuất:

```prisma
model Girl {
  id                      String             @id @default(uuid())
  userId                  String?            @unique // Optional - Girl can exist without User
  
  // Basic Info
  name                    String?
  age                     Int?
  bio                     String?
  phone                   String?            // NEW: From crawler
  birthYear               Int?               // NEW: From crawler
  
  // Physical Info
  height                  String?            // NEW: e.g., "160cm"
  weight                  String?            // NEW: e.g., "52kg"
  measurements            String?            // NEW: e.g., "89-64-92"
  origin                  String?            // NEW: e.g., "Miền Tây"
  
  // Location
  districts               Json               @default("[]") // Array of district IDs
  address                 String?            // NEW: Full address from crawler
  location                String?            // NEW: e.g., "Sài Gòn/Bình Tân"
  province                String?            // NEW: e.g., "Sài Gòn"
  
  // Pricing
  price                   String?            // NEW: e.g., "200K"
  
  // Rating & Reviews
  ratingAverage           Float              @default(0)
  totalReviews            Int                @default(0)
  
  // Verification
  verificationStatus      VerificationStatus @default(PENDING)
  verificationDocuments   Json               @default("[]")
  verificationRequestedAt DateTime?
  verificationVerifiedAt  DateTime?
  
  // Statistics
  viewCount               Int                @default(0)
  favoriteCount           Int                @default(0)
  
  // Flags
  isFeatured              Boolean            @default(false)
  isPremium               Boolean            @default(false)
  isActive                Boolean            @default(true)
  isAvailable             Boolean            @default(true) // NEW: From crawler
  
  // Media & Content
  images                  Json               @default("[]") // Array of image URLs
  tags                    Json               @default("[]") // NEW: Array of tag strings
  services                Json               @default("[]") // NEW: Temporary, will move to relation
  
  // Activity
  lastActiveAt            DateTime?
  workingHours            String?            // NEW: e.g., "24/24"
  
  // Timestamps
  createdAt               DateTime           @default(now())
  updatedAt               DateTime           @updatedAt

  // Relations (optional user)
  user            User?            @relation(fields: [userId], references: [id], onDelete: SetNull) // Changed to optional
  posts           Post[]
  reviews         Review[]
  favorites       Favorite[]
  viewHistory     ViewHistory[]
  bookings        Booking[]        @relation("GirlBookings")
  servicePackages ServicePackage[]
  timeSlots       TimeSlot[]
  blockedDates    BlockedDate[]

  @@map("girls")
}
```

## 🔄 Migration Steps:

### Step 1: Update Prisma Schema
```bash
# 1. Sửa schema.prisma như trên
# 2. Tạo migration
npx prisma migrate dev --name make_girl_independent
```

### Step 2: Update Code
- Sửa tất cả chỗ check `userId` required
- Update Girl service để handle `userId` optional
- Update DTOs để `userId` optional

### Step 3: Import Data
- Import từ JSON crawler không cần User
- Set `userId = null` cho các Girl từ crawler

## 📝 Lợi ích:

1. ✅ Girl có thể tồn tại độc lập (như sản phẩm)
2. ✅ Dễ dàng import từ crawler
3. ✅ Vẫn có thể link với User nếu cần (optional)
4. ✅ Có đủ fields từ JSON crawler
5. ✅ Linh hoạt hơn trong thiết kế

## ⚠️ Breaking Changes:

1. `userId` từ required → optional
2. Relation với User từ required → optional
3. Cần update code sử dụng `girl.userId` (thêm null check)

## 🎯 Kết luận:

**Girl model nên được thiết kế như một sản phẩm/vật phẩm độc lập**, có thể:
- Tồn tại không cần User (từ crawler)
- Link với User nếu cần (khi girl tự đăng ký)

