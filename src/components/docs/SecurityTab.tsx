import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  FRAUD_PENALTIES, 
  ANTI_COLLUSION_RULES,
  RATE_LIMITS,
  CIRCUIT_BREAKERS,
  EMERGENCY_PAUSE,
  GOVERNANCE_TIMELOCK
} from "@/data/docs-data";
import { 
  Shield, AlertTriangle, Zap, Ban, Clock, 
  Users, Lock, Settings
} from "lucide-react";

export function SecurityTab() {
  return (
    <div className="space-y-8">
      {/* Anti-Fraud K Multiplier */}
      <Card className="bg-white/80 backdrop-blur-sm border-cyan-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-cyan-700">
            <Shield className="w-5 h-5" />
            Anti-Fraud (K Multiplier)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-cyan-200 bg-cyan-50">
                  <th className="text-left p-3 font-semibold text-cyan-700">Fraud Type</th>
                  <th className="text-center p-3 font-semibold text-cyan-700">K Value</th>
                  <th className="text-center p-3 font-semibold text-cyan-700">Action</th>
                  <th className="text-center p-3 font-semibold text-cyan-700">Ban Days</th>
                </tr>
              </thead>
              <tbody>
                {FRAUD_PENALTIES.map((penalty, idx) => (
                  <tr key={penalty.type} className={idx % 2 === 0 ? "bg-white" : "bg-cyan-50/50"}>
                    <td className="p-3">
                      <Badge className={`${penalty.color} border-0`}>
                        {penalty.type}
                      </Badge>
                    </td>
                    <td className="p-3 text-center font-mono font-bold text-red-600">
                      {penalty.setK}
                    </td>
                    <td className="p-3 text-center">
                      <Badge variant="outline" className={
                        penalty.action === "REJECT" ? "border-red-300 text-red-600" : "border-amber-300 text-amber-600"
                      }>
                        {penalty.action}
                      </Badge>
                    </td>
                    <td className="p-3 text-center font-mono">{penalty.banDays} days</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          <div className="mt-4 p-3 bg-red-50 rounded-lg border border-red-200">
            <p className="text-sm text-red-700">
              ⚠️ <strong>K = 0</strong> nghĩa là token mint = 0, hành động bị từ chối hoàn toàn.
            </p>
          </div>
        </CardContent>
      </Card>
      
      {/* Anti-Collusion */}
      <Card className="bg-white/80 backdrop-blur-sm border-cyan-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-cyan-700">
            <Users className="w-5 h-5" />
            Anti-Collusion Rules
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="p-4 bg-violet-50 rounded-lg border border-violet-100">
              <div className="flex items-center gap-2 mb-2">
                <Ban className="w-5 h-5 text-violet-600" />
                <h4 className="font-semibold text-violet-700">Witness Uniqueness</h4>
              </div>
              <p className="text-sm text-violet-600/80">
                {ANTI_COLLUSION_RULES.witnessUniqueness ? "✅ Enabled" : "❌ Disabled"}
              </p>
              <p className="text-xs text-violet-600/70 mt-1">
                Mỗi witness chỉ được verify 1 lần cho cùng action
              </p>
            </div>
            
            <div className="p-4 bg-cyan-50 rounded-lg border border-cyan-100">
              <div className="flex items-center gap-2 mb-2">
                <Users className="w-5 h-5 text-cyan-600" />
                <h4 className="font-semibold text-cyan-700">Graph Distance</h4>
              </div>
              <p className="text-sm text-cyan-600/80">
                Min Hops: <strong>{ANTI_COLLUSION_RULES.witnessGraphDistanceMinHops}</strong>
              </p>
              <p className="text-xs text-cyan-600/70 mt-1">
                Witness phải cách recipient ít nhất 2 hop
              </p>
            </div>
            
            <div className="p-4 bg-amber-50 rounded-lg border border-amber-100">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="w-5 h-5 text-amber-600" />
                <h4 className="font-semibold text-amber-700">Penalty</h4>
              </div>
              <p className="text-sm text-amber-600/80">
                Reduce Ux: <strong>-{ANTI_COLLUSION_RULES.penaltyReduceUxBy}</strong>
              </p>
              <p className="text-xs text-amber-600/70 mt-1">
                Vi phạm sẽ bị giảm Ux multiplier
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Rate Limiting */}
      <Card className="bg-white/80 backdrop-blur-sm border-cyan-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-cyan-700">
            <Zap className="w-5 h-5" />
            Rate Limiting
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 bg-cyan-50 rounded-lg border border-cyan-100 text-center">
              <div className="text-2xl font-bold text-cyan-600">{RATE_LIMITS.globalMintsPerSecond}</div>
              <div className="text-sm text-muted-foreground">Global Mints/Second</div>
            </div>
            <div className="p-4 bg-violet-50 rounded-lg border border-violet-100 text-center">
              <div className="text-2xl font-bold text-violet-600">{RATE_LIMITS.perUserMintsPerMinute}</div>
              <div className="text-sm text-muted-foreground">User Mints/Minute</div>
            </div>
            <div className="p-4 bg-amber-50 rounded-lg border border-amber-100 text-center">
              <div className="text-2xl font-bold text-amber-600">{RATE_LIMITS.burstAllowance}</div>
              <div className="text-sm text-muted-foreground">Burst Allowance</div>
            </div>
            <div className="p-4 bg-red-50 rounded-lg border border-red-100 text-center">
              <div className="text-sm font-bold text-red-600">{RATE_LIMITS.actionOnLimit}</div>
              <div className="text-sm text-muted-foreground">On Limit Action</div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Circuit Breakers */}
      <Card className="bg-white/80 backdrop-blur-sm border-cyan-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-amber-600">
            <AlertTriangle className="w-5 h-5" />
            Circuit Breakers
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="p-4 bg-red-50 rounded-lg border border-red-200">
              <h4 className="font-semibold text-red-700 mb-2">Max Mint Per Hour</h4>
              <div className="text-2xl font-bold text-red-600 font-mono">
                {CIRCUIT_BREAKERS.maxMintPerHour}
              </div>
            </div>
            <div className="p-4 bg-red-50 rounded-lg border border-red-200">
              <h4 className="font-semibold text-red-700 mb-2">Max Mint Per Day</h4>
              <div className="text-2xl font-bold text-red-600 font-mono">
                {CIRCUIT_BREAKERS.maxMintPerDay}
              </div>
            </div>
          </div>
          
          <div className="mt-4 p-3 bg-amber-50 rounded-lg border border-amber-200">
            <p className="text-sm text-amber-700">
              ⚡ <strong>Action on Break:</strong> {CIRCUIT_BREAKERS.actionOnBreak}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Alert channels: {CIRCUIT_BREAKERS.alertChannels.join(", ")}
            </p>
          </div>
        </CardContent>
      </Card>
      
      {/* Emergency Pause & Governance */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card className="bg-white/80 backdrop-blur-sm border-cyan-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-amber-600">
              <Lock className="w-5 h-5" />
              Emergency Pause
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-2">
              <div className="text-sm">
                <strong>Roles Allowed:</strong>
              </div>
              <div className="flex flex-wrap gap-1">
                {EMERGENCY_PAUSE.rolesAllowed.map((role) => (
                  <Badge key={role} variant="outline" className="text-xs">
                    {role}
                  </Badge>
                ))}
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="text-sm">
                <strong>Trigger Conditions:</strong>
              </div>
              <div className="flex flex-wrap gap-1">
                {EMERGENCY_PAUSE.triggerConditions.map((condition) => (
                  <Badge key={condition} className="text-xs bg-red-100 text-red-700 border-0">
                    {condition}
                  </Badge>
                ))}
              </div>
            </div>
            
            <div className="p-2 bg-cyan-50 rounded border border-cyan-100 text-xs text-muted-foreground">
              Cooldown: {EMERGENCY_PAUSE.cooldownAfterPauseSec}s | 
              Auto-resume: {EMERGENCY_PAUSE.autoResumeAllowed ? "Yes" : "No"}
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-white/80 backdrop-blur-sm border-cyan-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-cyan-700">
              <Settings className="w-5 h-5" />
              Governance Timelock
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-violet-50 rounded-lg border border-violet-100 text-center">
                <div className="text-lg font-bold text-violet-600">3/5</div>
                <div className="text-xs text-muted-foreground">Multisig Required</div>
              </div>
              <div className="p-3 bg-cyan-50 rounded-lg border border-cyan-100 text-center">
                <div className="text-lg font-bold text-cyan-600">{GOVERNANCE_TIMELOCK.proposalCooldownDays}d</div>
                <div className="text-xs text-muted-foreground">Proposal Cooldown</div>
              </div>
            </div>
            
            <div className="p-2 bg-amber-50 rounded border border-amber-100 text-sm">
              <strong>Community Vote:</strong> {(GOVERNANCE_TIMELOCK.communityVoteThreshold * 100).toFixed(0)}% threshold
            </div>
            
            <div className="p-2 bg-red-50 rounded border border-red-100 text-sm">
              <strong>Emergency Override:</strong> {GOVERNANCE_TIMELOCK.emergencyOverride}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
