

# Gỡ bỏ toàn bộ Auth Guard -- Truy cập tự do

## Mục tiêu

Bỏ hết yêu cầu đăng nhập. Mọi trang đều truy cập được trực tiếp mà không cần xác thực.

## Thay đổi

### 1. `src/App.tsx`
- Xoá import `RequireAuth`
- Xoá import các trang auth không cần: `Auth`, `AuthCallback`, `SetupIdentity`, `LinkAccounts`, `ResetPassword`
- Gỡ `<RequireAuth>` wrapper khỏi 6 route (simulator, mint-requests, settings, wallet, treasury, angel, admin/events) -- render component trực tiếp
- Xoá 5 route auth: `/auth`, `/auth/callback`, `/auth/setup-identity`, `/auth/link-accounts`, `/auth/reset-password`

### 2. `src/components/layout/FunNavbar.tsx`
- Xoá phần hiển thị nút "Đăng nhập" và dropdown menu user (avatar, đăng xuất)
- Giữ lại logo + ModuleSwitcher, bỏ phần auth ở bên phải hoặc đơn giản hoá thành các link trực tiếp (Settings, Wallet) không cần kiểm tra đăng nhập

### 3. Giữ nguyên các file auth (không xoá)
- Các file như `useAuth.ts`, `RequireAuth.tsx`, `AuthForm.tsx`, v.v. sẽ được giữ nguyên trong codebase để không phá vỡ import ở những nơi khác có thể tham chiếu đến `useAuth` (ví dụ: AngelAI, Settings). Chỉ gỡ bỏ **việc chặn truy cập** (guard), không xoá code auth.

## Kết quả

- Tất cả trang đều mở được ngay khi truy cập domain
- Không còn redirect về `/auth`
- Navbar đơn giản, không yêu cầu đăng nhập

