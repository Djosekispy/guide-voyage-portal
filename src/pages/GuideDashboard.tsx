import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { 
  MapPin, 
  Users, 
  Star, 
  Calendar, 
  TrendingUp, 
  Package, 
  Plus,
  Edit,
  Trash2,
  Eye,
  Clock,
  DollarSign,
  CheckCircle,
  XCircle,
  AlertCircle,
  Loader2
} from 'lucide-react';
import GoogleMapsAngola from '@/components/GoogleMapsAngola';
import {
  getGuideProfile,
  getGuidePackages,
  getGuideBookings,
  createTourPackage,
  updateTourPackage,
  deleteTourPackage,
  updateBookingStatus,
  subscribeToGuideBookings,
  type Guide,
  type TourPackage,
  type Booking
} from '@/lib/firestore';
import Header from '@/components/Header';
import GuideSidebar from '@/components/GuideSidebar';

export default function GuideDashboard() {
  const { user, userData } = useAuth();
  const { toast } = useToast();
  
  const [guideProfile, setGuideProfile] = useState<Guide | null>(null);
  const [packages, setPackages] = useState<TourPackage[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreatePackageOpen, setIsCreatePackageOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState<TourPackage | null>(null);
  const [isEditPackageOpen, setIsEditPackageOpen] = useState(false);

  const [newPackage, setNewPackage] = useState({
    title: '',
    description: '',
    duration: '',
    price: 0,
    maxGroupSize: 1,
    location: '',
    includes: [''],
    excludes: [''],
    itinerary: [''],
    images: ['']
  });

  useEffect(() => {
    if (user && userData?.userType === 'guide') {
      loadDashboardData();
    }
  }, [user, userData]);

  

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      if (!user?.uid) return;

      // Carregar perfil do guia
      const guide = await getGuideProfile(user.uid);
      setGuideProfile(guide);

      if (guide) {
        // Carregar pacotes
        const guidePackages = await getGuidePackages(guide.id);
        setPackages(guidePackages);
        // Carregar reservas
        const guideBookings = await getGuideBookings(guide.id);
        setBookings(guideBookings);

        // Configurar listener em tempo real para reservas
        const unsubscribe = subscribeToGuideBookings(guide.id, (updatedBookings) => {
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

const handleEditPackage = async () => {
  setIsSaving(true);
  try {
    if (!selectedPackage) return;

    // Filtrar arrays para remover itens vazios
    const filteredPackage = {
      ...selectedPackage,
      includes: selectedPackage.includes.filter(item => item.trim() !== ''),
      excludes: selectedPackage.excludes.filter(item => item.trim() !== ''),
      itinerary: selectedPackage.itinerary.filter(item => item.trim() !== ''),
      images: selectedPackage.images.filter(item => item.trim() !== '')
    };

    await updateTourPackage(selectedPackage.id,filteredPackage);

    toast({
      title: "Sucesso!",
      description: "Pacote atualizado com sucesso"
    });

    setIsEditPackageOpen(false);
    loadDashboardData();
  } catch (error) {
    console.error('Erro ao atualizar pacote:', error);
    toast({
      title: "Erro",
      description: "Não foi possível atualizar o pacote",
      variant: "destructive"
    });
  } finally {
    setIsSaving(false);
  }
};

const handleCreatePackage = async () => {
  setIsSaving(true);
  try {
    if (!guideProfile) return;

    // Filtrar arrays para remover itens vazios
    const filteredPackage = {
      ...newPackage,
      includes: newPackage.includes.filter(item => item.trim() !== ''),
      excludes: newPackage.excludes.filter(item => item.trim() !== ''),
      itinerary: newPackage.itinerary.filter(item => item.trim() !== ''),
      images: newPackage.images.filter(item => item.trim() !== '')
    };

    await createTourPackage({
      guideId: guideProfile.id,
      guideName: guideProfile.name,
      ...filteredPackage,
      isActive: true,
      rating: 0,
      reviewCount: 0
    });

    toast({
      title: "Sucesso!",
      description: "Pacote criado com sucesso"
    });

    // Resetar formulário
    setIsCreatePackageOpen(false);
    setNewPackage({
      title: '',
      description: '',
      duration: '',
      price: 0,
      maxGroupSize: 1,
      location: '',
      includes: [''],
      excludes: [''],
      itinerary: [''],
      images: ['']
    });
    
    // Recarregar dados
    loadDashboardData();
  } catch (error) {
    console.error('Erro ao criar pacote:', error);
    toast({
      title: "Erro",
      description: "Não foi possível criar o pacote",
      variant: "destructive"
    });
  } finally {
    setIsSaving(false);
  }
};

  const handleDeletePackage = async (packageId: string) => {
    try {
      await deleteTourPackage(packageId);
      toast({
        title: "Sucesso!",
        description: "Pacote removido com sucesso"
      });
      loadDashboardData();
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível remover o pacote",
        variant: "destructive"
      });
    }
  };

  const handleUpdateBookingStatus = async (bookingId: string, status: Booking['status']) => {
    try {
      await updateBookingStatus(bookingId, status);
      toast({
        title: "Sucesso!",
        description: "Status da reserva atualizado"
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível atualizar o status",
        variant: "destructive"
      });
    }
  };

  const addArrayItem = (field: 'includes' | 'excludes' | 'itinerary' | 'images') => {
    setNewPackage(prev => ({
      ...prev,
      [field]: [...prev[field], '']
    }));
  };

  const removeArrayItem = (field: 'includes' | 'excludes' | 'itinerary' | 'images', index: number) => {
    setNewPackage(prev => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index)
    }));
  };

  const updateArrayItem = (field: 'includes' | 'excludes' | 'itinerary' | 'images', index: number, value: string) => {
    setNewPackage(prev => ({
      ...prev,
      [field]: prev[field].map((item, i) => i === index ? value : item)
    }));
  };


  const updateSelectedArrayItem = (field: 'includes' | 'excludes' | 'itinerary' | 'images', index: number, value: string) => {
  setSelectedPackage(prev => prev ? ({
    ...prev,
    [field]: prev[field].map((item, i) => i === index ? value : item)
  }) : null);
};

const addSelectedArrayItem = (field: 'includes' | 'excludes' | 'itinerary' | 'images') => {
  setSelectedPackage(prev => prev ? ({
    ...prev,
    [field]: [...prev[field], '']
  }) : null);
};

const removeSelectedArrayItem = (field: 'includes' | 'excludes' | 'itinerary' | 'images', index: number) => {
  setSelectedPackage(prev => prev ? ({
    ...prev,
    [field]: prev[field].filter((_, i) => i !== index)
  }) : null);
};

  // Estatísticas
  const totalBookings = bookings.length;
  const completedTours = bookings.filter(b => b.status === 'Finalizado').length;
  const pendingBookings = bookings.filter(b => b.status === 'Pendente').length;
  const totalRevenue = bookings
    .filter(b => b.status === 'Finalizado')
    .reduce((sum, b) => sum + b.totalPrice, 0);
  const averageRating = guideProfile?.rating || 0;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
     <div className="min-h-screen bg-background">
      <Header />

         <GuideSidebar />
        
    <div  className="flex-1 lg:ml-64 px-4">

      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Dashboard do Guia</h1>
        <p className="text-muted-foreground">
          Bem-vindo, {userData?.name}! Gerencie seus pacotes e reservas.
        </p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Calendar className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Total Reservas</p>
                <p className="text-2xl font-bold">{totalBookings}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Star className="h-8 w-8 text-yellow-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Avaliação Média</p>
                <p className="text-2xl font-bold">{averageRating.toFixed(1)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <CheckCircle className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Tours Concluídos</p>
                <p className="text-2xl font-bold">{completedTours}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <AlertCircle className="h-8 w-8 text-orange-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Pendentes</p>
                <p className="text-2xl font-bold">{pendingBookings}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <DollarSign className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Receita Total</p>
                <p className="text-2xl font-bold">{totalRevenue.toLocaleString('pt-AO', { style: 'currency', currency: 'AOA' })}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="packages">Pacotes</TabsTrigger>
          <TabsTrigger value="bookings">Reservas</TabsTrigger>
          <TabsTrigger value="map">Mapa</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Reservas Recentes</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {bookings.slice(0, 5).map((booking) => (
                    <div key={booking.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="font-medium">{booking.touristName}</p>
                        <p className="text-sm text-muted-foreground">
                          {booking.date} - {booking.packageTitle || 'Tour personalizado'}
                        </p>
                      </div>
                      <Badge variant={
                        booking.status === 'Confirmado' ? 'default' :
                        booking.status === 'Finalizado' ? 'secondary' :
                        booking.status === 'Pendente' ? 'destructive' : 'outline'
                      }>
                        {booking.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Pacotes Populares</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {packages.slice(0, 5).map((pkg) => (
                    <div key={pkg.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="font-medium">{pkg.title}</p>
                        <p className="text-sm text-muted-foreground">
                          {pkg.duration} - {pkg.price.toLocaleString('pt-AO', { style: 'currency', currency: 'AOA' })}
                        </p>
                      </div>
                      <div className="flex items-center">
                        <Star className="h-4 w-4 text-yellow-500 mr-1" />
                        <span className="text-sm">{pkg.rating.toFixed(1)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

          <TabsContent value="packages" className="mt-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {packages.map((tour) => (
                        <Card key={tour?.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                          <CardContent className="p-0">
                            <img 
                              src={tour?.images[0]} 
                              alt={tour?.title}
                              className="w-full h-48 object-cover"
                            />
                            <div className="p-6">
                              <h3 className="font-semibold mb-2">{tour?.title}</h3>
                              <p className="text-sm text-muted-foreground mb-4">{tour?.description}</p>
                              
                              <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                      <div className="space-y-2 mb-4">
                            <div className="flex items-center text-sm">
                              <Clock className="h-4 w-4 mr-2" />
                              {tour?.duration}
                            </div>
                            <div className="flex items-center text-sm">
                              <MapPin className="h-4 w-4 mr-2" />
                              {tour?.location}
                            </div>
                            <div className="flex items-center text-sm">
                              <Users className="h-4 w-4 mr-2" />
                              Até {tour?.maxGroupSize} pessoas
                            </div>
                            <div className="flex items-center text-sm">
                              <DollarSign className="h-4 w-4 mr-2" />
                              {tour?.price.toLocaleString('pt-AO', { style: 'currency', currency: 'AOA' })}
                            </div>
                          </div>
                                </div>
                             
                                <span className="font-bold text-primary">{tour?.price?.toLocaleString('pt-AO', { 
                                  style: 'currency', 
                                  currency: 'AOA' 
                                })}</span>
                              </div>
                               <div className="flex gap-2">
                      <Button variant="outline" size="sm"
                      onClick={()=>{
                        setSelectedPackage(tour)
                        setIsEditPackageOpen(true);
                      }}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleDeletePackage(tour.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </TabsContent>
                  

 <Dialog open={isCreatePackageOpen} onOpenChange={setIsCreatePackageOpen}>
  <DialogTrigger asChild>
    <Button>
      <Plus className="h-4 w-4 mr-2" />
      Criar Pacote
    </Button>
  </DialogTrigger>
  
  <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
    <DialogHeader>
      <DialogTitle>Criar Novo Pacote</DialogTitle>
      <DialogDescription>
        Adicione um novo pacote na sua lista de tours. Inclua todos os detalhes necessários.
      </DialogDescription>
    </DialogHeader>
  <div className="space-y-4">
    <div className="grid grid-cols-2 gap-4">
      <div>
        <Label htmlFor="title">Título do Pacote*</Label>
        <Input
          id="title"
          value={newPackage.title}
          onChange={(e) => setNewPackage(prev => ({ ...prev, title: e.target.value }))}
          placeholder="Ex: Tour pela Ilha de Luanda"
        />
      </div>
      <div>
        <Label htmlFor="location">Localização*</Label>
        <Input
          id="location"
          value={newPackage.location}
          onChange={(e) => setNewPackage(prev => ({ ...prev, location: e.target.value }))}
          placeholder="Ex: Luanda, Angola"
        />
      </div>
    </div>

    <div>
      <Label htmlFor="description">Descrição*</Label>
      <Textarea
        id="description"
        value={newPackage.description}
        onChange={(e) => setNewPackage(prev => ({ ...prev, description: e.target.value }))}
        placeholder="Descreva seu pacote turístico..."
        rows={3}
      />
    </div>

    <div className="grid grid-cols-3 gap-4">
      <div>
        <Label htmlFor="duration">Duração*</Label>
        <Select 
          value={newPackage.duration} 
          onValueChange={(value) => setNewPackage(prev => ({ ...prev, duration: value }))}
        >
          <SelectTrigger>
            <SelectValue placeholder="Selecione" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="2 horas">2 horas</SelectItem>
            <SelectItem value="4 horas">4 horas</SelectItem>
            <SelectItem value="1 dia">1 dia</SelectItem>
            <SelectItem value="2 dias">2 dias</SelectItem>
            <SelectItem value="3 dias">3 dias</SelectItem>
            <SelectItem value="1 semana">1 semana</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div>
        <Label htmlFor="price">Preço (AOA)*</Label>
        <Input
          id="price"
          type="number"
          value={newPackage.price}
          onChange={(e) => setNewPackage(prev => ({ ...prev, price: Number(e.target.value) }))}
          placeholder="15000"
          min="0"
        />
      </div>
      <div>
        <Label htmlFor="maxGroupSize">Máx. Grupo*</Label>
        <Input
          id="maxGroupSize"
          type="number"
          value={newPackage.maxGroupSize}
          onChange={(e) => setNewPackage(prev => ({ ...prev, maxGroupSize: Number(e.target.value) }))}
          placeholder="4"
          min="1"
        />
      </div>
    </div>

    {/* Campo para imagens */}
    <div>
      <Label>Imagens (URLs)</Label>
      <p className="text-xs text-muted-foreground mb-2">
        Cole URLs de imagens (ex: links do Google Drive, Imgur, etc.)
      </p>
      {newPackage.images.map((image, index) => (
        <div key={index} className="mt-2">
          <div className="flex gap-2">
            <Input
              value={image}
              onChange={(e) => updateArrayItem('images', index, e.target.value)}
              placeholder="https://exemplo.com/imagem.jpg"
              type="url"
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => removeArrayItem('images', index)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
          {/* Preview da imagem */}
          {image && image.trim() !== '' && (
            <div className="mt-2 relative w-24 h-24 rounded-lg overflow-hidden border">
              <img 
                src={image} 
                alt={`Preview ${index + 1}`}
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = 'https://via.placeholder.com/96?text=Erro';
                }}
              />
            </div>
          )}
        </div>
      ))}
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => addArrayItem('images')}
        className="mt-2"
      >
        <Plus className="h-4 w-4 mr-2" />
        Adicionar Imagem
      </Button>
    </div>

    {/* O que está incluído */}
    <div>
      <Label>O que está incluído</Label>
      {newPackage.includes.map((item, index) => (
        <div key={index} className="flex gap-2 mt-2">
          <Input
            value={item}
            onChange={(e) => updateArrayItem('includes', index, e.target.value)}
            placeholder="Ex: Transporte"
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => removeArrayItem('includes', index)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ))}
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => addArrayItem('includes')}
        className="mt-2"
      >
        <Plus className="h-4 w-4 mr-2" />
        Adicionar Item
      </Button>
    </div>

    {/* O que não está incluído */}
    <div>
      <Label>O que não está incluído</Label>
      {newPackage.excludes.map((item, index) => (
        <div key={index} className="flex gap-2 mt-2">
          <Input
            value={item}
            onChange={(e) => updateArrayItem('excludes', index, e.target.value)}
            placeholder="Ex: Refeições"
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => removeArrayItem('excludes', index)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ))}
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => addArrayItem('excludes')}
        className="mt-2"
      >
        <Plus className="h-4 w-4 mr-2" />
        Adicionar Item
      </Button>
    </div>

    {/* Itinerário */}
    <div>
      <Label>Itinerário</Label>
      {newPackage.itinerary.map((item, index) => (
        <div key={index} className="flex gap-2 mt-2">
          <Input
            value={item}
            onChange={(e) => updateArrayItem('itinerary', index, e.target.value)}
            placeholder="Ex: Dia 1 - Visita ao Museu"
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => removeArrayItem('itinerary', index)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ))}
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => addArrayItem('itinerary')}
        className="mt-2"
      >
        <Plus className="h-4 w-4 mr-2" />
        Adicionar Dia
      </Button>
    </div>

    <div className="flex justify-end gap-2 pt-4">
      <Button variant="outline" onClick={() => setIsCreatePackageOpen(false)}>
        Cancelar
      </Button>
      {isSaving ? (
        <Button disabled={true}>
          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          Criando Pacote...
        </Button>
      ) : (
        <Button 
          onClick={handleCreatePackage} 
          disabled={
         !newPackage.title || 
        !newPackage.location || 
        !newPackage.description || 
        newPackage.price <= 0 ||
        !newPackage.duration ||
        newPackage.maxGroupSize <= 0 ||
        newPackage.images.length === 0 ||
        newPackage.images.some(img => img.trim() === '')
          }
        >
          Criar Pacote
        </Button>
      )}
    </div>
  </div>
 </DialogContent>
</Dialog>

{/* Diálogo de Edição */}
<Dialog open={isEditPackageOpen} onOpenChange={setIsEditPackageOpen}>
  <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
    <DialogHeader>
      <DialogTitle>Editar Pacote</DialogTitle>
      <DialogDescription>
        Atualize os detalhes do seu pacote turístico.
      </DialogDescription>
    </DialogHeader>
    
    {selectedPackage && (
      <div className="space-y-4">
        {/* Campos do formulário (igual ao de criação, mas com os valores de selectedPackage) */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="edit-title">Título do Pacote*</Label>
            <Input
              id="edit-title"
              value={selectedPackage.title}
              onChange={(e) => setSelectedPackage(prev => prev ? ({ ...prev, title: e.target.value }) : null)}
              placeholder="Ex: Tour pela Ilha de Luanda"
            />
          </div>
          <div>
            <Label htmlFor="edit-location">Localização*</Label>
            <Input
              id="edit-location"
              value={selectedPackage.location}
              onChange={(e) => setSelectedPackage(prev => prev ? ({ ...prev, location: e.target.value }) : null)}
              placeholder="Ex: Luanda, Angola"
            />
          </div>
        </div>

          <div>
      <Label htmlFor="description">Descrição*</Label>
      <Textarea
        id="description"
        value={selectedPackage.description}
        onChange={(e) => setSelectedPackage(prev => ({ ...prev, description: e.target.value }))}
        placeholder="Descreva seu pacote turístico..."
        rows={3}
      />
    </div>

    <div className="grid grid-cols-3 gap-4">
      <div>
        <Label htmlFor="duration">Duração*</Label>
        <Select 
          value={selectedPackage.duration} 
          onValueChange={(value) => setSelectedPackage(prev => ({ ...prev, duration: value }))}
        >
          <SelectTrigger>
            <SelectValue placeholder="Selecione" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="2 horas">2 horas</SelectItem>
            <SelectItem value="4 horas">4 horas</SelectItem>
            <SelectItem value="1 dia">1 dia</SelectItem>
            <SelectItem value="2 dias">2 dias</SelectItem>
            <SelectItem value="3 dias">3 dias</SelectItem>
            <SelectItem value="1 semana">1 semana</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div>
        <Label htmlFor="price">Preço (AOA)*</Label>
        <Input
          id="price"
          type="number"
          value={selectedPackage.price}
          onChange={(e) => setSelectedPackage(prev => ({ ...prev, price: Number(e.target.value) }))}
          placeholder="15000"
          min="0"
        />
      </div>
      <div>
        <Label htmlFor="maxGroupSize">Máx. Grupo*</Label>
        <Input
          id="maxGroupSize"
          type="number"
          value={selectedPackage.maxGroupSize}
          onChange={(e) => setSelectedPackage(prev => ({ ...prev, maxGroupSize: Number(e.target.value) }))}
          placeholder="4"
          min="1"
        />
      </div>
    </div>

    {/* Campo para imagens */}
    <div>
      <Label>Imagens (URLs)</Label>
      <p className="text-xs text-muted-foreground mb-2">
        Cole URLs de imagens (ex: links do Google Drive, Imgur, etc.)
      </p>
      {selectedPackage.images.map((image, index) => (
        <div key={index} className="mt-2">
          <div className="flex gap-2">
            <Input
              value={image}
              onChange={(e) => updateSelectedArrayItem('images', index, e.target.value)}
              placeholder="https://exemplo.com/imagem.jpg"
              type="url"
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => removeSelectedArrayItem('images', index)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
          {/* Preview da imagem */}
          {image && image.trim() !== '' && (
            <div className="mt-2 relative w-24 h-24 rounded-lg overflow-hidden border">
              <img 
                src={image} 
                alt={`Preview ${index + 1}`}
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = 'https://via.placeholder.com/96?text=Erro';
                }}
              />
            </div>
          )}
        </div>
      ))}
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => addSelectedArrayItem('images')}
        className="mt-2"
      >
        <Plus className="h-4 w-4 mr-2" />
        Adicionar Imagem
      </Button>
    </div>

    {/* O que está incluído */}
    <div>
      <Label>O que está incluído</Label>
      {selectedPackage.includes.map((item, index) => (
        <div key={index} className="flex gap-2 mt-2">
          <Input
            value={item}
            onChange={(e) => updateSelectedArrayItem('includes', index, e.target.value)}
            placeholder="Ex: Transporte"
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => removeSelectedArrayItem('includes', index)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ))}
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => addSelectedArrayItem('includes')}
        className="mt-2"
      >
        <Plus className="h-4 w-4 mr-2" />
        Adicionar Item
      </Button>
    </div>

    {/* O que não está incluído */}
    <div>
      <Label>O que não está incluído</Label>
      {selectedPackage.excludes.map((item, index) => (
        <div key={index} className="flex gap-2 mt-2">
          <Input
            value={item}
            onChange={(e) => updateSelectedArrayItem('excludes', index, e.target.value)}
            placeholder="Ex: Refeições"
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => removeSelectedArrayItem('excludes', index)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ))}
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => addSelectedArrayItem('excludes')}
        className="mt-2"
      >
        <Plus className="h-4 w-4 mr-2" />
        Adicionar Item
      </Button>
    </div>

    {/* Itinerário */}
    <div>
      <Label>Itinerário</Label>
      {selectedPackage.itinerary.map((item, index) => (
        <div key={index} className="flex gap-2 mt-2">
          <Input
            value={item}
            onChange={(e) => updateSelectedArrayItem('itinerary', index, e.target.value)}
            placeholder="Ex: Dia 1 - Visita ao Museu"
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => removeSelectedArrayItem('itinerary', index)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ))}
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => addSelectedArrayItem('itinerary')}
        className="mt-2"
      >
        <Plus className="h-4 w-4 mr-2" />
        Adicionar Dia
      </Button>
    </div>


        <div className="flex justify-end gap-2 pt-4">
          <Button variant="outline" onClick={() => setIsEditPackageOpen(false)}>
            Cancelar
          </Button>
          {isSaving ? (
            <Button disabled={true}>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Atualizando...
            </Button>
          ) : (
            <Button 
              onClick={handleEditPackage}
              disabled={
                !selectedPackage.title || 
                !selectedPackage.location || 
                !selectedPackage.description || 
                selectedPackage.price <= 0 ||
                !selectedPackage.duration ||
                selectedPackage.maxGroupSize <= 0
              }
            >
              Atualizar Pacote
            </Button>
          )}
        </div>
      </div>
    )}
  </DialogContent>
</Dialog>




        <TabsContent value="bookings" className="space-y-6">
          <h2 className="text-2xl font-bold">Reservas</h2>
          
          <div className="space-y-4">
            {bookings.map((booking) => (
              <Card key={booking.id}>
                <CardContent className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="font-semibold text-lg">{booking.touristName}</h3>
                      <p className="text-muted-foreground">{booking.touristEmail}</p>
                    </div>
                    <Badge variant={
                      booking.status === 'Confirmado' ? 'default' :
                      booking.status === 'Finalizado' ? 'secondary' :
                      booking.status === 'Pendente' ? 'destructive' : 'outline'
                    }>
                      {booking.status}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Data</p>
                      <p className="font-medium">{booking.date}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Horário</p>
                      <p className="font-medium">{booking.time}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Grupo</p>
                      <p className="font-medium">{booking.groupSize} pessoas</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Valor</p>
                      <p className="font-medium">{booking.totalPrice.toLocaleString('pt-AO', { style: 'currency', currency: 'AOA' })}</p>
                    </div>
                  </div>

                  {booking.packageTitle && (
                    <div className="mb-4">
                      <p className="text-sm text-muted-foreground">Pacote</p>
                      <p className="font-medium">{booking.packageTitle}</p>
                    </div>
                  )}

                  {booking.notes && (
                    <div className="mb-4">
                      <p className="text-sm text-muted-foreground">Observações</p>
                      <p>{booking.notes}</p>
                    </div>
                  )}

                  {booking.status === 'Pendente' && (
                    <div className="flex gap-2">
                      <Button 
                        size="sm" 
                        onClick={() => handleUpdateBookingStatus(booking.id, 'Confirmado')}
                      >
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Confirmar
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleUpdateBookingStatus(booking.id, 'Cancelado')}
                      >
                        <XCircle className="h-4 w-4 mr-2" />
                        Cancelar
                      </Button>
                    </div>
                  )}

                  {booking.status === 'Confirmado' && (
                    <Button 
                      size="sm" 
                      onClick={() => handleUpdateBookingStatus(booking.id, 'Finalizado')}
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Marcar como Concluído
                    </Button>
                  )}
                </CardContent>
              </Card>
            ))}

            {bookings.length === 0 && (
              <Card>
                <CardContent className="p-6 text-center">
                  <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Nenhuma reserva encontrada</h3>
                  <p className="text-muted-foreground">
                    Quando você receber reservas, elas aparecerão aqui.
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="map" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <MapPin className="h-5 w-5 mr-2" />
                Mapa  Angola
              </CardTitle>
            </CardHeader>
            <CardContent>
              <GoogleMapsAngola 
                height="600px"
                showSearch={true}
                showControls={true}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
    </div>
  );
}