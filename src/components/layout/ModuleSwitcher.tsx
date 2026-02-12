import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Grid3X3, BookOpen, Gamepad2, Heart, Sprout, ShoppingBag, Landmark, Globe, Scale, Sparkles, Coins } from 'lucide-react';
import type { PlatformId } from '@/types/fun-core.types';

interface ModuleItem {
  id: PlatformId;
  name: string;
  icon: React.ReactNode;
  route: string;
  enabled: boolean;
}

const modules: ModuleItem[] = [
  { id: 'fun-profile', name: 'Profile', icon: <Sparkles className="h-4 w-4" />, route: '/settings', enabled: true },
  { id: 'angel-ai', name: 'Angel AI', icon: <Sparkles className="h-4 w-4" />, route: '/angel', enabled: false },
  { id: 'fun-academy', name: 'Academy', icon: <BookOpen className="h-4 w-4" />, route: '/academy', enabled: false },
  { id: 'fun-play', name: 'Play', icon: <Gamepad2 className="h-4 w-4" />, route: '/play', enabled: false },
  { id: 'fun-charity', name: 'Charity', icon: <Heart className="h-4 w-4" />, route: '/charity', enabled: false },
  { id: 'fun-farm', name: 'Farm', icon: <Sprout className="h-4 w-4" />, route: '/farm', enabled: false },
  { id: 'fun-market', name: 'Market', icon: <ShoppingBag className="h-4 w-4" />, route: '/market', enabled: false },
  { id: 'fun-treasury', name: 'Treasury', icon: <Landmark className="h-4 w-4" />, route: '/treasury', enabled: true },
  { id: 'fun-earth', name: 'Earth', icon: <Globe className="h-4 w-4" />, route: '/earth', enabled: false },
  { id: 'fun-legal', name: 'Legal', icon: <Scale className="h-4 w-4" />, route: '/legal', enabled: false },
  { id: 'camly-coin', name: 'CAMLY', icon: <Coins className="h-4 w-4" />, route: '/camly', enabled: false },
];

export function ModuleSwitcher() {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="sm" className="gap-1.5 text-muted-foreground">
          <Grid3X3 className="h-4 w-4" />
          <span className="hidden md:inline text-xs">Modules</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-72 p-2" align="start">
        <p className="text-xs font-medium text-muted-foreground px-2 py-1.5">FUN Ecosystem Modules</p>
        <div className="grid grid-cols-1 gap-0.5">
          {modules.map((m) => (
            <a
              key={m.id}
              href={m.enabled ? m.route : undefined}
              className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors ${
                m.enabled
                  ? 'hover:bg-accent cursor-pointer'
                  : 'opacity-50 cursor-not-allowed'
              }`}
            >
              {m.icon}
              <span className="flex-1">{m.name}</span>
              {!m.enabled && (
                <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                  Soon
                </Badge>
              )}
            </a>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}
