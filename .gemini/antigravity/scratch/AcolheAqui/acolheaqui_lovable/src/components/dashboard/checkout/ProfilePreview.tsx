import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { 
  User, 
  Mail,
  Phone,
  FileText,
  CreditCard,
  Wallet,
  QrCode,
  Lock,
  Shield,
  ShoppingCart,
  Instagram,
  Loader2,
  Clock
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import DynamicBannerTemplate from "./DynamicBannerTemplate";
import { formatProfessionalName } from "@/lib/formatProfessionalName";

interface Profile {
  id: string;
  full_name: string | null;
  gender?: 'male' | 'female' | 'other' | null;
  avatar_url: string | null;
  crp: string | null;
  specialty: string | null;
  instagram_url: string | null;
  linkedin_url: string | null;
}

interface Service {
  id: string;
  name: string;
  description: string | null;
  price_cents: number;
  duration_minutes: number;
  product_config?: { image_url?: string } | null;
  checkout_config?: any;
}

interface ProfilePreviewProps {
  profileId: string;
  serviceId: string;
}

const ProfilePreview = ({ profileId, serviceId }: ProfilePreviewProps) => {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [service, setService] = useState<Service | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPayment, setSelectedPayment] = useState<'pix' | 'credit_card'>('pix');
  const [showPaymentGlow, setShowPaymentGlow] = useState(false);

  useEffect(() => {
    if (profileId && serviceId) {
      fetchData();
    }
  }, [profileId, serviceId]);

  const fetchData = async () => {
    try {
      const [profileResult, serviceResult] = await Promise.all([
        supabase.from("profiles").select("id, full_name, avatar_url, crp, specialty, instagram_url, linkedin_url").eq("id", profileId).maybeSingle(),
        supabase.from("services").select("id, name, description, price_cents, duration_minutes, product_config, checkout_config").eq("id", serviceId).maybeSingle()
      ]);

      if (profileResult.data) {
        setProfile(profileResult.data as Profile);
      }
      if (serviceResult.data) {
        setService(serviceResult.data as Service);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const config = service?.checkout_config || {};
  const accentColor = config?.accentColor || "#5521ea";
  const backgroundColor = config?.backgroundColor || "#f3f4f6";
  const bannerColor =
    config?.dynamicBannerColors?.gradientFrom ||
    config?.dynamicBannerColors?.gradientVia ||
    config?.dynamicBannerColors?.gradientTo ||
    accentColor;

  const formatPrice = (cents: number) => {
    return (cents / 100).toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
  };

  // Calendar removed - no scheduling in checkout preview

  const getInitials = (name: string | null) => {
    if (!name) return 'P';
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  };

  const getSpecialtyTags = (specialty: string | null): string[] => {
    if (!specialty) return [];
    return specialty.split(',').map(s => s.trim()).filter(Boolean).slice(0, 3);
  };

  if (isLoading) {
    return (
      <div className="min-h-full flex items-center justify-center p-4" style={{ backgroundColor }}>
        <Loader2 className="w-6 h-6 animate-spin text-gray-500" />
      </div>
    );
  }

  const productName = config?.summary?.product_name || service?.name || "Serviço";
  const precoAnterior = config?.summary?.preco_anterior;
  const productImage = service?.product_config?.image_url;

  return (
    <div className="min-h-full font-sans text-xs" style={{ backgroundColor }}>
      <style>{`
        .checkout-input:focus {
          border-color: ${accentColor};
          box-shadow: 0 0 0 2px ${accentColor}20;
        }
      `}</style>

      {/* Timer */}
      {config?.timer?.enabled && (
        <div 
          className="px-2 py-1.5 flex items-center justify-center gap-1.5"
          style={{ backgroundColor: config.timer.bgcolor, color: config.timer.textcolor }}
        >
          <Clock className="w-3 h-3" />
          <span className="font-medium text-[10px]">{config.timer.text}</span>
          <span className="font-bold font-mono text-xs">15:00</span>
        </div>
      )}

      {/* Dynamic Banner or Static Banners */}
      {config?.useDynamicBanner && profile ? (
        <div className="w-full px-2 pt-2">
          <DynamicBannerTemplate
            professionalName={formatProfessionalName(profile.full_name, profile.gender)}
            professionalAvatar={profile.avatar_url}
            serviceName={productName}
            serviceDuration={service?.duration_minutes || 50}
            gradientFrom={config.dynamicBannerColors?.gradientFrom}
            gradientVia={config.dynamicBannerColors?.gradientVia}
            gradientTo={config.dynamicBannerColors?.gradientTo}
            textColor={config.dynamicBannerColors?.textColor}
          />
        </div>
      ) : config?.banners && config.banners.length > 0 ? (
        <div className="w-full px-2 pt-2">
          <img src={config.banners[0]} alt="Banner" className="w-full h-auto rounded-md" />
        </div>
      ) : null}


      <div className="p-2">
        <div className="flex flex-col lg:flex-row gap-3">
          {/* Left Sidebar - Profile & Calendar */}
          <div 
            className="w-full lg:w-[180px] flex-shrink-0 space-y-2 p-2 rounded-lg"
            style={{
              backgroundColor: `${bannerColor}14`,
              border: `2px solid ${bannerColor}40`,
              boxShadow: `0 10px 24px -18px ${bannerColor}80`,
            }}
          >
            {/* Professional Profile */}
            {profile && (
              <div className="bg-white rounded-lg shadow p-2 space-y-2">
                <div className="flex items-center gap-2">
                  <Avatar className="w-8 h-8 border-2" style={{ borderColor: accentColor }}>
                    <AvatarImage src={profile.avatar_url || ''} alt={profile.full_name || ''} />
                    <AvatarFallback style={{ backgroundColor: `${accentColor}20`, color: accentColor, fontSize: '10px' }}>
                      {getInitials(profile.full_name)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-800 truncate text-[11px]">{formatProfessionalName(profile.full_name, profile.gender)}</h3>
                    {profile.crp && (
                      <p className="text-[9px] text-gray-500">CRP: {profile.crp}</p>
                    )}
                  </div>
                  {profile.instagram_url && (
                    <Instagram className="w-3 h-3 text-gray-400" />
                  )}
                </div>
                
                {profile.specialty && (
                  <div className="flex flex-wrap gap-0.5">
                    {getSpecialtyTags(profile.specialty).map((tag, idx) => (
                      <span 
                        key={idx} 
                        className="text-[9px] px-1.5 py-0.5 rounded-full"
                        style={{ backgroundColor: `${accentColor}15`, color: accentColor }}
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            )}

            <div className="bg-white rounded-lg shadow p-2 space-y-1.5">
              <h2 className="text-[11px] font-semibold text-gray-800">Resumo</h2>
              <div className="space-y-1 text-[10px]">
                <div className="flex justify-between text-gray-700">
                  <span className="truncate mr-1">{productName}</span>
                  <div className="flex items-baseline gap-1 flex-shrink-0">
                    {precoAnterior && (
                      <span className="text-[9px] text-gray-400 line-through">R$ {precoAnterior}</span>
                    )}
                    <span className="font-medium">{service ? formatPrice(service.price_cents) : 'R$ 0,00'}</span>
                  </div>
                </div>
              </div>
              <hr className="border-gray-100" />
              <div className="flex justify-between items-center">
                <span className="font-bold text-gray-800 text-[11px]">Total</span>
                <span className="text-sm font-bold text-green-600">{service ? formatPrice(service.price_cents) : 'R$ 0,00'}</span>
              </div>
              <div className="text-center text-gray-500 text-[9px] flex items-center justify-center gap-0.5">
                <Lock className="w-2.5 h-2.5" />
                Compra segura
              </div>
            </div>
          </div>

          {/* Right Column - Checkout Form */}
          <div className="flex-1">
            <div className="bg-white rounded-lg shadow p-3 space-y-3">
              {/* Product Summary */}
              <div className="flex items-start gap-2">
                {productImage ? (
                  <img 
                    src={productImage} 
                    alt={productName}
                    className="w-12 h-12 object-cover rounded border"
                  />
                ) : (
                  <div 
                    className="w-12 h-12 rounded flex items-center justify-center"
                    style={{ backgroundColor: `${accentColor}15` }}
                  >
                    <ShoppingCart className="w-5 h-5" style={{ color: accentColor }} />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <h1 className="text-sm font-bold text-gray-800 truncate">{productName}</h1>
                  <div className="flex items-baseline gap-1 mt-0.5">
                    <span className="text-base font-bold" style={{ color: accentColor }}>
                      {service ? formatPrice(service.price_cents) : 'R$ 0,00'}
                    </span>
                    {precoAnterior && (
                      <span className="text-xs text-gray-400 line-through">R$ {precoAnterior}</span>
                    )}
                  </div>
                </div>
              </div>

              <hr className="border-gray-100" />

              {/* Customer Info */}
              <div>
                <div className="flex items-center gap-1.5 mb-2">
                  <User className="w-3.5 h-3.5 text-gray-600" />
                  <span className="font-semibold text-gray-700">Seus dados</span>
                </div>
                <div className="space-y-2">
                  <div>
                    <label className="text-[10px] text-gray-600 mb-0.5 block">Qual é o seu nome completo?</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-2 flex items-center pointer-events-none">
                        <User className="w-3 h-3 text-gray-400" />
                      </div>
                      <input 
                        type="text" 
                        className="checkout-input block w-full pl-7 pr-2 py-1.5 bg-white border border-gray-200 rounded text-xs placeholder-gray-400"
                        placeholder="Nome da Silva"
                        readOnly
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-[10px] text-gray-600 mb-0.5 block">Qual é o seu e-mail?</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-2 flex items-center pointer-events-none">
                        <Mail className="w-3 h-3 text-gray-400" />
                      </div>
                      <input 
                        type="email" 
                        className="checkout-input block w-full pl-7 pr-2 py-1.5 bg-white border border-gray-200 rounded text-xs placeholder-gray-400"
                        placeholder="seu@email.com"
                        readOnly
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {config?.customerFields?.enable_phone !== false && (
                      <div>
                        <label className="text-[10px] text-gray-600 mb-0.5 block">Celular</label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-2 flex items-center pointer-events-none">
                            <Phone className="w-3 h-3 text-gray-400" />
                          </div>
                          <input 
                            type="tel" 
                            className="checkout-input block w-full pl-7 pr-2 py-1.5 bg-white border border-gray-200 rounded text-xs placeholder-gray-400"
                            placeholder="(11) 99999-9999"
                            readOnly
                          />
                        </div>
                      </div>
                    )}
                    {config?.customerFields?.enable_cpf !== false && (
                      <div>
                        <label className="text-[10px] text-gray-600 mb-0.5 block">CPF</label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-2 flex items-center pointer-events-none">
                            <FileText className="w-3 h-3 text-gray-400" />
                          </div>
                          <input 
                            type="text" 
                            className="checkout-input block w-full pl-7 pr-2 py-1.5 bg-white border border-gray-200 rounded text-xs placeholder-gray-400"
                            placeholder="000.000.000-00"
                            readOnly
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <hr className="border-gray-100" />

              {/* Payment */}
              <div 
                id="payment-section-preview"
                className={`transition-all duration-500 rounded-lg p-2 -m-2 ${showPaymentGlow ? 'ring-2 ring-green-400 ring-opacity-75 shadow-[0_0_15px_rgba(34,197,94,0.4)]' : ''}`}
              >
                <div className="flex items-center gap-1.5 mb-2">
                  <Wallet className="w-3.5 h-3.5 text-gray-600" />
                  <span className="font-semibold text-gray-700">Pagamento</span>
                </div>
                <div className="space-y-1.5">
                  {config?.paymentMethods?.pix !== false && (
                    <div 
                      className={`border rounded-lg p-2 flex items-center gap-2 cursor-pointer ${selectedPayment === 'pix' ? 'border-2' : 'border-gray-200'}`}
                      onClick={() => setSelectedPayment('pix')}
                      style={selectedPayment === 'pix' ? { borderColor: accentColor, backgroundColor: `${accentColor}08` } : {}}
                    >
                      <img 
                        src="https://upload.wikimedia.org/wikipedia/commons/a/a2/Logo%E2%80%94pix_powered_by_Banco_Central_%28Brazil%2C_2020%29.svg" 
                        alt="PIX" 
                        className="h-4 w-auto"
                      />
                      <div className="flex-1">
                        <span className="font-semibold text-gray-800 text-[11px]">Pix</span>
                        <span className="ml-1 text-[9px] bg-green-100 text-green-600 px-1 py-0.5 rounded-full">Aprovação Imediata</span>
                      </div>
                      <div 
                        className={`w-3.5 h-3.5 rounded-full border-2 ${selectedPayment === 'pix' ? '' : 'border-gray-300'}`}
                        style={selectedPayment === 'pix' ? { borderColor: accentColor, borderWidth: '4px' } : {}}
                      />
                    </div>
                  )}
                  {config?.paymentMethods?.credit_card !== false && (
                    <div 
                      className={`border rounded-lg p-2 flex items-center gap-2 cursor-pointer ${selectedPayment === 'credit_card' ? 'border-2' : 'border-gray-200'}`}
                      onClick={() => setSelectedPayment('credit_card')}
                      style={selectedPayment === 'credit_card' ? { borderColor: accentColor, backgroundColor: `${accentColor}08` } : {}}
                    >
                      <CreditCard className="w-4 h-4 text-gray-500" />
                      <span className="font-semibold text-gray-800 flex-1 text-[11px]">Cartão de Crédito</span>
                      <div 
                        className={`w-3.5 h-3.5 rounded-full border-2 ${selectedPayment === 'credit_card' ? '' : 'border-gray-300'}`}
                        style={selectedPayment === 'credit_card' ? { borderColor: accentColor, borderWidth: '4px' } : {}}
                      />
                    </div>
                  )}
                </div>

                {selectedPayment === 'pix' && (
                  <div className="mt-2 text-[10px] text-gray-600 bg-gray-50 p-2 rounded border border-gray-100">
                    <p>• Liberação imediata do acesso.</p>
                    <p>• 100% Seguro.</p>
                  </div>
                )}

                <button
                  className="w-full mt-3 py-2 rounded-lg font-bold text-white text-xs shadow flex items-center justify-center gap-1.5"
                  style={{ backgroundColor: selectedPayment === 'pix' ? '#16a34a' : accentColor }}
                >
                  <QrCode className="w-4 h-4" />
                  GERAR PIX AGORA
                </button>
              </div>

              <hr className="border-gray-100" />

              {/* Security */}
              <div className="text-center text-[10px] text-gray-500 space-y-1">
                <div className="flex items-center justify-center gap-3">
                  <div className="flex items-center gap-1">
                    <Shield className="w-3 h-3 text-green-500" />
                    <span>Compra segura</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Lock className="w-3 h-3 text-green-500" />
                    <span>Dados protegidos</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePreview;
