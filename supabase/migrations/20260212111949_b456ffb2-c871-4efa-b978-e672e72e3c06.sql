
-- =============================================
-- PROMPT D: FUN Wallet + Ledger MVP
-- =============================================

-- 1. Asset type enum
CREATE TYPE public.wallet_asset AS ENUM ('FUN', 'CAMLY');

-- 2. Transaction type enum
CREATE TYPE public.tx_type AS ENUM ('transfer', 'pay', 'reward', 'refund', 'mint', 'burn');

-- 3. Transaction status enum
CREATE TYPE public.tx_status AS ENUM ('pending', 'completed', 'failed', 'reversed');

-- 4. Wallet accounts (one per user per asset)
CREATE TABLE public.wallet_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  asset wallet_asset NOT NULL DEFAULT 'FUN',
  available NUMERIC(20, 4) NOT NULL DEFAULT 0 CHECK (available >= 0),
  locked NUMERIC(20, 4) NOT NULL DEFAULT 0 CHECK (locked >= 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, asset)
);

-- 5. Ledger transactions (immutable log)
CREATE TABLE public.ledger_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  idempotency_key TEXT UNIQUE,
  tx_type tx_type NOT NULL,
  status tx_status NOT NULL DEFAULT 'completed',
  asset wallet_asset NOT NULL DEFAULT 'FUN',
  amount NUMERIC(20, 4) NOT NULL CHECK (amount > 0),
  from_user_id UUID REFERENCES auth.users(id),
  to_user_id UUID REFERENCES auth.users(id),
  module TEXT,
  order_id TEXT,
  memo TEXT,
  payment_id UUID REFERENCES public.ledger_transactions(id),
  trace_id TEXT NOT NULL DEFAULT gen_random_uuid()::TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 6. Idempotency keys table (for edge function dedup)
CREATE TABLE public.idempotency_keys (
  key TEXT PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id),
  response JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 7. Enable RLS
ALTER TABLE public.wallet_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ledger_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.idempotency_keys ENABLE ROW LEVEL SECURITY;

-- 8. RLS: wallet_accounts
CREATE POLICY "Users can view own wallet"
ON public.wallet_accounts FOR SELECT TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "System can insert wallet"
ON public.wallet_accounts FOR INSERT TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all wallets"
ON public.wallet_accounts FOR SELECT TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

-- 9. RLS: ledger_transactions
CREATE POLICY "Users can view own transactions"
ON public.ledger_transactions FOR SELECT TO authenticated
USING (auth.uid() = from_user_id OR auth.uid() = to_user_id);

CREATE POLICY "Admins can view all transactions"
ON public.ledger_transactions FOR SELECT TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

-- Service role will insert transactions via edge functions
-- No direct INSERT for authenticated users (must go through edge function)

-- 10. RLS: idempotency_keys
CREATE POLICY "Users can view own idempotency keys"
ON public.idempotency_keys FOR SELECT TO authenticated
USING (auth.uid() = user_id);

-- 11. Indexes
CREATE INDEX idx_wallet_user_asset ON public.wallet_accounts (user_id, asset);
CREATE INDEX idx_ledger_from ON public.ledger_transactions (from_user_id, created_at DESC);
CREATE INDEX idx_ledger_to ON public.ledger_transactions (to_user_id, created_at DESC);
CREATE INDEX idx_ledger_type ON public.ledger_transactions (tx_type);
CREATE INDEX idx_ledger_order ON public.ledger_transactions (order_id) WHERE order_id IS NOT NULL;
CREATE INDEX idx_idempotency_created ON public.idempotency_keys (created_at);

-- 12. Auto-create wallet on new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user_wallet()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  INSERT INTO public.wallet_accounts (user_id, asset, available, locked)
  VALUES (NEW.id, 'FUN', 0, 0)
  ON CONFLICT (user_id, asset) DO NOTHING;

  INSERT INTO public.wallet_accounts (user_id, asset, available, locked)
  VALUES (NEW.id, 'CAMLY', 0, 0)
  ON CONFLICT (user_id, asset) DO NOTHING;

  RETURN NEW;
END;
$$;

CREATE TRIGGER on_new_user_create_wallet
AFTER INSERT ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.handle_new_user_wallet();

-- 13. Updated_at trigger for wallet_accounts
CREATE TRIGGER update_wallet_updated_at
BEFORE UPDATE ON public.wallet_accounts
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- 14. Treasury summary view (public-safe, anonymized)
CREATE OR REPLACE VIEW public.treasury_daily_summary AS
SELECT
  DATE(created_at) AS day,
  asset,
  tx_type,
  COUNT(*) AS tx_count,
  SUM(amount) AS total_amount
FROM public.ledger_transactions
WHERE status = 'completed'
GROUP BY DATE(created_at), asset, tx_type
ORDER BY day DESC;
