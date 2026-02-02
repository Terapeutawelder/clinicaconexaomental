import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import Logo from "@/components/Logo";
import {
  Crown,
  Star,
  Check,
  Loader2,
  CreditCard,
  Banknote,
  Shield,
  ArrowLeft,
  Zap,
} from "lucide-react";

// Gateway logos
import stripeLogo from "@/assets/gateway-stripe.svg";
import mercadopagoLogo from "@/assets/gateway-mercadopago.png";
import asaasLogo from "@/assets/gateway-asaas.svg";

interface PlanConfig {
  id: string;
  name: string;
  icon: typeof Crown;
  description: string;
  prices: {
    monthly: number;
    semiannual: number;
    annual: number;
  };
  features: string[];
  popular?: boolean;
}

const plans: PlanConfig[] = [
  {
    id: "pro",
    name: "Plano Pro",
    icon: Star,
    description: "Ideal para profissionais que estão começando",
    prices: {
      monthly: 14700,
      semiannual: 59700,
      annual: 99700,
    },
    features: [
      "Perfil na plataforma AcolheAqui",
      "CRM com agenda completa",
      "Controle financeiro",
      "Landing Page personalizada",
      "Integração WhatsApp",
      "Notificações automáticas",
      "Sala de atendimento virtual",
    ],
  },
  {
    id: "premium",
    name: "Plano Premium",
    icon: Crown,
    description: "Para profissionais que querem crescer ainda mais",
    prices: {
      monthly: 29700,
      semiannual: 97 * 600, // 6x 97
      annual: 97 * 1200, // 12x 97
    },
    features: [
      "Tudo do Plano Pro",
      "Checkout personalizado",
      "Área de membros",
      "Cursos e infoprodutos",
      "Agentes IA para agendamento",
      "Agente IA para Instagram",
      "Agente IA Follow-up",
      "Múltiplos gateways de pagamento",
      "Suporte prioritário",
    ],
    popular: true,
  },
];

const gateways = [
  { id: "mercadopago", name: "Mercado Pago", logo: mercadopagoLogo, methods: ["pix", "card", "boleto"] },
  { id: "stripe", name: "Stripe", logo: stripeLogo, methods: ["card", "pix"] },
  { id: "asaas", name: "Asaas", logo: asaasLogo, methods: ["pix", "boleto"] },
];

const billingCycles = [
  { id: "monthly", name: "Mensal", discount: 0 },
  { id: "semiannual", name: "Semestral", discount: 15 },
  { id: "annual", name: "Anual", discount: 30 },
];

const Assinar = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);

  const [selectedPlan, setSelectedPlan] = useState(searchParams.get("plan") || "pro");
  const [billingCycle, setBillingCycle] = useState<"monthly" | "semiannual" | "annual">("monthly");
  const [selectedGateway, setSelectedGateway] = useState("mercadopago");
  const [paymentMethod, setPaymentMethod] = useState<"pix" | "card">("pix");

  // Customer data
  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [customerCpf, setCustomerCpf] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (session?.user) {
      setUser(session.user);
      setCustomerEmail(session.user.email || "");

      const { data: profileData } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", session.user.id)
        .single();

      if (profileData) {
        setProfile(profileData);
        setCustomerName(profileData.full_name || "");
        setCustomerPhone(profileData.phone || "");
      }
    }

    setIsLoading(false);
  };

  const currentPlan = plans.find(p => p.id === selectedPlan) || plans[0];
  const currentPrice = currentPlan.prices[billingCycle];
  const currentGateway = gateways.find(g => g.id === selectedGateway) || gateways[0];

  const formatPrice = (cents: number) => {
    return (cents / 100).toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
  };

  const getInstallments = () => {
    switch (billingCycle) {
      case "semiannual":
        return 6;
      case "annual":
        return 12;
      default:
        return 1;
    }
  };

  const formatCpf = (value: string) => {
    return value
      .replace(/\D/g, "")
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d{1,2})/, "$1-$2")
      .replace(/(-\d{2})\d+?$/, "$1");
  };

  const formatPhone = (value: string) => {
    return value
      .replace(/\D/g, "")
      .replace(/(\d{2})(\d)/, "($1) $2")
      .replace(/(\d{5})(\d)/, "$1-$2")
      .replace(/(-\d{4})\d+?$/, "$1");
  };

  const handleSubscribe = async () => {
    if (!customerName || !customerEmail || !customerCpf) {
      toast({
        title: "Dados incompletos",
        description: "Preencha todos os campos obrigatórios.",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);

    try {
      // Create or get subscription
      let professionalId = profile?.id;

      if (!professionalId && user) {
        // Create profile if doesn't exist
        const { data: newProfile, error: profileError } = await supabase
          .from("profiles")
          .insert({
            user_id: user.id,
            email: customerEmail,
            full_name: customerName,
            phone: customerPhone,
            is_professional: true,
          })
          .select()
          .single();

        if (profileError) throw profileError;
        professionalId = newProfile.id;
      }

      // Call gateway to create subscription/payment
      const { data, error } = await supabase.functions.invoke("gateway-payment", {
        body: {
          gateway: selectedGateway,
          action: paymentMethod === "pix" ? "create_pix" : "create_card",
          amount: currentPrice,
          description: `${currentPlan.name} - ${billingCycles.find(b => b.id === billingCycle)?.name}`,
          customer: {
            name: customerName,
            email: customerEmail,
            cpf: customerCpf.replace(/\D/g, ""),
            phone: customerPhone.replace(/\D/g, ""),
          },
          metadata: {
            professional_id: professionalId,
            plan: selectedPlan,
            billing_cycle: billingCycle,
            type: "subscription",
          },
        },
      });

      if (error) throw error;

      // Create subscription record
      await supabase.from("subscriptions").upsert({
        professional_id: professionalId,
        plan: selectedPlan as "pro" | "premium",
        status: "trialing",
        gateway: selectedGateway,
        gateway_subscription_id: data.id,
        amount_cents: currentPrice,
        billing_cycle: billingCycle,
        current_period_start: new Date().toISOString(),
      }, { onConflict: "professional_id" });

      // Handle payment response
      if (paymentMethod === "pix" && data.pix_qr_code) {
        // Redirect to PIX payment page or show QR code
        toast({
          title: "PIX gerado!",
          description: "Escaneie o QR Code para finalizar o pagamento.",
        });
        // You could navigate to a PIX payment page here
        navigate(`/assinar/pix?code=${encodeURIComponent(data.pix_qr_code)}&copy=${encodeURIComponent(data.pix_copy_paste || "")}`);
      } else if (data.checkout_url) {
        // Redirect to external checkout
        window.location.href = data.checkout_url;
      } else {
        toast({
          title: "Assinatura iniciada!",
          description: "Você será redirecionado para o pagamento.",
        });
      }
    } catch (error: any) {
      console.error("Subscription error:", error);
      toast({
        title: "Erro ao processar",
        description: error.message || "Tente novamente mais tarde.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <header className="border-b border-slate-700/50 bg-slate-900/50 backdrop-blur-xl sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate(-1)}
              className="text-slate-400 hover:text-white"
            >
              <ArrowLeft size={20} />
            </Button>
            <Logo size="sm" variant="light" />
          </div>
          <div className="flex items-center gap-2 text-sm text-slate-400">
            <Shield size={16} className="text-green-400" />
            Pagamento seguro
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 md:py-12">
        <div className="max-w-5xl mx-auto">
          {/* Title */}
          <div className="text-center mb-8">
            <h1 className="text-2xl md:text-4xl font-bold text-white mb-2">
              Escolha seu plano
            </h1>
            <p className="text-slate-400">
              Comece agora e transforme sua prática profissional
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-6">
            {/* Left Column - Plan Selection */}
            <div className="lg:col-span-2 space-y-6">
              {/* Plans */}
              <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Zap className="w-5 h-5 text-primary" />
                    Plano
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <RadioGroup value={selectedPlan} onValueChange={setSelectedPlan} className="grid md:grid-cols-2 gap-4">
                    {plans.map((plan) => (
                      <Label
                        key={plan.id}
                        htmlFor={plan.id}
                        className={`relative flex flex-col p-4 rounded-xl border-2 cursor-pointer transition-all ${
                          selectedPlan === plan.id
                            ? "border-primary bg-primary/10"
                            : "border-slate-700 hover:border-slate-600"
                        }`}
                      >
                        <RadioGroupItem value={plan.id} id={plan.id} className="sr-only" />
                        {plan.popular && (
                          <Badge className="absolute -top-2 -right-2 bg-primary">Mais popular</Badge>
                        )}
                        <div className="flex items-center gap-3 mb-3">
                          <div className={`p-2 rounded-lg ${plan.id === "premium" ? "bg-purple-500/20" : "bg-blue-500/20"}`}>
                            <plan.icon className={`w-5 h-5 ${plan.id === "premium" ? "text-purple-400" : "text-blue-400"}`} />
                          </div>
                          <div>
                            <p className="font-semibold text-white">{plan.name}</p>
                            <p className="text-xs text-slate-400">{plan.description}</p>
                          </div>
                        </div>
                        <ul className="space-y-1.5">
                          {plan.features.slice(0, 4).map((feature, i) => (
                            <li key={i} className="flex items-center gap-2 text-sm text-slate-300">
                              <Check className="w-3.5 h-3.5 text-green-400 flex-shrink-0" />
                              {feature}
                            </li>
                          ))}
                          {plan.features.length > 4 && (
                            <li className="text-xs text-slate-500">
                              +{plan.features.length - 4} recursos
                            </li>
                          )}
                        </ul>
                      </Label>
                    ))}
                  </RadioGroup>
                </CardContent>
              </Card>

              {/* Billing Cycle */}
              <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white">Ciclo de cobrança</CardTitle>
                </CardHeader>
                <CardContent>
                  <RadioGroup
                    value={billingCycle}
                    onValueChange={(v) => setBillingCycle(v as any)}
                    className="grid grid-cols-3 gap-3"
                  >
                    {billingCycles.map((cycle) => (
                      <Label
                        key={cycle.id}
                        htmlFor={`cycle-${cycle.id}`}
                        className={`relative flex flex-col items-center p-3 rounded-xl border-2 cursor-pointer transition-all ${
                          billingCycle === cycle.id
                            ? "border-primary bg-primary/10"
                            : "border-slate-700 hover:border-slate-600"
                        }`}
                      >
                        <RadioGroupItem value={cycle.id} id={`cycle-${cycle.id}`} className="sr-only" />
                        <p className="font-medium text-white text-sm">{cycle.name}</p>
                        {cycle.discount > 0 && (
                          <Badge variant="outline" className="mt-1 text-xs border-green-500/50 text-green-400">
                            -{cycle.discount}%
                          </Badge>
                        )}
                      </Label>
                    ))}
                  </RadioGroup>
                </CardContent>
              </Card>

              {/* Payment Gateway */}
              <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white">Gateway de pagamento</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <RadioGroup
                    value={selectedGateway}
                    onValueChange={setSelectedGateway}
                    className="grid grid-cols-3 gap-3"
                  >
                    {gateways.map((gateway) => (
                      <Label
                        key={gateway.id}
                        htmlFor={`gateway-${gateway.id}`}
                        className={`flex flex-col items-center p-3 rounded-xl border-2 cursor-pointer transition-all ${
                          selectedGateway === gateway.id
                            ? "border-primary bg-primary/10"
                            : "border-slate-700 hover:border-slate-600"
                        }`}
                      >
                        <RadioGroupItem value={gateway.id} id={`gateway-${gateway.id}`} className="sr-only" />
                        <img src={gateway.logo} alt={gateway.name} className="h-6 object-contain mb-1" />
                        <p className="text-xs text-slate-400">{gateway.name}</p>
                      </Label>
                    ))}
                  </RadioGroup>

                  {/* Payment Method */}
                  <div className="pt-4 border-t border-slate-700">
                    <p className="text-sm text-slate-400 mb-3">Método de pagamento</p>
                    <RadioGroup
                      value={paymentMethod}
                      onValueChange={(v) => setPaymentMethod(v as any)}
                      className="flex gap-3"
                    >
                      {currentGateway.methods.includes("pix") && (
                        <Label
                          htmlFor="method-pix"
                          className={`flex items-center gap-2 px-4 py-2 rounded-lg border-2 cursor-pointer transition-all ${
                            paymentMethod === "pix"
                              ? "border-primary bg-primary/10"
                              : "border-slate-700 hover:border-slate-600"
                          }`}
                        >
                          <RadioGroupItem value="pix" id="method-pix" className="sr-only" />
                          <Banknote className="w-4 h-4 text-green-400" />
                          <span className="text-white text-sm">PIX</span>
                        </Label>
                      )}
                      {currentGateway.methods.includes("card") && (
                        <Label
                          htmlFor="method-card"
                          className={`flex items-center gap-2 px-4 py-2 rounded-lg border-2 cursor-pointer transition-all ${
                            paymentMethod === "card"
                              ? "border-primary bg-primary/10"
                              : "border-slate-700 hover:border-slate-600"
                          }`}
                        >
                          <RadioGroupItem value="card" id="method-card" className="sr-only" />
                          <CreditCard className="w-4 h-4 text-blue-400" />
                          <span className="text-white text-sm">Cartão</span>
                        </Label>
                      )}
                    </RadioGroup>
                  </div>
                </CardContent>
              </Card>

              {/* Customer Data */}
              <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white">Seus dados</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-slate-300">Nome completo *</Label>
                      <Input
                        value={customerName}
                        onChange={(e) => setCustomerName(e.target.value)}
                        placeholder="Seu nome"
                        className="bg-slate-700/50 border-slate-600 text-white"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-slate-300">E-mail *</Label>
                      <Input
                        type="email"
                        value={customerEmail}
                        onChange={(e) => setCustomerEmail(e.target.value)}
                        placeholder="seu@email.com"
                        className="bg-slate-700/50 border-slate-600 text-white"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-slate-300">CPF *</Label>
                      <Input
                        value={customerCpf}
                        onChange={(e) => setCustomerCpf(formatCpf(e.target.value))}
                        placeholder="000.000.000-00"
                        maxLength={14}
                        className="bg-slate-700/50 border-slate-600 text-white"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-slate-300">Telefone</Label>
                      <Input
                        value={customerPhone}
                        onChange={(e) => setCustomerPhone(formatPhone(e.target.value))}
                        placeholder="(00) 00000-0000"
                        maxLength={15}
                        className="bg-slate-700/50 border-slate-600 text-white"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Right Column - Summary */}
            <div className="lg:col-span-1">
              <div className="sticky top-24">
                <Card className="bg-slate-800/50 border-slate-700">
                  <CardHeader>
                    <CardTitle className="text-white">Resumo</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center gap-3 p-3 bg-slate-700/30 rounded-lg">
                      <div className={`p-2 rounded-lg ${currentPlan.id === "premium" ? "bg-purple-500/20" : "bg-blue-500/20"}`}>
                        <currentPlan.icon className={`w-5 h-5 ${currentPlan.id === "premium" ? "text-purple-400" : "text-blue-400"}`} />
                      </div>
                      <div>
                        <p className="font-semibold text-white">{currentPlan.name}</p>
                        <p className="text-xs text-slate-400">
                          {billingCycles.find(b => b.id === billingCycle)?.name}
                        </p>
                      </div>
                    </div>

                    <div className="space-y-2 pt-4 border-t border-slate-700">
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-400">Valor</span>
                        <span className="text-white">{formatPrice(currentPrice)}</span>
                      </div>
                      {getInstallments() > 1 && (
                        <div className="flex justify-between text-sm">
                          <span className="text-slate-400">Parcelamento</span>
                          <span className="text-white">
                            {getInstallments()}x de {formatPrice(currentPrice / getInstallments())}
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="pt-4 border-t border-slate-700">
                      <div className="flex justify-between items-center mb-4">
                        <span className="text-lg text-white font-semibold">Total</span>
                        <span className="text-2xl font-bold text-primary">
                          {formatPrice(currentPrice)}
                        </span>
                      </div>

                      <Button
                        onClick={handleSubscribe}
                        disabled={isProcessing}
                        className="w-full bg-primary hover:bg-primary/90 text-lg py-6"
                      >
                        {isProcessing ? (
                          <>
                            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                            Processando...
                          </>
                        ) : (
                          <>
                            {paymentMethod === "pix" ? <Banknote className="mr-2 h-5 w-5" /> : <CreditCard className="mr-2 h-5 w-5" />}
                            Assinar agora
                          </>
                        )}
                      </Button>

                      <p className="text-xs text-slate-500 text-center mt-3">
                        Ao assinar, você concorda com nossos{" "}
                        <a href="/termos-de-uso" className="text-primary hover:underline">
                          Termos de Uso
                        </a>{" "}
                        e{" "}
                        <a href="/politica-de-privacidade" className="text-primary hover:underline">
                          Política de Privacidade
                        </a>
                      </p>
                    </div>
                  </CardContent>
                </Card>

                {/* Security badges */}
                <div className="mt-4 flex items-center justify-center gap-4 text-slate-500 text-xs">
                  <div className="flex items-center gap-1">
                    <Shield size={14} />
                    SSL Seguro
                  </div>
                  <div className="flex items-center gap-1">
                    <Check size={14} />
                    Dados protegidos
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Assinar;
