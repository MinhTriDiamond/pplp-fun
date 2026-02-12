import { FunNavbar } from '@/components/layout/FunNavbar';
import { ContinueWithFunId } from '@/components/auth/ContinueWithFunId';
import { Gamepad2, Swords, Puzzle, Zap } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export default function Play() {
  return (
    <div className="min-h-screen bg-background">
      <FunNavbar />
      <ContinueWithFunId
        platformId="fun-play"
        platformName="FUN Play"
        platformIcon={<Gamepad2 className="h-8 w-8 text-primary" />}
      >
        <main className="container py-8 px-4 max-w-5xl">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">FUN Play</h1>
            <p className="text-muted-foreground">Chơi game, kiếm FUN, kết nối bạn bè 🎮</p>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {[
              { title: 'FUN Quiz Battle', icon: <Swords className="h-5 w-5" />, players: '2.4K', status: 'Live' },
              { title: 'Puzzle of Love', icon: <Puzzle className="h-5 w-5" />, players: '1.1K', status: 'Live' },
              { title: 'Speed Challenge', icon: <Zap className="h-5 w-5" />, players: '890', status: 'Coming Soon' },
              { title: 'FUN World', icon: <Gamepad2 className="h-5 w-5" />, players: '—', status: 'Coming Soon' },
            ].map((game, i) => (
              <Card key={i} className={`hover:shadow-md transition-shadow ${game.status !== 'Live' ? 'opacity-60' : ''}`}>
                <CardHeader className="flex flex-row items-center gap-3 pb-2">
                  <div className="p-2 rounded-lg bg-primary/10">{game.icon}</div>
                  <div className="flex-1">
                    <CardTitle className="text-base">{game.title}</CardTitle>
                    <p className="text-xs text-muted-foreground">{game.players} players</p>
                  </div>
                  <Badge variant={game.status === 'Live' ? 'default' : 'secondary'}>{game.status}</Badge>
                </CardHeader>
              </Card>
            ))}
          </div>
        </main>
      </ContinueWithFunId>
    </div>
  );
}
