# So sánh Schema Database vs Crawler Data - Movies/Phim

## Schema Database hiện tại - Model Post

### Model Post hiện có:
```prisma
model Post {
  id           String     @id @default(uuid())
  authorId     String     // User ID who created the post
  girlId       String?    // Optional: if post is related to a specific girl
  title        String
  content      String
  images       Json       @default("[]") // Array of image URLs
  status       PostStatus @default(PENDING)
  approvedById String?
  approvedAt   DateTime?
  createdAt    DateTime   @default(now())
  updatedAt    DateTime   @updatedAt
  
  // Relations
  author     User
  girl       Girl?
  approvedBy User?
  likes      PostLike[]
  comments   PostComment[]
}
```

## Crawler Data - Movie JSON Structure

```json
{
  "title": "Làm tình cùng bạn gái Nhật",
  "thumbnail": "https://gaigu1.net/media/videos/tmb2/77734/1.jpg",
  "duration": "",
  "views": 47600,
  "rating": "Font Size50%75%100%125%150%175%200%300%400%", // Invalid data
  "detailUrl": "https://gaigu1.net/phim-sex-chi-tiet/77734/...",
  "category": "sex tự quay",
  "uploadDate": "",
  "description": "Đăng Nhập ×        Đăng nhập Đăng ký", // Invalid data
  "videoUrl": "https://gaigu1.net/media/videos/h264/77734_360p.mp4",
  "videoSources": [
    {
      "url": "https://gaigu1.net/media/videos/h264/77734_720p.mp4",
      "type": "video/mp4",
      "label": "720p",
      "resolution": "720"
    },
    {
      "url": "https://gaigu1.net/media/videos/h264/77734_480p.mp4",
      "type": "video/mp4",
      "label": "480p",
      "resolution": "480"
    },
    {
      "url": "https://gaigu1.net/media/videos/h264/77734_360p.mp4",
      "type": "video/mp4",
      "label": "360p",
      "resolution": "360"
    }
  ],
  "poster": "https://gaigu1.net/media/videos/tmb2/77734/default.jpg",
  "tags": ["sex tự quay", "sex nhật bản"]
}
```

## So sánh chi tiết

### ✅ Có thể map vào Post model:

| JSON Field | Post Field | Mapping Notes |
|------------|------------|---------------|
| `title` | `title` | ✅ Trực tiếp |
| `description` | `content` | ⚠️ Cần clean (có thể chứa HTML/invalid text) |
| `thumbnail` | `images` (Json) | ⚠️ Thêm vào array images |
| `poster` | `images` (Json) | ⚠️ Thêm vào array images |
| `tags` | - | ❌ Post không có tags field |
| `category` | - | ❌ Post không có category field |

### ❌ Thiếu trong Post model:

| JSON Field | Type | Description | Action |
|------------|------|-------------|--------|
| `videoUrl` | `String` | URL video chính | ⚠️ Cần thêm field |
| `videoSources` | `Json` | Array of video sources với resolution | ⚠️ Cần thêm field |
| `duration` | `String` | Thời lượng video (e.g., "10:30") | ⚠️ Cần thêm field |
| `views` | `Number` | Số lượt xem | ⚠️ Cần thêm field |
| `rating` | `String/Number` | Đánh giá (cần clean) | ⚠️ Cần thêm field |
| `category` | `String` | Danh mục phim | ⚠️ Cần thêm field |
| `uploadDate` | `String` | Ngày upload | ⚠️ Có thể dùng `createdAt` |
| `detailUrl` | `String` | URL chi tiết từ crawler | ⚠️ Không cần lưu (chỉ dùng để crawl) |

## Đề xuất Schema mới cho Movie

Có 2 options:

### Option 1: Mở rộng Post model (đơn giản hơn)
Thêm các field vào Post model:
```prisma
model Post {
  // ... existing fields ...
  
  // Video fields
  videoUrl      String?   // Main video URL
  videoSources  Json?     @default("[]") // Array of {url, type, label, resolution}
  duration      String?   // Video duration (e.g., "10:30")
  viewCount     Int       @default(0) // Number of views
  rating        Float?    // Rating (0-5)
  category      String?   // Category (e.g., "sex tự quay")
  tags          Json      @default("[]") // Array of tag strings
  poster        String?   // Poster/thumbnail URL
}
```

### Option 2: Tạo model Movie riêng (tách biệt rõ ràng)
```prisma
model Movie {
  id            String   @id @default(uuid())
  title         String
  description   String?
  thumbnail     String?  // Thumbnail URL
  poster        String?  // Poster URL
  videoUrl      String?  // Main video URL
  videoSources  Json     @default("[]") // Array of video sources
  duration      String?  // Duration (e.g., "10:30")
  viewCount     Int      @default(0)
  rating        Float?   // Rating (0-5)
  category      String?  // Category
  tags          Json     @default("[]") // Array of tags
  status        PostStatus @default(PENDING) // Same as Post
  authorId      String?  // Optional: who uploaded
  approvedById  String?
  approvedAt    DateTime?
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
  
  // Relations
  author     User?      @relation("MovieAuthor", fields: [authorId], references: [id])
  approvedBy User?      @relation("ApprovedMovieBy", fields: [approvedById], references: [id])
  
  @@map("movies")
}
```

## Mapping Logic cho Import

### Nếu dùng Post model (mở rộng):
```typescript
const mapCrawlerMovieToPost = (movieData: CrawlerMovieData, authorId: string) => {
  return {
    title: movieData.title,
    content: cleanDescription(movieData.description), // Clean HTML/invalid text
    images: [
      movieData.thumbnail,
      movieData.poster
    ].filter(Boolean),
    videoUrl: movieData.videoUrl,
    videoSources: movieData.videoSources || [],
    duration: movieData.duration || null,
    viewCount: movieData.views || 0,
    rating: parseRating(movieData.rating), // Parse và validate
    category: movieData.category || null,
    tags: movieData.tags || [],
    poster: movieData.poster,
    authorId: authorId, // Staff/Admin who imports
    status: 'APPROVED', // Auto approve imported movies
  };
};
```

### Transformations cần thiết:

1. **Description**: 
   - JSON: `"Đăng Nhập ×        Đăng nhập Đăng ký"` (invalid)
   - DB: Clean và validate, có thể để null nếu invalid

2. **Rating**:
   - JSON: `"Font Size50%75%100%125%150%175%200%300%400%"` (invalid)
   - DB: Parse thành number (0-5) hoặc null nếu invalid

3. **Duration**:
   - JSON: `""` (empty string)
   - DB: `null` nếu empty

4. **UploadDate**:
   - JSON: `""` (empty string)
   - DB: Dùng `createdAt` = `now()`

5. **VideoSources**:
   - JSON: Array of objects với `{url, type, label, resolution}`
   - DB: Lưu dưới dạng JSON array

## Kết luận

⚠️ **Post model hiện tại KHÔNG đủ** để lưu trữ dữ liệu movie từ crawler.

**Cần quyết định:**
1. **Mở rộng Post model** - Thêm video fields vào Post (đơn giản, nhanh)
2. **Tạo Movie model riêng** - Tách biệt rõ ràng (tốt hơn về architecture)

**Recommendation:** Tạo Movie model riêng vì:
- Movies và Posts có mục đích khác nhau
- Movies có nhiều fields đặc thù (video, duration, viewCount)
- Dễ quản lý và query riêng biệt

