import { Shield, Eye, Brain, Share2, Megaphone, BarChart3, Loader2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { usePrivacyPermissions } from '@/hooks/usePrivacyPermissions';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface PermissionItem {
  key: keyof Omit<ReturnType<typeof usePrivacyPermissions>['permissions'], 'user_id' | 'created_at' | 'updated_at'>;
  label: string;
  description: string;
  icon: React.ReactNode;
}

const permissionItems: PermissionItem[] = [
  {
    key: 'allow_social_graph',
    label: 'Chia sẻ Social Graph',
    description: 'Cho phép bạn bè và người theo dõi nhìn thấy mạng lưới kết nối của bạn',
    icon: <Share2 className="h-5 w-5 text-purple" />,
  },
  {
    key: 'allow_ai_personalization',
    label: 'AI Cá nhân hóa',
    description: 'Cho phép Angel AI học từ hoạt động của bạn để đưa ra gợi ý phù hợp hơn',
    icon: <Brain className="h-5 w-5 text-primary" />,
  },
  {
    key: 'allow_ai_memory',
    label: 'AI Ghi nhớ',
    description: 'Cho phép Angel AI lưu trữ ngữ cảnh cuộc trò chuyện qua các phiên',
    icon: <Eye className="h-5 w-5 text-accent" />,
  },
  {
    key: 'allow_cross_platform_data',
    label: 'Chia sẻ dữ liệu Cross-Platform',
    description: 'Cho phép các platform trong FUN Ecosystem chia sẻ dữ liệu hoạt động của bạn',
    icon: <Share2 className="h-5 w-5 text-earth-green" />,
  },
  {
    key: 'allow_marketing',
    label: 'Thông báo Marketing',
    description: 'Nhận ưu đãi, khuyến mãi và cập nhật mới từ FUN Ecosystem',
    icon: <Megaphone className="h-5 w-5 text-love-pink" />,
  },
  {
    key: 'allow_analytics',
    label: 'Analytics & Cải thiện',
    description: 'Giúp FUN Ecosystem cải thiện sản phẩm thông qua dữ liệu sử dụng ẩn danh',
    icon: <BarChart3 className="h-5 w-5 text-muted-foreground" />,
  },
];

export function PrivacyDashboard() {
  const { permissions, loading, error, updatePermissions } = usePrivacyPermissions();

  const handleToggle = async (key: PermissionItem['key'], checked: boolean) => {
    await updatePermissions({ [key]: checked });
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

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  return (
    <Card className="shadow-elegant">
      <CardHeader className="space-y-1">
        <div className="flex items-center gap-2">
          <Shield className="h-5 w-5 text-primary" />
          <CardTitle className="text-xl">Quyền riêng tư & Dữ liệu</CardTitle>
        </div>
        <CardDescription>
          Kiểm soát cách dữ liệu của bạn được sử dụng trong FUN Ecosystem. 
          Bạn là chủ sở hữu dữ liệu của mình (5D Trust).
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {permissionItems.map((item) => (
          <div
            key={item.key}
            className="flex items-start justify-between gap-4 rounded-lg border border-border bg-card p-4 transition-colors hover:bg-muted/50"
          >
            <div className="flex gap-3">
              <div className="mt-0.5">{item.icon}</div>
              <div className="space-y-1">
                <Label htmlFor={item.key} className="text-base font-medium cursor-pointer">
                  {item.label}
                </Label>
                <p className="text-sm text-muted-foreground">{item.description}</p>
              </div>
            </div>
            <Switch
              id={item.key}
              checked={permissions?.[item.key] ?? false}
              onCheckedChange={(checked) => handleToggle(item.key, checked)}
            />
          </div>
        ))}

        <div className="rounded-lg bg-secondary/50 p-4 mt-6">
          <p className="text-sm text-muted-foreground">
            <strong className="text-foreground">Nguyên tắc 5D Trust:</strong> Mọi thay đổi quyền được 
            ghi nhật ký để đảm bảo minh bạch. Bạn có thể yêu cầu xóa dữ liệu bất cứ lúc nào.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
