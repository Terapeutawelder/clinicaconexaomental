
import { useToast } from "@/hooks/use-toast";

interface WhatsAppConfig {
  apiKey: string;
  apiUrl: string;
}

interface NotificationData {
  phone: string;
  message: string;
  patientName?: string;
  appointmentTime?: string;
}

export const useWhatsAppNotifications = () => {
  const { toast } = useToast();

  const getConfig = (): WhatsAppConfig | null => {
    const apiKey = localStorage.getItem('whatsapp_api_key');
    const apiUrl = localStorage.getItem('whatsapp_api_url');
    
    if (!apiKey || !apiUrl) {
      return null;
    }
    
    return { apiKey, apiUrl };
  };

  const sendNotification = async (data: NotificationData): Promise<boolean> => {
    const config = getConfig();
    if (!config) {
      toast({
        title: "Configuração WhatsApp não encontrada",
        description: "Configure a API no painel administrativo.",
        variant: "destructive",
      });
      return false;
    }

    try {
      const response = await fetch(config.apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${config.apiKey}`,
        },
        body: JSON.stringify({
          phone: data.phone,
          message: data.message,
          timestamp: new Date().toISOString()
        }),
      });

      if (response.ok) {
        console.log(`WhatsApp enviado para ${data.phone}`);
        return true;
      } else {
        throw new Error('Erro na API');
      }
    } catch (error) {
      console.error('Erro ao enviar WhatsApp:', error);
      return false;
    }
  };

  const sendAppointmentConfirmation = async (patientName: string, phone: string, date: string, time: string) => {
    const message = `Olá ${patientName}! Sua consulta foi confirmada para ${date} às ${time}. Clínica Conexão Mental - Plataforma de Saúde Mental.`;
    
    return await sendNotification({
      phone,
      message,
      patientName,
      appointmentTime: time
    });
  };

  const sendAppointmentReminder = async (patientName: string, phone: string, date: string, time: string) => {
    const message = `Olá ${patientName}! Lembramos que sua consulta está agendada para ${date} às ${time}. Não esqueça! Clínica Conexão Mental.`;
    
    return await sendNotification({
      phone,
      message,
      patientName,
      appointmentTime: time
    });
  };

  const sendAppointmentCancellation = async (patientName: string, phone: string, reason?: string) => {
    const message = `Olá ${patientName}! Infelizmente sua consulta foi cancelada${reason ? `: ${reason}` : '.'}. Entre em contato para reagendar. Clínica Conexão Mental.`;
    
    return await sendNotification({
      phone,
      message,
      patientName
    });
  };

  const sendCustomMessage = async (phone: string, message: string) => {
    return await sendNotification({
      phone,
      message
    });
  };

  return {
    sendAppointmentConfirmation,
    sendAppointmentReminder, 
    sendAppointmentCancellation,
    sendCustomMessage,
    isConfigured: () => getConfig() !== null
  };
};
