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
  Eye,
  ChevronDown,
  ChevronUp,
  Menu,
  X
} from 'lucide-react';
import GoogleMapsAngola from '@/components/GoogleMapsAngola';
import { Favorite, 
  getAllGuides, 
  getAllTourPackages, 
  getGuideProfile, 
  getGuideReviews, 
  isGuideFavorited, 
  Review, 
  subscribeToUserFavorites, 
  toggleFavorite, 
  type Guide, 
  type TourPackage } from '@/lib/firestore';
import Header from '@/components/Header';
import { useAuth } from '@/contexts/AuthContext';

export default function BrowseGuides() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchParams, setSearchParams] = useSearchParams();
  const queryParam = searchParams.get('city');
  const { user } = useAuth();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [searchTerm, setSearchTerm] = useState(queryParam || '');
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
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [showMobileMap, setShowMobileMap] = useState(false);

  useEffect(() => {
    if (!user?.uid) {
      setFavorites([]);
      setIsFavoritedMap({});
      return;
    }

    const unsubscribe = subscribeToUserFavorites(user?.uid, (fetchedFavorites) => {
      setFavorites(fetchedFavorites);

      const favoritedMap = fetchedFavorites.reduce((acc, fav) => {
        acc[fav.guideId] = true;
        return acc;
      }, {} as Record<string, boolean>);

      setIsFavoritedMap(favoritedMap);
    });

    return () => unsubscribe();
  }, [user?.uid]);

  const handleMessageGuide = (id:string, name: string, photoURL : string) => {
    navigate(`/mensagens?guideId=${id}&guideName=${encodeURIComponent(name)}&guidePhotoURL=${encodeURIComponent(photoURL || '')}`);
  };

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
      const isNowFavorited = await toggleFavorite(user?.uid, guide);
      
      toast({
        title: isNowFavorited ? "Adicionado aos favoritos" : "Removido dos favoritos",
        description: isNowFavorited 
          ? `Você favoritou ${guide.name}` 
          : `Você removeu ${guide.name} dos favoritos`,
      });
      
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

  const cities = [
    'Bengo',
    'Benguela',
    'Bié',
    'Cabinda',
    'Cuando Cubango',
    'Cuanza Norte',
    'Cuanza Sul',
    'Cunene',
    'Huambo',
    'Huíla',
    'Luanda',
    'Lunda Norte',
    'Lunda Sul',
    'Malanje',
    'Moxico',
    'Namibe',
    'Uíge',
    'Zaire'
  ];

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
        getAllTourPackages(),
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

  const handleViewGuide = async (guide: Guide) => {
    setSelectedGuide(guide);
    setIsGuideDetailOpen(true);
    const guideId = guide.uid;
    
    try {
      const [guide, guideReviews] = await Promise.all([
        getGuideProfile(guideId),
        getGuideReviews(guideId)
      ]);

      if (guide) {
        setSelectedGuide(guide);
        setReviews(guideReviews);
      }
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível carregar os dados do guia",
        variant: "destructive"
      });
    }
  };

  const getGuidePackages = (guideId: string) => {
    return packages.filter(pkg => pkg.guideId === guideId);
  };

  // Filtrar guias
  const filteredGuides = guides.filter(guide => {
    const matchesSearch = guide.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         guide.specialties.some(specialty => 
                           specialty.toLowerCase().includes(searchTerm.toLowerCase())
                         ) || guide.city.toLowerCase().includes(searchTerm.toLowerCase()) ||  
                         guide.description.toLowerCase().includes(searchTerm.toLowerCase());
    
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
        {/* Header e título */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">Descobrir Guias</h1>
          <p className="text-lg md:text-xl text-muted-foreground mb-6">
            Encontre guias locais experientes para explorar as maravilhas de Angola
          </p>

          {/* Barra de busca principal */}
          <div className="relative mb-6">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
            <Input
              placeholder="Buscar por nome, cidade ou especialidade..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-12 w-full"
            />
          </div>

          {/* Botão para mostrar filtros em mobile */}
          <div className="flex flex-wrap gap-3 mb-6">
            <Button
              variant="outline"
              className="md:hidden"
              onClick={() => setShowMobileFilters(!showMobileFilters)}
            >
              {showMobileFilters ? <ChevronUp className="h-4 w-4 mr-2" /> : <ChevronDown className="h-4 w-4 mr-2" />}
              Filtros
            </Button>

            <Button
              variant="outline"
              className="md:hidden"
              onClick={() => setShowMobileMap(!showMobileMap)}
            >
              <MapPin className="h-4 w-4 mr-2" />
              Mapa
            </Button>
          </div>

          {/* Filtros - Visível em desktop, condicional em mobile */}
          <div className={`${showMobileFilters ? 'block' : 'hidden'} md:block mb-6`}>
            <div className="flex flex-col md:flex-row flex-wrap gap-4 p-4 md:p-0 bg-card md:bg-transparent rounded-lg md:rounded-none">
              <Select value={selectedCity} 
                onValueChange={(value) => {
                  value === 'cidades' 
                    ? (setSelectedCity(''), setSearchTerm('')) 
                    : (setSelectedCity(value), setSearchTerm(value));
                }}
              >
                <SelectTrigger className="w-full md:w-[180px]">
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
                <SelectTrigger className="w-full md:w-[200px]">
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
                <SelectTrigger className="w-full md:w-[150px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="rating">Avaliação</SelectItem>
                  <SelectItem value="price">Preço</SelectItem>
                  <SelectItem value="experience">Experiência</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <p className="text-muted-foreground mb-6">
            {filteredGuides.length} guia{filteredGuides.length !== 1 ? 's' : ''} encontrado{filteredGuides.length !== 1 ? 's' : ''} por <b>{searchTerm}</b>  
          </p>
        </div>

        {/* Layout principal */}
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Conteúdo principal - Cards */}
          <div className="lg:w-2/3">
            {/* Mapa em mobile (condicional) */}
            {showMobileMap && (
              <div className="mb-6 md:hidden">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <MapPin className="h-5 w-5 mr-2" />
                      Localização dos Guias
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-3">
                    <GoogleMapsAngola 
                      height="300px"
                      showSearch={true}
                      showControls={true}
                    />
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Lista de Cards - Vertical */}
            <div className="space-y-4">
              {sortedGuides.map((guide) => (
                <Card key={guide.id} className="hover:shadow-lg transition-shadow overflow-hidden">
                  <CardContent className="p-4 sm:p-6">
                    <div className="flex flex-col sm:flex-row items-start gap-4">
                      {/* Avatar e status */}
                      <div className="flex-shrink-0 self-center sm:self-start">
                        <div className="relative">
                          <Avatar className="h-16 w-16">
                            <AvatarImage src={guide.photoURL} alt={guide.name} />
                            <AvatarFallback>{guide.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                          </Avatar>
                          {guide.isActive && (
                            <div className="absolute -bottom-1 -right-1 h-4 w-4 bg-green-500 border-2 border-white rounded-full"></div>
                          )}
                        </div>
                      </div>

                      {/* Conteúdo principal */}
                      <div className="flex-1 w-full">
                        {/* Header mobile */}
                        <div className="sm:hidden mb-3">
                          <div className="flex justify-between items-start">
                            <div>
                              <h3 className="font-bold text-lg">{guide.name}</h3>
                              <div className="flex items-center text-muted-foreground text-sm">
                                <MapPin className="h-3 w-3 mr-1" />
                                {guide.city}
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="flex items-center mb-1">
                                <Star className="h-3 w-3 text-yellow-500 mr-1" />
                                <span className="font-medium">{guide.rating.toFixed(1)}</span>
                              </div>
                              <p className="text-lg font-bold text-primary">
                                {guide.pricePerHour.toLocaleString('pt-AO', { style: 'currency', currency: 'AOA' })}/hora
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Header desktop */}
                        <div className="hidden sm:flex items-start justify-between mb-2">
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

                        {/* Descrição */}
                        <p className="text-muted-foreground text-sm mb-3 break-words whitespace-normal">
                          {guide.description.length > 150 ? `${guide.description.substring(0, 150)}...` : guide.description}
                        </p>

                        {/* Especialidades */}
                        <div className="flex flex-wrap gap-2 mb-3">
                          {guide.specialties.slice(0, 3).map((specialty, index) => (
                            <Badge key={index} variant="secondary" className="text-xs">
                              {specialty}
                            </Badge>
                          ))}
                          {guide.specialties.length > 3 && (
                            <Badge variant="outline" className="text-xs">
                              +{guide.specialties.length - 3}
                            </Badge>
                          )}
                        </div>

                        {/* Informações */}
                        <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground mb-4">
                          <div className="flex items-center">
                            <Clock className="h-3 w-3 mr-1" />
                            {guide.experience} anos exp.
                          </div>
                          <div className="flex items-center">
                            <Package className="h-3 w-3 mr-1" />
                            {getGuidePackages(guide.id).length} pacotes
                          </div>
                          <div className="hidden sm:flex items-center">
                            <MessageSquare className="h-3 w-3 mr-1" />
                            {guide.languages.slice(0, 2).join(', ')}
                            {guide.languages.length > 2 && '...'}
                          </div>
                        </div>

                        {/* Botões */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                          <div className="flex flex-wrap gap-2">
                            <Button 
                              variant="outline" 
                              size="sm"
                              disabled={!user || guide.uid === user?.uid}
                              onClick={() => handleToggleFavorite(guide)}
                              className={`text-xs sm:text-sm ${isFavoritedMap[guide.id] ? "bg-amber-100 border-amber-300" : ""}`}
                            >
                              <Heart 
                                className={`h-3 w-3 sm:h-4 sm:w-4 mr-1 ${isFavoritedMap[guide.id] ? "fill-red-500 text-red-500" : ""}`} 
                              />
                              {isFavoritedMap[guide.id] ? "Favorito" : "Favoritar"}
                            </Button>
                            <Button variant="outline" size="sm" onClick={() => handleViewGuide(guide)} className="text-xs sm:text-sm">
                              <Eye className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                              Ver Perfil
                            </Button>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            <Button 
                              disabled={!user || guide.uid === user?.uid} 
                              size="sm" 
                              className="text-xs sm:text-sm"
                            >
                              <Calendar className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                              <Link to={`/guias/${guide.id}/pacotes`}>
                                Reserva
                              </Link>
                            </Button>
                            {user?.uid && guide.uid !== user?.uid && (
                              <Button 
                                variant="outline" 
                                size="sm" 
                                onClick={() => handleMessageGuide(guide.id, guide.name, guide.photoURL)}
                                className="text-xs sm:text-sm"
                              >
                                <MessageSquare className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                                Mensagem
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}

              {sortedGuides.length === 0 && (
                <Card>
                  <CardContent className="p-8 text-center">
                    <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">Nenhum guia encontrado</h3>
                    <p className="text-muted-foreground mb-4">
                      Tente ajustar seus filtros de busca.
                    </p>
                    <Button onClick={() => {
                      setSearchTerm('');
                      setSelectedCity('');
                      setPriceRange('');
                    }}>
                      Limpar filtros
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>

          {/* Mapa - Sidebar desktop */}
          <div className="lg:w-1/3 hidden lg:block">
            <Card className="sticky top-6">

              <CardContent className="p-3">
                <GoogleMapsAngola 
                  height="calc(100vh - 200px)"
                  showSearch={true}
                  showControls={true}
                />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Dialog com detalhes do guia */}
      <Dialog open={isGuideDetailOpen} onOpenChange={setIsGuideDetailOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto w-[95vw] sm:w-full">
          {selectedGuide && (
            <>
              <DialogHeader>
                <DialogTitle className="flex flex-col sm:flex-row sm:items-center gap-4">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={selectedGuide.photoURL} alt={selectedGuide.name} />
                    <AvatarFallback>{selectedGuide.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                  </Avatar>
                  <div>
                    <h2 className="text-xl sm:text-2xl font-bold">{selectedGuide.name}</h2>
                    <div className="flex flex-wrap items-center text-muted-foreground text-sm">
                      <MapPin className="h-3 w-3 mr-1" />
                      {selectedGuide.city}
                      <span className="mx-2 hidden sm:inline">•</span>
                      <div className="flex items-center mt-1 sm:mt-0">
                        <Star className="h-3 w-3 mr-1 text-yellow-500" />
                        {selectedGuide.rating.toFixed(1)} ({selectedGuide.reviewCount} avaliações)
                      </div>
                    </div>
                  </div>
                </DialogTitle>
              </DialogHeader>

              <Tabs defaultValue="overview" className="mt-6">
                <TabsList className="w-full overflow-x-auto flex">
                  <TabsTrigger value="overview" className="flex-1">Visão Geral</TabsTrigger>
                  <TabsTrigger value="packages" className="flex-1">Pacotes</TabsTrigger>
                  <TabsTrigger value="reviews" className="flex-1">Avaliações</TabsTrigger>
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
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {getGuidePackages(selectedGuide.id).map((pkg) => (
                      <Card key={pkg.id}>
                        <CardHeader>
                          <CardTitle className="text-base sm:text-lg">{pkg.title}</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="text-sm text-muted-foreground mb-3">
                            {pkg.description.length > 100 ? `${pkg.description.substring(0, 100)}...` : pkg.description}
                          </p>
                          
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

                <TabsContent value="reviews" className="mt-6">
                  <h3 className="text-lg font-semibold mb-4">Avaliações dos Clientes</h3>
                  
                  {reviews.length > 0 ? (
                    <div className="space-y-4">
                      {reviews.map((review) => (
                        <div key={review.id} className="border rounded-lg p-4">
                          <div className="flex items-center gap-3 mb-3">
                            <Avatar className="h-10 w-10">
                              <AvatarFallback>
                                {review.touristName.split(' ').map(n => n[0]).join('')}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <h4 className="font-medium">{review.touristName}</h4>
                              <div className="flex flex-wrap items-center">
                                {[...Array(5)].map((_, i) => (
                                  <Star
                                    key={i}
                                    className={`h-4 w-4 ${i < review.rating ? 'text-yellow-500 fill-current' : 'text-gray-300'}`}
                                  />
                                ))}
                                <span className="text-sm text-muted-foreground ml-2">
                                  {new Date(review.createdAt).toLocaleDateString('pt-AO')}
                                </span>
                              </div>
                            </div>
                          </div>
                          <p className="text-muted-foreground">
                            {review.comment}
                          </p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12 text-muted-foreground">
                      <Star className="h-12 w-12 mx-auto mb-4" />
                      <h4 className="text-lg font-medium">Nenhuma avaliação ainda</h4>
                      <p>Seja o primeiro a avaliar este guia</p>
                    </div>
                  )}
                </TabsContent>
              </Tabs>

              <div className="flex flex-col sm:flex-row justify-end gap-2 mt-6 pt-6 border-t">
                {user?.uid && selectedGuide.uid !== user?.uid && (
                  <Button variant="outline" onClick={() => handleMessageGuide(selectedGuide.id, selectedGuide.name, selectedGuide.photoURL)}>
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Enviar Mensagem
                  </Button>
                )}
                <Button disabled={!user || selectedGuide.uid === user?.uid}>
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
  );
}