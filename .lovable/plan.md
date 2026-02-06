

# Kế Hoạch: Tích Hợp Mint FUN Money Trực Tiếp Trên Dự Án

## Mục Tiêu
Cho phép người dùng mint FUN Money thật sự trên blockchain BSC Testnet ngay từ trang Simulator của dự án.

---

## 1. Tổng Quan Kiến Trúc Mint Flow

```text
┌─────────────────────────────────────────────────────────────────────────────┐
│                        MINT FUN MONEY FLOW                                  │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐  │
│  │ 1. CONNECT  │───▶│ 2. CALCULATE│───▶│ 3. SIGN     │───▶│ 4. MINT     │  │
│  │ WALLET      │    │ (Simulator) │    │ (Edge Func) │    │ (On-chain)  │  │
│  └─────────────┘    └─────────────┘    └─────────────┘    └─────────────┘  │
│        │                  │                  │                  │          │
│        ▼                  ▼                  ▼                  ▼          │
│  MetaMask          PPLP Engine         Attester Key       Smart Contract   │
│  BSC Testnet       Light Score         EIP-712 Sign       lockWithPPLP     │
│                    Multipliers         Private Key        0x1aa8...ff2     │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Các Thành Phần Cần Tạo

### 2.1. Frontend Components

| File | Mô Tả |
|------|-------|
| `src/hooks/useWallet.ts` | Hook kết nối MetaMask, quản lý account |
| `src/lib/web3.ts` | Cấu hình ethers.js, contract ABI |
| `src/lib/eip712.ts` | Tạo EIP-712 typed data |
| `src/components/wallet/WalletConnect.tsx` | Button kết nối ví |
| `src/components/simulator/MintButton.tsx` | Button mint thật trên Simulator |

### 2.2. Edge Function (Backend)

| File | Mô Tả |
|------|-------|
| `supabase/functions/pplp-sign/index.ts` | Ký signature EIP-712 bằng Attester key |
| `supabase/config.toml` | Cấu hình edge function |

### 2.3. File Cần Sửa

| File | Thay Đổi |
|------|----------|
| `src/pages/Simulator.tsx` | Thêm MintButton, wallet state |
| `src/components/simulator/MintPreview.tsx` | Thêm real mint flow |
| `package.json` | Thêm dependency `ethers` |

---

## 3. Chi Tiết Kỹ Thuật

### 3.1. EIP-712 Domain (Cố định theo Contract)

```javascript
const EIP712_DOMAIN = {
  name: "FUN Money",
  version: "1.3.0",
  chainId: 97,
  verifyingContract: "0x1aa8DE8B1E4465C6d729E8564893f8EF823a5ff2"
};

const PPLP_TYPES = {
  PPLP: [
    { name: "recipient", type: "address" },
    { name: "amount", type: "uint256" },
    { name: "actionHash", type: "bytes32" },
    { name: "nonce", type: "uint256" },
    { name: "deadline", type: "uint256" }
  ]
};
```

### 3.2. Edge Function - PPLP Sign

```typescript
// supabase/functions/pplp-sign/index.ts
// 1. Nhận request từ frontend (recipient, amount, actionType)
// 2. Tính actionHash = keccak256(actionType)
// 3. Lấy nonce từ contract
// 4. Set deadline = now + 1 hour
// 5. Ký EIP-712 bằng ATTESTER_PRIVATE_KEY
// 6. Trả về signature
```

### 3.3. Mint Button Flow

```text
User click "Mint" 
    │
    ▼
Check wallet connected?
    │
    ├── No ──▶ Prompt connect MetaMask
    │
    └── Yes
         │
         ▼
    Call Edge Function /pplp-sign
         │
         ▼
    Receive { signature, nonce, deadline }
         │
         ▼
    Call contract.lockWithPPLP(
      recipient,
      amount,
      actionHash,
      nonce,
      deadline,
      signature
    )
         │
         ▼
    Wait for transaction confirmation
         │
         ▼
    Show success + TX hash
```

---

## 4. Secret Cần Thêm

| Secret Name | Mô Tả |
|-------------|-------|
| `ATTESTER_PRIVATE_KEY` | Private key của Angel AI Attester (0x02D5...) |

Đây là key quan trọng dùng để ký các mint request. Con cần thêm key này vào Supabase secrets.

---

## 5. Smart Contract Functions Cần Gọi

### Read Functions
- `nonces(address user)` - Lấy nonce hiện tại
- `balanceOf(address user)` - Kiểm tra balance

### Write Functions  
- `lockWithPPLP(address recipient, uint256 amount, bytes32 actionHash, uint256 nonce, uint256 deadline, bytes signature)` - Mint FUN

---

## 6. Contract ABI (Minimal)

```javascript
const FUN_MONEY_ABI = [
  "function nonces(address) view returns (uint256)",
  "function balanceOf(address) view returns (uint256)",
  "function lockWithPPLP(address recipient, uint256 amount, bytes32 actionHash, uint256 nonce, uint256 deadline, bytes signature) external",
  "event Transfer(address indexed from, address indexed to, uint256 value)"
];
```

---

## 7. Dependency Cần Thêm

```bash
# Frontend
npm install ethers
```

---

## 8. Cấu Trúc File Mới

```text
src/
├── hooks/
│   └── useWallet.ts          # Wallet connection hook
├── lib/
│   ├── web3.ts               # Ethers config, contract
│   └── eip712.ts             # EIP-712 helpers
├── components/
│   ├── wallet/
│   │   └── WalletConnect.tsx # Connect wallet UI
│   └── simulator/
│       └── MintButton.tsx    # Real mint button
supabase/
├── config.toml               # Edge function config
└── functions/
    └── pplp-sign/
        └── index.ts          # Attester signing endpoint
```

---

## 9. Flow Test Mint

**Bước 1: Chuẩn bị**
- Cài MetaMask
- Thêm BSC Testnet (Chain ID 97)
- Lấy tBNB từ faucet

**Bước 2: Kết nối ví**
- Click "Connect Wallet" trên Simulator
- Approve MetaMask

**Bước 3: Thiết lập Simulator**
- Chọn Platform (VD: FUN_ACADEMY)
- Chọn Action (VD: course_complete)
- Điều chỉnh 5 Trụ Cột

**Bước 4: Mint**
- Click "MINT FUN MONEY"
- Backend ký signature
- MetaMask popup để confirm transaction
- Đợi confirmation

**Bước 5: Kiểm tra**
- Xem TX trên BSCScan
- Kiểm tra FUN balance trong ví

---

## 10. Lưu Ý Bảo Mật

- Private key Attester được lưu trong Supabase Secrets (không lộ ra frontend)
- Edge function verify request trước khi ký
- Rate limiting để chống spam
- Deadline ngắn (1 giờ) để tránh replay attack

---

## 11. Kết Quả Mong Đợi

Sau khi implement:
- ✅ Button "Connect Wallet" trên Simulator
- ✅ Hiển thị địa chỉ ví đã kết nối
- ✅ Button "MINT FUN MONEY" trong MintPreview
- ✅ Edge function ký signature an toàn
- ✅ Gọi contract `lockWithPPLP` thành công
- ✅ Hiển thị TX hash và link BSCScan
- ✅ Cập nhật balance sau khi mint

