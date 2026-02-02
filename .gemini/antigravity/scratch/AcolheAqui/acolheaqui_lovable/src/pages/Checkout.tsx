import { useEffect, useState, useCallback } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { 
  Clock, 
  User, 
  Mail, 
  Phone, 
  FileText, 
  QrCode, 
  CreditCard, 
  Shield, 
  Lock, 
  ShoppingCart,
  Check,
  Loader2,
  Copy,
  Wallet,
  Instagram,
  Linkedin
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "sonner";
import { SalesNotification } from "@/components/checkout/SalesNotification";
import { validateCPF } from "@/lib/validateCPF";
import { formatProfessionalName } from "@/lib/formatProfessionalName";
import { getVirtualRoomUrl } from "@/lib/getCanonicalUrl";

interface CheckoutConfig {
  backgroundColor: string;
  accentColor: string;
  timer: {
    enabled: boolean;
    minutes: number;
    text: string;
    bgcolor: string;
    textcolor: string;
    sticky: boolean;
  };
  paymentMethods: {
    credit_card: boolean;
    pix: boolean;
    boleto: boolean;
  };
  customerFields: {
    enable_cpf: boolean;
    enable_phone: boolean;
  };
  summary: {
    product_name: string;
    discount_text: string;
    preco_anterior: string;
  };
  banners: string[];
  sideBanners: string[];
  useDynamicBanner: boolean;
  dynamicBannerColors: {
    gradientFrom: string;
    gradientVia: string;
    gradientTo: string;
    textColor: string;
  };
  videoSettings: {
    autoplay: boolean;
    loop: boolean;
  };
}

interface Service {
  id: string;
  name: string;
  description: string | null;
  price_cents: number;
  checkout_config?: unknown;
  product_config?: unknown;
  duration_minutes?: number;
}

interface FormData {
  name: string;
  email: string;
  phone: string;
  cpf: string;
}

interface Profile {
  id: string;
  full_name: string | null;
  gender?: 'male' | 'female' | 'other' | null;
  avatar_url: string | null;
  crp: string | null;
  specialty: string | null;
  bio: string | null;
  instagram_url: string | null;
  linkedin_url: string | null;
}

// AvailableHour interface removed - scheduling functionality removed from checkout

const defaultConfig: CheckoutConfig = {
  backgroundColor: "#f3f4f6",
  accentColor: "#5521ea",
  timer: { enabled: false, minutes: 15, text: "Esta oferta expira em:", bgcolor: "#ef4444", textcolor: "#ffffff", sticky: true },
  paymentMethods: { credit_card: true, pix: true, boleto: false },
  customerFields: { enable_cpf: true, enable_phone: true },
  summary: { product_name: "", discount_text: "", preco_anterior: "" },
  banners: [],
  sideBanners: [],
  useDynamicBanner: false,
  dynamicBannerColors: {
    gradientFrom: "#9333ea",
    gradientVia: "#7c3aed",
    gradientTo: "#581c87",
    textColor: "#ffffff",
  },
  videoSettings: {
    autoplay: false,
    loop: false,
  },
};

const Checkout = () => {
  const { serviceId } = useParams();
  const [searchParams] = useSearchParams();
  const [service, setService] = useState<Service | null>(null);
  const [professionalId, setProfessionalId] = useState<string | null>(null);
  const [gatewayConfig, setGatewayConfig] = useState<{ accessToken: string; gateway: string } | null>(null);
  const [config, setConfig] = useState<CheckoutConfig>(defaultConfig);
  const [isLoading, setIsLoading] = useState(true);
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [selectedPayment, setSelectedPayment] = useState<'pix' | 'credit_card'>('pix');
  const [formData, setFormData] = useState<FormData>({ name: '', email: '', phone: '', cpf: '' });
  const [isProcessing, setIsProcessing] = useState(false);
  const [showPixModal, setShowPixModal] = useState(false);
  const [pixData, setPixData] = useState<{ qrCode: string; pixCode: string; paymentId?: string } | null>(null);
  const [pixApproved, setPixApproved] = useState(false);
  const [copied, setCopied] = useState(false);
  const [virtualRoomLink, setVirtualRoomLink] = useState<string | null>(null);
  const isPreview = searchParams.get("preview") === "true";
  
  // Professional profile state
  const [profile, setProfile] = useState<Profile | null>(null);

  // Load config from URL param (for preview) or from database
  useEffect(() => {
    const configParam = searchParams.get("config");
    if (configParam) {
      try {
        const parsedConfig = JSON.parse(decodeURIComponent(configParam));
        setConfig(prev => ({ ...prev, ...parsedConfig }));
      } catch (e) {
        console.error("Error parsing config:", e);
      }
    }
  }, [searchParams]);

  useEffect(() => {
    if (serviceId) {
      fetchService();
    }
  }, [serviceId]);

  // Timer with localStorage persistence
  useEffect(() => {
    if (!config.timer.enabled) return;
    
    const storageKey = `checkoutTimer_${serviceId || 'default'}`;
    const storedEndTime = localStorage.getItem(storageKey);
    
    let endTime: number;
    if (storedEndTime && !isNaN(Number(storedEndTime))) {
      endTime = Number(storedEndTime);
    } else {
      endTime = Date.now() + (config.timer.minutes * 60 * 1000);
      localStorage.setItem(storageKey, String(endTime));
    }
    
    const updateTimer = () => {
      const now = Date.now();
      const distance = endTime - now;
      
      if (distance <= 0) {
        setTimerSeconds(0);
        localStorage.removeItem(storageKey);
        return;
      }
      
      setTimerSeconds(Math.floor(distance / 1000));
    };
    
    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    
    return () => clearInterval(interval);
  }, [config.timer.enabled, config.timer.minutes, serviceId]);

  const fetchService = async () => {
    try {
      // Use public_services view for secure public access (excludes sensitive internal fields)
      const { data, error } = await supabase
        .from("public_services")
        .select("*")
        .eq("id", serviceId)
        .maybeSingle();

      if (error) throw error;
      setService(data);
      
      if (data?.professional_id) {
        setProfessionalId(data.professional_id);
        // Fetch payment gateway config
        await fetchGatewayConfig(data.professional_id);
        // Fetch professional profile
        await fetchProfile(data.professional_id);
      }
      
      if (!searchParams.get("config") && data?.checkout_config) {
        setConfig(prev => ({ ...prev, ...data.checkout_config as Partial<CheckoutConfig> }));
      }
    } catch (error) {
      console.error("Error fetching service:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchProfile = async (profId: string) => {
    try {
      const { data, error } = await supabase
        .from("public_professional_profiles")
        .select("*")
        .eq("id", profId)
        .maybeSingle();

      if (error) throw error;
      
      // Fetch additional profile data for social links
      const { data: fullProfile } = await supabase
        .from("profiles")
        .select("instagram_url, linkedin_url, gender")
        .eq("id", profId)
        .maybeSingle();

      if (data) {
        setProfile({
          ...data,
          gender: (fullProfile as any)?.gender || 'female',
          instagram_url: fullProfile?.instagram_url || null,
          linkedin_url: fullProfile?.linkedin_url || null
        } as Profile);
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
    }
  };


  const fetchGatewayConfig = async (profId: string) => {
    try {
      const { data, error } = await supabase
        .from("payment_gateways")
        .select("*")
        .eq("professional_id", profId)
        .eq("is_active", true)
        .maybeSingle();

      if (error) throw error;

      if (data?.card_api_key && data?.card_gateway) {
        const gateway = String(data.card_gateway);
        const raw = String(data.card_api_key);

        // Supports: JSON (new), field1|field2 (legacy), or single token (legacy)
        let token = raw;

        try {
          const parsed = JSON.parse(raw);
          if (parsed && typeof parsed === "object") {
            const tokenKeyByGateway: Record<string, string> = {
              mercadopago: "accessToken",
              pushinpay: "apiKey",
              pagarme: "apiKey",
              pagseguro: "token",
              stripe: "secretKey",
              asaas: "accessToken",
            };
            const tokenKey = tokenKeyByGateway[gateway];
            if (tokenKey && typeof (parsed as any)[tokenKey] === "string" && (parsed as any)[tokenKey].trim()) {
              token = (parsed as any)[tokenKey];
            }
          }
        } catch {
          // ignore
        }

        if (raw.includes("|")) {
          const parts = raw.split("|");
          // MercadoPago + Stripe + PagSeguro historically saved as "public/email|secret"
          if (gateway === "mercadopago" || gateway === "stripe" || gateway === "pagseguro") {
            token = parts[1] || parts[0] || raw;
          } else {
            token = parts[0] || raw;
          }
        }

        setGatewayConfig({
          accessToken: token,
          gateway,
        });
      }
    } catch (error) {
      console.error("Error fetching gateway config:", error);
    }
  };

  const formatPrice = (cents: number) => {
    return (cents / 100).toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
  };

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };


  const getInitials = (name: string | null) => {
    if (!name) return 'P';
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  };

  const getSpecialtyTags = (specialty: string | null): string[] => {
    if (!specialty) return [];
    return specialty.split(',').map(s => s.trim()).filter(Boolean).slice(0, 3);
  };

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const formatCPF = (value: string) => {
    return value
      .replace(/\D/g, '')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d{1,2})/, '$1-$2')
      .replace(/(-\d{2})\d+?$/, '$1');
  };

  const formatPhone = (value: string) => {
    return value
      .replace(/\D/g, '')
      .replace(/(\d{2})(\d)/, '($1) $2')
      .replace(/(\d{5})(\d)/, '$1-$2')
      .replace(/(-\d{4})\d+?$/, '$1');
  };

  const validateForm = useCallback(() => {
    if (!formData.name.trim()) {
      toast.error("Por favor, preencha seu nome.");
      return false;
    }
    if (!formData.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      toast.error("Por favor, preencha um e-mail válido.");
      return false;
    }
    if (config.customerFields.enable_phone && !formData.phone.trim()) {
      toast.error("Por favor, preencha seu telefone.");
      return false;
    }
    if (config.customerFields.enable_cpf) {
      if (!formData.cpf.trim()) {
        toast.error("Por favor, preencha seu CPF.");
        return false;
      }
      if (!validateCPF(formData.cpf)) {
        toast.error("CPF inválido. Por favor, verifique os números.");
        return false;
      }
    }
    return true;
  }, [formData, config.customerFields]);

  const handleGeneratePix = async () => {
    if (!validateForm()) return;
    if (!service || !professionalId) return;
    
    setIsProcessing(true);
    
    try {
      // Create transaction record first
      const { data: transaction, error: txError } = await supabase
        .from("transactions")
        .insert({
          professional_id: professionalId,
          service_id: service.id,
          customer_name: formData.name,
          customer_email: formData.email,
          customer_phone: formData.phone || null,
          customer_cpf: formData.cpf || null,
          amount_cents: service.price_cents,
          payment_method: 'pix',
          payment_status: 'pending',
          gateway: gatewayConfig?.gateway || 'mercadopago',
        })
        .select()
        .single();

      if (txError) throw txError;

      // If we have a gateway configured, use the unified gateway-payment function
      if (gatewayConfig?.accessToken && gatewayConfig?.gateway) {
        const nameParts = formData.name.split(' ');
        const firstName = nameParts[0];
        const lastName = nameParts.slice(1).join(' ') || firstName;

        const response = await supabase.functions.invoke('gateway-payment', {
          body: {
            gateway: gatewayConfig.gateway,
            action: 'create_pix',
            accessToken: gatewayConfig.accessToken,
            amount: service.price_cents / 100,
            description: service.name,
            payer: {
              email: formData.email,
              first_name: firstName,
              last_name: lastName,
              identification: formData.cpf ? {
                type: 'CPF',
                number: formData.cpf.replace(/\D/g, ''),
              } : undefined,
            },
          },
        });

        if (response.error) {
          throw new Error(response.error.message || 'Erro ao gerar PIX');
        }

        const result = response.data;

        if (!result.success) {
          throw new Error(result.error || 'Erro ao gerar PIX');
        }

        // Update transaction with gateway info
        await supabase
          .from("transactions")
          .update({
            gateway_payment_id: result.payment_id,
            pix_qr_code: result.pix_qr_code_base64 ? `data:image/png;base64,${result.pix_qr_code_base64}` : null,
            pix_code: result.pix_qr_code,
          })
          .eq("id", transaction.id);

        setPixData({
          qrCode: result.pix_qr_code_base64 
            ? `data:image/png;base64,${result.pix_qr_code_base64}` 
            : `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(result.pix_qr_code)}`,
          pixCode: result.pix_qr_code,
          paymentId: result.payment_id,
        });

        setShowPixModal(true);

        // Poll for payment status
        pollPaymentStatus(result.payment_id, transaction.id, gatewayConfig.gateway, gatewayConfig.accessToken);
      } else {
        // Fallback to mock PIX for demo
        const mockPixCode = `00020126580014br.gov.bcb.pix0136${Date.now()}5204000053039865404${(service.price_cents / 100).toFixed(2)}5802BR5925ACOLHEAQUI6009SAO PAULO62070503***6304`;
        
        setPixData({
          qrCode: `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(mockPixCode)}`,
          pixCode: mockPixCode,
        });
        
        setShowPixModal(true);
        
        // Simulate payment approval after 8 seconds (for demo)
        setTimeout(async () => {
          await supabase
            .from("transactions")
            .update({ payment_status: 'approved' })
            .eq("id", transaction.id);
          setPixApproved(true);
          toast.success("Pagamento aprovado!");
        }, 8000);
      }
    } catch (error) {
      console.error("PIX generation error:", error);
      toast.error(error instanceof Error ? error.message : "Erro ao gerar PIX");
    } finally {
      setIsProcessing(false);
    }
  };

  const pollPaymentStatus = async (paymentId: string, transactionId: string, gateway?: string, accessToken?: string) => {
    // Poll every 5 seconds for up to 10 minutes
    let attempts = 0;
    const maxAttempts = 120;
    
    const poll = async () => {
      if (attempts >= maxAttempts || pixApproved) return;
      
      try {
        // Check payment status via gateway API if available
        if (gateway && accessToken) {
          const response = await supabase.functions.invoke('gateway-payment', {
            body: {
              gateway,
              action: 'check_status',
              accessToken,
              paymentId,
              amount: 0,
            },
          });

          if (response.data?.success && (response.data.status === 'approved' || response.data.status === 'paid')) {
            await supabase
              .from("transactions")
              .update({ payment_status: 'approved' })
              .eq("id", transactionId);
            setPixApproved(true);
            // Generate virtual room link and save to appointment
            const roomCode = Math.random().toString(36).substring(2, 10).toUpperCase();
            const roomLink = getVirtualRoomUrl(roomCode);
            setVirtualRoomLink(roomLink);
            // Update any pending appointment with this room info
            await supabase
              .from("appointments")
              .update({ virtual_room_code: roomCode, virtual_room_link: roomLink })
              .eq("professional_id", professionalId)
              .eq("payment_status", "pending")
              .order("created_at", { ascending: false })
              .limit(1);
            toast.success("Pagamento aprovado!");
            return;
          }
        } else {
          // Fallback: check our transaction status
          const { data } = await supabase
            .from("transactions")
            .select("payment_status")
            .eq("id", transactionId)
            .single();

          if (data?.payment_status === 'approved' || data?.payment_status === 'paid') {
            setPixApproved(true);
            const roomCode = Math.random().toString(36).substring(2, 10).toUpperCase();
            const roomLink = getVirtualRoomUrl(roomCode);
            setVirtualRoomLink(roomLink);
            // Update appointment with room info
            await supabase
              .from("appointments")
              .update({ virtual_room_code: roomCode, virtual_room_link: roomLink })
              .eq("professional_id", professionalId)
              .eq("payment_status", "pending")
              .order("created_at", { ascending: false })
              .limit(1);
            toast.success("Pagamento aprovado!");
            return;
          }
        }

        attempts++;
        setTimeout(poll, 5000);
      } catch (error) {
        console.error("Error polling payment status:", error);
      }
    };

    setTimeout(poll, 5000);
  };

  const handleCopyPix = async () => {
    if (pixData?.pixCode) {
      await navigator.clipboard.writeText(pixData.pixCode);
      setCopied(true);
      toast.success("Código PIX copiado!");
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handlePayWithCard = async () => {
    if (!validateForm()) return;
    if (!service || !professionalId) return;
    
    setIsProcessing(true);
    
    try {
      // Create transaction record
      const { data: transaction, error: txError } = await supabase
        .from("transactions")
        .insert({
          professional_id: professionalId,
          service_id: service.id,
          customer_name: formData.name,
          customer_email: formData.email,
          customer_phone: formData.phone || null,
          customer_cpf: formData.cpf || null,
          amount_cents: service.price_cents,
          payment_method: 'credit_card',
          payment_status: 'pending',
          gateway: gatewayConfig?.gateway || 'mercadopago',
        })
        .select()
        .single();

      if (txError) throw txError;

      // For card payments with configured gateway
      if (gatewayConfig?.accessToken && gatewayConfig?.gateway) {
        toast.info("Para pagamentos com cartão, integração com SDK do gateway é necessária.");
        // In production, you would use the gateway's JS SDK to tokenize the card
        // Then call gateway-payment with action: 'create_card' and the token
      }
      
      // Simulate payment processing for demo
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      await supabase
        .from("transactions")
        .update({ payment_status: 'approved' })
        .eq("id", transaction.id);
      
      toast.success("Pagamento aprovado!");
    } catch (error) {
      console.error("Card payment error:", error);
      toast.error(error instanceof Error ? error.message : "Erro ao processar pagamento");
    } finally {
      setIsProcessing(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: config.backgroundColor }}>
        <Loader2 className="w-8 h-8 animate-spin text-gray-600" />
      </div>
    );
  }

  if (!service) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: config.backgroundColor }}>
        <p className="text-gray-500">Serviço não encontrado</p>
      </div>
    );
  }

  const productName = config.summary?.product_name || service.name;
  const precoAnterior = config.summary?.preco_anterior;
  const productImage = (service.product_config as { image_url?: string })?.image_url;

  return (
    <div className="min-h-screen font-sans" style={{ backgroundColor: config.backgroundColor }}>
      <style>{`
        .checkout-input:focus {
          border-color: ${config.accentColor};
          box-shadow: 0 0 0 3px ${config.accentColor}20;
          outline: none;
        }
        .payment-option {
          transition: all 0.2s ease;
        }
        .payment-option:hover {
          border-color: ${config.accentColor}80;
        }
        .payment-option.selected {
          border-color: ${config.accentColor};
          background-color: ${config.accentColor}08;
        }
      `}</style>

      {/* Timer */}
      {config.timer.enabled && timerSeconds > 0 && (
        <div 
          className={`px-4 py-3 flex items-center justify-center gap-2 z-50 ${config.timer.sticky ? 'sticky top-0' : ''}`}
          style={{ backgroundColor: config.timer.bgcolor, color: config.timer.textcolor }}
        >
          <Clock className="w-4 h-4" />
          <span className="font-semibold">{config.timer.text}</span>
          <span className="font-bold font-mono text-lg w-14 text-center">{formatTimer(timerSeconds)}</span>
        </div>
      )}

      {/* Banners */}
      {config.banners && config.banners.length > 0 && !config.useDynamicBanner && (
        <div className="w-full max-w-4xl mx-auto px-4 pt-4">
          <img src={config.banners[0]} alt="Banner" className="w-full h-auto rounded-lg shadow-md" />
        </div>
      )}

      {/* Dynamic Banner */}
      {config.useDynamicBanner && profile && (
        <div className="w-full max-w-4xl mx-auto px-4 pt-4">
          <div 
            className="relative overflow-hidden rounded-xl shadow-lg p-6"
            style={{
              background: `linear-gradient(135deg, ${config.dynamicBannerColors?.gradientFrom || '#9333ea'}, ${config.dynamicBannerColors?.gradientVia || '#7c3aed'}, ${config.dynamicBannerColors?.gradientTo || '#581c87'})`
            }}
          >
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full overflow-hidden ring-4 ring-white flex-shrink-0">
                {profile.avatar_url ? (
                  <img src={profile.avatar_url} alt={profile.full_name || ''} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-white/20 flex items-center justify-center text-white text-xl font-bold">
                    {(profile.full_name || 'P').charAt(0)}
                  </div>
                )}
              </div>
              <div style={{ color: config.dynamicBannerColors?.textColor || '#ffffff' }}>
                <h2 className="text-xl font-bold">{formatProfessionalName(profile.full_name, profile.gender)}</h2>
                <p className="text-sm opacity-90">{productName}</p>
                {service?.duration_minutes && (
                  <div className="flex items-center gap-1 text-sm opacity-80 mt-1">
                    <Clock className="w-4 h-4" />
                    <span>Sessão de {service.duration_minutes >= 60 ? `${Math.floor(service.duration_minutes / 60)} hora${service.duration_minutes >= 120 ? 's' : ''}` : `${service.duration_minutes} min`}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Presentation Video - Centralized (Capture/Vertical format) */}
      {config.sideBanners && config.sideBanners.length > 0 && config.sideBanners[0] && (
        <div className="w-full max-w-md mx-auto px-4 pt-4">
          {config.sideBanners[0].match(/\.(mp4|webm|mov)($|\?)/i) ? (
            <video 
              src={config.sideBanners[0]} 
              controls
              autoPlay={config.videoSettings?.autoplay || false}
              loop={config.videoSettings?.loop || false}
              muted={config.videoSettings?.autoplay || false}
              playsInline
              className="w-full rounded-lg shadow-md"
              style={{ maxHeight: '400px', objectFit: 'contain' }}
            >
              Seu navegador não suporta vídeos.
            </video>
          ) : (
            <img 
              src={config.sideBanners[0]} 
              alt="Apresentação" 
              className="w-full h-auto rounded-lg shadow-md object-cover"
              style={{ maxHeight: '400px' }}
            />
          )}
        </div>
      )}

      <div className="max-w-5xl mx-auto p-4 lg:p-6">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Left Sidebar - Professional Profile, Calendar & Summary */}
          <aside className="w-full lg:w-[320px] flex-shrink-0 order-1">
            <div className="lg:sticky lg:top-24 space-y-4">
              {/* Professional Profile Card */}
              {profile && (
                <div className="bg-white rounded-xl shadow-lg p-4 space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full overflow-hidden ring-2" style={{ borderColor: config.accentColor }}>
                      {profile.avatar_url ? (
                        <img src={profile.avatar_url} alt={profile.full_name || ''} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-lg font-bold" style={{ backgroundColor: `${config.accentColor}20`, color: config.accentColor }}>
                          {getInitials(profile.full_name)}
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-800 truncate text-sm">{formatProfessionalName(profile.full_name, profile.gender)}</h3>
                      {profile.crp && (
                        <p className="text-xs text-gray-500">CRP: {profile.crp}</p>
                      )}
                    </div>
                    <div className="flex gap-1">
                      {profile.instagram_url && (
                        <a 
                          href={profile.instagram_url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="p-1.5 rounded-full hover:bg-gray-100 transition-colors"
                        >
                          <Instagram className="w-4 h-4 text-gray-500" />
                        </a>
                      )}
                      {profile.linkedin_url && (
                        <a 
                          href={profile.linkedin_url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="p-1.5 rounded-full hover:bg-gray-100 transition-colors"
                        >
                          <Linkedin className="w-4 h-4 text-gray-500" />
                        </a>
                      )}
                    </div>
                  </div>
                  
                  {/* Specialty Tags */}
                  {profile.specialty && (
                    <div className="flex flex-wrap gap-1">
                      {getSpecialtyTags(profile.specialty).map((tag, idx) => (
                        <span 
                          key={idx} 
                          className="text-xs px-2 py-0.5 rounded-full"
                          style={{ backgroundColor: `${config.accentColor}15`, color: config.accentColor }}
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                  
                  {/* Bio */}
                  {profile.bio && (
                    <p className="text-xs text-gray-600 leading-relaxed line-clamp-3">{profile.bio}</p>
                  )}
                </div>
              )}


              {/* Order Summary */}
              <div className="bg-white rounded-xl shadow-lg p-4">
                <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2 text-sm">
                  <ShoppingCart className="w-4 h-4" style={{ color: config.accentColor }} />
                  Resumo
                </h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between text-gray-600">
                    <span className="truncate pr-2">{productName}</span>
                    <span className="font-medium">{formatPrice(service.price_cents)}</span>
                  </div>
                  <hr className="border-gray-100" />
                  <div className="flex justify-between font-bold text-gray-800">
                    <span>Total</span>
                    <span style={{ color: config.accentColor }}>{formatPrice(service.price_cents)}</span>
                  </div>
                </div>
              </div>
            </div>
          </aside>

          {/* Right Column - Product & Checkout Form */}
          <div className="flex-1 order-2">
            <div className="bg-white rounded-xl shadow-lg p-6 md:p-8 space-y-6">
              {/* Product Summary */}
              <section className="flex flex-row items-start gap-4">
                {productImage ? (
                  <img 
                    src={productImage} 
                    alt={productName}
                    className="w-24 h-24 object-cover rounded-lg shadow-md border border-gray-200 flex-shrink-0"
                    onError={(e) => { e.currentTarget.src = 'https://placehold.co/96x96/e2e8f0/334155?text=Serviço'; }}
                  />
                ) : (
                  <div 
                    className="w-24 h-24 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: `${config.accentColor}15` }}
                  >
                    <ShoppingCart className="w-10 h-10" style={{ color: config.accentColor }} />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <h1 className="text-xl font-bold text-gray-800">{productName}</h1>
                  <div className="flex items-baseline flex-wrap gap-x-3 gap-y-1 mt-2">
                    <span className="text-2xl font-bold" style={{ color: config.accentColor }}>
                      {formatPrice(service.price_cents)}
                    </span>
                    {precoAnterior && (
                      <span className="text-lg text-gray-400 line-through">R$ {precoAnterior}</span>
                    )}
                  </div>
                  {config.summary.discount_text && (
                    <span className="inline-block bg-red-100 text-red-600 text-xs font-bold uppercase px-3 py-1 rounded-full mt-2">
                      {config.summary.discount_text}
                    </span>
                  )}
                </div>
              </section>

              <hr className="border-gray-200" />

              {/* Customer Info */}
              <section>
                <div className="flex items-center gap-2.5 mb-4">
                  <User className="w-6 h-6 text-gray-700" />
                  <h2 className="text-xl font-semibold text-gray-800">Seus dados</h2>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Qual é o seu nome completo?</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <User className="w-5 h-5 text-gray-400" />
                      </div>
                      <input 
                        type="text" 
                        className="checkout-input block w-full pl-10 pr-4 py-3 bg-white text-gray-900 border border-gray-300 rounded-lg placeholder-gray-400 text-base transition-all"
                        placeholder="Nome da Silva"
                        value={formData.name}
                        onChange={(e) => handleInputChange('name', e.target.value)}
                        disabled={isPreview}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Qual é o seu e-mail?</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Mail className="w-5 h-5 text-gray-400" />
                      </div>
                      <input 
                        type="email" 
                        className="checkout-input block w-full pl-10 pr-4 py-3 bg-white text-gray-900 border border-gray-300 rounded-lg placeholder-gray-400 text-base transition-all"
                        placeholder="Digite seu e-mail para confirmação"
                        value={formData.email}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                        disabled={isPreview}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {config.customerFields.enable_phone && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Qual é o seu celular?</label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Phone className="w-5 h-5 text-gray-400" />
                          </div>
                          <input 
                            type="tel" 
                            className="checkout-input block w-full pl-10 pr-4 py-3 bg-white text-gray-900 border border-gray-300 rounded-lg placeholder-gray-400 text-base transition-all"
                            placeholder="(11) 99999-9999"
                            value={formData.phone}
                            onChange={(e) => handleInputChange('phone', formatPhone(e.target.value))}
                            maxLength={15}
                            disabled={isPreview}
                          />
                        </div>
                      </div>
                    )}
                    {config.customerFields.enable_cpf && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Qual é o seu CPF?</label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <FileText className="w-5 h-5 text-gray-400" />
                          </div>
                          <input 
                            type="text" 
                            className="checkout-input block w-full pl-10 pr-4 py-3 bg-white text-gray-900 border border-gray-300 rounded-lg placeholder-gray-400 text-base transition-all"
                            placeholder="000.000.000-00"
                            value={formData.cpf}
                            onChange={(e) => handleInputChange('cpf', formatCPF(e.target.value))}
                            maxLength={14}
                            disabled={isPreview}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </section>

              <hr className="border-gray-200" />

              {/* Payment */}
              <section 
                id="payment-section"
                className="transition-all duration-500 rounded-xl"
              >
                <div className="flex items-center gap-2.5 mb-4">
                  <Wallet className="w-6 h-6 text-gray-700" />
                  <h2 className="text-xl font-semibold text-gray-800">Pagamento</h2>
                </div>
                <div className="space-y-3">
                  {config.paymentMethods.pix && (
                    <div 
                      className={`payment-option border-2 rounded-xl p-4 flex items-center gap-4 cursor-pointer ${selectedPayment === 'pix' ? 'selected' : 'border-gray-200'}`}
                      onClick={() => setSelectedPayment('pix')}
                      style={selectedPayment === 'pix' ? { borderColor: config.accentColor, backgroundColor: `${config.accentColor}08` } : {}}
                    >
                      <img 
                        src="https://upload.wikimedia.org/wikipedia/commons/a/a2/Logo%E2%80%94pix_powered_by_Banco_Central_%28Brazil%2C_2020%29.svg" 
                        alt="PIX" 
                        className="h-6 w-auto"
                      />
                      <div className="flex-1">
                        <span className="font-bold text-gray-800">Pix</span>
                        <span className="ml-2 text-xs bg-green-100 text-green-600 px-2 py-0.5 rounded-full font-medium">Aprovação Imediata</span>
                      </div>
                      <div 
                        className={`w-5 h-5 rounded-full border-4 transition-colors ${selectedPayment === 'pix' ? '' : 'border-gray-300'}`}
                        style={selectedPayment === 'pix' ? { borderColor: config.accentColor } : {}}
                      ></div>
                    </div>
                  )}
                  {config.paymentMethods.credit_card && (
                    <div 
                      className={`payment-option border-2 rounded-xl p-4 flex items-center gap-4 cursor-pointer ${selectedPayment === 'credit_card' ? 'selected' : 'border-gray-200'}`}
                      onClick={() => setSelectedPayment('credit_card')}
                      style={selectedPayment === 'credit_card' ? { borderColor: config.accentColor, backgroundColor: `${config.accentColor}08` } : {}}
                    >
                      <CreditCard className="w-6 h-6 text-gray-500" />
                      <span className="font-bold text-gray-800 flex-1">Cartão de Crédito</span>
                      <div 
                        className={`w-5 h-5 rounded-full border-4 transition-colors ${selectedPayment === 'credit_card' ? '' : 'border-gray-300'}`}
                        style={selectedPayment === 'credit_card' ? { borderColor: config.accentColor } : {}}
                      ></div>
                    </div>
                  )}
                </div>

                {/* PIX Info */}
                {selectedPayment === 'pix' && (
                  <div className="mt-4 text-sm text-gray-600 bg-gray-50 p-3 rounded-lg border border-gray-200">
                    <p>• Liberação imediata do acesso.</p>
                    <p>• 100% Seguro.</p>
                  </div>
                )}

                <button
                  className="w-full mt-6 py-4 rounded-xl font-bold text-white text-lg shadow-lg transition-all hover:opacity-90 active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-50"
                  style={{ backgroundColor: selectedPayment === 'pix' ? '#16a34a' : config.accentColor }}
                  disabled={isPreview || isProcessing}
                  onClick={selectedPayment === 'pix' ? handleGeneratePix : handlePayWithCard}
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="w-6 h-6 animate-spin" />
                      {selectedPayment === 'pix' ? 'Gerando PIX...' : 'Processando...'}
                    </>
                  ) : selectedPayment === 'pix' ? (
                    <>
                      <QrCode className="w-6 h-6" />
                      GERAR PIX AGORA
                    </>
                  ) : (
                    'Finalizar Compra'
                  )}
                </button>
              </section>

              <hr className="border-gray-200" />

              {/* Security */}
              <section className="text-center text-sm text-gray-500 space-y-3">
                <p className="font-medium text-gray-600">AcolheAqui está processando este pagamento.</p>
                <div className="flex items-center justify-center gap-6 flex-wrap">
                  <div className="flex items-center gap-1.5">
                    <Shield className="w-4 h-4 text-green-500" />
                    <span>Compra 100% segura</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Lock className="w-4 h-4 text-green-500" />
                    <span>Dados protegidos</span>
                  </div>
                </div>
                <p className="text-gray-400 pt-2 text-xs">Copyright © {new Date().getFullYear()}. Todos os direitos reservados.</p>
              </section>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Footer */}
      <footer className="lg:hidden fixed bottom-0 left-0 right-0 bg-white shadow-lg p-4 border-t border-gray-200 z-40">
        <div className="flex justify-between items-center mb-3">
          <span className="text-lg font-bold text-gray-800">Total a pagar</span>
          <span className="text-2xl font-bold text-green-600">{formatPrice(service.price_cents)}</span>
        </div>
        <p className="text-center text-xs text-gray-500 flex items-center justify-center gap-1">
          <Lock className="w-3 h-3" />
          Compra segura processada pela AcolheAqui
        </p>
      </footer>
      <div className="lg:hidden h-32"></div>

      {/* PIX Modal */}
      {showPixModal && (
        <div 
          className="fixed inset-0 bg-black/70 z-[10000] flex items-center justify-center p-4"
          onClick={() => !pixApproved && setShowPixModal(false)}
        >
          <div 
            className="bg-white rounded-xl shadow-2xl w-full max-w-md animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {!pixApproved ? (
              <div className="p-6 sm:p-8 text-center">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-2">Escaneie para pagar com PIX</h2>
                <p className="text-sm sm:text-base text-gray-600 mb-6">Abra o app do seu banco e aponte a câmera para o QR Code.</p>
                
                <div className="w-full max-w-[260px] sm:max-w-[280px] mx-auto mb-6">
                  <div 
                    className="aspect-square p-2 bg-white border-4 rounded-lg shadow-lg"
                    style={{ borderColor: config.accentColor }}
                  >
                    <img 
                      src={pixData?.qrCode} 
                      alt="PIX QR Code" 
                      className="w-full h-full object-contain rounded-sm"
                    />
                  </div>
                </div>
                
                <p className="text-center text-sm sm:text-base text-gray-600 mb-2">Ou use o PIX Copia e Cola:</p>
                <div className="relative max-w-sm mx-auto">
                  <input 
                    type="text" 
                    readOnly 
                    value={pixData?.pixCode || ''}
                    className="w-full bg-gray-100 p-3 rounded-lg text-xs text-gray-800 pr-24 border border-gray-300"
                  />
                  <button 
                    onClick={handleCopyPix}
                    className="absolute right-1 top-1/2 -translate-y-1/2 px-3 py-1.5 rounded-md text-sm font-semibold text-white transition-colors flex items-center gap-1"
                    style={{ backgroundColor: config.accentColor }}
                  >
                    {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    {copied ? 'Copiado!' : 'Copiar'}
                  </button>
                </div>
                
                <div className="mt-6 flex items-center justify-center gap-3 text-gray-500">
                  <Loader2 className="w-6 h-6 sm:w-8 sm:h-8 animate-spin text-yellow-500" />
                  <span className="font-semibold text-base sm:text-lg">Aguardando pagamento...</span>
                </div>
              </div>
            ) : (
              <div className="p-6 sm:p-8 text-center">
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Check className="w-12 h-12 text-green-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-800 mb-2">Pagamento Aprovado!</h2>
                <p className="text-gray-600">Tudo certo! Você receberá as instruções por e-mail.</p>
              </div>
            )}
            
            <div className="bg-gray-50 p-4 border-t border-gray-200 rounded-b-xl text-center">
              <p className="text-xs text-gray-600">Este pagamento é processado pela <strong className="font-semibold">AcolheAqui</strong>.</p>
            </div>
          </div>
        </div>
      )}

      {/* Sales Notifications */}
      <SalesNotification 
        productName={productName}
        accentColor={config.accentColor}
        enabled={!isPreview}
      />
    </div>
  );
};

export default Checkout;
