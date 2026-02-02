import { useState, useCallback, useEffect } from "react";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { 
  User, 
  Mail, 
  Phone, 
  FileText, 
  CreditCard, 
  Wallet, 
  Clock,
  Lock,
  Shield,
  Copy,
  Check,
  Loader2,
  X,
  QrCode,
  ShoppingCart,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { validateCPF } from "@/lib/validateCPF";
import { getVirtualRoomUrl } from "@/lib/getCanonicalUrl";
import DynamicBannerTemplate from "@/components/dashboard/checkout/DynamicBannerTemplate";
import { formatProfessionalName } from "@/lib/formatProfessionalName";
import AppointmentConfirmationModal from "@/components/checkout/AppointmentConfirmationModal";

interface CheckoutConfig {
  backgroundColor?: string;
  accentColor?: string;
  timer?: {
    enabled?: boolean;
    minutes?: number;
    text?: string;
    bgcolor?: string;
    textcolor?: string;
    sticky?: boolean;
  };
  paymentMethods?: {
    credit_card?: boolean;
    pix?: boolean;
    boleto?: boolean;
  };
  customerFields?: {
    enable_cpf?: boolean;
    enable_phone?: boolean;
  };
  summary?: {
    product_name?: string;
    discount_text?: string;
    preco_anterior?: string;
  };
  banners?: string[];
  useDynamicBanner?: boolean;
  dynamicBannerColors?: {
    gradientFrom?: string;
    gradientVia?: string;
    gradientTo?: string;
    textColor?: string;
  };
  header?: {
    enabled?: boolean;
    title?: string;
    subtitle?: string;
  };
}

interface Service {
  id: string;
  name: string;
  description: string | null;
  duration_minutes: number;
  price_cents: number;
  checkout_config?: CheckoutConfig | null;
}

interface Profile {
  id: string;
  full_name: string | null;
  gender?: 'male' | 'female' | 'other' | null;
  avatar_url: string | null;
  is_demo?: boolean;
}

interface GatewayConfig {
  accessToken: string;
  gateway: string;
}

interface CheckoutOverlayProps {
  open: boolean;
  onClose: () => void;
  service: Service;
  profile: Profile;
  selectedDate: Date;
  selectedTime: string;
  accentColor?: string;
  gatewayConfig?: GatewayConfig | null;
}

interface FormData {
  name: string;
  email: string;
  phone: string;
  cpf: string;
}

const defaultConfig: CheckoutConfig = {
  backgroundColor: "#f3f4f6",
  accentColor: "#5521ea",
  timer: { enabled: false, minutes: 15, text: "Esta oferta expira em:", bgcolor: "#ef4444", textcolor: "#ffffff", sticky: true },
  paymentMethods: { credit_card: true, pix: true, boleto: false },
  customerFields: { enable_cpf: true, enable_phone: true },
  summary: { product_name: "", discount_text: "", preco_anterior: "" },
  banners: [],
  useDynamicBanner: false,
  dynamicBannerColors: {
    gradientFrom: "#9333ea",
    gradientVia: "#7c3aed",
    gradientTo: "#581c87",
    textColor: "#ffffff",
  },
};

const CheckoutOverlay = ({ 
  open, 
  onClose, 
  service,
  profile,
  selectedDate,
  selectedTime,
  accentColor = "#dc2626",
  gatewayConfig
}: CheckoutOverlayProps) => {
  // Merge service checkout_config with defaults
  const config: CheckoutConfig = {
    ...defaultConfig,
    ...service.checkout_config,
    accentColor: service.checkout_config?.accentColor || accentColor,
  };

  const [selectedPayment, setSelectedPayment] = useState<'pix' | 'credit_card'>('pix');
  const [formData, setFormData] = useState<FormData>({ name: '', email: '', phone: '', cpf: '' });
  const [isProcessing, setIsProcessing] = useState(false);
  const [showPixModal, setShowPixModal] = useState(false);
  const [pixData, setPixData] = useState<{ qrCode: string; pixCode: string; paymentId?: string } | null>(null);
  const [pixApproved, setPixApproved] = useState(false);
  const [copied, setCopied] = useState(false);
  const [currentBannerIndex, setCurrentBannerIndex] = useState(0);
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);
  const [meetLink, setMeetLink] = useState<string | null>(null);
  const [virtualRoomLink, setVirtualRoomLink] = useState<string | null>(null);
  const [showDemoBlocker, setShowDemoBlocker] = useState(false);

  const isDemo = profile.is_demo === true;

  const banners = config.banners || [];
  const productName = config.summary?.product_name || service.name;
  const effectiveAccent = config.accentColor || accentColor;

  // Timer with localStorage persistence
  useEffect(() => {
    if (!config.timer?.enabled || !open) return;
    
    const storageKey = `checkoutTimer_${service.id}`;
    const storedEndTime = localStorage.getItem(storageKey);
    
    let endTime: number;
    if (storedEndTime && !isNaN(Number(storedEndTime))) {
      endTime = Number(storedEndTime);
    } else {
      endTime = Date.now() + ((config.timer.minutes || 15) * 60 * 1000);
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
  }, [config.timer?.enabled, config.timer?.minutes, service.id, open]);

  // Auto-rotate banners
  useEffect(() => {
    if (banners.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentBannerIndex((prev) => (prev + 1) % banners.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [banners.length]);

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const formatPrice = (cents: number) => {
    return (cents / 100).toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
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
    if (config.customerFields?.enable_phone && !formData.phone.trim()) {
      toast.error("Por favor, preencha seu telefone.");
      return false;
    }
    if (config.customerFields?.enable_cpf) {
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

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleCopyPix = async () => {
    if (pixData?.pixCode) {
      await navigator.clipboard.writeText(pixData.pixCode);
      setCopied(true);
      toast.success("Código PIX copiado!");
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // Create appointment, sync with Google Calendar, and send notifications
  const createAppointmentAndNotify = async (transactionId: string, paymentMethod: string) => {
    try {
      const appointmentDateStr = selectedDate.toISOString().split('T')[0];
      
      // Generate virtual room link
      const roomCode = Math.random().toString(36).substring(2, 10).toUpperCase();
      const roomLink = getVirtualRoomUrl(roomCode);
      
      const { data: appointment, error: apptError } = await supabase
        .from("appointments")
        .insert({
          professional_id: profile.id,
          client_name: formData.name,
          client_email: formData.email,
          client_phone: formData.phone || null,
          appointment_date: appointmentDateStr,
          appointment_time: selectedTime,
          duration_minutes: service.duration_minutes,
          session_type: 'individual',
          status: 'confirmed',
          payment_status: 'paid',
          payment_method: paymentMethod,
          amount_cents: service.price_cents,
          virtual_room_code: roomCode,
          virtual_room_link: roomLink,
        })
        .select()
        .single();

      if (apptError) {
        console.error("Error creating appointment:", apptError);
        return null;
      }

      console.log("Appointment created:", appointment?.id);
      setVirtualRoomLink(roomLink);

      // Create access token for rescheduling
      let accessToken: string | null = null;
      try {
        const { data: tokenData, error: tokenError } = await supabase
          .from("appointment_access_tokens")
          .insert({
            appointment_id: appointment.id,
            client_email: formData.email,
          })
          .select("token")
          .single();
        
        if (!tokenError && tokenData) {
          accessToken = tokenData.token;
          console.log("Access token created for rescheduling");
        }
      } catch (tokenErr) {
        console.log("Could not create access token:", tokenErr);
      }

      // Try to sync with Google Calendar and get Meet link
      let googleMeetLink: string | null = null;
      try {
        const { data: syncResult, error: syncError } = await supabase.functions.invoke('google-calendar-sync', {
          body: {
            action: 'sync-appointment',
            professionalId: profile.id,
            appointmentId: appointment.id,
          },
        });

        if (!syncError && syncResult?.meetLink) {
          googleMeetLink = syncResult.meetLink;
          setMeetLink(googleMeetLink);
          
          // Update appointment with Meet link
          await supabase
            .from("appointments")
            .update({ virtual_room_link: googleMeetLink })
            .eq("id", appointment.id);
            
          console.log("Google Meet link created:", googleMeetLink);
        }
      } catch (calendarError) {
        console.log("Google Calendar not connected or sync failed:", calendarError);
      }

      // Send notifications with access token for rescheduling
      try {
        await supabase.functions.invoke('send-appointment-notification', {
          body: {
            professionalId: profile.id,
            clientName: formData.name,
            clientEmail: formData.email,
            clientPhone: formData.phone || '',
            appointmentDate: appointmentDateStr,
            appointmentTime: selectedTime,
            serviceName: service.name,
            amountCents: service.price_cents,
            virtualRoomLink: googleMeetLink || roomLink,
            accessToken: accessToken,
          },
        });
        console.log("Notification sent successfully");
      } catch (notifError) {
        console.error("Error sending notification:", notifError);
      }

      return appointment;
    } catch (error) {
      console.error("Error in createAppointmentAndNotify:", error);
      return null;
    }
  };

  // Poll payment status from gateway
  const pollPaymentStatus = async (
    paymentId: string, 
    transactionId: string, 
    gateway: string, 
    accessToken: string
  ): Promise<boolean> => {
    const maxAttempts = 60; // 5 minutes (60 * 5 seconds)
    let attempts = 0;

    while (attempts < maxAttempts) {
      try {
        const response = await supabase.functions.invoke('gateway-payment', {
          body: {
            gateway,
            action: 'check_status',
            accessToken,
            paymentId,
          },
        });

        if (response.data?.status === 'approved') {
          // Update transaction to approved
          await supabase
            .from("transactions")
            .update({ payment_status: 'approved' })
            .eq("id", transactionId);
          
          return true;
        }

        // If rejected/failed, stop polling
        if (['rejected', 'cancelled', 'failed'].includes(response.data?.status)) {
          await supabase
            .from("transactions")
            .update({ payment_status: 'rejected' })
            .eq("id", transactionId);
          
          return false;
        }

        // Wait 5 seconds before next poll
        await new Promise(resolve => setTimeout(resolve, 5000));
        attempts++;
      } catch (error) {
        console.error("Error polling payment status:", error);
        await new Promise(resolve => setTimeout(resolve, 5000));
        attempts++;
      }
    }

    return false;
  };

  const handleGeneratePix = async () => {
    if (!validateForm()) return;
    
    // Block demo profiles at payment
    if (isDemo) {
      setShowDemoBlocker(true);
      return;
    }
    
    setIsProcessing(true);
    
    try {
      const { data: transaction, error: txError } = await supabase
        .from("transactions")
        .insert({
          professional_id: profile.id,
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
        setIsProcessing(false);

        // Start polling for payment confirmation from gateway
        const isApproved = await pollPaymentStatus(
          result.payment_id,
          transaction.id,
          gatewayConfig.gateway,
          gatewayConfig.accessToken
        );

        if (isApproved) {
          // Create appointment and get links AFTER real payment confirmation
          await createAppointmentAndNotify(transaction.id, 'pix');
          
          setPixApproved(true);
          toast.success("Pagamento aprovado!");
          
          // Wait for user to see the approval message, then show confirmation modal
          setTimeout(() => {
            setShowPixModal(false);
            setShowConfirmationModal(true);
          }, 2500);
        } else {
          toast.error("Pagamento não confirmado. Tente novamente.");
          setShowPixModal(false);
        }
      } else {
        // Demo mode: Generate mock PIX code
        const mockPixCode = `00020126580014br.gov.bcb.pix0136${Date.now()}5204000053039865404${(service.price_cents / 100).toFixed(2)}5802BR5925ACOLHEAQUI6009SAO PAULO62070503***6304`;
        
        setPixData({
          qrCode: `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(mockPixCode)}`,
          pixCode: mockPixCode,
        });
        
        // Show PIX modal - in demo mode with no gateway, simulate after 15 seconds
        setShowPixModal(true);
        setIsProcessing(false);
        
        // In demo mode, simulate payment confirmation after 15 seconds
        setTimeout(async () => {
          await supabase
            .from("transactions")
            .update({ payment_status: 'approved' })
            .eq("id", transaction.id);
          
          await createAppointmentAndNotify(transaction.id, 'pix');
          
          setPixApproved(true);
          toast.success("Pagamento aprovado!");
          
          setTimeout(() => {
            setShowPixModal(false);
            setShowConfirmationModal(true);
          }, 2500);
        }, 15000);
      }
    } catch (error) {
      console.error("PIX generation error:", error);
      toast.error(error instanceof Error ? error.message : "Erro ao gerar PIX");
      setIsProcessing(false);
    }
  };

  const handlePayWithCard = async () => {
    if (!validateForm()) return;
    
    // Block demo profiles at payment
    if (isDemo) {
      setShowDemoBlocker(true);
      return;
    }
    
    setIsProcessing(true);
    
    try {
      const { data: transaction, error: txError } = await supabase
        .from("transactions")
        .insert({
          professional_id: profile.id,
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

      await new Promise(resolve => setTimeout(resolve, 2000));
      
      await supabase
        .from("transactions")
        .update({ payment_status: 'approved' })
        .eq("id", transaction.id);
      
      await createAppointmentAndNotify(transaction.id, 'credit_card');
      
      toast.success("Pagamento aprovado!");
      setShowConfirmationModal(true);
    } catch (error) {
      console.error("Card payment error:", error);
      toast.error(error instanceof Error ? error.message : "Erro ao processar pagamento");
    } finally {
      setIsProcessing(false);
    }
  };

  const nextBanner = () => {
    setCurrentBannerIndex((prev) => (prev + 1) % banners.length);
  };

  const prevBanner = () => {
    setCurrentBannerIndex((prev) => (prev - 1 + banners.length) % banners.length);
  };

  // PIX Modal - Shows QR Code for payment
  // Important: This modal stays open until user closes it or payment is approved
  if (showPixModal && pixData) {
    return (
      <Dialog open={open} onOpenChange={(open) => {
        if (!open && !pixApproved) {
          // Allow closing only if not in the middle of showing approved state
          setShowPixModal(false);
        }
      }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-center">
              {pixApproved ? "Pagamento Aprovado! ✓" : "Escaneie o QR Code para pagar"}
            </DialogTitle>
          </DialogHeader>
          
          <div className="flex flex-col items-center py-4">
            {!pixApproved && (
              <>
                <img src={pixData.qrCode} alt="QR Code PIX" className="w-48 h-48 rounded-lg mb-4" />
                
                <div className="w-full p-3 bg-gray-100 rounded-lg mb-4">
                  <p className="text-xs text-gray-500 mb-1">Código PIX (copie e cole)</p>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={pixData.pixCode}
                      readOnly
                      className="flex-1 text-xs bg-transparent border-none outline-none text-gray-900"
                    />
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={handleCopyPix}
                      className="flex-shrink-0"
                    >
                      {copied ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
                    </Button>
                  </div>
                </div>
                
                <div className="flex items-center gap-2 text-amber-600 bg-amber-50 p-3 rounded-lg w-full mb-4">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <p className="text-sm">Aguardando confirmação do pagamento...</p>
                </div>
                
                <p className="text-xs text-gray-400 text-center">
                  O pagamento será confirmado automaticamente após a transferência PIX.
                </p>
              </>
            )}

            {pixApproved && (
              <div className="text-center py-4">
                <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4 animate-pulse">
                  <Check className="w-10 h-10 text-green-600" />
                </div>
                <p className="text-lg text-green-600 font-bold mb-2">Pagamento Confirmado!</p>
                <p className="text-sm text-gray-500">
                  Preparando seu agendamento...
                </p>
                <div className="mt-4">
                  <Loader2 className="w-5 h-5 animate-spin mx-auto text-gray-400" />
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={(open) => !open && onClose()}>
      <DialogContent 
        className="max-w-2xl max-h-[95vh] overflow-hidden p-0"
        style={{ backgroundColor: config.backgroundColor }}
      >
        {/* Timer */}
        {config.timer?.enabled && timerSeconds > 0 && (
          <div 
            className="px-4 py-3 flex items-center justify-center gap-2"
            style={{ backgroundColor: config.timer.bgcolor, color: config.timer.textcolor }}
          >
            <Clock className="w-4 h-4" />
            <span className="text-sm font-medium">{config.timer.text}</span>
            <span className="font-bold font-mono">{formatTimer(timerSeconds)}</span>
          </div>
        )}

        <div className="overflow-y-auto max-h-[calc(95vh-60px)] p-4">
          {/* Dynamic Banner */}
          {config.useDynamicBanner && (
            <div className="mb-4">
              <DynamicBannerTemplate
                professionalName={formatProfessionalName(profile.full_name, profile.gender)}
                professionalAvatar={profile.avatar_url}
                serviceName={productName}
                serviceDuration={service.duration_minutes}
                gradientFrom={config.dynamicBannerColors?.gradientFrom}
                gradientVia={config.dynamicBannerColors?.gradientVia}
                gradientTo={config.dynamicBannerColors?.gradientTo}
                textColor={config.dynamicBannerColors?.textColor}
              />
            </div>
          )}


          {/* Main Banners (only if not using dynamic banner) */}
          {!config.useDynamicBanner && banners.length > 0 && (
            <div className="relative mb-4">
              <div className="relative overflow-hidden rounded-lg shadow-md">
                <img 
                  src={banners[currentBannerIndex]} 
                  alt={`Banner ${currentBannerIndex + 1}`} 
                  className="w-full h-32 object-cover transition-all duration-300"
                />
                {banners.length > 1 && (
                  <>
                    <button
                      onClick={prevBanner}
                      className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full p-1.5 transition-colors"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <button
                      onClick={nextBanner}
                      className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full p-1.5 transition-colors"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                    <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
                      {banners.map((_, idx) => (
                        <button
                          key={idx}
                          onClick={() => setCurrentBannerIndex(idx)}
                          className={`w-2 h-2 rounded-full transition-colors ${
                            idx === currentBannerIndex ? 'bg-white' : 'bg-white/50'
                          }`}
                        />
                      ))}
                    </div>
                  </>
                )}
              </div>
            </div>
          )}

          {/* Header */}
          {config.header?.enabled && (
            <div 
              className="px-6 py-4 text-center rounded-lg mb-4"
              style={{ backgroundColor: effectiveAccent }}
            >
              <h1 className="text-xl font-bold text-white">{config.header.title}</h1>
              <p className="text-white/80 text-sm mt-1 flex items-center justify-center gap-1">
                <Shield className="w-3 h-3" />
                {config.header.subtitle}
              </p>
            </div>
          )}

          {/* Product Summary */}
          <div className="bg-white rounded-lg p-4 shadow-sm mb-4">
            <div className="flex items-start gap-3">
              <div 
                className="w-16 h-16 rounded-lg flex items-center justify-center flex-shrink-0"
                style={{ backgroundColor: `${effectiveAccent}20` }}
              >
                <ShoppingCart className="w-6 h-6" style={{ color: effectiveAccent }} />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-800">{productName}</h3>
                {config.summary?.discount_text && (
                  <span className="inline-block bg-red-100 text-red-600 text-xs font-bold px-2 py-0.5 rounded-full mt-1">
                    {config.summary.discount_text}
                  </span>
                )}
                <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
                  <Clock className="w-4 h-4" />
                  <span>{service.duration_minutes} minutos</span>
                </div>
                <p 
                  className="text-xl font-bold mt-2"
                  style={{ color: effectiveAccent }}
                >
                  {formatPrice(service.price_cents)}
                </p>
              </div>
            </div>
            
            {/* Date/Time Selected */}
            <div className="mt-3 pt-3 border-t border-gray-100 text-sm text-gray-600">
              📅 {selectedDate.toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long' })} às {selectedTime}
            </div>
          </div>

          {/* Customer Info */}
          <div className="bg-white rounded-lg p-4 shadow-sm space-y-3 mb-4">
            <h4 className="font-semibold text-gray-700 flex items-center gap-2">
              <User className="w-4 h-4" />
              Seus dados
            </h4>
            <div className="space-y-3">
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input 
                  type="text" 
                  placeholder="Nome completo" 
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  className="w-full pl-10 pr-3 py-3 text-sm text-gray-900 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:border-transparent outline-none"
                  style={{ '--tw-ring-color': effectiveAccent } as React.CSSProperties}
                />
              </div>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input 
                  type="email" 
                  placeholder="E-mail" 
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className="w-full pl-10 pr-3 py-3 text-sm text-gray-900 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:border-transparent outline-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                {config.customerFields?.enable_phone !== false && (
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input 
                      type="tel" 
                      placeholder="Telefone" 
                      value={formData.phone}
                      onChange={(e) => handleInputChange('phone', formatPhone(e.target.value))}
                      className="w-full pl-10 pr-3 py-3 text-sm text-gray-900 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:border-transparent outline-none"
                    />
                  </div>
                )}
{config.customerFields?.enable_cpf !== false && (
                  <div className="relative">
                    <FileText className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input 
                      type="text" 
                      placeholder="CPF" 
                      value={formData.cpf}
                      onChange={(e) => handleInputChange('cpf', formatCPF(e.target.value))}
                      className="w-full pl-10 pr-3 py-3 text-sm text-gray-900 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:border-transparent outline-none"
                      maxLength={14}
                    />
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Payment Methods */}
          <div className="bg-white rounded-lg p-4 shadow-sm space-y-3 mb-4">
            <h4 className="font-semibold text-gray-700 flex items-center gap-2">
              <CreditCard className="w-4 h-4" />
              Pagamento
            </h4>
            <div className="space-y-2">
              {config.paymentMethods?.pix !== false && (
                <button
                  onClick={() => setSelectedPayment('pix')}
                  className="w-full border-2 rounded-lg p-3 flex items-center gap-3 transition-all"
                  style={{ 
                    borderColor: selectedPayment === 'pix' ? effectiveAccent : '#e5e7eb',
                    backgroundColor: selectedPayment === 'pix' ? `${effectiveAccent}10` : 'transparent'
                  }}
                >
                  <QrCode className="w-5 h-5" style={{ color: selectedPayment === 'pix' ? effectiveAccent : '#9ca3af' }} />
                  <span className={`font-medium ${selectedPayment === 'pix' ? 'text-gray-800' : 'text-gray-600'}`}>Pix</span>
                  {selectedPayment === 'pix' && (
                    <span className="ml-auto text-xs bg-green-100 text-green-600 px-2 py-0.5 rounded-full">Aprovação Imediata</span>
                  )}
                </button>
              )}
              {config.paymentMethods?.credit_card !== false && (
                <button
                  onClick={() => setSelectedPayment('credit_card')}
                  className="w-full border-2 rounded-lg p-3 flex items-center gap-3 transition-all"
                  style={{ 
                    borderColor: selectedPayment === 'credit_card' ? effectiveAccent : '#e5e7eb',
                    backgroundColor: selectedPayment === 'credit_card' ? `${effectiveAccent}10` : 'transparent'
                  }}
                >
                  <CreditCard className="w-5 h-5" style={{ color: selectedPayment === 'credit_card' ? effectiveAccent : '#9ca3af' }} />
                  <span className={`font-medium ${selectedPayment === 'credit_card' ? 'text-gray-800' : 'text-gray-600'}`}>Cartão de Crédito</span>
                </button>
              )}
              {config.paymentMethods?.boleto && (
                <button
                  className="w-full border rounded-lg p-3 flex items-center gap-3 opacity-50 cursor-not-allowed"
                >
                  <FileText className="w-5 h-5 text-gray-400" />
                  <span className="font-medium text-gray-600">Boleto</span>
                  <span className="ml-auto text-xs text-gray-400">Em breve</span>
                </button>
              )}
            </div>
          </div>

          {/* CTA Button */}
          <Button
            onClick={selectedPayment === 'pix' ? handleGeneratePix : handlePayWithCard}
            disabled={isProcessing}
            className="w-full h-14 text-base font-bold shadow-lg"
            style={{ backgroundColor: effectiveAccent }}
          >
            {isProcessing ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : selectedPayment === 'pix' ? (
              <>
                <QrCode className="w-5 h-5 mr-2" />
                Finalizar com PIX
              </>
            ) : (
              <>
                <CreditCard className="w-5 h-5 mr-2" />
                Pagar com Cartão
              </>
            )}
          </Button>

          {/* Security Footer */}
          <div className="text-center text-xs text-gray-500 space-y-2 pt-4">
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
      </DialogContent>

      {/* Appointment Confirmation Modal */}
      <AppointmentConfirmationModal
        open={showConfirmationModal}
        onClose={() => {
          setShowConfirmationModal(false);
          onClose();
        }}
        professional={{
          full_name: profile.full_name,
          gender: profile.gender,
          avatar_url: profile.avatar_url,
        }}
        appointmentDetails={{
          date: selectedDate,
          time: selectedTime,
          serviceName: service.name,
          duration: service.duration_minutes,
          clientName: formData.name,
          clientEmail: formData.email,
          meetLink: meetLink,
          virtualRoomLink: virtualRoomLink,
        }}
      />

      {/* Demo Blocker Modal */}
      <Dialog open={showDemoBlocker} onOpenChange={setShowDemoBlocker}>
        <DialogContent className="max-w-md text-center">
          <div className="py-6">
            <div className="w-16 h-16 rounded-full bg-amber-100 flex items-center justify-center mx-auto mb-4">
              <Shield className="w-8 h-8 text-amber-600" />
            </div>
            <DialogTitle className="text-xl font-bold mb-2">
              Perfil de Demonstração
            </DialogTitle>
            <p className="text-gray-600 mb-6">
              Este é um perfil demonstrativo para você conhecer todas as funcionalidades da plataforma. 
              Para agendar uma consulta real, acesse o perfil de um profissional verificado.
            </p>
            <div className="flex gap-3 justify-center">
              <Button variant="outline" onClick={() => setShowDemoBlocker(false)}>
                Continuar Explorando
              </Button>
              <Button 
                onClick={() => window.location.href = 'https://www.acolheaqui.com.br/psicoterapeutas'}
                style={{ backgroundColor: effectiveAccent }}
              >
                Ver Profissionais
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </Dialog>
  );
};

export default CheckoutOverlay;
