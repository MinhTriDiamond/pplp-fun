

# Bỏ nút Đăng nhập (UserMenu) khỏi tất cả các trang

## Vấn đề
`UserMenu` (nút "Đăng nhập" / avatar user) vẫn còn hiển thị ở 3 trang:
- `/` (Index.tsx)
- `/simulator` (Simulator.tsx)
- `/mint-requests` (MintRequests.tsx)

## Thay đổi

### 1. `src/pages/Index.tsx`
- Xoá import `UserMenu`
- Xoá `<UserMenu />` khỏi navbar (dòng 37), chỉ giữ lại `<MintFunButton />`

### 2. `src/pages/Simulator.tsx`
- Xoá import `UserMenu`
- Xoá `<UserMenu />` khỏi header (dòng 78), giữ lại text + WalletConnect

### 3. `src/pages/MintRequests.tsx`
- Xoá import `UserMenu`
- Xoá `<UserMenu />` khỏi header (dòng 182), giữ lại WalletConnect

## Kết quả
Không còn nút "Đăng nhập" hay dropdown user ở bất kỳ trang nào trong app.

