import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Brain, 
  Save, 
  Loader2, 
  CheckCircle, 
  AlertCircle,
  Key,
  Zap,
  Shield,
  ExternalLink
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface OpenAIConfigPageProps {
  profileId: string;
}

const OpenAIConfigPage = ({ profileId }: OpenAIConfigPageProps) => {
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [apiKey, setApiKey] = useState("");
  const [hasKey, setHasKey] = useState(false);
  const [isValid, setIsValid] = useState<boolean | null>(null);

  useEffect(() => {
    fetchConfig();
  }, [profileId]);

  const fetchConfig = async () => {
    try {
      const { data, error } = await supabase
        .from("ai_agent_config")
        .select("openai_api_key")
        .eq("professional_id", profileId)
        .maybeSingle();

      if (error) throw error;

      if (data?.openai_api_key) {
        setHasKey(true);
        setApiKey("sk-••••••••••••••••••••••••••••••••");
        setIsValid(true);
      }
    } catch (error) {
      console.error("Error fetching OpenAI config:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const testApiKey = async () => {
    if (!apiKey || apiKey.startsWith("sk-••")) {
      toast.error("Digite uma nova chave API para testar");
      return;
    }

    setIsTesting(true);
    setIsValid(null);

    try {
      const response = await fetch("https://api.openai.com/v1/models", {
        headers: {
          "Authorization": `Bearer ${apiKey}`,
        },
      });

      if (response.ok) {
        setIsValid(true);
        toast.success("Chave API válida!");
      } else {
        setIsValid(false);
        toast.error("Chave API inválida");
      }
    } catch (error) {
      console.error("Error testing API key:", error);
      setIsValid(false);
      toast.error("Erro ao testar a chave API");
    } finally {
      setIsTesting(false);
    }
  };

  const handleSave = async () => {
    if (!apiKey || apiKey.startsWith("sk-••")) {
      toast.error("Digite uma nova chave API para salvar");
      return;
    }

    setIsSaving(true);

    try {
      // Check if config exists
      const { data: existingConfig } = await supabase
        .from("ai_agent_config")
        .select("id")
        .eq("professional_id", profileId)
        .maybeSingle();

      if (existingConfig) {
        const { error } = await supabase
          .from("ai_agent_config")
          .update({ openai_api_key: apiKey })
          .eq("professional_id", profileId);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("ai_agent_config")
          .insert({ 
            professional_id: profileId, 
            openai_api_key: apiKey 
          });
        if (error) throw error;
      }

      setHasKey(true);
      setApiKey("sk-••••••••••••••••••••••••••••••••");
      setIsValid(true);
      toast.success("Chave API salva com sucesso!");
    } catch (error) {
      console.error("Error saving API key:", error);
      toast.error("Erro ao salvar a chave API");
    } finally {
      setIsSaving(false);
    }
  };

  const handleRemoveKey = async () => {
    setIsSaving(true);

    try {
      const { error } = await supabase
        .from("ai_agent_config")
        .update({ openai_api_key: null })
        .eq("professional_id", profileId);

      if (error) throw error;

      setHasKey(false);
      setApiKey("");
      setIsValid(null);
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

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Status Banner */}
      <div className={`rounded-xl p-4 flex items-center gap-3 ${
        hasKey && isValid
          ? "bg-green-500/10 border border-green-500/20" 
          : "bg-muted/50 border border-border"
      }`}>
        {hasKey && isValid ? (
          <>
            <CheckCircle className="h-5 w-5 text-green-500" />
            <div className="flex-1">
              <span className="text-green-400 font-medium">OpenAI Conectada</span>
              <p className="text-green-400/70 text-sm">Sua chave API está configurada e funcionando</p>
            </div>
            <Badge className="bg-green-500/20 text-green-400 border-green-500/30">Ativa</Badge>
          </>
        ) : (
          <>
            <AlertCircle className="h-5 w-5 text-muted-foreground" />
            <div className="flex-1">
              <span className="text-foreground font-medium">OpenAI não configurada</span>
              <p className="text-muted-foreground text-sm">Configure sua chave API para usar modelos personalizados</p>
            </div>
          </>
        )}
      </div>

      {/* Main Config Card */}
      <Card className="bg-card border-border">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Brain className="h-6 w-6 text-primary" />
            </div>
            <div>
              <CardTitle className="text-foreground">Configuração da OpenAI</CardTitle>
              <CardDescription className="text-muted-foreground">
                Configure sua chave API para usar modelos GPT personalizados
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Info Box */}
          <div className="p-4 rounded-lg bg-blue-500/10 border border-blue-500/20">
            <p className="text-sm text-blue-400">
              <strong>Por que configurar sua própria chave?</strong>
              <br />
              Com sua própria chave API da OpenAI, você tem acesso aos modelos GPT-4 mais recentes 
              e maior controle sobre custos e limites de uso.
            </p>
          </div>

          {/* API Key Input */}
          <div className="space-y-2">
            <Label htmlFor="api-key" className="text-foreground flex items-center gap-2">
              <Key className="h-4 w-4" />
              Chave API da OpenAI
            </Label>
            <div className="flex gap-2">
              <Input
                id="api-key"
                type="password"
                value={apiKey}
                onChange={(e) => {
                  setApiKey(e.target.value);
                  setIsValid(null);
                }}
                placeholder="sk-..."
                className="bg-background border-border flex-1"
              />
              <Button
                variant="outline"
                onClick={testApiKey}
                disabled={isTesting || !apiKey || apiKey.startsWith("sk-••")}
                className="gap-2"
              >
                {isTesting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Zap className="h-4 w-4" />
                )}
                Testar
              </Button>
            </div>
            {isValid === true && (
              <p className="text-sm text-green-400 flex items-center gap-1">
                <CheckCircle className="h-4 w-4" />
                Chave válida
              </p>
            )}
            {isValid === false && (
              <p className="text-sm text-red-400 flex items-center gap-1">
                <AlertCircle className="h-4 w-4" />
                Chave inválida
              </p>
            )}
          </div>

          {/* How to get API key */}
          <div className="p-4 rounded-xl bg-muted/30 border border-border space-y-3">
            <h4 className="text-foreground font-medium flex items-center gap-2">
              <Shield className="h-4 w-4 text-primary" />
              Como obter sua chave API
            </h4>
            <ol className="text-sm text-muted-foreground space-y-2 list-decimal list-inside">
              <li>Acesse <a href="https://platform.openai.com/api-keys" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline inline-flex items-center gap-1">platform.openai.com <ExternalLink className="h-3 w-3" /></a></li>
              <li>Faça login ou crie uma conta</li>
              <li>Vá em "API Keys" e clique em "Create new secret key"</li>
              <li>Copie a chave e cole acima</li>
            </ol>
          </div>

          {/* Actions */}
          <div className="flex justify-between pt-4">
            {hasKey && (
              <Button
                variant="outline"
                onClick={handleRemoveKey}
                disabled={isSaving}
                className="text-destructive hover:bg-destructive/10"
              >
                Remover Chave
              </Button>
            )}
            <Button
              onClick={handleSave}
              disabled={isSaving || !apiKey || apiKey.startsWith("sk-••")}
              className="bg-primary hover:bg-primary/90 gap-2 ml-auto"
            >
              {isSaving ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Salvando...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  Salvar Chave API
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Usage Info */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-foreground text-lg">Modelos Disponíveis</CardTitle>
          <CardDescription className="text-muted-foreground">
            Com sua chave API, você terá acesso aos seguintes modelos
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-muted/30 border border-border">
              <div className="flex items-center gap-2 mb-2">
                <Badge className="bg-primary/20 text-primary border-primary/30">Recomendado</Badge>
              </div>
              <h4 className="text-foreground font-medium">GPT-4 Turbo</h4>
              <p className="text-sm text-muted-foreground">
                Modelo mais avançado, ideal para atendimento complexo
              </p>
            </div>
            <div className="p-4 rounded-xl bg-muted/30 border border-border">
              <h4 className="text-foreground font-medium">GPT-4</h4>
              <p className="text-sm text-muted-foreground">
                Alta precisão para análises detalhadas
              </p>
            </div>
            <div className="p-4 rounded-xl bg-muted/30 border border-border">
              <h4 className="text-foreground font-medium">GPT-3.5 Turbo</h4>
              <p className="text-sm text-muted-foreground">
                Rápido e econômico para tarefas simples
              </p>
            </div>
            <div className="p-4 rounded-xl bg-muted/30 border border-border">
              <h4 className="text-foreground font-medium">Whisper</h4>
              <p className="text-sm text-muted-foreground">
                Transcrição de áudio para texto
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default OpenAIConfigPage;
