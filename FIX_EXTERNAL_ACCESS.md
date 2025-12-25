# Sửa lỗi không truy cập được từ bên ngoài

## Vấn đề
- ✅ Next.js chạy tốt trên localhost:3000 (curl trả về 200 OK)
- ❌ Không truy cập được từ bên ngoài qua domain gaigo1.net (ERR_CONNECTION_REFUSED)

## Nguyên nhân thường gặp

### 1. Nginx site chưa được enable
Nginx chỉ serve các site trong `/etc/nginx/sites-enabled/`

### 2. Firewall block port 80
UFW hoặc iptables chưa mở port 80

### 3. Nginx không listen trên tất cả interfaces
Config có thể chỉ listen trên localhost

## Cách khắc phục

### Bước 1: Chạy script kiểm tra

```bash
cd ~/girl-pick
sudo bash scripts/check-nginx-external-access.sh
```

### Bước 2: Enable Nginx site (Nếu chưa enable)

```bash
# Kiểm tra site có được enable chưa
ls -la /etc/nginx/sites-enabled/ | grep gaigo1

# Nếu không có, tạo symlink
sudo ln -sf /etc/nginx/sites-available/gaigo1.net /etc/nginx/sites-enabled/gaigo1.net

# Test config
sudo nginx -t

# Reload nginx
sudo systemctl reload nginx
```

### Bước 3: Mở port 80 trong firewall

```bash
# Nếu dùng UFW
sudo ufw status
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw reload

# Nếu dùng iptables
sudo iptables -A INPUT -p tcp --dport 80 -j ACCEPT
sudo iptables -A INPUT -p tcp --dport 443 -j ACCEPT
sudo iptables-save
```

### Bước 4: Kiểm tra Nginx listen trên tất cả interfaces

```bash
# Kiểm tra nginx có listen trên 0.0.0.0:80 không
sudo ss -tlnp | grep nginx
# hoặc nếu có netstat
sudo netstat -tlnp | grep nginx

# Phải thấy: 0.0.0.0:80 hoặc :::80
# Nếu chỉ thấy 127.0.0.1:80 → Cần sửa config
```

### Bước 5: Restart Nginx

```bash
sudo systemctl restart nginx
sudo systemctl status nginx
```

### Bước 6: Test từ server

```bash
# Test localhost
curl -I http://localhost

# Test với domain name
curl -I -H "Host: gaigo1.net" http://localhost

# Test từ IP server
curl -I http://$(curl -s ifconfig.me)
```

### Bước 7: Kiểm tra DNS

```bash
# Kiểm tra domain trỏ đúng IP chưa
dig +short gaigo1.net
# hoặc
nslookup gaigo1.net

# So sánh với IP server
curl -s ifconfig.me
```

## Lệnh nhanh để fix tất cả

```bash
# 1. Enable site
sudo ln -sf /etc/nginx/sites-available/gaigo1.net /etc/nginx/sites-enabled/gaigo1.net

# 2. Test config
sudo nginx -t

# 3. Mở firewall
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

# 4. Restart nginx
sudo systemctl restart nginx

# 5. Kiểm tra
sudo systemctl status nginx
sudo ss -tlnp | grep nginx
```

## Kiểm tra từ bên ngoài

Sau khi fix, test từ máy local:

```bash
# Từ máy Windows/Linux local
curl -I http://gaigo1.net

# Hoặc mở browser
# http://gaigo1.net
```

## Nếu vẫn lỗi

### 1. Firewall của Vultr (QUAN TRỌNG NHẤT!)

Vultr có firewall riêng trong dashboard. Cần mở port 80 và 443:

1. Đăng nhập Vultr dashboard: https://my.vultr.com
2. Vào **Products** > Chọn server của bạn
3. Vào tab **Firewall** hoặc **Settings** > **Firewall**
4. Tạo/Chỉnh sửa firewall group:
   - Thêm rule: **HTTP (80)** - Allow
   - Thêm rule: **HTTPS (443)** - Allow
5. Apply firewall group vào server

**Hoặc tắt firewall tạm thời để test:**
- Trong firewall settings, chọn "No Firewall" hoặc disable firewall group

### 2. Kiểm tra DNS

```bash
# Chạy script kiểm tra
cd ~/girl-pick
sudo bash scripts/check-external-connection.sh

# Hoặc kiểm tra thủ công
dig +short gaigo1.net
# Phải trả về IP server của bạn
```

Kiểm tra online: https://dnschecker.org/#A/gaigo1.net

### 3. Test từ server với IP thực

```bash
# Lấy IP server
curl ifconfig.me

# Test với IP thực
curl -I http://YOUR_SERVER_IP

# Nếu không phản hồi → Firewall của Vultr đang chặn
```

### 4. Xem logs

```bash
# Access logs (xem có request từ bên ngoài không)
sudo tail -f /var/log/nginx/access.log

# Error logs
sudo tail -f /var/log/nginx/error.log
```

Nếu không thấy request nào trong access.log → Firewall đang chặn hoàn toàn

