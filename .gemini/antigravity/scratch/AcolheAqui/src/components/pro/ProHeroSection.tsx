import { MessageCircle, Calendar, Users } from "lucide-react";
import heroBg from "@/assets/hero-bg.jpg";

const ProHeroSection = () => {
  const scrollToSection = (href: string) => {
    const element = document.querySelector(href);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <section id="inicio" className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background image */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${heroBg})` }}
      />
      
      {/* Dark overlay - lighter transparency */}
      <div className="absolute inset-0 bg-gradient-to-b from-[hsl(215,35%,14%)]/60 via-[hsl(215,35%,14%)]/70 to-[hsl(215,35%,14%)]/85" />
      
      <div className="relative z-10 container mx-auto px-4 py-20 text-center">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Main headline */}
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight text-white animate-fade-in-up">
            Conecte-se a quem precisa da sua{" "}
            <span className="text-primary">escuta profissional</span>
          </h1>
          
          <p className="text-xl md:text-2xl text-white/80 leading-relaxed max-w-3xl mx-auto animate-fade-in-up animate-delay-100">
            Tenha seu perfil exibido para quem busca terapia online a partir de{" "}
            <strong className="text-primary whitespace-nowrap">R$ 37,90</strong> e{" "}
            <strong className="text-white">receba pacientes direto no WhatsApp.</strong>
          </p>

          {/* CTA Button */}
          <div className="pt-4 animate-fade-in-up animate-delay-200">
            <button
              onClick={() => scrollToSection("#como-funciona")}
              className="px-10 py-5 bg-primary text-white text-lg font-bold rounded-full hover:bg-primary/90 transition-all hover:scale-105 animate-pulse-glow shadow-2xl"
            >
              Quero fazer parte do Mindset
            </button>
          </div>

          {/* Features mini cards */}
          <div className="grid sm:grid-cols-3 gap-4 pt-12 animate-fade-in-up animate-delay-300">
            <div className="flex items-center justify-center gap-3 p-5 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20">
              <div className="p-2 bg-primary/30 rounded-lg">
                <MessageCircle className="w-6 h-6 text-primary" />
              </div>
              <span className="text-white font-medium">Contato via WhatsApp</span>
            </div>
            <div className="flex items-center justify-center gap-3 p-5 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20">
              <div className="p-2 bg-primary/30 rounded-lg">
                <Calendar className="w-6 h-6 text-primary" />
              </div>
              <span className="text-white font-medium">CRM Integrado</span>
            </div>
            <div className="flex items-center justify-center gap-3 p-5 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20">
              <div className="p-2 bg-primary/30 rounded-lg">
                <Users className="w-6 h-6 text-primary" />
              </div>
              <span className="text-white font-medium">Mais visibilidade</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ProHeroSection;
