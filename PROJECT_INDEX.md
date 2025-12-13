# 📚 Girl Pick Platform - Project Index

> **Mục đích**: Tài liệu chỉ mục tổng hợp toàn bộ dự án để dễ hiểu, tra cứu và phát triển
> **Cập nhật**: 2025-12-12

---

## 📋 Mục Lục

1. [Tổng Quan Dự Án](#1-tổng-quan-dự-án)
2. [Kiến Trúc Hệ Thống](#2-kiến-trúc-hệ-thống)
3. [Cấu Trúc Thư Mục](#3-cấu-trúc-thư-mục)
4. [Database Schema](#4-database-schema)
5. [Backend API](#5-backend-api)
6. [Frontend](#6-frontend)
7. [Tính Năng Chính](#7-tính-năng-chính)
8. [Scripts & Tools](#8-scripts--tools)
9. [Deployment](#9-deployment)
10. [Tài Liệu Liên Quan](#10-tài-liệu-liên-quan)

---

## 1. Tổng Quan Dự Án

### 1.1. Mô Tả
**Girl Pick Platform** là nền tảng web kết nối người cung cấp dịch vụ giải trí (Girls) với khách hàng (Customers), bao gồm:
- Hệ thống quản lý profile và bài viết
- Hệ thống đặt lịch (booking) dịch vụ
- Hệ thống review và đánh giá
- Chat real-time
- Admin dashboard để quản lý và duyệt nội dung

### 1.2. Tech Stack

#### Backend
- **Framework**: NestJS (TypeScript)
- **Database**: MySQL (Prisma ORM)
- **Authentication**: JWT + bcrypt
- **Real-time**: Socket.io
- **File Upload**: Cloudinary
- **Cache**: Redis
- **Security**: Helmet, Throttler (Rate Limiting)

#### Frontend
- **Framework**: Next.js 14 (React 18 + TypeScript)
- **Styling**: Tailwind CSS
- **State Management**: Zustand
- **API Client**: Axios
- **Form**: React Hook Form + Zod
- **Real-time**: Socket.io Client
- **Notifications**: React Hot Toast

#### Infrastructure
- **Deployment**: Docker, VPS
- **Reverse Proxy**: Nginx
- **CI/CD**: Scripts tự động deploy
- **Monitoring**: Logs, Analytics

### 1.3. Phạm Vi Hoạt Động
- Sài Gòn (TP.HCM)
- Bình Dương
- Đồng Nai

---

## 2. Kiến Trúc Hệ Thống

### 2.1. Kiến Trúc Tổng Thể

```
┌─────────────────┐
│   Frontend      │ (Next.js 14 - Port 3001)
│   (React)       │
└────────┬────────┘
         │ HTTP/WebSocket
         ▼
┌─────────────────┐
│   Backend       │ (NestJS - Port 3000)
│   (API Server)  │
└────────┬────────┘
         │
    ┌────┴────┬──────────┬──────────┐
    ▼         ▼          ▼          ▼
┌────────┐ ┌─────┐  ┌────────┐ ┌─────────┐
│ MySQL  │ │Redis│  │Cloudinary│ │Socket.io│
│   DB   │ │Cache│  │ (Images) │ │  (Chat) │
└────────┘ └─────┘  └────────┘ └─────────┘
```

### 2.2. User Roles & Permissions

| Role | Mô Tả | Quyền Hạn |
|------|-------|-----------|
| **ADMIN** | Quản trị viên | Toàn quyền quản lý hệ thống, duyệt bài, quản lý users |
| **STAFF_UPLOAD** | Nhân viên upload | Upload và quản lý nội dung Girls, Posts |
| **GIRL** | Người cung cấp dịch vụ | Quản lý profile, bài viết, bookings |
| **CUSTOMER** | Khách hàng | Xem, đặt lịch, review, chat |

### 2.3. Data Flow

```
User Request → Frontend → API Gateway → Controller → Service → Prisma → MySQL
                                                    ↓
                                                  Cache (Redis)
                                                    ↓
                                                Response
```

---

## 3. Cấu Trúc Thư Mục

### 3.1. Root Directory

```
girl-pick/
├── backend/              # NestJS Backend API
├── frontend/             # Next.js Frontend
├── crawler/              # Web crawler scripts
├── mysql/                # MySQL data
├── nginx/                # Nginx config
├── scripts/              # Deployment scripts
├── .env                  # Environment variables
├── docker-compose.yml    # Docker configuration
├── PROJECT_PLAN.md       # Kế hoạch dự án chi tiết
├── FUNCTION_INDEX.md     # Index các functions/APIs
├── CHECKLIST.md          # Checklist phát triển
└── README.md             # Hướng dẫn chung
```

### 3.2. Backend Structure

```
backend/
├── src/
│   ├── main.ts                    # Entry point
│   ├── app.module.ts              # Root module
│   ├── common/                    # Shared utilities
│   │   ├── decorators/            # Custom decorators
│   │   ├── guards/                # Auth guards
│   │   ├── interceptors/          # Interceptors
│   │   └── filters/               # Exception filters
│   ├── config/                    # Configuration
│   │   ├── cloudinary.config.ts
│   │   ├── jwt.config.ts
│   │   └── redis.config.ts
│   ├── modules/                   # Feature modules
│   │   ├── auth/                  # Authentication
│   │   ├── users/                 # User management
│   │   ├── girls/                 # Girl profiles
│   │   ├── posts/                 # Posts management
│   │   ├── reviews/               # Reviews
│   │   ├── bookings/              # Booking system
│   │   ├── messages/              # Chat/Messaging
│   │   ├── notifications/         # Notifications
│   │   ├── admin/                 # Admin panel
│   │   ├── analytics/             # Analytics
│   │   ├── districts/             # Location management
│   │   ├── categories/            # Categories
│   │   ├── tags/                  # Tags
│   │   ├── favorites/             # Favorites
│   │   ├── reports/               # Reports
│   │   ├── search/                # Search
│   │   ├── upload/                # File upload
│   │   ├── crawler/               # Crawler integration
│   │   ├── albums/                # Photo albums
│   │   ├── chat-sex/              # Chat sex girls
│   │   ├── service-packages/      # Service packages
│   │   ├── time-slots/            # Time slots
│   │   ├── blocked-dates/         # Blocked dates
│   │   ├── payments/              # Payments
│   │   ├── venues/                # Venues
│   │   └── cache/                 # Cache service
│   ├── prisma/                    # Prisma service
│   └── scripts/                   # Utility scripts
├── prisma/
│   ├── schema.prisma              # Database schema
│   └── migrations/                # Database migrations
├── scripts/                       # Backend scripts
│   ├── create-admin.js            # Create admin user
│   ├── import-girls-from-crawler.ts
│   └── generate-slugs.ts
├── test/                          # Tests
├── package.json
└── README.md
```

### 3.3. Frontend Structure

```
frontend/
├── src/
│   ├── app/                       # Next.js App Router
│   │   ├── layout.tsx             # Root layout
│   │   ├── page.tsx               # Home page
│   │   ├── globals.css            # Global styles
│   │   ├── auth/                  # Auth pages
│   │   │   ├── login/
│   │   │   └── register/
│   │   ├── admin/                 # Admin pages
│   │   ├── girls/                 # Girl pages
│   │   ├── profile/               # Profile pages
│   │   └── ...
│   ├── modules/                   # Feature modules
│   │   ├── auth/
│   │   │   ├── api/               # API calls
│   │   │   └── components/        # Components
│   │   ├── users/
│   │   ├── girls/
│   │   ├── admin/
│   │   ├── posts/
│   │   ├── reviews/
│   │   ├── districts/
│   │   ├── categories/
│   │   ├── tags/
│   │   ├── notifications/
│   │   ├── albums/
│   │   ├── chat-sex/
│   │   └── crawler/
│   ├── components/                # Shared components
│   │   ├── ui/                    # UI components
│   │   ├── layout/                # Layout components
│   │   └── common/                # Common components
│   ├── lib/                       # Utilities
│   │   ├── api/
│   │   │   ├── client.ts          # API client
│   │   │   └── types.ts           # API types
│   │   └── utils/
│   ├── store/                     # State management
│   │   └── auth.store.ts          # Auth store (Zustand)
│   ├── types/                     # TypeScript types
│   │   ├── auth.ts
│   │   ├── user.ts
│   │   ├── girl.ts
│   │   └── ...
│   ├── hooks/                     # Custom hooks
│   └── utils/                     # Utility functions
├── public/                        # Static assets
├── package.json
└── README.md
```

---

## 4. Database Schema

### 4.1. Core Tables

#### Users & Authentication
- **users** - User accounts (ADMIN, GIRL, CUSTOMER, STAFF_UPLOAD)
- **girls** - Girl profiles (có thể có hoặc không có user account)
- **chat_sex_girls** - Chat sex girl profiles (không có user account)

#### Content
- **posts** - Bài viết/quảng cáo (từ Girls hoặc Admin)
- **reviews** - Reviews từ Customers
- **albums** - Photo albums
- **album_images** - Images trong albums
- **categories** - Categories cho posts/videos
- **album_categories** - Categories cho albums

#### Booking System
- **bookings** - Booking records
- **service_packages** - Service packages
- **time_slots** - Available time slots
- **blocked_dates** - Blocked dates
- **payments** - Payment records
- **payment_history** - Payment history
- **booking_history** - Booking history

#### Social & Interaction
- **messages** - Chat messages
- **notifications** - User notifications
- **favorites** - User favorites
- **view_history** - View history
- **post_likes** - Post likes
- **post_comments** - Post comments
- **review_likes** - Review likes
- **review_comments** - Review comments

#### Moderation & Admin
- **reports** - User/content reports
- **blocks** - Blocked users
- **audit_logs** - Admin action logs
- **settings** - System settings
- **email_templates** - Email templates

#### Location & Misc
- **districts** - Districts/locations
- **venues** - Venues for bookings
- **page_views** - Analytics page views

### 4.2. Key Enums

```typescript
enum UserRole {
  ADMIN, GIRL, CUSTOMER, STAFF_UPLOAD
}

enum PostStatus {
  PENDING, APPROVED, REJECTED
}

enum ReviewStatus {
  PENDING, APPROVED, REJECTED
}

enum VerificationStatus {
  PENDING, VERIFIED, REJECTED
}

enum BookingStatus {
  PENDING, CONFIRMED, COMPLETED, CANCELLED, REJECTED
}

enum PaymentStatus {
  PENDING, PROCESSING, COMPLETED, FAILED, REFUNDED
}

enum PaymentMethod {
  CASH, BANK_TRANSFER, MOMO, ZALOPAY, VNPAY
}

enum NotificationType {
  POST_APPROVED, POST_REJECTED, REVIEW_APPROVED,
  NEW_MESSAGE, BOOKING_CREATED, PAYMENT_RECEIVED, ...
}
```

### 4.3. Database Relationships

```
User (1) ─→ (0..1) Girl
User (1) ─→ (*) Review
User (1) ─→ (*) Message (sent/received)
User (1) ─→ (*) Notification
User (1) ─→ (*) Booking

Girl (1) ─→ (*) Post
Girl (1) ─→ (*) Review
Girl (1) ─→ (*) Booking
Girl (1) ─→ (*) ServicePackage
Girl (1) ─→ (*) TimeSlot

Booking (1) ─→ (*) Payment
Post (1) ─→ (*) PostLike
Post (1) ─→ (*) PostComment
```

---

## 5. Backend API

### 5.1. API Base URL
- **Development**: `http://localhost:3000`
- **Production**: `https://api.yourdomain.com`

### 5.2. API Modules

#### Authentication (`/auth`)
- `POST /auth/register` - Đăng ký
- `POST /auth/login` - Đăng nhập
- `POST /auth/refresh` - Refresh token
- `POST /auth/forgot-password` - Quên mật khẩu
- `POST /auth/reset-password` - Reset mật khẩu

#### Users (`/users`)
- `GET /users/me` - Get current user
- `PATCH /users/me` - Update profile
- `POST /users/me/avatar` - Upload avatar
- `POST /users/me/change-password` - Đổi mật khẩu

#### Girls (`/girls`)
- `GET /girls` - Danh sách girls (public)
- `GET /girls/:id` - Chi tiết girl
- `GET /girls/me/profile` - Profile của mình (GIRL role)
- `PATCH /girls/me/profile` - Update profile
- `POST /girls/:id/view` - Tăng view count
- `POST /girls/me/verification` - Yêu cầu verification
- `GET /girls/count/by-province` - Thống kê theo tỉnh

#### Posts (`/posts`)
- `GET /posts` - Danh sách posts
- `GET /posts/:id` - Chi tiết post
- `POST /posts` - Tạo post
- `PATCH /posts/:id` - Update post
- `DELETE /posts/:id` - Xóa post
- `POST /posts/:id/approve` - Duyệt post (Admin)
- `POST /posts/:id/reject` - Từ chối post (Admin)
- `POST /posts/:id/like` - Toggle like
- `POST /posts/:id/comments` - Add comment

#### Reviews (`/reviews`)
- `GET /reviews` - Danh sách reviews
- `GET /reviews/girl/:girlId` - Reviews theo girl
- `POST /reviews` - Tạo review
- `PATCH /reviews/:id` - Update review
- `DELETE /reviews/:id` - Xóa review
- `POST /reviews/:id/approve` - Duyệt review (Admin)
- `POST /reviews/:id/reject` - Từ chối review (Admin)

#### Bookings (`/bookings`)
- `GET /bookings` - Danh sách bookings
- `GET /bookings/me` - Bookings của tôi
- `POST /bookings` - Tạo booking
- `GET /bookings/:id` - Chi tiết booking
- `POST /bookings/:id/confirm` - Confirm booking
- `POST /bookings/:id/cancel` - Cancel booking
- `POST /bookings/:id/complete` - Complete booking
- `GET /bookings/available-slots` - Lấy slots khả dụng

#### Messages (`/messages`)
- `GET /messages/conversations` - Danh sách conversations
- `GET /messages/conversation/:partnerId` - Messages với partner
- `POST /messages` - Gửi message
- `PATCH /messages/:id/read` - Đánh dấu đã đọc
- `GET /messages/unread-count` - Số tin chưa đọc

#### Notifications (`/notifications`)
- `GET /notifications` - Danh sách notifications
- `GET /notifications/unread-count` - Số thông báo chưa đọc
- `PATCH /notifications/:id/read` - Đánh dấu đã đọc
- `PATCH /notifications/read-all` - Đọc tất cả

#### Admin (`/admin`)
- `GET /admin/stats` - Dashboard statistics
- `GET /admin/pending/posts` - Posts chờ duyệt
- `GET /admin/pending/reviews` - Reviews chờ duyệt
- `GET /admin/pending/verifications` - Verifications chờ duyệt
- `GET /admin/reports` - Danh sách reports
- `POST /admin/reports/:id/process` - Xử lý report
- `GET /admin/users` - Quản lý users
- `GET /admin/girls` - Quản lý girls
- `GET /admin/audit-logs` - Audit logs
- `GET /admin/settings` - System settings
- `PATCH /admin/settings` - Update settings

#### Search (`/search`)
- `GET /search/girls` - Tìm girls
- `GET /search/posts` - Tìm posts
- `GET /search/reviews` - Tìm reviews
- `GET /search` - Tìm kiếm tổng hợp

#### Upload (`/upload`)
- `POST /upload/image` - Upload 1 ảnh
- `POST /upload/images` - Upload nhiều ảnh
- `DELETE /upload/image/:publicId` - Xóa ảnh

#### Analytics (`/analytics`)
- `POST /analytics/track` - Track page view
- `POST /analytics/event` - Track event
- `GET /analytics` - Get analytics data
- `GET /admin/analytics` - Admin analytics

### 5.3. API Documentation
- **Swagger UI**: `http://localhost:3000/api/docs`
- **Function Index**: Xem file `FUNCTION_INDEX.md`

---

## 6. Frontend

### 6.1. Pages Structure

#### Public Pages
- `/` - Home page (danh sách girls)
- `/girls/[id]` - Chi tiết girl
- `/auth/login` - Đăng nhập
- `/auth/register` - Đăng ký
- `/search` - Tìm kiếm

#### User Pages (CUSTOMER)
- `/profile` - Profile cá nhân
- `/bookings` - Quản lý bookings
- `/favorites` - Danh sách yêu thích
- `/messages` - Chat/Messages
- `/reviews` - Reviews của tôi

#### Girl Pages (GIRL)
- `/dashboard` - Dashboard
- `/posts` - Quản lý posts
- `/bookings` - Quản lý bookings
- `/analytics` - Analytics
- `/settings` - Cài đặt

#### Admin Pages (ADMIN)
- `/admin` - Admin dashboard
- `/admin/posts` - Quản lý posts
- `/admin/reviews` - Quản lý reviews
- `/admin/users` - Quản lý users
- `/admin/girls` - Quản lý girls
- `/admin/reports` - Quản lý reports
- `/admin/settings` - System settings

### 6.2. State Management (Zustand)

```typescript
// Auth Store
interface AuthStore {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (credentials) => Promise<void>;
  logout: () => void;
  refreshToken: () => Promise<void>;
}
```

### 6.3. API Integration

```typescript
// Example API call
import { authApi } from '@/modules/auth/api/auth.api';

const response = await authApi.login({ email, password });
```

---

## 7. Tính Năng Chính

### 7.1. Authentication & Authorization
- ✅ JWT-based authentication
- ✅ Role-based access control (RBAC)
- ✅ Refresh token mechanism
- ✅ Password reset flow
- ✅ Email verification

### 7.2. Girl Management
- ✅ Girl profiles (có thể có hoặc không có user account)
- ✅ Verification system (CMND/CCCD)
- ✅ Image gallery
- ✅ Service packages
- ✅ Time slots management
- ✅ Analytics (views, favorites, ratings)

### 7.3. Booking System
- ✅ Create/manage bookings
- ✅ Service package selection
- ✅ Time slot selection
- ✅ Payment processing
- ✅ Booking status tracking
- ✅ Cancellation & refunds

### 7.4. Content Management
- ✅ Posts (with approval workflow)
- ✅ Reviews (with approval workflow)
- ✅ Image upload (Cloudinary)
- ✅ Like & comment system
- ✅ Categories & tags

### 7.5. Real-time Features
- ✅ Chat/Messaging (Socket.io)
- ✅ Real-time notifications
- ✅ Typing indicators
- ✅ Read receipts

### 7.6. Search & Filter
- ✅ Full-text search
- ✅ Filter by location (province, district)
- ✅ Filter by rating, verification status
- ✅ Sort by various criteria

### 7.7. Admin Features
- ✅ Dashboard with statistics
- ✅ Approval workflow (posts, reviews, verifications)
- ✅ User management
- ✅ Report handling
- ✅ Audit logs
- ✅ System settings

### 7.8. Analytics
- ✅ Page view tracking
- ✅ User behavior analytics
- ✅ Girl profile analytics
- ✅ Admin analytics dashboard

---

## 8. Scripts & Tools

### 8.1. Backend Scripts

#### Development
```bash
npm run dev              # Start development server
npm run build            # Build for production
npm run start:prod       # Start production server
```

#### Database
```bash
npx prisma generate      # Generate Prisma client
npx prisma migrate dev   # Run migrations
npx prisma studio        # Open Prisma Studio
```

#### Utilities
```bash
npm run create-admin     # Create admin user
npm run create-staff     # Create staff user
npm run import-girls     # Import girls from crawler
npm run generate-slugs   # Generate SEO slugs
```

### 8.2. Frontend Scripts

```bash
npm run dev              # Start development server
npm run build            # Build for production
npm run start            # Start production server
npm run lint             # Lint code
npm run type-check       # TypeScript type checking
```

### 8.3. Deployment Scripts

```bash
# Deploy to VPS
./deploy-to-vps.ps1      # Deploy từ Windows
./deploy.sh              # Deploy từ Linux/Mac

# SSH to VPS
./ssh-vps.ps1            # Connect to VPS
./connect-vps.bat        # Connect to VPS (Windows)

# Quick deploy
./quick-deploy.ps1       # Quick deploy script
```

---

## 9. Deployment

### 9.1. Docker Deployment

```bash
# Development
docker-compose up -d

# Production
docker-compose -f docker-compose.prod.yml up -d
```

### 9.2. Environment Variables

#### Backend (.env)
```env
DATABASE_URL="mysql://user:password@localhost:3306/girl_pick_db"
JWT_SECRET="your-secret-key"
JWT_REFRESH_SECRET="your-refresh-secret"
CLOUDINARY_CLOUD_NAME="your-cloud-name"
CLOUDINARY_API_KEY="your-api-key"
CLOUDINARY_API_SECRET="your-api-secret"
REDIS_HOST="localhost"
REDIS_PORT=6379
```

#### Frontend (.env.local)
```env
NEXT_PUBLIC_API_URL=http://localhost:3000
NEXT_PUBLIC_WS_URL=http://localhost:3000
NEXT_PUBLIC_APP_NAME=Girl Pick Platform
```

### 9.3. VPS Setup

Xem chi tiết trong:
- `setup-vps.sh` - VPS setup script
- `COPY-TO-VPS.md` - Hướng dẫn copy files to VPS
- `DOMAIN_INFO_GUIDE.md` - Hướng dẫn setup domain

---

## 10. Tài Liệu Liên Quan

### 10.1. Planning & Design
- [`PROJECT_PLAN.md`](./PROJECT_PLAN.md) - Kế hoạch dự án chi tiết (1007 dòng)
- [`CHECKLIST.md`](./CHECKLIST.md) - Checklist phát triển theo phase
- [`BOOKING_FEATURES_ADDITION.md`](./BOOKING_FEATURES_ADDITION.md) - Tính năng booking

### 10.2. Technical Documentation
- [`FUNCTION_INDEX.md`](./FUNCTION_INDEX.md) - Index tất cả functions/APIs
- [`backend/README.md`](./backend/README.md) - Backend documentation
- [`frontend/README.md`](./frontend/README.md) - Frontend documentation
- [`backend/DATABASE_DESIGN.md`](./backend/DATABASE_DESIGN.md) - Database design

### 10.3. Deployment & DevOps
- [`README-DOCKER.md`](./README-DOCKER.md) - Docker setup
- [`COPY-TO-VPS.md`](./COPY-TO-VPS.md) - Deploy to VPS
- [`DOMAIN_INFO_GUIDE.md`](./DOMAIN_INFO_GUIDE.md) - Domain setup
- [`HUONG-DAN-EXPORT-MYSQL.md`](./HUONG-DAN-EXPORT-MYSQL.md) - MySQL export guide

### 10.4. Backend Specific
- [`backend/BACKEND_FEATURES_SUMMARY.md`](./backend/BACKEND_FEATURES_SUMMARY.md)
- [`backend/REDIS_FLOW.md`](./backend/REDIS_FLOW.md) - Redis caching flow
- [`backend/STORAGE_BEST_PRACTICES.md`](./backend/STORAGE_BEST_PRACTICES.md)
- [`backend/UPLOAD_IMAGES_GUIDE.md`](./backend/UPLOAD_IMAGES_GUIDE.md)
- [`backend/HOW_TO_CREATE_ADMIN.md`](./backend/HOW_TO_CREATE_ADMIN.md)

### 10.5. Frontend Specific
- [`frontend/AUTHENTICATION_SYSTEM.md`](./frontend/AUTHENTICATION_SYSTEM.md)
- [`frontend/UI_DESIGN_SUMMARY.md`](./frontend/UI_DESIGN_SUMMARY.md)
- [`frontend/DEPLOY_VERCEL.md`](./frontend/DEPLOY_VERCEL.md)
- [`frontend/SEO_GOOGLE_INDEX_GUIDE.md`](./frontend/SEO_GOOGLE_INDEX_GUIDE.md)

---

## 📊 Quick Stats

### Backend Modules
- **27 modules** trong `backend/src/modules/`
- **776 dòng** trong Prisma schema
- **30+ database tables**
- **100+ API endpoints**

### Frontend Modules
- **13 modules** trong `frontend/src/modules/`
- **Next.js 14** với App Router
- **Tailwind CSS** cho styling
- **Zustand** cho state management

### Database
- **MySQL** database
- **Prisma ORM** với type-safety
- **Redis** cho caching
- **Cloudinary** cho image storage

---

## 🚀 Quick Start Guide

### 1. Clone Repository
```bash
git clone https://github.com/vthuan-dev/girl-picks.git
cd girl-picks
```

### 2. Setup Backend
```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your configuration
npx prisma generate
npx prisma migrate dev
npm run create-admin
npm run dev
```

### 3. Setup Frontend
```bash
cd frontend
npm install
cp .env.local.example .env.local
# Edit .env.local with your configuration
npm run dev
```

### 4. Access Application
- Frontend: http://localhost:3001
- Backend API: http://localhost:3000
- API Docs: http://localhost:3000/api/docs

---

## 🔗 Important Links

- **Repository**: https://github.com/vthuan-dev/girl-picks
- **API Documentation**: http://localhost:3000/api/docs
- **Prisma Studio**: `npx prisma studio`

---

## 📝 Notes

### Development Workflow
1. Tạo feature branch từ `main`
2. Develop & test locally
3. Commit với convention: `feat:`, `fix:`, `docs:`, etc.
4. Push và tạo Pull Request
5. Review & merge

### Code Quality
- **ESLint** cho linting
- **Prettier** cho formatting
- **TypeScript** cho type safety
- **Prisma** cho database type safety

### Security
- JWT authentication
- Password hashing (bcrypt)
- Rate limiting
- CORS protection
- Input validation
- SQL injection prevention (Prisma)

---

**Last Updated**: 2025-12-12
**Maintained by**: [@vthuan-dev](https://github.com/vthuan-dev)
