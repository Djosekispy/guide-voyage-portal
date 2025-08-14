import { useEffect, useState } from "react";
import { Calendar, Clock, MapPin, User, Phone, Mail, Star, MessageSquare, X, Loader } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Header from "@/components/Header";
import { Booking, getGuideProfile, getTouristBookings, updateBookingStatus } from "@/lib/firestore";
import { useAuth } from "@/contexts/AuthContext";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";

const TouristBookings = () => {
 const [bookings, setBookings] = useState<any>([]);
const [loading, setLoading] = useState(true);
const [isChanging, setLsChanging] = useState(false);
const { user } = useAuth();
const navigate = useNavigate();
   const handleMessageGuide = (id:string, name: string, photoURL : string) => {
    navigate(`/mensagens?guideId=${id}&guideName=${encodeURIComponent(name)}&guidePhotoURL=${encodeURIComponent(photoURL || '')}`);
  };

const modifyBookingStatus = async (bookingId: string, newStatus: Booking["status"]) => {
  try {
    setLsChanging(true);
    await updateBookingStatus(bookingId, newStatus);
    toast.success("Status da reserva atualizado com sucesso!");
  } catch (error) {
    console.error(error);
    toast.error("Erro ao atualizar o status da reserva.");
  } finally {
    setLsChanging(false);
  }
};


useEffect(() => {
  const fetchBookingsWithGuideInfo = async () => {
    try {
      const bookingsData = await getTouristBookings(user.uid);
      
      const bookingsWithGuideInfo = await Promise.all(
        bookingsData.map(async (booking) => {
          if (booking.guideId) {
            const guide = await getGuideProfile(booking.guideId);
            return {
              ...booking,
              guidePhotoURL: guide?.photoURL,
              guideRating: guide?.rating,
              guideDescription: guide?.description,
              phone: guide?.phone,
              email: guide?.email
            };
          }
          return booking;
        })
      );
      
      setBookings(bookingsWithGuideInfo);
    } catch (error) {
      console.error("Error fetching bookings:", error);
    } finally {
      setLoading(false);
    }
  };

  fetchBookingsWithGuideInfo();
}, [user.uid]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Confirmado': return 'default';
      case 'Pendente': return 'secondary';
      case 'Finalizado': return 'default';
      case 'Cancelado': return 'destructive';
      default: return 'secondary';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'confirmada': return 'Confirmado';
      case 'pendente': return 'Pendente';
      case 'concluida': return 'Finalizado';
      case 'cancelada': return 'Cancelado';
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
             <p className="text-2xl font-bold text-primary">
              {new Intl.NumberFormat('pt-AO', {
                style: 'currency',
                currency: 'AOA',
                minimumFractionDigits: 0,
              }).format(booking.totalPrice)}
            </p>
                <p className="text-sm text-muted-foreground">{booking.groupSize} participante{booking.groupSize !== 1 ? 's' : ''}</p>
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
                <span>{booking.time} - {booking.duration} horas</span>
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
              {booking.status === 'Pendente' && (
                <>
               {user?.uid && 
                  <Button variant="outline" onClick={() => handleMessageGuide(booking.guideId, booking.guideName, booking.guidePhotoURL)}>
                                            <MessageSquare className="h-4 w-4 mr-2" />
                                            Mensagem
                                          </Button>}
                                <Button
                disabled={isChanging}
                variant="destructive"
                size="sm"
                onClick={() => modifyBookingStatus(booking.id, 'Cancelado')}
              >
                {isChanging ? (
                  <>
                    <Loader className="w-4 h-4 mr-2 animate-spin" />
                    Processando...
                  </>
                ) : (
                  <>
                    <X className="w-4 h-4 mr-2" />
                    Cancelar
                  </>
                )}
              </Button>

                </>
              )}
              
              {booking.status === 'Confirmado' && (
                <>
                 {user?.uid && 
                  <Button variant="outline" onClick={() => handleMessageGuide(booking.guideId, booking.guideName, booking.guidePhotoURL)}>
                                            <MessageSquare className="h-4 w-4 mr-2" />
                                            Mensagem
                                          </Button>}
                  <Button variant="outline" size="sm">
                    Ver Detalhes
                  </Button>
                </>
              )}
              
              {booking.status === 'Finalizado' && (
                <>
                 <Link  to={`/guias/${booking.guideId}/pacotes`}>
                  <Button variant="outline" size="sm">
                    Contratar Novamente
                  </Button>
                  </Link>
                </>
              )}
              
              {booking.status === 'Cancelado' && (
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

         {loading ? (
      <div className="flex flex-col items-center justify-center space-y-4">

        <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        
        <div className="w-full space-y-4 hidden md:block">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-gray-100 rounded-lg p-6 animate-pulse">
              <div className="flex space-x-4">
                <div className="w-24 h-24 bg-gray-300 rounded-full"></div>
                <div className="flex-1 space-y-3">
                  <div className="h-6 bg-gray-300 rounded w-3/4"></div>
                  <div className="h-4 bg-gray-300 rounded w-1/2"></div>
                  <div className="h-4 bg-gray-300 rounded w-2/3"></div>
                  <div className="h-4 bg-gray-300 rounded"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        <p className="text-gray-600">Um momento estamos carregando seus dados...</p>
      </div>
    ) 
       
       : <Tabs defaultValue="todas" className="w-full">
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
              {filterBookings('Pendente').map((booking) => (
                <BookingCard key={booking.id} booking={booking} />
              ))}
              {filterBookings('Pendente').length === 0 && (
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
              {filterBookings('Confirmado').map((booking) => (
                <BookingCard key={booking.id} booking={booking} />
              ))}
              {filterBookings('Confirmado').length === 0 && (
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
              {filterBookings('Finalizado').map((booking) => (
                <BookingCard key={booking.id} booking={booking} />
              ))}
              {filterBookings('Finalizado').length === 0 && (
                <div className="text-center py-16">
                  <Star className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-xl font-semibold mb-2">Nenhum tour concluído</h3>
                  <p className="text-muted-foreground">Seus tours concluídos aparecerão aqui</p>
                </div>
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="Cancelado" className="mt-6">
            <div className="space-y-4">
              {filterBookings('cancelada').map((booking) => (
                <BookingCard key={booking.id} booking={booking} />
              ))}
              {filterBookings('Cancelado').length === 0 && (
                <div className="text-center py-16">
                  <X className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-xl font-semibold mb-2">Nenhuma reserva cancelada</h3>
                  <p className="text-muted-foreground">Reservas canceladas aparecerão aqui</p>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>}
      </div>
    </div>
  );
};

export default TouristBookings;
