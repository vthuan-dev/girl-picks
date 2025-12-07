# 🚀 Hướng Dẫn Deploy Frontend Lên Vercel

Hướng dẫn chi tiết để deploy dự án Next.js frontend lên Vercel.

## 📋 Yêu Cầu Trước Khi Deploy

1. **Tài khoản Vercel**: Đăng ký tại [vercel.com](https://vercel.com) (miễn phí)
2. **GitHub/GitLab/Bitbucket**: Code đã được push lên repository
3. **Backend API**: Backend đã được deploy và có URL công khai

## 🔧 Bước 1: Chuẩn Bị Code

### 1.1. Kiểm tra build local

Trước khi deploy, hãy test build trên máy local:

```bash
cd frontend
npm install
npm run build
```

Nếu build thành công, bạn có thể tiếp tục.

### 1.2. Tạo file `.env.example` (tùy chọn)

Tạo file `.env.example` để làm mẫu cho các biến môi trường:

```env
NEXT_PUBLIC_API_URL=http://localhost:3000
NEXT_PUBLIC_WS_URL=http://localhost:3000
```

## 🌐 Bước 2: Deploy Lên Vercel

### Cách 1: Deploy Qua Vercel Dashboard (Khuyên dùng)

1. **Đăng nhập Vercel**
   - Truy cập [vercel.com](https://vercel.com)
   - Đăng nhập bằng GitHub/GitLab/Bitbucket

2. **Import Project**
   - Click "Add New..." → "Project"
   - Chọn repository chứa code frontend
   - Hoặc click "Import Git Repository" và paste URL repo

3. **Cấu Hình Project**
   - **Framework Preset**: Next.js (tự động detect)
   - **Root Directory**: Chọn `frontend` (nếu repo ở root, chọn `frontend/`)
   - **Build Command**: `npm run build` (mặc định)
   - **Output Directory**: `.next` (mặc định)
   - **Install Command**: `npm install` (mặc định)

4. **Cấu Hình Environment Variables**
   - Click "Environment Variables"
   - Thêm các biến sau:
     ```
     NEXT_PUBLIC_API_URL = https://your-backend-api.com
     NEXT_PUBLIC_WS_URL = wss://your-backend-api.com
     ```
   - Chọn môi trường: Production, Preview, Development (hoặc tất cả)

5. **Deploy**
   - Click "Deploy"
   - Chờ quá trình build và deploy hoàn tất (2-5 phút)

### Cách 2: Deploy Qua Vercel CLI

1. **Cài đặt Vercel CLI**
   ```bash
   npm install -g vercel
   ```

2. **Đăng nhập**
   ```bash
   vercel login
   ```

3. **Deploy**
   ```bash
   cd frontend
   vercel
   ```
   
   - Lần đầu sẽ hỏi một số câu hỏi:
     - Set up and deploy? → **Y**
     - Which scope? → Chọn tài khoản của bạn
     - Link to existing project? → **N** (lần đầu)
     - Project name? → Nhập tên project (hoặc Enter để dùng mặc định)
     - Directory? → `./` (hoặc Enter)
     - Override settings? → **N**

4. **Cấu hình Environment Variables**
   ```bash
   vercel env add NEXT_PUBLIC_API_URL
   vercel env add NEXT_PUBLIC_WS_URL
   ```
   - Nhập giá trị cho mỗi biến
   - Chọn môi trường (Production, Preview, Development)

5. **Deploy Production**
   ```bash
   vercel --prod
   ```

## ⚙️ Bước 3: Cấu Hình Nâng Cao

### 3.1. Custom Domain (Tùy chọn)

**Xem hướng dẫn chi tiết tại:** [DOMAIN_DNS_SETUP.md](./DOMAIN_DNS_SETUP.md)

Tóm tắt:
1. Vào Project Settings → Domains
2. Thêm domain của bạn (ví dụ: `gaigu1.net`)
3. Vercel sẽ hiển thị DNS records cần thêm
4. Thêm DNS records vào nhà cung cấp domain của bạn
5. Chờ DNS propagate (5-30 phút)
6. Vercel tự động cấp SSL certificate

### 3.2. Environment Variables

**Quan trọng**: Các biến môi trường bắt đầu với `NEXT_PUBLIC_` sẽ được expose ra client-side.

**Các biến cần thiết:**
- `NEXT_PUBLIC_API_URL`: URL của backend API (ví dụ: `https://api.yourdomain.com`)
- `NEXT_PUBLIC_WS_URL`: URL của WebSocket server (ví dụ: `wss://api.yourdomain.com`)

**Lưu ý:**
- Nếu backend chạy trên HTTP, WebSocket sẽ là `ws://`
- Nếu backend chạy trên HTTPS, WebSocket sẽ là `wss://`
- Đảm bảo backend đã được deploy và có CORS được cấu hình đúng

### 3.3. Build Settings

Vercel tự động detect Next.js, nhưng bạn có thể tùy chỉnh trong `vercel.json`:

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": ".next",
  "installCommand": "npm install",
  "framework": "nextjs"
}
```

## 🔍 Bước 4: Kiểm Tra Sau Khi Deploy

1. **Kiểm tra URL**
   - Vercel sẽ cung cấp URL dạng: `https://your-project.vercel.app`
   - Mở URL và kiểm tra website có hoạt động không

2. **Kiểm tra Console**
   - Mở Developer Tools (F12)
   - Kiểm tra tab Console và Network
   - Đảm bảo không có lỗi API connection

3. **Kiểm tra API Connection**
   - Thử đăng nhập/đăng ký
   - Kiểm tra các API calls có hoạt động không

## 🐛 Xử Lý Lỗi Thường Gặp

### Lỗi Build Failed

**Nguyên nhân:**
- Thiếu dependencies
- Lỗi TypeScript
- Lỗi syntax

**Giải pháp:**
```bash
# Test build local trước
cd frontend
npm install
npm run build
```

### Lỗi API Connection

**Nguyên nhân:**
- Environment variables chưa được set
- Backend chưa được deploy
- CORS chưa được cấu hình

**Giải pháp:**
1. Kiểm tra Environment Variables trong Vercel Dashboard
2. Đảm bảo backend đã được deploy
3. Kiểm tra CORS settings trong backend

### Lỗi 404 Not Found

**Nguyên nhân:**
- Routing không đúng
- File không tồn tại

**Giải pháp:**
- Kiểm tra cấu trúc thư mục `src/app/`
- Đảm bảo các route được định nghĩa đúng

## 📝 Checklist Trước Khi Deploy

- [ ] Code đã được push lên Git repository
- [ ] Build local thành công (`npm run build`)
- [ ] Backend đã được deploy và có URL công khai
- [ ] Đã chuẩn bị các Environment Variables
- [ ] Đã test các chức năng chính trên local
- [ ] Đã kiểm tra không có lỗi TypeScript/ESLint

## 🔄 Cập Nhật Code

Sau khi deploy, mỗi lần push code lên branch `main` (hoặc branch mặc định), Vercel sẽ tự động deploy lại.

**Deploy manual:**
```bash
cd frontend
vercel --prod
```

## 📚 Tài Liệu Tham Khảo

- [Vercel Documentation](https://vercel.com/docs)
- [Next.js Deployment](https://nextjs.org/docs/deployment)
- [Environment Variables](https://vercel.com/docs/concepts/projects/environment-variables)

## 💡 Tips

1. **Preview Deployments**: Mỗi Pull Request sẽ tự động tạo preview deployment
2. **Analytics**: Bật Vercel Analytics để theo dõi performance
3. **Edge Functions**: Có thể sử dụng Vercel Edge Functions cho API routes
4. **Image Optimization**: Next.js Image component tự động được optimize trên Vercel

## 🆘 Hỗ Trợ

Nếu gặp vấn đề, kiểm tra:
- [Vercel Status](https://www.vercel-status.com/)
- [Vercel Community](https://github.com/vercel/vercel/discussions)
- Logs trong Vercel Dashboard → Project → Deployments → View Function Logs

---

**Chúc bạn deploy thành công! 🎉**

