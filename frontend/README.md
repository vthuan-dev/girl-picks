# Girl Pick Platform - Frontend

Frontend cho nền tảng đặt lịch dịch vụ giải trí (booking companions for drinking/dating).

## 🚀 Tech Stack

- **Framework**: Next.js 14 (React 18 + TypeScript)
- **Styling**: Tailwind CSS
- **State Management**: Zustand
- **API Client**: Axios
- **Form Handling**: React Hook Form + Zod
- **Real-time**: Socket.io Client
- **Notifications**: React Hot Toast
- **Data Fetching**: React Query

## 📋 Features

### Core Modules (Đã triển khai)
- ✅ **Authentication** - Login, Register, Token management
- ✅ **Users** - Profile management, Avatar upload
- ✅ **Girls** - Profile list, Detail view, Search & Filter
- ✅ **Districts** - Location management

### Booking System (Sẽ triển khai)
- ⏳ **Bookings** - Create, View, Manage bookings
- ⏳ **Service Packages** - View and select packages
- ⏳ **Time Slots** - Select available time slots
- ⏳ **Payments** - Payment processing
- ⏳ **Venues** - Location selection

### Content & Social (Sẽ triển khai)
- ⏳ **Posts** - View and create posts
- ⏳ **Reviews** - Write and view reviews
- ⏳ **Messages** - Real-time chat
- ⏳ **Notifications** - Real-time notifications

### Utilities (Sẽ triển khai)
- ⏳ **Reports** - Report users/content
- ⏳ **Favorites** - Add/remove favorites
- ⏳ **Search** - Full-text search
- ⏳ **Admin Dashboard** - Admin panel

## 🏗️ Project Structure

```
frontend/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   ├── globals.css
│   │   ├── auth/
│   │   │   ├── login/
│   │   │   └── register/
│   │   └── ...
│   ├── modules/                 # Feature modules
│   │   ├── auth/
│   │   │   ├── api/
│   │   │   └── components/
│   │   ├── users/
│   │   │   ├── api/
│   │   │   └── components/
│   │   ├── girls/
│   │   │   ├── api/
│   │   │   └── components/
│   │   └── districts/
│   │       ├── api/
│   │       └── components/
│   ├── lib/                    # Utilities
│   │   └── api/
│   │       ├── client.ts
│   │       └── types.ts
│   ├── store/                  # State management
│   │   └── auth.store.ts
│   ├── types/                  # TypeScript types
│   │   ├── auth.ts
│   │   ├── user.ts
│   │   ├── girl.ts
│   │   └── district.ts
│   ├── components/              # Shared components
│   └── hooks/                   # Custom hooks
├── public/                      # Static assets
├── package.json
├── tsconfig.json
├── tailwind.config.js
├── next.config.js
└── README.md
```

## 🔧 Installation

### Prerequisites
- Node.js >= 18.x
- npm or yarn

### Setup

1. **Install dependencies**
```bash
cd frontend
npm install
```

2. **Environment configuration**

Create `.env.local` file:
```env
NEXT_PUBLIC_API_URL=http://localhost:3000
NEXT_PUBLIC_WS_URL=http://localhost:3000
NEXT_PUBLIC_APP_NAME=Girl Pick Platform
```

3. **Run development server**
```bash
npm run dev
```

Open [http://localhost:3001](http://localhost:3001) in your browser.

## 🎨 Design System

### Colors
- **Primary**: `#ff0000` (Red)
- **Secondary**: `#4a4a4a` (Dark Gray)
- **Background**: `#151515` (Dark)
- **Text**: `#ffffff` (White)

### Typography
- **Font Family**: -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Helvetica Neue, Arial
- **Font Sizes**: 12px, 14px, 16px, 18px, 20px, 24px

### Spacing
- **System**: 8px base unit
- **Values**: 1px, 2px, 4px, 8px, 12px, 16px, 20px

### Border Radius
- **Small**: 3px
- **Default**: 4px
- **Medium**: 6px

## 📦 Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Lint code
npm run type-check   # TypeScript type checking
```

## 🔐 Authentication Flow

1. User logs in via `/auth/login`
2. Access token stored in HTTP-only cookies
3. Token automatically added to API requests
4. Token refresh handled automatically on 401 errors
5. User redirected to login on refresh failure

## 🔌 API Integration

### API Client
- Base URL: `http://localhost:3000/api`
- Automatic token injection
- Automatic token refresh on 401
- Error handling

### Example Usage
```typescript
import { authApi } from '@/modules/auth/api/auth.api';

const response = await authApi.login({ email, password });
```

## 🧭 Routing

- `/` - Home page (Girl list)
- `/auth/login` - Login page
- `/auth/register` - Register page
- `/girls/[id]` - Girl detail page (sẽ triển khai)
- `/profile` - User profile page (sẽ triển khai)
- `/bookings` - Bookings page (sẽ triển khai)

## 🔒 Security Features

- JWT token stored in HTTP-only cookies
- Automatic token refresh
- Protected routes (sẽ triển khai)
- Input validation with Zod
- XSS protection

## 📈 Performance

- Next.js App Router for optimal performance
- Image optimization with Next.js Image
- Code splitting
- Server-side rendering where applicable

## 🐛 Common Issues

### API Connection Error
```bash
# Check backend is running
# Verify NEXT_PUBLIC_API_URL in .env.local
```

### Build Errors
```bash
# Clear .next folder
rm -rf .next
npm run build
```

## 🤝 Contributing

1. Create feature branch: `git checkout -b feature/amazing-feature`
2. Commit changes: `git commit -m 'feat: add amazing feature'`
3. Push to branch: `git push origin feature/amazing-feature`
4. Open Pull Request

## 📝 Git Commit Convention

- `feat:` - New feature
- `fix:` - Bug fix
- `docs:` - Documentation
- `chore:` - Maintenance
- `refactor:` - Code refactoring
- `test:` - Testing

## 📞 Contact

- GitHub: [@vthuan-dev](https://github.com/vthuan-dev)
- Repository: [girl-picks](https://github.com/vthuan-dev/girl-picks)

## 📄 License

This project is private and proprietary.

---

**Built with ❤️ using Next.js**

