import { FunNavbar } from '@/components/layout/FunNavbar';
import { ContinueWithFunId } from '@/components/auth/ContinueWithFunId';
import { BookOpen, GraduationCap, Trophy, Users } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export default function Academy() {
  return (
    <div className="min-h-screen bg-background">
      <FunNavbar />
      <ContinueWithFunId
        platformId="fun-academy"
        platformName="FUN Academy"
        platformIcon={<BookOpen className="h-8 w-8 text-primary" />}
      >
        <main className="container py-8 px-4 max-w-5xl">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">FUN Academy</h1>
            <p className="text-muted-foreground">Học hỏi, phát triển và kiếm FUN từ kiến thức 🎓</p>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[
              { title: 'Khóa học Web3 cơ bản', icon: <GraduationCap className="h-5 w-5" />, lessons: 12, reward: 50 },
              { title: 'PPLP Protocol Deep Dive', icon: <BookOpen className="h-5 w-5" />, lessons: 8, reward: 100 },
              { title: 'FUN Ecosystem Tour', icon: <Trophy className="h-5 w-5" />, lessons: 5, reward: 25 },
              { title: 'Community Leadership', icon: <Users className="h-5 w-5" />, lessons: 10, reward: 75 },
            ].map((course, i) => (
              <Card key={i} className="hover:shadow-md transition-shadow">
                <CardHeader className="flex flex-row items-center gap-3 pb-2">
                  <div className="p-2 rounded-lg bg-primary/10">{course.icon}</div>
                  <div>
                    <CardTitle className="text-base">{course.title}</CardTitle>
                    <p className="text-xs text-muted-foreground">{course.lessons} bài học</p>
                  </div>
                </CardHeader>
                <CardContent>
                  <Badge variant="secondary">🎁 +{course.reward} FUN</Badge>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="mt-8 p-6 rounded-xl border bg-muted/30 text-center">
            <p className="text-muted-foreground">🚀 Nhiều khóa học đang được phát triển. Stay tuned!</p>
          </div>
        </main>
      </ContinueWithFunId>
    </div>
  );
}
