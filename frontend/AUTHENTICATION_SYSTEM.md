# 🔐 Authentication System - Tổng Quan

## ✅ Đã Hoàn Thành

### 1. **Auth Store (Zustand)**
- ✅ Quản lý user state và tokens
- ✅ Persist trong localStorage
- ✅ Auto check authentication
- ✅ Support tất cả roles: `ADMIN`, `GIRL`, `CUSTOMER`, `STAFF_UPLOAD`

### 2. **AuthGuard Component**
- ✅ Reusable component cho role-based protection
- ✅ Loading state với spinner
- ✅ Auto redirect khi không authorized
- ✅ Token verification với backend

### 3. **Next.js Middleware**
- ✅ Server-side route protection
- ✅ Public routes whitelist
- ✅ Token checking từ cookies

### 4. **Protected Layouts**
- ✅ `(admin)/layout.tsx` - Chỉ ADMIN
- ✅ `(girl)/layout.tsx` - Chỉ GIRL
- ✅ `(customer)/layout.tsx` - CUSTOMER, STAFF_UPLOAD, GIRL
- ✅ `(client)/layout.tsx` - Chỉ CUSTOMER
- ✅ `admin/layout.tsx` - Chỉ ADMIN

## 📋 Role-Based Access Control

### Roles Available:
```typescript
enum UserRole {
  ADMIN = 'ADMIN',           // Full access
  GIRL = 'GIRL',             // Girl dashboard
  CUSTOMER = 'CUSTOMER',     // Customer features
  STAFF_UPLOAD = 'STAFF_UPLOAD' // Staff upload content
}
```

### Route Protection:

| Route Pattern | Allowed Roles | Layout |
|--------------|--------------|--------|
| `/admin/*` | ADMIN | `admin/layout.tsx` |
| `/(admin)/*` | ADMIN | `(admin)/layout.tsx` |
| `/girl/*` | GIRL | `(girl)/layout.tsx` |
| `/(girl)/*` | GIRL | `(girl)/layout.tsx` |
| `/(customer)/*` | CUSTOMER, STAFF_UPLOAD, GIRL | `(customer)/layout.tsx` |
| `/(client)/*` | CUSTOMER | `(client)/layout.tsx` |

### Public Routes (No Auth Required):
- `/` - Homepage
- `/auth/login` - Login page
- `/auth/register` - Register page
- `/girls/*` - Girls listing & detail
- `/posts/*` - Posts listing & detail
- `/phim-sex` - Movies page
- `/anh-sex` - Images page
- `/chat-sex` - Chat page
- `/gai-goi/*` - Girls (alternative route)

## 🛡️ Protection Layers

### 1. **Server-Side (Middleware)**
```typescript
// frontend/src/middleware.ts
- Checks access token in cookies
- Allows public routes
- Passes through protected routes (client handles)
```

### 2. **Client-Side (AuthGuard)**
```typescript
// frontend/src/components/auth/AuthGuard.tsx
- Verifies token with backend
- Checks user role
- Shows loading state
- Redirects if unauthorized
```

### 3. **Layout-Level Protection**
```typescript
// All protected layouts use AuthGuard
<AuthGuard allowedRoles={[UserRole.ADMIN]}>
  {/* Protected content */}
</AuthGuard>
```

## 🔄 Authentication Flow

```
User visits protected route
    ↓
Middleware checks token (server-side)
    ↓
Client-side: AuthGuard component
    ↓
Check localStorage/cookies for token
    ↓
If token exists → Verify with backend API
    ↓
Backend returns user data
    ↓
Check user role matches allowedRoles
    ↓
✅ Authorized → Render content
❌ Unauthorized → Redirect to /auth/login
```

## 📝 Usage Examples

### Protect a Route with Specific Role:
```tsx
import AuthGuard from '@/components/auth/AuthGuard';
import { UserRole } from '@/types/auth';

export default function MyPage() {
  return (
    <AuthGuard allowedRoles={[UserRole.ADMIN]}>
      <div>Admin only content</div>
    </AuthGuard>
  );
}
```

### Protect with Multiple Roles:
```tsx
<AuthGuard allowedRoles={[UserRole.ADMIN, UserRole.STAFF_UPLOAD]}>
  <div>Admin or Staff content</div>
</AuthGuard>
```

### Protect Any Authenticated User:
```tsx
<AuthGuard>
  <div>Any logged-in user can access</div>
</AuthGuard>
```

## 🎯 Best Practices Implemented

### ✅ Loading States
- Spinner với message "Đang kiểm tra quyền truy cập..."
- Prevents flash of unauthorized content

### ✅ Error Handling
- Network errors handled gracefully
- Invalid tokens auto-logout
- 401/403 redirects to login

### ✅ Token Management
- Tokens stored in HTTP-only cookies (secure)
- Auto refresh token handling
- Token expiration handling

### ✅ User Experience
- Smooth redirects (no flash)
- Loading indicators
- Clear error messages

## 🔍 Testing Checklist

- [ ] Admin can access `/admin/*` routes
- [ ] Girl can access `/girl/*` routes
- [ ] Customer can access `/(customer)/*` routes
- [ ] Unauthenticated users redirected to login
- [ ] Wrong role users redirected to login
- [ ] Public routes accessible without auth
- [ ] Token expiration handled correctly
- [ ] Logout clears all auth state
- [ ] Page refresh maintains auth state

## 🚨 Security Notes

1. **Tokens**: Stored in cookies, not localStorage (more secure)
2. **Role Checking**: Both client and server-side
3. **Token Verification**: Always verify with backend, don't trust client
4. **Redirects**: Use `router.replace()` to prevent back button issues

## 📚 Files Structure

```
frontend/src/
├── middleware.ts                    # Next.js middleware
├── components/auth/
│   └── AuthGuard.tsx               # Reusable auth component
├── store/
│   └── auth.store.ts                # Zustand auth store
├── hooks/
│   └── useAuth.ts                   # Auth hook
├── app/
│   ├── (admin)/layout.tsx           # Admin layout
│   ├── (girl)/layout.tsx            # Girl layout
│   ├── (customer)/layout.tsx        # Customer layout
│   ├── (client)/layout.tsx          # Client layout
│   └── admin/layout.tsx             # Admin layout (alternative)
```

## ✅ Status: Hoàn Thành

Tất cả routes đã được protect đúng cách cho mọi role:
- ✅ ADMIN routes protected
- ✅ GIRL routes protected
- ✅ CUSTOMER routes protected
- ✅ STAFF_UPLOAD routes protected
- ✅ Public routes accessible
- ✅ Loading states implemented
- ✅ Error handling implemented

