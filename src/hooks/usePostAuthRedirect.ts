import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';

export function usePostAuthRedirect() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const checkAndRedirect = useCallback(async (userId: string) => {
    const returnTo = searchParams.get('returnTo') || '/';

    const { data } = await supabase
      .from('profiles')
      .select('username')
      .eq('id', userId)
      .maybeSingle();

    if (!data?.username) {
      navigate(`/auth/setup-identity?returnTo=${encodeURIComponent(returnTo)}`);
    } else {
      navigate(returnTo);
    }
  }, [navigate, searchParams]);

  useEffect(() => {
    if (!user) return;
    checkAndRedirect(user.id);
  }, [user, checkAndRedirect]);
}
