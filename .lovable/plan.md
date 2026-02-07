
# 🔧 Kế Hoạch: Hoàn Thiện Token Lifecycle + Nhập Địa Chỉ Ví Người Nhận

## 📊 Tóm Tắt

Thêm 3 tính năng mới vào Simulator:

1. **Ô nhập địa chỉ ví người nhận** - Cho phép mint tokens về ví bất kỳ
2. **Nút Activate** - Chuyển tokens từ LOCKED → ACTIVATED  
3. **Nút Claim** - Chuyển tokens từ ACTIVATED → FLOWING (sử dụng được trong ví)

---

## 🔄 Token Lifecycle Trong Smart Contract v1.2.1

```text
┌─────────────────────────────────────────────────────────────┐
│                    FUN MONEY LIFECYCLE                       │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│   lockWithPPLP()         activate(amount)      claim(amount) │
│        ↓                      ↓                     ↓        │
│   ┌─────────┐            ┌───────────┐         ┌─────────┐  │
│   │ LOCKED  │ ─────────> │ ACTIVATED │ ──────> │ FLOWING │  │
│   │ (escrow)│            │(claimable)│         │(in wallet)│ │
│   └─────────┘            └───────────┘         └─────────┘  │
│                                                              │
│   Xem: alloc(user)       Xem: alloc(user)     Xem: balanceOf │
│        .locked                .activated           (user)   │
└─────────────────────────────────────────────────────────────┘
```

---

## 📁 Danh Sách File Cần Thay Đổi

| File | Thay đổi |
|------|----------|
| `src/components/simulator/RecipientInput.tsx` | **TẠO MỚI** - Ô nhập địa chỉ ví người nhận |
| `src/components/simulator/TokenLifecyclePanel.tsx` | **TẠO MỚI** - Panel hiển thị lifecycle + nút Activate/Claim |
| `src/lib/web3.ts` | Thêm `getAllocation`, `activateTokens`, `claimTokens` |
| `src/components/simulator/MintButton.tsx` | Thêm props `recipient` để mint về ví khác |
| `src/components/simulator/MintPreview.tsx` | Tích hợp RecipientInput + TokenLifecyclePanel |

---

## ✅ Chi Tiết Kỹ Thuật

### Thay Đổi 1: Thêm Helper Functions vào `src/lib/web3.ts`

```typescript
// Lấy allocation (locked + activated) của user
export async function getAllocation(provider: BrowserProvider, address: string): Promise<{
  locked: bigint;
  activated: bigint;
}> {
  const contract = getFunMoneyContract(provider);
  const result = await contract.alloc(address);
  return { 
    locked: result[0] || result.locked, 
    activated: result[1] || result.activated 
  };
}

// Gọi hàm activate(amount) - chuyển LOCKED → ACTIVATED
export async function activateTokens(provider: BrowserProvider, amount: bigint): Promise<string> {
  const contract = await getFunMoneyContractWithSigner(provider);
  const tx = await contract.activate(amount);
  const receipt = await tx.wait();
  return receipt.hash;
}

// Gọi hàm claim(amount) - chuyển ACTIVATED → FLOWING  
export async function claimTokens(provider: BrowserProvider, amount: bigint): Promise<string> {
  const contract = await getFunMoneyContractWithSigner(provider);
  const tx = await contract.claim(amount);
  const receipt = await tx.wait();
  return receipt.hash;
}
```

### Thay Đổi 2: Tạo Component `RecipientInput.tsx`

Component cho phép:
- Nhập địa chỉ ví người nhận (mặc định = ví đang kết nối)
- Nút "Use My Wallet" để reset về ví của mình
- Validate địa chỉ Ethereum hợp lệ
- Hiển thị trạng thái valid/invalid

```typescript
interface RecipientInputProps {
  recipient: string;
  onRecipientChange: (address: string) => void;
  connectedAddress: string | null;
}
```

### Thay Đổi 3: Tạo Component `TokenLifecyclePanel.tsx`

Panel hiển thị trạng thái token lifecycle của ví đang kết nối:

- **LOCKED**: Số dư từ `alloc(address).locked` - tokens mới mint, chưa activate
- **ACTIVATED**: Số dư từ `alloc(address).activated` - sẵn sàng claim
- **FLOWING**: Số dư từ `balanceOf(address)` - sử dụng tự do trong ví

Các nút hành động:
- **Activate All** - Gọi `contract.activate(lockedAmount)`
- **Claim All** - Gọi `contract.claim(activatedAmount)`

Tự động refresh sau mỗi giao dịch thành công.

### Thay Đổi 4: Cập nhật `MintButton.tsx`

Thêm props `recipient` để mint về ví bất kỳ:

```typescript
interface MintButtonProps {
  result: ScoringResult | null;
  actionType: string | null;
  disabled?: boolean;
  recipient?: string;  // ← THÊM MỚI
}
```

Logic cập nhật:
- Sử dụng `recipient` (nếu có) thay vì `address` (ví kết nối) làm `user`
- Nonce lấy từ `recipient` (vì contract check nonce của user)
- Signature vẫn do ví kết nối (Attester) ký

### Thay Đổi 5: Cập nhật `MintPreview.tsx`

Tích hợp các component mới:
- State `recipient` để lưu địa chỉ ví người nhận
- Thêm `<RecipientInput>` trước nút Mint
- Thêm `<TokenLifecyclePanel>` sau nút Mint
- Pass `recipient` vào `<MintButton>`

---

## 🎨 Giao Diện Mới

```text
┌───────────────────────────────────────────────────────────────┐
│                      MINT PREVIEW                              │
├───────────────────────────────────────────────────────────────┤
│                                                                │
│                    205.81 FUN                                  │
│                 FUN Money to mint                              │
│                                                                │
├───────────────────────────────────────────────────────────────┤
│  📍 Recipient Address                                          │
│  ┌─────────────────────────────────────────────────────────┐  │
│  │ 0xe32d50a0badE4cbD5B0d6120d3A5FD07f63694f1           📋 │  │
│  └─────────────────────────────────────────────────────────┘  │
│  [👛 Use My Wallet]                                            │
├───────────────────────────────────────────────────────────────┤
│                                                                │
│  [🪙 MINT FUN MONEY ✨]                                        │
│                                                                │
├───────────────────────────────────────────────────────────────┤
│  📊 MY TOKEN LIFECYCLE                      [🔄 Refresh]       │
│  ┌─────────────────────────────────────────────────────────┐  │
│  │ 🔒 LOCKED:      205.81 FUN    [🔓 ACTIVATE ALL]        │  │
│  │ ✅ ACTIVATED:     0.00 FUN    [💰 CLAIM ALL]           │  │
│  │ 💫 FLOWING:       0.00 FUN    (in wallet)              │  │
│  └─────────────────────────────────────────────────────────┘  │
│                                                                │
└───────────────────────────────────────────────────────────────┘
```

---

## 🔄 Luồng Hoạt Động

### A) Mint về ví khác

```text
1. User nhập địa chỉ ví recipient: 0xABC...
         ↓
2. Click "MINT FUN MONEY"
         ↓
3. Lấy nonce từ nonces[0xABC...] (recipient)
         ↓
4. Ký EIP-712 với user = 0xABC... (bằng ví Attester đang kết nối)
         ↓
5. Gọi lockWithPPLP(0xABC..., action, amount, evidenceHash, [sig])
         ↓
6. Tokens được mint vào alloc[0xABC...].locked
```

### B) Activate + Claim (chỉ ví đang kết nối)

```text
1. User xem TokenLifecyclePanel:
   - LOCKED: 205.81 FUN
   - ACTIVATED: 0 FUN
   - FLOWING: 0 FUN
         ↓
2. Click "ACTIVATE ALL"
   → MetaMask popup → Gọi contract.activate(205.81 * 10^18)
         ↓
3. Kết quả:
   - LOCKED: 0 FUN
   - ACTIVATED: 205.81 FUN ✅
         ↓
4. Click "CLAIM ALL"
   → MetaMask popup → Gọi contract.claim(205.81 * 10^18)
         ↓
5. Kết quả:
   - ACTIVATED: 0 FUN
   - FLOWING: 205.81 FUN ✅ (có thể transfer!)
```

---

## ⚠️ Lưu Ý Quan Trọng

1. **Activate và Claim chỉ hoạt động cho ví đang kết nối** - Contract yêu cầu `msg.sender` phải là chủ sở hữu allocation

2. **Mint có thể mint cho ví bất kỳ** - Miễn là người ký (Attester) hợp lệ

3. **Nonce lấy của recipient** - Khi mint cho ví khác, phải lấy nonce từ ví đó để tránh replay attack

4. **Signature do ví kết nối (Attester) ký** - Đây là chữ ký xác nhận action từ Attester

---

## ✅ Tiêu Chí Hoàn Thành

1. ✅ Có ô nhập địa chỉ ví người nhận trước nút Mint
2. ✅ Có nút "Use My Wallet" để reset về ví đang kết nối
3. ✅ Validate địa chỉ Ethereum hợp lệ trước khi cho phép mint
4. ✅ Mint thành công về ví được chỉ định (bao gồm ví khác)
5. ✅ Panel hiển thị số dư LOCKED / ACTIVATED / FLOWING
6. ✅ Nút Activate hoạt động - chuyển LOCKED → ACTIVATED
7. ✅ Nút Claim hoạt động - chuyển ACTIVATED → FLOWING
8. ✅ Hiển thị transaction link trên BSCScan sau mỗi action
9. ✅ Auto-refresh số dư sau mỗi giao dịch thành công
