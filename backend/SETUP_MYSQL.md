# 🔧 Setup MySQL Database

## Cấu hình .env

Thêm hoặc cập nhật trong file `.env`:

```env
DATABASE_URL="mysql://root:1001@localhost:3306/girl_pick_db?schema=public"
```

**Giải thích:**
- `mysql://` - Protocol
- `root` - Username (thay bằng username của bạn nếu khác)
- `1001` - Password
- `localhost:3306` - Host và port
- `girl_pick_db` - Tên database (tạo database này trước)

## Tạo Database

### Option 1: MySQL Command Line

```bash
mysql -u root -p1001
```

Sau đó trong MySQL:

```sql
CREATE DATABASE girl_pick_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
EXIT;
```

### Option 2: MySQL Workbench

1. Mở MySQL Workbench
2. Connect với root/1001
3. Tạo database mới: `girl_pick_db`
4. Character set: `utf8mb4`
5. Collation: `utf8mb4_unicode_ci`

## Chạy Migrations

```bash
cd backend
npx prisma migrate dev
```

## Generate Prisma Client

```bash
npx prisma generate
```

## Tạo Admin User

```bash
npm run create-admin
```

---

## ✅ Checklist

- [ ] MySQL đang chạy trên localhost:3306
- [ ] Database `girl_pick_db` đã được tạo
- [ ] File `.env` có `DATABASE_URL` đúng
- [ ] Schema đã được sửa thành `mysql`
- [ ] Đã chạy `prisma migrate dev`
- [ ] Đã chạy `prisma generate`
- [ ] Đã chạy `npm run create-admin`

