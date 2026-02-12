import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

const USERNAME_REGEX = /^[a-z0-9_]{4,20}$/;
const RESERVED_WORDS = [
  'admin', 'support', 'fun', 'wallet', 'treasury',
  'academy', 'play', 'farm', 'charity', 'planet',
  'angel', 'ai', 'greenearth', 'camly',
];

export type UsernameStatus = 'idle' | 'checking' | 'available' | 'taken' | 'invalid' | 'reserved';

export function useUsername() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [status, setStatus] = useState<UsernameStatus>('idle');
  const [saving, setSaving] = useState(false);

  const validate = useCallback((username: string): UsernameStatus => {
    if (!username) return 'idle';
    if (!USERNAME_REGEX.test(username)) return 'invalid';
    if (RESERVED_WORDS.includes(username)) return 'reserved';
    return 'available'; // tentative, need DB check
  }, []);

  const checkAvailability = useCallback(async (username: string) => {
    const localStatus = validate(username);
    if (localStatus !== 'available') {
      setStatus(localStatus);
      return localStatus;
    }

    setStatus('checking');
    const { data } = await supabase
      .from('profiles')
      .select('id')
      .eq('username', username)
      .maybeSingle();

    if (data && data.id !== user?.id) {
      setStatus('taken');
      return 'taken' as UsernameStatus;
    }
    setStatus('available');
    return 'available' as UsernameStatus;
  }, [user?.id, validate]);

  const saveUsername = useCallback(async (username: string) => {
    if (!user) return false;
    const finalStatus = await checkAvailability(username);
    if (finalStatus !== 'available') return false;

    setSaving(true);
    const { error } = await supabase
      .from('profiles')
      .update({ username } as any)
      .eq('id', user.id);

    setSaving(false);
    if (error) {
      toast({ title: 'Lỗi', description: error.message, variant: 'destructive' });
      return false;
    }
    toast({ title: 'Thành công!', description: `Username @${username} đã được lưu ✨` });
    return true;
  }, [user, checkAvailability, toast]);

  return { status, saving, validate, checkAvailability, saveUsername };
}
