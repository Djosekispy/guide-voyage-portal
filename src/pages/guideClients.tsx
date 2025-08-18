import { useEffect, useState } from "react";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar, Clock, User, MapPin, Phone, Mail, Check, X, Star, Flag, Send, FileText } from "lucide-react";
import GuideSidebar from "@/components/GuideSidebar";
import { useAuth } from "@/contexts/AuthContext";
import { Booking, getGuideBookings, subscribeToGuideBookings, Review, getGuideReviews } from "@/lib/firestore";
import { toast } from "@/hooks/use-toast";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";

interface ClientSummary {
  touristId: string;
  touristName: string;
  touristEmail: string;
  touristPhone?: string;
  touristPhotoURL?: string;
  totalBookings: number;
  completedBookings: number;
  canceledBookings: number;
  lastBookingDate: string;
  averageRating?: number;
  reviews: Review[];
  bookings: Booking[];
}

const GuideClients = () => {
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">("all");
  const { user, userData } = useAuth();
  const [clients, setClients] = useState<ClientSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  
  // Estados para os modais
  const [contactModalOpen, setContactModalOpen] = useState(false);
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState<ClientSummary | null>(null);
  const [message, setMessage] = useState("");
  const [reportType, setReportType] = useState("feedback");
  const [reportDetails, setReportDetails] = useState("");

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      if (!user?.uid) return;

      // Carregar reservas
      const guideBookings = await getGuideBookings(user.uid);
      setBookings(guideBookings);

      // Carregar avaliações
      const guideReviews = await getGuideReviews(user.uid);
      setReviews(guideReviews);

      // Configurar listeners em tempo real
      const unsubscribeBookings = subscribeToGuideBookings(user.uid, (updatedBookings) => {
        setBookings(updatedBookings);
      });

      return () => {
        unsubscribeBookings();
      };
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os dados dos clientes",
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
    // Processar dados para criar resumo dos clientes
    if (bookings.length > 0 || reviews.length > 0) {
      const clientsMap = new Map<string, ClientSummary>();

      // Processar reservas
      bookings.forEach(booking => {
        if (!clientsMap.has(booking.touristId)) {
          clientsMap.set(booking.touristId, {
            touristId: booking.touristId,
            touristName: booking.touristName,
            touristEmail: booking.touristEmail,
            touristPhone: booking?.touristPhone || "",
            totalBookings: 0,
            completedBookings: 0,
            canceledBookings: 0,
            lastBookingDate: booking.date,
            reviews: [],
            bookings: [],
          });
        }

        const client = clientsMap.get(booking.touristId)!;
        client.totalBookings += 1;
        client.bookings.push(booking);
        
        if (booking.status === 'Finalizado') {
          client.completedBookings += 1;
        } else if (booking.status === 'Cancelado') {
          client.canceledBookings += 1;
        }

        if (new Date(booking.date) > new Date(client.lastBookingDate)) {
          client.lastBookingDate = booking.date;
        }
      });

      // Processar avaliações
      reviews.forEach(review => {
        if (clientsMap.has(review.touristId)) {
          const client = clientsMap.get(review.touristId)!;
          client.reviews.push(review);
        }
      });

      // Calcular avaliação média para cada cliente
      clientsMap.forEach(client => {
        if (client.reviews.length > 0) {
          const totalRating = client.reviews.reduce((sum, review) => sum + review.rating, 0);
          client.averageRating = parseFloat((totalRating / client.reviews.length).toFixed(1));
        }
      });

      setClients(Array.from(clientsMap.values()));
    }
  }, [bookings, reviews]);

  const filteredClients = clients.filter(client => {
    if (statusFilter === "all") return true;
    if (statusFilter === "active") return client.completedBookings > 0;
    if (statusFilter === "inactive") return client.completedBookings === 0;
    return true;
  });

  const stats = {
    total: clients.length,
    active: clients.filter(c => c.completedBookings > 0).length,
    inactive: clients.filter(c => c.completedBookings === 0).length,
    repeat: clients.filter(c => c.totalBookings > 1).length,
  };

  const getClientActivity = (client: ClientSummary) => {
    if (client.completedBookings > 0) return "Ativo";
    if (client.canceledBookings > 0) return "Cancelou";
    return "Novo";
  };

  const getActivityColor = (activity: string) => {
    switch (activity) {
      case 'Ativo': return 'bg-green-100 text-green-800';
      case 'Cancelou': return 'bg-red-100 text-red-800';
      default: return 'bg-blue-100 text-blue-800';
    }
  };

  // Funções para manipulação dos modais
  const openContactModal = (client: ClientSummary) => {
    setSelectedClient(client);
    setMessage("");
    setContactModalOpen(true);
  };

  const openReportModal = (client: ClientSummary) => {
    setSelectedClient(client);
    setReportType("feedback");
    setReportDetails("");
    setReportModalOpen(true);
  };

  const handleSendMessage = () => {
    // Aqui você implementaria o envio da mensagem
    toast({
      title: "Mensagem enviada",
      description: `Mensagem enviada para ${selectedClient?.touristName}`,
    });
    setContactModalOpen(false);
  };

  const handleSubmitReport = () => {
    // Aqui você implementaria o envio do relatório
    toast({
      title: "Relatório enviado",
      description: `Relatório sobre ${selectedClient?.touristName} foi registrado`,
    });
    setReportModalOpen(false);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <GuideSidebar />
      
      <div className="flex-1 lg:ml-64 px-4 pt-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Meus Clientes</h1>
          <p className="text-muted-foreground">Visualize e gerencie seus clientes</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total de Clientes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Clientes Ativos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.active}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Clientes Inativos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">{stats.inactive}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Clientes Recorrentes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{stats.repeat}</div>
            </CardContent>
          </Card>
        </div>

        {/* Filter */}
        <div className="flex justify-between items-center mb-6">
          <Select value={statusFilter} onValueChange={(value: "all" | "active" | "inactive") => setStatusFilter(value)}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Filtrar por status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os clientes</SelectItem>
              <SelectItem value="active">Clientes ativos</SelectItem>
              <SelectItem value="inactive">Clientes inativos</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Clients Table */}
        <Card>
          <CardHeader>
            <CardTitle>Lista de Clientes</CardTitle>
            <CardDescription>
              {filteredClients.length} cliente(s) encontrado(s)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Reservas</TableHead>
                  <TableHead>Última Reserva</TableHead>
                  <TableHead>Avaliação</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredClients.map((client) => {
                  const activity = getClientActivity(client);
                  return (
                    <TableRow key={client.touristId}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar>
                            <AvatarImage src={client.touristPhotoURL} />
                            <AvatarFallback>
                              {client.touristName.charAt(0).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-medium">{client.touristName}</div>
                            <div className="text-sm text-muted-foreground flex items-center gap-1">
                              <Mail className="h-3 w-3" />
                              {client.touristEmail}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <div>Total: {client.totalBookings}</div>
                          <div className="text-sm text-green-600">
                            Concluídas: {client.completedBookings}
                          </div>
                          <div className="text-sm text-red-600">
                            Canceladas: {client.canceledBookings}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          {new Date(client.lastBookingDate).toLocaleDateString()}
                        </div>
                      </TableCell>
                      <TableCell>
                        {client.averageRating ? (
                          <div className="flex items-center gap-1">
                            <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                            <span>{client.averageRating}</span>
                            <span className="text-muted-foreground text-sm">
                              ({client.reviews.length} {client.reviews.length === 1 ? 'avaliação' : 'avaliações'})
                            </span>
                          </div>
                        ) : (
                          <span className="text-muted-foreground">Sem avaliações</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className={`px-2 py-1 rounded-full text-xs inline-block ${getActivityColor(activity)}`}>
                          {activity}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => openContactModal(client)}
                          >
                            <Mail className="h-4 w-4 mr-1" />
                            Contatar
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => openReportModal(client)}
                          >
                            <Flag className="h-4 w-4 mr-1" />
                            Relatório
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {filteredClients.length === 0 && (
          <Card className="text-center py-12 mt-6">
            <CardContent>
              <User className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">Nenhum cliente encontrado</h3>
              <p className="text-muted-foreground">
                {statusFilter === 'all' 
                  ? 'Você ainda não tem clientes registrados'
                  : `Não há clientes com status "${statusFilter === 'active' ? 'ativos' : 'inativos'}"`
                }
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Modal de Contato */}
      <Dialog open={contactModalOpen} onOpenChange={setContactModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Enviar mensagem para {selectedClient?.touristName}</DialogTitle>
            <DialogDescription>
              Esta mensagem será enviada por e-mail para o cliente.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="email" className="text-right">
                Para
              </Label>
              <Input
                id="email"
                defaultValue={selectedClient?.touristEmail}
                className="col-span-3"
                disabled
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="subject" className="text-right">
                Assunto
              </Label>
              <Input
                id="subject"
                defaultValue={`Mensagem de ${userData?.name}`}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="message" className="text-right">
                Mensagem
              </Label>
              <Textarea
                id="message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="col-span-3"
                rows={5}
                placeholder="Escreva sua mensagem aqui..."
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setContactModalOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" onClick={handleSendMessage}>
              <Send className="h-4 w-4 mr-2" />
              Enviar Mensagem
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal de Relatório */}
      <Dialog open={reportModalOpen} onOpenChange={setReportModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Criar relatório sobre {selectedClient?.touristName}</DialogTitle>
            <DialogDescription>
              Registre observações sobre este cliente para sua referência futura.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="client" className="text-right">
                Cliente
              </Label>
              <div className="col-span-3 flex items-center gap-2">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={selectedClient?.touristPhotoURL} />
                  <AvatarFallback>
                    {selectedClient?.touristName.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <div>{selectedClient?.touristName}</div>
                  <div className="text-sm text-muted-foreground">
                    {selectedClient?.touristEmail}
                  </div>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="type" className="text-right">
                Tipo
              </Label>
              <div className="col-span-3 flex gap-2">
                <Badge
                  variant={reportType === "feedback" ? "default" : "outline"}
                  onClick={() => setReportType("feedback")}
                  className="cursor-pointer"
                >
                  Feedback
                </Badge>
                <Badge
                  variant={reportType === "issue" ? "default" : "outline"}
                  onClick={() => setReportType("issue")}
                  className="cursor-pointer"
                >
                  Problema
                </Badge>
                <Badge
                  variant={reportType === "compliment" ? "default" : "outline"}
                  onClick={() => setReportType("compliment")}
                  className="cursor-pointer"
                >
                  Elogio
                </Badge>
              </div>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="details" className="text-right">
                Detalhes
              </Label>
              <Textarea
                id="details"
                value={reportDetails}
                onChange={(e) => setReportDetails(e.target.value)}
                className="col-span-3"
                rows={5}
                placeholder="Descreva os detalhes do relatório..."
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setReportModalOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" onClick={handleSubmitReport}>
              <FileText className="h-4 w-4 mr-2" />
              Salvar Relatório
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default GuideClients;