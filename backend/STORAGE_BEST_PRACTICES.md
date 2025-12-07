# 📦 Best Practices: Lưu Trữ File Ảnh/Video

## ❌ Tại Sao KHÔNG Nên Lưu File Trong Project?

### Vấn Đề Khi Lưu File Trong Project:

1. **Dung Lượng Project Quá Lớn**
   - 50GB ảnh/video → Git repo rất nặng
   - Clone project mất hàng giờ
   - Không thể push lên GitHub/GitLab

2. **Không Scale Được**
   - Server local không đủ dung lượng
   - Tốn băng thông khi deploy
   - Backup/restore khó khăn

3. **Vấn Đề Khi Deploy**
   - Vercel/Netlify có giới hạn 100MB
   - Heroku có giới hạn slug size
   - Không thể deploy được

4. **Performance**
   - Serve file từ server chậm
   - Không có CDN
   - Tốn bandwidth server

5. **Version Control**
   - Git không phù hợp cho binary files
   - Làm chậm Git operations
   - Conflict khi merge

## ✅ Giải Pháp: Sử Dụng CDN/Cloud Storage

### 1. Cloudinary (Khuyến Nghị Cho Ảnh)

**Ưu điểm:**
- ✅ Auto-optimize (resize, compress, format conversion)
- ✅ CDN global
- ✅ Free tier: 25GB storage, 25GB bandwidth
- ✅ Dễ tích hợp
- ✅ Transformations on-the-fly

**Cách dùng:**
```typescript
// Upload ảnh từ URL → Cloudinary
const result = await uploadImageFromUrl('https://external-site.com/image.jpg', {
  folder: 'girl-pick/girls',
});

// Sử dụng Cloudinary URL
const cloudinaryUrl = result.secureUrl; // https://res.cloudinary.com/...
```

**Setup:**
- Đã có sẵn trong project: `backend/src/common/utils/cloudinary.util.ts`
- API endpoint: `POST /api/upload/image`

### 2. AWS S3 + CloudFront (Cho Video Lớn)

**Ưu điểm:**
- ✅ Rẻ ($0.023/GB storage)
- ✅ CDN CloudFront
- ✅ Scale được
- ✅ Phù hợp cho video

**Setup:**
```typescript
// Cần cài: aws-sdk
import AWS from 'aws-sdk';

const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: 'ap-southeast-1',
});

// Upload video
const uploadResult = await s3.upload({
  Bucket: 'girl-pick-videos',
  Key: `videos/${videoId}.mp4`,
  Body: videoBuffer,
  ContentType: 'video/mp4',
}).promise();
```

### 3. DigitalOcean Spaces (Rẻ, Dễ Dùng)

**Ưu điểm:**
- ✅ Rẻ ($5/tháng cho 250GB)
- ✅ CDN tích hợp
- ✅ API tương tự S3
- ✅ Dễ setup

### 4. Backblaze B2 (Rẻ Nhất)

**Ưu điểm:**
- ✅ Rất rẻ ($5/TB storage)
- ✅ Free egress 1GB/ngày
- ✅ Phù hợp cho backup

## 🎯 Kiến Trúc Khuyến Nghị

### Cho Project Này:

```
┌─────────────────┐
│   Frontend      │
│   (Next.js)     │
└────────┬────────┘
         │
         │ API Calls
         ▼
┌─────────────────┐
│   Backend API   │
│   (NestJS)      │
└────────┬────────┘
         │
         │ Upload
         ▼
┌─────────────────┐      ┌──────────────┐
│   Cloudinary    │      │   AWS S3     │
│   (Ảnh)         │      │   (Video)    │
│   25GB Free     │      │   $0.023/GB   │
└─────────────────┘      └──────────────┘
         │                       │
         └───────────┬───────────┘
                     │
                     ▼
            ┌─────────────────┐
            │   CDN Global    │
            │   (Fast Load)   │
            └─────────────────┘
```

### Flow Upload:

1. **Crawl data** → Lấy URL ảnh/video từ external site
2. **Download** → Backend download file tạm thời (không lưu)
3. **Upload** → Upload lên Cloudinary/S3
4. **Lưu URL** → Lưu Cloudinary/S3 URL vào database
5. **Xóa file tạm** → Xóa file tạm trên server

## 📝 Code Example

### Upload Ảnh (Đã Có Sẵn)

```typescript
// Backend: backend/src/modules/upload/upload.service.ts
// API: POST /api/upload/image

// Frontend hoặc Crawler
const response = await fetch('/api/upload/image', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    url: 'https://external-site.com/image.jpg',
    folder: 'girl-pick/girls',
  }),
});

const { cloudinaryUrl } = await response.json();

// Lưu cloudinaryUrl vào database
await saveGirl({
  name: 'Nguyễn Thị A',
  images: [cloudinaryUrl], // ← Lưu URL, không lưu file
});
```

### Upload Video (Cần Thêm)

```typescript
// Cần tạo: backend/src/modules/upload/video.service.ts
import AWS from 'aws-sdk';

async function uploadVideoToS3(videoUrl: string, videoId: string) {
  // 1. Download video
  const videoBuffer = await downloadVideoFromUrl(videoUrl);
  
  // 2. Upload to S3
  const s3 = new AWS.S3({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  });
  
  const uploadResult = await s3.upload({
    Bucket: 'girl-pick-videos',
    Key: `videos/${videoId}.mp4`,
    Body: videoBuffer,
    ContentType: 'video/mp4',
    ACL: 'public-read',
  }).promise();
  
  // 3. Return S3 URL
  return uploadResult.Location;
}
```

## 🗂️ Cấu Trúc Database

### Lưu URL, Không Lưu File:

```prisma
model Girl {
  id        String   @id @default(uuid())
  name      String
  images    String[] // ← Lưu URLs: ["https://res.cloudinary.com/...", ...]
  // KHÔNG lưu: images: File[] ❌
}

model Movie {
  id          String   @id @default(uuid())
  title       String
  thumbnailUrl String  // ← URL từ Cloudinary
  videoUrl    String   // ← URL từ S3/Cloudinary
  // KHÔNG lưu: video: File ❌
}
```

## 📊 So Sánh Giải Pháp

| Giải Pháp | Storage | Bandwidth | Giá | Phù Hợp |
|-----------|---------|-----------|-----|---------|
| **Cloudinary** | 25GB free | 25GB free | $99/tháng (225GB) | Ảnh, thumbnail |
| **AWS S3** | $0.023/GB | $0.085/GB | ~$1.15/50GB | Video, file lớn |
| **DO Spaces** | $5/250GB | Free | $5/tháng | Video, file lớn |
| **Backblaze B2** | $5/TB | $0.01/GB | ~$0.25/50GB | Backup, archive |

## 🚀 Khuyến Nghị Cho Project

### Hiện Tại (Đã Setup):
- ✅ **Cloudinary** cho ảnh → Đã có sẵn
- ✅ API upload → `POST /api/upload/image`

### Cần Thêm (Cho Video):
- ⚠️ **AWS S3** hoặc **DO Spaces** cho video
- ⚠️ API upload video → `POST /api/upload/video`

### Workflow:

1. **Crawl** → Lấy URL ảnh/video
2. **Upload** → Lên Cloudinary (ảnh) hoặc S3 (video)
3. **Lưu URL** → Vào database
4. **Serve** → Từ CDN (nhanh, global)

## ⚠️ Lưu Ý Quan Trọng

1. **KHÔNG commit file vào Git**
   - Thêm vào `.gitignore`:
   ```
   /uploads/
   /public/images/
   /public/videos/
   *.mp4
   *.mov
   *.avi
   ```

2. **KHÔNG lưu trong `public/` folder**
   - Chỉ lưu static assets nhỏ (logo, icons)
   - Ảnh/video user → CDN

3. **KHÔNG lưu trong database**
   - Database chỉ lưu URL
   - Binary data → CDN/Storage

4. **Cleanup temp files**
   - Xóa file tạm sau khi upload
   - Không để file tạm tích tụ

## 📚 Tài Liệu Tham Khảo

- [Cloudinary Documentation](https://cloudinary.com/documentation)
- [AWS S3 Documentation](https://docs.aws.amazon.com/s3/)
- [DigitalOcean Spaces](https://www.digitalocean.com/products/spaces)
- [Backblaze B2](https://www.backblaze.com/b2/cloud-storage.html)

---

**Kết luận:** Luôn dùng CDN/Cloud Storage, KHÔNG lưu file trong project! 🎯


