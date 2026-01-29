import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Timestamp } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import { User, Booking, Review, TourPackage } from '@/lib/firestore';
import { UserPlus, Calendar, Star, Package, ArrowRight } from 'lucide-react';

interface RecentActivityProps {
  recentUsers: User[];
  recentBookings: Booking[];
  recentReviews: Review[];
  recentPackages: TourPackage[];
}

function formatTimestamp(timestamp: any): string {
  if (!timestamp) return '-';
  const date = timestamp instanceof Timestamp 
    ? timestamp.toDate() 
    : typeof timestamp === 'object' && timestamp.seconds 
      ? new Date(timestamp.seconds * 1000)
      : new Date(timestamp);
  return format(date, "dd/MM HH:mm", { locale: ptBR });
}

export default function RecentActivity({ 
  recentUsers, 
  recentBookings, 
  recentReviews, 
  recentPackages 
}: RecentActivityProps) {
  const navigate = useNavigate();

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { variant: "default" | "secondary" | "destructive" | "outline", label: string }> = {
      pending: { variant: "secondary", label: "Pendente" },
      Pendente: { variant: "secondary", label: "Pendente" },
      confirmed: { variant: "default", label: "Confirmada" },
      Confirmado: { variant: "default", label: "Confirmada" },
      completed: { variant: "outline", label: "Concluída" },
      Finalizado: { variant: "outline", label: "Concluída" },
      cancelled: { variant: "destructive", label: "Cancelada" },
      Cancelado: { variant: "destructive", label: "Cancelada" }
    };
    const config = variants[status] || variants.pending;
    return <Badge variant={config.variant} className="text-xs">{config.label}</Badge>;
  };

  const getUserTypeBadge = (type: string) => {
    const config = {
      tourist: { variant: "secondary" as const, label: "Turista" },
      guide: { variant: "default" as const, label: "Guia" },
      admin: { variant: "outline" as const, label: "Admin" }
    };
    const c = config[type as keyof typeof config] || config.tourist;
    return <Badge variant={c.variant} className="text-xs">{c.label}</Badge>;
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Recent Users */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5" />
            Últimos Usuários
          </CardTitle>
          <Button variant="ghost" size="sm" onClick={() => navigate('/admin/usuarios')}>
            Ver todos <ArrowRight className="h-4 w-4 ml-1" />
          </Button>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {recentUsers.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">Nenhum usuário recente</p>
            ) : (
              recentUsers.slice(0, 5).map(user => (
                <div key={user.id} className="flex items-center justify-between py-2 border-b last:border-0">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback>{user.name?.charAt(0) || 'U'}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-medium">{user.name}</p>
                      <p className="text-xs text-muted-foreground">{user.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {getUserTypeBadge(user.userType)}
                    <span className="text-xs text-muted-foreground">
                      {formatTimestamp(user.createdAt)}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Recent Bookings */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Últimas Reservas
          </CardTitle>
          <Button variant="ghost" size="sm" onClick={() => navigate('/admin/reservas')}>
            Ver todas <ArrowRight className="h-4 w-4 ml-1" />
          </Button>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {recentBookings.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">Nenhuma reserva recente</p>
            ) : (
              recentBookings.slice(0, 5).map(booking => (
                <div key={booking.id} className="flex items-center justify-between py-2 border-b last:border-0">
                  <div>
                    <p className="text-sm font-medium">{booking.touristName}</p>
                    <p className="text-xs text-muted-foreground">
                      com {booking.guideName} • {booking.packageName || booking.packageTitle || 'Pacote'}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    {getStatusBadge(booking.status)}
                    <span className="text-xs text-muted-foreground">
                      {booking.totalPrice?.toLocaleString('pt-AO')} Kz
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Recent Reviews */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Star className="h-5 w-5" />
            Últimas Avaliações
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {recentReviews.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">Nenhuma avaliação recente</p>
            ) : (
              recentReviews.slice(0, 5).map(review => (
                <div key={review.id} className="flex items-center justify-between py-2 border-b last:border-0">
                  <div>
                    <p className="text-sm font-medium">{review.touristName}</p>
                    <p className="text-xs text-muted-foreground">
                      avaliou {review.guideName}
                    </p>
                  </div>
                  <div className="flex items-center gap-1">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star 
                        key={i} 
                        className={`h-3 w-3 ${i < review.rating ? 'fill-primary text-primary' : 'text-muted-foreground'}`} 
                      />
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Recent Packages */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Últimos Pacotes
          </CardTitle>
          <Button variant="ghost" size="sm" onClick={() => navigate('/admin/pacotes')}>
            Ver todos <ArrowRight className="h-4 w-4 ml-1" />
          </Button>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {recentPackages.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">Nenhum pacote recente</p>
            ) : (
              recentPackages.slice(0, 5).map(pkg => (
                <div key={pkg.id} className="flex items-center justify-between py-2 border-b last:border-0">
                  <div>
                    <p className="text-sm font-medium">{pkg.title}</p>
                    <p className="text-xs text-muted-foreground">
                      por {pkg.guideName} • {pkg.location}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <Badge variant={pkg.isActive ? "default" : "secondary"} className="text-xs">
                      {pkg.isActive ? 'Ativo' : 'Inativo'}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {pkg.price?.toLocaleString('pt-AO')} Kz
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
