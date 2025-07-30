
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, MapPin, Mail, Phone, Building, FileText, Heart, Users, Award } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useNavigate } from "react-router-dom";

const SobreNos = () => {
  const navigate = useNavigate();

  const values = [
    {
      icon: Heart,
      title: "Cuidado Humanizado",
      description: "Priorizamos o bem-estar e a dignidade de cada pessoa que atendemos."
    },
    {
      icon: Users,
      title: "Equipe Qualificada",
      description: "Profissionais experientes e especializados em diversas áreas da saúde mental."
    },
    {
      icon: Award,
      title: "Excelência no Atendimento",
      description: "Compromisso com a qualidade e a eficácia em todos os nossos serviços."
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
          <h1 className="text-4xl font-bold gradient-text mb-4">Sobre Nós</h1>
          <p className="text-xl text-muted-foreground max-w-3xl">
            Conheça a Clínica Conexão Mental, seu parceiro de confiança no cuidado com a saúde mental e bem-estar emocional.
          </p>
        </div>

        {/* Informações da Clínica */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building className="h-5 w-5" />
                Informações da Clínica
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-semibold text-lg mb-2">Clínica Conexão Mental</h3>
                <div className="space-y-2 text-muted-foreground">
                  <div className="flex items-start gap-2">
                    <FileText className="h-4 w-4 mt-1 flex-shrink-0" />
                    <span>CNPJ: 54.423.733/0001-68</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <MapPin className="h-4 w-4 mt-1 flex-shrink-0" />
                    <div>
                      <p>Avenida Nossa Senhora da Penha, 2598</p>
                      <p>Santa Luzia, Vitória/ES - Brasil</p>
                      <p>CEP: 29045-402</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Formas de Contato</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <Mail className="h-5 w-5 text-blue-600" />
                  <div>
                    <p className="font-medium">Email</p>
                    <a 
                      href="mailto:contato@conexaomental.online" 
                      className="text-blue-600 hover:underline"
                    >
                      contato@conexaomental.online
                    </a>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Phone className="h-5 w-5 text-green-600" />
                  <div>
                    <p className="font-medium">Telefones</p>
                    <div className="space-y-1">
                      <a 
                        href="tel:+5527998703988" 
                        className="block text-green-600 hover:underline"
                      >
                        (27) 99870-3988
                      </a>
                      <a 
                        href="tel:+5527981415026" 
                        className="block text-green-600 hover:underline"
                      >
                        (27) 98141-5026
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Nossa Missão */}
        <Card className="mb-12">
          <CardHeader>
            <CardTitle className="text-2xl">Nossa Missão</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-lg text-muted-foreground leading-relaxed">
              A Clínica Conexão Mental tem como missão promover a saúde mental e o bem-estar emocional 
              de nossos pacientes através de atendimento psicológico de qualidade, humanizado e acessível. 
              Acreditamos que cuidar da mente é fundamental para uma vida plena e equilibrada.
            </p>
          </CardContent>
        </Card>

        {/* Nossos Valores */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-center gradient-text mb-8">
            Nossos Valores
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {values.map((value, index) => (
              <Card key={index} className="text-center">
                <CardHeader>
                  <div className="w-16 h-16 gradient-bg rounded-full flex items-center justify-center mx-auto mb-4">
                    <value.icon className="h-8 w-8 text-white" />
                  </div>
                  <CardTitle>{value.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base">
                    {value.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Nossos Serviços */}
        <Card className="mb-12">
          <CardHeader>
            <CardTitle className="text-2xl">Nossos Serviços</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold text-lg mb-3">Especialidades Oferecidas:</h3>
                <ul className="space-y-2 text-muted-foreground">
                  <li>• Psicologia Clínica</li>
                  <li>• Psicanálise</li>
                  <li>• Terapia Familiar</li>
                  <li>• Psicologia Infantil</li>
                  <li>• Neuropsicologia</li>
                  <li>• Terapia de Casal</li>
                  <li>• Psicologia Organizacional</li>
                  <li>• Psicoterapia</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-3">Modalidades de Atendimento:</h3>
                <ul className="space-y-2 text-muted-foreground">
                  <li>• Atendimento presencial</li>
                  <li>• Consultas online</li>
                  <li>• Sessões individuais</li>
                  <li>• Terapia em grupo</li>
                  <li>• Atendimento familiar</li>
                  <li>• Orientação de pais</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Footer />
    </div>
  );
};

export default SobreNos;
