import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import type { PrivacyPermissions } from '@/types/fun-core.types';

interface UsePrivacyPermissionsResult {
  permissions: PrivacyPermissions | null;
  loading: boolean;
  error: string | null;
  updatePermissions: (updates: Partial<PrivacyPermissions>) => Promise<boolean>;
  refetch: () => Promise<void>;
}

export function usePrivacyPermissions(): UsePrivacyPermissionsResult {
  const { user } = useAuth();
  const [permissions, setPermissions] = useState<PrivacyPermissions | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPermissions = useCallback(async () => {
    if (!user?.id) {
      setPermissions(null);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('privacy_permissions')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (fetchError) {
        // If no record exists, create default permissions
        if (fetchError.code === 'PGRST116') {
          const { data: newData, error: insertError } = await supabase
            .from('privacy_permissions')
            .insert({ user_id: user.id })
            .select()
            .single();

          if (insertError) throw insertError;
          setPermissions(newData as PrivacyPermissions);
        } else {
          throw fetchError;
        }
      } else {
        setPermissions(data as PrivacyPermissions);
      }
    } catch (err) {
      console.error('Error fetching privacy permissions:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch permissions');
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    fetchPermissions();
  }, [fetchPermissions]);

  const updatePermissions = useCallback(async (updates: Partial<PrivacyPermissions>): Promise<boolean> => {
    if (!user?.id) return false;

    try {
      setError(null);

      // Store old values for audit log
      const oldValues = permissions ? { ...permissions } : null;

      const { data, error: updateError } = await supabase
        .from('privacy_permissions')
        .update(updates)
        .eq('user_id', user.id)
        .select()
        .single();

      if (updateError) throw updateError;

      setPermissions(data as PrivacyPermissions);

      // Create audit log entry
      await supabase.from('audit_logs').insert({
        user_id: user.id,
        action: 'permission_change',
        resource_type: 'privacy_permissions',
        resource_id: user.id,
        old_value: oldValues,
        new_value: updates,
      });

      return true;
    } catch (err) {
      console.error('Error updating privacy permissions:', err);
      setError(err instanceof Error ? err.message : 'Failed to update permissions');
      return false;
    }
  }, [user?.id, permissions]);

  return {
    permissions,
    loading,
    error,
    updatePermissions,
    refetch: fetchPermissions,
  };
}
