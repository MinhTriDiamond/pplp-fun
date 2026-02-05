import { Card, CardContent } from "@/components/ui/card";
import { platformIcons, platformColors, platformBgColors, platformUrls } from "@/lib/platform-icons";
import type { PlatformId } from "@/types/pplp.types";

interface PlatformCardProps {
  id: PlatformId;
  name: string;
  description: string;
  actionCount: number;
}

export function PlatformCard({ id, name, description, actionCount }: PlatformCardProps) {
  const Icon = platformIcons[id];
  const colorClass = platformColors[id];
  const bgColorClass = platformBgColors[id];
   const url = platformUrls[id];
  
  return (
    <a href={url} target="_blank" rel="noopener noreferrer" className="block">
      <Card className="group cursor-pointer transition-all duration-300 hover:shadow-elegant hover:-translate-y-1 border-border/50 bg-card/80 backdrop-blur-sm h-full">
        <CardContent className="p-6">
          <div className={`mb-4 inline-flex rounded-xl p-3 ${bgColorClass}`}>
            <Icon className={`h-6 w-6 ${colorClass}`} />
          </div>
          
          <h3 className="font-display text-lg font-semibold mb-2 text-foreground group-hover:text-primary transition-colors">
            {name.split(' — ')[0]}
          </h3>
          
          <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
            {description}
          </p>
          
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span className="px-2 py-1 rounded-full bg-secondary">
              {actionCount} actions
            </span>
          </div>
        </CardContent>
      </Card>
    </a>
  );
}
