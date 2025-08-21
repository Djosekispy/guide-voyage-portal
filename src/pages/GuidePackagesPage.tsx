import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Search, Filter, MapPin, Clock, Star, Wallet, Users, X } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getGuidePackages, getGuideProfile, Guide, TourPackage } from "@/lib/firestore";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function GuidePackagesPage() {
  const { guideId } = useParams();
  const [guide, setGuide] = useState<Guide | null>(null);
  const [packages, setPackages] = useState<TourPackage[]>([]);
  const [filteredPackages, setFilteredPackages] = useState<TourPackage[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPackage, setSelectedPackage] = useState<TourPackage | null>(null);
  
  // Filtros
  const [searchTerm, setSearchTerm] = useState("");
  const [priceRange, setPriceRange] = useState([0, 100000000]);
  const [durationFilter, setDurationFilter] = useState("");
  const [sortOption, setSortOption] = useState("popular");

  useEffect(() => {
    const fetchData = async () => {
      if (!guideId) return;
      setLoading(true);
      const guideData = await getGuideProfile(guideId);
      const packageList = await getGuidePackages(guideId);
      setGuide(guideData);
      setPackages(packageList);
      setFilteredPackages(packageList);
      setLoading(false);
    };

    fetchData();
  }, [guideId]);

  useEffect(() => {
    applyFilters();
  }, [searchTerm, priceRange, durationFilter, sortOption, packages]);

  const applyFilters = () => {
    let result = [...packages];
    
    // Filtro por busca
    if (searchTerm) {
      result = result.filter(pkg => 
        pkg.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
        pkg.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        pkg.location.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Filtro por preço
    result = result.filter(pkg => 
      pkg.price >= priceRange[0] && pkg.price <= priceRange[1]
    );
    
    // Filtro por duração
    if (durationFilter) {
      result = result.filter(pkg => {
        const durationHours = parseInt(pkg.duration.split(' ')[0]);
        if (durationFilter === "short") return durationHours <= 4;
        if (durationFilter === "medium") return durationHours > 4 && durationHours <= 8;
        if (durationFilter === "long") return durationHours > 8;
        return true;
      });
    }
    
    // Ordenação
    result.sort((a, b) => {
      if (sortOption === "price-asc") return a.price - b.price;
      if (sortOption === "price-desc") return b.price - a.price;
      if (sortOption === "duration") return parseInt(a.duration) - parseInt(b.duration);
      return (b.rating || 0) - (a.rating || 0); // padrão: popularidade (rating)
    });
    
    setFilteredPackages(result);
  };

  const formatCurrency = (value: number) => {
    return value.toLocaleString("pt-AO", { 
      style: "currency", 
      currency: "AOA",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  };

  const openPackageModal = (pkg: TourPackage) => {
    setSelectedPackage(pkg);
    document.body.style.overflow = 'hidden'; // Impede scroll da página principal
  };

  const closePackageModal = () => {
    setSelectedPackage(null);
    document.body.style.overflow = 'auto'; // Restaura scroll da página principal
  };

  if (loading) return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-lg">Carregando pacotes turísticos...</p>
        </div>
      </div>
      <Footer />
    </div>
  );

  if (!guide) return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center p-6 max-w-md mx-auto bg-white rounded-xl shadow-md">
          <h2 className="text-2xl font-bold text-red-600 mb-2">Guia não encontrado</h2>
          <p className="mb-4">O guia que você está procurando não está disponível ou não existe.</p>
          <Button asChild>
            <Link to="/guias">Voltar para lista de guias</Link>
          </Button>
        </div>
      </div>
      <Footer />
    </div>
  );

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />
      
      <main className="flex-1">
        {/* Cabeçalho do Guia */}
        <div className="bg-gradient-to-r from-primary to-secondary py-12 text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
              <div className="flex-shrink-0">
                <div className="w-24 h-24 rounded-full bg-white flex items-center justify-center shadow-lg overflow-hidden">
                  {guide.photoURL ? (
                    <img src={guide.photoURL} alt={guide.name} className="w-full  h-full object-cover" />
                  ) : (
                    <span className="text-3xl font-bold text-primary">
                      {guide.name.charAt(0)}
                    </span>
                  )}
                </div>
              </div>
              <div>
                <h1 className="text-3xl md:text-4xl font-bold mb-2">{guide.name}</h1>
                <div className="flex items-center gap-4 flex-wrap">
                  <div className="flex items-center">
                    <MapPin className="h-5 w-5 mr-1" />
                    <span>{guide.city}</span>
                  </div>
                  <div className="flex items-center">
                    <Star className="h-5 w-5 text-yellow-400 fill-yellow-400 mr-1" />
                    <span>{guide.rating?.toFixed(1) || 'Novo'} ({guide.reviewCount || 0} avaliações)</span>
                  </div>
                  <div className="flex items-center">
                    <Users className="h-5 w-5 mr-1" />
                    <span>{guide.experience} anos de experiência</span>
                  </div>
                </div>
                <p className="mt-3 max-w-3xl">{guide.description || "Guia turístico profissional com vasta experiência em mostrar as belezas locais."}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Área de Filtros */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
            <h2 className="text-xl font-semibold mb-4 flex items-center">
              <Filter className="h-5 w-5 mr-2" />
              Filtrar Pacotes
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Busca */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Buscar pacotes..."
                  className="pl-10"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              
              {/* Faixa de Preço */}
              <div>
                <label className="block text-sm font-medium mb-2">Preço: até {formatCurrency(priceRange[1])}</label>
                <Slider
                  defaultValue={[1000000]}
                  max={1000000}
                  min={0}
                  step={10000}
                  value={priceRange}
                  onValueChange={setPriceRange}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>{formatCurrency(0)}</span>
                  <span>{formatCurrency(1000000)}</span>
                </div>
              </div>
              
              {/* Duração */}
              <div>
                <label className="block text-sm font-medium mb-2">Duração</label>
                <Select value={durationFilter} onValueChange={setDurationFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Todas durações" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="duracao">Todas durações</SelectItem>
                    <SelectItem value="short">Curta (até 4h)</SelectItem>
                    <SelectItem value="medium">Média (4-8h)</SelectItem>
                    <SelectItem value="long">Longa (+8h)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              {/* Ordenação */}
              <div>
                <label className="block text-sm font-medium mb-2">Ordenar por</label>
                <Select value={sortOption} onValueChange={setSortOption}>
                  <SelectTrigger>
                    <SelectValue placeholder="Popular" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="popular">Mais populares</SelectItem>
                    <SelectItem value="price-asc">Preço: menor primeiro</SelectItem>
                    <SelectItem value="price-desc">Preço: maior primeiro</SelectItem>
                    <SelectItem value="duration">Duração</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Resultados */}
          <div>
            <h2 className="text-2xl font-bold mb-6">Pacotes Disponíveis</h2>
            
            {filteredPackages.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-xl shadow-sm">
                <p className="text-lg text-gray-600">Nenhum pacote encontrado com os filtros selecionados.</p>
                <Button 
                  variant="outline" 
                  className="mt-4"
                  onClick={() => {
                    setSearchTerm("");
                    setPriceRange([0, 1000000]);
                    setDurationFilter("");
                    setSortOption("popular");
                  }}
                >
                  Limpar filtros
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
               {filteredPackages.map((pkg) => (
  <Card 
    key={pkg.id} 
    className="hover:shadow-md transition-shadow duration-300 h-full flex flex-col"
  >
    {/* Imagem do pacote */}
    {pkg.images && (
      <div className="relative w-full h-48">
        <img 
          src={pkg.images[0]} 
          alt={pkg.title} 
          className="w-full h-full object-cover rounded-t-xl" 
        />
      </div>
    )}

    <CardHeader>
      <div className="flex justify-between items-start">
        <div>
          <CardTitle className="text-xl">{pkg.title}</CardTitle>
          <CardDescription className="mt-1 line-clamp-2">{pkg.location}</CardDescription>
        </div>
      </div>
    </CardHeader>
    
    <CardContent className="flex-grow">
      <p className="text-gray-600 mb-4 line-clamp-3">{pkg.description}</p>
      
      <div className="space-y-3">
        <div className="flex items-center">
          <Clock className="h-4 w-4 mr-2 text-gray-500" />
          <span className="text-sm">{pkg.duration}</span>
        </div>
        
        <div className="flex items-center">
          <MapPin className="h-4 w-4 mr-2 text-gray-500" />
          <span className="text-sm">{pkg.location}</span>
        </div>
        
        <div className="flex items-center">
          <Users className="h-4 w-4 mr-2 text-gray-500" />
          <span className="text-sm">Até {pkg.maxGroupSize} pessoas</span>
        </div>
      </div>
    </CardContent>
    
    <CardFooter className="flex flex-col items-start border-t pt-4">
      <div className="w-full flex justify-between items-center mb-3">
        <span className="text-2xl font-bold text-primary">
          {formatCurrency(pkg.price)}
        </span>
        {pkg.rating && (
          <div className="flex items-center">
            <Star className="h-4 w-4 text-yellow-400 fill-yellow-400 mr-1" />
            <span>{pkg.rating.toFixed(1)}</span>
          </div>
        )}
      </div>    
      <div className="w-full flex gap-2">
        <Button 
          variant="outline" 
          className="flex-1"
          onClick={() => openPackageModal(pkg)}
        >
          Detalhes
        </Button>
        <Button className="flex-1" asChild>
          <Link to={`/pacotes/${pkg.id}/reserva`}>Reservar</Link>
        </Button>
      </div>
    </CardFooter>
  </Card>
))}

              </div>
            )}
          </div>
        </div>
      </main>
      
      <Footer />

      {/* Modal de Detalhes do Pacote */}
      {selectedPackage && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white p-4 border-b flex justify-between items-center">
              <h2 className="text-2xl font-bold">{selectedPackage.title}</h2>
              <button 
                onClick={closePackageModal}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            
            <div className="p-6">
              {/* Imagens (se houver) */}
              {selectedPackage.images?.length > 0 && (
                <div className="mb-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {selectedPackage.images.slice(0, 4).map((img, index) => (
                      <div key={index} className="h-48 rounded-lg overflow-hidden">
                        <img 
                          src={img} 
                          alt={`Imagem ${index + 1} do pacote ${selectedPackage.title}`}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Informações básicas */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="space-y-2">
                  <h3 className="font-semibold flex items-center">
                    <MapPin className="h-5 w-5 mr-2 text-primary" />
                    Localização
                  </h3>
                  <p>{selectedPackage.location}</p>
                </div>
                
                <div className="space-y-2">
                  <h3 className="font-semibold flex items-center">
                    <Clock className="h-5 w-5 mr-2 text-primary" />
                    Duração
                  </h3>
                  <p>{selectedPackage.duration}</p>
                </div>
                
                <div className="space-y-2">
                  <h3 className="font-semibold flex items-center">
                    <Users className="h-5 w-5 mr-2 text-primary" />
                    Tamanho do grupo
                  </h3>
                  <p>Até {selectedPackage.maxGroupSize} pessoas</p>
                </div>
              </div>
              
              {/* Descrição completa */}
              <div className="mb-8">
                <h3 className="text-xl font-semibold mb-3">Sobre este pacote</h3>
                <p className="text-gray-700 whitespace-pre-line">{selectedPackage.description}</p>
              </div>
              
              {/* Itinerário */}
              {selectedPackage.itinerary?.length > 0 && (
                <div className="mb-8">
                  <h3 className="text-xl font-semibold mb-3">Itinerário</h3>
                  <ol className="list-decimal pl-5 space-y-2">
                    {selectedPackage.itinerary.map((item, index) => (
                      <li key={index} className="text-gray-700">
                        {item}
                      </li>
                    ))}
                  </ol>
                </div>
              )}
              
              {/* Incluso/Não incluso */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div>
                  <h3 className="text-xl font-semibold mb-3 text-green-600">Inclui</h3>
                  <ul className="space-y-2">
                    {selectedPackage.includes?.length > 0 ? (
                      selectedPackage.includes.map((item, index) => (
                        <li key={index} className="flex items-start">
                          <span className="text-green-500 mr-2">✓</span>
                          <span>{item}</span>
                        </li>
                      ))
                    ) : (
                      <li className="text-gray-500">Nenhum item informado</li>
                    )}
                  </ul>
                </div>
                
                <div>
                  <h3 className="text-xl font-semibold mb-3 text-red-600">Não inclui</h3>
                  <ul className="space-y-2">
                    {selectedPackage.excludes?.length > 0 ? (
                      selectedPackage.excludes.map((item, index) => (
                        <li key={index} className="flex items-start">
                          <span className="text-red-500 mr-2">✗</span>
                          <span>{item}</span>
                        </li>
                      ))
                    ) : (
                      <li className="text-gray-500">Nenhum item informado</li>
                    )}
                  </ul>
                </div>
              </div>
              
              {/* Preço e ação */}
              <div className="border-t pt-6 flex flex-col md:flex-row justify-between items-center gap-4">
                <div>
                  <p className="text-sm text-gray-500">Preço total</p>
                  <p className="text-3xl font-bold text-primary">
                    {formatCurrency(selectedPackage.price)}
                  </p>
                </div>
                
                <div className="flex gap-3 w-full md:w-auto">
                  <Button 
                    variant="outline" 
                    className="flex-1"
                    onClick={closePackageModal}
                  >
                    Voltar
                  </Button>
                  <Button className="flex-1" asChild>
                    <Link 
                      to={`/pacotes/${selectedPackage.id}/reserva`}
                      onClick={closePackageModal}
                    >
                      Reservar agora
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}