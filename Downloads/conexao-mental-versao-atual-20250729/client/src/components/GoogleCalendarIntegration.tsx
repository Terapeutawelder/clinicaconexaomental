import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Calendar, 
  CheckCircle, 
  ExternalLink, 
  AlertCircle,
  RefreshCw,
  Settings,
  Clock,
  User
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface GoogleCalendarEvent {
  id: string;
  title: string;
  start: string;
  end: string;
  attendees?: string[];
  description?: string;
}

interface GoogleCalendarIntegrationProps {
  onIntegrationChange?: (isConnected: boolean) => void;
  googleEmail?: string;
}

const GoogleCalendarIntegration = ({ onIntegrationChange, googleEmail }: GoogleCalendarIntegrationProps) => {
  const { toast } = useToast();
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [events, setEvents] = useState<GoogleCalendarEvent[]>([]);
  const [selectedCalendar, setSelectedCalendar] = useState<string>("primary");

  // Simular eventos do Google Calendar
  const sampleEvents: GoogleCalendarEvent[] = [
    {
      id: "1",
      title: "Consulta - Maria Silva",
      start: "2025-07-14T09:00:00",
      end: "2025-07-14T10:00:00",
      attendees: ["maria.silva@email.com"],
      description: "Consulta de psicologia"
    },
    {
      id: "2",
      title: "Consulta - João Santos",
      start: "2025-07-14T14:00:00",
      end: "2025-07-14T15:00:00",
      attendees: ["joao.santos@email.com"],
      description: "Retorno - Terapia cognitivo-comportamental"
    },
    {
      id: "3",
      title: "Consulta - Ana Costa",
      start: "2025-07-15T10:00:00",
      end: "2025-07-15T11:00:00",
      attendees: ["ana.costa@email.com"],
      description: "Primeira consulta"
    }
  ];

  const handleConnect = async () => {
    if (!googleEmail) {
      toast({
        title: "Email necessário",
        description: "Por favor, digite seu email do Google antes de conectar.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      // Simular processo de autenticação OAuth com Google
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Em uma implementação real, aqui seria feita a integração com Google Calendar API
      // const response = await gapi.auth2.getAuthInstance().signIn();
      // const calendar = gapi.client.calendar;
      
      setIsConnected(true);
      setEvents(sampleEvents);
      onIntegrationChange?.(true);
      
      toast({
        title: "Integração realizada com sucesso!",
        description: "Sua agenda do Google Calendar foi sincronizada.",
      });
    } catch (error) {
      toast({
        title: "Erro na integração",
        description: "Não foi possível conectar com o Google Calendar. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDisconnect = () => {
    setIsConnected(false);
    setEvents([]);
    onIntegrationChange?.(false);
    
    toast({
      title: "Desconectado",
      description: "A integração com Google Calendar foi removida.",
    });
  };

  const handleSyncEvents = async () => {
    setIsLoading(true);
    try {
      // Simular sincronização de eventos
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Em uma implementação real, seria feita a busca por novos eventos
      setEvents(sampleEvents);
      
      toast({
        title: "Eventos sincronizados",
        description: "Sua agenda foi atualizada com sucesso.",
      });
    } catch (error) {
      toast({
        title: "Erro na sincronização",
        description: "Não foi possível sincronizar os eventos.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const openGoogleCalendar = () => {
    window.open('https://calendar.google.com', '_blank');
  };

  const formatEventTime = (dateTime: string) => {
    const date = new Date(dateTime);
    return date.toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Calendar className="h-5 w-5" />
          <span>Integração com Google Calendar</span>
          {isConnected && (
            <Badge variant="secondary" className="bg-green-100 text-green-800">
              <CheckCircle className="h-3 w-3 mr-1" />
              Conectado
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {!isConnected ? (
          <div className="space-y-4">
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Conecte sua conta do Google Calendar para sincronizar automaticamente seus agendamentos 
                e disponibilidade. Isso facilitará o gerenciamento de suas consultas.
                {googleEmail && (
                  <div className="mt-2 text-sm">
                    <strong>Email a ser conectado:</strong> {googleEmail}
                  </div>
                )}
              </AlertDescription>
            </Alert>
            
            <div className="space-y-2">
              <h4 className="font-medium">Benefícios da integração:</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Sincronização automática de agendamentos</li>
                <li>• Prevenção de conflitos de horários</li>
                <li>• Acesso aos seus eventos em qualquer dispositivo</li>
                <li>• Notificações automáticas para pacientes</li>
              </ul>
            </div>

            <Button 
              onClick={handleConnect} 
              disabled={isLoading}
              className="w-full"
            >
              {isLoading ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Conectando...
                </>
              ) : (
                <>
                  <Calendar className="h-4 w-4 mr-2" />
                  Conectar com Google Calendar
                </>
              )}
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <div>
                  <span className="text-sm font-medium">Conta conectada</span>
                  {googleEmail && (
                    <div className="text-xs text-muted-foreground">{googleEmail}</div>
                  )}
                </div>
              </div>
              <div className="flex space-x-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleSyncEvents}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <RefreshCw className="h-4 w-4 animate-spin" />
                  ) : (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Sincronizar
                    </>
                  )}
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={openGoogleCalendar}
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Abrir Calendar
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleDisconnect}
                  className="text-red-600 hover:text-red-700"
                >
                  <Settings className="h-4 w-4 mr-2" />
                  Desconectar
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="font-medium">Próximos eventos ({events.length})</h4>
              {events.length === 0 ? (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    Nenhum evento encontrado. Seus agendamentos aparecerão aqui automaticamente.
                  </AlertDescription>
                </Alert>
              ) : (
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {events.map((event) => (
                    <div 
                      key={event.id}
                      className="p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <div className="space-y-1">
                          <div className="flex items-center space-x-2">
                            <User className="h-4 w-4 text-muted-foreground" />
                            <span className="font-medium text-sm">{event.title}</span>
                          </div>
                          <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                            <Clock className="h-3 w-3" />
                            <span>{formatEventTime(event.start)}</span>
                          </div>
                          {event.description && (
                            <p className="text-xs text-muted-foreground">{event.description}</p>
                          )}
                        </div>
                        <Badge variant="outline" className="text-xs">
                          Google Calendar
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Os eventos são sincronizados automaticamente. Para gerenciar seus agendamentos, 
                use o Google Calendar ou a interface da plataforma.
              </AlertDescription>
            </Alert>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default GoogleCalendarIntegration;