import { useState, useEffect, useCallback } from "react";
import { 
  Calendar, 
  Video, 
  RefreshCw,
  Unlink,
  Clock,
  Users,
  Shield,
  Sparkles,
  CheckCircle,
  AlertCircle,
  ExternalLink
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useSearchParams } from "react-router-dom";

interface GoogleCalendarPageProps {
  profileId: string;
}

interface GoogleSettings {
  id?: string;
  is_connected: boolean;
  google_email: string | null;
  sync_enabled: boolean;
  auto_create_meet: boolean;
  sync_direction: 'one_way' | 'two_way';
  last_sync_at: string | null;
}

const GoogleCalendarPage = ({ profileId }: GoogleCalendarPageProps) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [settings, setSettings] = useState<GoogleSettings>({
    is_connected: false,
    google_email: null,
    sync_enabled: true,
    auto_create_meet: true,
    sync_direction: 'two_way',
    last_sync_at: null,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const fetchSettings = useCallback(async () => {
    if (!profileId) return;
    
    try {
      const { data, error } = await supabase
        .from('google_calendar_settings')
        .select('*')
        .eq('professional_id', profileId)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        setSettings({
          id: data.id,
          is_connected: data.is_connected || false,
          google_email: data.google_email,
          sync_enabled: data.sync_enabled ?? true,
          auto_create_meet: data.auto_create_meet ?? true,
          sync_direction: (data.sync_direction as 'one_way' | 'two_way') || 'two_way',
          last_sync_at: data.last_sync_at,
        });
      }
    } catch (error) {
      console.error("Error fetching Google settings:", error);
    } finally {
      setIsLoading(false);
    }
  }, [profileId]);

  // Handle OAuth callback
  const handleOAuthCallback = useCallback(async () => {
    const code = searchParams.get('code');
    const state = searchParams.get('state');
    
    if (code && state === profileId) {
      console.log('Processing OAuth callback...');
      setIsConnecting(true);
      
      try {
        // Use production URL for Google OAuth redirect
        const redirectUri = 'https://www.acolheaqui.com.br/dashboard?tab=google';
        
        const { data, error } = await supabase.functions.invoke('google-calendar-auth', {
          body: {
            action: 'exchange-code',
            code,
            redirectUri,
            professionalId: profileId,
          },
        });

        if (error) throw error;

        if (data.success) {
          toast.success(`Google Calendar conectado! (${data.email})`);
          await fetchSettings();
        }
      } catch (error: any) {
        console.error('OAuth callback error:', error);
        toast.error('Erro ao conectar Google Calendar');
      } finally {
        setIsConnecting(false);
        // Clean up URL
        searchParams.delete('code');
        searchParams.delete('state');
        searchParams.delete('scope');
        setSearchParams(searchParams, { replace: true });
      }
    }
  }, [searchParams, profileId, setSearchParams, fetchSettings]);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  useEffect(() => {
    handleOAuthCallback();
  }, [handleOAuthCallback]);

  const handleConnect = async () => {
    setIsConnecting(true);
    
    try {
      // Use production URL for Google OAuth redirect
      const redirectUri = 'https://www.acolheaqui.com.br/dashboard?tab=google';
      
      const { data, error } = await supabase.functions.invoke('google-calendar-auth', {
        body: {
          action: 'get-auth-url',
          redirectUri,
          professionalId: profileId,
        },
      });

      if (error) throw error;

      // Redirect to Google OAuth
      window.location.href = data.authUrl;
    } catch (error: any) {
      console.error("Error connecting to Google:", error);
      toast.error("Erro ao conectar com Google. Tente novamente.");
      setIsConnecting(false);
    }
  };

  const handleDisconnect = async () => {
    try {
      const { error } = await supabase.functions.invoke('google-calendar-auth', {
        body: {
          action: 'disconnect',
          professionalId: profileId,
        },
      });

      if (error) throw error;

      setSettings({
        ...settings,
        is_connected: false,
        google_email: null,
        last_sync_at: null,
      });
      toast.success("Conta Google desconectada com sucesso");
    } catch (error) {
      toast.error("Erro ao desconectar conta Google");
    }
  };

  const handleSync = async () => {
    setIsSyncing(true);
    try {
      const { data, error } = await supabase.functions.invoke('google-calendar-sync', {
        body: {
          action: 'sync-all',
          professionalId: profileId,
        },
      });

      if (error) throw error;

      setSettings({
        ...settings,
        last_sync_at: new Date().toISOString(),
      });
      
      toast.success(`Sincronização concluída! ${data.synced} agendamentos sincronizados.`);
    } catch (error: any) {
      console.error('Sync error:', error);
      toast.error("Erro ao sincronizar agenda");
    } finally {
      setIsSyncing(false);
    }
  };

  const updateSettings = async (key: keyof GoogleSettings, value: any) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
    
    // Save to database
    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('google_calendar_settings')
        .update({
          [key]: value,
          updated_at: new Date().toISOString(),
        })
        .eq('professional_id', profileId);

      if (error) throw error;
    } catch (error) {
      console.error('Error saving settings:', error);
      toast.error('Erro ao salvar configuração');
      // Revert
      setSettings(settings);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  const features = [
    {
      icon: Calendar,
      title: "Sincronização Automática",
      description: "Agendamentos sincronizam automaticamente com seu Google Agenda"
    },
    {
      icon: Video,
      title: "Google Meet Automático",
      description: "Links de reunião criados automaticamente para cada consulta"
    },
    {
      icon: Clock,
      title: "Evite Conflitos",
      description: "Seus horários ocupados são bloqueados automaticamente"
    },
    {
      icon: Users,
      title: "Convites Automáticos",
      description: "Pacientes recebem convites do Google Agenda automaticamente"
    }
  ];

  return (
    <Card className="border-border/50 overflow-hidden">
      {/* Header with Large Icon */}
      <div className="bg-gradient-to-r from-primary/10 to-primary/5 p-6 border-b border-border/50">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-white flex items-center justify-center shadow-sm">
              <svg viewBox="0 0 24 24" className="w-9 h-9">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-bold text-foreground">Google Agenda & Meet</h2>
              <p className="text-sm text-muted-foreground mt-0.5">
                Sincronize sua agenda e crie reuniões automaticamente
              </p>
            </div>
          </div>
          
          {settings.is_connected && (
            <Button
              variant="outline"
              onClick={handleSync}
              disabled={isSyncing}
              className="gap-2"
            >
              <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
              {isSyncing ? 'Sincronizando...' : 'Sincronizar'}
            </Button>
          )}
        </div>
      </div>

      <CardContent className="p-6 space-y-6">
        {/* Connection Status Card */}
        <Card className="border-border/50 bg-card">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-lg">
              {settings.is_connected ? (
                <>
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  Conta Conectada
                </>
              ) : (
                <>
                  <AlertCircle className="w-5 h-5 text-yellow-500" />
                  Não Conectado
                </>
              )}
            </CardTitle>
            <CardDescription>
              {settings.is_connected 
                ? `Conectado como ${settings.google_email}`
                : 'Conecte sua conta Google para sincronizar sua agenda'
              }
            </CardDescription>
          </CardHeader>
          <CardContent>
            {settings.is_connected ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 rounded-xl bg-green-500/10 border border-green-500/20">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shadow-sm">
                      <img 
                        src="https://www.gstatic.com/images/branding/product/1x/calendar_48dp.png" 
                        alt="Google Calendar" 
                        className="w-6 h-6"
                      />
                    </div>
                    <div>
                      <p className="font-medium text-foreground">{settings.google_email}</p>
                      <p className="text-sm text-muted-foreground">
                        {settings.last_sync_at 
                          ? `Última sync: ${new Date(settings.last_sync_at).toLocaleString('pt-BR')}`
                          : 'Aguardando primeira sincronização'
                        }
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleDisconnect}
                    className="gap-2 text-destructive hover:text-destructive hover:bg-destructive/10"
                  >
                    <Unlink className="w-4 h-4" />
                    Desconectar
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <Button
                  onClick={handleConnect}
                  disabled={isConnecting}
                  className="w-full gap-3 h-14 bg-white hover:bg-gray-50 text-gray-700 border border-gray-300"
                >
                  {isConnecting ? (
                    <>
                      <RefreshCw className="w-5 h-5 animate-spin" />
                      Conectando...
                    </>
                  ) : (
                    <>
                      <img 
                        src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" 
                        alt="Google" 
                        className="w-5 h-5"
                      />
                      Conectar com Google
                    </>
                  )}
                </Button>
                
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <ExternalLink className="w-4 h-4" />
                  <span>
                    Você será redirecionado para autorizar o acesso ao Google Calendar
                  </span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {features.map((feature, index) => (
            <Card key={index} className="border-border/50 bg-card hover:border-primary/30 transition-colors">
              <CardContent className="p-4">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                    <feature.icon className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground mb-1">{feature.title}</h3>
                    <p className="text-sm text-muted-foreground">{feature.description}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Settings */}
        {settings.is_connected && (
          <Card className="border-border/50 bg-card">
            <CardHeader>
              <CardTitle className="text-lg">Configurações de Sincronização</CardTitle>
              <CardDescription>
                Personalize como a integração funciona
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Sync Enabled */}
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-sm font-medium">Sincronização Ativa</Label>
                  <p className="text-sm text-muted-foreground">
                    Sincronizar agendamentos automaticamente
                  </p>
                </div>
                <Switch
                  checked={settings.sync_enabled}
                  onCheckedChange={(checked) => updateSettings('sync_enabled', checked)}
                  disabled={isSaving}
                />
              </div>

              {/* Auto Meet */}
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-sm font-medium flex items-center gap-2">
                    Criar Google Meet Automático
                    <Video className="w-4 h-4 text-blue-500" />
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Gerar link de reunião para cada agendamento
                  </p>
                </div>
                <Switch
                  checked={settings.auto_create_meet}
                  onCheckedChange={(checked) => updateSettings('auto_create_meet', checked)}
                  disabled={isSaving}
                />
              </div>

              {/* Sync Direction */}
              <div className="space-y-3">
                <Label className="text-sm font-medium">Direção da Sincronização</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <button
                    onClick={() => updateSettings('sync_direction', 'one_way')}
                    disabled={isSaving}
                    className={`p-4 rounded-xl border transition-all text-left ${
                      settings.sync_direction === 'one_way'
                        ? 'border-primary bg-primary/10'
                        : 'border-border/50 hover:border-primary/30'
                    }`}
                  >
                    <p className="font-medium text-foreground">AcolheAqui → Google</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Apenas exporta para o Google Agenda
                    </p>
                  </button>
                  <button
                    onClick={() => updateSettings('sync_direction', 'two_way')}
                    disabled={isSaving}
                    className={`p-4 rounded-xl border transition-all text-left ${
                      settings.sync_direction === 'two_way'
                        ? 'border-primary bg-primary/10'
                        : 'border-border/50 hover:border-primary/30'
                    }`}
                  >
                    <p className="font-medium text-foreground flex items-center gap-2">
                      Bidirecional
                      <Sparkles className="w-4 h-4 text-primary" />
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Sincroniza nos dois sentidos
                    </p>
                  </button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Info Card */}
        <Card className="border-primary/20 bg-primary/5">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <Shield className="w-5 h-5 text-primary mt-0.5" />
              <div>
                <p className="font-medium text-foreground">Privacidade e Segurança</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Utilizamos OAuth 2.0 do Google para autenticação segura. Não armazenamos suas credenciais 
                  do Google. Você pode revogar o acesso a qualquer momento nas configurações da sua conta Google.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </CardContent>
    </Card>
  );
};

export default GoogleCalendarPage;
