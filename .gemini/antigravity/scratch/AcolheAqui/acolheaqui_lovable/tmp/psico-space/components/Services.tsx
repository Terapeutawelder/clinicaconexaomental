import { Brain, Heart, Users, Sparkles } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const services = [
  {
    icon: Brain,
    title: "Terapia Individual",
    description: "Sessões personalizadas para trabalhar questões emocionais, comportamentais e de desenvolvimento pessoal.",
  },
  {
    icon: Users,
    title: "Terapia de Casal",
    description: "Apoio para casais que desejam melhorar a comunicação e fortalecer o relacionamento.",
  },
  {
    icon: Heart,
    title: "Ansiedade e Depressão",
    description: "Tratamento especializado para transtornos de ansiedade e depressão com abordagem humanizada.",
  },
  {
    icon: Sparkles,
    title: "Autoconhecimento",
    description: "Processo terapêutico focado em desenvolver maior consciência de si mesmo e seu potencial.",
  },
];

const Services = () => {
  return (
    <section id="servicos" className="py-16 bg-secondary">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="inline-block px-4 py-1.5 bg-teal-light border border-teal/20 text-teal-dark font-semibold text-sm rounded-full mb-4">
            Nossos Serviços
          </span>
          <h2 className="font-serif text-3xl md:text-4xl lg:text-5xl mb-4 text-charcoal">
            Como Posso <span className="text-teal">Ajudar</span>
          </h2>
          <p className="text-slate text-lg font-medium">
            Ofereco diferentes modalidades de atendimento para atender às suas necessidades específicas
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {services.map((service, index) => (
            <Card 
              key={service.title} 
              className="group bg-card border border-border shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-3 opacity-0 animate-fade-in-up overflow-hidden"
              style={{ animationDelay: `${index * 0.15}s` }}
            >
              <CardContent className="p-8 text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-teal-light mb-6 group-hover:scale-110 group-hover:bg-teal transition-all duration-500">
                  <service.icon className="w-8 h-8 text-teal group-hover:text-white transition-colors duration-500" />
                </div>
                <h3 className="font-serif text-xl mb-3 text-charcoal group-hover:text-teal transition-colors duration-300">{service.title}</h3>
                <p className="text-slate text-sm leading-relaxed font-medium">{service.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Services;
