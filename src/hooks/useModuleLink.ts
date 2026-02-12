import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import type { PlatformId } from '@/types/fun-core.types';

export interface ModuleLink {
  id: string;
  fun_user_id: string;
  platform_id: string;
  external_user_id: string | null;
  external_email: string | null;
  display_name: string | null;
  linked_at: string;
  is_active: boolean;
}

export function useModuleLink(platformId: PlatformId) {
  const { user, isAuthenticated } = useAuth();
  const [link, setLink] = useState<ModuleLink | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchLink = useCallback(async () => {
    if (!user) { setLoading(false); return; }
    setLoading(true);
    const { data } = await supabase
      .from('module_users')
      .select('*')
      .eq('fun_user_id', user.id)
      .eq('platform_id', platformId)
      .maybeSingle();
    setLink(data as ModuleLink | null);
    setLoading(false);
  }, [user, platformId]);

  useEffect(() => { fetchLink(); }, [fetchLink]);

  const linkModule = useCallback(async (externalData?: { external_user_id?: string; external_email?: string; display_name?: string }) => {
    if (!user) return false;
    const { error } = await supabase
      .from('module_users')
      .upsert({
        fun_user_id: user.id,
        platform_id: platformId,
        ...externalData,
      } as any, { onConflict: 'fun_user_id,platform_id' });
    if (!error) await fetchLink();
    return !error;
  }, [user, platformId, fetchLink]);

  return { link, loading, isLinked: !!link, linkModule, isAuthenticated };
}
