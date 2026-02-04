import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { getAllPlatforms } from '@/lib/pplp-engine';
import { getPlatformIcon } from '@/lib/platform-icons';
import type { PlatformId } from '@/types/pplp.types';

interface UserProfileSimProps {
  tier: 0 | 1 | 2 | 3;
  antiSybilScore: number;
  hasStake: boolean;
  activePlatforms: PlatformId[];
  onTierChange: (tier: 0 | 1 | 2 | 3) => void;
  onAntiSybilChange: (score: number) => void;
  onStakeChange: (hasStake: boolean) => void;
  onPlatformsChange: (platforms: PlatformId[]) => void;
  integrityK: number;
  crossPlatformBonus: number;
}

const tierInfo = [
  { tier: 0, name: 'Newcomer', maxUx: 1.0, color: 'text-muted-foreground' },
  { tier: 1, name: 'Member', maxUx: 1.5, color: 'text-blue-500' },
  { tier: 2, name: 'Trusted', maxUx: 2.0, color: 'text-purple-500' },
  { tier: 3, name: 'Guardian', maxUx: 2.5, color: 'text-primary' },
];

export function UserProfileSim({
  tier,
  antiSybilScore,
  hasStake,
  activePlatforms,
  onTierChange,
  onAntiSybilChange,
  onStakeChange,
  onPlatformsChange,
  integrityK,
  crossPlatformBonus,
}: UserProfileSimProps) {
  const allPlatforms = getAllPlatforms();

  const handlePlatformToggle = (platformId: PlatformId, checked: boolean) => {
    if (checked) {
      onPlatformsChange([...activePlatforms, platformId]);
    } else {
      onPlatformsChange(activePlatforms.filter(id => id !== platformId));
    }
  };

  return (
    <div className="space-y-6">
      {/* Tier Selector */}
      <div className="space-y-3">
        <Label className="text-sm font-medium">User Tier</Label>
        <RadioGroup 
          value={tier.toString()} 
          onValueChange={(v) => onTierChange(parseInt(v) as 0 | 1 | 2 | 3)}
          className="grid grid-cols-2 gap-2"
        >
          {tierInfo.map((t) => (
            <div key={t.tier} className="flex items-center">
              <RadioGroupItem value={t.tier.toString()} id={`tier-${t.tier}`} className="sr-only" />
              <Label
                htmlFor={`tier-${t.tier}`}
                className={`flex-1 flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-all ${
                  tier === t.tier 
                    ? 'border-primary bg-primary/10' 
                    : 'border-border hover:border-primary/50'
                }`}
              >
                <div>
                  <div className={`font-medium ${t.color}`}>Tier {t.tier}</div>
                  <div className="text-xs text-muted-foreground">{t.name}</div>
                </div>
                <Badge variant="secondary" className="text-xs">
                  Max Ux: {t.maxUx}
                </Badge>
              </Label>
            </div>
          ))}
        </RadioGroup>
      </div>

      {/* Anti-Sybil Score */}
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <Label className="text-sm font-medium">Anti-Sybil Score</Label>
          <span className="font-mono font-bold text-green-500">{antiSybilScore.toFixed(2)}</span>
        </div>
        <Slider
          value={[antiSybilScore * 100]}
          onValueChange={(v) => onAntiSybilChange(v[0] / 100)}
          min={0}
          max={100}
          step={1}
        />
        <div className="flex justify-between items-center">
          <span className="text-xs text-muted-foreground">
            {antiSybilScore < 0.6 ? '⚠️ Below minimum (0.6)' : '✓ Valid'}
          </span>
          <span className="text-xs">K = {integrityK.toFixed(2)}</span>
        </div>
      </div>

      {/* Stake Toggle */}
      <div className="flex items-center justify-between p-3 rounded-lg border border-border">
        <div>
          <Label htmlFor="hasStake" className="cursor-pointer">Has CAMLY Stake</Label>
          <p className="text-xs text-muted-foreground">+20% K boost if staked</p>
        </div>
        <Checkbox
          id="hasStake"
          checked={hasStake}
          onCheckedChange={(checked) => onStakeChange(checked as boolean)}
        />
      </div>

      {/* Active Platforms */}
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <Label className="text-sm font-medium">Active Platforms</Label>
          <Badge variant={crossPlatformBonus > 0 ? 'default' : 'secondary'} className="text-xs">
            {activePlatforms.length} active {crossPlatformBonus > 0 && `(+${crossPlatformBonus.toFixed(1)} Ux)`}
          </Badge>
        </div>
        <div className="grid grid-cols-2 gap-1 max-h-32 overflow-y-auto pr-2">
          {allPlatforms.slice(0, 8).map((platform) => {
            const Icon = getPlatformIcon(platform.icon);
            const isActive = activePlatforms.includes(platform.id);
            return (
              <div
                key={platform.id}
                onClick={() => handlePlatformToggle(platform.id, !isActive)}
                className={`flex items-center gap-2 p-2 rounded cursor-pointer text-xs transition-all ${
                  isActive 
                    ? 'bg-primary/10 text-primary' 
                    : 'hover:bg-muted text-muted-foreground'
                }`}
              >
                <Icon className="h-3 w-3" />
                <span className="truncate">{platform.name.split(' — ')[0]}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
