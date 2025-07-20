import Header from "@/components/Header";
import HeroSection from "@/components/HeroSection";
import HowItWorks from "@/components/HowItWorks";
import FeaturedDestinations from "@/components/FeaturedDestinations";
import Testimonials from "@/components/Testimonials";
import CTASection from "@/components/CTASection";
import Footer from "@/components/Footer";
import AngolaMap from "@/components/AngolaMap";

const Index = () => {
  return (
    <div className="min-h-screen">
      <Header />
      <HeroSection />
      <HowItWorks />
      <FeaturedDestinations />
      
      {/* Mapa Interativo de Angola */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Explore Angola
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
              Descubra nossos destinos pelo mapa interativo e encontre guias locais em cada região
            </p>
          </div>
          <div className="max-w-4xl mx-auto">
            <AngolaMap />
          </div>
        </div>
      </section>
      
      <Testimonials />
      <CTASection />
      <Footer />
    </div>
  );
};

export default Index;
