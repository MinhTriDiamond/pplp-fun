import { useEffect, useState } from 'react';
import { FunNavbar } from '@/components/layout/FunNavbar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { Landmark, TrendingUp, TrendingDown, BarChart3 } from 'lucide-react';

interface DailySummary {
  day: string;
  asset: string;
  tx_type: string;
  tx_count: number;
  total_amount: number;
}

export default function Treasury() {
  const [summary, setSummary] = useState<DailySummary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSummary = async () => {
      const { data } = await supabase
        .from('ledger_transactions')
        .select('tx_type, asset, amount, created_at, status')
        .eq('status', 'completed')
        .order('created_at', { ascending: false })
        .limit(500);

      if (!data) { setLoading(false); return; }

      // Group by day + asset + tx_type
      const grouped: Record<string, DailySummary> = {};
      for (const row of data) {
        const day = new Date(row.created_at).toISOString().split('T')[0];
        const key = `${day}-${row.asset}-${row.tx_type}`;
        if (!grouped[key]) {
          grouped[key] = { day, asset: row.asset, tx_type: row.tx_type, tx_count: 0, total_amount: 0 };
        }
        grouped[key].tx_count += 1;
        grouped[key].total_amount += Number(row.amount);
      }
      setSummary(Object.values(grouped).sort((a, b) => b.day.localeCompare(a.day)));
      setLoading(false);
    };
    fetchSummary();
  }, []);

  // Compute totals
  const totalInflow = summary
    .filter((s) => ['reward', 'mint', 'refund'].includes(s.tx_type))
    .reduce((sum, s) => sum + Number(s.total_amount), 0);

  const totalOutflow = summary
    .filter((s) => ['transfer', 'pay', 'burn'].includes(s.tx_type))
    .reduce((sum, s) => sum + Number(s.total_amount), 0);

  const totalTx = summary.reduce((sum, s) => sum + s.tx_count, 0);

  return (
    <div className="min-h-screen bg-background">
      <FunNavbar />
      <main className="container max-w-5xl px-4 py-6 space-y-6">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Landmark className="h-6 w-6 text-primary" />
            FUN Treasury — Minh bạch tài chính
          </h1>
          <p className="text-muted-foreground mt-1">
            Dữ liệu công khai về dòng chảy FUN trong hệ sinh thái. "Free to Join. Free to Use. Earn Together."
          </p>
        </div>

        {/* Summary cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardDescription className="flex items-center gap-1">
                <TrendingUp className="h-4 w-4 text-green-600" /> Tổng vào
              </CardDescription>
              <CardTitle className="text-2xl text-green-600">
                {loading ? '...' : totalInflow.toLocaleString('vi-VN')} FUN
              </CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription className="flex items-center gap-1">
                <TrendingDown className="h-4 w-4 text-orange-500" /> Tổng ra
              </CardDescription>
              <CardTitle className="text-2xl text-orange-500">
                {loading ? '...' : totalOutflow.toLocaleString('vi-VN')} FUN
              </CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription className="flex items-center gap-1">
                <BarChart3 className="h-4 w-4" /> Tổng giao dịch
              </CardDescription>
              <CardTitle className="text-2xl">
                {loading ? '...' : totalTx.toLocaleString('vi-VN')}
              </CardTitle>
            </CardHeader>
          </Card>
        </div>

        {/* Daily breakdown */}
        <Card>
          <CardHeader>
            <CardTitle>Chi tiết theo ngày</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Ngày</TableHead>
                  <TableHead>Loại</TableHead>
                  <TableHead>Asset</TableHead>
                  <TableHead>Số giao dịch</TableHead>
                  <TableHead>Tổng amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">Đang tải...</TableCell>
                  </TableRow>
                ) : summary.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                      Chưa có dữ liệu giao dịch
                    </TableCell>
                  </TableRow>
                ) : (
                  summary.map((row, i) => (
                    <TableRow key={i}>
                      <TableCell>{row.day}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="capitalize">{row.tx_type}</Badge>
                      </TableCell>
                      <TableCell>{row.asset}</TableCell>
                      <TableCell>{row.tx_count}</TableCell>
                      <TableCell>{Number(row.total_amount).toLocaleString('vi-VN')}</TableCell>
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
