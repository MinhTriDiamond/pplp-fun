
-- Fix: Change treasury_daily_summary view to SECURITY INVOKER
DROP VIEW IF EXISTS public.treasury_daily_summary;

CREATE VIEW public.treasury_daily_summary
WITH (security_invoker = true)
AS
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

-- Add RLS policy so treasury view data is accessible publicly for transparency
CREATE POLICY "Anyone can view completed transactions for treasury"
ON public.ledger_transactions FOR SELECT TO authenticated
USING (status = 'completed');
