
import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import VideoCall from "@/components/VideoCall";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar, Clock, User, Video, LogIn } from "lucide-react";

const VideoConsultation = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isInCall, setIsInCall] = useState(false);
  const [patientName, setPatientName] = useState("");
  const [accessLink, setAccessLink] = useState("");
  const [loginError, setLoginError] = useState("");
  
  const professionalName = searchParams.get('professional') || 'Dr. Ana Paula Silva';
  const appointmentTime = searchParams.get('time') || '14:00';
  const appointmentDate = searchParams.get('date') || 'Hoje';
  const isDirect = searchParams.get('direct') === 'true';
  const patientFromUrl = searchParams.get('patient') || '';

  // Auto-login para acesso direto
  useEffect(() => {
    if (isDirect && patientFromUrl) {
      setPatientName(decodeURIComponent(patientFromUrl));
      setIsLoggedIn(true);
    }
  }, [isDirect, patientFromUrl]);

  const handleLogin = () => {
    if (!patientName.trim()) {
      setLoginError("Por favor, insira seu nome completo.");
      return;
    }
    if (!accessLink.trim()) {
      setLoginError("Por favor, insira o link de acesso recebido.");
      return;
    }
    
    // Validação simples do link - em uma aplicação real, seria validado no backend
    if (!accessLink.includes("video-consulta") || accessLink.length < 20) {
      setLoginError("Link de acesso inválido. Verifique o link recebido por email.");
      return;
    }
    
    setLoginError("");
    setIsLoggedIn(true);
  };

  const handleStartCall = () => {
    console.log("Iniciando chamada...");
    setIsInCall(true);
  };

  const handleEndCall = () => {
    setIsInCall(false);
    navigate('/');
  };

  if (isInCall) {
    return (
      <VideoCall
        professionalName={professionalName}
        patientName={patientName}
        onEndCall={handleEndCall}
        callStartTime={new Date()}
      />
    );
  }

  // Tela de login
  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-white flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="w-16 h-16 bg-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <LogIn className="h-8 w-8 text-white" />
            </div>
            <CardTitle className="text-2xl">Acesso à Teleconsulta</CardTitle>
            <p className="text-gray-600 mt-2">
              Insira seus dados para acessar sua consulta agendada
            </p>
          </CardHeader>
          
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="patientName">Nome Completo</Label>
              <Input
                id="patientName"
                type="text"
                placeholder="Digite seu nome completo"
                value={patientName}
                onChange={(e) => setPatientName(e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="accessLink">Link de Acesso</Label>
              <Input
                id="accessLink"
                type="text"
                placeholder="Cole o link recebido por email"
                value={accessLink}
                onChange={(e) => setAccessLink(e.target.value)}
              />
              <p className="text-sm text-gray-500">
                Você recebeu este link por email após confirmar seu agendamento
              </p>
            </div>

            {loginError && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <p className="text-red-800 text-sm">{loginError}</p>
              </div>
            )}

            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="font-semibold text-blue-900 mb-2">Instruções:</h3>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Use o nome exato usado no agendamento</li>
                <li>• Verifique sua caixa de email e spam</li>
                <li>• O link é único para sua consulta</li>
              </ul>
            </div>

            <div className="space-y-3">
              <Button 
                onClick={handleLogin} 
                className="w-full bg-purple-600 hover:bg-purple-700 text-lg py-6"
              >
                <LogIn className="mr-2 h-5 w-5" />
                Entrar na Sala
              </Button>
              
              <Button 
                variant="outline" 
                onClick={() => navigate('/')}
                className="w-full"
              >
                Voltar ao Início
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Tela de aguardo da consulta (após login)
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-white flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="w-16 h-16 bg-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <Video className="h-8 w-8 text-white" />
          </div>
          <CardTitle className="text-2xl">Teleconsulta</CardTitle>
          <p className="text-gray-600 mt-2">Bem-vindo(a), {patientName}!</p>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <div className="text-center space-y-2">
            <div className="flex items-center justify-center space-x-2 text-gray-600">
              <User className="h-4 w-4" />
              <span>{professionalName}</span>
            </div>
            <div className="flex items-center justify-center space-x-2 text-gray-600">
              <Calendar className="h-4 w-4" />
              <span>{appointmentDate}</span>
            </div>
            <div className="flex items-center justify-center space-x-2 text-gray-600">
              <Clock className="h-4 w-4" />
              <span>{appointmentTime}</span>
            </div>
          </div>

          <div className="bg-green-50 p-4 rounded-lg border border-green-200">
            <h3 className="font-semibold text-green-900 mb-2">✓ Acesso Confirmado</h3>
            <p className="text-sm text-green-800">
              Seus dados foram validados com sucesso. Você pode iniciar a consulta.
            </p>
          </div>

          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="font-semibold text-blue-900 mb-2">Antes de começar:</h3>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Certifique-se de estar em um local silencioso</li>
              <li>• Verifique sua conexão com a internet</li>
              <li>• Teste sua câmera e microfone</li>
              <li>• Tenha seus documentos em mãos</li>
            </ul>
          </div>

          <div className="space-y-3">
            <Button 
              onClick={() => {
                console.log("=== TESTE TELECONSULTA ===");
                console.log("Paciente:", patientName);
                console.log("Profissional:", professionalName);
                console.log("Horário:", appointmentTime);
                console.log("Data:", appointmentDate);
                console.log("Iniciando teleconsulta...");
                handleStartCall();
              }}
              className="w-full bg-green-600 hover:bg-green-700 text-lg py-6"
            >
              <Video className="mr-2 h-5 w-5" />
              Entrar na Consulta
            </Button>
            
            <Button 
              variant="outline" 
              onClick={() => {
                setIsLoggedIn(false);
                setPatientName("");
                setAccessLink("");
                setLoginError("");
              }}
              className="w-full"
            >
              Sair
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default VideoConsultation;
