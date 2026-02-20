import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, Mail, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { z } from 'zod';

const emailSchema = z.string().email('Email không hợp lệ');

interface OtpFormProps {
  onSubmit: (email: string) => Promise<void>;
  onBack: () => void;
  loading?: boolean;
  error?: string | null;
}

export function OtpForm({ onSubmit, onBack, loading, error }: OtpFormProps) {
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setEmailError('');

    try {
      emailSchema.parse(email);
    } catch (err) {
      if (err instanceof z.ZodError) {
        setEmailError(err.errors[0].message);
        return;
      }
    }

    await onSubmit(email);
    setSent(true);
  };

  if (sent && !error) {
    return (
      <div className="space-y-4 text-center py-4">
        <div className="flex justify-center">
          <CheckCircle2 className="h-14 w-14 text-primary" />
        </div>
        <h3 className="font-semibold text-lg text-foreground">Kiểm tra email của bạn</h3>
        <p className="text-sm text-muted-foreground">
          Chúng tôi đã gửi magic link đến <span className="font-medium text-foreground">{email}</span>.
          Nhấp vào link trong email để đăng nhập ngay — không cần mật khẩu.
        </p>
        <p className="text-xs text-muted-foreground">
          Không thấy email? Kiểm tra thư mục spam hoặc{' '}
          <button
            className="text-primary underline underline-offset-2"
            onClick={() => setSent(false)}
          >
            gửi lại
          </button>
        </p>
        <Button variant="ghost" size="sm" onClick={onBack} className="mt-2">
          <ArrowLeft className="h-4 w-4 mr-1" />
          Quay lại
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={onBack}
        className="gap-1 -ml-2 mb-1 text-muted-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Quay lại
      </Button>

      <div className="text-center py-2">
        <div className="text-3xl mb-2">🔢</div>
        <h3 className="font-semibold text-foreground">Đăng nhập bằng OTP</h3>
        <p className="text-sm text-muted-foreground mt-1">
          Nhập email — chúng tôi gửi magic link ngay lập tức
        </p>
      </div>

      {error && (
        <div className="p-3 bg-destructive/10 border border-destructive/30 rounded-lg text-sm text-destructive">
          {error}
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="otp-email">Email</Label>
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            id="otp-email"
            type="email"
            placeholder="your@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="pl-10"
            disabled={loading}
            autoFocus
          />
        </div>
        {emailError && <p className="text-xs text-destructive">{emailError}</p>}
      </div>

      <Button
        type="submit"
        className="w-full bg-gradient-to-r from-primary to-amber-500 hover:from-primary/90 hover:to-amber-600"
        disabled={loading}
      >
        {loading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Đang gửi...
          </>
        ) : (
          'Gửi Magic Link ✨'
        )}
      </Button>
    </form>
  );
}
