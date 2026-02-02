import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  Loader2,
  Save,
  Lock,
  CheckCircle,
  XCircle,
  Eye,
  EyeOff,
  Webhook,
  Copy,
  TestTube,
  AlertCircle,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

// Gateway logos
import stripeLogo from "@/assets/gateway-stripe.svg";
import mercadopagoLogo from "@/assets/gateway-mercadopago.png";
import asaasLogo from "@/assets/gateway-asaas.svg";
import pagarmeLogo from "@/assets/gateway-pagarme.png";
import pagseguroLogo from "@/assets/gateway-pagseguro.png";
import pushinpayLogo from "@/assets/gateway-pushinpay.png";

interface AdminGatewaysProps {
  userRole?: string | null;
}

interface GatewayConfig {
  enabled: boolean;
  test_mode: boolean;
  api_key: string;
  secret_key: string;
  webhook_secret?: string;
  // PagSeguro specific
  email?: string;
  token?: string;
}

const gatewayInfo = [
  {
    id: "stripe",
    name: "Stripe",
    logo: stripeLogo,
    description: "Pagamentos internacionais com cartão e PIX",
    fields: ["api_key", "secret_key", "webhook_secret"],
  },
  {
    id: "mercadopago",
    name: "Mercado Pago",
    logo: mercadopagoLogo,
    description: "PIX, cartão e boleto no Brasil",
    fields: ["api_key", "secret_key"],
  },
  {
    id: "asaas",
    name: "Asaas",
    logo: asaasLogo,
    description: "Cobranças recorrentes e PIX",
    fields: ["api_key", "webhook_secret"],
  },
  {
    id: "pagarme",
    name: "Pagar.me",
    logo: pagarmeLogo,
    description: "Gateway nacional com cartão e boleto",
    fields: ["api_key", "secret_key"],
  },
  {
    id: "pagseguro",
    name: "PagSeguro",
    logo: pagseguroLogo,
    description: "Soluções de pagamento do UOL",
    fields: ["email", "token"],
  },
  {
    id: "pushinpay",
    name: "PushinPay",
    logo: pushinpayLogo,
    description: "Gateway de PIX instantâneo",
    fields: ["api_key"],
  },
];

const defaultGateway: GatewayConfig = {
  enabled: false,
  test_mode: true,
  api_key: "",
  secret_key: "",
};

const AdminGateways = ({ userRole }: AdminGatewaysProps) => {
  const [gateways, setGateways] = useState<Record<string, GatewayConfig>>(() => {
    const initial: Record<string, GatewayConfig> = {};
    gatewayInfo.forEach((g) => {
      initial[g.id] = { ...defaultGateway };
    });
    return initial;
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [showSecrets, setShowSecrets] = useState<Record<string, boolean>>({});
  const [validating, setValidating] = useState<string | null>(null);
  const [validationResults, setValidationResults] = useState<Record<string, { success: boolean; message: string }>>({});
  const { toast } = useToast();

  const isSuperAdmin = userRole === "super_admin";
  const webhookUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/subscription-webhook`;

  useEffect(() => {
    fetchGatewayConfigs();
  }, []);

  const fetchGatewayConfigs = async () => {
    try {
      const keys = gatewayInfo.map((g) => `gateway_${g.id}`);
      const { data, error } = await supabase
        .from("platform_settings")
        .select("key, value")
        .in("key", keys);

      if (error) throw error;

      if (data) {
        const loadedGateways = { ...gateways };
        data.forEach((item) => {
          const gatewayName = item.key.replace("gateway_", "");
          if (gatewayName in loadedGateways) {
            try {
              loadedGateways[gatewayName] = {
                ...defaultGateway,
                ...JSON.parse(item.value as string),
              };
            } catch {
              // Keep default
            }
          }
        });
        setGateways(loadedGateways);
      }
    } catch (error) {
      console.error("Error fetching gateway configs:", error);
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
      for (const [gateway, config] of Object.entries(gateways)) {
        const { error } = await supabase
          .from("platform_settings")
          .upsert(
            { key: `gateway_${gateway}`, value: JSON.stringify(config) },
            { onConflict: "key" }
          );

        if (error) throw error;
      }

      toast({
        title: "Gateways salvos",
        description: "As configurações foram atualizadas com sucesso.",
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

  const validateGateway = async (gatewayId: string) => {
    const config = gateways[gatewayId];
    if (!config) return;

    setValidating(gatewayId);

    try {
      const credentials: Record<string, string> = {};
      
      switch (gatewayId) {
        case "stripe":
          credentials.secretKey = config.secret_key;
          break;
        case "mercadopago":
          credentials.accessToken = config.secret_key || config.api_key;
          break;
        case "asaas":
          credentials.accessToken = config.api_key;
          break;
        case "pagarme":
          credentials.apiKey = config.api_key;
          break;
        case "pagseguro":
          credentials.email = config.email || "";
          credentials.token = config.token || config.api_key;
          break;
        case "pushinpay":
          credentials.apiKey = config.api_key;
          break;
      }

      const response = await supabase.functions.invoke("validate-gateway", {
        body: { gateway: gatewayId, credentials },
      });

      if (response.error) throw response.error;

      const result = response.data;
      setValidationResults((prev) => ({
        ...prev,
        [gatewayId]: {
          success: result.success,
          message: result.message || (result.success ? "Credenciais válidas!" : "Credenciais inválidas"),
        },
      }));

      toast({
        title: result.success ? "Validação OK" : "Falha na validação",
        description: result.message,
        variant: result.success ? "default" : "destructive",
      });
    } catch (error: any) {
      setValidationResults((prev) => ({
        ...prev,
        [gatewayId]: {
          success: false,
          message: error.message || "Erro ao validar credenciais",
        },
      }));
      toast({
        title: "Erro na validação",
        description: error.message || "Não foi possível validar as credenciais",
        variant: "destructive",
      });
    } finally {
      setValidating(null);
    }
  };

  const updateGateway = (gateway: string, field: string, value: any) => {
    setGateways((prev) => ({
      ...prev,
      [gateway]: {
        ...prev[gateway],
        [field]: value,
      },
    }));
    // Clear validation when config changes
    setValidationResults((prev) => {
      const updated = { ...prev };
      delete updated[gateway];
      return updated;
    });
  };

  const copyWebhookUrl = () => {
    navigator.clipboard.writeText(webhookUrl);
    toast({ title: "URL copiada!", description: "URL do webhook copiada para a área de transferência." });
  };

  const toggleSecretVisibility = (field: string) => {
    setShowSecrets((prev) => ({ ...prev, [field]: !prev[field] }));
  };

  const getFieldLabel = (field: string): string => {
    switch (field) {
      case "api_key":
        return "API Key / Public Key";
      case "secret_key":
        return "Secret Key / Private Key";
      case "webhook_secret":
        return "Webhook Secret";
      case "email":
        return "E-mail da Conta";
      case "token":
        return "Token de Integração";
      default:
        return field;
    }
  };

  const getFieldPlaceholder = (gatewayId: string, field: string): string => {
    switch (gatewayId) {
      case "stripe":
        if (field === "api_key") return "pk_test_...";
        if (field === "secret_key") return "sk_test_...";
        if (field === "webhook_secret") return "whsec_...";
        break;
      case "mercadopago":
        if (field === "api_key") return "TEST-...";
        if (field === "secret_key") return "APP_USR-...";
        break;
      case "asaas":
        if (field === "api_key") return "$aact_...";
        break;
      case "pagarme":
        if (field === "api_key") return "ak_test_...";
        if (field === "secret_key") return "sk_test_...";
        break;
      case "pagseguro":
        if (field === "email") return "seu@email.com";
        if (field === "token") return "TOKEN_SANDBOX...";
        break;
      case "pushinpay":
        if (field === "api_key") return "pk_...";
        break;
    }
    return "";
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
          <h1 className="text-2xl md:text-3xl font-bold text-white">Gateways de Pagamento</h1>
          <p className="text-slate-400 mt-1">Configure os gateways para cobranças de assinaturas</p>
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
              Você tem acesso somente leitura. Apenas Super Admins podem editar gateways.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Webhook URL */}
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Webhook className="w-5 h-5 text-primary" />
            URL do Webhook Universal
          </CardTitle>
          <CardDescription className="text-slate-400">
            Configure esta URL em todos os gateways para receber notificações de pagamento
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2">
            <Input
              value={webhookUrl}
              readOnly
              className="bg-input border-border text-foreground placeholder:text-muted-foreground font-mono text-sm"
            />
            <Button variant="outline" size="icon" onClick={copyWebhookUrl}>
              <Copy className="w-4 h-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Gateway Tabs */}
      <Tabs defaultValue="stripe" className="space-y-6">
        <TabsList className="bg-slate-800 border-slate-700 h-auto flex-wrap gap-1 p-1">
          {gatewayInfo.map((gateway) => (
            <TabsTrigger
              key={gateway.id}
              value={gateway.id}
              className="data-[state=active]:bg-primary flex items-center gap-2 py-2.5 px-3"
            >
              <img src={gateway.logo} alt={gateway.name} className="w-5 h-5 object-contain" />
              <span className="hidden sm:inline">{gateway.name}</span>
              {gateways[gateway.id]?.enabled && (
                <CheckCircle className="w-3.5 h-3.5 text-green-400" />
              )}
            </TabsTrigger>
          ))}
        </TabsList>

        {gatewayInfo.map((gateway) => (
          <TabsContent key={gateway.id} value={gateway.id}>
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <div className="flex items-center justify-between flex-wrap gap-4">
                  <div className="flex items-center gap-3">
                    <img src={gateway.logo} alt={gateway.name} className="w-10 h-10 object-contain" />
                    <div>
                      <CardTitle className="text-white">{gateway.name}</CardTitle>
                      <CardDescription className="text-slate-400">
                        {gateway.description}
                      </CardDescription>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {validationResults[gateway.id] && (
                      <Badge
                        className={
                          validationResults[gateway.id].success
                            ? "bg-green-500/20 text-green-400 border-green-500/30"
                            : "bg-red-500/20 text-red-400 border-red-500/30"
                        }
                      >
                        {validationResults[gateway.id].success ? (
                          <CheckCircle className="w-3 h-3 mr-1" />
                        ) : (
                          <AlertCircle className="w-3 h-3 mr-1" />
                        )}
                        {validationResults[gateway.id].success ? "Válido" : "Inválido"}
                      </Badge>
                    )}
                    {gateways[gateway.id]?.enabled ? (
                      <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Ativo
                      </Badge>
                    ) : (
                      <Badge className="bg-slate-500/20 text-slate-400 border-slate-500/30">
                        <XCircle className="w-3 h-3 mr-1" />
                        Inativo
                      </Badge>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Toggle */}
                <div className="flex items-center justify-between p-4 bg-slate-700/30 rounded-lg">
                  <div>
                    <p className="text-white font-medium">Habilitar Gateway</p>
                    <p className="text-sm text-slate-400">
                      Ativar este gateway para cobranças de assinaturas
                    </p>
                  </div>
                  <Switch
                    checked={gateways[gateway.id]?.enabled}
                    onCheckedChange={(checked) => updateGateway(gateway.id, "enabled", checked)}
                    disabled={!isSuperAdmin}
                  />
                </div>

                {/* Test Mode */}
                <div className="flex items-center justify-between p-4 bg-slate-700/30 rounded-lg">
                  <div>
                    <p className="text-white font-medium">Modo de Teste</p>
                    <p className="text-sm text-slate-400">
                      Usar credenciais de sandbox/teste
                    </p>
                  </div>
                  <Switch
                    checked={gateways[gateway.id]?.test_mode}
                    onCheckedChange={(checked) => updateGateway(gateway.id, "test_mode", checked)}
                    disabled={!isSuperAdmin}
                  />
                </div>

                {/* Dynamic Fields */}
                <div className="grid gap-4">
                  {gateway.fields.map((field) => (
                    <div key={field} className="space-y-2">
                      <Label className="text-slate-300">{getFieldLabel(field)}</Label>
                      <div className="relative">
                        <Input
                          type={showSecrets[`${gateway.id}_${field}`] ? "text" : "password"}
                          value={(gateways[gateway.id] as any)?.[field] || ""}
                          onChange={(e) => updateGateway(gateway.id, field, e.target.value)}
                          disabled={!isSuperAdmin}
                          className="bg-input border-border text-foreground placeholder:text-muted-foreground pr-10"
                          placeholder={getFieldPlaceholder(gateway.id, field)}
                        />
                        <button
                          type="button"
                          onClick={() => toggleSecretVisibility(`${gateway.id}_${field}`)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                        >
                          {showSecrets[`${gateway.id}_${field}`] ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Validate Button */}
                {isSuperAdmin && (
                  <Button
                    variant="outline"
                    onClick={() => validateGateway(gateway.id)}
                    disabled={validating === gateway.id}
                    className="w-full"
                  >
                    {validating === gateway.id ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Validando...
                      </>
                    ) : (
                      <>
                        <TestTube className="mr-2 h-4 w-4" />
                        Testar Credenciais
                      </>
                    )}
                  </Button>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
};

export default AdminGateways;
