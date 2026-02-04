import { Slider } from '@/components/ui/slider';
import type { PillarScores, Pillar } from '@/types/pplp.types';

interface PillarSlidersProps {
  pillarScores: PillarScores;
  onChange: (scores: PillarScores) => void;
}

const pillarConfig: Array<{
  key: Pillar;
  name: string;
  vietnameseName: string;
  color: string;
  weight: number;
}> = [
  { key: 'S', name: 'Service', vietnameseName: 'Phụng Sự', color: 'hsl(var(--primary))', weight: 0.25 },
  { key: 'T', name: 'Truth', vietnameseName: 'Chân Thật', color: 'hsl(210, 100%, 50%)', weight: 0.20 },
  { key: 'H', name: 'Healing', vietnameseName: 'Chữa Lành', color: 'hsl(330, 80%, 60%)', weight: 0.20 },
  { key: 'C', name: 'Contribution', vietnameseName: 'Đóng Góp', color: 'hsl(142, 76%, 36%)', weight: 0.20 },
  { key: 'U', name: 'Unity', vietnameseName: 'Hợp Nhất', color: 'hsl(var(--accent))', weight: 0.15 },
];

export function PillarSliders({ pillarScores, onChange }: PillarSlidersProps) {
  const handleChange = (pillar: Pillar, value: number[]) => {
    onChange({
      ...pillarScores,
      [pillar]: value[0]
    });
  };

  return (
    <div className="space-y-6">
      {pillarConfig.map((pillar) => (
        <div key={pillar.key} className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div 
                className="w-3 h-3 rounded-full" 
                style={{ backgroundColor: pillar.color }}
              />
              <span className="font-medium text-sm">
                {pillar.key} - {pillar.vietnameseName}
              </span>
              <span className="text-xs text-muted-foreground">
                ({pillar.weight * 100}%)
              </span>
            </div>
            <span 
              className="font-mono font-bold text-lg"
              style={{ color: pillar.color }}
            >
              {pillarScores[pillar.key]}
            </span>
          </div>
          <Slider
            value={[pillarScores[pillar.key]]}
            onValueChange={(value) => handleChange(pillar.key, value)}
            min={0}
            max={100}
            step={1}
            className="cursor-pointer"
            style={{ 
              '--slider-color': pillar.color 
            } as React.CSSProperties}
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>0</span>
            <span>50</span>
            <span>100</span>
          </div>
        </div>
      ))}
    </div>
  );
}
