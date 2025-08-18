import { useEffect, useState } from "react";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Calendar, DollarSign, CreditCard, Banknote, Percent, Wallet } from "lucide-react";
import GuideSidebar from "@/components/GuideSidebar";
import { useAuth } from "@/contexts/AuthContext";
import { Booking, getGuideBookings, subscribeToGuideBookings } from "@/lib/firestore";
import { toast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

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

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      if (!user?.uid) return;

      // Carregar reservas
      const guideBookings = await getGuideBookings(user.uid);
      setBookings(guideBookings);

      // Configurar listener em tempo real para reservas
      const unsubscribe = subscribeToGuideBookings(user.uid, (updatedBookings) => {
        setBookings(updatedBookings);
      });

      return () => unsubscribe();
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
    // Calcular faturamento com base no período selecionado
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
    const platformFee = totalEarnings * 0.05; // 5% de comissão
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

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <GuideSidebar />
      
      <div className="flex-1 lg:ml-64 px-4 pt-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Faturamento</h1>
          <p className="text-muted-foreground">Acompanhe seus ganhos e taxas</p>
        </div>

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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center">
                <DollarSign className="h-4 w-4 mr-2" />
                Ganhos Brutos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(billing.totalEarnings)}</div>
              <p className="text-sm text-muted-foreground mt-1">
                {billing.confirmedBookings} {billing.confirmedBookings === 1 ? 'reserva finalizada' : 'reservas finalizadas'}
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center">
                <Percent className="h-4 w-4 mr-2" />
                Taxa da Plataforma (5%)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">-{formatCurrency(billing.platformFee)}</div>
              <p className="text-sm text-muted-foreground mt-1">
                Comissão sobre os ganhos
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center">
                <Wallet className="h-4 w-4 mr-2" />
                Valor Líquido
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{formatCurrency(billing.netAmount)}</div>
              <p className="text-sm text-muted-foreground mt-1">
                Valor a receber
              </p>
            </CardContent>
          </Card>
        </div>

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

        {/* Seção de pagamento */}
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
                  Os pagamentos são feitos via transferência bancária no final de cada mês.
                </p>
                <Button variant="link" className="pl-0 mt-2">
                  Atualizar dados bancários
                </Button>
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