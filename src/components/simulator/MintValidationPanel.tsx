import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  CheckCircle2, 
  XCircle, 
  AlertCircle, 
  RefreshCw,
  Shield,
  Loader2
} from 'lucide-react';
import { useWallet } from '@/hooks/useWallet';
import { validateBeforeMint, type MintValidation, type ValidationDetail } from '@/lib/mint-validator';

interface MintValidationPanelProps {
  actionType: string | null;
  onValidationComplete?: (validation: MintValidation | null) => void;
}

export function MintValidationPanel({ actionType, onValidationComplete }: MintValidationPanelProps) {
  const { isConnected, isCorrectChain, address, provider } = useWallet();
  const [validation, setValidation] = useState<MintValidation | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canValidate = isConnected && isCorrectChain && provider && address && actionType;

  const runValidation = async () => {
    if (!canValidate) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await validateBeforeMint(provider, address, actionType);
      setValidation(result);
      onValidationComplete?.(result);
    } catch (err: any) {
      setError(err.message || 'Validation failed');
      setValidation(null);
      onValidationComplete?.(null);
    } finally {
      setIsLoading(false);
    }
  };

  // Auto-run validation when action changes
  useEffect(() => {
    if (canValidate) {
      runValidation();
    } else {
      setValidation(null);
      onValidationComplete?.(null);
    }
  }, [actionType, address, isConnected, isCorrectChain]);

  // Don't show if not connected
  if (!isConnected || !isCorrectChain) {
    return null;
  }

  return (
    <Card className="bg-white/90 backdrop-blur-sm border-cyan-200">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-2 text-cyan-700">
            <Shield className="w-4 h-4" />
            Pre-Mint Validation
          </div>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={runValidation}
            disabled={!canValidate || isLoading}
            className="h-7 px-2"
          >
            <RefreshCw className={`w-3 h-3 ${isLoading ? 'animate-spin' : ''}`} />
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        {isLoading ? (
          <div className="flex items-center justify-center py-4 gap-2 text-muted-foreground">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span className="text-sm">Đang kiểm tra...</span>
          </div>
        ) : error ? (
          <div className="flex items-center gap-2 p-3 bg-destructive/10 rounded-lg text-destructive text-sm">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        ) : validation ? (
          <div className="space-y-2">
            {validation.details.map((detail) => (
              <ValidationRow key={detail.key} detail={detail} />
            ))}
            
            {/* Summary */}
            <div className={`mt-3 p-3 rounded-lg text-sm ${
              validation.canMint 
                ? 'bg-green-50 text-green-700 border border-green-200' 
                : 'bg-amber-50 text-amber-700 border border-amber-200'
            }`}>
              {validation.canMint ? (
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4" />
                  <span className="font-medium">Sẵn sàng Mint!</span>
                </div>
              ) : (
                <div>
                  <div className="flex items-center gap-2 font-medium mb-1">
                    <AlertCircle className="w-4 h-4" />
                    Chưa thể Mint
                  </div>
                  <ul className="text-xs space-y-0.5 ml-6">
                    {validation.issues.map((issue, idx) => (
                      <li key={idx}>{issue}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        ) : !actionType ? (
          <p className="text-sm text-muted-foreground text-center py-3">
            Chọn Action để kiểm tra điều kiện mint
          </p>
        ) : null}
      </CardContent>
    </Card>
  );
}

function ValidationRow({ detail }: { detail: ValidationDetail }) {
  return (
    <div className={`flex items-center justify-between p-2 rounded-lg text-sm ${
      detail.passed ? 'bg-green-50' : 'bg-red-50'
    }`}>
      <div className="flex items-center gap-2">
        {detail.passed ? (
          <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0" />
        ) : (
          <XCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
        )}
        <span className={detail.passed ? 'text-green-700' : 'text-red-700'}>
          {detail.labelVi}
        </span>
      </div>
      <Badge 
        variant="outline" 
        className={`text-xs font-mono ${
          detail.passed 
            ? 'border-green-300 text-green-700 bg-green-100' 
            : 'border-red-300 text-red-700 bg-red-100'
        }`}
      >
        {detail.value}
      </Badge>
    </div>
  );
}
