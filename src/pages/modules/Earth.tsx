import { FunNavbar } from '@/components/layout/FunNavbar';
import { ContinueWithFunId } from '@/components/auth/ContinueWithFunId';
import { Globe, Leaf, Recycle, Wind } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

export default function Earth() {
  return (
    <div className="min-h-screen bg-background">
      <FunNavbar />
      <ContinueWithFunId
        platformId="fun-earth"
        platformName="FUN Earth"
        platformIcon={<Globe className="h-8 w-8 text-emerald-500" />}
      >
        <main className="container py-8 px-4 max-w-5xl">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">FUN Earth</h1>
            <p className="text-muted-foreground">Bảo vệ Trái Đất, kiếm FUN từ hành động xanh 🌍</p>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            {[
              { title: 'Carbon Offset', icon: <Leaf className="h-5 w-5 text-green-500" />, desc: 'Bù đắp carbon cá nhân' },
              { title: 'Recycle & Earn', icon: <Recycle className="h-5 w-5 text-blue-500" />, desc: 'Tái chế, nhận FUN' },
              { title: 'Clean Energy', icon: <Wind className="h-5 w-5 text-cyan-500" />, desc: 'Năng lượng sạch' },
            ].map((item, i) => (
              <Card key={i}>
                <CardHeader className="flex flex-row items-center gap-3">
                  {item.icon}
                  <div>
                    <CardTitle className="text-base">{item.title}</CardTitle>
                    <p className="text-xs text-muted-foreground">{item.desc}</p>
                  </div>
                </CardHeader>
              </Card>
            ))}
          </div>
          <div className="mt-8 p-6 rounded-xl border bg-muted/30 text-center">
            <p className="text-muted-foreground">🌿 Module đang phát triển. Coming soon!</p>
          </div>
        </main>
      </ContinueWithFunId>
    </div>
  );
}
