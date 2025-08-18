
import { useEffect, useState } from "react";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Star, User, Calendar, MessageSquare, TrendingUp, Award } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import GuideSidebar from "@/components/GuideSidebar";
import { getGuideBookings, getGuideReviews, Review } from "@/lib/firestore";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";

const GuideReviews = () => {
  const [ratingFilter, setRatingFilter] = useState("todas");
      const {user, userData } = useAuth()
      
       const [reviews, setReviews] = useState<Review[]>([]);
        const [loading, setLoading] = useState(true);
  
 

  const filteredReviews = reviews.filter(review => 
    ratingFilter === "todas" || review.rating.toString() === ratingFilter
  );

  const averageRating = reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length;
  
  const ratingDistribution = [5, 4, 3, 2, 1].map(rating => ({
    rating,
    count: reviews.filter(r => r.rating === rating).length,
    percentage: (reviews.filter(r => r.rating === rating).length / reviews.length) * 100
  }));

    useEffect(() => {
      if (user && userData?.userType === 'guide') {
        loadDashboardData();
      }
    }, [user, userData]);
  
    
  
    const loadDashboardData = async () => {
      try {
        setLoading(true);
        
        if (!user?.uid) return;
  
  
            if (user) {
            const guideReviews = await getGuideReviews(user.uid);
            const guideTours = await getGuideBookings(user.uid);

            const dataAll = guideReviews.map(review => {
              const tour = guideTours.find(tour => tour.id === review.bookingId); 
              return {
                ...review,
                tour: tour ? tour.city : null,
                tourDate: tour ? tour.createdAt : null
              };
            });

            setReviews(dataAll);
          }

      } catch (error) {
        console.error('Erro ao carregar dados:', error);
        toast({
          title: "Erro",
          description: "Não foi possível carregar os dados do dashboard",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };



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

thisMonth: reviews.filter(r => {
  if (!r.createdAt) return false;

  // garante que temos Date
  const date = r.createdAt instanceof Date 
    ? r.createdAt 
    : r.createdAt.toDate();

  // pega mês/ano como string "MM-yyyy"
  const reviewMonthYear = format(date, "MM-yyyy");
  const currentMonthYear = format(new Date(), "MM-yyyy");

  return reviewMonthYear === currentMonthYear;
}).length
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
         <GuideSidebar />
    <div  className="flex-1 lg:ml-64 px-4 pt-4">
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
             {filteredReviews.map((review) => {
  const createdAt = review.createdAt instanceof Date 
    ? review.createdAt 
    : review.createdAt?.toDate?.() ?? null;

  const tourDate = (review as any).tourDate instanceof Date 
    ? (review as any).tourDate 
    : (review as any).tourDate?.toDate?.() ?? null;

  return (
    <div key={review.id} className="border-b pb-6 last:border-b-0">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
            <User className="h-5 w-5 text-gray-500" />
          </div>
          <div>
            <h4 className="font-medium">{review.touristName}</h4>
            <p className="text-sm text-muted-foreground">{(review as any).tour}</p>
          </div>
        </div>
        <div className="text-right">
          {renderStars(review.rating)}
          <div className="text-xs text-muted-foreground mt-1">
            {createdAt ? format(createdAt, "dd/MM/yyyy", { locale: ptBR }) : "Data inválida"}
          </div>
        </div>
      </div>
      <p className="text-muted-foreground mb-2">{review.comment}</p>
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <Calendar className="h-3 w-3" />
        Passeio realizado em{" "}
        {tourDate ? format(tourDate, "dd/MM/yyyy", { locale: ptBR }) : "Data inválida"}
      </div>
    </div>
  );
})}

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
