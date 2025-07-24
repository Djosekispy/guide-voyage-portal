import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Search, MapPin, Languages, Star, Phone, Mail, Calendar, Clock, Users } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import Header from "@/components/Header";
import GoogleMapsAngola from "@/components/GoogleMapsAngola";

const BrowseGuides = () => {
  const [searchParams] = useSearchParams();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedGuide, setSelectedGuide] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { toast } = useToast();

  // Inicializar busca com parâmetros da URL
  useEffect(() => {
    const cityParam = searchParams.get('city');
    if (cityParam) {
      setSearchTerm(cityParam);
    }
  }, [searchParams]);

  const guides = [
    {
      id: 1,
      name: "Maria Santos",
      city: "Luanda",
      coordinates: { lat: -8.8390, lng: 13.2894 },
      rating: 4.9,
      reviews: 45,
      languages: ["Português", "Inglês", "Francês"],
      specialties: ["História", "Cultura", "Gastronomia"],
      image: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face",
      price: "80.000 Kz/dia",
      phone: "+244 923 456 789",
      email: "maria@example.com",
      experience: "5 anos",
      description: "Especialista em tours históricos e culturais pela capital angolana. Conheço cada cantinho de Luanda e posso te mostrar desde os museus mais importantes até os melhores locais para provar a culinária local.",
      tours: [
        { name: "Tour Histórico Luanda", duration: "4 horas", price: "80.000 Kz" },
        { name: "Gastronomia Local", duration: "3 horas", price: "60.000 Kz" },
        { name: "Museus e Arte", duration: "5 horas", price: "100.000 Kz" }
      ]
    },
    {
      id: 2,
      name: "João Fernandes",
      city: "Malanje",
      coordinates: { lat: -9.5402, lng: 16.3411 },
      rating: 4.8,
      reviews: 32,
      languages: ["Português", "Inglês"],
      specialties: ["Natureza", "Aventura", "Fotografia"],
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
      price: "120.000 Kz/dia",
      phone: "+244 934 567 890",
      email: "joao@example.com",
      experience: "7 anos",
      description: "Guia especializado em tours pelas Quedas de Kalandula e Pedras Negras. Apaixonado por natureza e fotografia, garanto as melhores vistas e experiências únicas.",
      tours: [
        { name: "Quedas de Kalandula", duration: "8 horas", price: "150.000 Kz" },
        { name: "Pedras Negras", duration: "6 horas", price: "120.000 Kz" },
        { name: "Safari Fotográfico", duration: "10 horas", price: "200.000 Kz" }
      ]
    },
    {
      id: 3,
      name: "Ana Pereira",
      city: "Lubango",
      coordinates: { lat: -14.9177, lng: 13.4892 },
      rating: 4.7,
      reviews: 28,
      languages: ["Português", "Inglês", "Espanhol"],
      specialties: ["Montanhismo", "Paisagens", "Aventura"],
      image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face",
      price: "150.000 Kz/dia",
      phone: "+244 945 678 901",
      email: "ana@example.com",
      experience: "6 anos",
      description: "Especialista em tours pela Serra da Leba e Cristo Rei. Amo montanhas e paisagens espetaculares, proporcionando aventuras inesquecíveis.",
      tours: [
        { name: "Serra da Leba", duration: "6 horas", price: "130.000 Kz" },
        { name: "Cristo Rei", duration: "4 horas", price: "90.000 Kz" },
        { name: "Trekking Aventura", duration: "8 horas", price: "180.000 Kz" }
      ]
    },
    {
      id: 4,
      name: "Carlos Mbala",
      city: "Namibe",
      coordinates: { lat: -15.1955, lng: 12.1525 },
      rating: 4.9,
      reviews: 38,
      languages: ["Português", "Inglês"],
      specialties: ["Deserto", "Geologia", "Astronomia"],
      image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
      price: "200.000 Kz/dia",
      phone: "+244 956 789 012",
      email: "carlos@example.com",
      experience: "10 anos",
      description: "Guia especializado no Deserto do Namibe e astronomia noturna. Conheço cada duna e posso te mostrar as estrelas como nunca viu antes.",
      tours: [
        { name: "Deserto do Namibe", duration: "12 horas", price: "250.000 Kz" },
        { name: "Observação Noturna", duration: "6 horas", price: "180.000 Kz" },
        { name: "Geologia do Deserto", duration: "8 horas", price: "200.000 Kz" }
      ]
    }
  ];

  const filteredGuides = guides.filter(guide => 
    guide.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    guide.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
    guide.specialties.some(specialty => 
      specialty.toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  const openGuideModal = (guide: any) => {
    setSelectedGuide(guide);
    setIsModalOpen(true);
  };

  const handleContact = (guide: any) => {
    window.open(`tel:${guide.phone}`, '_blank');
    toast({
      title: "Iniciando chamada",
      description: `Ligando para ${guide.name}...`,
    });
  };

  const handleBooking = (guide: any) => {
    toast({
      title: "Redirecionando para reserva",
      description: `Em breve você poderá reservar com ${guide.name}`,
    });
    // Aqui seria implementada a lógica de reserva
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="pt-24">
        {/* Hero Section */}
        <section className="bg-gradient-to-r from-primary/10 to-secondary/10 py-16">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-6">
              Descubra Guias em Angola
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
              Encontre guias locais experientes para explorar as maravilhas de Angola
            </p>
            
            {/* Search */}
            <div className="max-w-md mx-auto relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
              <Input
                placeholder="Buscar por guia, cidade ou especialidade..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-12 py-3 text-lg"
              />
            </div>
          </div>
        </section>

        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Map Section */}
            <div className="order-2 lg:order-1">
              <Card className="h-96 lg:h-[600px]">
                <CardContent className="p-0 h-full">
                  <GoogleMapsAngola height="100%" showSearch={true} showControls={true} />
                </CardContent>
              </Card>
            </div>

            {/* Guides List */}
            <div className="order-1 lg:order-2">
              <div className="mb-6">
                <p className="text-muted-foreground">
                  {filteredGuides.length} guia{filteredGuides.length !== 1 ? 's' : ''} encontrado{filteredGuides.length !== 1 ? 's' : ''}
                </p>
              </div>

              <div className="space-y-4 max-h-[600px] overflow-y-auto">
                {filteredGuides.map((guide) => (
                  <Card 
                    key={guide.id} 
                    className="cursor-pointer hover:shadow-lg transition-shadow"
                    onClick={() => openGuideModal(guide)}
                  >
                    <CardContent className="p-4">
                      <div className="flex gap-4">
                        <img 
                          src={guide.image} 
                          alt={guide.name}
                          className="w-16 h-16 rounded-full object-cover"
                        />
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-2">
                            <h3 className="font-bold text-lg">{guide.name}</h3>
                            <div className="flex items-center gap-1">
                              <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                              <span className="text-sm font-medium">{guide.rating}</span>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-2 mb-2">
                            <MapPin className="w-4 h-4 text-muted-foreground" />
                            <span className="text-sm text-muted-foreground">{guide.city}</span>
                          </div>
                          
                          <div className="flex flex-wrap gap-1 mb-3">
                            {guide.specialties.slice(0, 2).map((specialty) => (
                              <Badge key={specialty} variant="secondary" className="text-xs">
                                {specialty}
                              </Badge>
                            ))}
                            {guide.specialties.length > 2 && (
                              <Badge variant="outline" className="text-xs">
                                +{guide.specialties.length - 2}
                              </Badge>
                            )}
                          </div>
                          
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-primary">{guide.price}</span>
                            <span className="text-sm text-muted-foreground">
                              {guide.reviews} avaliações
                            </span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Guide Profile Modal */}
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            {selectedGuide && (
              <>
                <DialogHeader>
                  <DialogTitle className="sr-only">Perfil do Guia</DialogTitle>
                </DialogHeader>
                
                <div className="space-y-6">
                  {/* Header */}
                  <div className="flex flex-col md:flex-row gap-6">
                    <img 
                      src={selectedGuide.image} 
                      alt={selectedGuide.name}
                      className="w-32 h-32 rounded-full object-cover mx-auto md:mx-0"
                    />
                    <div className="flex-1 text-center md:text-left">
                      <h2 className="text-3xl font-bold mb-2">{selectedGuide.name}</h2>
                      <div className="flex items-center justify-center md:justify-start gap-2 mb-3">
                        <MapPin className="w-5 h-5 text-muted-foreground" />
                        <span className="text-lg text-muted-foreground">{selectedGuide.city}</span>
                      </div>
                      <div className="flex items-center justify-center md:justify-start gap-4 mb-4">
                        <div className="flex items-center gap-1">
                          <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                          <span className="font-bold">{selectedGuide.rating}</span>
                          <span className="text-muted-foreground">({selectedGuide.reviews} avaliações)</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4 text-muted-foreground" />
                          <span className="text-sm text-muted-foreground">{selectedGuide.experience}</span>
                        </div>
                      </div>
                      <p className="text-muted-foreground">{selectedGuide.description}</p>
                    </div>
                  </div>

                  <Separator />

                  <Tabs defaultValue="info" className="w-full">
                    <TabsList className="grid w-full grid-cols-3">
                      <TabsTrigger value="info">Informações</TabsTrigger>
                      <TabsTrigger value="tours">Passeios</TabsTrigger>
                      <TabsTrigger value="contact">Contato</TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="info" className="space-y-4">
                      <div>
                        <h4 className="font-semibold mb-2 flex items-center gap-2">
                          <Languages className="w-4 h-4" />
                          Idiomas
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {selectedGuide.languages.map((language: string) => (
                            <Badge key={language} variant="secondary">
                              {language}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      
                      <div>
                        <h4 className="font-semibold mb-2 flex items-center gap-2">
                          <Star className="w-4 h-4" />
                          Especialidades
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {selectedGuide.specialties.map((specialty: string) => (
                            <Badge key={specialty} variant="outline">
                              {specialty}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      
                      <div>
                        <h4 className="font-semibold mb-2">Preço Base</h4>
                        <p className="text-2xl font-bold text-primary">{selectedGuide.price}</p>
                      </div>
                    </TabsContent>
                    
                    <TabsContent value="tours" className="space-y-4">
                      <h4 className="font-semibold">Passeios Disponíveis</h4>
                      <div className="grid gap-4">
                        {selectedGuide.tours.map((tour: any, index: number) => (
                          <Card key={index}>
                            <CardContent className="p-4">
                              <div className="flex justify-between items-start">
                                <div>
                                  <h5 className="font-semibold">{tour.name}</h5>
                                  <p className="text-sm text-muted-foreground">
                                    Duração: {tour.duration}
                                  </p>
                                </div>
                                <span className="font-bold text-primary">{tour.price}</span>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </TabsContent>
                    
                    <TabsContent value="contact" className="space-y-4">
                      <div className="grid gap-4">
                        <div className="flex items-center gap-3">
                          <Phone className="w-5 h-5 text-muted-foreground" />
                          <span>{selectedGuide.phone}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <Mail className="w-5 h-5 text-muted-foreground" />
                          <span>{selectedGuide.email}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <MapPin className="w-5 h-5 text-muted-foreground" />
                          <span>{selectedGuide.city}, Angola</span>
                        </div>
                      </div>
                    </TabsContent>
                  </Tabs>

                  <Separator />

                  {/* Action Buttons */}
                  <div className="flex gap-3 pt-4">
                    <Button 
                      variant="outline" 
                      className="flex-1"
                      onClick={() => handleContact(selectedGuide)}
                    >
                      <Phone className="w-4 h-4 mr-2" />
                      Entrar em Contato
                    </Button>
                    <Button 
                      variant="hero" 
                      className="flex-1"
                      onClick={() => handleBooking(selectedGuide)}
                    >
                      <Calendar className="w-4 h-4 mr-2" />
                      Fazer Reserva
                    </Button>
                  </div>
                </div>
              </>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default BrowseGuides;