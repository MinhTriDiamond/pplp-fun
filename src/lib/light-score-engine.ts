import type {
  DimensionScores,
  LightDimension,
  RiskLevel,
  LightScoreResult,
  LightLevelConfig,
} from '@/types/light-score.types';
import {
  DEFAULT_DIMENSION_WEIGHTS,
  RISK_RANGES,
  DECAY_TIERS,
  STREAK_TIERS,
  LIGHT_LEVELS,
} from '@/types/light-score.types';

/* ── Helpers ── */

function clamp(v: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, v));
}

/* ── Weighted Total (0-100) ── */
export function computeWeightedTotal(
  scores: DimensionScores,
  weights: Record<LightDimension, number> = DEFAULT_DIMENSION_WEIGHTS,
): number {
  const total =
    scores.identity      * weights.identity +
    scores.activity      * weights.activity +
    scores.onChain       * weights.onChain +
    scores.transparency  * weights.transparency +
    scores.ecosystem     * weights.ecosystem;
  return Math.round(total * 100) / 100;
}

/* ── Risk Penalty ── */
export function computeRiskPenalty(level: RiskLevel, customScore?: number): number {
  if (level === 'none') return 0;
  const [min, max] = RISK_RANGES[level];
  if (customScore !== undefined) return clamp(customScore, min, max);
  return Math.round((min + max) / 2);
}

/* ── Decay Factor ── */
export function computeDecayFactor(inactiveDays: number): number {
  for (let i = DECAY_TIERS.length - 1; i >= 0; i--) {
    if (inactiveDays >= DECAY_TIERS[i].inactiveDays) {
      return DECAY_TIERS[i].factor;
    }
  }
  return 1.0; // no decay
}

/* ── Streak Bonus ── */
export function computeStreakBonus(streakDays: number): number {
  let bonus = 0;
  for (const tier of STREAK_TIERS) {
    if (streakDays >= tier.days) bonus = tier.percentage;
  }
  return bonus;
}

/* ── Level Lookup ── */
export function getLevel(finalScore: number): LightLevelConfig {
  for (let i = LIGHT_LEVELS.length - 1; i >= 0; i--) {
    if (finalScore >= LIGHT_LEVELS[i].min) return LIGHT_LEVELS[i];
  }
  return LIGHT_LEVELS[0];
}

/* ── Master Compute ── */
export function computeLightScore(
  scores: DimensionScores,
  riskLevel: RiskLevel = 'none',
  riskCustom?: number,
  inactiveDays: number = 0,
  streakDays: number = 0,
  weights?: Record<LightDimension, number>,
): LightScoreResult {
  const weightedTotal = computeWeightedTotal(scores, weights);
  const riskPenalty   = computeRiskPenalty(riskLevel, riskCustom);
  const decayFactor   = computeDecayFactor(inactiveDays);
  const streakBonus   = computeStreakBonus(streakDays);

  // Scale weighted total (0-100) → (0-1000), apply modifiers
  const base = weightedTotal * 10; // max 1000
  const afterDecay  = base * decayFactor;
  const afterStreak = afterDecay * (1 + streakBonus);
  const finalScore  = Math.max(0, Math.round(afterStreak - riskPenalty));

  return {
    dimensionScores: scores,
    weightedTotal,
    riskPenalty,
    decayFactor,
    streakBonus,
    finalScore,
    level: getLevel(finalScore),
  };
}
