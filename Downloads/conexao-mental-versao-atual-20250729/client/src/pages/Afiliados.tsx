
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Users, DollarSign, Share2, Award, Copy, CheckCircle } from "lucide-react";
import Header from "@/components/Header";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";

const Afiliados = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);
  
  const referralLink = `${window.location.origin}/cadastro-profissional?ref=SEU_CODIGO`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    toast({
      title: "Link copiado!",
      description: "O link de indicação foi copiado para a área de transferência.",
    });
    
    setTimeout(() => setCopied(false), 2000);
  };

  const benefits = [
    {
      icon: DollarSign,
      title: "40% de Comissão",
      description: "Ganhe 40% de comissão recorrente sobre todos os profissionais que você indicar."
    },
    {
      icon: Users,
      title: "Rede de Indicações",
      description: "Construa uma rede sólida de profissionais de saúde mental e amplie seus ganhos."
    },
    {
      icon: Award,
      title: "Reconhecimento",
      description: "Seja reconhecido como um parceiro oficial da Clínica Conexão Mental."
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <Button 
            variant="ghost" 
            onClick={() => navigate('/agenda-profissional')}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
          <h1 className="text-4xl font-bold gradient-text mb-4">Programa de Afiliados</h1>
          <p className="text-xl text-muted-foreground max-w-3xl">
            Convide outros profissionais e ganhe 40% de comissão sobre cada indicação bem-sucedida.
          </p>
        </div>

        {/* Hero Section */}
        <Card className="mb-8 bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20">
          <CardHeader className="text-center">
            <CardTitle className="text-3xl gradient-text">
              Ganhe 40% de Comissão por Indicação
            </CardTitle>
            <CardDescription className="text-lg">
              Indique profissionais de saúde mental para nossa plataforma e seja recompensado
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <Badge variant="secondary" className="text-lg px-6 py-2 mb-6">
              Comissão Recorrente de 40%
            </Badge>
            <div className="max-w-2xl mx-auto">
              <p className="text-muted-foreground mb-6">
                Para cada profissional que se cadastrar através do seu link de indicação e começar a 
                atender pacientes, você receberá 40% de comissão sobre os ganhos mensais dele na plataforma.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Benefícios */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-center gradient-text mb-8">
            Benefícios do Programa
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {benefits.map((benefit, index) => (
              <Card key={index} className="text-center hover:shadow-lg transition-shadow">
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

        {/* Seu Link de Indicação */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Share2 className="h-5 w-5" />
              Seu Link de Indicação
            </CardTitle>
            <CardDescription>
              Compartilhe este link com profissionais que você gostaria de indicar
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
              <code className="flex-1 text-sm">{referralLink}</code>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleCopyLink}
                className="flex items-center gap-2"
              >
                {copied ? (
                  <>
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    Copiado!
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4" />
                    Copiar
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Como Funciona */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Como Funciona o Programa</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center text-sm font-bold">
                  1
                </div>
                <div>
                  <h3 className="font-semibold">Compartilhe seu link</h3>
                  <p className="text-muted-foreground">
                    Envie seu link de indicação para profissionais de saúde mental
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center text-sm font-bold">
                  2
                </div>
                <div>
                  <h3 className="font-semibold">Profissional se cadastra</h3>
                  <p className="text-muted-foreground">
                    O profissional se cadastra na plataforma através do seu link
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center text-sm font-bold">
                  3
                </div>
                <div>
                  <h3 className="font-semibold">Comece a ganhar</h3>
                  <p className="text-muted-foreground">
                    Receba 40% de comissão sobre os ganhos mensais do profissional
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* CTA */}
        <div className="text-center">
          <Card className="max-w-2xl mx-auto">
            <CardHeader>
              <CardTitle className="text-2xl">Comece a Indicar Hoje</CardTitle>
              <CardDescription className="text-lg">
                Compartilhe seu link e comece a construir sua rede de profissionais
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button size="lg" onClick={handleCopyLink} className="w-full">
                <Share2 className="mr-2 h-5 w-5" />
                Copiar Link de Indicação
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Afiliados;
