-- =====================================================
-- FUN Money SDK v1.0 - Database Migration
-- Copy and run this in your Lovable Cloud SQL editor
-- =====================================================

-- =====================================================
-- 1. CREATE MINT_REQUESTS TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS mint_requests (
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
-- 2. CREATE INDEXES
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_mint_requests_user_id ON mint_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_mint_requests_status ON mint_requests(status);
CREATE INDEX IF NOT EXISTS idx_mint_requests_platform ON mint_requests(platform_id);
CREATE INDEX IF NOT EXISTS idx_mint_requests_action ON mint_requests(action_type);
CREATE INDEX IF NOT EXISTS idx_mint_requests_created ON mint_requests(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_mint_requests_tx_hash ON mint_requests(tx_hash) WHERE tx_hash IS NOT NULL;

-- =====================================================
-- 3. ENABLE ROW LEVEL SECURITY
-- =====================================================

ALTER TABLE mint_requests ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- 4. USER POLICIES
-- =====================================================

-- Users can view their own requests
CREATE POLICY "Users can view own requests" ON mint_requests
  FOR SELECT 
  USING (auth.uid() = user_id);

-- Users can insert new requests
CREATE POLICY "Users can insert own requests" ON mint_requests
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- =====================================================
-- 5. ADMIN ROLE SETUP
-- =====================================================

-- Create role enum (if not exists)
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'app_role') THEN
    CREATE TYPE app_role AS ENUM ('admin', 'moderator', 'user');
  END IF;
END $$;

-- Create user_roles table
CREATE TABLE IF NOT EXISTS user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role app_role NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, role)
);

ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- 6. SECURITY DEFINER FUNCTION FOR ROLE CHECK
-- =====================================================

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

-- =====================================================
-- 7. ADMIN POLICIES
-- =====================================================

-- Admins can view all requests
CREATE POLICY "Admins can view all requests" ON mint_requests
  FOR SELECT 
  USING (has_role(auth.uid(), 'admin'));

-- Admins can update requests
CREATE POLICY "Admins can update requests" ON mint_requests
  FOR UPDATE 
  USING (has_role(auth.uid(), 'admin'));

-- =====================================================
-- 8. TRIGGER FOR updated_at
-- =====================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_mint_requests_updated_at ON mint_requests;
CREATE TRIGGER update_mint_requests_updated_at
  BEFORE UPDATE ON mint_requests
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- 9. ADMIN USER SETUP (EXAMPLE)
-- Run this after creating your admin user account
-- =====================================================

-- INSERT INTO user_roles (user_id, role) 
-- VALUES ('YOUR-ADMIN-USER-ID-HERE', 'admin');

-- =====================================================
-- MIGRATION COMPLETE!
-- =====================================================
