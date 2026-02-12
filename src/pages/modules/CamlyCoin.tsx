import { FunNavbar } from '@/components/layout/FunNavbar';
import { ContinueWithFunId } from '@/components/auth/ContinueWithFunId';
import { Coins, TrendingUp, ArrowRightLeft, PieChart } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

export default function CamlyCoin() {
  return (
    <div className="min-h-screen bg-background">
      <FunNavbar />
      <ContinueWithFunId
        platformId="camly-coin"
        platformName="CAMLY Coin"
        platformIcon={<Coins className="h-8 w-8 text-amber-500" />}
      >
        <main className="container py-8 px-4 max-w-5xl">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">CAMLY Coin</h1>
            <p className="text-muted-foreground">Token quản trị hệ sinh thái FUN 🪙</p>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            {[
              { title: 'Giá CAMLY', icon: <TrendingUp className="h-5 w-5" />, value: '—' },
              { title: 'Swap FUN ↔ CAMLY', icon: <ArrowRightLeft className="h-5 w-5" />, value: 'Coming soon' },
              { title: 'Tokenomics', icon: <PieChart className="h-5 w-5" />, value: 'View' },
            ].map((item, i) => (
              <Card key={i} className="text-center p-6">
                <div className="mx-auto mb-3 p-3 rounded-xl bg-amber-50 dark:bg-amber-950 w-fit">{item.icon}</div>
                <CardTitle className="text-base mb-1">{item.title}</CardTitle>
                <p className="text-sm text-muted-foreground">{item.value}</p>
              </Card>
            ))}
          </div>
        </main>
      </ContinueWithFunId>
    </div>
  );
}
