import { Check, X, Star, Crown, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { useEffect, useRef, useState } from "react";

interface PlanComparisonSectionProps {
  currentPlan: "pro" | "premium";
}

const features = [
  { name: "Perfil na plataforma AcolheAqui", pro: true, premium: true },
  { name: "Acesso a CRM com agenda", pro: true, premium: true },
  { name: "Controle financeiro", pro: true, premium: true },
  { name: "Integração com WhatsApp", pro: true, premium: true },
  { name: "Integração com Google Agenda e Meet", pro: true, premium: true },
  { name: "Sala de videochamada", pro: true, premium: true },
  { name: "Relatórios mensais", pro: true, premium: true },
  { name: "Suporte prioritário", pro: true, premium: true },
  { name: "Agente de IA de agendamento", pro: false, premium: true },
  { name: "Notificações automáticas no WhatsApp", pro: false, premium: true },
  { name: "Agente de IA do Instagram", pro: false, premium: true },
  { name: "Agente de IA Follow-up", pro: false, premium: true },
  { name: "Checkout de pagamento próprio", pro: false, premium: true },
  { name: "Suporte VIP 24/7", pro: false, premium: true },
];

const PlanComparisonSection = ({ currentPlan }: PlanComparisonSectionProps) => {
  const isProPage = currentPlan === "pro";
  const sectionRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [visibleRows, setVisibleRows] = useState<number[]>([]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          // Animate rows sequentially
          features.forEach((_, index) => {
            setTimeout(() => {
              setVisibleRows(prev => [...prev, index]);
            }, 100 * index);
          });
        }
      },
      { threshold: 0.1 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <section ref={sectionRef} className="py-20 px-4 bg-gradient-to-b from-muted/30 to-background">
      <div className="max-w-5xl mx-auto">
        <div className={`text-center mb-12 transition-all duration-700 ${
          isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
        }`}>
          <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium mb-4 ${
            isProPage 
              ? "bg-primary/10 text-primary" 
              : "bg-gradient-to-r from-amber-500/20 to-orange-500/20 text-amber-500"
          }`}>
            {isProPage ? <Star className="w-4 h-4" /> : <Crown className="w-4 h-4" />}
            Compare os Planos
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Escolha o plano ideal para{" "}
            <span className={isProPage ? "text-primary" : "text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-500"}>
              você
            </span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Veja todas as funcionalidades de cada plano e escolha o que melhor atende suas necessidades
          </p>
        </div>

        {/* Comparison Table */}
        <div className={`bg-card border border-border rounded-3xl overflow-hidden shadow-xl transition-all duration-700 delay-200 ${
          isVisible ? "opacity-100 translate-y-0 scale-100" : "opacity-0 translate-y-12 scale-95"
        }`}>
          {/* Header */}
          <div className="grid grid-cols-3 bg-muted/50">
            <div className="p-6 border-r border-border">
              <p className="text-sm text-muted-foreground font-medium">Funcionalidades</p>
            </div>
            <div className={`p-6 border-r border-border text-center ${
              isProPage ? "bg-primary/10" : ""
            }`}>
              <div className="flex items-center justify-center gap-2 mb-2">
                <Star className="w-5 h-5 text-primary" />
                <h3 className="font-bold text-foreground">Plano Pro</h3>
              </div>
              <p className="text-2xl font-bold text-primary">R$ 127<span className="text-sm">/mês</span></p>
              {isProPage && (
                <span className="inline-block mt-2 px-3 py-1 bg-primary text-primary-foreground text-xs font-bold rounded-full">
                  VOCÊ ESTÁ AQUI
                </span>
              )}
            </div>
            <div className={`p-6 text-center ${
              !isProPage ? "bg-gradient-to-br from-amber-500/10 to-orange-500/10" : ""
            }`}>
              <div className="flex items-center justify-center gap-2 mb-2">
                <Crown className="w-5 h-5 text-amber-500" />
                <h3 className="font-bold text-foreground">Plano Premium</h3>
              </div>
              <p className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-500">
                R$ 297<span className="text-sm">/mês</span>
              </p>
              {!isProPage && (
                <span className="inline-block mt-2 px-3 py-1 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-xs font-bold rounded-full">
                  VOCÊ ESTÁ AQUI
                </span>
              )}
            </div>
          </div>

          {/* Features */}
          <div className="divide-y divide-border">
            {features.map((feature, index) => (
              <div
                key={index}
                className={`grid grid-cols-3 hover:bg-muted/30 transition-all duration-500 ${
                  visibleRows.includes(index) 
                    ? "opacity-100 translate-x-0" 
                    : "opacity-0 -translate-x-4"
                }`}
              >
                <div className="p-4 border-r border-border flex items-center">
                  <span className="text-sm text-foreground">{feature.name}</span>
                </div>
                <div className={`p-4 border-r border-border flex items-center justify-center ${
                  isProPage ? "bg-primary/5" : ""
                }`}>
                  {feature.pro ? (
                    <div className={`w-6 h-6 rounded-full bg-green-500/20 flex items-center justify-center transition-transform duration-300 ${
                      visibleRows.includes(index) ? "scale-100" : "scale-0"
                    }`}>
                      <Check className="w-4 h-4 text-green-500" />
                    </div>
                  ) : (
                    <div className={`w-6 h-6 rounded-full bg-muted flex items-center justify-center transition-transform duration-300 ${
                      visibleRows.includes(index) ? "scale-100" : "scale-0"
                    }`}>
                      <X className="w-4 h-4 text-muted-foreground" />
                    </div>
                  )}
                </div>
                <div className={`p-4 flex items-center justify-center ${
                  !isProPage ? "bg-amber-500/5" : ""
                }`}>
                  {feature.premium ? (
                    <div className={`w-6 h-6 rounded-full bg-green-500/20 flex items-center justify-center transition-transform duration-300 delay-100 ${
                      visibleRows.includes(index) ? "scale-100" : "scale-0"
                    }`}>
                      <Check className="w-4 h-4 text-green-500" />
                    </div>
                  ) : (
                    <div className={`w-6 h-6 rounded-full bg-muted flex items-center justify-center transition-transform duration-300 delay-100 ${
                      visibleRows.includes(index) ? "scale-100" : "scale-0"
                    }`}>
                      <X className="w-4 h-4 text-muted-foreground" />
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Footer with CTAs */}
          <div className={`grid grid-cols-3 bg-muted/30 border-t border-border transition-all duration-700 ${
            visibleRows.length >= features.length ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
          }`}>
            <div className="p-6 border-r border-border" />
            <div className={`p-6 border-r border-border text-center ${
              isProPage ? "bg-primary/5" : ""
            }`}>
              {isProPage ? (
                <span className="inline-flex items-center gap-2 px-6 py-3 bg-primary/20 text-primary rounded-full font-semibold">
                  <Star className="w-4 h-4" />
                  Plano Atual
                </span>
              ) : (
                <Link
                  to="/cadastro/pro"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-full font-semibold hover:scale-105 transition-transform"
                >
                  Ver Plano Pro
                  <ArrowRight className="w-4 h-4" />
                </Link>
              )}
            </div>
            <div className={`p-6 text-center ${
              !isProPage ? "bg-amber-500/5" : ""
            }`}>
              {!isProPage ? (
                <span className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-amber-500/20 to-orange-500/20 text-amber-500 rounded-full font-semibold">
                  <Crown className="w-4 h-4" />
                  Plano Atual
                </span>
              ) : (
                <Link
                  to="/cadastro/premium"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-full font-semibold hover:scale-105 transition-transform"
                >
                  Ver Plano Premium
                  <ArrowRight className="w-4 h-4" />
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* Mobile hint */}
        <p className={`text-center text-sm text-muted-foreground mt-6 md:hidden transition-all duration-500 ${
          isVisible ? "opacity-100" : "opacity-0"
        }`}>
          Deslize para ver todas as colunas →
        </p>
      </div>
    </section>
  );
};

export default PlanComparisonSection;
