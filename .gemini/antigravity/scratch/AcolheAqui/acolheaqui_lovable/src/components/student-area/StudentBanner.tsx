import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, Play, Calendar, Users, Sparkles, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";

interface BannerConfig {
  title: string;
  subtitle: string;
  ctaText: string;
  accentColor: string;
  gradientPreset: string;
  showAvatar: boolean;
  avatarPosition: "left" | "right";
  backgroundImage?: string;
  backgroundOverlay: number;
}

interface BannerSlide {
  id: string;
  type: "welcome" | "event" | "course" | "community";
  title: string;
  subtitle: string;
  buttonText?: string;
  buttonAction?: () => void;
  accentColor: string;
  icon: React.ElementType;
}

interface StudentBannerProps {
  professionalId: string;
  professionalName: string;
  professionalAvatarUrl?: string | null;
  userName?: string;
  upcomingEvent?: {
    title: string;
    date: string;
  };
  onContinueLearning?: () => void;
  onViewEvents?: () => void;
  onJoinCommunity?: () => void;
}

const GRADIENT_PRESETS: Record<string, { from: string; via: string; to: string }> = {
  purple: { from: "from-primary", via: "via-purple-600", to: "to-pink-600" },
  blue: { from: "from-blue-600", via: "via-cyan-500", to: "to-teal-500" },
  green: { from: "from-emerald-500", via: "via-teal-500", to: "to-cyan-500" },
  orange: { from: "from-orange-500", via: "via-red-500", to: "to-pink-500" },
  pink: { from: "from-pink-500", via: "via-rose-500", to: "to-red-500" },
  gold: { from: "from-yellow-500", via: "via-amber-500", to: "to-orange-500" },
};

const StudentBanner = ({
  professionalId,
  professionalName,
  professionalAvatarUrl,
  userName,
  upcomingEvent,
  onContinueLearning,
  onViewEvents,
  onJoinCommunity,
}: StudentBannerProps) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [isLoaded, setIsLoaded] = useState(false);
  const [bannerConfig, setBannerConfig] = useState<BannerConfig | null>(null);

  // Load banner config from professional's settings
  useEffect(() => {
    const loadBannerConfig = async () => {
      if (!professionalId) return;

      const { data } = await supabase
        .from("landing_page_config")
        .select("config")
        .eq("professional_id", professionalId)
        .single();

      if (data?.config && typeof data.config === "object") {
        const config = data.config as Record<string, any>;
        if (config.memberBanner) {
          setBannerConfig(config.memberBanner);
        }
      }
    };

    loadBannerConfig();
    setIsLoaded(true);
  }, [professionalId]);

  // Get gradient classes from config
  const getGradientClasses = (presetId?: string) => {
    const preset = GRADIENT_PRESETS[presetId || "purple"] || GRADIENT_PRESETS.purple;
    return `${preset.from} ${preset.via} ${preset.to}`;
  };

  // Build slides with custom config
  const buildSlides = (): BannerSlide[] => {
    const defaultTitle = userName ? `Olá, ${userName}! 👋` : "Bem-vindo!";
    const defaultSubtitle = `Continue sua jornada de aprendizado com ${professionalName}`;
    
    const slides: BannerSlide[] = [
      {
        id: "welcome",
        type: "welcome",
        title: bannerConfig?.title || defaultTitle,
        subtitle: bannerConfig?.subtitle || defaultSubtitle,
        buttonText: bannerConfig?.ctaText || "Continuar Assistindo",
        buttonAction: onContinueLearning,
        accentColor: getGradientClasses(bannerConfig?.gradientPreset),
        icon: Play,
      },
      {
        id: "community",
        type: "community",
        title: "Comunidade Exclusiva",
        subtitle: "Conecte-se com outros alunos e compartilhe experiências",
        buttonText: "Participar",
        buttonAction: onJoinCommunity,
        accentColor: "from-emerald-500 via-teal-500 to-cyan-500",
        icon: Users,
      },
    ];

    // Add event slide if there's an upcoming event
    if (upcomingEvent) {
      slides.splice(1, 0, {
        id: "event",
        type: "event",
        title: upcomingEvent.title,
        subtitle: `Evento ao vivo: ${upcomingEvent.date}`,
        buttonText: "Ver Detalhes",
        buttonAction: onViewEvents,
        accentColor: "from-orange-500 via-red-500 to-pink-500",
        icon: Calendar,
      });
    }

    return slides;
  };

  const slides = buildSlides();

  useEffect(() => {
    if (!isAutoPlaying) return;
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [isAutoPlaying, slides.length]);

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
    setIsAutoPlaying(false);
    setTimeout(() => setIsAutoPlaying(true), 10000);
  };

  const nextSlide = () => goToSlide((currentSlide + 1) % slides.length);
  const prevSlide = () => goToSlide((currentSlide - 1 + slides.length) % slides.length);

  const currentSlideData = slides[currentSlide];
  const IconComponent = currentSlideData.icon;
  
  // Determine avatar position from config
  const avatarPosition = bannerConfig?.avatarPosition || "right";
  const showAvatar = bannerConfig?.showAvatar !== false;
  const backgroundImage = bannerConfig?.backgroundImage;
  const backgroundOverlay = bannerConfig?.backgroundOverlay ?? 60;

  return (
    <div className="relative w-full h-[280px] md:h-[320px] lg:h-[360px] overflow-hidden rounded-2xl">
      {/* Background with gradient and image */}
      <div className="absolute inset-0 bg-gray-900">
        {/* Custom Background Image */}
        {backgroundImage && (
          <img
            src={backgroundImage}
            alt=""
            className="absolute inset-0 w-full h-full object-cover"
          />
        )}

        {/* Avatar (only show if no custom background) */}
        {!backgroundImage && showAvatar && professionalAvatarUrl && (
          <img
            src={professionalAvatarUrl}
            alt=""
            className={cn(
              "absolute top-0 h-full w-2/3 object-cover object-top opacity-40",
              avatarPosition === "right" ? "right-0" : "left-0"
            )}
            style={{
              maskImage: avatarPosition === "right"
                ? "linear-gradient(to left, black 30%, transparent 100%)"
                : "linear-gradient(to right, black 30%, transparent 100%)",
              WebkitMaskImage: avatarPosition === "right"
                ? "linear-gradient(to left, black 30%, transparent 100%)"
                : "linear-gradient(to right, black 30%, transparent 100%)",
            }}
          />
        )}
        
        {/* Accent gradient overlay */}
        <div
          className={cn(
            "absolute inset-0 transition-all duration-700 bg-gradient-to-r",
            currentSlideData.accentColor
          )}
          style={{ opacity: backgroundImage ? 0.4 : 0.3 }}
        />
        
        {/* Dark overlay for readability */}
        <div
          className={cn(
            "absolute inset-0 bg-gradient-to-r from-gray-950 via-gray-950/70 to-transparent",
            avatarPosition === "left" && "from-transparent via-gray-950/70 to-gray-950"
          )}
          style={{ opacity: backgroundOverlay / 100 }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-gray-950 via-transparent to-gray-950/30" />
      </div>

      {/* Decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Glowing orbs */}
        <div className={cn(
          "absolute -top-20 -left-20 w-64 h-64 rounded-full blur-3xl opacity-20 transition-all duration-700 bg-gradient-to-r",
          currentSlideData.accentColor
        )} />
        <div className="absolute -bottom-32 right-1/4 w-96 h-96 rounded-full blur-3xl bg-purple-900/20" />
        
        {/* Floating particles */}
        <div className="absolute top-16 left-1/4 w-1 h-1 bg-white/40 rounded-full animate-pulse" />
        <div className="absolute top-32 left-1/3 w-1.5 h-1.5 bg-primary/40 rounded-full animate-pulse delay-300" />
        <div className="absolute bottom-24 left-1/5 w-1 h-1 bg-purple-400/40 rounded-full animate-pulse delay-500" />
      </div>

      {/* Content */}
      <div
        className={cn(
          "relative h-full flex items-center px-8 md:px-12 lg:px-16 transition-all duration-500",
          isLoaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4",
          avatarPosition === "left" && "justify-end"
        )}
      >
        <div className={cn(
          "flex-1 space-y-4 max-w-xl",
          avatarPosition === "left" && "text-right"
        )}>
          {/* Badge */}
          <div className={cn(
            "flex items-center gap-2",
            avatarPosition === "left" && "justify-end"
          )}>
            <div className={cn(
              "flex items-center gap-2 px-3 py-1.5 rounded-full backdrop-blur-sm border transition-all duration-500",
              "bg-white/5 border-white/10"
            )}>
              <Sparkles className="w-3.5 h-3.5 text-primary" />
              <span className="text-xs font-medium text-white/80 uppercase tracking-wider">
                {currentSlideData.type === "welcome" && "Área de Membros"}
                {currentSlideData.type === "event" && "Próximo Evento"}
                {currentSlideData.type === "community" && "Comunidade"}
                {currentSlideData.type === "course" && "Novo Conteúdo"}
              </span>
            </div>
          </div>

          {/* Title with animation */}
          <h2
            key={currentSlideData.id + "-title"}
            className="text-2xl md:text-3xl lg:text-4xl font-bold text-white leading-tight animate-fadeIn"
          >
            {currentSlideData.title}
          </h2>

          {/* Subtitle */}
          <p
            key={currentSlideData.id + "-subtitle"}
            className="text-sm md:text-base text-gray-300 leading-relaxed animate-fadeIn"
          >
            {currentSlideData.subtitle}
          </p>

          {/* CTA Buttons */}
          {currentSlideData.buttonText && currentSlideData.buttonAction && (
            <div className={cn(
              "flex items-center gap-3 pt-2",
              avatarPosition === "left" && "justify-end"
            )}>
              <Button
                onClick={currentSlideData.buttonAction}
                size="lg"
                className="bg-white hover:bg-gray-100 text-gray-900 font-semibold shadow-lg shadow-white/10 group"
              >
                <IconComponent className="w-4 h-4 mr-2" />
                {currentSlideData.buttonText}
              </Button>
              
              <Button
                variant="ghost"
                size="lg"
                onClick={currentSlideData.buttonAction}
                className="text-white/70 hover:text-white hover:bg-white/10 group"
              >
                Saiba mais
                <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
            </div>
          )}
        </div>

        {/* Icon decoration - floating card */}
        <div className={cn(
          "hidden lg:flex absolute top-1/2 -translate-y-1/2",
          avatarPosition === "left" ? "left-16" : "right-16"
        )}>
          <div className={cn(
            "relative w-32 h-32 rounded-2xl bg-gradient-to-br backdrop-blur-sm border border-white/10 flex items-center justify-center shadow-2xl transition-all duration-500",
            currentSlideData.accentColor + " opacity-20"
          )}>
            <div className="absolute inset-0.5 rounded-2xl bg-gray-900/80" />
            <IconComponent className="relative w-12 h-12 text-white/70" />
          </div>
        </div>
      </div>

      {/* Navigation arrows */}
      {slides.length > 1 && (
        <>
          <button
            onClick={prevSlide}
            className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/40 hover:bg-black/60 backdrop-blur-sm flex items-center justify-center text-white/70 hover:text-white transition-all border border-white/10"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={nextSlide}
            className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/40 hover:bg-black/60 backdrop-blur-sm flex items-center justify-center text-white/70 hover:text-white transition-all border border-white/10"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </>
      )}

      {/* Slide indicators */}
      {slides.length > 1 && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2">
          {slides.map((slide, index) => (
            <button
              key={slide.id}
              onClick={() => goToSlide(index)}
              className={cn(
                "h-1.5 rounded-full transition-all duration-300",
                index === currentSlide
                  ? "w-8 bg-white"
                  : "w-1.5 bg-white/30 hover:bg-white/50"
              )}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default StudentBanner;
