import { useNavigate } from "react-router-dom";
import { 
  BookOpen, 
  Check, 
  Shield,
  Users,
  Star,
  ArrowRight,
  Zap,
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

const BoldLayout = ({ service, profile, modules, config, themeColors }: LayoutProps) => {
  const navigate = useNavigate();
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

  const totalLessons = modules.reduce((acc, m) => acc + m.lessons_count, 0);
  const cardBg = isLightTheme ? 'bg-white' : 'bg-white/5';
  const cardBorder = isLightTheme ? 'border-gray-200' : 'border-white/10';

  return (
    <div className="font-sans">
      {/* Hero - Bold & Impactful */}
      <section className="relative min-h-screen flex items-center py-20 overflow-hidden">
        <div 
          className="absolute inset-0"
          style={{ 
            background: `radial-gradient(ellipse at 30% 20%, ${primaryColor}25, transparent 50%), 
                        radial-gradient(ellipse at 70% 80%, ${accentColor}15, transparent 50%)` 
          }}
        />

        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <Badge 
              className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-bold rounded-full mb-8 text-white"
              style={{ backgroundColor: accentColor }}
            >
              <Zap className="w-4 h-4" />
              {config.hero.badge}
            </Badge>

            <h1 className={`text-5xl md:text-6xl lg:text-7xl font-black leading-none mb-6 ${textPrimary}`}>
              {config.hero.title || service.name}
            </h1>

            {(config.hero.subtitle || service.description) && (
              <p className={`text-xl md:text-2xl leading-relaxed max-w-2xl mx-auto mb-10 ${textSecondary}`}>
                {config.hero.subtitle || service.description}
              </p>
            )}

            {/* Stats */}
            <div className="flex flex-wrap justify-center gap-10 mb-12">
              {[
                { value: `${totalLessons}+`, label: 'AULAS' },
                { value: `${modules.length}`, label: 'MÓDULOS' },
                { value: '100%', label: 'ONLINE' },
              ].map((stat, i) => (
                <div key={i} className="text-center">
                  <p className={`text-5xl md:text-6xl font-black ${textPrimary}`}>{stat.value}</p>
                  <p className={`text-xs uppercase tracking-widest mt-1 font-bold ${textMuted}`}>{stat.label}</p>
                </div>
              ))}
            </div>

            <Button
              size="lg"
              onClick={handleCheckout}
              className="text-xl font-bold px-12 py-8 rounded-2xl text-white"
              style={{ backgroundColor: primaryColor }}
            >
              {config.hero.ctaText} • {formatPrice(service.price_cents)}
              <ArrowRight className="w-6 h-6 ml-2" />
            </Button>

            <div className={`flex flex-wrap items-center justify-center gap-4 mt-6 text-sm ${textMuted}`}>
              <div className="flex items-center gap-1">
                <Shield className="w-4 h-4 text-green-500" />
                <span className="font-medium">Pagamento seguro</span>
              </div>
              {config.guarantee.enabled && (
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 text-yellow-500" />
                  <span className="font-medium">{config.guarantee.days} dias de garantia</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Benefits */}
      {config.benefits.enabled && (
        <section className="py-20" style={{ backgroundColor: `${primaryColor}06` }}>
          <div className="container mx-auto px-4">
            <h2 className={`text-3xl md:text-4xl font-black text-center mb-12 ${textPrimary}`}>
              {config.benefits.title}
            </h2>
            <div className="grid md:grid-cols-2 gap-5 max-w-3xl mx-auto">
              {config.benefits.items.map((item, i) => (
                <div 
                  key={i} 
                  className={`p-6 rounded-xl ${cardBg} ${cardBorder} border`}
                >
                  <div 
                    className="w-12 h-12 rounded-lg flex items-center justify-center mb-4 text-white"
                    style={{ backgroundColor: primaryColor }}
                  >
                    <Check className="w-6 h-6" />
                  </div>
                  <p className={`text-lg font-bold ${textPrimary}`}>{item}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Course Content */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className={`text-3xl md:text-4xl font-black mb-3 ${textPrimary}`}>{config.content.sectionTitle}</h2>
            <p className={`text-lg ${textMuted}`}>{config.content.sectionSubtitle}</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5 max-w-5xl mx-auto">
            {modules.map((module, index) => (
              <div
                key={module.id}
                className={`relative ${cardBg} ${cardBorder} border rounded-xl p-6`}
              >
                <div 
                  className="absolute top-4 right-4 w-10 h-10 rounded-full flex items-center justify-center text-white font-bold"
                  style={{ backgroundColor: primaryColor }}
                >
                  {index + 1}
                </div>
                <BookOpen className="w-8 h-8 mb-3" style={{ color: primaryColor }} />
                <h3 className={`text-lg font-bold mb-1 pr-10 ${textPrimary}`}>{module.title}</h3>
                <p className={`text-sm ${textMuted} mb-2`}>{module.lessons_count} aulas</p>
                {module.description && (
                  <p className={`text-sm ${textSecondary} line-clamp-2`}>{module.description}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Instructor */}
      {config.instructor.showSection && profile && (
        <section className="py-20" style={{ backgroundColor: `${primaryColor}06` }}>
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto flex flex-col md:flex-row items-center gap-8">
              <Avatar className="w-32 h-32 border-4" style={{ borderColor: primaryColor }}>
                <AvatarImage src={profile.avatar_url || undefined} />
                <AvatarFallback 
                  className="text-3xl font-black"
                  style={{ backgroundColor: `${primaryColor}15`, color: primaryColor }}
                >
                  {getInitials(profile.full_name)}
                </AvatarFallback>
              </Avatar>
              <div className="text-center md:text-left">
                <p className={`text-xs uppercase tracking-widest mb-1 font-bold ${textMuted}`}>{config.instructor.title}</p>
                <h3 className={`text-2xl font-black ${textPrimary}`}>{profile.full_name}</h3>
                {profile.specialty && <p className={`mt-1 text-lg ${textMuted}`}>{profile.specialty}</p>}
                {profile.bio && <p className={`mt-3 ${textSecondary}`}>{profile.bio}</p>}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Final CTA */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div 
            className="max-w-3xl mx-auto rounded-2xl p-10 md:p-14 text-center text-white"
            style={{ backgroundColor: primaryColor }}
          >
            <h2 className="text-3xl md:text-4xl font-black mb-4">{config.cta.mainText}</h2>
            <p className="text-lg opacity-90 mb-8">{config.cta.subText}</p>
            
            <div className="text-5xl md:text-6xl font-black mb-8">
              {formatPrice(service.price_cents)}
            </div>

            <Button
              size="lg"
              onClick={handleCheckout}
              className="text-lg font-bold px-12 py-7 rounded-xl"
              style={{ backgroundColor: 'white', color: primaryColor }}
            >
              {config.cta.buttonText}
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>

            {config.cta.urgencyText && (
              <p className="mt-6 text-lg font-bold opacity-90">⚡ {config.cta.urgencyText}</p>
            )}
          </div>
        </div>
      </section>

      {/* Sticky CTA */}
      <div 
        className={`fixed bottom-0 left-0 right-0 p-4 border-t backdrop-blur-xl ${cardBorder}`}
        style={{ backgroundColor: isLightTheme ? 'rgba(255,255,255,0.95)' : 'rgba(0,0,0,0.9)' }}
      >
        <div className="container mx-auto flex items-center justify-between gap-4">
          <div className="hidden sm:block">
            <p className={`font-bold ${textPrimary}`}>{service.name}</p>
            <p className={`text-sm ${textMuted}`}>{config.cta.subText}</p>
          </div>
          <Button
            onClick={handleCheckout}
            className="font-bold py-5 px-8 text-white flex-1 sm:flex-none rounded-xl"
            style={{ backgroundColor: primaryColor }}
          >
            {config.cta.buttonText} • {formatPrice(service.price_cents)}
          </Button>
        </div>
      </div>

      <div className="h-20" />
    </div>
  );
};

export default BoldLayout;
