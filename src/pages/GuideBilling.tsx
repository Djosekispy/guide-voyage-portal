import { useEffect, useState } from "react";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Calendar, DollarSign, CreditCard, Banknote, Percent, Wallet, Plus, Edit, Trash2, Loader2, Building2, Star } from "lucide-react";
import GuideSidebar from "@/components/GuideSidebar";
import { useAuth } from "@/contexts/AuthContext";
import { 
  Booking, 
  getGuideBookings, 
  subscribeToGuideBookings,
  BankAccount,
  createBankAccount,
  updateBankAccount,
  deleteBankAccount,
  subscribeToGuideBankAccounts,
  setPrimaryBankAccount,
  getGuideProfile
} from "@/lib/firestore";
import {
  getWalletBalance,
  WalletBalance,
  createWithdrawalRequest,
  createTransaction,
  updateWalletBalance,
  getTransactionsByGuide,
  Transaction
} from "@/lib/firestore";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface BillingSummary {
  totalEarnings: number;
  platformFee: number;
  netAmount: number;
  confirmedBookings: number;
  canceledBookings: number;
  period: string;
  bookings: Booking[];
}

const GuideBilling = () => {
  const { user, userData } = useAuth();
  const { toast } = useToast();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<"currentMonth" | "lastMonth" | "allTime">("currentMonth");
  const [billing, setBilling] = useState<BillingSummary>({
    totalEarnings: 0,
    platformFee: 0,
    netAmount: 0,
    confirmedBookings: 0,
    canceledBookings: 0,
    period: "Mês atual",
    bookings: []
  });

  // Bank account state
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([]);
  const [isBankDialogOpen, setIsBankDialogOpen] = useState(false);
  const [isEditingBank, setIsEditingBank] = useState(false);
  const [selectedBankAccount, setSelectedBankAccount] = useState<BankAccount | null>(null);
  const [savingBank, setSavingBank] = useState(false);
  const [guideId, setGuideId] = useState<string | null>(null);
  
  const [bankFormData, setBankFormData] = useState({
    accountHolder: '',
    accountNumber: '',
    bankName: '',
    branchCode: '',
    accountType: 'Conta Corrente' as BankAccount['accountType'],
    taxId: '',
    isPrimary: false
  });

  // Wallet / Withdrawals
  const [wallet, setWallet] = useState<WalletBalance | null>(null);
  const [isWithdrawalDialogOpen, setIsWithdrawalDialogOpen] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState<number | ''>('');
  const [withdrawing, setWithdrawing] = useState(false);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [withdrawAccountId, setWithdrawAccountId] = useState<string | null>(null);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      if (!user?.uid) return;

      // Get guide profile first
      const guide = await getGuideProfile(user.uid);
      if (guide) {
        setGuideId(guide.id);
        
        // Carregar reservas
        const guideBookings = await getGuideBookings(guide.id);
        setBookings(guideBookings);

        // Configurar listener em tempo real para reservas
        const unsubscribeBookings = subscribeToGuideBookings(guide.id, (updatedBookings) => {
          setBookings(updatedBookings);
        });

        // Subscribe to bank accounts
        const unsubscribeBankAccounts = subscribeToGuideBankAccounts(guide.id, (accounts) => {
          setBankAccounts(accounts);
        });

        // Load wallet
        try {
          const w = await getWalletBalance(guide.id);
          setWallet(w);
        } catch (err) {
          console.warn('Erro ao obter carteira:', err);
        }

        // Load recent transactions
        try {
          const txs = await getTransactionsByGuide(guide.id);
          setTransactions(txs.slice(0, 20));
        } catch (err) {
          console.warn('Erro ao obter transações:', err);
        }

        return () => {
          unsubscribeBookings();
          unsubscribeBankAccounts();
        };
      }
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os dados de faturamento",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user && userData?.userType === 'guide') {
      loadDashboardData();
    }
  }, [user, userData]);

  useEffect(() => {
    if (bookings.length > 0) {
      calculateBilling();
    }
  }, [bookings, timeRange]);

  const calculateBilling = () => {
    const now = new Date();
    let filteredBookings = bookings;
    let periodLabel = "Todo o período";

    if (timeRange === "currentMonth") {
      const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
      filteredBookings = bookings.filter(b => new Date(b.date) >= firstDay);
      periodLabel = "Mês atual";
    } else if (timeRange === "lastMonth") {
      const firstDayLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const lastDayLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);
      filteredBookings = bookings.filter(b => 
        new Date(b.date) >= firstDayLastMonth && new Date(b.date) <= lastDayLastMonth
      );
      periodLabel = "Mês anterior";
    }

    const confirmed = filteredBookings.filter(b => b.status === 'Finalizado');
    const canceled = filteredBookings.filter(b => b.status === 'Cancelado');
    
    const totalEarnings = confirmed.reduce((sum, b) => sum + b.totalPrice, 0);
    const platformFee = totalEarnings * 0.05;
    const netAmount = totalEarnings - platformFee;

    setBilling({
      totalEarnings,
      platformFee,
      netAmount,
      confirmedBookings: confirmed.length,
      canceledBookings: canceled.length,
      period: periodLabel,
      bookings: filteredBookings
    });
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-AO', {
      style: 'currency',
      currency: 'AOA'
    }).format(value);
  };

  const resetBankForm = () => {
    setBankFormData({
      accountHolder: '',
      accountNumber: '',
      bankName: '',
      branchCode: '',
      accountType: 'Conta Corrente',
      taxId: '',
      isPrimary: false
    });
    setSelectedBankAccount(null);
    setIsEditingBank(false);
  };

  const handleOpenBankDialog = (account?: BankAccount) => {
    if (account) {
      setIsEditingBank(true);
      setSelectedBankAccount(account);
      setBankFormData({
        accountHolder: account.accountHolder,
        accountNumber: account.accountNumber,
        bankName: account.bankName,
        branchCode: account.branchCode || '',
        accountType: account.accountType,
        taxId: account.taxId || '',
        isPrimary: account.isPrimary
      });
    } else {
      resetBankForm();
    }
    setIsBankDialogOpen(true);
  };

  const handleSaveBankAccount = async () => {
    if (!guideId) return;
    
    if (!bankFormData.accountHolder || !bankFormData.accountNumber || !bankFormData.bankName) {
      toast({
        title: "Erro",
        description: "Por favor, preencha todos os campos obrigatórios",
        variant: "destructive"
      });
      return;
    }

    setSavingBank(true);
    try {
      if (isEditingBank && selectedBankAccount) {
        await updateBankAccount(selectedBankAccount.id, {
          accountHolder: bankFormData.accountHolder,
          accountNumber: bankFormData.accountNumber,
          bankName: bankFormData.bankName,
          branchCode: bankFormData.branchCode || undefined,
          accountType: bankFormData.accountType,
          taxId: bankFormData.taxId || undefined
        });
        toast({
          title: "Sucesso!",
          description: "Conta bancária atualizada com sucesso"
        });
      } else {
        await createBankAccount({
          guideId,
          accountHolder: bankFormData.accountHolder,
          accountNumber: bankFormData.accountNumber,
          bankName: bankFormData.bankName,
          branchCode: bankFormData.branchCode || undefined,
          accountType: bankFormData.accountType,
          taxId: bankFormData.taxId || undefined,
          isPrimary: bankAccounts.length === 0 // First account is primary
        });
        toast({
          title: "Sucesso!",
          description: "Conta bancária adicionada com sucesso"
        });
      }
      setIsBankDialogOpen(false);
      resetBankForm();
    } catch (error) {
      console.error('Erro ao salvar conta bancária:', error);
      toast({
        title: "Erro",
        description: "Não foi possível salvar a conta bancária",
        variant: "destructive"
      });
    } finally {
      setSavingBank(false);
    }
  };

  const handleDeleteBankAccount = async (accountId: string) => {
    try {
      await deleteBankAccount(accountId);
      toast({
        title: "Sucesso!",
        description: "Conta bancária removida com sucesso"
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível remover a conta bancária",
        variant: "destructive"
      });
    }
  };

  const handleSetPrimaryAccount = async (accountId: string) => {
    if (!guideId) return;
    
    try {
      await setPrimaryBankAccount(accountId, guideId);
      toast({
        title: "Sucesso!",
        description: "Conta principal definida com sucesso"
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível definir a conta principal",
        variant: "destructive"
      });
    }
  };

  const handleOpenWithdrawalDialog = () => {
    setWithdrawAmount('');
    // default to primary account or first
    setWithdrawAccountId(bankAccounts.find(a => a.isPrimary)?.id || bankAccounts[0]?.id || null);
    setIsWithdrawalDialogOpen(true);
  };

  const handleSubmitWithdrawal = async () => {
    if (!guideId || !user) return;
    if (!wallet) {
      toast({ title: 'Erro', description: 'Saldo não disponível', variant: 'destructive' });
      return;
    }

    const amount = typeof withdrawAmount === 'number' ? withdrawAmount : Number(withdrawAmount);
    if (!amount || amount <= 0) {
      toast({ title: 'Erro', description: 'Informe um valor válido', variant: 'destructive' });
      return;
    }

    const available = wallet.currentBalance - (wallet.pendingWithdrawal ?? 0);
    if (amount > available) {
      toast({ title: 'Erro', description: 'Valor maior que o saldo disponível', variant: 'destructive' });
      return;
    }

    const primary = bankAccounts.find(a => a.id === withdrawAccountId) || bankAccounts.find(a => a.isPrimary) || bankAccounts[0];
    if (!primary) {
      toast({ title: 'Erro', description: 'Nenhuma conta bancária disponível', variant: 'destructive' });
      return;
    }

    setWithdrawing(true);

    try {
      const withdrawalId = await createWithdrawalRequest({
        guideId,
        guideName: userData?.name || user.displayName || '',
        guideEmail: user.email || '',
        amount,
        bankAccountId: primary.id,
        bankName: primary.bankName,
        accountNumber: primary.accountNumber,
        accountHolder: primary.accountHolder,
        status: 'pending'
      });

      // Create transaction record
      await createTransaction({
        guideId,
        type: 'withdrawal',
        amount: amount * -1,
        description: `Saque solicitado (${withdrawalId})`,
        balanceBefore: wallet.currentBalance,
        balanceAfter: wallet.currentBalance - amount,
        relatedId: withdrawalId
      });

      // Update wallet: decrement currentBalance and increase pendingWithdrawal
      await updateWalletBalance(guideId, {
        currentBalance: wallet.currentBalance - amount,
        pendingWithdrawal: (wallet.pendingWithdrawal ?? 0) + amount
      });

      toast({ title: 'Sucesso', description: 'Saque solicitado com sucesso' });
      setIsWithdrawalDialogOpen(false);

      // Refresh wallet and transactions
      const w = await getWalletBalance(guideId);
      setWallet(w);
      const txs = await getTransactionsByGuide(guideId);
      setTransactions(txs.slice(0, 20));
    } catch (error) {
      console.error('Erro ao solicitar saque:', error);
      toast({ title: 'Erro', description: 'Não foi possível solicitar o saque', variant: 'destructive' });
    } finally {
      setWithdrawing(false);
    }
  };

  const bankNames = [
    'Banco BIC',
    'BAI - Banco Angolano de Investimentos',
    'BFA - Banco de Fomento Angola',
    'Banco Sol',
    'Banco Millennium Atlântico',
    'Banco Keve',
    'Banco de Negócios Internacional',
    'Banco Económico',
    'Standard Bank Angola',
    'Banco Caixa Geral Angola'
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <GuideSidebar />
      
      <div className="flex-1 lg:ml-64 px-4 pt-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Faturamento</h1>
          <p className="text-muted-foreground">Acompanhe seus ganhos e gerencie dados bancários</p>
        </div>

        {/* Diálogo de Saque */}
        <Dialog open={isWithdrawalDialogOpen} onOpenChange={setIsWithdrawalDialogOpen}>
          <DialogContent className="sm:max-w-[480px]">
            <DialogHeader>
              <DialogTitle>Solicitar Saque</DialogTitle>
              <DialogDescription>Solicite o valor para transferência para sua conta bancária.</DialogDescription>
            </DialogHeader>

            <div className="py-4 space-y-4">
              <div>
                <Label htmlFor="withdrawAmount">Valor (AOA)</Label>
                <Input
                  id="withdrawAmount"
                  value={withdrawAmount}
                  onChange={(e) => setWithdrawAmount(e.target.value === '' ? '' : Number(e.target.value))}
                  placeholder="0.00"
                  type="number"
                  min={0}
                />
                <p className="text-xs text-muted-foreground mt-1">Saldo disponível: {wallet ? formatCurrency((wallet.currentBalance - (wallet.pendingWithdrawal ?? 0))) : '—'}</p>
              </div>

              <div>
                <Label htmlFor="withdrawAccount">Conta para recebimento</Label>
                <Select value={withdrawAccountId || ''} onValueChange={(val) => setWithdrawAccountId(val)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {bankAccounts.length === 0 ? (
                      <SelectItem value="">Nenhuma conta cadastrada</SelectItem>
                    ) : (
                      bankAccounts.map(acc => (
                        <SelectItem key={acc.id} value={acc.id}>{`${acc.bankName} • ****${acc.accountNumber.slice(-4)} (${acc.accountHolder})`}</SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsWithdrawalDialogOpen(false)} disabled={withdrawing}>Cancelar</Button>
                <Button onClick={handleSubmitWithdrawal} disabled={withdrawing || !wallet}>
                  {withdrawing ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
                  Solicitar
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Filtro de período */}
        <div className="flex justify-between items-center mb-6">
          <Select value={timeRange} onValueChange={(value: "currentMonth" | "lastMonth" | "allTime") => setTimeRange(value)}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Selecione o período" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="currentMonth">Mês atual</SelectItem>
              <SelectItem value="lastMonth">Mês anterior</SelectItem>
              <SelectItem value="allTime">Todo o período</SelectItem>
            </SelectContent>
          </Select>
          
          <Button variant="outline">
            <Calendar className="h-4 w-4 mr-2" />
            Exportar relatório
          </Button>
        </div>

        {/* Cards de resumo */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8 items-stretch">
          <Card className="h-full">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center">
                <DollarSign className="h-4 w-4 mr-2" />
                Ganhos Brutos
              </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col justify-between">
              <div>
                <div className="text-2xl font-bold">{formatCurrency(billing.totalEarnings)}</div>
                <p className="text-sm text-muted-foreground mt-1">{billing.confirmedBookings} {billing.confirmedBookings === 1 ? 'reserva finalizada' : 'reservas finalizadas'}</p>
              </div>
            </CardContent>
          </Card>
          
          <Card className="h-full">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center">
                <Percent className="h-4 w-4 mr-2" />
                Taxa da Plataforma (5%)
              </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col justify-between">
              <div>
                <div className="text-2xl font-bold text-red-600">-{formatCurrency(billing.platformFee)}</div>
                <p className="text-sm text-muted-foreground mt-1">Comissão sobre os ganhos</p>
              </div>
            </CardContent>
          </Card>
          
          <Card className="h-full">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center">
                <Wallet className="h-4 w-4 mr-2" />
                Valor Líquido
              </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col justify-between">
              <div>
                <div className="text-2xl font-bold text-green-600">{formatCurrency(billing.netAmount)}</div>
                <p className="text-sm text-muted-foreground mt-1">Valor a receber</p>
              </div>
            </CardContent>
          </Card>
          
          {/* Wallet Summary Card */}
          <Card className="h-full">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center">
                <Wallet className="h-4 w-4 mr-2" />
                Carteira
              </CardTitle>
              <CardDescription className="text-sm text-muted-foreground">Saldo disponível e saques</CardDescription>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col justify-between">
              <div>
                <div className="text-2xl font-bold text-green-600">{wallet ? formatCurrency(wallet.currentBalance) : 'Carregando...'}</div>
                <p className="text-sm text-muted-foreground mt-1">Saldo disponível</p>
                <div className="mt-4">
                  <p className="text-xs text-muted-foreground">Pendentes: {wallet ? formatCurrency(wallet.pendingWithdrawal ?? 0) : '—'}</p>
                  <p className="text-xs text-muted-foreground">Total sacado: {wallet ? formatCurrency(wallet.totalWithdrawn ?? 0) : '—'}</p>
                </div>
              </div>
              <div className="flex justify-end pt-4">
                <Button variant="outline" onClick={handleOpenWithdrawalDialog} className="gap-2">
                  <DollarSign className="h-4 w-4 mr-2" />
                  Solicitar Saque
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Dados Bancários 
        <Card className="mb-8">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="flex items-center">
                <Building2 className="h-5 w-5 mr-2" />
                Dados Bancários
              </CardTitle>
              <CardDescription>
                Gerencie suas contas bancárias para receber pagamentos
              </CardDescription>
            </div>
            <Dialog open={isBankDialogOpen} onOpenChange={setIsBankDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={() => handleOpenBankDialog()}>
                  <Plus className="h-4 w-4 mr-2" />
                  Adicionar Conta
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                  <DialogTitle>
                    {isEditingBank ? 'Editar Conta Bancária' : 'Adicionar Conta Bancária'}
                  </DialogTitle>
                  <DialogDescription>
                    Preencha os dados da sua conta bancária para receber pagamentos
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="col-span-2">
                      <Label htmlFor="accountHolder">Titular da Conta *</Label>
                      <Input
                        id="accountHolder"
                        value={bankFormData.accountHolder}
                        onChange={(e) => setBankFormData(prev => ({ ...prev, accountHolder: e.target.value }))}
                        placeholder="Nome completo do titular"
                      />
                    </div>
                    
                    <div className="col-span-2">
                      <Label htmlFor="bankName">Banco *</Label>
                      <Select 
                        value={bankFormData.bankName} 
                        onValueChange={(value) => setBankFormData(prev => ({ ...prev, bankName: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o banco" />
                        </SelectTrigger>
                        <SelectContent>
                          {bankNames.map(bank => (
                            <SelectItem key={bank} value={bank}>{bank}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <Label htmlFor="accountNumber">Número da Conta *</Label>
                      <Input
                        id="accountNumber"
                        value={bankFormData.accountNumber}
                        onChange={(e) => setBankFormData(prev => ({ ...prev, accountNumber: e.target.value }))}
                        placeholder="Ex: 0000.0000.0000"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="branchCode">Código da Agência</Label>
                      <Input
                        id="branchCode"
                        value={bankFormData.branchCode}
                        onChange={(e) => setBankFormData(prev => ({ ...prev, branchCode: e.target.value }))}
                        placeholder="Ex: 0001"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="accountType">Tipo de Conta</Label>
                      <Select 
                        value={bankFormData.accountType} 
                        onValueChange={(value: BankAccount['accountType']) => setBankFormData(prev => ({ ...prev, accountType: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Conta Corrente">Conta Corrente</SelectItem>
                          <SelectItem value="Conta Poupança">Conta Poupança</SelectItem>
                          <SelectItem value="Conta Salário">Conta Salário</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <Label htmlFor="taxId">NIF (opcional)</Label>
                      <Input
                        id="taxId"
                        value={bankFormData.taxId}
                        onChange={(e) => setBankFormData(prev => ({ ...prev, taxId: e.target.value }))}
                        placeholder="Número de Identificação Fiscal"
                      />
                    </div>
                  </div>
                  
                  <div className="flex justify-end gap-2 pt-4">
                    <Button variant="outline" onClick={() => {
                      setIsBankDialogOpen(false);
                      resetBankForm();
                    }}>
                      Cancelar
                    </Button>
                    <Button onClick={handleSaveBankAccount} disabled={savingBank}>
                      {savingBank ? (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      ) : null}
                      {isEditingBank ? 'Atualizar' : 'Adicionar'}
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </CardHeader>
          <CardContent>
            {bankAccounts.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Building2 className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Você ainda não tem nenhuma conta bancária cadastrada.</p>
                <p className="text-sm">Adicione uma conta para receber seus pagamentos.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {bankAccounts.map((account) => (
                  <div 
                    key={account.id} 
                    className={`p-4 border rounded-lg flex items-center justify-between ${
                      account.isPrimary ? 'border-primary bg-primary/5' : ''
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <CreditCard className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-medium">{account.bankName}</p>
                          {account.isPrimary && (
                            <Badge variant="default" className="text-xs">
                              <Star className="h-3 w-3 mr-1" />
                              Principal
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {account.accountType} • ****{account.accountNumber.slice(-4)}
                        </p>
                        <p className="text-xs text-muted-foreground">{account.accountHolder}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {!account.isPrimary && (
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleSetPrimaryAccount(account.id)}
                        >
                          Definir como principal
                        </Button>
                      )}
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => handleOpenBankDialog(account)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => handleDeleteBankAccount(account.id)}
                        disabled={account.isPrimary && bankAccounts.length > 1}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
*/}
        {/* Tabela de reservas */}
        <Card>
          <CardHeader>
            <CardTitle>Detalhes das Reservas</CardTitle>
            <CardDescription>
              {billing.bookings.length} reserva(s) no período selecionado ({billing.period})
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Data</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Duração</TableHead>
                  <TableHead>Participantes</TableHead>
                  <TableHead className="text-right">Valor</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {billing.bookings.map((booking) => (
                  <TableRow key={booking.id}>
                    <TableCell className="font-medium">{booking.touristName}</TableCell>
                    <TableCell>
                      {new Date(booking.date).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant={
                          booking.status === 'Finalizado' ? 'default' : 
                          booking.status === 'Cancelado' ? 'destructive' : 'outline'
                        }
                      >
                        {booking.status}
                      </Badge>
                    </TableCell>
                    <TableCell>{booking.duration} dias</TableCell>
                    <TableCell>{booking.groupSize}</TableCell>
                    <TableCell className="text-right">
                      {booking.status === 'Finalizado' ? (
                        <span className="font-medium">{formatCurrency(booking.totalPrice)}</span>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Seção de pagamento
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Informações de Pagamento</CardTitle>
            <CardDescription>
              Como e quando você receberá seu pagamento
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <h3 className="font-medium mb-2 flex items-center">
                  <CreditCard className="h-4 w-4 mr-2" />
                  Método de Pagamento
                </h3>
                <p className="text-sm text-muted-foreground">
                  Os pagamentos são feitos via transferência bancária no final de cada mês para sua conta principal.
                </p>
                {bankAccounts.filter(a => a.isPrimary).length === 0 && (
                  <p className="text-sm text-destructive mt-2">
                    ⚠️ Você ainda não definiu uma conta bancária principal.
                  </p>
                )}
              </div>
              <div>
                <h3 className="font-medium mb-2 flex items-center">
                  <Banknote className="h-4 w-4 mr-2" />
                  Próximo Pagamento
                </h3>
                <p className="text-sm text-muted-foreground">
                  {billing.netAmount > 0 ? (
                    <>
                      <span className="font-medium">{formatCurrency(billing.netAmount)}</span> serão transferidos até o dia 5 do próximo mês.
                    </>
                  ) : (
                    "Nenhum pagamento pendente para este período."
                  )}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
 */}
        {billing.bookings.length === 0 && (
          <Card className="text-center py-12 mt-6">
            <CardContent>
              <DollarSign className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">Nenhuma reserva encontrada</h3>
              <p className="text-muted-foreground">
                {timeRange === 'currentMonth' 
                  ? 'Você ainda não tem reservas finalizadas este mês'
                  : `Não há reservas finalizadas no período selecionado`
                }
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default GuideBilling;
