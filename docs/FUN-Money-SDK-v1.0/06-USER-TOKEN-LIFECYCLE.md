# 🔄 User Token Lifecycle - Vòng Đời Token FUN Money

## Tổng Quan

Sau khi Admin mint FUN Money cho user, token không vào thẳng ví mà trải qua 3 trạng thái:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         TOKEN LIFECYCLE STATES                               │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│   lockWithPPLP()           activate(amount)          claim(amount)          │
│   (Attester ký)            (User ký)                 (User ký)              │
│        │                        │                         │                 │
│        ▼                        ▼                         ▼                 │
│   ┌─────────────┐         ┌─────────────┐         ┌─────────────┐          │
│   │   LOCKED    │ ──────► │  ACTIVATED  │ ──────► │   FLOWING   │          │
│   │             │         │             │         │             │          │
│   │ (in alloc)  │         │ (in alloc)  │         │ (in wallet) │          │
│   └─────────────┘         └─────────────┘         └─────────────┘          │
│                                                                              │
│   • Không thể transfer    • Không thể transfer    • ERC20 balance          │
│   • Đợi user activate     • Đợi user claim        • Có thể transfer        │
│   • Trong allocation      • Trong allocation      • Trong ví cá nhân       │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Ai Ký Gì?

| Action | Function | Ai Ký? | Mô Tả |
|--------|----------|--------|-------|
| **Mint** | `lockWithPPLP()` | Attester (Admin) | Tạo tokens ở trạng thái LOCKED |
| **Activate** | `activate(amount)` | User | Chuyển từ LOCKED → ACTIVATED |
| **Claim** | `claim(amount)` | User | Chuyển từ ACTIVATED → FLOWING |

---

## Contract Functions

### 1. alloc(address) - Đọc Allocation

```typescript
// Đọc số dư LOCKED và ACTIVATED của user
const result = await contract.alloc(userAddress);

console.log('Locked:', result.locked);     // BigInt
console.log('Activated:', result.activated); // BigInt
```

### 2. balanceOf(address) - Đọc FLOWING Balance

```typescript
// Đọc số dư ERC20 (đã claim, có thể transfer)
const flowing = await contract.balanceOf(userAddress);

console.log('Flowing:', flowing); // BigInt
```

### 3. activate(amount) - User Activate

```solidity
// Solidity signature
function activate(uint256 amount) external;

// User chỉ có thể activate số LOCKED của chính mình
// Sau khi gọi: locked -= amount, activated += amount
```

```typescript
// JavaScript
async function activateTokens(
  signer: JsonRpcSigner, 
  amount: bigint
): Promise<string> {
  const contract = new Contract(contractAddress, FUN_MONEY_ABI, signer);
  const tx = await contract.activate(amount);
  const receipt = await tx.wait();
  return receipt.hash;
}
```

### 4. claim(amount) - User Claim

```solidity
// Solidity signature
function claim(uint256 amount) external;

// User chỉ có thể claim số ACTIVATED của chính mình
// Sau khi gọi: activated -= amount, balanceOf(user) += amount
```

```typescript
// JavaScript
async function claimTokens(
  signer: JsonRpcSigner, 
  amount: bigint
): Promise<string> {
  const contract = new Contract(contractAddress, FUN_MONEY_ABI, signer);
  const tx = await contract.claim(amount);
  const receipt = await tx.wait();
  return receipt.hash;
}
```

---

## Component: TokenLifecyclePanel

```tsx
// src/components/fun-money/TokenLifecyclePanel.tsx

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Lock, 
  Unlock, 
  Coins, 
  Sparkles, 
  RefreshCw, 
  Loader2,
  ExternalLink,
  CheckCircle2
} from 'lucide-react';
import { useWallet } from '@/hooks/useWallet';
import { Contract } from 'ethers';
import { FUN_MONEY_ABI, BSC_TESTNET_CONFIG } from '@/lib/fun-money/web3-config';
import { toast } from 'sonner';

interface TokenLifecyclePanelProps {
  refreshTrigger?: number;
}

type ActionStatus = 'idle' | 'activating' | 'claiming';

export function TokenLifecyclePanel({ refreshTrigger }: TokenLifecyclePanelProps) {
  const { isConnected, isCorrectChain, address, provider, signer } = useWallet();
  
  const [locked, setLocked] = useState<bigint>(0n);
  const [activated, setActivated] = useState<bigint>(0n);
  const [flowing, setFlowing] = useState<bigint>(0n);
  const [isLoading, setIsLoading] = useState(false);
  const [actionStatus, setActionStatus] = useState<ActionStatus>('idle');
  const [lastTxHash, setLastTxHash] = useState<string | null>(null);

  const contractAddress = "0x1aa8DE8B1E4465C6d729E8564893f8EF823a5ff2";

  // Fetch balances
  const fetchBalances = useCallback(async () => {
    if (!provider || !address || !isConnected || !isCorrectChain) return;
    
    setIsLoading(true);
    try {
      const contract = new Contract(contractAddress, FUN_MONEY_ABI, provider);
      
      const [allocation, balance] = await Promise.all([
        contract.alloc(address),
        contract.balanceOf(address)
      ]);
      
      setLocked(allocation.locked || allocation[0] || 0n);
      setActivated(allocation.activated || allocation[1] || 0n);
      setFlowing(balance);
    } catch (err) {
      console.error('Failed to fetch balances:', err);
    } finally {
      setIsLoading(false);
    }
  }, [provider, address, isConnected, isCorrectChain]);

  useEffect(() => {
    fetchBalances();
  }, [fetchBalances, refreshTrigger]);

  // Activate tokens
  const handleActivate = async () => {
    if (!signer || locked === 0n) return;
    
    setActionStatus('activating');
    setLastTxHash(null);
    
    try {
      const contract = new Contract(contractAddress, FUN_MONEY_ABI, signer);
      const tx = await contract.activate(locked);
      const receipt = await tx.wait();
      
      setLastTxHash(receipt.hash);
      toast.success('Activate thành công!', {
        description: `${formatFunDisplay(locked)} đã chuyển sang ACTIVATED`
      });
      await fetchBalances();
    } catch (err: any) {
      console.error('Activate error:', err);
      let message = 'Có lỗi xảy ra khi activate';
      if (err.code === 4001 || err.code === 'ACTION_REJECTED') {
        message = 'Bạn đã từ chối giao dịch';
      } else if (err.message?.includes('LOCK_LOW')) {
        message = 'Không đủ locked tokens';
      }
      toast.error('Activate thất bại', { description: message });
    } finally {
      setActionStatus('idle');
    }
  };

  // Claim tokens
  const handleClaim = async () => {
    if (!signer || activated === 0n) return;
    
    setActionStatus('claiming');
    setLastTxHash(null);
    
    try {
      const contract = new Contract(contractAddress, FUN_MONEY_ABI, signer);
      const tx = await contract.claim(activated);
      const receipt = await tx.wait();
      
      setLastTxHash(receipt.hash);
      toast.success('Claim thành công!', {
        description: `${formatFunDisplay(activated)} đã vào ví của bạn!`
      });
      await fetchBalances();
    } catch (err: any) {
      console.error('Claim error:', err);
      let message = 'Có lỗi xảy ra khi claim';
      if (err.code === 4001 || err.code === 'ACTION_REJECTED') {
        message = 'Bạn đã từ chối giao dịch';
      } else if (err.message?.includes('ACT_LOW')) {
        message = 'Không đủ activated tokens';
      }
      toast.error('Claim thất bại', { description: message });
    } finally {
      setActionStatus('idle');
    }
  };

  // Format display
  function formatFunDisplay(amount: bigint): string {
    const whole = amount / BigInt(10 ** 18);
    const fraction = amount % BigInt(10 ** 18);
    
    if (fraction === 0n) {
      return `${whole.toLocaleString()} FUN`;
    }
    
    const fractionStr = fraction.toString().padStart(18, '0').slice(0, 2);
    return `${whole.toLocaleString()}.${fractionStr} FUN`;
  }

  if (!isConnected || !isCorrectChain) {
    return null;
  }

  const hasAnyBalance = locked > 0n || activated > 0n || flowing > 0n;

  return (
    <Card className="bg-gradient-to-br from-amber-50/80 to-yellow-50/80 border-amber-200/50">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-2 text-amber-700">
            <Sparkles className="w-4 h-4" />
            My Token Lifecycle
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={fetchBalances}
            disabled={isLoading}
            className="h-6 w-6 p-0"
          >
            <RefreshCw className={`w-3 h-3 ${isLoading ? 'animate-spin' : ''}`} />
          </Button>
        </CardTitle>
      </CardHeader>

      <CardContent className="pt-0">
        {!hasAnyBalance && !isLoading ? (
          <div className="text-center py-4 text-sm text-muted-foreground">
            <p>Bạn chưa có FUN tokens nào.</p>
            <p className="text-xs mt-1">Submit action và đợi admin approve!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {/* LOCKED */}
            <div className="flex items-center justify-between p-3 bg-white/60 rounded-lg border border-amber-200/50">
              <div className="flex items-center gap-2">
                <Lock className="w-4 h-4 text-amber-600" />
                <div>
                  <div className="text-xs text-muted-foreground">LOCKED</div>
                  <div className="font-bold text-amber-700">
                    {formatFunDisplay(locked)}
                  </div>
                </div>
              </div>
              
              {locked > 0n && (
                <Button
                  size="sm"
                  onClick={handleActivate}
                  disabled={actionStatus !== 'idle'}
                  className="bg-amber-500 hover:bg-amber-600"
                >
                  {actionStatus === 'activating' ? (
                    <Loader2 className="w-3 h-3 animate-spin" />
                  ) : (
                    'Activate'
                  )}
                </Button>
              )}
            </div>

            {/* ACTIVATED */}
            <div className="flex items-center justify-between p-3 bg-white/60 rounded-lg border border-green-200/50">
              <div className="flex items-center gap-2">
                <Unlock className="w-4 h-4 text-green-600" />
                <div>
                  <div className="text-xs text-muted-foreground">ACTIVATED</div>
                  <div className="font-bold text-green-700">
                    {formatFunDisplay(activated)}
                  </div>
                </div>
              </div>
              
              {activated > 0n && (
                <Button
                  size="sm"
                  onClick={handleClaim}
                  disabled={actionStatus !== 'idle'}
                  className="bg-green-500 hover:bg-green-600"
                >
                  {actionStatus === 'claiming' ? (
                    <Loader2 className="w-3 h-3 animate-spin" />
                  ) : (
                    'Claim'
                  )}
                </Button>
              )}
            </div>

            {/* FLOWING */}
            <div className="flex items-center justify-between p-3 bg-white/60 rounded-lg border border-cyan-200/50">
              <div className="flex items-center gap-2">
                <Coins className="w-4 h-4 text-cyan-600" />
                <div>
                  <div className="text-xs text-muted-foreground">FLOWING (In Wallet)</div>
                  <div className="font-bold text-cyan-700">
                    {formatFunDisplay(flowing)}
                  </div>
                </div>
              </div>
              <Badge variant="outline" className="border-cyan-300 text-cyan-700">
                Transferable
              </Badge>
            </div>

            {/* Last TX */}
            {lastTxHash && (
              <div className="flex items-center justify-center gap-2 text-xs text-green-600">
                <CheckCircle2 className="w-3 h-3" />
                <a
                  href={`${BSC_TESTNET_CONFIG.explorerUrl}/tx/${lastTxHash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 hover:underline"
                >
                  View TX <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
```

---

## User Journey Diagram

```
┌──────────────────────────────────────────────────────────────────────────────┐
│                           USER TOKEN JOURNEY                                  │
├──────────────────────────────────────────────────────────────────────────────┤
│                                                                               │
│   DAY 1: User submits action                                                 │
│   ┌─────────────────────────────────────────────────────────────────────────┐│
│   │ • Submit evidence for "CONTENT_CREATE"                                  ││
│   │ • Status: PENDING                                                       ││
│   │ • Tokens: 0 LOCKED, 0 ACTIVATED, 0 FLOWING                             ││
│   └─────────────────────────────────────────────────────────────────────────┘│
│                                    ↓                                          │
│   DAY 2: Admin approves                                                      │
│   ┌─────────────────────────────────────────────────────────────────────────┐│
│   │ • Admin reviews and approves                                            ││
│   │ • Admin signs with Attester wallet                                      ││
│   │ • lockWithPPLP() called on-chain                                        ││
│   │ • Status: MINTED                                                        ││
│   │ • Tokens: 125 LOCKED, 0 ACTIVATED, 0 FLOWING                           ││
│   └─────────────────────────────────────────────────────────────────────────┘│
│                                    ↓                                          │
│   DAY 2: User activates                                                      │
│   ┌─────────────────────────────────────────────────────────────────────────┐│
│   │ • User sees 125 LOCKED in Token Lifecycle panel                        ││
│   │ • User clicks "Activate"                                                ││
│   │ • MetaMask popup → User signs tx                                        ││
│   │ • activate(125 FUN) called on-chain                                     ││
│   │ • Tokens: 0 LOCKED, 125 ACTIVATED, 0 FLOWING                           ││
│   └─────────────────────────────────────────────────────────────────────────┘│
│                                    ↓                                          │
│   DAY 3: User claims                                                         │
│   ┌─────────────────────────────────────────────────────────────────────────┐│
│   │ • User sees 125 ACTIVATED                                               ││
│   │ • User clicks "Claim"                                                   ││
│   │ • MetaMask popup → User signs tx                                        ││
│   │ • claim(125 FUN) called on-chain                                        ││
│   │ • Tokens: 0 LOCKED, 0 ACTIVATED, 125 FLOWING                           ││
│   │ • User can now transfer FUN to others!                                  ││
│   └─────────────────────────────────────────────────────────────────────────┘│
│                                                                               │
└──────────────────────────────────────────────────────────────────────────────┘
```

---

## Why This Design?

1. **LOCKED**: Đảm bảo user đã xác nhận muốn nhận tokens (không spam mint)
2. **ACTIVATED**: Cho phép user có thời gian review trước khi claim vào ví
3. **FLOWING**: ERC20 chuẩn, có thể transfer, trade, stake

Thiết kế này cho phép:
- User kiểm soát khi nào nhận tokens
- Platform có thể implement additional rules trước activate/claim
- Future: time-lock, vesting có thể thêm vào

---

*Tiếp theo: [07-ERROR-HANDLING.md](./07-ERROR-HANDLING.md)*
