import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { QrCode, CreditCard, Save, Loader2 } from "lucide-react";

interface PaymentGatewayConfigProps {
  profileId: string;
}

interface PaymentGateway {
  id?: string;
  gateway_type: string;
  is_active: boolean;
  pix_key?: string;
  pix_key_type?: string;
  card_enabled?: boolean;
  card_gateway?: string;
  card_api_key?: string;
  installments_enabled?: boolean;
  max_installments?: number;
}

const PaymentGatewayConfig = ({ profileId }: PaymentGatewayConfigProps) => {
  const [pixConfig, setPixConfig] = useState<PaymentGateway>({
    gateway_type: "pix",
    is_active: false,
    pix_key: "",
    pix_key_type: "cpf",
  });
  
  const [cardConfig, setCardConfig] = useState<PaymentGateway>({
    gateway_type: "credit_card",
    is_active: false,
    card_enabled: false,
    card_gateway: "",
    card_api_key: "",
    installments_enabled: false,
    max_installments: 12,
  });

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetchPaymentConfigs();
  }, [profileId]);

  const fetchPaymentConfigs = async () => {
    try {
      const { data, error } = await supabase
        .from("payment_gateways")
        .select("*")
        .eq("professional_id", profileId);

      if (error) throw error;

      const pixData = data?.find(g => g.gateway_type === "pix");
      const cardData = data?.find(g => g.gateway_type === "credit_card");

      if (pixData) {
        setPixConfig({
          ...pixData,
          pix_key: pixData.pix_key || "",
          pix_key_type: pixData.pix_key_type || "cpf",
        });
      }

      if (cardData) {
        setCardConfig({
          ...cardData,
          card_gateway: cardData.card_gateway || "",
          card_api_key: cardData.card_api_key || "",
          max_installments: cardData.max_installments || 12,
        });
      }
    } catch (error) {
      console.error("Error fetching payment configs:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const savePixConfig = async () => {
    setIsSaving(true);
    try {
      const payload = {
        professional_id: profileId,
        gateway_type: "pix",
        is_active: pixConfig.is_active,
        pix_key: pixConfig.pix_key,
        pix_key_type: pixConfig.pix_key_type,
      };

      if (pixConfig.id) {
        const { error } = await supabase
          .from("payment_gateways")
          .update(payload)
          .eq("id", pixConfig.id);
        if (error) throw error;
      } else {
        const { data, error } = await supabase
          .from("payment_gateways")
          .insert(payload)
          .select()
          .single();
        if (error) throw error;
        setPixConfig(prev => ({ ...prev, id: data.id }));
      }

      toast.success("Configuração PIX salva com sucesso!");
    } catch (error: any) {
      toast.error("Erro ao salvar configuração PIX");
      console.error(error);
    } finally {
      setIsSaving(false);
    }
  };

  const saveCardConfig = async () => {
    setIsSaving(true);
    try {
      const payload = {
        professional_id: profileId,
        gateway_type: "credit_card",
        is_active: cardConfig.is_active,
        card_enabled: cardConfig.card_enabled,
        card_gateway: cardConfig.card_gateway,
        card_api_key: cardConfig.card_api_key,
        installments_enabled: cardConfig.installments_enabled,
        max_installments: cardConfig.max_installments,
      };

      if (cardConfig.id) {
        const { error } = await supabase
          .from("payment_gateways")
          .update(payload)
          .eq("id", cardConfig.id);
        if (error) throw error;
      } else {
        const { data, error } = await supabase
          .from("payment_gateways")
          .insert(payload)
          .select()
          .single();
        if (error) throw error;
        setCardConfig(prev => ({ ...prev, id: data.id }));
      }

      toast.success("Configuração de cartão salva com sucesso!");
    } catch (error: any) {
      toast.error("Erro ao salvar configuração de cartão");
      console.error(error);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="grid gap-6 md:grid-cols-2">
      {/* PIX Configuration */}
      <Card className="bg-card border-border">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <QrCode className="h-6 w-6 text-primary" />
            </div>
            <div>
              <CardTitle className="text-foreground">Configuração PIX</CardTitle>
              <CardDescription className="text-muted-foreground">
                Configure sua chave PIX para receber pagamentos
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="pix-active" className="text-foreground">Ativar PIX</Label>
            <Switch
              id="pix-active"
              checked={pixConfig.is_active}
              onCheckedChange={(checked) => setPixConfig(prev => ({ ...prev, is_active: checked }))}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="pix-key-type" className="text-foreground">Tipo de Chave</Label>
            <Select
              value={pixConfig.pix_key_type}
              onValueChange={(value) => setPixConfig(prev => ({ ...prev, pix_key_type: value }))}
            >
              <SelectTrigger className="bg-muted border-border text-foreground">
                <SelectValue placeholder="Selecione o tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="cpf">CPF</SelectItem>
                <SelectItem value="cnpj">CNPJ</SelectItem>
                <SelectItem value="email">Email</SelectItem>
                <SelectItem value="phone">Telefone</SelectItem>
                <SelectItem value="random">Chave Aleatória</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="pix-key" className="text-foreground">Chave PIX</Label>
            <Input
              id="pix-key"
              value={pixConfig.pix_key}
              onChange={(e) => setPixConfig(prev => ({ ...prev, pix_key: e.target.value }))}
              placeholder="Sua chave PIX"
              className="bg-muted border-border text-foreground"
            />
          </div>

          <Button onClick={savePixConfig} disabled={isSaving} className="w-full">
            {isSaving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
            Salvar Configuração
          </Button>
        </CardContent>
      </Card>

      {/* Credit Card Configuration */}
      <Card className="bg-card border-border">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <CreditCard className="h-6 w-6 text-primary" />
            </div>
            <div>
              <CardTitle className="text-foreground">Configuração Cartão</CardTitle>
              <CardDescription className="text-muted-foreground">
                Configure seu gateway para cartão de crédito
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="card-active" className="text-foreground">Ativar Cartão</Label>
            <Switch
              id="card-active"
              checked={cardConfig.is_active}
              onCheckedChange={(checked) => setCardConfig(prev => ({ ...prev, is_active: checked }))}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="card-gateway" className="text-foreground">Gateway de Pagamento</Label>
            <Select
              value={cardConfig.card_gateway}
              onValueChange={(value) => setCardConfig(prev => ({ ...prev, card_gateway: value }))}
            >
              <SelectTrigger className="bg-muted border-border text-foreground">
                <SelectValue placeholder="Selecione o gateway" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="mercadopago">Mercado Pago</SelectItem>
                <SelectItem value="pagarme">Pagar.me</SelectItem>
                <SelectItem value="stripe">Stripe</SelectItem>
                <SelectItem value="pagseguro">PagSeguro</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="installments" className="text-foreground">Permitir Parcelamento</Label>
            <Switch
              id="installments"
              checked={cardConfig.installments_enabled}
              onCheckedChange={(checked) => setCardConfig(prev => ({ ...prev, installments_enabled: checked }))}
            />
          </div>

          {cardConfig.installments_enabled && (
            <div className="space-y-2">
              <Label htmlFor="max-installments" className="text-foreground">Máximo de Parcelas</Label>
              <Select
                value={String(cardConfig.max_installments)}
                onValueChange={(value) => setCardConfig(prev => ({ ...prev, max_installments: parseInt(value) }))}
              >
                <SelectTrigger className="bg-muted border-border text-foreground">
                  <SelectValue placeholder="Máximo de parcelas" />
                </SelectTrigger>
                <SelectContent>
                  {[2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(num => (
                    <SelectItem key={num} value={String(num)}>{num}x</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <Button onClick={saveCardConfig} disabled={isSaving} className="w-full">
            {isSaving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
            Salvar Configuração
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default PaymentGatewayConfig;
