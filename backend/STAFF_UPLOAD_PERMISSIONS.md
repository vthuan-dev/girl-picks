# 🔐 STAFF_UPLOAD Permissions - Quản lý Gái và Phim

## 📋 Role Hierarchy:

```
ADMIN (Quyền cao nhất)
  ↓
STAFF_UPLOAD (Quản lý Content: Gái + Phim) ← Role này
  ↓
CUSTOMER (Khách hàng)
```

## ✅ STAFF_UPLOAD có quyền:

### 1. **Girls (Gái) - CRUD đầy đủ**

#### Create:
- `POST /api/girls` - Tạo Girl mới
- Có thể tạo từ crawler hoặc manual
- Set `managedById` = staff user id

#### Read:
- `GET /api/girls` - Xem tất cả Girls (public endpoint)
- `GET /api/girls/:id` - Xem chi tiết Girl (public endpoint)

#### Update:
- `PATCH /api/girls/:id` - Update Girl
- Chỉ update được Girls mà mình quản lý (hoặc admin update được tất cả)
- Permission check: `managedById === staff.id` hoặc `role === ADMIN`

#### Delete:
- `DELETE /api/girls/:id` - Delete Girl
- Chỉ delete được Girls mà mình quản lý (hoặc admin delete được tất cả)

#### Other:
- `POST /api/girls/:id/images` - Thêm images
- `DELETE /api/girls/:id/images` - Xóa image

### 2. **Posts (Phim/Bài viết) - CRUD đầy đủ**

#### Create:
- `POST /api/posts/admin` - Tạo Post mới (as admin/staff)
- Tạo post với status PENDING hoặc APPROVED

#### Read:
- `GET /api/posts` - Xem tất cả Posts (public endpoint)
- Có thể filter theo status, girlId

#### Update:
- `PATCH /api/posts/admin/:id` - Update bất kỳ Post nào
- Không cần check owner
- Có thể update bất kỳ status nào

#### Delete:
- `DELETE /api/posts/admin/:id` - Delete bất kỳ Post nào
- Không cần check owner

#### Approve/Reject:
- `POST /api/posts/:id/approve` - Duyệt Post
- `POST /api/posts/:id/reject` - Từ chối Post

### 3. **Upload Files**
- `POST /api/upload/image` - Upload ảnh
- `POST /api/upload/video` - Upload video
- `POST /api/upload/multiple` - Upload nhiều files

## ❌ STAFF_UPLOAD KHÔNG có quyền:

- ❌ Quản lý Users (chỉ ADMIN)
- ❌ Quản lý Settings (chỉ ADMIN)
- ❌ Quản lý System config (chỉ ADMIN)
- ❌ Tạo/Delete ADMIN users (chỉ ADMIN)
- ❌ Quản lý Payments (chỉ ADMIN)
- ❌ Quản lý Audit Logs (chỉ ADMIN)

## 🔧 Guards sử dụng:

### 1. `ContentManagerGuard`
- Dùng cho cả Girls và Posts
- Check: `role === ADMIN || role === STAFF_UPLOAD`

### 2. `GirlManagerGuard`
- Dùng riêng cho Girls
- Check: `role === ADMIN || role === STAFF_UPLOAD`

## 📝 API Examples:

### Tạo Girl:
```bash
POST /api/girls
Authorization: Bearer <staff_token>
{
  "name": "Test Girl",
  "age": 25,
  "bio": "Test bio",
  "phone": "0123456789",
  "price": "200K",
  "images": ["url1", "url2"],
  "tags": ["tag1"],
  "isAvailable": true
}
```

### Update Girl:
```bash
PATCH /api/girls/:id
Authorization: Bearer <staff_token>
{
  "name": "Updated Name",
  "price": "300K"
}
```

### Tạo Post:
```bash
POST /api/posts/admin
Authorization: Bearer <staff_token>
{
  "title": "Test Post",
  "content": "Content here",
  "images": ["url1"],
  "girlId": "girl-id-here"
}
```

### Approve Post:
```bash
POST /api/posts/:id/approve
Authorization: Bearer <staff_token>
{
  "notes": "Approved by staff"
}
```

## 🎯 Workflow:

### Import từ Crawler:
1. STAFF_UPLOAD login
2. Upload JSON file hoặc dùng script import
3. System tạo Girls với `managedById = staff.id`
4. Girls hiển thị như sản phẩm

### Quản lý Content:
1. STAFF_UPLOAD login
2. CRUD Girls và Posts
3. Approve/Reject Posts
4. Track được ai quản lý content nào

## ✅ Tóm tắt:

**STAFF_UPLOAD có quyền:**
- ✅ CRUD Girls (vật phẩm)
- ✅ CRUD Posts (phim/bài viết)
- ✅ Approve/Reject Posts
- ✅ Upload files
- ✅ Quản lý images

**STAFF_UPLOAD KHÔNG có quyền:**
- ❌ Quản lý Users
- ❌ Quản lý System
- ❌ Quản lý Settings

