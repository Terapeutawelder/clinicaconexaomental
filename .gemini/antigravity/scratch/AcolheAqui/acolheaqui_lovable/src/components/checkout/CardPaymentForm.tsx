import { useState, useEffect, useCallback } from "react";
import { 
  CreditCard, 
  Lock, 
  Shield, 
  Loader2,
  CheckCircle,
  AlertCircle
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";

interface CardPaymentFormProps {
  gateway: string;
  accessToken: string;
  amount: number;
  description: string;
  customerData: {
    name: string;
    email: string;
    cpf: string;
    phone?: string;
  };
  professionalId: string;
  serviceId: string;
  maxInstallments?: number;
  onSuccess: (transactionId: string) => void;
  onError: (error: string) => void;
}

interface CardData {
  number: string;
  holder: string;
  expMonth: string;
  expYear: string;
  cvv: string;
  installments: number;
}

declare global {
  interface Window {
    MercadoPago?: any;
    Stripe?: any;
  }
}

const CardPaymentForm = ({
  gateway,
  accessToken,
  amount,
  description,
  customerData,
  professionalId,
  serviceId,
  maxInstallments = 12,
  onSuccess,
  onError,
}: CardPaymentFormProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [sdkLoaded, setSdkLoaded] = useState(false);
  const [cardData, setCardData] = useState<CardData>({
    number: "",
    holder: "",
    expMonth: "",
    expYear: "",
    cvv: "",
    installments: 1,
  });
  const [cardBrand, setCardBrand] = useState<string | null>(null);
  const [mpInstance, setMpInstance] = useState<any>(null);

  // Load gateway SDK
  useEffect(() => {
    const loadSDK = async () => {
      try {
        if (gateway === "mercadopago") {
          await loadMercadoPagoSDK();
        } else if (gateway === "stripe") {
          await loadStripeSDK();
        } else {
          // For other gateways, we'll use the backend tokenization
          setSdkLoaded(true);
        }
      } catch (error) {
        console.error("Error loading SDK:", error);
        setSdkLoaded(true); // Continue without SDK
      }
    };

    loadSDK();
  }, [gateway, accessToken]);

  const loadMercadoPagoSDK = async () => {
    if (window.MercadoPago) {
      initMercadoPago();
      return;
    }

    const script = document.createElement("script");
    script.src = "https://sdk.mercadopago.com/js/v2";
    script.async = true;
    script.onload = () => initMercadoPago();
    document.body.appendChild(script);
  };

  const initMercadoPago = () => {
    if (window.MercadoPago && accessToken) {
      const mp = new window.MercadoPago(accessToken, { locale: "pt-BR" });
      setMpInstance(mp);
      setSdkLoaded(true);
    }
  };

  const loadStripeSDK = async () => {
    if (window.Stripe) {
      setSdkLoaded(true);
      return;
    }

    const script = document.createElement("script");
    script.src = "https://js.stripe.com/v3/";
    script.async = true;
    script.onload = () => setSdkLoaded(true);
    document.body.appendChild(script);
  };

  const formatCardNumber = (value: string) => {
    const cleaned = value.replace(/\D/g, "");
    const groups = cleaned.match(/.{1,4}/g) || [];
    return groups.join(" ").substring(0, 19);
  };

  const detectCardBrand = (number: string) => {
    const cleaned = number.replace(/\D/g, "");
    
    if (/^4/.test(cleaned)) return "visa";
    if (/^5[1-5]/.test(cleaned)) return "mastercard";
    if (/^3[47]/.test(cleaned)) return "amex";
    if (/^6(?:011|5)/.test(cleaned)) return "discover";
    if (/^(36|38|30[0-5])/.test(cleaned)) return "diners";
    if (/^(636368|636297|504175|438935|40117[8-9]|45763[1-2]|457393|431274|50990[0-2]|5099[7-9][0-9]|50996[4-9]|509[1-8][0-9]{2}|5090(0[0-2]|0[4-9]|1[2-9]|[24589][0-9]|3[1-9]|6[0-46-9]|7[0-24-9])|5067(0[0-24-8]|1[0-24-9]|2[014-9]|3[0-379]|4[0-9]|5[0-3]|6[0-5]|7[0-8])|6504(0[5-9]|1[0-9]|2[0-9]|3[0-9])|6504(8[5-9]|9[0-9])|6505(0[0-9]|1[0-9]|2[0-9]|3[0-8])|6507(0[0-9]|1[0-8])|65072[0-7]|6509(0[1-9]|1[0-9]|20)|6516(5[2-9]|6[0-9]|7[0-9])|6550(0[0-9]|1[0-9])|6550(2[1-9]|3[0-9]|4[0-9]|5[0-8]))/.test(cleaned)) return "elo";
    if (/^(606282|3841)/.test(cleaned)) return "hipercard";
    
    return null;
  };

  const handleCardNumberChange = (value: string) => {
    const formatted = formatCardNumber(value);
    setCardData(prev => ({ ...prev, number: formatted }));
    setCardBrand(detectCardBrand(value));
  };

  const getInstallmentOptions = () => {
    const options = [];
    for (let i = 1; i <= maxInstallments; i++) {
      const installmentValue = amount / i;
      const label = i === 1 
        ? `1x de ${formatCurrency(amount)} (sem juros)` 
        : `${i}x de ${formatCurrency(installmentValue)} ${i <= 3 ? "(sem juros)" : ""}`;
      options.push({ value: i, label });
    }
    return options;
  };

  const formatCurrency = (value: number) => {
    return value.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
  };

  const tokenizeCard = async (): Promise<string | null> => {
    if (gateway === "mercadopago" && mpInstance) {
      try {
        const cardToken = await mpInstance.createCardToken({
          cardNumber: cardData.number.replace(/\s/g, ""),
          cardholderName: cardData.holder,
          cardExpirationMonth: cardData.expMonth,
          cardExpirationYear: cardData.expYear,
          securityCode: cardData.cvv,
          identificationType: "CPF",
          identificationNumber: customerData.cpf.replace(/\D/g, ""),
        });
        return cardToken.id;
      } catch (error) {
        console.error("MercadoPago tokenization error:", error);
        throw new Error("Erro ao processar dados do cartão");
      }
    }

    if (gateway === "stripe" && window.Stripe) {
      // For Stripe, we would use Stripe Elements in production
      // This is a simplified version
      return null;
    }

    // For other gateways, return null and let backend handle it
    return null;
  };

  const handleSubmit = async () => {
    if (!cardData.number || !cardData.holder || !cardData.expMonth || !cardData.expYear || !cardData.cvv) {
      toast.error("Preencha todos os dados do cartão");
      return;
    }

    setIsLoading(true);

    try {
      // Create transaction record
      const { data: transaction, error: txError } = await supabase
        .from("transactions")
        .insert({
          professional_id: professionalId,
          service_id: serviceId,
          customer_name: customerData.name,
          customer_email: customerData.email,
          customer_phone: customerData.phone || null,
          customer_cpf: customerData.cpf,
          amount_cents: Math.round(amount * 100),
          payment_method: "credit_card",
          payment_status: "pending",
          gateway: gateway,
        })
        .select()
        .single();

      if (txError) throw txError;

      // Tokenize card if SDK is available
      let cardToken: string | null = null;
      try {
        cardToken = await tokenizeCard();
      } catch (tokenError) {
        console.log("Tokenization not available, using backend processing");
      }

      const nameParts = customerData.name.split(" ");
      const firstName = nameParts[0];
      const lastName = nameParts.slice(1).join(" ") || firstName;

      // Process payment via edge function
      const response = await supabase.functions.invoke("gateway-payment", {
        body: {
          gateway,
          action: "create_card",
          accessToken,
          amount,
          description,
          payer: {
            email: customerData.email,
            first_name: firstName,
            last_name: lastName,
            identification: {
              type: "CPF",
              number: customerData.cpf.replace(/\D/g, ""),
            },
          },
          card: cardToken 
            ? { token: cardToken, installments: cardData.installments }
            : {
                number: cardData.number.replace(/\s/g, ""),
                holder_name: cardData.holder,
                exp_month: cardData.expMonth,
                exp_year: cardData.expYear,
                cvv: cardData.cvv,
                installments: cardData.installments,
              },
        },
      });

      if (response.error) {
        throw new Error(response.error.message || "Erro ao processar pagamento");
      }

      const result = response.data;

      if (!result.success) {
        throw new Error(result.error || "Pagamento não aprovado");
      }

      // Update transaction
      await supabase
        .from("transactions")
        .update({
          payment_status: result.status === "approved" ? "approved" : "pending",
          gateway_payment_id: result.payment_id,
          gateway_response: result,
        })
        .eq("id", transaction.id);

      if (result.status === "approved") {
        toast.success("Pagamento aprovado!");
        onSuccess(transaction.id);
      } else {
        toast.info("Pagamento em processamento");
        onSuccess(transaction.id);
      }
    } catch (error) {
      console.error("Payment error:", error);
      const errorMessage = error instanceof Error ? error.message : "Erro ao processar pagamento";
      toast.error(errorMessage);
      onError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 15 }, (_, i) => currentYear + i);
  const months = Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(2, "0"));

  return (
    <div className="space-y-4">
      {/* Card Number */}
      <div>
        <Label className="text-sm font-medium">Número do Cartão</Label>
        <div className="relative mt-1">
          <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <Input
            type="text"
            placeholder="0000 0000 0000 0000"
            value={cardData.number}
            onChange={(e) => handleCardNumberChange(e.target.value)}
            className="pl-10 pr-16"
            maxLength={19}
          />
          {cardBrand && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              <span className="text-xs font-medium uppercase text-muted-foreground bg-muted px-2 py-1 rounded">
                {cardBrand}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Card Holder */}
      <div>
        <Label className="text-sm font-medium">Nome no Cartão</Label>
        <Input
          type="text"
          placeholder="NOME COMO ESTÁ NO CARTÃO"
          value={cardData.holder}
          onChange={(e) => setCardData(prev => ({ ...prev, holder: e.target.value.toUpperCase() }))}
          className="mt-1"
        />
      </div>

      {/* Expiry and CVV */}
      <div className="grid grid-cols-3 gap-3">
        <div>
          <Label className="text-sm font-medium">Mês</Label>
          <Select
            value={cardData.expMonth}
            onValueChange={(v) => setCardData(prev => ({ ...prev, expMonth: v }))}
          >
            <SelectTrigger className="mt-1">
              <SelectValue placeholder="MM" />
            </SelectTrigger>
            <SelectContent>
              {months.map((month) => (
                <SelectItem key={month} value={month}>
                  {month}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label className="text-sm font-medium">Ano</Label>
          <Select
            value={cardData.expYear}
            onValueChange={(v) => setCardData(prev => ({ ...prev, expYear: v }))}
          >
            <SelectTrigger className="mt-1">
              <SelectValue placeholder="AAAA" />
            </SelectTrigger>
            <SelectContent>
              {years.map((year) => (
                <SelectItem key={year} value={String(year)}>
                  {year}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label className="text-sm font-medium">CVV</Label>
          <div className="relative mt-1">
            <Input
              type="password"
              placeholder="***"
              value={cardData.cvv}
              onChange={(e) => setCardData(prev => ({ ...prev, cvv: e.target.value.replace(/\D/g, "").substring(0, 4) }))}
              maxLength={4}
            />
            <Lock className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          </div>
        </div>
      </div>

      {/* Installments */}
      <div>
        <Label className="text-sm font-medium">Parcelas</Label>
        <Select
          value={String(cardData.installments)}
          onValueChange={(v) => setCardData(prev => ({ ...prev, installments: parseInt(v) }))}
        >
          <SelectTrigger className="mt-1">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {getInstallmentOptions().map((opt) => (
              <SelectItem key={opt.value} value={String(opt.value)}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Security Notice */}
      <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg text-sm text-muted-foreground">
        <Shield className="w-4 h-4 flex-shrink-0" />
        <span>Pagamento 100% seguro. Seus dados são criptografados.</span>
      </div>

      {/* Submit Button */}
      <Button
        onClick={handleSubmit}
        disabled={isLoading}
        className="w-full h-12 text-base font-semibold"
        style={{ 
          backgroundColor: "var(--accent-color, hsl(var(--primary)))",
        }}
      >
        {isLoading ? (
          <>
            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
            Processando...
          </>
        ) : (
          <>
            <Lock className="w-5 h-5 mr-2" />
            Pagar {formatCurrency(amount)}
          </>
        )}
      </Button>
    </div>
  );
};

export default CardPaymentForm;
