import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogDescription 
} from '@/components/ui/dialog';
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
  BSC_TESTNET_CONFIG,
  getFunMoneyAddress,
  checkContractExists,
  FUN_MONEY_ABI
} from '@/lib/web3';
import { Contract } from 'ethers';
import { signPPLP, getDeadline, getEip712Domain, verifyPPLPSignatureWithDebug, type PPLPData } from '@/lib/eip712';
import type { ScoringResult } from '@/types/pplp.types';
import { useToast } from '@/hooks/use-toast';
import { DebugPanel } from './DebugPanel';
import { 
  createInitialDebugBundle, 
  decodeRevertError, 
  formatDeadline,
  type MintDebugBundle 
} from '@/lib/debug-bundle';

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
  const [debugBundle, setDebugBundle] = useState<MintDebugBundle | null>(null);

  // Check if can mint
  const canMint = result?.decision === 'AUTHORIZE' && actionType && isConnected && isCorrectChain;

  const handleMint = async () => {
    if (!canMint || !provider || !signer || !address || !actionType) return;

    setShowDialog(true);
    setStatus('signing');
    setTxHash(null);
    setErrorMessage(null);

    // Initialize debug bundle
    const bundle = createInitialDebugBundle();
    bundle.timestamp = new Date().toISOString();
    bundle.wallet.address = address;
    bundle.action.type = actionType;

    try {
      // Get network info
      const network = await provider.getNetwork();
      bundle.network.chainId = Number(network.chainId);
      bundle.network.expectedChainId = BSC_TESTNET_CONFIG.chainId;
      bundle.network.isCorrect = bundle.network.chainId === bundle.network.expectedChainId;

      // Get contract info
      const contractAddress = getFunMoneyAddress();
      bundle.contract.address = contractAddress;
      
      const { exists } = await checkContractExists(provider, contractAddress);
      bundle.contract.exists = exists;

      // Get attester status
      const contract = new Contract(contractAddress, FUN_MONEY_ABI, provider);
      try {
        const isAttester = await contract.isAttester(address);
        bundle.wallet.isAttester = isAttester;
      } catch {
        bundle.wallet.isAttester = null;
      }

      // Get action info
      const actionHash = createActionHash(actionType);
      bundle.action.hash = actionHash;
      
      try {
        const actionInfo = await contract.actions(actionHash);
        bundle.action.isRegistered = actionInfo[0] === true || actionInfo.exists === true;
      } catch {
        bundle.action.isRegistered = null;
      }

      // Get nonce from contract
      const nonce = await getNonce(provider, address);
      
      // Set deadline (1 hour from now)
      const deadline = getDeadline(1);
      
      // Amount in atomic units (18 decimals)
      const amount = result.calculatedAmountAtomic;

      // Update PPLP params in bundle
      bundle.pplp = {
        recipient: address,
        amount: amount.toString(),
        amountFormatted: (Number(amount) / 1e18).toFixed(4) + " FUN",
        nonce: nonce.toString(),
        deadline: deadline.toString(),
        deadlineFormatted: formatDeadline(deadline),
      };

      // Get EIP-712 domain
      const domain = getEip712Domain();
      bundle.domain = domain;

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

      // Verify signature off-chain BEFORE sending transaction
      const sigVerify = verifyPPLPSignatureWithDebug(pplpData, signature, address);
      bundle.signature = {
        value: signature,
        recoveredAddress: sigVerify.recoveredAddress,
        expectedAddress: sigVerify.expectedAddress,
        isValid: sigVerify.isValid,
      };

      // Update debug bundle before any failure
      setDebugBundle({ ...bundle });

      // Check signature validity
      if (!sigVerify.isValid) {
        throw new Error(
          `Signature mismatch! Recovered: ${sigVerify.recoveredAddress}, Expected: ${sigVerify.expectedAddress}. ` +
          `Check EIP-712 domain version (using: ${domain.version})`
        );
      }

      setStatus('minting');

      // Preflight dry-run using estimateGas
      const signerContract = await getFunMoneyContractWithSigner(provider);
      
      try {
        await signerContract.lockWithPPLP.estimateGas(
          address,
          amount,
          actionHash,
          nonce,
          deadline,
          [signature]
        );
        bundle.preflight.success = true;
      } catch (preflightErr: any) {
        bundle.preflight.success = false;
        
        // Try to extract revert data
        const revertData = preflightErr.data || preflightErr.info?.error?.data || null;
        bundle.preflight.revertData = revertData;
        bundle.preflight.decodedError = decodeRevertError(revertData);
        
        setDebugBundle({ ...bundle });
        throw preflightErr; // Re-throw to be caught by outer catch
      }

      setDebugBundle({ ...bundle });

      // Call lockWithPPLP (wrap signature in array for multi-sig ABI)
      const tx = await signerContract.lockWithPPLP(
        address,
        amount,
        actionHash,
        nonce,
        deadline,
        [signature]
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
      
      // Update error in debug bundle
      bundle.error = {
        code: err.code || null,
        message: err.message?.slice(0, 500) || null,
        shortMessage: err.shortMessage || null,
        data: err.data || err.info?.error?.data || null,
      };
      
      setDebugBundle({ ...bundle });
      
      let message = 'Có lỗi xảy ra khi mint';
      
      if (err.code === 4001 || err.code === 'ACTION_REJECTED') {
        message = 'Bạn đã từ chối giao dịch';
      } else if (err.message?.includes('insufficient funds')) {
        message = 'Không đủ tBNB để trả gas fee';
      } else if (err.message?.includes('invalid signature') || err.message?.includes('Signature mismatch')) {
        message = 'Chữ ký không hợp lệ - kiểm tra EIP-712 domain version';
      } else if (err.message?.includes('execution reverted') || err.message?.includes('no data present')) {
        message = 'Giao dịch bị từ chối bởi contract';
        
        // Try to provide more context
        if (bundle.preflight.decodedError) {
          message += `: ${bundle.preflight.decodedError}`;
        }
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
        <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
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
                    Xem trên BSCScan <ExternalLink className="h-3 w-3" />
                  </a>
                )}
              </div>
            )}

            {status === 'error' && (
              <div className="flex flex-col items-center gap-3 w-full">
                <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center">
                  <XCircle className="h-8 w-8 text-red-600" />
                </div>
                <div className="text-center">
                  <p className="text-lg font-bold text-red-600">
                    Mint thất bại
                  </p>
                  {errorMessage && (
                    <p className="text-sm text-muted-foreground mt-1 max-w-sm">
                      {errorMessage}
                    </p>
                  )}
                </div>

                {/* Debug Panel - Always show on error */}
                <div className="w-full mt-4 border-t pt-4">
                  <DebugPanel debugBundle={debugBundle} />
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
