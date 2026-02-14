import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Sparkles } from 'lucide-react';
import { AuthForm } from '@/components/auth/AuthForm';
import { useAuth } from '@/hooks/useAuth';

export default function Auth() {
  const navigate = useNavigate();
  const { signIn, signUp, isAuthenticated, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Redirect if already authenticated
  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, authLoading, navigate]);

  const handleSignIn = async (email: string, password: string) => {
    setLoading(true);
    setError(null);

    const result = await signIn(email, password);

    if (result.error) {
      setError('Đăng nhập không thành công. Vui lòng kiểm tra thông tin và thử lại.');
    } else {
      navigate('/');
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
      setSuccessMessage('Đăng ký thành công! Vui lòng kiểm tra email để xác nhận tài khoản.');
    }

    setLoading(false);
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-primary">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-cyan-50 flex flex-col items-center justify-center p-4">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="flex items-center justify-center gap-2 mb-2">
          <Sparkles className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-amber-500 bg-clip-text text-transparent">
            FUN Ecosystem
          </h1>
        </div>
        <p className="text-muted-foreground">
          Proof of Pure Love Protocol
        </p>
      </div>

      {/* Auth Card */}
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle>Chào mừng bạn</CardTitle>
          <CardDescription>
            Đăng nhập hoặc tạo tài khoản để bắt đầu
          </CardDescription>
        </CardHeader>

        <CardContent>
          {successMessage ? (
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm text-center">
              {successMessage}
            </div>
          ) : (
            <Tabs defaultValue="signin" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="signin">Đăng nhập</TabsTrigger>
                <TabsTrigger value="signup">Đăng ký</TabsTrigger>
              </TabsList>

              <TabsContent value="signin" className="mt-6">
                <AuthForm
                  mode="signin"
                  onSubmit={handleSignIn}
                  loading={loading}
                  error={error}
                />
              </TabsContent>

              <TabsContent value="signup" className="mt-6">
                <AuthForm
                  mode="signup"
                  onSubmit={handleSignUp}
                  loading={loading}
                  error={error}
                />
              </TabsContent>
            </Tabs>
          )}
        </CardContent>
      </Card>

      {/* Footer link */}
      <p className="mt-6 text-sm text-muted-foreground">
        <a href="/" className="text-primary hover:underline">
          ← Quay về trang chủ
        </a>
      </p>
    </div>
  );
}
