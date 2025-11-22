import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { 
  Notification, 
  subscribeToNotifications, 
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification 
} from "@/lib/firestore";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Bell, Trash2, CheckCheck, ExternalLink } from "lucide-react";
import AdminSidebar from "@/components/AdminSidebar";
import Header from "@/components/Header";
import { useToast } from "@/hooks/use-toast";

const AdminNotifications = () => {
  const { userData, loading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [activeTab, setActiveTab] = useState<string>("all");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!loading && userData?.userType !== 'admin') {
      navigate('/');
    }
  }, [userData, loading, navigate]);

  useEffect(() => {
    const unsubscribe = subscribeToNotifications((notifs) => {
      setNotifications(notifs);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const getFilteredNotifications = () => {
    switch (activeTab) {
      case 'unread':
        return notifications.filter(n => !n.isRead);
      case 'high':
        return notifications.filter(n => n.priority === 'high');
      default:
        return notifications;
    }
  };

  const handleMarkAsRead = async (notificationId: string) => {
    try {
      await markNotificationAsRead(notificationId);
      toast({
        title: "Sucesso",
        description: "Notificação marcada como lida"
      });
    } catch (error) {
      console.error("Erro ao marcar como lida:", error);
      toast({
        title: "Erro",
        description: "Não foi possível marcar como lida",
        variant: "destructive"
      });
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await markAllNotificationsAsRead();
      toast({
        title: "Sucesso",
        description: "Todas as notificações foram marcadas como lidas"
      });
    } catch (error) {
      console.error("Erro ao marcar todas como lidas:", error);
      toast({
        title: "Erro",
        description: "Não foi possível marcar todas como lidas",
        variant: "destructive"
      });
    }
  };

  const handleDelete = async (notificationId: string) => {
    if (!confirm("Tem certeza que deseja excluir esta notificação?")) return;

    try {
      await deleteNotification(notificationId);
      toast({
        title: "Sucesso",
        description: "Notificação excluída"
      });
    } catch (error) {
      console.error("Erro ao excluir notificação:", error);
      toast({
        title: "Erro",
        description: "Não foi possível excluir a notificação",
        variant: "destructive"
      });
    }
  };

  const getTypeBadge = (type: string) => {
    const types: Record<string, { variant: "default" | "secondary" | "destructive" | "outline", label: string }> = {
      new_user: { variant: "default", label: "Novo Usuário" },
      new_booking: { variant: "secondary", label: "Nova Reserva" },
      new_review: { variant: "outline", label: "Nova Avaliação" },
      new_package: { variant: "secondary", label: "Novo Pacote" },
      booking_cancelled: { variant: "destructive", label: "Reserva Cancelada" },
      low_rating: { variant: "destructive", label: "Avaliação Baixa" }
    };
    const config = types[type] || types.new_user;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const getPriorityBadge = (priority: string) => {
    const priorities: Record<string, { variant: "default" | "secondary" | "destructive", label: string }> = {
      high: { variant: "destructive", label: "Alta" },
      medium: { variant: "default", label: "Média" },
      low: { variant: "secondary", label: "Baixa" }
    };
    const config = priorities[priority] || priorities.medium;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const formatDate = (timestamp: any) => {
    if (!timestamp) return '-';
    const date = timestamp.seconds ? new Date(timestamp.seconds * 1000) : new Date(timestamp);
    return format(date, "dd/MM/yyyy 'às' HH:mm", { locale: ptBR });
  };

  const filteredNotifications = getFilteredNotifications();
  const unreadCount = notifications.filter(n => !n.isRead).length;

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
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold">Notificações</h1>
                <p className="text-muted-foreground mt-2">
                  Acompanhe eventos importantes da plataforma
                </p>
              </div>
              {unreadCount > 0 && (
                <Button onClick={handleMarkAllAsRead} variant="outline">
                  <CheckCheck className="h-4 w-4 mr-2" />
                  Marcar todas como lidas
                </Button>
              )}
            </div>

            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Central de Notificações</CardTitle>
                  {unreadCount > 0 && (
                    <Badge variant="destructive">
                      {unreadCount} não lida{unreadCount !== 1 ? 's' : ''}
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <Tabs value={activeTab} onValueChange={setActiveTab}>
                  <TabsList>
                    <TabsTrigger value="all">
                      Todas ({notifications.length})
                    </TabsTrigger>
                    <TabsTrigger value="unread">
                      Não Lidas ({unreadCount})
                    </TabsTrigger>
                    <TabsTrigger value="high">
                      Prioridade Alta
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value={activeTab} className="mt-4">
                    {filteredNotifications.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                        <Bell className="h-16 w-16 mb-4 opacity-50" />
                        <p className="text-lg">Nenhuma notificação</p>
                      </div>
                    ) : (
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Status</TableHead>
                            <TableHead>Tipo</TableHead>
                            <TableHead>Prioridade</TableHead>
                            <TableHead>Mensagem</TableHead>
                            <TableHead>Data</TableHead>
                            <TableHead>Ações</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {filteredNotifications.map((notification) => (
                            <TableRow 
                              key={notification.id}
                              className={!notification.isRead ? 'bg-accent/50' : ''}
                            >
                              <TableCell>
                                {!notification.isRead ? (
                                  <div className="h-2 w-2 rounded-full bg-primary" />
                                ) : (
                                  <div className="h-2 w-2" />
                                )}
                              </TableCell>
                              <TableCell>
                                {getTypeBadge(notification.type)}
                              </TableCell>
                              <TableCell>
                                {getPriorityBadge(notification.priority)}
                              </TableCell>
                              <TableCell className="max-w-md">
                                <div>
                                  <p className="font-medium">{notification.title}</p>
                                  <p className="text-sm text-muted-foreground">
                                    {notification.message}
                                  </p>
                                </div>
                              </TableCell>
                              <TableCell className="text-sm text-muted-foreground">
                                {formatDate(notification.createdAt)}
                              </TableCell>
                              <TableCell>
                                <div className="flex gap-2">
                                  {notification.link && (
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => navigate(notification.link!)}
                                    >
                                      <ExternalLink className="h-4 w-4" />
                                    </Button>
                                  )}
                                  {!notification.isRead && (
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => handleMarkAsRead(notification.id)}
                                    >
                                      <CheckCheck className="h-4 w-4" />
                                    </Button>
                                  )}
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleDelete(notification.id)}
                                  >
                                    <Trash2 className="h-4 w-4 text-destructive" />
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    )}
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminNotifications;
