import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Play, 
  BookOpen, 
  Award, 
  Check, 
  Shield,
  ChevronRight,
  ChevronLeft,
  MessageCircle,
  Heart,
  Video,
  Star,
  Users,
  Clock,
  Infinity,
  ArrowRight,
  Sparkles,
  GraduationCap,
  Brain,
  Target,
  Lightbulb,
  Laptop,
  Smartphone,
  Monitor,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { SalesPageConfig } from "../SalesPagePreview";

interface LayoutProps {
  service: {
    id: string;
    name: string;
    description: string | null;
    price_cents: number;
    product_config?: Record<string, unknown>;
  };
  profile: {
    id: string;
    full_name: string | null;
    avatar_url: string | null;
    bio: string | null;
    specialty: string | null;
    crp: string | null;
  } | null;
  modules: {
    id: string;
    title: string;
    description: string | null;
    lessons_count: number;
    thumbnail_url?: string | null;
  }[];
  config: SalesPageConfig;
  themeColors: {
    primaryColor: string;
    secondaryColor: string;
    accentColor: string;
    textPrimary: string;
    textSecondary: string;
    textMuted: string;
    borderColor: string;
    bgOverlay: string;
    isLightTheme: boolean;
  };
}

const LandingLayout = ({ service, profile, modules, config, themeColors }: LayoutProps) => {
  const navigate = useNavigate();
  const { primaryColor, accentColor, textPrimary, textSecondary, textMuted, borderColor, isLightTheme } = themeColors;
  const [visibleMessages, setVisibleMessages] = useState(0);
  const [showTyping, setShowTyping] = useState(false);
  const [bgLoaded, setBgLoaded] = useState(false);
  const [carouselIndex, setCarouselIndex] = useState(0);
  const carouselRef = useRef<HTMLDivElement>(null);

  const handleCheckout = () => {
    navigate(`/checkout/${service.id}`);
  };

  const formatPrice = (cents: number) => {
    return (cents / 100).toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
  };

  const getInitials = (name: string | null) => {
    if (!name) return "P";
    return name.split(" ").map(n => n[0]).join("").substring(0, 2).toUpperCase();
  };

  const totalLessons = modules.reduce((acc, m) => acc + m.lessons_count, 0);
  const heroImageUrl = config.images?.heroImage || config.images?.videoThumbnail || (service.product_config?.image_url as string) || null;

  // Chat messages animation
  const messages = [
    { type: 'user', text: 'Olá! Tenho interesse no curso.' },
    { type: 'instructor', text: 'Oi! Que bom te ver por aqui! 😊' },
    { type: 'user', text: 'O curso tem certificado?' },
    { type: 'instructor', text: 'Sim! Certificado incluso após conclusão.' },
  ];

  // Benefits for "É pra você" section
  const targetAudienceBenefits = [
    { icon: GraduationCap, title: 'Não precisa ser especialista', description: 'os conteúdos são didáticos e acessíveis, sem perder o rigor.' },
    { icon: Brain, title: 'Profissionais avançados também se beneficiam', description: 'há versões mais aprofundadas para quem deseja mergulhar nos detalhes.' },
    { icon: Target, title: 'Não exige formação prévia', description: 'a estrutura do material garante compreensão mesmo para quem não tem experiência.' },
    { icon: Clock, title: 'Flexível em tempo de dedicação', description: 'o conteúdo pode ser consumido em ~20 minutos; vídeos permitem mergulho completo.' },
    { icon: Lightbulb, title: 'Abrangência interdisciplinar', description: 'pensado para diferentes áreas: saúde, educação, gestão, tecnologia e mais.' },
  ];

  // Carousel navigation
  const maxCarouselIndex = Math.max(0, modules.length - 3);
  
  const nextSlide = () => {
    setCarouselIndex(prev => Math.min(prev + 1, maxCarouselIndex));
  };

  const prevSlide = () => {
    setCarouselIndex(prev => Math.max(prev - 1, 0));
  };

  useEffect(() => {
    setBgLoaded(true);
    
    let currentMessage = 0;
    const showNextMessage = () => {
      if (currentMessage >= messages.length) return;
      setShowTyping(true);
      setTimeout(() => {
        setShowTyping(false);
        setVisibleMessages(prev => prev + 1);
        currentMessage++;
        if (currentMessage < messages.length) {
          setTimeout(showNextMessage, 1000);
        }
      }, 1200);
    };

    const timer = setTimeout(showNextMessage, 1500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <>
      {/* Hero Section - Full Screen with Background Image */}
      <section className="relative min-h-screen flex items-center overflow-hidden">
        {/* Background Image */}
        {heroImageUrl ? (
          <div
            className={`absolute inset-0 bg-cover bg-center bg-no-repeat transition-opacity duration-700 ${
              bgLoaded ? "opacity-100" : "opacity-0"
            }`}
            style={{ backgroundImage: `url(${heroImageUrl})` }}
          />
        ) : (
          <div 
            className="absolute inset-0"
            style={{ 
              background: `linear-gradient(135deg, ${primaryColor}40 0%, transparent 50%), 
                          radial-gradient(circle at 80% 20%, ${accentColor}30, transparent 50%)` 
            }}
          />
        )}
        
        {/* Gradient Overlays */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/40" />

        {/* Content */}
        <div className="relative z-10 container mx-auto px-4 py-20">
          <div className="max-w-2xl">
            {/* Badge */}
            <div 
              className="inline-flex items-center gap-2 rounded-full px-4 py-2 mb-6 backdrop-blur-sm animate-fade-in"
              style={{ backgroundColor: `${primaryColor}30`, border: `1px solid ${primaryColor}50` }}
            >
              <Sparkles className="w-4 h-4 text-white" />
              <span className="text-sm font-medium text-white">{config.hero.badge}</span>
            </div>

            {/* Title */}
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight mb-6 opacity-0 animate-fade-in-up">
              {config.hero.title || service.name}
            </h1>
            
            {(config.hero.subtitle || service.description) && (
              <p className="text-base sm:text-lg md:text-xl text-white/80 mb-8 max-w-xl opacity-0 animate-fade-in-up" style={{ animationDelay: '100ms' }}>
                {config.hero.subtitle || service.description}
              </p>
            )}

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-start gap-4 mb-8 opacity-0 animate-fade-in-up" style={{ animationDelay: '200ms' }}>
              <Button 
                size="lg" 
                onClick={handleCheckout}
                className="group px-8 py-6 text-lg font-bold text-white rounded-xl shadow-2xl transition-all duration-300 hover:scale-[1.02]"
                style={{ 
                  backgroundColor: primaryColor,
                  boxShadow: `0 20px 50px ${primaryColor}50`,
                }}
              >
                {config.hero.ctaText}
                <ChevronRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
            </div>

            {/* Trust indicators */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-8 opacity-0 animate-fade-in-up" style={{ animationDelay: '300ms' }}>
              {profile && (
                <div className="flex items-center gap-3">
                  <Avatar className="w-12 h-12 border-2 border-white/30">
                    <AvatarImage src={profile.avatar_url || undefined} />
                    <AvatarFallback style={{ backgroundColor: `${primaryColor}50`, color: 'white' }}>
                      {getInitials(profile.full_name)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-white font-medium text-sm">{profile.full_name}</p>
                    <p className="text-white/60 text-xs">{profile.specialty || 'Instrutor'}</p>
                  </div>
                </div>
              )}
              <div className="flex items-center gap-1">
                {[1,2,3,4,5].map(i => (
                  <Star key={i} className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                ))}
                <span className="text-white/70 text-sm ml-2">+100 alunos</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Banner */}
        <div className="absolute bottom-0 left-0 right-0 z-20">
          <div className="container mx-auto px-4 pb-8">
            <div className="text-center opacity-0 animate-fade-in-up" style={{ animationDelay: '400ms' }}>
              <p className="text-white text-lg sm:text-xl md:text-2xl font-semibold">
                Por apenas {formatPrice(service.price_cents)}
              </p>
              <p className="text-sm sm:text-base font-medium mt-2 flex items-center justify-center gap-2" style={{ color: primaryColor }}>
                <MessageCircle className="w-4 h-4 fill-current animate-pulse" />
                {config.cta.urgencyText || 'Acesso imediato após a compra!'}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 md:py-24" style={{ backgroundColor: `hsl(${config.colors.background})` }}>
        <div className="container mx-auto px-4">
          <h2 className={`text-2xl sm:text-3xl md:text-4xl font-bold text-center mb-4 ${textPrimary}`}>
            O que você vai aprender
          </h2>
          <p className={`text-center mb-12 max-w-2xl mx-auto ${textMuted}`}>
            {config.content.sectionSubtitle}
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {[
              { icon: BookOpen, title: `${totalLessons}+ Aulas`, description: 'Conteúdo completo e atualizado' },
              { icon: Award, title: 'Certificado', description: 'Reconhecido e verificado' },
              { icon: Infinity, title: 'Acesso Vitalício', description: 'Estude quando quiser' },
            ].map((feature, index) => (
              <div
                key={index}
                className="rounded-2xl p-6 text-center transition-all duration-300 hover:shadow-2xl hover:scale-105 border"
                style={{ 
                  background: `linear-gradient(135deg, ${primaryColor}, ${primaryColor}CC)`,
                  borderColor: `${primaryColor}50`,
                }}
              >
                <div className="w-14 h-14 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center mx-auto mb-4 shadow-lg">
                  <feature.icon className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">{feature.title}</h3>
                <p className="text-white/80 text-sm">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* "É pra você" Section - Split with Benefits */}
      <section 
        className="py-16 md:py-24"
        style={{ backgroundColor: isLightTheme ? 'white' : `hsl(${config.colors.background})` }}
      >
        <div className="container mx-auto px-4">
          {/* Section Badge */}
          <div className="text-center mb-8">
            <span 
              className="inline-block px-4 py-2 rounded-full text-sm font-medium border"
              style={{ 
                borderColor: isLightTheme ? '#e5e7eb' : borderColor,
                color: isLightTheme ? '#374151' : textPrimary,
                backgroundColor: isLightTheme ? 'white' : 'transparent',
              }}
            >
              É pra você
            </span>
          </div>

          <div className="flex flex-col lg:flex-row items-start gap-12 lg:gap-16">
            {/* Left Side - Title + Description + Mockups */}
            <div className="w-full lg:w-1/2">
              <h2 className={`text-3xl sm:text-4xl md:text-5xl font-bold mb-6 leading-tight ${isLightTheme ? 'text-gray-900' : textPrimary}`}>
                Sim, o <span style={{ color: primaryColor }}>curso</span> é pra você!
              </h2>
              
              <p className={`text-base md:text-lg mb-10 max-w-lg ${isLightTheme ? 'text-gray-600' : textMuted}`}>
                {service.description || 'Este conteúdo é voltado para profissionais, estudantes e interessados de diversas áreas, especialmente aqueles que atuam, direta ou indiretamente, com o tema abordado.'}
              </p>

              {/* Multi-device Mockup */}
              <div className="relative">
                {/* Laptop Mockup */}
                <div 
                  className="relative z-10 rounded-xl overflow-hidden shadow-2xl border-8"
                  style={{ 
                    borderColor: isLightTheme ? '#1f2937' : '#374151',
                    backgroundColor: isLightTheme ? '#f9fafb' : '#1f2937',
                  }}
                >
                  <div className="aspect-video bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center">
                    <div className="text-center">
                      <div 
                        className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
                        style={{ backgroundColor: `${primaryColor}30` }}
                      >
                        <Play className="w-8 h-8 text-white" />
                      </div>
                      <p className="text-white/60 text-sm">Comece por aqui</p>
                    </div>
                  </div>
                </div>

                {/* Phone Mockup - Left */}
                <div 
                  className="absolute -left-4 md:-left-8 bottom-0 w-20 md:w-28 z-20 rounded-2xl overflow-hidden shadow-xl border-4"
                  style={{ 
                    borderColor: isLightTheme ? '#1f2937' : '#374151',
                    transform: 'translateY(20%)',
                  }}
                >
                  <div className="aspect-[9/19] bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center p-2">
                    <div className="text-center">
                      <Smartphone className="w-6 h-6 text-white/40 mx-auto" />
                    </div>
                  </div>
                </div>

                {/* Tablet/Document - Right */}
                <div 
                  className="absolute -right-4 md:-right-8 top-1/4 w-24 md:w-32 z-0 rounded-lg overflow-hidden shadow-xl transform rotate-6"
                  style={{ backgroundColor: 'white' }}
                >
                  <div className="aspect-[3/4] p-3">
                    <div className="h-2 w-3/4 bg-gray-300 rounded mb-2" />
                    <div className="h-1.5 w-full bg-gray-200 rounded mb-1" />
                    <div className="h-1.5 w-5/6 bg-gray-200 rounded mb-1" />
                    <div className="h-1.5 w-4/5 bg-gray-200 rounded" />
                  </div>
                </div>
              </div>
            </div>

            {/* Right Side - Benefits List */}
            <div className="w-full lg:w-1/2 space-y-6">
              {targetAudienceBenefits.map((benefit, index) => (
                <div 
                  key={index}
                  className="flex items-start gap-4"
                >
                  <div 
                    className="flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center"
                    style={{ backgroundColor: `${primaryColor}15` }}
                  >
                    <benefit.icon className="w-6 h-6" style={{ color: primaryColor }} />
                  </div>
                  <div>
                    <h3 className={`font-bold text-lg mb-1 ${isLightTheme ? 'text-gray-900' : textPrimary}`}>
                      {benefit.title}
                    </h3>
                    <p className={`text-sm ${isLightTheme ? 'text-gray-600' : textMuted}`}>
                      {benefit.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Instructor Section - Premium Photo Style */}
      {config.instructor.showSection && profile && (
        <section 
          className="py-16 md:py-24 overflow-hidden"
          style={{ backgroundColor: '#0a0f1a' }}
        >
          <div className="container mx-auto px-4">
            <div 
              className="relative rounded-3xl overflow-hidden"
              style={{ backgroundColor: '#111827' }}
            >
              <div className="flex flex-col lg:flex-row">
                {/* Left Side - Photo with Name Overlay */}
                <div className="relative w-full lg:w-2/5 min-h-[400px] lg:min-h-[600px]">
                  {/* Background Photo */}
                  <div className="absolute inset-0">
                    {profile.avatar_url ? (
                      <img 
                        src={profile.avatar_url} 
                        alt={profile.full_name || 'Instrutor'}
                        className="w-full h-full object-cover object-top"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-700 to-gray-900">
                        <Users className="w-32 h-32 text-white/20" />
                      </div>
                    )}
                    {/* Gradient overlay for text */}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-transparent to-[#111827]/90 lg:to-[#111827]" />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#111827]/80 via-transparent to-transparent" />
                  </div>
                  
                  {/* Name Typography - Bottom Left */}
                  <div className="absolute bottom-6 left-6 lg:bottom-12 lg:left-8 z-10">
                    <h2 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white leading-none drop-shadow-2xl">
                      {profile.full_name?.split(' ')[0] || 'Instrutor'}
                    </h2>
                    <h2 
                      className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold leading-none drop-shadow-2xl"
                      style={{ color: primaryColor }}
                    >
                      {profile.full_name?.split(' ').slice(1).join(' ') || ''}
                    </h2>
                  </div>
                </div>
                
                {/* Right Side - Bio Content */}
                <div className="w-full lg:w-3/5 p-6 md:p-8 lg:p-12 flex flex-col justify-center">
                  {/* Highlight Box */}
                  <div 
                    className="rounded-2xl p-5 md:p-6 lg:p-8 mb-6 md:mb-8"
                    style={{ backgroundColor: primaryColor }}
                  >
                    <p className="text-white text-sm md:text-base lg:text-lg leading-relaxed font-medium">
                      {config.instructor.title || `Por trás do curso, a experiência de quem alia trajetória acadêmica sólida, didática reconhecida e anos de atuação em educação e divulgação do conhecimento.`}
                    </p>
                  </div>

                  {/* Bio Paragraphs */}
                  <div className="space-y-4 text-gray-300 text-sm md:text-base leading-relaxed">
                    {profile.bio ? (
                      profile.bio.split('\n').map((paragraph, idx) => (
                        <p key={idx}>{paragraph}</p>
                      ))
                    ) : (
                      <>
                        <p>
                          Profissional com ampla experiência na área, reconhecido pela didática 
                          e pela capacidade de traduzir temas complexos em linguagem clara.
                        </p>
                        <p>
                          É idealizador e coordenador do curso, que já formou centenas de profissionais, 
                          e criador de conteúdos educacionais de alto impacto.
                        </p>
                        <p>
                          Atualmente, coordena este projeto, onde integra sua experiência acadêmica 
                          e de divulgação em uma proposta inovadora de atualização crítica e interdisciplinar.
                        </p>
                      </>
                    )}
                  </div>

                  {profile.crp && (
                    <Badge variant="outline" className="mt-6 text-white border-white/30 w-fit">
                      CRP: {profile.crp}
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Module Carousel Section */}
      <section 
        className="py-16 md:py-24"
        style={{ backgroundColor: isLightTheme ? 'white' : `hsl(${config.colors.background})` }}
      >
        <div className="container mx-auto px-4">
          <h2 className={`text-2xl sm:text-3xl md:text-4xl font-bold text-center mb-12 ${isLightTheme ? 'text-gray-900' : textPrimary}`}>
            {config.content.sectionTitle || 'Temas já abordados'}
          </h2>

          {/* Carousel Container */}
          <div className="relative">
            {/* Navigation Buttons */}
            {modules.length > 3 && (
              <>
                <button
                  onClick={prevSlide}
                  disabled={carouselIndex === 0}
                  className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 z-20 w-12 h-12 rounded-full flex items-center justify-center shadow-lg transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                  style={{ 
                    backgroundColor: primaryColor,
                    color: 'white',
                  }}
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>
                <button
                  onClick={nextSlide}
                  disabled={carouselIndex >= maxCarouselIndex}
                  className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 z-20 w-12 h-12 rounded-full flex items-center justify-center shadow-lg transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                  style={{ 
                    backgroundColor: primaryColor,
                    color: 'white',
                  }}
                >
                  <ChevronRight className="w-6 h-6" />
                </button>
              </>
            )}

            {/* Carousel Track */}
            <div className="overflow-hidden mx-8">
              <div 
                ref={carouselRef}
                className="flex gap-6 transition-transform duration-500 ease-out"
                style={{ transform: `translateX(-${carouselIndex * (100 / 3)}%)` }}
              >
                {modules.map((module, index) => (
                  <div
                    key={module.id}
                    className="flex-shrink-0 w-full sm:w-1/2 lg:w-1/3"
                  >
                    <div 
                      className="relative aspect-[3/4] rounded-2xl overflow-hidden group cursor-pointer"
                      style={{ 
                        background: `linear-gradient(135deg, ${primaryColor}90 0%, hsl(220, 50%, 15%) 100%)`,
                      }}
                    >
                      {/* Background Image if available */}
                      {module.thumbnail_url && (
                        <img 
                          src={module.thumbnail_url}
                          alt={module.title}
                          className="absolute inset-0 w-full h-full object-cover opacity-40 group-hover:opacity-50 transition-opacity"
                        />
                      )}

                      {/* Gradient Overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />

                      {/* Content */}
                      <div className="absolute inset-0 p-6 flex flex-col justify-between">
                        {/* Top - Episode Label */}
                        <div className="flex items-center justify-between">
                          <span className="text-white/60 text-sm font-medium">
                            // Módulo <span style={{ color: primaryColor }}>{String(index + 1).padStart(2, '0')}</span>
                          </span>
                          {/* Logo placeholder */}
                          <div 
                            className="w-10 h-10 rounded-lg flex items-center justify-center"
                            style={{ backgroundColor: `${primaryColor}30` }}
                          >
                            <BookOpen className="w-5 h-5 text-white" />
                          </div>
                        </div>

                        {/* Bottom - Title */}
                        <div>
                          <h3 className="text-xl md:text-2xl lg:text-3xl font-bold text-white leading-tight">
                            {module.title.split(' ').slice(0, 2).join(' ')}
                            {module.title.split(' ').length > 2 && (
                              <>
                                <br />
                                <span style={{ color: primaryColor }}>
                                  {module.title.split(' ').slice(2).join(' ')}
                                </span>
                              </>
                            )}
                          </h3>
                          <p className="text-white/60 text-sm mt-2">
                            {module.lessons_count} aulas
                          </p>
                        </div>
                      </div>

                      {/* Hover Overlay */}
                      <div 
                        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center"
                        style={{ backgroundColor: `${primaryColor}20` }}
                      >
                        <div 
                          className="w-16 h-16 rounded-full flex items-center justify-center"
                          style={{ backgroundColor: primaryColor }}
                        >
                          <Play className="w-8 h-8 text-white" />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Pagination Dots */}
            {modules.length > 3 && (
              <div className="flex items-center justify-center gap-2 mt-8">
                {Array.from({ length: maxCarouselIndex + 1 }).map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setCarouselIndex(i)}
                    className="w-8 h-2 rounded-full transition-all"
                    style={{ 
                      backgroundColor: i === carouselIndex ? primaryColor : `${primaryColor}30`,
                    }}
                  />
                ))}
              </div>
            )}
          </div>

          {/* CTA Button */}
          <div className="text-center mt-12">
            <Button 
              size="lg" 
              onClick={handleCheckout}
              className="group px-8 py-6 text-lg font-bold text-white rounded-xl shadow-xl"
              style={{ backgroundColor: primaryColor }}
            >
              Quero entrar no curso
              <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
          </div>
        </div>
      </section>

      {/* WhatsApp Chat Section */}
      <section 
        className="py-16 md:py-24"
        style={{ backgroundColor: isLightTheme ? `${primaryColor}08` : `${primaryColor}15` }}
      >
        <div className="container mx-auto px-4">
          <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-16">
            {/* Content */}
            <div className="flex-1 text-center lg:text-left order-2 lg:order-1">
              <div className="flex items-center gap-2 justify-center lg:justify-start mb-6">
                <MessageCircle className="w-6 h-6" style={{ color: primaryColor }} />
                <span className={`font-medium ${textPrimary}`}>Suporte Exclusivo</span>
              </div>
              
              <h2 className={`text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-4 leading-tight ${textPrimary}`}>
                Tire suas dúvidas{" "}
                <span style={{ color: primaryColor }}>diretamente</span>{" "}
                com o instrutor
              </h2>
              
              <p className={`mb-8 max-w-md mx-auto lg:mx-0 text-base md:text-lg ${textMuted}`}>
                Um canal direto para você ter suporte personalizado durante todo o curso.
              </p>
              
              <Button 
                size="lg" 
                onClick={handleCheckout}
                className="group px-8 py-6 text-lg font-semibold text-white rounded-xl w-full sm:w-auto"
                style={{ backgroundColor: primaryColor }}
              >
                Quero ter acesso
                <ArrowRight className="w-5 h-5 ml-2 transition-transform group-hover:translate-x-1" />
              </Button>
            </div>
            
            {/* Chat Mockup */}
            <div className="flex-1 flex justify-center order-1 lg:order-2">
              <div className="relative">
                <div 
                  className="w-[280px] sm:w-[320px] rounded-[2rem] p-2 shadow-2xl"
                  style={{ 
                    backgroundColor: isLightTheme ? 'white' : `hsl(${config.colors.background})`,
                    border: `2px solid ${borderColor}`,
                  }}
                >
                  <div className="bg-[#ece5dd] rounded-[1.5rem] overflow-hidden">
                    {/* Chat header */}
                    <div className="px-4 py-3 flex items-center gap-3" style={{ backgroundColor: primaryColor }}>
                      <Avatar className="w-10 h-10">
                        <AvatarImage src={profile?.avatar_url || undefined} />
                        <AvatarFallback className="bg-white/20 text-white font-bold">
                          {getInitials(profile?.full_name)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <p className="text-white font-medium text-sm">{profile?.full_name || 'Instrutor'}</p>
                        <p className="text-white/80 text-xs">online</p>
                      </div>
                    </div>
                    
                    {/* Chat messages */}
                    <div className="h-[350px] p-3 space-y-2 overflow-hidden flex flex-col">
                      {messages.slice(0, visibleMessages).map((message, index) => (
                        <div 
                          key={index}
                          className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in`}
                        >
                          <div 
                            className={`${
                              message.type === 'user' 
                                ? 'bg-[#DCF8C6] rounded-lg rounded-tr-sm' 
                                : 'bg-white rounded-lg rounded-tl-sm'
                            } px-3 py-2 max-w-[85%] shadow-sm`}
                          >
                            <p className="text-gray-800 text-sm">{message.text}</p>
                            <div className="flex items-center justify-end gap-1 mt-1">
                              <span className="text-gray-500 text-[10px]">12:34</span>
                              {message.type === 'user' && (
                                <>
                                  <Check className="w-3 h-3 text-blue-500" />
                                  <Check className="w-3 h-3 text-blue-500 -ml-2" />
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}

                      {showTyping && visibleMessages < messages.length && (
                        <div className="flex justify-start animate-fade-in">
                          <div className="bg-white rounded-lg rounded-tl-sm px-4 py-3 shadow-sm">
                            <div className="flex items-center gap-1">
                              <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                              <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                              <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                
                {/* Glow effect */}
                <div 
                  className="absolute -inset-4 rounded-[3rem] blur-2xl -z-10 opacity-30"
                  style={{ backgroundColor: primaryColor }}
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Instructor Section - Premium with Large Photo */}
      {config.instructor?.showSection !== false && profile && (
        <section className="py-16 md:py-24 overflow-hidden">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-0 items-stretch min-h-[600px]">
              {/* Left Side - Large Photo with Typography */}
              <div className="relative rounded-3xl lg:rounded-r-none overflow-hidden min-h-[500px] lg:min-h-full">
                {/* Background Image */}
                {profile.avatar_url ? (
                  <img 
                    src={profile.avatar_url}
                    alt={profile.full_name || 'Instrutor'}
                    className="absolute inset-0 w-full h-full object-cover object-top"
                  />
                ) : (
                  <div 
                    className="absolute inset-0"
                    style={{ background: `linear-gradient(135deg, ${primaryColor}, ${primaryColor}80)` }}
                  />
                )}
                
                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-r from-black/20 via-transparent to-black/60" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                
                {/* Large Typography Overlay */}
                <div className="absolute inset-0 flex flex-col justify-end p-8 md:p-12">
                  {profile.full_name && (
                    <div className="space-y-0">
                      {profile.full_name.split(' ').slice(0, 2).map((word, i) => (
                        <h3 
                          key={i}
                          className={`font-bold leading-none tracking-tight text-white ${
                            i === 0 ? 'text-4xl md:text-5xl lg:text-6xl opacity-90' : 'text-5xl md:text-6xl lg:text-7xl'
                          }`}
                          style={{ 
                            textShadow: '2px 2px 20px rgba(0,0,0,0.5)',
                            color: i === 1 ? primaryColor : 'white',
                          }}
                        >
                          {word}
                        </h3>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              
              {/* Right Side - Bio and Info */}
              <div 
                className="relative flex flex-col justify-center p-8 md:p-12 rounded-3xl lg:rounded-l-none"
                style={{ 
                  backgroundColor: isLightTheme ? '#f8f9fa' : `hsl(${config.colors.background})`,
                }}
              >
                {/* Section Title */}
                <div className="mb-8">
                  <span 
                    className="text-sm font-semibold uppercase tracking-widest"
                    style={{ color: primaryColor }}
                  >
                    {config.instructor?.title || 'Conheça seu instrutor'}
                  </span>
                </div>
                
                {/* Highlighted Bio Box */}
                <div 
                  className="p-6 md:p-8 rounded-2xl mb-8"
                  style={{ 
                    backgroundColor: primaryColor,
                  }}
                >
                  <p className="text-white text-lg md:text-xl font-medium leading-relaxed">
                    {profile.bio?.split('.').slice(0, 2).join('.') || 'Profissional dedicado a transformar vidas através do conhecimento.'}
                    {profile.bio && profile.bio.split('.').length > 2 ? '.' : ''}
                  </p>
                </div>
                
                {/* Additional Bio */}
                {profile.bio && profile.bio.split('.').length > 2 && (
                  <p className={`text-base md:text-lg leading-relaxed mb-8 ${textMuted}`}>
                    {profile.bio.split('.').slice(2).join('.').trim()}
                  </p>
                )}
                
                {/* Specialty */}
                {profile.specialty && (
                  <p className={`text-base mb-6 ${textSecondary}`}>
                    <span className="font-semibold" style={{ color: primaryColor }}>Especialidade:</span>{' '}
                    {profile.specialty}
                  </p>
                )}
                
                {/* CRP Badge */}
                {profile.crp && (
                  <div 
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-full w-fit"
                    style={{ 
                      backgroundColor: isLightTheme ? `${primaryColor}15` : `${primaryColor}20`,
                      border: `1px solid ${primaryColor}40`,
                    }}
                  >
                    <Award className="w-5 h-5" style={{ color: primaryColor }} />
                    <span className={`font-medium ${textPrimary}`}>CRP: {profile.crp}</span>
                  </div>
                )}
                
                {/* CTA */}
                <div className="mt-8">
                  <Button 
                    size="lg" 
                    onClick={handleCheckout}
                    className="group px-8 py-6 text-lg font-bold text-white rounded-xl shadow-xl"
                    style={{ backgroundColor: primaryColor }}
                  >
                    Quero aprender com {profile.full_name?.split(' ')[0] || 'o instrutor'}
                    <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* CTA Section */}
      <section className="py-16 md:py-24" style={{ background: `linear-gradient(135deg, ${primaryColor}15, ${accentColor}10)` }}>
        <div className="container mx-auto px-4 text-center">
          <h2 className={`text-2xl sm:text-3xl md:text-4xl font-bold mb-4 ${textPrimary}`}>
            {config.cta.mainText}
          </h2>
          <p className={`mb-8 max-w-xl mx-auto text-base md:text-lg ${textMuted}`}>
            {config.cta.subText}
          </p>

          <div className={`text-5xl md:text-6xl font-bold mb-8 ${textPrimary}`}>
            {formatPrice(service.price_cents)}
          </div>

          <Button 
            size="lg" 
            onClick={handleCheckout}
            className="group text-lg px-10 py-7 font-bold text-white rounded-xl shadow-2xl transition-all duration-300 hover:scale-[1.02]"
            style={{ 
              backgroundColor: primaryColor,
              boxShadow: `0 20px 50px ${primaryColor}50`,
            }}
          >
            {config.cta.buttonText}
            <ChevronRight className="w-6 h-6 ml-2 group-hover:translate-x-1 transition-transform" />
          </Button>

          {config.guarantee.enabled && (
            <div className={`flex items-center justify-center gap-3 mt-8 ${textMuted}`}>
              <Shield className="w-5 h-5 text-green-500" />
              <span>{config.guarantee.title}</span>
            </div>
          )}
        </div>
      </section>

      {/* Mobile CTA */}
      <div 
        className="lg:hidden fixed bottom-0 left-0 right-0 p-4 border-t backdrop-blur-xl z-50"
        style={{ 
          backgroundColor: isLightTheme ? 'rgba(255,255,255,0.95)' : `hsl(${config.colors.background} / 0.95)`,
          borderColor: borderColor,
        }}
      >
        <Button
          onClick={handleCheckout}
          className="w-full py-6 text-lg font-bold text-white rounded-xl shadow-xl"
          style={{ 
            backgroundColor: primaryColor,
            boxShadow: `0 -10px 30px ${primaryColor}40`,
          }}
        >
          {config.cta.buttonText} • {formatPrice(service.price_cents)}
        </Button>
      </div>

      {/* Bottom Spacer for Mobile */}
      <div className="h-24 lg:hidden" />
    </>
  );
};

export default LandingLayout;
