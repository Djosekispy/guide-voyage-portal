import { useState, useEffect } from "react";
import { Calendar, Star, MapPin, Clock, User, MessageSquare } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Header from "@/components/Header";
import GoogleMapsAngola from "@/components/GoogleMapsAngola";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { 
  getTouristBookings,
  getGuideReviews,
  getUserFavorites,
  Booking,
  Review,
  Favorite
} from "@/lib/firestore";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const TouristDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalBookings: 0,
    completedTours: 0,
    pendingReviews: 0,
    favoriteGuides: 0
  });
  const [pendingReviews, setPendingReviews] = useState<any[]>([]);
  const [upcomingBookings, setUpcomingBookings] = useState<Booking[]>([]);
  const [favoriteGuides, setFavoriteGuides] = useState<Favorite[]>([]);

  useEffect(() => {
    if (!user?.uid) return;

    const loadDashboardData = async () => {
      try {
        setLoading(true);
        
        // Carrega todas as reservas do turista
        const bookings = await getTouristBookings(user.uid);
        
        // Carrega avaliações existentes para verificar pendentes
        const reviews = await getGuideReviews(user.uid);
        
        // Carrega guias favoritos
        const favorites = await getUserFavorites(user.uid);
        
        // Filtra reservas finalizadas sem avaliação
        const completedBookings = bookings.filter(
          b => b.status === 'Finalizado' && 
          !reviews.some(r => r.bookingId === b.id)
        );
        
        // Filtra próximas reservas (confirmadas)
        const upcoming = bookings.filter(
          b => b.status === 'Confirmado' && 
          new Date(b.date) >= new Date()
        ).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
           
        // Prepara avaliações pendentes
        const pending = completedBookings.map(booking => ({
          id: booking.id,
          guideName: booking.guideName,
          tourTitle: booking.packageTitle || 'Tour Personalizado',
          date: booking.date,
          city: booking.guideCity || 'Não especificado',
          rating: 0
        }));
        
        // Atualiza estados
        setStats({
          totalBookings: bookings.length,
          completedTours: completedBookings.length,
          pendingReviews: pending.length,
          favoriteGuides: favorites.length
        });
        
        setPendingReviews(pending);
        setUpcomingBookings(upcoming);
        setFavoriteGuides(favorites);
        
      } catch (error) {
        console.error("Erro ao carregar dados do dashboard:", error);
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, [user?.uid]);

  const handleReviewTour = (bookingId: string) => {
    navigate(`/turista/avaliar?bookingId=${bookingId}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="pt-24 container mx-auto px-4 py-8">
          <div className="flex justify-center items-center h-64">
            <p>Carregando dados do dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="pt-24 container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Meu Painel</h1>
          <p className="text-muted-foreground">Gerencie suas reservas e avalie suas experiências</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <Calendar className="h-8 w-8 text-primary" />
                <div>
                  <p className="text-2xl font-bold">{stats.totalBookings}</p>
                  <p className="text-sm text-muted-foreground">Total de Reservas</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <MapPin className="h-8 w-8 text-green-500" />
                <div>
                  <p className="text-2xl font-bold">{stats.completedTours}</p>
                  <p className="text-sm text-muted-foreground">Tours Realizados</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <Star className="h-8 w-8 text-yellow-500" />
                <div>
                  <p className="text-2xl font-bold">{stats.pendingReviews}</p>
                  <p className="text-sm text-muted-foreground">Avaliações Pendentes</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <User className="h-8 w-8 text-blue-500" />
                <div>
                  <p className="text-2xl font-bold">{stats.favoriteGuides}</p>
                  <p className="text-sm text-muted-foreground">Guias Favoritos</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Próximas Reservas */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Próximas Reservas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {upcomingBookings.map((booking) => (
                  <div key={booking.id} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-semibold">{booking.packageTitle || 'Tour Personalizado'}</h3>
                      <Badge variant={booking.status === 'Confirmado' ? 'default' : 'secondary'}>
                        {booking.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-1">
                      Guia: {booking.guideName}
                    </p>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground mb-2">
                      <span className="flex items-center gap-1">
                        <MapPin className="h-4 w-4" />
                        {booking.guideCity || 'Local não especificado'}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        {new Date(booking.date).toLocaleDateString('pt-AO')} às {booking.time}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="font-semibold text-primary">
                        {booking.totalPrice?.toLocaleString('pt-AO', { style: 'currency', currency: 'AOA' }) || 'Preço não definido'}
                      </span>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => navigate(`/turista/reservas/${booking.id}`)}
                      >
                        Ver Detalhes
                      </Button>
                    </div>
                  </div>
                ))}
                {upcomingBookings.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    <Calendar className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p>Nenhuma reserva confirmada</p>
                  </div>
                )}
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => navigate('/turista/reservas')}
                >
                  Ver Todas as Reservas
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Avaliações Pendentes */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                Avaliações Pendentes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {pendingReviews.map((review) => (
                  <div key={review.id} className="border rounded-lg p-4">
                    <h3 className="font-semibold mb-1">{review.tourTitle}</h3>
                    <p className="text-sm text-muted-foreground mb-2">
                      Guia: {review.guideName}
                    </p>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
                      <MapPin className="h-4 w-4" />
                      {review.city} - {new Date(review.date).toLocaleDateString('pt-AO')}
                    </div>
                    <Button 
                      variant="hero" 
                      size="sm" 
                      className="w-full"
                      onClick={() => handleReviewTour(review.id)}
                    >
                      Avaliar Agora
                    </Button>
                  </div>
                ))}
                {pendingReviews.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    <Star className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p>Nenhuma avaliação pendente</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>


        {/* Mapa Interativo */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Explore Angola
            </CardTitle>
          </CardHeader>
          <CardContent>
            <GoogleMapsAngola height="400px" showSearch={true} showControls={true} />
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Ações Rápidas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Button variant="hero" className="h-16" onClick={() => navigate('/guias')}>
                <MapPin className="mr-2 h-5 w-5" />
                Buscar Guias
              </Button>
              <Button variant="outline" className="h-16" onClick={() => navigate('/turista/reservas')}>
                <Calendar className="mr-2 h-5 w-5" />
                Minhas Reservas
              </Button>
              <Button variant="outline" className="h-16" onClick={() => navigate('/meus/favoritos')}>
                <Star className="mr-2 h-5 w-5" />
                Meus Favoritos
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default TouristDashboard;