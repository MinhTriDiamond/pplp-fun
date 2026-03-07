import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadarChart as RechartsRadar, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer, Tooltip } from 'recharts';
import { Shield, Flame, Clock, Star, Sparkles, TrendingUp } from 'lucide-react';
import { computeLightScore } from '@/lib/light-score-engine';
import type { DimensionScores, RiskLevel } from '@/types/light-score.types';

const DIMENSIONS: Array<{
  key: keyof DimensionScores;
  label: string;
  labelVi: string;
  icon: typeof Shield;
  color: string;
}> = [
  { key: 'identity',     label: 'Identity',             labelVi: 'Xác Thực Danh Tính',    icon: Shield,      color: 'hsl(210, 100%, 50%)' },
  { key: 'activity',     label: 'Activity',             labelVi: 'Hoạt Động',             icon: TrendingUp,  color: 'hsl(142, 76%, 36%)' },
  { key: 'onChain',      label: 'On-Chain History',     labelVi: 'Lịch Sử On-Chain',      icon: Sparkles,    color: 'hsl(var(--primary))' },
  { key: 'transparency', label: 'Wallet Transparency',  labelVi: 'Minh Bạch Ví',          icon: Star,        color: 'hsl(var(--accent))' },
  { key: 'ecosystem',    label: 'Ecosystem Alignment',  labelVi: 'Gắn Kết Hệ Sinh Thái', icon: Flame,       color: 'hsl(330, 80%, 60%)' },
];

export function LightScoreTab() {
  const [scores, setScores] = useState<DimensionScores>({
    identity: 60, activity: 50, onChain: 40, transparency: 80, ecosystem: 55,
  });
  const [riskLevel, setRiskLevel] = useState<RiskLevel>('none');
  const [inactiveDays, setInactiveDays] = useState(0);
  const [streakDays, setStreakDays] = useState(0);

  const result = useMemo(
    () => computeLightScore(scores, riskLevel, undefined, inactiveDays, streakDays),
    [scores, riskLevel, inactiveDays, streakDays],
  );

  const radarData = DIMENSIONS.map(d => ({
    pillar: d.key.charAt(0).toUpperCase(),
    label: d.labelVi,
    value: scores[d.key],
    fullMark: 100,
  }));

  const handleChange = (key: keyof DimensionScores, val: number[]) => {
    setScores(prev => ({ ...prev, [key]: val[0] }));
  };

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      {/* Left: Inputs */}
      <div className="lg:col-span-2 space-y-6">
        {/* 5 Dimension Sliders */}
        <Card className="border-primary/20">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg flex items-center gap-2">
              <span className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">✦</span>
              5 Trụ Cột Light Score
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-x-8 gap-y-2">
              <div className="space-y-5">
                {DIMENSIONS.map(dim => {
                  const Icon = dim.icon;
                  return (
                    <div key={dim.key} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Icon className="h-4 w-4" style={{ color: dim.color }} />
                          <span className="font-medium text-sm">{dim.labelVi}</span>
                        </div>
                        <span className="font-mono font-bold text-lg" style={{ color: dim.color }}>
                          {scores[dim.key]}
                        </span>
                      </div>
                      <Slider
                        value={[scores[dim.key]]}
                        onValueChange={val => handleChange(dim.key, val)}
                        min={0} max={100} step={1}
                        className="cursor-pointer"
                      />
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>0</span><span>50</span><span>100</span>
                      </div>
                    </div>
                  );
                })}
              </div>
              {/* Radar Chart */}
              <div className="flex items-center justify-center">
                <div className="w-full h-72 relative">
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartsRadar data={radarData}>
                      <PolarGrid stroke="hsl(var(--border))" strokeOpacity={0.5} />
                      <PolarAngleAxis dataKey="pillar" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12, fontWeight: 600 }} />
                      <PolarRadiusAxis angle={90} domain={[0, 100]} tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10 }} tickCount={5} />
                      <Radar name="Dimensions" dataKey="value" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.3} strokeWidth={2} />
                      <Tooltip content={({ active, payload }) => {
                        if (active && payload?.[0]) {
                          const { label, value } = payload[0].payload;
                          return (
                            <div className="bg-background border border-border rounded-lg p-3 shadow-lg">
                              <div className="font-bold text-primary">{label}</div>
                              <div className="text-2xl font-bold mt-1">{value}</div>
                            </div>
                          );
                        }
                        return null;
                      }} />
                    </RechartsRadar>
                  </ResponsiveContainer>
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="text-center">
                      <div className="text-xs text-muted-foreground">Weighted</div>
                      <div className="text-2xl font-bold text-primary">{result.weightedTotal}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Modifiers */}
        <div className="grid md:grid-cols-3 gap-6">
          {/* Risk Penalty */}
          <Card className="border-destructive/20">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Shield className="h-4 w-4 text-destructive" /> Risk Penalty
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Select value={riskLevel} onValueChange={v => setRiskLevel(v as RiskLevel)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Không có (0)</SelectItem>
                  <SelectItem value="light">Nhẹ (5-15)</SelectItem>
                  <SelectItem value="medium">Trung bình (15-35)</SelectItem>
                  <SelectItem value="heavy">Nặng (35-80)</SelectItem>
                </SelectContent>
              </Select>
              <div className="text-center">
                <span className="text-2xl font-bold text-destructive">-{result.riskPenalty}</span>
                <span className="text-xs text-muted-foreground ml-1">điểm</span>
              </div>
            </CardContent>
          </Card>

          {/* Time Decay */}
          <Card className="border-orange-500/20">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Clock className="h-4 w-4 text-orange-500" /> Time Decay
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Slider value={[inactiveDays]} onValueChange={v => setInactiveDays(v[0])} min={0} max={200} step={1} className="cursor-pointer" />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>0 ngày</span><span>{inactiveDays}d</span><span>200</span>
              </div>
              <div className="text-center">
                <span className="text-2xl font-bold text-orange-500">×{result.decayFactor.toFixed(2)}</span>
              </div>
            </CardContent>
          </Card>

          {/* Streak Bonus */}
          <Card className="border-green-500/20">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Flame className="h-4 w-4 text-green-500" /> Streak Bonus
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Slider value={[streakDays]} onValueChange={v => setStreakDays(v[0])} min={0} max={100} step={1} className="cursor-pointer" />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>0 ngày</span><span>{streakDays}d</span><span>100</span>
              </div>
              <div className="text-center">
                <span className="text-2xl font-bold text-green-500">+{(result.streakBonus * 100).toFixed(0)}%</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Right: Results */}
      <div className="space-y-6">
        {/* Final Score */}
        <Card className="border-primary/30 bg-gradient-to-b from-primary/5 to-transparent">
          <CardContent className="pt-6 text-center space-y-4">
            <div className="text-sm text-muted-foreground font-medium">LIGHT SCORE</div>
            <div className="text-6xl font-bold" style={{ color: result.level.color }}>
              {result.finalScore}
            </div>
            <Badge
              className="text-sm px-4 py-1 border-0"
              style={{ backgroundColor: result.level.color, color: '#fff' }}
            >
              {result.level.labelVi}
            </Badge>
            <div className="text-xs text-muted-foreground">{result.level.label}</div>
          </CardContent>
        </Card>

        {/* Breakdown */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Chi tiết tính toán</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Weighted Total</span>
              <span className="font-mono font-bold">{result.weightedTotal}/100</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">× 10 (scale)</span>
              <span className="font-mono">{(result.weightedTotal * 10).toFixed(0)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">× Decay ({result.decayFactor})</span>
              <span className="font-mono">{(result.weightedTotal * 10 * result.decayFactor).toFixed(0)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">× Streak (+{(result.streakBonus * 100).toFixed(0)}%)</span>
              <span className="font-mono">{(result.weightedTotal * 10 * result.decayFactor * (1 + result.streakBonus)).toFixed(0)}</span>
            </div>
            <div className="flex justify-between text-destructive">
              <span>− Risk Penalty</span>
              <span className="font-mono">−{result.riskPenalty}</span>
            </div>
            <hr className="border-border" />
            <div className="flex justify-between font-bold text-base">
              <span>Final</span>
              <span className="font-mono" style={{ color: result.level.color }}>{result.finalScore}</span>
            </div>
          </CardContent>
        </Card>

        {/* Dimension bars */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">5 Dimensions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {DIMENSIONS.map(dim => (
              <div key={dim.key} className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">{dim.label}</span>
                  <span className="font-mono font-bold">{scores[dim.key]}</span>
                </div>
                <Progress value={scores[dim.key]} className="h-2" />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
