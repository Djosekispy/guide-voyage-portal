import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { collection, getDocs, query, orderBy, limit, where } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Users, MapPin, BookOpen, Star, TrendingUp, DollarSign } from "lucide-react";
import AdminSidebar from "@/components/AdminSidebar";
import Header from "@/components/Header";
import { getAllTourPackages } from "@/lib/firestore";

interface Stats {
  totalUsers: number;
  totalGuides: number;
  totalTourists: number;
  totalPackages: number;
  totalBookings: number;
  totalRevenue: number;
  pendingBookings: number;
  averageRating: number;
}

const AdminDashboard = () => {
  const { userData, loading } = useAuth();
  const navigate = useNavigate();
  // Quick debug logs to surface state into the console
  console.debug('[AdminDashboard] render', { loading, userData });
  const [stats, setStats] = useState<Stats>({
    totalUsers: 0,
    totalGuides: 0,
    totalTourists: 0,
    totalPackages: 0,
    totalBookings: 0,
    totalRevenue: 0,
    pendingBookings: 0,
    averageRating: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!loading && userData && userData.userType !== 'admin') {
      navigate('/');
    }
  }, [userData, loading, navigate]);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        console.debug('[AdminDashboard] fetchStats start');
        // Total de usuários
        const usersSnap = await getDocs(collection(db, "users"));
        console.debug('[AdminDashboard] users fetched', { size: usersSnap.size });
        const totalUsers = usersSnap.size;

        // Guias e turistas
        let totalGuides = 0;
        let totalTourists = 0;
        usersSnap.forEach((doc) => {
          const data = doc.data();
          if (data.userType === 'guide') totalGuides++;
          if (data.userType === 'tourist') totalTourists++;
        });

        // Pacotes
        console.log('[AdminDashboard] fetching packages...');
        const packagesSnap = await getAllTourPackages();
        console.debug('[AdminDashboard] packages fetched', { size: packagesSnap.length });
        const totalPackages = packagesSnap.length;

        // Reservas
        const bookingsSnap = await getDocs(collection(db, "bookings"));
        console.debug('[AdminDashboard] bookings fetched', { size: bookingsSnap.size });
        const totalBookings = bookingsSnap.size;

        // Reservas pendentes
        const pendingQuery = query(
          collection(db, "bookings"),
          where("status", "==", "pending")
        );
        const pendingSnap = await getDocs(pendingQuery);
        console.debug('[AdminDashboard] pending bookings fetched', { size: pendingSnap.size });
        const pendingBookings = pendingSnap.size;

        // Receita total
        let totalRevenue = 0;
        bookingsSnap.forEach((doc) => {
          const booking = doc.data();
          if (booking.status === 'completed') {
            totalRevenue += booking.totalPrice || 0;
          }
        });

        // Média de avaliações
        const reviewsSnap = await getDocs(collection(db, "reviews"));
        console.debug('[AdminDashboard] reviews fetched', { size: reviewsSnap.size });
        let totalRating = 0;
        reviewsSnap.forEach((doc) => {
          totalRating += doc.data().rating || 0;
        });
        const averageRating = reviewsSnap.size > 0 ? totalRating / reviewsSnap.size : 0;

        setStats({
          totalUsers,
          totalGuides,
          totalTourists,
          totalPackages,
          totalBookings,
          totalRevenue,
          pendingBookings,
          averageRating,
        });
      } catch (error) {
        console.error("Erro ao buscar estatísticas:", error);
        // Re-throw in development so errors reach ErrorBoundary / global handlers
        if (import.meta.env.DEV) {
          throw error;
        }
      } finally {
        setIsLoading(false);
      }
    };

    if (userData?.userType === 'admin') {
      fetchStats();
    }
  }, [userData]);

  if (loading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!userData || userData.userType !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Acesso Negado</h1>
          <p className="text-muted-foreground mb-4">Você não tem permissão para acessar esta página.</p>
        </div>
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
              <h1 className="text-3xl font-bold">Dashboard Administrativo</h1>
              <p className="text-muted-foreground mt-2">
                Visão geral da plataforma Kilemba
              </p>
            </div>

            {/* Cards de Estatísticas */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Total de Usuários</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.totalUsers}</div>
                  <p className="text-xs text-muted-foreground">
                    {stats.totalGuides} guias, {stats.totalTourists} turistas
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Pacotes</CardTitle>
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.totalPackages}</div>
                  <p className="text-xs text-muted-foreground">
                    Pacotes disponíveis
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Reservas</CardTitle>
                  <BookOpen className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.totalBookings}</div>
                  <p className="text-xs text-muted-foreground">
                    {stats.pendingBookings} pendentes
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Avaliação Média</CardTitle>
                  <Star className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.averageRating.toFixed(1)}</div>
                  <p className="text-xs text-muted-foreground">
                    De 5.0 estrelas
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Receita e Crescimento */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <DollarSign className="h-5 w-5" />
                    Receita Total
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">
                    {stats.totalRevenue.toLocaleString('pt-AO')} Kz
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">
                    Gerada através de reservas completadas
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    Ações Rápidas
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Button
                    onClick={() => navigate('/admin/usuarios')}
                    variant="outline"
                    className="w-full"
                  >
                    Gerenciar Usuários
                  </Button>
                  <Button
                    onClick={() => navigate('/admin/guias')}
                    variant="outline"
                    className="w-full"
                  >
                    Gerenciar Guias
                  </Button>
                  <Button
                    onClick={() => navigate('/admin/reservas')}
                    variant="outline"
                    className="w-full"
                  >
                    Ver Todas as Reservas
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;
