import { ChevronRight, Star, Users, Video } from "lucide-react";
import { Button } from "@/components/ui/button";
import membersAreaMockup from "@/assets/members-area-mockup-acolheaqui-v3.png";

const FeaturesShowcaseSection = () => {
  const handleScrollToPricing = () => {
    const el = document.querySelector("#precos");
    el?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <section className="py-20 bg-[hsl(215_35%_14%)]">
      <div className="container mx-auto px-4">
        <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-16">
          {/* Left Content */}
          <div className="flex-1 text-center lg:text-left">
            <div className="flex items-center gap-3 mb-4 justify-center lg:justify-start">
              <h2 className="text-3xl md:text-4xl font-extrabold text-[hsl(0_0%_100%)]">
                Área de Membros Premium
              </h2>
              <span className="text-xl md:text-2xl text-[hsl(0_0%_100%/0.55)] font-light hidden sm:inline">
                A melhor experiência para o seu cliente.
              </span>
            </div>

            {/* Feature badges */}
            <div className="flex flex-wrap gap-6 mb-8 justify-center lg:justify-start">
              <div className="flex items-center gap-2 text-[hsl(0_0%_100%/0.75)]">
                <Video size={18} className="text-primary" />
                <span className="font-medium">Estilo Netflix</span>
              </div>
              <div className="flex items-center gap-2 text-[hsl(0_0%_100%/0.75)]">
                <Users size={18} className="text-[hsl(38_92%_50%)]" />
                <span className="font-medium">Sem custos</span>
              </div>
              <div className="flex items-center gap-2 text-[hsl(0_0%_100%/0.75)]">
                <Star size={18} className="text-primary" />
                <span className="font-medium">Personalizável</span>
              </div>
            </div>

            {/* Description */}
            <p className="text-lg text-[hsl(0_0%_100%/0.75)] mb-4 max-w-lg mx-auto lg:mx-0">
              Uma área de membros personalizada e sem custos para você armazenar e gerenciar seus conteúdos com facilidade.
            </p>
            <p className="text-lg text-[hsl(0_0%_100%/0.6)] mb-8 max-w-lg mx-auto lg:mx-0">
              A personalização aumenta a conversão, evitando vendas abandonadas e garantindo uma jornada de vendas maior.
            </p>

            {/* CTA Button */}
            <Button
              size="lg"
              onClick={handleScrollToPricing}
              className="h-14 px-8 text-lg font-bold rounded-full shadow-lg hover:shadow-xl transition-all duration-300"
            >
              Começar Agora
              <ChevronRight className="ml-2" size={20} />
            </Button>
          </div>

          {/* Right Image - Full width mockup */}
          <div className="flex-[1.5]">
            <div className="overflow-hidden">
              <img
                src={membersAreaMockup}
                alt="Área de Membros AcolheAqui"
                loading="lazy"
                className="block w-full max-w-none transform-gpu scale-[1.04]"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FeaturesShowcaseSection;
