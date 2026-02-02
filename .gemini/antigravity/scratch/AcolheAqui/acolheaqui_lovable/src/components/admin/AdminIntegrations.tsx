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
  CreditCard,
  Loader2,
  Save,
  Lock,
  CheckCircle,
  XCircle,
  Eye,
  EyeOff,
  Webhook,
  Copy,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

// Gateway logos
import stripeLogo from "@/assets/gateway-stripe.svg";
import mercadopagoLogo from "@/assets/gateway-mercadopago.png";
import asaasLogo from "@/assets/gateway-asaas.svg";

interface AdminIntegrationsProps {
  userRole?: string | null;
}

interface GatewayConfig {
  enabled: boolean;
  test_mode: boolean;
  api_key: string;
  secret_key: string;
  webhook_secret?: string;
}

const AdminIntegrations = ({ userRole }: AdminIntegrationsProps) => {
  const [gateways, setGateways] = useState<Record<string, GatewayConfig>>({
    stripe: { enabled: false, test_mode: true, api_key: "", secret_key: "" },
    mercadopago: { enabled: false, test_mode: true, api_key: "", secret_key: "" },
    asaas: { enabled: false, test_mode: true, api_key: "", secret_key: "" },
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [showSecrets, setShowSecrets] = useState<Record<string, boolean>>({});
  const { toast } = useToast();

  const isSuperAdmin = userRole === "super_admin";

  const webhookUrl = `${window.location.origin}/api/subscription-webhook`;

  useEffect(() => {
    fetchGatewayConfigs();
  }, []);

  const fetchGatewayConfigs = async () => {
    try {
      const { data, error } = await supabase
        .from("platform_settings")
        .select("key, value")
        .in("key", ["gateway_stripe", "gateway_mercadopago", "gateway_asaas"]);

      if (error) throw error;

      if (data) {
        const loadedGateways = { ...gateways };
        data.forEach((item) => {
          const gatewayName = item.key.replace("gateway_", "");
          if (gatewayName in loadedGateways) {
            try {
              loadedGateways[gatewayName] = JSON.parse(item.value as string);
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
        description: "Apenas Super Admins podem alterar integrações.",
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
        title: "Integrações salvas",
        description: "As configurações de gateway foram atualizadas.",
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível salvar as integrações.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
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
  };

  const copyWebhookUrl = () => {
    navigator.clipboard.writeText(webhookUrl);
    toast({ title: "URL copiada!", description: "URL do webhook copiada para a área de transferência." });
  };

  const toggleSecretVisibility = (field: string) => {
    setShowSecrets((prev) => ({ ...prev, [field]: !prev[field] }));
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const gatewayInfo = [
    {
      id: "stripe",
      name: "Stripe",
      logo: stripeLogo,
      description: "Pagamentos internacionais com cartão e PIX",
    },
    {
      id: "mercadopago",
      name: "Mercado Pago",
      logo: mercadopagoLogo,
      description: "PIX, cartão e boleto no Brasil",
    },
    {
      id: "asaas",
      name: "Asaas",
      logo: asaasLogo,
      description: "Cobranças recorrentes e PIX",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-white">Integrações</h1>
          <p className="text-slate-400 mt-1">Configure os gateways de pagamento para assinaturas</p>
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
              Você tem acesso somente leitura. Apenas Super Admins podem editar integrações.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Webhook URL */}
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Webhook className="w-5 h-5 text-primary" />
            URL do Webhook
          </CardTitle>
          <CardDescription className="text-slate-400">
            Configure esta URL nos gateways de pagamento para receber notificações
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
        <TabsList className="bg-slate-800 border-slate-700 h-auto flex-wrap">
          {gatewayInfo.map((gateway) => (
            <TabsTrigger
              key={gateway.id}
              value={gateway.id}
              className="data-[state=active]:bg-primary flex items-center gap-2 py-3"
            >
              <img src={gateway.logo} alt={gateway.name} className="w-5 h-5 object-contain" />
              {gateway.name}
              {gateways[gateway.id]?.enabled && (
                <CheckCircle className="w-4 h-4 text-green-400" />
              )}
            </TabsTrigger>
          ))}
        </TabsList>

        {gatewayInfo.map((gateway) => (
          <TabsContent key={gateway.id} value={gateway.id}>
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <div className="flex items-center justify-between">
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

                {/* API Keys */}
                <div className="grid gap-4">
                  <div className="space-y-2">
                    <Label className="text-slate-300">API Key / Public Key</Label>
                    <div className="relative">
                      <Input
                        type={showSecrets[`${gateway.id}_api`] ? "text" : "password"}
                        value={gateways[gateway.id]?.api_key || ""}
                        onChange={(e) => updateGateway(gateway.id, "api_key", e.target.value)}
                        disabled={!isSuperAdmin}
                        className="bg-input border-border text-foreground placeholder:text-muted-foreground pr-10"
                        placeholder="pk_test_..."
                      />
                      <button
                        type="button"
                        onClick={() => toggleSecretVisibility(`${gateway.id}_api`)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                      >
                        {showSecrets[`${gateway.id}_api`] ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-slate-300">Secret Key / Private Key</Label>
                    <div className="relative">
                      <Input
                        type={showSecrets[`${gateway.id}_secret`] ? "text" : "password"}
                        value={gateways[gateway.id]?.secret_key || ""}
                        onChange={(e) => updateGateway(gateway.id, "secret_key", e.target.value)}
                        disabled={!isSuperAdmin}
                        className="bg-input border-border text-foreground placeholder:text-muted-foreground pr-10"
                        placeholder="sk_test_..."
                      />
                      <button
                        type="button"
                        onClick={() => toggleSecretVisibility(`${gateway.id}_secret`)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                      >
                        {showSecrets[`${gateway.id}_secret`] ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-slate-300">Webhook Secret (opcional)</Label>
                    <div className="relative">
                      <Input
                        type={showSecrets[`${gateway.id}_webhook`] ? "text" : "password"}
                        value={gateways[gateway.id]?.webhook_secret || ""}
                        onChange={(e) => updateGateway(gateway.id, "webhook_secret", e.target.value)}
                        disabled={!isSuperAdmin}
                        className="bg-input border-border text-foreground placeholder:text-muted-foreground pr-10"
                        placeholder="whsec_..."
                      />
                      <button
                        type="button"
                        onClick={() => toggleSecretVisibility(`${gateway.id}_webhook`)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                      >
                        {showSecrets[`${gateway.id}_webhook`] ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
};

export default AdminIntegrations;
