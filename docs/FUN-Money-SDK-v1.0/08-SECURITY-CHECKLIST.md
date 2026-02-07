# 🔐 Security Checklist - Bảo Mật FUN Money Integration

## Tổng Quan

Checklist này giúp đảm bảo integration FUN Money an toàn và đúng cách.

---

## 1. Attester Wallet Security

### ✅ PHẢI LÀM

- [ ] Attester wallet được đăng ký on-chain bằng `govRegisterAttester()`
- [ ] Private key lưu trữ an toàn (hardware wallet recommended)
- [ ] Không expose private key trong code frontend
- [ ] Chỉ admin có quyền truy cập Attester wallet
- [ ] Backup mnemonic/private key offline
- [ ] Sử dụng wallet riêng biệt cho Attester (không dùng hot wallet cá nhân)

### ❌ KHÔNG ĐƯỢC

- [ ] Hardcode private key trong source code
- [ ] Commit private key lên git
- [ ] Share private key qua chat/email
- [ ] Sử dụng wallet có tiền thật làm Attester

---

## 2. Database Security

### RLS Policies (QUAN TRỌNG!)

```sql
-- ✅ ĐÚNG: RLS policies với function an toàn
ALTER TABLE mint_requests ENABLE ROW LEVEL SECURITY;

-- Users chỉ xem request của mình
CREATE POLICY "Users view own" ON mint_requests
  FOR SELECT USING (auth.uid() = user_id);

-- Users chỉ insert request của mình
CREATE POLICY "Users insert own" ON mint_requests
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- ❌ SAI: Không check user_id
-- CREATE POLICY "Anyone insert" ON mint_requests
--   FOR INSERT WITH CHECK (true);
```

### Admin Role Check

```sql
-- ✅ ĐÚNG: Tạo bảng user_roles riêng
CREATE TABLE user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  role app_role NOT NULL,
  UNIQUE(user_id, role)
);

-- Function SECURITY DEFINER để tránh recursive RLS
CREATE OR REPLACE FUNCTION has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- ❌ SAI: Lưu role trong profiles table
-- ALTER TABLE profiles ADD COLUMN is_admin BOOLEAN DEFAULT false;
```

### ⚠️ CẢNH BÁO

- **KHÔNG** lưu admin role trong localStorage hoặc sessionStorage
- **KHÔNG** hardcode admin check trong frontend
- **LUÔN** verify role server-side với RLS policies

---

## 3. Contract Interaction Security

### Pre-Mint Validation

```typescript
// ✅ ĐÚNG: Validate trước khi mint
async function safeMint(params: MintParams) {
  // 1. Verify contract exists
  const code = await provider.getCode(contractAddress);
  if (code === '0x') {
    throw new Error('Contract not deployed');
  }
  
  // 2. Check not paused
  const paused = await contract.pauseTransitions();
  if (paused) {
    throw new Error('Contract is paused');
  }
  
  // 3. Verify attester
  const isAttester = await contract.isAttester(signerAddress);
  if (!isAttester) {
    throw new Error('Not an attester');
  }
  
  // 4. Verify action registered
  const actionInfo = await contract.actions(actionHash);
  if (!actionInfo[0]) {
    throw new Error('Action not registered');
  }
  
  // 5. Preflight with estimateGas
  await contract.lockWithPPLP.estimateGas(...params);
  
  // 6. Execute
  return await contract.lockWithPPLP(...params);
}
```

### Input Validation

```typescript
// ✅ ĐÚNG: Validate inputs
function validateMintParams(params: {
  recipient: string;
  action: string;
  amount: string;
}) {
  // Validate address format
  if (!/^0x[a-fA-F0-9]{40}$/.test(params.recipient)) {
    throw new Error('Invalid address format');
  }
  
  // Validate action
  const validActions = ['CONTENT_CREATE', 'DONATE', 'VOLUNTEER', ...];
  if (!validActions.includes(params.action)) {
    throw new Error('Invalid action type');
  }
  
  // Validate amount
  const amount = BigInt(params.amount);
  if (amount <= 0n) {
    throw new Error('Amount must be positive');
  }
  
  const MAX_AMOUNT = BigInt("500000000000000000000000"); // 500K FUN
  if (amount > MAX_AMOUNT) {
    throw new Error('Amount exceeds maximum');
  }
}
```

---

## 4. EIP-712 Signing Security

### Version Check (CRITICAL!)

```typescript
// ✅ ĐÚNG: Version phải khớp với contract
const domain = {
  name: "FUN Money",
  version: "1.2.1",  // ⚠️ MUST match contract!
  chainId: 97,
  verifyingContract: contractAddress
};

// ❌ SAI: Version không khớp
// version: "1.0.0"
// version: "1.3.0"
```

### Nonce Management

```typescript
// ✅ ĐÚNG: Nonce từ RECIPIENT
const nonce = await contract.nonces(recipientAddress);

// ❌ SAI: Nonce từ signer
// const nonce = await contract.nonces(signerAddress);
```

### Signature Verification

```typescript
// ✅ ĐÚNG: Verify signature trước khi submit
const recovered = verifyTypedData(domain, types, message, signature);
if (recovered.toLowerCase() !== expectedSigner.toLowerCase()) {
  throw new Error('Signature verification failed');
}
```

---

## 5. Frontend Security

### Sensitive Data

```typescript
// ✅ ĐÚNG: Không lưu sensitive data client-side
sessionStorage.setItem('userPreference', 'dark'); // OK

// ❌ SAI: Lưu private key hoặc secrets
// localStorage.setItem('privateKey', '0x...');
// localStorage.setItem('isAdmin', 'true');
```

### API Keys

```typescript
// ✅ ĐÚNG: Dùng environment variables
const rpcUrl = import.meta.env.VITE_RPC_URL;

// ❌ SAI: Hardcode trong source
// const rpcUrl = 'https://api-key.infura.io/...';
```

### Error Messages

```typescript
// ✅ ĐÚNG: Generic error cho user, detail log cho dev
try {
  await mint();
} catch (err) {
  console.error('Mint failed:', err); // Dev logging
  toast.error('Mint failed. Please try again.'); // User message
}

// ❌ SAI: Expose technical details
// toast.error(`Failed: ${err.stack}`);
```

---

## 6. Rate Limiting & Abuse Prevention

### Request Rate Limiting

```typescript
// Implement rate limiting cho mint requests
const RATE_LIMIT = {
  maxPerMinute: 3,
  maxPerDay: 10
};

async function checkRateLimit(userId: string): Promise<boolean> {
  const { count } = await supabase
    .from('mint_requests')
    .select('*', { count: 'exact' })
    .eq('user_id', userId)
    .gte('created_at', new Date(Date.now() - 60000).toISOString());
  
  return count < RATE_LIMIT.maxPerMinute;
}
```

### Anti-Sybil Measures

- Yêu cầu email verification trước khi submit
- Implement captcha cho high-value actions
- Monitor unusual patterns (nhiều request từ cùng IP)
- Reject requests với anti-sybil score thấp

---

## 7. Audit Checklist

### Before Go-Live

- [ ] Smart Contract đã được audit bởi bên thứ 3
- [ ] RLS policies đã được review
- [ ] Admin role setup đúng (bảng riêng, SECURITY DEFINER)
- [ ] Error handling không leak sensitive info
- [ ] Rate limiting đã implement
- [ ] Logging đầy đủ cho debug và audit trail
- [ ] Backup plan cho trường hợp emergency

### Regular Maintenance

- [ ] Review admin list hàng tháng
- [ ] Check attester wallet security
- [ ] Monitor mint patterns bất thường
- [ ] Update dependencies có security patches
- [ ] Rotate RPC endpoints nếu cần

---

## 8. Emergency Procedures

### If Private Key Compromised

1. Immediately revoke attester status: `govRevokeAttester(compromisedAddress)`
2. Register new attester: `govRegisterAttester(newAddress)`
3. Notify all admins
4. Audit recent transactions for suspicious activity

### If Contract Paused

1. Check `pauseTransitions()` status
2. Contact Governance for unpause
3. Communicate to users về timeline
4. Review cause of pause

### If Suspicious Activity Detected

1. Pause mint requests trong database
2. Review all pending requests
3. Check for unusual patterns
4. Report to security team

---

## Summary Checklist

### Must Have (Bắt Buộc)

- [x] RLS policies cho tất cả tables
- [x] Admin role trong bảng riêng
- [x] EIP-712 version = "1.2.1"
- [x] Nonce lấy từ recipient
- [x] Pre-mint validation
- [x] Signature verification off-chain

### Should Have (Nên Có)

- [ ] Rate limiting
- [ ] Anti-sybil checks
- [ ] Audit logging
- [ ] Error monitoring (Sentry, etc.)
- [ ] Backup attester wallet

### Nice to Have (Tốt Nếu Có)

- [ ] Hardware wallet cho Attester
- [ ] Multi-sig approval (threshold > 1)
- [ ] Real-time alerting
- [ ] Automated testing suite

---

*FUN Money SDK v1.0 - Security First!*
