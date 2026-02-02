import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  MessageCircle, 
  Save, 
  Loader2, 
  CheckCircle, 
  AlertCircle,
  Bell,
  Clock
} from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface WhatsAppIntegrationPageProps {
  profileId: string;
}

interface WhatsAppSettings {
  id?: string;
  evolution_api_url: string;
  evolution_api_key: string;
  evolution_instance_name: string;
  is_active: boolean;
  reminder_enabled: boolean;
  reminder_hours_before: number;
  confirmation_enabled: boolean;
}

const WhatsAppIntegrationPage = ({ profileId }: WhatsAppIntegrationPageProps) => {
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<"unknown" | "connected" | "error">("unknown");

  const [settings, setSettings] = useState<WhatsAppSettings>({
    evolution_api_url: "https://evo.agenteluzia.online",
    evolution_api_key: "",
    evolution_instance_name: "",
    is_active: false,
    reminder_enabled: true,
    reminder_hours_before: 24,
    confirmation_enabled: true,
  });

  useEffect(() => {
    fetchSettings();
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
          evolution_api_url: data.evolution_api_url || "https://evo.agenteluzia.online",
          evolution_api_key: data.evolution_api_key || "",
          evolution_instance_name: data.evolution_instance_name || "",
          is_active: data.is_active || false,
          reminder_enabled: data.reminder_enabled ?? true,
          reminder_hours_before: data.reminder_hours_before || 24,
          confirmation_enabled: data.confirmation_enabled ?? true,
        });
        
        if (data.is_active) {
          setConnectionStatus("connected");
        }
      }
    } catch (error) {
      console.error("Error fetching WhatsApp settings:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: keyof WhatsAppSettings, value: string | boolean | number) => {
    setSettings(prev => ({ ...prev, [field]: value }));
  };

  const testConnection = async () => {
    if (!settings.evolution_api_url || !settings.evolution_api_key || !settings.evolution_instance_name) {
      toast.error("Preencha todos os campos de conexão");
      return;
    }

    setIsTesting(true);
    setConnectionStatus("unknown");

    try {
      // Test the Evolution API connection
      const response = await fetch(`${settings.evolution_api_url}/instance/fetchInstances`, {
        method: "GET",
        headers: {
          "apikey": settings.evolution_api_key,
        },
      });

      if (response.ok) {
        const data = await response.json();
        const instanceExists = data.some((inst: any) => inst.instance?.instanceName === settings.evolution_instance_name);
        
        if (instanceExists) {
          setConnectionStatus("connected");
          toast.success("Conexão estabelecida com sucesso!");
        } else {
          setConnectionStatus("error");
          toast.error("Instância não encontrada. Verifique o nome da instância.");
        }
      } else {
        setConnectionStatus("error");
        toast.error("Erro na conexão. Verifique a URL e a chave API.");
      }
    } catch (error) {
      console.error("Error testing connection:", error);
      setConnectionStatus("error");
      toast.error("Erro ao conectar. Verifique os dados informados.");
    } finally {
      setIsTesting(false);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);

    try {
      const payload = {
        professional_id: profileId,
        evolution_api_url: settings.evolution_api_url,
        evolution_api_key: settings.evolution_api_key,
        evolution_instance_name: settings.evolution_instance_name,
        is_active: settings.is_active,
        reminder_enabled: settings.reminder_enabled,
        reminder_hours_before: settings.reminder_hours_before,
        confirmation_enabled: settings.confirmation_enabled,
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
      console.error("Error saving WhatsApp settings:", error);
      toast.error("Erro ao salvar configurações");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Connection Status Banner */}
      {connectionStatus !== "unknown" && (
        <div className={`rounded-xl p-4 flex items-center gap-3 ${
          connectionStatus === "connected" 
            ? "bg-green-500/10 border border-green-500/20" 
            : "bg-red-500/10 border border-red-500/20"
        }`}>
          {connectionStatus === "connected" ? (
            <>
              <CheckCircle className="h-5 w-5 text-green-500" />
              <span className="text-green-400 font-medium">WhatsApp conectado e funcionando</span>
            </>
          ) : (
            <>
              <AlertCircle className="h-5 w-5 text-red-500" />
              <span className="text-red-400 font-medium">Erro na conexão com WhatsApp</span>
            </>
          )}
        </div>
      )}

      {/* API Configuration */}
      <Card className="bg-[hsl(215,40%,12%)] border-white/5">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-500/10 rounded-lg">
              <MessageCircle className="h-6 w-6 text-green-500" />
            </div>
            <div>
              <CardTitle className="text-white">Conexão Evolution API</CardTitle>
              <CardDescription className="text-white/60">
                Configure sua instância da Evolution API para enviar mensagens
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="is-active" className="text-white">Ativar Integração</Label>
            <Switch
              id="is-active"
              checked={settings.is_active}
              onCheckedChange={(checked) => handleInputChange("is_active", checked)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="api-url" className="text-white/80">URL da API</Label>
            <Input
              id="api-url"
              value={settings.evolution_api_url}
              onChange={(e) => handleInputChange("evolution_api_url", e.target.value)}
              placeholder="https://sua-evolution-api.com"
              className="bg-white/5 border-white/10 text-white placeholder:text-white/30"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="api-key" className="text-white/80">Chave da API</Label>
            <Input
              id="api-key"
              type="password"
              value={settings.evolution_api_key}
              onChange={(e) => handleInputChange("evolution_api_key", e.target.value)}
              placeholder="Sua chave API"
              className="bg-white/5 border-white/10 text-white placeholder:text-white/30"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="instance-name" className="text-white/80">Nome da Instância</Label>
            <Input
              id="instance-name"
              value={settings.evolution_instance_name}
              onChange={(e) => handleInputChange("evolution_instance_name", e.target.value)}
              placeholder="Nome da sua instância"
              className="bg-white/5 border-white/10 text-white placeholder:text-white/30"
            />
          </div>

          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={testConnection}
              disabled={isTesting}
              className="border-white/20 text-white hover:bg-white/10"
            >
              {isTesting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Testando...
                </>
              ) : (
                "Testar Conexão"
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Notification Settings */}
      <Card className="bg-[hsl(215,40%,12%)] border-white/5">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Bell className="h-6 w-6 text-primary" />
            </div>
            <div>
              <CardTitle className="text-white">Notificações Automáticas</CardTitle>
              <CardDescription className="text-white/60">
                Configure quais notificações serão enviadas automaticamente
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Confirmation */}
          <div className="flex items-center justify-between p-4 rounded-xl bg-white/5">
            <div className="flex items-center gap-3">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <div>
                <p className="text-white font-medium">Confirmação de Agendamento</p>
                <p className="text-sm text-white/50">Enviar mensagem quando um novo agendamento for criado</p>
              </div>
            </div>
            <Switch
              checked={settings.confirmation_enabled}
              onCheckedChange={(checked) => handleInputChange("confirmation_enabled", checked)}
            />
          </div>

          {/* Reminder */}
          <div className="p-4 rounded-xl bg-white/5 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Clock className="h-5 w-5 text-yellow-500" />
                <div>
                  <p className="text-white font-medium">Lembrete de Consulta</p>
                  <p className="text-sm text-white/50">Enviar lembrete antes da consulta</p>
                </div>
              </div>
              <Switch
                checked={settings.reminder_enabled}
                onCheckedChange={(checked) => handleInputChange("reminder_enabled", checked)}
              />
            </div>

            {settings.reminder_enabled && (
              <div className="ml-8 space-y-2">
                <Label className="text-white/80">Enviar lembrete</Label>
                <Select
                  value={String(settings.reminder_hours_before)}
                  onValueChange={(value) => handleInputChange("reminder_hours_before", parseInt(value))}
                >
                  <SelectTrigger className="w-48 bg-white/5 border-white/10 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1 hora antes</SelectItem>
                    <SelectItem value="2">2 horas antes</SelectItem>
                    <SelectItem value="6">6 horas antes</SelectItem>
                    <SelectItem value="12">12 horas antes</SelectItem>
                    <SelectItem value="24">24 horas antes</SelectItem>
                    <SelectItem value="48">48 horas antes</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button
          onClick={handleSave}
          disabled={isSaving}
          className="bg-primary hover:bg-primary/90"
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
    </div>
  );
};

export default WhatsAppIntegrationPage;
