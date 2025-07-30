import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { CheckCircle, Calendar, Clock, User, Copy, MessageCircle, Video, ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { saveAppointment } from "@/utils/appointmentStorage";

const ConfirmacaoAgendamento = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  
  const patientName = searchParams.get('name') || '';
  const phone = searchParams.get('phone') || '';
  const email = searchParams.get('email') || '';
  const professionalId = searchParams.get('professional') || '1';
  const date = searchParams.get('date') || '';
  const time = searchParams.get('time') || '';
  
  // Gerar link de acesso único
  const [accessLink] = useState(() => 
    `${window.location.origin}/video-consulta?sala=${professionalId}-${Date.now()}`
  );

  // Salvar agendamento quando a página carregar
  useEffect(() => {
    if (patientName && phone && email && date && time) {
      saveAppointment({
        patientName,
        patientPhone: phone,
        patientEmail: email,
        professionalId,
        date,
        time,
        status: "agendado",
        type: "consulta",
        accessLink
      });
    }
  }, [patientName, phone, email, professionalId, date, time, accessLink]);

  // Dados do profissional
  const professional = {
    id: professionalId,
    name: "Dra. Ana Paula Silva",
    specialty: "Psicóloga Cognitivo-Comportamental",
    rating: 4.8,
    image: "/images/professional1.jpg",
    initials: "DAPS"
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(accessLink);
    toast({
      title: "Link copiado!",
      description: "O link de acesso foi copiado para a área de transferência.",
    });
  };

  const handleGoHome = () => {
    navigate('/');
  };

  const handleGoToVideoConsultation = () => {
    navigate('/video-consulta');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-white">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center gap-4 mb-8">
          <Button 
            variant="ghost" 
            onClick={handleGoHome}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-800"
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar ao Início
          </Button>
        </div>

        <div className="max-w-2xl mx-auto space-y-6">
          {/* Confirmação de Sucesso */}
          <Card className="border-green-200 bg-green-50">
            <CardHeader className="text-center">
              <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="h-8 w-8 text-white" />
              </div>
              <CardTitle className="text-2xl text-green-800">
                Agendamento Confirmado!
              </CardTitle>
              <p className="text-green-700">
                Sua consulta foi agendada com sucesso e o pagamento foi processado.
              </p>
            </CardHeader>
          </Card>

          {/* Detalhes do Agendamento */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-purple-600" />
                Detalhes da Consulta
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4 mb-6">
                <Avatar className="w-16 h-16">
                  <AvatarImage src={professional.image} alt={professional.name} />
                  <AvatarFallback className="text-lg bg-purple-600 text-white">
                    {professional.initials}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-gray-900">{professional.name}</h3>
                  <p className="text-purple-600 font-medium">{professional.specialty}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-gray-600" />
                  <div>
                    <p className="text-sm text-gray-600">Paciente</p>
                    <p className="font-medium">{patientName}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-gray-600" />
                  <div>
                    <p className="text-sm text-gray-600">Data</p>
                    <p className="font-medium">{date}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-gray-600" />
                  <div>
                    <p className="text-sm text-gray-600">Horário</p>
                    <p className="font-medium">{time}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Link de Acesso */}
          <Card className="border-blue-200 bg-blue-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-blue-800">
                <Video className="h-5 w-5" />
                Link de Acesso à Teleconsulta
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 bg-white border border-blue-200 rounded-lg">
                  <p className="text-sm text-blue-700 mb-2">Seu link de acesso único:</p>
                  <div className="flex items-center gap-2">
                    <code className="flex-1 p-2 bg-gray-100 rounded text-sm font-mono break-all">
                      {accessLink}
                    </code>
                    <Button size="sm" variant="outline" onClick={copyToClipboard}>
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
                  <p className="text-yellow-800 font-medium mb-2">⚠️ Importante:</p>
                  <ul className="text-sm text-yellow-700 space-y-1">
                    <li>• Guarde este link com segurança</li>
                    <li>• Você precisará dele para acessar sua consulta</li>
                    <li>• O link também foi enviado via WhatsApp</li>
                    <li>• Acesse 5 minutos antes do horário agendado</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Confirmação WhatsApp */}
          <Card className="border-green-200 bg-green-50">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center">
                  <MessageCircle className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="font-medium text-green-800">Confirmação enviada!</p>
                  <p className="text-sm text-green-700">
                    Enviamos a confirmação e o link de acesso para {phone} via WhatsApp.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Ações */}
          <div className="flex gap-4">
            <Button 
              onClick={handleGoToVideoConsultation}
              className="flex-1 bg-purple-600 hover:bg-purple-700 text-white"
            >
              <Video className="mr-2 h-4 w-4" />
              Acessar Teleconsulta
            </Button>
            <Button 
              variant="outline" 
              onClick={handleGoHome}
              className="flex-1"
            >
              Voltar ao Início
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfirmacaoAgendamento;