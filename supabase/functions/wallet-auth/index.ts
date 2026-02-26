import { createClient } from "npm:@supabase/supabase-js@2";
import { ethers } from "npm:ethers@6";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
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

    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
      { auth: { autoRefreshToken: false, persistSession: false } }
    );

    const walletEmail = `${address.toLowerCase()}@wallet.fun`;
    // Use a deterministic password derived from address
    const walletPassword = `wallet_${address.toLowerCase()}_${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!.slice(-16)}`;

    // Find or create user
    let userId: string;

    try {
      const { data: { users } } = await supabaseAdmin.auth.admin.listUsers();
      const existingUser = users.find(u => u.email === walletEmail);
      if (existingUser) {
        userId = existingUser.id;
      } else {
        throw new Error('User not found');
      }
    } catch {
      // Create new user with deterministic password
      const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
        email: walletEmail,
        password: walletPassword,
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

    // Sign in with password to get valid session tokens
    const anonClient = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      { auth: { autoRefreshToken: false, persistSession: false } }
    );

    // Ensure password is set correctly for existing users
    await supabaseAdmin.auth.admin.updateUserById(userId, { password: walletPassword });

    const { data: signInData, error: signInError } = await anonClient.auth.signInWithPassword({
      email: walletEmail,
      password: walletPassword,
    });

    if (signInError || !signInData.session) {
      throw new Error(signInError?.message || 'Không thể tạo phiên đăng nhập');
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
