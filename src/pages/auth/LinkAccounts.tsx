import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Link2, CheckCircle2, Loader2, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';

const PLATFORMS = [
  {
    id: 'fun-profile',
    name: 'FUN Profile',
    description: 'fun.rich — Mạng xã hội chính',
    emoji: '✨',
  },
  {
    id: 'fun-play',
    name: 'FUN Play',
    description: 'play.fun.rich — Games & Rewards',
    emoji: '🎮',
  },
  {
    id: 'angel-ai',
    name: 'Angel AI',
    description: 'angel.fun.rich — AI Assistant',
    emoji: '🤖',
  },
];

export default function LinkAccounts() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const returnTo = searchParams.get('returnTo') || '/';

  const { user } = useAuth();
  const [linkedPlatforms, setLinkedPlatforms] = useState<Set<string>>(new Set());
  const [loadingPlatform, setLoadingPlatform] = useState<string | null>(null);
  const [initialLoading, setInitialLoading] = useState(true);

  // Redirect if not authenticated
  useEffect(() => {
    if (!user) {
      navigate('/auth');
    }
  }, [user, navigate]);

  // Load existing linked accounts
  useEffect(() => {
    if (!user) return;
    supabase
      .from('module_users')
      .select('platform_id')
      .eq('fun_user_id', user.id)
      .eq('is_active', true)
      .then(({ data }) => {
        if (data) {
          setLinkedPlatforms(new Set(data.map((d) => d.platform_id)));
        }
        setInitialLoading(false);
      });
  }, [user]);

  const handleLink = async (platformId: string) => {
    if (!user) return;
    setLoadingPlatform(platformId);

    try {
      await supabase.from('module_users').upsert({
        fun_user_id: user.id,
        platform_id: platformId,
        is_active: true,
        linked_at: new Date().toISOString(),
        display_name: user.email?.split('@')[0] || null,
        external_email: user.email || null,
      } as any);

      setLinkedPlatforms((prev) => new Set([...prev, platformId]));
    } catch (err) {
      console.error('Link error:', err);
    } finally {
      setLoadingPlatform(null);
    }
  };

  const handleSkip = () => {
    navigate(returnTo);
  };

  const allLinked = PLATFORMS.every((p) => linkedPlatforms.has(p.id));

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-background to-secondary/30 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-sm space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="flex justify-center">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-accent to-purple-400 flex items-center justify-center shadow-lg">
              <Link2 className="h-8 w-8 text-white" />
            </div>
          </div>
          <h1 className="text-2xl font-bold text-foreground">Nâng cấp tài khoản</h1>
          <p className="text-sm text-muted-foreground">
            Liên kết các platform để không mất dữ liệu cũ
          </p>
        </div>

        {/* Platform list */}
        <div className="space-y-3">
          {initialLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : (
            PLATFORMS.map((platform) => {
              const isLinked = linkedPlatforms.has(platform.id);
              const isLinking = loadingPlatform === platform.id;

              return (
                <div
                  key={platform.id}
                  className="flex items-center gap-3 p-4 rounded-xl border border-border bg-card"
                >
                  <div className="text-2xl w-10 text-center">{platform.emoji}</div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm text-foreground">{platform.name}</p>
                    <p className="text-xs text-muted-foreground truncate">{platform.description}</p>
                  </div>
                  <div className="shrink-0">
                    {isLinked ? (
                      <Badge variant="outline" className="gap-1 text-xs border-green-200 text-green-700 bg-green-50">
                        <CheckCircle2 className="h-3 w-3" />
                        Đã liên kết
                      </Badge>
                    ) : (
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-xs h-7 px-3"
                        onClick={() => handleLink(platform.id)}
                        disabled={isLinking}
                      >
                        {isLinking ? (
                          <Loader2 className="h-3 w-3 animate-spin" />
                        ) : (
                          'Liên kết'
                        )}
                      </Button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Actions */}
        <div className="space-y-3">
          {allLinked ? (
            <Button
              className="w-full bg-gradient-to-r from-primary to-amber-500 hover:from-primary/90 hover:to-amber-600 font-semibold"
              onClick={handleSkip}
            >
              Hoàn tất — Vào FUN ID
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          ) : (
            <>
              <Button
                className="w-full bg-gradient-to-r from-primary to-amber-500 hover:from-primary/90 hover:to-amber-600 font-semibold"
                onClick={handleSkip}
              >
                Xong — Vào FUN ID
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                className="w-full text-muted-foreground text-sm"
                onClick={handleSkip}
              >
                Để sau →
              </Button>
            </>
          )}
        </div>

        {/* Progress indicator */}
        <div className="flex items-center justify-center gap-2">
          <div className="h-2 w-8 rounded-full bg-primary/40" />
          <div className="h-2 w-8 rounded-full bg-primary" />
          <div className="h-2 w-8 rounded-full bg-muted" />
        </div>
        <p className="text-center text-xs text-muted-foreground">Bước 2 / 3</p>
      </div>
    </div>
  );
}
