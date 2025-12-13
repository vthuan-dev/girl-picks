# 🗂️ Module Index - Girl Pick Platform

> **Chỉ mục các modules** - Danh sách và mô tả tất cả modules trong dự án

---

## 📦 Backend Modules (27 modules)

### Core Modules

#### 1. **auth** - Authentication & Authorization
- **Path**: `backend/src/modules/auth/`
- **Mô tả**: Xử lý đăng ký, đăng nhập, JWT tokens, password reset
- **Files**:
  - `auth.controller.ts` - Auth endpoints
  - `auth.service.ts` - Auth business logic
  - `jwt.strategy.ts` - JWT strategy
  - `jwt-auth.guard.ts` - JWT guard
- **Key APIs**:
  - `POST /auth/register`
  - `POST /auth/login`
  - `POST /auth/refresh`
  - `POST /auth/forgot-password`
  - `POST /auth/reset-password`

#### 2. **users** - User Management
- **Path**: `backend/src/modules/users/`
- **Mô tả**: Quản lý user profiles, avatar, password
- **Key APIs**:
  - `GET /users/me`
  - `PATCH /users/me`
  - `POST /users/me/avatar`
  - `POST /users/me/change-password`

#### 3. **girls** - Girl Profiles
- **Path**: `backend/src/modules/girls/`
- **Mô tả**: Quản lý girl profiles, verification, analytics
- **Key APIs**:
  - `GET /girls` - Public list
  - `GET /girls/:id` - Detail
  - `GET /girls/me/profile` - Own profile
  - `PATCH /girls/me/profile` - Update profile
  - `POST /girls/me/verification` - Request verification
  - `POST /girls/:id/view` - Increment view

### Content Modules

#### 4. **posts** - Posts Management
- **Path**: `backend/src/modules/posts/`
- **Mô tả**: Quản lý bài viết với approval workflow
- **Key APIs**:
  - `GET /posts` - List posts
  - `POST /posts` - Create post
  - `PATCH /posts/:id` - Update post
  - `DELETE /posts/:id` - Delete post
  - `POST /posts/:id/approve` - Approve (Admin)
  - `POST /posts/:id/reject` - Reject (Admin)
  - `POST /posts/:id/like` - Toggle like
  - `POST /posts/:id/comments` - Add comment

#### 5. **reviews** - Reviews Management
- **Path**: `backend/src/modules/reviews/`
- **Mô tả**: Quản lý reviews với approval workflow
- **Key APIs**:
  - `GET /reviews` - List reviews
  - `POST /reviews` - Create review
  - `POST /reviews/:id/approve` - Approve (Admin)
  - `POST /reviews/:id/reject` - Reject (Admin)

#### 6. **categories** - Categories
- **Path**: `backend/src/modules/categories/`
- **Mô tả**: Quản lý categories cho posts/videos
- **Key APIs**:
  - `GET /categories` - List categories
  - `POST /categories` - Create category
  - `GET /categories/slug/:slug` - Get by slug

#### 7. **tags** - Tags
- **Path**: `backend/src/modules/tags/`
- **Mô tả**: Quản lý tags
- **Key APIs**:
  - `GET /tags/popular` - Popular tags
  - `GET /tags/all` - All tags

#### 8. **albums** - Photo Albums
- **Path**: `backend/src/modules/albums/`
- **Mô tả**: Quản lý photo albums
- **Key APIs**:
  - `GET /albums` - List albums
  - `POST /albums` - Create album
  - `POST /albums/:id/images` - Add images

#### 9. **album-categories** - Album Categories
- **Path**: `backend/src/modules/album-categories/`
- **Mô tả**: Categories cho albums

### Booking System Modules

#### 10. **bookings** - Bookings
- **Path**: `backend/src/modules/bookings/`
- **Mô tả**: Hệ thống đặt lịch dịch vụ
- **Key APIs**:
  - `GET /bookings` - List bookings
  - `POST /bookings` - Create booking
  - `POST /bookings/:id/confirm` - Confirm
  - `POST /bookings/:id/cancel` - Cancel
  - `POST /bookings/:id/complete` - Complete
  - `GET /bookings/available-slots` - Available slots

#### 11. **service-packages** - Service Packages
- **Path**: `backend/src/modules/service-packages/`
- **Mô tả**: Quản lý gói dịch vụ
- **Key APIs**:
  - `GET /service-packages` - List packages
  - `POST /service-packages` - Create package
  - `GET /service-packages/girl/:girlId` - By girl

#### 12. **time-slots** - Time Slots
- **Path**: `backend/src/modules/time-slots/`
- **Mô tả**: Quản lý time slots
- **Key APIs**:
  - `GET /time-slots` - List slots
  - `POST /time-slots` - Create slot
  - `GET /time-slots/girl/:girlId` - By girl

#### 13. **blocked-dates** - Blocked Dates
- **Path**: `backend/src/modules/blocked-dates/`
- **Mô tả**: Quản lý ngày bị chặn
- **Key APIs**:
  - `GET /blocked-dates` - List blocked dates
  - `POST /blocked-dates` - Block date
  - `DELETE /blocked-dates/:id` - Unblock

#### 14. **payments** - Payments
- **Path**: `backend/src/modules/payments/`
- **Mô tả**: Xử lý thanh toán
- **Key APIs**:
  - `GET /payments` - List payments
  - `POST /payments` - Create payment
  - `POST /payments/:id/process` - Process payment
  - `POST /payments/:id/refund` - Refund

#### 15. **venues** - Venues
- **Path**: `backend/src/modules/venues/`
- **Mô tả**: Quản lý địa điểm
- **Key APIs**:
  - `GET /venues` - List venues
  - `POST /venues` - Create venue
  - `GET /venues/search` - Search venues

### Communication Modules

#### 16. **messages** - Chat/Messaging
- **Path**: `backend/src/modules/messages/`
- **Mô tả**: Real-time chat với Socket.io
- **Key APIs**:
  - `GET /messages/conversations` - List conversations
  - `GET /messages/conversation/:partnerId` - Messages with partner
  - `POST /messages` - Send message
  - `PATCH /messages/:id/read` - Mark as read

#### 17. **notifications** - Notifications
- **Path**: `backend/src/modules/notifications/`
- **Mô tả**: Real-time notifications
- **Key APIs**:
  - `GET /notifications` - List notifications
  - `GET /notifications/unread-count` - Unread count
  - `PATCH /notifications/:id/read` - Mark as read
  - `PATCH /notifications/read-all` - Mark all as read

### Admin & Moderation Modules

#### 18. **admin** - Admin Panel
- **Path**: `backend/src/modules/admin/`
- **Mô tả**: Admin dashboard và quản lý
- **Key APIs**:
  - `GET /admin/stats` - Dashboard stats
  - `GET /admin/pending/posts` - Pending posts
  - `GET /admin/pending/reviews` - Pending reviews
  - `GET /admin/pending/verifications` - Pending verifications
  - `GET /admin/reports` - Reports
  - `POST /admin/reports/:id/process` - Process report
  - `GET /admin/users` - User management
  - `GET /admin/girls` - Girl management
  - `GET /admin/audit-logs` - Audit logs

#### 19. **reports** - Reports
- **Path**: `backend/src/modules/reports/`
- **Mô tả**: Báo cáo vi phạm
- **Key APIs**:
  - `POST /reports` - Create report
  - `GET /reports/me` - My reports
  - `GET /reports/:id` - Report detail

### Utility Modules

#### 20. **search** - Search
- **Path**: `backend/src/modules/search/`
- **Mô tả**: Full-text search
- **Key APIs**:
  - `GET /search/girls` - Search girls
  - `GET /search/posts` - Search posts
  - `GET /search/reviews` - Search reviews
  - `GET /search` - Global search

#### 21. **favorites** - Favorites
- **Path**: `backend/src/modules/favorites/`
- **Mô tả**: Quản lý favorites
- **Key APIs**:
  - `POST /favorites/:girlId` - Add favorite
  - `DELETE /favorites/:girlId` - Remove favorite
  - `GET /favorites` - List favorites
  - `GET /favorites/check/:girlId` - Check status

#### 22. **districts** - Districts/Locations
- **Path**: `backend/src/modules/districts/`
- **Mô tả**: Quản lý quận/huyện
- **Key APIs**:
  - `GET /districts` - List districts
  - `GET /districts/provinces` - List provinces
  - `GET /districts/province/:province` - By province
  - `POST /districts` - Create district (Admin)

#### 23. **upload** - File Upload
- **Path**: `backend/src/modules/upload/`
- **Mô tả**: Upload files to Cloudinary
- **Key APIs**:
  - `POST /upload/image` - Upload single image
  - `POST /upload/images` - Upload multiple images
  - `DELETE /upload/image/:publicId` - Delete image

#### 24. **analytics** - Analytics
- **Path**: `backend/src/modules/analytics/`
- **Mô tả**: Analytics và tracking
- **Key APIs**:
  - `POST /analytics/track` - Track page view
  - `POST /analytics/event` - Track event
  - `GET /analytics` - Get analytics
  - `GET /admin/analytics` - Admin analytics

#### 25. **crawler** - Crawler Integration
- **Path**: `backend/src/modules/crawler/`
- **Mô tả**: Integration với web crawler
- **Key APIs**:
  - `POST /crawler/save` - Save crawled data

#### 26. **chat-sex** - Chat Sex Girls
- **Path**: `backend/src/modules/chat-sex/`
- **Mô tả**: Quản lý chat sex girl profiles
- **Key APIs**:
  - `GET /chat-sex` - List chat sex girls
  - `GET /chat-sex/:id` - Detail
  - `POST /chat-sex` - Create (Admin)

#### 27. **cache** - Cache Service
- **Path**: `backend/src/modules/cache/`
- **Mô tả**: Redis caching service
- **Usage**: Internal service, không có public APIs

---

## 🎨 Frontend Modules (13 modules)

### Core Modules

#### 1. **auth** - Authentication
- **Path**: `frontend/src/modules/auth/`
- **Components**:
  - Login form
  - Register form
  - Password reset
- **API**: `auth.api.ts`

#### 2. **users** - User Management
- **Path**: `frontend/src/modules/users/`
- **Components**:
  - Profile view
  - Profile edit
  - Avatar upload
- **API**: `users.api.ts`

#### 3. **girls** - Girl Profiles
- **Path**: `frontend/src/modules/girls/`
- **Components**:
  - Girl list
  - Girl detail
  - Girl card
- **API**: `girls.api.ts`

### Admin Modules

#### 4. **admin** - Admin Panel
- **Path**: `frontend/src/modules/admin/`
- **Components**:
  - Dashboard
  - User management
  - Girl management
  - Post approval
  - Review approval
  - Reports management
  - Settings
  - Analytics
  - Audit logs
- **APIs**:
  - `admin.api.ts`
  - `users.api.ts`
  - `girls.api.ts`
  - `posts.api.ts`
  - `reviews.api.ts`
  - `reports.api.ts`
  - `analytics.api.ts`
  - `settings.api.ts`

### Content Modules

#### 5. **posts** - Posts
- **Path**: `frontend/src/modules/posts/`
- **Components**:
  - Post list
  - Post detail
  - Create post
- **API**: `posts.api.ts`

#### 6. **reviews** - Reviews
- **Path**: `frontend/src/modules/reviews/`
- **Components**:
  - Review list
  - Create review
- **API**: `reviews.api.ts`

#### 7. **categories** - Categories
- **Path**: `frontend/src/modules/categories/`
- **API**: `categories.api.ts`

#### 8. **tags** - Tags
- **Path**: `frontend/src/modules/tags/`
- **API**: `tags.api.ts`

#### 9. **albums** - Albums
- **Path**: `frontend/src/modules/albums/`
- **Components**:
  - Album list
  - Album detail
- **API**: `albums.api.ts`

### Utility Modules

#### 10. **notifications** - Notifications
- **Path**: `frontend/src/modules/notifications/`
- **Components**:
  - Notification bell
  - Notification list
- **API**: `notifications.api.ts`

#### 11. **districts** - Districts
- **Path**: `frontend/src/modules/districts/`
- **API**: `districts.api.ts`

#### 12. **chat-sex** - Chat Sex
- **Path**: `frontend/src/modules/chat-sex/`
- **Components**:
  - Chat sex girl list
- **API**: `chat-sex.api.ts`

#### 13. **crawler** - Crawler
- **Path**: `frontend/src/modules/crawler/`
- **API**: `crawler.api.ts`

---

## 🔗 Module Dependencies

### Backend Module Dependencies
```
auth → users
girls → users, districts
posts → users, girls, categories
reviews → users, girls
bookings → users, girls, service-packages, time-slots
messages → users
notifications → users
admin → users, girls, posts, reviews, reports
```

### Frontend Module Dependencies
```
admin → users, girls, posts, reviews, reports, analytics
girls → districts, categories, tags
posts → categories, tags
```

---

## 📊 Module Statistics

### Backend
- **Total Modules**: 27
- **Core Modules**: 3 (auth, users, girls)
- **Content Modules**: 6 (posts, reviews, categories, tags, albums, album-categories)
- **Booking Modules**: 6 (bookings, service-packages, time-slots, blocked-dates, payments, venues)
- **Communication Modules**: 2 (messages, notifications)
- **Admin Modules**: 2 (admin, reports)
- **Utility Modules**: 8 (search, favorites, districts, upload, analytics, crawler, chat-sex, cache)

### Frontend
- **Total Modules**: 13
- **Core Modules**: 3 (auth, users, girls)
- **Admin Modules**: 1 (admin)
- **Content Modules**: 5 (posts, reviews, categories, tags, albums)
- **Utility Modules**: 4 (notifications, districts, chat-sex, crawler)

---

**Last Updated**: 2025-12-12
