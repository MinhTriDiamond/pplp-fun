
# Kế Hoạch Sửa Lỗi Mint FUN Money

## Mục Tiêu
Sửa lỗi "execution reverted" khi gọi hàm `lockWithPPLP` do không khớp ABI giữa frontend và smart contract.

---

## Nguyên Nhân Gốc

Smart Contract FUN Money v1.3.0 sử dụng **multi-sig attestation** với tham số `signatures` là **mảng (`bytes[]`)**, nhưng frontend đang:
1. Khai báo ABI sai (`bytes` thay vì `bytes[]`)
2. Truyền 1 chữ ký đơn lẻ thay vì mảng

---

## Các File Cần Sửa

### 1. `src/lib/web3.ts` (dòng 18)

**Trước:**
```typescript
'function lockWithPPLP(address recipient, uint256 amount, bytes32 actionHash, uint256 nonce, uint256 deadline, bytes signature) external'
```

**Sau:**
```typescript
'function lockWithPPLP(address recipient, uint256 amount, bytes32 actionHash, uint256 nonce, uint256 deadline, bytes[] signatures) external'
```

---

### 2. `src/components/simulator/MintButton.tsx` (dòng 99-106)

**Trước:**
```typescript
const tx = await contract.lockWithPPLP(
  address,
  amount,
  actionHash,
  nonce,
  deadline,
  signature
);
```

**Sau:**
```typescript
const tx = await contract.lockWithPPLP(
  address,
  amount,
  actionHash,
  nonce,
  deadline,
  [signature] // Bọc vào mảng để khớp bytes[]
);
```

---

## Yêu Cầu Bổ Sung

Để mint thành công, cần đảm bảo:

| Điều kiện | Cách kiểm tra |
|-----------|---------------|
| Ví là Attester hợp lệ | Gọi `isAttester(address)` trên BSCScan |
| Threshold phù hợp | Gọi `threshold()` - nếu = 1 thì 1 chữ ký đủ |
| Action được đăng ký | Gọi `getActionInfo(actionHash)` |
| Contract không paused | Gọi `paused()` → false |
| Epoch cap chưa đạt | Gọi `epochMinted()` < `epochCap()` |

---

## Tổng Kết Thay Đổi

```text
┌───────────────────────────────────────────────────────────┐
│                    SỬA ABI MISMATCH                       │
├───────────────────────────────────────────────────────────┤
│                                                           │
│  src/lib/web3.ts                                          │
│  ├── Dòng 18: bytes signature → bytes[] signatures       │
│                                                           │
│  src/components/simulator/MintButton.tsx                  │
│  ├── Dòng 106: signature → [signature]                   │
│                                                           │
└───────────────────────────────────────────────────────────┘
```

---

## Kết Quả Mong Đợi

Sau khi sửa:
- ABI khớp với smart contract
- Giao dịch `lockWithPPLP` được gửi đúng format
- Nếu ví là Attester và threshold = 1 → Mint thành công
- Hiển thị TX hash và link BSCScan
