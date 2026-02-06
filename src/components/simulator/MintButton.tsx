import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogDescription 
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { 
  Coins, 
  Loader2, 
  CheckCircle2, 
  XCircle, 
  ExternalLink,
  Wallet,
  Sparkles
} from 'lucide-react';
import { useWallet } from '@/hooks/useWallet';
import { 
  getFunMoneyContractWithSigner, 
  getNonce, 
  createActionHash,
  BSC_TESTNET_CONFIG 
} from '@/lib/web3';
import { signPPLP, getDeadline, type PPLPData } from '@/lib/eip712';
import type { ScoringResult } from '@/types/pplp.types';
import { useToast } from '@/hooks/use-toast';

interface MintButtonProps {
  result: ScoringResult | null;
  actionType: string | null;
  disabled?: boolean;
}

type MintStatus = 'idle' | 'signing' | 'minting' | 'success' | 'error';

export function MintButton({ result, actionType, disabled }: MintButtonProps) {
  const { toast } = useToast();
  const { 
    isConnected, 
    isCorrectChain, 
    address, 
    provider, 
    signer,
    connect,
    switchToBscTestnet,
    hasMetaMask
  } = useWallet();

  const [status, setStatus] = useState<MintStatus>('idle');
  const [txHash, setTxHash] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showDialog, setShowDialog] = useState(false);

  // Check if can mint
  const canMint = result?.decision === 'AUTHORIZE' && actionType && isConnected && isCorrectChain;

  const handleMint = async () => {
    if (!canMint || !provider || !signer || !address || !actionType) return;

    setShowDialog(true);
    setStatus('signing');
    setTxHash(null);
    setErrorMessage(null);

    try {
      // Get nonce from contract
      const nonce = await getNonce(provider, address);
      
      // Create action hash
      const actionHash = createActionHash(actionType);
      
      // Set deadline (1 hour from now)
      const deadline = getDeadline(1);
      
      // Amount in atomic units (18 decimals)
      const amount = result.calculatedAmountAtomic;

      // Prepare PPLP data
      const pplpData: PPLPData = {
        recipient: address,
        amount: BigInt(amount),
        actionHash,
        nonce,
        deadline
      };

      // Sign EIP-712 message with MetaMask
      const signature = await signPPLP(signer, pplpData);

      setStatus('minting');

      // Get contract with signer
      const contract = await getFunMoneyContractWithSigner(provider);

      // Call lockWithPPLP
      const tx = await contract.lockWithPPLP(
        address,
        amount,
        actionHash,
        nonce,
        deadline,
        signature
      );

      // Wait for transaction confirmation
      const receipt = await tx.wait();
      
      setTxHash(receipt.hash);
      setStatus('success');

      toast({
        title: '🎉 Mint thành công!',
        description: `Đã mint ${(Number(amount) / 1e18).toFixed(2)} FUN Money`,
      });

    } catch (err: any) {
      console.error('Mint error:', err);
      setStatus('error');
      
      let message = 'Có lỗi xảy ra khi mint';
      
      if (err.code === 4001 || err.code === 'ACTION_REJECTED') {
        message = 'Bạn đã từ chối giao dịch';
      } else if (err.message?.includes('insufficient funds')) {
        message = 'Không đủ tBNB để trả gas fee';
      } else if (err.message?.includes('invalid signature')) {
        message = 'Chữ ký không hợp lệ';
      } else if (err.message) {
        message = err.message.slice(0, 100);
      }
      
      setErrorMessage(message);

      toast({
        title: 'Mint thất bại',
        description: message,
        variant: 'destructive'
      });
    }
  };

  const handleClose = () => {
    setShowDialog(false);
    if (status === 'success' || status === 'error') {
      setStatus('idle');
    }
  };

  // Not connected - show connect button
  if (!isConnected) {
    return (
      <Button
        onClick={connect}
        disabled={!hasMetaMask}
        className="w-full gap-2 bg-gradient-to-r from-amber-400 via-yellow-500 to-orange-500 hover:from-amber-500 hover:via-yellow-600 hover:to-orange-600 text-white font-bold"
      >
        <Wallet className="h-4 w-4" />
        Connect Wallet để Mint
      </Button>
    );
  }

  // Wrong chain
  if (!isCorrectChain) {
    return (
      <Button
        onClick={switchToBscTestnet}
        className="w-full gap-2 border-amber-500 text-amber-600 bg-amber-50 hover:bg-amber-100"
        variant="outline"
      >
        Chuyển sang BSC Testnet
      </Button>
    );
  }

  return (
    <>
      <Button
        onClick={handleMint}
        disabled={!canMint || disabled || status !== 'idle'}
        className="w-full gap-2 bg-gradient-to-r from-amber-400 via-yellow-500 to-orange-500 hover:from-amber-500 hover:via-yellow-600 hover:to-orange-600 text-white font-bold shadow-lg disabled:opacity-50"
      >
        <Coins className="h-5 w-5" />
        MINT FUN MONEY
        <Sparkles className="h-5 w-5" />
      </Button>

      <Dialog open={showDialog} onOpenChange={handleClose}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Coins className="h-5 w-5 text-amber-500" />
              Mint FUN Money
            </DialogTitle>
            <DialogDescription>
              {status === 'signing' && 'Đang chờ ký xác nhận từ MetaMask...'}
              {status === 'minting' && 'Đang gửi giao dịch lên blockchain...'}
              {status === 'success' && 'Giao dịch thành công!'}
              {status === 'error' && 'Giao dịch thất bại'}
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col items-center justify-center py-6 gap-4">
            {/* Status Icon */}
            {status === 'signing' && (
              <div className="flex flex-col items-center gap-3">
                <div className="w-16 h-16 rounded-full bg-cyan-100 flex items-center justify-center">
                  <Loader2 className="h-8 w-8 text-cyan-600 animate-spin" />
                </div>
                <p className="text-sm text-muted-foreground text-center">
                  Vui lòng ký EIP-712 message trong MetaMask
                </p>
              </div>
            )}

            {status === 'minting' && (
              <div className="flex flex-col items-center gap-3">
                <div className="w-16 h-16 rounded-full bg-amber-100 flex items-center justify-center">
                  <Loader2 className="h-8 w-8 text-amber-600 animate-spin" />
                </div>
                <p className="text-sm text-muted-foreground text-center">
                  Đang xác nhận giao dịch trên blockchain...
                </p>
              </div>
            )}

            {status === 'success' && (
              <div className="flex flex-col items-center gap-3">
                <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
                  <CheckCircle2 className="h-8 w-8 text-green-600" />
                </div>
                <div className="text-center">
                  <p className="text-lg font-bold text-green-600">
                    Mint thành công!
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {(Number(result?.calculatedAmountAtomic || 0) / 1e18).toFixed(2)} FUN đã được mint
                  </p>
                </div>
                
                {txHash && (
                  <a
                    href={BSC_TESTNET_CONFIG.explorerTxUrl(txHash)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-sm text-cyan-600 hover:text-cyan-700"
                  >
                    <ExternalLink className="h-4 w-4" />
                    Xem trên BSCScan
                  </a>
                )}
              </div>
            )}

            {status === 'error' && (
              <div className="flex flex-col items-center gap-3">
                <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center">
                  <XCircle className="h-8 w-8 text-destructive" />
                </div>
                <div className="text-center">
                  <p className="text-lg font-bold text-destructive">
                    Thất bại
                  </p>
                  <p className="text-sm text-muted-foreground max-w-xs">
                    {errorMessage}
                  </p>
                </div>
              </div>
            )}

            {/* Amount Badge */}
            {result && status !== 'error' && (
              <Badge className="text-lg px-4 py-2 bg-amber-100 text-amber-700 border-amber-300">
                {(Number(result.calculatedAmountAtomic) / 1e18).toFixed(2)} FUN
              </Badge>
            )}
          </div>

          {/* Close button for success/error states */}
          {(status === 'success' || status === 'error') && (
            <Button onClick={handleClose} className="w-full">
              Đóng
            </Button>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
