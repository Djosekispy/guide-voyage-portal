
import { useState } from "react";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, Users, Star, MapPin, Clock, TrendingUp } from "lucide-react";

const GuideDashboard = () => {
  const stats = [
    {
      title: "Reservas Este Mês",
      value: "24",
      description: "+12% em relação ao mês passado",
      icon: Users,
      color: "text-blue-600"
    },
    {
      title: "Avaliação Média",
      value: "4.8",
      description: "Baseado em 156 avaliações",
      icon: Star,
      color: "text-yellow-600"
    },
    {
      title: "Passeios Ativos",
      value: "8",
      description: "3 novos este mês",
      icon: MapPin,
      color: "text-green-600"
    },
    {
      title: "Receita Este Mês",
      value: "120.000 Kz",
      description: "+8% em relação ao mês passado",
      icon: TrendingUp,
      color: "text-purple-600"
    }
  ];

  const recentBookings = [
    { id: 1, tourist: "Maria Silva", tour: "City Tour Luanda", date: "2024-01-25", status: "confirmado" },
    { id: 2, tourist: "João Santos", tour: "Miradouro da Lua", date: "2024-01-26", status: "pendente" },
    { id: 3, tourist: "Ana Costa", tour: "Fortaleza de São Miguel", date: "2024-01-27", status: "confirmado" }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Dashboard do Guia</h1>
          <p className="text-muted-foreground">Bem-vindo de volta! Aqui está um resumo da sua atividade.</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <Card key={index}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                <stat.icon className={`h-4 w-4 ${stat.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-muted-foreground">{stat.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Bookings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Reservas Recentes
              </CardTitle>
              <CardDescription>Suas últimas reservas recebidas</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentBookings.map((booking) => (
                  <div key={booking.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">{booking.tourist}</p>
                      <p className="text-sm text-muted-foreground">{booking.tour}</p>
                      <p className="text-xs text-muted-foreground">{booking.date}</p>
                    </div>
                    <div className={`px-2 py-1 rounded-full text-xs ${
                      booking.status === 'confirmado' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {booking.status}
                    </div>
                  </div>
                ))}
              </div>
              <Button variant="outline" className="w-full mt-4">
                Ver Todas as Reservas
              </Button>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Ações Rápidas</CardTitle>
              <CardDescription>Gerencie suas atividades rapidamente</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button className="w-full justify-start" variant="outline">
                <MapPin className="mr-2 h-4 w-4" />
                Criar Novo Passeio
              </Button>
              <Button className="w-full justify-start" variant="outline">
                <Users className="mr-2 h-4 w-4" />
                Ver Reservas Pendentes
              </Button>
              <Button className="w-full justify-start" variant="outline">
                <Calendar className="mr-2 h-4 w-4" />
                Abrir Calendário
              </Button>
              <Button className="w-full justify-start" variant="outline">
                <Clock className="mr-2 h-4 w-4" />
                Atualizar Disponibilidade
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default GuideDashboard;
