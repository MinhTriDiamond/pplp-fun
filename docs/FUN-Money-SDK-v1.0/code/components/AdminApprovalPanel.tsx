/**
 * FUN Money Admin Approval Panel
 * SDK v1.0 - Copy this file to src/components/fun-money/AdminApprovalPanel.tsx
 * 
 * Requires: Admin wallet with Attester role
 */

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CheckCircle2, XCircle, Clock, Loader2, ExternalLink, RefreshCw } from 'lucide-react';
import { useWallet } from '@/hooks/useWallet';
import { useAdminMintRequest, type MintRequest } from '@/hooks/useMintRequest';
import { mintFunMoney } from '@/lib/fun-money/contract-helpers';
import { BSC_TESTNET_CONFIG } from '@/lib/fun-money/web3-config';
import { toast } from 'sonner';

export function AdminApprovalPanel() {
  const { signer, isConnected, isCorrectChain, address } = useWallet();
  const { getPendingRequests, getAllRequests, saveMintResult, updateStatus, loading } = useAdminMintRequest();
  
  const [requests, setRequests] = useState<MintRequest[]>([]);
  const [activeTab, setActiveTab] = useState('pending');
  const [processing, setProcessing] = useState<string | null>(null);

  const fetchRequests = async () => {
    const data = activeTab === 'pending' 
      ? await getPendingRequests()
      : await getAllRequests(activeTab === 'approved' ? 'minted' : 'rejected');
    setRequests(data);
  };

  useEffect(() => { fetchRequests(); }, [activeTab]);

  const handleApprove = async (request: MintRequest) => {
    if (!signer || !isConnected || !isCorrectChain || !address) {
      toast.error('Please connect Attester wallet on BSC Testnet');
      return;
    }

    setProcessing(request.id);
    try {
      const txHash = await mintFunMoney(
        signer,
        request.user_wallet_address,
        request.action_type,
        BigInt(request.calculated_amount_atomic),
        request.action_evidence
      );

      await saveMintResult(request.id, txHash, address);
      toast.success('Mint successful!', { description: `TX: ${txHash.slice(0, 10)}...` });
      fetchRequests();
    } catch (err: any) {
      console.error('Mint error:', err);
      toast.error(err.code === 4001 ? 'Transaction rejected' : 'Mint failed');
    } finally {
      setProcessing(null);
    }
  };

  const handleReject = async (id: string, reason: string) => {
    await updateStatus(id, 'rejected', reason);
    toast.success('Request rejected');
    fetchRequests();
  };

  if (!isConnected) {
    return <Card><CardContent className="py-8 text-center">Connect Attester wallet to approve requests</CardContent></Card>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex justify-between">
          <span>Mint Approval</span>
          <Button variant="outline" size="sm" onClick={fetchRequests}><RefreshCw className="w-4 h-4" /></Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="pending"><Clock className="w-4 h-4 mr-1" />Pending</TabsTrigger>
            <TabsTrigger value="approved"><CheckCircle2 className="w-4 h-4 mr-1" />Approved</TabsTrigger>
            <TabsTrigger value="rejected"><XCircle className="w-4 h-4 mr-1" />Rejected</TabsTrigger>
          </TabsList>
          
          <TabsContent value={activeTab} className="mt-4 space-y-4">
            {loading ? (
              <div className="flex justify-center py-8"><Loader2 className="w-6 h-6 animate-spin" /></div>
            ) : requests.length === 0 ? (
              <p className="text-center py-8 text-muted-foreground">No {activeTab} requests</p>
            ) : (
              requests.map(req => (
                <Card key={req.id} className="border">
                  <CardContent className="p-4">
                    <div className="flex justify-between mb-2">
                      <div className="flex gap-2">
                        <Badge variant="outline">{req.action_type}</Badge>
                        <Badge variant="secondary">{req.platform_id}</Badge>
                      </div>
                      <span className="text-sm text-muted-foreground">{new Date(req.created_at).toLocaleString()}</span>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2 text-sm mb-3">
                      <div>User: <span className="font-mono">{req.user_wallet_address.slice(0, 10)}...</span></div>
                      <div>Amount: <span className="font-bold">{req.calculated_amount_formatted}</span></div>
                      <div>Light: {req.light_score}</div>
                      <div>Unity: {req.unity_score}</div>
                    </div>
                    
                    {req.action_evidence?.description && (
                      <p className="text-sm p-2 bg-muted rounded mb-3">{req.action_evidence.description}</p>
                    )}
                    
                    {activeTab === 'pending' && (
                      <div className="flex gap-2">
                        <Button onClick={() => handleApprove(req)} disabled={processing === req.id} className="flex-1">
                          {processing === req.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4 mr-1" />}
                          Approve & Sign
                        </Button>
                        <Button variant="outline" onClick={() => handleReject(req.id, 'Manual rejection')}>
                          <XCircle className="w-4 h-4" />
                        </Button>
                      </div>
                    )}
                    
                    {req.tx_hash && (
                      <a href={`${BSC_TESTNET_CONFIG.explorerTxUrl(req.tx_hash)}`} target="_blank" rel="noopener noreferrer" className="text-sm text-primary flex items-center gap-1">
                        View TX <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
