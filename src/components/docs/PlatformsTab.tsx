import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { PLATFORM_POOLS } from "@/data/docs-data";
import { platformIcons, platformColors, platformBgColors } from "@/lib/platform-icons";
import { Layers, BarChart3 } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";
import policyData from "@/config/pplp-policy-v1.0.2.json";
import type { PlatformId } from "@/types/pplp.types";

const COLORS = [
  "#06b6d4", "#8b5cf6", "#10b981", "#f59e0b", "#ec4899",
  "#3b82f6", "#84cc16", "#f97316", "#6366f1", "#14b8a6",
  "#a855f7", "#22c55e", "#eab308", "#ef4444", "#0ea5e9", "#d946ef"
];

export function PlatformsTab() {
  // Prepare chart data
  const chartData = PLATFORM_POOLS
    .filter(p => p.poolRaw > 0)
    .map((p, idx) => ({
      name: p.name,
      value: p.poolRaw,
      color: COLORS[idx % COLORS.length]
    }));

  const totalPool = PLATFORM_POOLS.reduce((acc, p) => acc + p.poolRaw, 0);

  return (
    <div className="space-y-8">
      {/* Platform Grid */}
      <Card className="bg-white/80 backdrop-blur-sm border-cyan-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-cyan-700">
            <Layers className="w-5 h-5" />
            16 Platforms Hợp Nhất
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {PLATFORM_POOLS.map((platform) => {
              const platformId = platform.id as PlatformId;
              const Icon = platformIcons[platformId] || Layers;
              const colorClass = platformColors[platformId] || "text-cyan-500";
              const bgColorClass = platformBgColors[platformId] || "bg-cyan-100";
              
              return (
                <div 
                  key={platform.id}
                  className="p-4 bg-white rounded-xl border border-cyan-100 shadow-sm hover:shadow-md transition-all hover:-translate-y-1"
                >
                  <div className={`inline-flex rounded-lg p-2 ${bgColorClass} mb-2`}>
                    <Icon className={`w-5 h-5 ${colorClass}`} />
                  </div>
                  <h4 className="font-semibold text-foreground text-sm mb-1">{platform.name}</h4>
                  <Badge variant="outline" className="text-xs font-mono">
                    {platform.pool}
                  </Badge>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
      
      {/* Pool Allocation Chart */}
      <Card className="bg-white/80 backdrop-blur-sm border-cyan-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-cyan-700">
            <BarChart3 className="w-5 h-5" />
            Phân Bổ Pool (Epoch Cap)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid lg:grid-cols-2 gap-6">
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={2}
                    dataKey="value"
                    label={({ name, percent }) => `${(percent * 100).toFixed(0)}%`}
                    labelLine={false}
                  >
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value: number) => `${(value / 1000).toLocaleString()}K FUN`}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
            
            <div className="space-y-2">
              <div className="p-3 bg-cyan-50 rounded-lg border border-cyan-100 mb-4">
                <div className="text-2xl font-bold text-cyan-700">
                  {(totalPool / 1000000).toFixed(1)}M FUN
                </div>
                <div className="text-sm text-muted-foreground">Total Epoch Cap</div>
              </div>
              
              <div className="max-h-[200px] overflow-y-auto space-y-1">
                {PLATFORM_POOLS.filter(p => p.poolRaw > 0).map((platform, idx) => (
                  <div key={platform.id} className="flex items-center justify-between text-sm p-2 bg-white rounded border border-cyan-50">
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: COLORS[idx % COLORS.length] }}
                      />
                      <span className="text-foreground">{platform.name}</span>
                    </div>
                    <span className="font-mono text-muted-foreground">{platform.pool}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Actions by Platform */}
      <Card className="bg-white/80 backdrop-blur-sm border-cyan-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-cyan-700">
            <Layers className="w-5 h-5" />
            Actions theo Platform
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Accordion type="multiple" className="w-full">
            {Object.entries(policyData.platforms).slice(0, 8).map(([platformId, platform]) => {
              const Icon = platformIcons[platformId as PlatformId] || Layers;
              const colorClass = platformColors[platformId as PlatformId] || "text-cyan-500";
              const bgColorClass = platformBgColors[platformId as PlatformId] || "bg-cyan-100";
              const actions = Object.entries(platform.actions);
              
              return (
                <AccordionItem key={platformId} value={platformId} className="border-cyan-100">
                  <AccordionTrigger className="hover:no-underline hover:bg-cyan-50 px-3 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${bgColorClass}`}>
                        <Icon className={`w-4 h-4 ${colorClass}`} />
                      </div>
                      <div className="text-left">
                        <div className="font-semibold text-foreground">{platform.name}</div>
                        <div className="text-xs text-muted-foreground">{actions.length} actions</div>
                      </div>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="pl-12 pr-4 pb-2 space-y-2">
                      {actions.map(([actionId, action]) => (
                        <div key={actionId} className="p-3 bg-cyan-50/50 rounded-lg border border-cyan-100">
                          <div className="flex items-center justify-between mb-1">
                            <code className="text-xs font-mono text-cyan-700">{actionId}</code>
                            <Badge variant="outline" className="text-xs">
                              Base: {(Number(action.baseRewardAtomic) / 1e18).toFixed(0)} FUN
                            </Badge>
                          </div>
                          <div className="flex flex-wrap gap-1 mt-2">
                            {action.thresholds && Object.entries(action.thresholds).map(([key, value]) => (
                              <Badge key={key} className="text-xs bg-white border-cyan-200">
                                {key}: {String(value)}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              );
            })}
          </Accordion>
          
          <p className="text-xs text-muted-foreground text-center mt-4">
            Hiển thị 8 platforms đầu tiên. Xem đầy đủ tại Policy JSON v1.0.2
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
