import { Link } from 'react-router-dom';
import { ModuleSwitcher } from './ModuleSwitcher';
import { useIsMobile } from '@/hooks/use-mobile';
import { Settings, Wallet } from 'lucide-react';
import funLogo from '@/assets/fun-ecosystem-logo.png';

export function FunNavbar() {
  const isMobile = useIsMobile();

  return (
    <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center justify-between px-4">
        <div className="flex items-center gap-3">
          <Link to="/" className="flex items-center gap-2 font-bold text-lg">
            <img src={funLogo} alt="FUN" className="h-7 w-7 rounded" />
            <span className="hidden sm:inline">FUN Ecosystem</span>
          </Link>
          {!isMobile && <ModuleSwitcher />}
        </div>

        <div className="flex items-center gap-1">
          <Link to="/wallet" className="inline-flex items-center justify-center rounded-md text-sm font-medium h-9 w-9 hover:bg-accent hover:text-accent-foreground">
            <Wallet className="h-4 w-4" />
          </Link>
          <Link to="/settings" className="inline-flex items-center justify-center rounded-md text-sm font-medium h-9 w-9 hover:bg-accent hover:text-accent-foreground">
            <Settings className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </header>
  );
}
