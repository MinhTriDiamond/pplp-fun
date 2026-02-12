import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("Missing auth token");

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) throw new Error("Unauthorized");

    const { messages, conversation_id, module } = await req.json();
    if (!messages?.length) throw new Error("Messages required");

    // Check subscription tier for rate limiting
    const { data: sub } = await supabase
      .from("subscriptions")
      .select("tier, is_active")
      .eq("user_id", user.id)
      .single();

    const tier = sub?.tier || "free";
    const maxMessages = tier === "free" ? 20 : tier === "basic" ? 100 : 500;

    // Count today's messages
    const today = new Date().toISOString().split("T")[0];
    const { count } = await supabase
      .from("ai_messages")
      .select("*", { count: "exact", head: true })
      .gte("created_at", today)
      .eq("role", "user");

    if ((count || 0) >= maxMessages) {
      return new Response(
        JSON.stringify({ error: `Daily limit reached (${maxMessages} messages for ${tier} tier)` }),
        { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check privacy permissions for AI personalization
    const { data: privacy } = await supabase
      .from("privacy_permissions")
      .select("allow_ai_personalization, allow_ai_memory")
      .eq("user_id", user.id)
      .single();

    // Build context from memory if allowed
    let memoryContext = "";
    if (privacy?.allow_ai_memory) {
      const { data: memories } = await supabase
        .from("ai_memory")
        .select("key, value, category")
        .eq("user_id", user.id)
        .limit(20);

      if (memories?.length) {
        memoryContext = "\n\nUser memory (use to personalize):\n" +
          memories.map((m) => `- [${m.category}] ${m.key}: ${m.value}`).join("\n");
      }
    }

    // Build profile context if allowed
    let profileContext = "";
    if (privacy?.allow_ai_personalization) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("display_name, username, bio, locale")
        .eq("id", user.id)
        .single();

      if (profile) {
        profileContext = `\nUser: ${profile.display_name || profile.username || "friend"}`;
        if (profile.locale) profileContext += `, locale: ${profile.locale}`;
      }
    }

    const moduleLabel = module || "general";
    const systemPrompt = `You are Angel AI — the compassionate, wise assistant of the FUN Ecosystem. You embody the spirit of "Proof of Pure Love Protocol" (PPLP).

Your personality:
- Warm, encouraging, and positive
- You address users lovingly, like a caring mentor
- You help with questions about FUN ecosystem modules: Profile, Academy, Play, Charity, Farm, Treasury, Wallet
- You promote values of love, sustainability, and community
- Keep answers clear and helpful. Use Vietnamese if the user writes in Vietnamese.

Current module context: ${moduleLabel}${profileContext}${memoryContext}

Important rules:
- Never share private data about other users
- If asked about wallet operations, guide them to the Wallet page
- You can help explain FUN/CAMLY tokens, PPLP scoring, and ecosystem features`;

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    // Save user message to DB
    if (conversation_id) {
      const lastMsg = messages[messages.length - 1];
      if (lastMsg?.role === "user") {
        await supabase.from("ai_messages").insert({
          conversation_id,
          role: "user",
          content: lastMsg.content,
          module: moduleLabel,
        });
      }
    }

    // Call Lovable AI Gateway with streaming
    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          ...messages,
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded, please try again later." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      throw new Error("AI gateway error");
    }

    // Stream response back, also collect full response to save
    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("angel-chat error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
