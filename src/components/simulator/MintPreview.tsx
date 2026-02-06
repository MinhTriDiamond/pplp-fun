import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, XCircle, Clock, Coins } from 'lucide-react';
import { formatFunAmount } from '@/lib/pplp-engine';
import { MintButton } from '@/components/simulator/MintButton';
import { MintValidationPanel } from '@/components/simulator/MintValidationPanel';
import type { ScoringResult, MintDecision } from '@/types/pplp.types';
import type { MintValidation } from '@/lib/mint-validator';

interface MintPreviewProps {
  result: ScoringResult | null;
  lightScore: number;
  unityScore: number;
  actionType: string | null;
}

const decisionConfig: Record<MintDecision, { 
  icon: typeof CheckCircle2; 
  color: string; 
  bgColor: string;
  label: string;
}> = {
  AUTHORIZE: { 
    icon: CheckCircle2, 
    color: 'text-green-500', 
    bgColor: 'bg-green-500/10 border-green-500/30',
    label: 'AUTHORIZED'
  },
  REJECT: { 
    icon: XCircle, 
    color: 'text-destructive', 
    bgColor: 'bg-destructive/10 border-destructive/30',
    label: 'REJECTED'
  },
  REVIEW_HOLD: { 
    icon: Clock, 
    color: 'text-yellow-500', 
    bgColor: 'bg-yellow-500/10 border-yellow-500/30',
    label: 'REVIEW HOLD'
  },
};

export function MintPreview({ result, lightScore, unityScore, actionType }: MintPreviewProps) {
  const [validation, setValidation] = useState<MintValidation | null>(null);
  
  if (!result) {
    return (
      <div className="space-y-4">
        <Card className="border-primary/30 bg-gradient-to-br from-primary/5 to-accent/5">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <Coins className="h-5 w-5 text-primary" />
              Mint Preview
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center py-8">
            <div className="text-4xl font-bold text-muted-foreground/50 mb-2">
              0 FUN
            </div>
            <p className="text-sm text-muted-foreground">
              Chọn action để xem số FUN Money có thể mint
            </p>
          </CardContent>
        </Card>
        
        {/* Validation Panel */}
        <MintValidationPanel 
          actionType={actionType} 
          onValidationComplete={setValidation}
        />
      </div>
    );
  }

  const decision = decisionConfig[result.decision];
  const DecisionIcon = decision.icon;
  const mintAmount = formatFunAmount(result.calculatedAmountAtomic);
  const baseReward = formatFunAmount(result.baseRewardAtomic);

  return (
    <Card className={`border ${decision.bgColor}`}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Coins className="h-5 w-5 text-primary" />
            Mint Preview
          </CardTitle>
          <Badge className={`${decision.color} border-0`} variant="outline">
            <DecisionIcon className="h-3 w-3 mr-1" />
            {decision.label}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Final Amount */}
        <div className="text-center py-4">
          <div className={`text-5xl font-bold ${result.decision === 'AUTHORIZE' ? 'text-primary' : 'text-muted-foreground'}`}>
            {result.decision === 'AUTHORIZE' ? mintAmount : '0 FUN'}
          </div>
          {result.decision === 'AUTHORIZE' && (
            <p className="text-sm text-muted-foreground mt-2">
              FUN Money to mint
            </p>
          )}
        </div>

        {/* Formula Breakdown */}
        <div className="p-4 rounded-lg bg-muted/50 space-y-3">
          <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            Formula Breakdown
          </div>
          
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Base Reward (BR)</span>
            <span className="font-mono">{baseReward}</span>
          </div>

          <div className="border-t border-border pt-3 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Q (Quality)</span>
              <span className="font-mono">×{result.multipliers.Q.toFixed(2)}</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">I (Impact)</span>
              <span className="font-mono">×{result.multipliers.I.toFixed(2)}</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">K (Integrity)</span>
              <span className="font-mono">×{result.multipliers.K.toFixed(2)}</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Ux (Unity)</span>
              <span className="font-mono">×{result.multipliers.Ux.toFixed(2)}</span>
            </div>
          </div>

          <div className="border-t border-border pt-3">
            <div className="text-xs text-center text-muted-foreground font-mono">
              {baseReward.split(' ')[0]} × {result.multipliers.Q.toFixed(2)} × {result.multipliers.I.toFixed(2)} × {result.multipliers.K.toFixed(2)} × {result.multipliers.Ux.toFixed(2)}
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 gap-2 text-center">
          <div className="p-2 rounded bg-muted/30">
            <div className="text-xs text-muted-foreground">Light Score</div>
            <div className="font-bold">{lightScore}</div>
          </div>
          <div className="p-2 rounded bg-muted/30">
            <div className="text-xs text-muted-foreground">Unity Score</div>
            <div className="font-bold">{unityScore}</div>
          </div>
        </div>

        {/* Validation Panel */}
        <MintValidationPanel 
          actionType={actionType} 
          onValidationComplete={setValidation}
        />

        {/* Mint Button */}
        <div className="pt-2">
          <MintButton 
            result={result} 
            actionType={actionType} 
            disabled={!validation?.canMint}
          />
        </div>
      </CardContent>
    </Card>
  );
}
