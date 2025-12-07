# ⚡ Hướng Dẫn Nhanh: Trỏ Domain Qua DNS Cho Vercel

## 🎯 3 Bước Đơn Giản

### Bước 1: Thêm Domain Vào Vercel
1. Vào [Vercel Dashboard](https://vercel.com/dashboard)
2. Chọn **Project** → **Settings** → **Domains**
3. Nhập domain: `gaigu1.net` → Click **Add**

### Bước 2: Thêm DNS Records
Vercel sẽ hiển thị DNS records cần thêm. Vào nhà cung cấp domain và thêm:

**Option 1: A Record (Khuyên dùng)**
```
Type: A
Host: @
Value: 76.76.21.21

Type: CNAME
Host: www
Value: cname.vercel-dns.com
```

**Option 2: CNAME (Nếu hỗ trợ)**
```
Type: CNAME
Host: @
Value: cname.vercel-dns.com

Type: CNAME
Host: www
Value: cname.vercel-dns.com
```

### Bước 3: Chờ & Kiểm Tra
- ⏱️ Chờ 5-30 phút cho DNS propagate
- ✅ Kiểm tra trong Vercel: **Settings** → **Domains** → Xem trạng thái
- 🌐 Truy cập: `https://gaigu1.net`

## 🔍 Kiểm Tra DNS

**Online Tools:**
- [whatsmydns.net](https://www.whatsmydns.net/)
- [dnschecker.org](https://dnschecker.org/)

**Command:**
```bash
nslookup gaigu1.net
```

## 📝 Lưu Ý

- ✅ Vercel tự động cấp SSL (Let's Encrypt)
- ✅ Không cần cấu hình thêm gì
- ⏱️ DNS propagation thường mất 5-30 phút
- 🔄 Nếu sau 24h vẫn chưa hoạt động, kiểm tra lại DNS records

## 🆘 Gặp Vấn Đề?

Xem hướng dẫn chi tiết: [DOMAIN_DNS_SETUP.md](./DOMAIN_DNS_SETUP.md)

