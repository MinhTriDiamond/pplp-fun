# 🗄️ Database Schema - Cấu Trúc CSDL cho FUN Money Integration

## Bảng mint_requests

Bảng chính lưu trữ các request mint từ user, được admin review và approve.

```sql
-- =====================================================
-- MINT REQUESTS TABLE
-- Platform tự tạo bảng này trong database của mình
-- =====================================================

CREATE TABLE mint_requests (
  -- Primary key
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- ===== USER INFO =====
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  user_wallet_address TEXT NOT NULL,
  
  -- ===== ACTION INFO =====
  platform_id TEXT NOT NULL,           -- 'FUN_PROFILE', 'ANGEL_AI', 'FUN_CHARITY', etc.
  action_type TEXT NOT NULL,           -- 'CONTENT_CREATE', 'DONATE', 'VOLUNTEER', etc.
  action_evidence JSONB NOT NULL,      -- Evidence data (urls, hashes, descriptions)
  
  -- ===== PILLAR SCORES (0-100 each) =====
  pillar_scores JSONB NOT NULL,        -- {"S": 80, "T": 75, "H": 70, "C": 85, "U": 90}
  
  -- ===== CALCULATED SCORES =====
  light_score INTEGER NOT NULL,        -- 0-100, weighted average of pillars
  unity_score INTEGER NOT NULL,        -- 0-100, from unity signals
  unity_signals JSONB,                 -- {"collaboration": true, "beneficiaryConfirmed": true, ...}
  
  -- ===== MULTIPLIERS =====
  multiplier_q DECIMAL(5,2) NOT NULL,  -- Quality: 0.5 - 3.0
  multiplier_i DECIMAL(5,2) NOT NULL,  -- Impact: 0.5 - 5.0
  multiplier_k DECIMAL(5,4) NOT NULL,  -- Integrity: 0.0 - 1.0
  multiplier_ux DECIMAL(5,2) NOT NULL, -- Unity: 0.5 - 2.5
  
  -- ===== AMOUNT =====
  base_reward_atomic TEXT NOT NULL,    -- Base reward in atomic units
  calculated_amount_atomic TEXT NOT NULL, -- Final amount after multipliers
  calculated_amount_formatted TEXT,    -- Human readable: "125.50 FUN"
  
  -- ===== HASHES (for contract call) =====
  action_hash TEXT,                    -- keccak256(actionType) - bytes32
  evidence_hash TEXT,                  -- keccak256(evidence JSON) - bytes32
  
  -- ===== STATUS WORKFLOW =====
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'minted', 'rejected', 'failed')),
  decision_reason TEXT,                -- Reason for approval/rejection
  
  -- ===== ADMIN/ATTESTER INFO =====
  reviewed_by UUID REFERENCES auth.users(id),
  reviewed_at TIMESTAMPTZ,
  attester_address TEXT,               -- Wallet address of attester who signed
  
  -- ===== TRANSACTION INFO (after mint) =====
  tx_hash TEXT,                        -- On-chain transaction hash
  block_number BIGINT,                 -- Block number when minted
  minted_at TIMESTAMPTZ,               -- Timestamp of successful mint
  
  -- ===== METADATA =====
  chain_id INTEGER DEFAULT 97,         -- BSC Testnet = 97, Mainnet = 56
  contract_address TEXT,               -- FUN Money contract address used
  nonce_used BIGINT,                   -- Nonce used in signature
  
  -- ===== TIMESTAMPS =====
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- INDEXES
-- =====================================================

CREATE INDEX idx_mint_requests_user_id ON mint_requests(user_id);
CREATE INDEX idx_mint_requests_status ON mint_requests(status);
CREATE INDEX idx_mint_requests_platform ON mint_requests(platform_id);
CREATE INDEX idx_mint_requests_action ON mint_requests(action_type);
CREATE INDEX idx_mint_requests_created ON mint_requests(created_at DESC);
CREATE INDEX idx_mint_requests_tx_hash ON mint_requests(tx_hash) WHERE tx_hash IS NOT NULL;

-- =====================================================
-- ROW LEVEL SECURITY
-- =====================================================

ALTER TABLE mint_requests ENABLE ROW LEVEL SECURITY;

-- Users can view their own requests
CREATE POLICY "Users can view own requests" ON mint_requests
  FOR SELECT 
  USING (auth.uid() = user_id);

-- Users can insert new requests
CREATE POLICY "Users can insert own requests" ON mint_requests
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- =====================================================
-- ADMIN ROLE SETUP (QUAN TRỌNG!)
-- =====================================================

-- Tạo enum cho roles
CREATE TYPE app_role AS ENUM ('admin', 'moderator', 'user');

-- Tạo bảng user_roles (KHÔNG lưu role trong profiles!)
CREATE TABLE user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role app_role NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, role)
);

ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;

-- Function kiểm tra role (SECURITY DEFINER để tránh recursive RLS)
CREATE OR REPLACE FUNCTION has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- Admins can view all requests
CREATE POLICY "Admins can view all requests" ON mint_requests
  FOR SELECT 
  USING (has_role(auth.uid(), 'admin'));

-- Admins can update status
CREATE POLICY "Admins can update requests" ON mint_requests
  FOR UPDATE 
  USING (has_role(auth.uid(), 'admin'));

-- =====================================================
-- TRIGGER: AUTO UPDATE updated_at
-- =====================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_mint_requests_updated_at
  BEFORE UPDATE ON mint_requests
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
```

---

## Bảng user_roles (Bắt Buộc!)

⚠️ **QUAN TRỌNG**: Roles PHẢI lưu trong bảng riêng, KHÔNG được lưu trong profiles để tránh privilege escalation.

```sql
-- Đã tạo ở trên, đây là chi tiết:

CREATE TABLE user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role app_role NOT NULL,  -- 'admin', 'moderator', 'user'
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, role)
);

-- Thêm admin
INSERT INTO user_roles (user_id, role) 
VALUES ('your-admin-user-id', 'admin');
```

---

## Schema Mẫu cho action_evidence

```typescript
// TypeScript interface
interface ActionEvidence {
  type: 'TX_HASH' | 'FILE_PROOF' | 'PARTNER_ATTESTATION' | 'COMPLETION_LOG' | 'PHOTO' | 'GEO';
  data: string;
  description?: string;
  urls?: string[];
  attestorId?: string;
  witnessIds?: string[];
  timestamp?: number;
}

// Ví dụ JSONB trong database
{
  "type": "FILE_PROOF",
  "data": "ipfs://QmXxx...",
  "description": "Photo evidence of volunteer work",
  "urls": [
    "https://example.com/proof1.jpg",
    "https://example.com/proof2.jpg"
  ],
  "timestamp": 1707312000
}
```

---

## Schema Mẫu cho pillar_scores

```typescript
// TypeScript interface
interface PillarScores {
  S: number;  // Service: 0-100
  T: number;  // Truth: 0-100
  H: number;  // Healing: 0-100
  C: number;  // Contribution: 0-100
  U: number;  // Unity: 0-100
}

// Ví dụ JSONB
{
  "S": 85,  // Phụng sự
  "T": 80,  // Chân thật
  "H": 75,  // Chữa lành
  "C": 90,  // Đóng góp
  "U": 88   // Hợp nhất
}
```

---

## Schema Mẫu cho unity_signals

```typescript
// TypeScript interface
interface UnitySignals {
  collaboration: boolean;      // Có sự hợp tác
  beneficiaryConfirmed: boolean; // Người thụ hưởng xác nhận
  communityEndorsement: boolean; // Cộng đồng ủng hộ
  bridgeValue: boolean;        // Kết nối giá trị
  conflictResolution?: boolean; // Giải quyết xung đột
  partnerAttested?: boolean;   // Đối tác chứng thực
  witnessCount?: number;       // Số người làm chứng
}

// Ví dụ JSONB
{
  "collaboration": true,
  "beneficiaryConfirmed": true,
  "communityEndorsement": false,
  "bridgeValue": false,
  "witnessCount": 2
}
```

---

## Queries Thường Dùng

### Lấy pending requests (Admin)

```sql
SELECT 
  mr.*,
  p.email as user_email,
  p.display_name as user_name
FROM mint_requests mr
JOIN profiles p ON mr.user_id = p.id
WHERE mr.status = 'pending'
ORDER BY mr.created_at DESC;
```

### Lấy user's mint history

```sql
SELECT * FROM mint_requests 
WHERE user_id = $1 
ORDER BY created_at DESC 
LIMIT 20;
```

### Update status sau khi approve

```sql
UPDATE mint_requests
SET 
  status = 'minted',
  reviewed_by = $1,
  reviewed_at = NOW(),
  attester_address = $2,
  tx_hash = $3,
  minted_at = NOW()
WHERE id = $4;
```

### Thống kê theo platform

```sql
SELECT 
  platform_id,
  COUNT(*) as total_requests,
  SUM(CASE WHEN status = 'minted' THEN 1 ELSE 0 END) as minted,
  SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending,
  SUM(CASE WHEN status = 'rejected' THEN 1 ELSE 0 END) as rejected
FROM mint_requests
GROUP BY platform_id;
```

---

## Migration File Hoàn Chỉnh

Xem file: [code/database/mint-requests-migration.sql](./code/database/mint-requests-migration.sql)

---

*Tiếp theo: [03-PPLP-SCORING-ENGINE.md](./03-PPLP-SCORING-ENGINE.md)*
