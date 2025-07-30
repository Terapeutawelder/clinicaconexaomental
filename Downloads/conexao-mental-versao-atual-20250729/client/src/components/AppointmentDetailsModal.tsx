import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Calendar, 
  Clock, 
  User, 
  Phone, 
  Mail, 
  Video, 
  Link2, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  Copy,
  ExternalLink,
  MessageCircle
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Appointment {
  id: number;
  patientName: string;
  patientPhone: string;
  patientEmail: string;
  date: string;
  time: string;
  status: "agendado" | "confirmado" | "realizado" | "cancelado";
  type: "consulta" | "retorno";
}

interface AppointmentDetailsModalProps {
  appointment: Appointment;
  children: React.ReactNode;
}

const AppointmentDetailsModal = ({ appointment, children }: AppointmentDetailsModalProps) => {
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  
  // Gerar link de teleconsulta
  const generateTeleconsultationLink = () => {
    const roomId = `${appointment.id}-${appointment.date.replace(/\//g, '')}-${appointment.time.replace(':', '')}`;
    return `${window.location.origin}/video-consulta?sala=${roomId}&professional=${encodeURIComponent("Dr. João Silva")}&patient=${encodeURIComponent(appointment.patientName)}&time=${appointment.time}&date=${appointment.date}`;
  };

  const teleconsultationLink = generateTeleconsultationLink();

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'agendado': return 'bg-blue-100 text-blue-800';
      case 'confirmado': return 'bg-green-100 text-green-800';
      case 'realizado': return 'bg-gray-100 text-gray-800';
      case 'cancelado': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'agendado': return <AlertCircle className="h-4 w-4" />;
      case 'confirmado': return <CheckCircle className="h-4 w-4" />;
      case 'realizado': return <CheckCircle className="h-4 w-4" />;
      case 'cancelado': return <XCircle className="h-4 w-4" />;
      default: return <AlertCircle className="h-4 w-4" />;
    }
  };

  const copyToClipboard = (text: string, message: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copiado!",
      description: message,
    });
  };

  const openTeleconsultation = () => {
    const directLink = `${window.location.origin}/video-consulta?direct=true&professional=${encodeURIComponent("Dr. João Silva")}&patient=${encodeURIComponent(appointment.patientName)}&time=${appointment.time}&date=${appointment.date}`;
    window.open(directLink, '_blank');
  };

  const openWhatsApp = () => {
    const phone = appointment.patientPhone.replace(/\D/g, '');
    const message = `Olá ${appointment.patientName}, este é Dr. João Silva. Entro em contato sobre sua consulta agendada para ${appointment.date} às ${appointment.time}.`;
    const whatsappUrl = `https://wa.me/55${phone}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <User className="h-5 w-5" />
            <span>Detalhes do Agendamento</span>
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Informações do Paciente */}
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">Informações do Paciente</h3>
                  <Badge className={getStatusColor(appointment.status)}>
                    <div className="flex items-center space-x-1">
                      {getStatusIcon(appointment.status)}
                      <span className="capitalize">{appointment.status}</span>
                    </div>
                  </Badge>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">Nome:</span>
                    </div>
                    <p className="text-sm pl-6">{appointment.patientName}</p>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">Telefone:</span>
                    </div>
                    <div className="flex items-center space-x-2 pl-6">
                      <span className="text-sm">{appointment.patientPhone}</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyToClipboard(appointment.patientPhone, "Telefone copiado!")}
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={openWhatsApp}
                        className="text-green-600 hover:text-green-700"
                      >
                        <MessageCircle className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">Email:</span>
                    </div>
                    <div className="flex items-center space-x-2 pl-6">
                      <span className="text-sm">{appointment.patientEmail}</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyToClipboard(appointment.patientEmail, "Email copiado!")}
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Informações da Consulta */}
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Informações da Consulta</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">Data:</span>
                    </div>
                    <p className="text-sm pl-6">{appointment.date}</p>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">Horário:</span>
                    </div>
                    <p className="text-sm pl-6">{appointment.time}</p>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Video className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">Tipo:</span>
                    </div>
                    <p className="text-sm pl-6 capitalize">
                      {appointment.type === 'consulta' ? 'Consulta' : 'Retorno'}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Link de Teleconsulta */}
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Link2 className="h-5 w-5 text-primary" />
                  <h3 className="text-lg font-semibold">Link de Teleconsulta</h3>
                </div>
                
                <div className="p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-2 mb-2">
                    <Video className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">Link de Acesso:</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="text"
                      value={teleconsultationLink}
                      readOnly
                      className="flex-1 px-3 py-2 text-sm bg-white border rounded-md"
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => copyToClipboard(teleconsultationLink, "Link de teleconsulta copiado!")}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                
                <div className="flex space-x-2">
                  <Button
                    variant="default"
                    onClick={openTeleconsultation}
                    className="flex-1"
                  >
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Abrir Teleconsulta
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => copyToClipboard(teleconsultationLink, "Link copiado!")}
                  >
                    <Copy className="h-4 w-4 mr-2" />
                    Copiar Link
                  </Button>
                  <Button
                    variant="outline"
                    onClick={openWhatsApp}
                    className="text-green-600 hover:text-green-700"
                  >
                    <MessageCircle className="h-4 w-4 mr-2" />
                    WhatsApp
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <Separator />

          {/* Ações */}
          <div className="flex justify-end space-x-2">
            <Button
              variant="outline"
              onClick={() => setIsOpen(false)}
            >
              Fechar
            </Button>
            {appointment.status === 'confirmado' && (
              <Button
                variant="default"
                onClick={openTeleconsultation}
              >
                <Video className="h-4 w-4 mr-2" />
                Iniciar Consulta
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AppointmentDetailsModal;