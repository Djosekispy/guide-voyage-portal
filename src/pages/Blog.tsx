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
      title: "Turismo em Angola: Tesouros Escondidos do Continente Africano",
      excerpt: "Descubra as maravilhas naturais e culturais que fazem de Angola um destino único na África...",
      image: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=400&fit=crop",
      author: "Maria Kiluanje",
      date: "2024-01-15",
      readTime: "8 min",
      category: "turismo",
      tags: ["Angola", "turismo", "África"]
    },
    {
      id: 2,
      title: "Cultura Angolana: Tradições que Resistem ao Tempo",
      excerpt: "Conheça as ricas tradições culturais angolanas, desde a música à dança e artesanato...",
      image: "https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=800&h=400&fit=crop",
      author: "João Savimbi",
      date: "2024-01-12",
      readTime: "7 min",
      category: "cultura",
      tags: ["cultura", "tradições", "Angola"]
    },
    {
      id: 3,
      title: "Deserto do Namibe: Aventura no Sul de Angola",
      excerpt: "Explore as paisagens únicas do Deserto do Namibe e suas formações rochosas impressionantes...",
      image: "https://images.unsplash.com/photo-1465146344425-f00d5f5c8f07?w=800&h=400&fit=crop",
      author: "Ana Tchimboto",
      date: "2024-01-10",
      readTime: "6 min",
      category: "turismo",
      tags: ["Namibe", "deserto", "aventura"]
    },
    {
      id: 4,
      title: "Dicas de Segurança para Viajar em Angola",
      excerpt: "Conselhos essenciais para uma viagem segura e proveitosa pelo território angolano...",
      image: "https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=800&h=400&fit=crop",
      author: "Carlos Bento",
      date: "2024-01-08",
      readTime: "5 min",
      category: "seguranca",
      tags: ["segurança", "viagem", "Angola"]
    },
    {
      id: 5,
      title: "Gastronomia Angolana: Sabores Autênticos da África",
      excerpt: "Delicie-se com os pratos tradicionais angolanos: muamba, calulu, funge e muito mais...",
      image: "https://images.unsplash.com/photo-1482938289607-e9573fc25ebb?w=800&h=400&fit=crop",
      author: "Rosa Miguel",
      date: "2024-01-05",
      readTime: "8 min",
      category: "cultura",
      tags: ["gastronomia", "culinária", "Angola"]
    },
    {
      id: 6,
      title: "Documentação para Viajar em Angola",
      excerpt: "Tudo que você precisa saber sobre vistos, documentos e preparativos para visitar Angola...",
      image: "https://images.unsplash.com/photo-1500673922987-e212871fec22?w=800&h=400&fit=crop",
      author: "Manuel Dos Santos",
      date: "2024-01-03",
      readTime: "4 min",
      category: "dicas",
      tags: ["documentos", "visto", "Angola"]
    },
    {
      id: 7,
      title: "Quedas de Kalandula: A Majestade das Águas Angolanas",
      excerpt: "Visite uma das maiores quedas d'água da África, localizada na província de Malanje...",
      image: "https://images.unsplash.com/photo-1472396961693-142e6e269027?w=800&h=400&fit=crop",
      author: "Isabel Tchingenge",
      date: "2024-01-01",
      readTime: "6 min",
      category: "turismo",
      tags: ["Kalandula", "cachoeiras", "Malanje"]
    },
    {
      id: 8,
      title: "Luanda: Capital Moderna com História Colonial",
      excerpt: "Explore a vibrante capital angolana, entre arranha-céus modernos e patrimônio histórico...",
      image: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=400&fit=crop",
      author: "Pedro Kandombe",
      date: "2023-12-28",
      readTime: "9 min",
      category: "turismo",
      tags: ["Luanda", "história", "capital"]
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