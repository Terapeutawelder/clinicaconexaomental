import { MessageCircle, ArrowLeft } from "lucide-react";
import Logo from "@/components/Logo";
import Marquee from "@/components/Marquee";

const CadastroPremium = () => {
  const whatsappLink =
    "https://wa.me/5511999999999?text=Olá! Tenho interesse no Plano Premium da Mindset";

  return (
    <div className="min-h-screen pro-theme">
      {/* Fixed Header with Back Button */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <button
            onClick={() => window.history.back()}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="font-medium">Voltar</span>
          </button>
          <Logo className="h-8" />
          <div className="w-20" /> {/* Spacer for centering logo */}
        </div>
      </header>

      {/* Hero Section */}
      <section
        className="relative min-h-screen flex flex-col items-center justify-center text-center px-4 py-20 pt-28"
        style={{
          backgroundImage: `url('/hero-bg-pro.jpg')`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        {/* Dark overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-background/60 via-background/70 to-background/85" />

        {/* Content */}
        <div className="relative z-10 max-w-4xl mx-auto">

          {/* Title */}
          <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6 leading-tight animate-fade-in-up">
            Desbloqueie todo o potencial com o{" "}
            <span className="text-primary">Plano Premium</span>!
          </h1>

          {/* Subtitle */}
          <p className="text-lg md:text-xl text-muted-foreground mb-10 max-w-2xl mx-auto animate-fade-in-up animate-delay-100">
            Recursos completos: CRM, integrações, agentes de IA e muito mais para você crescer.
          </p>

          {/* CTA Button */}
          <a
            href={whatsappLink}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-3 px-8 py-4 text-lg font-semibold bg-primary text-primary-foreground rounded-full transition-all duration-300 hover:scale-105 hover:shadow-xl animate-pulse-glow animate-fade-in-up animate-delay-200"
          >
            <MessageCircle className="w-6 h-6" />
            QUERO O PLANO PREMIUM
          </a>

          {/* Extra info */}
          <p className="mt-6 text-sm text-muted-foreground italic animate-fade-in-up animate-delay-300">
            <strong>Vagas limitadas</strong> • Acesso prioritário • Benefícios exclusivos
          </p>
        </div>
      </section>

      {/* Marquee */}
      <Marquee />

      {/* Second Section */}
      <section className="py-20 px-4 bg-background">
        <div className="max-w-3xl mx-auto text-center">
          <p className="text-muted-foreground mb-8 text-lg">
            Se você é psicoterapeuta (Psicólogo(a), Psicanalista ou Terapeuta) e quer começar sua jornada na plataforma Mindset, e deseja receber atendimentos a partir de{" "}
            <strong className="text-foreground">R$ 57,90</strong>, o Plano Premium é ideal para você.
          </p>

          <a
            href={whatsappLink}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-3 px-8 py-4 text-lg font-semibold bg-primary text-primary-foreground rounded-full transition-all duration-300 hover:scale-105 hover:shadow-xl"
          >
            <MessageCircle className="w-6 h-6" />
            FALAR COM A EQUIPE
          </a>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 bg-muted/50 border-t border-border">
        <div className="max-w-4xl mx-auto flex flex-col items-center gap-4">
          <Logo className="h-8" />
          <p className="text-sm text-muted-foreground">
            © Copyright 2025 - Todos os direitos reservados.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default CadastroPremium;
