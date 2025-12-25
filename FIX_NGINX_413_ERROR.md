# Hướng dẫn sửa lỗi 413 Request Entity Too Large

## Vấn đề
Khi upload video hoặc file lớn, nginx trả về lỗi **413 Request Entity Too Large** vì mặc định nginx chỉ cho phép upload file tối đa **1MB**.

## Giải pháp

Đã cập nhật file `nginx/gaigo1.net.conf` với các thay đổi:
- `client_max_body_size 100M` - Cho phép upload file lên đến 100MB
- `client_body_buffer_size 128k` - Tối ưu buffer cho upload
- Tăng timeout lên 300s (5 phút) cho upload file lớn

## Cách áp dụng lên server

### Cách 1: Sử dụng script tự động (Khuyến nghị)

```bash
# SSH vào VPS
ssh root@your-vps-ip

# Chuyển đến thư mục project
cd ~/girl-pick

# Chạy script
sudo bash scripts/update-nginx-upload-limit.sh
```

### Cách 2: Thủ công

```bash
# 1. SSH vào VPS
ssh root@your-vps-ip

# 2. Copy file config mới
cd ~/girl-pick
sudo cp nginx/gaigo1.net.conf /etc/nginx/sites-available/gaigo1.net

# 3. Kiểm tra cấu hình
sudo nginx -t

# 4. Reload nginx
sudo systemctl reload nginx
```

### Cách 3: Chỉnh sửa trực tiếp trên server

Nếu không muốn copy file, bạn có thể chỉnh sửa trực tiếp:

```bash
# 1. SSH vào VPS
ssh root@your-vps-ip

# 2. Mở file config
sudo nano /etc/nginx/sites-available/gaigo1.net

# 3. Thêm vào mỗi location block:
#    - Trong location / { ... }
#    - Trong location /api/ { ... }
# Thêm các dòng sau:
client_max_body_size 100M;
client_body_buffer_size 128k;

# Và tăng timeout:
proxy_connect_timeout 300s;
proxy_send_timeout 300s;
proxy_read_timeout 300s;

# 4. Lưu file (Ctrl+O, Enter, Ctrl+X)

# 5. Kiểm tra và reload
sudo nginx -t
sudo systemctl reload nginx
```

## Kiểm tra

Sau khi áp dụng, kiểm tra:

```bash
# Xem cấu hình nginx hiện tại
sudo nginx -T | grep client_max_body_size

# Kiểm tra nginx đang chạy
sudo systemctl status nginx

# Xem logs nếu có lỗi
sudo tail -f /var/log/nginx/error.log
```

## Lưu ý

1. **File size limit**: Hiện tại đã set là 100MB. Nếu cần upload file lớn hơn, thay đổi `100M` thành giá trị khác (ví dụ: `200M`, `500M`)

2. **Timeout**: Đã tăng lên 300s (5 phút). Nếu upload file rất lớn hoặc mạng chậm, có thể cần tăng thêm.

3. **HTTPS**: Nếu bạn đang dùng HTTPS, cần uncomment và cập nhật phần HTTPS config trong file nginx cũng với các settings tương tự.

4. **Backend**: Đảm bảo backend (NestJS) cũng được cấu hình để nhận file lớn. Kiểm tra trong `backend/src/main.ts` có `bodyParser` limit chưa.

## Sau khi áp dụng

Thử upload video lại. Nếu vẫn lỗi, kiểm tra:
- Backend có limit body size không
- Firewall có block không
- Disk space còn đủ không

