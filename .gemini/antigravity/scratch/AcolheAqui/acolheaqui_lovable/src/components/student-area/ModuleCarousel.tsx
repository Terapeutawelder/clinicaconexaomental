import { useState, useRef, useEffect } from "react";
import { ChevronLeft, ChevronRight, Play, BookOpen, Clock, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

interface Module {
  id: string;
  title: string;
  description: string | null;
  thumbnailUrl: string | null;
  lessonsCount: number;
}

interface ModuleCarouselProps {
  title: string;
  modules: Module[];
  onSelectModule: (moduleId: string) => void;
  completedLessons: Set<string>;
}

const ModuleCarousel = ({
  title,
  modules,
  onSelectModule,
  completedLessons,
}: ModuleCarouselProps) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const checkScroll = () => {
    if (!scrollRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
    setCanScrollLeft(scrollLeft > 0);
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
  };

  useEffect(() => {
    checkScroll();
    window.addEventListener("resize", checkScroll);
    return () => window.removeEventListener("resize", checkScroll);
  }, [modules]);

  const scroll = (direction: "left" | "right") => {
    if (!scrollRef.current) return;
    const scrollAmount = 400;
    scrollRef.current.scrollBy({
      left: direction === "left" ? -scrollAmount : scrollAmount,
      behavior: "smooth",
    });
    setTimeout(checkScroll, 300);
  };

  if (modules.length === 0) return null;

  return (
    <div className="relative group/carousel">
      {/* Title with count */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <h2 className="text-xl font-bold text-white">{title}</h2>
          <Badge variant="secondary" className="bg-gray-800 text-gray-400 border-gray-700">
            {modules.length} {modules.length === 1 ? "módulo" : "módulos"}
          </Badge>
        </div>
        
        {/* Desktop navigation */}
        <div className="hidden md:flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            className={cn(
              "w-8 h-8 rounded-full border border-gray-700",
              canScrollLeft 
                ? "text-white hover:bg-gray-800" 
                : "text-gray-600 cursor-not-allowed"
            )}
            onClick={() => scroll("left")}
            disabled={!canScrollLeft}
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className={cn(
              "w-8 h-8 rounded-full border border-gray-700",
              canScrollRight 
                ? "text-white hover:bg-gray-800" 
                : "text-gray-600 cursor-not-allowed"
            )}
            onClick={() => scroll("right")}
            disabled={!canScrollRight}
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Left fade gradient */}
      {canScrollLeft && (
        <div className="absolute left-0 top-12 bottom-0 w-20 bg-gradient-to-r from-gray-950 to-transparent z-10 pointer-events-none" />
      )}

      {/* Right fade gradient */}
      {canScrollRight && (
        <div className="absolute right-0 top-12 bottom-0 w-20 bg-gradient-to-l from-gray-950 to-transparent z-10 pointer-events-none" />
      )}

      {/* Scroll Buttons - Mobile/Touch */}
      {canScrollLeft && (
        <Button
          variant="ghost"
          size="icon"
          className="absolute left-2 top-1/2 -translate-y-1/2 z-20 bg-gray-900/90 hover:bg-gray-800 text-white w-10 h-10 rounded-full shadow-xl opacity-0 group-hover/carousel:opacity-100 transition-opacity md:hidden"
          onClick={() => scroll("left")}
        >
          <ChevronLeft className="w-5 h-5" />
        </Button>
      )}

      {canScrollRight && (
        <Button
          variant="ghost"
          size="icon"
          className="absolute right-2 top-1/2 -translate-y-1/2 z-20 bg-gray-900/90 hover:bg-gray-800 text-white w-10 h-10 rounded-full shadow-xl opacity-0 group-hover/carousel:opacity-100 transition-opacity md:hidden"
          onClick={() => scroll("right")}
        >
          <ChevronRight className="w-5 h-5" />
        </Button>
      )}

      {/* Cards Container */}
      <div
        ref={scrollRef}
        onScroll={checkScroll}
        className="flex gap-5 overflow-x-auto scrollbar-hide scroll-smooth pb-4 -mx-2 px-2"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {modules.map((module, index) => (
          <ModuleCard
            key={module.id}
            module={module}
            index={index}
            onClick={() => onSelectModule(module.id)}
          />
        ))}
      </div>
    </div>
  );
};

interface ModuleCardProps {
  module: Module;
  index: number;
  onClick: () => void;
}

const ModuleCard = ({ module, index, onClick }: ModuleCardProps) => {
  const [isHovered, setIsHovered] = useState(false);
  const [imageError, setImageError] = useState(false);

  const gradients = [
    "from-primary via-primary/60 to-purple-900",
    "from-purple-600 via-purple-600/60 to-blue-900",
    "from-blue-600 via-blue-600/60 to-cyan-900",
    "from-pink-600 via-pink-600/60 to-rose-900",
    "from-teal-600 via-teal-600/60 to-emerald-900",
    "from-orange-600 via-orange-600/60 to-amber-900",
  ];

  const gradient = gradients[index % gradients.length];

  // Estimate duration (30 min per lesson)
  const estimatedHours = Math.ceil((module.lessonsCount * 30) / 60);

  return (
    <div
      className={cn(
        "relative flex-shrink-0 w-64 md:w-72 rounded-2xl overflow-hidden cursor-pointer group/card transition-all duration-500",
        isHovered && "scale-[1.02] z-10"
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onClick}
    >
      {/* Card aspect ratio container */}
      <div className="aspect-[3/4] relative">
        {/* Background Image or Gradient */}
        {module.thumbnailUrl && !imageError ? (
          <>
            <img
              src={module.thumbnailUrl}
              alt={module.title}
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover/card:scale-110"
              onError={() => setImageError(true)}
            />
            {/* Image overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-gray-950 via-gray-950/60 to-gray-950/20" />
          </>
        ) : (
          <div className={cn("absolute inset-0 bg-gradient-to-br", gradient)}>
            {/* Pattern overlay for gradient cards */}
            <div className="absolute inset-0 opacity-20" style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            }} />
            <div className="absolute inset-0 bg-gradient-to-t from-gray-950 via-transparent to-transparent" />
          </div>
        )}

        {/* Top badges */}
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between z-10">
          <Badge className="bg-black/60 backdrop-blur-sm text-white text-xs border-0 shadow-lg">
            Módulo {index + 1}
          </Badge>
          {index === 0 && (
            <Badge className="bg-primary/90 text-white text-xs border-0 shadow-lg flex items-center gap-1">
              <Star className="w-3 h-3" fill="currentColor" />
              Popular
            </Badge>
          )}
        </div>

        {/* Play Button - Always visible on mobile, hover on desktop */}
        <div
          className={cn(
            "absolute inset-0 flex items-center justify-center transition-all duration-300",
            isHovered ? "opacity-100" : "opacity-0 md:opacity-0"
          )}
        >
          <div className="w-16 h-16 md:w-18 md:h-18 rounded-full bg-white/95 flex items-center justify-center shadow-2xl transform transition-all duration-300 group-hover/card:scale-110">
            <Play className="w-7 h-7 text-gray-900 ml-1" fill="currentColor" />
          </div>
        </div>

        {/* Content */}
        <div className="absolute bottom-0 left-0 right-0 p-4 z-10">
          {/* Title */}
          <h3 className="text-lg font-bold text-white mb-2 line-clamp-2 leading-tight">
            {module.title}
          </h3>
          
          {/* Description - show on hover */}
          <div className={cn(
            "overflow-hidden transition-all duration-300",
            isHovered ? "max-h-20 opacity-100" : "max-h-0 opacity-0"
          )}>
            {module.description && (
              <p className="text-sm text-gray-300 line-clamp-2 mb-3">
                {module.description}
              </p>
            )}
          </div>

          {/* Stats */}
          <div className="flex items-center gap-3 text-xs text-gray-400">
            <div className="flex items-center gap-1">
              <BookOpen className="w-3.5 h-3.5" />
              <span>{module.lessonsCount} aulas</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              <span>{estimatedHours}h</span>
            </div>
          </div>
        </div>

        {/* Hover Border Effect */}
        <div
          className={cn(
            "absolute inset-0 rounded-2xl border-2 transition-all duration-300 pointer-events-none",
            isHovered ? "border-primary shadow-xl shadow-primary/20" : "border-transparent"
          )}
        />

        {/* Bottom glow on hover */}
        {isHovered && (
          <div className="absolute bottom-0 left-0 right-0 h-1/3 bg-gradient-to-t from-primary/20 to-transparent pointer-events-none" />
        )}
      </div>
    </div>
  );
};

export default ModuleCarousel;
