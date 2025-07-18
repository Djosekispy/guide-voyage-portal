import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { MapPin, Star, Users } from "lucide-react";

const FeaturedDestinations = () => {
  const destinations = [
    {
      id: 1,
      name: "Rio de Janeiro",
      country: "Brasil",
      image: "https://images.unsplash.com/photo-1483729558449-99ef09a8c325?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
      guides: 45,
      rating: 4.9,
      description: "Cristo Redentor, Pão de Açúcar e praias paradisíacas"
    },
    {
      id: 2,
      name: "Machu Picchu",
      country: "Peru",
      image: "https://images.unsplash.com/photo-1587595431973-160d0d94add1?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
      guides: 23,
      rating: 4.8,
      description: "Mistérios incas e trilhas nas montanhas dos Andes"
    },
    {
      id: 3,
      name: "Paris",
      country: "França",
      image: "https://images.unsplash.com/photo-1502602898536-47ad22581b52?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
      guides: 78,
      rating: 4.7,
      description: "Torre Eiffel, Louvre e charme parisiense"
    },
    {
      id: 4,
      name: "Tóquio",
      country: "Japão",
      image: "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
      guides: 56,
      rating: 4.9,
      description: "Tradição milenar e modernidade futurista"
    },
    {
      id: 5,
      name: "Santorini",
      country: "Grécia",
      image: "https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
      guides: 34,
      rating: 4.8,
      description: "Pôr do sol romântico e arquitetura cicládica"
    },
    {
      id: 6,
      name: "Bali",
      country: "Indonésia",
      image: "https://images.unsplash.com/photo-1537953773345-d172ccf13cf1?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
      guides: 41,
      rating: 4.7,
      description: "Templos sagrados, praias e cultura balinesa"
    }
  ];

  return (
    <section className="py-20 bg-muted/30">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
            Destinos Populares
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Explore os destinos mais procurados pelos nossos viajantes com guias locais experientes
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