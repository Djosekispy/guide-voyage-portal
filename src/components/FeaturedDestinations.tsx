import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { MapPin, Star, Users } from "lucide-react";

const FeaturedDestinations = () => {
  const destinations = [
    {
      id: 1,
      name: "Luanda",
      country: "Angola",
      image: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
      guides: 25,
      rating: 4.8,
      description: "Capital vibrante com Fortaleza de São Miguel e Marginal"
    },
    {
      id: 2,
      name: "Benguela",
      country: "Angola",
      image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
      guides: 18,
      rating: 4.7,
      description: "Praias paradisíacas e arquitetura colonial portuguesa"
    },
    {
      id: 3,
      name: "Huambo",
      country: "Angola",
      image: "https://images.unsplash.com/photo-1469474968028-56623f02e42e?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
      guides: 15,
      rating: 4.6,
      description: "Planalto central com clima ameno e paisagens montanhosas"
    },
    {
      id: 4,
      name: "Namibe",
      country: "Angola",
      image: "https://images.unsplash.com/photo-1465146344425-f00d5f5c8f07?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
      guides: 12,
      rating: 4.9,
      description: "Deserto do Namibe e paisagens únicas do sul de Angola"
    },
    {
      id: 5,
      name: "Lubango",
      country: "Angola",
      image: "https://images.unsplash.com/photo-1472396961693-142e6e269027?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
      guides: 14,
      rating: 4.8,
      description: "Serra da Leba e Cristo Rei com vistas espetaculares"
    },
    {
      id: 6,
      name: "Soyo",
      country: "Angola",
      image: "https://images.unsplash.com/photo-1559827260-dc66d52bef19?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
      guides: 10,
      rating: 4.5,
      description: "Ponto histórico onde o Rio Congo encontra o Atlântico"
    }
  ];

  return (
    <section className="py-20 bg-muted/30">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
            Destinos em Angola
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Descubra as maravilhas de Angola com nossos guias locais especializados
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          {destinations.map((destination) => (
            <Card key={destination.id} className="group overflow-hidden hover:shadow-nature transition-all duration-300 transform hover:-translate-y-2">
              <div className="relative aspect-[4/3] overflow-hidden">
                <img
                  src={destination.image}
                  alt={destination.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                />
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
                <Button variant="outline" className="w-full">
                  Ver Guias
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center">
          <Button variant="hero" size="lg">
            Ver Todos os Destinos
          </Button>
        </div>
      </div>
    </section>
  );
};

export default FeaturedDestinations;