import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Check, 
  Shield,
  Award,
  Users,
  Clock,
  Infinity,
  GraduationCap,
  Phone,
  Mail,
  User,
  MapPin,
  ChevronDown,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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

const FormLayout = ({ service, profile, modules, config, themeColors }: LayoutProps) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    region: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const { primaryColor, accentColor, textPrimary, textSecondary, isLightTheme } = themeColors;

  const formatPrice = (cents: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(cents / 100);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    setTimeout(() => {
      setSubmitted(true);
      setIsSubmitting(false);
      
      // Handle redirect based on configuration
      const redirectType = config.cta.redirectType || 'checkout';
      const redirectUrl = config.cta.redirectUrl;
      
      if (redirectType === 'whatsapp' && redirectUrl) {
        window.open(redirectUrl, '_blank');
      } else if (redirectType === 'url' && redirectUrl) {
        window.open(redirectUrl, '_blank');
      } else {
        // Default: redirect to checkout
        navigate(`/checkout/${service.id}`);
      }
    }, 1000);
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section with Gradient Background */}
      <section 
        className="min-h-screen relative overflow-hidden"
        style={{
          background: `linear-gradient(135deg, ${primaryColor} 0%, ${accentColor} 50%, hsl(${config.colors.background}) 100%)`,
        }}
      >
        {/* Decorative Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div 
            className="absolute top-20 left-10 w-64 h-64 rounded-full opacity-20 blur-3xl"
            style={{ backgroundColor: accentColor }}
          />
          <div 
            className="absolute bottom-20 right-10 w-96 h-96 rounded-full opacity-15 blur-3xl"
            style={{ backgroundColor: primaryColor }}
          />
          <div 
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full opacity-10 blur-3xl"
            style={{ backgroundColor: 'white' }}
          />
        </div>

        <div className="container mx-auto px-4 py-12 lg:py-20 relative z-10">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-16 items-center min-h-[80vh]">
            {/* Left Content */}
            <div className="space-y-8 text-white order-2 lg:order-1">
              {/* Badge */}
              {config.hero.badge && (
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/20 backdrop-blur-sm border border-white/30">
                  <Sparkles className="w-4 h-4" />
                  <span className="text-sm font-medium">{config.hero.badge}</span>
                </div>
              )}

              {/* Title */}
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
                {config.hero.title || service.name}
              </h1>

              {/* Subtitle */}
              <p className="text-lg md:text-xl text-white/80 max-w-lg">
                {config.hero.subtitle || service.description}
              </p>

              {/* Benefits List */}
              {config.benefits.enabled && (
                <div className="space-y-3">
                  {config.benefits.items.slice(0, 4).map((item, index) => (
                    <div key={index} className="flex items-center gap-3">
                      <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
                        <Check className="w-4 h-4" />
                      </div>
                      <span className="text-white/90">{item}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Stats */}
              <div className="flex flex-wrap gap-6 pt-4">
                <div className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-white/70" />
                  <span className="text-white/90">+500 alunos</span>
                </div>
                <div className="flex items-center gap-2">
                  <GraduationCap className="w-5 h-5 text-white/70" />
                  <span className="text-white/90">{modules.length} módulos</span>
                </div>
                <div className="flex items-center gap-2">
                  <Award className="w-5 h-5 text-white/70" />
                  <span className="text-white/90">Certificado</span>
                </div>
              </div>

              {/* Instructor Mini */}
              {profile && (
                <div className="flex items-center gap-4 pt-6 border-t border-white/20">
                  <Avatar className="w-14 h-14 border-2 border-white/30">
                    <AvatarImage src={profile.avatar_url || undefined} alt={profile.full_name || ""} />
                    <AvatarFallback className="bg-white/20 text-white">
                      {profile.full_name?.charAt(0) || "P"}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-semibold">{profile.full_name}</p>
                    <p className="text-sm text-white/70">{profile.specialty}</p>
                  </div>
                </div>
              )}
            </div>

            <div className="order-1 lg:order-2">
              <div 
                className="rounded-3xl p-6 md:p-8 shadow-xl backdrop-blur-md border"
                style={{
                  backgroundColor: isLightTheme ? 'rgba(255, 255, 255, 0.95)' : 'rgba(15, 23, 42, 0.9)',
                  borderColor: isLightTheme ? 'rgba(0,0,0,0.05)' : 'rgba(255,255,255,0.1)',
                }}
              >
                {/* Form Header */}
                <div className="text-center mb-6">
                  <div 
                    className="w-12 h-12 rounded-full mx-auto mb-4 flex items-center justify-center"
                    style={{ backgroundColor: `${primaryColor}15` }}
                  >
                    <GraduationCap className="w-6 h-6" style={{ color: primaryColor }} />
                  </div>
                  <h2 className={`text-xl font-semibold mb-1 ${isLightTheme ? 'text-gray-900' : 'text-white'}`}>
                    {config.cta.mainText || "Garanta sua vaga"}
                  </h2>
                  <p className={`text-sm ${isLightTheme ? 'text-gray-500' : 'text-gray-400'}`}>
                    {config.cta.subText || "Preencha seus dados para continuar"}
                  </p>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* Name Field */}
                  <div className="space-y-1.5">
                    <Label 
                      htmlFor="name" 
                      className={`text-xs font-medium ${isLightTheme ? 'text-gray-600' : 'text-gray-400'}`}
                    >
                      Nome completo
                    </Label>
                    <div className="relative">
                      <User className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${isLightTheme ? 'text-gray-400' : 'text-gray-500'}`} />
                      <Input
                        id="name"
                        type="text"
                        placeholder="Seu nome"
                        value={formData.name}
                        onChange={(e) => handleInputChange('name', e.target.value)}
                        required
                        className={`pl-10 h-11 rounded-lg ${
                          isLightTheme 
                            ? 'bg-gray-50/80 border-gray-200 text-gray-900 placeholder:text-gray-400 focus:bg-white' 
                            : 'bg-white/5 border-white/10 text-white placeholder:text-gray-500'
                        }`}
                      />
                    </div>
                  </div>

                  {/* Email Field */}
                  <div className="space-y-1.5">
                    <Label 
                      htmlFor="email" 
                      className={`text-xs font-medium ${isLightTheme ? 'text-gray-600' : 'text-gray-400'}`}
                    >
                      E-mail
                    </Label>
                    <div className="relative">
                      <Mail className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${isLightTheme ? 'text-gray-400' : 'text-gray-500'}`} />
                      <Input
                        id="email"
                        type="email"
                        placeholder="seu@email.com"
                        value={formData.email}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                        required
                        className={`pl-10 h-11 rounded-lg ${
                          isLightTheme 
                            ? 'bg-gray-50/80 border-gray-200 text-gray-900 placeholder:text-gray-400 focus:bg-white' 
                            : 'bg-white/5 border-white/10 text-white placeholder:text-gray-500'
                        }`}
                      />
                    </div>
                  </div>

                  {/* Phone Field */}
                  <div className="space-y-1.5">
                    <Label 
                      htmlFor="phone" 
                      className={`text-xs font-medium ${isLightTheme ? 'text-gray-600' : 'text-gray-400'}`}
                    >
                      WhatsApp
                    </Label>
                    <div className="relative">
                      <Phone className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${isLightTheme ? 'text-gray-400' : 'text-gray-500'}`} />
                      <Input
                        id="phone"
                        type="tel"
                        placeholder="(00) 00000-0000"
                        value={formData.phone}
                        onChange={(e) => handleInputChange('phone', e.target.value)}
                        required
                        className={`pl-10 h-11 rounded-lg ${
                          isLightTheme 
                            ? 'bg-gray-50/80 border-gray-200 text-gray-900 placeholder:text-gray-400 focus:bg-white' 
                            : 'bg-white/5 border-white/10 text-white placeholder:text-gray-500'
                        }`}
                      />
                    </div>
                  </div>

                  {/* Region Select */}
                  <div className="space-y-1.5">
                    <Label 
                      htmlFor="region" 
                      className={`text-xs font-medium ${isLightTheme ? 'text-gray-600' : 'text-gray-400'}`}
                    >
                      Região
                    </Label>
                    <div className="relative">
                      <MapPin className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${isLightTheme ? 'text-gray-400' : 'text-gray-500'}`} />
                      <select
                        id="region"
                        value={formData.region}
                        onChange={(e) => handleInputChange('region', e.target.value)}
                        required
                        className={`w-full pl-10 pr-10 h-11 rounded-lg border appearance-none text-sm ${
                          isLightTheme 
                            ? 'bg-gray-50/80 border-gray-200 text-gray-900 focus:bg-white' 
                            : 'bg-white/5 border-white/10 text-white'
                        }`}
                      >
                        <option value="">Selecione</option>
                        <option value="norte">Norte</option>
                        <option value="nordeste">Nordeste</option>
                        <option value="centro-oeste">Centro-Oeste</option>
                        <option value="sudeste">Sudeste</option>
                        <option value="sul">Sul</option>
                      </select>
                      <ChevronDown className={`absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none ${isLightTheme ? 'text-gray-400' : 'text-gray-500'}`} />
                    </div>
                  </div>

                  {/* Submit Button */}
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full h-12 text-base font-semibold rounded-xl transition-all hover:opacity-90 shadow-md mt-2"
                    style={{
                      backgroundColor: primaryColor,
                      color: 'white',
                    }}
                  >
                    {isSubmitting ? (
                      <span className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Processando...
                      </span>
                    ) : (
                      config.cta.buttonText || "Quero me Inscrever"
                    )}
                  </Button>

                  {/* Urgency Text */}
                  {config.cta.urgencyText && (
                    <p 
                      className="text-center text-sm font-medium"
                      style={{ color: accentColor }}
                    >
                      🔥 {config.cta.urgencyText}
                    </p>
                  )}
                </form>

                {/* Guarantee & Security */}
                <div className={`mt-5 pt-5 border-t ${isLightTheme ? 'border-gray-100' : 'border-white/5'}`}>
                  <div className="flex items-center justify-center gap-4 text-xs">
                    <div className={`flex items-center gap-1.5 ${isLightTheme ? 'text-gray-400' : 'text-gray-500'}`}>
                      <Shield className="w-3.5 h-3.5" />
                      <span>Seguro</span>
                    </div>
                    {config.guarantee.enabled && (
                      <div className={`flex items-center gap-1.5 ${isLightTheme ? 'text-gray-400' : 'text-gray-500'}`}>
                        <Clock className="w-3.5 h-3.5" />
                        <span>{config.guarantee.days} dias de garantia</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* LGPD Disclaimer */}
                <p className={`mt-3 text-center text-[10px] ${isLightTheme ? 'text-gray-400' : 'text-gray-600'}`}>
                  Ao preencher, você concorda em receber comunicações.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Simple Footer */}
      <footer 
        className="py-6 border-t"
        style={{ 
          backgroundColor: `hsl(${config.colors.background})`,
          borderColor: isLightTheme ? 'rgba(0,0,0,0.05)' : 'rgba(255,255,255,0.1)',
        }}
      >
        <div className="container mx-auto px-4 text-center">
          <p className={`text-sm ${isLightTheme ? 'text-gray-500' : 'text-gray-400'}`}>
            © {new Date().getFullYear()} {profile?.full_name || 'Todos os direitos reservados'}. Todos os direitos reservados.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default FormLayout;
