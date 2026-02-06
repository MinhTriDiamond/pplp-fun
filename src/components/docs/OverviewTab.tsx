import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PILLARS_DATA } from "@/data/docs-data";
import { 
  Heart, Eye, Sparkles, Leaf, Users, 
  Workflow, Database, Shield, Coins, FileCheck,
  ArrowRight
} from "lucide-react";

const pillarIcons: Record<string, React.ElementType> = {
  S: Heart,
  T: Eye,
  H: Sparkles,
  C: Leaf,
  U: Users
};

const architectureComponents = [
  { name: "Frontend dApp", icon: Workflow, description: "React app cho user interaction" },
  { name: "PPLP Engine", icon: Sparkles, description: "Tính điểm và validate actions" },
  { name: "Database", icon: Database, description: "PostgreSQL lưu trữ dữ liệu" },
  { name: "Anti-Fraud", icon: Shield, description: "Phát hiện và ngăn chặn gian lận" },
  { name: "Smart Contract", icon: FileCheck, description: "FUN Money token on-chain" },
  { name: "Treasury", icon: Coins, description: "Quản lý token pools" }
];

export function OverviewTab() {
  return (
    <div className="space-y-8">
      {/* What is PPLP */}
      <Card className="bg-white/80 backdrop-blur-sm border-cyan-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-cyan-700">
            <Sparkles className="w-5 h-5" />
            PPLP là gì?
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-cyan-600/80 leading-relaxed">
            <strong className="text-cyan-700">Proof of Pure Love Protocol (PPLP)</strong> là giao thức chứng minh 
            các hành động Ánh Sáng trong hệ sinh thái FUN. Thay vì Proof of Work hay Proof of Stake, 
            PPLP xác minh giá trị thực sự mà người dùng đóng góp cho cộng đồng.
          </p>
          
          <div className="grid md:grid-cols-2 gap-4 pt-4">
            <div className="p-4 bg-cyan-50 rounded-lg border border-cyan-100">
              <h4 className="font-semibold text-cyan-700 mb-2">🌟 FUN Money</h4>
              <p className="text-sm text-muted-foreground">
                Token tiện ích của hệ sinh thái, được mint thông qua việc thực hiện các hành động 
                Ánh Sáng có xác minh. Symbol: FUN, Decimals: 18.
              </p>
            </div>
            
            <div className="p-4 bg-violet-50 rounded-lg border border-violet-100">
              <h4 className="font-semibold text-violet-700 mb-2">💎 Camly Coin</h4>
              <p className="text-sm text-muted-foreground">
                Token governance và staking. Stake Camly để boost hệ số Integrity (K) lên tới 1.2x,
                thể hiện cam kết dài hạn với hệ sinh thái.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* 5 Pillars */}
      <Card className="bg-white/80 backdrop-blur-sm border-cyan-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-cyan-700">
            <Heart className="w-5 h-5" />
            5 Trụ Cột Ánh Sáng
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-4 p-3 bg-cyan-50 rounded-lg text-center">
            <code className="text-sm font-mono text-cyan-700">
              Light Score = 0.25×S + 0.20×T + 0.20×H + 0.20×C + 0.15×U
            </code>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {PILLARS_DATA.map((pillar) => {
              const Icon = pillarIcons[pillar.id];
              return (
                <div 
                  key={pillar.id}
                  className={`p-4 rounded-lg border ${pillar.borderColor} ${pillar.bgColor} text-center`}
                >
                  <div className={`inline-flex rounded-full p-3 bg-white/50 mb-2`}>
                    <Icon className={`w-6 h-6 ${pillar.color}`} />
                  </div>
                  <div className={`text-2xl font-bold ${pillar.color} mb-1`}>{pillar.id}</div>
                  <h4 className={`font-semibold text-sm ${pillar.color}`}>{pillar.nameVi}</h4>
                  <p className="text-xs text-cyan-600/70 mt-1">{pillar.name}</p>
                  <div className={`mt-2 inline-block px-2 py-0.5 rounded-full text-xs font-medium ${pillar.bgColor} ${pillar.color}`}>
                    {pillar.weightPercent}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
      
      {/* System Architecture */}
      <Card className="bg-white/80 backdrop-blur-sm border-cyan-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-cyan-700">
            <Workflow className="w-5 h-5" />
            Kiến Trúc Hệ Thống
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {architectureComponents.map((comp, idx) => (
              <div key={comp.name} className="text-center p-4 bg-gradient-to-b from-cyan-50 to-white rounded-lg border border-cyan-100">
                <div className="inline-flex rounded-xl p-3 bg-cyan-100 mb-2">
                  <comp.icon className="w-6 h-6 text-cyan-600" />
                </div>
                <h4 className="font-medium text-cyan-700 text-sm mb-1">{comp.name}</h4>
                <p className="text-xs text-cyan-600/70">{comp.description}</p>
                {idx < architectureComponents.length - 1 && (
                  <ArrowRight className="hidden lg:block absolute right-0 top-1/2 -translate-y-1/2 w-4 h-4 text-cyan-300" />
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
      
      {/* Data Flow */}
      <Card className="bg-white/80 backdrop-blur-sm border-cyan-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-cyan-700">
            <ArrowRight className="w-5 h-5" />
            Luồng Dữ Liệu
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap items-center justify-center gap-2 md:gap-4">
            {[
              { step: "1", label: "User Action", color: "bg-pink-100 text-pink-700 border-pink-200" },
              { step: "→", label: "", color: "text-cyan-400" },
              { step: "2", label: "Evidence", color: "bg-cyan-100 text-cyan-700 border-cyan-200" },
              { step: "→", label: "", color: "text-cyan-400" },
              { step: "3", label: "PPLP Score", color: "bg-violet-100 text-violet-700 border-violet-200" },
              { step: "→", label: "", color: "text-cyan-400" },
              { step: "4", label: "Attester Sign", color: "bg-amber-100 text-amber-700 border-amber-200" },
              { step: "→", label: "", color: "text-cyan-400" },
              { step: "5", label: "Mint FUN", color: "bg-green-100 text-green-700 border-green-200" }
            ].map((item, idx) => (
              item.label ? (
                <div key={idx} className={`px-4 py-2 rounded-lg border ${item.color} text-center`}>
                  <div className="text-lg font-bold">{item.step}</div>
                  <div className="text-xs">{item.label}</div>
                </div>
              ) : (
                <ArrowRight key={idx} className={`w-5 h-5 ${item.color} hidden md:block`} />
              )
            ))}
          </div>
          
          <p className="text-sm text-cyan-600 text-center mt-4">
            Mỗi hành động được thu thập bằng chứng → PPLP Engine tính điểm → 
            Attester xác thực và ký → Smart Contract mint FUN Money
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
