import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
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
  User,
  subscribeToNotifications, 
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
  createNotification,
  getAllUsers
} from "@/lib/firestore";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Bell, Trash2, CheckCheck, ExternalLink, Send, Users, UserCheck } from "lucide-react";
import AdminSidebar from "@/components/AdminSidebar";
import Header from "@/components/Header";
import { useToast } from "@/hooks/use-toast";

const AdminNotifications = () => {
  const { userData, loading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [activeTab, setActiveTab] = useState<string>("all");
  const [isLoading, setIsLoading] = useState(true);
  
  // Send notification state
  const [showSendDialog, setShowSendDialog] = useState(false);
  const [sendTo, setSendTo] = useState<'all' | 'guides' | 'tourists' | 'specific'>('all');
  const [selectedUserId, setSelectedUserId] = useState<string>('');
  const [notificationTitle, setNotificationTitle] = useState('');
  const [notificationMessage, setNotificationMessage] = useState('');
  const [notificationPriority, setNotificationPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [isSending, setIsSending] = useState(false);

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

    // Carregar usuários para seleção
    const loadUsers = async () => {
      try {
        const usersData = await getAllUsers();
        setUsers(usersData);
      } catch (error) {
        console.error("Erro ao carregar usuários:", error);
      }
    };
    loadUsers();

    return () => unsubscribe();
  }, []);

  const getFilteredNotifications = () => {
    switch (activeTab) {
      case 'unread':
        return notifications.filter(n => !n.isRead);
      case 'high':
        return notifications.filter(n => n.priority === 'high');
      case 'sent':
        return notifications.filter(n => n.type === 'admin_message');
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

  const handleSendNotification = async () => {
    if (!notificationTitle.trim() || !notificationMessage.trim()) {
      toast({
        title: "Erro",
        description: "Título e mensagem são obrigatórios",
        variant: "destructive"
      });
      return;
    }

    setIsSending(true);
    
    try {
      let targetUsers: User[] = [];
      
      switch (sendTo) {
        case 'all':
          targetUsers = users.filter(u => u.userType !== 'admin');
          break;
        case 'guides':
          targetUsers = users.filter(u => u.userType === 'guide');
          break;
        case 'tourists':
          targetUsers = users.filter(u => u.userType === 'tourist');
          break;
        case 'specific':
          targetUsers = users.filter(u => u.id === selectedUserId);
          break;
      }

      // Criar notificação para cada usuário destinatário
      const promises = targetUsers.map(async (user) => {
        await addDoc(collection(db, 'userNotifications'), {
          userId: user.id,
          title: notificationTitle,
          message: notificationMessage,
          priority: notificationPriority,
          isRead: false,
          type: 'admin_message',
          createdAt: serverTimestamp(),
        });
      });

      // Criar também uma notificação global para o admin acompanhar
      await createNotification({
        type: 'admin_message' as any,
        title: `Mensagem Enviada: ${notificationTitle}`,
        message: `Enviado para ${targetUsers.length} ${sendTo === 'all' ? 'usuários' : sendTo === 'guides' ? 'guias' : sendTo === 'tourists' ? 'turistas' : 'usuário específico'}`,
        isRead: false,
        priority: 'low',
        metadata: {
          recipientCount: targetUsers.length,
          sendTo: sendTo
        }
      } as any);

      await Promise.all(promises);

      toast({
        title: "Sucesso",
        description: `Notificação enviada para ${targetUsers.length} usuário(s)`
      });

      // Reset form
      setShowSendDialog(false);
      setNotificationTitle('');
      setNotificationMessage('');
      setNotificationPriority('medium');
      setSendTo('all');
      setSelectedUserId('');
    } catch (error) {
      console.error("Erro ao enviar notificação:", error);
      toast({
        title: "Erro",
        description: "Não foi possível enviar a notificação",
        variant: "destructive"
      });
    } finally {
      setIsSending(false);
    }
  };

  const getTypeBadge = (type: string) => {
    const types: Record<string, { variant: "default" | "secondary" | "destructive" | "outline", label: string }> = {
      new_user: { variant: "default", label: "Novo Usuário" },
      new_booking: { variant: "secondary", label: "Nova Reserva" },
      new_review: { variant: "outline", label: "Nova Avaliação" },
      new_package: { variant: "secondary", label: "Novo Pacote" },
      booking_cancelled: { variant: "destructive", label: "Reserva Cancelada" },
      low_rating: { variant: "destructive", label: "Avaliação Baixa" },
      admin_message: { variant: "default", label: "Mensagem Admin" }
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
  
  const guides = users.filter(u => u.userType === 'guide');
  const tourists = users.filter(u => u.userType === 'tourist');

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
                  Acompanhe eventos e envie notificações para usuários
                </p>
              </div>
              <div className="flex gap-2">
                <Button onClick={() => setShowSendDialog(true)}>
                  <Send className="h-4 w-4 mr-2" />
                  Enviar Notificação
                </Button>
                {unreadCount > 0 && (
                  <Button onClick={handleMarkAllAsRead} variant="outline">
                    <CheckCheck className="h-4 w-4 mr-2" />
                    Marcar todas como lidas
                  </Button>
                )}
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Total de Notificações</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2">
                    <Bell className="h-5 w-5 text-primary" />
                    <p className="text-2xl font-bold">{notifications.length}</p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Não Lidas</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2">
                    <Bell className="h-5 w-5 text-yellow-600" />
                    <p className="text-2xl font-bold">{unreadCount}</p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Total Guias</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2">
                    <UserCheck className="h-5 w-5 text-green-600" />
                    <p className="text-2xl font-bold">{guides.length}</p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Total Turistas</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2">
                    <Users className="h-5 w-5 text-blue-600" />
                    <p className="text-2xl font-bold">{tourists.length}</p>
                  </div>
                </CardContent>
              </Card>
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
                    <TabsTrigger value="sent">
                      Enviadas
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

      {/* Send Notification Dialog */}
      <Dialog open={showSendDialog} onOpenChange={setShowSendDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Enviar Notificação</DialogTitle>
            <DialogDescription>
              Envie uma notificação para guias, turistas ou usuários específicos
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Enviar para</Label>
              <Select value={sendTo} onValueChange={(value: any) => setSendTo(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os Usuários ({users.filter(u => u.userType !== 'admin').length})</SelectItem>
                  <SelectItem value="guides">Todos os Guias ({guides.length})</SelectItem>
                  <SelectItem value="tourists">Todos os Turistas ({tourists.length})</SelectItem>
                  <SelectItem value="specific">Usuário Específico</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {sendTo === 'specific' && (
              <div className="space-y-2">
                <Label>Selecionar Usuário</Label>
                <Select value={selectedUserId} onValueChange={setSelectedUserId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um usuário" />
                  </SelectTrigger>
                  <SelectContent>
                    {users.filter(u => u.userType !== 'admin').map(user => (
                      <SelectItem key={user.id} value={user.id}>
                        {user.name} ({user.userType === 'guide' ? 'Guia' : 'Turista'}) - {user.email}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="space-y-2">
              <Label>Prioridade</Label>
              <Select value={notificationPriority} onValueChange={(value: any) => setNotificationPriority(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Baixa</SelectItem>
                  <SelectItem value="medium">Média</SelectItem>
                  <SelectItem value="high">Alta</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Título</Label>
              <Input
                placeholder="Título da notificação"
                value={notificationTitle}
                onChange={(e) => setNotificationTitle(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>Mensagem</Label>
              <Textarea
                placeholder="Escreva a mensagem da notificação..."
                value={notificationMessage}
                onChange={(e) => setNotificationMessage(e.target.value)}
                rows={4}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowSendDialog(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSendNotification} disabled={isSending}>
              {isSending ? 'Enviando...' : 'Enviar Notificação'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminNotifications;
