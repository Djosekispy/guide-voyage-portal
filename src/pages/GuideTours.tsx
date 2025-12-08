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
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [tours, setTours] = useState([
    {
      id: 1,
      title: "City Tour Luanda",
      description: "Explore os principais pontos turísticos da capital angolana",
      duration: "4 horas",
      location: "Luanda",
      price: "15000",
      maxParticipants: 8,
      status: "ativo"
    },
    {
      id: 2,
      title: "Miradouro da Lua",
      description: "Visite as formações rochosas únicas do Miradouro da Lua",
      duration: "6 horas",
      location: "Luanda",
      price: "25000",
      maxParticipants: 6,
      status: "ativo"
    },
    {
      id: 3,
      title: "Fortaleza de São Miguel",
      description: "Descubra a história colonial de Angola",
      duration: "3 horas",
      location: "Luanda",
      price: "12000",
      maxParticipants: 10,
      status: "inativo"
    }
  ]);

  const [newTour, setNewTour] = useState({
    title: "",
    description: "",
    duration: "",
    location: "",
    price: "",
    maxParticipants: "",
    status: "ativo"
  });

  const handleCreateTour = () => {
    const tour = {
      id: tours.length + 1,
      ...newTour,
      maxParticipants: parseInt(newTour.maxParticipants)
    };
    setTours([...tours, tour]);
    setNewTour({
      title: "",
      description: "",
      duration: "",
      location: "",
      price: "",
      maxParticipants: "",
      status: "ativo"
    });
    setIsCreateDialogOpen(false);
  };

  const handleDeleteTour = (id: number) => {
    setTours(tours.filter(tour => tour.id !== id));
  };

  const locations = ["Luanda", "Benguela", "Huambo", "Lobito", "Lubango", "Malanje", "Namibe"];
  const durations = ["2 horas", "3 horas", "4 horas", "6 horas", "8 horas", "1 dia", "2 dias"];

  return (
    <div className="min-h-screen bg-background">
      <Header />
    
         <GuideSidebar />
        
    <div  className="flex-1 lg:ml-64 px-4">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">Meus Passeios</h1>
            <p className="text-muted-foreground">Gerencie seus passeios turísticos</p>
          </div>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Criar Passeio
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[525px]">
              <DialogHeader>
                <DialogTitle>Criar Novo Passeio</DialogTitle>
                <DialogDescription>
                  Preencha os detalhes do seu novo passeio turístico
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="title">Título do Passeio</Label>
                  <Input
                    id="title"
                    value={newTour.title}
                    onChange={(e) => setNewTour({...newTour, title: e.target.value})}
                    placeholder="Ex: City Tour Luanda"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="description">Descrição</Label>
                  <Input
                    id="description"
                    value={newTour.description}
                    onChange={(e) => setNewTour({...newTour, description: e.target.value})}
                    placeholder="Descreva o que será visitado..."
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="duration">Duração</Label>
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
                    <Label htmlFor="location">Local</Label>
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
                    <Label htmlFor="price">Preço (Kz)</Label>
                    <Input
                      id="price"
                      type="number"
                      value={newTour.price}
                      onChange={(e) => setNewTour({...newTour, price: e.target.value})}
                      placeholder="15000"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="maxParticipants">Máx. Participantes</Label>
                    <Input
                      id="maxParticipants"
                      type="number"
                      value={newTour.maxParticipants}
                      onChange={(e) => setNewTour({...newTour, maxParticipants: e.target.value})}
                      placeholder="8"
                    />
                  </div>
                </div>
              </div>
              <div className="flex justify-end gap-4">
                <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button onClick={handleCreateTour}>
                  Criar Passeio
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Tours Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tours.map((tour) => (
            <Card key={tour.id} className="relative">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <CardTitle className="text-lg">{tour.title}</CardTitle>
                  <div className={`px-2 py-1 rounded-full text-xs ${
                    tour.status === 'ativo' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {tour.status}
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
                    <span>Até {tour.maxParticipants} pessoas</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm font-medium">
                    <DollarSign className="h-4 w-4" />
                    <span>{parseInt(tour.price).toLocaleString()} Kz</span>
                  </div>
                </div>
                <div className="flex gap-2 mt-4">
                  <Button variant="outline" size="sm" className="flex-1">
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
