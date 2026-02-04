import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Sparkles } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PlatformSelector } from '@/components/simulator/PlatformSelector';
import { PillarSliders } from '@/components/simulator/PillarSliders';
import { UnitySignals } from '@/components/simulator/UnitySignals';
import { UserProfileSim } from '@/components/simulator/UserProfileSim';
import { ScoringResults } from '@/components/simulator/ScoringResults';
import { MintPreview } from '@/components/simulator/MintPreview';
import { RadarChart } from '@/components/simulator/RadarChart';
import { 
  scoreAction, 
  calculateLightScore, 
  calculateUnityScore,
  calculateUnityMultiplier,
  calculateIntegrityMultiplier,
  calculateCrossPlatformBonus,
  type ScoringInput 
} from '@/lib/pplp-engine';
import type { PlatformId, PillarScores, UnitySignals as UnitySignalsType, ScoringResult, UserReputation } from '@/types/pplp.types';

export default function Simulator() {
  // Platform & Action State
  const [platformId, setPlatformId] = useState<PlatformId | null>(null);
  const [actionType, setActionType] = useState<string | null>(null);

  // Pillar Scores State
  const [pillarScores, setPillarScores] = useState<PillarScores>({
    S: 75,
    T: 80,
    H: 70,
    C: 75,
    U: 70
  });

  // Unity Signals State
  const [unitySignals, setUnitySignals] = useState<Partial<UnitySignalsType>>({
    collaboration: true,
    beneficiaryConfirmed: false,
    communityEndorsement: false,
    bridgeValue: false,
    conflictResolution: false,
    partnerAttested: false,
    witnessCount: 0
  });

  // User Profile State
  const [userTier, setUserTier] = useState<0 | 1 | 2 | 3>(1);
  const [antiSybilScore, setAntiSybilScore] = useState(0.85);
  const [hasStake, setHasStake] = useState(false);
  const [activePlatforms, setActivePlatforms] = useState<PlatformId[]>(['FUN_PROFILE', 'FUN_ACADEMY']);

  // Scoring Result State
  const [scoringResult, setScoringResult] = useState<ScoringResult | null>(null);

  // Calculated values
  const lightScore = useMemo(() => calculateLightScore(pillarScores), [pillarScores]);
  const unityScore = useMemo(() => calculateUnityScore(unitySignals), [unitySignals]);
  const unityMultiplier = useMemo(() => 
    calculateUnityMultiplier(unityScore, unitySignals, userTier), 
    [unityScore, unitySignals, userTier]
  );
  const integrityK = useMemo(() => 
    calculateIntegrityMultiplier(antiSybilScore, hasStake), 
    [antiSybilScore, hasStake]
  );
  const crossPlatformBonus = useMemo(() => 
    calculateCrossPlatformBonus(activePlatforms), 
    [activePlatforms]
  );

  // Run scoring when inputs change
  useEffect(() => {
    if (!platformId || !actionType) {
      setScoringResult(null);
      return;
    }

    try {
      const userReputation: UserReputation = {
        userId: 'simulator_user',
        lightScore: lightScore,
        pillarScores: pillarScores,
        tier: userTier,
        verifiedActionsCount: userTier === 0 ? 0 : userTier === 1 ? 15 : userTier === 2 ? 60 : 250,
        avgIntegrityK: antiSybilScore,
        activePlatforms: activePlatforms,
        lastActivityDate: new Date(),
        decayApplied: false
      };

      const input: ScoringInput = {
        platformId,
        actionType,
        pillarScores,
        unitySignals,
        userReputation,
        antiSybilScore,
        hasStake
      };

      const result = scoreAction(input);
      setScoringResult(result);
    } catch (error) {
      console.error('Scoring error:', error);
      setScoringResult(null);
    }
  }, [platformId, actionType, pillarScores, unitySignals, userTier, antiSybilScore, hasStake, activePlatforms, lightScore]);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/50 bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link to="/">
                <Button variant="ghost" size="sm" className="gap-2">
                  <ArrowLeft className="h-4 w-4" />
                  Trang chủ
                </Button>
              </Link>
              <div className="flex items-center gap-2">
                <Sparkles className="h-6 w-6 text-primary" />
                <h1 className="text-xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                  PPLP Simulator
                </h1>
              </div>
            </div>
            <p className="text-sm text-muted-foreground hidden md:block">
              Test & Demonstrate PPLP Scoring Engine
            </p>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Left Column: Inputs */}
          <div className="lg:col-span-2 space-y-6">
            {/* Platform & Action Selector */}
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
                    setPlatformId(id);
                    setActionType(null);
                  }}
                  onActionChange={setActionType}
                />
              </CardContent>
            </Card>

            {/* Pillar Sliders */}
            <Card className="border-accent/20">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg flex items-center gap-2">
                  <span className="w-8 h-8 rounded-full bg-accent/10 flex items-center justify-center text-accent font-bold">2</span>
                  5 Trụ Cột Ánh Sáng
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-6">
                  <PillarSliders 
                    pillarScores={pillarScores}
                    onChange={setPillarScores}
                  />
                  <div className="flex items-center justify-center">
                    <RadarChart pillarScores={pillarScores} lightScore={lightScore} />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Unity Signals & User Profile */}
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
                    onChange={setUnitySignals}
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
                    onTierChange={setUserTier}
                    onAntiSybilChange={setAntiSybilScore}
                    onStakeChange={setHasStake}
                    onPlatformsChange={setActivePlatforms}
                    integrityK={integrityK}
                    crossPlatformBonus={crossPlatformBonus}
                  />
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Right Column: Results */}
          <div className="space-y-6">
            {/* Mint Preview */}
            <MintPreview 
              result={scoringResult}
              lightScore={lightScore}
              unityScore={unityScore}
            />

            {/* Scoring Breakdown */}
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
      </main>
    </div>
  );
}
