
import { useState } from "react";
import { Search, MapPin, Languages, Star, Filter, Users } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Header from "@/components/Header";
import GoogleMapsAngola from "@/components/GoogleMapsAngola";

const SearchGuides = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCity, setSelectedCity] = useState("");
  const [selectedLanguage, setSelectedLanguage] = useState("");
  const [selectedSpecialty, setSelectedSpecialty] = useState("");

  const guides = [
    {
      id: 1,
      name: "Maria Santos",
      city: "Luanda",
      rating: 4.9,
      reviews: 45,
      languages: ["Português", "Inglês", "Francês"],
      specialties: ["História", "Cultura", "Gastronomia"],
      image: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face",
      price: "80.000 Kz/dia",
      description: "Especialista em tours históricos e culturais pela capital angolana"
    },
    {
      id: 2,
      name: "João Fernandes",
      city: "Malanje",
      rating: 4.8,
      reviews: 32,
      languages: ["Português", "Inglês"],
      specialties: ["Natureza", "Aventura", "Fotografia"],
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
      price: "120.000 Kz/dia",
      description: "Guia especializado em tours pelas Quedas de Kalandula e Pedras Negras"
    },
    {
      id: 3,
      name: "Ana Pereira",
      city: "Lubango",
      rating: 4.7,
      reviews: 28,
      languages: ["Português", "Inglês", "Espanhol"],
      specialties: ["Montanhismo", "Paisagens", "Aventura"],
      image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face",
      price: "150.000 Kz/dia",
      description: "Especialista em tours pela Serra da Leba e Cristo Rei"
    },
    {
      id: 4,
      name: "Carlos Mbala",
      city: "Namibe",
      rating: 4.9,
      reviews: 38,
      languages: ["Português", "Inglês"],
      specialties: ["Deserto", "Geologia", "Astronomia"],
      image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
      price: "200.000 Kz/dia",
      description: "Guia especializado no Deserto do Namibe e astronomia noturna"
    },
    {
      id: 5,
      name: "Isabel Kimbo",
      city: "Benguela",
      rating: 4.6,
      reviews: 25,
      languages: ["Português", "Francês"],
      specialties: ["Praias", "Pesca", "Cultura Local"],
      image: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop&crop=face",
      price: "90.000 Kz/dia",
      description: "Especialista em tours costeiros e experiências culturais locais"
    },
    {
      id: 6,
      name: "Miguel Tchitembo",
      city: "Huambo",
      rating: 4.8,
      reviews: 22,
      languages: ["Português", "Inglês"],
      specialties: ["Planalto", "Agricultura", "História"],
      image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face",
      price: "110.000 Kz/dia",
      description: "Guia especializado no planalto central e patrimônio histórico"
    }
  ];

  const cities = ["Luanda", "Benguela", "Huambo", "Lubango", "Namibe", "Malanje", "Soyo", "Cabinda"];
  const languages = ["Português", "Inglês", "Francês", "Espanhol"];
  const specialties = ["História", "Cultura", "Natureza", "Aventura", "Gastronomia", "Praias", "Deserto", "Montanhismo"];

  const filteredGuides = guides.filter(guide => {
    const matchesSearch = guide.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         guide.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCity = !selectedCity || guide.city === selectedCity;
    const matchesLanguage = !selectedLanguage || guide.languages.includes(selectedLanguage);
    const matchesSpecialty = !selectedSpecialty || guide.specialties.includes(selectedSpecialty);
    
    return matchesSearch && matchesCity && matchesLanguage && matchesSpecialty;
  });

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="pt-24">
        {/* Hero Section */}
        <section className="bg-gradient-to-r from-primary/10 to-secondary/10 py-20">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-6">
              Buscar Guias Turísticos
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
              Encontre o guia perfeito para sua aventura em Angola
            </p>
          </div>
        </section>

        <div className="container mx-auto px-4 py-8">
          {/* Filters */}
          <Card className="mb-8">
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input
                    placeholder="Buscar por nome ou descrição..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                
                <Select value={selectedCity} onValueChange={setSelectedCity}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecionar Cidade" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Todas as Cidades</SelectItem>
                    {cities.map((city) => (
                      <SelectItem key={city} value={city}>{city}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={selectedLanguage} onValueChange={setSelectedLanguage}>
                  <SelectTrigger>
                    <SelectValue placeholder="Idioma" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Todos os Idiomas</SelectItem>
                    {languages.map((language) => (
                      <SelectItem key={language} value={language}>{language}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={selectedSpecialty} onValueChange={setSelectedSpecialty}>
                  <SelectTrigger>
                    <SelectValue placeholder="Especialidade" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Todas as Especialidades</SelectItem>
                    {specialties.map((specialty) => (
                      <SelectItem key={specialty} value={specialty}>{specialty}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Button variant="outline" onClick={() => {
                  setSearchTerm("");
                  setSelectedCity("");
                  setSelectedLanguage("");
                  setSelectedSpecialty("");
                }}>
                  <Filter className="mr-2 h-4 w-4" />
                  Limpar Filtros
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Mapa Interativo */}
          <Card className="mb-8">
            <CardContent className="p-0">
              <GoogleMapsAngola height="400px" showSearch={true} showControls={true} />
            </CardContent>
          </Card>

          {/* Results */}
          <div className="mb-6">
            <p className="text-muted-foreground">
              {filteredGuides.length} guia{filteredGuides.length !== 1 ? 's' : ''} encontrado{filteredGuides.length !== 1 ? 's' : ''}
            </p>
          </div>

          {/* Guides Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredGuides.map((guide) => (
              <Card key={guide.id} className="overflow-hidden hover:shadow-lg transition-shadow group cursor-pointer">
                <CardContent className="p-0">
                  <div className="relative">
                    <img 
                      src={guide.image} 
                      alt={guide.name}
                      className="w-full h-48 object-cover"
                    />
                    <div className="absolute top-4 right-4 bg-background/90 rounded-full px-2 py-1 flex items-center gap-1">
                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      <span className="text-sm font-medium">{guide.rating}</span>
                    </div>
                  </div>
                  
                  <div className="p-6">
                    <div className="flex items-center gap-2 mb-2">
                      <MapPin className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">{guide.city}</span>
                    </div>
                    
                    <h3 className="text-xl font-bold mb-2">{guide.name}</h3>
                    <p className="text-muted-foreground mb-4 text-sm">
                      {guide.description}
                    </p>
                    
                    <div className="mb-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Languages className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm font-medium">Idiomas:</span>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {guide.languages.map((language) => (
                          <Badge key={language} variant="secondary" className="text-xs">
                            {language}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <div className="mb-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Star className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm font-medium">Especialidades:</span>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {guide.specialties.map((specialty) => (
                          <Badge key={specialty} variant="outline" className="text-xs">
                            {specialty}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between mb-4">
                      <span className="font-bold text-primary text-lg">{guide.price}</span>
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Users className="w-4 h-4" />
                        {guide.reviews} avaliações
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" className="flex-1">
                        Ver Perfil
                      </Button>
                      <Button variant="hero" size="sm" className="flex-1">
                        Contratar
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* No Results */}
          {filteredGuides.length === 0 && (
            <div className="text-center py-16">
              <Users className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Nenhum guia encontrado</h3>
              <p className="text-muted-foreground">
                Tente ajustar os filtros de busca
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SearchGuides;
