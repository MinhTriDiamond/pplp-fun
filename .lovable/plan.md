
# 📦 FUN Money SDK Integration Guide - Kế Hoạch Chi Tiết

## 🎯 Mục Tiêu

Tạo bộ tài liệu SDK hoàn chỉnh giúp các platform Lovable (FUN Profile, ANGEL AI, v.v.) có thể:

1. Hiểu kiến trúc và luồng mint FUN Money
2. Copy-paste code trực tiếp vào dự án Lovable
3. Implement Admin Dashboard để duyệt mint requests
4. Xử lý lỗi và debug hiệu quả
5. Tuân thủ bảo mật và best practices

---

## 📁 Cấu Trúc File SDK Sẽ Tạo

```text
docs/
├── FUN-Money-SDK-v1.0/
│   ├── 00-QUICK-START.md           # Hướng dẫn nhanh 5 phút
│   ├── 01-ARCHITECTURE.md          # Kiến trúc & luồng hoạt động
│   ├── 02-DATABASE-SCHEMA.md       # Schema mint_requests table
│   ├── 03-PPLP-SCORING-ENGINE.md   # Công thức tính điểm & amount
│   ├── 04-CONTRACT-INTEGRATION.md  # EIP-712, ABI, Contract calls
│   ├── 05-ADMIN-DASHBOARD.md       # UI/UX Admin approve workflow
│   ├── 06-USER-TOKEN-LIFECYCLE.md  # Activate & Claim flow
│   ├── 07-ERROR-HANDLING.md        # Debug & troubleshooting
│   ├── 08-SECURITY-CHECKLIST.md    # Bảo mật & best practices
│   └── code/                       # Copy-paste ready code
│       ├── lib/
│       │   ├── web3-config.ts
│       │   ├── eip712-signer.ts
│       │   ├── pplp-engine.ts
│       │   └── contract-helpers.ts
│       ├── hooks/
│       │   ├── useWallet.ts
│       │   └── useMintRequest.ts
│       ├── components/
│       │   ├── MintRequestForm.tsx
│       │   └── AdminApprovalPanel.tsx
│       └── database/
│           └── mint-requests-migration.sql
```

---

## 📋 Nội Dung Chi Tiết Từng File

### 00-QUICK-START.md (5 phút bắt đầu)

```markdown
# Quick Start - Tích Hợp FUN Money trong 5 Phút

## Bước 1: Copy thư viện cốt lõi
Copy 4 file từ `code/lib/` vào `src/lib/` của dự án

## Bước 2: Tạo bảng mint_requests
Chạy migration SQL trong Supabase

## Bước 3: Thêm form submit action
Copy component `MintRequestForm.tsx`

## Bước 4: Thêm admin panel
Copy component `AdminApprovalPanel.tsx`

## Bước 5: Test!
User submit → Admin approve → FUN minted
```

---

### 01-ARCHITECTURE.md (Kiến trúc chi tiết)

```text
┌──────────────────────────────────────────────────────────────────────┐
│                    FUN MONEY MINTING ARCHITECTURE                     │
├──────────────────────────────────────────────────────────────────────┤
│                                                                       │
│  ┌─────────────┐     ┌──────────────┐     ┌──────────────────────┐   │
│  │   USER      │     │  PLATFORM    │     │   SMART CONTRACT     │   │
│  │  (Browser)  │     │  (Supabase)  │     │   (BSC Testnet)      │   │
│  └──────┬──────┘     └──────┬───────┘     └──────────┬───────────┘   │
│         │                   │                        │               │
│    ┌────▼────┐         ┌────▼────┐              ┌────▼────┐          │
│    │ Submit  │         │ Store   │              │lockWith │          │
│    │ Action  │────────►│ Pending │              │  PPLP() │          │
│    │Evidence │         │ Request │              │         │          │
│    └─────────┘         └────┬────┘              └────▲────┘          │
│                             │                        │               │
│    ┌─────────┐         ┌────▼────┐              ┌────┴────┐          │
│    │  ADMIN  │         │ Review  │              │ EIP-712 │          │
│    │(Attester│◄────────┤   &     │──────────────► Sign    │          │
│    │ Wallet) │         │ Approve │              │& Submit │          │
│    └─────────┘         └─────────┘              └─────────┘          │
│                                                                       │
└──────────────────────────────────────────────────────────────────────┘

FLOW CHI TIẾT:
1. User thực hiện action (donate, learn, volunteer, etc.)
2. Platform thu thập evidence + tính PPLP Score
3. User submit mint request → status: PENDING
4. Admin xem request trong Dashboard
5. Admin approve → ký EIP-712 với Attester wallet
6. Admin gọi lockWithPPLP() on-chain
7. Token mint ở trạng thái LOCKED
8. User tự activate() và claim() để nhận FUN
```

**Bao gồm:**
- Sơ đồ kiến trúc tổng quan
- Phân chia trách nhiệm Platform vs SDK vs Contract
- Luồng dữ liệu end-to-end
- Các thành phần cần implement

---

### 02-DATABASE-SCHEMA.md

```sql
-- MINT REQUESTS TABLE
-- Platform tự lưu trong database của mình

CREATE TABLE mint_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- User info
  user_id UUID NOT NULL,
  user_wallet_address TEXT NOT NULL,
  
  -- Action info  
  platform_id TEXT NOT NULL,           -- 'FUN_PROFILE', 'ANGEL_AI', etc.
  action_type TEXT NOT NULL,           -- 'CONTENT_CREATE', 'AI_REVIEW_HELPFUL', etc.
  action_evidence JSONB NOT NULL,      -- Evidence data
  
  -- Scoring (calculated by PPLP Engine)
  pillar_scores JSONB NOT NULL,        -- {S: 80, T: 75, H: 70, C: 85, U: 90}
  light_score INTEGER NOT NULL,
  unity_score INTEGER NOT NULL,
  unity_signals JSONB,                 -- {collaboration: true, ...}
  
  -- Multipliers
  multiplier_q DECIMAL(5,2),
  multiplier_i DECIMAL(5,2),
  multiplier_k DECIMAL(5,4),
  multiplier_ux DECIMAL(5,2),
  
  -- Amount
  base_reward_atomic TEXT NOT NULL,
  calculated_amount_atomic TEXT NOT NULL,
  calculated_amount_formatted TEXT,
  
  -- Hashes (for contract call)
  action_hash TEXT,                    -- keccak256(actionType)
  evidence_hash TEXT,                  -- keccak256(evidence JSON)
  
  -- Status workflow
  status TEXT DEFAULT 'pending',       -- pending, approved, minted, rejected
  decision_reason TEXT,
  
  -- Admin/Attester info
  reviewed_by UUID,
  reviewed_at TIMESTAMPTZ,
  attester_address TEXT,
  
  -- Transaction info (after mint)
  tx_hash TEXT,
  block_number BIGINT,
  minted_at TIMESTAMPTZ,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS Policies
ALTER TABLE mint_requests ENABLE ROW LEVEL SECURITY;

-- Users can view their own requests
CREATE POLICY "Users view own requests" ON mint_requests
  FOR SELECT USING (auth.uid() = user_id);

-- Users can insert new requests  
CREATE POLICY "Users insert own requests" ON mint_requests
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Admins can view all (need admin role check)
CREATE POLICY "Admins view all" ON mint_requests
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM admin_users 
      WHERE user_id = auth.uid()
    )
  );

-- Admins can update (approve/reject)
CREATE POLICY "Admins update status" ON mint_requests
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM admin_users 
      WHERE user_id = auth.uid()
    )
  );
```

**Bao gồm:**
- Schema đầy đủ với comments
- RLS policies mẫu
- Index recommendations
- Migration script copy-paste

---

### 03-PPLP-SCORING-ENGINE.md

```typescript
// CÔNG THỨC TÍNH TOÁN CHI TIẾT

// 1. LIGHT SCORE (0-100)
// Formula: 0.25*S + 0.20*T + 0.20*H + 0.20*C + 0.15*U
lightScore = 0.25 * pillars.S 
           + 0.20 * pillars.T 
           + 0.20 * pillars.H 
           + 0.20 * pillars.C 
           + 0.15 * pillars.U

// 2. UNITY SCORE (0-100)  
// Weights: collaboration(40%) + beneficiaryConfirmed(30%) + communityEndorsement(20%) + bridgeValue(10%)
unityScore = 40 * (signals.collaboration ? 1 : 0)
           + 30 * (signals.beneficiaryConfirmed ? 1 : 0)
           + 20 * (signals.communityEndorsement ? 1 : 0)
           + 10 * (signals.bridgeValue ? 1 : 0)

// 3. MULTIPLIERS
Q = Quality multiplier (1.0 - 3.0) based on evidence quality
I = Impact multiplier (1.0 - 5.0) based on action impact
K = Integrity multiplier (0.0 - 1.0) based on anti-sybil score
Ux = Unity multiplier (0.5 - 2.5) based on unity score

// 4. FINAL AMOUNT
amountAtomic = baseRewardAtomic * Q * I * K * Ux
```

**Bao gồm:**
- Công thức tính Light Score
- Công thức tính Unity Score
- Bảng mapping Unity → Ux multiplier
- Integrity K calculation
- Final amount formula với caps
- Code `pplp-engine.ts` đầy đủ

---

### 04-CONTRACT-INTEGRATION.md

```typescript
// ===== SMART CONTRACT CONFIG =====

const CONTRACT_ADDRESS = '0x1aa8DE8B1E4465C6d729E8564893f8EF823a5ff2';
const CHAIN_ID = 97; // BSC Testnet

// ===== EIP-712 DOMAIN =====
const EIP712_DOMAIN = {
  name: "FUN Money",
  version: "1.2.1",  // CRITICAL: Must match exactly
  chainId: 97,
  verifyingContract: CONTRACT_ADDRESS
};

// ===== PPLP TYPES (for signing) =====
const PPLP_TYPES = {
  PureLoveProof: [
    { name: "user", type: "address" },      // Recipient address
    { name: "actionHash", type: "bytes32" }, // keccak256(actionType)
    { name: "amount", type: "uint256" },
    { name: "evidenceHash", type: "bytes32" },
    { name: "nonce", type: "uint256" }       // From contract.nonces(user)
  ]
};

// ===== CRITICAL: NONCE IS FOR RECIPIENT =====
// Nonce must be fetched for the RECIPIENT (user), not the signer!
const nonce = await contract.nonces(recipientAddress);

// ===== lockWithPPLP FUNCTION =====
// Parameters:
// - user: address (RECIPIENT - who receives tokens)
// - action: string (NOT hash! Contract hashes internally)
// - amount: uint256 (in atomic units, 18 decimals)
// - evidenceHash: bytes32
// - sigs: bytes[] (array of EIP-712 signatures)

await contract.lockWithPPLP(
  recipientAddress,    // user = RECIPIENT
  "CONTENT_CREATE",    // action STRING
  "50000000000000000000", // 50 FUN in atomic
  evidenceHash,
  [signature]          // Array of signatures
);
```

**Bao gồm:**
- Contract ABI đầy đủ với annotations
- EIP-712 Domain config
- PureLoveProof type structure
- Code examples cho từng bước
- Lưu ý CRITICAL về nonce và user parameter

---

### 05-ADMIN-DASHBOARD.md

```text
┌────────────────────────────────────────────────────────────────────┐
│                    ADMIN MINT APPROVAL DASHBOARD                    │
├────────────────────────────────────────────────────────────────────┤
│  [📋 Pending (12)]  [✅ Approved (45)]  [❌ Rejected (3)]          │
├────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │ #REQ-001 | CONTENT_CREATE | 2 hours ago                      │  │
│  ├──────────────────────────────────────────────────────────────┤  │
│  │ User: 0x7d03...f0f | Light: 78 | Unity: 70                   │  │
│  │ Amount: 125.50 FUN | Q: 1.8 | I: 2.0 | K: 0.95 | Ux: 1.5     │  │
│  │                                                               │  │
│  │ Evidence: "Created tutorial video about PPLP..."              │  │
│  │                                                               │  │
│  │ [👁️ View Details] [✅ Approve & Sign] [❌ Reject]            │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                                                                     │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │ #REQ-002 | AI_REVIEW_HELPFUL | 5 hours ago                   │  │
│  │ ...                                                          │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                                                                     │
└────────────────────────────────────────────────────────────────────┘

APPROVE FLOW:
1. Admin click "Approve & Sign"
2. System shows confirmation modal with full details
3. Admin confirms → MetaMask popup for EIP-712 signature
4. System calls lockWithPPLP() with signature
5. Wait for transaction confirmation
6. Update status to "minted" + save tx_hash
```

**Bao gồm:**
- Mockup UI chi tiết
- Component React `AdminApprovalPanel.tsx`
- Approve workflow step-by-step
- MetaMask integration code
- Status update logic

---

### 06-USER-TOKEN-LIFECYCLE.md

```text
TOKEN LIFECYCLE: LOCKED → ACTIVATED → FLOWING

┌─────────────────────────────────────────────────────────────────┐
│                        TOKEN STATES                              │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│   lockWithPPLP()          activate(amount)       claim(amount)  │
│        │                       │                      │         │
│        ▼                       ▼                      ▼         │
│   ┌─────────┐             ┌──────────┐          ┌──────────┐   │
│   │ LOCKED  │────────────►│ACTIVATED │─────────►│ FLOWING  │   │
│   │(in alloc)│   User ký  │(in alloc)│  User ký │(in wallet)│   │
│   └─────────┘             └──────────┘          └──────────┘   │
│                                                                  │
│   Attester ký               User ký                User ký      │
│   (Admin)                   (tự do)                (tự do)      │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘

USER ACTIONS:
1. Sau khi Admin approve & mint → User thấy token ở LOCKED state
2. User vào "My Tokens" panel → Click "Activate"
3. MetaMask popup → User ký → Token chuyển ACTIVATED
4. User click "Claim" → MetaMask popup → User ký
5. Token chuyển vào wallet (FLOWING) → có thể transfer
```

**Bao gồm:**
- Sơ đồ lifecycle chi tiết
- Code `TokenLifecyclePanel.tsx`
- activate() và claim() implementation
- UI component cho user

---

### 07-ERROR-HANDLING.md

```typescript
// ===== COMMON ERROR CODES =====

const ERROR_CODES = {
  // Contract reverts
  'SIGS_LOW': 'Không đủ chữ ký Attester hợp lệ',
  'ACTION_INVALID': 'Action chưa được đăng ký hoặc đã deprecated',
  'PAUSED': 'Contract đang tạm dừng (pauseTransitions = true)',
  'EPOCH_CAP': 'Đã đạt giới hạn mint trong epoch này',
  'NOT_GOV': 'Caller không phải governance',
  'LOCK_LOW': 'Không đủ locked tokens để activate',
  'ACT_LOW': 'Không đủ activated tokens để claim',
  
  // MetaMask errors
  4001: 'User từ chối transaction',
  -32603: 'Internal JSON-RPC error',
  
  // Network errors
  'NETWORK_ERROR': 'Lỗi kết nối mạng',
  'TIMEOUT': 'Transaction timeout'
};

// ===== DEBUG CHECKLIST =====
// 1. Check contract exists: getCode(address) !== '0x'
// 2. Check not paused: pauseTransitions() === false
// 3. Check is attester: isAttester(walletAddress) === true
// 4. Check action registered: actions(actionHash).allowed === true
// 5. Check nonce: nonces(RECIPIENT) matches signed nonce
// 6. Check EIP-712 version: Must be "1.2.1"
```

**Bao gồm:**
- Bảng error codes và giải thích
- Debug checklist
- Code decode revert error
- Logging best practices
- Retry strategies

---

### 08-SECURITY-CHECKLIST.md

```markdown
# 🔐 SECURITY CHECKLIST

## Attester Wallet
- [ ] Attester wallet PHẢI được đăng ký on-chain bằng govRegisterAttester()
- [ ] Private key lưu trữ an toàn (hardware wallet recommended)
- [ ] Không expose private key trong frontend code
- [ ] Chỉ admin có quyền truy cập attester wallet

## Database Security
- [ ] RLS policies cho mint_requests table
- [ ] User chỉ xem được request của mình
- [ ] Admin role check cho approve actions

## Contract Interaction
- [ ] Verify contract address trước mỗi call
- [ ] Check pauseTransitions() trước khi mint
- [ ] Validate all inputs server-side (nếu dùng edge function)

## EIP-712 Signing
- [ ] Version PHẢI là "1.2.1"
- [ ] Nonce PHẢI lấy từ recipient address (không phải signer)
- [ ] Verify signature off-chain trước khi gửi transaction

## Frontend
- [ ] Không store sensitive data trong localStorage
- [ ] Validate wallet address format
- [ ] Handle MetaMask errors gracefully
```

---

## 📦 Copy-Paste Ready Code Files

### code/lib/web3-config.ts
- Contract address, ABI, Chain config
- Copy từ `src/lib/web3.ts` hiện tại

### code/lib/eip712-signer.ts  
- EIP-712 domain, types, signing functions
- Copy từ `src/lib/eip712.ts` hiện tại

### code/lib/pplp-engine.ts
- Scoring calculations
- Copy từ `src/lib/pplp-engine.ts` hiện tại

### code/lib/contract-helpers.ts
- getNonce, checkContractExists, validateBeforeMint
- Tổng hợp từ các file hiện tại

### code/hooks/useWallet.ts
- MetaMask connection hook
- Copy từ `src/hooks/useWallet.ts` hiện tại

### code/hooks/useMintRequest.ts
- **TẠO MỚI** - Hook để submit/manage mint requests

### code/components/MintRequestForm.tsx
- **TẠO MỚI** - Form cho user submit action evidence

### code/components/AdminApprovalPanel.tsx
- **TẠO MỚI** - Panel cho admin approve/reject requests

### code/database/mint-requests-migration.sql
- SQL migration script

---

## ✅ Tiêu Chí Hoàn Thành

1. ✅ Quick Start guide (5 phút bắt đầu)
2. ✅ Architecture diagram + flow explanation
3. ✅ Database schema với RLS policies
4. ✅ PPLP Scoring Engine chi tiết
5. ✅ Contract Integration với code examples
6. ✅ Admin Dashboard mockup + code
7. ✅ User Token Lifecycle explanation
8. ✅ Error Handling guide
9. ✅ Security Checklist
10. ✅ Copy-paste ready code files

---

## 📊 Ước Tính

- **Tổng số file**: 9 markdown docs + 8 code files
- **Tổng dung lượng**: ~2000-2500 dòng documentation
- **Thời gian đọc**: ~30 phút cho Quick Start, ~2 giờ cho full docs
- **Thời gian implement**: ~4-8 giờ với code copy-paste

---

## 🎯 Kết Quả Mong Đợi

Sau khi đọc và implement SDK này, các platform Lovable sẽ có thể:

1. **User side**: Submit mint requests với evidence
2. **Admin side**: Review, approve/reject, sign với attester wallet
3. **On-chain**: Mint FUN Money thành công
4. **User side**: Activate và claim tokens về wallet

Tất cả đều được hướng dẫn chi tiết từng bước với code examples có thể copy-paste trực tiếp vào dự án Lovable mới! 🚀
