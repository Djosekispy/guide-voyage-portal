
import { useEffect, useState } from "react";
import { MapPin, Star, Languages, Calendar, Clock, Users, Heart, Share2, Phone, Mail, DollarSign } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Header from "@/components/Header";
import { useAuth } from "@/contexts/AuthContext";
import { Link, useNavigate, useParams, useSearchParams } from "react-router-dom";
import { getGuidePackages, getGuideProfile, getGuideReviews, Guide, Review, TourPackage } from "@/lib/firestore";
import GoogleMapsAngola from '@/components/GoogleMapsAngola';

const GuideProfile = () => {
  const [isFavorite, setIsFavorite] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();
  const guideId = searchParams.get('guideId');
  const { user } = useAuth();
  const [guide, setGuide ] = useState<Guide>(null)
   const [tours, setTours ] = useState<TourPackage[]>([])
   const [reviews, setReviews ] = useState<Review[]>([])
   const [loading, setLoading ] = useState(true)
  const navigate = useNavigate();

   const handleMessageGuide = (id:string, name: string, photoURL : string) => {
    navigate(`/mensagens?guideId=${id}&guideName=${encodeURIComponent(name)}&guidePhotoURL=${encodeURIComponent(photoURL || '')}`);
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const getGuide = await getGuideProfile(guideId);
         const getTour = await getGuidePackages(guideId);
           const getReview = await getGuideReviews(guideId);
        setGuide(getGuide);
        setTours(getTour);
        setReviews(getReview);

      
      } catch (error) {
        console.error("Erro ao buscar guias ou favoritos:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [guideId]);
  

  return (
    <div className="min-h-screen bg-background">
      <Header />
           {loading ? (
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
      <div className="pt-24 container mx-auto px-4 py-8">
        {/* Header Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          <div className="lg:col-span-2">
            <Card>
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row gap-6">
                  <Avatar className="w-32 h-32 mx-auto md:mx-0">
                    <AvatarImage src={guide?.photoURL} />
                    <AvatarFallback>{guide?.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                  </Avatar>
                  
                  <div className="flex-1 text-center md:text-left">
                    <div className="flex items-center justify-between mb-2">
                      <h1 className="text-3xl font-bold">{guide?.name}</h1>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                              disabled={!guide || guide.uid === user?.uid}
                          onClick={() => setIsFavorite(!isFavorite)}
                        >
                          <Heart
                           className={`w-4 h-4 ${isFavorite ? 'fill-red-500 text-red-500' : ''}`} />
                        </Button>
                        <Button disabled={!guide || guide.uid === user?.uid}  variant="outline" size="sm">
                          <Share2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2 mb-4 justify-center md:justify-start">
                      <MapPin className="w-4 h-4 text-muted-foreground" />
                      <span className="text-muted-foreground">{guide?.city}{guide?.location?.name ? ` — ${guide.location.name}` : ''}, Angola</span>
                    </div>
                    
                    <div className="flex items-center gap-4 mb-4 justify-center md:justify-start">
                      <div className="flex items-center gap-1">
                        <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                        <span className="font-semibold">{guide?.rating}</span>
                        <span className="text-muted-foreground">({guide?.reviewCount} avaliações)</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">{guide?.experience} anos de experiência</span>
                      </div>
                    </div>
                    
                    <p className="text-muted-foreground mb-4">{guide?.description}</p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <Languages className="w-4 h-4 text-muted-foreground" />
                          <span className="font-medium">Idiomas:</span>
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {guide?.languages.map((language) => (
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
                          {guide?.specialties.map((specialty) => (
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
                  <div className="text-3xl font-bold text-primary mb-2">{guide?.pricePerHour}</div>
                  <p className="text-sm text-muted-foreground">por dia de tour</p>
                </div>
                
                <div className="space-y-4 mb-6">
                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="w-4 h-4 text-muted-foreground" />
                    <span>Responde de Imediato</span>
                  </div>
                  
                  <div className="flex items-center gap-2 text-sm">
                    <Phone className="w-4 h-4 text-muted-foreground" />
                    <span>{guide?.phone}</span>
                  </div>
                  
                  <div className="flex items-center gap-2 text-sm">
                    <Mail className="w-4 h-4 text-muted-foreground" />
                    <span>{guide?.email}</span>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Button disabled={!guide || guide.uid === user?.uid} variant="hero" className="w-full">
                     <Link to={`/guias/${guide?.id}/pacotes`}>
                                                            Solicitar Reserva
                                                                </Link>
                   
                  </Button>
                  <Button disabled={!guide || guide.uid === user?.uid} variant="outline" className="w-full" onClick={()=>handleMessageGuide(guide?.uid,guide?.name,guide?.photoURL)}>
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
                <Card key={tour?.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                  <CardContent className="p-0">
                    <img 
                      src={tour?.images[0]} 
                      alt={tour?.title}
                      className="w-full h-48 object-cover"
                    />
                    <div className="p-6">
                      <h3 className="font-semibold mb-2">{tour?.title}</h3>
                      <p className="text-sm text-muted-foreground mb-4">{tour?.description}</p>
                      
                      <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                      <div className="space-y-2 mb-4">
                            <div className="flex items-center text-sm">
                              <Clock className="h-4 w-4 mr-2" />
                              {tour?.duration}
                            </div>
                            <div className="flex items-center text-sm">
                              <MapPin className="h-4 w-4 mr-2" />
                              {tour?.location}
                            </div>
                            <div className="flex items-center text-sm">
                              <Users className="h-4 w-4 mr-2" />
                              Até {tour?.maxGroupSize} pessoas
                            </div>
                            <div className="flex items-center text-sm">
                              <DollarSign className="h-4 w-4 mr-2" />
                              {tour?.price.toLocaleString('pt-AO', { style: 'currency', currency: 'AOA' })}
                            </div>
                          </div>
                                </div>


                        <span className="font-bold text-primary">{tour?.price}</span>
                      </div>
                      
                      
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
          
          <TabsContent value="reviews" className="mt-6">
            <div className="space-y-6">
              {reviews.map((review) => (
                <Card key={review?.id}>
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <Avatar>
                        <AvatarFallback>{review?.touristName.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h4 className="font-semibold">{review?.touristName}</h4>
                          <div className="flex items-center gap-1">
                            {[...Array(5)].map((_, i) => (
                              <Star 
                                key={i} 
                                className={`w-4 h-4 ${i < review?.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} 
                              />
                            ))}
                          </div>
                          <span className="text-sm text-muted-foreground">  
                             {review?.createdAt
                      ? typeof review.createdAt === 'object' && 'seconds' in review.createdAt
                        ? new Date(review.createdAt.seconds * 1000).toLocaleDateString('pt-AO')
                         : review.createdAt instanceof Date
                          ? review.createdAt.toLocaleDateString('pt-AO')
                          : 'Data inválida'
                      : 'Sem data'}
                          </span>
                          
                        </div>
                        <p className="text-muted-foreground">{review?.comment}</p>
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
      {guide?.location ? (
        <GoogleMapsAngola
          height="400px"
          showControls={false}
          showSearch={false}
          allowSelection={false}
          initialPosition={{ lat: guide.location.lat, lng: guide.location.lng }}
          initialMarkerLabel={guide.location.name}
        />
      ) : (
        <div className="bg-muted rounded-lg h-96 flex items-center justify-center">
          <div className="text-center">
            <MapPin className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">Mapa Interativo</h3>
            <p className="text-muted-foreground">
              Localização aproximada do guia em {guide?.city}
            </p>
          </div>
        </div>
      )}
    </CardContent>
  </Card>
</TabsContent>
        </Tabs>
      </div>
      </>
      )}
    </div>
  );
};

export default GuideProfile;
