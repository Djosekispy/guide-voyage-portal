
import { useEffect, useState } from "react";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar as CalendarIcon, Clock, Users, MapPin, Plus } from "lucide-react";
import { format, isSameDay } from "date-fns";
import { ptBR } from "date-fns/locale";
import GuideSidebar from "@/components/GuideSidebar";
import { useAuth } from "@/contexts/AuthContext";
import { Booking, getGuideBookings, subscribeToGuideBookings } from "@/lib/firestore";
import { toast } from "@/hooks/use-toast";

const GuideCalendar = () => {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [viewMode, setViewMode] = useState("month");
    const {user, userData } = useAuth()
    
     const [bookings, setBookings] = useState<Booking[]>([]);
      const [loading, setLoading] = useState(true);
  


  const getBookingsForDate = (date: Date | undefined) => {
    if (!date) return [];
    return bookings.filter(booking => isSameDay(booking.date, date));
  };

const getDatesWithBookings = () => {
  return bookings.map(booking => new Date(booking.date));
};

  const selectedDateBookings = getBookingsForDate(selectedDate);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Pendente': return 'border-l-yellow-500 bg-yellow-50';
      case 'Confirmado': return 'border-l-green-500 bg-green-50';
      case 'Cancelado': return 'border-l-red-500 bg-red-50';
      default: return 'border-l-gray-500 bg-gray-50';
    }
  };

  const timeSlots = [
    "08:00", "09:00", "10:00", "11:00", "12:00", 
    "13:00", "14:00", "15:00", "16:00", "17:00", "18:00"
  ];


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
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">Meu Calendário</h1>
            <p className="text-muted-foreground">Visualize suas reservas por data e horário</p>
          </div>
          <div className="flex gap-4">
            <Select value={viewMode} onValueChange={setViewMode}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="month">Mês</SelectItem>
                <SelectItem value="week">Semana</SelectItem>
                <SelectItem value="day">Dia</SelectItem>
              </SelectContent>
            </Select>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Bloquear Horário
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Calendar */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CalendarIcon className="h-5 w-5" />
                Calendário
              </CardTitle>
              <CardDescription>
                Selecione uma data para ver os detalhes
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={setSelectedDate}
                modifiers={{
                  booked: getDatesWithBookings()
                }}
                modifiersStyles={{
                  booked: { 
                    backgroundColor: 'rgb(34 197 94)', 
                    color: 'white',
                    fontWeight: 'bold'
                  }
                }}
                locale={ptBR}
                className="rounded-md border"
              />
              <div className="mt-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-3 h-3 bg-green-500 rounded"></div>
                  <span>Dias com reservas</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Selected Date Details */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>
                {selectedDate 
                  ? format(selectedDate, "EEEE, dd 'de' MMMM 'de' yyyy", { locale: ptBR })
                  : "Selecione uma data"
                }
              </CardTitle>
              <CardDescription>
                {selectedDateBookings.length > 0 
                  ? `${selectedDateBookings.length} reserva(s) para este dia`
                  : "Nenhuma reserva para este dia"
                }
              </CardDescription>
            </CardHeader>
            <CardContent>
              {selectedDateBookings.length > 0 ? (
                <div className="space-y-4">
                  {selectedDateBookings.map((booking) => (
                    <div 
                      key={booking.id} 
                      className={`p-4 border-l-4 rounded-r ${getStatusColor(booking.status)}`}
                    >
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h4 className="font-semibold text-lg">{booking.city}</h4>
                          <p className="text-muted-foreground">Turista: {booking.touristName}</p>
                        </div>
                        <div className={`px-2 py-1 rounded-full text-xs ${
                          booking.status === 'Confirmado' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {booking.status}
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          <span>{booking.time} ({booking.duration})</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Users className="h-4 w-4 text-muted-foreground" />
                          <span>{booking.groupSize} participante(s)</span>
                        </div>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline">
                            Detalhes
                          </Button>
                          <Button size="sm" variant="outline">
                            Contato
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <CalendarIcon className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">Dia livre</h3>
                  <p className="text-muted-foreground mb-4">
                    Você não tem reservas para este dia
                  </p>
                  <Button variant="outline">
                    <Plus className="mr-2 h-4 w-4" />
                    Bloquear este dia
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Weekly View (if selected) */}
        {viewMode === "week" && (
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Visão Semanal</CardTitle>
              <CardDescription>Horários disponíveis e ocupados</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-8 gap-2 text-sm">
                <div className="font-medium">Horário</div>
                <div className="font-medium text-center">Dom</div>
                <div className="font-medium text-center">Seg</div>
                <div className="font-medium text-center">Ter</div>
                <div className="font-medium text-center">Qua</div>
                <div className="font-medium text-center">Qui</div>
                <div className="font-medium text-center">Sex</div>
                <div className="font-medium text-center">Sáb</div>
                
                {timeSlots.map((time) => (
                  <>
                    <div key={time} className="py-2 font-medium">{time}</div>
                    {Array.from({ length: 7 }, (_, index) => (
                      <div key={`${time}-${index}`} className="py-2 text-center border rounded min-h-[40px] hover:bg-muted cursor-pointer">
                        {/* Aqui seria renderizado se há reserva neste horário */}
                      </div>
                    ))}
                  </>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default GuideCalendar;
