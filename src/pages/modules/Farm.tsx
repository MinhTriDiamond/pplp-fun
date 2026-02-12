import { FunNavbar } from '@/components/layout/FunNavbar';
import { ContinueWithFunId } from '@/components/auth/ContinueWithFunId';
import { Sprout, Droplets, Sun, TreePine } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

export default function Farm() {
  return (
    <div className="min-h-screen bg-background">
      <FunNavbar />
      <ContinueWithFunId
        platformId="fun-farm"
        platformName="FUN Farm"
        platformIcon={<Sprout className="h-8 w-8 text-green-600" />}
      >
        <main className="container py-8 px-4 max-w-5xl">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">FUN Farm</h1>
            <p className="text-muted-foreground">Trồng, chăm sóc và thu hoạch FUN 🌱</p>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[
              { name: 'Vườn Tình Yêu', icon: <Sprout className="h-5 w-5 text-green-500" />, progress: 65 },
              { name: 'Giếng Nước Sạch', icon: <Droplets className="h-5 w-5 text-blue-500" />, progress: 40 },
              { name: 'Năng Lượng Mặt Trời', icon: <Sun className="h-5 w-5 text-amber-500" />, progress: 20 },
              { name: 'Rừng Phục Hồi', icon: <TreePine className="h-5 w-5 text-emerald-700" />, progress: 10 },
            ].map((plot, i) => (
              <Card key={i}>
                <CardHeader className="flex flex-row items-center gap-3 pb-2">
                  {plot.icon}
                  <CardTitle className="text-base">{plot.name}</CardTitle>
                </CardHeader>
                <CardContent>
                  <Progress value={plot.progress} className="h-2" />
                  <p className="text-xs text-muted-foreground mt-1">{plot.progress}% hoàn thành</p>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="mt-8 p-6 rounded-xl border bg-muted/30 text-center">
            <p className="text-muted-foreground">🌾 Tính năng farming đang được phát triển. Coming soon!</p>
          </div>
        </main>
      </ContinueWithFunId>
    </div>
  );
}
