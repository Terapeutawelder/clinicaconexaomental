import { useNavigate } from "react-router-dom";
import { 
  Play, 
  BookOpen, 
  Award, 
  Check, 
  Shield,
  Sparkles,
  Users,
  Star,
  Infinity,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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

const CenteredLayout = ({ service, profile, modules, config, themeColors }: LayoutProps) => {
  const navigate = useNavigate();
  const { primaryColor, accentColor, textPrimary, textSecondary, textMuted, bgOverlay, isLightTheme } = themeColors;

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

  const totalLessons = modules.reduce((acc, m) => acc + m.lessons_count, 0);
  const heroImageUrl = config.images?.heroImage || config.images?.videoThumbnail || (service.product_config?.image_url as string) || null;
  const cardBg = isLightTheme ? 'bg-white' : 'bg-white/5';
  const cardBorder = isLightTheme ? 'border-gray-200' : 'border-white/10';

  return (
    <div className="font-sans">
      {/* Hero Section - Centered */}
      <section className="relative py-20 lg:py-28 overflow-hidden">
        <div 
          className="absolute inset-0"
          style={{ 
            background: `radial-gradient(circle at 50% 0%, ${primaryColor}30, transparent 50%)` 
          }}
        />

        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl mx-auto text-center space-y-8">
            <Badge 
              className="inline-flex items-center gap-2 px-5 py-2 text-sm font-medium rounded-full"
              style={{ backgroundColor: `${primaryColor}20`, color: primaryColor }}
            >
              <Sparkles className="w-4 h-4" />
              {config.hero.badge}
            </Badge>

            <h1 className={`text-4xl md:text-5xl lg:text-6xl font-bold leading-tight ${textPrimary}`}>
              {config.hero.title || service.name}
            </h1>

            {(config.hero.subtitle || service.description) && (
              <p className={`text-lg md:text-xl leading-relaxed max-w-2xl mx-auto ${textSecondary}`}>
                {config.hero.subtitle || service.description}
              </p>
            )}

            {/* Stats */}
            <div className="flex flex-wrap justify-center gap-6 py-4">
              {[
                { icon: BookOpen, value: totalLessons, label: 'Aulas' },
                { icon: Users, value: modules.length, label: 'Módulos' },
                { icon: Award, value: 'Sim', label: 'Certificado' },
                { icon: Infinity, value: '∞', label: 'Acesso' },
              ].map((stat, i) => (
                <div key={i} className="flex flex-col items-center gap-1">
                  <div 
                    className="w-12 h-12 rounded-xl flex items-center justify-center mb-1"
                    style={{ backgroundColor: `${primaryColor}15` }}
                  >
                    <stat.icon className="w-6 h-6" style={{ color: primaryColor }} />
                  </div>
                  <span className={`font-bold text-lg ${textPrimary}`}>{stat.value}</span>
                  <span className={`text-xs ${textMuted}`}>{stat.label}</span>
                </div>
              ))}
            </div>

            {/* CTA */}
            <div className="flex flex-col items-center gap-4 pt-4">
              <Button
                size="lg"
                onClick={handleCheckout}
                className="text-lg font-semibold px-10 py-6 text-white rounded-xl"
                style={{ backgroundColor: primaryColor }}
              >
                {config.hero.ctaText} por {formatPrice(service.price_cents)}
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>

              <div className={`flex items-center gap-4 text-sm ${textMuted}`}>
                <div className="flex items-center gap-1">
                  <Shield className="w-4 h-4 text-green-500" />
                  <span>Pagamento seguro</span>
                </div>
              </div>
            </div>

            {/* Video Preview */}
            {config.hero.showVideo && heroImageUrl && (
              <div className="pt-8">
                <div className="relative">
                  <div 
                    className={`aspect-video rounded-2xl overflow-hidden ${cardBorder} border shadow-xl max-w-4xl mx-auto`}
                    style={{ backgroundColor: isLightTheme ? '#f5f5f5' : 'rgba(255,255,255,0.05)' }}
                  >
                    <img
                      src={heroImageUrl}
                      alt={service.name}
                      className="w-full h-full object-cover"
                    />
                    <div className={`absolute inset-0 flex items-center justify-center ${bgOverlay} group cursor-pointer hover:bg-black/40 transition-colors`}>
                      <div className="w-20 h-20 rounded-full bg-white flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                        <Play className="w-8 h-8 text-gray-800 ml-1" fill="currentColor" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Benefits */}
      {config.benefits.enabled && (
        <section className="py-20">
          <div className="container mx-auto px-4">
            <h2 className={`text-3xl font-bold text-center mb-12 ${textPrimary}`}>
              {config.benefits.title}
            </h2>
            <div className="grid md:grid-cols-2 gap-4 max-w-3xl mx-auto">
              {config.benefits.items.map((item, i) => (
                <div 
                  key={i} 
                  className={`flex items-center gap-4 p-5 rounded-xl ${cardBg} ${cardBorder} border`}
                >
                  <div 
                    className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
                    style={{ backgroundColor: `${primaryColor}15` }}
                  >
                    <Check className="w-5 h-5" style={{ color: primaryColor }} />
                  </div>
                  <span className={`font-medium ${textPrimary}`}>{item}</span>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Course Content */}
      <section className="py-20" style={{ backgroundColor: `${primaryColor}05` }}>
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className={`text-3xl font-bold mb-3 ${textPrimary}`}>{config.content.sectionTitle}</h2>
            <p className={`text-lg ${textMuted}`}>{config.content.sectionSubtitle}</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5 max-w-5xl mx-auto">
            {modules.map((module, index) => (
              <div
                key={module.id}
                className={`${cardBg} ${cardBorder} border rounded-xl p-6`}
              >
                <div 
                  className="w-12 h-12 rounded-xl flex items-center justify-center mb-4 text-white font-bold"
                  style={{ backgroundColor: primaryColor }}
                >
                  {index + 1}
                </div>
                <h3 className={`font-bold text-lg mb-2 ${textPrimary}`}>{module.title}</h3>
                <p className={`text-sm ${textMuted} mb-2`}>{module.lessons_count} aulas</p>
                {module.description && (
                  <p className={`text-sm ${textSecondary} line-clamp-2`}>{module.description}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div 
            className={`max-w-2xl mx-auto rounded-2xl p-10 text-center ${cardBg} ${cardBorder} border shadow-lg`}
          >
            <h2 className={`text-2xl font-bold mb-3 ${textPrimary}`}>{config.cta.mainText}</h2>
            <p className={`mb-6 ${textMuted}`}>{config.cta.subText}</p>
            
            <div className={`text-5xl font-bold mb-6 ${textPrimary}`}>
              {formatPrice(service.price_cents)}
            </div>

            <Button
              size="lg"
              onClick={handleCheckout}
              className="w-full sm:w-auto text-lg font-semibold px-10 py-6 text-white rounded-xl"
              style={{ backgroundColor: primaryColor }}
            >
              {config.cta.buttonText}
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>

            {config.cta.urgencyText && (
              <p className="mt-4 font-medium" style={{ color: accentColor }}>
                ⚡ {config.cta.urgencyText}
              </p>
            )}

            {config.guarantee.enabled && (
              <div className={`mt-6 pt-6 border-t ${cardBorder} flex items-center justify-center gap-2`}>
                <Shield className="w-5 h-5 text-green-500" />
                <span className={`${textSecondary}`}>{config.guarantee.title}</span>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Instructor */}
      {config.instructor.showSection && profile && (
        <section className="py-20" style={{ backgroundColor: `${primaryColor}05` }}>
          <div className="container mx-auto px-4">
            <h2 className={`text-3xl font-bold text-center mb-12 ${textPrimary}`}>
              {config.instructor.title}
            </h2>
            <div className="max-w-lg mx-auto text-center">
              <Avatar className="w-28 h-28 mx-auto border-4 shadow-lg" style={{ borderColor: primaryColor }}>
                <AvatarImage src={profile.avatar_url || undefined} />
                <AvatarFallback 
                  className="text-3xl font-bold"
                  style={{ backgroundColor: `${primaryColor}15`, color: primaryColor }}
                >
                  {getInitials(profile.full_name)}
                </AvatarFallback>
              </Avatar>
              
              <h3 className={`text-2xl font-bold mt-6 ${textPrimary}`}>{profile.full_name}</h3>
              {profile.specialty && (
                <p className={`mt-2 ${textMuted}`}>{profile.specialty}</p>
              )}
              <div className="flex items-center justify-center gap-1 mt-3">
                {[1,2,3,4,5].map(i => (
                  <Star key={i} className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                ))}
              </div>
              {profile.bio && (
                <p className={`mt-6 leading-relaxed ${textSecondary}`}>{profile.bio}</p>
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

export default CenteredLayout;
