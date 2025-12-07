# 🔍 Hướng Dẫn Kiểm Tra Thông Tin Domain gaigu1.net

## Cách Kiểm Tra Domain Đã Thuê Bao Lâu

### Phương Pháp 1: Sử Dụng Website WHOIS (Khuyến Nghị)

1. **Whois.net** (Miễn phí, dễ dùng nhất)
   - Truy cập: https://whois.net/gaigu1.net
   - Hoặc: https://www.whois.com/whois/gaigu1.net
   - Nhập domain `gaigu1.net` và xem kết quả

2. **ICANN Lookup** (Chính thức)
   - Truy cập: https://lookup.icann.org/
   - Nhập domain và xem thông tin chi tiết

3. **Namecheap WHOIS** (Nếu domain mua từ Namecheap)
   - Truy cập: https://www.namecheap.com/domains/whois/
   - Nhập domain để xem

### Phương Pháp 2: Sử Dụng Command Line (Nếu có)

**Windows:**
```powershell
# Cài đặt whois (nếu chưa có)
# Download từ: https://docs.microsoft.com/en-us/sysinternals/downloads/whois

# Sau đó chạy:
whois gaigu1.net
```

**Linux/Mac:**
```bash
whois gaigu1.net
```

### Phương Pháp 3: Kiểm Tra Email Từ Registrar

1. Kiểm tra email đăng ký domain
2. Tìm email từ nhà đăng ký (Registrar) như:
   - Namecheap
   - GoDaddy
   - Google Domains
   - Cloudflare
   - v.v.
3. Email thường chứa:
   - Ngày đăng ký (Registration Date)
   - Ngày hết hạn (Expiration Date)
   - Thông tin thanh toán

### Thông Tin Cần Kiểm Tra

Khi kiểm tra WHOIS, bạn sẽ thấy:

1. **Creation Date** (Ngày đăng ký)
   - Ví dụ: `2023-01-15T10:30:00Z`
   - Đây là ngày domain được đăng ký

2. **Expiration Date** (Ngày hết hạn)
   - Ví dụ: `2024-01-15T10:30:00Z`
   - Domain cần gia hạn trước ngày này

3. **Registrar** (Nhà đăng ký)
   - Tên công ty quản lý domain
   - Ví dụ: NameCheap, GoDaddy, etc.

4. **Status** (Trạng thái)
   - `ok` = Domain hoạt động bình thường
   - `clientTransferProhibited` = Không cho phép transfer
   - `clientHold` = Domain bị hold

### Tính Toán Thời Gian Đã Thuê

Sau khi có **Creation Date**, bạn có thể tính:

```python
from datetime import datetime

creation_date = "2023-01-15"  # Thay bằng ngày thực tế
today = datetime.now()

# Parse ngày
created = datetime.strptime(creation_date, "%Y-%m-%d")
days_owned = (today - created).days
years = days_owned / 365.25
months = days_owned / 30.44

print(f"Domain đã được thuê: {days_owned} ngày")
print(f"Tương đương: {years:.2f} năm hoặc {months:.2f} tháng")
```

### Lưu Ý Quan Trọng

1. **Privacy Protection**
   - Nếu domain có privacy protection, thông tin có thể bị ẩn
   - Cần đăng nhập vào tài khoản registrar để xem đầy đủ

2. **Domain .net**
   - Domain `.net` là domain quốc tế
   - Thông tin công khai trên WHOIS database

3. **Gia Hạn Domain**
   - Domain cần gia hạn trước ngày hết hạn
   - Thường có thời gian grace period (30-45 ngày)
   - Sau đó domain sẽ bị delete và có thể bị người khác mua

### Các Website Kiểm Tra Domain Khác

- https://whois.net/
- https://www.whois.com/
- https://lookup.icann.org/
- https://www.namecheap.com/domains/whois/
- https://whois.domaintools.com/
- https://mxtoolbox.com/whois.aspx

### Ví Dụ Kết Quả WHOIS

```
Domain Name: GAIGU1.NET
Registry Domain ID: 1234567890_DOMAIN_NET-VRSN
Registrar WHOIS Server: whois.namecheap.com
Registrar URL: http://www.namecheap.com
Updated Date: 2023-06-15T10:30:00Z
Creation Date: 2023-01-15T10:30:00Z    ← Ngày đăng ký
Registry Expiry Date: 2024-01-15T10:30:00Z  ← Ngày hết hạn
Registrar: NameCheap, Inc.
Registrar IANA ID: 1068
Registrar Abuse Contact Email: abuse@namecheap.com
Domain Status: ok https://icann.org/epp#ok
```

### Quick Check (Nhanh)

**Cách nhanh nhất:**
1. Mở browser
2. Vào: https://whois.net/gaigu1.net
3. Xem **Creation Date** và **Expiration Date**

---

**💡 Tip:** Nếu bạn là chủ sở hữu domain, đăng nhập vào tài khoản registrar để xem thông tin chính xác nhất!


