import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Settings as SettingsIcon } from 'lucide-react';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ProfileForm } from '@/components/settings/ProfileForm';
import { PrivacyDashboard } from '@/components/settings/PrivacyDashboard';
import { UsernameForm } from '@/components/settings/UsernameForm';
import { FunNavbar } from '@/components/layout/FunNavbar';
import { BottomNav } from '@/components/layout/BottomNav';
import { useAuth } from '@/hooks/useAuth';

export default function Settings() {
  const navigate = useNavigate();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
  }, [user, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-light">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <FunNavbar />

      {/* Main Content */}
      <main className="container max-w-3xl px-4 py-8">
        <div className="flex items-center gap-2 mb-6">
          <SettingsIcon className="h-5 w-5 text-primary" />
          <h1 className="text-xl font-semibold">Cài đặt</h1>
        </div>

        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="profile">Hồ sơ</TabsTrigger>
            <TabsTrigger value="identity">FUN ID</TabsTrigger>
            <TabsTrigger value="privacy">Quyền riêng tư</TabsTrigger>
          </TabsList>

          <TabsContent value="profile" className="space-y-6">
            <ProfileForm />
          </TabsContent>

          <TabsContent value="identity" className="space-y-6">
            <UsernameForm />
          </TabsContent>

          <TabsContent value="privacy" className="space-y-6">
            <PrivacyDashboard />
          </TabsContent>
        </Tabs>
      </main>
      <BottomNav />
    </div>
  );
}
