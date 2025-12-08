# ✅ Login Flow Checklist - Đảm bảo login hoạt động đúng

## 🔍 Các bước kiểm tra:

### 1. **Validation Response từ Backend**
- ✅ Response phải có `user` object
- ✅ Response phải có `accessToken` và `refreshToken`
- ✅ User object phải có: `id`, `email`, `role`

### 2. **Lưu Tokens vào Cookies**
- ✅ `accessToken` được lưu với expires: 1 ngày
- ✅ `refreshToken` được lưu với expires: 7 ngày
- ✅ Cookies có path: `/`
- ✅ Cookies có sameSite: `lax`
- ✅ Secure flag: chỉ bật trong production (HTTPS)

### 3. **Cập nhật Auth State**
- ✅ User được lưu vào Zustand store
- ✅ `isAuthenticated` = `true`
- ✅ `isAdmin` được set đúng theo role
- ✅ State được persist vào localStorage

### 4. **Redirect Path theo Role**
- ✅ ADMIN → `/admin/dashboard`
- ✅ GIRL → `/profile`
- ✅ CUSTOMER → `/search`
- ✅ Default → `/`

### 5. **Redirect Flow**
- ✅ Toast success hiển thị
- ✅ Delay 100ms để đảm bảo cookies được set
- ✅ Redirect bằng `window.location.href` (hard redirect)
- ✅ Redirect đến đúng path theo role

## 🧪 Cách test:

### Test Case 1: Login thành công với ADMIN
1. Login với tài khoản ADMIN
2. Kiểm tra console log: `✅ Login successful, redirecting to: /admin/dashboard`
3. Kiểm tra cookies: `accessToken` và `refreshToken` có trong cookies
4. Verify redirect đến `/admin/dashboard`

### Test Case 2: Login thành công với CUSTOMER
1. Login với tài khoản CUSTOMER
2. Kiểm tra redirect đến `/search`
3. Verify auth state: `isAuthenticated = true`

### Test Case 3: Login thành công với GIRL
1. Login với tài khoản GIRL
2. Kiểm tra redirect đến `/profile`
3. Verify user data được lưu đúng

### Test Case 4: Login thất bại
1. Login với sai password
2. Kiểm tra error message hiển thị
3. Verify không có redirect
4. Verify tokens không được lưu

## 🔧 Debug Commands:

### Kiểm tra cookies trong console:
```javascript
// Check access token
document.cookie.split('; ').find(row => row.startsWith('accessToken='))

// Check refresh token
document.cookie.split('; ').find(row => row.startsWith('refreshToken='))

// Check all cookies
document.cookie
```

### Kiểm tra auth state:
```javascript
// In browser console (if Zustand devtools enabled)
// Or check localStorage
localStorage.getItem('auth-storage')
```

## ⚠️ Common Issues:

### Issue 1: Tokens không được lưu
- **Nguyên nhân**: Cookie settings không đúng
- **Giải pháp**: Kiểm tra `cookieOptions` trong `auth.store.ts`

### Issue 2: Redirect không hoạt động
- **Nguyên nhân**: `window.location.href` bị block
- **Giải pháp**: Kiểm tra browser console có lỗi không

### Issue 3: Redirect đến sai path
- **Nguyên nhân**: Role không đúng hoặc `getRedirectPath` sai
- **Giải pháp**: Kiểm tra `response.user.role` và `getRedirectPath` function

### Issue 4: State không được update
- **Nguyên nhân**: `setAuth` throw error
- **Giải pháp**: Kiểm tra console log và verify response format

## 📝 Logs để theo dõi:

Khi login thành công, bạn sẽ thấy:
```
✅ Login successful, redirecting to: /admin/dashboard
✅ Access token stored: Yes
```

Khi có lỗi:
```
❌ Invalid response: ...
❌ Missing tokens in response: ...
❌ Error setting auth state: ...
```

---

**Lưu ý**: Tất cả validation và logging chỉ hoạt động trong development mode để không ảnh hưởng performance production.

