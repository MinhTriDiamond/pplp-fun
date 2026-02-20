import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Loader2, AlertCircle } from 'lucide-react';
import { useWallet } from '@/hooks/useWallet';
import { supabase } from '@/integrations/supabase/client';

interface WalletAuthButtonProps {
  onSuccess?: () => void;
  onError?: (err: string) => void;
}

export function WalletAuthButton({ onSuccess, onError }: WalletAuthButtonProps) {
  const { hasMetaMask, isConnected, address, signer, connect, isConnecting } = useWallet();
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<'idle' | 'connecting' | 'signing' | 'auth'>('idle');

  const handleWalletAuth = async () => {
    if (!hasMetaMask) {
      onError?.('Vui lòng cài MetaMask để tiếp tục');
      return;
    }

    setLoading(true);
    try {
      // Step 1: Connect wallet if not connected
      let currentSigner = signer;
      let currentAddress = address;

      if (!isConnected || !signer || !address) {
        setStep('connecting');
        await connect();
        // After connect, signer/address might not be updated yet due to state
        // We rely on the wallet hook state being updated
        if (!signer || !address) {
          onError?.('Không thể kết nối ví. Vui lòng thử lại.');
          return;
        }
        currentSigner = signer;
        currentAddress = address;
      }

      if (!currentSigner || !currentAddress) {
        onError?.('Không thể kết nối ví. Vui lòng thử lại.');
        return;
      }

      // Step 2: Sign message
      setStep('signing');
      const timestamp = new Date().toISOString();
      const message = `Đăng nhập FUN ID: ${currentAddress} lúc ${timestamp}`;
      const signature = await currentSigner.signMessage(message);

      // Step 3: Auth via edge function
      setStep('auth');
      const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
      const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

      const response = await fetch(`${SUPABASE_URL}/functions/v1/wallet-auth`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': SUPABASE_ANON_KEY,
        },
        body: JSON.stringify({ address: currentAddress, message, signature }),
      });

      const result = await response.json();

      if (!response.ok || result.error) {
        throw new Error(result.error || 'Xác thực thất bại');
      }

      // Set session
      await supabase.auth.setSession({
        access_token: result.access_token,
        refresh_token: result.refresh_token,
      });

      onSuccess?.();
    } catch (err: any) {
      const msg = err.message || 'Đã có lỗi xảy ra';
      if (msg.includes('user rejected') || err.code === 4001) {
        onError?.('Bạn đã từ chối ký. Vui lòng thử lại.');
      } else {
        onError?.(msg);
      }
    } finally {
      setLoading(false);
      setStep('idle');
    }
  };

  const stepLabel = {
    idle: '',
    connecting: 'Đang kết nối ví...',
    signing: 'Đang ký xác nhận...',
    auth: 'Đang xác thực...',
  }[step];

  return (
    <div className="space-y-2">
      <Button
        type="button"
        variant="outline"
        className="w-full gap-3 h-12 text-sm font-medium border-border hover:bg-muted"
        onClick={handleWalletAuth}
        disabled={loading || isConnecting}
      >
        {loading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            {stepLabel || 'Đang xử lý...'}
          </>
        ) : (
          <>
            <span className="text-xl">🦊</span>
            Tiếp tục với Wallet
          </>
        )}
      </Button>

      {!hasMetaMask && (
        <p className="text-xs text-muted-foreground flex items-center gap-1">
          <AlertCircle className="h-3 w-3" />
          Cần cài MetaMask để dùng tính năng này
        </p>
      )}
    </div>
  );
}
