# 🎯 Girl Pick Platform - Quick Reference

> **Tài liệu tham khảo nhanh** - Hướng dẫn nhanh để hiểu và làm việc với dự án

---

## 📌 Tài Liệu Chính

| Tài Liệu | Mô Tả | Link |
|----------|-------|------|
| **PROJECT_INDEX.md** | 📚 Chỉ mục tổng hợp toàn bộ dự án | [Xem](./PROJECT_INDEX.md) |
| **PROJECT_PLAN.md** | 📋 Kế hoạch dự án chi tiết | [Xem](./PROJECT_PLAN.md) |
| **FUNCTION_INDEX.md** | 🔍 Index tất cả functions/APIs | [Xem](./FUNCTION_INDEX.md) |
| **CHECKLIST.md** | ✅ Checklist phát triển | [Xem](./CHECKLIST.md) |

---

## 🚀 Quick Start

### 1️⃣ Setup Backend
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

### 2️⃣ Setup Frontend
```bash
cd frontend
npm install
cp .env.local.example .env.local
# Chỉnh sửa .env.local với cấu hình của bạn
npm run dev
```

### 3️⃣ Access Application
- **Frontend**: http://localhost:3001
- **Backend API**: http://localhost:3000
- **API Docs**: http://localhost:3000/api/docs
- **Prisma Studio**: `npx prisma studio` (trong thư mục backend)

---

## 🏗️ Kiến Trúc

```
┌─────────────────┐
│   Frontend      │ Next.js 14 (Port 3001)
│   React + TS    │
└────────┬────────┘
         │ HTTP/WebSocket
         ▼
┌─────────────────┐
│   Backend       │ NestJS (Port 3000)
│   API Server    │
└────────┬────────┘
         │
    ┌────┴────┬──────────┬──────────┐
    ▼         ▼          ▼          ▼
┌────────┐ ┌─────┐  ┌────────┐ ┌─────────┐
│ MySQL  │ │Redis│  │Cloudinary│ │Socket.io│
└────────┘ └─────┘  └────────┘ └─────────┘
```

---

## 📂 Cấu Trúc Thư Mục

```
girl-pick/
├── backend/              # NestJS Backend
│   ├── src/
│   │   ├── modules/      # 27 feature modules
│   │   ├── common/       # Shared utilities
│   │   └── prisma/       # Prisma service
│   ├── prisma/
│   │   └── schema.prisma # Database schema (776 lines)
│   └── scripts/          # Utility scripts
│
├── frontend/             # Next.js Frontend
│   ├── src/
│   │   ├── app/          # Next.js App Router
│   │   ├── modules/      # 13 feature modules
│   │   ├── components/   # Shared components
│   │   └── lib/          # Utilities
│   └── public/           # Static assets
│
├── crawler/              # Web crawler
├── scripts/              # Deployment scripts
└── docs/                 # Documentation
```

---

## 🔑 User Roles

| Role | Mô Tả | Quyền Hạn |
|------|-------|-----------|
| **ADMIN** | Quản trị viên | Toàn quyền quản lý hệ thống |
| **STAFF_UPLOAD** | Nhân viên upload | Upload và quản lý nội dung |
| **GIRL** | Người cung cấp dịch vụ | Quản lý profile, bookings |
| **CUSTOMER** | Khách hàng | Xem, đặt lịch, review |

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
- **districts** - Locations

### Database Commands
```bash
# Generate Prisma client
npx prisma generate

# Run migrations
npx prisma migrate dev

# Open Prisma Studio
npx prisma studio

# Reset database
npx prisma migrate reset
```

---

## 🔌 API Endpoints (100+ endpoints)

### Authentication
- `POST /auth/register` - Đăng ký
- `POST /auth/login` - Đăng nhập
- `POST /auth/refresh` - Refresh token

### Girls
- `GET /girls` - Danh sách girls
- `GET /girls/:id` - Chi tiết girl
- `POST /girls/:id/view` - Tăng view

### Posts
- `GET /posts` - Danh sách posts
- `POST /posts` - Tạo post
- `POST /posts/:id/approve` - Duyệt post (Admin)

### Bookings
- `GET /bookings` - Danh sách bookings
- `POST /bookings` - Tạo booking
- `POST /bookings/:id/confirm` - Confirm booking

### Admin
- `GET /admin/stats` - Dashboard stats
- `GET /admin/pending/posts` - Posts chờ duyệt
- `GET /admin/users` - Quản lý users

**📖 Full API Documentation**: http://localhost:3000/api/docs

---

## 🛠️ Common Commands

### Backend
```bash
npm run dev              # Development mode
npm run build            # Build for production
npm run start:prod       # Start production
npm run create-admin     # Create admin user
npm run import-girls     # Import girls from crawler
```

### Frontend
```bash
npm run dev              # Development mode
npm run build            # Build for production
npm run start            # Start production
npm run lint             # Lint code
```

### Deployment
```bash
./deploy-to-vps.ps1      # Deploy to VPS (Windows)
./deploy.sh              # Deploy to VPS (Linux/Mac)
docker-compose up -d     # Start with Docker
```

---

## 🔒 Security

- ✅ JWT authentication
- ✅ Password hashing (bcrypt)
- ✅ Rate limiting
- ✅ CORS protection
- ✅ Input validation
- ✅ SQL injection prevention (Prisma)

---

## 📊 Tech Stack

### Backend
- **NestJS** - Framework
- **Prisma** - ORM
- **MySQL** - Database
- **Redis** - Cache
- **Socket.io** - Real-time
- **Cloudinary** - Image storage

### Frontend
- **Next.js 14** - Framework
- **React 18** - UI library
- **Tailwind CSS** - Styling
- **Zustand** - State management
- **React Hook Form** - Forms
- **Socket.io Client** - Real-time

---

## 📝 Environment Variables

### Backend (.env)
```env
DATABASE_URL="mysql://user:password@localhost:3306/girl_pick_db"
JWT_SECRET="your-secret-key"
CLOUDINARY_CLOUD_NAME="your-cloud-name"
CLOUDINARY_API_KEY="your-api-key"
CLOUDINARY_API_SECRET="your-api-secret"
REDIS_HOST="localhost"
REDIS_PORT=6379
```

### Frontend (.env.local)
```env
NEXT_PUBLIC_API_URL=http://localhost:3000
NEXT_PUBLIC_WS_URL=http://localhost:3000
```

---

## 🐛 Troubleshooting

### Database Connection Error
```bash
# Check MySQL is running
# Verify DATABASE_URL in .env
npx prisma migrate reset
```

### Port Already in Use
```bash
# Change PORT in .env
# Or kill process using the port
```

### Build Errors
```bash
# Clear cache
rm -rf .next node_modules
npm install
npm run build
```

---

## 📚 Tài Liệu Chi Tiết

### Planning
- [PROJECT_INDEX.md](./PROJECT_INDEX.md) - Chỉ mục tổng hợp
- [PROJECT_PLAN.md](./PROJECT_PLAN.md) - Kế hoạch chi tiết
- [CHECKLIST.md](./CHECKLIST.md) - Checklist phát triển

### Technical
- [FUNCTION_INDEX.md](./FUNCTION_INDEX.md) - API index
- [backend/README.md](./backend/README.md) - Backend docs
- [frontend/README.md](./frontend/README.md) - Frontend docs

### Deployment
- [README-DOCKER.md](./README-DOCKER.md) - Docker setup
- [COPY-TO-VPS.md](./COPY-TO-VPS.md) - VPS deployment
- [DOMAIN_INFO_GUIDE.md](./DOMAIN_INFO_GUIDE.md) - Domain setup

---

## 🔗 Links

- **Repository**: https://github.com/vthuan-dev/girl-picks
- **API Docs**: http://localhost:3000/api/docs
- **Prisma Studio**: `npx prisma studio`

---

## 👥 Contact

- **GitHub**: [@vthuan-dev](https://github.com/vthuan-dev)
- **Repository**: [girl-picks](https://github.com/vthuan-dev/girl-picks)

---

**Last Updated**: 2025-12-12
