import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Settings2, 
  CheckCircle2, 
  XCircle, 
  Loader2,
  ExternalLink,
  Copy,
  RefreshCw
} from 'lucide-react';
import { useWallet } from '@/hooks/useWallet';
import { 
  getFunMoneyAddress, 
  setFunMoneyAddress, 
  DEFAULT_FUN_MONEY_ADDRESS,
  checkContractExists,
  isValidAddress,
  BSC_TESTNET_CONFIG
} from '@/lib/web3';
import { toast } from 'sonner';

interface ContractSettingsProps {
  onAddressChange?: () => void;
}

export function ContractSettings({ onAddressChange }: ContractSettingsProps) {
  const { provider, isConnected, isCorrectChain } = useWallet();
  const [address, setAddress] = useState(getFunMoneyAddress());
  const [inputValue, setInputValue] = useState(address);
  const [isChecking, setIsChecking] = useState(false);
  const [contractStatus, setContractStatus] = useState<'unknown' | 'valid' | 'invalid'>('unknown');
  const [isExpanded, setIsExpanded] = useState(false);

  // Check contract when address changes or on mount
  useEffect(() => {
    if (provider && isConnected && isCorrectChain) {
      checkContract(address);
    }
  }, [provider, isConnected, isCorrectChain, address]);

  const checkContract = async (addr: string) => {
    if (!provider || !isValidAddress(addr)) {
      setContractStatus('invalid');
      return;
    }
    
    setIsChecking(true);
    try {
      const { exists } = await checkContractExists(provider, addr);
      setContractStatus(exists ? 'valid' : 'invalid');
    } catch {
      setContractStatus('invalid');
    } finally {
      setIsChecking(false);
    }
  };

  const handleUpdate = () => {
    const trimmed = inputValue.trim();
    
    if (!isValidAddress(trimmed)) {
      toast.error('Địa chỉ không hợp lệ', {
        description: 'Vui lòng nhập địa chỉ Ethereum hợp lệ (0x...)'
      });
      return;
    }
    
    setFunMoneyAddress(trimmed);
    setAddress(trimmed);
    onAddressChange?.();
    toast.success('Đã cập nhật địa chỉ contract');
    checkContract(trimmed);
  };

  const handleReset = () => {
    setInputValue(DEFAULT_FUN_MONEY_ADDRESS);
    setFunMoneyAddress(DEFAULT_FUN_MONEY_ADDRESS);
    setAddress(DEFAULT_FUN_MONEY_ADDRESS);
    onAddressChange?.();
    toast.info('Đã reset về địa chỉ mặc định');
    checkContract(DEFAULT_FUN_MONEY_ADDRESS);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(address);
    toast.success('Đã copy địa chỉ');
  };

  const getStatusBadge = () => {
    if (isChecking) {
      return (
        <Badge variant="outline" className="text-xs">
          <Loader2 className="w-3 h-3 mr-1 animate-spin" />
          Checking...
        </Badge>
      );
    }
    
    if (contractStatus === 'valid') {
      return (
        <Badge className="bg-green-100 text-green-700 border-green-200 text-xs">
          <CheckCircle2 className="w-3 h-3 mr-1" />
          Deployed
        </Badge>
      );
    }
    
    if (contractStatus === 'invalid') {
      return (
        <Badge className="bg-red-100 text-red-700 border-red-200 text-xs">
          <XCircle className="w-3 h-3 mr-1" />
          Not Found
        </Badge>
      );
    }
    
    return (
      <Badge variant="outline" className="text-xs text-muted-foreground">
        Unknown
      </Badge>
    );
  };

  return (
    <Card className="bg-white/90 backdrop-blur-sm border-amber-200">
      <CardHeader 
        className="pb-2 cursor-pointer hover:bg-amber-50/50 transition-colors rounded-t-lg"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <CardTitle className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-2 text-amber-700">
            <Settings2 className="w-4 h-4" />
            Contract Settings
          </div>
          <div className="flex items-center gap-2">
            {getStatusBadge()}
          </div>
        </CardTitle>
      </CardHeader>
      
      {isExpanded && (
        <CardContent className="pt-0 space-y-4">
          {/* Current Address Display */}
          <div className="p-3 bg-amber-50 rounded-lg border border-amber-100">
            <div className="text-xs text-amber-600 mb-1">FUN Money Contract Address</div>
            <div className="flex items-center gap-2">
              <code className="flex-1 text-xs font-mono text-amber-800 break-all">
                {address}
              </code>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={(e) => { e.stopPropagation(); handleCopy(); }}
                className="h-6 w-6 p-0"
              >
                <Copy className="w-3 h-3" />
              </Button>
              <a 
                href={`${BSC_TESTNET_CONFIG.explorerUrl}/address/${address}`}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="text-amber-600 hover:text-amber-700"
              >
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Status Alert for Invalid Contract */}
          {contractStatus === 'invalid' && (
            <div className="p-3 bg-red-50 rounded-lg border border-red-200 text-sm text-red-700">
              <div className="flex items-start gap-2">
                <XCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <div>
                  <div className="font-medium">Contract không tồn tại</div>
                  <p className="text-xs text-red-600 mt-1">
                    Không tìm thấy code tại địa chỉ này trên BSC Testnet. 
                    Hãy deploy contract mới hoặc nhập đúng địa chỉ.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Update Address Input */}
          <div className="space-y-2">
            <label className="text-xs text-muted-foreground">Cập nhật địa chỉ Contract</label>
            <div className="flex gap-2">
              <Input
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="0x..."
                className="font-mono text-xs"
              />
              <Button 
                onClick={handleUpdate}
                size="sm"
                className="bg-amber-500 hover:bg-amber-600 text-white"
                disabled={inputValue === address || !isValidAddress(inputValue)}
              >
                Update
              </Button>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => checkContract(address)}
              disabled={isChecking}
              className="flex-1"
            >
              <RefreshCw className={`w-3 h-3 mr-1 ${isChecking ? 'animate-spin' : ''}`} />
              Kiểm tra lại
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={handleReset}
              className="text-amber-600 border-amber-300 hover:bg-amber-50"
            >
              Reset Default
            </Button>
          </div>

          {/* Help Text */}
          <p className="text-xs text-muted-foreground">
            💡 Nếu contract chưa được deploy, hãy làm theo{' '}
            <a href="/contract-docs" className="text-amber-600 hover:underline">
              hướng dẫn deploy
            </a>
            {' '}và nhập địa chỉ mới vào đây.
          </p>
        </CardContent>
      )}
    </Card>
  );
}
