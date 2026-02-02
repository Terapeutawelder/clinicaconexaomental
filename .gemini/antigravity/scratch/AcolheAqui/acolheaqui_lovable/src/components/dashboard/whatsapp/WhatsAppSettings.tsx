import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Save,
  Loader2,
  Bell,
  Clock,
  FileText,
  Settings,
} from "lucide-react";
import { NotificationTemplatesEditor, DEFAULT_TEMPLATES } from "../NotificationTemplatesEditor";

interface WhatsAppSettingsProps {
  profileId: string;
}

interface WhatsAppSettingsData {
  id?: string;
  is_active: boolean;
  reminder_enabled: boolean;
  reminder_hours_before: number;
  confirmation_enabled: boolean;
  template_client_confirmation: string;
  template_client_reminder: string;
  template_professional_notification: string;
  template_email_confirmation: string;
}

export const WhatsAppSettings = ({ profileId }: WhatsAppSettingsProps) => {
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState("notifications");

  const [settings, setSettings] = useState<WhatsAppSettingsData>({
    is_active: false,
    reminder_enabled: true,
    reminder_hours_before: 24,
    confirmation_enabled: true,
    template_client_confirmation: "",
    template_client_reminder: "",
    template_professional_notification: "",
    template_email_confirmation: "",
  });

  const [stats, setStats] = useState({
    total_sent: 0,
    confirmations_sent: 0,
    reminders_sent: 0,
  });

  useEffect(() => {
    fetchSettings();
    fetchStats();
  }, [profileId]);

  const fetchSettings = async () => {
    try {
      const { data, error } = await supabase
        .from("whatsapp_settings")
        .select("*")
        .eq("professional_id", profileId)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        setSettings({
          id: data.id,
          is_active: data.is_active || false,
          reminder_enabled: data.reminder_enabled ?? true,
          reminder_hours_before: data.reminder_hours_before || 24,
          confirmation_enabled: data.confirmation_enabled ?? true,
          template_client_confirmation: (data as any).template_client_confirmation || "",
          template_client_reminder: (data as any).template_client_reminder || "",
          template_professional_notification: (data as any).template_professional_notification || "",
          template_email_confirmation: (data as any).template_email_confirmation || "",
        });
      }
    } catch (error) {
      console.error("Error fetching settings:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      startOfMonth.setHours(0, 0, 0, 0);

      const { count } = await supabase
        .from("appointments")
        .select("*", { count: "exact", head: true })
        .eq("professional_id", profileId)
        .gte("created_at", startOfMonth.toISOString());

      setStats({
        total_sent: (count || 0) * 2,
        confirmations_sent: count || 0,
        reminders_sent: count || 0,
      });
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);

    try {
      const payload = {
        professional_id: profileId,
        is_active: settings.is_active,
        reminder_enabled: settings.reminder_enabled,
        reminder_hours_before: settings.reminder_hours_before,
        confirmation_enabled: settings.confirmation_enabled,
        template_client_confirmation: settings.template_client_confirmation || null,
        template_client_reminder: settings.template_client_reminder || null,
        template_professional_notification: settings.template_professional_notification || null,
        template_email_confirmation: settings.template_email_confirmation || null,
      };

      if (settings.id) {
        const { error } = await supabase
          .from("whatsapp_settings")
          .update(payload)
          .eq("id", settings.id);
        if (error) throw error;
      } else {
        const { data, error } = await supabase
          .from("whatsapp_settings")
          .insert(payload)
          .select()
          .single();
        if (error) throw error;
        setSettings(prev => ({ ...prev, id: data.id }));
      }

      toast.success("Configurações salvas com sucesso!");
    } catch (error) {
      console.error("Error saving settings:", error);
      toast.error("Erro ao salvar configurações");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-green-500" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Configurações</h1>
          <p className="text-muted-foreground">
            Gerencie as configurações de notificações e templates
          </p>
        </div>
        <Button
          onClick={handleSave}
          disabled={isSaving}
          className="bg-green-500 hover:bg-green-600 text-white"
        >
          {isSaving ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Salvando...
            </>
          ) : (
            <>
              <Save className="h-4 w-4 mr-2" />
              Salvar Configurações
            </>
          )}
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="notifications" className="flex items-center gap-2">
            <Bell className="h-4 w-4" />
            Notificações
          </TabsTrigger>
          <TabsTrigger value="templates" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Templates
          </TabsTrigger>
          <TabsTrigger value="stats" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Estatísticas
          </TabsTrigger>
        </TabsList>

        <TabsContent value="notifications" className="space-y-6 pt-6">
          {/* Confirmation Toggle */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Bell className="h-5 w-5 text-green-500" />
                Confirmação de Agendamento
              </CardTitle>
              <CardDescription>
                Enviar mensagem de confirmação quando um agendamento é realizado
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Ativar confirmações</p>
                  <p className="text-sm text-muted-foreground">
                    O cliente receberá uma mensagem após agendar
                  </p>
                </div>
                <Switch
                  checked={settings.confirmation_enabled}
                  onCheckedChange={(checked) =>
                    setSettings(prev => ({ ...prev, confirmation_enabled: checked }))
                  }
                />
              </div>
            </CardContent>
          </Card>

          {/* Reminder Toggle */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Clock className="h-5 w-5 text-green-500" />
                Lembrete de Consulta
              </CardTitle>
              <CardDescription>
                Enviar lembrete automático antes da consulta
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Ativar lembretes</p>
                  <p className="text-sm text-muted-foreground">
                    O cliente receberá um lembrete antes da consulta
                  </p>
                </div>
                <Switch
                  checked={settings.reminder_enabled}
                  onCheckedChange={(checked) =>
                    setSettings(prev => ({ ...prev, reminder_enabled: checked }))
                  }
                />
              </div>

              {settings.reminder_enabled && (
                <div className="flex items-center gap-4">
                  <Label>Enviar lembrete</Label>
                  <Input
                    type="number"
                    value={settings.reminder_hours_before}
                    onChange={(e) =>
                      setSettings(prev => ({
                        ...prev,
                        reminder_hours_before: parseInt(e.target.value) || 24,
                      }))
                    }
                    className="w-20"
                    min={1}
                    max={72}
                  />
                  <span className="text-muted-foreground">horas antes</span>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="templates" className="pt-6">
          <NotificationTemplatesEditor
            templates={{
              clientConfirmation: settings.template_client_confirmation || DEFAULT_TEMPLATES.clientConfirmation,
              clientReminder: settings.template_client_reminder || DEFAULT_TEMPLATES.clientReminder,
              professionalNotification: settings.template_professional_notification || DEFAULT_TEMPLATES.professionalNotification,
              emailConfirmation: settings.template_email_confirmation || DEFAULT_TEMPLATES.emailConfirmation,
            }}
            onTemplatesChange={(templates) => {
              setSettings(prev => ({
                ...prev,
                template_client_confirmation: templates.clientConfirmation,
                template_client_reminder: templates.clientReminder,
                template_professional_notification: templates.professionalNotification,
                template_email_confirmation: templates.emailConfirmation,
              }));
            }}
          />
        </TabsContent>

        <TabsContent value="stats" className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-muted-foreground">
                  Total Enviado (Este Mês)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-green-600">
                  {stats.total_sent}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-muted-foreground">
                  Confirmações
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-blue-600">
                  {stats.confirmations_sent}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-muted-foreground">
                  Lembretes
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-amber-600">
                  {stats.reminders_sent}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};
