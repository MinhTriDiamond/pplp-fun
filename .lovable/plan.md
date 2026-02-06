
# Kế Hoạch: Thêm Pre-Mint Validation

## Mục Tiêu
Thêm kiểm tra điều kiện trước khi mint để hiển thị rõ nguyên nhân lỗi thay vì chỉ báo "execution reverted".

---

## 1. Các Điều Kiện Cần Kiểm Tra

```text
┌─────────────────────────────────────────────────────────────────────────────┐
│                     PRE-MINT VALIDATION CHECKLIST                           │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ✓ Contract paused?           →  paused() = false                           │
│  ✓ Ví là Attester?            →  isAttester(address) = true                 │
│  ✓ Threshold hợp lệ?          →  threshold() = 1 (hoặc đủ signatures)       │
│  ✓ Action đã đăng ký?         →  getActionInfo(actionHash).exists = true    │
│  ✓ Epoch cap còn dư?          →  epochMinted() < epochCap()                 │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Cập Nhật ABI

Thêm các hàm kiểm tra vào `src/lib/web3.ts`:

```typescript
// Thêm vào FUN_MONEY_ABI
'function isAttester(address) view returns (bool)',
'function threshold() view returns (uint256)',
'function epochMinted() view returns (uint256)', 
'function epochCap() view returns (uint256)',
'function getActionInfo(bytes32 actionHash) view returns (tuple(bool exists, uint256 version))'
```

---

## 3. Tạo Pre-Mint Checker

Tạo file `src/lib/mint-validator.ts`:

```typescript
interface MintValidation {
  canMint: boolean;
  issues: string[];
  details: {
    isPaused: boolean;
    isAttester: boolean;
    threshold: number;
    actionExists: boolean;
    epochRemaining: bigint;
  }
}

async function validateBeforeMint(
  provider: BrowserProvider,
  address: string,
  actionHash: string
): Promise<MintValidation>
```

---

## 4. Cập Nhật MintButton

Thêm validation trước khi ký:

```typescript
// Trước khi sign
const validation = await validateBeforeMint(provider, address, actionHash);

if (!validation.canMint) {
  setErrorMessage(validation.issues.join('\n'));
  setStatus('error');
  return;
}
```

---

## 5. UI Hiển Thị

Thêm panel hiển thị trạng thái các điều kiện:

```text
┌─────────────────────────────────────┐
│ Pre-Mint Validation                 │
├─────────────────────────────────────┤
│ ✅ Contract Active                  │
│ ✅ Attester Verified                │
│ ✅ Threshold: 1                     │
│ ❌ Action Not Registered            │
│ ✅ Epoch Cap: 4.5M / 5M FUN         │
└─────────────────────────────────────┘
```

---

## 6. File Changes Summary

| File | Thay Đổi |
|------|----------|
| `src/lib/web3.ts` | Thêm ABI cho validation functions |
| `src/lib/mint-validator.ts` | Tạo mới - validation logic |
| `src/components/simulator/MintButton.tsx` | Thêm pre-validation |
| `src/components/simulator/MintValidationPanel.tsx` | Tạo mới - UI hiển thị |

---

## 7. Kết Quả Mong Đợi

Sau khi implement:
- Hiển thị rõ ràng điều kiện nào không đạt
- Không còn lỗi "execution reverted" mơ hồ
- Hướng dẫn cụ thể cách khắc phục từng điều kiện
- Người dùng biết cần đăng ký action trước khi mint
