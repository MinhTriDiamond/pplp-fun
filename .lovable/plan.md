
# 🔧 Kế Hoạch: Sửa EIP-712 TypeHash & ABI Để Khớp Với Smart Contract v1.2.1

## 📊 Tóm Tắt Vấn Đề

Từ ảnh Remix và source code contract con gửi, Cha xác nhận có **3 lỗi nghiêm trọng** khiến mint thất bại:

### Lỗi 1: Sai Cấu Trúc EIP-712 TypeHash

| Thuộc tính | Contract yêu cầu | Code hiện tại |
|-----------|------------------|---------------|
| **Tên type** | `PureLoveProof` | `PPLP` ❌ |
| **Field 1** | `user` | `recipient` ❌ |
| **Field 2** | `actionHash` (bytes32) | `amount` ❌ |
| **Field 3** | `amount` | `actionHash` ❌ |
| **Field 4** | `evidenceHash` (bytes32) | THIẾU ❌ |
| **Field 5** | `nonce` | `nonce` ✅ |
| **Field thừa** | - | `deadline` ❌ |

**Contract TypeHash:**
```
PureLoveProof(address user, bytes32 actionHash, uint256 amount, bytes32 evidenceHash, uint256 nonce)
```

**Code hiện tại (SAI):**
```
PPLP(address recipient, uint256 amount, bytes32 actionHash, uint256 nonce, uint256 deadline)
```

### Lỗi 2: Sai Tham Số Hàm `lockWithPPLP`

| Tham số | Contract yêu cầu | Code hiện tại |
|---------|------------------|---------------|
| 1 | `address user` | `address` ✅ |
| 2 | `string action` (tên action!) | `amount` ❌ |
| 3 | `uint256 amount` | `actionHash` ❌ |
| 4 | `bytes32 evidenceHash` | THIẾU ❌ |
| 5 | `bytes[] sigs` | có nhưng vị trí sai |
| Thừa | - | `nonce`, `deadline` ❌ |

**Contract yêu cầu:**
```solidity
lockWithPPLP(address user, string action, uint256 amount, bytes32 evidenceHash, bytes[] sigs)
```

**Code gọi hiện tại (SAI):**
```typescript
lockWithPPLP(address, amount, actionHash, nonce, deadline, [signature])
```

### Lỗi 3: ABI Khai Báo Sai

Trong `web3.ts` line 51:
```typescript
// SAI:
'function lockWithPPLP(address recipient, uint256 amount, bytes32 actionHash, uint256 nonce, uint256 deadline, bytes[] signatures) external'
```

---

## ✅ Giải Pháp Chi Tiết

### Thay Đổi 1: Sửa `src/lib/eip712.ts`

**Cập nhật PPLP_TYPES theo đúng contract:**
```typescript
export const PPLP_TYPES: Record<string, TypedDataField[]> = {
  PureLoveProof: [  // Đổi từ "PPLP" thành "PureLoveProof"
    { name: "user", type: "address" },        // Đổi từ "recipient"
    { name: "actionHash", type: "bytes32" },  // Đổi vị trí lên thứ 2
    { name: "amount", type: "uint256" },      // Đổi vị trí xuống thứ 3
    { name: "evidenceHash", type: "bytes32" },// THÊM MỚI
    { name: "nonce", type: "uint256" },       // Giữ nguyên
    // BỎ deadline - contract không dùng
  ],
};
```

**Cập nhật interface PPLPData:**
```typescript
export interface PPLPData {
  user: string;           // Đổi từ "recipient"
  actionHash: string;     
  amount: bigint;
  evidenceHash: string;   // THÊM MỚI
  nonce: bigint;
  // BỎ deadline
}
```

**Cập nhật hàm createPPLPTypedData:**
```typescript
export function createPPLPTypedData(data: PPLPData) {
  return {
    domain: getEip712Domain(),
    types: PPLP_TYPES,
    primaryType: "PureLoveProof" as const,  // Đổi từ "PPLP"
    message: {
      user: data.user,                       // Đổi từ recipient
      actionHash: data.actionHash,
      amount: data.amount.toString(),
      evidenceHash: data.evidenceHash,       // THÊM MỚI
      nonce: data.nonce.toString(),
      // BỎ deadline
    },
  };
}
```

**Xóa hàm getDeadline()** - không cần nữa vì contract không dùng deadline.

### Thay Đổi 2: Sửa `src/lib/web3.ts`

**Cập nhật ABI đúng:**
```typescript
// Write functions
'function lockWithPPLP(address user, string action, uint256 amount, bytes32 evidenceHash, bytes[] sigs) external',
```

**Thêm helper tạo evidenceHash:**
```typescript
export function createEvidenceHash(data: {
  actionType: string;
  timestamp: number;
  pillars?: Record<string, number>;
}): string {
  const json = JSON.stringify(data);
  return keccak256(toUtf8Bytes(json));
}
```

### Thay Đổi 3: Sửa `src/components/simulator/MintButton.tsx`

**Cập nhật logic mint với đúng tham số:**

```typescript
// 1. Tạo evidenceHash từ action data
const evidenceHash = createEvidenceHash({
  actionType,
  timestamp: Math.floor(Date.now() / 1000),
  pillars: { S: 80, T: 75, H: 70, C: 85, U: 90 } // Example data
});

// 2. Chuẩn bị PPLP data (ĐÚNG theo contract)
const pplpData: PPLPData = {
  user: address,        // Không phải "recipient"
  actionHash,
  amount: BigInt(amount),
  evidenceHash,         // THÊM MỚI
  nonce,
  // KHÔNG có deadline
};

// 3. Ký EIP-712 message
const signature = await signPPLP(signer, pplpData);

// 4. Gọi lockWithPPLP với ĐÚNG tham số:
// lockWithPPLP(user, action STRING, amount, evidenceHash, sigs)
const tx = await signerContract.lockWithPPLP(
  address,           // user
  actionType,        // action STRING (không phải hash!)
  amount,            // amount
  evidenceHash,      // evidenceHash
  [signature]        // sigs array
);
```

### Thay Đổi 4: Cập nhật `src/lib/debug-bundle.ts`

**Thêm evidenceHash vào debug info:**
```typescript
pplp: {
  user: string;        // Đổi từ recipient
  amount: string;
  amountFormatted: string;
  evidenceHash: string;  // THÊM MỚI
  nonce: string;
  // BỎ deadline, deadlineFormatted
}
```

### Thay Đổi 5: Cập nhật `src/components/simulator/DebugPanel.tsx`

Thêm hiển thị `evidenceHash` trong debug panel và bỏ deadline.

---

## 📁 Danh Sách File Cần Chỉnh Sửa

| File | Thay đổi |
|------|----------|
| `src/lib/eip712.ts` | Sửa PPLP_TYPES, PPLPData, createPPLPTypedData, xóa getDeadline |
| `src/lib/web3.ts` | Sửa ABI lockWithPPLP, thêm createEvidenceHash |
| `src/components/simulator/MintButton.tsx` | Sửa logic gọi lockWithPPLP với đúng params |
| `src/lib/debug-bundle.ts` | Thêm evidenceHash, đổi recipient→user, bỏ deadline |
| `src/components/simulator/DebugPanel.tsx` | Cập nhật hiển thị (evidenceHash, bỏ deadline) |

---

## 🔄 Luồng Mint Đúng (Sau Khi Sửa)

```text
1. User chọn Action (VD: "DONATE")
         ↓
2. Tạo actionHash = keccak256("DONATE") 
   (dùng để ký, KHÔNG truyền vào hàm)
         ↓
3. Tạo evidenceHash = keccak256({actionType, timestamp, pillars...})
         ↓
4. Lấy nonce từ contract: nonces[user]
         ↓
5. Ký EIP-712 với cấu trúc ĐÚNG:
   PureLoveProof(user, actionHash, amount, evidenceHash, nonce)
         ↓
6. Gọi contract:
   lockWithPPLP(user, "DONATE", amount, evidenceHash, [sig])
         ↓
7. Contract:
   - Tạo h = keccak256("DONATE") nội bộ
   - Verify signature với PureLoveProof
   - Mint tokens nếu hợp lệ!
```

---

## ⚠️ Lưu Ý Kỹ Thuật Quan Trọng

1. **`action` truyền vào hàm là STRING** (VD: "DONATE"), contract sẽ tự hash bên trong
2. **`actionHash` trong EIP-712 signature** là `keccak256("DONATE")` - phải khớp với hash nội bộ của contract
3. **`nonce`** không truyền vào hàm, contract tự lấy từ `nonces[user]`, nhưng PHẢI có trong signature
4. **`evidenceHash`** là bằng chứng của action - có thể hash từ metadata bất kỳ
5. **Thứ tự fields trong EIP-712 RẤT QUAN TRỌNG** - phải khớp 100% với PPLP_TYPEHASH

---

## ✅ Tiêu Chí Hoàn Thành

1. EIP-712 TypeHash khớp chính xác: `PureLoveProof(address user, bytes32 actionHash, uint256 amount, bytes32 evidenceHash, uint256 nonce)`
2. ABI đúng: `lockWithPPLP(address user, string action, uint256 amount, bytes32 evidenceHash, bytes[] sigs)`
3. Gọi hàm với đúng 5 tham số (action là string, không phải hash)
4. Signature off-chain verify thành công
5. Transaction on-chain không còn revert!
