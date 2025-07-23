import { Button } from "@/components/ui/button";
import { Compass, Users, Shield, Heart } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

const CTASection = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleStartAsTourist = () => {
    if (user) {
      navigate("/turista/dashboard");
    } else {
      navigate("/auth?userType=tourist");
    }
  };

  const handleBecomeGuide = () => {
    if (user) {
      navigate("/guide-profile-form");
    } else {
      navigate("/auth?userType=guide");
    }
  };

  return (
    <section className="py-20 bg-gradient-hero relative overflow-hidden">
      <div className="absolute inset-0 bg-black/20" />
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center text-white mb-16">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-6">
            Pronto para Sua Próxima Aventura?
          </h2>
          <p className="text-xl sm:text-2xl mb-12 text-white/90 max-w-3xl mx-auto">
            Junte-se a milhares de viajantes que já descobriram o mundo de forma autêntica com nossos guias locais
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
          <div className="text-center">
            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Shield className="h-8 w-8 text-white" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">Segurança Garantida</h3>
            <p className="text-white/80 text-sm">Guias verificados e avaliados pela comunidade</p>
          </div>
          
          <div className="text-center">
            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Heart className="h-8 w-8 text-white" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">Experiências Únicas</h3>
            <p className="text-white/80 text-sm">Descubra lugares e histórias que só os locais conhecem</p>
          </div>
          
          <div className="text-center">
            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Users className="h-8 w-8 text-white" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">Comunidade Global</h3>
            <p className="text-white/80 text-sm">Conecte-se com viajantes do mundo todo</p>
          </div>
          
          <div className="text-center">
            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Compass className="h-8 w-8 text-white" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">Fácil de Usar</h3>
            <p className="text-white/80 text-sm">Encontre e reserve seu guia em poucos cliques</p>
          </div>
        </div>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
          <Button 
            variant="secondary" 
            size="lg" 
            className="w-full sm:w-auto text-lg px-12 py-4 bg-white text-primary hover:bg-white/90"
            onClick={handleStartAsTourist}
          >
            <Compass className="mr-2 h-5 w-5" />
            Começar como Turista
          </Button>
          <Button 
            variant="outline" 
            size="lg" 
            className="w-full sm:w-auto text-lg px-12 py-4 border-white/30 text-white hover:bg-white hover:text-primary bg-white/10"
            onClick={handleBecomeGuide}
          >
            <Users className="mr-2 h-5 w-5" />
            Tornar-se Guia
          </Button>
        </div>

        <div className="text-center mt-8">
          <p className="text-white/70 text-sm">
            Cadastro gratuito • Sem taxas ocultas • Suporte 24/7
          </p>
        </div>
      </div>
    </section>
  );
};

export default CTASection;