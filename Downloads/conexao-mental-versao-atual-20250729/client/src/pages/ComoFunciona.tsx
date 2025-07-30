
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Calendar, Search, MessageCircle, CheckCircle, Clock, Users, CreditCard } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useNavigate } from "react-router-dom";

const ComoFunciona = () => {
  const navigate = useNavigate();

  const steps = [
    {
      icon: Search,
      title: "1. Encontre seu Profissional",
      description: "Navegue pelos perfis dos profissionais disponíveis, veja suas especialidades, experiência e avaliações de outros pacientes.",
      image: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2000&q=80"
    },
    {
      icon: Calendar,
      title: "2. Escolha Data e Horário",
      description: "Selecione o dia e horário que melhor se adequa à sua agenda entre as opções disponíveis do profissional.",
      image: "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2000&q=80"
    },
    {
      icon: MessageCircle,
      title: "3. Preencha suas Informações",
      description: "Complete seus dados pessoais e descreva brevemente o motivo da consulta para ajudar o profissional a se preparar.",
      image: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2000&q=80"
    },
    {
      icon: CheckCircle,
      title: "4. Confirmação do Agendamento",
      description: "Receba a confirmação do seu agendamento por email e WhatsApp com todos os detalhes da consulta e instruções de acesso.",
      image: "https://images.unsplash.com/photo-1531297484001-80022131f5a1?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2000&q=80"
    },
    {
      icon: CreditCard,
      title: "5. Efetuar Pagamento",
      description: "Realize o pagamento de forma segura através do nosso sistema integrado com o Mercado Pago, garantindo praticidade e segurança.",
      image: "https://images.unsplash.com/photo-1563013544-824ae1b704d3?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2000&q=80"
    }
  ];

  const benefits = [
    {
      icon: Clock,
      title: "Flexibilidade de Horários",
      description: "Agende conforme sua disponibilidade, com opções de manhã, tarde e noite."
    },
    {
      icon: Users,
      title: "Profissionais Qualificados",
      description: "Todos os profissionais são devidamente registrados e verificados."
    },
    {
      icon: CreditCard,
      title: "Pagamento Seguro",
      description: "Sistema de pagamento integrado e seguro com o Mercado Pago."
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <Button 
            variant="ghost" 
            onClick={() => navigate('/')}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
          <h1 className="text-4xl font-bold gradient-text mb-4">Como Funciona</h1>
          <p className="text-xl text-muted-foreground max-w-2xl">
            Agendar sua consulta psicológica nunca foi tão simples. Siga estes passos e comece sua jornada de bem-estar mental.
          </p>
        </div>

        {/* Passos do Processo */}
        <div className="space-y-12 mb-16">
          {steps.map((step, index) => (
            <div key={index} className={`flex flex-col lg:flex-row items-center gap-8 ${index % 2 === 1 ? 'lg:flex-row-reverse' : ''}`}>
              <div className="flex-1 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 gradient-bg rounded-full flex items-center justify-center">
                    <step.icon className="h-6 w-6 text-white" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900">{step.title}</h2>
                </div>
                <p className="text-lg text-muted-foreground leading-relaxed">
                  {step.description}
                </p>
              </div>
              <div className="flex-1">
                <div className="relative overflow-hidden rounded-xl shadow-lg">
                  <img 
                    src={step.image} 
                    alt={step.title}
                    className="w-full h-64 lg:h-80 object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Benefícios */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-center gradient-text mb-8">
            Por que escolher a Clínica Conexão Mental?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {benefits.map((benefit, index) => (
              <Card key={index} className="text-center">
                <CardHeader>
                  <div className="w-16 h-16 gradient-bg rounded-full flex items-center justify-center mx-auto mb-4">
                    <benefit.icon className="h-8 w-8 text-white" />
                  </div>
                  <CardTitle>{benefit.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base">
                    {benefit.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Call to Action */}
        <div className="text-center">
          <Card className="max-w-2xl mx-auto">
            <CardHeader>
              <CardTitle className="text-2xl">Pronto para começar?</CardTitle>
              <CardDescription className="text-lg">
                Encontre o profissional ideal para você e agende sua primeira consulta.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                size="lg" 
                onClick={() => navigate('/')}
                className="w-full sm:w-auto"
              >
                <Calendar className="mr-2 h-5 w-5" />
                Agendar Consulta
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default ComoFunciona;
