import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Wallet, Copy, CheckCircle2, XCircle } from 'lucide-react';
import { isValidAddress } from '@/lib/web3';
import { toast } from 'sonner';

interface RecipientInputProps {
  recipient: string;
  onRecipientChange: (address: string) => void;
  connectedAddress: string | null;
}

export function RecipientInput({ 
  recipient, 
  onRecipientChange, 
  connectedAddress 
}: RecipientInputProps) {
  const [inputValue, setInputValue] = useState(recipient);
  const [isValid, setIsValid] = useState(true);

  useEffect(() => {
    setInputValue(recipient);
  }, [recipient]);

  useEffect(() => {
    if (inputValue === '' || isValidAddress(inputValue)) {
      setIsValid(true);
      if (inputValue && isValidAddress(inputValue)) {
        onRecipientChange(inputValue);
      }
    } else {
      setIsValid(false);
    }
  }, [inputValue, onRecipientChange]);

  const handleUseMyWallet = () => {
    if (connectedAddress) {
      setInputValue(connectedAddress);
      onRecipientChange(connectedAddress);
    }
  };

  const handleCopy = async () => {
    if (recipient) {
      await navigator.clipboard.writeText(recipient);
      toast.success('Đã copy địa chỉ');
    }
  };

  const isUsingOwnWallet = recipient === connectedAddress;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-xs font-medium text-muted-foreground flex items-center gap-1">
          📍 Recipient Address
        </label>
        {recipient && (
          <Badge 
            variant="outline" 
            className={`text-xs ${
              isUsingOwnWallet 
                ? 'border-primary/30 text-primary bg-primary/5' 
                : 'border-cyan-300 text-cyan-700 bg-cyan-50'
            }`}
          >
            {isUsingOwnWallet ? 'Your Wallet' : 'Custom Address'}
          </Badge>
        )}
      </div>
      
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Input
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="0x..."
            className={`font-mono text-xs pr-16 ${
              !isValid ? 'border-destructive focus-visible:ring-destructive' : ''
            }`}
          />
          <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
            {inputValue && (
              isValid ? (
                <CheckCircle2 className="w-4 h-4 text-green-500" />
              ) : (
                <XCircle className="w-4 h-4 text-destructive" />
              )
            )}
            {recipient && isValid && (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={handleCopy}
                className="h-6 w-6 p-0"
              >
                <Copy className="w-3 h-3" />
              </Button>
            )}
          </div>
        </div>
      </div>

      {!isValid && inputValue && (
        <p className="text-xs text-destructive">
          Địa chỉ không hợp lệ. Phải là 0x + 40 ký tự hex.
        </p>
      )}

      {connectedAddress && !isUsingOwnWallet && (
        <Button
          variant="outline"
          size="sm"
          onClick={handleUseMyWallet}
          className="w-full gap-2 text-xs border-primary/30 text-primary hover:bg-primary/5"
        >
          <Wallet className="w-3 h-3" />
          Use My Wallet ({connectedAddress.slice(0, 6)}...{connectedAddress.slice(-4)})
        </Button>
      )}
    </div>
  );
}
