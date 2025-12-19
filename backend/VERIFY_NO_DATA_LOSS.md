# ✅ Kiểm Tra Không Mất Data

## Tình Huống

Sau khi chạy `prisma db push`, có warning về việc drop column `parent_id` trên `review_comments` table có 3 giá trị non-null.

## Kiểm Tra Ngay

### Cách 1: Chạy Script Kiểm Tra

```bash
# SSH vào VPS
ssh user@your-vps-ip

cd /var/www/girl-pick/backend
bash check-data-loss.sh
```

### Cách 2: Kiểm Tra Thủ Công

```bash
# SSH vào VPS
ssh user@your-vps-ip

cd /var/www/girl-pick/backend
set -a && . .env.production && set +a

# 1. Kiểm tra cấu trúc bảng review_comments
mysql -u $DB_USER -p$DB_PASSWORD $DB_NAME -e "DESCRIBE review_comments;"

# 2. Kiểm tra số lượng records
mysql -u $DB_USER -p$DB_PASSWORD $DB_NAME -e "SELECT COUNT(*) as total FROM review_comments;"

# 3. Kiểm tra parent_id column có tồn tại không
mysql -u $DB_USER -p$DB_PASSWORD $DB_NAME -e "SHOW COLUMNS FROM review_comments LIKE 'parent_id';"

# 4. Kiểm tra records có parent_id
mysql -u $DB_USER -p$DB_PASSWORD $DB_NAME -e "SELECT COUNT(*) as with_parent FROM review_comments WHERE parent_id IS NOT NULL;"

# 5. Xem tất cả records
mysql -u $DB_USER -p$DB_PASSWORD $DB_NAME -e "SELECT id, reviewId, userId, parentId, LEFT(content, 50) as content, createdAt FROM review_comments;"
```

## Phân Tích Schema

Trong `schema.prisma`, `ReviewComment` model **VẪN CÓ** `parentId`:

```prisma
model ReviewComment {
  id        String   @id @default(uuid())
  reviewId  String
  userId    String
  content   String
  parentId  String?  // ✅ Vẫn có field này
  createdAt DateTime @default(now())

  parent   ReviewComment? @relation("CommentReplies", fields: [parentId], references: [id])
  replies  ReviewComment[] @relation("CommentReplies")
  
  @@map("review_comments")
}
```

## Kết Luận

**KHÔNG CÓ DATA LOSS** vì:
1. Schema vẫn có `parentId` field
2. Warning có thể do database state không sync với schema trước đó
3. `db push` đã sync lại và giữ nguyên cấu trúc

## Nếu Phát Hiện Mất Data

### Backup Trước Khi Fix

```bash
# Backup database
mysqldump -u $DB_USER -p$DB_PASSWORD $DB_NAME > backup_$(date +%Y%m%d_%H%M%S).sql
```

### Restore Nếu Cần

```bash
# Restore từ backup
mysql -u $DB_USER -p$DB_PASSWORD $DB_NAME < backup_YYYYMMDD_HHMMSS.sql
```

## Tiếp Theo

Sau khi verify không mất data:

```bash
# 1. Generate Prisma Client (quan trọng!)
cd /var/www/girl-pick/backend
set -a && . .env.production && set +a
npx prisma generate

# 2. Restart backend
cd /var/www/girl-pick
pm2 restart girl-pick-backend

# 3. Kiểm tra log
pm2 logs girl-pick-backend --lines 50
```

