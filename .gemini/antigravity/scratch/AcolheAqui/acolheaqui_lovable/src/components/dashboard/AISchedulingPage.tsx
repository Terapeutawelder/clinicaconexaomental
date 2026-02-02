import { useState, useEffect } from "react";
import { Bot, Settings2, Save, Info, CheckCircle2, Loader2, Power, PowerOff, Sparkles, Calendar, MessageCircle, Zap, Shield, Key } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface AISchedulingPageProps {
  profileId: string;
}

interface AIAgentConfig {
  id?: string;
  professional_id: string;
  is_active: boolean;
  n8n_webhook_url: string;
  n8n_api_key: string;
  agent_name: string;
  agent_greeting: string;
  agent_instructions: string;
  auto_confirm_appointments: boolean;
  send_confirmation_message: boolean;
  working_hours_only: boolean;
  openai_api_key: string;
}

const defaultConfig: Omit<AIAgentConfig, 'professional_id'> = {
  is_active: false,
  n8n_webhook_url: "",
  n8n_api_key: "",
  agent_name: "Assistente Virtual",
  agent_greeting: "Olá! Sou o assistente virtual. Como posso ajudar você a agendar uma consulta?",
  agent_instructions: "Seja educado e profissional. Ajude os clientes a encontrar o melhor horário disponível para suas consultas. Sempre confirme os dados antes de finalizar o agendamento.",
  auto_confirm_appointments: false,
  send_confirmation_message: true,
  working_hours_only: true,
  openai_api_key: "",
};

const AISchedulingPage = ({ profileId }: AISchedulingPageProps) => {
  const [config, setConfig] = useState<AIAgentConfig>({ ...defaultConfig, professional_id: profileId });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);

  useEffect(() => {
    fetchConfig();
  }, [profileId]);

  const fetchConfig = async () => {
    try {
      const { data, error } = await supabase
        .from("ai_agent_config" as any)
        .select("*")
        .eq("professional_id", profileId)
        .single();

      if (error && error.code !== "PGRST116") {
        console.error("Erro ao buscar configuração:", error);
        toast.error("Erro ao carregar configuração");
      }

      if (data) {
        setConfig({ ...data as unknown as AIAgentConfig, openai_api_key: (data as any).openai_api_key || "" });
      }
    } catch (error) {
      console.error("Erro:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const configData = {
        ...config,
        professional_id: profileId,
        updated_at: new Date().toISOString(),
      };

      if (config.id) {
        const { error } = await supabase
          .from("ai_agent_config" as any)
          .update(configData)
          .eq("id", config.id);

        if (error) throw error;
      } else {
        const { data, error } = await supabase
          .from("ai_agent_config" as any)
          .insert(configData)
          .select()
          .single();

        if (error) throw error;
        if (data) setConfig(data as unknown as AIAgentConfig);
      }

      toast.success("Configuração salva com sucesso!");
    } catch (error) {
      console.error("Erro ao salvar:", error);
      toast.error("Erro ao salvar configuração");
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggleActive = async () => {
    const newActiveState = !config.is_active;
    setConfig({ ...config, is_active: newActiveState });
    
    // Auto-save when toggling
    setIsSaving(true);
    try {
      const configData = {
        ...config,
        is_active: newActiveState,
        professional_id: profileId,
        updated_at: new Date().toISOString(),
      };

      if (config.id) {
        const { error } = await supabase
          .from("ai_agent_config" as any)
          .update(configData)
          .eq("id", config.id);

        if (error) throw error;
      } else {
        const { data, error } = await supabase
          .from("ai_agent_config" as any)
          .insert(configData)
          .select()
          .single();

        if (error) throw error;
        if (data) setConfig({ ...data as unknown as AIAgentConfig, is_active: newActiveState });
      }

      toast.success(newActiveState ? "Agente IA ativado!" : "Agente IA desativado");
    } catch (error) {
      console.error("Erro ao salvar:", error);
      toast.error("Erro ao alterar status");
      setConfig({ ...config, is_active: !newActiveState }); // Revert on error
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center">
            <Bot className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Agente IA de Agendamento</h1>
            <p className="text-muted-foreground text-sm">
              Atendimento automatizado via WhatsApp
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Badge variant="secondary" className="gap-1">
            <Zap className="w-3 h-3" />
            Premium
          </Badge>
        </div>
      </div>

      {/* Main Activation Card */}
      <Card className={`border-2 transition-colors ${config.is_active ? 'border-green-500/50 bg-green-500/5' : 'border-muted'}`}>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className={`w-16 h-16 rounded-2xl flex items-center justify-center transition-colors ${config.is_active ? 'bg-green-500/20' : 'bg-muted'}`}>
                {config.is_active ? (
                  <Power className="w-8 h-8 text-green-500" />
                ) : (
                  <PowerOff className="w-8 h-8 text-muted-foreground" />
                )}
              </div>
              <div>
                <h2 className="text-xl font-semibold">
                  {config.is_active ? "Agente Ativo" : "Agente Desativado"}
                </h2>
                <p className="text-muted-foreground mt-1">
                  {config.is_active 
                    ? "O agente está respondendo automaticamente aos seus clientes via WhatsApp."
                    : "Ative o agente para começar a receber agendamentos automaticamente."}
                </p>
                {config.is_active && (
                  <div className="flex items-center gap-2 mt-2">
                    <CheckCircle2 className="w-4 h-4 text-green-500" />
                    <span className="text-sm text-green-600 dark:text-green-400">
                      Integrado com seu WhatsApp
                    </span>
                  </div>
                )}
              </div>
            </div>
            
            <Button 
              size="lg"
              variant={config.is_active ? "outline" : "default"}
              onClick={handleToggleActive}
              disabled={isSaving}
              className={`min-w-[140px] ${config.is_active ? 'border-red-500/50 text-red-500 hover:bg-red-500/10' : ''}`}
            >
              {isSaving ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : config.is_active ? (
                <PowerOff className="w-4 h-4 mr-2" />
              ) : (
                <Power className="w-4 h-4 mr-2" />
              )}
              {config.is_active ? "Desativar" : "Ativar Agente"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Features Grid */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="bg-gradient-to-br from-blue-500/10 to-transparent border-blue-500/20">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
                <MessageCircle className="w-5 h-5 text-blue-500" />
              </div>
              <div>
                <h3 className="font-medium">WhatsApp Integrado</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Responde automaticamente às mensagens dos clientes
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-500/10 to-transparent border-purple-500/20">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center">
                <Calendar className="w-5 h-5 text-purple-500" />
              </div>
              <div>
                <h3 className="font-medium">Agenda Sincronizada</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Verifica disponibilidade em tempo real
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-500/10 to-transparent border-green-500/20">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-green-500" />
              </div>
              <div>
                <h3 className="font-medium">IA Personalizada</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Responde em seu nome com seu estilo
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Configuration Tabs */}
      <Tabs defaultValue="agent" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="agent" className="gap-2">
            <Bot className="w-4 h-4" />
            Personalização
          </TabsTrigger>
          <TabsTrigger value="ai-config" className="gap-2">
            <Key className="w-4 h-4" />
            Configuração IA
          </TabsTrigger>
          <TabsTrigger value="settings" className="gap-2">
            <Settings2 className="w-4 h-4" />
            Opções
          </TabsTrigger>
        </TabsList>

        {/* Agent Personalization Tab */}
        <TabsContent value="agent" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-primary" />
                Personalize seu Agente
              </CardTitle>
              <CardDescription>
                Configure como o agente se apresenta e interage com seus clientes
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="agent_name">Nome do Agente</Label>
                <Input
                  id="agent_name"
                  placeholder="Ex: Maria, Assistente do Dr. João"
                  value={config.agent_name}
                  onChange={(e) => setConfig({ ...config, agent_name: e.target.value })}
                />
                <p className="text-xs text-muted-foreground">
                  O nome que o agente usará para se apresentar
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="agent_greeting">Mensagem de Saudação</Label>
                <Textarea
                  id="agent_greeting"
                  placeholder="Ex: Olá! Sou a assistente virtual da Dra. Ana. Como posso ajudar você a agendar uma consulta?"
                  value={config.agent_greeting}
                  onChange={(e) => setConfig({ ...config, agent_greeting: e.target.value })}
                  rows={3}
                />
                <p className="text-xs text-muted-foreground">
                  Primeira mensagem enviada ao cliente
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="agent_instructions">Instruções Personalizadas</Label>
                <Textarea
                  id="agent_instructions"
                  placeholder="Ex: Sempre pergunte se é primeira consulta. Mencione que as consultas são online. Sugira horários da manhã primeiro."
                  value={config.agent_instructions}
                  onChange={(e) => setConfig({ ...config, agent_instructions: e.target.value })}
                  rows={4}
                />
                <p className="text-xs text-muted-foreground">
                  Instruções específicas sobre como o agente deve se comportar
                </p>
              </div>

              <Button onClick={handleSave} disabled={isSaving} className="w-full sm:w-auto">
                {isSaving ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Salvando...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Salvar Alterações
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* AI Configuration Tab */}
        <TabsContent value="ai-config" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Key className="w-5 h-5 text-primary" />
                Configuração da IA
              </CardTitle>
              <CardDescription>
                Configure sua chave de API para usar um modelo de IA personalizado
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription>
                  Se você não configurar uma chave OpenAI, o sistema usará a IA padrão da plataforma (Lovable AI).
                </AlertDescription>
              </Alert>

              <div className="space-y-2">
                <Label htmlFor="openai_api_key">Chave da API OpenAI (Opcional)</Label>
                <Input
                  id="openai_api_key"
                  type="password"
                  placeholder="sk-..."
                  value={config.openai_api_key}
                  onChange={(e) => setConfig({ ...config, openai_api_key: e.target.value })}
                />
                <p className="text-xs text-muted-foreground">
                  Sua chave da OpenAI para usar modelos GPT-4 ou GPT-3.5. Obtenha em{" "}
                  <a href="https://platform.openai.com/api-keys" target="_blank" rel="noopener noreferrer" className="text-primary underline">
                    platform.openai.com
                  </a>
                </p>
              </div>

              <Separator />

              <div className="p-4 rounded-lg bg-muted/50">
                <h4 className="font-medium mb-2">Modelos Suportados</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• <strong>Com chave própria:</strong> GPT-4, GPT-4 Turbo, GPT-3.5 Turbo</li>
                  <li>• <strong>Sem chave (padrão):</strong> Lovable AI (Gemini)</li>
                </ul>
              </div>

              <Button onClick={handleSave} disabled={isSaving} className="w-full sm:w-auto">
                {isSaving ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Salvando...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Salvar Configuração
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Settings Tab */}
        <TabsContent value="settings" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings2 className="w-5 h-5 text-primary" />
                Configurações do Agente
              </CardTitle>
              <CardDescription>
                Defina como o agente processa os agendamentos
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
                <div className="space-y-0.5">
                  <Label className="text-base">Confirmar automaticamente</Label>
                  <p className="text-sm text-muted-foreground">
                    Confirma agendamentos sem precisar de sua aprovação
                  </p>
                </div>
                <Switch
                  checked={config.auto_confirm_appointments}
                  onCheckedChange={(checked) => setConfig({ ...config, auto_confirm_appointments: checked })}
                />
              </div>

              <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
                <div className="space-y-0.5">
                  <Label className="text-base">Enviar confirmação por WhatsApp</Label>
                  <p className="text-sm text-muted-foreground">
                    Envia mensagem de confirmação ao cliente após agendar
                  </p>
                </div>
                <Switch
                  checked={config.send_confirmation_message}
                  onCheckedChange={(checked) => setConfig({ ...config, send_confirmation_message: checked })}
                />
              </div>

              <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
                <div className="space-y-0.5">
                  <Label className="text-base">Apenas horário comercial</Label>
                  <p className="text-sm text-muted-foreground">
                    O agente só responde durante seus horários de atendimento
                  </p>
                </div>
                <Switch
                  checked={config.working_hours_only}
                  onCheckedChange={(checked) => setConfig({ ...config, working_hours_only: checked })}
                />
              </div>

              <Separator />

              <Button onClick={handleSave} disabled={isSaving} className="w-full sm:w-auto">
                {isSaving ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Salvando...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Salvar Configurações
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* How it works Section */}
      <Collapsible open={helpOpen} onOpenChange={setHelpOpen}>
        <Card className="border-primary/20 bg-primary/5">
          <CollapsibleTrigger asChild>
            <CardHeader className="cursor-pointer hover:bg-primary/10 transition-colors rounded-t-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Info className="w-5 h-5 text-primary" />
                  <CardTitle className="text-base">Como funciona?</CardTitle>
                </div>
                <Button variant="ghost" size="sm">
                  {helpOpen ? "Fechar" : "Saiba mais"}
                </Button>
              </div>
            </CardHeader>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <CardContent className="space-y-4 pt-0">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="flex items-start gap-3 p-4 rounded-lg bg-background/50">
                  <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                    <span className="text-sm font-bold text-primary">1</span>
                  </div>
                  <div>
                    <h4 className="font-medium text-foreground">Cliente envia mensagem</h4>
                    <p className="text-sm text-muted-foreground mt-1">
                      O cliente entra em contato pelo seu WhatsApp configurado na plataforma.
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3 p-4 rounded-lg bg-background/50">
                  <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                    <span className="text-sm font-bold text-primary">2</span>
                  </div>
                  <div>
                    <h4 className="font-medium text-foreground">IA identifica você</h4>
                    <p className="text-sm text-muted-foreground mt-1">
                      O sistema identifica automaticamente que a mensagem é para você.
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3 p-4 rounded-lg bg-background/50">
                  <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                    <span className="text-sm font-bold text-primary">3</span>
                  </div>
                  <div>
                    <h4 className="font-medium text-foreground">Busca seus dados</h4>
                    <p className="text-sm text-muted-foreground mt-1">
                      Consulta seus horários, serviços e configurações em tempo real.
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3 p-4 rounded-lg bg-background/50">
                  <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                    <span className="text-sm font-bold text-primary">4</span>
                  </div>
                  <div>
                    <h4 className="font-medium text-foreground">Agenda automaticamente</h4>
                    <p className="text-sm text-muted-foreground mt-1">
                      Cria o agendamento em sua agenda e notifica você e o cliente.
                    </p>
                  </div>
                </div>
              </div>

              <Alert>
                <Shield className="h-4 w-4" />
                <AlertDescription>
                  <strong>Pré-requisito:</strong> Configure seu WhatsApp na seção "Integrações → WhatsApp" para que o agente possa receber e responder mensagens.
                </AlertDescription>
              </Alert>
            </CardContent>
          </CollapsibleContent>
        </Card>
      </Collapsible>
    </div>
  );
};

export default AISchedulingPage;
