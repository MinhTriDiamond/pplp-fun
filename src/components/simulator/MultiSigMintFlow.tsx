import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  CheckCircle2,
  Copy,
  ExternalLink,
  Loader2,
  Pen,
  Plus,
  Search,
  Send,
  Shield,
  XCircle,
} from 'lucide-react';
import { useWallet } from '@/hooks/useWallet';
import { useAuth } from '@/hooks/useAuth';
import { GOV_GROUPS, getGroupForAddress, getMemberName, validateGroupCoverage, getSignedGroups } from '@/config/gov-groups';
import {
  useMintRequests,
  useRealtimeSignatures,
  type MintRequest,
  type CreateMintRequestInput,
} from '@/hooks/useMintRequests';
import {
  getFunMoneyAddress,
  getFunMoneyContractWithSigner,
  getNonce,
  createActionHash,
  createEvidenceHash,
  BSC_TESTNET_CONFIG,
  FUN_MONEY_ABI,
} from '@/lib/web3';
import { signPPLP, type PPLPData } from '@/lib/eip712';
import { Contract } from 'ethers';
import { useToast } from '@/hooks/use-toast';
import type { ScoringResult } from '@/types/pplp.types';

interface MultiSigMintFlowProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  result: ScoringResult | null;
  actionType: string | null;
  platformId: string | null;
  recipient?: string;
  lightScore?: number;
  unityScore?: number;
  threshold: number;
}

export function MultiSigMintFlow({
  open,
  onOpenChange,
  result,
  actionType,
  platformId,
  recipient,
  lightScore,
  unityScore,
  threshold,
}: MultiSigMintFlowProps) {
  const { toast } = useToast();
  const { address, provider, signer, isConnected } = useWallet();
  const { isAuthenticated } = useAuth();
  const {
    loading,
    createRequest,
    getRequest,
    getSignatures,
    addSignature,
    updateRequestStatus,
    getPendingRequests,
  } = useMintRequests();

  const [activeTab, setActiveTab] = useState('create');
  const [currentRequest, setCurrentRequest] = useState<MintRequest | null>(null);
  const [requestIdInput, setRequestIdInput] = useState('');
  const [pendingRequests, setPendingRequests] = useState<MintRequest[]>([]);
  const [signing, setSigning] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [txHash, setTxHash] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Realtime signatures
  const realtimeSigs = useRealtimeSignatures(currentRequest?.id || null);
  const sigCount = realtimeSigs.length;
  const signedGroups = getSignedGroups(realtimeSigs.map((s) => s.signer_address));
  const isReady = validateGroupCoverage(realtimeSigs.map((s) => s.signer_address));

  // Load pending requests on tab switch
  useEffect(() => {
    if (activeTab === 'sign' && open) {
      getPendingRequests().then(setPendingRequests);
    }
  }, [activeTab, open, getPendingRequests]);

  // Auto-switch to submit tab when ready
  useEffect(() => {
    if (isReady && currentRequest?.status !== 'submitted' && currentRequest?.status !== 'confirmed') {
      setActiveTab('submit');
    }
  }, [isReady, currentRequest?.status]);

  const handleCreateRequest = async () => {
    if (!result || !actionType || !provider || !signer || !address) return;

    setSigning(true);
    setError(null);

    try {
      const mintRecipient = recipient && recipient.length === 42 ? recipient : address;
      const contractAddress = getFunMoneyAddress();

      // Verify attester status
      const contract = new Contract(contractAddress, FUN_MONEY_ABI, provider);
      const isAttester = await contract.isAttester(address);
      if (!isAttester) {
        throw new Error('Ví của bạn không phải là Attester');
      }

      // Get nonce for recipient
      const nonce = await getNonce(provider, mintRecipient);
      const actionHash = createActionHash(actionType);
      const amount = result.calculatedAmountAtomic;

      const evidenceHash = createEvidenceHash({
        actionType,
        timestamp: Math.floor(Date.now() / 1000),
        pillars: { S: 80, T: 75, H: 70, C: 85, U: 90 },
        metadata: { lightScore: lightScore || 0, unityScore: unityScore || 0 },
      });

      // Create request in DB
      const input: CreateMintRequestInput = {
        created_by: address.toLowerCase(),
        recipient: mintRecipient.toLowerCase(),
        action_type: actionType,
        action_hash: actionHash,
        amount_atomic: amount.toString(),
        evidence_hash: evidenceHash,
        nonce: nonce.toString(),
        platform_id: platformId || undefined,
        threshold,
        contract_address: contractAddress,
        scoring_metadata: {
          lightScore,
          unityScore,
          multipliers: result.multipliers,
          decision: result.decision,
        },
      };

      const req = await createRequest(input);
      if (!req) throw new Error('Không thể tạo request');

      // Auto-sign with current wallet (Attester 1)
      const pplpData: PPLPData = {
        user: mintRecipient,
        actionHash,
        amount: BigInt(amount),
        evidenceHash,
        nonce,
      };

      const signature = await signPPLP(signer, pplpData);
      await addSignature(req.id, address, signature);

      setCurrentRequest(req);
      toast({
        title: '✅ Request đã tạo',
        description: `ID: ${req.id.slice(0, 8)}... — Đã ký 1/${threshold}`,
      });
    } catch (err: any) {
      setError(err.message || 'Lỗi tạo request');
      if (err.code !== 4001 && err.code !== 'ACTION_REJECTED') {
        toast({ title: 'Lỗi', description: err.message, variant: 'destructive' });
      }
    } finally {
      setSigning(false);
    }
  };

  const handleLoadRequest = async (id: string) => {
    const req = await getRequest(id);
    if (!req) {
      toast({ title: 'Không tìm thấy', description: 'Request ID không tồn tại', variant: 'destructive' });
      return;
    }
    setCurrentRequest(req);
    setActiveTab('sign');
  };

  const handleSign = async () => {
    if (!currentRequest || !provider || !signer || !address) return;

    setSigning(true);
    setError(null);

    try {
      // Verify attester
      const contract = new Contract(
        currentRequest.contract_address || getFunMoneyAddress(),
        FUN_MONEY_ABI,
        provider
      );
      const isAttester = await contract.isAttester(address);
      if (!isAttester) {
        throw new Error('Ví của bạn không phải là Attester');
      }

      // Check not already signed
      const existingSigs = await getSignatures(currentRequest.id);
      const alreadySigned = existingSigs.some(
        (s) => s.signer_address.toLowerCase() === address.toLowerCase()
      );
      if (alreadySigned) {
        throw new Error('Ví này đã ký request này rồi');
      }

      // GOV-Community: check group hasn't signed yet
      const myGroup = getGroupForAddress(address);
      if (!myGroup) {
        throw new Error('Ví của bạn không thuộc nhóm GOV nào (Will / Wisdom / Love)');
      }
      const existingGroups = getSignedGroups(existingSigs.map((s) => s.signer_address));
      if (existingGroups.has(myGroup.id)) {
        throw new Error(`Nhóm ${myGroup.name} (${myGroup.nameVi}) đã có người ký rồi`);
      }

      // Sign with same data
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
        toast({ title: '✅ Đã ký thành công', description: `${sigCount + 1}/${currentRequest.threshold} chữ ký` });
      }
    } catch (err: any) {
      setError(err.message || 'Lỗi ký');
      if (err.code !== 4001 && err.code !== 'ACTION_REJECTED') {
        toast({ title: 'Lỗi ký', description: err.message, variant: 'destructive' });
      }
    } finally {
      setSigning(false);
    }
  };

  const handleSubmitTx = async () => {
    if (!currentRequest || !provider || !isReady) return;

    setSubmitting(true);
    setError(null);

    try {
      const sigs = realtimeSigs.map((s) => s.signature);
      const signerContract = await getFunMoneyContractWithSigner(provider);

      await updateRequestStatus(currentRequest.id, 'submitted');

      const tx = await signerContract.lockWithPPLP(
        currentRequest.recipient,
        currentRequest.action_type,
        currentRequest.amount_atomic,
        currentRequest.evidence_hash,
        sigs
      );

      const receipt = await tx.wait();
      setTxHash(receipt.hash);
      await updateRequestStatus(currentRequest.id, 'confirmed', receipt.hash);

      toast({
        title: '🎉 Mint thành công!',
        description: `${(Number(currentRequest.amount_atomic) / 1e18).toFixed(2)} FUN đã được mint`,
      });
    } catch (err: any) {
      setError(err.message?.slice(0, 200) || 'Lỗi gửi giao dịch');
      await updateRequestStatus(currentRequest.id, 'pending');
      toast({ title: 'Mint thất bại', description: err.message?.slice(0, 100), variant: 'destructive' });
    } finally {
      setSubmitting(false);
    }
  };

  const copyRequestId = () => {
    if (currentRequest) {
      navigator.clipboard.writeText(currentRequest.id);
      toast({ title: 'Đã copy Request ID' });
    }
  };

  const formatAmount = (atomic: string) => (Number(atomic) / 1e18).toFixed(2);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            Multi-Sig GOV-Community
          </DialogTitle>
          <DialogDescription>
            Yêu cầu: 1 WILL + 1 WISDOM + 1 LOVE = 3 chữ ký từ 3 nhóm
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="create" className="gap-1">
              <Plus className="h-3 w-3" /> Tạo
            </TabsTrigger>
            <TabsTrigger value="sign" className="gap-1">
              <Pen className="h-3 w-3" /> Ký
            </TabsTrigger>
            <TabsTrigger value="submit" className="gap-1" disabled={!isReady && !txHash}>
              <Send className="h-3 w-3" /> Gửi
            </TabsTrigger>
          </TabsList>

          {/* TAB 1: Create Request */}
          <TabsContent value="create" className="space-y-4">
            {!currentRequest ? (
              <>
                {result && actionType && (
                  <Card>
                    <CardContent className="pt-4 space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Action:</span>
                        <Badge variant="outline">{actionType}</Badge>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Số lượng:</span>
                        <span className="font-mono font-bold">
                          {formatAmount(result.calculatedAmountAtomic.toString())} FUN
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Recipient:</span>
                        <span className="font-mono text-xs">
                          {(recipient || address || '').slice(0, 10)}...
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Threshold:</span>
                        <span>{threshold} chữ ký</span>
                      </div>
                    </CardContent>
                  </Card>
                )}

                <Button
                  onClick={handleCreateRequest}
                  disabled={!result || !actionType || !isConnected || !isAuthenticated || signing}
                  className="w-full gap-2"
                >
                  {signing ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Plus className="h-4 w-4" />
                  )}
                  Tạo Mint Request & Ký
                </Button>
              </>
            ) : (
              <RequestCreated
                request={currentRequest}
                sigCount={sigCount}
                onCopy={copyRequestId}
              />
            )}
          </TabsContent>

          {/* TAB 2: Sign Request */}
          <TabsContent value="sign" className="space-y-4">
            {!currentRequest ? (
              <>
                <div className="flex gap-2">
                  <Input
                    placeholder="Nhập Request ID..."
                    value={requestIdInput}
                    onChange={(e) => setRequestIdInput(e.target.value)}
                  />
                  <Button
                    onClick={() => handleLoadRequest(requestIdInput.trim())}
                    disabled={!requestIdInput.trim()}
                    size="icon"
                  >
                    <Search className="h-4 w-4" />
                  </Button>
                </div>

                {pendingRequests.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-muted-foreground">
                      Pending Requests:
                    </p>
                    {pendingRequests.map((req) => (
                      <Card
                        key={req.id}
                        className="cursor-pointer hover:border-primary/50 transition-colors"
                        onClick={() => handleLoadRequest(req.id)}
                      >
                        <CardContent className="py-3 flex items-center justify-between text-sm">
                          <div>
                            <span className="font-mono text-xs">{req.id.slice(0, 8)}...</span>
                            <span className="ml-2 text-muted-foreground">{req.action_type}</span>
                          </div>
                          <Badge variant={req.status === 'ready' ? 'default' : 'secondary'}>
                            {req.status}
                          </Badge>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </>
            ) : (
              <SigningPanel
                request={currentRequest}
                signatures={realtimeSigs}
                address={address}
                signing={signing}
                onSign={handleSign}
              />
            )}
          </TabsContent>

          {/* TAB 3: Submit Transaction */}
          <TabsContent value="submit" className="space-y-4">
            {txHash ? (
              <div className="flex flex-col items-center gap-4 py-6">
                <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
                  <CheckCircle2 className="h-8 w-8 text-green-600" />
                </div>
                <p className="text-lg font-bold text-green-600">Mint thành công!</p>
                <a
                  href={BSC_TESTNET_CONFIG.explorerTxUrl(txHash)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-sm text-primary hover:underline"
                >
                  Xem trên BSCScan <ExternalLink className="h-3 w-3" />
                </a>
              </div>
            ) : isReady && currentRequest ? (
              <div className="space-y-4">
                <Card>
                  <CardContent className="pt-4 space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Chữ ký:</span>
                      <Badge variant="default">
                        {sigCount}/{currentRequest.threshold} ✓
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Action:</span>
                      <span>{currentRequest.action_type}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Số lượng:</span>
                      <span className="font-mono font-bold">
                        {formatAmount(currentRequest.amount_atomic)} FUN
                      </span>
                    </div>
                  </CardContent>
                </Card>

                <Button
                  onClick={handleSubmitTx}
                  disabled={submitting || !isConnected}
                  className="w-full gap-2 bg-gradient-to-r from-amber-400 via-yellow-500 to-orange-500 hover:from-amber-500 hover:via-yellow-600 hover:to-orange-600 text-white font-bold"
                >
                  {submitting ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                  Gửi giao dịch lên Blockchain
                </Button>
              </div>
            ) : (
              <p className="text-center text-muted-foreground py-6">
                Cần đủ {currentRequest?.threshold || threshold} chữ ký trước khi gửi
              </p>
            )}
          </TabsContent>
        </Tabs>

        {error && (
          <div className="flex items-start gap-2 p-3 rounded-md bg-destructive/10 text-destructive text-sm">
            <XCircle className="h-4 w-4 mt-0.5 shrink-0" />
            <p>{error}</p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

// Sub-components

function RequestCreated({
  request,
  sigCount,
  onCopy,
}: {
  request: MintRequest;
  sigCount: number;
  onCopy: () => void;
}) {
  return (
    <div className="space-y-4">
      <div className="text-center">
        <CheckCircle2 className="h-12 w-12 text-green-500 mx-auto mb-2" />
        <p className="font-semibold">Request đã tạo!</p>
        <p className="text-sm text-muted-foreground">Chia sẻ Request ID cho các Attester khác</p>
      </div>

      <div className="flex items-center gap-2 p-3 bg-muted rounded-md">
        <code className="flex-1 text-xs font-mono break-all">{request.id}</code>
        <Button size="icon" variant="ghost" onClick={onCopy}>
          <Copy className="h-4 w-4" />
        </Button>
      </div>

      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span>Tiến trình chữ ký</span>
          <span className="font-bold">
            {sigCount}/{request.threshold}
          </span>
        </div>
        <Progress value={(sigCount / request.threshold) * 100} />
      </div>

      <Card>
        <CardContent className="pt-4 text-xs text-muted-foreground space-y-1">
          <p>📋 Action: {request.action_type}</p>
          <p>💰 Amount: {(Number(request.amount_atomic) / 1e18).toFixed(2)} FUN</p>
          <p>👤 Recipient: {request.recipient.slice(0, 10)}...</p>
          <p>⏰ Hết hạn: {new Date(request.expires_at).toLocaleString('vi-VN')}</p>
        </CardContent>
      </Card>
    </div>
  );
}

function SigningPanel({
  request,
  signatures,
  address,
  signing,
  onSign,
}: {
  request: MintRequest;
  signatures: { signer_address: string; signature: string; signed_at: string }[];
  address: string | null;
  signing: boolean;
  onSign: () => void;
}) {
  const alreadySigned = signatures.some(
    (s) => s.signer_address.toLowerCase() === address?.toLowerCase()
  );
  const signedGroupIds = getSignedGroups(signatures.map((s) => s.signer_address));
  const allGroupsCovered = validateGroupCoverage(signatures.map((s) => s.signer_address));
  const myGroup = address ? getGroupForAddress(address) : undefined;
  const myGroupAlreadySigned = myGroup ? signedGroupIds.has(myGroup.id) : false;

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Chi tiết Request</CardTitle>
        </CardHeader>
        <CardContent className="text-sm space-y-1">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Action:</span>
            <Badge variant="outline">{request.action_type}</Badge>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Số lượng:</span>
            <span className="font-mono font-bold">
              {(Number(request.amount_atomic) / 1e18).toFixed(2)} FUN
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Recipient:</span>
            <span className="font-mono text-xs">{request.recipient.slice(0, 10)}...</span>
          </div>
        </CardContent>
      </Card>

      {/* GOV-Community Signature Groups */}
      <div className="space-y-3">
        <div className="flex justify-between text-sm">
          <span>Chữ ký GOV-Community</span>
          <span className="font-bold">{signedGroupIds.size}/3 nhóm</span>
        </div>
        <Progress value={(signedGroupIds.size / 3) * 100} />

        {GOV_GROUPS.map((group) => {
          const GroupIcon = group.icon;
          const groupSigner = signatures.find((s) => {
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

      {!allGroupsCovered && !alreadySigned && !myGroupAlreadySigned && (
        <Button onClick={onSign} disabled={signing || !address} className="w-full gap-2">
          {signing ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Pen className="h-4 w-4" />
          )}
          Ký với ví hiện tại {myGroup ? `(${myGroup.name})` : ''}
        </Button>
      )}

      {myGroupAlreadySigned && !alreadySigned && (
        <p className="text-center text-sm text-muted-foreground">
          ⚠️ Nhóm {myGroup?.name} ({myGroup?.nameVi}) đã có người ký. Đợi nhóm khác...
        </p>
      )}

      {alreadySigned && !allGroupsCovered && (
        <p className="text-center text-sm text-muted-foreground">
          ✅ Bạn đã ký. Đợi các nhóm khác ký tiếp...
        </p>
      )}

      {allGroupsCovered && (
        <p className="text-center text-sm text-green-600 font-medium">
          ✅ Đủ 3 nhóm! Chuyển sang tab "Gửi" để mint
        </p>
      )}
    </div>
  );
}
