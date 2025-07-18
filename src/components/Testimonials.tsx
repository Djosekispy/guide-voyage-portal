import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Star } from "lucide-react";

const Testimonials = () => {
  const testimonials = [
    {
      id: 1,
      name: "Ana Carolina",
      location: "São Paulo, Brasil",
      avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b47c?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80",
      rating: 5,
      text: "Minha viagem para o Peru foi transformada graças ao Carlos! Ele nos levou para lugares que jamais encontraríamos sozinhos. Uma experiência inesquecível!",
      destination: "Machu Picchu, Peru"
    },
    {
      id: 2,
      name: "Ricardo Santos",
      location: "Lisboa, Portugal",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80",
      rating: 5,
      text: "O guia local em Tóquio falava português perfeitamente e conhecia todos os segredos da cidade. Recomendo demais essa plataforma!",
      destination: "Tóquio, Japão"
    },
    {
      id: 3,
      name: "Camila Oliveira",
      location: "Rio de Janeiro, Brasil",
      avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80",
      rating: 5,
      text: "Viajei sozinha para Paris e me senti super segura com a Maria como guia. Ela me mostrou a cidade sob uma perspectiva completamente diferente!",
      destination: "Paris, França"
    },
    {
      id: 4,
      name: "João Felipe",
      location: "Belo Horizonte, Brasil",
      avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80",
      rating: 5,
      text: "Como fotógrafo, precisava de alguém que conhecesse os melhores ângulos e horários. O guia em Santorini superou todas as minhas expectativas!",
      destination: "Santorini, Grécia"
    }
  ];

  return (
    <section className="py-20 bg-gradient-to-br from-primary/5 to-secondary/5">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
            O que Nossos Viajantes Dizem
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Milhares de experiências incríveis já foram vividas através da nossa plataforma
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {testimonials.map((testimonial) => (
            <Card key={testimonial.id} className="group hover:shadow-nature transition-all duration-300 hover:-translate-y-1">
              <CardContent className="p-8">
                {/* Stars */}
                <div className="flex items-center mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 text-yellow-500 fill-yellow-500" />
                  ))}
                </div>

                {/* Testimonial Text */}
                <blockquote className="text-foreground mb-6 text-lg leading-relaxed">
                  "{testimonial.text}"
                </blockquote>

                {/* Author Info */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={testimonial.avatar} alt={testimonial.name} />
                      <AvatarFallback>{testimonial.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-semibold text-foreground">{testimonial.name}</div>
                      <div className="text-sm text-muted-foreground">{testimonial.location}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-primary font-medium">{testimonial.destination}</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;