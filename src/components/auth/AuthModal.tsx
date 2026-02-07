import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Sparkles } from 'lucide-react';
import { AuthForm } from './AuthForm';
import { useAuth } from '@/hooks/useAuth';

interface AuthModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
  defaultTab?: 'signin' | 'signup';
}

export function AuthModal({ open, onOpenChange, onSuccess, defaultTab = 'signin' }: AuthModalProps) {
  const { signIn, signUp } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'signin' | 'signup'>(defaultTab);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleSignIn = async (email: string, password: string) => {
    setLoading(true);
    setError(null);

    const result = await signIn(email, password);

    if (result.error) {
      if (result.error.message.includes('Invalid login credentials')) {
        setError('Email hoặc mật khẩu không đúng');
      } else if (result.error.message.includes('Email not confirmed')) {
        setError('Vui lòng xác nhận email trước khi đăng nhập');
      } else {
        setError(result.error.message);
      }
    } else {
      onSuccess?.();
      onOpenChange(false);
    }

    setLoading(false);
  };

  const handleSignUp = async (email: string, password: string) => {
    setLoading(true);
    setError(null);

    const result = await signUp(email, password);

    if (result.error) {
      if (result.error.message.includes('already registered')) {
        setError('Email đã được đăng ký. Vui lòng đăng nhập.');
      } else {
        setError(result.error.message);
      }
    } else {
      setSuccessMessage('Đăng ký thành công! Vui lòng kiểm tra email để xác nhận tài khoản.');
    }

    setLoading(false);
  };

  const handleTabChange = (value: string) => {
    setActiveTab(value as 'signin' | 'signup');
    setError(null);
    setSuccessMessage(null);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Sparkles className="h-5 w-5 text-primary" />
            Đăng nhập để Mint FUN
          </DialogTitle>
          <DialogDescription>
            Bạn cần đăng nhập để có thể mint FUN Money tokens
          </DialogDescription>
        </DialogHeader>

        {successMessage ? (
          <div className="p-4 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm">
            {successMessage}
          </div>
        ) : (
          <Tabs value={activeTab} onValueChange={handleTabChange} className="mt-4">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="signin">Đăng nhập</TabsTrigger>
              <TabsTrigger value="signup">Đăng ký</TabsTrigger>
            </TabsList>

            <TabsContent value="signin" className="mt-4">
              <AuthForm
                mode="signin"
                onSubmit={handleSignIn}
                loading={loading}
                error={error}
              />
            </TabsContent>

            <TabsContent value="signup" className="mt-4">
              <AuthForm
                mode="signup"
                onSubmit={handleSignUp}
                loading={loading}
                error={error}
              />
            </TabsContent>
          </Tabs>
        )}
      </DialogContent>
    </Dialog>
  );
}
