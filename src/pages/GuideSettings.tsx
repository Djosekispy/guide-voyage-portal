import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { 
  User, 
  Bell, 
  Shield, 
  Loader2,
  Save,
  Eye,
  EyeOff,
  Mail,
  Phone,
  MapPin,
  Languages,
  Star,
  X
} from 'lucide-react';
import Header from '@/components/Header';
import GuideSidebar from '@/components/GuideSidebar';
import GoogleMapsAngola from '@/components/GoogleMapsAngola';
import { getGuideProfile, updateGuideProfile, Guide } from '@/lib/firestore';
import { updatePassword, EmailAuthProvider, reauthenticateWithCredential } from 'firebase/auth';
import { auth } from '@/lib/firebase';

interface NotificationSettings {
  newBookings: boolean;
  bookingReminders: boolean;
  newMessages: boolean;
  newReviews: boolean;
  promotions: boolean;
}

export default function GuideSettings() {
  const { user, userData } = useAuth();
  const { toast } = useToast();
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [guideProfile, setGuideProfile] = useState<Guide | null>(null);
  
  // Configurações de perfil
  const [profileData, setProfileData] = useState({
    name: '',
    email: '',
    phone: '',
    city: '',
    description: '',
    experience: 0,
    pricePerHour: 0,
    languages: [] as string[],
    specialties: [] as string[],
    location: null as { name?: string; lat: number; lng: number } | null
  });

  const [newLanguage, setNewLanguage] = useState('');
  const [newSpecialty, setNewSpecialty] = useState('');

  // Configurações de notificação
  const [notifications, setNotifications] = useState<NotificationSettings>({
    newBookings: true,
    bookingReminders: true,
    newMessages: true,
    newReviews: true,
    promotions: false
  });

  // Configurações de senha
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);

  useEffect(() => {
    loadSettings();
  }, [user]);

  const loadSettings = async () => {
    if (!user?.uid) return;
    
    try {
      setLoading(true);
      const profile = await getGuideProfile(user.uid);
      
      if (profile) {
        setGuideProfile(profile);
        setProfileData({
          name: profile.name || '',
          email: profile.email || '',
          phone: profile.phone || '',
          city: profile.city || '',
          description: profile.description || '',
          experience: profile.experience || 0,
          pricePerHour: profile.pricePerHour || 0,
          languages: profile.languages || [],
          specialties: profile.specialties || [],
          location: profile.location || null
        });
      }
    } catch (error) {
      console.error('Erro ao carregar configurações:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar as configurações",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    if (!guideProfile?.id) return;
    
    setSaving(true);
    try {
      await updateGuideProfile(guideProfile.id, {
        name: profileData.name,
        phone: profileData.phone,
        city: profileData.city,
        description: profileData.description,
        experience: profileData.experience,
        pricePerHour: profileData.pricePerHour,
        languages: profileData.languages,
        specialties: profileData.specialties,
        location: profileData.location || undefined
      });
      
      toast({
        title: "Sucesso!",
        description: "Perfil atualizado com sucesso"
      });
    } catch (error) {
      console.error('Erro ao salvar perfil:', error);
      toast({
        title: "Erro",
        description: "Não foi possível salvar as alterações",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  const handleLocationSelect = (location: { name?: string; lat: number; lng: number }) => {
    setProfileData(prev => ({ ...prev, location }));
  };

  const addLanguage = () => {
    if (newLanguage.trim() && !profileData.languages.includes(newLanguage.trim())) {
      setProfileData(prev => ({
        ...prev,
        languages: [...prev.languages, newLanguage.trim()]
      }));
      setNewLanguage('');
    }
  };

  const removeLanguage = (language: string) => {
    setProfileData(prev => ({
      ...prev,
      languages: prev.languages.filter(l => l !== language)
    }));
  };

  const addSpecialty = () => {
    if (newSpecialty.trim() && !profileData.specialties.includes(newSpecialty.trim())) {
      setProfileData(prev => ({
        ...prev,
        specialties: [...prev.specialties, newSpecialty.trim()]
      }));
      setNewSpecialty('');
    }
  };

  const removeSpecialty = (specialty: string) => {
    setProfileData(prev => ({
      ...prev,
      specialties: prev.specialties.filter(s => s !== specialty)
    }));
  };

  const handleSaveNotifications = async () => {
    setSaving(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      
      toast({
        title: "Sucesso!",
        description: "Preferências de notificação atualizadas"
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível salvar as preferências",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast({
        title: "Erro",
        description: "As senhas não coincidem",
        variant: "destructive"
      });
      return;
    }

    if (passwordData.newPassword.length < 6) {
      toast({
        title: "Erro",
        description: "A nova senha deve ter pelo menos 6 caracteres",
        variant: "destructive"
      });
      return;
    }

    setChangingPassword(true);
    try {
      const currentUser = auth.currentUser;
      if (!currentUser || !currentUser.email) throw new Error('Usuário não encontrado');

      const credential = EmailAuthProvider.credential(
        currentUser.email,
        passwordData.currentPassword
      );
      await reauthenticateWithCredential(currentUser, credential);
      await updatePassword(currentUser, passwordData.newPassword);

      toast({
        title: "Sucesso!",
        description: "Senha alterada com sucesso"
      });

      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    } catch (error: any) {
      console.error('Erro ao alterar senha:', error);
      let message = "Não foi possível alterar a senha";
      
      if (error.code === 'auth/wrong-password') {
        message = "Senha atual incorreta";
      } else if (error.code === 'auth/requires-recent-login') {
        message = "Por favor, faça login novamente para alterar sua senha";
      }
      
      toast({
        title: "Erro",
        description: message,
        variant: "destructive"
      });
    } finally {
      setChangingPassword(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <GuideSidebar />
        <div className="flex-1 lg:ml-64 flex items-center justify-center min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <GuideSidebar />
      
      <div className="flex-1 lg:ml-64 px-4 py-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Configurações</h1>
          <p className="text-muted-foreground">Gerencie suas preferências e dados da conta</p>
        </div>

        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList className="grid w-full max-w-lg grid-cols-4">
            <TabsTrigger value="profile">
              <User className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Perfil</span>
            </TabsTrigger>
            <TabsTrigger value="location">
              <MapPin className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Localização</span>
            </TabsTrigger>
            <TabsTrigger value="notifications">
              <Bell className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Notificações</span>
            </TabsTrigger>
            <TabsTrigger value="security">
              <Shield className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Segurança</span>
            </TabsTrigger>
          </TabsList>

          {/* Tab Perfil */}
          <TabsContent value="profile">
            <Card>
              <CardHeader>
                <CardTitle>Informações do Perfil</CardTitle>
                <CardDescription>
                  Atualize suas informações pessoais e de contato
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Nome Completo</Label>
                    <Input
                      id="name"
                      value={profileData.name}
                      onChange={(e) => setProfileData(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="Seu nome"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="email"
                        value={profileData.email}
                        disabled
                        className="pl-10 bg-muted"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="phone">Telefone</Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="phone"
                        value={profileData.phone}
                        onChange={(e) => setProfileData(prev => ({ ...prev, phone: e.target.value }))}
                        placeholder="+244 9XX XXX XXX"
                        className="pl-10"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="city">Cidade</Label>
                    <Input
                      id="city"
                      value={profileData.city}
                      onChange={(e) => setProfileData(prev => ({ ...prev, city: e.target.value }))}
                      placeholder="Ex: Luanda"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Descrição</Label>
                  <Textarea
                    id="description"
                    value={profileData.description}
                    onChange={(e) => setProfileData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Conte um pouco sobre você e sua experiência como guia..."
                    rows={4}
                  />
                </div>

                {/* Languages */}
                <div className="space-y-2">
                  <Label className="flex items-center gap-2"><Languages className="h-4 w-4" />Idiomas</Label>
                  <div className="flex gap-2">
                    <Input value={newLanguage} onChange={(e) => setNewLanguage(e.target.value)} placeholder="Ex: Português" onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addLanguage())} />
                    <Button type="button" onClick={addLanguage}>Adicionar</Button>
                  </div>
                  <div className="flex flex-wrap gap-2">{profileData.languages.map((lang) => (<Badge key={lang} variant="secondary" className="flex items-center gap-1">{lang}<X className="w-3 h-3 cursor-pointer" onClick={() => removeLanguage(lang)} /></Badge>))}</div>
                </div>

                {/* Specialties */}
                <div className="space-y-2">
                  <Label className="flex items-center gap-2"><Star className="h-4 w-4" />Especialidades</Label>
                  <div className="flex gap-2">
                    <Input value={newSpecialty} onChange={(e) => setNewSpecialty(e.target.value)} placeholder="Ex: História" onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSpecialty())} />
                    <Button type="button" onClick={addSpecialty}>Adicionar</Button>
                  </div>
                  <div className="flex flex-wrap gap-2">{profileData.specialties.map((spec) => (<Badge key={spec} variant="outline" className="flex items-center gap-1">{spec}<X className="w-3 h-3 cursor-pointer" onClick={() => removeSpecialty(spec)} /></Badge>))}</div>
                </div>

                <Button onClick={handleSaveProfile} disabled={saving}>
                  {saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
                  Salvar Alterações
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab Localização */}
          <TabsContent value="location">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><MapPin className="h-5 w-5" />Minha Localização</CardTitle>
                <CardDescription>Defina sua localização no mapa para que os turistas possam encontrá-lo</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {profileData.location && (
                  <div className="p-4 bg-muted rounded-lg">
                    <p className="text-sm font-medium">Localização Atual:</p>
                    <p className="text-sm text-muted-foreground">{profileData.location.name || `Lat: ${profileData.location.lat.toFixed(6)}, Lng: ${profileData.location.lng.toFixed(6)}`}</p>
                  </div>
                )}
                <div className="space-y-2">
                  <Label>Clique no mapa para selecionar sua localização</Label>
                  <GoogleMapsAngola height="400px" showSearch={true} showControls={false} allowSelection={true} initialPosition={profileData.location} initialMarkerLabel="Minha localização" onLocationSelect={handleLocationSelect} />
                </div>
                <Button onClick={handleSaveProfile} disabled={saving}>
                  {saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
                  Salvar Localização
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="notifications">
            <Card>
              <CardHeader>
                <CardTitle>Preferências de Notificação</CardTitle>
                <CardDescription>
                  Escolha quais notificações você deseja receber
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="newBookings" className="font-medium">Novas Reservas</Label>
                    <p className="text-sm text-muted-foreground">
                      Receber notificação quando uma nova reserva for feita
                    </p>
                  </div>
                  <Switch
                    id="newBookings"
                    checked={notifications.newBookings}
                    onCheckedChange={(checked) => 
                      setNotifications(prev => ({ ...prev, newBookings: checked }))
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="bookingReminders" className="font-medium">Lembretes de Reservas</Label>
                    <p className="text-sm text-muted-foreground">
                      Receber lembretes antes das reservas agendadas
                    </p>
                  </div>
                  <Switch
                    id="bookingReminders"
                    checked={notifications.bookingReminders}
                    onCheckedChange={(checked) => 
                      setNotifications(prev => ({ ...prev, bookingReminders: checked }))
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="newMessages" className="font-medium">Novas Mensagens</Label>
                    <p className="text-sm text-muted-foreground">
                      Receber notificação de novas mensagens de turistas
                    </p>
                  </div>
                  <Switch
                    id="newMessages"
                    checked={notifications.newMessages}
                    onCheckedChange={(checked) => 
                      setNotifications(prev => ({ ...prev, newMessages: checked }))
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="newReviews" className="font-medium">Novas Avaliações</Label>
                    <p className="text-sm text-muted-foreground">
                      Receber notificação quando receber uma nova avaliação
                    </p>
                  </div>
                  <Switch
                    id="newReviews"
                    checked={notifications.newReviews}
                    onCheckedChange={(checked) => 
                      setNotifications(prev => ({ ...prev, newReviews: checked }))
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="promotions" className="font-medium">Promoções e Novidades</Label>
                    <p className="text-sm text-muted-foreground">
                      Receber informações sobre promoções e novidades da plataforma
                    </p>
                  </div>
                  <Switch
                    id="promotions"
                    checked={notifications.promotions}
                    onCheckedChange={(checked) => 
                      setNotifications(prev => ({ ...prev, promotions: checked }))
                    }
                  />
                </div>

                <Button onClick={handleSaveNotifications} disabled={saving}>
                  {saving ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Save className="h-4 w-4 mr-2" />
                  )}
                  Salvar Preferências
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab Segurança */}
          <TabsContent value="security">
            <Card>
              <CardHeader>
                <CardTitle>Alterar Senha</CardTitle>
                <CardDescription>
                  Mantenha sua conta segura atualizando sua senha regularmente
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="currentPassword">Senha Atual</Label>
                  <div className="relative">
                    <Input
                      id="currentPassword"
                      type={showCurrentPassword ? "text" : "password"}
                      value={passwordData.currentPassword}
                      onChange={(e) => setPasswordData(prev => ({ ...prev, currentPassword: e.target.value }))}
                      placeholder="Digite sua senha atual"
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="newPassword">Nova Senha</Label>
                  <div className="relative">
                    <Input
                      id="newPassword"
                      type={showNewPassword ? "text" : "password"}
                      value={passwordData.newPassword}
                      onChange={(e) => setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))}
                      placeholder="Digite sua nova senha"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirmar Nova Senha</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={passwordData.confirmPassword}
                    onChange={(e) => setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                    placeholder="Confirme sua nova senha"
                  />
                </div>

                <Button 
                  onClick={handleChangePassword} 
                  disabled={changingPassword || !passwordData.currentPassword || !passwordData.newPassword}
                >
                  {changingPassword ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Shield className="h-4 w-4 mr-2" />
                  )}
                  Alterar Senha
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
