import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { MapPin, Star, Users, ChevronLeft, ChevronRight, X, Eye } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { destinations } from "@/mock/destination";

const FeaturedDestinations = () => {
 const navigate = useNavigate();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [selectedDestination, setSelectedDestination] = useState<number | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleViewGuides = (city: string) => {
    navigate(`/guias?city=${encodeURIComponent(city)}`);
  };

  const handleViewAllDestinations = () => {
    navigate("/destinos");
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

  return (
    <section className="py-20 bg-muted/30">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* ... cabeçalho ... */}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          {destinations.map((destination) => (
            <Card key={destination.id} className="group overflow-hidden hover:shadow-nature transition-all duration-300 transform hover:-translate-y-2">
              <div className="relative aspect-[4/3] overflow-hidden">
                {/* Imagem principal (simplificado - removendo o carrossel temporariamente) */}
                <div className="relative h-full w-full">
                  <img
                    src={destination.images[0]} // Mostra apenas a primeira imagem
                    alt={destination.name}
                    className="w-full h-full object-cover cursor-pointer"
                    
                  />
                </div>
                
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                <div className="absolute bottom-4 left-4 right-4 text-white">
                  <h3 className="text-xl font-bold mb-1">{destination.name}</h3>
                  <p className="text-sm text-white/80 flex items-center">
                    <MapPin className="h-4 w-4 mr-1" />
                    {destination.country}
                  </p>
                </div>
              </div>
              
              <CardContent className="p-6">
                <p className="text-muted-foreground mb-4">{destination.description}</p>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Users className="h-4 w-4 mr-1" />
                    {destination.guides} guias
                  </div>
                  <div className="flex items-center text-sm">
                    <Star className="h-4 w-4 mr-1 text-yellow-500 fill-yellow-500" />
                    {destination.rating}
                  </div>
                </div>
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => handleViewGuides(destination.name)}
                >
                  Ver Guias
                </Button>
                <Button 
                  variant="outline" 
                  className=" absolute top-0 left-2 mt-2"
                onClick={() => openImageModal(destination.id, 0)}
                >
                  <Eye size={24} color="black" />
                </Button>
              </CardContent>
            </Card>
          ))}
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
      <div className="absolute inset-0 flex items-center justify-between px-4">
        <button
          onClick={(e) => {
            e.stopPropagation();
            prevImage();
          }}
          className="bg-black/50 text-white rounded-full p-2 hover:bg-black/70 transition-all"
        >
          <ChevronLeft className="h-8 w-8" />
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            nextImage();
          }}
          className="bg-black/50 text-white rounded-full p-2 hover:bg-black/70 transition-all"
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
            className={`h-3 w-3 rounded-full ${
              index === currentImageIndex ? "bg-white" : "bg-white/50"
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