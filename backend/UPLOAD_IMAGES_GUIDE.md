# 📸 Hướng Dẫn Upload Ảnh Lên Cloudinary

Hướng dẫn chi tiết để download ảnh từ URL và upload lên Cloudinary CDN của bạn.

## 🎯 Tổng Quan

Hệ thống đã được tích hợp với Cloudinary để:
- Download ảnh từ URL bất kỳ
- Upload lên Cloudinary CDN của bạn
- Tự động optimize ảnh (resize, compress, format conversion)
- Quản lý ảnh (delete, get optimized URLs)

## ⚙️ Cấu Hình Cloudinary

### 1. Lấy Thông Tin Cloudinary

1. Đăng ký/đăng nhập tại [cloudinary.com](https://cloudinary.com)
2. Vào Dashboard → Settings
3. Copy các thông tin:
   - **Cloud Name**
   - **API Key**
   - **API Secret**

### 2. Cấu Hình Environment Variables

Thêm vào file `.env` của backend:

```env
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
```

## 🚀 Sử Dụng API

### 1. Upload Single Image

**Endpoint:** `POST /api/upload/image`

**Headers:**
```
Authorization: Bearer <your-jwt-token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "url": "https://example.com/image.jpg",
  "folder": "girl-pick/girls",  // Optional, default: "girl-pick"
  "publicId": "girl-123"         // Optional, auto-generated if not provided
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "originalUrl": "https://example.com/image.jpg",
    "cloudinaryUrl": "https://res.cloudinary.com/your-cloud/image/upload/v123/girl-pick/girl-123.jpg",
    "publicId": "girl-pick/girl-123",
    "width": 1920,
    "height": 1080,
    "format": "jpg",
    "optimizedUrl": "https://res.cloudinary.com/your-cloud/image/upload/q_auto,f_auto/girl-pick/girl-123.jpg"
  }
}
```

### 2. Upload Multiple Images

**Endpoint:** `POST /api/upload/images`

**Request Body:**
```json
{
  "urls": [
    "https://example.com/image1.jpg",
    "https://example.com/image2.jpg",
    "https://example.com/image3.jpg"
  ],
  "folder": "girl-pick/girls",      // Optional
  "publicIdPrefix": "girl-123"      // Optional, sẽ tạo: girl-123_0, girl-123_1, ...
}
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "originalUrl": "https://example.com/image1.jpg",
      "cloudinaryUrl": "https://res.cloudinary.com/...",
      "publicId": "girl-pick/girl-123_0",
      "width": 1920,
      "height": 1080,
      "format": "jpg",
      "optimizedUrl": "https://res.cloudinary.com/..."
    },
    // ... more images
  ],
  "total": 3
}
```

### 3. Get Optimized Image URL

**Endpoint:** `GET /api/upload/optimize/:publicId`

**Query Parameters:**
- `width` (optional): Chiều rộng
- `height` (optional): Chiều cao
- `quality` (optional): Chất lượng (auto, 80, 90, etc.)
- `format` (optional): Format (auto, jpg, png, webp)

**Example:**
```
GET /api/upload/optimize/girl-pick/girl-123?width=800&quality=80&format=webp
```

**Response:**
```json
{
  "url": "https://res.cloudinary.com/your-cloud/image/upload/w_800,q_80,f_webp/girl-pick/girl-123.jpg"
}
```

### 4. Delete Image

**Endpoint:** `DELETE /api/upload/image/:publicId`

**Example:**
```
DELETE /api/upload/image/girl-pick/girl-123
```

## 💻 Sử Dụng Trong Code

### Trong Crawler Service

```typescript
import { UploadService } from '../upload/upload.service';

@Injectable()
export class CrawlerService {
  constructor(
    private prisma: PrismaService,
    private uploadService: UploadService, // Inject upload service
  ) {}

  async saveGirlWithUploadedImages(data: {
    name: string;
    imageUrls: string[]; // URLs từ nguồn crawl
    // ... other fields
  }) {
    // Upload tất cả ảnh lên Cloudinary
    const uploadResult = await this.uploadService.uploadMultipleImagesFromUrls({
      urls: data.imageUrls,
      folder: 'girl-pick/girls',
      publicIdPrefix: `girl-${data.name.toLowerCase().replace(/\s+/g, '-')}`,
    });

    // Lấy Cloudinary URLs
    const cloudinaryUrls = uploadResult.data.map((item) => item.cloudinaryUrl);

    // Lưu vào database với Cloudinary URLs
    return this.saveGirl({
      ...data,
      images: cloudinaryUrls, // Sử dụng Cloudinary URLs thay vì original URLs
    });
  }
}
```

### Trong Frontend

```typescript
// Upload ảnh từ URL
const uploadImage = async (imageUrl: string) => {
  const response = await fetch('http://your-api.com/api/upload/image', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({
      url: imageUrl,
      folder: 'girl-pick/girls',
    }),
  });

  const result = await response.json();
  return result.data.cloudinaryUrl; // Sử dụng URL này trong app
};

// Upload nhiều ảnh
const uploadMultipleImages = async (imageUrls: string[]) => {
  const response = await fetch('http://your-api.com/api/upload/images', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({
      urls: imageUrls,
      folder: 'girl-pick/girls',
    }),
  });

  const result = await response.json();
  return result.data.map((item: any) => item.cloudinaryUrl);
};
```

## 📝 Ví Dụ Thực Tế

### Crawl và Upload Ảnh Gái

```typescript
// 1. Crawl data từ website
const crawledData = {
  name: 'Nguyễn Thị A',
  imageUrls: [
    'https://external-site.com/image1.jpg',
    'https://external-site.com/image2.jpg',
  ],
  bio: 'Gái gọi chuyên nghiệp',
};

// 2. Upload ảnh lên Cloudinary
const uploadResult = await uploadService.uploadMultipleImagesFromUrls({
  urls: crawledData.imageUrls,
  folder: 'girl-pick/girls',
  publicIdPrefix: `girl-${crawledData.name.toLowerCase().replace(/\s+/g, '-')}`,
});

// 3. Lưu vào database với Cloudinary URLs
await prisma.girl.create({
  data: {
    name: crawledData.name,
    images: uploadResult.data.map((item) => item.cloudinaryUrl),
    bio: crawledData.bio,
    // ... other fields
  },
});
```

### Crawl và Upload Ảnh Phim

```typescript
const movieData = {
  title: 'Phim sex hay',
  thumbnailUrl: 'https://external-site.com/thumbnail.jpg',
  videoUrl: 'https://external-site.com/video.mp4',
};

// Upload thumbnail
const thumbnailResult = await uploadService.uploadImageFromUrl({
  url: movieData.thumbnailUrl,
  folder: 'girl-pick/movies',
  publicId: `movie-${movieData.title.toLowerCase().replace(/\s+/g, '-')}`,
});

// Lưu với Cloudinary URL
await prisma.movie.create({
  data: {
    title: movieData.title,
    thumbnailUrl: thumbnailResult.data.cloudinaryUrl,
    videoUrl: movieData.videoUrl,
  },
});
```

## 🎨 Image Optimization

Cloudinary tự động optimize ảnh:

- **Auto Format**: Tự động chọn format tốt nhất (WebP, AVIF)
- **Auto Quality**: Tự động điều chỉnh chất lượng
- **Responsive**: Tự động resize theo device
- **Lazy Loading**: Hỗ trợ lazy loading

**Sử dụng optimized URL:**
```typescript
// Get optimized URL với width 800px, format WebP
const optimizedUrl = uploadService.getOptimizedUrl('girl-pick/girl-123', {
  width: 800,
  quality: 'auto',
  format: 'auto', // Tự động chọn WebP nếu browser support
});
```

## 🔒 Security & Permissions

- **Authentication**: Cần JWT token để upload
- **Roles**: Chỉ ADMIN và GIRL có thể upload
- **Validation**: Tự động validate URL và content type
- **Rate Limiting**: Có throttling để tránh abuse

## 📊 Folder Structure trên Cloudinary

```
girl-pick/
├── girls/
│   ├── girl-nguyen-thi-a_0.jpg
│   ├── girl-nguyen-thi-a_1.jpg
│   └── ...
├── movies/
│   ├── movie-phim-sex-hay.jpg
│   └── ...
└── posts/
    └── ...
```

## 🐛 Troubleshooting

### Lỗi: "Invalid image URL"
- Kiểm tra URL có đúng format không
- URL phải bắt đầu với `http://` hoặc `https://`
- URL phải trả về image content type

### Lỗi: "Failed to upload image"
- Kiểm tra Cloudinary credentials
- Kiểm tra network connection
- Kiểm tra image URL có accessible không

### Lỗi: "Unauthorized"
- Kiểm tra JWT token
- Đảm bảo user có role ADMIN hoặc GIRL

## 💡 Best Practices

1. **Folder Organization**: Sử dụng folder để tổ chức ảnh
   - `girl-pick/girls/` - Ảnh gái
   - `girl-pick/movies/` - Thumbnail phim
   - `girl-pick/posts/` - Ảnh bài viết

2. **Public ID**: Sử dụng publicId có ý nghĩa
   - `girl-nguyen-thi-a` thay vì random ID
   - Dễ quản lý và tìm kiếm

3. **Batch Upload**: Upload nhiều ảnh cùng lúc thay vì từng cái
   - Nhanh hơn
   - Ít API calls hơn

4. **Optimize**: Luôn sử dụng optimized URLs trong frontend
   - Giảm bandwidth
   - Tăng tốc độ load

5. **Error Handling**: Luôn handle errors
   ```typescript
   try {
     const result = await uploadService.uploadImageFromUrl({ url });
     // Use result.data.cloudinaryUrl
   } catch (error) {
     console.error('Upload failed:', error);
     // Fallback to original URL or show error
   }
   ```

## 📚 Tài Liệu Tham Khảo

- [Cloudinary Documentation](https://cloudinary.com/documentation)
- [Cloudinary Node.js SDK](https://cloudinary.com/documentation/node_integration)
- [Image Transformation Guide](https://cloudinary.com/documentation/image_transformations)

---

**Chúc bạn upload ảnh thành công! 🎉**


