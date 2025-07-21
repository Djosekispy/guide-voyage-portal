
import { useState } from "react";
import { MapPin, Star, Languages, Calendar, Clock, Users, Heart, Share2, Phone, Mail } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Header from "@/components/Header";

const GuideProfile = () => {
  const [isFavorite, setIsFavorite] = useState(false);

  const guide = {
    id: 1,
    name: "Maria Santos",
    city: "Luanda",
    rating: 4.9,
    reviews: 45,
    yearsExperience: 8,
    languages: ["Português", "Inglês", "Francês"],
    specialties: ["História", "Cultura", "Gastronomia"],
    image: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=300&h=300&fit=crop&crop=face",
    price: "80.000 Kz/dia",
    description: "Sou uma guia turística apaixonada por mostrar as belezas e a rica história de Luanda. Com 8 anos de experiência, já guiei mais de 500 turistas pelas principais atrações da nossa capital. Especializo-me em tours históricos, culturais e gastronômicos, sempre com muito carinho e dedicação aos meus clientes.",
    phone: "+244 923 456 789",
    email: "maria.santos@email.com",
    responseTime: "1 hora",
    location: {
      lat: -8.8390,
      lng: 13.2894
    }
  };

  const tours = [
    {
      id: 1,
      title: "Tour Histórico pela Fortaleza de São Miguel",
      duration: "4 horas",
      price: "60.000 Kz",
      description: "Explore a história colonial de Angola na icônica Fortaleza de São Miguel",
      image: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=200&fit=crop"
    },
    {
      id: 2,
      title: "Descobrindo a Marginal de Luanda",
      duration: "3 horas", 
      price: "45.000 Kz",
      description: "Passeio pela famosa marginal com vista para a Baía de Luanda",
      image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=200&fit=crop"
    },
    {
      id: 3,
      title: "Experiência Gastronômica Angolana",
      duration: "5 horas",
      price: "120.000 Kz",
      description: "Tour gastronômico pelos melhores sabores tradicionais de Angola",
      image: "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=400&h=200&fit=crop"
    }
  ];

  const reviews = [
    {
      id: 1,
      name: "Pedro Silva",
      rating: 5,
      date: "Janeiro 2024",
      comment: "Maria é uma guia excepcional! Muito conhecedora da história de Luanda e super atenciosa. Recomendo!"
    },
    {
      id: 2,
      name: "Ana Costa",
      rating: 5,
      date: "Dezembro 2023", 
      comment: "Tour incrível! Maria nos mostrou lugares que jamais encontraríamos sozinhos. Uma experiência inesquecível!"
    },
    {
      id: 3,
      name: "João Fernandes",
      rating: 4,
      date: "Novembro 2023",
      comment: "Muito profissional e pontual. O tour gastronômico foi uma delícia! Vale muito a pena."
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="pt-24 container mx-auto px-4 py-8">
        {/* Header Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          <div className="lg:col-span-2">
            <Card>
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row gap-6">
                  <Avatar className="w-32 h-32 mx-auto md:mx-0">
                    <AvatarImage src={guide.image} />
                    <AvatarFallback>{guide.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                  </Avatar>
                  
                  <div className="flex-1 text-center md:text-left">
                    <div className="flex items-center justify-between mb-2">
                      <h1 className="text-3xl font-bold">{guide.name}</h1>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setIsFavorite(!isFavorite)}
                        >
                          <Heart className={`w-4 h-4 ${isFavorite ? 'fill-red-500 text-red-500' : ''}`} />
                        </Button>
                        <Button variant="outline" size="sm">
                          <Share2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2 mb-4 justify-center md:justify-start">
                      <MapPin className="w-4 h-4 text-muted-foreground" />
                      <span className="text-muted-foreground">{guide.city}, Angola</span>
                    </div>
                    
                    <div className="flex items-center gap-4 mb-4 justify-center md:justify-start">
                      <div className="flex items-center gap-1">
                        <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                        <span className="font-semibold">{guide.rating}</span>
                        <span className="text-muted-foreground">({guide.reviews} avaliações)</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">{guide.yearsExperience} anos de experiência</span>
                      </div>
                    </div>
                    
                    <p className="text-muted-foreground mb-4">{guide.description}</p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <Languages className="w-4 h-4 text-muted-foreground" />
                          <span className="font-medium">Idiomas:</span>
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {guide.languages.map((language) => (
                            <Badge key={language} variant="secondary">
                              {language}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <Star className="w-4 h-4 text-muted-foreground" />
                          <span className="font-medium">Especialidades:</span>
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {guide.specialties.map((specialty) => (
                            <Badge key={specialty} variant="outline">
                              {specialty}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* Contact Card */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle className="text-center">Contratar Guia</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center mb-6">
                  <div className="text-3xl font-bold text-primary mb-2">{guide.price}</div>
                  <p className="text-sm text-muted-foreground">por dia de tour</p>
                </div>
                
                <div className="space-y-4 mb-6">
                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="w-4 h-4 text-muted-foreground" />
                    <span>Responde em {guide.responseTime}</span>
                  </div>
                  
                  <div className="flex items-center gap-2 text-sm">
                    <Phone className="w-4 h-4 text-muted-foreground" />
                    <span>{guide.phone}</span>
                  </div>
                  
                  <div className="flex items-center gap-2 text-sm">
                    <Mail className="w-4 h-4 text-muted-foreground" />
                    <span>{guide.email}</span>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Button variant="hero" className="w-full">
                    Solicitar Reserva
                  </Button>
                  <Button variant="outline" className="w-full">
                    Enviar Mensagem
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Tabs Section */}
        <Tabs defaultValue="tours" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="tours">Passeios Disponíveis</TabsTrigger>
            <TabsTrigger value="reviews">Avaliações</TabsTrigger>
            <TabsTrigger value="map">Localização</TabsTrigger>
          </TabsList>
          
          <TabsContent value="tours" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {tours.map((tour) => (
                <Card key={tour.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                  <CardContent className="p-0">
                    <img 
                      src={tour.image} 
                      alt={tour.title}
                      className="w-full h-48 object-cover"
                    />
                    <div className="p-6">
                      <h3 className="font-semibold mb-2">{tour.title}</h3>
                      <p className="text-sm text-muted-foreground mb-4">{tour.description}</p>
                      
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <Clock className="w-4 h-4" />
                          {tour.duration}
                        </div>
                        <span className="font-bold text-primary">{tour.price}</span>
                      </div>
                      
                      <Button variant="outline" className="w-full">
                        Ver Detalhes
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
          
          <TabsContent value="reviews" className="mt-6">
            <div className="space-y-6">
              {reviews.map((review) => (
                <Card key={review.id}>
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <Avatar>
                        <AvatarFallback>{review.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h4 className="font-semibold">{review.name}</h4>
                          <div className="flex items-center gap-1">
                            {[...Array(5)].map((_, i) => (
                              <Star 
                                key={i} 
                                className={`w-4 h-4 ${i < review.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} 
                              />
                            ))}
                          </div>
                          <span className="text-sm text-muted-foreground">{review.date}</span>
                        </div>
                        <p className="text-muted-foreground">{review.comment}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
          
          <TabsContent value="map" className="mt-6">
            <Card>
              <CardContent className="p-6">
                <div className="bg-muted rounded-lg h-96 flex items-center justify-center">
                  <div className="text-center">
                    <MapPin className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-xl font-semibold mb-2">Mapa Interativo</h3>
                    <p className="text-muted-foreground">
                      Localização aproximada do guia em {guide.city}
                    </p>
                    <p className="text-sm text-muted-foreground mt-2">
                      Coordenadas: {guide.location.lat}, {guide.location.lng}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default GuideProfile;
