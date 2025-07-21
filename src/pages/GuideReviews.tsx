
import { useState } from "react";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Star, User, Calendar, MessageSquare, TrendingUp, Award } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

const GuideReviews = () => {
  const [ratingFilter, setRatingFilter] = useState("todas");
  
  const reviews = [
    {
      id: 1,
      tourist: "Maria Silva",
      tour: "City Tour Luanda",
      rating: 5,
      comment: "Excelente guia! Carlos conhece muito bem a história de Luanda e tornou o passeio muito interessante. Recomendo!",
      date: new Date(2024, 0, 20),
      tourDate: new Date(2024, 0, 15)
    },
    {
      id: 2,
      tourist: "João Santos",
      tour: "Miradouro da Lua",
      rating: 5,
      comment: "Experiência incrível! O Carlos é muito profissional e nos mostrou lugares únicos. Paisagens deslumbrantes!",
      date: new Date(2024, 0, 18),
      tourDate: new Date(2024, 0, 12)
    },
    {
      id: 3,
      tourist: "Ana Costa",
      tour: "Fortaleza de São Miguel",
      rating: 4,
      comment: "Bom passeio, guide muito informativo sobre a história colonial. Gostei bastante da experiência.",
      date: new Date(2024, 0, 16),
      tourDate: new Date(2024, 0, 10)
    },
    {
      id: 4,
      tourist: "Pedro Mendes",
      tour: "City Tour Luanda",
      rating: 5,
      comment: "Carlos é fantástico! Muito atencioso, pontual e conhece cada cantinho da cidade. Voltarei com certeza!",
      date: new Date(2024, 0, 14),
      tourDate: new Date(2024, 0, 8)
    },
    {
      id: 5,
      tourist: "Lucia Fernandes",
      tour: "Miradouro da Lua",
      rating: 4,
      comment: "Passeio muito bom, lugares lindos. Carlos explica muito bem sobre a geologia local.",
      date: new Date(2024, 0, 12),
      tourDate: new Date(2024, 0, 5)
    },
    {
      id: 6,
      tourist: "Roberto Lima",
      tour: "City Tour Luanda",
      rating: 3,
      comment: "Passeio ok, mas esperava um pouco mais de informações sobre alguns pontos turísticos.",
      date: new Date(2024, 0, 10),
      tourDate: new Date(2024, 0, 3)
    }
  ];

  const filteredReviews = reviews.filter(review => 
    ratingFilter === "todas" || review.rating.toString() === ratingFilter
  );

  const averageRating = reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length;
  
  const ratingDistribution = [5, 4, 3, 2, 1].map(rating => ({
    rating,
    count: reviews.filter(r => r.rating === rating).length,
    percentage: (reviews.filter(r => r.rating === rating).length / reviews.length) * 100
  }));

  const renderStars = (rating: number, size: string = "h-4 w-4") => {
    return (
      <div className="flex">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`${size} ${
              star <= rating 
                ? "fill-yellow-400 text-yellow-400" 
                : "text-gray-300"
            }`}
          />
        ))}
      </div>
    );
  };

  const stats = {
    totalReviews: reviews.length,
    averageRating: averageRating.toFixed(1),
    fiveStars: reviews.filter(r => r.rating === 5).length,
    thisMonth: reviews.filter(r => r.date.getMonth() === new Date().getMonth()).length
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Minhas Avaliações</h1>
          <p className="text-muted-foreground">Veja o que os turistas estão dizendo sobre seus passeios</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <MessageSquare className="h-4 w-4" />
                Total de Avaliações
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalReviews}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Star className="h-4 w-4 text-yellow-500" />
                Avaliação Média
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.averageRating}</div>
              <div className="flex mt-1">
                {renderStars(Math.round(averageRating), "h-3 w-3")}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Award className="h-4 w-4 text-yellow-500" />
                5 Estrelas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">{stats.fiveStars}</div>
              <div className="text-sm text-muted-foreground">
                {((stats.fiveStars / stats.totalReviews) * 100).toFixed(0)}% do total
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-green-500" />
                Este Mês
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.thisMonth}</div>
              <div className="text-sm text-muted-foreground">Novas avaliações</div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Rating Distribution */}
          <Card>
            <CardHeader>
              <CardTitle>Distribuição das Avaliações</CardTitle>
              <CardDescription>Como os turistas avaliam seus passeios</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {ratingDistribution.map(({ rating, count, percentage }) => (
                <div key={rating} className="flex items-center gap-3">
                  <div className="flex items-center gap-1 w-16">
                    <span className="text-sm">{rating}</span>
                    <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                  </div>
                  <div className="flex-1 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-yellow-400 h-2 rounded-full"
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>
                  <span className="text-sm text-muted-foreground w-8">{count}</span>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Reviews List */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Comentários dos Turistas</CardTitle>
                  <CardDescription>
                    {filteredReviews.length} avaliação(ões) encontrada(s)
                  </CardDescription>
                </div>
                <Select value={ratingFilter} onValueChange={setRatingFilter}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Filtrar por estrelas" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todas">Todas as avaliações</SelectItem>
                    <SelectItem value="5">5 estrelas</SelectItem>
                    <SelectItem value="4">4 estrelas</SelectItem>
                    <SelectItem value="3">3 estrelas</SelectItem>
                    <SelectItem value="2">2 estrelas</SelectItem>
                    <SelectItem value="1">1 estrela</SelectItem>
                  </SelectContent>
                </Select>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {filteredReviews.map((review) => (
                    <div key={review.id} className="border-b pb-6 last:border-b-0">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                            <User className="h-5 w-5 text-gray-500" />
                          </div>
                          <div>
                            <h4 className="font-medium">{review.tourist}</h4>
                            <p className="text-sm text-muted-foreground">{review.tour}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          {renderStars(review.rating)}
                          <div className="text-xs text-muted-foreground mt-1">
                            {format(review.date, "dd/MM/yyyy", { locale: ptBR })}
                          </div>
                        </div>
                      </div>
                      <p className="text-muted-foreground mb-2">{review.comment}</p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Calendar className="h-3 w-3" />
                        Passeio realizado em {format(review.tourDate, "dd/MM/yyyy", { locale: ptBR })}
                      </div>
                    </div>
                  ))}
                </div>

                {filteredReviews.length === 0 && (
                  <div className="text-center py-12">
                    <Star className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-lg font-medium mb-2">Nenhuma avaliação encontrada</h3>
                    <p className="text-muted-foreground">
                      {ratingFilter === 'todas' 
                        ? 'Você ainda não recebeu avaliações'
                        : `Não há avaliações com ${ratingFilter} estrela(s)`
                      }
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GuideReviews;
