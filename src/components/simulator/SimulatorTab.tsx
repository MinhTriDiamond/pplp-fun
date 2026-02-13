import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PlatformSelector } from '@/components/simulator/PlatformSelector';
import { PillarSliders } from '@/components/simulator/PillarSliders';
import { UnitySignals } from '@/components/simulator/UnitySignals';
import { UserProfileSim } from '@/components/simulator/UserProfileSim';
import { ScoringResults } from '@/components/simulator/ScoringResults';
import { MintPreview } from '@/components/simulator/MintPreview';
import { RadarChart } from '@/components/simulator/RadarChart';
import type { PlatformId, PillarScores, UnitySignals as UnitySignalsType, ScoringResult } from '@/types/pplp.types';

interface SimulatorTabProps {
  platformId: PlatformId | null;
  actionType: string | null;
  pillarScores: PillarScores;
  unitySignals: Partial<UnitySignalsType>;
  userTier: 0 | 1 | 2 | 3;
  antiSybilScore: number;
  hasStake: boolean;
  activePlatforms: PlatformId[];
  scoringResult: ScoringResult | null;
  lightScore: number;
  unityScore: number;
  unityMultiplier: number;
  integrityK: number;
  crossPlatformBonus: number;
  onPlatformChange: (id: PlatformId | null) => void;
  onActionChange: (action: string | null) => void;
  onPillarChange: (scores: PillarScores) => void;
  onUnityChange: (signals: Partial<UnitySignalsType>) => void;
  onTierChange: (tier: 0 | 1 | 2 | 3) => void;
  onAntiSybilChange: (score: number) => void;
  onStakeChange: (hasStake: boolean) => void;
  onPlatformsChange: (platforms: PlatformId[]) => void;
}

export function SimulatorTab({
  platformId, actionType, pillarScores, unitySignals,
  userTier, antiSybilScore, hasStake, activePlatforms,
  scoringResult, lightScore, unityScore, unityMultiplier, integrityK, crossPlatformBonus,
  onPlatformChange, onActionChange, onPillarChange, onUnityChange,
  onTierChange, onAntiSybilChange, onStakeChange, onPlatformsChange,
}: SimulatorTabProps) {
  return (
    <div className="grid gap-6 lg:grid-cols-3">
      {/* Left Column: Inputs */}
      <div className="lg:col-span-2 space-y-6">
        <Card className="border-primary/20">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg flex items-center gap-2">
              <span className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">1</span>
              Chọn Platform & Action
            </CardTitle>
          </CardHeader>
          <CardContent>
            <PlatformSelector
              platformId={platformId}
              actionType={actionType}
              onPlatformChange={(id) => {
                onPlatformChange(id);
                onActionChange(null);
              }}
              onActionChange={onActionChange}
            />
          </CardContent>
        </Card>

        <Card className="border-accent/20">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg flex items-center gap-2">
              <span className="w-8 h-8 rounded-full bg-accent/10 flex items-center justify-center text-accent font-bold">2</span>
              5 Trụ Cột Ánh Sáng
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              <PillarSliders pillarScores={pillarScores} onChange={onPillarChange} />
              <div className="flex items-center justify-center">
                <RadarChart pillarScores={pillarScores} lightScore={lightScore} />
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid md:grid-cols-2 gap-6">
          <Card className="border-purple-500/20">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg flex items-center gap-2">
                <span className="w-8 h-8 rounded-full bg-purple-500/10 flex items-center justify-center text-purple-500 font-bold">3</span>
                Unity Signals
              </CardTitle>
            </CardHeader>
            <CardContent>
              <UnitySignals
                signals={unitySignals}
                onChange={onUnityChange}
                unityScore={unityScore}
                unityMultiplier={unityMultiplier}
              />
            </CardContent>
          </Card>

          <Card className="border-green-500/20">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg flex items-center gap-2">
                <span className="w-8 h-8 rounded-full bg-green-500/10 flex items-center justify-center text-green-500 font-bold">4</span>
                User Profile
              </CardTitle>
            </CardHeader>
            <CardContent>
              <UserProfileSim
                tier={userTier}
                antiSybilScore={antiSybilScore}
                hasStake={hasStake}
                activePlatforms={activePlatforms}
                onTierChange={onTierChange}
                onAntiSybilChange={onAntiSybilChange}
                onStakeChange={onStakeChange}
                onPlatformsChange={onPlatformsChange}
                integrityK={integrityK}
                crossPlatformBonus={crossPlatformBonus}
              />
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Right Column: Results */}
      <div className="space-y-6">
        <MintPreview
          result={scoringResult}
          lightScore={lightScore}
          unityScore={unityScore}
          actionType={actionType}
          platformId={platformId}
        />
        <ScoringResults
          result={scoringResult}
          lightScore={lightScore}
          unityScore={unityScore}
          integrityK={integrityK}
          unityMultiplier={unityMultiplier}
          crossPlatformBonus={crossPlatformBonus}
        />
      </div>
    </div>
  );
}
