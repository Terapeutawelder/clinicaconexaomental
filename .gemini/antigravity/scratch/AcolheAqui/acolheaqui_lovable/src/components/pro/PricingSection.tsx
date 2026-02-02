import { Check, Star, Sparkles } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";

type BillingPeriod = "monthly" | "semiannual" | "annual";

interface PlanFeature {
  text: string;
  included: boolean;
}

interface Plan {
  name: string;
  icon: React.ElementType;
  description: string;
  prices: {
    monthly: number;
    semiannual: number;
    annual: number;
  };
  features: PlanFeature[];
  popular?: boolean;
}

// All features list (Premium has all, Pro has some)
const allFeatures = [
  "Perfil em destaque na vitrine principal",
  "Acesso a CRM com agenda e pacientes",
  "Controle financeiro completo",
  "WhatsApp via QR Code e API Oficial",
  "Integração com Google Agenda e Meet",
  "Sala Virtual de videochamada",
  "Área de Membros com cursos e módulos",
  "Certificados PDF automáticos",
  "Comunidade e eventos ao vivo",
  "Agente de IA de agendamento",
  "Notificações de agendamentos no WhatsApp",
  "Landing Page personalizada",
  "Checkout de pagamento personalizado",
];

const proIncludedFeatures = [
  "Perfil em destaque na vitrine principal",
  "Acesso a CRM com agenda e pacientes",
  "Controle financeiro completo",
  "WhatsApp via QR Code e API Oficial",
  "Integração com Google Agenda e Meet",
  "Sala Virtual de videochamada",
  "Landing Page personalizada",
];

const plans: Plan[] = [
  {
    name: "Plano Pro",
    icon: Star,
    description: "Ideal para começar sua jornada na plataforma",
    prices: {
      monthly: 127,
      semiannual: 397,
      annual: 597,
    },
    features: allFeatures.map((text) => ({
      text,
      included: proIncludedFeatures.includes(text),
    })),
  },
  {
    name: "Plano Premium",
    icon: Sparkles,
    description: "Recursos completos para profissionais que querem crescer",
    prices: {
      monthly: 297,
      semiannual: 897,
      annual: 1164,
    },
    features: allFeatures.map((text) => ({
      text,
      included: true,
    })),
    popular: true,
  },
];

const billingLabels: Record<BillingPeriod, string> = {
  monthly: "Mensal",
  semiannual: "Semestral",
  annual: "Anual",
};

const PricingSection = () => {
  const [billingPeriod, setBillingPeriod] = useState<BillingPeriod>("monthly");

  const formatPrice = (price: number) => {
    return price.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
      minimumFractionDigits: 2,
    });
  };

  const getPeriodLabel = (period: BillingPeriod) => {
    switch (period) {
      case "monthly":
        return "/mês";
      case "semiannual":
        return "/semestre";
      case "annual":
        return "/ano";
    }
  };

  const getDiscount = (plan: Plan, period: BillingPeriod) => {
    if (period === "monthly") return null;
    const monthlyTotal = plan.prices.monthly * (period === "semiannual" ? 6 : 12);
    const periodPrice = plan.prices[period];
    const discount = Math.round(((monthlyTotal - periodPrice) / monthlyTotal) * 100);
    return discount > 0 ? discount : null;
  };

  return (
    <section id="precos" className="py-20 bg-[hsl(215,35%,12%)]">
      <div className="container mx-auto px-4">
        {/* Section Title */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-white">
            Plano e preço
          </h2>
          <p className="text-white/70 text-lg max-w-2xl mx-auto">
            Escolha o plano ideal para sua prática profissional
          </p>
        </div>

        {/* Billing Toggle */}
        <div className="flex justify-center mb-12">
          <div className="inline-flex bg-[hsl(215,35%,18%)] border border-white/10 rounded-full p-1">
            {(["monthly", "semiannual", "annual"] as BillingPeriod[]).map((period) => (
              <button
                key={period}
                onClick={() => setBillingPeriod(period)}
                className={`px-6 py-2 rounded-full text-sm font-medium transition-all ${
                  billingPeriod === period
                    ? "bg-primary text-white"
                    : "text-white/70 hover:text-white"
                }`}
              >
                {billingLabels[period]}
              </button>
            ))}
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {plans.map((plan, index) => {
            const discount = getDiscount(plan, billingPeriod);
            
            return (
              <div
                key={index}
                className={`relative p-8 rounded-3xl border-2 transition-all ${
                  plan.popular
                    ? "border-primary bg-[hsl(215,35%,18%)] shadow-2xl shadow-primary/20"
                    : "border-white/10 bg-[hsl(215,35%,18%)] hover:border-primary/50"
                }`}
              >
                {/* Popular badge */}
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                    <span className="bg-primary text-white text-sm font-semibold px-4 py-1 rounded-full">
                      Mais popular
                    </span>
                  </div>
                )}

                {/* Plan header */}
                <div className="text-center mb-8">
                  <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 ${
                    plan.popular ? "bg-primary/20" : "bg-white/10"
                  }`}>
                    <plan.icon className={`w-8 h-8 ${plan.popular ? "text-primary" : "text-white/70"}`} />
                  </div>
                  <h3 className="text-2xl font-bold mb-2 text-white">{plan.name}</h3>
                  <p className="text-white/60 text-sm">{plan.description}</p>
                </div>

                {/* Price */}
                <div className="text-center mb-8">
                  {discount && (
                    <div className="mb-2">
                      <span className="bg-green-500/20 text-green-400 text-sm font-semibold px-3 py-1 rounded-full">
                        {discount}% OFF
                      </span>
                    </div>
                  )}
                  <div className="flex items-end justify-center gap-1">
                    <span className="text-4xl md:text-5xl font-bold text-white">
                      {formatPrice(plan.prices[billingPeriod])}
                    </span>
                    <span className="text-white/60 mb-2">
                      {getPeriodLabel(billingPeriod)}
                    </span>
                  </div>
                </div>

                {/* Features */}
                <ul className="space-y-4 mb-8">
                  {plan.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-start gap-3">
                      <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${
                        feature.included ? "bg-primary/20" : "bg-white/10"
                      }`}>
                        <Check className={`w-3 h-3 ${
                          feature.included ? "text-primary" : "text-white/30"
                        }`} />
                      </div>
                      <span className={feature.included ? "text-white" : "text-white/40 line-through"}>
                        {feature.text}
                      </span>
                    </li>
                  ))}
                </ul>

                {/* CTA Button */}
                <Link
                  to={plan.popular ? "/cadastro/premium" : "/cadastro/pro"}
                  className="block w-full py-4 text-center font-semibold rounded-full transition-all hover:scale-105 bg-primary text-white hover:bg-primary/90"
                >
                  Começar agora
                </Link>
              </div>
            );
          })}
        </div>

        {/* Additional info */}
        <p className="text-center text-white/60 text-sm mt-8">
          Todos os planos incluem suporte via WhatsApp e atualizações gratuitas
        </p>
      </div>
    </section>
  );
};

export default PricingSection;
