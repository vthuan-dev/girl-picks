# Hướng dẫn Update .env trên VPS

## Cách 1: Dùng nano (Khuyến nghị)

### Bước 1: SSH vào VPS
```bash
ssh user@your-vps-ip
```

### Bước 2: Di chuyển đến thư mục project
```bash
cd /path/to/girl-pick
```

### Bước 3: Mở file .env bằng nano
```bash
nano .env
```

### Bước 4: Paste nội dung .env
- **Windows**: Copy từ file `.env.local` của bạn, sau đó trong nano nhấn `Shift + Insert` hoặc `Right Click` để paste
- **Mac/Linux**: Copy từ file `.env.local`, sau đó trong nano nhấn `Cmd + V` hoặc `Right Click` để paste

### Bước 5: Lưu và thoát
- Nhấn `Ctrl + O` (Save)
- Nhấn `Enter` (Confirm)
- Nhấn `Ctrl + X` (Exit)

### Bước 6: Restart backend
```bash
# Nếu dùng Docker Compose
docker-compose restart backend

# Hoặc nếu dùng PM2
pm2 restart girl-pick-backend

# Hoặc nếu dùng systemd
sudo systemctl restart girl-pick-backend
```

---

## Cách 2: Dùng script tự động

### Chạy script edit
```bash
chmod +x scripts/edit-env-vps.sh
./scripts/edit-env-vps.sh
```

Script sẽ tự động:
- Tạo backup .env
- Mở nano để bạn paste
- Hướng dẫn restart

---

## Cách 3: Copy file trực tiếp từ local lên VPS

### Từ máy local (Windows PowerShell)
```powershell
# Copy .env.local lên VPS
scp .env.local user@your-vps-ip:/path/to/girl-pick/.env
```

### Từ máy local (Mac/Linux)
```bash
# Copy .env.local lên VPS
scp .env.local user@your-vps-ip:/path/to/girl-pick/.env
```

Sau đó SSH vào VPS và restart backend.

---

## Cách 4: Dùng vi/vim (nếu không có nano)

```bash
vi .env
# hoặc
vim .env
```

**Lệnh vi/vim:**
- Nhấn `i` để vào chế độ insert
- Paste nội dung
- Nhấn `Esc` để thoát insert mode
- Gõ `:wq` và nhấn Enter để save và quit

---

## Kiểm tra .env đã được update chưa

```bash
# Xem nội dung .env
cat .env

# Hoặc xem với syntax highlight
cat .env | grep -E "^[A-Z]" | head -20
```

---

## Lưu ý quan trọng

1. **Backup trước khi edit:**
   ```bash
   cp .env .env.backup.$(date +%Y%m%d_%H%M%S)
   ```

2. **Kiểm tra format:**
   - Không có khoảng trắng thừa
   - Mỗi biến trên 1 dòng
   - Không có dấu ngoặc kép thừa (trừ giá trị có khoảng trắng)

3. **Sau khi update .env, nhớ restart backend:**
   ```bash
   docker-compose restart backend
   # hoặc
   pm2 restart girl-pick-backend
   ```

4. **Kiểm tra logs sau khi restart:**
   ```bash
   docker-compose logs -f backend
   # hoặc
   pm2 logs girl-pick-backend
   ```




