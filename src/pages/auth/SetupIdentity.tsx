import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Sparkles, AtSign, Check, X, Loader2, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/useAuth';
import { useUsername } from '@/hooks/useUsername';
import { supabase } from '@/integrations/supabase/client';
import type { UsernameStatus } from '@/hooks/useUsername';

const statusConfig: Record<UsernameStatus, { label: string; colorClass: string; icon: React.ReactNode }> = {
  idle: { label: '', colorClass: '', icon: null },
  checking: { label: 'Đang kiểm tra...', colorClass: 'bg-muted text-muted-foreground', icon: <Loader2 className="h-3 w-3 animate-spin" /> },
  available: { label: 'Có thể sử dụng ✨', colorClass: 'bg-green-100 text-green-800', icon: <Check className="h-3 w-3" /> },
  taken: { label: 'Đã được sử dụng', colorClass: 'bg-destructive/10 text-destructive', icon: <X className="h-3 w-3" /> },
  invalid: { label: 'Chỉ chữ thường, số, _ (4-20 ký tự)', colorClass: 'bg-destructive/10 text-destructive', icon: <X className="h-3 w-3" /> },
  reserved: { label: 'Từ khóa hệ thống, không thể dùng', colorClass: 'bg-yellow-100 text-yellow-800', icon: <AlertTriangle className="h-3 w-3" /> },
};

export default function SetupIdentity() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const returnTo = searchParams.get('returnTo') || '/';

  const { user } = useAuth();
  const { status, saving, checkAvailability, saveUsername } = useUsername();

  const [username, setUsername] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [submitLoading, setSubmitLoading] = useState(false);
  const [error, setError] = useState('');

  // Redirect if not authenticated
  useEffect(() => {
    if (!user) {
      navigate('/auth');
    }
  }, [user, navigate]);

  // Auto-check username availability
  useEffect(() => {
    if (!username) return;
    const timer = setTimeout(() => checkAvailability(username), 400);
    return () => clearTimeout(timer);
  }, [username, checkAvailability]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setError('');
    setSubmitLoading(true);

    // Save username
    const ok = await saveUsername(username);
    if (!ok) {
      setSubmitLoading(false);
      setError('Không thể lưu username. Vui lòng thử lại.');
      return;
    }

    // Save display_name if provided
    if (displayName.trim()) {
      await supabase
        .from('profiles')
        .update({ display_name: displayName.trim() } as any)
        .eq('id', user.id);
    }

    setSubmitLoading(false);
    // Go to link-accounts next
    navigate(`/auth/link-accounts?returnTo=${encodeURIComponent(returnTo)}`);
  };

  const cfg = statusConfig[status];
  const canSubmit = status === 'available' && !saving && !submitLoading;

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-background to-secondary/30 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-sm space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="flex justify-center">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-amber-400 flex items-center justify-center shadow-lg">
              <Sparkles className="h-8 w-8 text-white" />
            </div>
          </div>
          <h1 className="text-2xl font-bold text-foreground">Tạo FUN ID</h1>
          <p className="text-sm text-muted-foreground">
            Chọn username để nhận diện trên toàn hệ sinh thái FUN
          </p>
        </div>

        {/* Warning badge */}
        <div className="flex justify-center">
          <Badge variant="outline" className="text-xs gap-1 py-1 px-3 border-amber-300 text-amber-700 bg-amber-50">
            <AlertTriangle className="h-3 w-3" />
            Username không thể thay đổi sau 30 ngày
          </Badge>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 bg-destructive/10 border border-destructive/30 rounded-lg text-sm text-destructive">
              {error}
            </div>
          )}

          {/* Username field */}
          <div className="space-y-2">
            <Label htmlFor="username">Username *</Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-medium">@</span>
              <Input
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                placeholder="your_username"
                className="pl-8"
                maxLength={20}
                autoFocus
              />
              {status === 'checking' && (
                <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-muted-foreground" />
              )}
              {status === 'available' && (
                <Check className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-green-600" />
              )}
            </div>
            {status !== 'idle' && status !== 'checking' && (
              <Badge variant="outline" className={`${cfg.colorClass} gap-1 text-xs`}>
                {cfg.icon}
                {cfg.label}
              </Badge>
            )}
            <p className="text-xs text-muted-foreground">
              Chỉ dùng chữ thường, số và dấu _ (4–20 ký tự)
            </p>
          </div>

          {/* Display name field */}
          <div className="space-y-2">
            <Label htmlFor="displayName">
              Tên hiển thị <span className="text-muted-foreground font-normal">(tuỳ chọn)</span>
            </Label>
            <Input
              id="displayName"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="Tên của bạn"
              maxLength={50}
            />
          </div>

          <Button
            type="submit"
            className="w-full bg-gradient-to-r from-primary to-amber-500 hover:from-primary/90 hover:to-amber-600 font-semibold"
            disabled={!canSubmit}
          >
            {submitLoading || saving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Đang lưu...
              </>
            ) : (
              'Xác nhận & Tiếp tục →'
            )}
          </Button>
        </form>

        {/* Progress indicator */}
        <div className="flex items-center justify-center gap-2">
          <div className="h-2 w-8 rounded-full bg-primary" />
          <div className="h-2 w-8 rounded-full bg-muted" />
          <div className="h-2 w-8 rounded-full bg-muted" />
        </div>
        <p className="text-center text-xs text-muted-foreground">Bước 1 / 3</p>
      </div>
    </div>
  );
}
