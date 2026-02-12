import { FunNavbar } from '@/components/layout/FunNavbar';
import { ContinueWithFunId } from '@/components/auth/ContinueWithFunId';
import { ShoppingBag, Tag, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function Market() {
  return (
    <div className="min-h-screen bg-background">
      <FunNavbar />
      <ContinueWithFunId
        platformId="fun-market"
        platformName="FUN Market"
        platformIcon={<ShoppingBag className="h-8 w-8 text-primary" />}
      >
        <main className="container py-8 px-4 max-w-5xl">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">FUN Market</h1>
            <p className="text-muted-foreground">Mua bán, trao đổi với FUN token 🛍️</p>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            {[
              { title: 'NFT Collections', icon: <Tag className="h-5 w-5" />, count: '12 items' },
              { title: 'Digital Goods', icon: <ShoppingBag className="h-5 w-5" />, count: '45 items' },
              { title: 'Trading', icon: <TrendingUp className="h-5 w-5" />, count: 'Coming soon' },
            ].map((cat, i) => (
              <Card key={i} className="text-center p-6">
                <div className="mx-auto mb-3 p-3 rounded-xl bg-primary/10 w-fit">{cat.icon}</div>
                <CardTitle className="text-base mb-1">{cat.title}</CardTitle>
                <p className="text-xs text-muted-foreground">{cat.count}</p>
              </Card>
            ))}
          </div>
        </main>
      </ContinueWithFunId>
    </div>
  );
}
