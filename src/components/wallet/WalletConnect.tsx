import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Wallet, LogOut, AlertTriangle, Loader2 } from 'lucide-react';
import { useWallet } from '@/hooks/useWallet';

export function WalletConnect() {
  const {
    isConnected,
    address,
    isCorrectChain,
    isConnecting,
    error,
    hasMetaMask,
    connect,
    disconnect,
    switchToBscTestnet,
    clearError
  } = useWallet();

  // Format address for display
  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  // No MetaMask installed
  if (!hasMetaMask) {
    return (
      <Button
        variant="outline"
        className="gap-2 border-amber-500 text-amber-600 hover:bg-amber-50"
        onClick={() => window.open('https://metamask.io/download/', '_blank')}
      >
        <Wallet className="h-4 w-4" />
        Cài MetaMask
      </Button>
    );
  }

  // Not connected
  if (!isConnected) {
    return (
      <div className="flex flex-col gap-2">
        <Button
          onClick={connect}
          disabled={isConnecting}
          className="gap-2 bg-gradient-to-r from-cyan-500 to-violet-500 hover:from-cyan-600 hover:to-violet-600 text-white"
        >
          {isConnecting ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Wallet className="h-4 w-4" />
          )}
          {isConnecting ? 'Đang kết nối...' : 'Connect Wallet'}
        </Button>
        {error && (
          <p className="text-xs text-destructive flex items-center gap-1" onClick={clearError}>
            <AlertTriangle className="h-3 w-3" />
            {error}
          </p>
        )}
      </div>
    );
  }

  // Connected but wrong chain
  if (!isCorrectChain) {
    return (
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="border-amber-500 text-amber-600 bg-amber-50">
            <AlertTriangle className="h-3 w-3 mr-1" />
            Wrong Network
          </Badge>
          <span className="text-xs text-muted-foreground font-mono">
            {formatAddress(address!)}
          </span>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={switchToBscTestnet}
          className="gap-2 border-amber-500 text-amber-600 hover:bg-amber-50"
        >
          Chuyển sang BSC Testnet
        </Button>
      </div>
    );
  }

  // Connected and correct chain
  return (
    <div className="flex items-center gap-2">
      <Badge className="bg-green-500/10 text-green-600 border-green-500/30">
        BSC Testnet
      </Badge>
      <span className="text-sm font-mono text-foreground">
        {formatAddress(address!)}
      </span>
      <Button
        variant="ghost"
        size="icon"
        onClick={disconnect}
        className="h-8 w-8 text-muted-foreground hover:text-destructive"
        title="Ngắt kết nối"
      >
        <LogOut className="h-4 w-4" />
      </Button>
    </div>
  );
}
