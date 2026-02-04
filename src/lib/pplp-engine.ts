// PPLP Scoring Engine - Proof of Pure Love Protocol
import type { 
  PillarScores, 
  UnitySignals, 
  Multipliers, 
  ScoringResult, 
  MintDecision,
  UserReputation,
  ActionConfig,
  PlatformId
} from '@/types/pplp.types';
import policyJson from '@/config/pplp-policy-v1.0.2.json';

// ============================================
// LIGHT SCORE CALCULATION
// Formula: 0.25*S + 0.20*T + 0.20*H + 0.20*C + 0.15*U
// ============================================

export function calculateLightScore(pillars: PillarScores): number {
  const weights = policyJson.scoring.weights;
  const score = 
    weights.S * pillars.S +
    weights.T * pillars.T +
    weights.H * pillars.H +
    weights.C * pillars.C +
    weights.U * pillars.U;
  
  return Math.round(score * 100) / 100;
}

// ============================================
// UNITY SCORE CALCULATION
// Weights: collaboration(40%) + beneficiaryConfirmed(30%) + communityEndorsement(20%) + bridgeValue(10%)
// ============================================

export function calculateUnityScore(signals: Partial<UnitySignals>): number {
  const weights = policyJson.unity.unityScoreWeightsMVP;
  
  let score = 0;
  
  if (signals.collaboration) {
    score += weights.collaboration * 100;
  }
  if (signals.beneficiaryConfirmed) {
    score += weights.beneficiaryConfirmed * 100;
  }
  if (signals.communityEndorsement) {
    score += weights.communityEndorsement * 100;
  }
  if (signals.bridgeValue) {
    score += weights.bridgeValue * 100;
  }
  if (signals.conflictResolution) {
    score += weights.conflictResolution * 100;
  }
  
  return Math.min(100, Math.round(score));
}

// ============================================
// UNITY MULTIPLIER (Ux) CALCULATION
// Maps Unity Score (0-100) to Ux (0.5 - 2.5)
// ============================================

export function calculateUnityMultiplier(
  unityScore: number, 
  signals: Partial<UnitySignals>,
  userTier: number
): number {
  const mapping = policyJson.unity.unityMultiplierMapping;
  const bonuses = policyJson.unity.unityBonuses;
  const tierRules = policyJson.tiers.tierRulesMVP;
  
  // Base Ux from score
  let ux = 0.5;
  for (const range of mapping) {
    if (unityScore >= range.minU && unityScore <= range.maxU) {
      ux = range.Ux;
      break;
    }
  }
  
  // Apply bonuses
  for (const bonus of bonuses) {
    if (bonus.if.partnerAttested && signals.partnerAttested) {
      ux = Math.min(bonus.capUx, ux + bonus.addUx);
    }
    if (bonus.if.beneficiaryConfirmed && signals.beneficiaryConfirmed) {
      ux = Math.min(bonus.capUx, ux + bonus.addUx);
    }
    if (bonus.if.witnessCountGte && signals.witnessCount && signals.witnessCount >= (bonus.if.witnessCountGte as number)) {
      ux = Math.min(bonus.capUx, ux + bonus.addUx);
    }
  }
  
  // Enforce tier max Ux
  const tierRule = tierRules.find(t => t.tier === userTier);
  if (tierRule && policyJson.scoring.multiplierCaps.enforceTierUxMax) {
    ux = Math.min(ux, tierRule.maxUx);
  }
  
  return Math.round(ux * 100) / 100;
}

// ============================================
// INTEGRITY MULTIPLIER (K) CALCULATION
// Based on anti-sybil score, stake boost, behavior
// ============================================

export function calculateIntegrityMultiplier(
  antiSybilScore: number,
  hasStake: boolean = false,
  behaviorScore: number = 1.0
): number {
  const integrity = policyJson.integrity;
  
  // If below minimum, reject
  if (antiSybilScore < integrity.antiSybil.minAntiSybilScore) {
    return 0;
  }
  
  let k = antiSybilScore;
  
  // Apply stake boost
  if (hasStake && integrity.stakeForTrust.enabled) {
    k = Math.min(1.0, k * integrity.stakeForTrust.boostMax);
  }
  
  // Apply behavior boost
  k = Math.min(1.0, k * Math.min(integrity.stakeForTrust.behaviorBoostMax, behaviorScore));
  
  return Math.round(k * 100) / 100;
}

// ============================================
// MINT AMOUNT CALCULATION
// Formula: amountAtomic = BR × Q × I × K × Ux
// ============================================

export function calculateMintAmount(
  baseRewardAtomic: string,
  multipliers: Multipliers
): string {
  const br = BigInt(baseRewardAtomic);
  const product = multipliers.Q * multipliers.I * multipliers.K * multipliers.Ux;
  
  // Cap Q*I product
  const qiProduct = multipliers.Q * multipliers.I;
  const cappedProduct = qiProduct > policyJson.scoring.multiplierCaps.maxQIProduct 
    ? (policyJson.scoring.multiplierCaps.maxQIProduct / qiProduct) * product
    : product;
  
  // Calculate with precision (multiply by 10000, then divide)
  const multiplied = br * BigInt(Math.floor(cappedProduct * 10000)) / BigInt(10000);
  
  // Apply max cap
  const maxCap = BigInt(policyJson.scoring.multiplierCaps.maxAmountAtomicPerAction);
  const minMint = BigInt(policyJson.minting.minMintAmountAtomic);
  
  let result = multiplied;
  if (result > maxCap) result = maxCap;
  if (result < minMint) result = minMint;
  
  return result.toString();
}

// ============================================
// THRESHOLD VALIDATION
// Check if action meets minimum requirements
// ============================================

export function validateThresholds(
  pillars: PillarScores,
  lightScore: number,
  integrityK: number,
  unityScore: number,
  actionConfig: ActionConfig
): { passed: boolean; failedReasons: string[] } {
  const reasons: string[] = [];
  const thresholds = actionConfig.thresholds;
  const globalThresholds = policyJson.scoring.thresholdsGlobal;
  
  // Global thresholds
  if (pillars.T < globalThresholds.minTruthT) {
    reasons.push(`Truth score ${pillars.T} below global minimum ${globalThresholds.minTruthT}`);
  }
  if (integrityK < globalThresholds.minIntegrityK) {
    reasons.push(`Integrity K ${integrityK} below global minimum ${globalThresholds.minIntegrityK}`);
  }
  if (lightScore < globalThresholds.minLightScore) {
    reasons.push(`Light score ${lightScore} below global minimum ${globalThresholds.minLightScore}`);
  }
  
  // Action-specific thresholds
  if (thresholds.T && pillars.T < thresholds.T) {
    reasons.push(`Truth score ${pillars.T} below action threshold ${thresholds.T}`);
  }
  if (thresholds.S && pillars.S < thresholds.S) {
    reasons.push(`Service score ${pillars.S} below action threshold ${thresholds.S}`);
  }
  if (thresholds.H && pillars.H < thresholds.H) {
    reasons.push(`Healing score ${pillars.H} below action threshold ${thresholds.H}`);
  }
  if (thresholds.C && pillars.C < thresholds.C) {
    reasons.push(`Contribution score ${pillars.C} below action threshold ${thresholds.C}`);
  }
  if (lightScore < thresholds.minLightScore) {
    reasons.push(`Light score ${lightScore} below action threshold ${thresholds.minLightScore}`);
  }
  if (integrityK < thresholds.minK) {
    reasons.push(`Integrity K ${integrityK} below action threshold ${thresholds.minK}`);
  }
  if (thresholds.minU && unityScore < thresholds.minU) {
    reasons.push(`Unity score ${unityScore} below action threshold ${thresholds.minU}`);
  }
  
  return {
    passed: reasons.length === 0,
    failedReasons: reasons
  };
}

// ============================================
// CROSS-PLATFORM BONUS
// Rewards users active on multiple platforms
// ============================================

export function calculateCrossPlatformBonus(activePlatforms: PlatformId[]): number {
  const config = policyJson.crossPlatformBonus;
  
  if (!config.enabled || activePlatforms.length < config.minPlatforms) {
    return 0;
  }
  
  const platformCount = activePlatforms.length;
  const bonus = (platformCount - config.minPlatforms + 1) * config.bonusUx;
  
  return Math.min(config.maxBonusUx, bonus);
}

// ============================================
// FULL SCORING PIPELINE
// Main function to process an action
// ============================================

export interface ScoringInput {
  platformId: PlatformId;
  actionType: string;
  pillarScores: PillarScores;
  unitySignals: Partial<UnitySignals>;
  userReputation: UserReputation;
  antiSybilScore: number;
  hasStake?: boolean;
}

export function scoreAction(input: ScoringInput): ScoringResult {
  const platform = policyJson.platforms[input.platformId];
  if (!platform) {
    throw new Error(`Unknown platform: ${input.platformId}`);
  }
  
  const actionConfig = platform.actions[input.actionType] as ActionConfig | undefined;
  if (!actionConfig) {
    throw new Error(`Unknown action type: ${input.actionType} for platform ${input.platformId}`);
  }
  
  // Calculate scores
  const lightScore = calculateLightScore(input.pillarScores);
  const unityScore = calculateUnityScore(input.unitySignals);
  const integrityK = calculateIntegrityMultiplier(
    input.antiSybilScore, 
    input.hasStake, 
    input.userReputation.avgIntegrityK
  );
  const ux = calculateUnityMultiplier(unityScore, input.unitySignals, input.userReputation.tier);
  
  // Apply cross-platform bonus to Ux
  const crossBonus = calculateCrossPlatformBonus(input.userReputation.activePlatforms);
  const finalUx = Math.min(2.5, ux + crossBonus);
  
  // Calculate Q and I within ranges
  const qRange = actionConfig.multipliers.Q;
  const iRange = actionConfig.multipliers.I;
  
  // For simulation, use average of range (in real impl, this comes from evidence evaluation)
  const Q = (qRange[0] + qRange[1]) / 2;
  const I = (iRange[0] + iRange[1]) / 2;
  
  const multipliers: Multipliers = {
    Q: Math.round(Q * 100) / 100,
    I: Math.round(I * 100) / 100,
    K: integrityK,
    Ux: finalUx
  };
  
  // Validate thresholds
  const validation = validateThresholds(
    input.pillarScores,
    lightScore,
    integrityK,
    unityScore,
    actionConfig
  );
  
  // Determine decision
  let decision: MintDecision = 'AUTHORIZE';
  const reasonCodes: string[] = [];
  
  if (!validation.passed) {
    decision = 'REJECT';
    reasonCodes.push(...validation.failedReasons);
  }
  
  if (integrityK === 0) {
    decision = 'REJECT';
    reasonCodes.push('FRAUD_DETECTED');
  }
  
  // Calculate amount
  const calculatedAmountAtomic = decision === 'AUTHORIZE' 
    ? calculateMintAmount(actionConfig.baseRewardAtomic, multipliers)
    : '0';
  
  // Check if audit required
  const auditThreshold = BigInt(policyJson.audit.trigger.amountAtomicGte);
  if (BigInt(calculatedAmountAtomic) >= auditThreshold) {
    decision = 'REVIEW_HOLD';
    reasonCodes.push('AUDIT_TRIGGERED_LARGE_MINT');
  }
  
  return {
    actionId: `action_${Date.now()}`,
    pillarScores: input.pillarScores,
    lightScore,
    unityScore,
    multipliers,
    baseRewardAtomic: actionConfig.baseRewardAtomic,
    calculatedAmountAtomic,
    decision,
    reasonCodes,
    timestamp: new Date()
  };
}

// ============================================
// UTILITY FUNCTIONS
// ============================================

export function formatFunAmount(atomicAmount: string): string {
  const decimals = policyJson.token.decimals;
  const value = BigInt(atomicAmount);
  const divisor = BigInt(10 ** decimals);
  const whole = value / divisor;
  const fraction = value % divisor;
  
  if (fraction === BigInt(0)) {
    return `${whole.toString()} FUN`;
  }
  
  const fractionStr = fraction.toString().padStart(decimals, '0').slice(0, 2);
  return `${whole.toString()}.${fractionStr} FUN`;
}

export function getUserTier(reputation: Pick<UserReputation, 'verifiedActionsCount' | 'lightScore' | 'avgIntegrityK'>): 0 | 1 | 2 | 3 {
  const tiers = policyJson.tiers.tierRulesMVP;
  
  for (let i = tiers.length - 1; i >= 0; i--) {
    const tier = tiers[i];
    if (
      reputation.verifiedActionsCount >= tier.minVerifiedActions &&
      reputation.lightScore >= tier.minAvgLightScore &&
      reputation.avgIntegrityK >= tier.minAvgK
    ) {
      return tier.tier as 0 | 1 | 2 | 3;
    }
  }
  
  return 0;
}

export function getPlatformPoolPercentage(platformId: string): number {
  const pools = policyJson.platformPools;
  const total = BigInt(policyJson.epoch.totalMintCapPerEpochAtomic);
  const platformPool = BigInt(pools[platformId as keyof typeof pools] || '0');
  
  return Number((platformPool * BigInt(10000) / total)) / 100;
}

export function getAllPlatforms() {
  return Object.entries(policyJson.platforms).map(([id, config]) => ({
    id: id as PlatformId,
    name: config.name,
    description: config.description,
    icon: config.icon,
    actionCount: Object.keys(config.actions).length
  }));
}

export function getPlatformActions(platformId: PlatformId) {
  const platform = policyJson.platforms[platformId];
  if (!platform) return [];
  
  return Object.entries(platform.actions).map(([actionType, config]) => ({
    actionType,
    baseReward: formatFunAmount((config as ActionConfig).baseRewardAtomic),
    baseRewardAtomic: (config as ActionConfig).baseRewardAtomic,
    thresholds: (config as ActionConfig).thresholds,
    multipliers: (config as ActionConfig).multipliers
  }));
}

export function getDivineMantras(): string[] {
  return policyJson.divineMantras;
}

export { policyJson };
