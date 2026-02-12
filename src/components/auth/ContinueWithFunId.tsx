import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Sparkles, LogIn, Link as LinkIcon, CheckCircle2 } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useModuleLink } from '@/hooks/useModuleLink';
import type { PlatformId } from '@/types/fun-core.types';

interface ContinueWithFunIdProps {
  platformId: PlatformId;
  platformName: string;
  platformIcon: React.ReactNode;
  children: React.ReactNode;
}

export function ContinueWithFunId({ platformId, platformName, platformIcon, children }: ContinueWithFunIdProps) {
  const navigate = useNavigate();
  const { isAuthenticated, loading: authLoading } = useAuth();
  const { isLinked, loading: linkLoading, linkModule } = useModuleLink(platformId);

  if (authLoading || linkLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="animate-pulse text-primary text-lg">Đang tải...</div>
      </div>
    );
  }

  // Not logged in → show login prompt
  if (!isAuthenticated) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center p-4">
        <Card className="w-full max-w-md text-center">
          <CardHeader>
            <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
              {platformIcon}
            </div>
            <CardTitle className="text-2xl">{platformName}</CardTitle>
            <CardDescription>
              Đăng nhập bằng FUN ID để trải nghiệm {platformName}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button onClick={() => navigate('/auth')} className="w-full gap-2" size="lg">
              <Sparkles className="h-5 w-5" />
              Continue with FUN ID
            </Button>
            <p className="text-xs text-muted-foreground">
              Một tài khoản duy nhất cho toàn bộ hệ sinh thái FUN
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Logged in but not linked → auto-link and show
  if (!isLinked) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center p-4">
        <Card className="w-full max-w-md text-center">
          <CardHeader>
            <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
              {platformIcon}
            </div>
            <CardTitle className="text-xl">Kích hoạt {platformName}</CardTitle>
            <CardDescription>
              Liên kết FUN ID của bạn với {platformName} để bắt đầu
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button onClick={() => linkModule()} className="w-full gap-2" size="lg">
              <LinkIcon className="h-5 w-5" />
              Kích hoạt {platformName}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Linked → show module content
  return <>{children}</>;
}
