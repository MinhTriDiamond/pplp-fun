import { getAllPlatforms, getPlatformActions, formatFunAmount } from '@/lib/pplp-engine';
import { getPlatformIcon } from '@/lib/platform-icons';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import type { PlatformId } from '@/types/pplp.types';

interface PlatformSelectorProps {
  platformId: PlatformId | null;
  actionType: string | null;
  onPlatformChange: (id: PlatformId) => void;
  onActionChange: (action: string) => void;
}

export function PlatformSelector({ 
  platformId, 
  actionType, 
  onPlatformChange, 
  onActionChange 
}: PlatformSelectorProps) {
  const platforms = getAllPlatforms();
  const actions = platformId ? getPlatformActions(platformId) : [];
  const selectedPlatform = platforms.find(p => p.id === platformId);
  const selectedAction = actions.find(a => a.actionType === actionType);

  return (
    <div className="space-y-4">
      {/* Platform Selector */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-muted-foreground">Platform</label>
        <Select 
          value={platformId || ''} 
          onValueChange={(value) => onPlatformChange(value as PlatformId)}
        >
          <SelectTrigger className="w-full bg-background">
            <SelectValue placeholder="Chọn platform..." />
          </SelectTrigger>
          <SelectContent className="bg-background border border-border z-50">
            {platforms.map((platform) => {
              const Icon = getPlatformIcon(platform.icon);
              return (
                <SelectItem key={platform.id} value={platform.id}>
                  <div className="flex items-center gap-2">
                    <Icon className="h-4 w-4 text-primary" />
                    <span>{platform.name}</span>
                    <Badge variant="secondary" className="ml-2 text-xs">
                      {platform.actionCount} actions
                    </Badge>
                  </div>
                </SelectItem>
              );
            })}
          </SelectContent>
        </Select>
        {selectedPlatform && (
          <p className="text-xs text-muted-foreground">{selectedPlatform.description}</p>
        )}
      </div>

      {/* Action Type Selector */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-muted-foreground">Action Type</label>
        <Select 
          value={actionType || ''} 
          onValueChange={onActionChange}
          disabled={!platformId}
        >
          <SelectTrigger className="w-full bg-background">
            <SelectValue placeholder={platformId ? "Chọn action..." : "Chọn platform trước"} />
          </SelectTrigger>
          <SelectContent className="bg-background border border-border z-50">
            {actions.map((action) => (
              <SelectItem key={action.actionType} value={action.actionType}>
                <div className="flex items-center justify-between w-full gap-4">
                  <span className="font-mono text-sm">{action.actionType}</span>
                  <Badge className="bg-primary/20 text-primary border-0">
                    {action.baseReward}
                  </Badge>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {selectedAction && (
          <div className="flex flex-wrap gap-2 mt-2">
            <Badge variant="outline" className="text-xs">
              Min LightScore: {selectedAction.thresholds.minLightScore}
            </Badge>
            <Badge variant="outline" className="text-xs">
              Min K: {selectedAction.thresholds.minK}
            </Badge>
            {selectedAction.thresholds.T && (
              <Badge variant="outline" className="text-xs">
                Min T: {selectedAction.thresholds.T}
              </Badge>
            )}
            {selectedAction.thresholds.minU && (
              <Badge variant="outline" className="text-xs">
                Min U: {selectedAction.thresholds.minU}
              </Badge>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
