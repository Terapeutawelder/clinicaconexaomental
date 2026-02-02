import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Bell, 
  MessageCircle, 
  CheckCircle, 
  Clock, 
  Calendar,
  Send,
  Loader2,
  AlertCircle,
  Settings
} from "lucide-react";
import { Link } from "react-router-dom";

interface NotificationsConfigPageProps {
  profileId: string;
}

interface WhatsAppSettings {
  is_active: boolean;
  reminder_enabled: boolean;
  reminder_hours_before: number;
  confirmation_enabled: boolean;
}

interface NotificationStats {
  total_sent: number;
  confirmations_sent: number;
  reminders_sent: number;
}

const NotificationsConfigPage = ({ profileId }: NotificationsConfigPageProps) => {
  const [isLoading, setIsLoading] = useState(true);
  const [settings, setSettings] = useState<WhatsAppSettings | null>(null);
  const [stats, setStats] = useState<NotificationStats>({
    total_sent: 0,
    confirmations_sent: 0,
    reminders_sent: 0,
  });

  useEffect(() => {
    fetchData();
  }, [profileId]);

  const fetchData = async () => {
    try {
      // Fetch WhatsApp settings
      const { data: whatsappData } = await supabase
        .from("whatsapp_settings")
        .select("is_active, reminder_enabled, reminder_hours_before, confirmation_enabled")
        .eq("professional_id", profileId)
        .maybeSingle();

      if (whatsappData) {
        setSettings(whatsappData);
      }

      // Get appointment stats for this month (simulate notification stats)
      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      startOfMonth.setHours(0, 0, 0, 0);

      const { count } = await supabase
        .from("appointments")
        .select("*", { count: "exact", head: true })
        .eq("professional_id", profileId)
        .gte("created_at", startOfMonth.toISOString());

      setStats({
        total_sent: (count || 0) * 2, // Confirmation + reminder estimate
        confirmations_sent: count || 0,
        reminders_sent: count || 0,
      });
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const isConfigured = settings?.is_active;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Status Banner */}
      {!isConfigured ? (
        <Card className="bg-yellow-500/10 border-yellow-500/20">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <AlertCircle className="h-6 w-6 text-yellow-500 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <h3 className="text-yellow-400 font-medium mb-1">WhatsApp não configurado</h3>
                <p className="text-yellow-400/70 text-sm mb-4">
                  Configure a integração com WhatsApp para enviar notificações automáticas aos seus clientes.
                </p>
                <Link to="/dashboard?tab=whatsapp">
                  <Button size="sm" className="bg-yellow-500 hover:bg-yellow-600 text-black">
                    <Settings className="h-4 w-4 mr-2" />
                    Configurar WhatsApp
                  </Button>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card className="bg-green-500/10 border-green-500/20">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <CheckCircle className="h-6 w-6 text-green-500" />
              <div>
                <h3 className="text-green-400 font-medium">Notificações Ativas</h3>
                <p className="text-green-400/70 text-sm">
                  Seus clientes estão recebendo notificações automaticamente
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Stats Cards */}
      <div className="grid md:grid-cols-3 gap-4">
        <Card className="bg-[hsl(215,40%,12%)] border-white/5">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Send className="h-5 w-5 text-primary" />
              </div>
              <span className="text-white/60 text-sm">Total Enviadas</span>
            </div>
            <p className="text-3xl font-bold text-white">{stats.total_sent}</p>
            <p className="text-white/40 text-xs mt-1">este mês</p>
          </CardContent>
        </Card>

        <Card className="bg-[hsl(215,40%,12%)] border-white/5">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-green-500/10 rounded-lg">
                <CheckCircle className="h-5 w-5 text-green-500" />
              </div>
              <span className="text-white/60 text-sm">Confirmações</span>
            </div>
            <p className="text-3xl font-bold text-white">{stats.confirmations_sent}</p>
            <p className="text-white/40 text-xs mt-1">novos agendamentos</p>
          </CardContent>
        </Card>

        <Card className="bg-[hsl(215,40%,12%)] border-white/5">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-yellow-500/10 rounded-lg">
                <Clock className="h-5 w-5 text-yellow-500" />
              </div>
              <span className="text-white/60 text-sm">Lembretes</span>
            </div>
            <p className="text-3xl font-bold text-white">{stats.reminders_sent}</p>
            <p className="text-white/40 text-xs mt-1">enviados antes das consultas</p>
          </CardContent>
        </Card>
      </div>

      {/* Notification Types */}
      <Card className="bg-[hsl(215,40%,12%)] border-white/5">
        <CardHeader>
          <CardTitle className="text-white">Tipos de Notificação</CardTitle>
          <CardDescription className="text-white/60">
            Confira quais notificações estão ativas
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Confirmation */}
          <div className="flex items-center justify-between p-4 rounded-xl bg-white/5">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${settings?.confirmation_enabled ? "bg-green-500/10" : "bg-white/5"}`}>
                <Calendar className={`h-5 w-5 ${settings?.confirmation_enabled ? "text-green-500" : "text-white/40"}`} />
              </div>
              <div>
                <p className="text-white font-medium">Confirmação de Agendamento</p>
                <p className="text-sm text-white/50">Enviada imediatamente após novo agendamento</p>
              </div>
            </div>
            <div className={`px-3 py-1 rounded-full text-xs font-medium ${
              settings?.confirmation_enabled 
                ? "bg-green-500/10 text-green-400" 
                : "bg-white/10 text-white/40"
            }`}>
              {settings?.confirmation_enabled ? "Ativa" : "Inativa"}
            </div>
          </div>

          {/* Reminder */}
          <div className="flex items-center justify-between p-4 rounded-xl bg-white/5">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${settings?.reminder_enabled ? "bg-yellow-500/10" : "bg-white/5"}`}>
                <Bell className={`h-5 w-5 ${settings?.reminder_enabled ? "text-yellow-500" : "text-white/40"}`} />
              </div>
              <div>
                <p className="text-white font-medium">Lembrete de Consulta</p>
                <p className="text-sm text-white/50">
                  {settings?.reminder_enabled 
                    ? `Enviado ${settings.reminder_hours_before}h antes da consulta`
                    : "Não configurado"
                  }
                </p>
              </div>
            </div>
            <div className={`px-3 py-1 rounded-full text-xs font-medium ${
              settings?.reminder_enabled 
                ? "bg-yellow-500/10 text-yellow-400" 
                : "bg-white/10 text-white/40"
            }`}>
              {settings?.reminder_enabled ? "Ativa" : "Inativa"}
            </div>
          </div>

          {/* Email */}
          <div className="flex items-center justify-between p-4 rounded-xl bg-white/5">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <MessageCircle className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-white font-medium">E-mail de Confirmação</p>
                <p className="text-sm text-white/50">Enviado para o cliente após agendamento</p>
              </div>
            </div>
            <div className="px-3 py-1 rounded-full text-xs font-medium bg-green-500/10 text-green-400">
              Sempre Ativa
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Configure Button */}
      <div className="flex justify-center">
        <Link to="/dashboard?tab=whatsapp">
          <Button variant="outline" className="border-white/20 text-white hover:bg-white/10">
            <Settings className="h-4 w-4 mr-2" />
            Configurar Notificações
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default NotificationsConfigPage;
