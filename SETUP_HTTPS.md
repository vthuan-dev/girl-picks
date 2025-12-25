# Hướng dẫn setup lại HTTPS

## Vấn đề
Website bị mất HTTPS, chỉ còn HTTP.

## Giải pháp

### Bước 1: Cập nhật nginx config

File `nginx/gaigo1.net.conf` đã được cập nhật với:
- ✅ Uncomment phần HTTPS config
- ✅ Thêm `client_max_body_size 100M` cho HTTPS
- ✅ Redirect HTTP → HTTPS

### Bước 2: Copy config lên server

```bash
# SSH vào VPS
ssh root@your-vps-ip

# Copy config mới
cd ~/girl-pick
sudo cp nginx/gaigo1.net.conf /etc/nginx/sites-available/gaigo1.net

# Test config
sudo nginx -t
```

### Bước 3: Setup SSL với Let's Encrypt

#### Cách 1: Dùng script tự động (Khuyến nghị)

```bash
cd ~/girl-pick
sudo bash scripts/setup-ssl.sh
```

#### Cách 2: Thủ công

```bash
# 1. Cài certbot (nếu chưa có)
sudo apt-get update
sudo apt-get install -y certbot python3-certbot-nginx

# 2. Lấy SSL certificate
sudo certbot --nginx \
  --non-interactive \
  --agree-tos \
  --email Quangcao160901@gmail.com \
  -d gaigo1.net \
  -d www.gaigo1.net \
  --redirect

# 3. Test auto-renewal
sudo certbot renew --dry-run

# 4. Reload nginx
sudo nginx -t
sudo systemctl reload nginx
```

### Bước 4: Kiểm tra

```bash
# Test HTTPS
curl -I https://gaigo1.net

# Kiểm tra certificate
sudo certbot certificates
```

### Bước 5: Mở port 443 trong firewall

```bash
# UFW
sudo ufw allow 443/tcp
sudo ufw reload

# Kiểm tra
sudo ufw status
```

## Lưu ý

1. **Certbot sẽ tự động cập nhật nginx config** khi chạy `certbot --nginx`
2. **Auto-renewal**: Certbot tự động gia hạn certificate mỗi 90 ngày
3. **Port 443**: Đảm bảo firewall mở port 443 (HTTPS)
4. **DNS**: Đảm bảo domain `gaigo1.net` và `www.gaigo1.net` đều trỏ về IP server

## Nếu gặp lỗi

### Lỗi: "Failed to obtain certificate"

```bash
# Kiểm tra domain có trỏ đúng IP không
dig +short gaigo1.net
curl ifconfig.me

# Kiểm tra port 80 có mở không (cần cho Let's Encrypt verification)
sudo ufw allow 80/tcp
```

### Lỗi: "Certificate already exists"

```bash
# Xem certificates hiện có
sudo certbot certificates

# Renew certificate
sudo certbot renew

# Hoặc xóa và tạo lại
sudo certbot delete --cert-name gaigo1.net
sudo certbot --nginx -d gaigo1.net -d www.gaigo1.net
```

## Sau khi setup xong

Website sẽ tự động redirect HTTP → HTTPS:
- http://gaigo1.net → https://gaigo1.net
- http://www.gaigo1.net → https://gaigo1.net

