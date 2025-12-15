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
import { Plus, Edit2, Trash2, MapPin, Clock, Users, DollarSign, Loader2, Eye, Image } from "lucide-react";
import GuideSidebar from "@/components/GuideSidebar";
import { useToast } from "@/hooks/use-toast";
import {
  getGuidePackages,
  getGuideProfile,
  createTourPackage,
  updateTourPackage,
  deleteTourPackage,
  TourPackage,
} from "@/lib/firestore";

const GuideTours = () => {
  const { user, userData, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [tours, setTours] = useState<TourPackage[]>([]);
  const [selectedTour, setSelectedTour] = useState<TourPackage | null>(null);
  const [guideId, setGuideId] = useState<string>("");

  const [newTour, setNewTour] = useState({
    title: "",
    description: "",
    duration: "",
    location: "",
    price: "",
    maxGroupSize: "",
    includes: [""],
    excludes: [""],
    itinerary: [""],
    images: [""]
  });

  useEffect(() => {
    if (user && userData?.userType === 'guide') {
      loadTours();
    }
  }, [user, userData]);

  const loadTours = async () => {
    try {
      setLoading(true);
      if (!user?.uid) return;

      const guideProfile = await getGuideProfile(user.uid);
      if (guideProfile) {
        // Usar uid para criar pacotes (consistente com verificação de booking)
        setGuideId(user.uid);
        const packages = await getGuidePackages(user.uid);
        setTours(packages);
      }
    } catch (error) {
      console.error('Erro ao carregar pacotes:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar seus pacotes",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTour = async () => {
    if (!guideId || !userData) return;

    setIsSaving(true);
    try {
      const filteredPackage = {
        title: newTour.title,
        description: newTour.description,
        duration: newTour.duration,
        location: newTour.location,
        price: parseFloat(newTour.price) || 0,
        maxGroupSize: parseInt(newTour.maxGroupSize) || 1,
        includes: newTour.includes.filter(item => item.trim() !== ''),
        excludes: newTour.excludes.filter(item => item.trim() !== ''),
        itinerary: newTour.itinerary.filter(item => item.trim() !== ''),
        images: newTour.images.filter(item => item.trim() !== ''),
        guideId: guideId,
        guideName: userData.name,
        isActive: true,
        rating: 0,
        reviewCount: 0
      };

      await createTourPackage(filteredPackage);

      toast({
        title: "Sucesso!",
        description: "Pacote criado com sucesso"
      });

      setNewTour({
        title: "",
        description: "",
        duration: "",
        location: "",
        price: "",
        maxGroupSize: "",
        includes: [""],
        excludes: [""],
        itinerary: [""],
        images: [""]
      });
      setIsCreateDialogOpen(false);
      loadTours();
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

  const handleEditTour = async () => {
    if (!selectedTour) return;

    setIsSaving(true);
    try {
      const filteredPackage = {
        ...selectedTour,
        includes: selectedTour.includes.filter(item => item.trim() !== ''),
        excludes: selectedTour.excludes.filter(item => item.trim() !== ''),
        itinerary: selectedTour.itinerary.filter(item => item.trim() !== ''),
        images: selectedTour.images.filter(item => item.trim() !== '')
      };

      await updateTourPackage(selectedTour.id, filteredPackage);

      toast({
        title: "Sucesso!",
        description: "Pacote atualizado com sucesso"
      });

      setIsEditDialogOpen(false);
      setSelectedTour(null);
      loadTours();
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

  const handleDeleteTour = async (id: string) => {
    try {
      await deleteTourPackage(id);
      toast({
        title: "Sucesso!",
        description: "Pacote removido com sucesso"
      });
      loadTours();
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível remover o pacote",
        variant: "destructive"
      });
    }
  };

  const openEditDialog = (tour: TourPackage) => {
    setSelectedTour({
      ...tour,
      includes: tour.includes?.length ? tour.includes : [""],
      excludes: tour.excludes?.length ? tour.excludes : [""],
      itinerary: tour.itinerary?.length ? tour.itinerary : [""],
      images: tour.images?.length ? tour.images : [""]
    });
    setIsEditDialogOpen(true);
  };

  const addArrayItem = (field: 'includes' | 'excludes' | 'itinerary' | 'images', isEdit: boolean = false) => {
    if (isEdit && selectedTour) {
      setSelectedTour(prev => prev ? ({
        ...prev,
        [field]: [...prev[field], '']
      }) : null);
    } else {
      setNewTour(prev => ({
        ...prev,
        [field]: [...prev[field], '']
      }));
    }
  };

  const removeArrayItem = (field: 'includes' | 'excludes' | 'itinerary' | 'images', index: number, isEdit: boolean = false) => {
    if (isEdit && selectedTour) {
      setSelectedTour(prev => prev ? ({
        ...prev,
        [field]: prev[field].filter((_, i) => i !== index)
      }) : null);
    } else {
      setNewTour(prev => ({
        ...prev,
        [field]: prev[field].filter((_, i) => i !== index)
      }));
    }
  };

  const updateArrayItem = (field: 'includes' | 'excludes' | 'itinerary' | 'images', index: number, value: string, isEdit: boolean = false) => {
    if (isEdit && selectedTour) {
      setSelectedTour(prev => prev ? ({
        ...prev,
        [field]: prev[field].map((item, i) => i === index ? value : item)
      }) : null);
    } else {
      setNewTour(prev => ({
        ...prev,
        [field]: prev[field].map((item, i) => i === index ? value : item)
      }));
    }
  };

  const locations = ["Luanda", "Benguela", "Huambo", "Lobito", "Lubango", "Malanje", "Namibe", "Cabinda", "Huíla", "Bié"];
  const durations = ["2 horas", "3 horas", "4 horas", "6 horas", "8 horas", "1 dia", "2 dias", "3 dias", "1 semana"];

  const renderPackageForm = (data: typeof newTour | TourPackage, isEdit: boolean = false) => (
    <div className="grid gap-4 py-4 max-h-[70vh] overflow-y-auto">
      <div className="grid gap-2">
        <Label htmlFor="title">Título do Pacote</Label>
        <Input
          id="title"
          value={data.title}
          onChange={(e) => isEdit && selectedTour 
            ? setSelectedTour({...selectedTour, title: e.target.value})
            : setNewTour({...newTour, title: e.target.value})
          }
          placeholder="Ex: City Tour Luanda"
        />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="description">Descrição</Label>
        <Textarea
          id="description"
          value={data.description}
          onChange={(e) => isEdit && selectedTour 
            ? setSelectedTour({...selectedTour, description: e.target.value})
            : setNewTour({...newTour, description: e.target.value})
          }
          placeholder="Descreva o que será visitado..."
          rows={3}
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="grid gap-2">
          <Label htmlFor="duration">Duração</Label>
          <Select 
            value={data.duration} 
            onValueChange={(value) => isEdit && selectedTour 
              ? setSelectedTour({...selectedTour, duration: value})
              : setNewTour({...newTour, duration: value})
            }
          >
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
          <Label htmlFor="location">Local</Label>
          <Select 
            value={data.location} 
            onValueChange={(value) => isEdit && selectedTour 
              ? setSelectedTour({...selectedTour, location: value})
              : setNewTour({...newTour, location: value})
            }
          >
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
          <Label htmlFor="price">Preço (Kz)</Label>
          <Input
            id="price"
            type="number"
            value={isEdit ? (data as TourPackage).price : (data as typeof newTour).price}
            onChange={(e) => isEdit && selectedTour 
              ? setSelectedTour({...selectedTour, price: parseFloat(e.target.value) || 0})
              : setNewTour({...newTour, price: e.target.value})
            }
            placeholder="15000"
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="maxGroupSize">Máx. Participantes</Label>
          <Input
            id="maxGroupSize"
            type="number"
            value={isEdit ? (data as TourPackage).maxGroupSize : (data as typeof newTour).maxGroupSize}
            onChange={(e) => isEdit && selectedTour 
              ? setSelectedTour({...selectedTour, maxGroupSize: parseInt(e.target.value) || 1})
              : setNewTour({...newTour, maxGroupSize: e.target.value})
            }
            placeholder="8"
          />
        </div>
      </div>

      {/* Imagens */}
      <div className="grid gap-2">
        <Label className="flex items-center gap-2">
          <Image className="h-4 w-4" />
          Imagens (URLs)
        </Label>
        {(isEdit ? (data as TourPackage).images : (data as typeof newTour).images).map((img, index) => (
          <div key={index} className="flex gap-2">
            <Input
              value={img}
              onChange={(e) => updateArrayItem('images', index, e.target.value, isEdit)}
              placeholder="https://exemplo.com/imagem.jpg"
            />
            {img && (
              <img src={img} alt="preview" className="h-10 w-10 object-cover rounded" onError={(e) => (e.target as HTMLImageElement).style.display = 'none'} />
            )}
            <Button type="button" variant="outline" size="icon" onClick={() => removeArrayItem('images', index, isEdit)}>
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ))}
        <Button type="button" variant="outline" size="sm" onClick={() => addArrayItem('images', isEdit)}>
          <Plus className="h-4 w-4 mr-1" /> Adicionar Imagem
        </Button>
      </div>

      {/* Inclui */}
      <div className="grid gap-2">
        <Label>O que está incluído</Label>
        {(isEdit ? (data as TourPackage).includes : (data as typeof newTour).includes).map((item, index) => (
          <div key={index} className="flex gap-2">
            <Input
              value={item}
              onChange={(e) => updateArrayItem('includes', index, e.target.value, isEdit)}
              placeholder="Ex: Transporte, Almoço..."
            />
            <Button type="button" variant="outline" size="icon" onClick={() => removeArrayItem('includes', index, isEdit)}>
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ))}
        <Button type="button" variant="outline" size="sm" onClick={() => addArrayItem('includes', isEdit)}>
          <Plus className="h-4 w-4 mr-1" /> Adicionar
        </Button>
      </div>

      {/* Não inclui */}
      <div className="grid gap-2">
        <Label>O que não está incluído</Label>
        {(isEdit ? (data as TourPackage).excludes : (data as typeof newTour).excludes).map((item, index) => (
          <div key={index} className="flex gap-2">
            <Input
              value={item}
              onChange={(e) => updateArrayItem('excludes', index, e.target.value, isEdit)}
              placeholder="Ex: Bebidas alcoólicas..."
            />
            <Button type="button" variant="outline" size="icon" onClick={() => removeArrayItem('excludes', index, isEdit)}>
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ))}
        <Button type="button" variant="outline" size="sm" onClick={() => addArrayItem('excludes', isEdit)}>
          <Plus className="h-4 w-4 mr-1" /> Adicionar
        </Button>
      </div>

      {/* Itinerário */}
      <div className="grid gap-2">
        <Label>Itinerário</Label>
        {(isEdit ? (data as TourPackage).itinerary : (data as typeof newTour).itinerary).map((item, index) => (
          <div key={index} className="flex gap-2">
            <Input
              value={item}
              onChange={(e) => updateArrayItem('itinerary', index, e.target.value, isEdit)}
              placeholder={`Passo ${index + 1}: ...`}
            />
            <Button type="button" variant="outline" size="icon" onClick={() => removeArrayItem('itinerary', index, isEdit)}>
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ))}
        <Button type="button" variant="outline" size="sm" onClick={() => addArrayItem('itinerary', isEdit)}>
          <Plus className="h-4 w-4 mr-1" /> Adicionar Passo
        </Button>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <GuideSidebar />
        <div className="flex-1 lg:ml-64 px-4 flex items-center justify-center min-h-[60vh]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <GuideSidebar />
        
      <div className="flex-1 lg:ml-64 px-4 pt-4">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">Meus Pacotes</h1>
            <p className="text-muted-foreground">Gerencie seus pacotes turísticos</p>
          </div>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Criar Pacote
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>Criar Novo Pacote</DialogTitle>
                <DialogDescription>
                  Preencha os detalhes do seu novo pacote turístico
                </DialogDescription>
              </DialogHeader>
              {renderPackageForm(newTour)}
              <div className="flex justify-end gap-4">
                <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button onClick={handleCreateTour} disabled={isSaving}>
                  {isSaving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                  Criar Pacote
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Edit Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Editar Pacote</DialogTitle>
              <DialogDescription>
                Atualize os detalhes do seu pacote
              </DialogDescription>
            </DialogHeader>
            {selectedTour && renderPackageForm(selectedTour, true)}
            <div className="flex justify-end gap-4">
              <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleEditTour} disabled={isSaving}>
                {isSaving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                Salvar Alterações
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Tours Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tours.map((tour) => (
            <Card key={tour.id} className="relative overflow-hidden">
              {tour.images?.[0] && (
                <img 
                  src={tour.images[0]} 
                  alt={tour.title}
                  className="w-full h-40 object-cover"
                />
              )}
              <CardHeader>
                <div className="flex justify-between items-start">
                  <CardTitle className="text-lg">{tour.title}</CardTitle>
                  <div className={`px-2 py-1 rounded-full text-xs ${
                    tour.isActive 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {tour.isActive ? 'Ativo' : 'Inativo'}
                  </div>
                </div>
                <CardDescription className="line-clamp-2">
                  {tour.description}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <MapPin className="h-4 w-4" />
                    <span>{tour.location}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    <span>{tour.duration}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Users className="h-4 w-4" />
                    <span>Até {tour.maxGroupSize} pessoas</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm font-medium">
                    <DollarSign className="h-4 w-4" />
                    <span>{tour.price.toLocaleString()} Kz</span>
                  </div>
                </div>
                <div className="flex gap-2 mt-4">
                  <Button variant="outline" size="sm" className="flex-1" onClick={() => openEditDialog(tour)}>
                    <Edit2 className="mr-1 h-3 w-3" />
                    Editar
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => handleDeleteTour(tour.id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {tours.length === 0 && (
          <Card className="text-center py-12">
            <CardContent>
              <MapPin className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">Nenhum passeio criado</h3>
              <p className="text-muted-foreground mb-4">
                Comece criando seu primeiro passeio turístico
              </p>
              <Button onClick={() => setIsCreateDialogOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Criar Primeiro Passeio
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default GuideTours;