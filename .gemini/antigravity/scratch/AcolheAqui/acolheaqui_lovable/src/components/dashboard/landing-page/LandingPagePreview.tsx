import { Heart, Calendar, Sparkles, Brain, Users, Star, Clock, Check, Package, CalendarDays, MessageCircle, Mail, MapPin, Phone, ChevronLeft, ChevronRight, Quote, GraduationCap, Award, HelpCircle, Send, Instagram, Facebook, Linkedin, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useState, useMemo } from "react";
import { format, addDays, startOfWeek, isSameDay } from "date-fns";
import { ptBR } from "date-fns/locale";
import { formatProfessionalName } from "@/lib/formatProfessionalName";
import { ServicesSection, AboutSection, TestimonialsSection, FAQSection, ContactSection } from "./sections";
import { SectionId, defaultSectionOrder } from "./SectionOrderEditor";

interface LandingPagePreviewProps {
  profile: any;
  services: any[];
  testimonials: any[];
  config: LandingPageConfig;
}

export interface LandingPageConfig {
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
  };
  images: {
    aboutPhoto: string;
    heroBanner: string;
  };
  hero: {
    badge: string;
    title: string;
    subtitle: string;
    ctaText: string;
  };
  about: {
    title: string;
    subtitle: string;
  };
  services: {
    title: string;
    subtitle: string;
  };
  testimonials: {
    title: string;
    subtitle: string;
  };
  faq: {
    title: string;
    subtitle: string;
    items: { question: string; answer: string }[];
  };
  contact: {
    title: string;
    subtitle: string;
    address: string;
    phone: string;
    email: string;
    hours: string;
  };
  footer?: {
    description: string;
    copyright: string;
  };
  layout?: {
    showAbout?: boolean;
    showServices?: boolean;
    showTestimonials?: boolean;
    showFaq?: boolean;
    showContact?: boolean;
    sectionOrder?: ("services" | "about" | "schedule" | "testimonials" | "faq" | "contact")[];
  };
}

export const defaultConfig: LandingPageConfig = {
  colors: {
    primary: "168 45% 35%",
    secondary: "168 30% 92%",
    accent: "45 60% 50%",
    background: "40 20% 98%",
  },
  images: {
    aboutPhoto: "",
    heroBanner: "",
  },
  hero: {
    badge: "Cuidando da sua saúde mental",
    title: "Encontre o equilíbrio e a paz interior que você merece",
    subtitle: "A psicoterapia é um caminho de autoconhecimento e transformação. Juntos, vamos construir uma vida mais leve e significativa.",
    ctaText: "Agendar Consulta",
  },
  about: {
    title: "Sobre Mim",
    subtitle: "Psicólogo(a) Clínico(a)",
  },
  services: {
    title: "Como Posso Ajudar",
    subtitle: "Ofereco diferentes modalidades de atendimento para atender às suas necessidades específicas",
  },
  testimonials: {
    title: "O Que Dizem Nossos Pacientes",
    subtitle: "Histórias reais de transformação e superação",
  },
  faq: {
    title: "Perguntas Frequentes",
    subtitle: "Tire suas dúvidas sobre psicoterapia e nosso atendimento",
    items: [
      { question: "Como funciona a terapia online?", answer: "A terapia online funciona através de videochamada em uma plataforma segura. Você terá a mesma qualidade de atendimento que em sessões presenciais, com total privacidade e confidencialidade." },
      { question: "Qual a duração de cada sessão?", answer: "Oferecemos sessões de 30 minutos e 45 minutos. A escolha depende das suas necessidades e preferências." },
      { question: "Com que frequência devo fazer terapia?", answer: "Geralmente recomendamos sessões semanais no início do tratamento. Com o tempo, podemos ajustar para quinzenal ou mensal, conforme sua evolução." },
      { question: "A terapia online é tão eficaz quanto a presencial?", answer: "Sim! Diversos estudos científicos comprovam que a terapia online é tão eficaz quanto a presencial para a maioria dos casos." },
    ],
  },
  contact: {
    title: "Entre em Contato",
    subtitle: "Tem alguma dúvida ou gostaria de agendar uma primeira conversa?",
    address: "São Paulo, SP",
    phone: "(11) 99999-9999",
    email: "contato@exemplo.com.br",
    hours: "Seg - Sex: 08h às 19h",
  },
  footer: {
    description: "Atendimento humanizado e personalizado em saúde mental.",
    copyright: "Todos os direitos reservados.",
  },
  layout: {
    showAbout: true,
    showServices: true,
    showTestimonials: true,
    showFaq: true,
    showContact: true,
    sectionOrder: ["services", "about", "schedule", "testimonials", "faq", "contact"],
  },
};

const defaultServices = [
  { icon: Brain, title: "Terapia Individual", description: "Sessões personalizadas para trabalhar questões emocionais, comportamentais e de desenvolvimento pessoal." },
  { icon: Users, title: "Terapia de Casal", description: "Apoio para casais que desejam melhorar a comunicação e fortalecer o relacionamento." },
  { icon: Heart, title: "Ansiedade e Depressão", description: "Tratamento especializado para transtornos de ansiedade e depressão com abordagem humanizada." },
  { icon: Sparkles, title: "Autoconhecimento", description: "Processo terapêutico focado em desenvolver maior consciência de si mesmo e seu potencial." },
];

const timeSlots = [
  { time: "08:00", available: true },
  { time: "09:00", available: false },
  { time: "10:00", available: true },
  { time: "11:00", available: true },
  { time: "14:00", available: false },
  { time: "15:00", available: true },
  { time: "16:00", available: true },
  { time: "17:00", available: false },
  { time: "18:00", available: true },
];

const LandingPagePreview = ({ profile, services, testimonials, config }: LandingPagePreviewProps) => {
  const [currentWeekStart, setCurrentWeekStart] = useState(startOfWeek(new Date(), { weekStartsOn: 1 }));
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const weekDays = Array.from({ length: 5 }, (_, i) => addDays(currentWeekStart, i));

  const goToPreviousWeek = () => {
    setCurrentWeekStart(addDays(currentWeekStart, -7));
    setSelectedDate(null);
    setSelectedTime(null);
  };

  const goToNextWeek = () => {
    setCurrentWeekStart(addDays(currentWeekStart, 7));
    setSelectedDate(null);
    setSelectedTime(null);
  };

  // Convert services to plans format
  const plans = services.slice(0, 4).map((s, i) => ({
    id: s.id,
    name: s.name,
    description: s.description || `${s.duration_minutes} minutos`,
    duration: `${s.duration_minutes} min`,
    price: s.price_cents / 100,
    sessions: 1,
    isPackage: false,
  }));

  const selectedPlanData = plans.find(p => p.id === selectedPlan);

  // Calculate average rating
  const averageRating = testimonials.length > 0 
    ? testimonials.reduce((sum, t) => sum + t.rating, 0) / testimonials.length 
    : 5.0;

  const navLinks = [
    { label: "Início", id: "inicio" },
    { label: "Serviços", id: "servicos" },
    { label: "Sobre", id: "sobre" },
    { label: "Agenda", id: "agenda" },
    { label: "Contato", id: "contato" },
  ];

  const contactInfo = [
    { icon: MapPin, title: "Endereço", content: config.contact.address },
    { icon: Phone, title: "Telefone", content: config.contact.phone },
    { icon: Mail, title: "E-mail", content: config.contact.email },
    { icon: Clock, title: "Horário", content: config.contact.hours },
  ];

  const faqItems = config.faq.items;

  // Get section order from config or use default
  const sectionOrder = config.layout?.sectionOrder || defaultSectionOrder;

  // Render section based on ID
  const renderSection = (sectionId: SectionId) => {
    switch (sectionId) {
      case "services":
        if (config.layout?.showServices === false) return null;
        return <ServicesSection key={sectionId} config={config} profile={profile} />;
      case "about":
        if (config.layout?.showAbout === false) return null;
        return <AboutSection key={sectionId} config={config} profile={profile} averageRating={averageRating} />;
      case "schedule":
        return renderScheduleSection();
      case "testimonials":
        if (config.layout?.showTestimonials === false) return null;
        return <TestimonialsSection key={sectionId} config={config} testimonials={testimonials} />;
      case "faq":
        if (config.layout?.showFaq === false) return null;
        return <FAQSection key={sectionId} config={config} />;
      case "contact":
        if (config.layout?.showContact === false) return null;
        return <ContactSection key={sectionId} config={config} />;
      default:
        return null;
    }
  };

  // Schedule section is inline because it has complex state
  const renderScheduleSection = () => (
    <section id="agenda" className="py-20 relative overflow-hidden bg-gradient-to-br from-teal/90 via-teal to-teal/90">
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-10 pointer-events-none">
        <div className="absolute top-10 left-10 w-40 h-40 border border-white/20 rounded-full" />
        <div className="absolute bottom-20 right-20 w-60 h-60 border border-white/20 rounded-full" />
        <div className="absolute top-1/2 left-1/4 w-20 h-20 border border-white/20 rounded-full" />
      </div>
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <Badge className="bg-white/20 backdrop-blur-sm border border-white/30 text-white mb-4 px-4 py-2">
            <CalendarDays className="w-4 h-4 mr-2" />
            <span className="font-semibold">Agenda Online</span>
          </Badge>
          <h2 className="font-serif text-3xl md:text-4xl text-white mb-4">
            Agende Sua Consulta
          </h2>
          <p className="text-white/90 font-medium">
            Escolha seu plano, dia e horário para iniciar sua jornada de autoconhecimento
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          <Card className="border-none shadow-2xl bg-white">
            <div className="h-2 rounded-t-lg bg-gradient-to-r from-teal via-teal-dark to-teal" />
            
            <CardHeader className="pb-4 pt-6">
              <CardTitle className="font-serif text-xl flex items-center gap-3 text-charcoal">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-gold to-gold-light flex items-center justify-center">
                  <Package className="w-5 h-5 text-white" />
                </div>
                1. Escolha o Plano
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6 pb-6">
              {/* Plans selector */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {plans.length > 0 ? plans.map((plan, idx) => {
                  const isPackage = idx === 1 || idx === 3;
                  return (
                    <button
                      key={plan.id}
                      onClick={() => setSelectedPlan(plan.id)}
                      className={`p-4 rounded-xl text-left transition-all duration-300 border-2 ${
                        selectedPlan === plan.id 
                          ? "bg-gradient-to-br from-teal to-teal-dark text-white border-transparent"
                          : "bg-teal-light/30 border-teal/20 text-charcoal hover:border-teal/40"
                      }`}
                    >
                      <div className="flex justify-between items-start mb-1">
                        <span className={`text-xs uppercase tracking-wider font-bold ${selectedPlan === plan.id ? 'opacity-80' : 'text-teal'}`}>
                          {plan.duration} • {isPackage ? "4x" : "1x"}
                        </span>
                        {isPackage && (
                          <Badge className="bg-gold text-charcoal text-[10px] px-1.5 py-0.5 font-semibold">
                            Economia
                          </Badge>
                        )}
                      </div>
                      <h3 className="text-sm font-bold leading-tight mb-1">{isPackage ? "Pacote econômico" : plan.name}</h3>
                      <p className={`text-xs mb-2 ${selectedPlan === plan.id ? 'text-white/80' : 'text-slate'}`}>
                        {isPackage ? `4 sessões de ${plan.duration}` : `1 sessão de ${plan.duration}`}
                      </p>
                      <div className={`text-lg font-bold ${selectedPlan === plan.id ? 'text-white' : 'text-teal'}`}>
                        R$ {plan.price.toFixed(2).replace('.', ',')}
                      </div>
                    </button>
                  );
                }) : (
                  <div className="col-span-4 text-center py-8 text-slate">
                    <Package className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p className="font-medium">Nenhum serviço cadastrado</p>
                  </div>
                )}
              </div>

              {/* Date selector */}
              {selectedPlan && (
                <div className="pt-6 border-t border-teal/10 animate-fade-in">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-serif text-lg flex items-center gap-3 text-charcoal">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal to-teal-dark flex items-center justify-center">
                        <Calendar className="w-5 h-5 text-white" />
                      </div>
                      2. Selecione a Data
                    </h3>
                    <div className="flex items-center gap-2">
                      <Button 
                        variant="outline" 
                        size="icon"
                        onClick={goToPreviousWeek}
                        className="h-8 w-8 rounded-xl border-teal/30"
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </Button>
                      <span className="text-sm font-bold min-w-[120px] text-center capitalize px-3 py-1.5 rounded-xl bg-teal-light text-charcoal">
                        {format(currentWeekStart, "MMMM yyyy", { locale: ptBR })}
                      </span>
                      <Button 
                        variant="outline" 
                        size="icon"
                        onClick={goToNextWeek}
                        className="h-8 w-8 rounded-xl border-teal/30"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-5 gap-3">
                    {weekDays.map((day) => (
                      <button
                        key={day.toISOString()}
                        onClick={() => {
                          setSelectedDate(day);
                          setSelectedTime(null);
                        }}
                        className={`p-4 rounded-xl text-center transition-all duration-500 border-2 ${
                          selectedDate && isSameDay(selectedDate, day)
                            ? "bg-gradient-to-br from-teal to-teal-dark text-white border-transparent scale-105"
                            : "bg-teal-light/50 border-teal/20 text-charcoal hover:border-teal/40"
                        }`}
                      >
                        <div className="text-xs uppercase tracking-wider font-bold opacity-80">
                          {format(day, "EEE", { locale: ptBR })}
                        </div>
                        <div className="text-2xl font-serif mt-1">
                          {format(day, "dd")}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Time slots */}
              {selectedPlan && selectedDate && (
                <div className="space-y-4 animate-fade-in pt-4">
                  <div className="flex items-center gap-2 font-semibold text-charcoal">
                    <Clock className="w-4 h-4 text-teal" />
                    <span>3. Horários disponíveis para {format(selectedDate, "dd 'de' MMMM", { locale: ptBR })}</span>
                  </div>
                  <div className="grid grid-cols-3 md:grid-cols-5 gap-2">
                    {timeSlots.map((slot) => (
                      <button
                        key={slot.time}
                        onClick={() => slot.available && setSelectedTime(slot.time)}
                        disabled={!slot.available}
                        className={`p-3 rounded-xl text-center transition-all duration-300 font-bold text-sm ${
                          !slot.available 
                            ? "bg-gray-100 text-gray-400 line-through cursor-not-allowed"
                            : selectedTime === slot.time 
                              ? "bg-gold text-white shadow-lg shadow-gold/40"
                              : "bg-white border-2 border-teal/20 text-charcoal hover:border-teal/40"
                        }`}
                      >
                        {slot.time}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Confirmation */}
              {selectedPlan && selectedDate && selectedTime && (
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-5 rounded-2xl bg-gradient-to-r from-teal-light via-gold/10 to-teal-light border-2 border-teal/20 animate-fade-in">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-teal to-teal-dark flex items-center justify-center shadow-lg">
                      <Check className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <p className="font-bold text-charcoal">Consulta selecionada</p>
                      <p className="text-sm text-slate font-medium">
                        {selectedPlanData?.name} • {format(selectedDate, "EEEE, dd 'de' MMMM", { locale: ptBR })} às {selectedTime}
                      </p>
                      <p className="font-bold text-lg text-teal mt-1">
                        R$ {selectedPlanData?.price.toFixed(2).replace('.', ',')}
                      </p>
                    </div>
                  </div>
                  <Button className="bg-gradient-to-r from-teal to-teal-dark hover:from-teal-dark hover:to-teal text-white px-6 py-5 shadow-xl shadow-teal/30 transition-all duration-300 hover:-translate-y-1 font-bold">
                    Confirmar Agendamento
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
    setIsMobileMenuOpen(false);
  };

  // Generate dynamic CSS variables from config colors
  const dynamicStyles = {
    '--preview-primary': config.colors.primary,
    '--preview-secondary': config.colors.secondary,
    '--preview-accent': config.colors.accent,
    '--preview-background': config.colors.background,
  } as React.CSSProperties;

  return (
    <div 
      className="w-full min-h-full overflow-auto text-charcoal"
      style={{
        ...dynamicStyles,
        backgroundColor: `hsl(${config.colors.background})`,
      }}
    >
      {/* Header - Psico Space Style */}
      <header 
        className={`sticky top-0 z-50 transition-all duration-500 ${
          isScrolled ? "backdrop-blur-xl shadow-lg py-3" : "py-5"
        }`}
        style={{ backgroundColor: `hsl(${config.colors.background} / 0.95)` }}
      >
        <div className="container mx-auto px-4">
          <nav className="flex items-center justify-between">
            {/* Logo + Social Icons */}
            <div className="flex flex-col">
              <a href="#inicio" className="flex items-center gap-2 group">
                <div 
                  className="relative w-11 h-11 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-105"
                  style={{ 
                    background: `linear-gradient(to bottom right, hsl(${config.colors.primary}), hsl(${config.colors.primary} / 0.8))` 
                  }}
                >
                  <Heart className="w-5 h-5 text-white" />
                  <Sparkles className="absolute -top-1 -right-1 w-3 h-3" style={{ color: `hsl(${config.colors.accent})` }} />
                </div>
                <span className="font-serif text-xl text-charcoal">{profile ? formatProfessionalName(profile.full_name, profile.gender) : "Profissional"}</span>
              </a>
              {/* Social Icons Below Name */}
              {(profile?.instagram_url || profile?.linkedin_url || profile?.facebook_url) && (
                <div className="flex items-center gap-2 ml-[52px] mt-1">
                  {profile?.instagram_url && (
                    <a href={profile.instagram_url} target="_blank" rel="noopener noreferrer" 
                       className="w-7 h-7 rounded-full flex items-center justify-center transition-all hover:scale-110"
                       style={{ backgroundColor: `hsl(${config.colors.secondary})` }}>
                      <Instagram className="w-3.5 h-3.5" style={{ color: `hsl(${config.colors.primary})` }} />
                    </a>
                  )}
                  {profile?.linkedin_url && (
                    <a href={profile.linkedin_url} target="_blank" rel="noopener noreferrer" 
                       className="w-7 h-7 rounded-full flex items-center justify-center transition-all hover:scale-110"
                       style={{ backgroundColor: `hsl(${config.colors.secondary})` }}>
                      <Linkedin className="w-3.5 h-3.5" style={{ color: `hsl(${config.colors.primary})` }} />
                    </a>
                  )}
                  {profile?.facebook_url && (
                    <a href={profile.facebook_url} target="_blank" rel="noopener noreferrer" 
                       className="w-7 h-7 rounded-full flex items-center justify-center transition-all hover:scale-110"
                       style={{ backgroundColor: `hsl(${config.colors.secondary})` }}>
                      <Facebook className="w-3.5 h-3.5" style={{ color: `hsl(${config.colors.primary})` }} />
                    </a>
                  )}
                </div>
              )}
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-8">
              {navLinks.map((link) => (
                <button
                  key={link.label}
                  onClick={() => scrollToSection(link.id)}
                  className="relative text-slate transition-colors duration-300 text-sm font-semibold group"
                  style={{ '--hover-color': `hsl(${config.colors.primary})` } as React.CSSProperties}
                  onMouseEnter={(e) => e.currentTarget.style.color = `hsl(${config.colors.primary})`}
                  onMouseLeave={(e) => e.currentTarget.style.color = ''}
                >
                  {link.label}
                  <span 
                    className="absolute -bottom-1 left-0 w-0 h-0.5 group-hover:w-full transition-all duration-300" 
                    style={{ backgroundColor: `hsl(${config.colors.primary})` }}
                  />
                </button>
              ))}
            </div>

            {/* CTA Button */}
            <div className="hidden md:block">
              <Button 
                onClick={() => scrollToSection("agenda")}
                className="text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-0.5 font-semibold"
                style={{ 
                  background: `linear-gradient(to right, hsl(${config.colors.primary}), hsl(${config.colors.primary} / 0.8))` 
                }}
              >
                {config.hero.ctaText}
              </Button>
            </div>

            {/* Mobile Menu Button */}
            <button
              className="md:hidden p-2 text-charcoal rounded-lg transition-colors"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              style={{ backgroundColor: isMobileMenuOpen ? `hsl(${config.colors.secondary})` : undefined }}
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </nav>

          {/* Mobile Menu */}
          {isMobileMenuOpen && (
            <div 
              className="md:hidden absolute top-full left-0 right-0 backdrop-blur-xl border-b border-border shadow-xl animate-fade-in"
              style={{ backgroundColor: `hsl(${config.colors.background} / 0.98)` }}
            >
              <div className="container mx-auto px-4 py-6 space-y-4">
                {navLinks.map((link, index) => (
                  <button
                    key={link.label}
                    onClick={() => scrollToSection(link.id)}
                    className="block w-full text-left text-charcoal transition-colors duration-200 py-2 text-lg font-semibold opacity-0 animate-fade-in-up"
                    style={{ animationDelay: `${index * 0.1}s` }}
                    onMouseEnter={(e) => e.currentTarget.style.color = `hsl(${config.colors.primary})`}
                    onMouseLeave={(e) => e.currentTarget.style.color = ''}
                  >
                    {link.label}
                  </button>
                ))}
                <Button 
                  onClick={() => scrollToSection("agenda")}
                  className="w-full text-white mt-4 shadow-lg font-semibold"
                  style={{ 
                    background: `linear-gradient(to right, hsl(${config.colors.primary}), hsl(${config.colors.primary} / 0.8))` 
                  }}
                >
                  {config.hero.ctaText}
                </Button>
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Hero Section - Psico Space Style */}
      <section id="inicio" className="relative min-h-[85vh] flex items-center justify-center overflow-hidden pt-20">
        {/* Background decorative elements */}
        <div 
          className="absolute inset-0"
          style={{ 
            background: `linear-gradient(to bottom, hsl(${config.colors.background}), hsl(${config.colors.secondary} / 0.3), hsl(${config.colors.background}))` 
          }}
        />
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div 
            className="absolute -top-40 -right-40 w-[500px] h-[500px] rounded-full blur-3xl animate-pulse" 
            style={{ background: `linear-gradient(to bottom right, hsl(${config.colors.primary} / 0.2), hsl(${config.colors.accent} / 0.1))` }}
          />
          <div 
            className="absolute top-1/3 -left-32 w-80 h-80 rounded-full blur-3xl" 
            style={{ background: `linear-gradient(to bottom right, hsl(${config.colors.secondary}), hsl(${config.colors.primary} / 0.1))` }}
          />
          <div 
            className="absolute bottom-20 right-1/4 w-64 h-64 rounded-full blur-3xl" 
            style={{ background: `linear-gradient(to bottom right, hsl(${config.colors.accent} / 0.2), hsl(${config.colors.primary} / 0.1))` }}
          />
          
          {/* Floating dots */}
          <div className="absolute top-1/4 right-1/4 w-3 h-3 rounded-full animate-pulse" style={{ backgroundColor: `hsl(${config.colors.primary} / 0.6)` }} />
          <div className="absolute top-2/3 left-1/3 w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: `hsl(${config.colors.accent} / 0.5)`, animationDelay: "1s" }} />
          <div className="absolute bottom-1/3 right-1/3 w-4 h-4 rounded-full animate-pulse" style={{ backgroundColor: `hsl(${config.colors.primary} / 0.4)`, animationDelay: "2s" }} />
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            {/* Badge */}
            <div 
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full shadow-lg mb-8 animate-fade-in"
              style={{ 
                backgroundColor: `hsl(${config.colors.secondary})`,
                borderColor: `hsl(${config.colors.primary} / 0.2)`,
                borderWidth: '1px'
              }}
            >
              <Sparkles className="w-4 h-4" style={{ color: `hsl(${config.colors.primary})` }} />
              <span className="text-sm font-semibold text-charcoal">{config.hero.badge}</span>
              <Heart className="w-4 h-4" style={{ color: `hsl(${config.colors.primary})` }} />
            </div>

            {/* Rating Badge */}
            <div className="flex items-center justify-center gap-1.5 mb-6">
              <div className="flex">
                {[...Array(5)].map((_, i) => (
                  <Star 
                    key={i} 
                    className="w-5 h-5"
                    style={{ 
                      color: i < Math.floor(averageRating) ? `hsl(${config.colors.accent})` : '#d1d5db',
                      fill: i < Math.floor(averageRating) ? `hsl(${config.colors.accent})` : 'none'
                    }}
                  />
                ))}
              </div>
              <span className="text-sm font-bold text-charcoal ml-2">{averageRating.toFixed(1)}</span>
              <span className="text-sm text-slate">({testimonials.length} avaliações)</span>
            </div>
            
            <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl text-charcoal leading-tight mb-6 animate-fade-in-up">
              {config.hero.title}
            </h1>
            
            <p className="text-lg md:text-xl text-slate max-w-2xl mx-auto mb-10 font-medium leading-relaxed animate-fade-in-up" style={{ animationDelay: "0.2s" }}>
              {config.hero.subtitle}
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in-up" style={{ animationDelay: "0.4s" }}>
              <Button 
                size="lg"
                className="text-lg px-8 py-6 text-white shadow-xl transition-all duration-500 hover:-translate-y-1 hover:shadow-2xl"
                style={{ 
                  background: `linear-gradient(to right, hsl(${config.colors.primary}), hsl(${config.colors.primary} / 0.8))`,
                  boxShadow: `0 10px 25px -5px hsl(${config.colors.primary} / 0.3)`
                }}
              >
                <Calendar className="w-5 h-5 mr-2" />
                {config.hero.ctaText}
              </Button>
              <Button 
                variant="outline" 
                size="lg"
                className="text-lg px-8 py-6 border-charcoal/20 text-charcoal hover:bg-charcoal hover:text-white transition-all duration-500 hover:-translate-y-1"
              >
                Saiba Mais
              </Button>
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
          <div 
            className="w-8 h-12 border-2 rounded-full flex justify-center p-2"
            style={{ borderColor: `hsl(${config.colors.primary} / 0.4)` }}
          >
            <div 
              className="w-2 h-3 rounded-full animate-bounce" 
              style={{ background: `linear-gradient(to bottom, hsl(${config.colors.primary}), hsl(${config.colors.primary} / 0.8))` }}
            />
          </div>
        </div>
      </section>

      {/* Render sections in configured order */}
      {sectionOrder.map((sectionId) => renderSection(sectionId))}

      {/* Footer - Psico Space Style */}
      <footer className="py-16 relative overflow-hidden bg-charcoal">
        <div 
          className="absolute top-0 left-0 w-full h-1"
          style={{ background: `linear-gradient(to right, hsl(${config.colors.primary}), hsl(${config.colors.accent}), hsl(${config.colors.primary}))` }}
        />
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="grid md:grid-cols-3 gap-10 mb-10">
            {/* Brand */}
            <div>
              <a href="#" className="flex items-center gap-2 mb-4 group">
                <div 
                  className="relative w-11 h-11 rounded-xl flex items-center justify-center shadow-lg transition-transform duration-300 group-hover:scale-105"
                  style={{ background: `linear-gradient(to bottom right, hsl(${config.colors.primary}), hsl(${config.colors.primary} / 0.8))` }}
                >
                  <Heart className="w-5 h-5 text-white" />
                  <Sparkles className="absolute -top-1 -right-1 w-3 h-3" style={{ color: `hsl(${config.colors.accent})` }} />
                </div>
                <span className="font-serif text-xl text-white">{profile ? formatProfessionalName(profile.full_name, profile.gender) : "Nome do Profissional"}</span>
              </a>
              <p className="text-white/70 text-sm leading-relaxed font-medium">
                {config.footer?.description || (profile?.bio ? (profile.bio.length > 150 ? profile.bio.substring(0, 150) + '...' : profile.bio) : "Atendimento humanizado e personalizado em saúde mental.")}
              </p>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="font-semibold mb-4 flex items-center gap-2 text-white">
                <span 
                  className="w-8 h-0.5" 
                  style={{ background: `linear-gradient(to right, hsl(${config.colors.primary}), hsl(${config.colors.accent}))` }}
                />
                Links Rápidos
              </h4>
              <div className="space-y-2">
                {["Serviços", "Sobre", "Agendar Consulta", "Contato"].map((link) => (
                  <a 
                    key={link}
                    href={`#${link.toLowerCase().replace(" ", "-")}`} 
                    className="block text-white/70 transition-colors text-sm font-medium hover:translate-x-1 transform duration-200"
                    onMouseEnter={(e) => e.currentTarget.style.color = `hsl(${config.colors.primary})`}
                    onMouseLeave={(e) => e.currentTarget.style.color = ''}
                  >
                    {link}
                  </a>
                ))}
              </div>
            </div>

            {/* Social */}
            <div>
              <h4 className="font-semibold mb-4 flex items-center gap-2 text-white">
                <span 
                  className="w-8 h-0.5" 
                  style={{ background: `linear-gradient(to right, hsl(${config.colors.accent}), hsl(${config.colors.primary}))` }}
                />
                Redes Sociais
              </h4>
              <div className="flex items-center gap-3">
                {[Instagram, Facebook, Linkedin].map((Icon, i) => (
                  <a 
                    key={i}
                    href="#" 
                    className="w-11 h-11 rounded-full bg-white/10 flex items-center justify-center transition-all duration-300 hover:scale-110"
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = `hsl(${config.colors.primary})`}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = ''}
                  >
                    <Icon className="w-5 h-5 text-white" />
                  </a>
                ))}
              </div>
            </div>
          </div>

          <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-white/50 text-sm font-medium">
              © {new Date().getFullYear()} {profile?.full_name || "Nome do Profissional"}. {config.footer?.copyright || "Todos os direitos reservados."}
            </p>
            <p className="text-white/50 text-sm flex items-center gap-2 font-medium">
              <span 
                className="w-2 h-2 rounded-full" 
                style={{ background: `linear-gradient(to right, hsl(${config.colors.primary}), hsl(${config.colors.accent}))` }}
              />
              {profile?.crp || "CRP 00/00000"}
            </p>
          </div>
        </div>
      </footer>

      {/* WhatsApp Button */}
      <div className="fixed bottom-6 right-6 z-50">
        <Button 
          size="lg"
          className="rounded-full shadow-xl h-14 w-14 bg-[#25D366] hover:bg-[#20BD5A] transition-all duration-300 hover:scale-110"
        >
          <MessageCircle className="w-7 h-7" />
        </Button>
      </div>
    </div>
  );
};

export default LandingPagePreview;
