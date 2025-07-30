
import { Button } from "@/components/ui/button";
import { Play } from "lucide-react";

interface HeroSectionProps {
  onFindProfessionalClick: () => void;
  onComoFuncionaClick: () => void;
  onIniciarTeleconsultaClick?: () => void;
}

const HeroSection = ({ onFindProfessionalClick, onComoFuncionaClick, onIniciarTeleconsultaClick }: HeroSectionProps) => {
  return (
    <section className="purple-bg py-12 md:py-20 overflow-hidden text-white">
      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center max-w-4xl mx-auto">
          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-6xl font-bold mb-4 md:mb-6 text-white">
            Cuidando da sua saúde mental com carinho e profissionalismo
          </h1>
          <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-purple-100 mb-6 md:mb-8">
            Conectamos você aos melhores profissionais de saúde mental, oferecendo apoio personalizado e acessível quando você mais precisa.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 md:gap-4 justify-center">
            <Button 
              size="lg" 
              className="text-sm sm:text-base lg:text-lg px-6 sm:px-8 py-4 sm:py-6 bg-purple-600 border-2 border-white text-white hover:bg-white hover:text-purple-600 transition-colors" 
              onClick={onFindProfessionalClick}
            >
              Encontrar Profissional
            </Button>
            <Button 
              size="lg" 
              className="text-sm sm:text-base lg:text-lg px-6 sm:px-8 py-4 sm:py-6 bg-purple-600 border-2 border-white text-white hover:bg-white hover:text-purple-600 transition-colors" 
              onClick={onComoFuncionaClick}
            >
              <Play className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
              Como Funciona
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
