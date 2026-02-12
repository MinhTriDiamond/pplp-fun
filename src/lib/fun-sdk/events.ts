import { supabase } from '@/integrations/supabase/client';

const APP_VERSION = '1.0.0';

interface EventPayload {
  event_name: string;
  module?: string;
  platform?: string;
  app_version?: string;
  trace_id?: string;
  properties?: Record<string, unknown>;
}

export async function ingestEvents(events: EventPayload[]) {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw new Error('User not authenticated');

  const res = await supabase.functions.invoke('events-ingest', {
    body: { events },
  });

  if (res.error) throw res.error;
  return res.data as { success: boolean; count: number; trace_id: string };
}

export async function trackEvent(
  eventName: string,
  properties: Record<string, unknown> = {},
  module = 'fun-core'
) {
  return ingestEvents([
    {
      event_name: eventName,
      module,
      platform: 'web',
      app_version: APP_VERSION,
      trace_id: crypto.randomUUID(),
      properties,
    },
  ]);
}
