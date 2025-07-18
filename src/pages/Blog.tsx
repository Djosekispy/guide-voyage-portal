import { useState } from "react";
import { Calendar, Clock, User, Search, Tag } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const Blog = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  const categories = [
    { id: "all", name: "Todos" },
    { id: "turismo", name: "Turismo" },
    { id: "cultura", name: "Cultura" },
    { id: "seguranca", name: "Segurança" },
    { id: "dicas", name: "Dicas" }
  ];

  const articles = [
    {
      id: 1,
      title: "10 Dicas Essenciais para Viajar com Segurança",
      excerpt: "Aprenda como se manter seguro durante suas viagens e aproveitar ao máximo cada destino...",
      image: "https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=800&h=400&fit=crop",
      author: "Ana Silva",
      date: "2024-01-15",
      readTime: "5 min",
      category: "seguranca",
      tags: ["segurança", "viagem", "dicas"]
    },
    {
      id: 2,
      title: "Cultura Local: Como Ser um Viajante Respeitoso",
      excerpt: "Entenda a importância de respeitar culturas locais e como isso enriquece sua experiência...",
      image: "https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=800&h=400&fit=crop",
      author: "Carlos Santos",
      date: "2024-01-12",
      readTime: "7 min",
      category: "cultura",
      tags: ["cultura", "respeito", "tradições"]
    },
    {
      id: 3,
      title: "Os Melhores Destinos para Turismo Sustentável",
      excerpt: "Descubra destinos que promovem o turismo responsável e sustentável...",
      image: "https://images.unsplash.com/photo-1465146344425-f00d5f5c8f07?w=800&h=400&fit=crop",
      author: "Maria Costa",
      date: "2024-01-10",
      readTime: "6 min",
      category: "turismo",
      tags: ["sustentabilidade", "ecoturismo", "natureza"]
    },
    {
      id: 4,
      title: "Como Escolher o Guia Turístico Ideal",
      excerpt: "Saiba o que considerar na hora de escolher um guia local para sua viagem...",
      image: "https://images.unsplash.com/photo-1472396961693-142e6e269027?w=800&h=400&fit=crop",
      author: "João Oliveira",
      date: "2024-01-08",
      readTime: "4 min",
      category: "dicas",
      tags: ["guias", "escolha", "viagem"]
    },
    {
      id: 5,
      title: "Gastronomia Local: Uma Jornada de Sabores",
      excerpt: "Explore como a culinária local pode transformar sua experiência de viagem...",
      image: "https://images.unsplash.com/photo-1482938289607-e9573fc25ebb?w=800&h=400&fit=crop",
      author: "Sofia Rodriguez",
      date: "2024-01-05",
      readTime: "8 min",
      category: "cultura",
      tags: ["gastronomia", "cultura", "experiência"]
    },
    {
      id: 6,
      title: "Documentos e Preparativos: Lista Completa",
      excerpt: "Checklist completo do que você precisa organizar antes de viajar...",
      image: "https://images.unsplash.com/photo-1500673922987-e212871fec22?w=800&h=400&fit=crop",
      author: "Pedro Almeida",
      date: "2024-01-03",
      readTime: "10 min",
      category: "dicas",
      tags: ["documentos", "preparativos", "checklist"]
    }
  ];

  const filteredArticles = articles.filter(article => {
    const matchesSearch = article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         article.excerpt.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "all" || article.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen pt-24">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-primary/10 to-secondary/10 py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-6">
            Blog & Dicas de Viagem
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
            Artigos, dicas e insights para tornar suas viagens mais seguras, culturais e inesquecíveis
          </p>
          
          {/* Search Bar */}
          <div className="max-w-md mx-auto relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
            <Input
              type="text"
              placeholder="Buscar artigos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 py-3 text-lg"
            />
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-16">
        {/* Categories Filter */}
        <div className="mb-8">
          <div className="flex flex-wrap gap-3">
            {categories.map((category) => (
              <Button
                key={category.id}
                variant={selectedCategory === category.id ? "default" : "outline"}
                onClick={() => setSelectedCategory(category.id)}
                className="rounded-full"
              >
                {category.name}
              </Button>
            ))}
          </div>
        </div>

        {/* Results Count */}
        <div className="mb-8">
          <p className="text-muted-foreground">
            {filteredArticles.length} artigo{filteredArticles.length !== 1 ? 's' : ''} encontrado{filteredArticles.length !== 1 ? 's' : ''}
          </p>
        </div>

        {/* Articles Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredArticles.map((article) => (
            <Card key={article.id} className="overflow-hidden hover:shadow-lg transition-shadow group cursor-pointer">
              <CardContent className="p-0">
                <div className="relative overflow-hidden">
                  <img 
                    src={article.image} 
                    alt={article.title}
                    className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-4 right-4">
                    <Badge variant="secondary" className="bg-background/90">
                      {categories.find(cat => cat.id === article.category)?.name}
                    </Badge>
                  </div>
                </div>
                
                <div className="p-6">
                  <h3 className="text-xl font-bold mb-3 line-clamp-2 group-hover:text-primary transition-colors">
                    {article.title}
                  </h3>
                  <p className="text-muted-foreground mb-4 line-clamp-2">
                    {article.excerpt}
                  </p>
                  
                  <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                    <div className="flex items-center gap-1">
                      <User className="w-4 h-4" />
                      <span>{article.author}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      <span>{new Date(article.date).toLocaleDateString('pt-BR')}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      <span>{article.readTime}</span>
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap gap-2 mb-4">
                    {article.tags.map((tag, index) => (
                      <div key={index} className="flex items-center gap-1">
                        <Tag className="w-3 h-3 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground">{tag}</span>
                      </div>
                    ))}
                  </div>
                  
                  <Button variant="outline" className="w-full">
                    Ler Artigo
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* No Results */}
        {filteredArticles.length === 0 && (
          <div className="text-center py-16">
            <Search className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">Nenhum artigo encontrado</h3>
            <p className="text-muted-foreground">
              Tente buscar por outros termos ou categorias
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Blog;