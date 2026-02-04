import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, XCircle, AlertCircle } from 'lucide-react';
import type { ScoringResult } from '@/types/pplp.types';

interface ScoringResultsProps {
  result: ScoringResult | null;
  lightScore: number;
  unityScore: number;
  integrityK: number;
  unityMultiplier: number;
  crossPlatformBonus: number;
}

export function ScoringResults({
  result,
  lightScore,
  unityScore,
  integrityK,
  unityMultiplier,
  crossPlatformBonus,
}: ScoringResultsProps) {
  if (!result) {
    return (
      <Card className="border-dashed border-muted-foreground/30">
        <CardContent className="flex flex-col items-center justify-center py-12 text-center">
          <AlertCircle className="h-12 w-12 text-muted-foreground/50 mb-4" />
          <p className="text-muted-foreground">
            Chọn Platform và Action để xem kết quả scoring
          </p>
        </CardContent>
      </Card>
    );
  }

  const multipliers = [
    { key: 'Q', label: 'Quality', value: result.multipliers.Q, color: 'text-blue-500' },
    { key: 'I', label: 'Impact', value: result.multipliers.I, color: 'text-green-500' },
    { key: 'K', label: 'Integrity', value: result.multipliers.K, color: 'text-yellow-500' },
    { key: 'Ux', label: 'Unity', value: result.multipliers.Ux, color: 'text-purple-500' },
  ];

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">Scoring Breakdown</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Scores Grid */}
        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 rounded-lg bg-primary/10 border border-primary/20 text-center">
            <div className="text-sm text-muted-foreground mb-1">Light Score</div>
            <div className="text-3xl font-bold text-primary">{lightScore}</div>
            <div className="text-xs text-muted-foreground mt-1">
              {lightScore >= 60 ? '✓ Pass' : '✗ Below 60'}
            </div>
          </div>
          <div className="p-4 rounded-lg bg-purple-500/10 border border-purple-500/20 text-center">
            <div className="text-sm text-muted-foreground mb-1">Unity Score</div>
            <div className="text-3xl font-bold text-purple-500">{unityScore}</div>
            <div className="text-xs text-muted-foreground mt-1">
              Ux = ×{unityMultiplier.toFixed(2)}
            </div>
          </div>
        </div>

        {/* Multipliers Table */}
        <div className="space-y-2">
          <div className="text-sm font-medium">Multipliers</div>
          <div className="grid grid-cols-4 gap-2">
            {multipliers.map((m) => (
              <div 
                key={m.key} 
                className="p-3 rounded-lg bg-muted/50 text-center"
              >
                <div className="text-xs text-muted-foreground">{m.key}</div>
                <div className={`text-xl font-bold ${m.color}`}>
                  {m.value.toFixed(2)}
                </div>
              </div>
            ))}
          </div>
          {crossPlatformBonus > 0 && (
            <div className="text-xs text-center text-green-500">
              +{crossPlatformBonus.toFixed(2)} cross-platform bonus included in Ux
            </div>
          )}
        </div>

        {/* Threshold Results */}
        {result.reasonCodes.length > 0 && (
          <div className="space-y-2">
            <div className="text-sm font-medium text-destructive">Failed Thresholds</div>
            <div className="space-y-1">
              {result.reasonCodes.map((reason, i) => (
                <div 
                  key={i} 
                  className="flex items-start gap-2 text-xs text-destructive/80 p-2 rounded bg-destructive/10"
                >
                  <XCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
                  <span>{reason}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {result.decision === 'AUTHORIZE' && result.reasonCodes.length === 0 && (
          <div className="flex items-center gap-2 text-green-500 p-3 rounded-lg bg-green-500/10">
            <CheckCircle2 className="h-5 w-5" />
            <span className="text-sm font-medium">All thresholds passed!</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
