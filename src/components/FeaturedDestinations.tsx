import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { MapPin, Star, Users, ChevronLeft, ChevronRight, X, Eye } from "lucide-react";
import { useNavigate } from "react-router-dom";

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

const destinations = [
  {
    id: 1,
    name: "Luanda",
    country: "Angola",
    images: [
      "/public/locais/luanda.jpg",
      "/public/locais/luanda1.jpg",
      "/public/locais/luanda2.jpg",
 
    ],
    guides: 28,
    rating: 4.8,
    description: "Capital vibrante com vida noturna animada, praias urbanas e história colonial"
  },
  {
    id: 2,
    name: "Benguela",
    country: "Angola",
    images: [
     "/public/locais/benguela1.jpg",
      "https://images.unsplash.com/photo-1578662996442-48f60103fc96?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
      "https://images.unsplash.com/photo-1578662996442-48f60103fc96?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80"
    
   
    ],
    guides: 15,
    rating: 4.7,
    description: "Cidade costeira com praias de areia branca e influência arquitetônica portuguesa"
  },
  {
    id: 3,
    name: "Huambo",
    country: "Angola",
    images: [
      "https://images.unsplash.com/photo-1578662996442-48f60103fc96?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
      "https://images.unsplash.com/photo-1578662996442-48f60103fc96?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
      "https://images.unsplash.com/photo-1578662996442-48f60103fc96?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80"
    
   
    ],
    guides: 12,
    rating: 4.6,
    description: "Planalto central com clima ameno e paisagens montanhosas deslumbrantes"
  },
  {
    id: 4,
    name: "Huíla",
    country: "Angola",
    images: [
      "/public/locais/huila1.jpg",
      "/public/locais/huila2.jpg",
      "/public/locais/huila3.jpg",   
    ],
    guides: 14,
    rating: 4.9,
    description: "Cenários impressionantes da Serra da Leba e Fenda da Tundavala"
  },
  {
    id: 5,
    name: "Namibe",
    country: "Angola",
    images: [
        "/public/locais/namibe1.jpg",
        "/public/locais/namibe2.jpg",
        "/public/locais/namibe3.jpg",
        "/public/locais/namibe4.jpg",
    ],
    guides: 10,
    rating: 4.5,
    description: "Deserto costeiro único com flora endêmica e paisagens lunares"
  },
  {
    id: 6,
    name: "Cabinda",
    country: "Angola",
    images: [
      "https://images.unsplash.com/photo-1578662996442-48f60103fc96?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
      "https://images.unsplash.com/photo-1578662996442-48f60103fc96?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
      "https://images.unsplash.com/photo-1578662996442-48f60103fc96?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80"
    
   
    ],
    guides: 8,
    rating: 4.4,
    description: "Enclave com densas florestas tropicais e rica cultura tradicional"
  },
  {
    id: 7,
    name: "Zaire",
    country: "Angola",
    images: [
      "https://images.unsplash.com/photo-1578662996442-48f60103fc96?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
      "https://images.unsplash.com/photo-1578662996442-48f60103fc96?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
      "https://images.unsplash.com/photo-1578662996442-48f60103fc96?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80"
    
   
    ],
    guides: 7,
    rating: 4.3,
    description: "Berço do antigo Reino do Kongo com sítios históricos UNESCO"
  },
  {
    id: 8,
    name: "Uíge",
    country: "Angola",
    images: [
      "https://images.unsplash.com/photo-1578662996442-48f60103fc96?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
      "https://images.unsplash.com/photo-1578662996442-48f60103fc96?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
      "https://images.unsplash.com/photo-1578662996442-48f60103fc96?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80"
    
   
    ],
    guides: 9,
    rating: 4.2,
    description: "Região montanhosa com cachoeiras escondidas e antigas fazendas de café"
  },
  {
    id: 9,
    name: "Malanje",
    country: "Angola",
    images: [
      "https://images.unsplash.com/photo-1578662996442-48f60103fc96?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
      "https://images.unsplash.com/photo-1578662996442-48f60103fc96?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
      "https://images.unsplash.com/photo-1578662996442-48f60103fc96?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80"
    
   
    ],
    guides: 11,
    rating: 4.7,
    description: "Lar das majestosas Quedas de Kalandula e formações rochosas únicas"
  },
  {
    id: 10,
    name: "Lunda Norte",
    country: "Angola",
    images: [
      "https://images.unsplash.com/photo-1578662996442-48f60103fc96?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
      "https://images.unsplash.com/photo-1578662996442-48f60103fc96?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
      "https://images.unsplash.com/photo-1578662996442-48f60103fc96?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80"
    
   
    ],
    guides: 6,
    rating: 4.1,
    description: "Terra dos diamantes com rios cênicos e rica arte Tchokwe"
  },
  {
    id: 11,
    name: "Lunda Sul",
    country: "Angola",
    images: [
      "https://images.unsplash.com/photo-1578662996442-48f60103fc96?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
      "https://images.unsplash.com/photo-1578662996442-48f60103fc96?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
      "https://images.unsplash.com/photo-1578662996442-48f60103fc96?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80"
    
   
    ],
    guides: 5,
    rating: 4.0,
    description: "Paisagens de savana e tradições culturais profundamente enraizadas"
  },
  {
    id: 12,
    name: "Bié",
    country: "Angola",
    images: [
      "https://images.unsplash.com/photo-1578662996442-48f60103fc96?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
      "https://images.unsplash.com/photo-1578662996442-48f60103fc96?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
      "https://images.unsplash.com/photo-1578662996442-48f60103fc96?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80"
    
   
    ],
    guides: 8,
    rating: 4.2,
    description: "Coração agrícola de Angola com paisagens de planalto e cultura Ovimbundu"
  },
  {
    id: 13,
    name: "Moxico",
    country: "Angola",
    images: [
      "https://images.unsplash.com/photo-1578662996442-48f60103fc96?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
      "https://images.unsplash.com/photo-1578662996442-48f60103fc96?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
      "https://images.unsplash.com/photo-1578662996442-48f60103fc96?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80"
    
   
    ],
    guides: 7,
    rating: 4.3,
    description: "Maior província com vastas planícies aluviais e biodiversidade única"
  },
  {
    id: 14,
    name: "Cuando Cubango",
    country: "Angola",
    images: [
      "https://images.unsplash.com/photo-1578662996442-48f60103fc96?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
      "https://images.unsplash.com/photo-1578662996442-48f60103fc96?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
      "https://images.unsplash.com/photo-1578662996442-48f60103fc96?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80"
    
   
    ],
    guides: 6,
    rating: 4.4,
    description: "Portão para o Delta do Okavango com ecossistemas de savana preservados"
  },
  {
    id: 15,
    name: "Cunene",
    country: "Angola",
    images: [
      "https://images.unsplash.com/photo-1578662996442-48f60103fc96?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
      "https://images.unsplash.com/photo-1578662996442-48f60103fc96?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
      "https://images.unsplash.com/photo-1578662996442-48f60103fc96?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80"
    
   
    ],
    guides: 5,
    rating: 4.1,
    description: "Terra dos povos nômades Himba com paisagens desérticas dramáticas"
  },
  {
    id: 16,
    name: "Cuanza Norte",
    country: "Angola",
    images: [
      "https://images.unsplash.com/photo-1578662996442-48f60103fc96?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
      "https://images.unsplash.com/photo-1578662996442-48f60103fc96?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
      "https://images.unsplash.com/photo-1578662996442-48f60103fc96?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80"
    
   
    ],
    guides: 7,
    rating: 4.0,
    description: "Terras férteis ao longo do Rio Cuanza com importantes plantações"
  },
  {
    id: 17,
    name: "Cuanza Sul",
    country: "Angola",
    images: [
      "https://images.unsplash.com/photo-1578662996442-48f60103fc96?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
      "https://images.unsplash.com/photo-1578662996442-48f60103fc96?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
      "https://images.unsplash.com/photo-1578662996442-48f60103fc96?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80"
    
   
    ],
    guides: 9,
    rating: 4.2,
    description: "Costa atlântica com praias intocadas e quedas d'água espetaculares"
  },
  {
    id: 18,
    name: "Bengo",
    country: "Angola",
    images: [
      "https://images.unsplash.com/photo-1578662996442-48f60103fc96?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
      "https://images.unsplash.com/photo-1578662996442-48f60103fc96?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
      "https://images.unsplash.com/photo-1578662996442-48f60103fc96?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80"
    
   
    ],
    guides: 10,
    rating: 4.5,
    description: "Refúgio de vida selvagem próximo a Luanda com safaris autênticos"
  },
  {
    id: 19,
    name: "Lunda Norte",
    country: "Angola",
    images: [
      "https://images.unsplash.com/photo-1578662996442-48f60103fc96?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
      "https://images.unsplash.com/photo-1578662996442-48f60103fc96?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
      "https://images.unsplash.com/photo-1578662996442-48f60103fc96?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80"
    
   
    ],
    guides: 6,
    rating: 4.1,
    description: "Região rica em diamantes com tradições culturais fascinantes"
  },
  {
    id: 20,
    name: "Moxico",
    country: "Angola",
    images: [
      "https://images.unsplash.com/photo-1578662996442-48f60103fc96?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
      "https://images.unsplash.com/photo-1578662996442-48f60103fc96?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
      "https://images.unsplash.com/photo-1578662996442-48f60103fc96?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80"
    
   
    ],
    guides: 5,
    rating: 4.0,
    description: "Vastas extensões de natureza intocada e diversidade cultural"
  },
  {
    id: 21,
    name: "Cuando Cubango",
    country: "Angola",
    images: [
      "https://images.unsplash.com/photo-1578662996442-48f60103fc96?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
      "https://images.unsplash.com/photo-1578662996442-48f60103fc96?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
      "https://images.unsplash.com/photo-1578662996442-48f60103fc96?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80"
    
   
    ],
    guides: 4,
    rating: 4.2,
    description: "Fronteira com Botswana e acesso a ecossistemas únicos do Okavango"
  }
];

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