import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ChevronRight, Video, Heart } from "lucide-react";
import heroClient from "@/assets/hero-client.png";

const TherapyOnlineSection = () => {
  return (
    <section className="py-12 sm:py-16 md:py-24 bg-background overflow-hidden">
      <div className="container mx-auto px-4">
        <div className="flex flex-col lg:flex-row items-center gap-8 lg:gap-16">
          {/* Image Side */}
          <div className="relative w-full lg:w-1/2 flex justify-center">
            {/* Decorative elements */}
            <div className="absolute top-4 right-1/4 w-3 h-3 sm:w-4 sm:h-4 rounded-full bg-primary/40 animate-pulse" />
            <div className="absolute bottom-8 left-8 w-2 h-2 sm:w-3 sm:h-3 rounded-full bg-accent/60" />
            <div className="absolute top-1/4 left-4 w-6 h-6 sm:w-8 sm:h-8">
              <svg viewBox="0 0 32 32" className="text-foreground/20">
                <path
                  d="M8 12c2-4 6-4 8 0s6 4 8 0"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
            </div>

            {/* Main image container */}
            <div className="relative">
              {/* Background shape */}
              <div className="absolute inset-0 -inset-x-4 -inset-y-4 bg-gradient-to-br from-primary/10 to-accent/10 rounded-3xl transform rotate-3" />
              <div className="absolute inset-0 -inset-x-2 -inset-y-2 bg-gradient-to-tl from-accent/20 to-primary/5 rounded-3xl transform -rotate-2" />
              
              {/* Image */}
              <div className="relative z-10 rounded-2xl overflow-hidden bg-gradient-to-br from-accent/20 to-primary/10 p-2">
                <img
                  src={heroClient}
                  alt="Terapia Online"
                  className="w-full max-w-sm sm:max-w-md rounded-xl object-cover"
                />
              </div>

              {/* Floating badge */}
              <div className="absolute -right-2 sm:-right-4 top-1/3 z-20 bg-primary rounded-xl sm:rounded-2xl p-2 sm:p-3 shadow-lg animate-bounce">
                <Heart size={20} className="sm:w-6 sm:h-6 text-primary-foreground fill-primary-foreground" />
              </div>
            </div>
          </div>

          {/* Text Side */}
          <div className="w-full lg:w-1/2 text-center lg:text-left">
            {/* Tag */}
            <div className="inline-flex items-center gap-2 bg-primary/10 rounded-full px-3 sm:px-4 py-1.5 sm:py-2 mb-4 sm:mb-6">
              <Video size={16} className="sm:w-[18px] sm:h-[18px] text-primary" />
              <span className="text-xs sm:text-sm font-medium text-foreground">Terapia online</span>
            </div>

            {/* Title */}
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4 sm:mb-6 leading-tight">
              Você merece se sentir{" "}
              <span className="text-primary">bem consigo mesmo</span>
            </h2>

            {/* Description */}
            <p className="text-sm sm:text-base md:text-lg text-muted-foreground mb-6 sm:mb-8 max-w-lg mx-auto lg:mx-0">
              Você pode falar com o psicoterapeuta e combinar o tipo de atendimento que fizer sentido para você.
            </p>

            {/* CTA Button */}
            <Link to="/psicoterapeutas">
              <Button 
                size="lg" 
                className="bg-primary hover:bg-primary/90 text-primary-foreground px-6 sm:px-8 py-4 sm:py-6 text-sm sm:text-base rounded-full group"
              >
                Ver psicoterapeutas
                <ChevronRight size={18} className="ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TherapyOnlineSection;
