/* ── Light Score 5-Dimension Types ── */

/** 5 trụ cột thực thi */
export type LightDimension = 'identity' | 'activity' | 'onChain' | 'transparency' | 'ecosystem';

export interface DimensionScores {
  identity: number;      // 0-100
  activity: number;      // 0-100
  onChain: number;       // 0-100
  transparency: number;  // 0-100
  ecosystem: number;     // 0-100
}

export const DEFAULT_DIMENSION_WEIGHTS: Record<LightDimension, number> = {
  identity: 0.20,
  activity: 0.20,
  onChain: 0.20,
  transparency: 0.20,
  ecosystem: 0.20,
};

/** Risk Penalty */
export type RiskLevel = 'none' | 'light' | 'medium' | 'heavy';

export interface RiskPenalty {
  level: RiskLevel;
  score: number;       // 0-80
  reasons: string[];
}

export const RISK_RANGES: Record<Exclude<RiskLevel, 'none'>, [number, number]> = {
  light:  [5, 15],
  medium: [15, 35],
  heavy:  [35, 80],
};

/** Time Decay */
export interface DecayConfig {
  inactiveDays: number;
  factor: number;  // multiplier applied to Activity dimension
}

export const DECAY_TIERS: DecayConfig[] = [
  { inactiveDays: 30,  factor: 0.85 },
  { inactiveDays: 60,  factor: 0.60 },
  { inactiveDays: 90,  factor: 0.30 },
  { inactiveDays: 180, factor: 0.00 },
];

/** Streak Bonus */
export interface StreakBonus {
  days: number;
  percentage: number;  // e.g. 0.02, 0.05, 0.10
}

export const STREAK_TIERS: StreakBonus[] = [
  { days: 7,  percentage: 0.02 },
  { days: 30, percentage: 0.05 },
  { days: 90, percentage: 0.10 },
];

/** 5 Cấp độ thành viên */
export type LightLevel = 'seed' | 'builder' | 'guardian' | 'leader' | 'cosmic';

export interface LightLevelConfig {
  level: LightLevel;
  label: string;
  labelVi: string;
  min: number;
  max: number;
  color: string; // semantic HSL reference
}

export const LIGHT_LEVELS: LightLevelConfig[] = [
  { level: 'seed',     label: 'Light Seed',          labelVi: 'Hạt Giống Ánh Sáng',  min: 0,   max: 99,  color: 'hsl(var(--muted-foreground))' },
  { level: 'builder',  label: 'Light Builder',       labelVi: 'Người Kiến Tạo',      min: 100, max: 249, color: 'hsl(142, 76%, 36%)' },
  { level: 'guardian', label: 'Light Guardian',      labelVi: 'Người Bảo Hộ',        min: 250, max: 499, color: 'hsl(210, 100%, 50%)' },
  { level: 'leader',   label: 'Light Leader',        labelVi: 'Người Dẫn Dắt',       min: 500, max: 799, color: 'hsl(var(--accent))' },
  { level: 'cosmic',   label: 'Cosmic Contributor',  labelVi: 'Người Cống Hiến Vũ Trụ', min: 800, max: Infinity, color: 'hsl(var(--primary))' },
];

/** Kết quả tính toán tổng hợp */
export interface LightScoreResult {
  dimensionScores: DimensionScores;
  weightedTotal: number;        // Σ(dimension × weight) → 0-100
  riskPenalty: number;          // 0-80
  decayFactor: number;          // 0-1
  streakBonus: number;          // 0-0.10
  /** Final score = (weightedTotal × decayFactor) × (1 + streakBonus) - riskPenalty, scaled to 0-1000 */
  finalScore: number;
  level: LightLevelConfig;
}
