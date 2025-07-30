
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { MessageCircle, Send, Settings, CheckCircle, AlertCircle } from "lucide-react";

interface WhatsAppMessage {
  id: number;
  phone: string;
  message: string;
  status: 'sent' | 'delivered' | 'failed' | 'pending';
  timestamp: string;
  type: 'appointment_reminder' | 'confirmation' | 'custom';
}

const WhatsAppNotifications = () => {
  const { toast } = useToast();
  const [apiKey, setApiKey] = useState(() => localStorage.getItem('whatsapp_api_key') || '');
  const [apiUrl, setApiUrl] = useState(() => localStorage.getItem('whatsapp_api_url') || '');
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  // Mock de mensagens enviadas
  const [sentMessages] = useState<WhatsAppMessage[]>([
    {
      id: 1,
      phone: '+5511999999999',
      message: 'Olá! Sua consulta está agendada para amanhã às 14:00.',
      status: 'delivered',
      timestamp: '2024-06-30T10:30:00',
      type: 'appointment_reminder'
    },
    {
      id: 2,
      phone: '+5511888888888',
      message: 'Consulta confirmada para hoje às 09:00.',
      status: 'sent',
      timestamp: '2024-06-30T08:00:00',
      type: 'confirmation'
    }
  ]);

  const saveApiSettings = () => {
    localStorage.setItem('whatsapp_api_key', apiKey);
    localStorage.setItem('whatsapp_api_url', apiUrl);
    toast({
      title: "Configurações salvas",
      description: "API Key e URL foram salvos no navegador.",
    });
  };

  const sendWhatsAppMessage = async () => {
    if (!apiKey || !apiUrl) {
      toast({
        title: "Erro de configuração",
        description: "Configure a API Key e URL primeiro.",
        variant: "destructive",
      });
      return;
    }

    if (!phone || !message) {
      toast({
        title: "Campos obrigatórios",
        description: "Preencha o telefone e mensagem.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          phone: phone,
          message: message,
          timestamp: new Date().toISOString()
        }),
      });

      if (response.ok) {
        toast({
          title: "Mensagem enviada!",
          description: `WhatsApp enviado para ${phone}`,
        });
        setPhone('');
        setMessage('');
      } else {
        throw new Error('Erro na API');
      }
    } catch (error) {
      console.error('Erro ao enviar WhatsApp:', error);
      toast({
        title: "Erro ao enviar",
        description: "Verifique suas configurações de API.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const sendBulkReminders = async () => {
    // Mock de pacientes com consultas agendadas
    const upcomingAppointments = [
      { phone: '+5511999999999', name: 'Maria Silva', time: '14:00' },
      { phone: '+5511888888888', name: 'João Santos', time: '15:30' }
    ];

    setIsLoading(true);

    try {
      for (const appointment of upcomingAppointments) {
        const reminderMessage = `Olá ${appointment.name}! Lembramos que sua consulta está agendada para amanhã às ${appointment.time}. Clínica Conexão Mental.`;
        
        await fetch(apiUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`,
          },
          body: JSON.stringify({
            phone: appointment.phone,
            message: reminderMessage,
          }),
        });
      }

      toast({
        title: "Lembretes enviados!",
        description: `${upcomingAppointments.length} lembretes foram enviados.`,
      });
    } catch (error) {
      toast({
        title: "Erro no envio em massa",
        description: "Alguns lembretes podem não ter sido enviados.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'delivered':
        return <Badge className="bg-green-100 text-green-800"><CheckCircle className="w-3 h-3 mr-1" />Entregue</Badge>;
      case 'sent':
        return <Badge className="bg-blue-100 text-blue-800"><Send className="w-3 h-3 mr-1" />Enviado</Badge>;
      case 'failed':
        return <Badge className="bg-red-100 text-red-800"><AlertCircle className="w-3 h-3 mr-1" />Falhou</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800">Pendente</Badge>;
      default:
        return <Badge>Desconhecido</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Configurações da API */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Configurações da API WhatsApp
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="apiUrl">URL da API</Label>
            <Input
              id="apiUrl"
              type="url"
              value={apiUrl}
              onChange={(e) => setApiUrl(e.target.value)}
              placeholder="https://api.whatsapp.com/send"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="apiKey">API Key</Label>
            <Input
              id="apiKey"
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="Sua chave da API WhatsApp"
            />
          </div>
          <Button onClick={saveApiSettings}>
            Salvar Configurações
          </Button>
        </CardContent>
      </Card>

      {/* Envio de Mensagem Individual */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5" />
            Enviar Mensagem WhatsApp
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="phone">Telefone (com código do país)</Label>
            <Input
              id="phone"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+5511999999999"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="message">Mensagem</Label>
            <Textarea
              id="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Digite sua mensagem..."
              rows={4}
            />
          </div>
          <div className="flex gap-2">
            <Button onClick={sendWhatsAppMessage} disabled={isLoading}>
              {isLoading ? "Enviando..." : "Enviar Mensagem"}
            </Button>
            <Button variant="outline" onClick={sendBulkReminders} disabled={isLoading}>
              Enviar Lembretes em Massa
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Histórico de Mensagens */}
      <Card>
        <CardHeader>
          <CardTitle>Histórico de Mensagens</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {sentMessages.map((msg) => (
              <div key={msg.id} className="border p-4 rounded-lg">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <p className="font-medium">{msg.phone}</p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(msg.timestamp).toLocaleString('pt-BR')}
                    </p>
                  </div>
                  {getStatusBadge(msg.status)}
                </div>
                <p className="text-sm bg-muted p-2 rounded">{msg.message}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default WhatsAppNotifications;
