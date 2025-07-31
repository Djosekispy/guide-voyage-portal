import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { MapPin, Star, Globe, Users } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getAllGuides, getUserFavorites, Guide, updateGuideProfile } from "@/lib/firestore";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";

const AvailableGuides = () => {
  const [guides, setGuides] = useState<Guide[]>([]);
  const [loading, setLoading] = useState(true);
  const [favorites, setFavorites] = useState<string[]>([]);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const allGuides = await getAllGuides();
        setGuides(allGuides);

        if (user?.uid) {
          const favorites = await getUserFavorites(user.uid);
          const favoriteGuideIds = favorites.map(fav => fav.guideId);
          setFavorites(favoriteGuideIds);
          setGuides(prev =>
            prev.map(guide => ({
              ...guide,
              isFavorite: favoriteGuideIds.includes(guide.id)
            }))
          );
        }
      } catch (error) {
        console.error("Erro ao buscar guias ou favoritos:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user?.uid]);

  const handleViewProfile = (id: string) => {
    navigate(`/guias/${id}`);
  };

  const handleRateGuide = (id: string, stars: number) => {
    updateGuideProfile(id, { rating:( (guides.find(guide => guide.id === id)?.rating || 0) + stars) / ((guides.find(guide => guide.id === id)?.reviewCount || 0) + 1) , reviewCount: (guides.find(guide => guide.id === id)?.reviewCount || 0) + 1 })
      .then(() => {
        setGuides(prev =>
          prev.map(guide =>
            guide.id === id ? { ...guide, rating: stars } : guide
          )
        );
      })
      .catch(error => {
        console.error("Erro ao atualizar avaliação do guia:", error);
      }
    );
  };

  if (loading) {
    return (
      <div className="py-20 text-center text-muted-foreground">
        Carregando guias...
      </div>
    );
  }

  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
            Guias Disponíveis
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Conheça nossos guias turísticos experientes e prontos para tornar sua viagem inesquecível.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {guides.map((guide) => (
            <Card key={guide.id} className="hover:shadow-lg transition duration-300 rounded-2xl overflow-hidden">
              <CardContent className="p-6">
                <div className="flex items-center gap-4 mb-4">
                  <Avatar className="h-16 w-16 ring-2 ring-primary">
                    <AvatarImage src={guide.photoURL} alt={guide.name} />
                    <AvatarFallback className="bg-primary text-white">
                      {guide.name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>

                  <div>
                    <h3 className="text-lg font-semibold text-foreground">{guide.name}</h3>
                    <div className="flex items-center text-sm text-muted-foreground mt-1">
                      <MapPin className="h-4 w-4 mr-1" />
                      {guide.city}
                    </div>
                    <div className="flex items-center text-sm mt-1">
                      <Star className="h-4 w-4 text-yellow-500 fill-yellow-500 mr-1" />
                      {guide.rating.toFixed(1)} ({guide.reviewCount} avaliações)
                    </div>
                  </div>
                </div>

                <p className="text-muted-foreground text-sm mb-4 line-clamp-3">
                  {guide.description || "Guia local experiente e apaixonado por mostrar o melhor da sua região."}
                </p>

                <div className="flex items-center text-sm text-muted-foreground mb-2">
                  <Users className="h-4 w-4 mr-1" />
                  {guide.experience} anos de experiência
                </div>
                <div className="flex items-center text-sm text-muted-foreground mb-4">
                  <Globe className="h-4 w-4 mr-1" />
                  {guide.languages.join(", ")}
                </div>

                {/* Botão de avaliação com estrelas */}
         <div className="flex gap-1 mb-4">
                {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                    key={star}
                    className={cn(
                        "w-5 h-5 cursor-pointer transition",
                        guide.rating >= star
                        ? "fill-yellow-400 text-yellow-400"
                        : "text-gray-300"
                    )}
                    onClick={() => handleRateGuide(guide.id, star)}
                    />
                ))}
                </div>


                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => handleViewProfile(guide.id)}
                >
                  Ver Perfil
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default AvailableGuides;
