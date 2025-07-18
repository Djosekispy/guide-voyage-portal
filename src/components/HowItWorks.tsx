import { Card, CardContent } from "@/components/ui/card";
import { Search, MessageCircle, MapPin, Star } from "lucide-react";

const HowItWorks = () => {
  const steps = [
    {
      icon: Search,
      title: "Encontre seu Guia",
      description: "Busque por destino, idioma ou especialidade para encontrar o guia perfeito para sua viagem"
    },
    {
      icon: MessageCircle,
      title: "Conecte-se",
      description: "Entre em contato com o guia, discuta seu roteiro e faça sua reserva de forma segura"
    },
    {
      icon: MapPin,
      title: "Explore o Destino",
      description: "Viva experiências autênticas com um local que conhece os melhores lugares e histórias"
    },
    {
      icon: Star,
      title: "Avalie a Experiência",
      description: "Compartilhe sua experiência e ajude outros viajantes a escolherem o melhor guia"
    }
  ];

  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
            Como Funciona
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Em apenas 4 passos simples, você estará explorando o mundo com guias locais experientes
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, index) => (
            <Card key={index} className="text-center group hover:shadow-soft transition-all duration-300 hover:-translate-y-1">
              <CardContent className="p-8">
                <div className="relative mb-6">
                  <div className="w-16 h-16 bg-gradient-ocean rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                    <step.icon className="h-8 w-8 text-white" />
                  </div>
                  <div className="absolute -top-2 -right-2 w-8 h-8 bg-accent text-white rounded-full flex items-center justify-center text-sm font-bold">
                    {index + 1}
                  </div>
                </div>
                <h3 className="text-xl font-bold text-foreground mb-3">
                  {step.title}
                </h3>
                <p className="text-muted-foreground">
                  {step.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;