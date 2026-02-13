
-- =====================================================
-- Multi-Sig Mint: mint_requests & mint_signatures
-- =====================================================

-- 1. Create mint_requests table
CREATE TABLE public.multisig_mint_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_by TEXT NOT NULL,              -- wallet address of creator
  recipient TEXT NOT NULL,               -- recipient wallet address
  action_type TEXT NOT NULL,             -- e.g. "DONATE"
  action_hash TEXT NOT NULL,             -- keccak256 of action
  amount_atomic TEXT NOT NULL,           -- token amount in atomic units
  evidence_hash TEXT NOT NULL,           -- keccak256 of evidence
  nonce TEXT NOT NULL,                   -- recipient nonce from contract
  platform_id TEXT,
  threshold INTEGER NOT NULL DEFAULT 3,  -- required signatures
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'ready', 'submitted', 'confirmed', 'expired')),
  tx_hash TEXT,
  scoring_metadata JSONB,               -- lightScore, unityScore, multipliers
  chain_id INTEGER DEFAULT 97,
  contract_address TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '24 hours')
);

-- 2. Create mint_signatures table
CREATE TABLE public.multisig_mint_signatures (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id UUID NOT NULL REFERENCES public.multisig_mint_requests(id) ON DELETE CASCADE,
  signer_address TEXT NOT NULL,
  signature TEXT NOT NULL,
  signed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(request_id, signer_address)
);

-- 3. Indexes
CREATE INDEX idx_multisig_mint_requests_status ON public.multisig_mint_requests(status);
CREATE INDEX idx_multisig_mint_requests_created_by ON public.multisig_mint_requests(created_by);
CREATE INDEX idx_multisig_mint_requests_created_at ON public.multisig_mint_requests(created_at DESC);
CREATE INDEX idx_multisig_mint_signatures_request ON public.multisig_mint_signatures(request_id);

-- 4. Enable RLS
ALTER TABLE public.multisig_mint_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.multisig_mint_signatures ENABLE ROW LEVEL SECURITY;

-- 5. RLS Policies - authenticated users can read/write
-- (Attester verification happens on-chain, not via Supabase auth)
CREATE POLICY "Authenticated users can read mint requests"
  ON public.multisig_mint_requests FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can create mint requests"
  ON public.multisig_mint_requests FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update mint requests"
  ON public.multisig_mint_requests FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can read signatures"
  ON public.multisig_mint_signatures FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can add signatures"
  ON public.multisig_mint_signatures FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- 6. Enable realtime for live signature updates
ALTER PUBLICATION supabase_realtime ADD TABLE public.multisig_mint_signatures;
