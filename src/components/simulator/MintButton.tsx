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
import { useAuth } from '@/hooks/useAuth';
import { useMintHistory } from '@/hooks/useMintHistory';
import { 
  getFunMoneyContractWithSigner, 
  getNonce, 
  createActionHash,
  createEvidenceHash,
  BSC_TESTNET_CONFIG,
  getFunMoneyAddress,
  checkContractExists,
  FUN_MONEY_ABI
} from '@/lib/web3';
import { Contract } from 'ethers';
import { signPPLP, getEip712Domain, verifyPPLPSignatureWithDebug, type PPLPData } from '@/lib/eip712';
import type { ScoringResult } from '@/types/pplp.types';
import { useToast } from '@/hooks/use-toast';
import { DebugPanel } from './DebugPanel';
import { AuthModal } from '@/components/auth/AuthModal';
import { 
  createInitialDebugBundle, 
  decodeRevertError,
  type MintDebugBundle 
} from '@/lib/debug-bundle';

interface MintButtonProps {
  result: ScoringResult | null;
  actionType: string | null;
  platformId: string | null;
  disabled?: boolean;
  recipient?: string;
  lightScore?: number;
  unityScore?: number;
  onMintSuccess?: () => void;
}

type MintStatus = 'idle' | 'signing' | 'minting' | 'success' | 'error';

export function MintButton({ 
  result, 
  actionType, 
  platformId,
  disabled, 
  recipient, 
  lightScore,
  unityScore,
  onMintSuccess 
}: MintButtonProps) {
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
  const { isAuthenticated } = useAuth();
  const { saveMint } = useMintHistory();

  const [status, setStatus] = useState<MintStatus>('idle');
  const [txHash, setTxHash] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showDialog, setShowDialog] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [debugBundle, setDebugBundle] = useState<MintDebugBundle | null>(null);

  // Use recipient if provided, otherwise use connected wallet
  const mintRecipient = recipient && recipient.length === 42 ? recipient : address;
  const canMint = result?.decision === 'AUTHORIZE' && actionType && isConnected && isCorrectChain && mintRecipient;

  const handleMint = async () => {
    // Check authentication first
    if (!isAuthenticated) {
      setShowAuthModal(true);
      return;
    }

    if (!canMint || !provider || !signer || !address || !actionType || !mintRecipient) return;

    setShowDialog(true);
    setStatus('signing');
    setTxHash(null);
    setErrorMessage(null);

    const bundle = createInitialDebugBundle();
    bundle.timestamp = new Date().toISOString();
    bundle.wallet.address = address;
    bundle.action.type = actionType;
    
    // Note: mintRecipient is the user who receives the tokens
    // address is the connected wallet (Attester) who signs

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

      // Create action hash (for EIP-712 signing)
      const actionHash = createActionHash(actionType);
      bundle.action.hash = actionHash;
      
      // Check if action is registered
      try {
        const actionInfo = await contract.actions(actionHash);
        bundle.action.isRegistered = actionInfo[0] === true || actionInfo.allowed === true;
      } catch {
        bundle.action.isRegistered = null;
      }

      // Get nonce from contract FOR THE RECIPIENT (not signer!)
      // Contract checks nonce of the user who receives tokens
      const nonce = await getNonce(provider, mintRecipient);
      
      // Amount in atomic units (18 decimals)
      const amount = result.calculatedAmountAtomic;

      // Create evidence hash (proof of the action data)
      const evidenceHash = createEvidenceHash({
        actionType,
        timestamp: Math.floor(Date.now() / 1000),
        pillars: { S: 80, T: 75, H: 70, C: 85, U: 90 },
        metadata: { 
          lightScore: result.lightScore,
          unityScore: result.unityScore 
        }
      });

      // Update PPLP params in bundle (v1.2.1 structure)
      // User = recipient (who receives tokens), not signer
      bundle.pplp = {
        user: mintRecipient,
        amount: amount.toString(),
        amountFormatted: (Number(amount) / 1e18).toFixed(4) + " FUN",
        evidenceHash: evidenceHash,
        nonce: nonce.toString(),
      };

      // Get EIP-712 domain
      const domain = getEip712Domain();
      bundle.domain = domain;

      // Prepare PPLP data for signing (v1.2.1 structure)
      // CRITICAL: user = recipient address (who receives tokens)
      const pplpData: PPLPData = {
        user: mintRecipient,
        actionHash,
        amount: BigInt(amount),
        evidenceHash,
        nonce,
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

      setDebugBundle({ ...bundle });

      if (!sigVerify.isValid) {
        throw new Error(
          `Signature mismatch! Recovered: ${sigVerify.recoveredAddress}, Expected: ${sigVerify.expectedAddress}. ` +
          `Check EIP-712 domain version (using: ${domain.version})`
        );
      }

      setStatus('minting');

      // Get contract with signer
      const signerContract = await getFunMoneyContractWithSigner(provider);
      
      // Preflight dry-run using estimateGas
      try {
        // lockWithPPLP(address user, string action, uint256 amount, bytes32 evidenceHash, bytes[] sigs)
        // user = recipient (who receives tokens)
        await signerContract.lockWithPPLP.estimateGas(
          mintRecipient, // user = RECIPIENT
          actionType,    // action STRING (not hash!)
          amount,        // amount
          evidenceHash,  // evidenceHash
          [signature]    // sigs array
        );
        bundle.preflight.success = true;
      } catch (preflightErr: any) {
        bundle.preflight.success = false;
        
        const revertData = preflightErr.data || preflightErr.info?.error?.data || null;
        bundle.preflight.revertData = revertData;
        bundle.preflight.decodedError = decodeRevertError(revertData);
        
        setDebugBundle({ ...bundle });
        throw preflightErr;
      }

      setDebugBundle({ ...bundle });

      // Call lockWithPPLP with CORRECT parameters for v1.2.1
      // user = recipient address (who receives the tokens)
      const tx = await signerContract.lockWithPPLP(
        mintRecipient, // user = RECIPIENT  
        actionType,    // action STRING (contract hashes internally)
        amount,        // amount
        evidenceHash,  // evidenceHash
        [signature]    // sigs array
      );

      // Wait for transaction confirmation
      const receipt = await tx.wait();
      
      setTxHash(receipt.hash);
      setStatus('success');

      // Save mint history to database
      if (isAuthenticated && platformId) {
        await saveMint({
          txHash: receipt.hash,
          chainId: BSC_TESTNET_CONFIG.chainId,
          contractAddress: contractAddress,
          recipientAddress: mintRecipient,
          actionType: actionType,
          platformId: platformId,
          amountAtomic: amount.toString(),
          amountFormatted: `${(Number(amount) / 1e18).toFixed(4)} FUN`,
          lightScore: lightScore,
          unityScore: unityScore,
          integrityK: result.multipliers.K,
          evidenceHash: evidenceHash,
          multiplierQ: result.multipliers.Q,
          multiplierI: result.multipliers.I,
          multiplierK: result.multipliers.K,
          multiplierUx: result.multipliers.Ux,
        });
      }

      toast({
        title: '🎉 Mint thành công!',
        description: `Đã mint ${(Number(amount) / 1e18).toFixed(2)} FUN về ${mintRecipient.slice(0, 10)}...`,
      });
      
      // Trigger refresh callback
      onMintSuccess?.();

    } catch (err: any) {
      console.error('Mint error:', err);
      setStatus('error');
      
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
      } else if (err.message?.includes('SIGS_LOW')) {
        message = 'Không đủ chữ ký Attester hợp lệ - ví của bạn có phải là Attester?';
      } else if (err.message?.includes('ACTION_INVALID')) {
        message = 'Action chưa được đăng ký hoặc đã deprecated';
      } else if (err.message?.includes('PAUSED')) {
        message = 'Hệ thống đang tạm dừng (pauseTransitions = true)';
      } else if (err.message?.includes('execution reverted') || err.message?.includes('no data present')) {
        message = 'Giao dịch bị từ chối bởi contract';
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

                <div className="w-full mt-4 border-t pt-4">
                  <DebugPanel debugBundle={debugBundle} />
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Auth Modal for login requirement */}
      <AuthModal 
        open={showAuthModal}
        onOpenChange={setShowAuthModal}
        onSuccess={() => {
          setShowAuthModal(false);
          // Retry mint after successful login
          handleMint();
        }}
      />
    </>
  );
}
