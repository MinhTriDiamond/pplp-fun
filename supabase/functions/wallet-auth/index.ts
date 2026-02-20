import { createClient } from "npm:@supabase/supabase-js@2";
import { ethers } from "npm:ethers@6";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { address, message, signature } = await req.json();

    if (!address || !message || !signature) {
      return new Response(
        JSON.stringify({ error: 'Thiếu thông tin: address, message, signature' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Verify signature
    const recoveredAddress = ethers.verifyMessage(message, signature);
    if (recoveredAddress.toLowerCase() !== address.toLowerCase()) {
      return new Response(
        JSON.stringify({ error: 'Chữ ký không hợp lệ' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check message timestamp is within 5 minutes
    const timestampMatch = message.match(/lúc (.+)$/);
    if (timestampMatch) {
      const msgTime = new Date(timestampMatch[1]).getTime();
      const now = Date.now();
      if (Math.abs(now - msgTime) > 5 * 60 * 1000) {
        return new Response(
          JSON.stringify({ error: 'Yêu cầu đã hết hạn. Vui lòng thử lại.' }),
          { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    // Create admin client
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
      { auth: { autoRefreshToken: false, persistSession: false } }
    );

    const walletEmail = `${address.toLowerCase()}@wallet.fun`;

    // Find or create user
    let userId: string;

    try {
      const { data: existingUser } = await supabaseAdmin.auth.admin.getUserByEmail(walletEmail);
      if (existingUser?.user) {
        userId = existingUser.user.id;
      } else {
        throw new Error('User not found');
      }
    } catch {
      // Create new user
      const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
        email: walletEmail,
        password: crypto.randomUUID(),
        email_confirm: true,
        user_metadata: {
          wallet_address: address.toLowerCase(),
          auth_method: 'wallet',
        },
      });

      if (createError || !newUser?.user) {
        throw new Error(createError?.message || 'Không thể tạo tài khoản');
      }
      userId = newUser.user.id;
    }

    // Generate session
    const { data: sessionData, error: sessionError } = await supabaseAdmin.auth.admin.generateLink({
      type: 'magiclink',
      email: walletEmail,
    });

    if (sessionError || !sessionData) {
      throw new Error(sessionError?.message || 'Không thể tạo phiên đăng nhập');
    }

    // Sign in to get tokens
    const { data: signInData, error: signInError } = await supabaseAdmin.auth.admin.createSession(userId);

    if (signInError || !signInData) {
      throw new Error(signInError?.message || 'Không thể tạo session');
    }

    return new Response(
      JSON.stringify({
        access_token: signInData.session.access_token,
        refresh_token: signInData.session.refresh_token,
        user: signInData.session.user,
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (err: any) {
    console.error('wallet-auth error:', err);
    return new Response(
      JSON.stringify({ error: err.message || 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
