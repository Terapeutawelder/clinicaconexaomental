import { ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import therapyVideo from "@/assets/therapy-video-light.mp4";

const VideoSection = () => {
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.2 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <section 
      ref={sectionRef}
      className="relative min-h-[50vh] md:min-h-[70vh] flex items-end justify-center overflow-hidden pb-6 md:pb-12"
    >
      {/* Video Background */}
      <video
        autoPlay
        loop
        muted
        playsInline
        className="absolute inset-0 w-full h-full object-cover"
      >
        <source 
          src={therapyVideo} 
          type="video/mp4" 
        />
      </video>
      
      {/* Dark Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
      
      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 text-center max-w-4xl">
        <h2 
          className={`text-2xl sm:text-3xl md:text-5xl lg:text-6xl font-bold text-white mb-4 md:mb-6 leading-tight transition-all duration-700 drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)] ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          }`}
        >
          Encontre psicoterapeutas online no <span className="text-primary drop-shadow-[0_2px_4px_rgba(0,0,0,0.3)]">Mindset</span>
        </h2>
        
        <p 
          className={`text-white text-sm sm:text-base md:text-xl lg:text-2xl mb-6 md:mb-8 max-w-2xl mx-auto leading-relaxed transition-all duration-700 delay-150 drop-shadow-[0_1px_3px_rgba(0,0,0,0.5)] ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          }`}
        >
          Encontre perfis de Psicólogos, Psicanalistas e Terapeutas com registro profissional ativo e com diferentes abordagens terapêuticas para você escolher com segurança.
        </p>
        
        <div 
          className={`transition-all duration-700 delay-300 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          }`}
        >
          <Link to="/psicoterapeutas">
            <Button 
              size="lg" 
              className="bg-primary hover:bg-primary/90 text-white px-6 md:px-8 py-4 md:py-6 text-base md:text-lg rounded-full group"
            >
              Encontrar psicoterapeutas
              <ChevronRight size={20} className="ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default VideoSection;
