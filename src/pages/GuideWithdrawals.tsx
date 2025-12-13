import { useEffect, useState } from 'react';
import Header from '@/components/Header';
import GuideSidebar from '@/components/GuideSidebar';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { getWithdrawalsByGuide, createWithdrawalRequest, getWalletBalance, updateWalletBalance, createTransaction, WalletBalance, WithdrawalRequest, subscribeToGuideBankAccounts, BankAccount, getGuideProfile } from '@/lib/firestore';
import { Loader2, DollarSign } from 'lucide-react';

const GuideWithdrawals = () => {
  const { user, userData } = useAuth();
  const { toast } = useToast();
  const [withdrawals, setWithdrawals] = useState<WithdrawalRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [amount, setAmount] = useState<number | string>('');
  const [bankId, setBankId] = useState<string | null>(null);
  const [wallet, setWallet] = useState<WalletBalance | null>(null);
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([]);
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    if (!user || userData?.userType !== 'guide') return;
    const load = async () => {
      setLoading(true);
      try {
        const w = await getWalletBalance(user.uid);
        setWallet(w);
        const items = await getWithdrawalsByGuide(user.uid);
        setWithdrawals(items);
      } catch (err) {
        console.error('Erro ao carregar saques do guia', err);
        toast({ title: 'Erro', description: 'Não foi possível carregar saques', variant: 'destructive' });
      } finally {
        setLoading(false);
      }
    };
    load();
    // subscribe to bank accounts
    let unsub: (() => void) | undefined;
    if (user?.uid) {
      unsub = subscribeToGuideBankAccounts(user.uid, (accounts) => {
        setBankAccounts(accounts);
        if (!bankId && accounts.length > 0) {
          const primary = accounts.find(a => a.isPrimary) || accounts[0];
          setBankId(primary.id);
        }
      });
    }
    return () => unsub && unsub();
  }, [user, userData, toast]);

  const handleRequest = async () => {
    if (!user) return;
    const amountNum = typeof amount === 'string' ? parseFloat(amount) : amount;
    if (!amountNum || amountNum <= 0) return toast({ title: 'Erro', description: 'Valor inválido', variant: 'destructive' });
    const available = wallet?.currentBalance ?? 0;
    if (amountNum > available) return toast({ title: 'Erro', description: 'Saldo insuficiente', variant: 'destructive' });
    setIsCreating(true);
    try {
      const guideProfile = await getGuideProfile(user.uid);
      const chosenBank = bankAccounts.find(b => b.id === bankId) || bankAccounts.find(b => b.isPrimary);
      await createWithdrawalRequest({
        guideId: user.uid,
        guideName: user.displayName || userData?.name || '',
        guideEmail: user.email || '',
        amount: amountNum,
        bankAccountId: chosenBank?.id || '',
        bankName: chosenBank?.bankName || '',
        accountNumber: chosenBank?.accountNumber || '',
        accountHolder: chosenBank?.accountHolder || '',
        status: 'pending'
      } as any);
      // update wallet
      await updateWalletBalance(user.uid, {
        currentBalance: (wallet?.currentBalance ?? 0) - amountNum,
        pendingWithdrawal: (wallet?.pendingWithdrawal ?? 0) + amountNum
      } as any);
      await createTransaction({ guideId: user.uid, type: 'withdrawal', amount: -amountNum, description: 'Solicitação de saque', balanceBefore: wallet?.currentBalance ?? 0, balanceAfter: (wallet?.currentBalance ?? 0) - amountNum });
      const updated = await getWithdrawalsByGuide(user.uid);
      setWithdrawals(updated);
      toast({ title: 'Solicitação criada', description: 'Sua solicitação de saque foi enviada' });
      setIsDialogOpen(false);
    } catch (err) {
      console.error('Erro ao criar solicitação', err);
      toast({ title: 'Erro', description: 'Não foi possível criar solicitação', variant: 'destructive' });
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <GuideSidebar />
      <div className="flex-1 lg:ml-64 p-6">
        <div className="max-w-6xl mx-auto space-y-6">
          <div>
            <h1 className="text-3xl font-bold">Saques</h1>
            <p className="text-muted-foreground mt-2">Solicite saques ou veja o histórico dos seus saques</p>
          </div>

          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm text-muted-foreground">Saldo disponível</p>
              <p className="text-2xl font-bold text-green-600">{wallet ? `${wallet.currentBalance.toFixed(2)} Kz` : 'Carregando...'}</p>
            </div>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button className="gap-2"><DollarSign className="h-4 w-4 mr-2" />Solicitar Saque</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Solicitar Saque</DialogTitle>
                </DialogHeader>
                <div className="py-2 space-y-2">
                  <div>
                    <label className="text-sm">Conta para depósito</label>
                    {bankAccounts.length === 0 ? (
                      <div className="text-sm text-muted-foreground">Nenhuma conta cadastrada, adicione em Faturamento</div>
                    ) : (
                      <Select value={bankId ?? undefined} onValueChange={(v: any) => setBankId(v)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione uma conta" />
                        </SelectTrigger>
                        <SelectContent>
                          {bankAccounts.map((acc) => (
                            <SelectItem key={acc.id} value={acc.id}>{acc.bankName} • ****{acc.accountNumber.slice(-4)} - {acc.accountHolder}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  </div>
                  <div>
                    <label className="text-sm">Valor (Kz)</label>
                    <Input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancelar</Button>
                  <Button onClick={handleRequest} disabled={isCreating}>{isCreating ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Enviar'}</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Histórico de Saques</CardTitle>
              <CardDescription>Lista de solicitações efetuadas</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (<div>Carregando...</div>) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Valor</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Data</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {withdrawals.map(w => (
                        <TableRow key={w.id}>
                          <TableCell className="font-bold">{w.amount.toFixed(2)} Kz</TableCell>
                          <TableCell><Badge>{w.status}</Badge></TableCell>
                          <TableCell>{new Date(w.createdAt?.seconds ? w.createdAt.toDate() : w.createdAt).toLocaleString()}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default GuideWithdrawals;
