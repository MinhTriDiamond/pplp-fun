import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Search, RefreshCw, CheckCircle2, ExternalLink, Loader2, Pen, Send, XCircle } from 'lucide-react';
import { useWallet } from '@/hooks/useWallet';
import { useAuth } from '@/hooks/useAuth';
import { useMintRequests, useRealtimeSignatures, type MintRequest } from '@/hooks/useMintRequests';
import { signPPLP, type PPLPData } from '@/lib/eip712';
import { getFunMoneyAddress, getFunMoneyContractWithSigner, FUN_MONEY_ABI, BSC_TESTNET_CONFIG } from '@/lib/web3';
import { Contract } from 'ethers';
import { useToast } from '@/hooks/use-toast';
import { GOV_GROUPS, getGroupForAddress, getMemberName, validateGroupCoverage, getSignedGroups } from '@/config/gov-groups';

interface MintRequestsTabProps {
  /** If provided, auto-loads this request on mount */
  initialRequestId?: string;
}

export function MintRequestsTab({ initialRequestId }: MintRequestsTabProps) {
  const { toast } = useToast();
  const { address, provider, signer, isConnected } = useWallet();
  const { isAuthenticated } = useAuth();
  const { getRequest, getSignatures, addSignature, updateRequestStatus, getPendingRequests } = useMintRequests();

  const [requestIdInput, setRequestIdInput] = useState('');
  const [currentRequest, setCurrentRequest] = useState<MintRequest | null>(null);
  const [pendingRequests, setPendingRequests] = useState<MintRequest[]>([]);
  const [signing, setSigning] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [txHash, setTxHash] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const sigs = useRealtimeSignatures(currentRequest?.id || null);
  const sigCount = sigs.length;
  const signedGroups = getSignedGroups(sigs.map((s) => s.signer_address));
  const isReady = validateGroupCoverage(sigs.map((s) => s.signer_address));

  const loadPending = () => {
    getPendingRequests().then(setPendingRequests);
  };

  useEffect(() => {
    loadPending();
    if (initialRequestId) {
      handleLoadRequest(initialRequestId);
    }
  }, []);

  const handleLoadRequest = async (id: string) => {
    const req = await getRequest(id.trim());
    if (!req) {
      toast({ title: 'Không tìm thấy', description: 'Request ID không tồn tại', variant: 'destructive' });
      return;
    }
    setCurrentRequest(req);
    setTxHash(null);
    setError(null);
  };

  const handleSign = async () => {
    if (!currentRequest || !provider || !signer || !address) return;
    setSigning(true);
    setError(null);

    try {
      const contract = new Contract(
        currentRequest.contract_address || getFunMoneyAddress(),
        FUN_MONEY_ABI,
        provider
      );
      const isAttester = await contract.isAttester(address);
      if (!isAttester) throw new Error('Ví của bạn không phải là Attester');

      const existing = await getSignatures(currentRequest.id);
      if (existing.some((s) => s.signer_address.toLowerCase() === address?.toLowerCase())) {
        throw new Error('Ví này đã ký request này rồi');
      }

      // GOV-Community: check group hasn't signed yet
      const myGroup = getGroupForAddress(address);
      if (!myGroup) {
        throw new Error('Ví của bạn không thuộc nhóm GOV nào (Will / Wisdom / Love)');
      }
      const existingGroups = getSignedGroups(existing.map((s) => s.signer_address));
      if (existingGroups.has(myGroup.id)) {
        throw new Error(`Nhóm ${myGroup.name} (${myGroup.nameVi}) đã có người ký rồi`);
      }

      const pplpData: PPLPData = {
        user: currentRequest.recipient,
        actionHash: currentRequest.action_hash,
        amount: BigInt(currentRequest.amount_atomic),
        evidenceHash: currentRequest.evidence_hash,
        nonce: BigInt(currentRequest.nonce),
      };

      const signature = await signPPLP(signer, pplpData);
      const success = await addSignature(currentRequest.id, address, signature);
      if (success) {
        toast({ title: '✅ Đã ký thành công' });
      }
    } catch (err: any) {
      setError(err.message);
      if (err.code !== 4001) {
        toast({ title: 'Lỗi ký', description: err.message, variant: 'destructive' });
      }
    } finally {
      setSigning(false);
    }
  };

  const handleSubmit = async () => {
    if (!currentRequest || !provider || !isReady) return;
    setSubmitting(true);
    setError(null);

    try {
      const signatures = sigs.map((s) => s.signature);
      await updateRequestStatus(currentRequest.id, 'submitted');
      const signerContract = await getFunMoneyContractWithSigner(provider);

      const tx = await signerContract.lockWithPPLP(
        currentRequest.recipient,
        currentRequest.action_type,
        currentRequest.amount_atomic,
        currentRequest.evidence_hash,
        signatures
      );

      const receipt = await tx.wait();
      setTxHash(receipt.hash);
      await updateRequestStatus(currentRequest.id, 'confirmed', receipt.hash);
      toast({ title: '🎉 Mint thành công!' });
    } catch (err: any) {
      setError(err.message?.slice(0, 200));
      await updateRequestStatus(currentRequest.id, 'pending');
      toast({ title: 'Mint thất bại', description: err.message?.slice(0, 100), variant: 'destructive' });
    } finally {
      setSubmitting(false);
    }
  };

  const alreadySigned = sigs.some(
    (s) => s.signer_address.toLowerCase() === address?.toLowerCase()
  );
  const myGroup = address ? getGroupForAddress(address) : undefined;
  const myGroupAlreadySigned = myGroup ? signedGroups.has(myGroup.id) : false;

  const handleBack = () => {
    setCurrentRequest(null);
    setTxHash(null);
    setError(null);
    loadPending();
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Search */}
      <div className="flex gap-2">
        <Input
          placeholder="Nhập Request ID..."
          value={requestIdInput}
          onChange={(e) => setRequestIdInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleLoadRequest(requestIdInput)}
        />
        <Button onClick={() => handleLoadRequest(requestIdInput)} disabled={!requestIdInput.trim()}>
          <Search className="h-4 w-4" />
        </Button>
      </div>

      {/* Current request detail */}
      {currentRequest && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center justify-between">
              <span>Request: {currentRequest.id.slice(0, 8)}...</span>
              <div className="flex items-center gap-2">
                <Badge variant={currentRequest.status === 'confirmed' ? 'default' : 'secondary'}>
                  {currentRequest.status}
                </Badge>
                <Button variant="ghost" size="sm" onClick={handleBack}>← Danh sách</Button>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-2 text-sm">
              <span className="text-muted-foreground">Action:</span>
              <span>{currentRequest.action_type}</span>
              <span className="text-muted-foreground">Số lượng:</span>
              <span className="font-mono font-bold">
                {(Number(currentRequest.amount_atomic) / 1e18).toFixed(2)} FUN
              </span>
              <span className="text-muted-foreground">Recipient:</span>
              <span className="font-mono text-xs">{currentRequest.recipient.slice(0, 14)}...</span>
              <span className="text-muted-foreground">Hết hạn:</span>
              <span className="text-xs">{new Date(currentRequest.expires_at).toLocaleString('vi-VN')}</span>
            </div>

            {/* GOV-Community Signatures by Group */}
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span>Chữ ký GOV-Community</span>
                <span className="font-bold">{signedGroups.size}/3 nhóm</span>
              </div>
              <Progress value={(signedGroups.size / 3) * 100} />

              {GOV_GROUPS.map((group) => {
                const GroupIcon = group.icon;
                const groupSigner = sigs.find((s) => {
                  const g = getGroupForAddress(s.signer_address);
                  return g?.id === group.id;
                });
                const isSigned = !!groupSigner;

                return (
                  <div key={group.id} className={`rounded-lg border p-3 space-y-2 ${isSigned ? 'border-green-300 bg-green-50' : 'border-border'}`}>
                    <div className="flex items-center gap-2 text-sm font-medium">
                      <GroupIcon className={`h-4 w-4 ${isSigned ? 'text-green-600' : 'text-muted-foreground'}`} />
                      <span>{group.name}</span>
                      <span className="text-muted-foreground">({group.nameVi})</span>
                      {isSigned && <CheckCircle2 className="h-4 w-4 text-green-600 ml-auto" />}
                    </div>
                    <div className="grid gap-1">
                      {group.members.map((member) => {
                        const memberSigned = groupSigner && groupSigner.signer_address.toLowerCase() === member.address.toLowerCase();
                        return (
                          <div key={member.address} className={`flex items-center gap-2 text-xs px-2 py-1 rounded ${memberSigned ? 'bg-green-100 text-green-800 font-medium' : 'text-muted-foreground'}`}>
                            {memberSigned ? (
                              <CheckCircle2 className="h-3 w-3 text-green-600" />
                            ) : (
                              <div className="h-3 w-3 rounded-full border border-muted-foreground/30" />
                            )}
                            <span>{member.name}</span>
                            <span className="font-mono ml-auto">{member.address.slice(0, 8)}...</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Actions */}
            {txHash ? (
              <a
                href={BSC_TESTNET_CONFIG.explorerTxUrl(txHash)}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-1 text-sm text-primary hover:underline"
              >
                Xem trên BSCScan <ExternalLink className="h-3 w-3" />
              </a>
            ) : isReady ? (
              <Button
                onClick={handleSubmit}
                disabled={submitting || !isConnected}
                className="w-full gap-2 bg-gradient-to-r from-amber-400 via-yellow-500 to-orange-500 text-white font-bold"
              >
                {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                Gửi giao dịch lên Blockchain
              </Button>
            ) : !alreadySigned && !myGroupAlreadySigned ? (
              <Button onClick={handleSign} disabled={signing || !isConnected} className="w-full gap-2">
                {signing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Pen className="h-4 w-4" />}
                Ký với ví hiện tại {myGroup ? `(${myGroup.name})` : ''}
              </Button>
            ) : myGroupAlreadySigned && !alreadySigned ? (
              <p className="text-center text-sm text-muted-foreground">
                ⚠️ Nhóm {myGroup?.name} ({myGroup?.nameVi}) đã có người ký. Đợi nhóm khác...
              </p>
            ) : (
              <p className="text-center text-sm text-muted-foreground">
                ✅ Bạn đã ký. Đợi các nhóm khác...
              </p>
            )}

            {error && (
              <div className="flex items-start gap-2 p-3 rounded-md bg-destructive/10 text-destructive text-sm">
                <XCircle className="h-4 w-4 mt-0.5 shrink-0" />
                <p>{error}</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Pending requests list */}
      {!currentRequest && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold">Pending Requests</h2>
            <Button variant="ghost" size="sm" onClick={loadPending}>
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
          {pendingRequests.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">
              Chưa có request nào
            </p>
          ) : (
            pendingRequests.map((req) => (
              <Card
                key={req.id}
                className="cursor-pointer hover:border-primary/50 transition-colors"
                onClick={() => handleLoadRequest(req.id)}
              >
                <CardContent className="py-3 flex items-center justify-between text-sm">
                  <div>
                    <span className="font-mono text-xs">{req.id.slice(0, 8)}...</span>
                    <span className="ml-2">{req.action_type}</span>
                    <span className="ml-2 text-muted-foreground">
                      {(Number(req.amount_atomic) / 1e18).toFixed(2)} FUN
                    </span>
                  </div>
                  <Badge variant={req.status === 'ready' ? 'default' : 'secondary'}>
                    {req.status}
                  </Badge>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      )}
    </div>
  );
}
