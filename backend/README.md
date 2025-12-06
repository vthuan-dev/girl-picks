# Girl Pick Platform - Backend API

Backend API cho nền tảng đặt lịch dịch vụ giải trí (booking companions for drinking/dating).

## 🚀 Tech Stack

- **Framework**: NestJS (TypeScript)
- **Database**: PostgreSQL
- **ORM**: Prisma
- **Authentication**: JWT + bcrypt
- **Real-time**: Socket.io
- **Validation**: class-validator, class-transformer
- **API Documentation**: Swagger/OpenAPI
- **Security**: Helmet, Throttler (Rate Limiting)

## 📋 Features

### Core Modules
- ✅ **Authentication** - Register, Login, Refresh Token, Password Reset
- ✅ **Users** - Profile management, Avatar upload, Admin operations
- ✅ **Girls** - Profile, Verification, Analytics, Ratings
- ✅ **Districts** - Location management

### Booking System
- ✅ **Bookings** - Create, Confirm, Cancel, Complete bookings
- ✅ **Service Packages** - CRUD service packages for girls
- ✅ **Time Slots** - Manage available time slots
- ✅ **Blocked Dates** - Block specific dates
- ✅ **Payments** - Payment processing, Refunds
- ✅ **Venues** - Location management with coordinates

### Content & Social
- ✅ **Posts** - CRUD with approval workflow
- ✅ **Reviews** - CRUD with approval workflow, Auto-update ratings
- ✅ **Messages** - Real-time chat with Socket.io
- ✅ **Notifications** - Real-time notifications

### Utilities
- ✅ **Reports** - Report users/content
- ✅ **Favorites** - Add/remove favorites
- ✅ **Search** - Full-text search across girls, posts, reviews
- ✅ **Admin Dashboard** - Statistics, Pending approvals, Reports management

## 🏗️ Project Structure

```
backend/
├── src/
│   ├── main.ts
│   ├── app.module.ts
│   ├── config/              # Configuration files
│   ├── common/              # Shared utilities
│   │   ├── decorators/
│   │   ├── guards/
│   │   ├── interceptors/
│   │   ├── filters/
│   │   └── utils/
│   ├── modules/
│   │   ├── auth/
│   │   ├── users/
│   │   ├── girls/
│   │   ├── posts/
│   │   ├── reviews/
│   │   ├── messages/
│   │   ├── bookings/
│   │   ├── service-packages/
│   │   ├── time-slots/
│   │   ├── blocked-dates/
│   │   ├── payments/
│   │   ├── venues/
│   │   ├── notifications/
│   │   ├── districts/
│   │   ├── reports/
│   │   ├── favorites/
│   │   ├── search/
│   │   └── admin/
│   └── prisma/
│       └── prisma.service.ts
├── prisma/
│   └── schema.prisma
├── test/
├── .env.example
├── package.json
└── README.md
```

## 🔧 Installation

### Prerequisites
- Node.js >= 18.x
- PostgreSQL >= 14.x
- npm or yarn

### Setup

1. **Clone repository**
```bash
git clone https://github.com/vthuan-dev/girl-picks.git
cd girl-picks/backend
```

2. **Install dependencies**
```bash
npm install
```

3. **Environment configuration**
```bash
cp .env.example .env
```

Edit `.env` with your configuration:
```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/girl_pick_db"

# JWT
JWT_SECRET="your-secret-key-here"
JWT_EXPIRES_IN="1h"
JWT_REFRESH_SECRET="your-refresh-secret-key"
JWT_REFRESH_EXPIRES_IN="7d"

# Server
PORT=3000
NODE_ENV=development

# Frontend URL (for CORS)
FRONTEND_URL="http://localhost:3001"

# Cloudinary (for image uploads)
CLOUDINARY_CLOUD_NAME="your-cloud-name"
CLOUDINARY_API_KEY="your-api-key"
CLOUDINARY_API_SECRET="your-api-secret"

# Email (optional)
EMAIL_HOST="smtp.gmail.com"
EMAIL_PORT=587
EMAIL_USER="your-email@gmail.com"
EMAIL_PASS="your-app-password"
```

4. **Database setup**
```bash
# Generate Prisma Client
npx prisma generate

# Run migrations
npx prisma migrate dev

# Seed database (optional)
npx prisma db seed
```

5. **Run application**
```bash
# Development
npm run start:dev

# Production
npm run build
npm run start:prod
```

## 📚 API Documentation

Sau khi chạy server, truy cập Swagger documentation tại:
```
http://localhost:3000/api/docs
```

## 🔐 Authentication

### User Roles
- `CUSTOMER` - Book services, write reviews
- `GIRL` - Provide services, manage profile
- `ADMIN` - Manage platform, approve content

### Auth Flow
1. **Register**: `POST /auth/register`
2. **Login**: `POST /auth/login` → Returns `accessToken` & `refreshToken`
3. **Protected Routes**: Add header `Authorization: Bearer {accessToken}`
4. **Refresh Token**: `POST /auth/refresh` with `refreshToken`

## 🔌 WebSocket (Socket.io)

### Events

**Client → Server**:
- `sendMessage` - Send a message
- `joinConversation` - Join conversation room
- `typing` - Typing indicator
- `markAsRead` - Mark message as read

**Server → Client**:
- `newMessage` - New message received
- `userTyping` - User is typing
- `messageRead` - Message was read

### Connection
```javascript
const socket = io('http://localhost:3000', {
  auth: {
    token: 'your-jwt-token'
  }
});
```

## 📊 Database Models

### Main Tables
- **User** - User accounts (Customer, Girl, Admin)
- **Girl** - Girl profiles with verification
- **Post** - Content posts with approval
- **Review** - Customer reviews with approval
- **Booking** - Service bookings
- **Payment** - Payment transactions
- **Message** - Chat messages
- **Notification** - User notifications
- **District** - Location districts
- **Report** - Content reports
- **Favorite** - User favorites

## 🧪 Testing

```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Test coverage
npm run test:cov
```

## 📦 Scripts

```bash
npm run start          # Start application
npm run start:dev      # Development mode with watch
npm run start:prod     # Production mode
npm run build          # Build for production
npm run lint           # Lint code
npm run format         # Format code with Prettier
npm run prisma:studio  # Open Prisma Studio
npm run prisma:migrate # Run migrations
npm run prisma:seed    # Seed database
```

## 🔒 Security Features

- JWT authentication with refresh tokens
- Password hashing with bcrypt
- Rate limiting (10 requests/minute)
- CORS protection
- Helmet security headers
- Input validation
- SQL injection protection (Prisma)

## 📈 Performance

- Database query optimization
- Pagination on list endpoints
- Efficient database indexes
- Connection pooling

## 🐛 Common Issues

### Database Connection Error
```bash
# Check PostgreSQL is running
sudo service postgresql status

# Reset database
npx prisma migrate reset
```

### Port Already in Use
```bash
# Change PORT in .env file
PORT=3001
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

## 🎨 Brand Extraction Analysis

Kết quả phân tích brand từ website `gaigu1.net`:

```
🎨 Brand Extraction
│
├─ https://gaigu1.net/
├─ 25:15
│
├─ Favicons
│  ├─ Shortcut Icon      https://gaigu1.net/images/favicons/favicon.png?v=2
│  ├─ apple-touch-icon   https://gaigu1.net/images/favicons/favicon.png?v=2 · 57x57
│  ├─ apple-touch-icon   https://gaigu1.net/images/favicons/favicon.png?v=2 · 60x60
│  ├─ apple-touch-icon   https://gaigu1.net/images/favicons/favicon.png?v=2 · 72x72
│  ├─ apple-touch-icon   https://gaigu1.net/images/favicons/favicon.png?v=2 · 76x76
│  ├─ apple-touch-icon   https://gaigu1.net/images/favicons/favicon.png?v=2 · 114x114
│  ├─ apple-touch-icon   https://gaigu1.net/images/favicons/favicon.png?v=2 · 120x120
│  ├─ apple-touch-icon   https://gaigu1.net/images/favicons/favicon.png?v=2 · 144x144
│  ├─ apple-touch-icon   https://gaigu1.net/images/favicons/favicon.png?v=2 · 152x152
│  ├─ apple-touch-icon   https://gaigu1.net/images/favicons/favicon.png?v=2 · 180x180
│  ├─ icon               https://gaigu1.net/images/favicons/favicon.png?v=2 · 192x192
│  ├─ icon               https://gaigu1.net/images/favicons/favicon.png?v=2 · 32x32
│  ├─ icon               https://gaigu1.net/images/favicons/favicon.png?v=2 · 96x96
│  ├─ icon               https://gaigu1.net/images/favicons/favicon.png?v=2 · 16x16
│  ├─ apple-touch-icon   https://gaigu1.net/images/favicons/favicon.png?v=2 · 57x57
│  ├─ apple-touch-icon   https://gaigu1.net/images/favicons/favicon.png?v=2 · 60x60
│  ├─ apple-touch-icon   https://gaigu1.net/images/favicons/favicon.png?v=2 · 72x72
│  ├─ apple-touch-icon   https://gaigu1.net/images/favicons/favicon.png?v=2 · 76x76
│  ├─ apple-touch-icon   https://gaigu1.net/images/favicons/favicon.png?v=2 · 114x114
│  ├─ apple-touch-icon   https://gaigu1.net/images/favicons/favicon.png?v=2 · 120x120
│  ├─ apple-touch-icon   https://gaigu1.net/images/favicons/favicon.png?v=2 · 144x144
│  ├─ apple-touch-icon   https://gaigu1.net/images/favicons/favicon.png?v=2 · 152x152
│  ├─ apple-touch-icon   https://gaigu1.net/images/favicons/favicon.png?v=2 · 180x180
│  └─ favicon.ico        https://gaigu1.net/favicon.ico
│
├─ Colors
│  ├─ ●    #ff0000   rgb(255, 0, 0)         primary
│  ├─ ●    #4a4a4a   rgb(74, 74, 74)        secondary
│  ├─ ●    #8d8d8d   rgb(141, 141, 141)     
│  ├─ ●    #777777   rgb(119, 119, 119)     
│  ├─ ●    #ffffff   rgb(255, 255, 255)     
│  ├─ ●    #3ea6ff   rgb(62, 166, 255)      
│  ├─ ●    #bfbfbf   rgb(191, 191, 191)     
│  ├─ ●    #aaaaaa   rgb(170, 170, 170)     
│  ├─ ●    #212529   rgb(33, 37, 41)        
│  ├─ ●    #5a5a5a   rgb(90, 90, 90)        
│  ├─ ●    #151515   rgb(21, 21, 21)        
│  └─ ●    #353535   rgb(53, 53, 53)        
│
├─ Typography
│  ├─ -apple-system
│  │  ├─ fallbacks: BlinkMacSystemFont, Segoe UI, Roboto, Helvetica Neue, Arial, Apple Color Emoji, Segoe UI Emoji, Segoe UI Symbol, Noto Color Emoji
│  │  ├─ heading-1
│  │  │  ├─ 24px (1.50rem) [w500 lh1.50]
│  │  │  ├─ 20px (1.25rem) [lh1.00(tight)]
│  │  │  ├─ 16px (1.00rem) [lh1.50]
│  │  │  ├─ 15.84px (0.99rem) [lh1.56]
│  │  │  └─ 14.256px (0.89rem) [lh1.73(relaxed)]
│  │  ├─ button
│  │  │  ├─ 24px (1.50rem) [w700 lh1.00(tight)]
│  │  │  ├─ 16px (1.00rem) [lh0.63(tight)]
│  │  │  ├─ 14px (0.88rem) [w500 lh1.50]
│  │  │  └─ 14px (0.88rem) [lh1.50]
│  │  ├─ link
│  │  │  ├─ 16px (1.00rem) [lh1.50]
│  │  │  ├─ 16px (1.00rem) [w500 lh1.50]
│  │  │  ├─ 15.84px (0.99rem) [w700 lh1.56]
│  │  │  ├─ 14px (0.88rem) [lh1.50]
│  │  │  ├─ 14px (0.88rem) [w700 lh1.43]
│  │  │  └─ 12.8px (0.80rem) [lh1.50]
│  │  └─ caption
│  │     ├─ 14px (0.88rem) [lh1.50]
│  │     ├─ 13px (0.81rem) [lh1.50]
│  │     └─ 12px (0.75rem) [lh1.50]
│  └─ open sans
│     ├─ fallbacks: helvetica neue, Helvetica, Arial
│     └─ heading-1
│        └─ 18px (1.13rem) [w500 lh1.20(tight)]
│
├─ Spacing
│  ├─ System: 8px
│  ├─ 1px      0.06rem
│  ├─ 2px      0.13rem
│  ├─ 4px      0.25rem
│  ├─ 4.8px    0.30rem
│  ├─ 5px      0.31rem
│  ├─ 6px      0.38rem
│  ├─ 7px      0.44rem
│  ├─ 8px      0.50rem
│  ├─ 9px      0.56rem
│  ├─ 10px     0.63rem
│  ├─ 10.8px   0.68rem
│  ├─ 12px     0.75rem
│  ├─ 15px     0.94rem
│  ├─ 16px     1.00rem
│  └─ 20px     1.25rem
│
├─ Border Radius
│  ├─ 3px (img)
│  ├─ 4px (input, button, div)
│  ├─ 4.8px 4.8px 0px 0px (modal)
│  └─ 6px (image)
│
├─ Borders
│  ├─ ●    1px solid #353535   rgb(53, 53, 53) (input)
│  ├─ ●    0px 0px 1px none none solid #777777   rgb(119, 119, 119) (div)
│  └─ ●    0px 0px 1px none none solid #909090   rgb(144, 144, 144) (span)
│
├─ Buttons
│  └─ Variant:    #ff0000   rgb(255, 0, 0)
│     ├─ Default (Rest)
│     │  ├─ bg:    #ff0000   rgb(255, 0, 0)
│     │  ├─ text:    #ffffff   rgb(255, 255, 255)
│     │  ├─ padding: 10px 12px
│     │  ├─ radius: 0px 4px 4px 0px
│     │  ├─ border: 1px solid rgb(255, 0, 0)
│     │  └─ outline: rgb(255, 255, 255) none 0px
│     ├─ Hover
│     │  ├─ bg:    #0d95e8   rgb(13, 149, 232)
│     │  └─ text:    #888888   rgb(136, 136, 136)
│     ├─ Active (Pressed)
│     │  ├─ bg:    #c43a29   rgb(196, 58, 41)
│     │  └─ text:    #ffffff   rgb(255, 255, 255)
│     └─ Focus
│        ├─ bg:    #c43a29   rgb(196, 58, 41)
│        └─ text:    #ffffff   rgb(255, 255, 255)
│
├─ Inputs
│  └─ Text Inputs
│     └─ text
│        ├─ Default
│        │  ├─ bg:    #1c1c1c   rgb(28, 28, 28)
│        │  ├─ text:    #efefef   rgb(239, 239, 239)
│        │  ├─ border: 1px solid rgb(49, 49, 49)
│        │  ├─ padding: 6px 45px 7px 12px
│        │  ├─ radius: 4px 0px 0px 4px
│        └─ Focus
│           ├─ bg:    #151515   rgb(21, 21, 21)
│           ├─ border: 1px solid rgb(62, 166, 255)
│           └─ border-color:    #353535   rgb(53, 53, 53)
│
├─ Links
│  ├─    #888888   rgb(136, 136, 136)
│  │  ├─ Default
│  │  └─ Hover
│  │     ├─ color:    #ffffff   rgb(255, 255, 255)
│  │     └─ decoration: underline
│  ├─    #999999   rgb(153, 153, 153)
│  │  ├─ Default
│  │  └─ Hover
│  │     ├─ color:    #ffffff   rgb(255, 255, 255)
│  │     └─ decoration: underline
│  ├─    #ffffff   rgb(255, 255, 255)
│  │  ├─ Default
│  │  └─ Hover
│  │     ├─ color:    #ffffff   rgb(255, 255, 255)
│  │     └─ decoration: underline
│  ├─    #bbbbbb   rgb(187, 187, 187)
│  │  ├─ Default
│  │  └─ Hover
│  │     ├─ color:    #ffffff   rgb(255, 255, 255)
│  │     └─ decoration: underline
│  ├─    #3ea6ff   rgb(62, 166, 255)
│  │  ├─ Default
│  │  └─ Hover
│  │     ├─ color:    #ffffff   rgb(255, 255, 255)
│  │     └─ decoration: underline
│  └─    #bfbfbf   rgb(191, 191, 191)
│     ├─ Default
│     └─ Hover
│        ├─ color:    #ffffff   rgb(255, 255, 255)
│        └─ decoration: underline
│
├─ Breakpoints
│  └─ 1400px → 1200px → 1140px → 992px → 991px → 960px → 768px → 767px → 720px → 576px → 540px → 98px
│
├─ Icon System
│  └─ Font Awesome icon-font
│
├─ Frameworks
│  ├─ ● Bootstrap grid system (container + row + col), button variants, stylesheet
│  └─ ● Vuetify 16 v- components
│
│
└─ ✓ Complete
```

**Extraction Summary:**
- ✅ Logo and favicons extracted
- ✅ Colors: 11 found (Primary: #ff0000, Secondary: #4a4a4a)
- ✅ Typography: 19 styles (-apple-system, Open Sans)
- ✅ Spacing: 19 values (System: 8px)
- ✅ Border radius: 7 values
- ✅ Shadows: 4 found
- ✅ Buttons: 1 variant
- ✅ Links: 6 styles
- ✅ Breakpoints: 12 detected
- ✅ Icon systems: 1 detected (Font Awesome)
- ✅ Frameworks: 2 detected (Bootstrap, Vuetify)

---

**Built with ❤️ using NestJS**
