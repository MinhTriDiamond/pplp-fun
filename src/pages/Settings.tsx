import { Settings as SettingsIcon } from 'lucide-react';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ProfileForm } from '@/components/settings/ProfileForm';
import { PrivacyDashboard } from '@/components/settings/PrivacyDashboard';
import { UsernameForm } from '@/components/settings/UsernameForm';
import { FunNavbar } from '@/components/layout/FunNavbar';
import { BottomNav } from '@/components/layout/BottomNav';

export default function Settings() {
  return (
    <div className="min-h-screen bg-background">
      <FunNavbar />

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
