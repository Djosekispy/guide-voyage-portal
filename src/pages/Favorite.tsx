import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Heart, 
  MapPin, 
  Star, 
  MessageSquare, 
  Calendar, 
  Search,
  Filter,
  ChevronRight,
  X,
  Eye,
  Clock,
  DollarSign,
  Phone,
  Mail,
  Users,
  ChevronLeft,
  ChevronRight as ChevronRightIcon,
  Package
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { 
  Favorite, 
  getGuidePackages, 
  getGuideProfile, 
  getGuideReviews, 
  getUserFavorites, 
  Guide,
  TourPackage,
  Review,
  removeFavorite 
} from '@/lib/firestore';
import Header from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function FavoritesList() {
  const { user, userData } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [filteredFavorites, setFilteredFavorites] = useState<Favorite[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCity, setSelectedCity] = useState('');
  const [sortBy, setSortBy] = useState('recent');
  const [selectedGuide, setSelectedGuide] = useState<Guide | null>(null);
  const [isGuideModalOpen, setIsGuideModalOpen] = useState(false);
  const [packages, setPackages] = useState<TourPackage[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [currentPackageIndex, setCurrentPackageIndex] = useState(0);

 
   const handleMessageGuide = (id:string, name: string, photoURL : string) => {
    navigate(`/mensagens?guideId=${id}&guideName=${encodeURIComponent(name)}&guidePhotoURL=${encodeURIComponent(photoURL || '')}`);
  };

  const cities = ['Luanda', 'Benguela', 'Huambo', 'Lubango', 'Namibe', 'Cabinda', 'Soyo'];

  useEffect(() => {
    if (!user?.uid) return;

    const loadFavorites = async () => {
      try {
        const favs = await getUserFavorites(userData.uid);
        setFavorites(favs);
        setFilteredFavorites(favs);
      } catch (error) {
        toast({
          title: "Erro",
          description: "Não foi possível carregar seus favoritos",
          variant: "destructive"
        });
      }
    };

    loadFavorites();
  }, [user?.uid]);

  // Aplicar filtros e ordenação
  useEffect(() => {
    let result = [...favorites];
    
    if (searchTerm) {
      result = result.filter(fav => 
        fav.guideName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        fav.guideCity.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    if (selectedCity) {
      result = result.filter(fav => fav.guideCity === selectedCity);
    }
    
    result.sort((a, b) => {
      if (sortBy === 'rating') {
        return b.guideRating - a.guideRating;
      } else if (sortBy === 'name') {
        return a.guideName.localeCompare(b.guideName);
      } else {
        return b.createdAt - a.createdAt;
      }
    });
    
    setFilteredFavorites(result);
  }, [favorites, searchTerm, selectedCity, sortBy]);

  const handleViewGuide = async (guideId: string) => {
    try {
      const [guide, guidePackages, guideReviews] = await Promise.all([
        getGuideProfile(guideId),
        getGuidePackages(guideId),
        getGuideReviews(guideId)
      ]);

      if (guide) {
        setSelectedGuide(guide);
        setPackages(guidePackages);
        setReviews(guideReviews);
        setIsGuideModalOpen(true);
        setCurrentPackageIndex(0);
      }
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível carregar os dados do guia",
        variant: "destructive"
      });
    }
  };

  const handleRemoveFavorite = async (favoriteId: string, guideName: string) => {
    try {
      await removeFavorite(favoriteId);
      setFavorites(prev => prev.filter(fav => fav.id !== favoriteId));
      toast({
        title: "Removido dos favoritos",
        description: `${guideName} foi removido da sua lista`,
        action: (
          <Button variant="ghost" onClick={() => window.location.reload()}>
            Desfazer
          </Button>
        )
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível remover dos favoritos",
        variant: "destructive"
      });
    }
  };

  const handleSendMessage = (guideId: string) => {
    navigate(`/messages?to=${guideId}`);
  };

  const handleBookGuide = (guideId: string) => {
    navigate(`/booking?guideId=${guideId}`);
  };

  const handleBookPackage = (packageId: string) => {
    navigate(`/booking?packageId=${packageId}`);
  };

  const nextPackage = () => {
    setCurrentPackageIndex(prev => 
      prev === packages.length - 1 ? 0 : prev + 1
    );
  };

  const prevPackage = () => {
    setCurrentPackageIndex(prev => 
      prev === 0 ? packages.length - 1 : prev - 1
    );
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-4xl mx-auto px-4 py-20 text-center">
          <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-200">
            <Heart className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <h3 className="text-2xl font-bold text-gray-800 mb-2">
              Acesso aos Favoritos
            </h3>
            <p className="text-gray-600 mb-6">
              Faça login para visualizar e gerenciar seus guias favoritos
            </p>
            <div className="flex justify-center gap-4">
              <Button onClick={() => navigate('/login')}>
                Fazer Login
              </Button>
              <Button variant="outline" onClick={() => navigate('/register')}>
                Criar Conta
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }


  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
        <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Cabeçalho e Filtros */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Meus Favoritos</h1>
              <p className="text-gray-600 mt-2">
                {favorites.length} guia{favorites.length !== 1 ? 's' : ''} favoritado{favorites.length !== 1 ? 's' : ''}
              </p>
            </div>
            
            <div className="w-full md:w-auto flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1 min-w-[200px]">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Buscar favoritos..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
                {searchTerm && (
                  <X 
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 cursor-pointer"
                    onClick={() => setSearchTerm('')}
                  />
                )}
              </div>
              
              <Select value={selectedCity} onValueChange={setSelectedCity}>
                <SelectTrigger className="min-w-[180px]">
                  <div className="flex items-center">
                    <Filter className="h-4 w-4 mr-2 text-gray-500" />
                    <SelectValue placeholder="Todas cidades" />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cidades">Todas cidades</SelectItem>
                  {cities.map(city => (
                    <SelectItem key={city} value={city}>{city}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="min-w-[160px]">
                  <SelectValue placeholder="Ordenar por" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="recent">Mais recentes</SelectItem>
                  <SelectItem value="rating">Melhor avaliação</SelectItem>
                  <SelectItem value="name">Ordem alfabética</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          {/* Barra de status */}
          <div className="flex items-center justify-between bg-white p-3 rounded-lg border border-gray-200">
            <div className="text-sm text-gray-600">
              Mostrando <span className="font-medium">{filteredFavorites.length}</span> de <span className="font-medium">{favorites.length}</span> favoritos
            </div>
            {selectedCity && (
              <div className="flex items-center">
                <Badge variant="secondary">
                  {selectedCity}
                  <X 
                    className="h-3 w-3 ml-2 cursor-pointer" 
                    onClick={() => setSelectedCity('')}
                  />
                </Badge>
              </div>
            )}
          </div>
        </div>

        {/* Lista de Favoritos */}
        {filteredFavorites.length === 0 ? (
          <Card className="text-center py-16">
            <CardContent>
              <Heart className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <h3 className="text-xl font-semibold text-gray-800 mb-2">
                {searchTerm || selectedCity ? 'Nenhum resultado encontrado' : 'Sua lista de favoritos está vazia'}
              </h3>
              <p className="text-gray-600 mb-6 max-w-md mx-auto">
                {searchTerm || selectedCity 
                  ? 'Tente ajustar seus filtros de busca'
                  : 'Explore nossos guias e adicione seus favoritos para encontrá-los aqui facilmente'}
              </p>
              <Button onClick={() => navigate('/guides')}>
                <MapPin className="h-4 w-4 mr-2" />
                Explorar Guias
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredFavorites.map(favorite => (
              <Card key={favorite.id} className="hover:shadow-md transition-shadow group">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-12 w-12 border-2 border-primary">
                        <AvatarImage src={favorite.guidePhotoURL} />
                        <AvatarFallback className="bg-primary text-white font-medium">
                          {favorite.guideName.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <CardTitle className="text-lg">{favorite.guideName}</CardTitle>
                        <div className="flex items-center text-sm text-gray-600 mt-1">
                          <MapPin className="h-3 w-3 mr-1" />
                          {favorite.guideCity}
                        </div>
                      </div>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8 text-gray-400 hover:text-red-500 hover:bg-red-50"
                      onClick={() => handleRemoveFavorite(favorite.id, favorite.guideName)}
                    >
                      <Heart className="h-4 w-4 fill-red-500 text-red-500" />
                    </Button>
                  </div>
                </CardHeader>
                
                <CardContent>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center">
                      <Star className="h-4 w-4 text-yellow-500 mr-1" />
                      <span className="font-medium">{favorite.guideRating.toFixed(1)}</span>
                      <span className="text-gray-500 text-sm ml-1">({Math.floor(favorite.guideRating * 10)} avaliações)</span>
                    </div>
                    <Badge variant="outline" className="text-green-600 border-green-200 bg-green-50">
                      Disponível
                    </Badge>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="h-9"
                      onClick={() => handleViewGuide(favorite.guideId)}
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      Ver
                    </Button>
                    
                    
                    {user?.uid && <Button variant="outline" onClick={() => handleMessageGuide(selectedGuide.id, selectedGuide.name, selectedGuide.photoURL)}>
                                <MessageSquare className="h-4 w-4 mr-2" />
                                Mensagem
                              </Button>}
                    <Button 
                      size="sm" 
                      className="h-9"
                      onClick={() => handleBookGuide(favorite.guideId)}
                    >
                      <Calendar className="h-4 w-4 mr-2" />
                      Reservar
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Dicas e Recomendações */}
        {filteredFavorites.length > 0 && (
          <div className="mt-16">
            <h3 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
              <ChevronRight className="h-5 w-5 text-primary mr-2" />
              Recomendados para você
            </h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {favorites
                .filter(fav => fav.guideRating >= 4.5)
                .slice(0, 4)
                .map(favorite => (
                  <div key={`rec-${favorite.id}`} className="bg-white p-4 rounded-lg border border-gray-200 hover:border-primary transition-colors">
                    <div className="flex items-center gap-3 mb-3">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={favorite.guidePhotoURL} />
                        <AvatarFallback>{favorite.guideName.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <h4 className="font-medium">{favorite.guideName}</h4>
                        <div className="flex items-center text-xs text-gray-500">
                          <Star className="h-3 w-3 text-yellow-500 mr-1" />
                          {favorite.guideRating.toFixed(1)}
                        </div>
                      </div>
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="w-full mt-2"
                      onClick={() => handleBookGuide(favorite.guideId)}
                    >
                      <Calendar className="h-4 w-4 mr-2" />
                      Reservar
                    </Button>
                  </div>
                ))}
            </div>
          </div>
        )}
      </div>

      <Dialog open={isGuideModalOpen} onOpenChange={setIsGuideModalOpen}>
        {selectedGuide && (
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-4">
                  <Avatar className="h-16 w-16">
                    <AvatarImage src={selectedGuide.photoURL} />
                    <AvatarFallback className="bg-primary text-white text-2xl font-bold">
                      {selectedGuide.name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <DialogTitle className="text-2xl">{selectedGuide.name}</DialogTitle>
                    <div className="flex items-center text-muted-foreground mt-1">
                      <MapPin className="h-4 w-4 mr-1" />
                      {selectedGuide.city}
                      <span className="mx-2">•</span>
                      <Star className="h-4 w-4 text-yellow-500 mr-1" />
                      {selectedGuide.rating.toFixed(1)} ({selectedGuide.reviewCount} avaliações)
                    </div>
                  </div>
                </div>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={() => setIsGuideModalOpen(false)}
                  className="text-gray-400 hover:text-gray-700"
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>
            </DialogHeader>
           <DialogDescription>
            {selectedGuide.description}
           </DialogDescription>
            <Tabs defaultValue="overview" className="mt-6">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="overview">Visão Geral</TabsTrigger>
                <TabsTrigger value="packages">Pacotes</TabsTrigger>
                <TabsTrigger value="reviews">Avaliações</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="mt-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="md:col-span-2">
                    <h3 className="text-lg font-semibold mb-4">Sobre o Guia</h3>
                    <p className="text-muted-foreground mb-6">{selectedGuide.description}</p>
                    
                    <div className="space-y-4">
                      <div className="flex items-start gap-4">
                        <div className="bg-primary/10 p-2 rounded-full">
                          <Clock className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <h4 className="font-medium">Experiência</h4>
                          <p className="text-muted-foreground">
                            {selectedGuide.experience} anos como guia turístico
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-start gap-4">
                        <div className="bg-primary/10 p-2 rounded-full">
                          <DollarSign className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <h4 className="font-medium">Preço</h4>
                          <p className="text-muted-foreground">
                            {selectedGuide.pricePerHour.toLocaleString('pt-AO', {
                              style: 'currency',
                              currency: 'AOA'
                            })} por hora
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-start gap-4">
                        <div className="bg-primary/10 p-2 rounded-full">
                          <MessageSquare className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <h4 className="font-medium">Idiomas</h4>
                          <p className="text-muted-foreground">
                            {selectedGuide.languages.join(', ')}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-semibold mb-3">Especialidades</h3>
                      <div className="flex flex-wrap gap-2">
                        {selectedGuide.specialties.map((specialty, index) => (
                          <Badge key={index} variant="secondary" className="px-3 py-1">
                            {specialty}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    
                    <div className="border rounded-lg p-4">
                      <h3 className="font-semibold mb-3">Contato</h3>
                      <div className="space-y-3">
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Phone className="h-4 w-4" />
                          <span>{selectedGuide.phone || 'Telefone não disponível'}</span>
                        </div>
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Mail className="h-4 w-4" />
                          <span>{selectedGuide.email || 'Email não disponível'}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex flex-col gap-2">
                       {user?.uid && <Button variant="outline" onClick={() => handleMessageGuide(selectedGuide.id, selectedGuide.name, selectedGuide.photoURL)}>
                                <MessageSquare className="h-4 w-4 mr-2" />
                                Mensagem
                              </Button>}
                      <Button 
                        variant="outline" 
                        className="w-full"
                        onClick={() => handleBookGuide(selectedGuide.id)}
                      >
                        <Calendar className="h-4 w-4 mr-2" />
                        Reservar Agora
                      </Button>
                      <Button variant="outline" className="w-full text-primary">
                        <Heart className="h-4 w-4 mr-2 fill-current" />
                        Favorito
                      </Button>
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="packages" className="mt-6">
                <h3 className="text-lg font-semibold mb-4">Pacotes Turísticos</h3>
                
                {packages.length > 0 ? (
                  <>
                    <div className="relative">
                      {packages.length > 1 && (
                        <>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="absolute left-2 top-1/2 transform -translate-y-1/2 z-10 bg-white rounded-full shadow-md h-8 w-8"
                            onClick={prevPackage}
                          >
                            <ChevronLeft className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="absolute right-2 top-1/2 transform -translate-y-1/2 z-10 bg-white rounded-full shadow-md h-8 w-8"
                            onClick={nextPackage}
                          >
                            <ChevronRightIcon className="h-4 w-4" />
                          </Button>
                        </>
                      )}
                      
                      <div className="grid grid-cols-1 gap-4">
                        <Card>
                          <CardHeader>
                            <CardTitle className="text-lg">
                              {packages[currentPackageIndex]?.title}
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            <p className="text-muted-foreground mb-4">
                              {packages[currentPackageIndex]?.description}
                            </p>
                            
                            <div className="space-y-3">
                              <div className="flex items-center text-sm">
                                <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
                                {packages[currentPackageIndex]?.duration}
                              </div>
                              <div className="flex items-center text-sm">
                                <Users className="h-4 w-4 mr-2 text-muted-foreground" />
                                Até {packages[currentPackageIndex]?.maxGroupSize} pessoas
                              </div>
                              <div className="flex items-center text-sm">
                                <MapPin className="h-4 w-4 mr-2 text-muted-foreground" />
                                {packages[currentPackageIndex]?.location}
                              </div>
                              <div className="flex items-center text-sm">
                                <DollarSign className="h-4 w-4 mr-2 text-muted-foreground" />
                                {packages[currentPackageIndex]?.price.toLocaleString('pt-AO', {
                                  style: 'currency',
                                  currency: 'AOA'
                                })}
                              </div>
                            </div>
                            
                            <div className="mt-6">
                              <h4 className="font-medium mb-2">Inclui:</h4>
                              <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                                {packages[currentPackageIndex]?.includes.map((item, index) => (
                                  <li key={index}>{item}</li>
                                ))}
                              </ul>
                            </div>
                            
                            <Button 
                              className="w-full mt-6"
                              onClick={() => handleBookPackage(packages[currentPackageIndex]?.id)}
                            >
                              <Calendar className="h-4 w-4 mr-2" />
                              Reservar Pacote
                            </Button>
                          </CardContent>
                        </Card>
                      </div>
                      
                      {packages.length > 1 && (
                        <div className="flex justify-center mt-4 space-x-2">
                          {packages.map((_, index) => (
                            <button
                              key={index}
                              onClick={() => setCurrentPackageIndex(index)}
                              className={`h-2 w-2 rounded-full ${currentPackageIndex === index ? 'bg-primary' : 'bg-gray-300'}`}
                              aria-label={`Ir para o pacote ${index + 1}`}
                            />
                          ))}
                        </div>
                      )}
                    </div>
                  </>
                ) : (
                  <div className="text-center py-12 text-muted-foreground">
                    <Package className="h-12 w-12 mx-auto mb-4" />
                    <h4 className="text-lg font-medium">Nenhum pacote disponível</h4>
                    <p>Este guia ainda não criou pacotes turísticos</p>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="reviews" className="mt-6">
                <h3 className="text-lg font-semibold mb-4">Avaliações dos Clientes</h3>
                
                {reviews.length > 0 ? (
                  <div className="space-y-6">
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
                            <div className="flex items-center">
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
          </DialogContent>
        )}
      </Dialog>
    </div>
  );
}