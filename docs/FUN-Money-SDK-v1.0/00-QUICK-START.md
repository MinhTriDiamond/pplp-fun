# 🚀 Quick Start - Tích Hợp FUN Money trong 5 Phút

Hướng dẫn này giúp bạn tích hợp FUN Money vào dự án Lovable một cách nhanh chóng.

## Kiến Trúc Tổng Quan

```
┌─────────────┐     ┌──────────────┐     ┌────────────────────┐
│   USER      │     │  PLATFORM    │     │   SMART CONTRACT   │
│  (Browser)  │     │  (Supabase)  │     │   (BSC Testnet)    │
└──────┬──────┘     └──────┬───────┘     └──────────┬─────────┘
       │                   │                        │
  Submit Action      Store Pending            lockWithPPLP()
       │                   │                        │
       ▼                   ▼                        │
   ┌─────────┐       ┌──────────┐            ┌────────────┐
   │ Evidence│──────►│ Database │            │ 99% → Pool │
   │ + Score │       │ (pending)│            │ 1% → User  │
   └─────────┘       └────┬─────┘            └────────────┘
                         │                        ▲
   ┌─────────┐       ┌────▼────┐            ┌─────┴────┐
   │  ADMIN  │◄──────│ Review  │───────────►│ EIP-712  │
   │(Attester│       │ Approve │            │  Sign    │
   │ Wallet) │       └─────────┘            └──────────┘
   └─────────┘
```

## Bước 1: Copy Thư Viện Cốt Lõi

Copy 4 file từ thư mục `code/lib/` vào `src/lib/` của dự án:

```bash
# Cấu trúc file
src/lib/
├── fun-money/
│   ├── web3-config.ts      # Contract address, ABI, Chain config
│   ├── eip712-signer.ts    # EIP-712 domain, types, signing
│   ├── pplp-engine.ts      # Scoring calculations
│   └── contract-helpers.ts # Utility functions
```

## Bước 2: Tạo Bảng mint_requests

Chạy SQL migration trong Lovable Cloud:

```sql
-- Xem file code/database/mint-requests-migration.sql
CREATE TABLE mint_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  user_wallet_address TEXT NOT NULL,
  platform_id TEXT NOT NULL,
  action_type TEXT NOT NULL,
  action_evidence JSONB NOT NULL,
  light_score INTEGER NOT NULL,
  unity_score INTEGER NOT NULL,
  calculated_amount_atomic TEXT NOT NULL,
  status TEXT DEFAULT 'pending',
  tx_hash TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE mint_requests ENABLE ROW LEVEL SECURITY;
```

## Bước 3: Thêm Hook useWallet

Copy file `code/hooks/useWallet.ts` vào `src/hooks/`:

```typescript
import { useWallet } from '@/hooks/useWallet';

function MyComponent() {
  const { isConnected, address, connect, switchToBscTestnet } = useWallet();
  
  if (!isConnected) {
    return <button onClick={connect}>Connect Wallet</button>;
  }
  
  return <div>Connected: {address}</div>;
}
```

## Bước 4: Thêm Form Submit Action

Copy component `code/components/MintRequestForm.tsx`:

```tsx
import { MintRequestForm } from '@/components/fun-money/MintRequestForm';

function UserDashboard() {
  return (
    <MintRequestForm
      platformId="FUN_PROFILE"
      actionType="CONTENT_CREATE"
      onSubmitSuccess={() => console.log('Request submitted!')}
    />
  );
}
```

## Bước 5: Thêm Admin Panel

Copy component `code/components/AdminApprovalPanel.tsx`:

```tsx
import { AdminApprovalPanel } from '@/components/fun-money/AdminApprovalPanel';

function AdminDashboard() {
  return <AdminApprovalPanel />;
}
```

## Bước 6: Test!

### User Flow:
1. User connect wallet
2. User submit action evidence
3. Status = `pending`

### Admin Flow:
1. Admin xem pending requests
2. Admin click "Approve & Sign"
3. MetaMask popup → Admin ký EIP-712
4. System gọi `lockWithPPLP()` on-chain
5. Status = `minted`

### User Claims:
1. User thấy tokens ở trạng thái LOCKED
2. User click "Activate" → ACTIVATED
3. User click "Claim" → FLOWING (trong ví)

---

## ⚡ Checklist Nhanh

- [ ] Copy 4 file lib vào `src/lib/fun-money/`
- [ ] Chạy SQL migration tạo bảng `mint_requests`
- [ ] Copy hook `useWallet.ts`
- [ ] Copy component `MintRequestForm.tsx`
- [ ] Copy component `AdminApprovalPanel.tsx`
- [ ] Đăng ký Attester wallet với Governance
- [ ] Test submit → approve → mint flow

---

## 📖 Tiếp Theo

Đọc chi tiết từng phần:

1. [Architecture](./01-ARCHITECTURE.md) - Kiến trúc & luồng hoạt động
2. [Database Schema](./02-DATABASE-SCHEMA.md) - Schema & RLS policies
3. [PPLP Scoring](./03-PPLP-SCORING-ENGINE.md) - Công thức tính điểm
4. [Contract Integration](./04-CONTRACT-INTEGRATION.md) - EIP-712 & ABI
5. [Admin Dashboard](./05-ADMIN-DASHBOARD.md) - Approve workflow
6. [Token Lifecycle](./06-USER-TOKEN-LIFECYCLE.md) - Activate & Claim
7. [Error Handling](./07-ERROR-HANDLING.md) - Debug & troubleshooting
8. [Security](./08-SECURITY-CHECKLIST.md) - Bảo mật & best practices

---

*FUN Money SDK v1.0 - Proof of Pure Love Protocol*
