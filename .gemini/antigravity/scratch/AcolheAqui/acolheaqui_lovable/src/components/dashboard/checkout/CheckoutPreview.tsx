import { useState, useEffect } from "react";
import { Clock, User, Mail, Phone, FileText, QrCode, CreditCard, Shield, Lock, ShoppingCart, ChevronLeft, ChevronRight } from "lucide-react";
import DynamicBannerTemplate from "./DynamicBannerTemplate";

interface CheckoutPreviewProps {
  config: any;
  service: {
    name: string;
    price_cents: number;
    description?: string | null;
    duration_minutes?: number;
  };
  professionalName?: string;
  professionalAvatar?: string | null;
}

const CheckoutPreview = ({ config, service, professionalName, professionalAvatar }: CheckoutPreviewProps) => {
  const [currentBannerIndex, setCurrentBannerIndex] = useState(0);

  const formatPrice = (cents: number) => {
    return (cents / 100).toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
  };

  const productName = config.summary?.product_name || service.name;
  const banners = config.banners || [];

  // Auto-rotate banners
  useEffect(() => {
    if (banners.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentBannerIndex((prev) => (prev + 1) % banners.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [banners.length]);

  const nextBanner = () => {
    setCurrentBannerIndex((prev) => (prev + 1) % banners.length);
  };

  const prevBanner = () => {
    setCurrentBannerIndex((prev) => (prev - 1 + banners.length) % banners.length);
  };

  return (
    <div className="rounded-lg border border-border/50 overflow-hidden shadow-lg">
      <div className="bg-muted/50 px-4 py-2 flex items-center justify-between border-b border-border/50">
        <span className="text-sm font-medium text-muted-foreground">Preview do Checkout</span>
        <div className="flex gap-1.5">
          <div className="w-3 h-3 rounded-full bg-red-400" />
          <div className="w-3 h-3 rounded-full bg-yellow-400" />
          <div className="w-3 h-3 rounded-full bg-green-400" />
        </div>
      </div>
      
      <div 
        className="max-h-[70vh] overflow-y-auto"
        style={{ backgroundColor: config.backgroundColor }}
      >
        {/* Timer */}
        {config.timer?.enabled && (
          <div 
            className="px-4 py-3 flex items-center justify-center gap-2"
            style={{ backgroundColor: config.timer.bgcolor, color: config.timer.textcolor }}
          >
            <Clock className="w-4 h-4" />
            <span className="text-sm font-medium">{config.timer.text}</span>
            <span className="font-bold font-mono">{config.timer.minutes}:00</span>
          </div>
        )}

        {/* Dynamic Banner */}
        {config.useDynamicBanner && (
          <div className="mx-4 mt-4">
            <DynamicBannerTemplate
              professionalName={professionalName || "Nome do Profissional"}
              professionalAvatar={professionalAvatar}
              serviceName={productName}
              serviceDuration={service.duration_minutes || 50}
              gradientFrom={config.dynamicBannerColors?.gradientFrom}
              gradientVia={config.dynamicBannerColors?.gradientVia}
              gradientTo={config.dynamicBannerColors?.gradientTo}
              textColor={config.dynamicBannerColors?.textColor}
            />
          </div>
        )}


        {/* Main Banners Preview (only show if not using dynamic banner) */}
        {!config.useDynamicBanner && banners.length > 0 && (
          <div className="relative mx-4 mt-4">
            <div className="relative overflow-hidden rounded-lg shadow-md">
              <img 
                src={banners[currentBannerIndex]} 
                alt={`Banner ${currentBannerIndex + 1}`} 
                className="w-full h-24 object-cover transition-all duration-300"
              />
              {banners.length > 1 && (
                <>
                  <button
                    onClick={prevBanner}
                    className="absolute left-1 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full p-1 transition-colors"
                  >
                    <ChevronLeft className="w-3 h-3" />
                  </button>
                  <button
                    onClick={nextBanner}
                    className="absolute right-1 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full p-1 transition-colors"
                  >
                    <ChevronRight className="w-3 h-3" />
                  </button>
                  <div className="absolute bottom-1 left-1/2 -translate-x-1/2 flex gap-1">
                    {banners.map((_, idx) => (
                      <button
                        key={idx}
                        onClick={() => setCurrentBannerIndex(idx)}
                        className={`w-1.5 h-1.5 rounded-full transition-colors ${
                          idx === currentBannerIndex ? 'bg-white' : 'bg-white/50'
                        }`}
                      />
                    ))}
                  </div>
                </>
              )}
            </div>
            <p className="text-xs text-center text-gray-500 mt-1">
              {banners.length} banner{banners.length > 1 ? 's' : ''} principal{banners.length > 1 ? 'is' : ''}
            </p>
          </div>
        )}

        {/* Header */}
        {config.header?.enabled && (
          <div 
            className="px-6 py-4 text-center"
            style={{ backgroundColor: config.accentColor }}
          >
            <h1 className="text-xl font-bold text-white">{config.header.title}</h1>
            <p className="text-white/80 text-sm mt-1 flex items-center justify-center gap-1">
              <Shield className="w-3 h-3" />
              {config.header.subtitle}
            </p>
          </div>
        )}

        <div className="p-4 flex gap-4">
          {/* Main Column */}
          <div className="flex-1 space-y-4">
            {/* Product Summary */}
            <div className="bg-white rounded-lg p-4 shadow-sm">
              <div className="flex items-start gap-3">
                <div 
                  className="w-16 h-16 rounded-lg flex items-center justify-center"
                  style={{ backgroundColor: `${config.accentColor}20` }}
                >
                  <ShoppingCart className="w-6 h-6" style={{ color: config.accentColor }} />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-800">{productName}</h3>
                  {config.summary?.discount_text && (
                    <span className="inline-block bg-red-100 text-red-600 text-xs font-bold px-2 py-0.5 rounded-full mt-1">
                      {config.summary.discount_text}
                    </span>
                  )}
                  <p 
                    className="text-xl font-bold mt-2"
                    style={{ color: config.accentColor }}
                  >
                    {formatPrice(service.price_cents)}
                  </p>
                </div>
              </div>
            </div>

            {/* Customer Info */}
            <div className="bg-white rounded-lg p-4 shadow-sm space-y-3">
              <h4 className="font-semibold text-gray-700 flex items-center gap-2">
                <User className="w-4 h-4" />
                Seus dados
              </h4>
              <div className="space-y-2">
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input 
                    type="text" 
                    placeholder="Nome completo" 
                    className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg bg-gray-50"
                    disabled
                  />
                </div>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input 
                    type="email" 
                    placeholder="E-mail" 
                    className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg bg-gray-50"
                    disabled
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {config.customerFields?.enable_phone && (
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input 
                        type="tel" 
                        placeholder="Telefone" 
                        className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg bg-gray-50"
                        disabled
                      />
                    </div>
                  )}
                  {config.customerFields?.enable_cpf && (
                    <div className="relative">
                      <FileText className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input 
                        type="text" 
                        placeholder="CPF" 
                        className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg bg-gray-50"
                        disabled
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Payment Methods */}
            <div className="bg-white rounded-lg p-4 shadow-sm space-y-3">
              <h4 className="font-semibold text-gray-700 flex items-center gap-2">
                <CreditCard className="w-4 h-4" />
                Pagamento
              </h4>
              <div className="space-y-2">
                {config.paymentMethods?.pix && (
                  <div 
                    className="border-2 rounded-lg p-3 flex items-center gap-3"
                    style={{ borderColor: config.accentColor, backgroundColor: `${config.accentColor}10` }}
                  >
                    <QrCode className="w-5 h-5" style={{ color: config.accentColor }} />
                    <span className="font-medium text-gray-800">Pix</span>
                    <span className="ml-auto text-xs bg-green-100 text-green-600 px-2 py-0.5 rounded-full">Aprovação Imediata</span>
                  </div>
                )}
                {config.paymentMethods?.credit_card && (
                  <div className="border rounded-lg p-3 flex items-center gap-3">
                    <CreditCard className="w-5 h-5 text-gray-400" />
                    <span className="font-medium text-gray-600">Cartão de Crédito</span>
                  </div>
                )}
                {config.paymentMethods?.boleto && (
                  <div className="border rounded-lg p-3 flex items-center gap-3">
                    <FileText className="w-5 h-5 text-gray-400" />
                    <span className="font-medium text-gray-600">Boleto</span>
                  </div>
                )}
              </div>
            </div>

            {/* CTA Button */}
            <button
              className="w-full py-3 rounded-lg font-bold text-white shadow-lg transition-all hover:opacity-90"
              style={{ backgroundColor: config.accentColor }}
            >
              Finalizar Compra
            </button>

            {/* Security Footer */}
            <div className="text-center text-xs text-gray-500 space-y-2 pt-2">
              <div className="flex items-center justify-center gap-4">
                <span className="flex items-center gap-1">
                  <Lock className="w-3 h-3" />
                  Compra 100% segura
                </span>
                <span className="flex items-center gap-1">
                  <Shield className="w-3 h-3" />
                  Dados protegidos
                </span>
              </div>
              <p className="text-gray-400">Processado por <strong>AcolheAqui</strong></p>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default CheckoutPreview;
