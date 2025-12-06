# Database Design - Girl Pick Project

## Tổng quan

Database được thiết kế để lưu trữ dữ liệu từ 2 nguồn chính:
1. **Girls (Gái gọi)** - Từ `gaigu1.net/gai-goi`
2. **Movies (Phim sex)** - Từ `gaigu1.net/phim-sex`

## Kiến trúc Database

### 1. Core Entities

#### User
- Quản lý tất cả users (Admin, Girl, Customer, Staff)
- Authentication & Authorization
- Profile management

#### Girl
- **Enhanced với dữ liệu crawl:**
  - Basic: name, age, bio, price, isAvailable
  - Location: location, province, districtId
  - Rating: rating, totalReviews, views
  - Detail: phone, password, birthYear, height, weight, measurements, origin, address, workingHours
  - Media: images[], thumbnail
  - External: detailUrl, sourceId (để sync với source)
  - Timestamps: crawledAt (track khi nào crawl)

#### Movie
- **Mới thêm cho phim sex:**
  - Basic: title, thumbnail, duration, views, rating
  - Detail: description, poster
  - Video: videoUrl, videoSources (JSON)
  - External: detailUrl, sourceId
  - Status: status, isFeatured, isActive

### 2. Many-to-Many Relationships

#### Tags System
- `Tag` - Bảng tags chung
- `GirlTag` - Nhiều-nhiều giữa Girl và Tag
- `MovieTag` - Nhiều-nhiều giữa Movie và Tag

**Lợi ích:**
- Tái sử dụng tags
- Dễ search/filter
- Thống kê tags phổ biến

#### Services System
- `Service` - Bảng services (Qua đêm, Hôn môi, BJ, etc.)
- `GirlService` - Nhiều-nhiều giữa Girl và Service

**Lợi ích:**
- Quản lý services tập trung
- Dễ filter theo service
- Có thể thêm pricing cho từng service

### 3. Location System

#### District & Province
- `Province` - Tỉnh/Thành phố
- `District` - Quận/Huyện
- `Girl.districtId` - Foreign key đến District

**Lợi ích:**
- Normalize location data
- Dễ filter/search theo location
- Có thể thêm geolocation sau

### 4. Video Quality System

#### VideoQuality
- Lưu các chất lượng video khác nhau (SD, HD, FHD, UHD)
- Mỗi movie có thể có nhiều quality
- Lưu URL, resolution, file size

**Lợi ích:**
- Quản lý nhiều chất lượng video
- Track file size
- Dễ switch quality

## Indexes Strategy

### Performance Indexes
```sql
-- Girls
CREATE INDEX idx_girls_province ON girls(province);
CREATE INDEX idx_girls_district ON girls(district_id);
CREATE INDEX idx_girls_available ON girls(is_available);
CREATE INDEX idx_girls_verified ON girls(verified);
CREATE INDEX idx_girls_rating ON girls(rating);
CREATE INDEX idx_girls_views ON girls(views);
CREATE INDEX idx_girls_detail_url ON girls(detail_url);
CREATE INDEX idx_girls_source_id ON girls(source_id);

-- Movies
CREATE INDEX idx_movies_status ON movies(status);
CREATE INDEX idx_movies_views ON movies(views);
CREATE INDEX idx_movies_detail_url ON movies(detail_url);
CREATE INDEX idx_movies_source_id ON movies(source_id);

-- Many-to-Many
CREATE INDEX idx_girl_tags_girl ON girl_tags(girl_id);
CREATE INDEX idx_girl_tags_tag ON girl_tags(tag_id);
CREATE INDEX idx_movie_tags_movie ON movie_tags(movie_id);
```

## Migration Strategy

### Bước 1: Backup existing schema
```bash
cp prisma/schema.prisma prisma/schema.backup.prisma
```

### Bước 2: Update schema
```bash
# Copy enhanced schema
cp prisma/schema_enhanced.prisma prisma/schema.prisma
```

### Bước 3: Generate migration
```bash
npx prisma migrate dev --name enhance_girl_add_movie
```

### Bước 4: Seed data
- Import tags từ crawled data
- Import services từ crawled data
- Import provinces/districts
- Import girls từ JSON files
- Import movies từ JSON files

## Data Import Scripts

### Import Girls
```typescript
// scripts/import-girls.ts
// Đọc JSON files từ crawler/data/details/
// Parse và insert vào database
// Link tags và services
```

### Import Movies
```typescript
// scripts/import-movies.ts
// Đọc JSON files từ crawler/data/movie_details/
// Parse và insert vào database
// Link tags và video qualities
```

## Relationships Diagram

```
User (1) ──< (1) Girl
              │
              ├──< (N) GirlTag >── (N) Tag
              ├──< (N) GirlService >── (N) Service
              ├──< (1) District
              └──< (N) Review, Booking, etc.

Movie (1) ──< (N) MovieTag >── (N) Tag
         └──< (N) VideoQuality
```

## Best Practices

### 1. Data Normalization
- Tags, Services, Districts được normalize
- Tránh duplicate data
- Dễ maintain và update

### 2. External ID Tracking
- `sourceId` và `detailUrl` để sync với source
- `crawledAt` để track khi nào crawl
- Có thể update data định kỳ

### 3. Soft Deletes
- `isActive` flag thay vì hard delete
- `status` enum cho movies
- Dễ restore nếu cần

### 4. Indexes
- Index trên các columns thường query
- Composite indexes cho queries phức tạp
- Monitor query performance

### 5. JSON Fields (MySQL Compatible)
- `videoSources` dùng JSON cho flexibility
- `images`, `verificationDocuments` dùng JSON (MySQL không hỗ trợ array natively)
- Có thể migrate sang table sau nếu cần query phức tạp

**Lưu ý MySQL:**
- MySQL không hỗ trợ array types như PostgreSQL
- Dùng JSON type để lưu arrays
- Cần parse JSON khi query trong code

## Next Steps

1. ✅ Review schema với team
2. ✅ Generate migration
3. ✅ Create seed scripts
4. ✅ Import crawled data
5. ✅ Test queries và performance
6. ✅ Add more indexes nếu cần
7. ✅ Setup backup strategy

