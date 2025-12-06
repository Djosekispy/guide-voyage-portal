import { useState, useEffect } from 'react';
import  Header  from '@/components/Header';
import  AdminSidebar  from '@/components/AdminSidebar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import { Line, Bar, Pie } from 'react-chartjs-2';
import {
  getAllGuides,
  getAllPayments,
  getWithdrawalRequests,
  getAllWalletBalances,
  Payment,
  WithdrawalRequest,
  WalletBalance,
  Guide,
  getAllTourPackages,
} from '@/lib/firestore';
import {
  Users,
  TrendingUp,
  Wallet,
  Package,
  DollarSign,
  Activity,
} from 'lucide-react';
import { Timestamp } from 'firebase/firestore';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

export default function AdminAnalytics() {
  const [guides, setGuides] = useState<Guide[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [withdrawals, setWithdrawals] = useState<WithdrawalRequest[]>([]);
  const [wallets, setWallets] = useState<WalletBalance[]>([]);
  const [packages, setPackages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      setError('');
      const [guidesData, paymentsData, withdrawalsData, walletsData, packagesData] = await Promise.all([
        getAllGuides(),
        getAllPayments(),
        getWithdrawalRequests(),
        getAllWalletBalances(),
        getAllTourPackages(),
      ]);

      setGuides(guidesData);
      setPayments(paymentsData);
      setWithdrawals(withdrawalsData);
      setWallets(walletsData);
      setPackages(packagesData);
    } catch (err) {
      setError('Erro ao carregar analytics');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (timestamp: any) => {
    if (!timestamp) return '';
    const date = timestamp instanceof Timestamp ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString('pt-PT');
  };

  // Calculate Stats
  const stats = {
    totalGuides: guides.length,
    activeGuides: guides.filter(g => g.isActive).length,
    totalRevenue: payments
      .filter(p => p.status === 'completed')
      .reduce((sum, p) => sum + p.amount, 0),
    platformFees: payments
      .filter(p => p.status === 'completed')
      .reduce((sum, p) => sum + p.platformFee, 0),
    guideEarnings: payments
      .filter(p => p.status === 'completed')
      .reduce((sum, p) => sum + p.guideEarnings, 0),
    totalWithdrawn: withdrawals
      .filter(w => w.status === 'completed')
      .reduce((sum, w) => sum + w.amount, 0),
    pendingWithdrawals: withdrawals
      .filter(w => w.status === 'pending')
      .reduce((sum, w) => sum + w.amount, 0),
    approvedWithdrawals: withdrawals
      .filter(w => w.status === 'approved' || w.status === 'processing')
      .reduce((sum, w) => sum + w.amount, 0),
    totalBookings: payments.length,
    completedBookings: payments.filter(p => p.status === 'completed').length,
    totalPackages: packages.length,
    activePackages: packages.filter(p => p.isActive).length,
  };

  // Payment Status Distribution
  const paymentStatusData = {
    labels: ['Concluído', 'Pendente', 'Falhou', 'Reembolsado'],
    datasets: [
      {
        data: [
          payments.filter(p => p.status === 'completed').length,
          payments.filter(p => p.status === 'pending').length,
          payments.filter(p => p.status === 'failed').length,
          payments.filter(p => p.status === 'refunded').length,
        ],
        backgroundColor: ['#10b981', '#f59e0b', '#ef4444', '#3b82f6'],
        borderColor: ['#059669', '#d97706', '#dc2626', '#1d4ed8'],
        borderWidth: 2,
      },
    ],
  };

  // Withdrawal Status Distribution
  const withdrawalStatusData = {
    labels: ['Pendente', 'Aprovado', 'Processando', 'Concluído', 'Rejeitado'],
    datasets: [
      {
        data: [
          withdrawals.filter(w => w.status === 'pending').length,
          withdrawals.filter(w => w.status === 'approved').length,
          withdrawals.filter(w => w.status === 'processing').length,
          withdrawals.filter(w => w.status === 'completed').length,
          withdrawals.filter(w => w.status === 'rejected').length,
        ],
        backgroundColor: ['#f59e0b', '#3b82f6', '#8b5cf6', '#10b981', '#ef4444'],
        borderColor: ['#d97706', '#1d4ed8', '#6d28d9', '#059669', '#dc2626'],
        borderWidth: 2,
      },
    ],
  };

  // Revenue Over Time (últimos 7 dias)
  const getLast7DaysRevenue = () => {
    const last7Days = Array(7)
      .fill(0)
      .map((_, i) => {
        const date = new Date();
        date.setDate(date.getDate() - (6 - i));
        return date;
      });

    const labels = last7Days.map(d => d.toLocaleDateString('pt-PT', { month: '2-digit', day: '2-digit' }));
    const data = last7Days.map(d => {
      const dayStart = new Date(d);
      dayStart.setHours(0, 0, 0, 0);
      const dayEnd = new Date(d);
      dayEnd.setHours(23, 59, 59, 999);

      return payments
        .filter(p => {
          const paymentDate = p.createdAt instanceof Timestamp ? p.createdAt.toDate() : new Date(p.createdAt);
          return p.status === 'completed' && paymentDate >= dayStart && paymentDate <= dayEnd;
        })
        .reduce((sum, p) => sum + p.amount, 0);
    });

    return {
      labels,
      datasets: [
        {
          label: 'Receita Total',
          data,
          borderColor: '#3b82f6',
          backgroundColor: 'rgba(59, 130, 246, 0.1)',
          borderWidth: 2,
          tension: 0.4,
        },
      ],
    };
  };

  // Earnings Distribution
  const earningsData = {
    labels: ['Ganhos da Plataforma', 'Ganhos dos Guias'],
    datasets: [
      {
        data: [stats.platformFees, stats.guideEarnings],
        backgroundColor: ['#8b5cf6', '#10b981'],
        borderColor: ['#6d28d9', '#059669'],
        borderWidth: 2,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: true,
    plugins: {
      legend: {
        display: true,
        position: 'bottom' as const,
      },
    },
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="flex pt-16">
        <AdminSidebar />
        <main className="flex-1 md:ml-64">
          <div className="p-6 space-y-6">
            {/* Header */}
            <div>
              <h1 className="text-3xl font-bold">Analytics e Relatórios</h1>
              <p className="text-muted-foreground mt-2">Visualize dados e estatísticas do sistema</p>
            </div>

            {/* Error Alert */}
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {loading ? (
              <div className="text-center py-12">Carregando analytics...</div>
            ) : (
              <>
                {/* Key Stats */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium text-muted-foreground">Guias Ativos</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center gap-2">
                        <Users className="h-5 w-5 text-primary" />
                        <div>
                          <p className="text-2xl font-bold">{stats.activeGuides}</p>
                          <p className="text-xs text-muted-foreground">de {stats.totalGuides} total</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium text-muted-foreground">Receita Total</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center gap-2">
                        <DollarSign className="h-5 w-5 text-primary" />
                        <div>
                          <p className="text-2xl font-bold">{stats.totalRevenue.toFixed(0)} Kz</p>
                          <p className="text-xs text-muted-foreground">{stats.completedBookings} reservas</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium text-muted-foreground">Pacotes Ativos</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center gap-2">
                        <Package className="h-5 w-5 text-primary" />
                        <div>
                          <p className="text-2xl font-bold">{stats.activePackages}</p>
                          <p className="text-xs text-muted-foreground">de {stats.totalPackages} total</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium text-muted-foreground">Saques Pendentes</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center gap-2">
                        <Wallet className="h-5 w-5 text-yellow-600" />
                        <div>
                          <p className="text-2xl font-bold">{stats.pendingWithdrawals.toFixed(0)} Kz</p>
                          <p className="text-xs text-muted-foreground">Aprovados: {stats.approvedWithdrawals.toFixed(0)} Kz</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Revenue Details */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium text-muted-foreground">Ganhos dos Guias</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-2xl font-bold text-green-600">{stats.guideEarnings.toFixed(2)} Kz</p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium text-muted-foreground">Comissão da Plataforma</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-2xl font-bold text-purple-600">{stats.platformFees.toFixed(2)} Kz</p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium text-muted-foreground">Total Sacado</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-2xl font-bold text-blue-600">{stats.totalWithdrawn.toFixed(2)} Kz</p>
                    </CardContent>
                  </Card>
                </div>

                {/* Charts */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Revenue Over Time */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Receita - Últimos 7 Dias</CardTitle>
                      <CardDescription>Tendência de receita diária</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="h-80">
                        <Line data={getLast7DaysRevenue()} options={chartOptions} />
                      </div>
                    </CardContent>
                  </Card>

                  {/* Payment Status Distribution */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Status dos Pagamentos</CardTitle>
                      <CardDescription>Distribuição de pagamentos por status</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="h-80 flex items-center justify-center">
                        <Pie data={paymentStatusData} options={chartOptions} />
                      </div>
                    </CardContent>
                  </Card>

                  {/* Earnings Distribution */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Distribuição de Ganhos</CardTitle>
                      <CardDescription>Plataforma vs Guias</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="h-80 flex items-center justify-center">
                        <Pie data={earningsData} options={chartOptions} />
                      </div>
                    </CardContent>
                  </Card>

                  {/* Withdrawal Status Distribution */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Status dos Saques</CardTitle>
                      <CardDescription>Distribuição de solicitações de saque</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="h-80 flex items-center justify-center">
                        <Pie data={withdrawalStatusData} options={chartOptions} />
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Summary Tables */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Top Earning Guides */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Top Guias por Ganhos</CardTitle>
                      <CardDescription>Guias com mais ganhos</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {wallets
                          .sort((a, b) => b.totalEarnings - a.totalEarnings)
                          .slice(0, 5)
                          .map((wallet, idx) => (
                            <div key={wallet.id} className="flex justify-between items-center pb-2 border-b last:border-0">
                              <span className="text-sm font-medium">{idx + 1}. {wallet.guideName}</span>
                              <span className="text-sm font-bold text-green-600">{wallet.totalEarnings.toFixed(2)} Kz</span>
                            </div>
                          ))}
                        {wallets.length === 0 && (
                          <p className="text-sm text-muted-foreground">Nenhum dado disponível</p>
                        )}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Payment Method Distribution */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Métodos de Pagamento</CardTitle>
                      <CardDescription>Distribuição por tipo de pagamento</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {(() => {
                          const methods = new Map<string, number>();
                          payments.forEach(p => {
                            const method = p.paymentMethod || 'unknown';
                            methods.set(method, (methods.get(method) || 0) + 1);
                          });

                          const methodLabels: { [key: string]: string } = {
                            credit_card: 'Cartão de Crédito',
                            debit_card: 'Cartão de Débito',
                            bank_transfer: 'Transferência Bancária',
                            wallet: 'Carteira',
                            unknown: 'Desconhecido',
                          };

                          return Array.from(methods.entries())
                            .sort((a, b) => b[1] - a[1])
                            .map(([method, count]) => (
                              <div key={method} className="flex justify-between items-center pb-2 border-b last:border-0">
                                <span className="text-sm font-medium">{methodLabels[method]}</span>
                                <span className="text-sm font-bold">{count}</span>
                              </div>
                            ));
                        })()}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
