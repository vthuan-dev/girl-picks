# Fix Browser Access Issues

## Vấn đề: Curl OK nhưng browser không truy cập được

### Nguyên nhân có thể:
1. Browser tự động redirect HTTP → HTTPS (HSTS)
2. Browser cache đang cache error/redirect
3. DNS trên client chưa resolve
4. Firewall/antivirus chặn

### Giải pháp:

#### 1. Clear Browser Cache hoàn toàn
- Chrome: `Ctrl+Shift+Delete` → Chọn "All time" → Clear
- Hoặc dùng Incognito: `Ctrl+Shift+N`

#### 2. Kiểm tra DNS trên client
```powershell
nslookup gaigo1.net
```
Nếu không resolve được, đổi DNS:
- Google: 8.8.8.8, 8.8.4.4
- Cloudflare: 1.1.1.1, 1.0.0.1

#### 3. Clear DNS cache Windows
```powershell
# Run as Administrator
ipconfig /flushdns
```

#### 4. Thêm vào hosts file (tạm thời để test)
```powershell
# Run Notepad as Administrator
# Open: C:\Windows\System32\drivers\etc\hosts
# Add:
207.148.78.56    gaigo1.net
207.148.78.56    www.gaigo1.net
```

#### 5. Kiểm tra browser có force HTTPS không
- Thử truy cập: `http://gaigo1.net` (không phải https://)
- Xóa HSTS cache: chrome://net-internals/#hsts → Delete domain

#### 6. Test từ PowerShell
```powershell
Invoke-WebRequest -Uri http://gaigo1.net -UseBasicParsing
```

#### 7. Kiểm tra firewall/antivirus
- Tạm thời tắt firewall/antivirus để test
- Thêm exception cho domain

