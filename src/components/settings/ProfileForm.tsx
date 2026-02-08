import { useState, useEffect } from 'react';
import { User, Globe, Clock, Phone, Wallet, Save, Loader2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface ProfileData {
  display_name: string;
  bio: string;
  locale: string;
  timezone: string;
  phone: string;
  preferred_wallet: string;
  avatar_url: string;
}

const locales = [
  { value: 'vi', label: '🇻🇳 Tiếng Việt' },
  { value: 'en', label: '🇺🇸 English' },
  { value: 'zh', label: '🇨🇳 中文' },
  { value: 'ja', label: '🇯🇵 日本語' },
  { value: 'ko', label: '🇰🇷 한국어' },
];

const timezones = [
  { value: 'Asia/Ho_Chi_Minh', label: 'Việt Nam (GMT+7)' },
  { value: 'Asia/Bangkok', label: 'Bangkok (GMT+7)' },
  { value: 'Asia/Singapore', label: 'Singapore (GMT+8)' },
  { value: 'Asia/Tokyo', label: 'Tokyo (GMT+9)' },
  { value: 'America/Los_Angeles', label: 'Los Angeles (GMT-8)' },
  { value: 'America/New_York', label: 'New York (GMT-5)' },
  { value: 'Europe/London', label: 'London (GMT+0)' },
];

export function ProfileForm() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState<ProfileData>({
    display_name: '',
    bio: '',
    locale: 'vi',
    timezone: 'Asia/Ho_Chi_Minh',
    phone: '',
    preferred_wallet: '',
    avatar_url: '',
  });

  useEffect(() => {
    if (user?.id) {
      fetchProfile();
    }
  }, [user?.id]);

  const fetchProfile = async () => {
    if (!user?.id) return;
    
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('display_name, bio, locale, timezone, phone, preferred_wallet, avatar_url')
        .eq('id', user.id)
        .single();

      if (error) throw error;

      if (data) {
        setProfile({
          display_name: data.display_name || '',
          bio: data.bio || '',
          locale: data.locale || 'vi',
          timezone: data.timezone || 'Asia/Ho_Chi_Minh',
          phone: data.phone || '',
          preferred_wallet: data.preferred_wallet || '',
          avatar_url: data.avatar_url || '',
        });
      }
    } catch (err) {
      console.error('Error fetching profile:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!user?.id) return;

    setSaving(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          display_name: profile.display_name || null,
          bio: profile.bio || null,
          locale: profile.locale,
          timezone: profile.timezone,
          phone: profile.phone || null,
          preferred_wallet: profile.preferred_wallet || null,
          avatar_url: profile.avatar_url || null,
        })
        .eq('id', user.id);

      if (error) throw error;

      toast({
        title: 'Đã lưu!',
        description: 'Thông tin hồ sơ của bạn đã được cập nhật.',
      });
    } catch (err) {
      console.error('Error saving profile:', err);
      toast({
        title: 'Lỗi',
        description: 'Không thể lưu thông tin. Vui lòng thử lại.',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-elegant">
      <CardHeader className="space-y-1">
        <div className="flex items-center gap-2">
          <User className="h-5 w-5 text-primary" />
          <CardTitle className="text-xl">Thông tin hồ sơ</CardTitle>
        </div>
        <CardDescription>
          Cập nhật thông tin cá nhân của bạn trong FUN Ecosystem
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Display Name */}
        <div className="space-y-2">
          <Label htmlFor="display_name">Tên hiển thị</Label>
          <Input
            id="display_name"
            placeholder="Nhập tên hiển thị của bạn"
            value={profile.display_name}
            onChange={(e) => setProfile({ ...profile, display_name: e.target.value })}
          />
        </div>

        {/* Bio */}
        <div className="space-y-2">
          <Label htmlFor="bio">Giới thiệu bản thân</Label>
          <Textarea
            id="bio"
            placeholder="Viết vài dòng giới thiệu về bạn..."
            value={profile.bio}
            onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
            rows={3}
          />
        </div>

        {/* Avatar URL */}
        <div className="space-y-2">
          <Label htmlFor="avatar_url">URL Ảnh đại diện</Label>
          <Input
            id="avatar_url"
            placeholder="https://example.com/avatar.jpg"
            value={profile.avatar_url}
            onChange={(e) => setProfile({ ...profile, avatar_url: e.target.value })}
          />
        </div>

        {/* Locale & Timezone Row */}
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="locale" className="flex items-center gap-2">
              <Globe className="h-4 w-4" />
              Ngôn ngữ
            </Label>
            <Select
              value={profile.locale}
              onValueChange={(value) => setProfile({ ...profile, locale: value })}
            >
              <SelectTrigger id="locale">
                <SelectValue placeholder="Chọn ngôn ngữ" />
              </SelectTrigger>
              <SelectContent>
                {locales.map((locale) => (
                  <SelectItem key={locale.value} value={locale.value}>
                    {locale.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="timezone" className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Múi giờ
            </Label>
            <Select
              value={profile.timezone}
              onValueChange={(value) => setProfile({ ...profile, timezone: value })}
            >
              <SelectTrigger id="timezone">
                <SelectValue placeholder="Chọn múi giờ" />
              </SelectTrigger>
              <SelectContent>
                {timezones.map((tz) => (
                  <SelectItem key={tz.value} value={tz.value}>
                    {tz.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Phone */}
        <div className="space-y-2">
          <Label htmlFor="phone" className="flex items-center gap-2">
            <Phone className="h-4 w-4" />
            Số điện thoại
          </Label>
          <Input
            id="phone"
            type="tel"
            placeholder="+84 xxx xxx xxx"
            value={profile.phone}
            onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
          />
        </div>

        {/* Preferred Wallet */}
        <div className="space-y-2">
          <Label htmlFor="preferred_wallet" className="flex items-center gap-2">
            <Wallet className="h-4 w-4" />
            Địa chỉ ví ưa thích
          </Label>
          <Input
            id="preferred_wallet"
            placeholder="0x..."
            value={profile.preferred_wallet}
            onChange={(e) => setProfile({ ...profile, preferred_wallet: e.target.value })}
          />
          <p className="text-xs text-muted-foreground">
            Ví này sẽ được sử dụng mặc định cho các giao dịch FUN Money
          </p>
        </div>

        {/* Save Button */}
        <Button
          onClick={handleSave}
          disabled={saving}
          className="w-full bg-gradient-spiritual text-primary-foreground hover:opacity-90"
        >
          {saving ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Đang lưu...
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              Lưu thay đổi
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
