import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Sparkles, ListChecks, Pen, Gift } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { WalletConnect } from '@/components/wallet/WalletConnect';
import { UserMenu } from '@/components/auth/UserMenu';
import { SimulatorTab } from '@/components/simulator/SimulatorTab';
import { MintRequestsTab } from '@/components/simulator/MintRequestsTab';
import { ClaimTab } from '@/components/simulator/ClaimTab';
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
  const [platformId, setPlatformId] = useState<PlatformId | null>(null);
  const [actionType, setActionType] = useState<string | null>(null);
  const [pillarScores, setPillarScores] = useState<PillarScores>({ S: 75, T: 80, H: 70, C: 75, U: 70 });
  const [unitySignals, setUnitySignals] = useState<Partial<UnitySignalsType>>({
    collaboration: true, beneficiaryConfirmed: false, communityEndorsement: false,
    bridgeValue: false, conflictResolution: false, partnerAttested: false, witnessCount: 0
  });
  const [userTier, setUserTier] = useState<0 | 1 | 2 | 3>(1);
  const [antiSybilScore, setAntiSybilScore] = useState(0.85);
  const [hasStake, setHasStake] = useState(false);
  const [activePlatforms, setActivePlatforms] = useState<PlatformId[]>(['FUN_PROFILE', 'FUN_ACADEMY']);
  const [scoringResult, setScoringResult] = useState<ScoringResult | null>(null);

  const lightScore = useMemo(() => calculateLightScore(pillarScores), [pillarScores]);
  const unityScore = useMemo(() => calculateUnityScore(unitySignals), [unitySignals]);
  const unityMultiplier = useMemo(() => calculateUnityMultiplier(unityScore, unitySignals, userTier), [unityScore, unitySignals, userTier]);
  const integrityK = useMemo(() => calculateIntegrityMultiplier(antiSybilScore, hasStake), [antiSybilScore, hasStake]);
  const crossPlatformBonus = useMemo(() => calculateCrossPlatformBonus(activePlatforms), [activePlatforms]);

  useEffect(() => {
    if (!platformId || !actionType) { setScoringResult(null); return; }
    try {
      const userReputation: UserReputation = {
        userId: 'simulator_user', lightScore, pillarScores, tier: userTier,
        verifiedActionsCount: userTier === 0 ? 0 : userTier === 1 ? 15 : userTier === 2 ? 60 : 250,
        avgIntegrityK: antiSybilScore, activePlatforms, lastActivityDate: new Date(), decayApplied: false
      };
      const input: ScoringInput = { platformId, actionType, pillarScores, unitySignals, userReputation, antiSybilScore, hasStake };
      setScoringResult(scoreAction(input));
    } catch (error) {
      console.error('Scoring error:', error);
      setScoringResult(null);
    }
  }, [platformId, actionType, pillarScores, unitySignals, userTier, antiSybilScore, hasStake, activePlatforms, lightScore]);

  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      <header className="border-b border-border/50 bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0">
              <Link to="/">
                <Button variant="ghost" size="icon" className="shrink-0 h-8 w-8">
                  <ArrowLeft className="h-4 w-4" />
                </Button>
              </Link>
              <div className="flex items-center gap-1.5 min-w-0">
                <Sparkles className="h-5 w-5 text-primary shrink-0" />
                <h1 className="text-base md:text-xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent truncate">
                  PPLP Simulator
                </h1>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <p className="text-sm text-muted-foreground hidden lg:block">Test & Mint FUN Money</p>
              <UserMenu />
              <div className="hidden sm:block">
                <WalletConnect />
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        <Tabs defaultValue="simulator" className="space-y-6">
          <TabsList className="grid w-full max-w-lg grid-cols-4 h-auto">
            <TabsTrigger value="simulator" className="gap-1 text-xs sm:text-sm px-2">
              <Sparkles className="h-3.5 w-3.5 shrink-0" /> <span className="hidden sm:inline">Simulator</span><span className="sm:hidden">Sim</span>
            </TabsTrigger>
            <TabsTrigger value="requests" className="gap-1 text-xs sm:text-sm px-2">
              <ListChecks className="h-3.5 w-3.5 shrink-0" /> <span className="hidden sm:inline">Requests</span><span className="sm:hidden">Req</span>
            </TabsTrigger>
            <TabsTrigger value="sign" className="gap-1 text-xs sm:text-sm px-2">
              <Pen className="h-3.5 w-3.5 shrink-0" /> Sign
            </TabsTrigger>
            <TabsTrigger value="claim" className="gap-1 text-xs sm:text-sm px-2">
              <Gift className="h-3.5 w-3.5 shrink-0" /> Claim
            </TabsTrigger>
          </TabsList>

          <TabsContent value="simulator">
            <SimulatorTab
              platformId={platformId} actionType={actionType}
              pillarScores={pillarScores} unitySignals={unitySignals}
              userTier={userTier} antiSybilScore={antiSybilScore}
              hasStake={hasStake} activePlatforms={activePlatforms}
              scoringResult={scoringResult} lightScore={lightScore}
              unityScore={unityScore} unityMultiplier={unityMultiplier}
              integrityK={integrityK} crossPlatformBonus={crossPlatformBonus}
              onPlatformChange={setPlatformId} onActionChange={setActionType}
              onPillarChange={setPillarScores} onUnityChange={setUnitySignals}
              onTierChange={setUserTier} onAntiSybilChange={setAntiSybilScore}
              onStakeChange={setHasStake} onPlatformsChange={setActivePlatforms}
            />
          </TabsContent>

          <TabsContent value="requests">
            <MintRequestsTab />
          </TabsContent>

          <TabsContent value="sign">
            <MintRequestsTab />
          </TabsContent>

          <TabsContent value="claim">
            <ClaimTab />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
