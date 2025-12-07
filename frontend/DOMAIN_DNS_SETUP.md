# 🌐 Hướng Dẫn Trỏ Domain Qua DNS Cho Vercel

Hướng dẫn chi tiết để trỏ domain `gaigu1.net` (hoặc domain của bạn) qua DNS để sử dụng với Vercel.

## 📋 Yêu Cầu

1. ✅ **Domain đã được mua** (ví dụ: `gaigu1.net`)
2. ✅ **Project đã được deploy trên Vercel** (có URL dạng `your-project.vercel.app`)
3. ✅ **Quyền truy cập DNS của domain** (từ nhà cung cấp domain)

## 🚀 Bước 1: Thêm Domain Vào Vercel

### 1.1. Vào Project Settings

1. Đăng nhập vào [Vercel Dashboard](https://vercel.com/dashboard)
2. Chọn **Project** của bạn
3. Vào tab **Settings**
4. Click vào **Domains** ở menu bên trái

### 1.2. Thêm Domain

1. Trong phần **Domains**, nhập domain của bạn:
   - **Root domain**: `gaigu1.net`
   - **Subdomain**: `www.gaigu1.net` (tùy chọn)
2. Click **Add** hoặc **Add Domain**

### 1.3. Vercel Sẽ Hiển Thị DNS Records Cần Cấu Hình

Sau khi thêm domain, Vercel sẽ hiển thị các DNS records bạn cần thêm:

**Ví dụ:**
```
Type: A
Name: @
Value: 76.76.21.21

Type: CNAME
Name: www
Value: cname.vercel-dns.com
```

**HOẶC** (nếu dùng CNAME cho root domain):

```
Type: CNAME
Name: @
Value: cname.vercel-dns.com

Type: CNAME
Name: www
Value: cname.vercel-dns.com
```

## 🔧 Bước 2: Cấu Hình DNS Records

### 2.1. Đăng Nhập Vào Nhà Cung Cấp Domain

Truy cập vào trang quản lý DNS của nhà cung cấp domain (ví dụ: Namecheap, GoDaddy, Cloudflare, v.v.)

### 2.2. Tìm DNS Management

Tìm phần **DNS Management**, **DNS Settings**, hoặc **Advanced DNS** trong dashboard.

### 2.3. Thêm DNS Records

#### **Cách 1: Dùng A Record (Khuyên dùng cho root domain)**

1. **Thêm A Record cho root domain:**
   ```
   Type: A
   Host: @ (hoặc để trống, hoặc nhập domain chính)
   Value: 76.76.21.21
   TTL: 3600 (hoặc Auto)
   ```

2. **Thêm CNAME cho www subdomain:**
   ```
   Type: CNAME
   Host: www
   Value: cname.vercel-dns.com
   TTL: 3600 (hoặc Auto)
   ```

#### **Cách 2: Dùng CNAME (Nếu nhà cung cấp hỗ trợ CNAME cho root domain)**

Một số nhà cung cấp (như Cloudflare) cho phép dùng CNAME cho root domain:

1. **Thêm CNAME cho root domain:**
   ```
   Type: CNAME
   Host: @ (hoặc để trống)
   Value: cname.vercel-dns.com
   TTL: 3600 (hoặc Auto)
   ```

2. **Thêm CNAME cho www:**
   ```
   Type: CNAME
   Host: www
   Value: cname.vercel-dns.com
   TTL: 3600 (hoặc Auto)
   ```

### 2.4. Xóa Các Records Cũ (Nếu có)

Nếu có các A records hoặc CNAME records cũ trỏ đến server khác, hãy xóa chúng.

## ⏱️ Bước 3: Chờ DNS Propagation

### 3.1. Thời Gian Chờ

- **Thông thường**: 5-30 phút
- **Tối đa**: 24-48 giờ (hiếm khi)
- **Cloudflare**: Thường nhanh hơn (vài phút)

### 3.2. Kiểm Tra DNS Propagation

Bạn có thể kiểm tra DNS đã propagate chưa bằng các công cụ:

1. **Online Tools:**
   - [whatsmydns.net](https://www.whatsmydns.net/)
   - [dnschecker.org](https://dnschecker.org/)
   - Nhập domain và kiểm tra A record hoặc CNAME record

2. **Command Line:**
   ```bash
   # Kiểm tra A record
   nslookup gaigu1.net
   
   # Hoặc
   dig gaigu1.net
   
   # Kiểm tra CNAME
   nslookup www.gaigu1.net
   ```

### 3.3. Kiểm Tra Trong Vercel

1. Vào **Settings** → **Domains** trong Vercel Dashboard
2. Kiểm tra trạng thái domain:
   - ✅ **Valid Configuration**: DNS đã được cấu hình đúng
   - ⏳ **Pending**: Đang chờ DNS propagation
   - ❌ **Invalid Configuration**: DNS chưa đúng, cần kiểm tra lại

## ✅ Bước 4: Xác Nhận Domain

### 4.1. Vercel Tự Động Xác Nhận

Sau khi DNS đã propagate, Vercel sẽ tự động xác nhận domain và hiển thị:
- ✅ **Valid Configuration**
- Certificate SSL/TLS sẽ được tự động cấp (Let's Encrypt)

### 4.2. Kiểm Tra Website

1. Mở trình duyệt
2. Truy cập: `https://gaigu1.net` (hoặc domain của bạn)
3. Đảm bảo website load được và có SSL (🔒)

## 🔍 Hướng Dẫn Theo Từng Nhà Cung Cấp

### Namecheap

1. Đăng nhập vào [Namecheap](https://www.namecheap.com/)
2. Vào **Domain List** → Chọn domain
3. Click **Advanced DNS**
4. Thêm records:
   - **A Record**: `@` → `76.76.21.21`
   - **CNAME Record**: `www` → `cname.vercel-dns.com`
5. Save changes

### GoDaddy

1. Đăng nhập vào [GoDaddy](https://www.godaddy.com/)
2. Vào **My Products** → Chọn domain → **DNS**
3. Thêm records:
   - **A Record**: `@` → `76.76.21.21`
   - **CNAME Record**: `www` → `cname.vercel-dns.com`
4. Save

### Cloudflare

1. Đăng nhập vào [Cloudflare](https://www.cloudflare.com/)
2. Chọn domain
3. Vào **DNS** → **Records**
4. Thêm records:
   - **CNAME Record**: `@` → `cname.vercel-dns.com` (Proxy: Off)
   - **CNAME Record**: `www` → `cname.vercel-dns.com` (Proxy: Off)
5. **Lưu ý**: Cloudflare cho phép CNAME cho root domain, nhưng cần tắt Proxy (chỉ dùng DNS)

### FPT (nếu mua domain ở FPT)

1. Đăng nhập vào [FPT](https://fpt.vn/)
2. Vào **Quản lý Domain**
3. Chọn domain → **Quản lý DNS**
4. Thêm records tương tự như trên

## 🛠️ Troubleshooting

### Lỗi: "Invalid Configuration"

**Nguyên nhân:**
- DNS records chưa được thêm đúng
- DNS chưa propagate

**Giải pháp:**
1. Kiểm tra lại DNS records trong nhà cung cấp domain
2. Đảm bảo Value đúng (không có khoảng trắng, không có dấu chấm thừa)
3. Chờ thêm 10-15 phút và refresh lại

### Lỗi: "DNS Not Found"

**Nguyên nhân:**
- DNS records chưa được lưu
- TTL quá cao

**Giải pháp:**
1. Kiểm tra lại DNS records đã được Save chưa
2. Giảm TTL xuống 3600 hoặc Auto
3. Xóa cache DNS: `ipconfig /flushdns` (Windows) hoặc `sudo dscacheutil -flushcache` (Mac)

### Website Không Load

**Nguyên nhân:**
- DNS chưa propagate
- SSL chưa được cấp

**Giải pháp:**
1. Chờ thêm 15-30 phút
2. Kiểm tra DNS propagation bằng tools online
3. Clear browser cache
4. Thử truy cập bằng Incognito mode

### SSL Certificate Không Được Cấp

**Nguyên nhân:**
- DNS chưa propagate đầy đủ
- Domain chưa được xác nhận

**Giải pháp:**
1. Đợi DNS propagate hoàn toàn (có thể mất vài giờ)
2. Vercel sẽ tự động cấp SSL sau khi DNS đã propagate
3. Nếu sau 24h vẫn chưa có SSL, liên hệ Vercel support

## 📝 Checklist

- [ ] Domain đã được thêm vào Vercel project
- [ ] DNS records đã được thêm vào nhà cung cấp domain
- [ ] Đã chờ ít nhất 15-30 phút cho DNS propagate
- [ ] Đã kiểm tra DNS propagation bằng tools online
- [ ] Vercel hiển thị "Valid Configuration"
- [ ] Website có thể truy cập qua domain
- [ ] SSL certificate đã được cấp (🔒)

## 🔄 Cập Nhật DNS

Nếu cần thay đổi DNS records:

1. **Xóa records cũ** trong nhà cung cấp domain
2. **Thêm records mới** theo hướng dẫn của Vercel
3. **Chờ DNS propagate** (5-30 phút)

## 💡 Tips

1. **Sử dụng Cloudflare**: Cloudflare có DNS propagation nhanh và miễn phí
2. **Kiểm tra thường xuyên**: Dùng tools online để kiểm tra DNS propagation
3. **Backup DNS records**: Lưu lại các DNS records cũ trước khi thay đổi
4. **TTL thấp**: Đặt TTL thấp (3600) để DNS update nhanh hơn

## 📚 Tài Liệu Tham Khảo

- [Vercel Domain Documentation](https://vercel.com/docs/concepts/projects/domains)
- [Vercel DNS Configuration](https://vercel.com/docs/concepts/projects/domains/add-a-domain)
- [DNS Propagation Checker](https://www.whatsmydns.net/)

## 🆘 Hỗ Trợ

Nếu gặp vấn đề:
1. Kiểm tra [Vercel Status](https://www.vercel-status.com/)
2. Xem logs trong Vercel Dashboard
3. Liên hệ Vercel Support: [support@vercel.com](mailto:support@vercel.com)

---

**Chúc bạn cấu hình domain thành công! 🎉**

