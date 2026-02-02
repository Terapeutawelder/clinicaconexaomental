import { useNavigate } from "react-router-dom";
import { 
  Play, 
  BookOpen, 
  Award, 
  Check, 
  Shield,
  Sparkles,
  Users,
  Infinity,
  ArrowRight,
  Star,
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

const CardsLayout = ({ service, profile, modules, config, themeColors }: LayoutProps) => {
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
      {/* Hero - Bento Grid */}
      <section className="py-10 md:py-16">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-5 gap-4">
            {/* Main Card */}
            <div 
              className={`lg:col-span-3 rounded-2xl p-8 md:p-10 ${cardBg} ${cardBorder} border`}
            >
              <Badge 
                className="inline-flex items-center gap-2 px-4 py-2 mb-6 font-semibold"
                style={{ backgroundColor: `${primaryColor}20`, color: primaryColor }}
              >
                <Sparkles className="w-4 h-4" />
                {config.hero.badge}
              </Badge>

              <h1 className={`text-3xl md:text-4xl font-bold leading-tight mb-4 ${textPrimary}`}>
                {config.hero.title || service.name}
              </h1>

              {(config.hero.subtitle || service.description) && (
                <p className={`text-lg leading-relaxed mb-8 ${textSecondary}`}>
                  {config.hero.subtitle || service.description}
                </p>
              )}

              {config.hero.showVideo && heroImageUrl && (
                <div className="relative mb-8">
                  <div className={`aspect-video rounded-xl overflow-hidden ${cardBorder} border`}>
                    <img src={heroImageUrl} alt={service.name} className="w-full h-full object-cover" />
                    <div className={`absolute inset-0 flex items-center justify-center ${bgOverlay} group cursor-pointer hover:bg-black/40 transition-colors`}>
                      <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                        <Play className="w-6 h-6 text-gray-800 ml-1" fill="currentColor" />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <Button
                size="lg"
                onClick={handleCheckout}
                className="w-full sm:w-auto text-base font-semibold px-8 py-6 text-white rounded-xl"
                style={{ backgroundColor: primaryColor }}
              >
                {config.hero.ctaText} por {formatPrice(service.price_cents)}
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </div>

            {/* Stats Cards */}
            <div className="lg:col-span-2 grid grid-cols-2 lg:grid-cols-1 gap-4">
              {[
                { icon: BookOpen, value: totalLessons, label: 'Aulas em vídeo' },
                { icon: Users, value: modules.length, label: 'Módulos completos' },
                { icon: Award, value: 'Grátis', label: 'Certificado incluso' },
                { icon: Infinity, value: 'Vitalício', label: 'Acesso ilimitado' },
              ].map((stat, i) => (
                <div 
                  key={i}
                  className={`rounded-xl p-5 ${cardBg} ${cardBorder} border flex flex-col justify-center`}
                >
                  <div 
                    className="w-10 h-10 rounded-lg flex items-center justify-center mb-3 text-white"
                    style={{ backgroundColor: primaryColor }}
                  >
                    <stat.icon className="w-5 h-5" />
                  </div>
                  <p className={`text-2xl font-bold ${textPrimary}`}>{stat.value}</p>
                  <p className={`text-sm ${textMuted}`}>{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Benefits */}
      {config.benefits.enabled && (
        <section className="py-16">
          <div className="container mx-auto px-4">
            <h2 className={`text-2xl font-bold text-center mb-10 ${textPrimary}`}>
              {config.benefits.title}
            </h2>
            <div className="flex flex-wrap justify-center gap-3 max-w-4xl mx-auto">
              {config.benefits.items.map((item, i) => (
                <div 
                  key={i} 
                  className={`flex items-center gap-3 px-5 py-3 rounded-full ${cardBg} ${cardBorder} border`}
                >
                  <div 
                    className="w-6 h-6 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: `${primaryColor}15` }}
                  >
                    <Check className="w-3 h-3" style={{ color: primaryColor }} />
                  </div>
                  <span className={`font-medium ${textPrimary}`}>{item}</span>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Course Content */}
      <section className="py-16" style={{ backgroundColor: `${primaryColor}05` }}>
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className={`text-2xl font-bold mb-3 ${textPrimary}`}>{config.content.sectionTitle}</h2>
            <p className={`${textMuted}`}>{config.content.sectionSubtitle}</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 max-w-5xl mx-auto">
            {modules.map((module, index) => (
              <div
                key={module.id}
                className={`${cardBg} ${cardBorder} border rounded-xl p-6`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div 
                    className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold"
                    style={{ backgroundColor: primaryColor }}
                  >
                    {index + 1}
                  </div>
                  <Badge variant="secondary" className="font-medium">{module.lessons_count} aulas</Badge>
                </div>
                <h3 className={`font-bold mb-2 ${textPrimary}`}>{module.title}</h3>
                {module.description && (
                  <p className={`text-sm ${textMuted} line-clamp-2`}>{module.description}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Instructor */}
      {config.instructor.showSection && profile && (
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-2xl mx-auto">
              <div className={`rounded-2xl p-8 ${cardBg} ${cardBorder} border`}>
                <p className={`text-xs uppercase tracking-widest mb-6 font-bold ${textMuted}`}>{config.instructor.title}</p>
                <div className="flex flex-col sm:flex-row items-center gap-6">
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
                    <h3 className={`text-xl font-bold ${textPrimary}`}>{profile.full_name}</h3>
                    {profile.specialty && <p className={`${textMuted}`}>{profile.specialty}</p>}
                    <div className="flex items-center gap-1 mt-2 justify-center sm:justify-start">
                      {[1,2,3,4,5].map(i => (
                        <Star key={i} className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                      ))}
                    </div>
                  </div>
                </div>
                {profile.bio && (
                  <p className={`mt-6 ${textSecondary}`}>{profile.bio}</p>
                )}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* CTA - Bento */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-4 max-w-3xl mx-auto">
            <div className={`rounded-2xl p-8 ${cardBg} ${cardBorder} border`}>
              <p className={`text-sm mb-2 ${textMuted}`}>{config.cta.mainText}</p>
              <p className={`text-4xl font-bold mb-2 ${textPrimary}`}>{formatPrice(service.price_cents)}</p>
              <p className={`text-sm ${textMuted}`}>{config.cta.subText}</p>
              
              <div className={`mt-6 pt-5 border-t ${cardBorder} space-y-2`}>
                {['Acesso vitalício', 'Certificado incluso', 'Suporte exclusivo'].map((item, i) => (
                  <div key={i} className={`flex items-center gap-2 ${textSecondary}`}>
                    <Check className="w-4 h-4" style={{ color: primaryColor }} />
                    <span className="text-sm">{item}</span>
                  </div>
                ))}
              </div>
            </div>

            <div 
              className="rounded-2xl p-8 flex flex-col justify-center text-white"
              style={{ backgroundColor: primaryColor }}
            >
              <Button
                size="lg"
                onClick={handleCheckout}
                className="font-semibold py-6 mb-4"
                style={{ backgroundColor: 'white', color: primaryColor }}
              >
                {config.cta.buttonText}
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
              
              {config.cta.urgencyText && (
                <p className="text-center font-medium opacity-90">⚡ {config.cta.urgencyText}</p>
              )}

              {config.guarantee.enabled && (
                <div className="flex items-center justify-center gap-2 mt-4 text-sm opacity-90">
                  <Shield className="w-4 h-4" />
                  {config.guarantee.title}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

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

export default CardsLayout;
