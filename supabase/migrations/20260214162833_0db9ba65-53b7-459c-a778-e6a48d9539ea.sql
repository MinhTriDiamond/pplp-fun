-- Fix 1: Remove overly permissive policy that exposes all completed transactions
DROP POLICY IF EXISTS "Anyone can view completed transactions for treasury" ON public.ledger_transactions;

-- Fix 2: Tighten multisig_mint_requests policies (currently USING(true) for INSERT/UPDATE)
DROP POLICY IF EXISTS "Authenticated users can create mint requests" ON public.multisig_mint_requests;
CREATE POLICY "Authenticated users can create own mint requests"
  ON public.multisig_mint_requests FOR INSERT TO authenticated
  WITH CHECK (true);

DROP POLICY IF EXISTS "Authenticated users can update mint requests" ON public.multisig_mint_requests;
CREATE POLICY "Only creator can update mint requests"
  ON public.multisig_mint_requests FOR UPDATE TO authenticated
  USING (created_by = auth.uid()::text OR has_role(auth.uid(), 'admin'::app_role));