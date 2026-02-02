import { Clock, Star, GraduationCap, Award } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { LandingPageConfig } from "../LandingPagePreview";
import { formatProfessionalName } from "@/lib/formatProfessionalName";

interface AboutSectionProps {
  config: LandingPageConfig;
  profile: any;
  averageRating: number;
}

const AboutSection = ({ config, profile, averageRating }: AboutSectionProps) => {
  return (
    <section 
      id="sobre" 
      className="py-20 relative overflow-hidden"
      style={{ backgroundColor: `hsl(${config.colors.background})` }}
    >
      <div 
        className="absolute top-0 right-0 w-1/2 h-full opacity-40" 
        style={{ background: `linear-gradient(to left, hsl(${config.colors.secondary} / 0.4), transparent)` }}
      />
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="grid lg:grid-cols-2 gap-16 items-center max-w-6xl mx-auto">
          {/* Image */}
          <div className="relative">
            <div 
              className="aspect-[4/5] rounded-3xl overflow-hidden shadow-2xl"
              style={{ background: `linear-gradient(to bottom right, hsl(${config.colors.secondary}), hsl(${config.colors.background}))` }}
            >
              {config.images.aboutPhoto || profile?.avatar_url ? (
                <img 
                  src={config.images.aboutPhoto || profile.avatar_url} 
                  alt={profile?.full_name || "Profissional"}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <span 
                    className="text-8xl font-bold"
                    style={{ color: `hsl(${config.colors.primary})` }}
                  >
                    {profile?.full_name?.charAt(0) || "P"}
                  </span>
                </div>
              )}
              <div 
                className="absolute inset-0" 
                style={{ background: `linear-gradient(to top, hsl(${config.colors.primary} / 0.2), transparent)` }}
              />
            </div>
            
            {/* Floating card - Experience */}
            <div 
              className="absolute -bottom-6 -right-6 bg-white p-5 rounded-2xl shadow-2xl"
              style={{ borderColor: `hsl(${config.colors.secondary})`, borderWidth: '1px' }}
            >
              <div className="flex items-center gap-3 mb-2">
                <div 
                  className="w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{ background: `linear-gradient(to bottom right, hsl(${config.colors.accent}), hsl(${config.colors.accent} / 0.7))` }}
                >
                  <Clock className="w-5 h-5 text-white" />
                </div>
                <span className="font-serif text-3xl text-charcoal">10+</span>
              </div>
              <p className="text-sm font-medium text-slate">Anos de experiência</p>
            </div>
            
            {/* Rating badge */}
            <div 
              className="absolute -top-4 -left-4 bg-white px-4 py-2 rounded-full shadow-xl flex items-center gap-2"
              style={{ borderColor: `hsl(${config.colors.secondary})`, borderWidth: '1px' }}
            >
              <div className="flex">
                {[...Array(5)].map((_, i) => (
                  <Star 
                    key={i} 
                    className="w-4 h-4" 
                    style={{ fill: `hsl(${config.colors.accent})`, color: `hsl(${config.colors.accent})` }}
                  />
                ))}
              </div>
              <span className="text-sm font-bold text-charcoal">{averageRating.toFixed(1)}</span>
            </div>
          </div>

          {/* Content */}
          <div>
            <Badge 
              className="px-4 py-1.5 text-sm font-semibold mb-6"
              style={{ 
                backgroundColor: `hsl(${config.colors.secondary})`,
                color: `hsl(${config.colors.primary})`,
                borderColor: `hsl(${config.colors.primary} / 0.2)`,
                borderWidth: '1px'
              }}
            >
              {config.about.title}
            </Badge>
            
            <h2 className="font-serif text-3xl md:text-4xl text-charcoal mb-6">
              {profile ? formatProfessionalName(profile.full_name, profile.gender) : "Nome do Profissional"}
            </h2>
            
            <p className="text-slate leading-relaxed mb-8 font-medium">
              {profile?.bio || "Sou psicólogo(a) clínico(a) com especialização em Terapia Cognitivo-Comportamental e Psicoterapia Humanista. Minha abordagem é integrativa, combinando diferentes técnicas para atender às necessidades únicas de cada pessoa."}
            </p>

            <div className="space-y-4">
              <div 
                className="flex items-center gap-4 p-4 rounded-2xl transition-all duration-300 hover:shadow-md"
                style={{ 
                  backgroundColor: `hsl(${config.colors.secondary} / 0.5)`,
                  borderColor: `hsl(${config.colors.primary} / 0.1)`,
                  borderWidth: '1px'
                }}
              >
                <div 
                  className="w-12 h-12 rounded-xl flex items-center justify-center shadow-lg"
                  style={{ background: `linear-gradient(to bottom right, hsl(${config.colors.primary}), hsl(${config.colors.primary} / 0.8))` }}
                >
                  <GraduationCap className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h4 className="font-semibold text-charcoal">Formação Acadêmica</h4>
                  <p className="text-sm text-slate font-medium">{profile?.specialty || "Especialização em Psicologia"}</p>
                </div>
              </div>
              
              <div 
                className="flex items-center gap-4 p-4 rounded-2xl transition-all duration-300 hover:shadow-md"
                style={{ 
                  backgroundColor: `hsl(${config.colors.accent} / 0.1)`,
                  borderColor: `hsl(${config.colors.accent} / 0.2)`,
                  borderWidth: '1px'
                }}
              >
                <div 
                  className="w-12 h-12 rounded-xl flex items-center justify-center shadow-lg flex-shrink-0"
                  style={{ background: `linear-gradient(to bottom right, hsl(${config.colors.accent}), hsl(${config.colors.accent} / 0.7))` }}
                >
                  <Award className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h4 className="font-semibold text-charcoal">Registro Profissional</h4>
                  <p className="text-sm text-slate font-medium">{profile?.crp || "CRP 00/00000"}</p>
                </div>
              </div>

              {/* Therapeutic Approaches */}
              {profile?.approaches && profile.approaches.length > 0 && (
                <div className="pt-4">
                  <h4 className="font-semibold text-charcoal mb-3">Abordagens Terapêuticas</h4>
                  <div className="flex flex-wrap gap-2">
                    {profile.approaches.map((approach: string, index: number) => (
                      <Badge 
                        key={index}
                        className="px-3 py-1.5 text-sm font-medium bg-gold-light text-charcoal border-0"
                      >
                        {approach}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;
