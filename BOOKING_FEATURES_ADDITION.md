# Bổ Sung Tính Năng Booking Cho Dịch Vụ Uống Rượu/Hẹn Hò

## Các Tính Năng Cần Bổ Sung Vào Plan

### 1. Booking/Appointment System (QUAN TRỌNG)

#### Database Models Cần Thêm:
- **Booking** (Đặt lịch)
  - id (UUID)
  - customer_id (FK to Users)
  - girl_id (FK to Girls)
  - service_type (drinking, dating, both)
  - booking_date (datetime)
  - duration (hours: 1, 2, 3, 4+)
  - location (venue/address)
  - status (pending, confirmed, completed, cancelled, rejected)
  - total_price
  - deposit_amount
  - payment_status (pending, partial, paid, refunded)
  - special_requests (text)
  - cancellation_reason (nullable)
  - cancelled_at (nullable)
  - created_at
  - updated_at

- **ServicePackage** (Gói dịch vụ)
  - id (UUID)
  - girl_id (FK)
  - name (ví dụ: "Gói 2 giờ uống rượu", "Gói hẹn hò buổi tối")
  - description
  - duration (hours)
  - price
  - is_active
  - created_at
  - updated_at

- **TimeSlot** (Khung giờ làm việc)
  - id (UUID)
  - girl_id (FK)
  - day_of_week (0-6: Sunday-Saturday)
  - start_time (time)
  - end_time (time)
  - is_available
  - created_at
  - updated_at

- **BookingHistory** (Lịch sử booking)
  - id (UUID)
  - booking_id (FK)
  - status (pending, confirmed, etc.)
  - changed_by (FK to Users)
  - notes
  - created_at

#### API Endpoints Cần Thêm:

**Booking Module:**
- `POST /bookings` - Tạo booking mới (Customer)
- `GET /bookings` - List bookings (với filters: status, date range)
- `GET /bookings/:id` - Get booking detail
- `GET /bookings/me` - Get own bookings (Customer)
- `GET /bookings/girl/me` - Get bookings for girl (Girl)
- `PATCH /bookings/:id` - Update booking (trước khi confirm)
- `POST /bookings/:id/confirm` - Confirm booking (Girl)
- `POST /bookings/:id/reject` - Reject booking (Girl)
- `POST /bookings/:id/cancel` - Cancel booking (Customer/Girl)
- `POST /bookings/:id/complete` - Mark as completed (Girl)
- `GET /bookings/available-slots` - Get available time slots

**ServicePackage Module:**
- `GET /service-packages/girl/:girlId` - Get packages by girl
- `POST /service-packages` - Create package (Girl)
- `PATCH /service-packages/:id` - Update package (Girl)
- `DELETE /service-packages/:id` - Delete package (Girl)

**TimeSlot Module:**
- `GET /time-slots/girl/:girlId` - Get time slots by girl
- `POST /time-slots` - Create time slot (Girl)
- `PATCH /time-slots/:id` - Update time slot (Girl)
- `DELETE /time-slots/:id` - Delete time slot (Girl)
- `GET /time-slots/available` - Get available slots for date range

### 2. Payment Integration (QUAN TRỌNG)

#### Database Models:
- **Payment** (Thanh toán)
  - id (UUID)
  - booking_id (FK)
  - amount
  - payment_method (cash, bank_transfer, momo, zalopay, vnpay)
  - payment_status (pending, processing, completed, failed, refunded)
  - transaction_id
  - payment_date
  - refund_amount (nullable)
  - refund_reason (nullable)
  - created_at
  - updated_at

- **PaymentHistory** (Lịch sử thanh toán)
  - id (UUID)
  - payment_id (FK)
  - status
  - amount
  - notes
  - created_at

#### API Endpoints:
- `POST /payments` - Create payment
- `GET /payments/booking/:bookingId` - Get payment by booking
- `POST /payments/:id/process` - Process payment (webhook)
- `POST /payments/:id/refund` - Refund payment (Admin)

### 3. Calendar/Schedule Management

#### Features:
- Girls có thể set lịch làm việc (available hours)
- Block dates (ngày không làm việc)
- Xem lịch booking trong tuần/tháng
- Auto-check conflicts khi booking
- Notification khi có booking mới

#### API Endpoints:
- `GET /calendar/girl/me` - Get calendar for girl
- `POST /calendar/block-date` - Block specific date (Girl)
- `DELETE /calendar/block-date/:id` - Unblock date (Girl)
- `GET /calendar/availability` - Check availability for date range

### 4. Location/Venue Management

#### Database Models:
- **Venue** (Địa điểm)
  - id (UUID)
  - name
  - address
  - district_id (FK)
  - latitude
  - longitude
  - is_active
  - created_at

#### Features:
- Girls có thể suggest venues
- Customers có thể chọn venue
- Map integration (Google Maps)
- Distance calculation

### 5. Rating & Review After Booking

#### Features:
- Review chỉ có thể tạo sau khi booking completed
- Rating dựa trên booking experience
- Review có thể include: punctuality, service quality, communication
- Girls có thể reply to reviews

### 6. Notification System Cho Booking

#### Notification Types:
- `booking_created` - Customer tạo booking
- `booking_confirmed` - Girl confirm booking
- `booking_rejected` - Girl reject booking
- `booking_cancelled` - Booking bị hủy
- `booking_reminder` - Nhắc nhở trước booking (24h, 1h)
- `booking_completed` - Booking hoàn thành
- `payment_received` - Payment thành công
- `payment_failed` - Payment thất bại

### 7. Admin Features Cho Booking

- Xem tất cả bookings
- Filter by status, date, girl, customer
- Cancel booking (nếu có vấn đề)
- Refund payment
- Export booking reports
- Statistics: booking rate, completion rate, cancellation rate

## Cập Nhật Plan Backend

### Thêm Vào Backend Implementation Plan:

#### Phase 12: Booking Module (NEW)
- Booking CRUD operations
- Booking status workflow
- Time slot management
- Availability checking
- Conflict detection

**Git Commit**: `git commit -m "feat: implement booking module (create, confirm, cancel, complete bookings)"`

#### Phase 13: Service Packages Module (NEW)
- Service package CRUD
- Pricing management
- Package activation/deactivation

**Git Commit**: `git commit -m "feat: implement service packages module (create, manage service packages)"`

#### Phase 14: Time Slots & Calendar Module (NEW)
- Time slot management
- Calendar view
- Availability checking
- Block dates

**Git Commit**: `git commit -m "feat: implement time slots and calendar module (schedule management)"`

#### Phase 15: Payment Module (NEW)
- Payment creation
- Payment gateway integration (Momo, ZaloPay, VNPay)
- Payment webhooks
- Refund functionality

**Git Commit**: `git commit -m "feat: implement payment module (payment gateway integration, refunds)"`

#### Phase 16: Venue/Location Module (NEW)
- Venue CRUD
- Map integration
- Distance calculation

**Git Commit**: `git commit -m "feat: implement venue module (location management, map integration)"`

## Workflow Booking

1. **Customer tạo booking:**
   - Chọn Girl
   - Chọn service package
   - Chọn date & time (từ available slots)
   - Chọn venue (optional)
   - Thêm special requests
   - Submit booking (status: pending)

2. **Girl nhận notification:**
   - Xem booking request
   - Có thể confirm hoặc reject
   - Nếu confirm → status: confirmed, tạo payment

3. **Payment:**
   - Customer thanh toán deposit hoặc full amount
   - Payment gateway xử lý
   - Webhook update payment status

4. **Trước booking:**
   - Reminder notifications (24h, 1h trước)
   - Customer và Girl có thể cancel (với policy)

5. **Sau booking:**
   - Girl mark as completed
   - Customer có thể review
   - Payment released to Girl

## Business Rules

- Booking phải được confirm trong 24h, nếu không auto-cancel
- Deposit: 30-50% của total price
- Cancellation policy:
  - Cancel > 24h trước: refund 100%
  - Cancel < 24h trước: refund 50%
  - Cancel < 2h trước: no refund
- Một Girl không thể có 2 bookings cùng thời gian
- Booking duration: tối thiểu 1h, tối đa 8h
- Payment phải hoàn thành trước booking date (hoặc tại venue)

## UI/UX Considerations

- Calendar picker cho booking date
- Time slot selector (available slots)
- Service package cards với pricing
- Booking status timeline
- Payment flow với progress indicator
- Booking history với filters
- Map view cho venue selection
- Real-time availability updates


