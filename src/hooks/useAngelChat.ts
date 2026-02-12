import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface Conversation {
  id: string;
  title: string;
  module: string;
  updated_at: string;
}

export function useAngelChat(module = 'general') {
  const { user } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [conversations, setConversations] = useState<Conversation[]>([]);

  const loadConversations = useCallback(async () => {
    if (!user) return;
    const { data } = await supabase
      .from('ai_conversations')
      .select('id, title, module, updated_at')
      .eq('user_id', user.id)
      .eq('is_archived', false)
      .order('updated_at', { ascending: false })
      .limit(20);
    if (data) setConversations(data);
  }, [user]);

  const loadConversation = useCallback(async (convoId: string) => {
    const { data } = await supabase
      .from('ai_messages')
      .select('role, content')
      .eq('conversation_id', convoId)
      .order('created_at', { ascending: true });
    if (data) {
      setMessages(data.filter(m => m.role !== 'system') as ChatMessage[]);
      setConversationId(convoId);
    }
  }, []);

  const createConversation = useCallback(async (): Promise<string | null> => {
    if (!user) return null;
    const { data, error } = await supabase
      .from('ai_conversations')
      .insert({ user_id: user.id, module, title: 'New Chat' })
      .select('id')
      .single();
    if (error || !data) return null;
    setConversationId(data.id);
    return data.id;
  }, [user, module]);

  const sendMessage = useCallback(async (input: string) => {
    if (!user || !input.trim()) return;
    setIsLoading(true);

    let convoId = conversationId;
    if (!convoId) {
      convoId = await createConversation();
      if (!convoId) { setIsLoading(false); return; }
    }

    const userMsg: ChatMessage = { role: 'user', content: input };
    const allMessages = [...messages, userMsg];
    setMessages(allMessages);

    let assistantContent = '';
    const updateAssistant = (chunk: string) => {
      assistantContent += chunk;
      setMessages(prev => {
        const last = prev[prev.length - 1];
        if (last?.role === 'assistant') {
          return prev.map((m, i) => i === prev.length - 1 ? { ...m, content: assistantContent } : m);
        }
        return [...prev, { role: 'assistant', content: assistantContent }];
      });
    };

    try {
      const resp = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/angel-chat`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`,
          },
          body: JSON.stringify({
            messages: allMessages,
            conversation_id: convoId,
            module,
          }),
        }
      );

      if (!resp.ok || !resp.body) {
        const err = await resp.json().catch(() => ({}));
        throw new Error(err.error || 'Failed to get response');
      }

      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });

        let nlIdx: number;
        while ((nlIdx = buffer.indexOf('\n')) !== -1) {
          let line = buffer.slice(0, nlIdx);
          buffer = buffer.slice(nlIdx + 1);
          if (line.endsWith('\r')) line = line.slice(0, -1);
          if (!line.startsWith('data: ')) continue;
          const json = line.slice(6).trim();
          if (json === '[DONE]') break;
          try {
            const parsed = JSON.parse(json);
            const content = parsed.choices?.[0]?.delta?.content;
            if (content) updateAssistant(content);
          } catch { /* partial */ }
        }
      }

      // Save assistant message
      if (assistantContent && convoId) {
        await supabase.from('ai_messages').insert({
          conversation_id: convoId,
          role: 'assistant',
          content: assistantContent,
          module,
        });
        // Update conversation title from first exchange
        if (allMessages.length <= 2) {
          const title = input.slice(0, 50) + (input.length > 50 ? '...' : '');
          await supabase.from('ai_conversations').update({ title }).eq('id', convoId);
        }
      }
    } catch (e) {
      console.error('Angel chat error:', e);
      updateAssistant('Xin lỗi, Angel AI đang gặp trục trặc. Vui lòng thử lại sau. 🙏');
    } finally {
      setIsLoading(false);
    }
  }, [user, messages, conversationId, module, createConversation]);

  const newChat = useCallback(() => {
    setMessages([]);
    setConversationId(null);
  }, []);

  return {
    messages, isLoading, conversationId, conversations,
    sendMessage, newChat, loadConversations, loadConversation,
  };
}
