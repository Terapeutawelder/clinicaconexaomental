import { useState, useEffect, useRef, lazy, Suspense, memo } from "react";
import Logo from "@/components/Logo";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ChevronRight, MessageCircle, Brain, User, Menu, X } from "lucide-react";

// Lazy load heavy sections
const AreasSection = lazy(() => import("@/components/AreasSection"));
const WhatsAppChat = lazy(() => import("@/components/WhatsAppChat"));
const FAQSection = lazy(() => import("@/components/FAQSection"));
const SpecialtiesSection = lazy(() => import("@/components/SpecialtiesSection"));
const VideoSection = lazy(() => import("@/components/VideoSection"));
const TherapyOnlineSection = lazy(() => import("@/components/TherapyOnlineSection"));


// Section loader component
const SectionLoader = memo(() => (
  <div className="py-16 flex items-center justify-center">
    <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
  </div>
));

SectionLoader.displayName = "SectionLoader";

const Header = memo(() => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMobileMenuOpen(false);
      }
    };

    if (mobileMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [mobileMenuOpen]);

  return (
    <header 
      ref={menuRef} 
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled 
          ? 'bg-background/95 backdrop-blur-md shadow-lg border-b border-border/50' 
          : 'bg-transparent'
      }`}
    >
      <div className="container mx-auto px-3 sm:px-4 py-3 sm:py-4 flex items-center justify-between">
        <Link to="/">
          <Logo size="sm" variant={isScrolled ? "default" : "light"} />
        </Link>
        
        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-8">
          <Link 
            to="/psicoterapeutas" 
            className={`text-sm font-medium transition-colors ${
              isScrolled ? 'text-primary hover:text-primary/80' : 'text-primary hover:text-primary/80'
            }`}
          >
            Encontrar profissionais
          </Link>
          <Link 
            to="/profissionais" 
            className={`text-sm font-medium transition-colors ${
              isScrolled ? 'text-muted-foreground hover:text-foreground' : 'text-white/70 hover:text-white'
            }`}
          >
            Sou profissional
          </Link>
        </nav>
        
        {/* Desktop Buttons */}
        <div className="hidden md:flex items-center gap-3">
          <Link to="/psicoterapeutas">
            <Button size="sm" className="bg-primary hover:bg-primary/90 text-white text-sm px-4">
              Agendar
            </Button>
          </Link>
          <Link to="/auth">
            <Button 
              size="sm" 
              className="bg-primary hover:bg-primary/90 text-white text-sm px-4"
            >
              Entrar
            </Button>
          </Link>
        </div>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className={`md:hidden p-2 rounded-lg transition-colors ${
            isScrolled 
              ? 'text-foreground hover:bg-muted' 
              : 'text-white hover:bg-white/10'
          }`}
          aria-label="Menu"
        >
          <div className={`transition-transform duration-300 ${mobileMenuOpen ? 'rotate-180' : 'rotate-0'}`}>
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </div>
        </button>
      </div>

      {/* Mobile Menu */}
      <div 
        className={`md:hidden bg-black/95 backdrop-blur-sm border-t border-white/10 overflow-hidden transition-all duration-300 ease-in-out ${
          mobileMenuOpen ? 'max-h-64 opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <div className={`container mx-auto px-4 py-4 flex flex-col gap-4 transition-transform duration-300 ${
          mobileMenuOpen ? 'translate-y-0' : '-translate-y-4'
        }`}>
            <Link 
              to="/psicoterapeutas" 
              className="text-sm font-medium text-white/90 hover:text-white transition-colors py-2"
              onClick={() => setMobileMenuOpen(false)}
            >
              Encontrar profissionais
            </Link>
            <Link 
              to="/profissionais" 
              className="text-sm font-medium text-white/70 hover:text-white transition-colors py-2"
              onClick={() => setMobileMenuOpen(false)}
            >
              Sou profissional
            </Link>
            <div className="flex flex-col gap-2 pt-2 border-t border-white/10">
              <Link to="/psicoterapeutas" onClick={() => setMobileMenuOpen(false)}>
                <Button size="sm" className="w-full bg-primary hover:bg-primary/90 text-white">
                  Agendar
                </Button>
              </Link>
              <Link to="/auth" onClick={() => setMobileMenuOpen(false)}>
                <Button variant="outline" size="sm" className="w-full border-white/30 text-white hover:bg-white/10 hover:border-white/50">
                  Entrar
                </Button>
              </Link>
            </div>
          </div>
        </div>
    </header>
  );
});

Header.displayName = "Header";

// Optimized hero with preloaded critical image
const HeroSection = memo(() => {
  const [bgLoaded, setBgLoaded] = useState(false);

  useEffect(() => {
    // Preload hero image
    const img = new Image();
    img.src = "/hero-bg-new.jpg";
    img.onload = () => setBgLoaded(true);
    
    // Fallback to show content even if image fails
    const timeout = setTimeout(() => setBgLoaded(true), 3000);
    return () => clearTimeout(timeout);
  }, []);

  return (
    <section className="relative min-h-[100svh] flex items-center overflow-hidden">
      {/* Background Image - optimized with public folder */}
      <div
        className={`absolute inset-0 bg-cover bg-center bg-no-repeat transition-opacity duration-500 ${
          bgLoaded ? "opacity-100" : "opacity-0"
        }`}
        style={{ backgroundImage: `url(/hero-bg-new.jpg)` }}
      />
      
      {/* Placeholder gradient while loading */}
      <div
        className={`absolute inset-0 bg-gradient-to-br from-primary/20 to-muted transition-opacity duration-500 ${
          bgLoaded ? "opacity-0" : "opacity-100"
        }`}
      />
      
      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/40 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/30" />

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 py-16 sm:py-20">
        <div className="max-w-2xl">
          <h1 className="text-2xl sm:text-3xl md:text-5xl lg:text-6xl font-bold text-white leading-tight mb-4 sm:mb-6 opacity-0 animate-fade-in-up">
            O cuidado que a sua{" "}
            <span className="text-primary">mente</span> precisa!
          </h1>
          
          <p className="text-sm sm:text-base md:text-xl text-white/80 mb-6 sm:mb-8 max-w-xl opacity-0 animate-fade-in-up animate-delay-100">
            Agora você pode <strong className="text-white">encontrar o psicoterapeuta ideal</strong> e{" "}
            <strong className="text-white">cuidar da sua saúde mental</strong> com profissionais verificados.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-start gap-3 sm:gap-4 mb-6 sm:mb-8 opacity-0 animate-fade-in-up animate-delay-200">
            <Link to="/psicoterapeutas" className="w-full sm:w-auto">
              <Button size="lg" className="w-full sm:w-auto bg-primary hover:bg-primary/90 text-white px-6 sm:px-8 py-4 sm:py-6 text-base sm:text-lg group">
                Agendar sessão
                <ChevronRight size={20} className="ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
            <Link to="/profissionais" className="w-full sm:w-auto">
              <Button 
                size="lg" 
                className="w-full sm:w-auto bg-primary hover:bg-primary/90 text-white px-6 sm:px-8 py-4 sm:py-6 text-base sm:text-lg"
              >
                Encontrar Profissionais
              </Button>
            </Link>
          </div>

          {/* Trust indicators - lazy load avatars */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-6 opacity-0 animate-fade-in-up animate-delay-300">
            <div className="flex -space-x-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <img
                  key={i}
                  src={`/avatars/avatar-${i}.jpg`}
                  alt={`Psicoterapeuta ${i}`}
                  loading="lazy"
                  decoding="async"
                  width={44}
                  height={44}
                  className="w-9 h-9 sm:w-11 sm:h-11 rounded-full border-2 border-white/30 object-cover bg-muted"
                />
              ))}
            </div>
            <span className="text-white/70 text-xs sm:text-sm">+300 psicoterapeutas verificados</span>
          </div>
        </div>
      </div>

      {/* Bottom Banner */}
      <div className="absolute bottom-0 left-0 right-0 z-20">
        <div className="container mx-auto px-4 pb-6 sm:pb-10">
          <div className="text-center opacity-0 animate-fade-in-up animate-delay-400">
            <p className="text-white text-base sm:text-xl md:text-2xl font-semibold">
              Sessões de Terapia Online a partir de R$ 37,90!
            </p>
            <p className="text-primary text-sm sm:text-lg md:text-xl font-medium mt-1 sm:mt-2 flex items-center justify-center gap-2">
              <MessageCircle size={18} className="sm:w-[22px] sm:h-[22px] fill-primary animate-pulse" />
              Agende em minutos pelo WhatsApp!
            </p>
          </div>
        </div>
      </div>
    </section>
  );
});

HeroSection.displayName = "HeroSection";

const FeaturesSection = memo(() => {
  const features = [
    {
      icon: MessageCircle,
      title: "Converse pelo WhatsApp",
      description: "Um primeiro contato simples e direto para entender como podemos te ajudar.",
    },
    {
      icon: Brain,
      title: "Profissionais verificados",
      description: "Psicólogos, psicanalistas e terapeutas com registro ativo e verificado.",
    },
    {
      icon: User,
      title: "Escolha com segurança",
      description: "Perfis completos com diferentes abordagens e especializações.",
    },
  ];

  return (
    <section id="como-funciona" className="py-10 sm:py-16 md:py-24 bg-card scroll-mt-20">
      <div className="container mx-auto px-4">
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-center text-foreground mb-3 sm:mb-4">
          Seu ponto seguro para descobrir psicoterapeutas
        </h2>
        <p className="text-center text-muted-foreground mb-8 sm:mb-12 max-w-2xl mx-auto text-base sm:text-lg">
          Profissionais preparados para caminhar com você no seu tempo.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="bg-gradient-to-br from-primary to-primary/80 rounded-xl sm:rounded-2xl p-4 sm:p-6 text-center hover:shadow-2xl hover:shadow-primary/30 hover:scale-105 transition-all duration-300 border border-primary/20 animate-pulse-glow"
            >
              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center mx-auto mb-3 sm:mb-4 shadow-lg">
                <feature.icon size={20} className="sm:w-6 sm:h-6 text-white" />
              </div>
              <h3 className="text-base sm:text-lg font-semibold text-white mb-2">{feature.title}</h3>
              <p className="text-white/80 text-xs sm:text-sm">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
});

FeaturesSection.displayName = "FeaturesSection";

const TestimonialsSection = memo(() => {
  const testimonials = [
    {
      text: "Achei super fácil encontrar um psicoterapeuta e já comecei meu atendimento no mesmo dia.",
      author: "Ana S.",
      role: "Cliente AcolheAqui",
    },
    {
      text: "Gostei da plataforma, é prática e intuitiva. Em poucos cliques encontrei alguém que combinava comigo.",
      author: "Bruna C.",
      role: "Cliente AcolheAqui",
    },
    {
      text: "Nunca imaginei que seria tão fácil agendar. A experiência foi acolhedora do início ao fim.",
      author: "Camila T.",
      role: "Cliente AcolheAqui",
    },
  ];

  return (
    <section id="depoimentos" className="py-10 sm:py-16 md:py-24 bg-card scroll-mt-20">
      <div className="container mx-auto px-4">
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-center text-foreground mb-3 sm:mb-4">
          O que estão falando sobre o AcolheAqui?
        </h2>
        <p className="text-center text-muted-foreground mb-8 sm:mb-12 text-sm sm:text-base">
          Veja alguns depoimentos de quem encontrou seu psicoterapeuta
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
          {testimonials.map((testimonial, index) => (
            <div
              key={index}
              className="bg-background rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-border hover:border-primary/30 transition-colors"
            >
              <p className="text-foreground mb-4 sm:mb-6 italic text-sm sm:text-base">"{testimonial.text}"</p>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-gradient-to-br from-primary/30 to-accent/30 flex items-center justify-center">
                  <User size={14} className="sm:w-4 sm:h-4 text-primary" />
                </div>
                <div>
                  <p className="font-medium text-foreground text-xs sm:text-sm">{testimonial.author}</p>
                  <p className="text-muted-foreground text-[10px] sm:text-xs">{testimonial.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
});

TestimonialsSection.displayName = "TestimonialsSection";

const CTASection = memo(() => {
  return (
    <section className="py-10 sm:py-16 md:py-24 bg-gradient-to-br from-primary/10 to-accent/10">
      <div className="container mx-auto px-4 text-center">
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground mb-3 sm:mb-4">
          Seu bem-estar começa com um simples passo
        </h2>
        <p className="text-muted-foreground mb-6 sm:mb-8 max-w-xl mx-auto text-base sm:text-lg">
          Encontre o psicoterapeuta ideal para você em poucos cliques.
        </p>
        <Link to="/psicoterapeutas">
          <Button size="lg" className="group text-sm sm:text-base px-6 sm:px-8 py-4 sm:py-6">
            Encontrar psicoterapeutas
            <ChevronRight size={18} className="ml-1 group-hover:translate-x-1 transition-transform" />
          </Button>
        </Link>
      </div>
    </section>
  );
});

CTASection.displayName = "CTASection";

const CrisisAlert = memo(() => {
  return (
    <div className="bg-muted py-3 sm:py-4 text-center">
      <p className="text-xs sm:text-sm text-muted-foreground max-w-2xl mx-auto px-4">
        Se você estiver passando por uma crise emocional ou pensando em suicídio, procure ajuda imediatamente.{" "}
        <a href="tel:188" className="text-primary font-medium hover:underline">
          Ligue para o CVV – 188
        </a>{" "}
        (24h, ligação gratuita).
      </p>
    </div>
  );
});

CrisisAlert.displayName = "CrisisAlert";

const Footer = memo(() => {
  return (
    <footer className="py-6 sm:py-8 px-4 bg-card border-t border-border">
      <div className="container mx-auto flex flex-col items-center gap-4 sm:gap-6">
        <Logo size="sm" />
        <nav className="flex flex-wrap items-center justify-center gap-4 sm:gap-6">
          <Link to="/" className="text-xs sm:text-sm text-muted-foreground hover:text-foreground transition-colors">
            Início
          </Link>
          <Link to="/psicoterapeutas" className="text-xs sm:text-sm text-muted-foreground hover:text-foreground transition-colors">
            Encontrar profissionais
          </Link>
          <Link to="/profissionais" className="text-xs sm:text-sm text-muted-foreground hover:text-foreground transition-colors">
            Para profissionais
          </Link>
        </nav>
        <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6">
          <Link to="/politica-de-privacidade" className="text-xs sm:text-sm text-muted-foreground hover:text-foreground transition-colors">
            Política de Privacidade
          </Link>
          <Link to="/termos-de-uso" className="text-xs sm:text-sm text-muted-foreground hover:text-foreground transition-colors">
            Termos e Condições
          </Link>
        </div>
        <p className="text-sm sm:text-base text-muted-foreground text-center">
          © {new Date().getFullYear()} AcolheAqui. Todos os direitos reservados.
        </p>
      </div>
    </footer>
  );
});

Footer.displayName = "Footer";

const Index = () => {
  return (
    <main className="min-h-screen bg-background">
      <Header />
      <HeroSection />
      
      
      <FeaturesSection />
      
      <Suspense fallback={<SectionLoader />}>
        <TherapyOnlineSection />
      </Suspense>
      
      <Suspense fallback={<SectionLoader />}>
        <SpecialtiesSection />
      </Suspense>
      
      <Suspense fallback={<SectionLoader />}>
        <AreasSection />
      </Suspense>

      <TestimonialsSection />
      
      <Suspense fallback={<SectionLoader />}>
        <VideoSection />
      </Suspense>
      
      <Suspense fallback={<SectionLoader />}>
        <WhatsAppChat />
      </Suspense>
      
      <CTASection />
      
      <Suspense fallback={<SectionLoader />}>
        <FAQSection />
      </Suspense>
      
      <CrisisAlert />
      <Footer />
    </main>
  );
};

export default Index;
