import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { MapPin, Star, Users, ChevronLeft, ChevronRight, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { destinations } from "@/mock/destination";
import { getAllCitiesWithGuideCounts } from "@/lib/firestore";

interface CityStats {
  count: number;
  avgRating: number;
}

const FeaturedDestinations = () => {
  const navigate = useNavigate();
  const [currentImageIndices, setCurrentImageIndices] = useState<Record<number, number>>({});
  const [selectedDestination, setSelectedDestination] = useState<number | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [cityStats, setCityStats] = useState<Map<string, CityStats>>(new Map());
  const [loadingStats, setLoadingStats] = useState(true);

  useEffect(() => {
    const fetchCityStats = async () => {
      try {
        const stats = await getAllCitiesWithGuideCounts();
        setCityStats(stats);
      } catch (error) {
        console.error('Error fetching city stats:', error);
      } finally {
        setLoadingStats(false);
      }
    };
    
    fetchCityStats();
  }, []);

  const handleViewGuides = (city: string) => {
    navigate(`/guias?city=${encodeURIComponent(city)}`);
  };

  const handleViewAllDestinations = () => {
    navigate("/destinos");
  };

  // Carousel navigation for individual cards
  const nextCardImage = (destinationId: number, totalImages: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentImageIndices(prev => ({
      ...prev,
      [destinationId]: ((prev[destinationId] || 0) + 1) % totalImages
    }));
  };

  const prevCardImage = (destinationId: number, totalImages: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentImageIndices(prev => ({
      ...prev,
      [destinationId]: ((prev[destinationId] || 0) - 1 + totalImages) % totalImages
    }));
  };

  const openImageModal = (destinationId: number, index: number = 0) => {
    setSelectedDestination(destinationId);
    setCurrentImageIndex(index);
    setIsModalOpen(true);
    document.body.style.overflow = 'hidden';
  };

  const closeImageModal = () => {
    setIsModalOpen(false);
    document.body.style.overflow = 'auto';
  };

  const nextImage = () => {
    const destination = destinations.find(d => d.id === selectedDestination);
    if (destination) {
      setCurrentImageIndex((prevIndex) => 
        (prevIndex + 1) % destination.images.length
      );
    }
  };

  const prevImage = () => {
    const destination = destinations.find(d => d.id === selectedDestination);
    if (destination) {
      setCurrentImageIndex((prevIndex) => 
        (prevIndex - 1 + destination.images.length) % destination.images.length
      );
    }
  };

  const getCurrentDestination = () => {
    return destinations.find(d => d.id === selectedDestination);
  };

  const getGuideCount = (cityName: string): number => {
    return cityStats.get(cityName)?.count || 0;
  };

  const getCityRating = (cityName: string): number => {
    const stats = cityStats.get(cityName);
    if (stats && stats.avgRating > 0) {
      return stats.avgRating;
    }
    // Retornar rating do mock se não houver dados reais
    const destination = destinations.find(d => d.name === cityName);
    return destination?.rating || 0;
  };

  return (
    <section className="py-20 bg-muted/30">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Destinos em Destaque</h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Explore as maravilhas de Angola com guias locais especializados
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          {destinations.slice(0, 6).map((destination) => {
            const currentIndex = currentImageIndices[destination.id] || 0;
            const guideCount = getGuideCount(destination.name);
            const rating = getCityRating(destination.name);
            
            return (
              <Card key={destination.id} className="group overflow-hidden hover:shadow-nature transition-all duration-300 transform hover:-translate-y-2">
                <div className="relative aspect-[4/3] overflow-hidden">
                  {/* Carousel de imagens */}
                  <div className="relative h-full w-full">
                    <img
                      src={destination.images[currentIndex]}
                      alt={destination.name}
                      className="w-full h-full object-cover cursor-pointer transition-transform duration-500"
                      onClick={() => openImageModal(destination.id, currentIndex)}
                    />
                    
                    {/* Navegação do Carrossel */}
                    {destination.images.length > 1 && (
                      <>
                        <button
                          onClick={(e) => prevCardImage(destination.id, destination.images.length, e)}
                          className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 text-white rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/70"
                        >
                          <ChevronLeft className="h-4 w-4" />
                        </button>
                        <button
                          onClick={(e) => nextCardImage(destination.id, destination.images.length, e)}
                          className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 text-white rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/70"
                        >
                          <ChevronRight className="h-4 w-4" />
                        </button>
                        
                        {/* Indicadores de posição */}
                        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
                          {destination.images.map((_, idx) => (
                            <button
                              key={idx}
                              onClick={(e) => {
                                e.stopPropagation();
                                setCurrentImageIndices(prev => ({
                                  ...prev,
                                  [destination.id]: idx
                                }));
                              }}
                              className={`h-1.5 rounded-full transition-all ${
                                idx === currentIndex 
                                  ? "bg-white w-4" 
                                  : "bg-white/50 w-1.5 hover:bg-white/75"
                              }`}
                            />
                          ))}
                        </div>
                      </>
                    )}
                  </div>
                  
                  {/* Rating Badge */}
                  <div className="absolute top-3 right-3 bg-black/70 backdrop-blur-sm rounded-full px-2.5 py-1 flex items-center gap-1">
                    <Star className="h-3.5 w-3.5 text-yellow-400 fill-yellow-400" />
                    <span className="text-white text-sm font-medium">{rating.toFixed(1)}</span>
                  </div>
                  
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />
                  <div className="absolute bottom-4 left-4 right-4 text-white">
                    <h3 className="text-xl font-bold mb-1">{destination.name}</h3>
                    <p className="text-sm text-white/80 flex items-center">
                      <MapPin className="h-4 w-4 mr-1" />
                      {destination.country}
                    </p>
                  </div>
                </div>
                
                <CardContent className="p-6">
                  <p className="text-muted-foreground mb-4 line-clamp-2">{destination.description}</p>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Users className="h-4 w-4 mr-1" />
                      {loadingStats ? (
                        <span className="animate-pulse">...</span>
                      ) : guideCount > 0 ? (
                        <span>{guideCount} {guideCount === 1 ? 'guia' : 'guias'}</span>
                      ) : (
                        <span className="text-muted-foreground/70">Sem guias ainda</span>
                      )}
                    </div>
                    <div className="flex items-center text-sm">
                      <Star className="h-4 w-4 mr-1 text-yellow-500 fill-yellow-500" />
                      {rating.toFixed(1)}
                    </div>
                  </div>
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={() => handleViewGuides(destination.name)}
                    disabled={guideCount === 0}
                  >
                    {guideCount > 0 ? 'Ver Guias' : 'Sem guias disponíveis'}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Modal de Imagens */}
        {isModalOpen && selectedDestination && (
          <div className="fixed inset-0 bg-black/90 z-[9999] flex items-center justify-center p-4">
            <div className="relative max-w-6xl w-full flex flex-col items-center">
              {/* Botão Fechar */}
              <button
                onClick={closeImageModal}
                className="absolute top-4 right-4 z-10 text-white hover:text-gray-300"
              >
                <X className="h-8 w-8" />
              </button>

              {/* Imagem Atual */}
              <img
                src={getCurrentDestination()?.images[currentImageIndex]}
                alt={`${getCurrentDestination()?.name} ${currentImageIndex + 1}`}
                className="max-h-[80vh] object-contain"
              />

              {/* Botões de Navegação */}
              <div className="absolute inset-0 flex items-center justify-between px-4 pointer-events-none">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    prevImage();
                  }}
                  className="bg-black/50 text-white rounded-full p-2 hover:bg-black/70 transition-all pointer-events-auto"
                >
                  <ChevronLeft className="h-8 w-8" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    nextImage();
                  }}
                  className="bg-black/50 text-white rounded-full p-2 hover:bg-black/70 transition-all pointer-events-auto"
                >
                  <ChevronRight className="h-8 w-8" />
                </button>
              </div>

              {/* Indicadores */}
              <div className="absolute bottom-4 left-0 right-0 flex justify-center space-x-2">
                {getCurrentDestination()?.images.map((_, index) => (
                  <button
                    key={index}
                    onClick={(e) => {
                      e.stopPropagation();
                      setCurrentImageIndex(index);
                    }}
                    className={`h-3 w-3 rounded-full transition-all ${
                      index === currentImageIndex ? "bg-white scale-110" : "bg-white/50 hover:bg-white/75"
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>
        )}

        <div className="text-center">
          <Button 
            variant="hero" 
            size="lg"
            onClick={handleViewAllDestinations}
          >
            Ver Todos os Destinos
          </Button>
        </div>
      </div>
    </section>
  );
};

export default FeaturedDestinations;