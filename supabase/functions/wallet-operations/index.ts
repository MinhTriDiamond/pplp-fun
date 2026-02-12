import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, idempotency-key",
};

function errorResponse(code: string, message: string, traceId: string, status = 400) {
  return new Response(
    JSON.stringify({ code, message, trace_id: traceId }),
    { status, headers: { ...corsHeaders, "Content-Type": "application/json" } }
  );
}

function successResponse(data: Record<string, unknown>, traceId: string) {
  return new Response(
    JSON.stringify({ ...data, trace_id: traceId }),
    { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
  );
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const traceId = crypto.randomUUID();
  const url = new URL(req.url);
  const path = url.pathname.split("/").filter(Boolean).pop() || "";

  try {
    // Auth
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) return errorResponse("UNAUTHORIZED", "Missing auth", traceId, 401);

    const supabaseUser = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user }, error: authErr } = await supabaseUser.auth.getUser();
    if (authErr || !user) return errorResponse("UNAUTHORIZED", "Invalid token", traceId, 401);

    // Service role client for ledger mutations
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Idempotency check
    const idempotencyKey = req.headers.get("Idempotency-Key");

    if (req.method === "POST" && idempotencyKey) {
      const { data: existing } = await supabase
        .from("idempotency_keys")
        .select("response")
        .eq("key", idempotencyKey)
        .maybeSingle();

      if (existing) {
        return successResponse(existing.response as Record<string, unknown>, traceId);
      }
    }

    // GET /wallet-operations (balances)
    if (req.method === "GET" && (path === "wallet-operations" || path === "balances")) {
      const { data, error } = await supabase
        .from("wallet_accounts")
        .select("asset, available, locked")
        .eq("user_id", user.id);

      if (error) return errorResponse("DB_ERROR", error.message, traceId, 500);
      return successResponse({ balances: data }, traceId);
    }

    // GET /wallet-operations?action=transactions
    if (req.method === "GET" && url.searchParams.get("action") === "transactions") {
      const cursor = url.searchParams.get("cursor");
      let query = supabase
        .from("ledger_transactions")
        .select("*")
        .or(`from_user_id.eq.${user.id},to_user_id.eq.${user.id}`)
        .order("created_at", { ascending: false })
        .limit(20);

      if (cursor) query = query.lt("created_at", cursor);
      const { data, error } = await query;
      if (error) return errorResponse("DB_ERROR", error.message, traceId, 500);

      const nextCursor = data && data.length === 20 ? data[data.length - 1].created_at : null;
      return successResponse({ transactions: data, cursor: nextCursor }, traceId);
    }

    if (req.method !== "POST") {
      return errorResponse("METHOD_NOT_ALLOWED", "Use POST", traceId, 405);
    }

    const body = await req.json();
    const action = body.action || path;

    // POST transfer
    if (action === "transfer") {
      const { to_username, to_user_id, asset = "FUN", amount, memo } = body;
      if (!amount || amount <= 0) return errorResponse("INVALID_AMOUNT", "Amount must be > 0", traceId);

      // Resolve recipient
      let recipientId = to_user_id;
      if (!recipientId && to_username) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("id")
          .eq("username", to_username)
          .maybeSingle();
        if (!profile) return errorResponse("USER_NOT_FOUND", `Username @${to_username} not found`, traceId, 404);
        recipientId = profile.id;
      }
      if (!recipientId) return errorResponse("MISSING_RECIPIENT", "Provide to_username or to_user_id", traceId);
      if (recipientId === user.id) return errorResponse("SELF_TRANSFER", "Cannot transfer to self", traceId);

      // Check balance
      const { data: senderWallet } = await supabase
        .from("wallet_accounts")
        .select("available")
        .eq("user_id", user.id)
        .eq("asset", asset)
        .maybeSingle();

      if (!senderWallet || Number(senderWallet.available) < amount) {
        return errorResponse("INSUFFICIENT_BALANCE", "Not enough balance", traceId);
      }

      // Debit sender
      await supabase.rpc("", {}).catch(() => {}); // placeholder
      const { error: debitErr } = await supabase
        .from("wallet_accounts")
        .update({ available: Number(senderWallet.available) - amount })
        .eq("user_id", user.id)
        .eq("asset", asset);

      if (debitErr) return errorResponse("DEBIT_ERROR", debitErr.message, traceId, 500);

      // Credit recipient
      const { data: recipientWallet } = await supabase
        .from("wallet_accounts")
        .select("available")
        .eq("user_id", recipientId)
        .eq("asset", asset)
        .maybeSingle();

      if (!recipientWallet) {
        // Auto-create wallet
        await supabase.from("wallet_accounts").insert({
          user_id: recipientId, asset, available: amount, locked: 0,
        });
      } else {
        await supabase
          .from("wallet_accounts")
          .update({ available: Number(recipientWallet.available) + amount })
          .eq("user_id", recipientId)
          .eq("asset", asset);
      }

      // Record transaction
      const txData = {
        tx_type: "transfer" as const,
        status: "completed" as const,
        asset,
        amount,
        from_user_id: user.id,
        to_user_id: recipientId,
        memo: memo || null,
        trace_id: traceId,
        idempotency_key: idempotencyKey || null,
      };

      const { data: tx, error: txErr } = await supabase
        .from("ledger_transactions")
        .insert(txData)
        .select("id")
        .single();

      if (txErr) return errorResponse("TX_ERROR", txErr.message, traceId, 500);

      const response = { success: true, transaction_id: tx.id, amount, asset };

      // Save idempotency
      if (idempotencyKey) {
        await supabase.from("idempotency_keys").insert({
          key: idempotencyKey, user_id: user.id, response,
        });
      }

      // Audit log
      await supabase.from("audit_logs").insert({
        user_id: user.id,
        action: "wallet_transfer",
        resource_type: "ledger_transaction",
        resource_id: tx.id,
        new_value: { amount, asset, to: recipientId, memo },
      });

      return successResponse(response, traceId);
    }

    // POST pay
    if (action === "pay") {
      const { module, order_id, asset = "FUN", amount } = body;
      if (!amount || amount <= 0) return errorResponse("INVALID_AMOUNT", "Amount must be > 0", traceId);
      if (!module || !order_id) return errorResponse("MISSING_FIELDS", "module and order_id required", traceId);

      const { data: wallet } = await supabase
        .from("wallet_accounts")
        .select("available")
        .eq("user_id", user.id)
        .eq("asset", asset)
        .maybeSingle();

      if (!wallet || Number(wallet.available) < amount) {
        return errorResponse("INSUFFICIENT_BALANCE", "Not enough balance", traceId);
      }

      await supabase
        .from("wallet_accounts")
        .update({ available: Number(wallet.available) - amount })
        .eq("user_id", user.id)
        .eq("asset", asset);

      const txData = {
        tx_type: "pay" as const,
        status: "completed" as const,
        asset,
        amount,
        from_user_id: user.id,
        module,
        order_id,
        trace_id: traceId,
        idempotency_key: idempotencyKey || null,
      };

      const { data: tx, error: txErr } = await supabase
        .from("ledger_transactions")
        .insert(txData)
        .select("id")
        .single();

      if (txErr) return errorResponse("TX_ERROR", txErr.message, traceId, 500);

      const response = { success: true, payment_id: tx.id, amount, asset, order_id };

      if (idempotencyKey) {
        await supabase.from("idempotency_keys").insert({
          key: idempotencyKey, user_id: user.id, response,
        });
      }

      await supabase.from("audit_logs").insert({
        user_id: user.id, action: "wallet_pay",
        resource_type: "ledger_transaction", resource_id: tx.id,
        new_value: { amount, asset, module, order_id },
      });

      return successResponse(response, traceId);
    }

    // POST refund
    if (action === "refund") {
      const { payment_id, amount } = body;
      if (!payment_id) return errorResponse("MISSING_PAYMENT_ID", "payment_id required", traceId);

      const { data: originalTx } = await supabase
        .from("ledger_transactions")
        .select("*")
        .eq("id", payment_id)
        .eq("tx_type", "pay")
        .eq("status", "completed")
        .maybeSingle();

      if (!originalTx) return errorResponse("PAYMENT_NOT_FOUND", "Original payment not found", traceId, 404);

      const refundAmount = amount || Number(originalTx.amount);
      if (refundAmount > Number(originalTx.amount)) {
        return errorResponse("REFUND_EXCEEDS", "Refund amount exceeds original payment", traceId);
      }

      // Credit back
      const { data: wallet } = await supabase
        .from("wallet_accounts")
        .select("available")
        .eq("user_id", originalTx.from_user_id)
        .eq("asset", originalTx.asset)
        .maybeSingle();

      await supabase
        .from("wallet_accounts")
        .update({ available: Number(wallet?.available || 0) + refundAmount })
        .eq("user_id", originalTx.from_user_id)
        .eq("asset", originalTx.asset);

      const { data: tx } = await supabase
        .from("ledger_transactions")
        .insert({
          tx_type: "refund" as const,
          status: "completed" as const,
          asset: originalTx.asset,
          amount: refundAmount,
          to_user_id: originalTx.from_user_id,
          payment_id,
          trace_id: traceId,
          idempotency_key: idempotencyKey || null,
        })
        .select("id")
        .single();

      const response = { success: true, refund_id: tx?.id, amount: refundAmount };

      if (idempotencyKey) {
        await supabase.from("idempotency_keys").insert({
          key: idempotencyKey, user_id: user.id, response,
        });
      }

      await supabase.from("audit_logs").insert({
        user_id: user.id, action: "wallet_refund",
        resource_type: "ledger_transaction", resource_id: tx?.id,
        new_value: { refundAmount, payment_id },
      });

      return successResponse(response, traceId);
    }

    return errorResponse("UNKNOWN_ACTION", `Unknown action: ${action}`, traceId);
  } catch (err) {
    return errorResponse("INTERNAL_ERROR", (err as Error).message, traceId, 500);
  }
});
