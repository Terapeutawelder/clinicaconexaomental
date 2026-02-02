import { useNavigate } from "react-router-dom";
import { 
  Check, 
  Shield,
  BookOpen,
  ChevronDown,
  ChevronUp,
  Star,
  ArrowRight,
  Play,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
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

const SplitLayout = ({ service, profile, modules, config, themeColors }: LayoutProps) => {
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
    <div className="min-h-screen flex flex-col lg:flex-row">
      {/* Left Side - Fixed Image */}
      <div className="lg:fixed lg:left-0 lg:top-0 lg:bottom-0 lg:w-1/2 h-[50vh] lg:h-auto relative">
        {heroImageUrl ? (
          <>
            <img src={heroImageUrl} alt={service.name} className="w-full h-full object-cover" />
            <div 
              className="absolute inset-0"
              style={{ background: `linear-gradient(to right, ${primaryColor}15, transparent)` }}
            />
            <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity cursor-pointer">
              <div className="w-20 h-20 rounded-full bg-white flex items-center justify-center shadow-lg">
                <Play className="w-8 h-8 text-gray-800 ml-1" fill="currentColor" />
              </div>
            </div>
          </>
        ) : (
          <div 
            className="w-full h-full flex items-center justify-center"
            style={{ background: `linear-gradient(135deg, ${primaryColor}20, ${accentColor}10)` }}
          >
            <BookOpen className="w-32 h-32 opacity-20" style={{ color: primaryColor }} />
          </div>
        )}

        {/* Floating Stats */}
        <div className="absolute bottom-6 left-6 right-6 hidden lg:flex gap-3">
          {[
            { value: `${totalLessons}+`, label: 'Aulas' },
            { value: `${modules.length}`, label: 'Módulos' },
          ].map((stat, i) => (
            <div 
              key={i}
              className="px-5 py-3 rounded-xl backdrop-blur-xl"
              style={{ backgroundColor: 'rgba(255,255,255,0.15)' }}
            >
              <p className="text-xl font-bold text-white">{stat.value}</p>
              <p className="text-sm text-white/80">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Right Side - Scrollable Content */}
      <div className="lg:ml-[50%] lg:w-1/2 min-h-screen">
        <div className="p-6 md:p-10 lg:p-12 space-y-10">
          {/* Header */}
          <div className="space-y-6">
            <Badge 
              className="px-4 py-2 font-medium"
              style={{ backgroundColor: `${primaryColor}15`, color: primaryColor }}
            >
              {config.hero.badge}
            </Badge>

            <h1 className={`text-3xl md:text-4xl font-bold leading-tight ${textPrimary}`}>
              {config.hero.title || service.name}
            </h1>

            {(config.hero.subtitle || service.description) && (
              <p className={`text-lg leading-relaxed ${textSecondary}`}>
                {config.hero.subtitle || service.description}
              </p>
            )}

            <div 
              className={`inline-flex items-baseline gap-2 px-5 py-3 rounded-xl ${cardBorder} border`}
              style={{ backgroundColor: `${primaryColor}06` }}
            >
              <span className={`text-3xl font-bold ${textPrimary}`}>{formatPrice(service.price_cents)}</span>
              <span className={`text-sm ${textMuted}`}>/ acesso vitalício</span>
            </div>

            <Button
              size="lg"
              onClick={handleCheckout}
              className="w-full font-semibold text-base py-6 text-white rounded-xl"
              style={{ backgroundColor: primaryColor }}
            >
              {config.hero.ctaText}
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>

            <div className={`flex items-center gap-4 text-sm ${textMuted}`}>
              <div className="flex items-center gap-1">
                <Shield className="w-4 h-4 text-green-500" />
                <span>Compra segura</span>
              </div>
              {config.guarantee.enabled && (
                <div className="flex items-center gap-1">
                  <Check className="w-4 h-4" style={{ color: primaryColor }} />
                  <span>{config.guarantee.days} dias de garantia</span>
                </div>
              )}
            </div>
          </div>

          <div className={`border-t ${cardBorder}`} />

          {/* Benefits */}
          {config.benefits.enabled && (
            <>
              <div>
                <h2 className={`text-lg font-bold mb-4 ${textPrimary}`}>{config.benefits.title}</h2>
                <ul className="space-y-3">
                  {config.benefits.items.map((item, i) => (
                    <li key={i} className={`flex items-center gap-3 p-3 rounded-lg ${cardBg} ${cardBorder} border`}>
                      <div 
                        className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                        style={{ backgroundColor: `${primaryColor}12` }}
                      >
                        <Check className="w-4 h-4" style={{ color: primaryColor }} />
                      </div>
                      <span className={`font-medium ${textPrimary}`}>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className={`border-t ${cardBorder}`} />
            </>
          )}

          {/* Course Content */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className={`text-lg font-bold ${textPrimary}`}>{config.content.sectionTitle}</h2>
              <span className={`text-sm px-3 py-1 rounded-full ${textMuted}`} style={{ backgroundColor: `${primaryColor}08` }}>
                {modules.length} módulos
              </span>
            </div>

            <div className="space-y-2">
              {modules.map((module, index) => (
                <div
                  key={module.id}
                  className={`${cardBg} ${cardBorder} border rounded-xl overflow-hidden`}
                >
                  <button
                    onClick={() => toggleModule(module.id)}
                    className="w-full flex items-center justify-between p-4"
                  >
                    <div className="flex items-center gap-3">
                      <span 
                        className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold text-white"
                        style={{ backgroundColor: primaryColor }}
                      >
                        {index + 1}
                      </span>
                      <div className="text-left">
                        <p className={`font-medium ${textPrimary}`}>{module.title}</p>
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

          <div className={`border-t ${cardBorder}`} />

          {/* Instructor */}
          {config.instructor.showSection && profile && (
            <>
              <div className={`p-6 rounded-xl ${cardBg} ${cardBorder} border`}>
                <h2 className={`text-lg font-bold mb-4 ${textPrimary}`}>{config.instructor.title}</h2>
                <div className="flex items-start gap-4">
                  <Avatar className="w-16 h-16 shrink-0 border-4" style={{ borderColor: primaryColor }}>
                    <AvatarImage src={profile.avatar_url || undefined} />
                    <AvatarFallback 
                      className="text-lg font-bold"
                      style={{ backgroundColor: `${primaryColor}15`, color: primaryColor }}
                    >
                      {getInitials(profile.full_name)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <p className={`font-bold text-lg ${textPrimary}`}>{profile.full_name}</p>
                    {profile.specialty && <p className={`text-sm ${textMuted}`}>{profile.specialty}</p>}
                    <div className="flex items-center gap-1 mt-1">
                      {[1,2,3,4,5].map(i => (
                        <Star key={i} className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                      ))}
                    </div>
                    {profile.bio && (
                      <p className={`text-sm mt-3 ${textSecondary}`}>{profile.bio}</p>
                    )}
                  </div>
                </div>
              </div>
              <div className={`border-t ${cardBorder}`} />
            </>
          )}

          {/* Guarantee */}
          {config.guarantee.enabled && (
            <div 
              className={`p-6 rounded-xl border-2 border-green-500/20`}
              style={{ backgroundColor: 'rgba(34, 197, 94, 0.05)' }}
            >
              <div className="flex items-center gap-3 mb-2">
                <Shield className="w-5 h-5 text-green-500" />
                <span className={`font-bold ${textPrimary}`}>{config.guarantee.title}</span>
              </div>
              <p className={`text-sm ${textSecondary}`}>{config.guarantee.description}</p>
            </div>
          )}

          {/* Final CTA */}
          <div className="space-y-3">
            <Button
              size="lg"
              onClick={handleCheckout}
              className="w-full font-semibold text-base py-6 text-white rounded-xl"
              style={{ backgroundColor: primaryColor }}
            >
              {config.cta.buttonText} • {formatPrice(service.price_cents)}
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
            {config.cta.urgencyText && (
              <p className={`text-center text-sm font-medium ${textMuted}`}>
                ⚡ {config.cta.urgencyText}
              </p>
            )}
          </div>

          <div className="h-6" />
        </div>
      </div>

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
    </div>
  );
};

export default SplitLayout;
