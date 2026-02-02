import { useState, useEffect } from "react";
import { Play, ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface HeroBannerProps {
  professionalName: string;
  professionalAvatarUrl?: string | null;
  userName?: string;
  featuredModule?: {
    id: string;
    title: string;
    description: string | null;
    thumbnailUrl: string | null;
  };
  onContinueLearning?: () => void;
  onSelectModule?: (moduleId: string) => void;
}

const HeroBanner = ({
  professionalName,
  professionalAvatarUrl,
  userName,
  featuredModule,
  onContinueLearning,
  onSelectModule,
}: HeroBannerProps) => {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  const greeting = userName ? `Olá, ${userName}!` : "Bem-vindo!";
  const subtitle = `Continue sua jornada de aprendizado com ${professionalName}`;

  return (
    <div className="relative w-full h-[320px] md:h-[400px] lg:h-[450px] overflow-hidden rounded-2xl">
      {/* Background Image/Gradient */}
      <div className="absolute inset-0">
        {featuredModule?.thumbnailUrl ? (
          <img
            src={featuredModule.thumbnailUrl}
            alt=""
            className="w-full h-full object-cover"
          />
        ) : professionalAvatarUrl ? (
          <img
            src={professionalAvatarUrl}
            alt=""
            className="w-full h-full object-cover object-top"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900" />
        )}
        
        {/* Overlay Gradients */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/60 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-gray-950 via-transparent to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-purple-900/20" />
      </div>

      {/* Animated Particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 right-20 w-2 h-2 bg-primary/40 rounded-full animate-pulse" />
        <div className="absolute top-40 right-40 w-1 h-1 bg-white/30 rounded-full animate-pulse delay-300" />
        <div className="absolute bottom-32 right-60 w-1.5 h-1.5 bg-purple-400/30 rounded-full animate-pulse delay-500" />
      </div>

      {/* Content */}
      <div
        className={cn(
          "relative h-full flex flex-col justify-center px-8 md:px-12 lg:px-16 transition-all duration-700",
          isLoaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
        )}
      >
        {/* Badge */}
        <div className="flex items-center gap-2 mb-4">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-sm border border-white/10">
            <Sparkles className="w-3.5 h-3.5 text-primary" />
            <span className="text-xs font-medium text-white/90 uppercase tracking-wider">
              Área de Membros
            </span>
          </div>
        </div>

        {/* Main Title */}
        <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-3 max-w-xl">
          {greeting}
        </h1>

        {/* Subtitle */}
        <p className="text-base md:text-lg text-gray-300 mb-6 max-w-lg leading-relaxed">
          {subtitle}
        </p>

        {/* Featured Module Info */}
        {featuredModule && (
          <div className="mb-6">
            <p className="text-sm text-gray-400 mb-1">Módulo em destaque</p>
            <p className="text-lg font-semibold text-white">{featuredModule.title}</p>
            {featuredModule.description && (
              <p className="text-sm text-gray-400 mt-1 line-clamp-2 max-w-md">
                {featuredModule.description}
              </p>
            )}
          </div>
        )}

        {/* CTA Buttons */}
        <div className="flex items-center gap-4 flex-wrap">
          <Button
            size="lg"
            onClick={() => {
              if (featuredModule && onSelectModule) {
                onSelectModule(featuredModule.id);
              } else if (onContinueLearning) {
                onContinueLearning();
              }
            }}
            className="bg-white hover:bg-gray-100 text-gray-900 font-semibold px-6 shadow-lg shadow-white/20 group"
          >
            <Play className="w-5 h-5 mr-2 fill-current" />
            Continuar Assistindo
          </Button>
          
          <Button
            size="lg"
            variant="outline"
            onClick={onContinueLearning}
            className="bg-white/10 hover:bg-white/20 border-white/20 text-white backdrop-blur-sm group"
          >
            Ver Todos os Módulos
            <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
          </Button>
        </div>
      </div>

      {/* Professional Avatar Floating (right side on larger screens) */}
      {professionalAvatarUrl && !featuredModule?.thumbnailUrl && (
        <div className="hidden lg:block absolute right-16 top-1/2 -translate-y-1/2 pointer-events-none">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-t from-primary/30 to-transparent rounded-full blur-3xl scale-110" />
            <img
              src={professionalAvatarUrl}
              alt={professionalName}
              className="relative w-48 h-48 rounded-full object-cover border-4 border-white/10 shadow-2xl"
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default HeroBanner;
