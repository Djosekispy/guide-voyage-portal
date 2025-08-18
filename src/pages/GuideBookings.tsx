
import { useEffect, useState } from "react";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar, Clock, User, MapPin, Phone, Mail, Check, X, CalendarHeart } from "lucide-react";
import GuideSidebar from "@/components/GuideSidebar";
import { useAuth } from "@/contexts/AuthContext";
import { Booking, getGuideBookings, subscribeToGuideBookings } from "@/lib/firestore";
import { toast } from "@/hooks/use-toast";

const GuideBookings = () => {
  const [statusFilter, setStatusFilter] = useState("todas");
  const {user, userData } = useAuth()
  
   const [bookings, setBookings] = useState<Booking[]>([]);
    const [loading, setLoading] = useState(true);

  const handleStatusChange = (bookingId: string, newStatus: Booking['status']) => {
    setBookings(bookings.map(booking => 
      booking.id === bookingId 
        ? { ...booking, status: newStatus }
        : booking
    ));
  };

  const filteredBookings = bookings.filter(booking => 
    statusFilter === "todas" || booking.status === statusFilter
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pendente': return 'bg-yellow-100 text-yellow-800';
      case 'confirmado': return 'bg-green-100 text-green-800';
      case 'cancelado': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const stats = {
    total: bookings.length,
    pendente: bookings.filter(b => b.status === 'Pendente').length,
    confirmado: bookings.filter(b => b.status === 'Confirmado').length,
    cancelado: bookings.filter(b => b.status === 'Cancelado').length
  };

  useEffect(() => {
    if (user && userData?.userType === 'guide') {
      loadDashboardData();
    }
  }, [user, userData]);

  

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      if (!user?.uid) return;


      if (user) {
        // Carregar reservas
        const guideBookings = await getGuideBookings(user.uid);
        setBookings(guideBookings);

        // Configurar listener em tempo real para reservas
        const unsubscribe = subscribeToGuideBookings(user.uid, (updatedBookings) => {
          setBookings(updatedBookings);
        });

        return () => unsubscribe();
      }
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os dados do dashboard",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="min-h-screen bg-background">
     <Header />
         <GuideSidebar />
        
    <div  className="flex-1 lg:ml-64 px-4 pt-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Reservas Recebidas</h1>
          <p className="text-muted-foreground">Gerencie as reservas dos seus passeios</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total de Reservas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Pendentes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">{stats.pendente}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Confirmadas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.confirmado}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Canceladas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{stats.cancelado}</div>
            </CardContent>
          </Card>
        </div>

        {/* Filter */}
        <div className="flex justify-between items-center mb-6">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Filtrar por status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todas">Todas as reservas</SelectItem>
              <SelectItem value="pendente">Pendentes</SelectItem>
              <SelectItem value="confirmado">Confirmadas</SelectItem>
              <SelectItem value="cancelado">Canceladas</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Bookings Table */}
        <Card>
          <CardHeader>
            <CardTitle>Lista de Reservas</CardTitle>
            <CardDescription>
              {filteredBookings.length} reserva(s) encontrada(s)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Turista</TableHead>
                  <TableHead>Passeio</TableHead>
                  <TableHead>Data & Hora</TableHead>
                  <TableHead>Participantes</TableHead>
                  <TableHead>Valor Total</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredBookings.map((booking) => (
                  <TableRow key={booking.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{booking.touristName}</div>
                        <div className="text-sm text-muted-foreground flex items-center gap-1">
                          <Mail className="h-3 w-3" />
                          {booking.touristEmail}
                        </div>
                        <div className="text-sm text-muted-foreground flex items-center gap-1">
                          <CalendarHeart className="h-3 w-3" />
                          {booking.duration} dias
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        {booking.city}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <div>{booking.date}</div>
                          <div className="text-sm text-muted-foreground">{booking.time}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <User className="h-4 w-4 text-muted-foreground" />
                        {booking.groupSize}
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">
                      {booking.totalPrice.toLocaleString()} Kz
                    </TableCell>
                    <TableCell>
                      <div className={`px-2 py-1 rounded-full text-xs inline-block ${getStatusColor(booking.status)}`}>
                        {booking.status}
                      </div>
                    </TableCell>
                    <TableCell>
                      {booking.status === 'Pendente' && (
                        <div className="flex gap-2">
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => handleStatusChange(booking.id, 'Confirmado')}
                            className="text-green-600 hover:text-green-700"
                          >
                            <Check className="h-3 w-3" />
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => handleStatusChange(booking.id, 'Cancelado')}
                            className="text-red-600 hover:text-red-700"
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {filteredBookings.length === 0 && (
          <Card className="text-center py-12 mt-6">
            <CardContent>
              <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">Nenhuma reserva encontrada</h3>
              <p className="text-muted-foreground">
                {statusFilter === 'todas' 
                  ? 'Você ainda não recebeu nenhuma reserva'
                  : `Não há reservas com status "${statusFilter}"`
                }
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default GuideBookings;
