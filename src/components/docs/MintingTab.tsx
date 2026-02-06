import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  MULTIPLIERS_DATA, 
  TOKEN_LIFECYCLE, 
  SETTLEMENT_LANES,
  CASCADING_DISTRIBUTION 
} from "@/data/docs-data";
import { Calculator, ArrowRight, Clock, Zap, Coins, Lock, Unlock, RefreshCw } from "lucide-react";

const lifecycleIcons: Record<string, React.ElementType> = {
  LOCKED: Lock,
  ACTIVATED: Unlock,
  FLOWING: Coins,
  RECYCLED: RefreshCw
};

export function MintingTab() {
  return (
    <div className="space-y-8">
      {/* Minting Formula */}
      <Card className="bg-white/80 backdrop-blur-sm border-cyan-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-cyan-700">
            <Calculator className="w-5 h-5" />
            Công Thức Minting
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="p-6 bg-gradient-to-r from-cyan-50 to-sky-50 rounded-xl border border-cyan-200 text-center">
            <code className="text-lg md:text-xl font-mono font-bold text-cyan-700">
              amountAtomic = baseReward × Q × I × K × Ux
            </code>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {MULTIPLIERS_DATA.map((mult) => (
              <div key={mult.symbol} className="p-4 bg-white rounded-lg border border-cyan-100 shadow-sm">
                <div className="flex items-center gap-2 mb-2">
                  <Badge className="bg-cyan-100 text-cyan-700 border-0 text-lg font-bold">
                    {mult.symbol}
                  </Badge>
                  <span className="font-semibold text-foreground">{mult.nameVi}</span>
                </div>
                <div className="text-sm text-muted-foreground mb-2">{mult.name}</div>
                <div className="text-xs bg-cyan-50 px-2 py-1 rounded inline-block text-cyan-600 font-mono">
                  Range: {mult.range}
                </div>
                <p className="text-xs text-muted-foreground mt-2">{mult.description}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
      
      {/* Cascading 99% Distribution */}
      <Card className="bg-white/80 backdrop-blur-sm border-cyan-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-cyan-700">
            <Coins className="w-5 h-5" />
            Phân Phối Cascading 99%
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-6">{CASCADING_DISTRIBUTION.description}</p>
          
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-cyan-200 bg-cyan-50">
                  <th className="text-left p-3 font-semibold text-cyan-700">Tầng</th>
                  <th className="text-center p-3 font-semibold text-cyan-700">Nhận</th>
                  <th className="text-center p-3 font-semibold text-cyan-700">Giữ</th>
                  <th className="text-center p-3 font-semibold text-cyan-700">Phân Phối</th>
                </tr>
              </thead>
              <tbody>
                {CASCADING_DISTRIBUTION.tiers.map((tier, idx) => (
                  <tr key={tier.name} className={idx % 2 === 0 ? "bg-white" : "bg-cyan-50/50"}>
                    <td className="p-3 font-medium text-foreground">{tier.name}</td>
                    <td className="p-3 text-center font-mono text-cyan-600">{tier.receive}</td>
                    <td className="p-3 text-center font-mono text-green-600 font-semibold">{tier.keep}</td>
                    <td className="p-3 text-center font-mono text-violet-600">{tier.distribute}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          <div className="mt-4 p-3 bg-green-50 rounded-lg border border-green-200">
            <p className="text-sm text-green-700">
              💚 <strong>Kết quả:</strong> User cuối nhận ~97% giá trị gốc. 
              Mỗi tầng trung gian chỉ giữ ~1% để vận hành.
            </p>
          </div>
        </CardContent>
      </Card>
      
      {/* Token Lifecycle */}
      <Card className="bg-white/80 backdrop-blur-sm border-cyan-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-cyan-700">
            <RefreshCw className="w-5 h-5" />
            Vòng Đời Token
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap items-center justify-center gap-2 md:gap-4">
            {TOKEN_LIFECYCLE.map((stage, idx) => {
              const Icon = lifecycleIcons[stage.stage];
              return (
                <div key={stage.stage} className="flex items-center gap-2">
                  <div className={`p-4 rounded-xl text-center min-w-[120px] ${stage.color} text-white`}>
                    <Icon className="w-6 h-6 mx-auto mb-2" />
                    <div className="font-bold text-sm">{stage.stage}</div>
                    <div className="text-xs opacity-90">{stage.nameVi}</div>
                  </div>
                  {idx < TOKEN_LIFECYCLE.length - 1 && (
                    <ArrowRight className="w-5 h-5 text-cyan-400 hidden md:block" />
                  )}
                </div>
              );
            })}
          </div>
          
          <div className="grid md:grid-cols-4 gap-4 mt-6">
            {TOKEN_LIFECYCLE.map((stage) => (
              <div key={stage.stage} className="text-center p-3 bg-cyan-50/50 rounded-lg">
                <code className="text-xs font-mono text-cyan-600">{stage.action}</code>
                <p className="text-xs text-muted-foreground mt-1">{stage.description}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
      
      {/* Settlement Lanes */}
      <Card className="bg-white/80 backdrop-blur-sm border-cyan-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-cyan-700">
            <Zap className="w-5 h-5" />
            Settlement Lanes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-4">
            {SETTLEMENT_LANES.map((lane) => (
              <div 
                key={lane.lane}
                className={`p-4 rounded-lg border ${
                  lane.lane === "Fast Lane" 
                    ? "bg-green-50 border-green-200" 
                    : lane.lane === "Review Lane"
                    ? "bg-amber-50 border-amber-200"
                    : "bg-cyan-50 border-cyan-200"
                }`}
              >
                <div className="flex items-center gap-2 mb-2">
                  {lane.lane === "Fast Lane" ? (
                    <Zap className="w-5 h-5 text-green-600" />
                  ) : (
                    <Clock className="w-5 h-5 text-amber-600" />
                  )}
                  <h4 className="font-semibold text-foreground">{lane.lane}</h4>
                </div>
                <div className="space-y-1 text-sm">
                  <div className="text-muted-foreground">
                    <strong>Điều kiện:</strong> {lane.condition}
                  </div>
                  <div className="text-muted-foreground">
                    <strong>Xử lý:</strong> {lane.processing}
                  </div>
                  <Badge variant="outline" className="mt-2">
                    SLA: {lane.sla}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
      
      {/* Epoch System */}
      <Card className="bg-white/80 backdrop-blur-sm border-cyan-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-cyan-700">
            <Clock className="w-5 h-5" />
            Hệ Thống Epoch
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="p-4 bg-cyan-50 rounded-lg border border-cyan-100 text-center">
              <div className="text-3xl font-bold text-cyan-600 mb-1">86,400</div>
              <div className="text-sm text-muted-foreground">Giây / Epoch (24h)</div>
            </div>
            <div className="p-4 bg-amber-50 rounded-lg border border-amber-100 text-center">
              <div className="text-3xl font-bold text-amber-600 mb-1">5M</div>
              <div className="text-sm text-muted-foreground">FUN Cap / Epoch</div>
            </div>
            <div className="p-4 bg-violet-50 rounded-lg border border-violet-100 text-center">
              <div className="text-3xl font-bold text-violet-600 mb-1">No</div>
              <div className="text-sm text-muted-foreground">Rollover (không cộng dồn)</div>
            </div>
          </div>
          
          <p className="text-sm text-muted-foreground mt-4 text-center">
            Mỗi epoch kéo dài 24 giờ. Giới hạn mint không được cộng dồn sang epoch sau 
            để đảm bảo kiểm soát lạm phát.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
