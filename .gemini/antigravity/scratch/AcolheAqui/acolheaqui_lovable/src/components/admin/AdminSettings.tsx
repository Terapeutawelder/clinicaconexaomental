import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Settings,
  Globe,
  Mail,
  Bell,
  Shield,
  Loader2,
  Save,
  Lock,
  MessageCircle,
  Send,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface AdminSettingsProps {
  userRole?: string | null;
}

interface PlatformSettings {
  site_name: string;
  site_description: string;
  support_email: string;
  maintenance_mode: boolean;
  registration_enabled: boolean;
  email_notifications: boolean;
  trial_days: number;
  admin_email_notifications: boolean;
  admin_whatsapp_notifications: boolean;
  baileys_server_url: string;
}

const AdminSettings = ({ userRole }: AdminSettingsProps) => {
  const [settings, setSettings] = useState<PlatformSettings>({
    site_name: "AcolheAqui",
    site_description: "Plataforma para profissionais de saúde mental",
    support_email: "suporte@acolheaqui.com",
    maintenance_mode: false,
    registration_enabled: true,
    email_notifications: true,
    trial_days: 7,
    admin_email_notifications: true,
    admin_whatsapp_notifications: true,
    baileys_server_url: "",
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  const isSuperAdmin = userRole === "super_admin";

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const { data, error } = await supabase
        .from("platform_settings")
        .select("key, value");

      if (error) throw error;

      if (data && data.length > 0) {
        const loadedSettings: any = { ...settings };
        data.forEach((item) => {
          if (item.key in loadedSettings) {
            loadedSettings[item.key] = item.value;
          }
        });
        setSettings(loadedSettings);
      }
    } catch (error) {
      console.error("Error fetching settings:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    if (!isSuperAdmin) {
      toast({
        title: "Acesso negado",
        description: "Apenas Super Admins podem alterar configurações.",
        variant: "destructive",
      });
      return;
    }

    setIsSaving(true);

    try {
      const entries = Object.entries(settings);

      for (const [key, value] of entries) {
        const { error } = await supabase
          .from("platform_settings")
          .upsert(
            { key, value: JSON.stringify(value) },
            { onConflict: "key" }
          );

        if (error) throw error;
      }

      toast({
        title: "Configurações salvas",
        description: "As alterações foram aplicadas com sucesso.",
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível salvar as configurações.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-white">Configurações</h1>
          <p className="text-slate-400 mt-1">Configurações gerais da plataforma</p>
        </div>
        {isSuperAdmin && (
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Salvando...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Salvar Alterações
              </>
            )}
          </Button>
        )}
      </div>

      {!isSuperAdmin && (
        <Card className="bg-yellow-500/10 border-yellow-500/30">
          <CardContent className="p-4 flex items-center gap-3">
            <Lock className="w-5 h-5 text-yellow-400" />
            <p className="text-yellow-400 text-sm">
              Você tem acesso somente leitura. Apenas Super Admins podem editar as configurações.
            </p>
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="general" className="space-y-6">
        <TabsList className="bg-slate-800 border-slate-700">
          <TabsTrigger value="general" className="data-[state=active]:bg-primary">
            <Globe className="w-4 h-4 mr-2" />
            Geral
          </TabsTrigger>
          <TabsTrigger value="notifications" className="data-[state=active]:bg-primary">
            <Bell className="w-4 h-4 mr-2" />
            Notificações
          </TabsTrigger>
          <TabsTrigger value="security" className="data-[state=active]:bg-primary">
            <Shield className="w-4 h-4 mr-2" />
            Segurança
          </TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-4">
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Globe className="w-5 h-5 text-primary" />
                Informações do Site
              </CardTitle>
              <CardDescription className="text-slate-400">
                Configurações básicas da plataforma
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label className="text-slate-300">Nome do Site</Label>
                <Input
                  value={settings.site_name}
                  onChange={(e) => setSettings({ ...settings, site_name: e.target.value })}
                  disabled={!isSuperAdmin}
                  className="bg-input border-border text-foreground placeholder:text-muted-foreground"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-slate-300">Descrição</Label>
                <Textarea
                  value={settings.site_description}
                  onChange={(e) => setSettings({ ...settings, site_description: e.target.value })}
                  disabled={!isSuperAdmin}
                  className="bg-input border-border text-foreground placeholder:text-muted-foreground min-h-20"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-slate-300">E-mail de Suporte</Label>
                <Input
                  type="email"
                  value={settings.support_email}
                  onChange={(e) => setSettings({ ...settings, support_email: e.target.value })}
                  disabled={!isSuperAdmin}
                  className="bg-input border-border text-foreground placeholder:text-muted-foreground"
                />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Settings className="w-5 h-5 text-primary" />
                Configurações de Trial
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label className="text-slate-300">Dias de Trial</Label>
                <Input
                  type="number"
                  value={settings.trial_days}
                  onChange={(e) => setSettings({ ...settings, trial_days: parseInt(e.target.value) || 0 })}
                  disabled={!isSuperAdmin}
                  className="bg-input border-border text-foreground placeholder:text-muted-foreground w-32"
                />
                <p className="text-sm text-slate-500">
                  Número de dias de período de teste para novos usuários
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-4">
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Mail className="w-5 h-5 text-primary" />
                Notificações por E-mail
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white font-medium">Notificações por E-mail</p>
                  <p className="text-sm text-slate-400">
                    Enviar e-mails de notificação para usuários
                  </p>
                </div>
                <Switch
                  checked={settings.email_notifications}
                  onCheckedChange={(checked) =>
                    setSettings({ ...settings, email_notifications: checked })
                  }
                  disabled={!isSuperAdmin}
                />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Send className="w-5 h-5 text-primary" />
                Notificações Admin (Status e Pagamentos)
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white font-medium">E-mail para Profissionais</p>
                  <p className="text-sm text-slate-400">
                    Enviar e-mails ao alterar status ou confirmar pagamento
                  </p>
                </div>
                <Switch
                  checked={settings.admin_email_notifications}
                  onCheckedChange={(checked) =>
                    setSettings({ ...settings, admin_email_notifications: checked })
                  }
                  disabled={!isSuperAdmin}
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white font-medium">WhatsApp para Profissionais</p>
                  <p className="text-sm text-slate-400">
                    Enviar mensagens WhatsApp ao alterar status ou confirmar pagamento
                  </p>
                </div>
                <Switch
                  checked={settings.admin_whatsapp_notifications}
                  onCheckedChange={(checked) =>
                    setSettings({ ...settings, admin_whatsapp_notifications: checked })
                  }
                  disabled={!isSuperAdmin}
                />
              </div>
              <div className="space-y-2">
                <Label className="text-slate-300">URL do Servidor Baileys</Label>
                <Input
                  value={settings.baileys_server_url}
                  onChange={(e) => setSettings({ ...settings, baileys_server_url: e.target.value })}
                  disabled={!isSuperAdmin}
                  placeholder="https://baileys.seudominio.com"
                  className="bg-input border-border text-foreground placeholder:text-muted-foreground"
                />
                <p className="text-sm text-slate-500">
                  URL do servidor Node.js rodando Baileys para envio de WhatsApp
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-4">
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Shield className="w-5 h-5 text-primary" />
                Segurança e Acesso
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white font-medium">Modo Manutenção</p>
                  <p className="text-sm text-slate-400">
                    Bloqueia o acesso ao site para usuários não-admin
                  </p>
                </div>
                <Switch
                  checked={settings.maintenance_mode}
                  onCheckedChange={(checked) =>
                    setSettings({ ...settings, maintenance_mode: checked })
                  }
                  disabled={!isSuperAdmin}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white font-medium">Cadastros Habilitados</p>
                  <p className="text-sm text-slate-400">
                    Permite novos cadastros na plataforma
                  </p>
                </div>
                <Switch
                  checked={settings.registration_enabled}
                  onCheckedChange={(checked) =>
                    setSettings({ ...settings, registration_enabled: checked })
                  }
                  disabled={!isSuperAdmin}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminSettings;
