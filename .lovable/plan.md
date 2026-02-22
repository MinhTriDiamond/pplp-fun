

# Bước tiếp theo: Hoàn thiện FUN ID Auth

## Tình trạng hiện tại

Hệ thống FUN ID đã có:
- Trang /auth với 4 phương thức (Email+PW, OTP, Google, Wallet)
- Trang /auth/setup-identity (chọn username bắt buộc)
- Trang /auth/link-accounts (hợp nhất tài khoản)
- Edge function wallet-auth
- Hook useAuth, usePostAuthRedirect, useUsername

## Các phần còn thiếu cần build

### 1. Route /auth/callback cho OTP Magic Link

OTP magic link redirect về `/auth/callback` nhưng route này chưa tồn tại. Cần tạo trang callback để:
- Xử lý token từ URL hash (Supabase tự động gắn token vào URL)
- Kiểm tra username setup
- Redirect đúng nơi

**File mới:** `src/pages/auth/AuthCallback.tsx`

### 2. Quên mật khẩu / Đặt lại mật khẩu

Hiện tại trang Email+Password không có nút "Quên mật khẩu". Cần:
- Thêm link "Quên mật khẩu?" vào AuthForm
- Tạo trang `/auth/reset-password` để user đặt mật khẩu mới sau khi click link trong email

**File mới:** `src/pages/auth/ResetPassword.tsx`
**File sửa:** `src/components/auth/AuthForm.tsx` (thêm link quên mật khẩu)

### 3. Cấu hình wallet-auth Edge Function

File `supabase/config.toml` chưa có cấu hình `verify_jwt = false` cho wallet-auth. Cần thêm để function nhận request không cần JWT.

**File sửa:** `supabase/config.toml`

### 4. Sửa wallet-auth Edge Function

Function hiện dùng `admin.createSession()` nhưng API này có thể không khả dụng. Cần đổi sang cách tiếp cận an toàn hơn: dùng `signInWithPassword` với password được lưu trữ, hoặc dùng `admin.generateLink` rồi exchange token.

**File sửa:** `supabase/functions/wallet-auth/index.ts`

### 5. Auth Guard cho các trang cần đăng nhập

Tạo component `RequireAuth` để bảo vệ các route cần đăng nhập (Settings, Wallet, Simulator, v.v.) thay vì kiểm tra thủ công trong từng trang.

**File mới:** `src/components/auth/RequireAuth.tsx`
**File sửa:** `src/App.tsx` (wrap các route cần bảo vệ)

---

## Chi tiết kỹ thuật

### AuthCallback page

```text
User click magic link trong email
  -> redirect về /auth/callback#access_token=...
  -> Supabase tự động parse token từ hash
  -> useAuth detect session mới
  -> Check username -> redirect setup-identity hoặc returnTo
```

### ResetPassword page

```text
User click "Quên mật khẩu" ở AuthForm
  -> Nhập email -> supabase.auth.resetPasswordForEmail()
  -> User nhận email -> click link
  -> Redirect về /auth/reset-password#type=recovery
  -> Hiện form nhập mật khẩu mới
  -> supabase.auth.updateUser({ password })
```

### RequireAuth component

```text
<RequireAuth>
  <Settings />
</RequireAuth>

// Nếu chưa login -> redirect /auth?returnTo=current_path
// Nếu đã login -> render children
```

### Các route cần bảo vệ

| Route | Bảo vệ |
|-------|--------|
| /settings | RequireAuth |
| /wallet | RequireAuth |
| /simulator | RequireAuth |
| /mint-requests | RequireAuth |
| /treasury | RequireAuth |
| /angel | RequireAuth |
| /admin/events | RequireAuth + Admin role |

### Tổng hợp file thay đổi

| File | Thay doi |
|------|----------|
| `src/pages/auth/AuthCallback.tsx` | Moi - xu ly OTP callback |
| `src/pages/auth/ResetPassword.tsx` | Moi - dat lai mat khau |
| `src/components/auth/RequireAuth.tsx` | Moi - guard component |
| `src/components/auth/AuthForm.tsx` | Them link "Quen mat khau" |
| `src/App.tsx` | Them routes callback, reset-password, wrap RequireAuth |
| `supabase/config.toml` | Them verify_jwt = false cho wallet-auth |
| `supabase/functions/wallet-auth/index.ts` | Sua cach tao session |

