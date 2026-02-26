
# Sửa lỗi build để đăng nhập hoạt động

## Vấn đề

Có 5 lỗi TypeScript trong 2 edge functions đang chặn deploy, khiến hệ thống auth không hoạt động:

### wallet-auth/index.ts (2 lỗi)
1. `getUserByEmail` không tồn tại - cần dùng `listUsers` hoặc tìm user qua query khác
2. `updateUser(userId, ...)` không tồn tại - cần dùng `updateUserById(userId, ...)`

### wallet-operations/index.ts (3 lỗi cũ)
3. `.catch()` không tồn tại trên PostgrestFilterBuilder - dòng 147 là placeholder code
4. `refundAmount > Number(originalTx.amount)` - type mismatch vì `originalTx.amount` trả về `{}` 
5. `Number(wallet?.available || 0) + refundAmount` - cùng type issue

## Giải pháp

### File 1: `supabase/functions/wallet-auth/index.ts`

- Dòng 60: Thay `getUserByEmail(walletEmail)` bằng `listUsers()` rồi filter theo email, hoặc query bảng `auth.users` qua service role
- Dòng 92: Thay `updateUser(userId, ...)` bằng `updateUserById(userId, ...)`
- Cập nhật CORS headers cho đầy đủ (thêm `x-supabase-client-platform` headers)

### File 2: `supabase/functions/wallet-operations/index.ts`

- Dòng 147: Xóa dòng placeholder `await supabase.rpc("", {}).catch(() => {})`
- Dòng 295-296: Cast `originalTx.amount` đúng type: `const refundAmount = amount || Number(originalTx.amount as string)`
- Dòng 310: Cast tương tự: `Number((wallet?.available as string) || '0') + refundAmount`

## Sau khi sửa

Edge functions sẽ deploy thành công, cho phép:
- Đăng nhập Email + Password hoạt động bình thường
- Đăng nhập Wallet hoạt động
- Wallet operations (transfer, refund) hoạt động
