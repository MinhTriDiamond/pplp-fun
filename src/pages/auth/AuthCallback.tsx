import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Loader2 } from 'lucide-react';

export default function AuthCallback() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    if (loading) return;

    if (!user) {
      // Token invalid or expired
      navigate('/auth', { replace: true });
      return;
    }

    const returnTo = searchParams.get('returnTo') || '/';

    // Check username setup
    const checkUsername = async () => {
      const { checkUsernameSetup } = await import('@/hooks/useAuth').then(() => ({ checkUsernameSetup: null }));
      const { supabase } = await import('@/integrations/supabase/client');
      const { data } = await supabase
        .from('profiles')
        .select('username')
        .eq('id', user.id)
        .maybeSingle();

      if (!data?.username) {
        navigate(`/auth/setup-identity?returnTo=${encodeURIComponent(returnTo)}`, { replace: true });
      } else {
        navigate(returnTo, { replace: true });
      }
    };

    checkUsername();
  }, [user, loading, navigate, searchParams]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center space-y-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" />
        <p className="text-muted-foreground">Đang xác thực...</p>
      </div>
    </div>
  );
}
