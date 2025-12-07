# Kiểm tra tính năng Backend

## ✅ Chức năng tài khoản khách (CUSTOMER)

### 1. Bình luận (Comment)
- ✅ **Có**: `POST /posts/:id/comments`
- Controller: `posts.controller.ts` - `addComment()`
- Service: `posts.service.ts` - `addComment()`
- Role: `CUSTOMER`, `ADMIN`
- Status: ✅ Hoàn thành

### 2. Like
- ✅ **Có**: `POST /posts/:id/like`
- Controller: `posts.controller.ts` - `toggleLike()`
- Service: `posts.service.ts` - `toggleLike()`
- Role: `CUSTOMER`, `ADMIN`
- Status: ✅ Hoàn thành

### 3. Đăng bài review
- ✅ **Có**: `POST /reviews`
- Controller: `reviews.controller.ts` - `create()`
- Service: `reviews.service.ts` - `create()`
- Role: `CUSTOMER` only
- Status: ✅ Hoàn thành

### 4. Đánh giá sao (Rating)
- ✅ **Có**: Trong `CreateReviewDto` có field `rating`
- Controller: `reviews.controller.ts` - `create()`
- Service: `reviews.service.ts` - `create()`
- Role: `CUSTOMER` only
- Status: ✅ Hoàn thành

---

## ✅ Tài khoản quản trị (ADMIN)

### 1. Duyệt bài viết của khách
- ✅ **Có**: 
  - `POST /posts/:id/approve` - Duyệt bài viết
  - `POST /posts/:id/reject` - Từ chối bài viết
- Controller: `posts.controller.ts` - `approve()`, `reject()`
- Service: `posts.service.ts` - `approve()`, `reject()`
- Role: `ADMIN` only
- Status: ✅ Hoàn thành

### 2. Duyệt review
- ✅ **Có**: 
  - `POST /reviews/:id/approve` - Duyệt review
  - `POST /reviews/:id/reject` - Từ chối review
- Controller: `reviews.controller.ts` - `approve()`, `reject()`
- Service: `reviews.service.ts` - `approve()`, `reject()`
- Role: `ADMIN` only
- Status: ✅ Hoàn thành

### 3. Đăng gái mới
- ✅ **Có**: `POST /admin/girls`
- Controller: `admin.controller.ts` - `createGirl()`
- Service: `admin.service.ts` - `createGirl()`
- Role: `ADMIN` only
- Status: ✅ Hoàn thành

### 4. Tạo acc cấp thấp hơn chỉ có chức năng đăng ảnh và xoá ảnh
- ⚠️ **Một phần**: 
  - ✅ Tạo staff account: `POST /admin/staff` (tạo `STAFF_UPLOAD` role)
  - ❌ Upload ảnh: `POST /api/upload/image` - Chỉ cho `ADMIN`, `GIRL` (thiếu `STAFF_UPLOAD`)
  - ❌ Delete ảnh: `DELETE /api/upload/image/:publicId` - Chỉ cho `ADMIN`, `GIRL` (thiếu `STAFF_UPLOAD`)
  - ✅ Delete ảnh từ girl: `DELETE /girls/:id/images` - Cho `ADMIN`, `STAFF_UPLOAD`
- Controller: 
  - `admin.controller.ts` - `createStaff()` ✅
  - `upload.controller.ts` - `uploadImage()`, `deleteImage()` ❌ (thiếu `STAFF_UPLOAD`)
  - `girls.controller.ts` - `removeImage()` ✅
- Status: ⚠️ Cần thêm `STAFF_UPLOAD` vào upload controller

---

## 📋 Tóm tắt

### ✅ Đã hoàn thành (7/8)
1. ✅ Bình luận (Comment)
2. ✅ Like
3. ✅ Đăng bài review
4. ✅ Đánh giá sao
5. ✅ Duyệt bài viết
6. ✅ Duyệt review
7. ✅ Đăng gái mới

### ✅ Đã sửa (8/8)
8. ✅ Upload/Delete ảnh cho STAFF_UPLOAD - Đã thêm `STAFF_UPLOAD` vào `upload.controller.ts`

