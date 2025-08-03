
import { useEffect, useState } from "react";
import { Star, Send, Camera, MapPin, Calendar, Clock, User } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import Header from "@/components/Header";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { Booking, createReview, getBookingOneReview, getGuideBookingById, getGuideProfile, getTourPackage, Guide, Review, TourPackage, updateBookingReview } from "@/lib/firestore";
import { useAuth } from "@/contexts/AuthContext";
import { set } from "date-fns";

const ReviewTour = () => {
  
  const [hoveredStar, setHoveredStar] = useState(0);
  const { toast } = useToast();
  const params  = useSearchParams();
  const bookingId = params[0].get('bookingId')
  const { user, userData } = useAuth()
  const navigate = useNavigate();
  const [tour, setTour] = useState<Booking>(null)
    const [guide, setGuide] = useState<Guide>(null)
     const [reviewed, setReviewed] = useState<Review>(null)
  const [isLoading, setisLoading ] = useState(true)

  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  useEffect(()=>{
        const loadDashboardData = async () => {
          try {
            // Carrega todas as reservas do turista
            const bookings = await getGuideBookingById(bookingId);
            const guideData = await getGuideProfile(bookings.guideId);
            const ReviwedYet = await getBookingOneReview(bookingId,user.uid);
            console.log(ReviwedYet)
            setTour(bookings);
            setGuide(guideData);
            setReviewed(ReviwedYet);
            setComment(ReviwedYet?.comment);
            setRating(ReviwedYet?.rating)
            
          } catch (error) {
            console.error("Erro ao carregar dados do dashboard:", error);
          } finally {
            setisLoading(false);
          }
        };
    
        loadDashboardData();


  },[bookingId])



  const handleStarClick = (starValue: number) => {
    setRating(starValue);
  };

  const handleStarHover = (starValue: number) => {
    setHoveredStar(starValue);
  };

  const handleSubmitReview = async () => {
    if (rating === 0) {
      toast({
        title: "Avaliação necessária",
        description: "Por favor, selecione uma classificação de 1 a 5 estrelas.",
        variant: "destructive",
      });
      return;
    }

    if (comment.trim().length < 10) {
      toast({
        title: "Comentário muito curto",
        description: "Por favor, escreva um comentário com pelo menos 10 caracteres.",
        variant: "destructive",
      });
      return;
    }

    if(reviewed){
        await updateBookingReview(bookingId,user.uid,{
      bookingId,
      comment,
      guideId : guide.uid,
      guideName : guide.name,
      rating,
      touristId : user.uid,
      touristName : userData.name,
      packageId : tour.packageId
    })
    }else{
          await createReview({
      bookingId,
      comment,
      guideId : guide.uid,
      guideName : guide.name,
      rating,
      touristId : user.uid,
      touristName : userData.name,
      packageId : tour.packageId
    })
    }
    // Aqui seria enviado para o backend

    toast({
      title: "Avaliação enviada!",
      description: "Sua avaliação foi enviada com sucesso. Obrigado pelo feedback!",
    });

    // Reset form
    setRating(0);
    setComment("");
     navigate(-1);
  };

  const getRatingText = (stars: number) => {
    switch (stars) {
      case 1: return "Muito ruim";
      case 2: return "Ruim";
      case 3: return "Regular";
      case 4: return "Bom";
      case 5: return "Excelente";
      default: return "Selecione uma avaliação";
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />

        {isLoading ? (
        <div className="space-y-8 animate-pulse">
          <div className="h-6 bg-muted rounded w-1/2" />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="h-80 bg-muted rounded-lg" />
            <div className="h-80 bg-muted rounded-lg" />
          </div>
          <div className="h-40 bg-muted rounded-lg mt-8" />
        </div>
      ) : (
          <>
      <div className="pt-24 container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Avaliar Passeio</h1>
          <p className="text-muted-foreground">Compartilhe sua experiência e ajude outros turistas</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Tour Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Detalhes do Passeio
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <Avatar className="w-16 h-16">
                    <AvatarImage src={guide?.photoURL} />
                    <AvatarFallback>{tour?.guideName.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-semibold text-lg">{tour?.packageTitle}</h3>
                    <p className="text-muted-foreground">Guia: {tour?.guideName}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-muted-foreground" />
                    <span>{tour?.city}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-muted-foreground" />
                    <span>{tour?.date}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-muted-foreground" />
                    <span>{tour?.time} - {tour?.duration} Horas</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-muted-foreground" />
                    <span>{tour?.groupSize} participante{tour?.groupSize !== 1 ? 's' : ''}</span>
                  </div>
                </div>

                <div className="pt-4 border-t">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">Total Pago:</span>
                    <span className="text-2xl font-bold text-primary">{tour?.totalPrice.toLocaleString('pt-AO', { 
                                  style: 'currency', 
                                  currency: 'AOA' 
                                }) }</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Review Form */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Star className="h-5 w-5" />
                Sua Avaliação
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Star Rating */}
                <div className="text-center">
                  <p className="font-medium mb-4">Como foi sua experiência?</p>
                  <div className="flex justify-center gap-2 mb-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        onClick={() => handleStarClick(star)}
                        onMouseEnter={() => handleStarHover(star)}
                        onMouseLeave={() => setHoveredStar(0)}
                        className="transition-all duration-200 hover:scale-110"
                      >
                        <Star
                          className={`w-10 h-10 ${
                            star <= (hoveredStar || rating)
                              ? 'fill-yellow-400 text-yellow-400'
                              : 'text-gray-300 hover:text-yellow-400'
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {getRatingText(hoveredStar || rating)}
                  </p>
                </div>

                {/* Comment */}
                <div>
                  <label htmlFor="comment" className="block font-medium mb-2">
                    Conte-nos sobre sua experiência
                  </label>
                  <Textarea
                    id="comment"
                    placeholder="Descreva como foi o passeio, o que mais gostou, sugestões de melhoria..."
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    rows={6}
                    className="resize-none"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    {comment.length}/500 caracteres
                  </p>
                </div>

                {/* Photos (Future feature) 
                <div>
                  <label className="block font-medium mb-2">
                    Adicionar Fotos (Opcional)
                  </label>
                  <div className="border-2 border-dashed border-muted rounded-lg p-8 text-center">
                    <Camera className="w-12 h-12 text-muted-foreground mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">
                      Compartilhe suas fotos do passeio
                    </p>
                    <Button variant="outline" size="sm" className="mt-2" disabled>
                      Selecionar Fotos
                    </Button>
                    <p className="text-xs text-muted-foreground mt-1">
                      Funcionalidade em breve
                    </p>
                  </div>
                </div>
*/}
                {/* Submit Button */}
                <Button 
                  onClick={handleSubmitReview}
                  className="w-full h-12"
                  variant="hero"
                >
                  <Send className="w-4 h-4 mr-2" />
                  Enviar Avaliação
                </Button>

                <div className="text-center">
                  <p className="text-xs text-muted-foreground">
                    Sua avaliação será pública e ajudará outros turistas a escolher o melhor guia
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tips */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Dicas para uma boa avaliação</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <h4 className="font-medium mb-2">✓ Seja específico</h4>
                <p className="text-muted-foreground">
                  Mencione detalhes sobre o que mais gostou no passeio
                </p>
              </div>
              <div>
                <h4 className="font-medium mb-2">✓ Seja honesto</h4>
                <p className="text-muted-foreground">
                  Sua opinião sincera ajuda outros turistas e o guia a melhorar
                </p>
              </div>
              <div>
                <h4 className="font-medium mb-2">✓ Mencione o guia</h4>
                <p className="text-muted-foreground">
                  Comente sobre a qualidade do atendimento e conhecimento do guia
                </p>
              </div>
              <div>
                <h4 className="font-medium mb-2">✓ Dê sugestões</h4>
                <p className="text-muted-foreground">
                  Se houver algo a melhorar, sugira de forma construtiva
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
       </>
      )}
    </div>
  );
};

export default ReviewTour;
