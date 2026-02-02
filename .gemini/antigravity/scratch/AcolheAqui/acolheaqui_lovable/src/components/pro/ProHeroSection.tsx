import { MessageCircle, Calendar, Users, Eye, Zap, Shield, Clock, CreditCard, Video } from "lucide-react";
import heroBg from "@/assets/hero-pro-therapy.jpg";

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
      
      {/* Dark overlay - clearer transparency */}
      <div className="absolute inset-0 bg-gradient-to-b from-[hsl(215,35%,14%)]/40 via-[hsl(215,35%,14%)]/50 to-[hsl(215,35%,14%)]/70" />
      
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
              Entrar no Grupo de Espera!
            </button>
          </div>

          {/* Features mini cards - Row 1 */}
          <div className="grid sm:grid-cols-3 gap-4 pt-12 animate-fade-in-up animate-delay-300">
            <div className="group flex items-center justify-center gap-3 p-5 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20 hover:bg-primary/30 hover:border-primary/50 hover:scale-105 hover:shadow-lg hover:shadow-primary/20 transition-all duration-300 cursor-pointer">
              <div className="p-2 bg-primary/30 rounded-lg group-hover:bg-primary/60 transition-colors">
                <MessageCircle className="w-6 h-6 text-primary group-hover:text-white group-hover:scale-110 transition-all" />
              </div>
              <span className="text-white/90 font-medium group-hover:text-white group-hover:font-semibold transition-all">Contato via WhatsApp</span>
            </div>
            <div className="group flex items-center justify-center gap-3 p-5 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20 hover:bg-primary/30 hover:border-primary/50 hover:scale-105 hover:shadow-lg hover:shadow-primary/20 transition-all duration-300 cursor-pointer">
              <div className="p-2 bg-primary/30 rounded-lg group-hover:bg-primary/60 transition-colors">
                <Calendar className="w-6 h-6 text-primary group-hover:text-white group-hover:scale-110 transition-all" />
              </div>
              <span className="text-white/90 font-medium group-hover:text-white group-hover:font-semibold transition-all">CRM Integrado</span>
            </div>
            <div className="group flex items-center justify-center gap-3 p-5 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20 hover:bg-primary/30 hover:border-primary/50 hover:scale-105 hover:shadow-lg hover:shadow-primary/20 transition-all duration-300 cursor-pointer">
              <div className="p-2 bg-primary/30 rounded-lg group-hover:bg-primary/60 transition-colors">
                <Users className="w-6 h-6 text-primary group-hover:text-white group-hover:scale-110 transition-all" />
              </div>
              <span className="text-white/90 font-medium group-hover:text-white group-hover:font-semibold transition-all">Mais visibilidade</span>
            </div>
          </div>

          {/* Features mini cards - Row 2 */}
          <div className="grid sm:grid-cols-3 gap-4 pt-4 animate-fade-in-up animate-delay-400">
            <div className="group flex items-center justify-center gap-3 p-5 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20 hover:bg-primary/30 hover:border-primary/50 hover:scale-105 hover:shadow-lg hover:shadow-primary/20 transition-all duration-300 cursor-pointer">
              <div className="p-2 bg-primary/30 rounded-lg group-hover:bg-primary/60 transition-colors">
                <Eye className="w-6 h-6 text-primary group-hover:text-white group-hover:scale-110 transition-all" />
              </div>
              <span className="text-white/90 font-medium group-hover:text-white group-hover:font-semibold transition-all">Perfil destacado</span>
            </div>
            <div className="group flex items-center justify-center gap-3 p-5 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20 hover:bg-primary/30 hover:border-primary/50 hover:scale-105 hover:shadow-lg hover:shadow-primary/20 transition-all duration-300 cursor-pointer">
              <div className="p-2 bg-primary/30 rounded-lg group-hover:bg-primary/60 transition-colors">
                <Zap className="w-6 h-6 text-primary group-hover:text-white group-hover:scale-110 transition-all" />
              </div>
              <span className="text-white/90 font-medium group-hover:text-white group-hover:font-semibold transition-all">Leads qualificados</span>
            </div>
            <div className="group flex items-center justify-center gap-3 p-5 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20 hover:bg-primary/30 hover:border-primary/50 hover:scale-105 hover:shadow-lg hover:shadow-primary/20 transition-all duration-300 cursor-pointer">
              <div className="p-2 bg-primary/30 rounded-lg group-hover:bg-primary/60 transition-colors">
                <Shield className="w-6 h-6 text-primary group-hover:text-white group-hover:scale-110 transition-all" />
              </div>
              <span className="text-white/90 font-medium group-hover:text-white group-hover:font-semibold transition-all">Plataforma segura</span>
            </div>
          </div>

          {/* Features mini cards - Row 3 */}
          <div className="grid sm:grid-cols-3 gap-4 pt-4 animate-fade-in-up animate-delay-400">
            <div className="group flex items-center justify-center gap-3 p-5 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20 hover:bg-primary/30 hover:border-primary/50 hover:scale-105 hover:shadow-lg hover:shadow-primary/20 transition-all duration-300 cursor-pointer">
              <div className="p-2 bg-primary/30 rounded-lg group-hover:bg-primary/60 transition-colors">
                <Clock className="w-6 h-6 text-primary group-hover:text-white group-hover:scale-110 transition-all" />
              </div>
              <span className="text-white/90 font-medium group-hover:text-white group-hover:font-semibold transition-all">Agenda automatizada</span>
            </div>
            <div className="group flex items-center justify-center gap-3 p-5 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20 hover:bg-primary/30 hover:border-primary/50 hover:scale-105 hover:shadow-lg hover:shadow-primary/20 transition-all duration-300 cursor-pointer">
              <div className="p-2 bg-primary/30 rounded-lg group-hover:bg-primary/60 transition-colors">
                <CreditCard className="w-6 h-6 text-primary group-hover:text-white group-hover:scale-110 transition-all" />
              </div>
              <span className="text-white/90 font-medium group-hover:text-white group-hover:font-semibold transition-all">Checkout Próprio</span>
            </div>
            <div className="group flex items-center justify-center gap-3 p-5 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20 hover:bg-primary/30 hover:border-primary/50 hover:scale-105 hover:shadow-lg hover:shadow-primary/20 transition-all duration-300 cursor-pointer">
              <div className="p-2 bg-primary/30 rounded-lg group-hover:bg-primary/60 transition-colors">
                <Video className="w-6 h-6 text-primary group-hover:text-white group-hover:scale-110 transition-all" />
              </div>
              <span className="text-white/90 font-medium group-hover:text-white group-hover:font-semibold transition-all">Sala de TelePsicoterapia</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ProHeroSection;
