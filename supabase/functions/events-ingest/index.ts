import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface EventEnvelope {
  event_name: string;
  timestamp?: string;
  module?: string;
  platform?: string;
  app_version?: string;
  trace_id?: string;
  properties?: Record<string, unknown>;
}

const PII_PATTERNS = [
  /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/,
  /\b\d{3}[-.]?\d{3}[-.]?\d{4}\b/,
  /\b\d{3}-\d{2}-\d{4}\b/,
];

function hasPII(obj: Record<string, unknown>): boolean {
  const str = JSON.stringify(obj);
  return PII_PATTERNS.some((p) => p.test(str));
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const traceId = crypto.randomUUID();

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ code: "UNAUTHORIZED", message: "Missing auth token", trace_id: traceId }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return new Response(
        JSON.stringify({ code: "UNAUTHORIZED", message: "Invalid token", trace_id: traceId }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Rate limit: max 200 events per minute per user
    const oneMinAgo = new Date(Date.now() - 60_000).toISOString();
    const { count } = await supabase
      .from("events")
      .select("*", { count: "exact", head: true })
      .eq("fun_user_id", user.id)
      .gte("created_at", oneMinAgo);

    if ((count ?? 0) >= 200) {
      return new Response(
        JSON.stringify({ code: "RATE_LIMITED", message: "Too many events. Max 200/min.", trace_id: traceId }),
        { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const body = await req.json();
    const events: EventEnvelope[] = body.events;

    if (!Array.isArray(events) || events.length === 0) {
      return new Response(
        JSON.stringify({ code: "BAD_REQUEST", message: "events must be a non-empty array", trace_id: traceId }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (events.length > 50) {
      return new Response(
        JSON.stringify({ code: "BAD_REQUEST", message: "Max 50 events per batch", trace_id: traceId }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Validate and build rows
    const rows = [];
    for (let i = 0; i < events.length; i++) {
      const e = events[i];
      if (!e.event_name || typeof e.event_name !== "string") {
        return new Response(
          JSON.stringify({ code: "VALIDATION_ERROR", message: `events[${i}].event_name is required`, trace_id: traceId }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      if (e.properties && hasPII(e.properties as Record<string, unknown>)) {
        return new Response(
          JSON.stringify({ code: "PII_DETECTED", message: `events[${i}].properties may contain PII`, trace_id: traceId }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      rows.push({
        event_name: e.event_name,
        timestamp: e.timestamp || new Date().toISOString(),
        fun_user_id: user.id,
        module: e.module || null,
        platform: e.platform || "web",
        app_version: e.app_version || null,
        trace_id: e.trace_id || traceId,
        properties: e.properties || {},
      });
    }

    const { error: insertError } = await supabase.from("events").insert(rows);

    if (insertError) {
      return new Response(
        JSON.stringify({ code: "INSERT_ERROR", message: insertError.message, trace_id: traceId }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ success: true, count: rows.length, trace_id: traceId }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ code: "INTERNAL_ERROR", message: (err as Error).message, trace_id: traceId }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
