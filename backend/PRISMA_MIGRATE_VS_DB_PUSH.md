# Prisma: `db push` vs `migrate` - Sự khác biệt

## 🔄 `prisma db push`

**Đặc điểm:**
- ✅ **Nhanh chóng**: Sync schema trực tiếp với database, không tạo migration files
- ✅ **Phù hợp cho development**: Khi đang phát triển và test schema changes
- ✅ **Tự động**: Tự động detect và apply changes
- ❌ **Không track history**: Không có migration files để review hoặc rollback
- ❌ **Không an toàn cho production**: Có thể mất data nếu có breaking changes
- ❌ **Không version control**: Không thể xem lại lịch sử thay đổi schema

**Khi nào dùng:**
- Development/Prototyping
- Khi cần test schema changes nhanh
- Khi làm việc một mình, không cần track history

**Cú pháp:**
```bash
npx prisma db push
```

---

## 📝 `prisma migrate`

**Đặc điểm:**
- ✅ **Track history**: Tạo migration files để track mọi thay đổi
- ✅ **An toàn**: Có thể review SQL trước khi apply
- ✅ **Version control**: Commit migration files vào git
- ✅ **Rollback**: Có thể rollback migration nếu cần
- ✅ **Production ready**: Phù hợp cho production với team
- ❌ **Chậm hơn**: Cần tạo migration file, review, rồi mới apply
- ❌ **Phức tạp hơn**: Cần hiểu về migration workflow

**Khi nào dùng:**
- Production deployment
- Team collaboration
- Khi cần track và review schema changes
- Khi cần rollback changes

**Cú pháp:**
```bash
# Development: Tạo migration và apply ngay
npx prisma migrate dev --name migration_name

# Production: Chỉ apply migrations đã có (không tạo mới)
npx prisma migrate deploy
```

---

## 🔀 So sánh chi tiết

| Tính năng | `db push` | `migrate` |
|-----------|-----------|-----------|
| Tạo migration files | ❌ Không | ✅ Có |
| Track history | ❌ Không | ✅ Có |
| Review SQL trước | ❌ Không | ✅ Có |
| Rollback | ❌ Không | ✅ Có |
| Tốc độ | ⚡ Nhanh | 🐢 Chậm hơn |
| An toàn | ⚠️ Kém | ✅ An toàn |
| Production ready | ❌ Không | ✅ Có |
| Team collaboration | ❌ Không tốt | ✅ Tốt |

---

## 🚀 Chuyển từ `db push` sang `migrate`

### Bước 1: Baseline migration (tạo migration đầu tiên)

Vì bạn đã dùng `db push`, database đã có schema nhưng không có migration files. Cần tạo baseline:

```bash
# Tạo migration baseline từ schema hiện tại
npx prisma migrate dev --name init --create-only

# Hoặc nếu muốn mark migration đã apply (vì schema đã có trong DB)
npx prisma migrate resolve --applied <migration_name>
```

### Bước 2: Từ giờ dùng `migrate` cho mọi thay đổi

```bash
# Mỗi khi thay đổi schema:
npx prisma migrate dev --name describe_your_change

# Ví dụ:
npx prisma migrate dev --name add_chat_sex_additional_fields
```

### Bước 3: Update deploy script

Thay `prisma db push` bằng `prisma migrate deploy` trong `deploy.sh`

---

## 📋 Workflow khuyến nghị

### Development:
```bash
# 1. Thay đổi schema.prisma
# 2. Tạo migration
npx prisma migrate dev --name add_new_field

# 3. Migration tự động apply và generate Prisma Client
```

### Production:
```bash
# 1. Pull code mới (có migration files)
git pull

# 2. Apply migrations
npx prisma migrate deploy

# 3. Generate Prisma Client (nếu cần)
npx prisma generate
```

---

## ⚠️ Lưu ý quan trọng

1. **Không mix `db push` và `migrate`**: Chọn một cách và stick với nó
2. **Commit migration files**: Luôn commit migration files vào git
3. **Review migration SQL**: Luôn review SQL trong migration files trước khi apply
4. **Backup database**: Luôn backup trước khi apply migration trên production

---

## 🎯 Khuyến nghị cho project này

**Nên dùng `migrate` vì:**
- ✅ Đang deploy lên VPS (production)
- ✅ Cần track history của schema changes
- ✅ Dễ rollback nếu có vấn đề
- ✅ Team có thể review changes

**Cách chuyển:**
1. Tạo baseline migration từ schema hiện tại
2. Update deploy script để dùng `migrate deploy`
3. Từ giờ luôn dùng `migrate dev` cho mọi thay đổi

