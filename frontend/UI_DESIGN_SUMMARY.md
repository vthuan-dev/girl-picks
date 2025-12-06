# UI Design Summary - Girl Pick Platform

## 🎨 Tổng quan

Đã thiết kế UI cho 3 roles chính: **Girl**, **Customer**, và **Admin** dựa trên các tính năng của backend.

## 📁 Cấu trúc Pages

### 👩 **GIRL** - `/app/(girl)/`

#### 1. **Profile** - `/profile`
- Xem và chỉnh sửa thông tin cá nhân
- Upload avatar và gallery
- Hiển thị stats: đánh giá, tổng đặt lịch, thu nhập
- Trạng thái xác thực

#### 2. **Bookings** - `/bookings`
- Danh sách đặt lịch với filter theo trạng thái
- Xác nhận/từ chối đặt lịch
- Xem chi tiết đặt lịch
- BookingCard component với đầy đủ thông tin

#### 3. **Service Packages** - `/service-packages`
- Quản lý các gói dịch vụ (CRUD)
- Tạo mới, chỉnh sửa, xóa gói dịch vụ
- Hiển thị giá, thời gian, trạng thái
- Modal để thêm gói mới

#### 4. **Earnings** - `/earnings`
- Tổng thu nhập theo các kỳ (hôm nay, tuần, tháng, năm)
- Bảng chi tiết từng giao dịch
- Thống kê: tổng thu nhập, số đơn, trung bình/đơn

---

### 👤 **CUSTOMER** - `/app/(customer)/`

#### 1. **Search** - `/search`
- Tìm kiếm gái gọi theo tên, địa điểm
- Filter theo khu vực (quận)
- Filter theo mức giá
- Grid hiển thị kết quả với GirlCard
- Sắp xếp theo nhiều tiêu chí

#### 2. **Bookings** - `/bookings`
- Xem tất cả đặt lịch của mình
- Filter theo trạng thái
- Xem chi tiết và hủy đặt lịch

#### 3. **Messages** - `/messages`
- Danh sách cuộc trò chuyện
- Chat real-time với MessageBubble
- Hiển thị unread count
- Gửi tin nhắn

---

### 👨‍💼 **ADMIN** - `/app/(admin)/`

#### 1. **Dashboard** - `/dashboard`
- Stats tổng quan: Tổng users, Gái gọi, Đặt lịch, Chờ duyệt
- Quick actions: Duyệt bài viết, đánh giá, xác thực, báo cáo
- Danh sách items chờ xử lý

#### 2. **Users Management** - `/users`
- Bảng quản lý tất cả users
- Tìm kiếm theo tên, email
- Filter theo role (CUSTOMER, GIRL, ADMIN)
- Xem, chỉnh sửa, xóa user
- Quản lý trạng thái (active/inactive)

#### 3. **Content Approval** - `/content-approval`
- Tabs: Bài viết, Đánh giá, Xác thực
- Duyệt/từ chối nội dung
- Xem chi tiết trước khi duyệt
- Hiển thị documents cho verification

---

## 🧩 Shared Components

### 1. **BookingCard** - `/components/bookings/BookingCard.tsx`
- Hiển thị thông tin đặt lịch
- Support 2 views: `girl` và `customer`
- Status badges với màu sắc
- Actions buttons theo trạng thái

### 2. **ServicePackageCard** - `/components/service-packages/ServicePackageCard.tsx`
- Card hiển thị gói dịch vụ
- Edit/Delete actions
- Toggle active status

### 3. **GirlCard** - `/components/girls/GirlCard.tsx`
- Card hiển thị gái gọi trong search
- Avatar, rating, price, location
- Verified badge
- Online status indicator

### 4. **MessageBubble** - `/components/messages/MessageBubble.tsx`
- Bubble tin nhắn với styling khác nhau cho sender/receiver
- Read status indicator
- Timestamp

### 5. **NotificationBell** - `/components/common/NotificationBell.tsx`
- Bell icon với unread count badge
- Dropdown danh sách notifications
- Mark as read functionality

### 6. **Modal** - `/components/common/Modal.tsx`
- Reusable modal component
- Support multiple sizes
- Backdrop và close button

---

## 🎨 Design System

### Colors (từ brand extraction)
- **Primary**: `#ff0000` (Red)
- **Secondary**: `#4a4a4a` (Gray)
- **Accent**: Blue tones
- **Background**: Dark theme với `background`, `background-light`
- **Text**: `text`, `text-muted`

### Typography
- System font: `-apple-system` với fallbacks
- Headings: Bold, various sizes
- Body: Regular weight

### Spacing
- 8px base system
- Consistent padding/margin

### Components Styling
- Rounded corners: `rounded-lg` (8px)
- Borders: `border-secondary/30` với hover states
- Hover effects: `hover:bg-primary/10`, `hover:border-primary/50`
- Transitions: `transition-colors`, `transition-all`

---

## 📱 Responsive Design

- Mobile-first approach
- Breakpoints:
  - `sm`: 640px
  - `md`: 768px
  - `lg`: 1024px
  - `xl`: 1280px

- Grid layouts:
  - 1 column (mobile)
  - 2-3 columns (tablet)
  - 3-4 columns (desktop)

---

## 🔄 State Management

- Sử dụng `useState` cho local state
- `useAuthStore` từ Zustand cho authentication
- TODO: Integrate với API calls

---

## ✅ Features Implemented

### Girl Features
- ✅ Profile management với edit mode
- ✅ Bookings management với status filters
- ✅ Service packages CRUD
- ✅ Earnings tracking với period filters

### Customer Features
- ✅ Search với filters (district, price)
- ✅ Bookings view
- ✅ Messages/chat interface

### Admin Features
- ✅ Dashboard với stats và quick actions
- ✅ Users management với search và filters
- ✅ Content approval (posts, reviews, verifications)

---

## 🚀 Next Steps

1. **API Integration**
   - Connect tất cả pages với backend APIs
   - Implement WebSocket cho real-time messages
   - Add loading states và error handling

2. **Additional Pages**
   - Girl: Time Slots, Blocked Dates, Reviews
   - Customer: Favorites, Girl Detail Page, Booking Form
   - Admin: Reports Management, Analytics

3. **Enhancements**
   - Image upload functionality
   - Form validation
   - Toast notifications
   - Pagination cho tables/lists
   - Infinite scroll cho messages

4. **Testing**
   - Unit tests cho components
   - Integration tests
   - E2E tests với Playwright

---

## 📝 Notes

- Tất cả components sử dụng Tailwind CSS
- Dark theme được áp dụng nhất quán
- Icons sử dụng SVG inline (có thể thay bằng icon library)
- Avatar placeholders sử dụng initials
- Responsive design đã được implement

---

**Last Updated**: 2024-12-06

