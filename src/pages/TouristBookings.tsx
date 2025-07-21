
import { useState } from "react";
import { Calendar, Clock, MapPin, User, Phone, Mail, Star, MessageSquare, X } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Header from "@/components/Header";

const TouristBookings = () => {
  const [bookings] = useState([
    {
      id: 1,
      guideName: "Maria Santos",
      guideImage: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face",
      tourTitle: "Tour Histórico pela Fortaleza de São Miguel",
      date: "2024-01-25",
      time: "09:00",
      duration: "4 horas",
      city: "Luanda",
      status: "confirmada",
      price: "60.000 Kz",
      phone: "+244 923 456 789",
      email: "maria.santos@email.com",
      participants: 2,
      createdAt: "2024-01-15"
    },
    {
      id: 2,
      guideName: "Carlos Mbala",
      guideImage: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
      tourTitle: "Aventura no Deserto do Namibe",
      date: "2024-02-05",
      time: "07:00",
      duration: "1 dia",
      city: "Namibe",
      status: "pendente",
      price: "200.000 Kz",
      phone: "+244 934 567 890",
      email: "carlos.mbala@email.com",
      participants: 4,
      createdAt: "2024-01-20"
    },
    {
      id: 3,
      guideName: "Ana Pereira",
      guideImage: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face",
      tourTitle: "Passeio pelas Curvas da Serra da Leba",
      date: "2024-01-10",
      time: "14:00",
      duration: "6 horas",
      city: "Lubango",
      status: "concluida",
      price: "150.000 Kz",
      phone: "+244 945 678 901",
      email: "ana.pereira@email.com",
      participants: 3,
      createdAt: "2024-01-05"
    },
    {
      id: 4,
      guideName: "João Fernandes",
      guideImage: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
      tourTitle: "Exploração das Quedas de Kalandula",
      date: "2024-01-08",
      time: "08:00",
      duration: "1 dia",
      city: "Malanje",
      status: "concluida",
      price: "120.000 Kz",
      phone: "+244 956 789 012",
      email: "joao.fernandes@email.com",
      participants: 2,
      createdAt: "2024-01-01"
    },
    {
      id: 5,
      guideName: "Isabel Kimbo",
      guideImage: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop&crop=face",
      tourTitle: "Tour pelas Praias de Benguela",
      date: "2023-12-20",
      time: "10:00",
      duration: "5 horas",
      city: "Benguela",
      status: "cancelada",
      price: "90.000 Kz",
      phone: "+244 967 890 123",
      email: "isabel.kimbo@email.com",
      participants: 2,
      createdAt: "2023-12-15"
    }
  ]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmada': return 'default';
      case 'pendente': return 'secondary';
      case 'concluida': return 'default';
      case 'cancelada': return 'destructive';
      default: return 'secondary';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'confirmada': return 'Confirmada';
      case 'pendente': return 'Pendente';
      case 'concluida': return 'Concluída';
      case 'cancelada': return 'Cancelada';
      default: return status;
    }
  };

  const filterBookings = (status: string) => {
    if (status === 'todas') return bookings;
    return bookings.filter(booking => booking.status === status);
  };

  const BookingCard = ({ booking }: { booking: any }) => (
    <Card className="mb-4">
      <CardContent className="p-6">
        <div className="flex flex-col md:flex-row gap-6">
          <Avatar className="w-16 h-16 mx-auto md:mx-0">
            <AvatarImage src={booking.guideImage} />
            <AvatarFallback>{booking.guideName.split(' ').map((n: string) => n[0]).join('')}</AvatarFallback>
          </Avatar>
          
          <div className="flex-1">
            <div className="flex flex-col md:flex-row md:items-start md:justify-between mb-4">
              <div>
                <h3 className="text-xl font-semibold mb-1">{booking.tourTitle}</h3>
                <p className="text-muted-foreground mb-2">Guia: {booking.guideName}</p>
                <Badge variant={getStatusColor(booking.status)}>
                  {getStatusText(booking.status)}
                </Badge>
              </div>
              <div className="text-right mt-4 md:mt-0">
                <p className="text-2xl font-bold text-primary">{booking.price}</p>
                <p className="text-sm text-muted-foreground">{booking.participants} participante{booking.participants !== 1 ? 's' : ''}</p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div className="flex items-center gap-2 text-sm">
                <MapPin className="w-4 h-4 text-muted-foreground" />
                <span>{booking.city}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="w-4 h-4 text-muted-foreground" />
                <span>{booking.date}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Clock className="w-4 h-4 text-muted-foreground" />
                <span>{booking.time} - {booking.duration}</span>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div className="flex items-center gap-2 text-sm">
                <Phone className="w-4 h-4 text-muted-foreground" />
                <span>{booking.phone}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Mail className="w-4 h-4 text-muted-foreground" />
                <span>{booking.email}</span>
              </div>
            </div>
            
            <div className="flex flex-wrap gap-2">
              {booking.status === 'pendente' && (
                <>
                  <Button variant="outline" size="sm">
                    <MessageSquare className="w-4 h-4 mr-2" />
                    Mensagem
                  </Button>
                  <Button variant="destructive" size="sm">
                    <X className="w-4 h-4 mr-2" />
                    Cancelar
                  </Button>
                </>
              )}
              
              {booking.status === 'confirmada' && (
                <>
                  <Button variant="outline" size="sm">
                    <MessageSquare className="w-4 h-4 mr-2" />
                    Mensagem
                  </Button>
                  <Button variant="outline" size="sm">
                    Ver Detalhes
                  </Button>
                </>
              )}
              
              {booking.status === 'concluida' && (
                <>
                  <Button variant="hero" size="sm">
                    <Star className="w-4 h-4 mr-2" />
                    Avaliar
                  </Button>
                  <Button variant="outline" size="sm">
                    Contratar Novamente
                  </Button>
                </>
              )}
              
              {booking.status === 'cancelada' && (
                <Button variant="outline" size="sm">
                  <User className="w-4 h-4 mr-2" />
                  Ver Perfil do Guia
                </Button>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="pt-24 container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Minhas Reservas</h1>
          <p className="text-muted-foreground">Gerencie todas as suas reservas de tours</p>
        </div>

        <Tabs defaultValue="todas" className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="todas">Todas</TabsTrigger>
            <TabsTrigger value="pendente">Pendentes</TabsTrigger>
            <TabsTrigger value="confirmada">Confirmadas</TabsTrigger>
            <TabsTrigger value="concluida">Concluídas</TabsTrigger>
            <TabsTrigger value="cancelada">Canceladas</TabsTrigger>
          </TabsList>
          
          <TabsContent value="todas" className="mt-6">
            <div className="space-y-4">
              {filterBookings('todas').map((booking) => (
                <BookingCard key={booking.id} booking={booking} />
              ))}
            </div>
          </TabsContent>
          
          <TabsContent value="pendente" className="mt-6">
            <div className="space-y-4">
              {filterBookings('pendente').map((booking) => (
                <BookingCard key={booking.id} booking={booking} />
              ))}
              {filterBookings('pendente').length === 0 && (
                <div className="text-center py-16">
                  <Calendar className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-xl font-semibold mb-2">Nenhuma reserva pendente</h3>
                  <p className="text-muted-foreground">Suas próximas reservas aparecerão aqui</p>
                </div>
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="confirmada" className="mt-6">
            <div className="space-y-4">
              {filterBookings('confirmada').map((booking) => (
                <BookingCard key={booking.id} booking={booking} />
              ))}
              {filterBookings('confirmada').length === 0 && (
                <div className="text-center py-16">
                  <Calendar className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-xl font-semibold mb-2">Nenhuma reserva confirmada</h3>
                  <p className="text-muted-foreground">Suas reservas confirmadas aparecerão aqui</p>
                </div>
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="concluida" className="mt-6">
            <div className="space-y-4">
              {filterBookings('concluida').map((booking) => (
                <BookingCard key={booking.id} booking={booking} />
              ))}
              {filterBookings('concluida').length === 0 && (
                <div className="text-center py-16">
                  <Star className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-xl font-semibold mb-2">Nenhum tour concluído</h3>
                  <p className="text-muted-foreground">Seus tours concluídos aparecerão aqui</p>
                </div>
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="cancelada" className="mt-6">
            <div className="space-y-4">
              {filterBookings('cancelada').map((booking) => (
                <BookingCard key={booking.id} booking={booking} />
              ))}
              {filterBookings('cancelada').length === 0 && (
                <div className="text-center py-16">
                  <X className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-xl font-semibold mb-2">Nenhuma reserva cancelada</h3>
                  <p className="text-muted-foreground">Reservas canceladas aparecerão aqui</p>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default TouristBookings;
