import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import {
  Copy,
  Save,
  Loader2,
  Check,
  Key,
  Zap,
  ShieldCheck,
  AlertCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Switch } from "@/components/ui/switch";

// Import gateway logos
import mercadopagoLogo from "@/assets/gateway-mercadopago.png";
import pushinpayLogo from "@/assets/gateway-pushinpay.png";
import pagarmeLogo from "@/assets/gateway-pagarme.png";
import pagseguroLogo from "@/assets/gateway-pagseguro.png";
import stripeLogo from "@/assets/gateway-stripe.svg";
import asaasLogo from "@/assets/gateway-asaas.svg";

interface SettingsPageProps {
  profileId: string;
}

type GatewayType =
  | "mercadopago"
  | "pushinpay"
  | "pagarme"
  | "pagseguro"
  | "stripe"
  | "asaas";

interface GatewayInfo {
  id: GatewayType;
  name: string;
  description: string;
  logo: string;
  color: string;
  bgColor: string;
  fields: { key: string; label: string; placeholder: string; type: string }[];
}

const gateways: GatewayInfo[] = [
  {
    id: "mercadopago",
    name: "Mercado Pago",
    description: "Cartão, Boleto e Pix",
    logo: mercadopagoLogo,
    color: "border-primary",
    bgColor: "bg-primary/10",
    fields: [
      { key: "publicKey", label: "Public Key", placeholder: "APP_USR-xxxxxxxx...", type: "text" },
      { key: "accessToken", label: "Access Token", placeholder: "APP_USR-xxxxxxxx...", type: "password" },
    ],
  },
  {
    id: "pushinpay",
    name: "PushinPay",
    description: "Pix Instantâneo",
    logo: pushinpayLogo,
    color: "border-primary",
    bgColor: "bg-primary/10",
    fields: [{ key: "apiKey", label: "API Key", placeholder: "pk_live_xxxxxxxx...", type: "password" }],
  },
  {
    id: "pagarme",
    name: "Pagar.me",
    description: "Cartão, Boleto e Pix",
    logo: pagarmeLogo,
    color: "border-primary",
    bgColor: "bg-primary/10",
    fields: [
      { key: "apiKey", label: "API Key", placeholder: "ak_live_xxxxxxxx...", type: "password" },
      { key: "encryptionKey", label: "Encryption Key", placeholder: "ek_live_xxxxxxxx...", type: "password" },
    ],
  },
  {
    id: "pagseguro",
    name: "PagSeguro",
    description: "Cartão, Boleto e Pix",
    logo: pagseguroLogo,
    color: "border-primary",
    bgColor: "bg-primary/10",
    fields: [
      { key: "email", label: "E-mail", placeholder: "seu-email@pagseguro.com", type: "email" },
      { key: "token", label: "Token", placeholder: "TOKEN-PAGSEGURO-xxxxxxxx...", type: "password" },
    ],
  },
  {
    id: "stripe",
    name: "Stripe",
    description: "Cartão e Apple/Google Pay",
    logo: stripeLogo,
    color: "border-primary",
    bgColor: "bg-primary/10",
    fields: [
      { key: "publishableKey", label: "Publishable Key", placeholder: "pk_live_xxxxxxxx...", type: "text" },
      { key: "secretKey", label: "Secret Key", placeholder: "sk_live_xxxxxxxx...", type: "password" },
    ],
  },
  {
    id: "asaas",
    name: "Asaas",
    description: "Pix e cobranças",
    logo: asaasLogo,
    color: "border-primary",
    bgColor: "bg-primary/10",
    fields: [
      { key: "accessToken", label: "Access Token", placeholder: "$aact_...", type: "password" },
    ],
  },
];

const tokenKeyByGateway: Record<GatewayType, string> = {
  mercadopago: "accessToken",
  pushinpay: "apiKey",
  pagarme: "apiKey",
  pagseguro: "token",
  stripe: "secretKey",
  asaas: "accessToken",
};

const providerList = gateways.map((g) => g.id).join(",");
const providerOrFilter = `gateway_type.in.(${providerList}),card_gateway.in.(${providerList})`;

const SettingsPage = ({ profileId }: SettingsPageProps) => {
  const [selectedGateway, setSelectedGateway] = useState<GatewayType>("mercadopago");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [validationStatus, setValidationStatus] = useState<"idle" | "success" | "error">("idle");
  const [copied, setCopied] = useState(false);

  const [gatewayConfigs, setGatewayConfigs] = useState<Record<GatewayType, Record<string, string>>>(() => ({
    mercadopago: { publicKey: "", accessToken: "" },
    pushinpay: { apiKey: "" },
    pagarme: { apiKey: "", encryptionKey: "" },
    pagseguro: { email: "", token: "" },
    stripe: { publishableKey: "", secretKey: "" },
    asaas: { accessToken: "" },
  }));

  const [enabledGateways, setEnabledGateways] = useState<Record<GatewayType, boolean>>(() => ({
    mercadopago: false,
    pushinpay: false,
    pagarme: false,
    pagseguro: false,
    stripe: false,
    asaas: false,
  }));

  const [savedCredentials, setSavedCredentials] = useState<Record<GatewayType, boolean>>(() => ({
    mercadopago: false,
    pushinpay: false,
    pagarme: false,
    pagseguro: false,
    stripe: false,
    asaas: false,
  }));

  const activeGateway = (Object.entries(enabledGateways).find(([, v]) => v)?.[0] as GatewayType | undefined) || null;

  const webhookUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/payment-webhook`;

  const getGatewayInfo = (id: GatewayType) => gateways.find((g) => g.id === id);

  const decodeStoredConfig = (gateway: GatewayType, raw: string | null | undefined) => {
    const info = getGatewayInfo(gateway);
    if (!info) return {} as Record<string, string>;
    if (!raw?.trim()) return {} as Record<string, string>;

    const trimmed = raw.trim();

    // New format: JSON string
    if (trimmed.startsWith("{")) {
      try {
        const parsed = JSON.parse(trimmed);
        if (parsed && typeof parsed === "object") {
          const out: Record<string, string> = {};
          info.fields.forEach((f) => {
            out[f.key] = typeof (parsed as any)[f.key] === "string" ? (parsed as any)[f.key] : "";
          });
          return out;
        }
      } catch {
        // ignore
      }
    }

    // Legacy format: field1|field2
    if (trimmed.includes("|")) {
      const parts = trimmed.split("|");
      const out: Record<string, string> = {};
      info.fields.forEach((f, idx) => {
        out[f.key] = parts[idx] || "";
      });
      return out;
    }

    // Legacy format: single token
    const out: Record<string, string> = {};
    info.fields.forEach((f, idx) => {
      out[f.key] = idx === 0 ? trimmed : "";
    });
    return out;
  };

  const encodeStoredConfig = (gateway: GatewayType, config: Record<string, string>) => {
    const info = getGatewayInfo(gateway);
    if (!info) return "{}";
    const payload: Record<string, string> = {};
    info.fields.forEach((f) => {
      payload[f.key] = config[f.key] || "";
    });
    return JSON.stringify(payload);
  };

  const fetchGatewayConfig = async () => {
    try {
      const { data, error } = await supabase
        .from("payment_gateways")
        .select("*")
        .eq("professional_id", profileId);

      if (error) throw error;

      // Prepare fresh state objects (avoid setState inside loops)
      const nextEnabled: Record<GatewayType, boolean> = {
        mercadopago: false,
        pushinpay: false,
        pagarme: false,
        pagseguro: false,
        stripe: false,
        asaas: false,
      };

      const nextSaved: Record<GatewayType, boolean> = {
        mercadopago: false,
        pushinpay: false,
        pagarme: false,
        pagseguro: false,
        stripe: false,
        asaas: false,
      };

      const nextConfigs: Record<GatewayType, Record<string, string>> = {
        mercadopago: { publicKey: "", accessToken: "" },
        pushinpay: { apiKey: "" },
        pagarme: { apiKey: "", encryptionKey: "" },
        pagseguro: { email: "", token: "" },
        stripe: { publishableKey: "", secretKey: "" },
        asaas: { accessToken: "" },
      };

      let chosenActive: GatewayType | null = null;
      let chosenActiveUpdatedAt = 0;

      (data || []).forEach((row: any) => {
        const gatewayType = (row.card_gateway || row.gateway_type) as GatewayType;
        if (!gatewayType || !getGatewayInfo(gatewayType)) return;

        const decoded = decodeStoredConfig(gatewayType, row.card_api_key);
        nextConfigs[gatewayType] = { ...nextConfigs[gatewayType], ...decoded };
        nextSaved[gatewayType] = Object.values(decoded).some((v) => (v || "").trim().length > 0);

        if (row.is_active) {
          const ts = Date.parse(row.updated_at || row.created_at || "") || 0;
          if (!chosenActive || ts >= chosenActiveUpdatedAt) {
            chosenActive = gatewayType;
            chosenActiveUpdatedAt = ts;
          }
        }
      });

      // Enforce exclusivity in UI (even if DB has multiple actives from past)
      if (chosenActive) {
        (Object.keys(nextEnabled) as GatewayType[]).forEach((g) => {
          nextEnabled[g] = g === chosenActive;
        });
        setSelectedGateway(chosenActive);
      }

      setGatewayConfigs(nextConfigs);
      setEnabledGateways(nextEnabled);
      setSavedCredentials(nextSaved);
    } catch (error) {
      console.error("Error fetching gateway config:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchGatewayConfig();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profileId]);

  // Keep credentials form always aligned with the ACTIVE gateway
  useEffect(() => {
    if (activeGateway && activeGateway !== selectedGateway) {
      setSelectedGateway(activeGateway);
      setValidationStatus("idle");
    }
  }, [activeGateway, selectedGateway]);

  const handleCopyWebhook = async () => {
    await navigator.clipboard.writeText(webhookUrl);
    setCopied(true);
    toast.success("URL do Webhook copiada!");
    setTimeout(() => setCopied(false), 2000);
  };

  const updateGatewayConfig = (gateway: GatewayType, key: string, value: string) => {
    setGatewayConfigs((prev) => ({
      ...prev,
      [gateway]: { ...prev[gateway], [key]: value },
    }));
  };

  const setExclusiveEnabledState = (gateway: GatewayType | null) => {
    setEnabledGateways((prev) => {
      const next = { ...prev };
      (Object.keys(next) as GatewayType[]).forEach((g) => {
        next[g] = gateway ? g === gateway : false;
      });
      return next;
    });
  };

  const handleToggleGateway = async (gateway: GatewayType, enabled: boolean) => {
    setValidationStatus("idle");

    // Optimistic UI: enforce exclusivity when enabling
    if (enabled) {
      setSelectedGateway(gateway);
      setExclusiveEnabledState(gateway);
    } else {
      setEnabledGateways((prev) => ({ ...prev, [gateway]: false }));
    }

    try {
      const gatewayName = getGatewayInfo(gateway)?.name || gateway;

      if (enabled) {
        // 1) Deactivate all provider gateways for this profile
        const { data: rows, error: listError } = await supabase
          .from("payment_gateways")
          .select("id")
          .eq("professional_id", profileId)
          .or(providerOrFilter);

        if (listError) throw listError;

        const allIds = (rows || []).map((r: any) => r.id);
        if (allIds.length > 0) {
          const { error } = await supabase
            .from("payment_gateways")
            .update({ is_active: false })
            .in("id", allIds);
          if (error) throw error;
        }

        // 2) Activate selected gateway row(s) or create it
        const { data: existingRows, error: findError } = await supabase
          .from("payment_gateways")
          .select("id")
          .eq("professional_id", profileId)
          .or(`gateway_type.eq.${gateway},card_gateway.eq.${gateway}`);

        if (findError) throw findError;

        if (existingRows && existingRows.length > 0) {
          const ids = existingRows.map((r: any) => r.id);
          const { error } = await supabase
            .from("payment_gateways")
            .update({ is_active: true, gateway_type: gateway, card_gateway: gateway })
            .in("id", ids);
          if (error) throw error;
        } else {
          const { error } = await supabase.from("payment_gateways").insert({
            professional_id: profileId,
            gateway_type: gateway,
            card_gateway: gateway,
            is_active: true,
          });
          if (error) throw error;
        }

        toast.success(`${gatewayName} ativado (exclusivo)`);
      } else {
        // Disable selected gateway
        const { data: existingRows, error: findError } = await supabase
          .from("payment_gateways")
          .select("id")
          .eq("professional_id", profileId)
          .or(`gateway_type.eq.${gateway},card_gateway.eq.${gateway}`);

        if (findError) throw findError;

        const ids = (existingRows || []).map((r: any) => r.id);
        if (ids.length > 0) {
          const { error } = await supabase
            .from("payment_gateways")
            .update({ is_active: false })
            .in("id", ids);
          if (error) throw error;
        }

        toast.success(`${gatewayName} desativado`);
      }
    } catch (error) {
      console.error("Error toggling gateway:", error);
      toast.error("Erro ao alterar status do gateway");
      // Re-sync UI from DB
      await fetchGatewayConfig();
    }
  };

  const handleValidateCredentials = async () => {
    if (!activeGateway) {
      toast.error("Ative um gateway acima para testar.");
      return;
    }

    setIsValidating(true);
    setValidationStatus("idle");

    try {
      const currentConfig = gatewayConfigs[selectedGateway];
      const credentials: Record<string, string> = { ...currentConfig };

      const { data, error } = await supabase.functions.invoke("validate-gateway", {
        body: {
          gateway: selectedGateway,
          credentials,
        },
      });

      if (error) throw error;

      if (data.success) {
        setValidationStatus("success");
        toast.success(data.message || "Credenciais válidas!");
      } else {
        setValidationStatus("error");
        toast.error(data.message || "Credenciais inválidas");
      }
    } catch (error) {
      console.error("Error validating credentials:", error);
      setValidationStatus("error");
      toast.error("Erro ao validar credenciais");
    } finally {
      setIsValidating(false);
    }
  };

  const validateCredentialsForGateway = async (
    gateway: GatewayType,
    config: Record<string, string>
  ): Promise<boolean> => {
    try {
      const credentials: Record<string, string> = { ...config };
      const { data, error } = await supabase.functions.invoke("validate-gateway", {
        body: { gateway, credentials },
      });
      if (error) return false;
      return data?.success || false;
    } catch {
      return false;
    }
  };

  const handleSave = async () => {
    if (!activeGateway) {
      toast.error("Ative um gateway acima antes de salvar credenciais.");
      return;
    }

    setIsSaving(true);
    setValidationStatus("idle");

    try {
      const gatewayInfo = getGatewayInfo(selectedGateway);
      if (!gatewayInfo) {
        toast.error("Gateway inválido");
        return;
      }

      const currentConfig = gatewayConfigs[selectedGateway];

      // Validate all fields are filled
      const emptyFields = gatewayInfo.fields.filter((f) => !currentConfig[f.key]?.trim());
      if (emptyFields.length > 0) {
        toast.error(`Preencha todos os campos: ${emptyFields.map((f) => f.label).join(", ")}`);
        return;
      }

      // Auto-validate credentials before saving
      setIsValidating(true);
      const isValid = await validateCredentialsForGateway(selectedGateway, currentConfig);
      setIsValidating(false);

      if (!isValid) {
        setValidationStatus("error");
        toast.error("Credenciais inválidas. Verifique os dados e tente novamente.");
        return;
      }

      setValidationStatus("success");

      const storedCredentials = encodeStoredConfig(selectedGateway, currentConfig);

      const payload = {
        professional_id: profileId,
        gateway_type: selectedGateway,
        card_gateway: selectedGateway,
        card_api_key: storedCredentials,
        is_active: enabledGateways[selectedGateway] ?? false,
      };

      const { data: existingRows, error: findError } = await supabase
        .from("payment_gateways")
        .select("id")
        .eq("professional_id", profileId)
        .or(`gateway_type.eq.${selectedGateway},card_gateway.eq.${selectedGateway}`);

      if (findError) throw findError;

      if (existingRows && existingRows.length > 0) {
        const ids = existingRows.map((r: any) => r.id);
        const { error } = await supabase.from("payment_gateways").update(payload).in("id", ids);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("payment_gateways").insert(payload);
        if (error) throw error;
      }

      setSavedCredentials((prev) => ({ ...prev, [selectedGateway]: true }));
      toast.success("Credenciais validadas e salvas com sucesso!");
    } catch (error) {
      console.error("Error saving gateway config:", error);
      toast.error("Erro ao salvar configurações");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const selectedGatewayInfo = getGatewayInfo(selectedGateway);

  return (
    <main className="max-w-5xl mx-auto space-y-8">
      <header>
        <h1 className="text-2xl font-bold text-foreground">Gateways de Pagamento</h1>
        <p className="text-muted-foreground mt-1">Gerencie suas chaves de API e métodos de recebimento.</p>
      </header>

      {/* Gateway Selection */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4" aria-label="Seleção de gateways de pagamento">
        {gateways.map((gateway) => {
          const isActive = enabledGateways[gateway.id];
          return (
            <Card
              key={gateway.id}
              className={cn(
                "cursor-pointer transition-all duration-200 hover:shadow-md relative overflow-hidden",
                isActive ? `border-2 ${gateway.color} ${gateway.bgColor}` : "border-border hover:border-muted-foreground/30"
              )}
              onClick={() => {
                if (!enabledGateways[gateway.id]) {
                  handleToggleGateway(gateway.id, true);
                } else {
                  setSelectedGateway(gateway.id);
                  setValidationStatus("idle");
                }
              }}
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-background shadow-sm border border-border/50 flex items-center justify-center p-2">
                      <img src={gateway.logo} alt={`${gateway.name} gateway de pagamento`} className="w-full h-full object-contain" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground text-sm">{gateway.name}</h3>
                      <p className="text-xs text-muted-foreground">{gateway.description}</p>
                    </div>
                  </div>

                  <Switch
                    checked={enabledGateways[gateway.id]}
                    onCheckedChange={(checked) => handleToggleGateway(gateway.id, checked)}
                    onClick={(e) => e.stopPropagation()}
                    className="data-[state=checked]:bg-primary"
                  />
                </div>

                <div className="mt-3 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span
                      className={cn(
                        "text-xs font-medium px-2 py-1 rounded-full",
                        isActive ? "bg-emerald-500/10 text-emerald-600" : "bg-muted text-muted-foreground"
                      )}
                    >
                      {isActive ? "Ativo" : "Inativo"}
                    </span>

                    {savedCredentials[gateway.id] && (
                      <span className="flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full bg-blue-500/10 text-blue-600">
                        <Key className="w-3 h-3" />
                        Configurado
                      </span>
                    )}
                  </div>

                  {isActive && <span className="text-xs text-primary font-medium">Principal</span>}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </section>

      {/* Credentials Form */}
      <section aria-label="Credenciais do gateway ativo">
        <Card className="border-border bg-card">
          <CardContent className="p-6 space-y-6">
            {!activeGateway || !selectedGatewayInfo ? (
              <div className="space-y-2">
                <h2 className="text-base font-semibold text-foreground">Nenhum gateway ativo</h2>
                <p className="text-sm text-muted-foreground">Ative um gateway acima para editar e salvar as credenciais.</p>
              </div>
            ) : (
              <>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-primary/10">
                    <Key className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h2 className="font-semibold text-foreground">Credenciais {selectedGatewayInfo.name}</h2>
                    <p className="text-sm text-muted-foreground">Insira suas chaves de produção (Live Keys).</p>
                  </div>
                </div>

                <div className="space-y-4">
                  {selectedGatewayInfo.fields.map((field) => (
                    <div key={field.key} className="space-y-2">
                      <Label htmlFor={field.key} className="text-sm font-medium text-foreground">
                        {field.label}
                      </Label>
                      <div className="relative">
                        <Key className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                          id={field.key}
                          type={field.type}
                          placeholder={field.placeholder}
                          value={gatewayConfigs[selectedGateway]?.[field.key] || ""}
                          onChange={(e) => updateGatewayConfig(selectedGateway, field.key, e.target.value)}
                          className="pl-10 bg-muted/50 border-border text-foreground placeholder:text-muted-foreground"
                        />
                      </div>
                    </div>
                  ))}
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm font-medium text-foreground">Webhook URL</Label>
                    <span className="text-xs text-muted-foreground">Para notificações automáticas</span>
                    <span className="text-xs font-medium text-muted-foreground bg-muted px-2 py-0.5 rounded">POST</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 flex items-center gap-2 px-4 py-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                      <Zap className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                      <code className="text-sm text-emerald-600 truncate font-mono">{webhookUrl}</code>
                    </div>
                    <Button variant="outline" size="sm" onClick={handleCopyWebhook} className="flex-shrink-0 gap-2">
                      {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                      Copiar
                    </Button>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 gap-4">
                  <Button
                    variant="outline"
                    onClick={handleValidateCredentials}
                    disabled={isValidating}
                    className={cn(
                      "gap-2",
                      validationStatus === "success" && "border-emerald-500 text-emerald-600",
                      validationStatus === "error" && "border-destructive text-destructive"
                    )}
                  >
                    {isValidating ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : validationStatus === "success" ? (
                      <ShieldCheck className="w-4 h-4" />
                    ) : validationStatus === "error" ? (
                      <AlertCircle className="w-4 h-4" />
                    ) : (
                      <ShieldCheck className="w-4 h-4" />
                    )}
                    {isValidating ? "Validando..." : "Testar Conexão"}
                  </Button>

                  <Button onClick={handleSave} disabled={isSaving} className="gap-2 px-6">
                    {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    Salvar Alterações
                  </Button>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </section>
    </main>
  );
};

export default SettingsPage;
