# 💾 Database Schema Index - Girl Pick Platform

> **Database Schema Documentation** - Chi tiết về cấu trúc database và relationships

---

## 📊 Database Overview

- **Database Type**: MySQL
- **ORM**: Prisma
- **Total Tables**: 30+
- **Schema File**: `backend/prisma/schema.prisma` (776 lines)

---

## 📋 Table of Contents

1. [Core Tables](#1-core-tables)
2. [Content Tables](#2-content-tables)
3. [Booking System Tables](#3-booking-system-tables)
4. [Social & Interaction Tables](#4-social--interaction-tables)
5. [Admin & Moderation Tables](#5-admin--moderation-tables)
6. [Utility Tables](#6-utility-tables)
7. [Enums](#7-enums)
8. [Relationships](#8-relationships)
9. [Indexes](#9-indexes)

---

## 1. Core Tables

### 1.1. users
**Mô tả**: User accounts cho tất cả roles

| Column | Type | Description |
|--------|------|-------------|
| id | String (UUID) | Primary key |
| email | String (unique) | Email address |
| password | String | Hashed password |
| role | UserRole | ADMIN, GIRL, CUSTOMER, STAFF_UPLOAD |
| fullName | String | Full name |
| phone | String? | Phone number |
| avatarUrl | String? | Avatar URL |
| isActive | Boolean | Account active status |
| createdAt | DateTime | Created timestamp |
| updatedAt | DateTime | Updated timestamp |

**Relations**:
- 1 → 0..1 Girl (as user)
- 1 → * Girl (as manager)
- 1 → * Review
- 1 → * Message (sent/received)
- 1 → * Notification
- 1 → * Report
- 1 → * Booking
- 1 → * Post

### 1.2. girls
**Mô tả**: Girl profiles (có thể có hoặc không có user account)

| Column | Type | Description |
|--------|------|-------------|
| id | String (UUID) | Primary key |
| userId | String? (unique) | User ID (optional) |
| managedById | String? | Manager user ID |
| name | String? | Girl name |
| slug | String? (unique) | SEO-friendly slug |
| age | Int? | Age |
| bio | String? | Biography |
| phone | String? | Phone number |
| birthYear | Int? | Birth year |
| height | String? | Height (e.g., "160cm") |
| weight | String? | Weight (e.g., "52kg") |
| measurements | String? | Measurements (e.g., "89-64-92") |
| origin | String? | Origin (e.g., "Miền Tây") |
| districts | Json | Array of district IDs |
| address | String? | Full address |
| location | String? | Location (e.g., "Sài Gòn/Bình Tân") |
| province | String? | Province |
| price | String? | Price (e.g., "200K") |
| ratingAverage | Float | Average rating |
| totalReviews | Int | Total reviews count |
| verificationStatus | VerificationStatus | Verification status |
| verificationDocuments | Json | Document URLs |
| verificationRequestedAt | DateTime? | Verification request time |
| verificationVerifiedAt | DateTime? | Verification verified time |
| idCardFrontUrl | String? | ID card front |
| idCardBackUrl | String? | ID card back |
| selfieUrl | String? | Selfie photo |
| needsReverify | Boolean | Needs reverification |
| viewCount | Int | View count |
| favoriteCount | Int | Favorite count |
| isFeatured | Boolean | Featured flag |
| isPremium | Boolean | Premium flag |
| isActive | Boolean | Active status |
| isAvailable | Boolean | Available status |
| images | Json | Array of image URLs |
| tags | Json | Array of tags |
| services | Json | Array of services |
| lastActiveAt | DateTime? | Last active time |
| workingHours | String? | Working hours |
| createdAt | DateTime | Created timestamp |
| updatedAt | DateTime | Updated timestamp |

**Indexes**:
- `[isActive, isFeatured, ratingAverage]`
- `[province, isActive]`
- `[verificationStatus, isActive]`
- `[lastActiveAt]`
- `[isActive, ratingAverage]`

### 1.3. chat_sex_girls
**Mô tả**: Chat sex girl profiles (không có user account)

| Column | Type | Description |
|--------|------|-------------|
| id | String (UUID) | Primary key |
| managedById | String? | Manager user ID |
| name | String | Name |
| slug | String? (unique) | SEO slug |
| title | String? | Title |
| age | Int? | Age |
| birthYear | Int? | Birth year |
| height | String? | Height |
| weight | String? | Weight |
| bio | String? | Biography |
| phone | String? | Phone |
| zalo | String? | Zalo ID |
| telegram | String? | Telegram ID |
| location | String? | Location |
| province | String? | Province |
| address | String? | Address |
| price | String? | Price |
| price15min | String? | 15-min price |
| paymentInfo | String? | Payment info |
| services | Json | Services array |
| workingHours | String? | Working hours |
| instruction | String? | Instructions |
| images | Json | Image URLs |
| videos | Json? | Video URLs |
| coverImage | String? | Cover image |
| isVerified | Boolean | Verified status |
| isFeatured | Boolean | Featured flag |
| isActive | Boolean | Active status |
| isAvailable | Boolean | Available status |
| viewCount | Int | View count |
| rating | Float? | Rating |
| tags | Json | Tags array |
| sourceUrl | String? | Source URL |
| crawledAt | DateTime? | Crawled time |
| createdAt | DateTime | Created timestamp |
| updatedAt | DateTime | Updated timestamp |

---

## 2. Content Tables

### 2.1. posts
**Mô tả**: Bài viết/quảng cáo từ Girls hoặc Admin

| Column | Type | Description |
|--------|------|-------------|
| id | String (UUID) | Primary key |
| authorId | String | Author user ID |
| girlId | String? | Related girl ID |
| title | String | Post title |
| slug | String? (unique) | SEO slug |
| content | String | Post content |
| images | Json | Image URLs array |
| status | PostStatus | PENDING/APPROVED/REJECTED |
| approvedById | String? | Approver user ID |
| approvedAt | DateTime? | Approved time |
| videoUrl | String? | Video URL |
| videoSources | Json | Video sources array |
| duration | String? | Video duration |
| viewCount | Int | View count |
| rating | Float? | Rating |
| categoryId | String? | Category ID |
| tags | Json | Tags array |
| poster | String? | Poster URL |
| thumbnail | String? | Thumbnail URL |
| createdAt | DateTime | Created timestamp |
| updatedAt | DateTime | Updated timestamp |

### 2.2. reviews
**Mô tả**: Customer reviews cho girls

| Column | Type | Description |
|--------|------|-------------|
| id | String (UUID) | Primary key |
| customerId | String | Customer user ID |
| girlId | String | Girl ID |
| title | String | Review title |
| content | String | Review content |
| rating | Int | Rating (1-5) |
| images | Json | Image URLs array |
| status | ReviewStatus | PENDING/APPROVED/REJECTED |
| approvedById | String? | Approver user ID |
| approvedAt | DateTime? | Approved time |
| createdAt | DateTime | Created timestamp |
| updatedAt | DateTime | Updated timestamp |

### 2.3. categories
**Mô tả**: Categories cho posts/videos

| Column | Type | Description |
|--------|------|-------------|
| id | String (UUID) | Primary key |
| name | String (unique) | Category name |
| slug | String (unique) | SEO slug |
| description | String? | Description |
| isActive | Boolean | Active status |
| order | Int | Display order |
| createdAt | DateTime | Created timestamp |
| updatedAt | DateTime | Updated timestamp |

### 2.4. albums
**Mô tả**: Photo albums

| Column | Type | Description |
|--------|------|-------------|
| id | String (UUID) | Primary key |
| title | String | Album title |
| description | String? | Description |
| coverUrl | String? | Cover image URL |
| category | String? | Category |
| albumCategoryId | String? | Album category ID |
| tags | Json? | Tags |
| isPublic | Boolean | Public status |
| viewCount | Int | View count |
| createdById | String | Creator user ID |
| createdAt | DateTime | Created timestamp |
| updatedAt | DateTime | Updated timestamp |

### 2.5. album_images
**Mô tả**: Images trong albums

| Column | Type | Description |
|--------|------|-------------|
| id | String (UUID) | Primary key |
| albumId | String | Album ID |
| url | String | Image URL |
| thumbUrl | String? | Thumbnail URL |
| caption | String? | Caption |
| sortOrder | Int | Sort order |
| createdAt | DateTime | Created timestamp |

### 2.6. album_categories
**Mô tả**: Categories cho albums

| Column | Type | Description |
|--------|------|-------------|
| id | String (UUID) | Primary key |
| name | String (unique) | Category name |
| slug | String? (unique) | SEO slug |
| description | String? | Description |
| order | Int | Display order |
| isActive | Boolean | Active status |
| createdAt | DateTime | Created timestamp |
| updatedAt | DateTime | Updated timestamp |

---

## 3. Booking System Tables

### 3.1. bookings
**Mô tả**: Service booking records

| Column | Type | Description |
|--------|------|-------------|
| id | String (UUID) | Primary key |
| customerId | String | Customer user ID |
| girlId | String | Girl ID |
| servicePackageId | String? | Service package ID |
| serviceType | String | Service type |
| bookingDate | DateTime | Booking date |
| duration | Int | Duration (hours) |
| location | String? | Location |
| status | BookingStatus | Booking status |
| totalPrice | Float | Total price |
| depositAmount | Float | Deposit amount |
| paymentStatus | PaymentStatus | Payment status |
| specialRequests | String? | Special requests |
| cancellationReason | String? | Cancellation reason |
| cancelledAt | DateTime? | Cancelled time |
| createdAt | DateTime | Created timestamp |
| updatedAt | DateTime | Updated timestamp |

### 3.2. service_packages
**Mô tả**: Service packages cho girls

| Column | Type | Description |
|--------|------|-------------|
| id | String (UUID) | Primary key |
| girlId | String | Girl ID |
| name | String | Package name |
| description | String? | Description |
| duration | Int | Duration (hours) |
| price | Float | Price |
| isActive | Boolean | Active status |
| createdAt | DateTime | Created timestamp |
| updatedAt | DateTime | Updated timestamp |

### 3.3. time_slots
**Mô tả**: Available time slots

| Column | Type | Description |
|--------|------|-------------|
| id | String (UUID) | Primary key |
| girlId | String | Girl ID |
| dayOfWeek | Int | Day of week (0-6) |
| startTime | String | Start time (HH:mm) |
| endTime | String | End time (HH:mm) |
| isAvailable | Boolean | Available status |
| createdAt | DateTime | Created timestamp |
| updatedAt | DateTime | Updated timestamp |

### 3.4. blocked_dates
**Mô tả**: Blocked dates

| Column | Type | Description |
|--------|------|-------------|
| id | String (UUID) | Primary key |
| girlId | String | Girl ID |
| date | DateTime | Blocked date |
| reason | String? | Reason |
| createdAt | DateTime | Created timestamp |

**Unique**: `[girlId, date]`

### 3.5. payments
**Mô tả**: Payment records

| Column | Type | Description |
|--------|------|-------------|
| id | String (UUID) | Primary key |
| bookingId | String | Booking ID |
| userId | String | Customer user ID |
| amount | Float | Amount |
| paymentMethod | PaymentMethod | Payment method |
| paymentStatus | PaymentStatus | Payment status |
| transactionId | String? | Transaction ID |
| paymentDate | DateTime? | Payment date |
| refundAmount | Float? | Refund amount |
| refundReason | String? | Refund reason |
| createdAt | DateTime | Created timestamp |
| updatedAt | DateTime | Updated timestamp |

### 3.6. payment_history
**Mô tả**: Payment history

| Column | Type | Description |
|--------|------|-------------|
| id | String (UUID) | Primary key |
| paymentId | String | Payment ID |
| status | PaymentStatus | Status |
| amount | Float | Amount |
| notes | String? | Notes |
| createdAt | DateTime | Created timestamp |

### 3.7. booking_history
**Mô tả**: Booking history

| Column | Type | Description |
|--------|------|-------------|
| id | String (UUID) | Primary key |
| bookingId | String | Booking ID |
| status | BookingStatus | Status |
| changedBy | String? | Changed by user ID |
| notes | String? | Notes |
| createdAt | DateTime | Created timestamp |

### 3.8. venues
**Mô tả**: Venues for bookings

| Column | Type | Description |
|--------|------|-------------|
| id | String (UUID) | Primary key |
| name | String | Venue name |
| address | String | Address |
| districtId | String? | District ID |
| latitude | Float? | Latitude |
| longitude | Float? | Longitude |
| isActive | Boolean | Active status |
| createdAt | DateTime | Created timestamp |
| updatedAt | DateTime | Updated timestamp |

---

## 4. Social & Interaction Tables

### 4.1. messages
**Mô tả**: Chat messages

| Column | Type | Description |
|--------|------|-------------|
| id | String (UUID) | Primary key |
| senderId | String | Sender user ID |
| receiverId | String | Receiver user ID |
| content | String | Message content |
| isRead | Boolean | Read status |
| createdAt | DateTime | Created timestamp |

### 4.2. notifications
**Mô tả**: User notifications

| Column | Type | Description |
|--------|------|-------------|
| id | String (UUID) | Primary key |
| userId | String | User ID |
| type | NotificationType | Notification type |
| message | String | Message |
| data | Json? | Additional metadata |
| isRead | Boolean | Read status |
| createdAt | DateTime | Created timestamp |

### 4.3. favorites
**Mô tả**: User favorites

| Column | Type | Description |
|--------|------|-------------|
| id | String (UUID) | Primary key |
| userId | String | User ID |
| girlId | String | Girl ID |
| createdAt | DateTime | Created timestamp |

**Unique**: `[userId, girlId]`

### 4.4. view_history
**Mô tả**: View history

| Column | Type | Description |
|--------|------|-------------|
| id | String (UUID) | Primary key |
| userId | String | User ID |
| girlId | String | Girl ID |
| viewedAt | DateTime | Viewed time |

### 4.5. post_likes
**Mô tả**: Post likes

| Column | Type | Description |
|--------|------|-------------|
| id | String (UUID) | Primary key |
| postId | String | Post ID |
| userId | String | User ID |
| createdAt | DateTime | Created timestamp |

**Unique**: `[postId, userId]`

### 4.6. post_comments
**Mô tả**: Post comments

| Column | Type | Description |
|--------|------|-------------|
| id | String (UUID) | Primary key |
| postId | String | Post ID |
| userId | String | User ID |
| content | String | Comment content |
| parentId | String? | Parent comment ID |
| createdAt | DateTime | Created timestamp |

**Index**: `[postId, parentId]`

### 4.7. review_likes
**Mô tả**: Review likes

| Column | Type | Description |
|--------|------|-------------|
| id | String (UUID) | Primary key |
| reviewId | String | Review ID |
| userId | String | User ID |
| createdAt | DateTime | Created timestamp |

**Unique**: `[reviewId, userId]`

### 4.8. review_comments
**Mô tả**: Review comments

| Column | Type | Description |
|--------|------|-------------|
| id | String (UUID) | Primary key |
| reviewId | String | Review ID |
| userId | String | User ID |
| content | String | Comment content |
| createdAt | DateTime | Created timestamp |

---

## 5. Admin & Moderation Tables

### 5.1. reports
**Mô tả**: User/content reports

| Column | Type | Description |
|--------|------|-------------|
| id | String (UUID) | Primary key |
| reporterId | String | Reporter user ID |
| reportedUserId | String? | Reported user ID |
| reportedPostId | String? | Reported post ID |
| reportedReviewId | String? | Reported review ID |
| reason | ReportReason | Report reason |
| description | String | Description |
| status | ReportStatus | Report status |
| reviewedById | String? | Reviewer user ID |
| reviewedAt | DateTime? | Reviewed time |
| createdAt | DateTime | Created timestamp |

### 5.2. blocks
**Mô tả**: Blocked users

| Column | Type | Description |
|--------|------|-------------|
| id | String (UUID) | Primary key |
| blockerId | String | Blocker user ID |
| blockedId | String | Blocked user ID |
| createdAt | DateTime | Created timestamp |

**Unique**: `[blockerId, blockedId]`

### 5.3. audit_logs
**Mô tả**: Admin action logs

| Column | Type | Description |
|--------|------|-------------|
| id | String (UUID) | Primary key |
| adminId | String | Admin user ID |
| action | String | Action |
| targetType | String | Target type |
| targetId | String | Target ID |
| details | Json? | Details |
| ipAddress | String? | IP address |
| createdAt | DateTime | Created timestamp |

### 5.4. settings
**Mô tả**: System settings

| Column | Type | Description |
|--------|------|-------------|
| id | String (UUID) | Primary key |
| key | String (unique) | Setting key |
| value | Json | Setting value |
| description | String? | Description |
| updatedAt | DateTime | Updated timestamp |

### 5.5. email_templates
**Mô tả**: Email templates

| Column | Type | Description |
|--------|------|-------------|
| id | String (UUID) | Primary key |
| name | String (unique) | Template name |
| subject | String | Email subject |
| bodyHtml | String | HTML body |
| bodyText | String | Text body |
| variables | Json? | Available variables |
| isActive | Boolean | Active status |
| createdAt | DateTime | Created timestamp |
| updatedAt | DateTime | Updated timestamp |

---

## 6. Utility Tables

### 6.1. districts
**Mô tả**: Districts/locations

| Column | Type | Description |
|--------|------|-------------|
| id | String (UUID) | Primary key |
| name | String | District name |
| province | String | Province |
| isActive | Boolean | Active status |
| createdAt | DateTime | Created timestamp |
| updatedAt | DateTime | Updated timestamp |

### 6.2. page_views
**Mô tả**: Analytics page views

| Column | Type | Description |
|--------|------|-------------|
| id | String (UUID) | Primary key |
| path | String | Page path |
| title | String? | Page title |
| referrer | String? | Referrer URL |
| userAgent | String? | User agent |
| sessionId | String | Session ID |
| userId | String? | User ID |
| ipAddress | String? | IP address |
| createdAt | DateTime | Created timestamp |

**Indexes**:
- `[path]`
- `[sessionId]`
- `[createdAt]`
- `[userId]`

---

## 7. Enums

### 7.1. UserRole
```typescript
enum UserRole {
  ADMIN          // Quản trị viên
  GIRL           // Người cung cấp dịch vụ
  CUSTOMER       // Khách hàng
  STAFF_UPLOAD   // Nhân viên upload
}
```

### 7.2. PostStatus
```typescript
enum PostStatus {
  PENDING    // Chờ duyệt
  APPROVED   // Đã duyệt
  REJECTED   // Từ chối
}
```

### 7.3. ReviewStatus
```typescript
enum ReviewStatus {
  PENDING    // Chờ duyệt
  APPROVED   // Đã duyệt
  REJECTED   // Từ chối
}
```

### 7.4. VerificationStatus
```typescript
enum VerificationStatus {
  PENDING    // Chờ xác minh
  VERIFIED   // Đã xác minh
  REJECTED   // Từ chối
}
```

### 7.5. BookingStatus
```typescript
enum BookingStatus {
  PENDING     // Chờ xác nhận
  CONFIRMED   // Đã xác nhận
  COMPLETED   // Hoàn thành
  CANCELLED   // Đã hủy
  REJECTED    // Từ chối
}
```

### 7.6. PaymentStatus
```typescript
enum PaymentStatus {
  PENDING      // Chờ thanh toán
  PROCESSING   // Đang xử lý
  COMPLETED    // Hoàn thành
  FAILED       // Thất bại
  REFUNDED     // Đã hoàn tiền
}
```

### 7.7. PaymentMethod
```typescript
enum PaymentMethod {
  CASH           // Tiền mặt
  BANK_TRANSFER  // Chuyển khoản
  MOMO           // MoMo
  ZALOPAY        // ZaloPay
  VNPAY          // VNPay
}
```

### 7.8. ReportReason
```typescript
enum ReportReason {
  SPAM          // Spam
  INAPPROPRIATE // Không phù hợp
  FAKE          // Giả mạo
  HARASSMENT    // Quấy rối
  OTHER         // Khác
}
```

### 7.9. ReportStatus
```typescript
enum ReportStatus {
  PENDING    // Chờ xử lý
  REVIEWED   // Đã xem xét
  RESOLVED   // Đã giải quyết
  DISMISSED  // Bỏ qua
}
```

### 7.10. NotificationType
```typescript
enum NotificationType {
  POST_APPROVED           // Bài viết được duyệt
  POST_REJECTED           // Bài viết bị từ chối
  REVIEW_APPROVED         // Review được duyệt
  REVIEW_REJECTED         // Review bị từ chối
  COMMENT_REPLY           // Có người trả lời comment
  NEW_MESSAGE             // Tin nhắn mới
  GIRL_PENDING_APPROVAL   // Girl chờ duyệt
  VERIFICATION_APPROVED   // Xác minh được duyệt
  VERIFICATION_REJECTED   // Xác minh bị từ chối
  BOOKING_CREATED         // Booking được tạo
  BOOKING_CONFIRMED       // Booking được xác nhận
  BOOKING_REJECTED        // Booking bị từ chối
  BOOKING_CANCELLED       // Booking bị hủy
  BOOKING_COMPLETED       // Booking hoàn thành
  BOOKING_REMINDER        // Nhắc nhở booking
  PAYMENT_RECEIVED        // Nhận thanh toán
  PAYMENT_FAILED          // Thanh toán thất bại
  REPORT_PROCESSED        // Báo cáo được xử lý
}
```

---

## 8. Relationships

### 8.1. User Relationships
```
User (1) ─→ (0..1) Girl (as user)
User (1) ─→ (*) Girl (as manager)
User (1) ─→ (*) Review (as customer)
User (1) ─→ (*) Message (sent)
User (1) ─→ (*) Message (received)
User (1) ─→ (*) Notification
User (1) ─→ (*) Report (as reporter)
User (1) ─→ (*) Report (as reported user)
User (1) ─→ (*) Block (as blocker)
User (1) ─→ (*) Block (as blocked)
User (1) ─→ (*) Favorite
User (1) ─→ (*) ViewHistory
User (1) ─→ (*) Post (as author)
User (1) ─→ (*) Booking (as customer)
User (1) ─→ (*) Payment
User (1) ─→ (*) AuditLog
User (1) ─→ (*) Album
User (1) ─→ (*) ChatSexGirl (as manager)
```

### 8.2. Girl Relationships
```
Girl (1) ─→ (*) Post
Girl (1) ─→ (*) Review
Girl (1) ─→ (*) Favorite
Girl (1) ─→ (*) ViewHistory
Girl (1) ─→ (*) Booking
Girl (1) ─→ (*) ServicePackage
Girl (1) ─→ (*) TimeSlot
Girl (1) ─→ (*) BlockedDate
```

### 8.3. Post Relationships
```
Post (1) ─→ (*) PostLike
Post (1) ─→ (*) PostComment
Post (*) ─→ (1) Category
```

### 8.4. Review Relationships
```
Review (1) ─→ (*) ReviewLike
Review (1) ─→ (*) ReviewComment
```

### 8.5. Booking Relationships
```
Booking (1) ─→ (*) Payment
Booking (1) ─→ (*) BookingHistory
Booking (*) ─→ (0..1) ServicePackage
```

### 8.6. Payment Relationships
```
Payment (1) ─→ (*) PaymentHistory
```

### 8.7. Album Relationships
```
Album (1) ─→ (*) AlbumImage
Album (*) ─→ (0..1) AlbumCategory
```

---

## 9. Indexes

### 9.1. Performance Indexes

#### girls table
```sql
@@index([isActive, isFeatured, ratingAverage])
@@index([province, isActive])
@@index([verificationStatus, isActive])
@@index([lastActiveAt])
@@index([isActive, ratingAverage])
```

#### chat_sex_girls table
```sql
@@index([isActive, isFeatured])
@@index([province, isActive])
@@index([isActive, viewCount])
```

#### post_comments table
```sql
@@index([postId, parentId])
```

#### page_views table
```sql
@@index([path])
@@index([sessionId])
@@index([createdAt])
@@index([userId])
```

### 9.2. Unique Constraints

- `users.email`
- `girls.userId`
- `girls.slug`
- `chat_sex_girls.slug`
- `posts.slug`
- `categories.name`
- `categories.slug`
- `album_categories.name`
- `album_categories.slug`
- `settings.key`
- `email_templates.name`
- `favorites.[userId, girlId]`
- `blocks.[blockerId, blockedId]`
- `blocked_dates.[girlId, date]`
- `post_likes.[postId, userId]`
- `review_likes.[reviewId, userId]`

---

## 📊 Database Statistics

- **Total Tables**: 30
- **Core Tables**: 3 (users, girls, chat_sex_girls)
- **Content Tables**: 6 (posts, reviews, categories, albums, album_images, album_categories)
- **Booking Tables**: 8 (bookings, service_packages, time_slots, blocked_dates, payments, payment_history, booking_history, venues)
- **Social Tables**: 8 (messages, notifications, favorites, view_history, post_likes, post_comments, review_likes, review_comments)
- **Admin Tables**: 5 (reports, blocks, audit_logs, settings, email_templates)
- **Utility Tables**: 2 (districts, page_views)

---

## 🔧 Database Commands

### Generate Prisma Client
```bash
npx prisma generate
```

### Run Migrations
```bash
npx prisma migrate dev
```

### Reset Database
```bash
npx prisma migrate reset
```

### Open Prisma Studio
```bash
npx prisma studio
```

### Create Migration
```bash
npx prisma migrate dev --name migration_name
```

---

**Last Updated**: 2025-12-12
**Schema File**: `backend/prisma/schema.prisma`
