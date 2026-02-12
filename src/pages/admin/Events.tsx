import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { FunNavbar } from '@/components/layout/FunNavbar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { RefreshCw, Search, Activity } from 'lucide-react';

interface EventRow {
  id: string;
  event_name: string;
  timestamp: string;
  fun_user_id: string | null;
  module: string | null;
  platform: string | null;
  properties: Record<string, unknown>;
  trace_id: string | null;
}

export default function AdminEvents() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [events, setEvents] = useState<EventRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchName, setSearchName] = useState('');
  const [filterModule, setFilterModule] = useState('all');

  useEffect(() => {
    if (!authLoading && !user) navigate('/auth');
  }, [user, authLoading, navigate]);

  const fetchEvents = async () => {
    setLoading(true);
    let query = supabase
      .from('events')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(100);

    if (searchName) query = query.ilike('event_name', `%${searchName}%`);
    if (filterModule && filterModule !== 'all') query = query.eq('module', filterModule);

    const { data } = await query;
    setEvents((data as any[]) || []);
    setLoading(false);
  };

  useEffect(() => {
    if (user) fetchEvents();
  }, [user, searchName, filterModule]);

  if (authLoading || !user) return null;

  return (
    <div className="min-h-screen bg-background">
      <FunNavbar />
      <main className="container max-w-6xl px-4 py-6 space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Activity className="h-6 w-6 text-primary" />
            Events Dashboard
          </h1>
          <Button variant="outline" size="sm" onClick={fetchEvents}>
            <RefreshCw className="h-4 w-4 mr-1" /> Refresh
          </Button>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="flex gap-3 pt-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Tìm event_name..."
                value={searchName}
                onChange={(e) => setSearchName(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={filterModule} onValueChange={setFilterModule}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Module" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả</SelectItem>
                <SelectItem value="fun-core">fun-core</SelectItem>
                <SelectItem value="fun-academy">fun-academy</SelectItem>
                <SelectItem value="fun-play">fun-play</SelectItem>
                <SelectItem value="fun-charity">fun-charity</SelectItem>
                <SelectItem value="fun-farm">fun-farm</SelectItem>
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        {/* Table */}
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Event</TableHead>
                  <TableHead>Module</TableHead>
                  <TableHead>Platform</TableHead>
                  <TableHead>Timestamp</TableHead>
                  <TableHead>Trace ID</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                      Đang tải...
                    </TableCell>
                  </TableRow>
                ) : events.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                      Chưa có events nào
                    </TableCell>
                  </TableRow>
                ) : (
                  events.map((ev) => (
                    <TableRow key={ev.id}>
                      <TableCell>
                        <Badge variant="outline">{ev.event_name}</Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">{ev.module || '—'}</TableCell>
                      <TableCell className="text-sm">{ev.platform || '—'}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {new Date(ev.timestamp).toLocaleString('vi-VN')}
                      </TableCell>
                      <TableCell className="text-xs font-mono text-muted-foreground truncate max-w-[120px]">
                        {ev.trace_id?.slice(0, 8) || '—'}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
