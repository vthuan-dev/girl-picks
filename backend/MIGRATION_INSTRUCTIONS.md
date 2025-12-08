# 🚀 Migration Instructions - Girl as Product

## Bước 1: Tạo Migration

```bash
cd backend
npx prisma migrate dev --name make_girl_product_with_manager
```

Migration này sẽ:
- Làm `userId` optional (nullable)
- Thêm `managedById` field
- Thêm các fields mới từ crawler
- Thêm relation `managedGirls` vào User model

## Bước 2: Generate Prisma Client

```bash
npx prisma generate
```

## Bước 3: Tạo Staff User

```bash
# Compile TypeScript
npx tsc scripts/create-staff.ts --outDir dist/scripts --esModuleInterop --module commonjs --target es2020

# Hoặc chạy trực tiếp với ts-node
npx ts-node scripts/create-staff.ts
```

Hoặc thêm vào `package.json`:
```json
"scripts": {
  "create-staff": "prisma generate && ts-node scripts/create-staff.ts"
}
```

Sau đó chạy:
```bash
npm run create-staff
```

## Bước 4: Test API

### 1. Login với Staff account:
```bash
POST /api/auth/login
{
  "email": "staff@gaigo1.net",
  "password": "Staff123!@#"
}
```

### 2. Tạo Girl (vật phẩm):
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
  "tags": ["tag1", "tag2"],
  "isAvailable": true
}
```

### 3. Update Girl:
```bash
PATCH /api/girls/:id
Authorization: Bearer <staff_token>
{
  "name": "Updated Name",
  "price": "300K"
}
```

### 4. Delete Girl:
```bash
DELETE /api/girls/:id
Authorization: Bearer <staff_token>
```

## ⚠️ Lưu ý:

1. **Backup database** trước khi chạy migration
2. Migration sẽ làm `userId` nullable - các Girl hiện có vẫn giữ `userId`
3. Cần update code sử dụng `girl.userId` để handle null case
4. Staff user có thể quản lý tất cả Girls (nếu là admin) hoặc chỉ Girls được assign

## 🔍 Verify Migration:

```sql
-- Check schema
DESCRIBE girls;

-- Check if userId is nullable
SHOW CREATE TABLE girls;

-- Check managedById field
SELECT id, name, userId, managedById FROM girls LIMIT 5;
```

## 📝 Next Steps:

1. ✅ Run migration
2. ✅ Create staff user
3. ✅ Test CRUD operations
4. ✅ Import data from crawler JSON
5. ✅ Update frontend to handle new fields

