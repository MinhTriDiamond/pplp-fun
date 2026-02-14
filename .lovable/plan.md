

# Them tab Claim vao trang Simulator

## Mo ta

Them tab thu 4 "Claim" vao he thong tab cua trang `/simulator`. Tab nay cho phep nguoi dung ket noi vi va thuc hien Activate / Claim FUN token truc tiep, khong can dang nhap FUN ID.

## Chi tiet ky thuat

### 1. Sua `src/pages/Simulator.tsx`

- Import icon `Gift` tu lucide-react
- Them tab thu 4 vao `TabsList`: doi `grid-cols-3` thanh `grid-cols-4`
- Them `TabsTrigger value="claim"` voi icon Gift va text "Claim"
- Them `TabsContent value="claim"` hien thi component `ClaimTab`

### 2. Tao `src/components/simulator/ClaimTab.tsx`

Component moi, bao gom:
- Phan huong dan ngan: giai thich 3 buoc LOCKED -> ACTIVATED -> FLOWING
- Nut `WalletConnect` cho nguoi chua ket noi vi
- Hien thi `TokenLifecyclePanel` (da co san) de thuc hien Activate va Claim
- Thong bao khi chua ket noi vi: huong dan ket noi MetaMask va chon dung mang BSC Testnet

### 3. Sua `src/components/simulator/TokenLifecyclePanel.tsx`

- Thay `return null` khi chua ket noi thanh hien thi Card voi thong bao "Vui long ket noi vi de xem so du token"
- Nhu vay ClaimTab luon co noi dung hien thi

## Cac file can tao/sua

| File | Thay doi |
|------|----------|
| `src/components/simulator/ClaimTab.tsx` | **Moi** - Giao dien tab Claim voi huong dan + TokenLifecyclePanel |
| `src/pages/Simulator.tsx` | Them tab Claim (grid-cols-4, TabsTrigger, TabsContent) |
| `src/components/simulator/TokenLifecyclePanel.tsx` | Hien thi thong bao thay vi return null khi chua ket noi |

