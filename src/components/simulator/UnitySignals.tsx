import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import type { UnitySignals as UnitySignalsType } from '@/types/pplp.types';

interface UnitySignalsProps {
  signals: Partial<UnitySignalsType>;
  onChange: (signals: Partial<UnitySignalsType>) => void;
  unityScore: number;
  unityMultiplier: number;
}

const signalConfig = [
  { key: 'collaboration', label: 'Collaboration', weight: 40, description: 'Có sự hợp tác với người khác' },
  { key: 'beneficiaryConfirmed', label: 'Beneficiary Confirmed', weight: 30, description: 'Người thụ hưởng xác nhận' },
  { key: 'communityEndorsement', label: 'Community Endorsement', weight: 20, description: 'Cộng đồng ủng hộ' },
  { key: 'bridgeValue', label: 'Bridge Value', weight: 10, description: 'Kết nối giá trị giữa platforms' },
  { key: 'partnerAttested', label: 'Partner Attested', weight: 0, description: '+0.3 Ux bonus' },
] as const;

export function UnitySignals({ signals, onChange, unityScore, unityMultiplier }: UnitySignalsProps) {
  const handleBooleanChange = (key: keyof UnitySignalsType, checked: boolean) => {
    onChange({
      ...signals,
      [key]: checked
    });
  };

  const handleWitnessChange = (value: string) => {
    const count = parseInt(value) || 0;
    onChange({
      ...signals,
      witnessCount: Math.max(0, Math.min(10, count))
    });
  };

  return (
    <div className="space-y-6">
      {/* Unity Score Display */}
      <div className="p-4 rounded-lg bg-purple-500/10 border border-purple-500/20">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium">Unity Score</span>
          <span className="text-2xl font-bold text-purple-500">{unityScore}</span>
        </div>
        <Progress value={unityScore} className="h-2" />
        <div className="flex justify-between items-center mt-3">
          <span className="text-sm text-muted-foreground">Unity Multiplier (Ux)</span>
          <span className="text-lg font-bold text-purple-400">×{unityMultiplier.toFixed(2)}</span>
        </div>
      </div>

      {/* Signal Toggles */}
      <div className="space-y-4">
        {signalConfig.map((signal) => (
          <div key={signal.key} className="flex items-start gap-3">
            <Checkbox
              id={signal.key}
              checked={!!signals[signal.key]}
              onCheckedChange={(checked) => 
                handleBooleanChange(signal.key, checked as boolean)
              }
              className="mt-0.5"
            />
            <div className="flex-1">
              <Label htmlFor={signal.key} className="text-sm font-medium cursor-pointer">
                {signal.label}
                {signal.weight > 0 && (
                  <span className="ml-2 text-xs text-muted-foreground">({signal.weight}%)</span>
                )}
              </Label>
              <p className="text-xs text-muted-foreground mt-0.5">{signal.description}</p>
            </div>
          </div>
        ))}

        {/* Witness Count */}
        <div className="flex items-center gap-3">
          <div className="flex-1">
            <Label htmlFor="witnessCount" className="text-sm font-medium">
              Witness Count
              <span className="ml-2 text-xs text-muted-foreground">(≥3 = +0.2 Ux)</span>
            </Label>
          </div>
          <Input
            id="witnessCount"
            type="number"
            value={signals.witnessCount || 0}
            onChange={(e) => handleWitnessChange(e.target.value)}
            min={0}
            max={10}
            className="w-20 text-center"
          />
        </div>
      </div>
    </div>
  );
}
