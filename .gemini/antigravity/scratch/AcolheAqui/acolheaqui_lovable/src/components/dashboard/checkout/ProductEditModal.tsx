import { useState, useRef, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Loader2, Save, Upload, X, FileText, Bell, MessageSquare, Mail, Smartphone, Link, Brain, Package, Plus, GraduationCap, CalendarDays, Infinity, Clock, RefreshCw } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import mercadopagoLogo from "@/assets/gateway-mercadopago.png";
import stripeLogo from "@/assets/gateway-stripe.svg";
import pagarmeLogo from "@/assets/gateway-pagarme.png";
import pagseguroLogo from "@/assets/gateway-pagseguro.png";
import pushinpayLogo from "@/assets/gateway-pushinpay.png";

interface NotificationConfig {
  whatsapp: boolean;
  email: boolean;
  sms: boolean;
  redirect: boolean;
  redirect_url?: string;
}

interface SessionPackage {
  sessions: number;
  discount_percent: number;
  price_cents: number;
}

interface MemberAccessConfig {
  access_type: "lifetime" | "period" | "subscription";
  duration_months?: number;
}

interface ProductConfig {
  delivery_type: "none" | "pdf" | "link";
  pdf_url?: string;
  pdf_name?: string;
  redirect_url?: string;
  notifications?: NotificationConfig;
  is_package?: boolean;
  package_sessions?: number;
  package_discount_percent?: number;
  session_packages?: SessionPackage[];
}

type ServiceType = "session" | "members_area";

interface ProductEditModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  service: {
    id?: string;
    name: string;
    description: string;
    price_cents: number;
    duration_minutes: number;
    is_active: boolean;
    product_config?: ProductConfig;
    image_url?: string;
    service_type?: ServiceType;
    member_access_config?: MemberAccessConfig;
  } | null;
  profileId: string;
  userId: string;
  gatewayType: string;
  onSave: () => void;
}

const normalizeGatewayId = (gateway?: string | null) => {
  if (!gateway) return "pushinpay";
  if (gateway === "mercado_pago") return "mercadopago";
  return gateway;
};

const PROVIDER_IDS = [
  "mercadopago",
  "mercado_pago", // legacy alias used in older UI
  "pushinpay",
  "pagarme",
  "pagseguro",
  "stripe",
  "asaas",
] as const;

const PROVIDER_OR_FILTER = `gateway_type.in.(${PROVIDER_IDS.join(",")}),card_gateway.in.(${PROVIDER_IDS.join(",")})`;

const ProductEditModal = ({
  open,
  onOpenChange,
  service,
  profileId,
  userId,
  gatewayType,
  onSave,
}: ProductEditModalProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingPdf, setIsUploadingPdf] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  const [name, setName] = useState(service?.name || "");
  const [description, setDescription] = useState(service?.description || "");
  const [priceCents, setPriceCents] = useState(service?.price_cents || 0);
  const [durationMinutes, setDurationMinutes] = useState(service?.duration_minutes || 50);
  const [deliveryType, setDeliveryType] = useState<"none" | "pdf" | "link">(
    service?.product_config?.delivery_type || "none"
  );
  const [pdfUrl, setPdfUrl] = useState(service?.product_config?.pdf_url || "");
  const [pdfName, setPdfName] = useState(service?.product_config?.pdf_name || "");
  const [imageUrl, setImageUrl] = useState(service?.image_url || "");
  const [selectedGateway, setSelectedGateway] = useState(normalizeGatewayId(gatewayType));
  // Notification options
  const [notifyWhatsapp, setNotifyWhatsapp] = useState(service?.product_config?.notifications?.whatsapp ?? true);
  const [notifyEmail, setNotifyEmail] = useState(service?.product_config?.notifications?.email ?? true);
  const [notifySms, setNotifySms] = useState(service?.product_config?.notifications?.sms ?? false);
  const [notifyRedirect, setNotifyRedirect] = useState(service?.product_config?.notifications?.redirect ?? false);
  const [notifyRedirectUrl, setNotifyRedirectUrl] = useState(service?.product_config?.notifications?.redirect_url || "");
  
  // Session package options
  const [isPackage, setIsPackage] = useState(service?.product_config?.is_package ?? false);
  const [packageSessions, setPackageSessions] = useState(service?.product_config?.package_sessions ?? 4);
  const [packageDiscountPercent, setPackageDiscountPercent] = useState(service?.product_config?.package_discount_percent ?? 10);
  const [sessionPackages, setSessionPackages] = useState<SessionPackage[]>(
    service?.product_config?.session_packages ?? []
  );

  // Service type and member access options
  const [serviceType, setServiceType] = useState<ServiceType>(service?.service_type ?? "session");
  const [accessType, setAccessType] = useState<"lifetime" | "period" | "subscription">(
    service?.member_access_config?.access_type ?? "lifetime"
  );
  const [accessDurationMonths, setAccessDurationMonths] = useState(
    service?.member_access_config?.duration_months ?? 12
  );

  // Reset form when service changes
  useEffect(() => {
    if (service) {
      setName(service.name);
      setDescription(service.description);
      setPriceCents(service.price_cents);
      setDurationMinutes(service.duration_minutes || 50);
      setDeliveryType(service.product_config?.delivery_type || "none");
      setPdfUrl(service.product_config?.pdf_url || "");
      setPdfName(service.product_config?.pdf_name || "");
      setImageUrl(service.image_url || "");
      setNotifyWhatsapp(service.product_config?.notifications?.whatsapp ?? true);
      setNotifyEmail(service.product_config?.notifications?.email ?? true);
      setNotifySms(service.product_config?.notifications?.sms ?? false);
      setNotifyRedirect(service.product_config?.notifications?.redirect ?? false);
      setNotifyRedirectUrl(service.product_config?.notifications?.redirect_url || "");
      setIsPackage(service.product_config?.is_package ?? false);
      setPackageSessions(service.product_config?.package_sessions ?? 4);
      setPackageDiscountPercent(service.product_config?.package_discount_percent ?? 10);
      setSessionPackages(service.product_config?.session_packages ?? []);
      setServiceType(service.service_type ?? "session");
      setAccessType(service.member_access_config?.access_type ?? "lifetime");
      setAccessDurationMonths(service.member_access_config?.duration_months ?? 12);
    }
  }, [service]);

  // Fetch the active gateway from database when modal opens
  useEffect(() => {
    if (!open || !profileId) return;
    
    const fetchActiveGateway = async () => {
      const { data: gatewayData } = await supabase
        .from("payment_gateways")
        .select("gateway_type")
        .eq("professional_id", profileId)
        .eq("is_active", true)
        .maybeSingle();
      
      if (gatewayData) {
        setSelectedGateway(normalizeGatewayId(gatewayData.gateway_type));
      } else {
        setSelectedGateway(normalizeGatewayId(gatewayType));
      }
    };
    
    fetchActiveGateway();
  }, [open, profileId, gatewayType]);

  const formatPrice = (cents: number) => {
    return (cents / 100).toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
  };

  const handlePriceChange = (value: string) => {
    const numericValue = value.replace(/\D/g, "");
    setPriceCents(parseInt(numericValue) || 0);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Por favor, selecione uma imagem válida");
      return;
    }

    setIsUploadingImage(true);
    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `${userId}/${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("checkout-public")
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from("checkout-public")
        .getPublicUrl(fileName);

      setImageUrl(publicUrl);
      toast.success("Imagem enviada com sucesso!");
    } catch (error) {
      console.error("Error uploading image:", error);
      toast.error("Erro ao enviar imagem");
    } finally {
      setIsUploadingImage(false);
    }
  };

  const handlePdfUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== "application/pdf") {
      toast.error("Por favor, selecione um arquivo PDF");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast.error("O arquivo deve ter no máximo 10MB");
      return;
    }

    setIsUploadingPdf(true);
    try {
      const fileName = `${userId}/${Date.now()}_${file.name}`;

      const { error: uploadError } = await supabase.storage
        .from("checkout-private")
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from("checkout-private")
        .getPublicUrl(fileName);

      setPdfUrl(publicUrl);
      setPdfName(file.name);
      toast.success("PDF enviado com sucesso!");
    } catch (error) {
      console.error("Error uploading PDF:", error);
      toast.error("Erro ao enviar PDF");
    } finally {
      setIsUploadingPdf(false);
    }
  };

  const handleSave = async () => {
    if (!name.trim()) {
      toast.error("Nome do serviço é obrigatório");
      return;
    }

    if (priceCents <= 0) {
      toast.error("Preço deve ser maior que zero");
      return;
    }

    setIsSaving(true);

    const productConfig = {
      notifications: {
        whatsapp: notifyWhatsapp,
        email: notifyEmail,
        sms: notifySms,
        redirect: notifyRedirect,
        redirect_url: notifyRedirectUrl,
      },
      is_package: isPackage,
      package_sessions: isPackage ? packageSessions : undefined,
      package_discount_percent: isPackage ? packageDiscountPercent : undefined,
      session_packages: sessionPackages.length > 0 ? sessionPackages : undefined,
      ...(deliveryType === "pdf" && { pdf_url: pdfUrl, pdf_name: pdfName }),
    };

    try {
      // Normalize gateway ID before saving
      const normalizedGateway = normalizeGatewayId(selectedGateway);
      
      // First, deactivate all existing gateways for this professional
      await supabase
        .from("payment_gateways")
        .update({ is_active: false })
        .eq("professional_id", profileId);

      // Check if gateway with this type already exists
      const { data: existingGateways } = await supabase
        .from("payment_gateways")
        .select("id, gateway_type")
        .eq("professional_id", profileId)
        .eq("gateway_type", normalizedGateway);

      if (existingGateways && existingGateways.length > 0) {
        // Update existing gateway to active
        const { error: updateError } = await supabase
          .from("payment_gateways")
          .update({ is_active: true })
          .eq("id", existingGateways[0].id);
        
        if (updateError) {
          console.error("Error updating gateway:", updateError);
          throw updateError;
        }
      } else {
        // Create new gateway
        const { error: insertError } = await supabase.from("payment_gateways").insert({
          professional_id: profileId,
          gateway_type: normalizedGateway,
          is_active: true,
        });
        
        if (insertError) {
          console.error("Error inserting gateway:", insertError);
          throw insertError;
        }
      }

      // Prepare member access config
      const memberAccessConfig = serviceType === "members_area" ? {
        access_type: accessType,
        duration_months: accessType === "period" || accessType === "subscription" ? accessDurationMonths : undefined,
      } : {};

      if (service?.id) {
        const { error } = await supabase
          .from("services")
          .update({
            name,
            description,
            price_cents: priceCents,
            duration_minutes: durationMinutes,
            service_type: serviceType,
            product_config: JSON.parse(JSON.stringify({ ...productConfig, image_url: imageUrl })),
            member_access_config: memberAccessConfig,
          })
          .eq("id", service.id);

        if (error) throw error;
        toast.success("Serviço atualizado com sucesso!");
      } else {
        const { error } = await supabase.from("services").insert([{
          professional_id: profileId,
          name,
          description,
          price_cents: priceCents,
          duration_minutes: durationMinutes,
          is_active: true,
          service_type: serviceType,
          product_config: JSON.parse(JSON.stringify({ ...productConfig, image_url: imageUrl })),
          member_access_config: memberAccessConfig,
        }]);

        if (error) throw error;
        toast.success("Serviço criado com sucesso!");
      }

      onSave();
      onOpenChange(false);
    } catch (error) {
      console.error("Error saving service:", error);
      toast.error("Erro ao salvar serviço");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-card p-0">
        <DialogHeader className="p-6 pb-0">
          <DialogTitle className="text-xl font-bold text-primary flex items-center gap-2">
            <Brain className="h-6 w-6 text-primary" />
            {service?.id ? "Editar Serviço" : "Novo Serviço"}
          </DialogTitle>
        </DialogHeader>

        <div className="p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: Form (2/3) */}
          <div className="lg:col-span-2 space-y-6">
            {/* Service Type Selector */}
            <div className="border border-border rounded-lg p-4 space-y-4">
              <span className="text-sm font-semibold text-primary">TIPO DE SERVIÇO</span>
              <Tabs value={serviceType} onValueChange={(v) => setServiceType(v as ServiceType)} className="w-full">
                <TabsList className="w-full grid grid-cols-2">
                  <TabsTrigger value="session" className="flex items-center gap-2">
                    <CalendarDays className="h-4 w-4" />
                    Sessão/Consulta
                  </TabsTrigger>
                  <TabsTrigger value="members_area" className="flex items-center gap-2">
                    <GraduationCap className="h-4 w-4" />
                    Área de Membros
                  </TabsTrigger>
                </TabsList>
              </Tabs>
              <p className="text-xs text-muted-foreground">
                {serviceType === "session" 
                  ? "Serviço com agendamento de data e horário (consultas, sessões, mentorias)"
                  : "Acesso ao conteúdo da sua Área de Membros (cursos, aulas, materiais)"}
              </p>
            </div>

            {/* Member Access Config - Only for members_area */}
            {serviceType === "members_area" && (
              <div className="border border-border rounded-lg p-4 space-y-4 bg-primary/5">
                <div className="flex items-center gap-2 text-primary">
                  <GraduationCap className="h-5 w-5" />
                  <span className="font-semibold">CONFIGURAÇÃO DE ACESSO</span>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div
                    className={`p-4 border rounded-lg cursor-pointer transition-all ${
                      accessType === "lifetime" 
                        ? "border-primary bg-primary/10 ring-2 ring-primary" 
                        : "border-border hover:border-primary/50"
                    }`}
                    onClick={() => setAccessType("lifetime")}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <Infinity className="h-5 w-5 text-primary" />
                      <span className="font-medium text-primary">Vitalício</span>
                    </div>
                    <p className="text-xs text-muted-foreground">Acesso permanente ao conteúdo</p>
                  </div>

                  <div
                    className={`p-4 border rounded-lg cursor-pointer transition-all ${
                      accessType === "period" 
                        ? "border-primary bg-primary/10 ring-2 ring-primary" 
                        : "border-border hover:border-primary/50"
                    }`}
                    onClick={() => setAccessType("period")}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <Clock className="h-5 w-5 text-primary" />
                      <span className="font-medium text-primary">Por Período</span>
                    </div>
                    <p className="text-xs text-muted-foreground">Acesso por tempo limitado</p>
                  </div>

                  <div
                    className={`p-4 border rounded-lg cursor-pointer transition-all ${
                      accessType === "subscription" 
                        ? "border-primary bg-primary/10 ring-2 ring-primary" 
                        : "border-border hover:border-primary/50"
                    }`}
                    onClick={() => setAccessType("subscription")}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <RefreshCw className="h-5 w-5 text-primary" />
                      <span className="font-medium text-primary">Assinatura</span>
                    </div>
                    <p className="text-xs text-muted-foreground">Renovação automática</p>
                  </div>
                </div>

                {(accessType === "period" || accessType === "subscription") && (
                  <div className="space-y-2">
                    <Label className="text-primary font-medium">
                      {accessType === "subscription" ? "Período da Assinatura" : "Duração do Acesso"}
                    </Label>
                    <div className="flex items-center gap-3">
                      <select
                        value={accessDurationMonths}
                        onChange={(e) => setAccessDurationMonths(parseInt(e.target.value))}
                        className="flex-1 h-10 px-3 rounded-md border border-border bg-background text-foreground"
                      >
                        <option value={1}>1 mês</option>
                        <option value={3}>3 meses</option>
                        <option value={6}>6 meses</option>
                        <option value={12}>12 meses (1 ano)</option>
                        <option value={24}>24 meses (2 anos)</option>
                      </select>
                    </div>
                    {accessType === "subscription" && (
                      <p className="text-xs text-amber-600">
                        ⚠️ Assinatura requer integração com gateway que suporte pagamentos recorrentes
                      </p>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Basic Info */}
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label className="text-primary font-medium">Nome do Serviço</Label>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ex: Sessão de Terapia"
                  className="border-border"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-primary font-medium">Preço (R$)</Label>
                <Input
                  value={formatPrice(priceCents)}
                  onChange={(e) => handlePriceChange(e.target.value)}
                  placeholder="R$ 0,00"
                  className="border-border"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-primary font-medium">Tempo de Duração (min)</Label>
                <Input
                  type="number"
                  min={10}
                  max={240}
                  value={durationMinutes}
                  onChange={(e) => setDurationMinutes(Math.max(10, Math.min(240, parseInt(e.target.value) || 50)))}
                  placeholder="50"
                  className="border-border"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-primary font-medium">Descrição</Label>
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Descrição do Serviço"
                className="border-border resize-none"
                rows={4}
              />
            </div>

            {/* Notification Config */}
            <div className="border border-border rounded-lg p-4 space-y-4">
              <div className="flex items-center gap-2 text-primary">
                <Bell className="h-5 w-5" />
                <span className="font-semibold">NOTIFICAÇÃO DO SERVIÇO</span>
              </div>

              <p className="text-primary/80 text-sm font-medium">Como o Paciente será notificado após o pagamento?</p>

              <div className="space-y-3">
                <div className="flex items-center gap-3 p-3 border border-border rounded-lg hover:border-primary/50 transition-colors">
                  <Checkbox
                    id="notify_whatsapp"
                    checked={notifyWhatsapp}
                    onCheckedChange={(checked) => setNotifyWhatsapp(checked === true)}
                  />
                  <MessageSquare className="h-5 w-5 text-green-500" />
                  <label htmlFor="notify_whatsapp" className="flex-1 cursor-pointer">
                    <span className="font-medium text-primary">WhatsApp</span>
                    <p className="text-xs text-primary/60">Enviar confirmação via WhatsApp</p>
                  </label>
                </div>

                <div className="flex items-center gap-3 p-3 border border-border rounded-lg hover:border-primary/50 transition-colors">
                  <Checkbox
                    id="notify_email"
                    checked={notifyEmail}
                    onCheckedChange={(checked) => setNotifyEmail(checked === true)}
                  />
                  <Mail className="h-5 w-5 text-blue-500" />
                  <label htmlFor="notify_email" className="flex-1 cursor-pointer">
                    <span className="font-medium text-primary">E-mail</span>
                    <p className="text-xs text-primary/60">Enviar confirmação por e-mail</p>
                  </label>
                </div>

                <div className="flex items-center gap-3 p-3 border border-border rounded-lg hover:border-primary/50 transition-colors">
                  <Checkbox
                    id="notify_sms"
                    checked={notifySms}
                    onCheckedChange={(checked) => setNotifySms(checked === true)}
                  />
                  <Smartphone className="h-5 w-5 text-purple-500" />
                  <label htmlFor="notify_sms" className="flex-1 cursor-pointer">
                    <span className="font-medium text-primary">SMS</span>
                    <p className="text-xs text-primary/60">Enviar confirmação por SMS</p>
                  </label>
                </div>

                <div className="flex items-center gap-3 p-3 border border-border rounded-lg hover:border-primary/50 transition-colors">
                  <Checkbox
                    id="notify_redirect"
                    checked={notifyRedirect}
                    onCheckedChange={(checked) => setNotifyRedirect(checked === true)}
                  />
                  <Link className="h-5 w-5 text-orange-500" />
                  <label htmlFor="notify_redirect" className="flex-1 cursor-pointer">
                    <span className="font-medium text-primary">Link de Redirecionamento</span>
                    <p className="text-xs text-primary/60">Redirecionar paciente após o pagamento</p>
                  </label>
                </div>

                {notifyRedirect && (
                  <div className="ml-8 space-y-2">
                    <Label className="text-muted-foreground text-sm">URL de Redirecionamento</Label>
                    <Input
                      value={notifyRedirectUrl}
                      onChange={(e) => setNotifyRedirectUrl(e.target.value)}
                      placeholder="https://seusite.com/obrigado"
                      className="border-border"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Session Packages - Only for session type */}
            {serviceType === "session" && (
              <div className="border border-border rounded-lg p-4 space-y-4">
                <div className="flex items-center gap-2 text-primary">
                  <Package className="h-5 w-5" />
                  <span className="font-semibold">PACOTES DE SESSÕES</span>
                </div>

                <p className="text-primary/80 text-sm font-medium">
                  Configure pacotes com desconto para múltiplas sessões
                </p>

                <div className="flex items-center gap-3 p-3 border border-border rounded-lg hover:border-primary/50 transition-colors">
                  <Checkbox
                    id="is_package"
                    checked={isPackage}
                    onCheckedChange={(checked) => setIsPackage(checked === true)}
                  />
                  <label htmlFor="is_package" className="flex-1 cursor-pointer">
                    <span className="font-medium text-primary">Este é um pacote de sessões</span>
                    <p className="text-xs text-primary/60">Marque se este serviço representa múltiplas sessões</p>
                  </label>
                </div>

                {isPackage && (
                  <div className="grid grid-cols-2 gap-4 mt-4">
                    <div className="space-y-2">
                      <Label className="text-primary font-medium">Número de Sessões</Label>
                      <Input
                        type="number"
                        min={2}
                        value={packageSessions}
                        onChange={(e) => setPackageSessions(parseInt(e.target.value) || 4)}
                        className="border-border"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-primary font-medium">Desconto (%)</Label>
                      <Input
                        type="number"
                        min={0}
                        max={50}
                        value={packageDiscountPercent}
                        onChange={(e) => setPackageDiscountPercent(parseInt(e.target.value) || 0)}
                        className="border-border"
                      />
                    </div>
                  </div>
                )}

                {/* Additional session packages */}
                <div className="mt-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <Label className="text-primary font-medium">Pacotes Adicionais</Label>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const newPackage: SessionPackage = {
                          sessions: 4,
                          discount_percent: 10,
                          price_cents: Math.round(priceCents * 4 * 0.9),
                        };
                        setSessionPackages([...sessionPackages, newPackage]);
                      }}
                      className="gap-1"
                    >
                      <Plus className="h-4 w-4" />
                      Adicionar Pacote
                    </Button>
                  </div>

                  {sessionPackages.map((pkg, index) => (
                    <div key={index} className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg border border-border">
                      <div className="flex-1 grid grid-cols-3 gap-3">
                        <div className="space-y-1">
                          <Label className="text-xs text-muted-foreground">Sessões</Label>
                          <Input
                            type="number"
                            min={2}
                            value={pkg.sessions}
                            onChange={(e) => {
                              const updated = [...sessionPackages];
                              updated[index].sessions = parseInt(e.target.value) || 2;
                              updated[index].price_cents = Math.round(
                                priceCents * updated[index].sessions * (1 - updated[index].discount_percent / 100)
                              );
                              setSessionPackages(updated);
                            }}
                            className="h-8 border-border"
                          />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs text-muted-foreground">Desconto (%)</Label>
                          <Input
                            type="number"
                            min={0}
                            max={50}
                            value={pkg.discount_percent}
                            onChange={(e) => {
                              const updated = [...sessionPackages];
                              updated[index].discount_percent = parseInt(e.target.value) || 0;
                              updated[index].price_cents = Math.round(
                                priceCents * updated[index].sessions * (1 - updated[index].discount_percent / 100)
                              );
                              setSessionPackages(updated);
                            }}
                            className="h-8 border-border"
                          />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs text-muted-foreground">Preço Final</Label>
                          <div className="h-8 px-3 flex items-center bg-background border border-border rounded-md text-sm font-medium text-primary">
                            {formatPrice(pkg.price_cents)}
                          </div>
                        </div>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          setSessionPackages(sessionPackages.filter((_, i) => i !== index));
                        }}
                        className="text-muted-foreground hover:text-destructive"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}

                  {sessionPackages.length === 0 && (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      Nenhum pacote adicional configurado. Clique em "Adicionar Pacote" para criar.
                    </p>
                  )}
                </div>
              </div>
            )}

            {deliveryType === "pdf" && (
              <div className="border border-border rounded-lg p-4 space-y-4">
                <div className="flex items-center gap-2 text-foreground">
                  <FileText className="h-5 w-5" />
                  <span className="font-semibold">ARQUIVO PDF</span>
                </div>

                <div className="space-y-3">
                  <Label className="text-muted-foreground text-sm">Upload do Arquivo PDF</Label>
                  
                  {pdfName && (
                    <div className="flex items-center gap-3 p-3 bg-primary/10 border border-primary/20 rounded-lg">
                      <div className="p-2 bg-primary/20 rounded">
                        <FileText className="h-5 w-5 text-primary" />
                      </div>
                      <div className="flex-1">
                        <p className="text-xs text-muted-foreground">Arquivo Atual:</p>
                        <p className="text-sm font-medium text-foreground">{pdfName}</p>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          setPdfUrl("");
                          setPdfName("");
                        }}
                        className="text-muted-foreground hover:text-destructive"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  )}

                  <div
                    className="border-2 border-dashed border-border rounded-lg p-8 text-center cursor-pointer hover:border-primary hover:bg-primary/5 transition-colors"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    {isUploadingPdf ? (
                      <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" />
                    ) : (
                      <>
                        <Upload className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                        <p className="text-muted-foreground">
                          <span className="text-primary font-medium">Clique para enviar</span> ou arraste
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">PDF (MAX. 10MB)</p>
                      </>
                    )}
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf"
                    className="hidden"
                    onChange={handlePdfUpload}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Right: Image + Gateway (1/3) */}
          <div className="space-y-6">
            {/* Service Image */}
            <div className="space-y-2">
              <Label className="text-primary font-medium">Capa do Serviço</Label>
              <div
                className="aspect-square bg-gradient-to-br from-muted to-muted/80 rounded-lg overflow-hidden cursor-pointer relative group"
                onClick={() => imageInputRef.current?.click()}
              >
                {imageUrl ? (
                  <img src={imageUrl} alt="Capa" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    {isUploadingImage ? (
                      <Loader2 className="h-10 w-10 animate-spin text-primary" />
                    ) : (
                      <div className="text-center text-muted-foreground">
                        <Upload className="h-10 w-10 mx-auto mb-2" />
                        <span className="text-sm">Clique para upload</span>
                      </div>
                    )}
                  </div>
                )}
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <Upload className="h-8 w-8 text-white" />
                </div>
              </div>
              <p className="text-xs text-muted-foreground text-center">Recomendado: 400x600px (PNG/JPG)</p>
              <input
                ref={imageInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleImageUpload}
              />
            </div>

            {/* Payment Gateways - All Cards */}
            <div className="border border-border rounded-lg p-4 space-y-3">
              <span className="text-sm font-semibold text-primary">Processador de Pagamento</span>
              <div className="space-y-2">
                <div 
                  className={`flex items-center gap-3 p-3 border rounded-lg cursor-pointer transition-colors ${selectedGateway === 'mercado_pago' ? 'border-primary bg-primary/10 ring-2 ring-primary' : 'border-border hover:border-primary/50'}`}
                  onClick={() => setSelectedGateway('mercado_pago')}
                >
                  <div className="w-14 h-14 rounded-lg overflow-hidden bg-white flex items-center justify-center p-1.5">
                    <img src={mercadopagoLogo} alt="Mercado Pago" className="w-full h-full object-contain" />
                  </div>
                  <div className="flex-1">
                    <span className="font-medium text-primary">Mercado Pago</span>
                    <p className="text-xs text-primary/60">Cartão, Pix e Boleto</p>
                  </div>
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${selectedGateway === 'mercado_pago' ? 'border-primary bg-primary' : 'border-muted-foreground'}`}>
                    {selectedGateway === 'mercado_pago' && <div className="w-2 h-2 bg-white rounded-full" />}
                  </div>
                </div>
                
                <div 
                  className={`flex items-center gap-3 p-3 border rounded-lg cursor-pointer transition-colors ${selectedGateway === 'stripe' ? 'border-primary bg-primary/10 ring-2 ring-primary' : 'border-border hover:border-primary/50'}`}
                  onClick={() => setSelectedGateway('stripe')}
                >
                  <div className="w-14 h-14 rounded-lg overflow-hidden bg-white flex items-center justify-center p-1.5">
                    <img src={stripeLogo} alt="Stripe" className="w-full h-full object-contain" />
                  </div>
                  <div className="flex-1">
                    <span className="font-medium text-primary">Stripe</span>
                    <p className="text-xs text-primary/60">Cartão Internacional</p>
                  </div>
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${selectedGateway === 'stripe' ? 'border-primary bg-primary' : 'border-muted-foreground'}`}>
                    {selectedGateway === 'stripe' && <div className="w-2 h-2 bg-white rounded-full" />}
                  </div>
                </div>
                
                <div 
                  className={`flex items-center gap-3 p-3 border rounded-lg cursor-pointer transition-colors ${selectedGateway === 'pagarme' ? 'border-primary bg-primary/10 ring-2 ring-primary' : 'border-border hover:border-primary/50'}`}
                  onClick={() => setSelectedGateway('pagarme')}
                >
                  <div className="w-14 h-14 rounded-lg overflow-hidden bg-white flex items-center justify-center p-1.5">
                    <img src={pagarmeLogo} alt="Pagar.me" className="w-full h-full object-contain" />
                  </div>
                  <div className="flex-1">
                    <span className="font-medium text-primary">Pagar.me</span>
                    <p className="text-xs text-primary/60">Cartão, Pix e Boleto</p>
                  </div>
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${selectedGateway === 'pagarme' ? 'border-primary bg-primary' : 'border-muted-foreground'}`}>
                    {selectedGateway === 'pagarme' && <div className="w-2 h-2 bg-white rounded-full" />}
                  </div>
                </div>
                
                <div 
                  className={`flex items-center gap-3 p-3 border rounded-lg cursor-pointer transition-colors ${selectedGateway === 'pagseguro' ? 'border-primary bg-primary/10 ring-2 ring-primary' : 'border-border hover:border-primary/50'}`}
                  onClick={() => setSelectedGateway('pagseguro')}
                >
                  <div className="w-14 h-14 rounded-lg overflow-hidden bg-white flex items-center justify-center p-1.5">
                    <img src={pagseguroLogo} alt="PagSeguro" className="w-full h-full object-contain" />
                  </div>
                  <div className="flex-1">
                    <span className="font-medium text-primary">PagSeguro</span>
                    <p className="text-xs text-primary/60">Cartão, Pix e Boleto</p>
                  </div>
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${selectedGateway === 'pagseguro' ? 'border-primary bg-primary' : 'border-muted-foreground'}`}>
                    {selectedGateway === 'pagseguro' && <div className="w-2 h-2 bg-white rounded-full" />}
                  </div>
                </div>
                
                <div 
                  className={`flex items-center gap-3 p-3 border rounded-lg cursor-pointer transition-colors ${selectedGateway === 'pushinpay' ? 'border-primary bg-primary/10 ring-2 ring-primary' : 'border-border hover:border-primary/50'}`}
                  onClick={() => setSelectedGateway('pushinpay')}
                >
                  <div className="w-14 h-14 rounded-lg overflow-hidden bg-white flex items-center justify-center p-1.5">
                    <img src={pushinpayLogo} alt="PushinPay" className="w-full h-full object-contain" />
                  </div>
                  <div className="flex-1">
                    <span className="font-medium text-primary">PushinPay</span>
                    <p className="text-xs text-primary/60">Exclusivo para PIX</p>
                  </div>
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${selectedGateway === 'pushinpay' ? 'border-primary bg-primary' : 'border-muted-foreground'}`}>
                    {selectedGateway === 'pushinpay' && <div className="w-2 h-2 bg-white rounded-full" />}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 pt-0 border-t border-border mt-4">
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button
            onClick={handleSave}
            disabled={isSaving}
            className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold px-6"
          >
            {isSaving ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Salvando...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Salvar Alterações
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ProductEditModal;
