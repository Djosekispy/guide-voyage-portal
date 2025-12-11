import { Button } from "@/components/ui/button";
import { Search, MapPin, Users } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import heroImage from "@/assets/hero-tourism.jpg";

const HeroSection = () => {
  const navigate = useNavigate();
  const { user, userData } = useAuth();

  const handleFindGuide = () => {
    navigate(`/guias?city=${encodeURIComponent(userData.city)}`);

  };

  const handleBecomeGuide = () => {
    if (user) {
      // Se já está logado, vai para formulário de guia
      navigate("/guide-profile-form");
    } else {
      // Se não está logado, vai para página de auth como guia
      navigate("/auth?userType=guide");
    }
  };

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0">
        <img
          src={heroImage}
          alt="Paisagem deslumbrante com turistas e guia"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/40 via-black/20 to-black/30" />
      </div>

      {/* Content */}
      <div className="relative z-10 text-center text-white px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
          Descubra Angola com
          <span className="block bg-gradient-ocean bg-clip-text text-transparent">
            Guias Locais Autênticos
          </span>
        </h1>
        
        <p className="text-xl sm:text-2xl mb-8 text-white/90 max-w-2xl mx-auto">
          Conecte-se com guias angolanos especializados e explore as maravilhas naturais e culturais do nosso país.
        </p>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
          {(userData?.userType !== 'guide' && userData?.userType !== 'admin') && (
            <Button 
              variant="hero" 
              size="lg" 
              className="w-full sm:w-auto text-lg px-8 py-4"
              onClick={handleFindGuide}
            >
              <Search className="mr-2 h-5 w-5" />
              Encontrar Guia
            </Button>
          )}
          {(userData?.userType !== 'guide' && userData?.userType !== 'admin') && (
            <Button 
              variant="outline" 
              size="lg" 
              className="w-full sm:w-auto text-lg px-8 py-4 bg-white/10 border-white/30 text-white hover:bg-white hover:text-foreground"
              onClick={handleBecomeGuide}
            >
              <Users className="mr-2 h-5 w-5" />
              Tornar-se Guia
            </Button>
          )}
          {userData?.userType === 'guide' && (
            <Button 
              variant="hero" 
              size="lg" 
              className="w-full sm:w-auto text-lg px-8 py-4"
              onClick={() => navigate('/guia/dashboard')}
            >
              <Users className="mr-2 h-5 w-5" />
              Minha Dashboard
            </Button>
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 mt-16">
          <div className="text-center">
            <div className="text-3xl font-bold text-primary">150+</div>
            <div className="text-white/80">Guias Locais</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-primary">18</div>
            <div className="text-white/80">Províncias</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-primary">500+</div>
            <div className="text-white/80">Experiências Únicas</div>
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
        <div className="w-6 h-10 border-2 border-white/50 rounded-full flex justify-center">
          <div className="w-1 h-3 bg-white rounded-full mt-2"></div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;