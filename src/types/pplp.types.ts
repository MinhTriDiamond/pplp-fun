// PPLP Types - Proof of Pure Love Protocol

export type PlatformId = 
  | 'ANGEL_AI' 
  | 'FUN_PROFILE' 
  | 'FUN_PLAY' 
  | 'FUN_PLANET' 
  | 'FUN_CHARITY' 
  | 'FUN_FARM' 
  | 'FUN_ACADEMY' 
  | 'FUN_LEGAL' 
  | 'FUN_EARTH' 
  | 'FUN_TRADING' 
  | 'FUN_INVEST' 
  | 'FUNLIFE' 
  | 'FUN_MARKET' 
  | 'FUN_WALLET';

export type FraudType = 'BOT' | 'SYBIL' | 'COLLUSION' | 'SPAM' | 'WASH';

export type MintDecision = 'AUTHORIZE' | 'REJECT' | 'REVIEW_HOLD';

export type Pillar = 'S' | 'T' | 'H' | 'C' | 'U';

// 5 Pillars of Light Score
export interface PillarScores {
  S: number; // Service - Phụng sự sự sống
  T: number; // Truth - Chân thật minh bạch
  H: number; // Healing - Chữa lành & nâng đỡ
  C: number; // Contribution - Đóng góp bền vững
  U: number; // Unity - Hợp Nhất
}

// Unity Score Signals
export interface UnitySignals {
  collaboration: boolean;
  beneficiaryConfirmed: boolean;
  communityEndorsement: boolean;
  bridgeValue: boolean;
  conflictResolution: boolean;
  partnerAttested?: boolean;
  witnessCount?: number;
}

// Multipliers for mint calculation
export interface Multipliers {
  Q: number; // Quality (0.5 - 3.0)
  I: number; // Impact (0.5 - 5.0)
  K: number; // Integrity (0.0 - 1.0)
  Ux: number; // Unity Multiplier (0.5 - 2.5)
}

// User Tier (0-3)
export interface UserTier {
  tier: 0 | 1 | 2 | 3;
  minVerifiedActions: number;
  minAvgLightScore: number;
  minAvgK: number;
  maxUx: number;
  dailyCapAtomic: string;
}

// Light Action submitted by user
export interface LightAction {
  id: string;
  userId: string;
  platformId: PlatformId;
  actionType: string;
  evidence: ActionEvidence;
  unitySignals: Partial<UnitySignals>;
  timestamp: Date;
  status: 'PENDING' | 'REVIEW' | 'APPROVED' | 'REJECTED';
}

// Evidence for action verification
export interface ActionEvidence {
  type: 'TX_HASH' | 'FILE_PROOF' | 'PARTNER_ATTESTATION' | 'COMPLETION_LOG' | 'PHOTO_TIME' | 'GEO';
  data: string;
  attestorId?: string;
  witnessIds?: string[];
}

// Scoring result from PPLP Engine
export interface ScoringResult {
  actionId: string;
  pillarScores: PillarScores;
  lightScore: number;
  unityScore: number;
  multipliers: Multipliers;
  baseRewardAtomic: string;
  calculatedAmountAtomic: string;
  decision: MintDecision;
  reasonCodes: string[];
  timestamp: Date;
}

// Mint Request for authorization
export interface MintRequest {
  id: string;
  userId: string;
  actionId: string;
  amountAtomic: string;
  evidenceHash: string;
  policyVersion: number;
  validAfter: number;
  validBefore: number;
  nonce: number;
  status: 'PENDING' | 'SIGNED' | 'MINTED' | 'REJECTED';
}

// User Reputation
export interface UserReputation {
  userId: string;
  lightScore: number;
  pillarScores: PillarScores;
  tier: 0 | 1 | 2 | 3;
  verifiedActionsCount: number;
  avgIntegrityK: number;
  activePlatforms: PlatformId[];
  lastActivityDate: Date;
  decayApplied: boolean;
}

// Epoch Stats
export interface EpochStats {
  epochId: string;
  startTime: Date;
  endTime: Date;
  totalMintedAtomic: string;
  platformMints: Record<PlatformId, string>;
  activeUsers: number;
  actionsProcessed: number;
}

// Action Config from Policy
export interface ActionConfig {
  baseRewardAtomic: string;
  thresholds: {
    T?: number;
    S?: number;
    H?: number;
    C?: number;
    minLightScore: number;
    minK: number;
    minU?: number;
  };
  multipliers: {
    Q: [number, number];
    I: [number, number];
    K: [number, number];
  };
  unitySignals?: Partial<Record<keyof UnitySignals, boolean>>;
  antiSpam?: {
    rateLimitPerDay?: number;
    minQualitySignals?: number;
  };
  antiFarm?: {
    maxPerDay?: number;
    minSessionSec?: number;
    requiresWitnessForUxAbove?: number;
  };
  requiresPartnerAttestation?: boolean;
  requiresPeerReview?: boolean;
  requiresAttestation?: string[];
  requiresVerification?: string[];
  note?: string;
}

// Platform Config
export interface PlatformConfig {
  name: string;
  description: string;
  icon: string;
  actions: Record<string, ActionConfig>;
}

// Full Policy type
export interface PPLPPolicy {
  schema: string;
  name: string;
  release: string;
  policyVersion: number;
  description: string;
  effectiveFrom: string;
  notes: string[];
  token: {
    symbol: string;
    decimals: number;
    unit: string;
    mintRequestValidForSecDefault: number;
  };
  epoch: {
    durationSec: number;
    totalMintCapPerEpochAtomic: string;
    platformPoolMode: string;
    platformPoolRollover: boolean;
  };
  scoring: {
    pillars: Pillar[];
    weights: Record<Pillar, number>;
    thresholdsGlobal: {
      minTruthT: number;
      minIntegrityK: number;
      minLightScore: number;
    };
    lightScoreFormula: string;
    multipliers: Record<string, { min: number; max: number }>;
    multiplierCaps: {
      maxQIProduct: number;
      maxAmountAtomicPerAction: string;
      enforceTierUxMax: boolean;
    };
  };
  unity: {
    unityScoreSignals: string[];
    unityScoreWeightsMVP: Record<string, number>;
    unityMultiplierMapping: Array<{ minU: number; maxU: number; Ux: number }>;
    unityBonuses: Array<{
      if: Record<string, unknown>;
      addUx: number;
      capUx: number;
    }>;
  };
  tiers: {
    definition: string;
    tierRulesMVP: UserTier[];
  };
  platformPools: Record<string, string>;
  platforms: Record<PlatformId, PlatformConfig>;
  divineMantras: string[];
  emergency: {
    pauseMint: {
      enabled: boolean;
      rolesAllowed: string[];
      triggerConditions: string[];
      cooldownAfterPauseSec: number;
      autoResumeAllowed: boolean;
    };
    circuitBreaker: {
      enabled: boolean;
      maxMintPerHourAtomic: string;
      actionOnBreak: string;
      alertChannels: string[];
    };
  };
  governance: {
    policyUpdateRequires: string;
    proposalCooldownDays: number;
    communityVoteThreshold: number;
    emergencyOverride: string;
    roles: Record<string, string>;
  };
  rateLimiting: {
    globalMintsPerSecond: number;
    perUserMintsPerMinute: number;
    burstAllowance: number;
    actionOnLimit: string;
  };
  reputationDecay: {
    enabled: boolean;
    inactivityDays: number;
    decayPercentPerMonth: number;
    minFloor: number;
    restoreBy: string[];
  };
  crossPlatformBonus: {
    enabled: boolean;
    minPlatforms: number;
    bonusUx: number;
    maxBonusUx: number;
    note: string;
  };
}
