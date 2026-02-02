import { Brain, Heart, Users, Sparkles, Shield, Lightbulb, Flower2, Baby, GraduationCap, Briefcase, HeartHandshake, Puzzle, MessageCircle, Target, Smile, Leaf, Star } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { LandingPageConfig } from "../LandingPagePreview";

interface ServicesSectionProps {
  config: LandingPageConfig;
  profile?: {
    specialties?: string[];
    approaches?: string[];
  };
}

// Map specialty names to icons
const getSpecialtyIcon = (specialty: string) => {
  const lowerSpecialty = specialty.toLowerCase();
  
  if (lowerSpecialty.includes("ansiedade")) return Heart;
  if (lowerSpecialty.includes("depressão") || lowerSpecialty.includes("depressao")) return Flower2;
  if (lowerSpecialty.includes("casal") || lowerSpecialty.includes("relacionamento")) return Users;
  if (lowerSpecialty.includes("família") || lowerSpecialty.includes("familia")) return HeartHandshake;
  if (lowerSpecialty.includes("criança") || lowerSpecialty.includes("crianca") || lowerSpecialty.includes("infantil")) return Baby;
  if (lowerSpecialty.includes("adolescente")) return GraduationCap;
  if (lowerSpecialty.includes("trauma") || lowerSpecialty.includes("luto")) return Shield;
  if (lowerSpecialty.includes("autoconhecimento") || lowerSpecialty.includes("desenvolvimento")) return Lightbulb;
  if (lowerSpecialty.includes("carreira") || lowerSpecialty.includes("trabalho") || lowerSpecialty.includes("burnout")) return Briefcase;
  if (lowerSpecialty.includes("autismo") || lowerSpecialty.includes("tea") || lowerSpecialty.includes("tdah")) return Puzzle;
  if (lowerSpecialty.includes("comunicação") || lowerSpecialty.includes("comunicacao")) return MessageCircle;
  if (lowerSpecialty.includes("fobia") || lowerSpecialty.includes("pânico") || lowerSpecialty.includes("panico")) return Target;
  if (lowerSpecialty.includes("autoestima") || lowerSpecialty.includes("emocional")) return Smile;
  if (lowerSpecialty.includes("estresse") || lowerSpecialty.includes("mindfulness")) return Leaf;
  
  return Brain; // Default icon
};

const ServicesSection = ({ config, profile }: ServicesSectionProps) => {
  const specialties = profile?.specialties || [];
  
  // If no specialties, show a placeholder message
  if (specialties.length === 0) {
    return (
      <section 
        id="servicos" 
        className="py-20"
        style={{ backgroundColor: `hsl(${config.colors.background} / 0.5)` }}
      >
        <div className="container mx-auto px-4">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span 
              className="inline-block px-4 py-1.5 font-semibold text-sm rounded-full mb-4"
              style={{ 
                backgroundColor: `hsl(${config.colors.secondary})`,
                color: `hsl(${config.colors.primary})`,
                borderWidth: '1px',
                borderColor: `hsl(${config.colors.primary} / 0.2)`
              }}
            >
              Nossos Serviços
            </span>
            <h2 className="font-serif text-3xl md:text-4xl lg:text-5xl mb-4 text-charcoal">
              {config.services.title}
            </h2>
            <p className="text-slate text-lg font-medium">{config.services.subtitle}</p>
          </div>
          
          <div className="max-w-2xl mx-auto text-center py-12 bg-white/50 rounded-2xl border border-dashed border-slate/30">
            <Brain className="w-12 h-12 mx-auto text-slate/40 mb-4" />
            <p className="text-slate">
              Adicione suas especialidades em <strong>Dados do Perfil</strong> para exibi-las aqui.
            </p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section 
      id="servicos" 
      className="py-20"
      style={{ backgroundColor: `hsl(${config.colors.background} / 0.5)` }}
    >
      <div className="container mx-auto px-4">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span 
            className="inline-block px-4 py-1.5 font-semibold text-sm rounded-full mb-4"
            style={{ 
              backgroundColor: `hsl(${config.colors.secondary})`,
              color: `hsl(${config.colors.primary})`,
              borderWidth: '1px',
              borderColor: `hsl(${config.colors.primary} / 0.2)`
            }}
          >
            Áreas de Atendimento
          </span>
          <h2 className="font-serif text-3xl md:text-4xl lg:text-5xl mb-4 text-charcoal">
            {config.services.title}
          </h2>
          <p className="text-slate text-lg font-medium">{config.services.subtitle}</p>
        </div>

        <div className={`grid gap-4 max-w-6xl mx-auto ${
          specialties.length <= 3 
            ? 'md:grid-cols-3' 
            : specialties.length === 4 
              ? 'md:grid-cols-2 lg:grid-cols-4' 
              : 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5'
        }`}>
          {specialties.map((specialty, index) => {
            const IconComponent = getSpecialtyIcon(specialty);
            
            return (
              <Card 
                key={index} 
                className="group bg-white rounded-2xl border border-slate/10 shadow-sm hover:shadow-xl transition-all duration-500 hover:-translate-y-2 opacity-0 animate-fade-in-up overflow-hidden"
                style={{ animationDelay: `${index * 0.08}s` }}
              >
                <CardContent className="p-6 text-center">
                  <div 
                    className="inline-flex items-center justify-center w-14 h-14 rounded-full mb-4 group-hover:scale-110 transition-all duration-500"
                    style={{ 
                      backgroundColor: `hsl(${config.colors.secondary})`,
                    }}
                  >
                    <IconComponent 
                      className="w-6 h-6 transition-colors duration-500" 
                      style={{ color: `hsl(${config.colors.primary})` }}
                    />
                  </div>
                  <h3 
                    className="font-serif text-base mb-1 text-charcoal transition-colors duration-300"
                    style={{ '--hover-color': `hsl(${config.colors.primary})` } as React.CSSProperties}
                  >
                    {specialty}
                  </h3>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default ServicesSection;
