## Function Index (Backend + Frontend)

> Mục đích: làm “sitemap” chức năng để tra cứu nhanh.  
> Phạm vi: toàn bộ backend NestJS (controller level) và toàn bộ client API wrapper ở frontend (`frontend/src/modules/**/api/*.ts`).  
> Độ chi tiết: liệt kê tên function/method và endpoint/ý nghĩa ngắn gọn theo tên định danh hiện có trong code.

### Backend (NestJS)

- `auth.controller` (`/auth`)
  - `POST /register` – đăng ký.
  - `POST /login` – đăng nhập.
  - `POST /refresh` – làm mới token.
  - `POST /forgot-password` – yêu cầu reset.
  - `POST /reset-password` – xác nhận reset.

- `admin.controller` (`/admin`)
  - `GET /stats` – thống kê dashboard.
  - `GET /pending/posts` – bài chờ duyệt.
  - `GET /pending/reviews` – review chờ duyệt.
  - `GET /pending/verifications` – xác minh chờ duyệt.
  - `GET /reports` – báo cáo vi phạm.
  - `POST /girls` – tạo tài khoản gái/khách hành chính.
  - `PATCH /girls/:id` – cập nhật gái.
  - `PATCH /girls/:id/status` – bật/tắt hoạt động.
  - `GET /girls` – danh sách gái (admin filter).
  - `GET /girls/:id` – chi tiết gái.
  - `DELETE /girls/:id` – xóa gái.
  - `POST /staff` – tạo staff upload.
  - `GET /staff` – danh sách staff.
  - `PATCH /staff/:id/activate|deactivate` – bật/tắt staff.
  - `POST /reports/:id/process` – xử lý báo cáo.
  - `GET /audit-logs` – log thao tác.
  - `GET /users` – danh sách user.
  - `GET /users/:id` – chi tiết user.
  - `PATCH /users/:id/activate|deactivate` – bật/tắt user.
  - `DELETE /users/:id` – xóa user.
  - `POST /users` – tạo user.
  - `GET /settings` – lấy cấu hình hệ thống.
  - `PATCH /settings` – cập nhật cấu hình.
  - `GET /posts` – danh sách bài (admin).
  - `GET /posts/:id` – chi tiết bài.
  - `POST /posts` – tạo bài.
  - `PATCH /posts/:id` – sửa bài.
  - `DELETE /posts/:id` – xóa bài.

- `admin/settings.controller` (`/settings`)
  - `GET /public/:key` – lấy cấu hình public theo key.

- `analytics.controller`
  - `@Controller('analytics')`
    - `POST /track` – track page view.
    - `POST /event` – track event.
    - `GET /pages` – thống kê page views (public/user).
    - `GET /` – tổng quan analytics.
  - `@Controller('admin/analytics')`
    - `GET /` – dashboard analytics (admin).
    - `GET /pages` – page analytics (admin).

- `girls.controller` (`/girls`)
  - `GET /` – danh sách public.
  - `GET /search/by-phone|by-name` – tìm kiếm.
  - `POST /:id/images` | `DELETE /:id/images` – quản lý ảnh.
  - `GET /me/profile` – hồ sơ của chính mình.
  - `GET /me/analytics` – analytics cá nhân.
  - `GET /:id` – chi tiết.
  - `GET /count/by-province` – thống kê theo tỉnh.
  - `POST /:id/view` – tăng view.
  - `PATCH /me/profile` – cập nhật hồ sơ.
  - `POST /me/verification` – yêu cầu xác minh.
  - `POST /:id/verification/approve|reject` – duyệt/từ chối xác minh (admin).
  - `POST /` – tạo mới (quyền phù hợp).
  - `PATCH /:id` – cập nhật.
  - `DELETE /:id` – xóa.

- `posts.controller` (`/posts`)
  - `POST /` – tạo bài.
  - `GET /` – danh sách (filter).
  - `GET /me` – bài của tôi.
  - `GET /girl/:girlId` – bài theo gái.
  - `GET /:id` – chi tiết.
  - `POST /:id/view` – tăng view.
  - `PATCH /:id` – cập nhật.
  - `DELETE /:id` – xóa.
  - `POST /:id/approve|reject` – duyệt/từ chối (admin/staff).
  - `POST /admin` – tạo bài admin.
  - `PATCH /admin/:id` – sửa bài admin.
  - `DELETE /admin/:id` – xóa bài admin.
  - `POST /:id/like` – toggle like.
  - `GET /:id/likes` – lấy like.
  - `POST /:id/comments` – thêm comment.
  - `GET /:id/comments` – list comment.
  - `GET /comments/:commentId/replies` – trả lời.

- `reviews.controller` (`/reviews`)
  - `POST /` – tạo review.
  - `GET /` – danh sách (filter).
  - `GET /me` – review của tôi.
  - `GET /girl/:girlId` – review theo gái.
  - `GET /:id` – chi tiết.
  - `PATCH /:id` – cập nhật.
  - `DELETE /:id` – xóa.
  - `POST /:id/approve|reject` – duyệt/từ chối.
  - `POST /:id/like` – toggle like.
  - `GET /:id/likes` – số like.
  - `POST /:id/comments` – thêm comment.
  - `GET /:id/comments` – list comment.

- `categories.controller` (`/categories`)
  - `POST /` – tạo.
  - `GET /` – danh sách.
  - `GET /:id` – chi tiết.
  - `GET /slug/:slug` – lấy theo slug.
  - `PATCH /:id` – cập nhật.
  - `DELETE /:id` – xóa.

- `tags.controller` (`/tags`)
  - `GET /popular` – tag phổ biến.
  - `GET /all` – tất cả tag.

- `notifications.controller` (`/notifications`)
  - `GET /` – danh sách.
  - `GET /unread-count` – số chưa đọc.
  - `GET /:id` – chi tiết.
  - `PATCH /:id/read` – đánh dấu đọc.
  - `PATCH /read-all` – đọc tất cả.
  - `DELETE /:id` – xóa.

- `search.controller` (`/search`)
  - `GET /girls` – tìm gái.
  - `GET /posts` – tìm bài.
  - `GET /reviews` – tìm review.
  - `GET /` – tổng hợp.

- `upload.controller` (`/api/upload`)
  - `POST /image` – upload 1 ảnh.
  - `POST /images` – upload nhiều ảnh.
  - `DELETE /image/:publicId` – xóa ảnh.
  - `GET /optimize/:publicId` – ảnh tối ưu.

- `crawler.controller` (`/crawler`)
  - `POST /save` – lưu dữ liệu crawl.

- `analytics` (đã nêu trên) – gồm public + admin controller.

- `users.controller` (`/users`)
  - `GET /` – danh sách.
  - `GET /me` – thông tin của tôi.
  - `GET /:id` – chi tiết.
  - `PATCH /me` – cập nhật profile cá nhân.
  - `PATCH /:id` – cập nhật user.
  - `POST /me/avatar` – upload avatar.
  - `POST /me/change-password` – đổi mật khẩu.
  - `PATCH /:id/activate|deactivate` – bật/tắt.
  - `DELETE /:id` – xóa.

- `venues.controller` (`/venues`)
  - `POST /` – tạo điểm hẹn.
  - `GET /` – danh sách.
  - `GET /search` – tìm kiếm.
  - `GET /:id` – chi tiết.
  - `PATCH /:id` – cập nhật.
  - `DELETE /:id` – xóa.

- `time-slots.controller` (`/time-slots`)
  - `POST /` – tạo slot.
  - `GET /` – danh sách.
  - `GET /girl/:girlId` – slot theo gái.
  - `GET /:id` – chi tiết.
  - `PATCH /:id` – cập nhật.
  - `DELETE /:id` – xóa.

- `service-packages.controller` (`/service-packages`)
  - `POST /` – tạo gói.
  - `GET /` – danh sách.
  - `GET /girl/:girlId` – gói theo gái.
  - `GET /:id` – chi tiết.
  - `PATCH /:id` – cập nhật.
  - `DELETE /:id` – xóa.

- `reports.controller` (`/reports`)
  - `POST /` – tạo báo cáo.
  - `GET /me` – báo cáo của tôi.
  - `GET /:id` – chi tiết.

- `favorites.controller` (`/favorites`)
  - `POST /:girlId` – thêm yêu thích.
  - `DELETE /:girlId` – bỏ yêu thích.
  - `GET /` – danh sách yêu thích.
  - `GET /check/:girlId` – kiểm tra trạng thái.

- `messages.controller` (`/messages`)
  - `POST /` – gửi tin.
  - `GET /conversations` – danh sách hội thoại.
  - `GET /conversation/:partnerId` – lấy hội thoại với partner.
  - `PATCH /:id/read` – đánh dấu đọc.
  - `PATCH /conversation/:partnerId/read` – đọc toàn bộ hội thoại.
  - `GET /unread-count` – số tin chưa đọc.
  - `DELETE /:id` – xóa tin.

- `districts.controller` (`/districts`)
  - `POST /` – tạo quận/huyện.
  - `GET /` – danh sách (có phân trang).
  - `GET /provinces` – danh sách tỉnh.
  - `GET /province/:province` – theo tỉnh.
  - `GET /:id` – chi tiết.
  - `PATCH /:id` – cập nhật.
  - `DELETE /:id` – xóa.

- `bookings.controller` (`/bookings`)
  - `POST /` – tạo booking.
  - `GET /` – danh sách (filter).
  - `GET /me` – booking của tôi.
  - `GET /girl/:girlId` – booking theo gái.
  - `GET /available-slots` – slot khả dụng.
  - `GET /:id` – chi tiết.
  - `PATCH /:id` – cập nhật.
  - `POST /:id/confirm|reject|cancel|complete` – các trạng thái.
  - `DELETE /:id` – xóa.

- `payments.controller` (`/payments`)
  - `POST /` – tạo thanh toán.
  - `GET /` – danh sách.
  - `GET /booking/:bookingId` – theo booking.
  - `GET /:id` – chi tiết.
  - `POST /:id/process` – xử lý thanh toán.
  - `POST /:id/refund` – hoàn tiền.

- `blocked-dates.controller` (`/blocked-dates`)
  - `POST /` – chặn ngày.
  - `GET /` – danh sách.
  - `GET /girl/:girlId` – theo gái.
  - `GET /:id` – chi tiết.
  - `DELETE /:id` – bỏ chặn.

- `cache.controller` (không có controller; module service nội bộ).

> Lưu ý: service class, guard, interceptor, util không được liệt kê chi tiết ở đây; doc này tập trung entry-point API.

### Frontend API Wrappers (`frontend/src/modules/**/api/*.ts`)

- `auth.api.ts` (`authApi`)
  - `login(data)` → `POST /auth/login`
  - `register(data)` → `POST /auth/register`
  - `refreshToken(data)` → `POST /auth/refresh`
  - `requestPasswordReset(data)` → `POST /auth/forgot-password`
  - `confirmPasswordReset(data)` → `POST /auth/reset-password`
  - `getCurrentUser()` → `GET /users/me`

- `modules/users/api/users.api.ts` (`usersApi`)
  - `getProfile()` → `GET /users/me`
  - `updateProfile(data)` → `PATCH /users/me`
  - `changePassword(data)` → `POST /users/change-password`
  - `uploadAvatar(file)` → `POST /users/avatar`
  - `getUserById(id)` → `GET /users/:id`

- `modules/admin/api/users.api.ts` (`usersApi`)
  - `getAll(params)` → `GET /admin/users`
  - `getById(id)` → `GET /admin/users/:id`
  - `update(id,data)` → `PATCH /users/:id`
  - `activate(id)` → `PATCH /admin/users/:id/activate`
  - `deactivate(id)` → `PATCH /admin/users/:id/deactivate`
  - `delete(id)` → `DELETE /admin/users/:id`
  - `create(data)` → `POST /admin/users`

- `modules/admin/api/admin.api.ts` (`adminApi`)
  - `getDashboardStats()` → `GET /admin/stats`
  - `getPendingPosts(page,limit)` → `GET /admin/pending/posts`
  - `getPendingReviews(page,limit)` → `GET /admin/pending/reviews`
  - `getPendingVerifications(page,limit)` → `GET /admin/pending/verifications`
  - `getReports(status,page,limit)` → `GET /admin/reports`
  - `processReport(id, action, notes?)` → `POST /admin/reports/:id/process`
  - `getAuditLogs(page,limit)` → `GET /admin/audit-logs`
  - `search(query)` → `GET /admin/search`
  - `getNotifications(unreadOnly,limit)` → `GET /admin/notifications`
  - `getUnreadCount()` → `GET /admin/notifications/unread-count`
  - `markNotificationAsRead(id)` → `POST /admin/notifications/:id/read`
  - `markAllNotificationsAsRead()` → `POST /admin/notifications/read-all`

- `modules/admin/api/analytics.api.ts` (`analyticsApi`)
  - `getAnalytics(timeRange)` → `GET /admin/analytics?timeRange=...` (fallback `/admin/stats`).

- `modules/admin/api/settings.api.ts` (`settingsApi`)
  - `getAll()` → `GET /admin/settings`
  - `update(settings)` → `PATCH /admin/settings`

- `modules/admin/api/girls.api.ts` (`girlsApi`)
  - `getAllAdmin(params)` → `GET /admin/girls`
  - `getDetailsAdmin(id)` → `GET /admin/girls/:id`
  - `deleteAdmin(id)` → `DELETE /admin/girls/:id`
  - `getAll(params)` → `GET /girls` (public filters)
  - `getById(id)` → `GET /girls/:id`
  - `approveVerification(id)` → `POST /girls/:id/verification/approve`
  - `rejectVerification(id,reason)` → `POST /girls/:id/verification/reject`
  - `updateStatus(id,isActive)` → `PATCH /admin/girls/:id/status`
  - `createAdmin(data)` → `POST /admin/girls`
  - `updateAdmin(id,data)` → `PATCH /admin/girls/:id`

- `modules/admin/api/posts.api.ts` (`postsApi` - admin/public mix)
  - `getAll(status,girlId,page,limit)` → `GET /posts`
  - `getAllAdmin(params)` → `GET /admin/posts`
  - `getDetailsAdmin(id)` → `GET /admin/posts/:id`
  - `createAdmin(data)` → `POST /admin/posts`
  - `updateAdmin(id,data)` → `PATCH /admin/posts/:id`
  - `deleteAdmin(id)` → `DELETE /admin/posts/:id`
  - `getById(id)` → `GET /posts/:id`
  - `approve(id,notes?)` → `POST /posts/:id/approve`
  - `reject(id,reason)` → `POST /posts/:id/reject`
  - `delete(id)` → `DELETE /posts/:id`

- `modules/admin/api/reviews.api.ts` (`reviewsApi` - admin view)
  - `getAll(status,girlId,page,limit)` → `GET /reviews`
  - `getById(id)` → `GET /reviews/:id`
  - `approve(id,notes?)` → `POST /reviews/:id/approve`
  - `reject(id,reason)` → `POST /reviews/:id/reject`
  - `delete(id)` → `DELETE /reviews/:id`

- `modules/admin/api/reports.api.ts` (`reportsApi`)
  - `getAll(status,page,limit)` → `GET /admin/reports`
  - `getById(id)` → `GET /reports/:id`
  - `process(id, action, notes?)` → `POST /admin/reports/:id/process`

- `modules/admin/api/analytics.api.ts` (đã liệt kê) và `modules/admin/api/settings.api.ts` (đã liệt kê).

- `modules/categories/api/categories.api.ts` (`categoriesApi`)
  - `getAll(includeInactive?)` → `GET /categories`
  - `getById(id)` → `GET /categories/:id`
  - `getBySlug(slug)` → `GET /categories/slug/:slug`
  - `create(data)` → `POST /categories`
  - `update(id,data)` → `PATCH /categories/:id`
  - `delete(id)` → `DELETE /categories/:id`

- `modules/posts/api/posts.api.ts` (`postsApi` - public/user)
  - `getAll(params)` → `GET /posts`
  - `getById(id)` → `GET /posts/:id`
  - `getByGirl(girlId)` → `GET /posts/girl/:girlId`
  - `getMyPosts(status?)` → `GET /posts/me`
  - `create(data)` → `POST /posts`
  - `update(id,data)` → `PATCH /posts/:id`
  - `delete(id)` → `DELETE /posts/:id`
  - `like(id)` → `POST /posts/:id/likes`
  - `unlike(id)` → `DELETE /posts/:id/likes`
  - `incrementView(id)` → `POST /posts/:id/view`
  - `toggleLike(id)` → `POST /posts/:id/like`
  - `getLikes(id)` → `GET /posts/:id/likes`
  - `getComments(id,page,limit)` → `GET /posts/:id/comments`
  - `addComment(id,content,parentId?)` → `POST /posts/:id/comments`
  - `getReplies(commentId,page,limit)` → `GET /posts/comments/:commentId/replies`

- `modules/girls/api/girls.api.ts` (`girlsApi` - public/user)
  - `getGirls(params)` → `GET /girls`
  - `getGirlById(id)` → `GET /girls/:id`
  - `createProfile(data)` → `POST /girls/profile`
  - `updateProfile(data)` → `PATCH /girls/profile`
  - `getMyProfile()` → `GET /girls/profile`
  - `getFeaturedGirls(limit?)` → `GET /girls/featured`
  - `incrementView(id)` → `POST /girls/:id/view`
  - `getCountByProvince()` → `GET /girls/count/by-province`

- `modules/reviews/api/reviews.api.ts` (`reviewsApi` - public/user)
  - `getByGirlId(girlId)` → `GET /reviews/girl/:girlId`
  - `create(data)` → `POST /reviews`
  - `toggleLike(reviewId)` → `POST /reviews/:id/like`
  - `getLikes(reviewId)` → `GET /reviews/:id/likes`
  - `addComment(reviewId,data)` → `POST /reviews/:id/comments`
  - `getComments(reviewId,page,limit)` → `GET /reviews/:id/comments`

- `modules/districts/api/districts.api.ts` (`districtsApi`)
  - `getDistricts(params)` → `GET /districts`
  - `getDistrictById(id)` → `GET /districts/:id`
  - `getAllDistricts()` → `GET /districts/all`

- `modules/notifications/api/notifications.api.ts` (`notificationsApi`)
  - `getAll(isRead?)` → `GET /notifications`
  - `getUnreadCount()` → `GET /notifications/unread-count`
  - `getById(id)` → `GET /notifications/:id`
  - `markAsRead(id)` → `PATCH /notifications/:id/read`
  - `markAllAsRead()` → `PATCH /notifications/read-all`
  - `delete(id)` → `DELETE /notifications/:id`

- `modules/tags/api/tags.api.ts` (`tagsApi`)
  - `getPopularTags(params)` → `GET /tags/popular`
  - `getAllTags()` → `GET /tags/all`

- `modules/crawler/api/crawler.api.ts` (`crawlerApi`)
  - `test()` → `GET /crawler/test`
  - `crawl(page,limit,crawlDetails?)` → `POST /crawler/crawl`
  - `crawlMultiple(startPage,endPage)` → `POST /crawler/crawl-multiple`
  - `closeBrowser()` → `POST /crawler/close`

---

Nếu cần mở rộng thêm (services/guards/util) hoặc chuẩn hóa mô tả, báo mình để đào sâu tiếp.

