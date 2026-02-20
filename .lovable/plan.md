
# Hệ thống FUN ID Auth — eco.fun.rich

## Tổng quan

Nâng cấp toàn bộ trang `/auth` thành hệ thống FUN ID chính thức, hỗ trợ 4 phương thức đăng nhập, bắt buộc chọn username sau đăng ký lần đầu, và có màn hình hợp nhất tài khoản từ các platform cũ.

Dự án hiện tại đã có:
- Email + Password (AuthForm, useAuth)
- Google OAuth (lovable.auth.signInWithOAuth)
- useWallet hook (MetaMask / BSC Testnet)
- UsernameForm component (có thể tái sử dụng)
- profiles, module_users, identities_link tables

---

## Kiến trúc Flow

```
User vào /auth
       │
       ▼
┌──────────────────────────────────┐
│  FUN ID — 4 phương thức         │
│  [Email+PW] [OTP] [Google] [Wallet] │
└──────────────────────────────────┘
       │
       ▼
  Đăng nhập/ký thành công?
       │
       ├── User MỚI (chưa có username)
       │         │
       │         ▼
       │   /auth/setup-identity (bắt buộc)
       │   - Chọn username
       │   - Tên hiển thị (optional)
       │         │
       │         ▼
       │   /auth/link-accounts (optional, có "Để sau")
       │   - Hợp nhất tài khoản cũ
       │         │
       │         ▼
       │   Redirect returnTo (hoặc '/')
       │
       └── User CŨ (đã có username)
                 │
                 ▼
           /auth/link-accounts (optional)
           hoặc redirect returnTo thẳng
```

---

## Phần 1: Nâng cấp trang /auth

### 1.1 Giao diện 4 phương thức

Thay thiết kế tab "Đăng nhập / Đăng ký" hiện tại thành màn hình FUN ID với 4 lựa chọn rõ ràng:

```
┌─────────────────────────────────┐
│   ✨ FUN ID                     │
│   Một tài khoản · Ba platform  │
│                                 │
│  [📧 Tiếp tục với Email]        │
│  [🔢 Tiếp tục với OTP]          │
│  [G  Tiếp tục với Google]       │
│  [🦊 Tiếp tục với Wallet]       │
│                                 │
│  Chưa có tài khoản? Đăng ký    │
└─────────────────────────────────┘
```

- **Email + Password**: form 2 trường (đã có, giữ nguyên logic)
- **OTP Email**: nhập email → gửi magic link qua `supabase.auth.signInWithOtp()`
- **Google**: dùng `lovable.auth.signInWithOAuth("google")` (đã có)
- **Wallet**: ký message → dùng `supabase.auth.signInWithPassword()` với wallet address làm định danh

### 1.2 returnTo support

Đọc `?returnTo=` từ URL params, lưu vào state, redirect sau khi auth thành công.

---

## Phần 2: Màn hình Setup Identity (mới)

### Route: `/auth/setup-identity`

Hiển thị bắt buộc với user mới (username = null trong profiles).

Tái sử dụng logic từ `UsernameForm` + thêm:
- Trường "Tên hiển thị" (optional)
- Badge giải thích: "Username không thể thay đổi sau 30 ngày"
- Nút "Xác nhận" → lưu username → tiếp tục

**Logic kiểm tra:**
```typescript
// Sau khi auth thành công
const { data } = await supabase.from('profiles').select('username').eq('id', user.id).single()
if (!data?.username) {
  navigate('/auth/setup-identity?returnTo=' + returnTo)
}
```

---

## Phần 3: Màn hình Link Accounts (Hợp nhất tài khoản)

### Route: `/auth/link-accounts`

Hiển thị sau setup-identity (hoặc trực tiếp với user cũ).

```
┌────────────────────────────────────┐
│  🔗 Nâng cấp tài khoản            │
│  Liên kết tài khoản từ các platform │
│  bạn đã dùng để không mất dữ liệu  │
│                                    │
│  Platform       Trạng thái         │
│  FUN Profile    ✅ Đã liên kết     │
│  FUN Play       [Liên kết ngay]    │
│  Angel AI       [Liên kết ngay]    │
│                                    │
│  [Để sau →]                        │
└────────────────────────────────────┘
```

- Đọc dữ liệu từ bảng `module_users` hiện có
- Nút "Liên kết ngay" → hiện mini-form xác minh (OTP email hoặc Google)
- Sau xác minh → upsert vào `module_users`
- Nút "Để sau" → redirect thẳng về returnTo

---

## Phần 4: Wallet Sign-In

### Logic

Wallet không có email nên cần flow riêng:

1. User click "Tiếp tục với Wallet"
2. App dùng `useWallet.connect()` để lấy address
3. Tạo message: `"Đăng nhập FUN ID: {address} lúc {timestamp}"`
4. Ký message bằng MetaMask → lấy signature
5. Gọi edge function `wallet-auth` để:
   - Verify signature (ethers.verifyMessage)
   - Tìm hoặc tạo user với email = `{address}@wallet.fun`
   - Trả về custom JWT token
6. Set session qua `supabase.auth.setSession()`

### Edge function mới: `supabase/functions/wallet-auth/index.ts`

---

## Các file cần tạo/sửa

| File | Thay đổi |
|------|----------|
| `src/pages/Auth.tsx` | Redesign toàn bộ với 4 phương thức auth |
| `src/pages/auth/SetupIdentity.tsx` | **Mới** — màn chọn username bắt buộc |
| `src/pages/auth/LinkAccounts.tsx` | **Mới** — màn hợp nhất tài khoản |
| `src/components/auth/AuthForm.tsx` | Tách thành các component nhỏ hơn |
| `src/components/auth/OtpForm.tsx` | **Mới** — form nhập email gửi magic link |
| `src/components/auth/WalletAuthButton.tsx` | **Mới** — nút Sign-In với Wallet |
| `src/hooks/useAuth.ts` | Thêm `signInWithOtp()`, `checkUsernameSetup()` |
| `supabase/functions/wallet-auth/index.ts` | **Mới** — verify wallet signature |
| `src/App.tsx` | Thêm routes `/auth/setup-identity`, `/auth/link-accounts` |

---

## Database

Không cần migration mới — dùng lại:
- `profiles` (trường `username`) — detect user mới
- `module_users` — tracking platform link status

---

## Chi tiết kỹ thuật

### OTP Email

```typescript
// useAuth.ts — thêm method mới
const signInWithOtp = async (email: string) => {
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: { emailRedirectTo: `${window.location.origin}/auth/callback` }
  })
  return { error }
}
```

### Wallet Auth Edge Function

```typescript
// Verify signature server-side
import { ethers } from "npm:ethers@6"
const recoveredAddress = ethers.verifyMessage(message, signature)
if (recoveredAddress.toLowerCase() !== address.toLowerCase()) throw new Error("Invalid signature")

// Dùng service role để tạo/tìm user
const { data } = await supabaseAdmin.auth.admin.getUserByEmail(`${address}@wallet.fun`)
```

### Guard component

```typescript
// Sau auth success, check username
export function usePostAuthRedirect() {
  const { user } = useAuth()
  const navigate = useNavigate()
  
  useEffect(() => {
    if (!user) return
    supabase.from('profiles').select('username').eq('id', user.id).single()
      .then(({ data }) => {
        if (!data?.username) navigate('/auth/setup-identity')
      })
  }, [user])
}
```

---

## UX Notes

- Không dùng từ kỹ thuật (migration, mapping, session)
- Ngôn ngữ: "Nâng cấp tài khoản", "Liên kết nhanh", "Để sau"
- Mobile-first: tất cả form fit trong 1 màn hình không cần scroll
- Loading states đầy đủ cho từng bước
