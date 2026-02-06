import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { API_ENDPOINTS, DATABASE_TABLES, CONTRACT_INFO } from "@/data/docs-data";
import { 
  Code, Database, FileCheck, Key, ExternalLink,
  Table, Server, Shield
} from "lucide-react";

export function ApiTab() {
  return (
    <div className="space-y-8">
      {/* API Endpoints */}
      <Card className="bg-white/80 backdrop-blur-sm border-cyan-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-cyan-700">
            <Server className="w-5 h-5" />
            12 API Endpoints
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {API_ENDPOINTS.map((endpoint, idx) => (
              <div 
                key={idx}
                className="flex items-center gap-3 p-3 bg-white rounded-lg border border-cyan-100 hover:border-cyan-300 transition-colors"
              >
                <Badge className={`${
                  endpoint.method === "POST" 
                    ? "bg-green-100 text-green-700" 
                    : "bg-cyan-100 text-cyan-700"
                } border-0 font-mono text-xs min-w-[50px] justify-center`}>
                  {endpoint.method}
                </Badge>
                <code className="font-mono text-sm text-violet-600 flex-1">
                  {endpoint.path}
                </code>
                <span className="text-sm text-muted-foreground hidden md:block">
                  {endpoint.description}
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
      
      {/* Database Schema */}
      <Card className="bg-white/80 backdrop-blur-sm border-cyan-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-cyan-700">
            <Database className="w-5 h-5" />
            8 Database Tables
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4">
            {DATABASE_TABLES.map((table) => (
              <div 
                key={table.name}
                className="p-4 bg-white rounded-lg border border-cyan-100"
              >
                <div className="flex items-center gap-2 mb-2">
                  <Table className="w-4 h-4 text-cyan-600" />
                  <code className="font-mono text-sm font-bold text-foreground">
                    {table.name}
                  </code>
                </div>
                <p className="text-xs text-muted-foreground mb-2">{table.description}</p>
                <div className="flex flex-wrap gap-1">
                  {table.columns.map((col) => (
                    <Badge key={col} variant="outline" className="text-xs font-mono">
                      {col}
                    </Badge>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
      
      {/* EIP-712 Signature */}
      <Card className="bg-white/80 backdrop-blur-sm border-cyan-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-cyan-700">
            <Key className="w-5 h-5" />
            EIP-712 Signature Flow
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="p-4 bg-gradient-to-r from-violet-50 to-cyan-50 rounded-lg border border-violet-100">
              <h4 className="font-semibold text-foreground mb-2">PPLP Type Structure</h4>
              <pre className="bg-slate-900 text-slate-100 p-4 rounded-lg text-xs overflow-x-auto">
{`struct PPLP {
  address recipient;     // Người nhận FUN
  uint256 amount;        // Số lượng mint (atomic)
  bytes32 actionHash;    // Hash của action type
  uint256 nonce;         // Số thứ tự để tránh replay
  uint256 deadline;      // Thời hạn signature
}`}
              </pre>
            </div>
            
            <div className="grid md:grid-cols-3 gap-4">
              <div className="p-3 bg-pink-50 rounded-lg border border-pink-100 text-center">
                <div className="text-2xl mb-1">1️⃣</div>
                <h4 className="font-semibold text-foreground text-sm">Hash Data</h4>
                <p className="text-xs text-muted-foreground">
                  Tạo typed data hash theo EIP-712
                </p>
              </div>
              <div className="p-3 bg-cyan-50 rounded-lg border border-cyan-100 text-center">
                <div className="text-2xl mb-1">2️⃣</div>
                <h4 className="font-semibold text-foreground text-sm">Attester Sign</h4>
                <p className="text-xs text-muted-foreground">
                  Attesters ký bằng private key
                </p>
              </div>
              <div className="p-3 bg-green-50 rounded-lg border border-green-100 text-center">
                <div className="text-2xl mb-1">3️⃣</div>
                <h4 className="font-semibold text-foreground text-sm">On-chain Verify</h4>
                <p className="text-xs text-muted-foreground">
                  Contract verify và mint
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Multi-sig Attestation */}
      <Card className="bg-white/80 backdrop-blur-sm border-cyan-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-cyan-700">
            <Shield className="w-5 h-5" />
            Multi-sig Attestation
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold text-foreground mb-3">Threshold Requirements</h4>
              <div className="space-y-2">
                {[1, 2, 3, 4, 5].map((threshold) => (
                  <div key={threshold} className="flex items-center justify-between p-2 bg-cyan-50 rounded border border-cyan-100">
                    <span className="text-sm text-foreground">
                      Threshold = {threshold}
                    </span>
                    <Badge variant="outline" className="font-mono">
                      {threshold}/{threshold} attesters required
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
            
            <div>
              <h4 className="font-semibold text-foreground mb-3">Attester Roles</h4>
              <div className="space-y-2">
                <div className="p-3 bg-violet-50 rounded-lg border border-violet-100">
                  <div className="font-semibold text-violet-700 text-sm">SIGNER_ROLE</div>
                  <p className="text-xs text-muted-foreground">TSS hoặc Multisig</p>
                </div>
                <div className="p-3 bg-red-50 rounded-lg border border-red-100">
                  <div className="font-semibold text-red-700 text-sm">PAUSER_ROLE</div>
                  <p className="text-xs text-muted-foreground">Security Council</p>
                </div>
                <div className="p-3 bg-amber-50 rounded-lg border border-amber-100">
                  <div className="font-semibold text-amber-700 text-sm">POLICY_ADMIN</div>
                  <p className="text-xs text-muted-foreground">Governance Executor</p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Contract Info */}
      <Card className="bg-white/80 backdrop-blur-sm border-cyan-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-cyan-700">
            <FileCheck className="w-5 h-5" />
            Smart Contract Info
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <div className="p-3 bg-cyan-50 rounded-lg border border-cyan-100">
                <div className="text-xs text-muted-foreground mb-1">Contract Address</div>
                <code className="text-sm font-mono text-cyan-700 break-all">
                  {CONTRACT_INFO.address}
                </code>
              </div>
              
              <div className="flex gap-3">
                <div className="flex-1 p-3 bg-violet-50 rounded-lg border border-violet-100">
                  <div className="text-xs text-muted-foreground mb-1">Network</div>
                  <div className="font-semibold text-foreground">{CONTRACT_INFO.network}</div>
                </div>
                <div className="flex-1 p-3 bg-amber-50 rounded-lg border border-amber-100">
                  <div className="text-xs text-muted-foreground mb-1">Chain ID</div>
                  <div className="font-semibold text-foreground font-mono">{CONTRACT_INFO.chainId}</div>
                </div>
              </div>
            </div>
            
            <div className="flex items-center justify-center">
              <a 
                href={CONTRACT_INFO.bscscanUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-6 py-3 bg-cyan-500 hover:bg-cyan-600 text-white rounded-lg transition-colors"
              >
                <ExternalLink className="w-5 h-5" />
                View on BSCScan
              </a>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
