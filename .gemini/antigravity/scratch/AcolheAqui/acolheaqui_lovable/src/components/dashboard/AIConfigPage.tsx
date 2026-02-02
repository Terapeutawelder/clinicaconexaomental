import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Brain, 
  Save, 
  Loader2, 
  CheckCircle, 
  AlertCircle,
  Key,
  Zap,
  Shield,
  ExternalLink,
  Sparkles,
  Bot
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

interface AIConfigPageProps {
  profileId: string;
}

interface AIConfig {
  openai_api_key: string;
  openai_preferred_model: string;
  anthropic_api_key: string;
  anthropic_preferred_model: string;
  google_api_key: string;
  google_preferred_model: string;
  preferred_ai_provider: string;
}

const openaiModels = [
  { value: "gpt-4-turbo-preview", label: "GPT-4 Turbo", description: "Mais avançado e rápido" },
  { value: "gpt-4", label: "GPT-4", description: "Alta precisão" },
  { value: "gpt-4o", label: "GPT-4o", description: "Otimizado para velocidade" },
  { value: "gpt-4o-mini", label: "GPT-4o Mini", description: "Econômico e eficiente" },
  { value: "gpt-3.5-turbo", label: "GPT-3.5 Turbo", description: "Rápido e econômico" },
];

const anthropicModels = [
  { value: "claude-3-opus-20240229", label: "Claude 3 Opus", description: "Mais poderoso" },
  { value: "claude-3-sonnet-20240229", label: "Claude 3 Sonnet", description: "Equilibrado" },
  { value: "claude-3-haiku-20240307", label: "Claude 3 Haiku", description: "Rápido e leve" },
];

const googleModels = [
  { value: "gemini-pro", label: "Gemini Pro", description: "Modelo principal" },
  { value: "gemini-pro-vision", label: "Gemini Pro Vision", description: "Com visão computacional" },
];

const AIConfigPage = ({ profileId }: AIConfigPageProps) => {
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState("openai");
  const [testingProvider, setTestingProvider] = useState<string | null>(null);
  
  const [config, setConfig] = useState<AIConfig>({
    openai_api_key: "",
    openai_preferred_model: "gpt-4-turbo-preview",
    anthropic_api_key: "",
    anthropic_preferred_model: "claude-3-sonnet-20240229",
    google_api_key: "",
    google_preferred_model: "gemini-pro",
    preferred_ai_provider: "lovable",
  });

  const [hasKeys, setHasKeys] = useState({
    openai: false,
    anthropic: false,
    google: false,
  });

  const [validations, setValidations] = useState<Record<string, boolean | null>>({
    openai: null,
    anthropic: null,
    google: null,
  });

  useEffect(() => {
    fetchConfig();
  }, [profileId]);

  const fetchConfig = async () => {
    try {
      const { data, error } = await supabase
        .from("ai_agent_config")
        .select("openai_api_key, openai_preferred_model, anthropic_api_key, anthropic_preferred_model, google_api_key, google_preferred_model, preferred_ai_provider")
        .eq("professional_id", profileId)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        setConfig({
          openai_api_key: data.openai_api_key ? "sk-••••••••••••••••••••••••••••••••" : "",
          openai_preferred_model: data.openai_preferred_model || "gpt-4-turbo-preview",
          anthropic_api_key: data.anthropic_api_key ? "sk-••••••••••••••••••••••••••••••••" : "",
          anthropic_preferred_model: data.anthropic_preferred_model || "claude-3-sonnet-20240229",
          google_api_key: data.google_api_key ? "AI••••••••••••••••••••••••••••••••" : "",
          google_preferred_model: data.google_preferred_model || "gemini-pro",
          preferred_ai_provider: data.preferred_ai_provider || "lovable",
        });
        setHasKeys({
          openai: !!data.openai_api_key,
          anthropic: !!data.anthropic_api_key,
          google: !!data.google_api_key,
        });
        setValidations({
          openai: data.openai_api_key ? true : null,
          anthropic: data.anthropic_api_key ? true : null,
          google: data.google_api_key ? true : null,
        });
      }
    } catch (error) {
      console.error("Error fetching AI config:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const testApiKey = async (provider: string) => {
    let apiKey = "";
    let testUrl = "";
    
    if (provider === "openai") {
      apiKey = config.openai_api_key;
      if (apiKey.startsWith("sk-••")) {
        toast.error("Digite uma nova chave API para testar");
        return;
      }
      testUrl = "https://api.openai.com/v1/models";
    } else if (provider === "anthropic") {
      apiKey = config.anthropic_api_key;
      if (apiKey.startsWith("sk-••")) {
        toast.error("Digite uma nova chave API para testar");
        return;
      }
      testUrl = "https://api.anthropic.com/v1/messages";
    } else if (provider === "google") {
      apiKey = config.google_api_key;
      if (apiKey.startsWith("AI••")) {
        toast.error("Digite uma nova chave API para testar");
        return;
      }
      testUrl = `https://generativelanguage.googleapis.com/v1/models?key=${apiKey}`;
    }

    if (!apiKey) {
      toast.error("Digite uma chave API para testar");
      return;
    }

    setTestingProvider(provider);
    setValidations(prev => ({ ...prev, [provider]: null }));

    try {
      let isValid = false;
      
      if (provider === "openai") {
        const response = await fetch(testUrl, {
          headers: { "Authorization": `Bearer ${apiKey}` },
        });
        isValid = response.ok;
      } else if (provider === "anthropic") {
        // Anthropic requires a different test approach
        const response = await fetch(testUrl, {
          method: "POST",
          headers: {
            "x-api-key": apiKey,
            "anthropic-version": "2023-06-01",
            "content-type": "application/json",
          },
          body: JSON.stringify({
            model: "claude-3-haiku-20240307",
            max_tokens: 1,
            messages: [{ role: "user", content: "test" }],
          }),
        });
        isValid = response.ok || response.status === 400; // 400 means API key is valid but request was invalid
      } else if (provider === "google") {
        const response = await fetch(testUrl);
        isValid = response.ok;
      }

      setValidations(prev => ({ ...prev, [provider]: isValid }));
      if (isValid) {
        toast.success("Chave API válida!");
      } else {
        toast.error("Chave API inválida");
      }
    } catch (error) {
      console.error("Error testing API key:", error);
      setValidations(prev => ({ ...prev, [provider]: false }));
      toast.error("Erro ao testar a chave API");
    } finally {
      setTestingProvider(null);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);

    try {
      const updateData: Record<string, string | null> = {
        preferred_ai_provider: config.preferred_ai_provider,
        openai_preferred_model: config.openai_preferred_model,
        anthropic_preferred_model: config.anthropic_preferred_model,
        google_preferred_model: config.google_preferred_model,
      };

      // Only update API keys if they've been changed
      if (config.openai_api_key && !config.openai_api_key.startsWith("sk-••")) {
        updateData.openai_api_key = config.openai_api_key;
      }
      if (config.anthropic_api_key && !config.anthropic_api_key.startsWith("sk-••")) {
        updateData.anthropic_api_key = config.anthropic_api_key;
      }
      if (config.google_api_key && !config.google_api_key.startsWith("AI••")) {
        updateData.google_api_key = config.google_api_key;
      }

      // Check if config exists
      const { data: existingConfig } = await supabase
        .from("ai_agent_config")
        .select("id")
        .eq("professional_id", profileId)
        .maybeSingle();

      if (existingConfig) {
        const { error } = await supabase
          .from("ai_agent_config")
          .update(updateData)
          .eq("professional_id", profileId);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("ai_agent_config")
          .insert({ 
            professional_id: profileId, 
            ...updateData 
          });
        if (error) throw error;
      }

      toast.success("Configurações salvas com sucesso!");
      fetchConfig();
    } catch (error) {
      console.error("Error saving config:", error);
      toast.error("Erro ao salvar configurações");
    } finally {
      setIsSaving(false);
    }
  };

  const handleRemoveKey = async (provider: string) => {
    setIsSaving(true);

    try {
      const updateData: Record<string, null> = {};
      if (provider === "openai") updateData.openai_api_key = null;
      if (provider === "anthropic") updateData.anthropic_api_key = null;
      if (provider === "google") updateData.google_api_key = null;

      const { error } = await supabase
        .from("ai_agent_config")
        .update(updateData)
        .eq("professional_id", profileId);

      if (error) throw error;

      setHasKeys(prev => ({ ...prev, [provider]: false }));
      setConfig(prev => ({
        ...prev,
        [`${provider}_api_key`]: "",
      }));
      setValidations(prev => ({ ...prev, [provider]: null }));
      toast.success("Chave API removida com sucesso!");
    } catch (error) {
      console.error("Error removing API key:", error);
      toast.error("Erro ao remover a chave API");
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

  const getProviderStatus = () => {
    if (config.preferred_ai_provider === "lovable") return { label: "Lovable AI", active: true };
    if (config.preferred_ai_provider === "openai" && hasKeys.openai) return { label: "OpenAI", active: true };
    if (config.preferred_ai_provider === "anthropic" && hasKeys.anthropic) return { label: "Anthropic", active: true };
    if (config.preferred_ai_provider === "google" && hasKeys.google) return { label: "Google AI", active: true };
    return { label: "Não configurado", active: false };
  };

  const providerStatus = getProviderStatus();

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Status Banner */}
      <div className={`rounded-xl p-4 flex items-center gap-3 ${
        providerStatus.active
          ? "bg-green-500/10 border border-green-500/20" 
          : "bg-muted/50 border border-border"
      }`}>
        {providerStatus.active ? (
          <>
            <CheckCircle className="h-5 w-5 text-green-500" />
            <div className="flex-1">
              <span className="text-green-400 font-medium">IA Configurada</span>
              <p className="text-green-400/70 text-sm">Usando: {providerStatus.label}</p>
            </div>
            <Badge className="bg-green-500/20 text-green-400 border-green-500/30">Ativa</Badge>
          </>
        ) : (
          <>
            <AlertCircle className="h-5 w-5 text-muted-foreground" />
            <div className="flex-1">
              <span className="text-foreground font-medium">IA não configurada</span>
              <p className="text-muted-foreground text-sm">Configure um provedor de IA</p>
            </div>
          </>
        )}
      </div>

      {/* Provider Selection Card */}
      <Card className="bg-card border-border">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Sparkles className="h-6 w-6 text-primary" />
            </div>
            <div>
              <CardTitle className="text-foreground">Provedor de IA</CardTitle>
              <CardDescription className="text-muted-foreground">
                Escolha qual provedor de IA será utilizado
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <RadioGroup 
            value={config.preferred_ai_provider} 
            onValueChange={(value) => setConfig(prev => ({ ...prev, preferred_ai_provider: value }))}
            className="grid md:grid-cols-2 gap-4"
          >
            <div className={`flex items-center space-x-3 p-4 rounded-xl border ${
              config.preferred_ai_provider === "lovable" 
                ? "border-primary bg-primary/5" 
                : "border-border bg-muted/30"
            }`}>
              <RadioGroupItem value="lovable" id="lovable" />
              <Label htmlFor="lovable" className="flex-1 cursor-pointer">
                <div className="flex items-center gap-2">
                  <Bot className="h-5 w-5 text-primary" />
                  <span className="font-medium">Lovable AI</span>
                  <Badge variant="secondary" className="ml-auto">Gratuito</Badge>
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  IA integrada, sem necessidade de API key
                </p>
              </Label>
            </div>

            <div className={`flex items-center space-x-3 p-4 rounded-xl border ${
              config.preferred_ai_provider === "openai" 
                ? "border-primary bg-primary/5" 
                : "border-border bg-muted/30"
            }`}>
              <RadioGroupItem value="openai" id="openai" disabled={!hasKeys.openai} />
              <Label htmlFor="openai" className="flex-1 cursor-pointer">
                <div className="flex items-center gap-2">
                  <Brain className="h-5 w-5" />
                  <span className="font-medium">OpenAI</span>
                  {hasKeys.openai ? (
                    <Badge className="ml-auto bg-green-500/20 text-green-400">Configurada</Badge>
                  ) : (
                    <Badge variant="outline" className="ml-auto">Requer API Key</Badge>
                  )}
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  GPT-4, GPT-3.5 e outros modelos
                </p>
              </Label>
            </div>

            <div className={`flex items-center space-x-3 p-4 rounded-xl border ${
              config.preferred_ai_provider === "anthropic" 
                ? "border-primary bg-primary/5" 
                : "border-border bg-muted/30"
            }`}>
              <RadioGroupItem value="anthropic" id="anthropic" disabled={!hasKeys.anthropic} />
              <Label htmlFor="anthropic" className="flex-1 cursor-pointer">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5" />
                  <span className="font-medium">Anthropic</span>
                  {hasKeys.anthropic ? (
                    <Badge className="ml-auto bg-green-500/20 text-green-400">Configurada</Badge>
                  ) : (
                    <Badge variant="outline" className="ml-auto">Requer API Key</Badge>
                  )}
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  Claude 3 Opus, Sonnet e Haiku
                </p>
              </Label>
            </div>

            <div className={`flex items-center space-x-3 p-4 rounded-xl border ${
              config.preferred_ai_provider === "google" 
                ? "border-primary bg-primary/5" 
                : "border-border bg-muted/30"
            }`}>
              <RadioGroupItem value="google" id="google" disabled={!hasKeys.google} />
              <Label htmlFor="google" className="flex-1 cursor-pointer">
                <div className="flex items-center gap-2">
                  <Zap className="h-5 w-5" />
                  <span className="font-medium">Google AI</span>
                  {hasKeys.google ? (
                    <Badge className="ml-auto bg-green-500/20 text-green-400">Configurada</Badge>
                  ) : (
                    <Badge variant="outline" className="ml-auto">Requer API Key</Badge>
                  )}
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  Gemini Pro e modelos Google
                </p>
              </Label>
            </div>
          </RadioGroup>
        </CardContent>
      </Card>

      {/* API Keys Configuration */}
      <Card className="bg-card border-border">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Key className="h-6 w-6 text-primary" />
            </div>
            <div>
              <CardTitle className="text-foreground">Chaves de API</CardTitle>
              <CardDescription className="text-muted-foreground">
                Configure as chaves de API dos provedores
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3 mb-6">
              <TabsTrigger value="openai" className="gap-2">
                <Brain className="h-4 w-4" />
                OpenAI
              </TabsTrigger>
              <TabsTrigger value="anthropic" className="gap-2">
                <Sparkles className="h-4 w-4" />
                Anthropic
              </TabsTrigger>
              <TabsTrigger value="google" className="gap-2">
                <Zap className="h-4 w-4" />
                Google AI
              </TabsTrigger>
            </TabsList>

            {/* OpenAI Tab */}
            <TabsContent value="openai" className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="openai-key">Chave API da OpenAI</Label>
                <div className="flex gap-2">
                  <Input
                    id="openai-key"
                    type="password"
                    value={config.openai_api_key}
                    onChange={(e) => {
                      setConfig(prev => ({ ...prev, openai_api_key: e.target.value }));
                      setValidations(prev => ({ ...prev, openai: null }));
                    }}
                    placeholder="sk-..."
                    className="flex-1"
                  />
                  <Button
                    variant="outline"
                    onClick={() => testApiKey("openai")}
                    disabled={testingProvider === "openai" || !config.openai_api_key}
                    className="gap-2"
                  >
                    {testingProvider === "openai" ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Zap className="h-4 w-4" />
                    )}
                    Testar
                  </Button>
                </div>
                {validations.openai === true && (
                  <p className="text-sm text-green-400 flex items-center gap-1">
                    <CheckCircle className="h-4 w-4" /> Chave válida
                  </p>
                )}
                {validations.openai === false && (
                  <p className="text-sm text-red-400 flex items-center gap-1">
                    <AlertCircle className="h-4 w-4" /> Chave inválida
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label>Modelo Preferido</Label>
                <Select
                  value={config.openai_preferred_model}
                  onValueChange={(value) => setConfig(prev => ({ ...prev, openai_preferred_model: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {openaiModels.map((model) => (
                      <SelectItem key={model.value} value={model.value}>
                        <div className="flex items-center gap-2">
                          <span>{model.label}</span>
                          <span className="text-xs text-muted-foreground">- {model.description}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="p-4 rounded-lg bg-muted/30 border border-border">
                <h4 className="text-foreground font-medium flex items-center gap-2 mb-2">
                  <Shield className="h-4 w-4 text-primary" />
                  Como obter sua chave API
                </h4>
                <ol className="text-sm text-muted-foreground space-y-1 list-decimal list-inside">
                  <li>Acesse <a href="https://platform.openai.com/api-keys" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline inline-flex items-center gap-1">platform.openai.com <ExternalLink className="h-3 w-3" /></a></li>
                  <li>Faça login e crie uma nova chave API</li>
                </ol>
              </div>

              {hasKeys.openai && (
                <Button
                  variant="outline"
                  onClick={() => handleRemoveKey("openai")}
                  disabled={isSaving}
                  className="text-destructive hover:bg-destructive/10"
                >
                  Remover Chave
                </Button>
              )}
            </TabsContent>

            {/* Anthropic Tab */}
            <TabsContent value="anthropic" className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="anthropic-key">Chave API da Anthropic</Label>
                <div className="flex gap-2">
                  <Input
                    id="anthropic-key"
                    type="password"
                    value={config.anthropic_api_key}
                    onChange={(e) => {
                      setConfig(prev => ({ ...prev, anthropic_api_key: e.target.value }));
                      setValidations(prev => ({ ...prev, anthropic: null }));
                    }}
                    placeholder="sk-ant-..."
                    className="flex-1"
                  />
                  <Button
                    variant="outline"
                    onClick={() => testApiKey("anthropic")}
                    disabled={testingProvider === "anthropic" || !config.anthropic_api_key}
                    className="gap-2"
                  >
                    {testingProvider === "anthropic" ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Zap className="h-4 w-4" />
                    )}
                    Testar
                  </Button>
                </div>
                {validations.anthropic === true && (
                  <p className="text-sm text-green-400 flex items-center gap-1">
                    <CheckCircle className="h-4 w-4" /> Chave válida
                  </p>
                )}
                {validations.anthropic === false && (
                  <p className="text-sm text-red-400 flex items-center gap-1">
                    <AlertCircle className="h-4 w-4" /> Chave inválida
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label>Modelo Preferido</Label>
                <Select
                  value={config.anthropic_preferred_model}
                  onValueChange={(value) => setConfig(prev => ({ ...prev, anthropic_preferred_model: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {anthropicModels.map((model) => (
                      <SelectItem key={model.value} value={model.value}>
                        <div className="flex items-center gap-2">
                          <span>{model.label}</span>
                          <span className="text-xs text-muted-foreground">- {model.description}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="p-4 rounded-lg bg-muted/30 border border-border">
                <h4 className="text-foreground font-medium flex items-center gap-2 mb-2">
                  <Shield className="h-4 w-4 text-primary" />
                  Como obter sua chave API
                </h4>
                <ol className="text-sm text-muted-foreground space-y-1 list-decimal list-inside">
                  <li>Acesse <a href="https://console.anthropic.com/settings/keys" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline inline-flex items-center gap-1">console.anthropic.com <ExternalLink className="h-3 w-3" /></a></li>
                  <li>Faça login e crie uma nova chave API</li>
                </ol>
              </div>

              {hasKeys.anthropic && (
                <Button
                  variant="outline"
                  onClick={() => handleRemoveKey("anthropic")}
                  disabled={isSaving}
                  className="text-destructive hover:bg-destructive/10"
                >
                  Remover Chave
                </Button>
              )}
            </TabsContent>

            {/* Google AI Tab */}
            <TabsContent value="google" className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="google-key">Chave API do Google AI</Label>
                <div className="flex gap-2">
                  <Input
                    id="google-key"
                    type="password"
                    value={config.google_api_key}
                    onChange={(e) => {
                      setConfig(prev => ({ ...prev, google_api_key: e.target.value }));
                      setValidations(prev => ({ ...prev, google: null }));
                    }}
                    placeholder="AIza..."
                    className="flex-1"
                  />
                  <Button
                    variant="outline"
                    onClick={() => testApiKey("google")}
                    disabled={testingProvider === "google" || !config.google_api_key}
                    className="gap-2"
                  >
                    {testingProvider === "google" ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Zap className="h-4 w-4" />
                    )}
                    Testar
                  </Button>
                </div>
                {validations.google === true && (
                  <p className="text-sm text-green-400 flex items-center gap-1">
                    <CheckCircle className="h-4 w-4" /> Chave válida
                  </p>
                )}
                {validations.google === false && (
                  <p className="text-sm text-red-400 flex items-center gap-1">
                    <AlertCircle className="h-4 w-4" /> Chave inválida
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label>Modelo Preferido</Label>
                <Select
                  value={config.google_preferred_model}
                  onValueChange={(value) => setConfig(prev => ({ ...prev, google_preferred_model: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {googleModels.map((model) => (
                      <SelectItem key={model.value} value={model.value}>
                        <div className="flex items-center gap-2">
                          <span>{model.label}</span>
                          <span className="text-xs text-muted-foreground">- {model.description}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="p-4 rounded-lg bg-muted/30 border border-border">
                <h4 className="text-foreground font-medium flex items-center gap-2 mb-2">
                  <Shield className="h-4 w-4 text-primary" />
                  Como obter sua chave API
                </h4>
                <ol className="text-sm text-muted-foreground space-y-1 list-decimal list-inside">
                  <li>Acesse <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline inline-flex items-center gap-1">aistudio.google.com <ExternalLink className="h-3 w-3" /></a></li>
                  <li>Faça login e crie uma nova chave API</li>
                </ol>
              </div>

              {hasKeys.google && (
                <Button
                  variant="outline"
                  onClick={() => handleRemoveKey("google")}
                  disabled={isSaving}
                  className="text-destructive hover:bg-destructive/10"
                >
                  Remover Chave
                </Button>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button
          onClick={handleSave}
          disabled={isSaving}
          className="bg-primary hover:bg-primary/90 gap-2"
        >
          {isSaving ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Salvando...
            </>
          ) : (
            <>
              <Save className="h-4 w-4" />
              Salvar Configurações
            </>
          )}
        </Button>
      </div>
    </div>
  );
};

export default AIConfigPage;
