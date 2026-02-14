import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { getGroupForAddress, getSignedGroups, validateGroupCoverage } from '@/config/gov-groups';

export interface MintRequest {
  id: string;
  created_by: string;
  recipient: string;
  action_type: string;
  action_hash: string;
  amount_atomic: string;
  evidence_hash: string;
  nonce: string;
  platform_id: string | null;
  threshold: number;
  status: string;
  tx_hash: string | null;
  scoring_metadata: any;
  chain_id: number | null;
  contract_address: string | null;
  created_at: string;
  expires_at: string;
}

export interface MintSignature {
  id: string;
  request_id: string;
  signer_address: string;
  signature: string;
  signed_at: string;
}

export interface CreateMintRequestInput {
  created_by: string;
  recipient: string;
  action_type: string;
  action_hash: string;
  amount_atomic: string;
  evidence_hash: string;
  nonce: string;
  platform_id?: string;
  threshold: number;
  scoring_metadata?: any;
  contract_address?: string;
}

export function useMintRequests() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const createRequest = useCallback(async (input: CreateMintRequestInput): Promise<MintRequest | null> => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('multisig_mint_requests')
        .insert({
          created_by: input.created_by,
          recipient: input.recipient,
          action_type: input.action_type,
          action_hash: input.action_hash,
          amount_atomic: input.amount_atomic,
          evidence_hash: input.evidence_hash,
          nonce: input.nonce,
          platform_id: input.platform_id || null,
          threshold: input.threshold,
          scoring_metadata: input.scoring_metadata || null,
          contract_address: input.contract_address || null,
        })
        .select()
        .single();

      if (error) throw error;
      return data as MintRequest;
    } catch (err: any) {
      toast({ title: 'Lỗi tạo request', description: err.message, variant: 'destructive' });
      return null;
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const getRequest = useCallback(async (requestId: string): Promise<MintRequest | null> => {
    const { data, error } = await supabase
      .from('multisig_mint_requests')
      .select('*')
      .eq('id', requestId)
      .maybeSingle();

    if (error) {
      toast({ title: 'Lỗi', description: error.message, variant: 'destructive' });
      return null;
    }
    return data as MintRequest | null;
  }, [toast]);

  const getSignatures = useCallback(async (requestId: string): Promise<MintSignature[]> => {
    const { data, error } = await supabase
      .from('multisig_mint_signatures')
      .select('*')
      .eq('request_id', requestId)
      .order('signed_at', { ascending: true });

    if (error) return [];
    return (data || []) as MintSignature[];
  }, []);

  const addSignature = useCallback(async (
    requestId: string,
    signerAddress: string,
    signature: string
  ): Promise<boolean> => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from('multisig_mint_signatures')
        .insert({
          request_id: requestId,
          signer_address: signerAddress.toLowerCase(),
          signature,
        });

      if (error) {
        if (error.code === '23505') {
          toast({ title: 'Đã ký', description: 'Ví này đã ký request này rồi', variant: 'destructive' });
        } else {
          throw error;
        }
        return false;
      }

      // Check group coverage for GOV-Community model
      const sigs = await getSignatures(requestId);
      const allSigners = sigs.map((s) => s.signer_address);
      const request = await getRequest(requestId);

      if (request && validateGroupCoverage(allSigners)) {
        await supabase
          .from('multisig_mint_requests')
          .update({ status: 'ready' })
          .eq('id', requestId);
      }

      return true;
    } catch (err: any) {
      toast({ title: 'Lỗi ký', description: err.message, variant: 'destructive' });
      return false;
    } finally {
      setLoading(false);
    }
  }, [toast, getSignatures, getRequest]);

  const updateRequestStatus = useCallback(async (
    requestId: string,
    status: string,
    txHash?: string
  ) => {
    const update: any = { status };
    if (txHash) update.tx_hash = txHash;

    await supabase
      .from('multisig_mint_requests')
      .update(update)
      .eq('id', requestId);
  }, []);

  const getPendingRequests = useCallback(async (): Promise<MintRequest[]> => {
    const { data, error } = await supabase
      .from('multisig_mint_requests')
      .select('*')
      .in('status', ['pending', 'ready'])
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) return [];
    return (data || []) as MintRequest[];
  }, []);

  return {
    loading,
    createRequest,
    getRequest,
    getSignatures,
    addSignature,
    updateRequestStatus,
    getPendingRequests,
  };
}

/**
 * Hook to subscribe to realtime signature updates for a specific request
 */
export function useRealtimeSignatures(requestId: string | null) {
  const [signatures, setSignatures] = useState<MintSignature[]>([]);

  useEffect(() => {
    if (!requestId) {
      setSignatures([]);
      return;
    }

    // Initial fetch
    supabase
      .from('multisig_mint_signatures')
      .select('*')
      .eq('request_id', requestId)
      .order('signed_at', { ascending: true })
      .then(({ data }) => {
        if (data) setSignatures(data as MintSignature[]);
      });

    // Realtime subscription
    const channel = supabase
      .channel(`mint-sigs-${requestId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'multisig_mint_signatures',
          filter: `request_id=eq.${requestId}`,
        },
        (payload) => {
          setSignatures((prev) => [...prev, payload.new as MintSignature]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [requestId]);

  return signatures;
}
