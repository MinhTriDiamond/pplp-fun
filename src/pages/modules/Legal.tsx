import { FunNavbar } from '@/components/layout/FunNavbar';
import { ContinueWithFunId } from '@/components/auth/ContinueWithFunId';
import { Scale, FileText, Shield } from 'lucide-react';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';

export default function Legal() {
  return (
    <div className="min-h-screen bg-background">
      <FunNavbar />
      <ContinueWithFunId
        platformId="fun-legal"
        platformName="FUN Legal"
        platformIcon={<Scale className="h-8 w-8 text-primary" />}
      >
        <main className="container py-8 px-4 max-w-5xl">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">FUN Legal</h1>
            <p className="text-muted-foreground">Pháp lý minh bạch, bảo vệ cộng đồng ⚖️</p>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            {[
              { title: 'Điều khoản sử dụng', icon: <FileText className="h-5 w-5" /> },
              { title: 'Chính sách bảo mật', icon: <Shield className="h-5 w-5" /> },
              { title: 'Smart Contract Audit', icon: <Scale className="h-5 w-5" /> },
            ].map((doc, i) => (
              <Card key={i} className="cursor-pointer hover:shadow-md transition-shadow">
                <CardHeader className="flex flex-row items-center gap-3">
                  <div className="p-2 rounded-lg bg-primary/10">{doc.icon}</div>
                  <CardTitle className="text-base">{doc.title}</CardTitle>
                </CardHeader>
              </Card>
            ))}
          </div>
        </main>
      </ContinueWithFunId>
    </div>
  );
}
