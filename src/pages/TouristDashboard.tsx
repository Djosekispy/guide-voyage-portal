
import { useState } from "react";
import { Calendar, Star, MapPin, Clock, User, MessageSquare } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Header from "@/components/Header";

const TouristDashboard = () => {
  const [pendingReviews] = useState([
    {
      id: 1,
      guideName: "Maria Santos",
      tourTitle: "Tour Histórico pela Fortaleza de São Miguel",
      date: "2024-01-15",
      city: "Luanda",
      rating: 0
    },
    {
      id: 2,
      guideName: "João Fernandes", 
      tourTitle: "Exploração das Quedas de Kalandula",
      date: "2024-01-10",
      city: "Malanje",
      rating: 0
    }
  ]);

  const [upcomingBookings] = useState([
    {
      id: 1,
      guideName: "Ana Pereira",
      tourTitle: "Passeio pelas Curvas da Serra da Leba",
      date: "2024-01-25",
      time: "09:00",
      city: "Lubango",
      status: "confirmada",
      price: "150.000 Kz"
    },
    {
      id: 2,
      guideName: "Carlos Mbala",
      tourTitle: "Aventura no Deserto do Namibe",
      date: "2024-02-05",
      time: "07:00", 
      city: "Namibe",
      status: "pendente",
      price: "200.000 Kz"
    }
  ]);

  const stats = {
    totalBookings: 8,
    completedTours: 6,
    pendingReviews: pendingReviews.length,
    favoriteGuides: 3
  };

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
                      <h3 className="font-semibold">{booking.tourTitle}</h3>
                      <Badge variant={booking.status === 'confirmada' ? 'default' : 'secondary'}>
                        {booking.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-1">
                      Guia: {booking.guideName}
                    </p>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground mb-2">
                      <span className="flex items-center gap-1">
                        <MapPin className="h-4 w-4" />
                        {booking.city}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        {booking.date} às {booking.time}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="font-semibold text-primary">{booking.price}</span>
                      <Button variant="outline" size="sm">
                        Ver Detalhes
                      </Button>
                    </div>
                  </div>
                ))}
                <Button variant="outline" className="w-full">
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
                      {review.city} - {review.date}
                    </div>
                    <Button variant="hero" size="sm" className="w-full">
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

        {/* Quick Actions */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Ações Rápidas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Button variant="hero" className="h-16">
                <MapPin className="mr-2 h-5 w-5" />
                Buscar Guias
              </Button>
              <Button variant="outline" className="h-16">
                <Calendar className="mr-2 h-5 w-5" />
                Minhas Reservas
              </Button>
              <Button variant="outline" className="h-16">
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
