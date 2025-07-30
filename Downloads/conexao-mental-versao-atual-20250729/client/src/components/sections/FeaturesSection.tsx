
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, Clock, User, MapPin, Star, Heart } from "lucide-react";

interface Feature {
  id: number;
  icon: React.ComponentType<any>;
  title: string;
  description: string;
}

const FeaturesSection = () => {
  const features: Feature[] = [
    {
      id: 1,
      icon: Calendar,
      title: "Agendamento Facilitado",
      description: "Encontre horários compatíveis com sua rotina e agende consultas online de forma rápida e segura."
    },
    {
      id: 2,
      icon: Clock,
      title: "Atendimento Imediato",
      description: "Conecte-se com profissionais de saúde mental em tempo real, sem precisar sair de casa."
    },
    {
      id: 3,
      icon: User,
      title: "Profissionais Qualificados",
      description: "Nossa equipe é composta por especialistas experientes e dedicados a oferecer o melhor cuidado para você."
    },
    {
      id: 4,
      icon: MapPin,
      title: "Acesso de Qualquer Lugar",
      description: "Realize suas consultas de onde estiver, garantindo a continuidade do seu tratamento."
    },
    {
      id: 5,
      icon: Star,
      title: "Avaliações e Depoimentos",
      description: "Leia o que outros pacientes dizem sobre nossos profissionais e escolha com confiança."
    },
    {
      id: 6,
      icon: Heart,
      title: "Privacidade e Segurança",
      description: "Seus dados estão protegidos e suas consultas são confidenciais."
    },
  ];

  return (
    <section className="container mx-auto px-4 py-4">
      <div className="text-center mb-12">
        <h2 className="text-3xl md:text-4xl font-bold mb-4">Por que escolher a Clínica Conexão Mental?</h2>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Oferecemos uma experiência única em cuidados de saúde mental, combinando tecnologia e humanização.
        </p>
      </div>
      
      <div className="grid md:grid-cols-3 gap-8">
        {features.map((feature) => (
          <Card key={feature.id} className="hover:shadow-xl transition-shadow duration-300">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <feature.icon className="h-6 w-6 text-primary" />
                {feature.title}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                {feature.description}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
};

export default FeaturesSection;
