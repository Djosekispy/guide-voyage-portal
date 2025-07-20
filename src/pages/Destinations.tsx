import { useState } from "react";
import { Search, MapPin, Users, Star } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const Destinations = () => {
  const [searchTerm, setSearchTerm] = useState("");

  const destinations = [
    {
      id: 1,
      name: "Luanda",
      country: "Angola",
      image: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=600&fit=crop",
      guidesCount: 25,
      rating: 4.8,
      description: "Capital vibrante com Fortaleza de São Miguel, Marginal e rica história colonial"
    },
    {
      id: 2,
      name: "Benguela",
      country: "Angola",
      image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop",
      guidesCount: 18,
      rating: 4.7,
      description: "Cidade portuária com praias paradisíacas e arquitetura colonial portuguesa"
    },
    {
      id: 3,
      name: "Huambo",
      country: "Angola",
      image: "https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=800&h=600&fit=crop",
      guidesCount: 15,
      rating: 4.6,
      description: "Planalto central com clima ameno, paisagens montanhosas e patrimônio cultural"
    },
    {
      id: 4,
      name: "Lubango",
      country: "Angola",
      image: "https://images.unsplash.com/photo-1472396961693-142e6e269027?w=800&h=600&fit=crop",
      guidesCount: 14,
      rating: 4.8,
      description: "Serra da Leba com curvas espetaculares e Cristo Rei com vistas panorâmicas"
    },
    {
      id: 5,
      name: "Namibe",
      country: "Angola",
      image: "https://images.unsplash.com/photo-1465146344425-f00d5f5c8f07?w=800&h=600&fit=crop",
      guidesCount: 12,
      rating: 4.9,
      description: "Deserto do Namibe com paisagens únicas e encontro entre deserto e oceano"
    },
    {
      id: 6,
      name: "Soyo",
      country: "Angola",
      image: "https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800&h=600&fit=crop",
      guidesCount: 10,
      rating: 4.5,
      description: "Ponto histórico onde o majestoso Rio Congo encontra o Oceano Atlântico"
    },
    {
      id: 7,
      name: "Cabinda",
      country: "Angola",
      image: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800&h=600&fit=crop",
      guidesCount: 8,
      rating: 4.4,
      description: "Enclave rico em petróleo com florestas tropicais e praias selvagens"
    },
    {
      id: 8,
      name: "Malanje",
      country: "Angola",
      image: "https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=800&h=600&fit=crop",
      guidesCount: 11,
      rating: 4.6,
      description: "Portal para as impressionantes Quedas de Kalandula e pedras negras de Pungo Andongo"
    }
  ];

  const filteredDestinations = destinations.filter(destination =>
    destination.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    destination.country.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen pt-24">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-primary/10 to-secondary/10 py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-6">
            Destinos em Angola
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
            Descubra as maravilhas naturais e culturais de Angola com guias locais especializados
          </p>
          
          {/* Search Bar */}
          <div className="max-w-md mx-auto relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
            <Input
              type="text"
              placeholder="Buscar destino..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 py-3 text-lg"
            />
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-16">
        {/* Results Count */}
        <div className="mb-8">
          <p className="text-muted-foreground">
            {filteredDestinations.length} destino{filteredDestinations.length !== 1 ? 's' : ''} encontrado{filteredDestinations.length !== 1 ? 's' : ''}
          </p>
        </div>

        {/* Destinations Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredDestinations.map((destination) => (
            <Card key={destination.id} className="overflow-hidden hover:shadow-lg transition-shadow group cursor-pointer">
              <CardContent className="p-0">
                <div className="relative overflow-hidden">
                  <img 
                    src={destination.image} 
                    alt={destination.name}
                    className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-4 right-4 bg-background/90 rounded-full px-2 py-1 flex items-center gap-1">
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    <span className="text-sm font-medium">{destination.rating}</span>
                  </div>
                </div>
                
                <div className="p-6">
                  <div className="flex items-center gap-2 mb-2">
                    <MapPin className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">{destination.name}, {destination.country}</span>
                  </div>
                  
                  <h3 className="text-xl font-bold mb-3">{destination.name}</h3>
                  <p className="text-muted-foreground mb-4 line-clamp-2">
                    {destination.description}
                  </p>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">
                        {destination.guidesCount} guias disponíveis
                      </span>
                    </div>
                    
                    <Button variant="outline" size="sm">
                      Ver Guias
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* No Results */}
        {filteredDestinations.length === 0 && (
          <div className="text-center py-16">
            <MapPin className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">Nenhum destino encontrado</h3>
            <p className="text-muted-foreground">
              Tente buscar por outro destino ou país
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Destinations;