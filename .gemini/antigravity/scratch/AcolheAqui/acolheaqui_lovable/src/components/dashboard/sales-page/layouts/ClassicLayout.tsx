import { useNavigate } from "react-router-dom";
import { 
  Play, 
  BookOpen, 
  Award, 
  Check, 
  Shield,
  Sparkles,
  Users,
  ChevronDown,
  ChevronUp,
  Star,
  Clock,
  Infinity,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useState } from "react";
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

const ClassicLayout = ({ service, profile, modules, config, themeColors }: LayoutProps) => {
  const navigate = useNavigate();
  const [expandedModules, setExpandedModules] = useState<Set<string>>(new Set());
  const { primaryColor, accentColor, textPrimary, textSecondary, textMuted, isLightTheme } = themeColors;

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

  const toggleModule = (moduleId: string) => {
    setExpandedModules(prev => {
      const next = new Set(prev);
      if (next.has(moduleId)) {
        next.delete(moduleId);
      } else {
        next.add(moduleId);
      }
      return next;
    });
  };

  const totalLessons = modules.reduce((acc, m) => acc + m.lessons_count, 0);
  const heroImageUrl = config.images?.heroImage || config.images?.videoThumbnail || (service.product_config?.image_url as string) || null;

  const cardBg = isLightTheme ? 'bg-white' : 'bg-white/5';
  const cardBorder = isLightTheme ? 'border-gray-200' : 'border-white/10';

  return (
    <div className="font-sans">
      {/* Hero Section */}
      <section className="relative py-16 lg:py-24 overflow-hidden">
        <div 
          className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full opacity-20 blur-[100px]"
          style={{ backgroundColor: primaryColor }}
        />

        <div className="container mx-auto px-4 relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            <div className="space-y-6">
              <Badge 
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-full"
                style={{ backgroundColor: `${primaryColor}20`, color: primaryColor }}
              >
                <Sparkles className="w-4 h-4" />
                {config.hero.badge}
              </Badge>

              <h1 className={`text-4xl lg:text-5xl font-bold leading-tight ${textPrimary}`}>
                {config.hero.title || service.name}
              </h1>

              {(config.hero.subtitle || service.description) && (
                <p className={`text-lg leading-relaxed ${textSecondary}`}>
                  {config.hero.subtitle || service.description}
                </p>
              )}

              <div className="flex flex-wrap gap-4 py-2">
                {[
                  { icon: BookOpen, label: `${totalLessons} Aulas` },
                  { icon: Users, label: `${modules.length} Módulos` },
                  { icon: Award, label: 'Certificado' },
                  { icon: Infinity, label: 'Vitalício' },
                ].map((item, i) => (
                  <div key={i} className={`flex items-center gap-2 ${textSecondary}`}>
                    <item.icon className="w-4 h-4" style={{ color: primaryColor }} />
                    <span className="text-sm font-medium">{item.label}</span>
                  </div>
                ))}
              </div>

              <div className="hidden lg:flex flex-col gap-3 pt-2">
                <Button
                  size="lg"
                  onClick={handleCheckout}
                  className="w-fit text-base font-semibold px-8 py-6 rounded-xl text-white"
                  style={{ backgroundColor: primaryColor }}
                >
                  {config.hero.ctaText}
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
                <div className={`flex items-center gap-4 text-sm ${textMuted}`}>
                  <div className="flex items-center gap-1">
                    <Shield className="w-4 h-4 text-green-500" />
                    <span>Pagamento seguro</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    <span>Acesso imediato</span>
                  </div>
                </div>
              </div>
            </div>

            {config.hero.showVideo && (
              <div className="relative">
                <div 
                  className={`aspect-video rounded-2xl overflow-hidden ${cardBorder} border shadow-xl`}
                  style={{ backgroundColor: isLightTheme ? '#f5f5f5' : 'rgba(255,255,255,0.05)' }}
                >
                  {heroImageUrl ? (
                    <img src={heroImageUrl} alt={service.name} className="w-full h-full object-cover" />
                  ) : (
                    <div 
                      className="w-full h-full flex items-center justify-center"
                      style={{ background: `linear-gradient(135deg, ${primaryColor}20, ${accentColor}10)` }}
                    >
                      <Play className="w-16 h-16 opacity-30" style={{ color: primaryColor }} />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black/20 flex items-center justify-center group cursor-pointer hover:bg-black/30 transition-colors">
                    <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                      <Play className="w-6 h-6 text-gray-800 ml-1" fill="currentColor" />
                    </div>
                  </div>
                </div>

                <div 
                  className={`absolute -bottom-4 -left-4 ${cardBg} ${cardBorder} border rounded-xl p-4 shadow-lg hidden md:flex items-center gap-3`}
                >
                  <div 
                    className="w-10 h-10 rounded-lg flex items-center justify-center"
                    style={{ backgroundColor: `${primaryColor}15` }}
                  >
                    <Check className="w-5 h-5" style={{ color: primaryColor }} />
                  </div>
                  <div>
                    <p className={`font-semibold ${textPrimary}`}>{modules.length} Módulos</p>
                    <p className={`text-xs ${textMuted}`}>Conteúdo completo</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Benefits */}
      {config.benefits.enabled && (
        <section className="py-16" style={{ backgroundColor: `${primaryColor}06` }}>
          <div className="container mx-auto px-4">
            <h2 className={`text-2xl font-bold text-center mb-10 ${textPrimary}`}>
              {config.benefits.title}
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 max-w-5xl mx-auto">
              {config.benefits.items.map((item, i) => (
                <div 
                  key={i} 
                  className={`flex items-start gap-3 p-5 rounded-xl ${cardBg} ${cardBorder} border`}
                >
                  <div 
                    className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                    style={{ backgroundColor: `${primaryColor}12` }}
                  >
                    <Check className="w-4 h-4" style={{ color: primaryColor }} />
                  </div>
                  <span className={`text-sm font-medium ${textPrimary}`}>{item}</span>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Course Content */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-3 gap-10">
            <div className="lg:col-span-2">
              <h2 className={`text-2xl font-bold mb-2 ${textPrimary}`}>{config.content.sectionTitle}</h2>
              <p className={`mb-6 ${textMuted}`}>{config.content.sectionSubtitle}</p>

              <div className="space-y-3">
                {modules.map((module, index) => (
                  <div
                    key={module.id}
                    className={`${cardBg} ${cardBorder} border rounded-xl overflow-hidden`}
                  >
                    <button
                      onClick={() => toggleModule(module.id)}
                      className="w-full flex items-center justify-between p-4"
                    >
                      <div className="flex items-center gap-4">
                        <div 
                          className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-semibold"
                          style={{ backgroundColor: primaryColor }}
                        >
                          {index + 1}
                        </div>
                        <div className="text-left">
                          <h3 className={`font-semibold ${textPrimary}`}>{module.title}</h3>
                          <p className={`text-sm ${textMuted}`}>{module.lessons_count} aulas</p>
                        </div>
                      </div>
                      {expandedModules.has(module.id) ? (
                        <ChevronUp className={`w-5 h-5 ${textMuted}`} />
                      ) : (
                        <ChevronDown className={`w-5 h-5 ${textMuted}`} />
                      )}
                    </button>
                    {expandedModules.has(module.id) && module.description && (
                      <div className={`px-4 pb-4 border-t ${cardBorder}`}>
                        <p className={`pt-3 text-sm ${textSecondary}`}>{module.description}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="lg:col-span-1">
              <div className={`sticky top-6 ${cardBg} ${cardBorder} border-2 rounded-2xl overflow-hidden shadow-lg`}>
                <div className="p-6 text-center" style={{ backgroundColor: `${primaryColor}08` }}>
                  <p className={`text-sm ${textMuted} mb-1`}>Investimento</p>
                  <p className={`text-4xl font-bold ${textPrimary}`}>{formatPrice(service.price_cents)}</p>
                </div>
                <div className="p-5 space-y-4">
                  <Button
                    onClick={handleCheckout}
                    className="w-full py-5 text-base font-semibold text-white rounded-xl"
                    style={{ backgroundColor: primaryColor }}
                  >
                    {config.cta.buttonText}
                  </Button>
                  
                  {config.cta.urgencyText && (
                    <p className="text-center text-sm font-medium" style={{ color: accentColor }}>
                      ⚡ {config.cta.urgencyText}
                    </p>
                  )}

                  <div className={`pt-4 border-t ${cardBorder} space-y-2`}>
                    {[
                      { icon: BookOpen, text: `${totalLessons} aulas em vídeo` },
                      { icon: Award, text: 'Certificado de conclusão' },
                      { icon: Infinity, text: 'Acesso vitalício' },
                    ].map((item, i) => (
                      <div key={i} className={`flex items-center gap-2 text-sm ${textSecondary}`}>
                        <item.icon className="w-4 h-4" style={{ color: primaryColor }} />
                        <span>{item.text}</span>
                      </div>
                    ))}
                  </div>

                  {config.guarantee.enabled && (
                    <div 
                      className={`p-4 rounded-xl ${cardBorder} border`}
                      style={{ backgroundColor: 'rgba(34, 197, 94, 0.06)' }}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <Shield className="w-4 h-4 text-green-500" />
                        <span className={`text-sm font-semibold ${textPrimary}`}>{config.guarantee.title}</span>
                      </div>
                      <p className={`text-xs ${textMuted}`}>{config.guarantee.description}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Instructor */}
      {config.instructor.showSection && profile && (
        <section className="py-16" style={{ backgroundColor: `${primaryColor}06` }}>
          <div className="container mx-auto px-4">
            <h2 className={`text-2xl font-bold text-center mb-10 ${textPrimary}`}>
              {config.instructor.title}
            </h2>
            <div className={`max-w-xl mx-auto ${cardBg} ${cardBorder} border rounded-2xl p-6 shadow-md`}>
              <div className="flex flex-col sm:flex-row items-center gap-5">
                <Avatar className="w-20 h-20 border-4" style={{ borderColor: primaryColor }}>
                  <AvatarImage src={profile.avatar_url || undefined} />
                  <AvatarFallback 
                    className="text-xl font-bold"
                    style={{ backgroundColor: `${primaryColor}15`, color: primaryColor }}
                  >
                    {getInitials(profile.full_name)}
                  </AvatarFallback>
                </Avatar>
                <div className="text-center sm:text-left flex-1">
                  <h3 className={`text-lg font-bold ${textPrimary}`}>{profile.full_name}</h3>
                  {profile.specialty && <p className={`${textMuted}`}>{profile.specialty}</p>}
                  <div className="flex items-center gap-1 mt-2 justify-center sm:justify-start">
                    {[1,2,3,4,5].map(i => (
                      <Star key={i} className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                    ))}
                  </div>
                </div>
              </div>
              {profile.bio && (
                <p className={`mt-4 text-sm leading-relaxed ${textSecondary}`}>{profile.bio}</p>
              )}
            </div>
          </div>
        </section>
      )}

      {/* Mobile CTA */}
      <div 
        className={`lg:hidden fixed bottom-0 left-0 right-0 p-4 border-t backdrop-blur-xl ${cardBorder}`}
        style={{ backgroundColor: isLightTheme ? 'rgba(255,255,255,0.95)' : 'rgba(0,0,0,0.9)' }}
      >
        <Button
          onClick={handleCheckout}
          className="w-full py-5 text-base font-semibold text-white rounded-xl"
          style={{ backgroundColor: primaryColor }}
        >
          {config.cta.buttonText} • {formatPrice(service.price_cents)}
        </Button>
      </div>

      <div className="h-20 lg:hidden" />
    </div>
  );
};

export default ClassicLayout;
