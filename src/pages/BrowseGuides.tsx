import { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { 
  Star, 
  MapPin, 
  Clock, 
  Users, 
  Search,
  Filter,
  Heart,
  MessageSquare,
  Calendar,
  Package,
  DollarSign,
  Eye
} from 'lucide-react';
import GoogleMapsAngola from '@/components/GoogleMapsAngola';
import { Favorite, getAllGuides, getAllTourPackages, isGuideFavorited, subscribeToUserFavorites, toggleFavorite, type Guide, type TourPackage } from '@/lib/firestore';
import Header from '@/components/Header';
import { useAuth } from '@/contexts/AuthContext';

export default function BrowseGuides() {
  const navigate = useNavigate();
  const { toast } = useToast();
   const [searchParams, setSearchParams] = useSearchParams();
   const queryParam = searchParams.get('city');
   const { user } = useAuth();

  const [searchTerm, setSearchTerm] = useState(queryParam);
  const [selectedCity, setSelectedCity] = useState('');
  const [priceRange, setPriceRange] = useState('');
  const [sortBy, setSortBy] = useState('rating');
  const [guides, setGuides] = useState<Guide[]>([]);
  const [packages, setPackages] = useState<TourPackage[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedGuide, setSelectedGuide] = useState<Guide | null>(null);
  const [isGuideDetailOpen, setIsGuideDetailOpen] = useState(false);
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [isFavoritedMap, setIsFavoritedMap] = useState<Record<string, boolean>>({});

  // Carregar favoritos
  useEffect(() => {
    if (!user?.uid) return;

    const unsubscribe = subscribeToUserFavorites(user.uid, (fetchedFavorites) => {
      setFavorites(fetchedFavorites);
      
      // Criar mapa de favoritos para acesso rápido
      const favoritedMap = fetchedFavorites.reduce((acc, fav) => {
        acc[fav.guideId] = true;
        return acc;
      }, {} as Record<string, boolean>);
      
      setIsFavoritedMap(favoritedMap);
    });

    return () => unsubscribe();
  }, [user?.uid]);

  // Função para alternar favorito
  const handleToggleFavorite = async (guide: Guide) => {
    if (!user?.uid) {
      toast({
        title: "Ação requer login",
        description: "Por favor, faça login para favoritar guias",
        variant: "destructive"
      });
      return;
    }

    try {
      const isNowFavorited = await toggleFavorite(user.uid, guide);
      
      toast({
        title: isNowFavorited ? "Adicionado aos favoritos" : "Removido dos favoritos",
        description: isNowFavorited 
          ? `Você favoritou ${guide.name}` 
          : `Você removeu ${guide.name} dos favoritos`,
      });
      
      // Atualizar estado local
      setIsFavoritedMap(prev => ({
        ...prev,
        [guide.id]: isNowFavorited
      }));
    } catch (error) {
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao atualizar seus favoritos",
        variant: "destructive"
      });
    }
  };

  const cities = ['Luanda', 'Benguela', 'Huambo', 'Lubango', 'Namibe', 'Cabinda'];
  const priceRanges = [
    { label: 'Até 10.000 AOA', value: '0-10000' },
    { label: '10.000 - 15.000 AOA', value: '10000-15000' },
    { label: 'Acima de 15.000 AOA', value: '15000+' }
  ];

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [allGuides, allPackages] = await Promise.all([
        getAllGuides(),
        getAllTourPackages()
      ]);
      setGuides(allGuides);
      setPackages(allPackages);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os guias",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleViewGuide = (guide: Guide) => {
    setSelectedGuide(guide);
    setIsGuideDetailOpen(true);
  };

  const getGuidePackages = (guideId: string) => {
    return packages.filter(pkg => pkg.guideId === guideId);
  };

  // Filtrar guias
  const filteredGuides =  guides.filter(guide => {
    const matchesSearch = guide.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         guide.specialties.some(specialty => 
                           specialty.toLowerCase().includes(searchTerm.toLowerCase())
                         ) || guide.city.toLowerCase().includes(searchTerm.toLowerCase()) ||  guide.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCity = !selectedCity || guide.city === selectedCity;
    
    const matchesPrice = !priceRange || (() => {
      const [min, max] = priceRange.split('-').map(p => p.replace('+', ''));
      if (max) {
        return guide.pricePerHour >= parseInt(min) && guide.pricePerHour <= parseInt(max);
      } else {
        return guide.pricePerHour >= parseInt(min);
      }
    })();

    return matchesSearch && matchesCity && matchesPrice;
  });

  // Ordenar guias
  const sortedGuides = [...filteredGuides].sort((a, b) => {
    switch (sortBy) {
      case 'rating':
        return b.rating - a.rating;
      case 'price':
        return a.pricePerHour - b.pricePerHour;
      case 'experience':
        return b.experience - a.experience;
      default:
        return 0;
    }
  });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
      <div className="min-h-screen">
          <Header />
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-4">Descobrir Guias</h1>
        <p className="text-xl text-muted-foreground mb-6">
          Encontre guias locais experientes para explorar as maravilhas de Angola
        </p>

        {/* Filtros */}
        <div className="flex flex-wrap gap-4 mb-6">
          <div className="relative flex-1 min-w-[300px]">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
            <Input
              placeholder="Buscar por nome, cidade ou especialidade..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-12"
          
            />
          </div>
          
          <Select value={selectedCity} onValueChange={setSelectedCity}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Cidade" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="cidades">Todas as cidades</SelectItem>
              {cities.map(city => (
                <SelectItem key={city} value={city}>{city}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={priceRange} onValueChange={setPriceRange}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Faixa de preço" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="precos">Todos os preços</SelectItem>
              {priceRanges.map(range => (
                <SelectItem key={range.value} value={range.value}>{range.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-[150px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="rating">Avaliação</SelectItem>
              <SelectItem value="price">Preço</SelectItem>
              <SelectItem value="experience">Experiência</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <p className="text-muted-foreground mb-6">
          {filteredGuides.length} guia{filteredGuides.length !== 1 ? 's' : ''} encontrado{filteredGuides.length !== 1 ? 's' : ''} por <b>{searchTerm}</b>  
        </p>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Lista de Guias */}
        <div className="lg:col-span-2">
          <div className="space-y-6">
            <div className="grid grid-cols-1 gap-6">
              {sortedGuides.map((guide) => (
                <Card key={guide.id} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="relative">
                        <Avatar className="h-16 w-16">
                          <AvatarImage src={guide.photoURL} alt={guide.name} />
                          <AvatarFallback>{guide.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                        </Avatar>
                        {guide.isActive && (
                          <div className="absolute -bottom-1 -right-1 h-5 w-5 bg-green-500 border-2 border-white rounded-full"></div>
                        )}
                      </div>

                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h3 className="font-bold text-lg">{guide.name}</h3>
                            <div className="flex items-center text-muted-foreground text-sm">
                              <MapPin className="h-4 w-4 mr-1" />
                              {guide.city}
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="flex items-center mb-1">
                              <Star className="h-4 w-4 text-yellow-500 mr-1" />
                              <span className="font-medium">{guide.rating.toFixed(1)}</span>
                              <span className="text-muted-foreground text-sm ml-1">({guide.reviewCount} avaliações)</span>
                            </div>
                            <p className="text-lg font-bold text-primary">
                              {guide.pricePerHour.toLocaleString('pt-AO', { style: 'currency', currency: 'AOA' })}/hora
                            </p>
                          </div>
                        </div>

                        <p className="text-muted-foreground text-sm mb-3">{guide.description}</p>

                        <div className="flex flex-wrap gap-2 mb-3">
                          {guide.specialties.map((specialty, index) => (
                            <Badge key={index} variant="secondary">{specialty}</Badge>
                          ))}
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <div className="flex items-center">
                              <Clock className="h-4 w-4 mr-1" />
                              {guide.experience} anos exp.
                            </div>
                            <div className="flex items-center">
                              <Package className="h-4 w-4 mr-1" />
                              {getGuidePackages(guide.id).length} pacotes
                            </div>
                            <div className="flex items-center">
                              <MessageSquare className="h-4 w-4 mr-1" />
                              {guide.languages.join(', ')}
                            </div>
                          </div>

                          <div className="flex gap-2">
                              <Button 
                              variant="outline" 
                              size="sm"
                              disabled={!user || guide.uid === user.uid}
                              onClick={() => handleToggleFavorite(guide)}
                              className={!isGuideFavorited(user.uid, guide.id) || isFavoritedMap[guide.id] ? "bg-amber-100 border-amber-300" : ""}
                            >
                              <Heart 
                                className={`h-4 w-4 mr-2 ${!isGuideFavorited(user.uid, guide.id) || isFavoritedMap[guide.id] ? "fill-red-500 text-red-500" : ""}`} 
                              />
                              {isFavoritedMap[guide.id] ? "Favorito" : "Favoritar"}
                            </Button>
                            <Button variant="outline" size="sm" onClick={() => handleViewGuide(guide)}>
                              <Eye className="h-4 w-4 mr-2" />
                              Ver Perfil
                            </Button>
                            <Button size="sm">
                              <Calendar className="h-4 w-4 mr-2" />
                              Reservar
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}

              {sortedGuides.length === 0 && (
                <Card>
                  <CardContent className="p-12 text-center">
                    <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">Nenhum guia encontrado</h3>
                    <p className="text-muted-foreground">
                      Tente ajustar seus filtros de busca.
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>

   
      </div>
     {/* Mapa */}
        <div className="lg:col-span-1 mt-8">
          <Card className="sticky top-6">
            <CardHeader>
              <CardTitle className="flex items-center">
                <MapPin className="h-5 w-5 mr-2" />
                Localização dos Guias
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <GoogleMapsAngola 
                height="500px"
                showSearch={true}
                showControls={true}
              />
            </CardContent>
          </Card>
        </div>

      {/* Dialog com detalhes do guia */}
      <Dialog open={isGuideDetailOpen} onOpenChange={setIsGuideDetailOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          {selectedGuide && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-4">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={selectedGuide.photoURL} alt={selectedGuide.name} />
                    <AvatarFallback>{selectedGuide.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                  </Avatar>
                  <div>
                    <h2 className="text-2xl font-bold">{selectedGuide.name}</h2>
                    <div className="flex items-center text-muted-foreground">
                      <MapPin className="h-4 w-4 mr-1" />
                      {selectedGuide.city}
                      <span className="mx-2">•</span>
                      <Star className="h-4 w-4 mr-1 text-yellow-500" />
                      {selectedGuide.rating.toFixed(1)} ({selectedGuide.reviewCount} avaliações)
                    </div>
                  </div>
                </DialogTitle>
              </DialogHeader>

              <Tabs defaultValue="overview" className="mt-6">
                <TabsList>
                  <TabsTrigger value="overview">Visão Geral</TabsTrigger>
                  <TabsTrigger value="packages">Pacotes</TabsTrigger>
                  <TabsTrigger value="reviews">Avaliações</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="font-semibold mb-3">Sobre o Guia</h3>
                      <p className="text-muted-foreground mb-4">{selectedGuide.description}</p>
                      
                      <div className="space-y-3">
                        <div className="flex items-center">
                          <Clock className="h-4 w-4 mr-2" />
                          <span>{selectedGuide.experience} anos de experiência</span>
                        </div>
                        <div className="flex items-center">
                          <DollarSign className="h-4 w-4 mr-2" />
                          <span>{selectedGuide.pricePerHour.toLocaleString('pt-AO', { style: 'currency', currency: 'AOA' })}/hora</span>
                        </div>
                        <div className="flex items-center">
                          <MessageSquare className="h-4 w-4 mr-2" />
                          <span>{selectedGuide.languages.join(', ')}</span>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h3 className="font-semibold mb-3">Especialidades</h3>
                      <div className="flex flex-wrap gap-2">
                        {selectedGuide.specialties.map((specialty, index) => (
                          <Badge key={index} variant="secondary">{specialty}</Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="packages" className="space-y-4">
                  <h3 className="font-semibold">Pacotes Disponíveis</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {getGuidePackages(selectedGuide.id).map((pkg) => (
                      <Card key={pkg.id}>
                        <CardHeader>
                          <CardTitle className="text-lg">{pkg.title}</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="text-sm text-muted-foreground mb-3">{pkg.description}</p>
                          
                          <div className="space-y-2 mb-4">
                            <div className="flex items-center text-sm">
                              <Clock className="h-4 w-4 mr-2" />
                              {pkg.duration}
                            </div>
                            <div className="flex items-center text-sm">
                              <MapPin className="h-4 w-4 mr-2" />
                              {pkg.location}
                            </div>
                            <div className="flex items-center text-sm">
                              <Users className="h-4 w-4 mr-2" />
                              Até {pkg.maxGroupSize} pessoas
                            </div>
                            <div className="flex items-center text-sm">
                              <DollarSign className="h-4 w-4 mr-2" />
                              {pkg.price.toLocaleString('pt-AO', { style: 'currency', currency: 'AOA' })}
                            </div>
                          </div>

                          <div className="flex justify-between items-center">
                            <div className="flex items-center">
                              <Star className="h-4 w-4 text-yellow-500 mr-1" />
                              <span className="text-sm">{pkg.rating.toFixed(1)} ({pkg.reviewCount})</span>
                            </div>
                            
                            <Button size="sm">
                              <Calendar className="h-4 w-4 mr-2" />
                              Reservar
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                  
                  {getGuidePackages(selectedGuide.id).length === 0 && (
                    <p className="text-center text-muted-foreground py-8">
                      Este guia ainda não tem pacotes disponíveis.
                    </p>
                  )}
                </TabsContent>

                <TabsContent value="reviews">
                  <h3 className="font-semibold mb-4">Avaliações dos Clientes</h3>
                  <p className="text-center text-muted-foreground py-8">
                    As avaliações serão carregadas em breve.
                  </p>
                </TabsContent>
              </Tabs>

              <div className="flex justify-end gap-2 mt-6 pt-6 border-t">
                <Button variant="outline">
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Enviar Mensagem
                </Button>
                <Button>
                  <Calendar className="h-4 w-4 mr-2" />
                   <Link to={`/guias/${selectedGuide.id}/pacotes`}>
                                            Fazer Reserva
                                            </Link>
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
      </div>
  );
}
