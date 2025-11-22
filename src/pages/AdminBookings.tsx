import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { collection, getDocs, doc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import AdminSidebar from "@/components/AdminSidebar";
import Header from "@/components/Header";
import { useToast } from "@/hooks/use-toast";
import { Booking } from "@/lib/firestore";

const AdminBookings = () => {
  const { userData, loading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [filteredBookings, setFilteredBookings] = useState<Booking[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!loading && userData?.userType !== 'admin') {
      navigate('/');
    }
  }, [userData, loading, navigate]);

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const bookingsSnap = await getDocs(collection(db, "bookings"));
        const bookingsData = bookingsSnap.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Booking[];
        setBookings(bookingsData);
        setFilteredBookings(bookingsData);
      } catch (error) {
        console.error("Erro ao buscar reservas:", error);
        toast({
          title: "Erro",
          description: "Não foi possível carregar as reservas",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };

    if (userData?.userType === 'admin') {
      fetchBookings();
    }
  }, [userData, toast]);

  useEffect(() => {
    if (statusFilter === "all") {
      setFilteredBookings(bookings);
    } else {
      setFilteredBookings(bookings.filter(b => b.status === statusFilter));
    }
  }, [statusFilter, bookings]);

  const handleStatusChange = async (bookingId: string, newStatus: string) => {
    try {
      await updateDoc(doc(db, "bookings", bookingId), { status: newStatus });
      setBookings(bookings.map(b => b.id === bookingId ? { ...b, status: newStatus as any } : b));
      toast({
        title: "Sucesso",
        description: "Status da reserva atualizado"
      });
    } catch (error) {
      console.error("Erro ao atualizar status:", error);
      toast({
        title: "Erro",
        description: "Não foi possível atualizar o status",
        variant: "destructive"
      });
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { variant: "default" | "secondary" | "destructive" | "outline", label: string }> = {
      pending: { variant: "secondary", label: "Pendente" },
      confirmed: { variant: "default", label: "Confirmada" },
      completed: { variant: "outline", label: "Concluída" },
      cancelled: { variant: "destructive", label: "Cancelada" }
    };
    const config = variants[status] || variants.pending;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  if (loading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="flex">
        <AdminSidebar />
        <main className="flex-1 lg:ml-64 p-6">
          <div className="max-w-7xl mx-auto space-y-6">
            <div>
              <h1 className="text-3xl font-bold">Gerenciar Reservas</h1>
              <p className="text-muted-foreground mt-2">
                Visualize e gerencie todas as reservas da plataforma
              </p>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Filtrar por Status</CardTitle>
              </CardHeader>
              <CardContent>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-[200px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas</SelectItem>
                    <SelectItem value="pending">Pendentes</SelectItem>
                    <SelectItem value="confirmed">Confirmadas</SelectItem>
                    <SelectItem value="completed">Concluídas</SelectItem>
                    <SelectItem value="cancelled">Canceladas</SelectItem>
                  </SelectContent>
                </Select>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Reservas ({filteredBookings.length})</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Turista</TableHead>
                      <TableHead>Guia</TableHead>
                      <TableHead>Pacote</TableHead>
                      <TableHead>Data</TableHead>
                      <TableHead>Pessoas</TableHead>
                      <TableHead>Valor</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredBookings.map((booking) => (
                      <TableRow key={booking.id}>
                        <TableCell className="font-medium">{booking.touristName}</TableCell>
                        <TableCell>{booking.guideName}</TableCell>
                        <TableCell>{booking.packageName}</TableCell>
                        <TableCell>
                          {booking.date && typeof booking.date === 'object' && 'seconds' in booking.date
                            ? format(new Date(booking.date.seconds * 1000), "dd/MM/yyyy", { locale: ptBR })
                            : "-"}
                        </TableCell>
                        <TableCell>{booking.numberOfPeople}</TableCell>
                        <TableCell>{booking.totalPrice?.toLocaleString('pt-AO')} Kz</TableCell>
                        <TableCell>{getStatusBadge(booking.status)}</TableCell>
                        <TableCell>
                          <Select
                            value={booking.status}
                            onValueChange={(value) => handleStatusChange(booking.id, value)}
                          >
                            <SelectTrigger className="w-[130px]">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="pending">Pendente</SelectItem>
                              <SelectItem value="confirmed">Confirmada</SelectItem>
                              <SelectItem value="completed">Concluída</SelectItem>
                              <SelectItem value="cancelled">Cancelada</SelectItem>
                            </SelectContent>
                          </Select>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminBookings;
