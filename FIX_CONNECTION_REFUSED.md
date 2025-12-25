# Hướng dẫn sửa lỗi ERR_CONNECTION_REFUSED

## Vấn đề
Sau khi cập nhật nginx config, website `gaigo1.net` trả về lỗi **ERR_CONNECTION_REFUSED**.

## Nguyên nhân có thể
1. Nginx không chạy sau khi reload
2. Next.js app (port 3000) không chạy
3. Backend API (port 8000) không chạy
4. Nginx config có lỗi syntax
5. Firewall block ports

## Cách khắc phục

### Bước 1: Chạy script kiểm tra tự động

```bash
# SSH vào VPS
ssh root@your-vps-ip

# Chạy script
cd ~/girl-pick
sudo bash scripts/fix-nginx-connection-refused.sh
```

### Bước 2: Kiểm tra thủ công

#### 2.1. Kiểm tra Nginx

```bash
# Kiểm tra Nginx có chạy không
sudo systemctl status nginx

# Nếu không chạy, khởi động
sudo systemctl start nginx

# Kiểm tra config
sudo nginx -t

# Nếu config lỗi, xem chi tiết
sudo nginx -t 2>&1 | tail -20
```

#### 2.2. Kiểm tra Next.js app

```bash
# Kiểm tra port 3000 có đang listen không
sudo netstat -tlnp | grep 3000
# hoặc
sudo ss -tlnp | grep 3000

# Kiểm tra process Next.js
ps aux | grep -E "node|next" | grep -v grep

# Nếu không chạy, khởi động
cd ~/girl-pick/frontend
npm run start
# hoặc nếu dùng PM2
pm2 start npm --name 'nextjs' -- start
```

#### 2.3. Kiểm tra Backend

```bash
# Kiểm tra port 8000 có đang listen không
sudo netstat -tlnp | grep 8000
# hoặc
sudo ss -tlnp | grep 8000

# Kiểm tra process Backend
ps aux | grep -E "node.*dist/main|nest" | grep -v grep

# Nếu không chạy, khởi động
cd ~/girl-pick/backend
npm run start:prod
# hoặc nếu dùng PM2
pm2 start npm --name 'backend' -- run start:prod
```

#### 2.4. Kiểm tra logs

```bash
# Nginx error logs
sudo tail -50 /var/log/nginx/error.log

# Nginx access logs
sudo tail -20 /var/log/nginx/access.log

# System logs
sudo journalctl -u nginx -n 50 --no-pager
```

### Bước 3: Khởi động lại tất cả services

```bash
# 1. Restart Nginx
sudo systemctl restart nginx

# 2. Khởi động Next.js (nếu dùng PM2)
pm2 restart nextjs
# hoặc nếu không dùng PM2
cd ~/girl-pick/frontend
npm run start &

# 3. Khởi động Backend (nếu dùng PM2)
pm2 restart backend
# hoặc nếu không dùng PM2
cd ~/girl-pick/backend
npm run start:prod &
```

### Bước 4: Kiểm tra firewall

```bash
# Xem firewall status
sudo ufw status

# Cho phép HTTP và HTTPS
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

# Nếu dùng iptables
sudo iptables -L -n | grep -E "80|443"
```

## Khởi động với PM2 (Khuyến nghị)

Để đảm bảo services tự động khởi động lại khi server restart:

```bash
# Cài PM2 (nếu chưa có)
npm install -g pm2

# Khởi động Next.js
cd ~/girl-pick/frontend
pm2 start npm --name "nextjs" -- start

# Khởi động Backend
cd ~/girl-pick/backend
pm2 start npm --name "backend" -- run start:prod

# Lưu cấu hình PM2
pm2 save

# Setup PM2 startup script
pm2 startup
```

## Kiểm tra nhanh

```bash
# Test từ server
curl -I http://localhost:3000
curl -I http://127.0.0.1:8000/health

# Test từ bên ngoài (từ máy local)
curl -I http://gaigo1.net
```

## Nếu vẫn lỗi

1. **Kiểm tra DNS**: Đảm bảo domain `gaigo1.net` trỏ đúng về IP server
2. **Kiểm tra port**: Đảm bảo server mở port 80 và 443
3. **Kiểm tra nginx config**: Xem lại file `/etc/nginx/sites-available/gaigo1.net`
4. **Xem logs chi tiết**: `sudo tail -f /var/log/nginx/error.log`

## Lệnh nhanh để khởi động lại tất cả

```bash
# Restart tất cả
sudo systemctl restart nginx
pm2 restart all

# Kiểm tra status
sudo systemctl status nginx
pm2 status
```

