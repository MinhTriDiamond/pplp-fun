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
import { 
  getAllocation, 
  getFunBalance, 
  activateTokens, 
  claimTokens,
  formatFunDisplay,
  BSC_TESTNET_CONFIG
} from '@/lib/web3';
import { toast } from 'sonner';

interface TokenLifecyclePanelProps {
  refreshTrigger?: number;
}

type ActionStatus = 'idle' | 'activating' | 'claiming';

export function TokenLifecyclePanel({ refreshTrigger }: TokenLifecyclePanelProps) {
  const { isConnected, isCorrectChain, address, provider } = useWallet();
  
  const [locked, setLocked] = useState<bigint>(0n);
  const [activated, setActivated] = useState<bigint>(0n);
  const [flowing, setFlowing] = useState<bigint>(0n);
  const [isLoading, setIsLoading] = useState(false);
  const [actionStatus, setActionStatus] = useState<ActionStatus>('idle');
  const [lastTxHash, setLastTxHash] = useState<string | null>(null);

  const fetchBalances = useCallback(async () => {
    if (!provider || !address || !isConnected || !isCorrectChain) return;
    
    setIsLoading(true);
    try {
      const [allocation, balance] = await Promise.all([
        getAllocation(provider, address),
        getFunBalance(provider, address)
      ]);
      
      setLocked(allocation.locked);
      setActivated(allocation.activated);
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

  const handleActivate = async () => {
    if (!provider || locked === 0n) return;
    
    setActionStatus('activating');
    setLastTxHash(null);
    
    try {
      const txHash = await activateTokens(provider, locked);
      setLastTxHash(txHash);
      toast.success('Activate thành công!', {
        description: `${formatFunDisplay(locked)} đã chuyển sang ACTIVATED`
      });
      await fetchBalances();
    } catch (err: any) {
      console.error('Activate error:', err);
      let message = 'Có lỗi xảy ra khi activate';
      if (err.code === 4001 || err.code === 'ACTION_REJECTED') {
        message = 'Bạn đã từ chối giao dịch';
      }
      toast.error('Activate thất bại', { description: message });
    } finally {
      setActionStatus('idle');
    }
  };

  const handleClaim = async () => {
    if (!provider || activated === 0n) return;
    
    setActionStatus('claiming');
    setLastTxHash(null);
    
    try {
      const txHash = await claimTokens(provider, activated);
      setLastTxHash(txHash);
      toast.success('Claim thành công!', {
        description: `${formatFunDisplay(activated)} đã vào ví của bạn!`
      });
      await fetchBalances();
    } catch (err: any) {
      console.error('Claim error:', err);
      let message = 'Có lỗi xảy ra khi claim';
      if (err.code === 4001 || err.code === 'ACTION_REJECTED') {
        message = 'Bạn đã từ chối giao dịch';
      }
      toast.error('Claim thất bại', { description: message });
    } finally {
      setActionStatus('idle');
    }
  };

  if (!isConnected || !isCorrectChain) {
    return (
      <Card className="bg-gradient-to-br from-amber-50/80 to-yellow-50/80 border-amber-200/50">
        <CardContent className="py-8 text-center space-y-3">
          <Sparkles className="w-8 h-8 text-amber-400 mx-auto" />
          <p className="text-sm font-medium text-amber-700">
            Vui lòng kết nối ví MetaMask và chọn mạng BSC Testnet để xem số dư token.
          </p>
          <p className="text-xs text-muted-foreground">
            💡 LOCKED → Activate → ACTIVATED → Claim → FLOWING
          </p>
        </CardContent>
      </Card>
    );
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
            className="h-7 px-2"
          >
            <RefreshCw className={`w-3 h-3 ${isLoading ? 'animate-spin' : ''}`} />
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0 space-y-3">
        {isLoading && !hasAnyBalance ? (
          <div className="flex items-center justify-center py-6 gap-2 text-muted-foreground">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span className="text-sm">Đang tải...</span>
          </div>
        ) : (
          <div className="space-y-2">
            {/* LOCKED */}
            <div className="flex items-center justify-between p-3 bg-amber-100/50 rounded-lg border border-amber-200/50">
              <div className="flex items-center gap-2">
                <Lock className="w-4 h-4 text-amber-600" />
                <span className="text-sm font-medium text-amber-800">LOCKED</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-sm text-amber-700">
                  {formatFunDisplay(locked)}
                </span>
                <Button
                  size="sm"
                  onClick={handleActivate}
                  disabled={locked === 0n || actionStatus !== 'idle'}
                  className="h-7 gap-1 bg-amber-500 hover:bg-amber-600 text-white text-xs"
                >
                  {actionStatus === 'activating' ? (
                    <Loader2 className="w-3 h-3 animate-spin" />
                  ) : (
                    <Unlock className="w-3 h-3" />
                  )}
                  Activate
                </Button>
              </div>
            </div>

            {/* ACTIVATED */}
            <div className="flex items-center justify-between p-3 bg-green-100/50 rounded-lg border border-green-200/50">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-600" />
                <span className="text-sm font-medium text-green-800">ACTIVATED</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-sm text-green-700">
                  {formatFunDisplay(activated)}
                </span>
                <Button
                  size="sm"
                  onClick={handleClaim}
                  disabled={activated === 0n || actionStatus !== 'idle'}
                  className="h-7 gap-1 bg-green-500 hover:bg-green-600 text-white text-xs"
                >
                  {actionStatus === 'claiming' ? (
                    <Loader2 className="w-3 h-3 animate-spin" />
                  ) : (
                    <Coins className="w-3 h-3" />
                  )}
                  Claim
                </Button>
              </div>
            </div>

            {/* FLOWING */}
            <div className="flex items-center justify-between p-3 bg-cyan-100/50 rounded-lg border border-cyan-200/50">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-cyan-600" />
                <span className="text-sm font-medium text-cyan-800">FLOWING</span>
                <Badge variant="outline" className="text-xs border-cyan-300 text-cyan-600">
                  In Wallet
                </Badge>
              </div>
              <span className="font-mono text-sm text-cyan-700 font-bold">
                {formatFunDisplay(flowing)}
              </span>
            </div>
          </div>
        )}

        {/* Last Transaction Link */}
        {lastTxHash && (
          <div className="pt-2 border-t border-amber-200/50">
            <a
              href={BSC_TESTNET_CONFIG.explorerTxUrl(lastTxHash)}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-1 text-xs text-cyan-600 hover:text-cyan-700"
            >
              Xem giao dịch trên BSCScan <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        )}

        {/* Help Text */}
        <p className="text-xs text-muted-foreground text-center pt-1">
          💡 LOCKED → Activate → ACTIVATED → Claim → FLOWING (sử dụng được)
        </p>
      </CardContent>
    </Card>
  );
}
