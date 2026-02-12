import { FunNavbar } from '@/components/layout/FunNavbar';
import { ContinueWithFunId } from '@/components/auth/ContinueWithFunId';
import { Heart, HandHeart, Globe, Users } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export default function Charity() {
  return (
    <div className="min-h-screen bg-background">
      <FunNavbar />
      <ContinueWithFunId
        platformId="fun-charity"
        platformName="FUN Charity"
        platformIcon={<Heart className="h-8 w-8 text-rose-500" />}
      >
        <main className="container py-8 px-4 max-w-5xl">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">FUN Charity</h1>
            <p className="text-muted-foreground">Lan tỏa yêu thương, tạo tác động tích cực ❤️</p>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {[
              { title: 'Quỹ Học Bổng FUN', icon: <HandHeart className="h-5 w-5" />, raised: '12,500 FUN', goal: '50,000 FUN' },
              { title: 'Nước Sạch Cho Em', icon: <Globe className="h-5 w-5" />, raised: '8,200 FUN', goal: '30,000 FUN' },
              { title: 'Cộng Đồng Xanh', icon: <Users className="h-5 w-5" />, raised: '3,100 FUN', goal: '20,000 FUN' },
            ].map((campaign, i) => (
              <Card key={i}>
                <CardHeader className="flex flex-row items-center gap-3 pb-2">
                  <div className="p-2 rounded-lg bg-rose-50 dark:bg-rose-950">{campaign.icon}</div>
                  <div className="flex-1">
                    <CardTitle className="text-base">{campaign.title}</CardTitle>
                    <p className="text-xs text-muted-foreground">{campaign.raised} / {campaign.goal}</p>
                  </div>
                  <Badge variant="secondary">Đang gây quỹ</Badge>
                </CardHeader>
              </Card>
            ))}
          </div>
        </main>
      </ContinueWithFunId>
    </div>
  );
}
