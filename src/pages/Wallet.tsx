import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useWalletLedger } from '@/hooks/useWalletLedger';
import { FunNavbar } from '@/components/layout/FunNavbar';
import { BottomNav } from '@/components/layout/BottomNav';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { Wallet, Send, ArrowDownLeft, ArrowUpRight, Coins, Loader2 } from 'lucide-react';

export default function WalletPage() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { balances, transactions, loading, transfer } = useWalletLedger();
  const { toast } = useToast();

  const [transferTo, setTransferTo] = useState('');
  const [transferAmount, setTransferAmount] = useState('');
  const [transferMemo, setTransferMemo] = useState('');
  const [sending, setSending] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) navigate('/auth');
  }, [user, authLoading, navigate]);

  const handleTransfer = async () => {
    const amount = parseFloat(transferAmount);
    if (!transferTo || !amount || amount <= 0) {
      toast({ title: 'Thiếu thông tin', description: 'Nhập username và số tiền hợp lệ', variant: 'destructive' });
      return;
    }
    setSending(true);
    try {
      await transfer({ to_username: transferTo.replace('@', ''), amount, memo: transferMemo || undefined });
      toast({ title: 'Chuyển thành công! ✨', description: `Đã gửi ${amount} FUN đến @${transferTo}` });
      setTransferTo('');
      setTransferAmount('');
      setTransferMemo('');
      setDialogOpen(false);
    } catch (err: any) {
      toast({ title: 'Lỗi', description: err?.message || 'Chuyển tiền thất bại', variant: 'destructive' });
    }
    setSending(false);
  };

  if (authLoading || !user) return null;

  const funBalance = balances.find((b) => b.asset === 'FUN');
  const camlyBalance = balances.find((b) => b.asset === 'CAMLY');

  return (
    <div className="min-h-screen bg-background">
      <FunNavbar />
      <main className="container max-w-4xl px-4 py-6 space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Wallet className="h-6 w-6 text-primary" />
            FUN Wallet
          </h1>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button><Send className="h-4 w-4 mr-2" /> Chuyển tiền</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Chuyển FUN</DialogTitle>
                <DialogDescription>Gửi FUN đến người dùng khác trong hệ sinh thái</DialogDescription>
              </DialogHeader>
              <div className="space-y-3 pt-2">
                <Input
                  placeholder="@username người nhận"
                  value={transferTo}
                  onChange={(e) => setTransferTo(e.target.value)}
                />
                <Input
                  type="number"
                  placeholder="Số lượng FUN"
                  value={transferAmount}
                  onChange={(e) => setTransferAmount(e.target.value)}
                  min="0.0001"
                  step="0.0001"
                />
                <Input
                  placeholder="Ghi chú (tùy chọn)"
                  value={transferMemo}
                  onChange={(e) => setTransferMemo(e.target.value)}
                />
                <Button onClick={handleTransfer} disabled={sending} className="w-full">
                  {sending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Send className="h-4 w-4 mr-2" />}
                  Gửi
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Balances */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>FUN Balance</CardDescription>
              <CardTitle className="text-3xl flex items-center gap-2">
                <Coins className="h-6 w-6 text-yellow-500" />
                {loading ? '...' : Number(funBalance?.available || 0).toLocaleString('vi-VN')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Đang khóa: {loading ? '...' : Number(funBalance?.locked || 0).toLocaleString('vi-VN')} FUN
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>CAMLY Balance</CardDescription>
              <CardTitle className="text-3xl flex items-center gap-2">
                <Coins className="h-6 w-6 text-purple-500" />
                {loading ? '...' : Number(camlyBalance?.available || 0).toLocaleString('vi-VN')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Đang khóa: {loading ? '...' : Number(camlyBalance?.locked || 0).toLocaleString('vi-VN')} CAMLY
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Transactions */}
        <Card>
          <CardHeader>
            <CardTitle>Lịch sử giao dịch</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Loại</TableHead>
                  <TableHead>Số lượng</TableHead>
                  <TableHead>Trạng thái</TableHead>
                  <TableHead>Thời gian</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">Đang tải...</TableCell>
                  </TableRow>
                ) : transactions.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                      Chưa có giao dịch nào ✨
                    </TableCell>
                  </TableRow>
                ) : (
                  transactions.map((tx) => {
                    const isOutgoing = tx.from_user_id === user.id;
                    return (
                      <TableRow key={tx.id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {isOutgoing ? (
                              <ArrowUpRight className="h-4 w-4 text-destructive" />
                            ) : (
                              <ArrowDownLeft className="h-4 w-4 text-green-600" />
                            )}
                            <span className="capitalize">{tx.tx_type}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className={isOutgoing ? 'text-destructive' : 'text-green-600'}>
                            {isOutgoing ? '-' : '+'}{Number(tx.amount).toLocaleString('vi-VN')} {tx.asset}
                          </span>
                        </TableCell>
                        <TableCell>
                          <Badge variant={tx.status === 'completed' ? 'default' : 'secondary'}>
                            {tx.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {new Date(tx.created_at).toLocaleString('vi-VN')}
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </main>
      <BottomNav />
    </div>
  );
}
