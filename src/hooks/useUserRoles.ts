import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import type { UserRole, AppRole } from '@/types/fun-core.types';

interface UseUserRolesResult {
  roles: UserRole[];
  loading: boolean;
  error: string | null;
  hasRole: (role: AppRole, platformId?: string) => boolean;
  isAdmin: boolean;
  isModerator: boolean;
  isAttester: boolean;
  refetch: () => Promise<void>;
}

export function useUserRoles(): UseUserRolesResult {
  const { user } = useAuth();
  const [roles, setRoles] = useState<UserRole[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRoles = useCallback(async () => {
    if (!user?.id) {
      setRoles([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('user_roles')
        .select('*')
        .eq('user_id', user.id);

      if (fetchError) throw fetchError;

      setRoles((data as UserRole[]) || []);
    } catch (err) {
      console.error('Error fetching user roles:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch roles');
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    fetchRoles();
  }, [fetchRoles]);

  const hasRole = useCallback((role: AppRole, platformId?: string): boolean => {
    return roles.some(r => 
      r.role === role && 
      (r.platform_id === null || r.platform_id === platformId)
    );
  }, [roles]);

  const isAdmin = roles.some(r => r.role === 'admin');
  const isModerator = roles.some(r => r.role === 'moderator' || r.role === 'admin');
  const isAttester = roles.some(r => r.role === 'attester' || r.role === 'admin');

  return {
    roles,
    loading,
    error,
    hasRole,
    isAdmin,
    isModerator,
    isAttester,
    refetch: fetchRoles,
  };
}
