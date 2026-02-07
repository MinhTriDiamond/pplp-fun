# 📊 PPLP Scoring Engine - Công Thức Tính Điểm & Amount

## Tổng Quan

PPLP (Proof of Pure Love Protocol) sử dụng hệ thống scoring đa chiều để đánh giá giá trị của mỗi "Hành động Ánh sáng" và tính toán số FUN Money được mint.

---

## 1. Light Score (Điểm Ánh Sáng)

### Công Thức

```
Light Score = 0.25×S + 0.20×T + 0.20×H + 0.20×C + 0.15×U
```

### 5 Trụ Cột (Pillars)

| Pillar | Tên | Ý Nghĩa | Trọng Số |
|--------|-----|---------|----------|
| **S** | Service | Phụng sự sự sống | 25% |
| **T** | Truth | Chân thật minh bạch | 20% |
| **H** | Healing | Chữa lành & nâng đỡ | 20% |
| **C** | Contribution | Đóng góp bền vững | 20% |
| **U** | Unity | Hợp Nhất | 15% |

### Code Implementation

```typescript
interface PillarScores {
  S: number; // 0-100
  T: number; // 0-100
  H: number; // 0-100
  C: number; // 0-100
  U: number; // 0-100
}

function calculateLightScore(pillars: PillarScores): number {
  const weights = { S: 0.25, T: 0.20, H: 0.20, C: 0.20, U: 0.15 };
  
  const score = 
    weights.S * pillars.S +
    weights.T * pillars.T +
    weights.H * pillars.H +
    weights.C * pillars.C +
    weights.U * pillars.U;
  
  return Math.round(score * 100) / 100;
}

// Ví dụ:
const pillars = { S: 85, T: 80, H: 75, C: 90, U: 88 };
const lightScore = calculateLightScore(pillars);
// = 0.25×85 + 0.20×80 + 0.20×75 + 0.20×90 + 0.15×88
// = 21.25 + 16 + 15 + 18 + 13.2
// = 83.45
```

---

## 2. Unity Score (Điểm Hợp Nhất)

### Công Thức

```
Unity Score = 40×collaboration + 30×beneficiaryConfirmed + 20×communityEndorsement + 10×bridgeValue
```

### Unity Signals

| Signal | Ý Nghĩa | Trọng Số |
|--------|---------|----------|
| **collaboration** | Có sự hợp tác | 40% |
| **beneficiaryConfirmed** | Người thụ hưởng xác nhận | 30% |
| **communityEndorsement** | Cộng đồng ủng hộ | 20% |
| **bridgeValue** | Kết nối giá trị | 10% |

### Code Implementation

```typescript
interface UnitySignals {
  collaboration: boolean;
  beneficiaryConfirmed: boolean;
  communityEndorsement: boolean;
  bridgeValue: boolean;
  conflictResolution?: boolean;
  partnerAttested?: boolean;
  witnessCount?: number;
}

function calculateUnityScore(signals: Partial<UnitySignals>): number {
  const weights = {
    collaboration: 0.40,
    beneficiaryConfirmed: 0.30,
    communityEndorsement: 0.20,
    bridgeValue: 0.10
  };
  
  let score = 0;
  
  if (signals.collaboration) score += weights.collaboration * 100;
  if (signals.beneficiaryConfirmed) score += weights.beneficiaryConfirmed * 100;
  if (signals.communityEndorsement) score += weights.communityEndorsement * 100;
  if (signals.bridgeValue) score += weights.bridgeValue * 100;
  
  return Math.min(100, Math.round(score));
}

// Ví dụ:
const signals = { 
  collaboration: true, 
  beneficiaryConfirmed: true, 
  communityEndorsement: false, 
  bridgeValue: false 
};
const unityScore = calculateUnityScore(signals);
// = 40 + 30 + 0 + 0 = 70
```

---

## 3. Multipliers (Hệ Số Nhân)

### 4 Multipliers

| Multiplier | Ý Nghĩa | Range | Dựa Vào |
|------------|---------|-------|---------|
| **Q** | Quality (Chất lượng) | 0.5 - 3.0 | Evidence quality |
| **I** | Impact (Tác động) | 0.5 - 5.0 | Action impact |
| **K** | Integrity (Chính trực) | 0.0 - 1.0 | Anti-sybil score |
| **Ux** | Unity (Hợp nhất) | 0.5 - 2.5 | Unity Score |

### 3.1 Quality Multiplier (Q)

Đánh giá chất lượng evidence được submit.

```typescript
function calculateQualityMultiplier(evidence: ActionEvidence): number {
  let q = 1.0; // base
  
  // Evidence type quality
  if (evidence.type === 'PARTNER_ATTESTATION') q += 0.5;
  if (evidence.type === 'TX_HASH') q += 0.3;
  if (evidence.urls && evidence.urls.length >= 2) q += 0.2;
  if (evidence.description && evidence.description.length > 100) q += 0.2;
  
  return Math.min(3.0, Math.max(0.5, q));
}
```

### 3.2 Impact Multiplier (I)

Đánh giá tác động của action.

```typescript
function calculateImpactMultiplier(actionType: string, amount?: number): number {
  const baseImpact: Record<string, number> = {
    'DONATE': 2.5,
    'VOLUNTEER': 2.0,
    'CONTENT_CREATE': 1.5,
    'TREE_PLANT': 2.0,
    'MENTOR_HELP': 2.5,
    // ... more actions
  };
  
  let i = baseImpact[actionType] || 1.0;
  
  // Boost based on amount (for donations)
  if (actionType === 'DONATE' && amount) {
    if (amount > 1000) i += 0.5;
    if (amount > 5000) i += 0.5;
  }
  
  return Math.min(5.0, Math.max(0.5, i));
}
```

### 3.3 Integrity Multiplier (K)

Đánh giá độ tin cậy của user (anti-sybil).

```typescript
function calculateIntegrityMultiplier(
  antiSybilScore: number,  // 0.0 - 1.0
  hasStake: boolean = false,
  behaviorScore: number = 1.0
): number {
  const MIN_ANTI_SYBIL = 0.6;
  
  // Reject if below minimum
  if (antiSybilScore < MIN_ANTI_SYBIL) {
    return 0; // REJECT
  }
  
  let k = antiSybilScore;
  
  // Stake boost (max 1.2x)
  if (hasStake) {
    k = Math.min(1.0, k * 1.2);
  }
  
  // Behavior boost (max 1.1x)
  k = Math.min(1.0, k * Math.min(1.1, behaviorScore));
  
  return Math.round(k * 100) / 100;
}
```

### 3.4 Unity Multiplier (Ux)

Map Unity Score thành Ux multiplier.

```typescript
function calculateUnityMultiplier(unityScore: number): number {
  const mapping = [
    { minU: 0, maxU: 49, Ux: 0.5 },
    { minU: 50, maxU: 69, Ux: 1.0 },
    { minU: 70, maxU: 84, Ux: 1.5 },
    { minU: 85, maxU: 94, Ux: 2.0 },
    { minU: 95, maxU: 100, Ux: 2.3 }
  ];
  
  for (const range of mapping) {
    if (unityScore >= range.minU && unityScore <= range.maxU) {
      return range.Ux;
    }
  }
  
  return 0.5;
}

// Bonuses
function applyUnityBonuses(
  ux: number, 
  signals: Partial<UnitySignals>
): number {
  // Partner attested: +0.3 (cap 2.5)
  if (signals.partnerAttested) {
    ux = Math.min(2.5, ux + 0.3);
  }
  
  // Beneficiary confirmed: +0.2 (cap 2.5)
  if (signals.beneficiaryConfirmed) {
    ux = Math.min(2.5, ux + 0.2);
  }
  
  // 3+ witnesses: +0.2 (cap 2.5)
  if (signals.witnessCount && signals.witnessCount >= 3) {
    ux = Math.min(2.5, ux + 0.2);
  }
  
  return ux;
}
```

---

## 4. Final Amount Calculation

### Công Thức

```
amountAtomic = baseRewardAtomic × Q × I × K × Ux
```

### Code Implementation

```typescript
interface Multipliers {
  Q: number;
  I: number;
  K: number;
  Ux: number;
}

function calculateMintAmount(
  baseRewardAtomic: string,  // e.g., "100000000000000000000" (100 FUN)
  multipliers: Multipliers
): string {
  const br = BigInt(baseRewardAtomic);
  
  // Calculate product with precision
  const product = multipliers.Q * multipliers.I * multipliers.K * multipliers.Ux;
  
  // Cap Q×I product at 10.0
  const qiProduct = multipliers.Q * multipliers.I;
  const cappedProduct = qiProduct > 10.0 
    ? (10.0 / qiProduct) * product 
    : product;
  
  // Multiply with precision (×10000, then ÷10000)
  const multiplied = br * BigInt(Math.floor(cappedProduct * 10000)) / BigInt(10000);
  
  // Apply caps
  const MAX_CAP = BigInt("500000000000000000000000"); // 500,000 FUN
  const MIN_MINT = BigInt("1000000000000000000");     // 1 FUN
  
  let result = multiplied;
  if (result > MAX_CAP) result = MAX_CAP;
  if (result < MIN_MINT) result = MIN_MINT;
  
  return result.toString();
}

// Ví dụ:
const baseReward = "100000000000000000000"; // 100 FUN
const multipliers = { Q: 1.8, I: 2.0, K: 0.95, Ux: 1.5 };
const amount = calculateMintAmount(baseReward, multipliers);
// = 100 × 1.8 × 2.0 × 0.95 × 1.5
// = 100 × 5.13
// = 513 FUN
// = "513000000000000000000" (atomic)
```

---

## 5. Decision Rules

```typescript
type MintDecision = 'AUTHORIZE' | 'REJECT' | 'REVIEW_HOLD';

function determineDecision(
  lightScore: number,
  integrityK: number,
  calculatedAmount: bigint
): { decision: MintDecision; reasons: string[] } {
  const reasons: string[] = [];
  
  // Global thresholds
  const MIN_LIGHT_SCORE = 60;
  const MIN_INTEGRITY_K = 0.6;
  const AUDIT_THRESHOLD = BigInt("5000000000000000000000"); // 5000 FUN
  
  // Check thresholds
  if (lightScore < MIN_LIGHT_SCORE) {
    reasons.push(`Light Score ${lightScore} < ${MIN_LIGHT_SCORE}`);
  }
  
  if (integrityK < MIN_INTEGRITY_K) {
    reasons.push(`Integrity K ${integrityK} < ${MIN_INTEGRITY_K}`);
  }
  
  if (integrityK === 0) {
    reasons.push('FRAUD_DETECTED');
    return { decision: 'REJECT', reasons };
  }
  
  if (reasons.length > 0) {
    return { decision: 'REJECT', reasons };
  }
  
  // Check audit trigger
  if (calculatedAmount >= AUDIT_THRESHOLD) {
    reasons.push('AUDIT_TRIGGERED_LARGE_MINT');
    return { decision: 'REVIEW_HOLD', reasons };
  }
  
  return { decision: 'AUTHORIZE', reasons: [] };
}
```

---

## 6. Full Scoring Pipeline

```typescript
interface ScoringInput {
  platformId: string;
  actionType: string;
  pillarScores: PillarScores;
  unitySignals: Partial<UnitySignals>;
  antiSybilScore: number;
  hasStake?: boolean;
  evidence: ActionEvidence;
}

interface ScoringResult {
  lightScore: number;
  unityScore: number;
  multipliers: Multipliers;
  baseRewardAtomic: string;
  calculatedAmountAtomic: string;
  calculatedAmountFormatted: string;
  decision: MintDecision;
  reasonCodes: string[];
}

function scoreAction(input: ScoringInput): ScoringResult {
  // 1. Calculate scores
  const lightScore = calculateLightScore(input.pillarScores);
  const unityScore = calculateUnityScore(input.unitySignals);
  
  // 2. Calculate multipliers
  const Q = calculateQualityMultiplier(input.evidence);
  const I = calculateImpactMultiplier(input.actionType);
  const K = calculateIntegrityMultiplier(input.antiSybilScore, input.hasStake);
  const Ux = calculateUnityMultiplier(unityScore);
  
  const multipliers = { Q, I, K, Ux };
  
  // 3. Get base reward for action type
  const baseRewardAtomic = getBaseReward(input.platformId, input.actionType);
  
  // 4. Calculate final amount
  const calculatedAmountAtomic = calculateMintAmount(baseRewardAtomic, multipliers);
  
  // 5. Determine decision
  const { decision, reasons } = determineDecision(
    lightScore, 
    K, 
    BigInt(calculatedAmountAtomic)
  );
  
  // 6. Format for display
  const calculatedAmountFormatted = formatFunAmount(calculatedAmountAtomic);
  
  return {
    lightScore,
    unityScore,
    multipliers,
    baseRewardAtomic,
    calculatedAmountAtomic,
    calculatedAmountFormatted,
    decision,
    reasonCodes: reasons
  };
}

// Helper: Format atomic to human readable
function formatFunAmount(atomicAmount: string): string {
  const value = BigInt(atomicAmount);
  const whole = value / BigInt(10 ** 18);
  const fraction = value % BigInt(10 ** 18);
  
  if (fraction === BigInt(0)) {
    return `${whole.toString()} FUN`;
  }
  
  const fractionStr = fraction.toString().padStart(18, '0').slice(0, 2);
  return `${whole.toString()}.${fractionStr} FUN`;
}
```

---

## 7. Base Rewards by Action Type

| Platform | Action | Base Reward |
|----------|--------|-------------|
| ANGEL_AI | AI_REVIEW_HELPFUL | 50 FUN |
| ANGEL_AI | FRAUD_REPORT_VALID | 120 FUN |
| FUN_PROFILE | CONTENT_CREATE | 70 FUN |
| FUN_PROFILE | MENTOR_HELP | 150 FUN |
| FUN_CHARITY | DONATE | 120 FUN |
| FUN_CHARITY | VOLUNTEER | 150 FUN |
| FUN_EARTH | TREE_PLANT | 100 FUN |
| FUN_ACADEMY | LEARN_COMPLETE | 80 FUN |

Xem đầy đủ trong file `pplp-policy-v1.0.2.json`.

---

*Tiếp theo: [04-CONTRACT-INTEGRATION.md](./04-CONTRACT-INTEGRATION.md)*
