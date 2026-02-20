import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Sparkles, Mail, KeyRound, ArrowRight, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { z } from 'zod';
import { AuthForm } from '@/components/auth/AuthForm';
import { OtpForm } from '@/components/auth/OtpForm';
import { WalletAuthButton } from '@/components/auth/WalletAuthButton';
import { lovable } from '@/integrations/lovable';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';

type AuthView = 'main' | 'email-pw' | 'otp';

export default function Auth() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const returnTo = searchParams.get('returnTo') || '/';

  const { signIn, signUp, signInWithOtp, checkUsernameSetup, isAuthenticated, loading: authLoading } = useAuth();
  const [view, setView] = useState<AuthView>('main');
  const [emailMode, setEmailMode] = useState<'signin' | 'signup'>('signin');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Redirect if already authenticated
  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      handlePostAuthRedirect();
    }
  }, [isAuthenticated, authLoading]);

  const handlePostAuthRedirect = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const hasUsername = await checkUsernameSetup(user.id);
    if (!hasUsername) {
      navigate(`/auth/setup-identity?returnTo=${encodeURIComponent(returnTo)}`);
    } else {
      navigate(returnTo);
    }
  };

  const handleSignIn = async (email: string, password: string) => {
    setLoading(true);
    setError(null);
    const result = await signIn(email, password);
    if (result.error) {
      setError('Đăng nhập không thành công. Kiểm tra lại email và mật khẩu.');
    } else {
      await handlePostAuthRedirect();
    }
    setLoading(false);
  };

  const handleSignUp = async (email: string, password: string) => {
    setLoading(true);
    setError(null);
    const result = await signUp(email, password);
    if (result.error) {
      setError('Đăng ký không thành công. Vui lòng thử lại.');
    } else {
      setSuccessMessage('Đăng ký thành công! Kiểm tra email để xác nhận tài khoản.');
    }
    setLoading(false);
  };

  const handleOtp = async (email: string) => {
    setLoading(true);
    setError(null);
    const result = await signInWithOtp(email);
    if (result.error) {
      setError('Không thể gửi magic link. Vui lòng thử lại.');
    }
    setLoading(false);
  };

  const handleGoogle = async () => {
    setGoogleLoading(true);
    setError(null);
    try {
      const result = await lovable.auth.signInWithOAuth('google', {
        redirect_uri: `${window.location.origin}/auth?returnTo=${encodeURIComponent(returnTo)}`,
      });
      if (result.error) {
        setError('Đăng nhập Google thất bại. Vui lòng thử lại.');
      }
    } catch {
      setError('Đăng nhập Google thất bại. Vui lòng thử lại.');
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleWalletSuccess = async () => {
    await handlePostAuthRedirect();
  };

  const handleWalletError = (err: string) => {
    setError(err);
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-amber-50 via-background to-secondary/30">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-background to-secondary/30 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-sm space-y-6">
        {/* Header */}
        <div className="text-center space-y-1">
          <div className="flex justify-center mb-3">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-amber-400 flex items-center justify-center shadow-lg">
              <Sparkles className="h-8 w-8 text-white" />
            </div>
          </div>
          <h1 className="text-2xl font-bold text-foreground">FUN ID</h1>
          <p className="text-sm text-muted-foreground">
            Một tài khoản · Ba platform
          </p>
        </div>

        {/* Success message */}
        {successMessage && (
          <div className="p-4 bg-green-50 border border-green-200 rounded-xl text-green-700 text-sm text-center">
            {successMessage}
          </div>
        )}

        {/* Error message */}
        {error && !successMessage && (
          <div className="p-3 bg-destructive/10 border border-destructive/30 rounded-lg text-sm text-destructive">
            {error}
          </div>
        )}

        {/* Content by view */}
        {!successMessage && (
          <>
            {view === 'main' && (
              <div className="space-y-3">
                {/* Email + Password */}
                <Button
                  variant="outline"
                  className="w-full h-12 gap-3 text-sm font-medium border-border justify-start px-4"
                  onClick={() => { setView('email-pw'); setEmailMode('signin'); setError(null); }}
                >
                  <Mail className="h-5 w-5 text-muted-foreground" />
                  Tiếp tục với Email
                </Button>

                {/* OTP */}
                <Button
                  variant="outline"
                  className="w-full h-12 gap-3 text-sm font-medium border-border justify-start px-4"
                  onClick={() => { setView('otp'); setError(null); }}
                >
                  <KeyRound className="h-5 w-5 text-muted-foreground" />
                  Tiếp tục với OTP (Không cần mật khẩu)
                </Button>

                {/* Google */}
                <Button
                  variant="outline"
                  className="w-full h-12 gap-3 text-sm font-medium border-border justify-start px-4"
                  onClick={handleGoogle}
                  disabled={googleLoading}
                >
                  {googleLoading ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <svg className="h-5 w-5" viewBox="0 0 24 24">
                      <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                      <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                      <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                      <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                    </svg>
                  )}
                  Tiếp tục với Google
                </Button>

                {/* Wallet */}
                <WalletAuthButton
                  onSuccess={handleWalletSuccess}
                  onError={handleWalletError}
                />

                <Separator />

                {/* Sign up prompt */}
                <p className="text-center text-sm text-muted-foreground">
                  Chưa có tài khoản?{' '}
                  <button
                    className="text-primary font-medium hover:underline underline-offset-2"
                    onClick={() => { setView('email-pw'); setEmailMode('signup'); setError(null); }}
                  >
                    Đăng ký ngay
                    <ArrowRight className="inline ml-1 h-3 w-3" />
                  </button>
                </p>
              </div>
            )}

            {view === 'email-pw' && (
              <div className="space-y-4">
                {/* Tab switch */}
                <div className="flex rounded-lg border border-border overflow-hidden">
                  <button
                    className={`flex-1 py-2 text-sm font-medium transition-colors ${emailMode === 'signin' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-muted'}`}
                    onClick={() => { setEmailMode('signin'); setError(null); }}
                  >
                    Đăng nhập
                  </button>
                  <button
                    className={`flex-1 py-2 text-sm font-medium transition-colors ${emailMode === 'signup' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-muted'}`}
                    onClick={() => { setEmailMode('signup'); setError(null); }}
                  >
                    Đăng ký
                  </button>
                </div>

                <AuthForm
                  mode={emailMode}
                  onSubmit={emailMode === 'signin' ? handleSignIn : handleSignUp}
                  loading={loading}
                  error={error}
                  hideGoogleButton
                />

                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full text-muted-foreground"
                  onClick={() => { setView('main'); setError(null); }}
                >
                  ← Chọn cách khác
                </Button>
              </div>
            )}

            {view === 'otp' && (
              <OtpForm
                onSubmit={handleOtp}
                onBack={() => { setView('main'); setError(null); }}
                loading={loading}
                error={error}
              />
            )}
          </>
        )}

        {/* Footer */}
        <p className="text-center text-xs text-muted-foreground">
          <a href="/" className="hover:text-primary underline underline-offset-2 transition-colors">
            ← Quay về trang chủ
          </a>
        </p>
      </div>
    </div>
  );
}
