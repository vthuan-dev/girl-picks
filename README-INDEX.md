# 🎯 Girl Pick Platform

> **Nền tảng kết nối dịch vụ giải trí** - Platform kết nối người cung cấp dịch vụ với khách hàng

[![NestJS](https://img.shields.io/badge/NestJS-E0234E?style=flat&logo=nestjs&logoColor=white)](https://nestjs.com/)
[![Next.js](https://img.shields.io/badge/Next.js-000000?style=flat&logo=next.js&logoColor=white)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=flat&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![MySQL](https://img.shields.io/badge/MySQL-4479A1?style=flat&logo=mysql&logoColor=white)](https://www.mysql.com/)
[![Prisma](https://img.shields.io/badge/Prisma-2D3748?style=flat&logo=prisma&logoColor=white)](https://www.prisma.io/)

---

## 📚 Tài Liệu Chính

| 📄 Tài Liệu | 📝 Mô Tả | 🔗 Link |
|------------|---------|--------|
| **PROJECT_INDEX.md** | 📚 Chỉ mục tổng hợp toàn bộ dự án (600+ dòng) | [Xem](./PROJECT_INDEX.md) |
| **README-QUICK.md** | ⚡ Hướng dẫn nhanh & tham khảo | [Xem](./README-QUICK.md) |
| **MODULE_INDEX.md** | 🗂️ Index 27 backend + 13 frontend modules | [Xem](./MODULE_INDEX.md) |
| **DATABASE_INDEX.md** | 💾 Schema 30+ tables với relationships | [Xem](./DATABASE_INDEX.md) |
| **FUNCTION_INDEX.md** | 🔍 Index 100+ API endpoints | [Xem](./FUNCTION_INDEX.md) |
| **PROJECT_PLAN.md** | 📋 Kế hoạch dự án chi tiết (1007 dòng) | [Xem](./PROJECT_PLAN.md) |
| **CHECKLIST.md** | ✅ Checklist phát triển theo phase | [Xem](./CHECKLIST.md) |

---

## 🚀 Quick Start

### Prerequisites
- Node.js >= 18.x
- MySQL >= 8.x
- npm hoặc yarn

### 1️⃣ Clone Repository
```bash
git clone https://github.com/vthuan-dev/girl-picks.git
cd girl-picks
```

### 2️⃣ Setup Backend
```bash
cd backend
npm install
cp .env.example .env
# Chỉnh sửa .env với cấu hình của bạn
npx prisma generate
npx prisma migrate dev
npm run create-admin
npm run dev
```

### 3️⃣ Setup Frontend
```bash
cd frontend
npm install
cp .env.local.example .env.local
# Chỉnh sửa .env.local với cấu hình của bạn
npm run dev
```

### 4️⃣ Access Application
- **Frontend**: http://localhost:3001
- **Backend API**: http://localhost:3000
- **API Docs**: http://localhost:3000/api/docs
- **Prisma Studio**: `npx prisma studio`

---

## 🏗️ Kiến Trúc

```
┌─────────────────────────────────────────────────────────┐
│                    Frontend (Next.js 14)                │
│              React 18 + TypeScript + Tailwind           │
│                     Port: 3001                          │
└──────────────────────┬──────────────────────────────────┘
                       │ HTTP/WebSocket
                       ▼
┌─────────────────────────────────────────────────────────┐
│                 Backend (NestJS)                        │
│              TypeScript + Prisma ORM                    │
│                     Port: 3000                          │
└──────────────────────┬──────────────────────────────────┘
                       │
        ┌──────────────┼──────────────┬──────────────┐
        ▼              ▼              ▼              ▼
   ┌────────┐     ┌────────┐    ┌──────────┐   ┌──────────┐
   │ MySQL  │     │ Redis  │    │Cloudinary│   │Socket.io │
   │   DB   │     │ Cache  │    │ (Images) │   │  (Chat)  │
   └────────┘     └────────┘    └──────────┘   └──────────┘
```

---

## 📊 Tech Stack

### Backend
- **Framework**: NestJS (TypeScript)
- **Database**: MySQL 8.x
- **ORM**: Prisma
- **Authentication**: JWT + bcrypt
- **Real-time**: Socket.io
- **Cache**: Redis
- **File Storage**: Cloudinary
- **Security**: Helmet, Throttler (Rate Limiting)
- **Validation**: class-validator, class-transformer

### Frontend
- **Framework**: Next.js 14 (App Router)
- **UI Library**: React 18
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **State**: Zustand
- **Forms**: React Hook Form + Zod
- **HTTP**: Axios
- **Real-time**: Socket.io Client
- **Notifications**: React Hot Toast

---

## 📦 Project Structure

```
girl-pick/
├── backend/              # NestJS Backend API
│   ├── src/
│   │   ├── modules/      # 27 feature modules
│   │   ├── common/       # Shared utilities
│   │   ├── config/       # Configuration
│   │   └── prisma/       # Prisma service
│   ├── prisma/
│   │   └── schema.prisma # Database schema (776 lines, 30+ tables)
│   └── scripts/          # Utility scripts
│
├── frontend/             # Next.js Frontend
│   ├── src/
│   │   ├── app/          # Next.js App Router
│   │   ├── modules/      # 13 feature modules
│   │   ├── components/   # Shared components
│   │   ├── lib/          # Utilities & API client
│   │   └── store/        # Zustand stores
│   └── public/           # Static assets
│
├── crawler/              # Web crawler scripts
├── scripts/              # Deployment scripts
├── nginx/                # Nginx configuration
└── mysql/                # MySQL data
```

---

## 🎯 Core Features

### ✅ Authentication & Authorization
- JWT-based authentication
- Role-based access control (ADMIN, STAFF_UPLOAD, GIRL, CUSTOMER)
- Refresh token mechanism
- Password reset flow

### ✅ User Management
- User profiles với avatar
- Girl profiles (có thể có hoặc không có user account)
- Verification system (CMND/CCCD)
- Analytics & statistics

### ✅ Content Management
- Posts với approval workflow
- Reviews với approval workflow
- Image upload (Cloudinary)
- Like & comment system
- Categories & tags

### ✅ Booking System
- Service bookings
- Service packages
- Time slots management
- Blocked dates
- Payment processing
- Booking history

### ✅ Real-time Features
- Chat/Messaging (Socket.io)
- Real-time notifications
- Typing indicators
- Read receipts

### ✅ Search & Filter
- Full-text search
- Filter by location, rating, verification
- Sort by multiple criteria
- Pagination

### ✅ Admin Features
- Dashboard với statistics
- Approval workflow
- User management
- Report handling
- Audit logs
- System settings

---

## 💾 Database

### Core Tables (30+ tables)
- **users** - User accounts
- **girls** - Girl profiles
- **posts** - Bài viết/quảng cáo
- **reviews** - Customer reviews
- **bookings** - Service bookings
- **messages** - Chat messages
- **notifications** - Notifications
- **payments** - Payments
- **categories** - Categories
- **albums** - Photo albums

**📖 Chi tiết**: Xem [DATABASE_INDEX.md](./DATABASE_INDEX.md)

---

## 🔌 API Endpoints (100+ endpoints)

### Authentication
```
POST   /auth/register       # Đăng ký
POST   /auth/login          # Đăng nhập
POST   /auth/refresh        # Refresh token
POST   /auth/forgot-password
POST   /auth/reset-password
```

### Girls
```
GET    /girls               # Danh sách girls
GET    /girls/:id           # Chi tiết girl
POST   /girls/:id/view      # Tăng view count
GET    /girls/me/profile    # Profile của mình
PATCH  /girls/me/profile    # Update profile
POST   /girls/me/verification
```

### Posts
```
GET    /posts               # Danh sách posts
POST   /posts               # Tạo post
PATCH  /posts/:id           # Update post
DELETE /posts/:id           # Xóa post
POST   /posts/:id/approve   # Duyệt (Admin)
POST   /posts/:id/reject    # Từ chối (Admin)
POST   /posts/:id/like      # Toggle like
POST   /posts/:id/comments  # Add comment
```

### Bookings
```
GET    /bookings            # Danh sách bookings
POST   /bookings            # Tạo booking
POST   /bookings/:id/confirm
POST   /bookings/:id/cancel
POST   /bookings/:id/complete
GET    /bookings/available-slots
```

### Admin
```
GET    /admin/stats         # Dashboard stats
GET    /admin/pending/posts
GET    /admin/pending/reviews
GET    /admin/users
GET    /admin/girls
GET    /admin/reports
POST   /admin/reports/:id/process
```

**📖 Full API Documentation**: 
- Swagger UI: http://localhost:3000/api/docs
- Function Index: [FUNCTION_INDEX.md](./FUNCTION_INDEX.md)

---

## 🛠️ Development

### Backend Commands
```bash
npm run dev              # Development mode
npm run build            # Build for production
npm run start:prod       # Start production
npm run create-admin     # Create admin user
npm run import-girls     # Import girls from crawler
npx prisma studio        # Open Prisma Studio
npx prisma migrate dev   # Run migrations
```

### Frontend Commands
```bash
npm run dev              # Development mode
npm run build            # Build for production
npm run start            # Start production
npm run lint             # Lint code
npm run type-check       # TypeScript check
```

---

## 🚢 Deployment

### Docker
```bash
# Development
docker-compose up -d

# Production
docker-compose -f docker-compose.prod.yml up -d
```

### VPS Deployment
```bash
# Windows
./deploy-to-vps.ps1

# Linux/Mac
./deploy.sh
```

**📖 Chi tiết**: 
- [README-DOCKER.md](./README-DOCKER.md)
- [COPY-TO-VPS.md](./COPY-TO-VPS.md)
- [DOMAIN_INFO_GUIDE.md](./DOMAIN_INFO_GUIDE.md)

---

## 📝 Environment Variables

### Backend (.env)
```env
DATABASE_URL="mysql://user:password@localhost:3306/girl_pick_db"
JWT_SECRET="your-secret-key"
JWT_REFRESH_SECRET="your-refresh-secret"
CLOUDINARY_CLOUD_NAME="your-cloud-name"
CLOUDINARY_API_KEY="your-api-key"
CLOUDINARY_API_SECRET="your-api-secret"
REDIS_HOST="localhost"
REDIS_PORT=6379
PORT=3000
```

### Frontend (.env.local)
```env
NEXT_PUBLIC_API_URL=http://localhost:3000
NEXT_PUBLIC_WS_URL=http://localhost:3000
NEXT_PUBLIC_APP_NAME=Girl Pick Platform
```

---

## 🔒 Security

- ✅ JWT authentication với refresh tokens
- ✅ Password hashing (bcrypt, 10+ rounds)
- ✅ Rate limiting (10 requests/minute)
- ✅ CORS protection
- ✅ Helmet security headers
- ✅ Input validation (class-validator, Zod)
- ✅ SQL injection prevention (Prisma ORM)
- ✅ XSS protection
- ✅ CSRF protection

---

## 📊 Project Stats

- **Backend Modules**: 27
- **Frontend Modules**: 13
- **Database Tables**: 30+
- **API Endpoints**: 100+
- **Lines of Code**: 
  - Prisma Schema: 776 lines
  - Project Plan: 1007 lines
  - Function Index: 394 lines

---

## 📚 Additional Documentation

### Planning & Design
- [PROJECT_PLAN.md](./PROJECT_PLAN.md) - Kế hoạch chi tiết
- [CHECKLIST.md](./CHECKLIST.md) - Checklist phát triển
- [BOOKING_FEATURES_ADDITION.md](./BOOKING_FEATURES_ADDITION.md)

### Backend
- [backend/README.md](./backend/README.md)
- [backend/DATABASE_DESIGN.md](./backend/DATABASE_DESIGN.md)
- [backend/REDIS_FLOW.md](./backend/REDIS_FLOW.md)
- [backend/STORAGE_BEST_PRACTICES.md](./backend/STORAGE_BEST_PRACTICES.md)
- [backend/UPLOAD_IMAGES_GUIDE.md](./backend/UPLOAD_IMAGES_GUIDE.md)

### Frontend
- [frontend/README.md](./frontend/README.md)
- [frontend/AUTHENTICATION_SYSTEM.md](./frontend/AUTHENTICATION_SYSTEM.md)
- [frontend/UI_DESIGN_SUMMARY.md](./frontend/UI_DESIGN_SUMMARY.md)
- [frontend/SEO_GOOGLE_INDEX_GUIDE.md](./frontend/SEO_GOOGLE_INDEX_GUIDE.md)

---

## 🐛 Troubleshooting

### Database Connection Error
```bash
# Verify MySQL is running
# Check DATABASE_URL in .env
npx prisma migrate reset
```

### Port Already in Use
```bash
# Change PORT in .env
# Or kill process: lsof -ti:3000 | xargs kill
```

### Build Errors
```bash
# Clear cache
rm -rf .next node_modules
npm install
npm run build
```

---

## 🤝 Contributing

1. Create feature branch: `git checkout -b feature/amazing-feature`
2. Commit changes: `git commit -m 'feat: add amazing feature'`
3. Push to branch: `git push origin feature/amazing-feature`
4. Open Pull Request

### Commit Convention
- `feat:` - New feature
- `fix:` - Bug fix
- `docs:` - Documentation
- `chore:` - Maintenance
- `refactor:` - Code refactoring
- `test:` - Testing

---

## 📞 Contact

- **GitHub**: [@vthuan-dev](https://github.com/vthuan-dev)
- **Repository**: [girl-picks](https://github.com/vthuan-dev/girl-picks)

---

## 📄 License

This project is private and proprietary.

---

## 🎯 Next Steps

1. ✅ Đọc [PROJECT_INDEX.md](./PROJECT_INDEX.md) để hiểu tổng quan
2. ✅ Xem [README-QUICK.md](./README-QUICK.md) cho quick reference
3. ✅ Tham khảo [MODULE_INDEX.md](./MODULE_INDEX.md) để hiểu modules
4. ✅ Xem [DATABASE_INDEX.md](./DATABASE_INDEX.md) để hiểu database
5. ✅ Follow [CHECKLIST.md](./CHECKLIST.md) để phát triển

---

**Built with ❤️ using NestJS & Next.js**

**Last Updated**: 2025-12-12
