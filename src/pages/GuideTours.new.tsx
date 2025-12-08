import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Plus, Edit2, Trash2, MapPin, Clock, Users, DollarSign, AlertCircle } from "lucide-react";
import GuideSidebar from "@/components/GuideSidebar";
import { useToast } from "@/hooks/use-toast";
import {
  getGuidePackages,
  createTourPackage,
  updateTourPackage,
  deleteTourPackage,
  TourPackage,
} from "@/lib/firestore";

const GuideTours = () => {
  const { userData, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  // States
  const [tours, setTours] = useState<TourPackage[]>([]);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingTourId, setEditingTourId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [newTour, setNewTour] = useState({
    title: "",
    description: "",
    duration: "",
    location: "",
    price: "",
    maxGroupSize: "",
    includes: "",
    excludes: "",
    itinerary: "",
  });

  const locations = ["Luanda", "Benguela", "Huambo", "Lobito", "Lubango", "Malanje", "Namibe", "Cabinda"];
  const durations = ["2 horas", "3 horas", "4 horas", "6 horas", "8 horas", "1 dia", "2 dias"];

  // Check if user is a guide
  useEffect(() => {
    if (!authLoading && userData?.userType !== 'guide') {
      navigate('/');
    }
  }, [userData, authLoading, navigate]);

  // Load guide's packages
  useEffect(() => {
    const loadTours = async () => {
      if (!userData?.uid) return;

      try {
        setLoading(true);
        setError("");
        const data = await getGuidePackages(userData.uid);
        setTours(data);
      } catch (err) {
        console.error("Erro ao carregar passeios:", err);
        setError("Não foi possível carregar seus passeios");
        toast({
          title: "Erro",
          description: "Não foi possível carregar seus passeios",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    loadTours();
  }, [userData?.uid, toast]);

  const handleCreateTour = async () => {
    // Validações
    if (!newTour.title.trim()) {
      toast({
        title: "Erro",
        description: "Título é obrigatório",
        variant: "destructive",
      });
      return;
    }

    if (!newTour.description.trim()) {
      toast({
        title: "Erro",
        description: "Descrição é obrigatória",
        variant: "destructive",
      });
      return;
    }

    if (!newTour.duration) {
      toast({
        title: "Erro",
        description: "Duração é obrigatória",
        variant: "destructive",
      });
      return;
    }

    if (!newTour.location) {
      toast({
        title: "Erro",
        description: "Local é obrigatório",
        variant: "destructive",
      });
      return;
    }

    if (!newTour.price || isNaN(Number(newTour.price))) {
      toast({
        title: "Erro",
        description: "Preço válido é obrigatório",
        variant: "destructive",
      });
      return;
    }

    if (!newTour.maxGroupSize || isNaN(Number(newTour.maxGroupSize))) {
      toast({
        title: "Erro",
        description: "Máximo de participantes válido é obrigatório",
        variant: "destructive",
      });
      return;
    }

    try {
      const packageData = {
        guideId: userData!.uid,
        guideName: userData!.name || "Guia",
        title: newTour.title,
        description: newTour.description,
        duration: newTour.duration,
        price: Number(newTour.price),
        maxGroupSize: Number(newTour.maxGroupSize),
        location: newTour.location,
        includes: newTour.includes.split('\n').filter(i => i.trim()),
        excludes: newTour.excludes.split('\n').filter(e => e.trim()),
        itinerary: newTour.itinerary.split('\n').filter(i => i.trim()),
        images: [],
        isActive: true,
        rating: 0,
        reviewCount: 0,
      };

      if (isEditMode && editingTourId) {
        // Atualizar pacote existente
        await updateTourPackage(editingTourId, packageData);
        setTours(
          tours.map(t => t.id === editingTourId ? { ...t, ...packageData } : t)
        );
        toast({
          title: "Sucesso",
          description: "Passeio atualizado com sucesso!",
        });
      } else {
        // Criar novo pacote
        const id = await createTourPackage(packageData as any);
        setTours([
          ...tours,
          {
            id,
            ...packageData,
            createdAt: new Date(),
            updatedAt: new Date(),
          } as TourPackage,
        ]);
        toast({
          title: "Sucesso",
          description: "Passeio criado com sucesso!",
        });
      }

      // Reset form
      setNewTour({
        title: "",
        description: "",
        duration: "",
        location: "",
        price: "",
        maxGroupSize: "",
        includes: "",
        excludes: "",
        itinerary: "",
      });
      setIsCreateDialogOpen(false);
      setIsEditMode(false);
      setEditingTourId(null);
    } catch (err) {
      console.error("Erro ao salvar passeio:", err);
      toast({
        title: "Erro",
        description: "Não foi possível salvar o passeio",
        variant: "destructive",
      });
    }
  };

  const handleEditTour = (tour: TourPackage) => {
    setNewTour({
      title: tour.title,
      description: tour.description,
      duration: tour.duration,
      location: tour.location,
      price: tour.price.toString(),
      maxGroupSize: tour.maxGroupSize.toString(),
      includes: tour.includes.join('\n'),
      excludes: tour.excludes.join('\n'),
      itinerary: tour.itinerary.join('\n'),
    });
    setEditingTourId(tour.id);
    setIsEditMode(true);
    setIsCreateDialogOpen(true);
  };

  const handleDeleteTour = async (tourId: string) => {
    if (!confirm("Tem certeza que deseja deletar este passeio?")) return;

    try {
      await deleteTourPackage(tourId);
      setTours(tours.filter(t => t.id !== tourId));
      toast({
        title: "Sucesso",
        description: "Passeio deletado com sucesso!",
      });
    } catch (err) {
      console.error("Erro ao deletar passeio:", err);
      toast({
        title: "Erro",
        description: "Não foi possível deletar o passeio",
        variant: "destructive",
      });
    }
  };

  const handleToggleActive = async (tour: TourPackage) => {
    try {
      const updatedTour = { ...tour, isActive: !tour.isActive };
      await updateTourPackage(tour.id, { isActive: !tour.isActive });
      setTours(tours.map(t => t.id === tour.id ? updatedTour : t));
      toast({
        title: "Sucesso",
        description: `Passeio ${!tour.isActive ? 'ativado' : 'desativado'}!`,
      });
    } catch (err) {
      console.error("Erro ao atualizar passeio:", err);
      toast({
        title: "Erro",
        description: "Não foi possível atualizar o passeio",
        variant: "destructive",
      });
    }
  };

  const handleCloseDialog = () => {
    setIsCreateDialogOpen(false);
    setIsEditMode(false);
    setEditingTourId(null);
    setNewTour({
      title: "",
      description: "",
      duration: "",
      location: "",
      price: "",
      maxGroupSize: "",
      includes: "",
      excludes: "",
      itinerary: "",
    });
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="flex pt-16">
          <GuideSidebar />
          <div className="flex-1 lg:ml-64 flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <div className="flex pt-16">
        <GuideSidebar />

        <div className="flex-1 lg:ml-64 p-6">
          <div className="max-w-6xl mx-auto space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-3xl font-bold text-foreground mb-2">Meus Passeios</h1>
                <p className="text-muted-foreground">Crie e gerencie seus passeios turísticos</p>
              </div>
              <Dialog open={isCreateDialogOpen} onOpenChange={handleCloseDialog}>
                <DialogTrigger asChild>
                  <Button onClick={() => {
                    setIsEditMode(false);
                    setEditingTourId(null);
                    setNewTour({
                      title: "",
                      description: "",
                      duration: "",
                      location: "",
                      price: "",
                      maxGroupSize: "",
                      includes: "",
                      excludes: "",
                      itinerary: "",
                    });
                  }}>
                    <Plus className="mr-2 h-4 w-4" />
                    Criar Passeio
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>
                      {isEditMode ? "Editar Passeio" : "Criar Novo Passeio"}
                    </DialogTitle>
                    <DialogDescription>
                      {isEditMode 
                        ? "Atualize os detalhes do seu passeio turístico" 
                        : "Preencha os detalhes do seu novo passeio turístico"}
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                      <Label htmlFor="title">Título do Passeio *</Label>
                      <Input
                        id="title"
                        value={newTour.title}
                        onChange={(e) => setNewTour({...newTour, title: e.target.value})}
                        placeholder="Ex: City Tour Luanda"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="description">Descrição *</Label>
                      <Textarea
                        id="description"
                        value={newTour.description}
                        onChange={(e) => setNewTour({...newTour, description: e.target.value})}
                        placeholder="Descreva o que será visitado..."
                        rows={3}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="grid gap-2">
                        <Label htmlFor="duration">Duração *</Label>
                        <Select value={newTour.duration} onValueChange={(value) => setNewTour({...newTour, duration: value})}>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione" />
                          </SelectTrigger>
                          <SelectContent>
                            {durations.map((duration) => (
                              <SelectItem key={duration} value={duration}>{duration}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="location">Local *</Label>
                        <Select value={newTour.location} onValueChange={(value) => setNewTour({...newTour, location: value})}>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione" />
                          </SelectTrigger>
                          <SelectContent>
                            {locations.map((location) => (
                              <SelectItem key={location} value={location}>{location}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="grid gap-2">
                        <Label htmlFor="price">Preço (Kz) *</Label>
                        <Input
                          id="price"
                          type="number"
                          value={newTour.price}
                          onChange={(e) => setNewTour({...newTour, price: e.target.value})}
                          placeholder="15000"
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="maxGroupSize">Máx. Participantes *</Label>
                        <Input
                          id="maxGroupSize"
                          type="number"
                          value={newTour.maxGroupSize}
                          onChange={(e) => setNewTour({...newTour, maxGroupSize: e.target.value})}
                          placeholder="8"
                        />
                      </div>
                    </div>

                    <div className="grid gap-2">
                      <Label htmlFor="includes">Incluso (um por linha)</Label>
                      <Textarea
                        id="includes"
                        value={newTour.includes}
                        onChange={(e) => setNewTour({...newTour, includes: e.target.value})}
                        placeholder="Ex: Transporte&#10;Guia turístico&#10;Almoço"
                        rows={3}
                      />
                    </div>

                    <div className="grid gap-2">
                      <Label htmlFor="excludes">Não Incluso (um por linha)</Label>
                      <Textarea
                        id="excludes"
                        value={newTour.excludes}
                        onChange={(e) => setNewTour({...newTour, excludes: e.target.value})}
                        placeholder="Ex: Bebidas&#10;Gorjetas"
                        rows={3}
                      />
                    </div>

                    <div className="grid gap-2">
                      <Label htmlFor="itinerary">Itinerário (um por linha)</Label>
                      <Textarea
                        id="itinerary"
                        value={newTour.itinerary}
                        onChange={(e) => setNewTour({...newTour, itinerary: e.target.value})}
                        placeholder="Ex: 8:00 - Encontro no hotel&#10;9:00 - Visita ao museu&#10;12:00 - Almoço"
                        rows={4}
                      />
                    </div>
                  </div>
                  <div className="flex justify-end gap-4">
                    <Button variant="outline" onClick={handleCloseDialog}>
                      Cancelar
                    </Button>
                    <Button onClick={handleCreateTour}>
                      {isEditMode ? "Atualizar Passeio" : "Criar Passeio"}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {/* Tours Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {tours.map((tour) => (
                <Card key={tour.id} className="relative overflow-hidden hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex justify-between items-start gap-2">
                      <div className="flex-1">
                        <CardTitle className="text-lg line-clamp-2">{tour.title}</CardTitle>
                        <CardDescription className="line-clamp-2 mt-2">
                          {tour.description}
                        </CardDescription>
                      </div>
                      <div className={`px-2 py-1 rounded-full text-xs font-medium whitespace-nowrap ${
                        tour.isActive
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {tour.isActive ? 'Ativo' : 'Inativo'}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {/* Tour Details */}
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <MapPin className="h-4 w-4 flex-shrink-0" />
                          <span>{tour.location}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Clock className="h-4 w-4 flex-shrink-0" />
                          <span>{tour.duration}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Users className="h-4 w-4 flex-shrink-0" />
                          <span>Até {tour.maxGroupSize} pessoas</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm font-medium text-primary">
                          <DollarSign className="h-4 w-4 flex-shrink-0" />
                          <span>{tour.price.toLocaleString()} Kz</span>
                        </div>
                      </div>

                      {/* Includes/Excludes Preview */}
                      {tour.includes.length > 0 && (
                        <div className="text-xs">
                          <p className="font-medium text-green-700">Incluso:</p>
                          <ul className="list-disc list-inside text-muted-foreground">
                            {tour.includes.slice(0, 2).map((item, idx) => (
                              <li key={idx} className="line-clamp-1">{item}</li>
                            ))}
                            {tour.includes.length > 2 && (
                              <li className="text-muted-foreground">+{tour.includes.length - 2} mais</li>
                            )}
                          </ul>
                        </div>
                      )}

                      {/* Actions */}
                      <div className="flex gap-2 pt-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1"
                          onClick={() => handleEditTour(tour)}
                        >
                          <Edit2 className="mr-1 h-3 w-3" />
                          Editar
                        </Button>
                        <Button
                          variant={tour.isActive ? "outline" : "default"}
                          size="sm"
                          className="flex-1"
                          onClick={() => handleToggleActive(tour)}
                        >
                          {tour.isActive ? "Desativar" : "Ativar"}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteTour(tour.id)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {tours.length === 0 && !loading && (
              <Card className="text-center py-12">
                <CardContent>
                  <MapPin className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">Nenhum passeio criado</h3>
                  <p className="text-muted-foreground mb-6">
                    Comece criando seu primeiro passeio turístico para que turistas possam reservar
                  </p>
                  <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                    <DialogTrigger asChild>
                      <Button>
                        <Plus className="mr-2 h-4 w-4" />
                        Criar Primeiro Passeio
                      </Button>
                    </DialogTrigger>
                  </Dialog>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default GuideTours;
