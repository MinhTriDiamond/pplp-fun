import { Link, useLocation } from 'react-router-dom';
import { Home, Gamepad2, Sparkles, Wallet, User } from 'lucide-react';
import { cn } from '@/lib/utils';

const tabs = [
  { label: 'Home', icon: Home, path: '/' },
  { label: 'Play', icon: Gamepad2, path: '/play' },
  { label: 'Angel', icon: Sparkles, path: '/angel' },
  { label: 'Ví', icon: Wallet, path: '/wallet' },
  { label: 'Hồ sơ', icon: User, path: '/settings' },
];

export function BottomNav() {
  const { pathname } = useLocation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 md:hidden">
      <div className="flex h-14 items-center justify-around px-2">
        {tabs.map((tab) => {
          const isActive = tab.path === '/' ? pathname === '/' : pathname.startsWith(tab.path);
          return (
            <Link
              key={tab.path}
              to={tab.path}
              className={cn(
                'flex flex-col items-center gap-0.5 px-3 py-1 rounded-lg transition-colors text-[11px]',
                isActive
                  ? 'text-primary font-semibold'
                  : 'text-muted-foreground'
              )}
            >
              <tab.icon className={cn('h-5 w-5', isActive && 'text-primary')} />
              {tab.label}
            </Link>
          );
        })}
      </div>
      {/* Safe area for iOS */}
      <div className="h-[env(safe-area-inset-bottom)]" />
    </nav>
  );
}
