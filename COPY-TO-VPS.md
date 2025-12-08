# Hướng dẫn chạy script trên VPS

## Cách 1: Copy script và chạy trực tiếp

1. Mở SSH session của bạn (đã kết nối rồi)
2. Tạo file script:
```bash
nano setup-vps.sh
```

3. Copy toàn bộ nội dung file `setup-vps.sh` và paste vào nano
4. Save: `Ctrl+O`, Enter, `Ctrl+X`
5. Chạy script:
```bash
chmod +x setup-vps.sh
./setup-vps.sh
```

## Cách 2: Download script từ GitHub hoặc copy trực tiếp

```bash
# Tạo file và paste nội dung
cat > setup-vps.sh << 'EOF'
[paste nội dung setup-vps.sh vào đây]
EOF

chmod +x setup-vps.sh
./setup-vps.sh
```

## Cách 3: Chạy từng lệnh trực tiếp

Nếu không muốn dùng script, bạn có thể chạy từng lệnh:

```bash
# Update system
apt-get update -y && apt-get upgrade -y

# Install Node.js 20
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt-get install -y nodejs

# Install PM2
npm install -g pm2

# Install Nginx
apt-get install -y nginx
systemctl enable nginx
systemctl start nginx

# Install Git
apt-get install -y git

# Install build tools
apt-get install -y build-essential
```

Sau khi chạy xong, báo lại để tôi tiếp tục setup project!

