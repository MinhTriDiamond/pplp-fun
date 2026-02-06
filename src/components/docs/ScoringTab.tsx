import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  PILLARS_DATA, 
  UNITY_MULTIPLIER_MAPPING, 
  UNITY_SIGNALS,
  TIER_SYSTEM,
  REPUTATION_DECAY,
  CROSS_PLATFORM_BONUS,
  QUALITY_SIGNALS
} from "@/data/docs-data";
import { 
  Calculator, Star, Users, TrendingDown, Award, 
  Sparkles, Heart, Eye, Leaf 
} from "lucide-react";

export function ScoringTab() {
  return (
    <div className="space-y-8">
      {/* Light Score Formula */}
      <Card className="bg-white/80 backdrop-blur-sm border-cyan-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-cyan-700">
            <Calculator className="w-5 h-5" />
            Công Thức Light Score
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="p-6 bg-gradient-to-r from-cyan-50 to-violet-50 rounded-xl border border-cyan-200 text-center mb-6">
            <code className="text-lg md:text-xl font-mono font-bold text-cyan-700">
              LightScore = 0.25×S + 0.20×T + 0.20×H + 0.20×C + 0.15×U
            </code>
          </div>
          
          <div className="grid grid-cols-5 gap-2 md:gap-4">
            {PILLARS_DATA.map((pillar) => (
              <div 
                key={pillar.id}
                className={`p-3 rounded-lg border text-center ${pillar.bgColor} ${pillar.borderColor}`}
              >
                <div className={`text-2xl font-bold ${pillar.color}`}>{pillar.id}</div>
                <div className="text-xs text-muted-foreground mt-1">{pillar.weightPercent}</div>
              </div>
            ))}
          </div>
          
          <div className="mt-4 p-3 bg-amber-50 rounded-lg border border-amber-200">
            <p className="text-sm text-amber-700">
              ⚡ <strong>Ngưỡng tối thiểu:</strong> minLightScore = 60, minT = 70, minK = 0.6
            </p>
          </div>
        </CardContent>
      </Card>
      
      {/* Unity Multiplier */}
      <Card className="bg-white/80 backdrop-blur-sm border-cyan-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-cyan-700">
            <Users className="w-5 h-5" />
            Unity Multiplier (Ux) Mapping
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-cyan-200 bg-cyan-50">
                  <th className="text-left p-3 font-semibold text-cyan-700">Unity Score</th>
                  <th className="text-center p-3 font-semibold text-cyan-700">Ux Multiplier</th>
                  <th className="text-center p-3 font-semibold text-cyan-700">Effect</th>
                </tr>
              </thead>
              <tbody>
                {UNITY_MULTIPLIER_MAPPING.map((row, idx) => (
                  <tr key={idx} className={idx % 2 === 0 ? "bg-white" : "bg-cyan-50/50"}>
                    <td className="p-3 font-mono">{row.minU} - {row.maxU}</td>
                    <td className="p-3 text-center">
                      <Badge className={`${
                        row.ux >= 2.0 ? "bg-green-100 text-green-700" :
                        row.ux >= 1.5 ? "bg-cyan-100 text-cyan-700" :
                        row.ux >= 1.0 ? "bg-amber-100 text-amber-700" :
                        "bg-red-100 text-red-700"
                      } border-0`}>
                        {row.ux}x
                      </Badge>
                    </td>
                    <td className="p-3 text-center text-muted-foreground text-xs">
                      {row.ux >= 2.0 ? "Exceptional Unity" :
                       row.ux >= 1.5 ? "High Unity" :
                       row.ux >= 1.0 ? "Normal" :
                       "Low Unity Penalty"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          <div className="mt-6">
            <h4 className="font-semibold text-violet-700 mb-3">Unity Signals & Weights</h4>
            <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-3">
              {UNITY_SIGNALS.map((signal) => (
                <div key={signal.signal} className="p-3 bg-violet-50 rounded-lg border border-violet-100">
                  <div className="font-mono text-xs text-violet-600 mb-1">{signal.signal}</div>
                  <div className="font-semibold text-violet-700 text-sm">{signal.nameVi}</div>
                  <Badge variant="outline" className="mt-1 text-xs">
                    Weight: {(signal.weight * 100).toFixed(0)}%
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Tier System */}
      <Card className="bg-white/80 backdrop-blur-sm border-cyan-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-cyan-700">
            <Award className="w-5 h-5" />
            Tier System (0-3)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-cyan-200 bg-cyan-50">
                  <th className="text-center p-3 font-semibold text-cyan-700">Tier</th>
                  <th className="text-center p-3 font-semibold text-cyan-700">Min Actions</th>
                  <th className="text-center p-3 font-semibold text-cyan-700">Min Light Score</th>
                  <th className="text-center p-3 font-semibold text-cyan-700">Min K</th>
                  <th className="text-center p-3 font-semibold text-cyan-700">Max Ux</th>
                  <th className="text-center p-3 font-semibold text-cyan-700">Daily Cap</th>
                </tr>
              </thead>
              <tbody>
                {TIER_SYSTEM.map((tier, idx) => (
                  <tr key={tier.tier} className={idx % 2 === 0 ? "bg-white" : "bg-cyan-50/50"}>
                    <td className="p-3 text-center">
                      <Badge className={`${
                        tier.tier === 3 ? "bg-violet-100 text-violet-700" :
                        tier.tier === 2 ? "bg-cyan-100 text-cyan-700" :
                        tier.tier === 1 ? "bg-green-100 text-green-700" :
                        "bg-gray-100 text-gray-700"
                      } border-0 text-lg`}>
                        {tier.tier}
                      </Badge>
                    </td>
                    <td className="p-3 text-center font-mono">{tier.minActions}</td>
                    <td className="p-3 text-center font-mono">{tier.minLightScore}</td>
                    <td className="p-3 text-center font-mono">{tier.minK}</td>
                    <td className="p-3 text-center font-mono">{tier.maxUx}</td>
                    <td className="p-3 text-center font-mono text-green-600">{tier.dailyCap}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
      
      {/* Reputation Decay & Cross-platform */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card className="bg-white/80 backdrop-blur-sm border-cyan-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-cyan-700">
              <TrendingDown className="w-5 h-5" />
              Reputation Decay
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-red-50 rounded-lg border border-red-100 text-center">
                <div className="text-2xl font-bold text-red-600">{REPUTATION_DECAY.inactivityDays}</div>
                <div className="text-xs text-muted-foreground">Ngày không hoạt động</div>
              </div>
              <div className="p-3 bg-amber-50 rounded-lg border border-amber-100 text-center">
                <div className="text-2xl font-bold text-amber-600">-{REPUTATION_DECAY.decayPercentPerMonth}%</div>
                <div className="text-xs text-muted-foreground">Giảm mỗi tháng</div>
              </div>
            </div>
            
            <div className="p-3 bg-cyan-50 rounded-lg border border-cyan-100">
              <p className="text-sm text-muted-foreground">
                <strong>Sàn tối thiểu:</strong> {REPUTATION_DECAY.minFloor}
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                <strong>Khôi phục bằng:</strong> {REPUTATION_DECAY.restoreBy.join(", ")}
              </p>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-white/80 backdrop-blur-sm border-cyan-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-cyan-700">
              <Star className="w-5 h-5" />
              Cross-platform Bonus
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-green-50 rounded-lg border border-green-100 text-center">
                <div className="text-2xl font-bold text-green-600">{CROSS_PLATFORM_BONUS.minPlatforms}+</div>
                <div className="text-xs text-muted-foreground">Platforms tối thiểu</div>
              </div>
              <div className="p-3 bg-violet-50 rounded-lg border border-violet-100 text-center">
                <div className="text-2xl font-bold text-violet-600">+{CROSS_PLATFORM_BONUS.bonusUx}</div>
                <div className="text-xs text-muted-foreground">Ux Bonus / platform</div>
              </div>
            </div>
            
            <div className="p-3 bg-cyan-50 rounded-lg border border-cyan-100">
              <p className="text-sm text-muted-foreground">
                <strong>Max Bonus:</strong> +{CROSS_PLATFORM_BONUS.maxBonusUx} Ux
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                {CROSS_PLATFORM_BONUS.note}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Quality Signals */}
      <Card className="bg-white/80 backdrop-blur-sm border-cyan-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-cyan-700">
            <Sparkles className="w-5 h-5" />
            Quality Signals theo Platform
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {Object.entries(QUALITY_SIGNALS).map(([platform, signals]) => (
              <div key={platform} className="p-4 bg-cyan-50 rounded-lg border border-cyan-100">
                <h4 className="font-semibold text-cyan-700 mb-2">{platform.replace("_", " ")}</h4>
                <div className="space-y-1">
                  {signals.map((signal) => (
                    <Badge key={signal} variant="outline" className="mr-1 mb-1 text-xs">
                      {signal}
                    </Badge>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
