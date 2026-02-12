import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export interface WalletBalance {
  asset: string;
  available: number;
  locked: number;
}

export interface LedgerTransaction {
  id: string;
  tx_type: string;
  status: string;
  asset: string;
  amount: number;
  from_user_id: string | null;
  to_user_id: string | null;
  module: string | null;
  order_id: string | null;
  memo: string | null;
  trace_id: string;
  created_at: string;
}

export function useWalletLedger() {
  const { user } = useAuth();
  const [balances, setBalances] = useState<WalletBalance[]>([]);
  const [transactions, setTransactions] = useState<LedgerTransaction[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchBalances = useCallback(async () => {
    if (!user) return;
    const res = await supabase.functions.invoke('wallet-operations', {
      method: 'GET',
    });
    if (res.data?.balances) setBalances(res.data.balances);
  }, [user]);

  const fetchTransactions = useCallback(async (cursor?: string) => {
    if (!user) return;
    const params = new URLSearchParams({ action: 'transactions' });
    if (cursor) params.set('cursor', cursor);

    const res = await supabase.functions.invoke(`wallet-operations?${params}`, {
      method: 'GET',
    });
    if (res.data?.transactions) {
      setTransactions((prev) =>
        cursor ? [...prev, ...res.data.transactions] : res.data.transactions
      );
    }
    return res.data?.cursor;
  }, [user]);

  const transfer = useCallback(async (
    params: { to_username?: string; to_user_id?: string; asset?: string; amount: number; memo?: string }
  ) => {
    const res = await supabase.functions.invoke('wallet-operations', {
      body: { action: 'transfer', ...params },
      headers: { 'Idempotency-Key': crypto.randomUUID() },
    });
    if (res.error) throw res.error;
    await fetchBalances();
    await fetchTransactions();
    return res.data;
  }, [fetchBalances, fetchTransactions]);

  const pay = useCallback(async (
    params: { module: string; order_id: string; asset?: string; amount: number }
  ) => {
    const res = await supabase.functions.invoke('wallet-operations', {
      body: { action: 'pay', ...params },
      headers: { 'Idempotency-Key': crypto.randomUUID() },
    });
    if (res.error) throw res.error;
    await fetchBalances();
    return res.data;
  }, [fetchBalances]);

  useEffect(() => {
    if (user) {
      setLoading(true);
      Promise.all([fetchBalances(), fetchTransactions()]).finally(() => setLoading(false));
    }
  }, [user, fetchBalances, fetchTransactions]);

  return { balances, transactions, loading, fetchBalances, fetchTransactions, transfer, pay };
}
