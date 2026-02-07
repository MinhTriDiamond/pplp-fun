import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export interface MintRecord {
  id: string;
  tx_hash: string;
  chain_id: number;
  contract_address: string;
  recipient_address: string;
  action_type: string;
  platform_id: string;
  amount_atomic: string;
  amount_formatted: string;
  light_score: number | null;
  unity_score: number | null;
  integrity_k: number | null;
  evidence_hash: string | null;
  multiplier_q: number | null;
  multiplier_i: number | null;
  multiplier_k: number | null;
  multiplier_ux: number | null;
  minted_at: string;
  block_number: number | null;
  status: string;
}

export interface SaveMintData {
  txHash: string;
  chainId?: number;
  contractAddress: string;
  recipientAddress: string;
  actionType: string;
  platformId: string;
  amountAtomic: string;
  amountFormatted: string;
  lightScore?: number;
  unityScore?: number;
  integrityK?: number;
  evidenceHash?: string;
  multiplierQ?: number;
  multiplierI?: number;
  multiplierK?: number;
  multiplierUx?: number;
  blockNumber?: number;
}

export function useMintHistory() {
  const { user } = useAuth();
  const [history, setHistory] = useState<MintRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchHistory = useCallback(async () => {
    if (!user) return;

    setLoading(true);
    setError(null);

    try {
      const { data, error: fetchError } = await supabase
        .from('mint_history')
        .select('*')
        .eq('user_id', user.id)
        .order('minted_at', { ascending: false });

      if (fetchError) {
        throw fetchError;
      }

      setHistory(data || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [user]);

  const saveMint = useCallback(async (data: SaveMintData): Promise<boolean> => {
    if (!user) {
      setError('User not authenticated');
      return false;
    }

    try {
      const { error: insertError } = await supabase
        .from('mint_history')
        .insert({
          user_id: user.id,
          tx_hash: data.txHash,
          chain_id: data.chainId ?? 97,
          contract_address: data.contractAddress,
          recipient_address: data.recipientAddress,
          action_type: data.actionType,
          platform_id: data.platformId,
          amount_atomic: data.amountAtomic,
          amount_formatted: data.amountFormatted,
          light_score: data.lightScore,
          unity_score: data.unityScore,
          integrity_k: data.integrityK,
          evidence_hash: data.evidenceHash,
          multiplier_q: data.multiplierQ,
          multiplier_i: data.multiplierI,
          multiplier_k: data.multiplierK,
          multiplier_ux: data.multiplierUx,
          block_number: data.blockNumber,
          status: 'confirmed',
        });

      if (insertError) {
        throw insertError;
      }

      // Refresh history after saving
      await fetchHistory();
      return true;
    } catch (err: any) {
      setError(err.message);
      return false;
    }
  }, [user, fetchHistory]);

  return {
    history,
    loading,
    error,
    saveMint,
    fetchHistory,
  };
}
