import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useUsername, UsernameStatus } from '@/hooks/useUsername';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { AtSign, Check, X, Loader2, AlertTriangle } from 'lucide-react';

const statusConfig: Record<UsernameStatus, { label: string; color: string; icon: React.ReactNode }> = {
  idle: { label: '', color: '', icon: null },
  checking: { label: 'Đang kiểm tra...', color: 'bg-muted text-muted-foreground', icon: <Loader2 className="h-3 w-3 animate-spin" /> },
  available: { label: 'Có thể sử dụng ✨', color: 'bg-green-100 text-green-800', icon: <Check className="h-3 w-3" /> },
  taken: { label: 'Đã được sử dụng', color: 'bg-destructive/10 text-destructive', icon: <X className="h-3 w-3" /> },
  invalid: { label: 'Chỉ chữ thường, số, _ (4-20 ký tự)', color: 'bg-destructive/10 text-destructive', icon: <X className="h-3 w-3" /> },
  reserved: { label: 'Từ khóa hệ thống, không thể dùng', color: 'bg-yellow-100 text-yellow-800', icon: <AlertTriangle className="h-3 w-3" /> },
};

export function UsernameForm() {
  const { user } = useAuth();
  const { status, saving, checkAvailability, saveUsername } = useUsername();
  const [value, setValue] = useState('');
  const [currentUsername, setCurrentUsername] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    supabase
      .from('profiles')
      .select('username')
      .eq('id', user.id)
      .maybeSingle()
      .then(({ data }) => {
        if (data?.username) {
          setCurrentUsername(data.username as string);
          setValue(data.username as string);
        }
      });
  }, [user]);

  useEffect(() => {
    if (!value || value === currentUsername) return;
    const timer = setTimeout(() => checkAvailability(value), 400);
    return () => clearTimeout(timer);
  }, [value, currentUsername, checkAvailability]);

  const handleSave = async () => {
    const ok = await saveUsername(value);
    if (ok) setCurrentUsername(value);
  };

  const cfg = statusConfig[status];
  const canSave = status === 'available' && value !== currentUsername && !saving;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AtSign className="h-5 w-5 text-primary" />
          FUN Username
        </CardTitle>
        <CardDescription>
          Username duy nhất trong hệ sinh thái FUN. Chỉ dùng chữ thường, số và dấu gạch dưới (4-20 ký tự).
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">@</span>
            <Input
              value={value}
              onChange={(e) => setValue(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
              placeholder="your_username"
              className="pl-8"
              maxLength={20}
            />
          </div>
          <Button onClick={handleSave} disabled={!canSave}>
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Lưu'}
          </Button>
        </div>

        {status !== 'idle' && (
          <Badge variant="outline" className={`${cfg.color} gap-1`}>
            {cfg.icon}
            {cfg.label}
          </Badge>
        )}

        {currentUsername && (
          <p className="text-sm text-muted-foreground">
            Username hiện tại: <span className="font-medium text-foreground">@{currentUsername}</span>
          </p>
        )}
      </CardContent>
    </Card>
  );
}
