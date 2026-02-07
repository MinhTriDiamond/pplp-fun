# 🎛️ Admin Dashboard - Giao Diện Duyệt Mint Requests

## Tổng Quan

Admin Dashboard là nơi admin (có Attester wallet) xem và duyệt các mint requests từ users.

---

## UI Mockup

```
┌────────────────────────────────────────────────────────────────────────────┐
│                      ADMIN MINT APPROVAL DASHBOARD                          │
├────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│   [📋 Pending (12)]  [✅ Approved (45)]  [❌ Rejected (3)]  [🔄 Refresh]   │
│                                                                             │
├────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│   ┌──────────────────────────────────────────────────────────────────────┐ │
│   │ #REQ-001 | CONTENT_CREATE | FUN_PROFILE          | 2 hours ago       │ │
│   ├──────────────────────────────────────────────────────────────────────┤ │
│   │                                                                       │ │
│   │   👤 User: 0x7d03...f0f                                              │ │
│   │   📊 Light Score: 78  |  Unity Score: 70                             │ │
│   │   💰 Amount: 125.50 FUN                                               │ │
│   │                                                                       │ │
│   │   ┌─ Multipliers ──────────────────────────────────────────────────┐ │ │
│   │   │ Q: 1.8  |  I: 2.0  |  K: 0.95  |  Ux: 1.5                      │ │ │
│   │   └────────────────────────────────────────────────────────────────┘ │ │
│   │                                                                       │ │
│   │   📝 Evidence: "Created tutorial video about PPLP protocol..."       │ │
│   │   🔗 Links: [View Proof 1] [View Proof 2]                            │ │
│   │                                                                       │ │
│   │   ┌────────────────────────────────────────────────────────────────┐ │ │
│   │   │ [👁️ View Details]   [✅ Approve & Sign]   [❌ Reject]          │ │ │
│   │   └────────────────────────────────────────────────────────────────┘ │ │
│   └──────────────────────────────────────────────────────────────────────┘ │
│                                                                             │
│   ┌──────────────────────────────────────────────────────────────────────┐ │
│   │ #REQ-002 | DONATE | FUN_CHARITY                  | 5 hours ago       │ │
│   │ ...                                                                   │ │
│   └──────────────────────────────────────────────────────────────────────┘ │
│                                                                             │
└────────────────────────────────────────────────────────────────────────────┘
```

---

## Approval Flow

```
┌──────────────────────────────────────────────────────────────────────────────┐
│                           APPROVE & SIGN FLOW                                 │
├──────────────────────────────────────────────────────────────────────────────┤
│                                                                               │
│   1. Admin clicks "Approve & Sign"                                           │
│                     ↓                                                         │
│   2. Confirmation modal shows:                                               │
│      ┌─────────────────────────────────────────────────────────────────────┐ │
│      │ ⚠️ CONFIRM MINT                                                     │ │
│      │                                                                      │ │
│      │ You are about to mint:                                              │ │
│      │   Amount: 125.50 FUN                                                │ │
│      │   To: 0x7d037462503bea2f61cDB9A482aAc72a8f4F3f0f                    │ │
│      │   Action: CONTENT_CREATE                                            │ │
│      │                                                                      │ │
│      │ This will:                                                          │ │
│      │   1. Sign EIP-712 message with your wallet                         │ │
│      │   2. Send transaction to BSC Testnet                               │ │
│      │   3. Mint tokens to user's allocation (LOCKED)                     │ │
│      │                                                                      │ │
│      │              [Cancel]     [Confirm & Sign]                          │ │
│      └─────────────────────────────────────────────────────────────────────┘ │
│                     ↓                                                         │
│   3. MetaMask popup for EIP-712 signature                                    │
│                     ↓                                                         │
│   4. MetaMask popup for transaction                                          │
│                     ↓                                                         │
│   5. Wait for confirmation (loading spinner)                                 │
│                     ↓                                                         │
│   6. Success! Update status to 'minted'                                      │
│                                                                               │
└──────────────────────────────────────────────────────────────────────────────┘
```

---

## Component: AdminApprovalPanel

```tsx
// src/components/fun-money/AdminApprovalPanel.tsx

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Loader2, 
  ExternalLink 
} from 'lucide-react';
import { useWallet } from '@/hooks/useWallet';
import { supabase } from '@/integrations/supabase/client';
import { mintFunMoney } from '@/lib/fun-money/contract-helpers';
import { toast } from 'sonner';

interface MintRequest {
  id: string;
  user_id: string;
  user_wallet_address: string;
  platform_id: string;
  action_type: string;
  action_evidence: any;
  light_score: number;
  unity_score: number;
  multiplier_q: number;
  multiplier_i: number;
  multiplier_k: number;
  multiplier_ux: number;
  calculated_amount_atomic: string;
  calculated_amount_formatted: string;
  status: string;
  created_at: string;
  user_email?: string;
}

export function AdminApprovalPanel() {
  const { signer, isConnected, isCorrectChain, address } = useWallet();
  const [requests, setRequests] = useState<MintRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('pending');

  // Fetch requests
  useEffect(() => {
    fetchRequests();
  }, [activeTab]);

  async function fetchRequests() {
    setLoading(true);
    const { data, error } = await supabase
      .from('mint_requests')
      .select('*, profiles(email)')
      .eq('status', activeTab === 'pending' ? 'pending' : 
           activeTab === 'approved' ? 'minted' : 'rejected')
      .order('created_at', { ascending: false })
      .limit(50);
    
    if (error) {
      toast.error('Failed to fetch requests');
      console.error(error);
    } else {
      setRequests(data?.map(r => ({
        ...r,
        user_email: r.profiles?.email
      })) || []);
    }
    setLoading(false);
  }

  async function handleApprove(request: MintRequest) {
    if (!signer || !isConnected || !isCorrectChain) {
      toast.error('Please connect Attester wallet on BSC Testnet');
      return;
    }

    setProcessing(request.id);

    try {
      // 1. Mint on-chain
      const txHash = await mintFunMoney(
        signer,
        request.user_wallet_address,
        request.action_type,
        BigInt(request.calculated_amount_atomic),
        request.action_evidence
      );

      // 2. Update database
      const { error } = await supabase
        .from('mint_requests')
        .update({
          status: 'minted',
          tx_hash: txHash,
          attester_address: address,
          reviewed_at: new Date().toISOString(),
          minted_at: new Date().toISOString()
        })
        .eq('id', request.id);

      if (error) throw error;

      toast.success('Mint successful!', {
        description: `TX: ${txHash.slice(0, 10)}...`
      });

      // Refresh list
      fetchRequests();

    } catch (err: any) {
      console.error('Mint error:', err);
      
      let message = 'Mint failed';
      if (err.code === 4001) {
        message = 'Transaction rejected by user';
      } else if (err.message?.includes('SIGS_LOW')) {
        message = 'Not enough attester signatures';
      } else if (err.message?.includes('ACTION_INVALID')) {
        message = 'Action not registered on contract';
      }
      
      toast.error(message);
    } finally {
      setProcessing(null);
    }
  }

  async function handleReject(request: MintRequest, reason: string) {
    const { error } = await supabase
      .from('mint_requests')
      .update({
        status: 'rejected',
        decision_reason: reason,
        reviewed_at: new Date().toISOString()
      })
      .eq('id', request.id);

    if (error) {
      toast.error('Failed to reject request');
    } else {
      toast.success('Request rejected');
      fetchRequests();
    }
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Mint Request Approval</span>
          <Button variant="outline" size="sm" onClick={fetchRequests}>
            Refresh
          </Button>
        </CardTitle>
      </CardHeader>
      
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="pending">
              <Clock className="w-4 h-4 mr-2" />
              Pending
            </TabsTrigger>
            <TabsTrigger value="approved">
              <CheckCircle2 className="w-4 h-4 mr-2" />
              Approved
            </TabsTrigger>
            <TabsTrigger value="rejected">
              <XCircle className="w-4 h-4 mr-2" />
              Rejected
            </TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="mt-4">
            {loading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin" />
              </div>
            ) : requests.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No {activeTab} requests
              </div>
            ) : (
              <div className="space-y-4">
                {requests.map(request => (
                  <RequestCard
                    key={request.id}
                    request={request}
                    onApprove={() => handleApprove(request)}
                    onReject={(reason) => handleReject(request, reason)}
                    processing={processing === request.id}
                    showActions={activeTab === 'pending'}
                  />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}

// Sub-component: Request Card
function RequestCard({ 
  request, 
  onApprove, 
  onReject, 
  processing, 
  showActions 
}: {
  request: MintRequest;
  onApprove: () => void;
  onReject: (reason: string) => void;
  processing: boolean;
  showActions: boolean;
}) {
  const [showRejectInput, setShowRejectInput] = useState(false);
  const [rejectReason, setRejectReason] = useState('');

  return (
    <Card className="border">
      <CardContent className="p-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Badge variant="outline">{request.action_type}</Badge>
            <Badge variant="secondary">{request.platform_id}</Badge>
          </div>
          <span className="text-sm text-muted-foreground">
            {new Date(request.created_at).toLocaleString()}
          </span>
        </div>

        {/* Details */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <p className="text-sm text-muted-foreground">User Wallet</p>
            <p className="font-mono text-sm">
              {request.user_wallet_address.slice(0, 10)}...
              {request.user_wallet_address.slice(-8)}
            </p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Amount</p>
            <p className="font-bold text-lg">
              {request.calculated_amount_formatted}
            </p>
          </div>
        </div>

        {/* Scores */}
        <div className="flex gap-4 mb-4">
          <div className="flex items-center gap-1">
            <span className="text-sm text-muted-foreground">Light:</span>
            <span className="font-medium">{request.light_score}</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="text-sm text-muted-foreground">Unity:</span>
            <span className="font-medium">{request.unity_score}</span>
          </div>
        </div>

        {/* Multipliers */}
        <div className="flex gap-3 text-sm mb-4">
          <span>Q: {request.multiplier_q}</span>
          <span>I: {request.multiplier_i}</span>
          <span>K: {request.multiplier_k}</span>
          <span>Ux: {request.multiplier_ux}</span>
        </div>

        {/* Evidence */}
        {request.action_evidence?.description && (
          <div className="p-3 bg-muted rounded-lg mb-4">
            <p className="text-sm">{request.action_evidence.description}</p>
            {request.action_evidence.urls?.map((url: string, i: number) => (
              <a 
                key={i}
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-primary flex items-center gap-1 mt-1"
              >
                View Proof {i + 1} <ExternalLink className="w-3 h-3" />
              </a>
            ))}
          </div>
        )}

        {/* Actions */}
        {showActions && (
          <div className="flex gap-2">
            <Button 
              onClick={onApprove}
              disabled={processing}
              className="flex-1"
            >
              {processing ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : (
                <CheckCircle2 className="w-4 h-4 mr-2" />
              )}
              Approve & Sign
            </Button>
            
            {showRejectInput ? (
              <div className="flex gap-2 flex-1">
                <input
                  type="text"
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  placeholder="Reason..."
                  className="flex-1 px-2 border rounded"
                />
                <Button 
                  variant="destructive" 
                  onClick={() => {
                    onReject(rejectReason);
                    setShowRejectInput(false);
                  }}
                >
                  Confirm
                </Button>
              </div>
            ) : (
              <Button 
                variant="outline"
                onClick={() => setShowRejectInput(true)}
              >
                <XCircle className="w-4 h-4 mr-2" />
                Reject
              </Button>
            )}
          </div>
        )}

        {/* TX Hash for approved */}
        {request.status === 'minted' && request.tx_hash && (
          <a
            href={`https://testnet.bscscan.com/tx/${request.tx_hash}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-primary flex items-center gap-1"
          >
            View Transaction <ExternalLink className="w-3 h-3" />
          </a>
        )}

        {/* Rejection reason */}
        {request.status === 'rejected' && request.decision_reason && (
          <div className="p-3 bg-destructive/10 rounded-lg text-sm text-destructive">
            Reason: {request.decision_reason}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
```

---

## Wallet Connection Required

Admin MUST connect with an Attester wallet:

```tsx
function AdminPage() {
  const { isConnected, isCorrectChain, address, connect, switchToBscTestnet } = useWallet();
  const [isAttester, setIsAttester] = useState(false);

  // Check if connected wallet is attester
  useEffect(() => {
    if (isConnected && isCorrectChain && address) {
      checkAttesterStatus(address).then(setIsAttester);
    }
  }, [isConnected, isCorrectChain, address]);

  if (!isConnected) {
    return (
      <div className="text-center py-8">
        <p className="mb-4">Connect Attester wallet to approve requests</p>
        <Button onClick={connect}>Connect Wallet</Button>
      </div>
    );
  }

  if (!isCorrectChain) {
    return (
      <div className="text-center py-8">
        <p className="mb-4">Please switch to BSC Testnet</p>
        <Button onClick={switchToBscTestnet}>Switch Network</Button>
      </div>
    );
  }

  if (!isAttester) {
    return (
      <div className="text-center py-8 text-destructive">
        <p>Your wallet is not registered as an Attester.</p>
        <p className="text-sm text-muted-foreground mt-2">
          Contact Governance to register: {address}
        </p>
      </div>
    );
  }

  return <AdminApprovalPanel />;
}
```

---

## Security Notes

1. **Role Check**: Always verify admin role server-side using `has_role()` function
2. **Attester Check**: Verify wallet is registered Attester before allowing approval
3. **RLS Policies**: Ensure only admins can view all requests
4. **Audit Log**: Consider logging all approval/rejection actions

---

*Tiếp theo: [06-USER-TOKEN-LIFECYCLE.md](./06-USER-TOKEN-LIFECYCLE.md)*
