import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { WalletConnect } from '@/components/wallet/WalletConnect';
import { TokenLifecyclePanel } from './TokenLifecyclePanel';
import { Gift, ArrowRight } from 'lucide-react';

export function ClaimTab() {
  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      {/* Header */}
      <Card className="bg-gradient-to-br from-primary/5 to-accent/5 border-primary/20">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Gift className="h-5 w-5 text-primary" />
            Nhận FUN Token
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Nếu bạn đã được mint FUN token, hãy kết nối ví để Activate và Claim về ví cá nhân.
          </p>

          {/* Steps */}
          <div className="flex items-center gap-2 text-xs text-muted-foreground flex-wrap">
            <span className="px-2 py-1 rounded bg-amber-100 text-amber-700 font-medium">LOCKED</span>
            <ArrowRight className="h-3 w-3" />
            <span className="text-amber-600 font-medium">Activate</span>
            <ArrowRight className="h-3 w-3" />
            <span className="px-2 py-1 rounded bg-green-100 text-green-700 font-medium">ACTIVATED</span>
            <ArrowRight className="h-3 w-3" />
            <span className="text-green-600 font-medium">Claim</span>
            <ArrowRight className="h-3 w-3" />
            <span className="px-2 py-1 rounded bg-cyan-100 text-cyan-700 font-medium">FLOWING ✨</span>
          </div>

          {/* Wallet Connect */}
          <div className="pt-2">
            <WalletConnect />
          </div>
        </CardContent>
      </Card>

      {/* Token Lifecycle */}
      <TokenLifecyclePanel />
    </div>
  );
}
