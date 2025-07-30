import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Video, Clock, Shield, Heart, Star, Home, Users } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface PricingPlan {
  id: string;
  name: string;
  price: string;
  duration: string;
  description: string;
  benefits: string[];
  popular?: boolean;
}

interface PricingSectionProps {
  onAgendarConsultaClick?: () => void;
}

const PricingSection = ({ onAgendarConsultaClick }: PricingSectionProps) => {
  const navigate = useNavigate();
  
  const plans: PricingPlan[] = [
    {
      id: "acolhimento",
      name: "Sessão de Acolhimento",
      price: "R$ 37,90",
      duration: "25 minutos",
      description: "Valor Social",
      benefits: [
        "Psicoterapeutas credenciados",
        "Avaliação inicial completa",
        "Definição de objetivos",
        "Plano de tratamento personalizado",
        "Vídeo conferência segura"
      ]
    },
    {
      id: "psicoterapia",
      name: "Sessão de Psicoterapia",
      price: "R$ 57,90",
      duration: "45 minutos",
      description: "Sessão completa de psicoterapia individual",
      benefits: [
        "Psicoterapeutas credenciados e certificados",
        "Agendamento flexível",
        "Suporte emocional",
        "Vídeo conferência",
        "Pagamento no PIX ou Cartão",
        "Eficácia comprovada"
      ]
    },
    {
      id: "casal",
      name: "Terapia de Casal",
      price: "R$ 97,90",
      duration: "60 minutos",
      description: "Sessão especializada para casais e relacionamentos",
      benefits: [
        "Terapeutas especializados em casais",
        "Tempo estendido para ambos",
        "Técnicas específicas para relacionamentos",
        "Mediação de conflitos",
        "Fortalecimento do vínculo",
        "Comunicação assertiva"
      ]
    },
    {
      id: "hipnoterapia",
      name: "Sessão de Hipnoterapia",
      price: "R$ 197,90",
      duration: "60 minutos",
      description: "Sessão especializada com técnicas de hipnoterapia",
      benefits: [
        "Hipnoterapeutas certificados",
        "Técnicas avançadas de hipnose",
        "Tratamento de fobias e traumas",
        "Mudança de padrões comportamentais",
        "Relaxamento profundo",
        "Resultados acelerados"
      ]
    }
  ];

  const features = [
    {
      icon: Video,
      title: "Videochamada Segura",
      description: "Chamadas criptografadas de ponta a ponta"
    },
    {
      icon: Clock,
      title: "Horários Flexíveis",
      description: "Agende conforme sua disponibilidade"
    },
    {
      icon: Shield,
      title: "Confidencialidade Total",
      description: "Sigilo profissional garantido"
    },
    {
      icon: Heart,
      title: "Terapeuta Virtual",
      description: "Apoio emocional virtual 24 horas"
    },
    {
      icon: Home,
      title: "Conforto e conveniência",
      description: "Atendimento no conforto da sua casa"
    },
    {
      icon: Users,
      title: "Acessibilidade",
      description: "Plataforma acessível para todos"
    }
  ];

  return (
    <section id="pricing-section" className="py-16 purple-bg min-h-[60vh] flex items-center">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <Badge className="mb-4 bg-white/20 text-white border-white/30 hover:bg-white/30">
            Nossos Planos
          </Badge>
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Terapia Online
          </h2>
          <p className="text-lg text-white/90 max-w-2xl mx-auto">
            Transforme sua saúde mental com sessões de terapia online profissional.<br />
            No conforto da sua casa.
          </p>
        </div>

        <div className="max-w-7xl mx-auto">
          {/* Pricing Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8 md:mb-12">
            {plans.map((plan) => (
              <Card key={plan.id} className="bg-white/90 backdrop-blur-md border-purple-300 text-purple-900 relative overflow-hidden shadow-xl flex flex-col h-full">
                <div className="absolute inset-0 bg-gradient-to-br from-purple-50/80 to-white/80"></div>
                <CardHeader className="relative z-10 text-center pb-4">
                  <div className="flex justify-center mb-3">
                    <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                      <Heart className="w-6 h-6 text-purple-600" />
                    </div>
                  </div>
                  <CardTitle className="text-base md:text-lg font-bold mb-2 text-purple-600">
                    {plan.name}
                  </CardTitle>
                  <CardDescription className="text-purple-700 text-xs md:text-sm">
                    {plan.description}
                  </CardDescription>
                </CardHeader>
                
                <CardContent className="relative z-10 text-center flex flex-col h-full">
                  <div className="mb-4">
                    <div className="text-center mb-3">
                      <span className="text-xl md:text-2xl font-bold text-purple-600">{plan.price}</span>
                      <p className="text-purple-700 text-xs md:text-sm mt-1">{plan.duration}</p>
                    </div>
                  </div>

                  <div className="space-y-2 mb-6 flex-grow">
                    {plan.benefits.map((benefit, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <CheckCircle className="w-3 h-3 text-green-500 flex-shrink-0" />
                        <span className="text-purple-800 text-left text-xs">{benefit}</span>
                      </div>
                    ))}
                  </div>
                  
                  <div className="flex justify-center mt-auto">
                    <Button 
                      className="bg-purple-600 text-white hover:bg-purple-700 font-medium text-sm px-6 py-2 w-full"
                      onClick={() => navigate(`/agendar-consulta?plan=${plan.id}`)}
                    >
                      Agendar Sessão
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Features Grid */}
          <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-lg">
            <div className="text-center mb-8">
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                Por que escolher nossa plataforma?
              </h3>
              <div className="flex items-center justify-center gap-1 mb-2">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 text-yellow-400 fill-current" />
                ))}
              </div>
              <p className="text-gray-600 text-sm">4.8/5 - Mais de 1.000 pacientes atendidos</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {features.map((feature, index) => (
                <div key={index} className="flex items-start gap-3 p-4 bg-white border-2 border-purple-200 rounded-lg hover:bg-purple-600 hover:border-purple-600 transition-all duration-300 cursor-pointer group">
                  <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:bg-white/20 transition-all duration-300">
                    <feature.icon className="w-5 h-5 text-purple-600 group-hover:text-white transition-colors duration-300" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1 text-sm group-hover:text-white transition-colors duration-300">{feature.title}</h4>
                    <p className="text-gray-600 text-xs group-hover:text-white/90 transition-colors duration-300">{feature.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="text-center mt-12">
          <p className="text-white/80 mb-4">
            Sem mensalidade • Sem fidelidade • Garantia de 7 dias
          </p>
          <p className="text-white/80 mb-4">
            Dúvidas sobre como funciona?
          </p>
          <Button 
            variant="outline" 
            className="border-white/30 bg-white text-purple-600 hover:bg-purple-600 hover:text-white transition-colors"
            onClick={() => navigate('/como-funciona')}
          >
            Fale Conosco
          </Button>
        </div>
      </div>
    </section>
  );
};

export default PricingSection;