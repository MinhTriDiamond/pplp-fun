import { useMemo } from 'react';
import { RadarChart as RechartsRadar, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer, Tooltip } from 'recharts';
import type { PillarScores } from '@/types/pplp.types';

interface RadarChartProps {
  pillarScores: PillarScores;
  lightScore: number;
}

const pillarLabels: Record<string, { full: string; vietnamese: string }> = {
  S: { full: 'Service', vietnamese: 'Phụng Sự' },
  T: { full: 'Truth', vietnamese: 'Chân Thật' },
  H: { full: 'Healing', vietnamese: 'Chữa Lành' },
  C: { full: 'Contribution', vietnamese: 'Đóng Góp' },
  U: { full: 'Unity', vietnamese: 'Hợp Nhất' },
};

export function RadarChart({ pillarScores, lightScore }: RadarChartProps) {
  const data = useMemo(() => [
    { pillar: 'S', value: pillarScores.S, fullMark: 100 },
    { pillar: 'T', value: pillarScores.T, fullMark: 100 },
    { pillar: 'H', value: pillarScores.H, fullMark: 100 },
    { pillar: 'C', value: pillarScores.C, fullMark: 100 },
    { pillar: 'U', value: pillarScores.U, fullMark: 100 },
  ], [pillarScores]);

  return (
    <div className="w-full h-64 relative">
      <ResponsiveContainer width="100%" height="100%">
        <RechartsRadar data={data}>
          <PolarGrid 
            stroke="hsl(var(--border))" 
            strokeOpacity={0.5}
          />
          <PolarAngleAxis 
            dataKey="pillar" 
            tick={{ 
              fill: 'hsl(var(--muted-foreground))', 
              fontSize: 12,
              fontWeight: 600
            }}
          />
          <PolarRadiusAxis 
            angle={90} 
            domain={[0, 100]} 
            tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10 }}
            tickCount={5}
          />
          <Radar
            name="Pillar Scores"
            dataKey="value"
            stroke="hsl(var(--primary))"
            fill="hsl(var(--primary))"
            fillOpacity={0.3}
            strokeWidth={2}
          />
          <Tooltip 
            content={({ active, payload }) => {
              if (active && payload && payload.length) {
                const pillar = payload[0].payload.pillar;
                const value = payload[0].payload.value;
                const info = pillarLabels[pillar];
                return (
                  <div className="bg-background border border-border rounded-lg p-3 shadow-lg">
                    <div className="font-bold text-primary">{info.vietnamese}</div>
                    <div className="text-sm text-muted-foreground">{info.full}</div>
                    <div className="text-2xl font-bold mt-1">{value}</div>
                  </div>
                );
              }
              return null;
            }}
          />
        </RechartsRadar>
      </ResponsiveContainer>
      
      {/* Center Light Score */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="text-center">
          <div className="text-xs text-muted-foreground">Light Score</div>
          <div className="text-2xl font-bold text-primary">{lightScore}</div>
        </div>
      </div>
    </div>
  );
}
