import { Users, Target, Eye, MapPin } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const About = () => {
  const team = [
    {
      name: "Ana Silva",
      role: "Fundadora & CEO",
      image: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=400&h=400&fit=crop&crop=face",
      description: "15 anos de experiência em turismo sustentável"
    },
    {
      name: "Carlos Santos",
      role: "Diretor de Operações",
      image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop&crop=face",
      description: "Especialista em gestão de experiências turísticas"
    },
    {
      name: "Maria Costa",
      role: "Coordenadora de Guias",
      image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop&crop=face",
      description: "Conectando viajantes com guias locais autênticos"
    }
  ];

  return (
    <div className="min-h-screen pt-24">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-primary/10 to-secondary/10 py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-6">
            Sobre Nós
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Conectamos viajantes apaixonados com guias locais autênticos para criar experiências inesquecíveis
          </p>
        </div>
      </section>

      <div className="container mx-auto px-4 py-16">
        {/* Mission, Vision, Values */}
        <div className="grid md:grid-cols-3 gap-8 mb-20">
          <Card className="text-center">
            <CardContent className="p-8">
              <Target className="w-12 h-12 text-primary mx-auto mb-4" />
              <h3 className="text-2xl font-bold mb-4">Nossa Missão</h3>
              <p className="text-muted-foreground">
                Democratizar o turismo autêntico, conectando viajantes com guias locais para experiências genuínas e sustentáveis.
              </p>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardContent className="p-8">
              <Eye className="w-12 h-12 text-primary mx-auto mb-4" />
              <h3 className="text-2xl font-bold mb-4">Nossa Visão</h3>
              <p className="text-muted-foreground">
                Ser a principal plataforma global que une comunidades locais e viajantes através do turismo responsável.
              </p>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardContent className="p-8">
              <MapPin className="w-12 h-12 text-primary mx-auto mb-4" />
              <h3 className="text-2xl font-bold mb-4">Nossos Valores</h3>
              <p className="text-muted-foreground">
                Autenticidade, sustentabilidade, respeito cultural e conexões humanas genuínas em cada experiência.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Team Section */}
        <section className="mb-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Nossa Equipe</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Conheça as pessoas apaixonadas que trabalham para conectar culturas e criar memórias inesquecíveis
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {team.map((member, index) => (
              <Card key={index} className="text-center overflow-hidden">
                <CardContent className="p-0">
                  <img 
                    src={member.image} 
                    alt={member.name}
                    className="w-full h-64 object-cover"
                  />
                  <div className="p-6">
                    <h3 className="text-xl font-bold mb-2">{member.name}</h3>
                    <p className="text-primary font-medium mb-3">{member.role}</p>
                    <p className="text-muted-foreground">{member.description}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Stats Section */}
        <section className="bg-gradient-to-r from-primary/5 to-secondary/5 rounded-2xl p-8 md:p-12">
          <div className="text-center mb-8">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Nosso Impacto</h2>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-3xl md:text-4xl font-bold text-primary mb-2">50+</div>
              <p className="text-muted-foreground">Destinos</p>
            </div>
            <div>
              <div className="text-3xl md:text-4xl font-bold text-primary mb-2">200+</div>
              <p className="text-muted-foreground">Guias Parceiros</p>
            </div>
            <div>
              <div className="text-3xl md:text-4xl font-bold text-primary mb-2">1000+</div>
              <p className="text-muted-foreground">Experiências Realizadas</p>
            </div>
            <div>
              <div className="text-3xl md:text-4xl font-bold text-primary mb-2">4.9</div>
              <p className="text-muted-foreground">Avaliação Média</p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default About;