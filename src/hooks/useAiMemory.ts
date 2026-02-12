import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export interface MemoryItem {
  id: string;
  key: string;
  value: string;
  category: string;
  source_module: string | null;
  updated_at: string;
}

export function useAiMemory() {
  const { user } = useAuth();
  const [memories, setMemories] = useState<MemoryItem[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchMemories = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    const { data } = await supabase
      .from('ai_memory')
      .select('*')
      .eq('user_id', user.id)
      .order('updated_at', { ascending: false });
    if (data) setMemories(data as MemoryItem[]);
    setLoading(false);
  }, [user]);

  const deleteMemory = useCallback(async (id: string) => {
    await supabase.from('ai_memory').delete().eq('id', id);
    setMemories(prev => prev.filter(m => m.id !== id));
  }, []);

  const updateMemory = useCallback(async (id: string, value: string) => {
    await supabase.from('ai_memory').update({ value }).eq('id', id);
    setMemories(prev => prev.map(m => m.id === id ? { ...m, value } : m));
  }, []);

  return { memories, loading, fetchMemories, deleteMemory, updateMemory };
}
