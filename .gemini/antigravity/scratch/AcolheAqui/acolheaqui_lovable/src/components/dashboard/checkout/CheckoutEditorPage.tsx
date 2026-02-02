import { useState, useEffect, useRef, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import Sortable from "sortablejs";
import { 
  ArrowLeft,
  Save,
  Loader2,
  ShoppingBag,
  Palette,
  User,
  CreditCard,
  Clock,
  Bell,
  BarChart3,
  Link,
  Info,
  ChevronDown,
  ChevronUp,
  Image as ImageIcon,
  Upload,
  X,
  Brain,
  GripVertical,
  Globe,
  Copy,
  ExternalLink,
  Check,
  
  Eye
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import ProfilePreview from "./ProfilePreview";
import CheckoutPreview from "./CheckoutPreview";
// AvailableHoursEditor removed - calendar not used for checkout
import DynamicBannerTemplate from "./DynamicBannerTemplate";

interface CheckoutEditorPageProps {
  profileId: string;
  serviceId: string;
  onBack: () => void;
}

interface CheckoutConfig {
  backgroundColor: string;
  accentColor: string;
  domainType: 'default' | 'subpath';
  userSlug: string;
  timer: {
    enabled: boolean;
    minutes: number;
    text: string;
    bgcolor: string;
    textcolor: string;
  };
  salesNotification: {
    enabled: boolean;
    names: string;
    product: string;
    tempo_exibicao: number;
    intervalo_notificacao: number;
  };
  tracking: {
    facebookPixelId: string;
    googleAnalyticsId: string;
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
  useDynamicBanner: boolean;
  dynamicBannerColors: {
    gradientFrom: string;
    gradientVia: string;
    gradientTo: string;
    textColor: string;
  };
}

interface Service {
  id: string;
  name: string;
  description: string | null;
  price_cents: number;
  duration_minutes: number;
}

const defaultConfig: CheckoutConfig = {
  backgroundColor: "#f3f4f6",
  accentColor: "#5521ea",
  domainType: 'default',
  userSlug: "",
  timer: {
    enabled: false,
    minutes: 15,
    text: "Esta oferta expira em:",
    bgcolor: "#ef4444",
    textcolor: "#ffffff",
  },
  salesNotification: {
    enabled: false,
    names: "",
    product: "",
    tempo_exibicao: 5,
    intervalo_notificacao: 10,
  },
  tracking: {
    facebookPixelId: "",
    googleAnalyticsId: "",
  },
  paymentMethods: {
    credit_card: true,
    pix: true,
    boleto: false,
  },
  customerFields: {
    enable_cpf: true,
    enable_phone: true,
  },
  summary: {
    product_name: "",
    discount_text: "",
    preco_anterior: "",
  },
  banners: [],
  useDynamicBanner: false,
  dynamicBannerColors: {
    gradientFrom: "#9333ea",
    gradientVia: "#7c3aed",
    gradientTo: "#581c87",
    textColor: "#ffffff",
  },
};

// Collapsible Section Component
const CollapsibleSection = ({ 
  title, 
  icon: Icon, 
  children, 
  defaultOpen = false 
}: { 
  title: string; 
  icon: React.ElementType; 
  children: React.ReactNode;
  defaultOpen?: boolean;
}) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  
  return (
    <div className="border border-primary/20 rounded-lg bg-white overflow-hidden">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-4 hover:bg-primary/5 transition-colors text-left"
      >
        <div className="flex items-center gap-3">
          <Icon className="h-5 w-5 text-primary" />
          <span className="font-semibold text-primary">{title}</span>
        </div>
        {isOpen ? (
          <ChevronUp className="h-4 w-4 text-gray-400" />
        ) : (
          <ChevronDown className="h-4 w-4 text-gray-400" />
        )}
      </button>
      {isOpen && (
        <div className="p-4 pt-0 border-t border-gray-100">
          {children}
        </div>
      )}
    </div>
  );
};

// Banner Upload Section Component with Drag & Drop
const BannerUploadSection = ({ 
  banners, 
  onBannersChange,
  label
}: { 
  banners: string[]; 
  onBannersChange: (banners: string[]) => void;
  label: string;
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const sortableContainerRef = useRef<HTMLDivElement>(null);
  const sortableRef = useRef<Sortable | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  // Initialize Sortable for drag-and-drop
  useEffect(() => {
    if (sortableContainerRef.current && banners.length > 0) {
      if (sortableRef.current) {
        sortableRef.current.destroy();
      }
      
      sortableRef.current = Sortable.create(sortableContainerRef.current, {
        animation: 200,
        ghostClass: 'opacity-40',
        chosenClass: 'ring-2 ring-primary',
        dragClass: 'shadow-lg',
        handle: '.drag-handle',
        onEnd: (evt) => {
          if (evt.oldIndex !== undefined && evt.newIndex !== undefined) {
            const newBanners = [...banners];
            const [movedItem] = newBanners.splice(evt.oldIndex, 1);
            newBanners.splice(evt.newIndex, 0, movedItem);
            onBannersChange(newBanners);
          }
        },
      });
    }

    return () => {
      if (sortableRef.current) {
        sortableRef.current.destroy();
        sortableRef.current = null;
      }
    };
  }, [banners, onBannersChange]);

  const isVideoUpload = label.toLowerCase().includes("vídeo");

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    const newBanners: string[] = [];

    for (const file of Array.from(files)) {
      const isImage = file.type.startsWith("image/");
      const isVideo = file.type.startsWith("video/");
      
      if (isVideoUpload && !isVideo) {
        toast.error("Por favor, selecione apenas vídeos (MP4, WEBM, MOV)");
        continue;
      }
      
      if (!isVideoUpload && !isImage) {
        toast.error("Por favor, selecione apenas imagens");
        continue;
      }

      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error("Usuário não autenticado");

        const fileExt = file.name.split(".").pop();
        const fileName = `${user.id}/banners/${Date.now()}_${Math.random().toString(36).slice(2)}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from("checkout-public")
          .upload(fileName, file);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from("checkout-public")
          .getPublicUrl(fileName);

        newBanners.push(publicUrl);
      } catch (error) {
        console.error("Error uploading banner:", error);
        toast.error("Erro ao enviar imagem");
      }
    }

    if (newBanners.length > 0) {
      onBannersChange([...banners, ...newBanners]);
      toast.success(`${newBanners.length} banner(s) adicionado(s)`);
    }

    setIsUploading(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleRemove = (idx: number) => {
    const newBanners = [...banners];
    newBanners.splice(idx, 1);
    onBannersChange(newBanners);
  };

  return (
    <div className="space-y-4 mt-4">
      {banners.length > 0 && (
        <div ref={sortableContainerRef} className="space-y-2">
          {banners.map((banner, idx) => {
            const isVideoFile = banner.match(/\.(mp4|webm|mov)($|\?)/i);
            return (
              <div 
                key={`${banner}-${idx}`} 
                className="flex items-center gap-2 p-2 bg-primary/5 rounded-lg border border-primary/10 transition-all"
              >
                <div className="drag-handle cursor-grab active:cursor-grabbing p-1 hover:bg-primary/10 rounded">
                  <GripVertical className="h-4 w-4 text-primary/50" />
                </div>
                {isVideoFile ? (
                  <video src={banner} className="w-16 h-10 object-cover rounded" muted />
                ) : (
                  <img src={banner} alt={`Banner ${idx + 1}`} className="w-16 h-10 object-cover rounded" />
                )}
                <span className="flex-1 text-sm text-primary/70 truncate">{banner.split('/').pop()?.split('?')[0]}</span>
                <span className="text-xs text-primary/40 bg-primary/10 px-2 py-0.5 rounded">{idx + 1}º</span>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="text-destructive hover:text-destructive/80 h-8 w-8"
                  onClick={() => handleRemove(idx)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            );
          })}
        </div>
      )}
      {banners.length > 1 && (
        <p className="text-xs text-primary/50 flex items-center gap-1">
          <GripVertical className="h-3 w-3" />
          Arraste para reordenar os banners
        </p>
      )}
      <div 
        className="text-center p-4 border-2 border-dashed border-primary/30 rounded-lg text-primary/60 text-sm cursor-pointer hover:border-primary/50 hover:bg-primary/5 transition-colors"
        onClick={() => fileInputRef.current?.click()}
      >
        {isUploading ? (
          <Loader2 className="h-6 w-6 mx-auto animate-spin text-primary" />
        ) : (
          <>
            <Upload className="h-6 w-6 mx-auto mb-2" />
            <p>Clique para adicionar {label}</p>
            <p className="text-xs mt-1">{isVideoUpload ? "MP4, WEBM ou MOV" : "PNG, JPG ou WEBP"}</p>
          </>
        )}
      </div>
      <input
        ref={fileInputRef}
        type="file"
        accept={isVideoUpload ? "video/mp4,video/webm,video/quicktime" : "image/*"}
        multiple={!isVideoUpload}
        className="hidden"
        onChange={handleUpload}
      />
    </div>
  );
};

const CheckoutEditorPage = ({ profileId, serviceId, onBack }: CheckoutEditorPageProps) => {
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [service, setService] = useState<Service | null>(null);
  const [config, setConfig] = useState<CheckoutConfig>(defaultConfig);
  const [gatewayType, setGatewayType] = useState("pushinpay");
  
  const [linkCopied, setLinkCopied] = useState(false);
  const [professionalName, setProfessionalName] = useState("");
  const [professionalAvatar, setProfessionalAvatar] = useState<string | null>(null);
  const [slugStatus, setSlugStatus] = useState<'idle' | 'checking' | 'available' | 'taken'>('idle');
  const [savedSlug, setSavedSlug] = useState("");
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const slugCheckTimeout = useRef<NodeJS.Timeout | null>(null);
  const [previewKey, setPreviewKey] = useState(0);
  const [previewMode, setPreviewMode] = useState<'checkout' | 'profile'>('checkout');

  // Normalize user slug (allows custom input)
  const generateUserSlug = (value: string) => {
    if (!value) return "";
    return value
      .trim()
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "") // Remove accents
      .replace(/[^a-z0-9]+/g, "-") // Keep only letters/numbers; convert separators to '-'
      .replace(/-+/g, "-") // Collapse multiple '-'
      .replace(/^-+|-+$/g, "") // Trim leading/trailing '-'
      .substring(0, 30); // Limit length
  };

  // Check if slug is available
  const checkSlugAvailability = useCallback(async (slug: string) => {
    if (!slug || slug === savedSlug) {
      setSlugStatus('available');
      return;
    }

    setSlugStatus('checking');
    
    try {
      const { data, error } = await supabase.rpc('check_slug_available', {
        slug: slug,
        profile_id: profileId
      });

      if (error) throw error;
      setSlugStatus(data ? 'available' : 'taken');
    } catch (error) {
      console.error("Error checking slug:", error);
      setSlugStatus('idle');
    }
  }, [profileId, savedSlug]);

  // Debounced slug check
  const handleSlugChange = (newSlug: string) => {
    const formattedSlug = generateUserSlug(newSlug);
    updateConfig("userSlug", formattedSlug);
    
    if (slugCheckTimeout.current) {
      clearTimeout(slugCheckTimeout.current);
    }
    
    slugCheckTimeout.current = setTimeout(() => {
      checkSlugAvailability(formattedSlug);
    }, 500);
  };

  useEffect(() => {
    fetchData();
  }, [serviceId]);

  const fetchData = async () => {
    try {
      // Fetch service
      const { data: serviceData, error: serviceError } = await supabase
        .from("services")
        .select("*")
        .eq("id", serviceId)
        .single();

      if (serviceError) throw serviceError;
      setService(serviceData);

      // Load saved config if exists
      if (serviceData.checkout_config && typeof serviceData.checkout_config === 'object') {
        setConfig(prev => ({ ...prev, ...serviceData.checkout_config as Partial<CheckoutConfig> }));
      }

      // Fetch gateway type
      const { data: gatewayData } = await supabase
        .from("payment_gateways")
        .select("gateway_type")
        .eq("professional_id", profileId)
        .eq("is_active", true)
        .maybeSingle();

      if (gatewayData) {
        setGatewayType(gatewayData.gateway_type);
      }


      // Fetch professional profile with user_slug and avatar
      const { data: profileData } = await supabase
        .from("profiles")
        .select("full_name, user_slug, avatar_url")
        .eq("id", profileId)
        .single();

      if (profileData) {
        const fullName = profileData.full_name || "";
        setProfessionalName(fullName);
        setProfessionalAvatar(profileData.avatar_url);
        
        // Use saved user_slug from profile, or from checkout config, or generate from name
        const existingSlug = profileData.user_slug || "";
        setSavedSlug(existingSlug);
        
        const checkoutConfig = serviceData.checkout_config as Partial<CheckoutConfig> | null;
        
        // Priority: 1) checkout config userSlug, 2) saved profile slug, 3) generate from name
        let slugToUse = "";
        if (checkoutConfig?.userSlug && checkoutConfig.userSlug.trim() !== "") {
          slugToUse = checkoutConfig.userSlug;
        } else if (existingSlug && existingSlug.trim() !== "") {
          slugToUse = existingSlug;
        } else if (fullName && fullName.trim() !== "") {
          slugToUse = generateUserSlug(fullName.trim().split(/\s+/)[0] || "");
        }
        
        setConfig(prev => ({
          ...prev,
          ...checkoutConfig,
          userSlug: slugToUse
        }));
        
        // Check availability for generated slugs
        if (slugToUse && slugToUse !== existingSlug) {
          checkSlugAvailability(slugToUse);
        } else if (slugToUse) {
          setSlugStatus('available');
        }
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Erro ao carregar dados");
    } finally {
      setIsLoading(false);
    }
  };

  const getCheckoutUrl = (mode: 'checkout' | 'profile' = 'checkout') => {
    // Use canonical domain to avoid redirects dropping query params (e.g. ?mode=simple)
    const baseUrl = "https://www.acolheaqui.com.br";
    let url: string;
    if (config.domainType === 'subpath' && config.userSlug) {
      url = `${baseUrl}/${config.userSlug}/checkout/${serviceId}`;
    } else {
      url = `${baseUrl}/checkout/${serviceId}`;
    }
    // Add mode=simple for "Checkout da Landing Page" (no calendar)
    if (mode === 'profile') {
      url += url.includes("?") ? "&mode=simple" : "?mode=simple";
    }
    return url;
  };

  const handleCopyLink = async () => {
    const url = getCheckoutUrl(previewMode);
    try {
      await navigator.clipboard.writeText(url);
      setLinkCopied(true);
      toast.success("Link copiado para a área de transferência!");
      setTimeout(() => setLinkCopied(false), 2000);
    } catch (error) {
      toast.error("Erro ao copiar link");
    }
  };

  const handleSave = async () => {
    // Validate slug if using subpath
    if (config.domainType === 'subpath' && config.userSlug) {
      if (slugStatus === 'taken') {
        toast.error("Este identificador já está em uso. Escolha outro.");
        return;
      }
      if (slugStatus === 'checking') {
        toast.error("Aguarde a verificação do identificador.");
        return;
      }
    }

    setIsSaving(true);
    try {
      // Save checkout config to service
      const { error: serviceError } = await supabase
        .from("services")
        .update({
          checkout_config: JSON.parse(JSON.stringify(config)),
        })
        .eq("id", serviceId);

      if (serviceError) throw serviceError;


      // If using subpath, also save the slug to the profile
      if (config.domainType === 'subpath' && config.userSlug && config.userSlug !== savedSlug) {
        const { error: profileError } = await supabase
          .from("profiles")
          .update({ user_slug: config.userSlug })
          .eq("id", profileId);

        if (profileError) {
          if (profileError.code === '23505') { // Unique violation
            toast.error("Este identificador já está em uso. Escolha outro.");
            setSlugStatus('taken');
            return;
          }
          throw profileError;
        }
        
        setSavedSlug(config.userSlug);
      }
      
      toast.success("Configurações salvas com sucesso!");
      
      // Trigger preview refresh
      setPreviewKey(prev => prev + 1);
    } catch (error) {
      console.error("Error saving config:", error);
      toast.error("Erro ao salvar configurações");
    } finally {
      setIsSaving(false);
    }
  };

  const updateConfig = <K extends keyof CheckoutConfig>(
    key: K,
    value: CheckoutConfig[K]
  ) => {
    setConfig(prev => ({ ...prev, [key]: value }));
  };

  const updateNestedConfig = <K extends keyof CheckoutConfig>(
    key: K,
    nestedKey: string,
    value: unknown
  ) => {
    setConfig(prev => ({
      ...prev,
      [key]: {
        ...(prev[key] as object),
        [nestedKey]: value,
      },
    }));
  };

  const formatPrice = (cents: number) => {
    return (cents / 100).toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!service) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Serviço não encontrado</p>
        <Button onClick={onBack} variant="outline" className="mt-4">
          Voltar
        </Button>
      </div>
    );
  }

  const gatewayLabel = gatewayType === "mercado_pago" ? "Mercado Pago" : "PushinPay";

  return (
    <div className="flex flex-col lg:flex-row h-auto lg:h-[calc(100vh-8rem)] bg-gray-100 -mx-4 md:-mx-6 -mt-4 md:-mt-6 font-sans">
      {/* Left Panel - Editor Form (scrollable) */}
      <div className="w-full lg:w-[400px] lg:min-w-[400px] h-auto lg:h-full bg-white border-b lg:border-b-0 lg:border-r border-gray-200 overflow-y-auto">
        <form className="p-5" onSubmit={(e) => { e.preventDefault(); handleSave(); }}>
          {/* Header */}
          <div className="flex items-center gap-3 mb-5 pb-4 border-b border-primary/20">
            <button
              type="button"
              onClick={onBack}
              className="text-primary/70 hover:text-primary transition-colors"
            >
              <ArrowLeft className="w-6 h-6" />
            </button>
            <div className="flex-1">
              <h1 className="text-xl font-bold text-primary flex items-center gap-2">
                <Brain className="h-6 w-6 text-primary" />
                Editor de Checkout
              </h1>
              <p className="text-sm text-primary/70 flex items-center gap-2 mt-0.5">
                Serviço: {service.name}
                <span className="bg-primary/10 text-primary text-xs font-bold px-2 py-0.5 rounded">
                  {gatewayLabel}
                </span>
              </p>
            </div>
          </div>

          {/* Tip */}
          <div className="mb-5 bg-primary/5 border border-primary/20 text-primary p-3 rounded-lg text-sm flex items-start gap-2">
            <Info className="h-4 w-4 mt-0.5 flex-shrink-0" />
            <p><strong>Dica:</strong> Arraste e solte os blocos na pré-visualização à direita para reordenar a página de checkout.</p>
          </div>

          {/* Custom Domain Section */}
          <CollapsibleSection title="Domínio do Checkout" icon={Globe} defaultOpen>
            <div className="space-y-4 mt-4">
              {/* Domain Type Selection */}
              <div>
                <Label className="text-gray-700 text-sm font-semibold mb-2 block">Tipo de Domínio</Label>
                <div className="space-y-2">
                  {/* Option 1: Default */}
                  <label className={`flex items-center gap-3 p-3 border rounded-lg cursor-pointer transition-all ${config.domainType === 'default' ? 'border-primary bg-primary/5' : 'border-gray-200 hover:border-gray-300'}`}>
                    <input
                      type="radio"
                      name="domainType"
                      value="default"
                      checked={config.domainType === 'default'}
                      onChange={() => updateConfig("domainType", 'default')}
                      className="w-4 h-4 text-primary"
                    />
                    <div className="flex-1">
                      <span className="font-medium text-gray-700">Domínio Padrão</span>
                      <p className="text-xs text-gray-500 mt-0.5">Usar o domínio padrão do AcolheAqui</p>
                    </div>
                  </label>

                  {/* Option 2: Subpath (URL Personalizada) */}
                  <label className={`flex items-center gap-3 p-3 border rounded-lg cursor-pointer transition-all ${config.domainType === 'subpath' ? 'border-primary bg-primary/5' : 'border-gray-200 hover:border-gray-300'}`}>
                    <input
                      type="radio"
                      name="domainType"
                      value="subpath"
                      checked={config.domainType === 'subpath'}
                      onChange={() => updateConfig("domainType", 'subpath')}
                      className="w-4 h-4 text-primary"
                    />
                    <div className="flex-1">
                      <span className="font-medium text-gray-700">URL Personalizada</span>
                      <p className="text-xs text-gray-500 mt-0.5">acolheaqui.com.br/seunome (recomendado)</p>
                    </div>
                    <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">SSL Automático</span>
                  </label>
                </div>
              </div>

              {/* Subpath Configuration */}
              {config.domainType === 'subpath' && (
                <div className={`border rounded-lg p-4 space-y-3 ${
                  slugStatus === 'taken' 
                    ? 'bg-red-50 border-red-200' 
                    : 'bg-green-50 border-green-200'
                }`}>
                  <Label className="text-gray-700 text-sm font-semibold">Seu Identificador</Label>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-600 whitespace-nowrap">acolheaqui.com.br/</span>
                    <div className="flex-1 relative">
                      <Input
                        value={config.userSlug}
                        onChange={e => handleSlugChange(e.target.value)}
                        placeholder="seunome"
                        className={`pr-10 bg-white ${
                          slugStatus === 'taken' 
                            ? 'border-red-300 focus:border-red-500' 
                            : 'border-green-300 focus:border-green-500'
                        }`}
                      />
                      <div className="absolute right-3 top-1/2 -translate-y-1/2">
                        {slugStatus === 'checking' && (
                          <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
                        )}
                        {slugStatus === 'available' && config.userSlug && (
                          <Check className="h-4 w-4 text-green-500" />
                        )}
                        {slugStatus === 'taken' && (
                          <X className="h-4 w-4 text-red-500" />
                        )}
                      </div>
                    </div>
                  </div>
                  {slugStatus === 'taken' ? (
                    <p className="text-xs text-red-600 flex items-center gap-1">
                      <Info className="h-3 w-3" />
                      Este identificador já está em uso. Escolha outro.
                    </p>
                  ) : slugStatus === 'available' && config.userSlug ? (
                    <p className="text-xs text-green-700">
                      ✓ Identificador disponível • SSL automático incluso
                    </p>
                  ) : (
                    <p className="text-xs text-gray-500">
                      Digite um identificador único para sua URL personalizada
                    </p>
                  )}
                </div>
              )}

              {/* Checkout URL Preview */}
              <div className="pt-2 border-t border-gray-200">
                <Label className="text-gray-700 text-sm font-semibold">Link do Checkout</Label>
                <div className="mt-1 flex items-center gap-2">
                  <div className="flex-1 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-600 truncate">
                    {getCheckoutUrl(previewMode)}
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={handleCopyLink}
                    className="shrink-0 border-gray-300 hover:bg-primary/5"
                  >
                    {linkCopied ? (
                      <Check className="h-4 w-4 text-green-500" />
                    ) : (
                      <Copy className="h-4 w-4 text-gray-500" />
                    )}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => window.open(getCheckoutUrl(previewMode), '_blank')}
                    className="shrink-0 border-gray-300 hover:bg-primary/5"
                  >
                    <ExternalLink className="h-4 w-4 text-gray-500" />
                  </Button>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  {config.domainType === 'subpath' 
                    ? "Seu checkout usa uma URL personalizada do AcolheAqui."
                    : "Use a opção de URL personalizada para ter um link mais curto."}
                </p>
              </div>
            </div>
          </CollapsibleSection>

          {/* Sections */}
          <div className="space-y-3 mt-3">
            {/* Resumo da Compra */}
            <CollapsibleSection title="Resumo da Compra" icon={ShoppingBag} defaultOpen>
              <div className="space-y-4 mt-4">
                <div>
                  <Label className="text-gray-700 text-sm font-semibold">Nome do Serviço no Checkout</Label>
                  <Input
                    value={config.summary.product_name}
                    onChange={e => updateNestedConfig("summary", "product_name", e.target.value)}
                    placeholder={service.name}
                    className="mt-1 border-gray-300"
                  />
                  <p className="text-xs text-gray-500 mt-1">Por padrão, usa o nome original do serviço.</p>
                </div>
                <div>
                  <Label className="text-gray-700 text-sm font-semibold">Preço Original (De)</Label>
                  <Input
                    value={config.summary.preco_anterior}
                    onChange={e => updateNestedConfig("summary", "preco_anterior", e.target.value)}
                    placeholder="Ex: 199,90"
                    className="mt-1 border-gray-300"
                  />
                  <p className="text-xs text-gray-500 mt-1">Deixe em branco para não exibir o preço cortado.</p>
                </div>
                <div>
                  <Label className="text-gray-700 text-sm font-semibold">Texto de Desconto (Opcional)</Label>
                  <Input
                    value={config.summary.discount_text}
                    onChange={e => updateNestedConfig("summary", "discount_text", e.target.value)}
                    placeholder="Ex: 30% OFF"
                    className="mt-1 border-gray-300"
                  />
                  <p className="text-xs text-gray-500 mt-1">Exibido como um selo de destaque no serviço.</p>
                </div>
              </div>
            </CollapsibleSection>

            {/* Aparência */}
            <CollapsibleSection title="Aparência" icon={Palette}>
              <div className="space-y-4 mt-4">
                <div>
                  <Label className="text-gray-700 text-sm font-semibold">Cor de Fundo da Página</Label>
                  <div className="flex items-center gap-2 mt-1">
                    <input
                      type="color"
                      value={config.backgroundColor}
                      onChange={e => updateConfig("backgroundColor", e.target.value)}
                      className="w-12 h-10 rounded cursor-pointer border border-gray-300"
                    />
                    <Input
                      value={config.backgroundColor}
                      onChange={e => updateConfig("backgroundColor", e.target.value)}
                      className="flex-1 border-gray-300"
                    />
                  </div>
                </div>
                <div>
                  <Label className="text-gray-700 text-sm font-semibold">Cor de Destaque (Cabeçalho/Botões)</Label>
                  <div className="flex items-center gap-2 mt-1">
                    <input
                      type="color"
                      value={config.accentColor}
                      onChange={e => updateConfig("accentColor", e.target.value)}
                      className="w-12 h-10 rounded cursor-pointer border border-gray-300"
                    />
                    <Input
                      value={config.accentColor}
                      onChange={e => updateConfig("accentColor", e.target.value)}
                      className="flex-1 border-gray-300"
                    />
                  </div>
                </div>
              </div>
            </CollapsibleSection>

            {/* Banners */}
            <CollapsibleSection title="Banners Principais" icon={ImageIcon}>
              <div className="space-y-4 mt-4">
                {/* Dynamic Banner Option */}
                <div className="flex items-start gap-3 p-3 bg-gradient-to-r from-purple-50 to-violet-50 rounded-lg border border-purple-200">
                  <Checkbox
                    id="useDynamicBanner"
                    checked={config.useDynamicBanner}
                    onCheckedChange={(checked) => updateConfig("useDynamicBanner", !!checked)}
                  />
                  <div className="flex-1">
                    <Label htmlFor="useDynamicBanner" className="font-semibold text-purple-800 cursor-pointer">
                      Usar Banner Dinâmico do Profissional
                    </Label>
                    <p className="text-xs text-purple-600 mt-1">
                      Banner automático com foto, nome, serviço e duração.
                    </p>
                    {config.useDynamicBanner && service && (
                      <div className="mt-3">
                        <DynamicBannerTemplate
                          professionalName={professionalName || "Nome do Profissional"}
                          professionalAvatar={professionalAvatar}
                          serviceName={config.summary.product_name || service.name}
                          serviceDuration={service.duration_minutes || 50}
                          gradientFrom={config.dynamicBannerColors?.gradientFrom || "#9333ea"}
                          gradientVia={config.dynamicBannerColors?.gradientVia || "#7c3aed"}
                          gradientTo={config.dynamicBannerColors?.gradientTo || "#581c87"}
                          textColor={config.dynamicBannerColors?.textColor || "#ffffff"}
                        />
                      </div>
                    )}
                  </div>
                </div>

                {/* Dynamic Banner Color Customization */}
                {config.useDynamicBanner && (
                  <div className="p-4 bg-gray-50 rounded-lg border border-gray-200 space-y-4">
                    <Label className="text-gray-700 text-sm font-semibold flex items-center gap-2">
                      <Palette className="w-4 h-4" />
                      Cores do Banner Dinâmico
                    </Label>
                    
                    {/* Gradient Colors */}
                    <div className="grid grid-cols-3 gap-3">
                      <div>
                        <Label className="text-gray-600 text-xs">Gradiente Início</Label>
                        <div className="flex items-center gap-2 mt-1">
                          <input
                            type="color"
                            value={config.dynamicBannerColors?.gradientFrom || "#9333ea"}
                            onChange={e => updateNestedConfig("dynamicBannerColors", "gradientFrom", e.target.value)}
                            className="w-8 h-8 rounded cursor-pointer border border-gray-300"
                          />
                          <Input
                            value={config.dynamicBannerColors?.gradientFrom || "#9333ea"}
                            onChange={e => updateNestedConfig("dynamicBannerColors", "gradientFrom", e.target.value)}
                            className="flex-1 border-gray-300 text-xs h-8"
                          />
                        </div>
                      </div>
                      <div>
                        <Label className="text-gray-600 text-xs">Gradiente Meio</Label>
                        <div className="flex items-center gap-2 mt-1">
                          <input
                            type="color"
                            value={config.dynamicBannerColors?.gradientVia || "#7c3aed"}
                            onChange={e => updateNestedConfig("dynamicBannerColors", "gradientVia", e.target.value)}
                            className="w-8 h-8 rounded cursor-pointer border border-gray-300"
                          />
                          <Input
                            value={config.dynamicBannerColors?.gradientVia || "#7c3aed"}
                            onChange={e => updateNestedConfig("dynamicBannerColors", "gradientVia", e.target.value)}
                            className="flex-1 border-gray-300 text-xs h-8"
                          />
                        </div>
                      </div>
                      <div>
                        <Label className="text-gray-600 text-xs">Gradiente Fim</Label>
                        <div className="flex items-center gap-2 mt-1">
                          <input
                            type="color"
                            value={config.dynamicBannerColors?.gradientTo || "#581c87"}
                            onChange={e => updateNestedConfig("dynamicBannerColors", "gradientTo", e.target.value)}
                            className="w-8 h-8 rounded cursor-pointer border border-gray-300"
                          />
                          <Input
                            value={config.dynamicBannerColors?.gradientTo || "#581c87"}
                            onChange={e => updateNestedConfig("dynamicBannerColors", "gradientTo", e.target.value)}
                            className="flex-1 border-gray-300 text-xs h-8"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Text Color */}
                    <div>
                      <Label className="text-gray-600 text-xs">Cor do Texto</Label>
                      <div className="flex items-center gap-2 mt-1">
                        <input
                          type="color"
                          value={config.dynamicBannerColors?.textColor || "#ffffff"}
                          onChange={e => updateNestedConfig("dynamicBannerColors", "textColor", e.target.value)}
                          className="w-8 h-8 rounded cursor-pointer border border-gray-300"
                        />
                        <Input
                          value={config.dynamicBannerColors?.textColor || "#ffffff"}
                          onChange={e => updateNestedConfig("dynamicBannerColors", "textColor", e.target.value)}
                          className="w-32 border-gray-300 text-xs h-8"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Custom Banners Upload */}
                {!config.useDynamicBanner && (
                  <>
                    <p className="text-xs text-gray-500">Ou faça upload de banners personalizados:</p>
                    <BannerUploadSection
                      banners={config.banners}
                      onBannersChange={(newBanners) => updateConfig("banners", newBanners)}
                      label="banners principais"
                    />
                  </>
                )}
              </div>
            </CollapsibleSection>


            {/* Campos do Cliente */}
            <CollapsibleSection title="Campos do Cliente" icon={User}>
              <div className="space-y-4 mt-4">
                <div className="flex items-center gap-3">
                  <Checkbox
                    id="enable_cpf"
                    checked={config.customerFields.enable_cpf}
                    onCheckedChange={(checked) => updateNestedConfig("customerFields", "enable_cpf", checked)}
                  />
                  <div>
                    <Label htmlFor="enable_cpf" className="font-semibold text-gray-800">Exibir campo CPF</Label>
                    <p className="text-xs text-gray-500">Ativa ou desativa o campo de CPF no checkout.</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Checkbox
                    id="enable_phone"
                    checked={config.customerFields.enable_phone}
                    onCheckedChange={(checked) => updateNestedConfig("customerFields", "enable_phone", checked)}
                  />
                  <div>
                    <Label htmlFor="enable_phone" className="font-semibold text-gray-800">Exibir campo Telefone</Label>
                    <p className="text-xs text-gray-500">Ativa ou desativa o campo de Telefone no checkout.</p>
                  </div>
                </div>
              </div>
            </CollapsibleSection>

            {/* Métodos de Pagamento */}
            <CollapsibleSection title="Métodos de Pagamento" icon={CreditCard}>
              <div className="space-y-4 mt-4">
                <div className="flex items-center gap-3">
                  <Checkbox
                    id="payment_pix"
                    checked={config.paymentMethods.pix}
                    onCheckedChange={(checked) => updateNestedConfig("paymentMethods", "pix", checked)}
                  />
                  <div>
                    <Label htmlFor="payment_pix" className="font-semibold text-gray-800">Pix</Label>
                    <p className="text-xs text-gray-500">Permitir pagamentos via Pix.</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Checkbox
                    id="payment_credit_card"
                    checked={config.paymentMethods.credit_card}
                    onCheckedChange={(checked) => updateNestedConfig("paymentMethods", "credit_card", checked)}
                  />
                  <div>
                    <Label htmlFor="payment_credit_card" className="font-semibold text-gray-800">Cartão de Crédito</Label>
                    <p className="text-xs text-gray-500">Permitir pagamentos via cartão de crédito.</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Checkbox
                    id="payment_boleto"
                    checked={config.paymentMethods.boleto}
                    onCheckedChange={(checked) => updateNestedConfig("paymentMethods", "boleto", checked)}
                  />
                  <div>
                    <Label htmlFor="payment_boleto" className="font-semibold text-gray-800">Boleto</Label>
                    <p className="text-xs text-gray-500">Permitir pagamentos via boleto bancário.</p>
                  </div>
                </div>
              </div>
            </CollapsibleSection>

            {/* Cronômetro */}
            <CollapsibleSection title="Cronômetro de Escassez" icon={Clock}>
              <div className="space-y-4 mt-4">
                <div className="flex items-center gap-3">
                  <Checkbox
                    id="timer_enabled"
                    checked={config.timer.enabled}
                    onCheckedChange={(checked) => updateNestedConfig("timer", "enabled", checked)}
                  />
                  <div>
                    <Label htmlFor="timer_enabled" className="font-semibold text-gray-800">Ativar cronômetro</Label>
                    <p className="text-xs text-gray-500">Mostra um contador regressivo para criar urgência.</p>
                  </div>
                </div>
                {config.timer.enabled && (
                  <>
                    <div>
                      <Label className="text-gray-700 text-sm font-semibold">Texto Persuasivo</Label>
                      <Input
                        value={config.timer.text}
                        onChange={e => updateNestedConfig("timer", "text", e.target.value)}
                        className="mt-1 border-gray-300"
                      />
                    </div>
                    <div>
                      <Label className="text-gray-700 text-sm font-semibold">Duração (minutos)</Label>
                      <Input
                        type="number"
                        value={config.timer.minutes}
                        onChange={e => updateNestedConfig("timer", "minutes", parseInt(e.target.value) || 15)}
                        className="mt-1 w-24 border-gray-300"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label className="text-gray-700 text-sm font-semibold">Cor de Fundo</Label>
                        <div className="flex items-center gap-2 mt-1">
                          <input
                            type="color"
                            value={config.timer.bgcolor}
                            onChange={e => updateNestedConfig("timer", "bgcolor", e.target.value)}
                            className="w-10 h-9 rounded cursor-pointer border border-gray-300"
                          />
                          <Input
                            value={config.timer.bgcolor}
                            onChange={e => updateNestedConfig("timer", "bgcolor", e.target.value)}
                            className="flex-1 border-gray-300 text-sm"
                          />
                        </div>
                      </div>
                      <div>
                        <Label className="text-gray-700 text-sm font-semibold">Cor do Texto</Label>
                        <div className="flex items-center gap-2 mt-1">
                          <input
                            type="color"
                            value={config.timer.textcolor}
                            onChange={e => updateNestedConfig("timer", "textcolor", e.target.value)}
                            className="w-10 h-9 rounded cursor-pointer border border-gray-300"
                          />
                          <Input
                            value={config.timer.textcolor}
                            onChange={e => updateNestedConfig("timer", "textcolor", e.target.value)}
                            className="flex-1 border-gray-300 text-sm"
                          />
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </CollapsibleSection>


            {/* Order Bumps */}
            <CollapsibleSection title="Order Bumps" icon={ShoppingBag}>
              <div className="space-y-4 mt-4">
                <Button type="button" variant="outline" className="w-full border-dashed border-gray-300 text-gray-600">
                  + Adicionar Oferta
                </Button>
                <p className="text-xs text-gray-500 text-center">
                  Order Bumps são ofertas exibidas antes do pagamento.
                </p>
              </div>
            </CollapsibleSection>

            {/* Rastreamento */}
            <CollapsibleSection title="Rastreamento & Pixels" icon={BarChart3}>
              <div className="space-y-4 mt-4">
                <div>
                  <Label className="text-gray-700 text-sm font-semibold">ID do Pixel do Facebook</Label>
                  <Input
                    value={config.tracking.facebookPixelId}
                    onChange={e => updateNestedConfig("tracking", "facebookPixelId", e.target.value)}
                    placeholder="Apenas os números"
                    className="mt-1 border-gray-300"
                  />
                </div>
                <div>
                  <Label className="text-gray-700 text-sm font-semibold">ID do Google Analytics</Label>
                  <Input
                    value={config.tracking.googleAnalyticsId}
                    onChange={e => updateNestedConfig("tracking", "googleAnalyticsId", e.target.value)}
                    placeholder="Ex: G-XXXXXXXXXX"
                    className="mt-1 border-gray-300"
                  />
                </div>
              </div>
            </CollapsibleSection>
          </div>

          {/* Save Button */}
          <div className="sticky bottom-0 bg-white pt-4 mt-5 border-t border-primary/20">
            <div className="flex gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={onBack}
                className="flex-1 border-primary/30 text-primary hover:bg-primary/5"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold"
                disabled={isSaving}
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
          </div>
        </form>
      </div>

      {/* Right Panel - Preview */}
      <div className="flex-1 h-[500px] lg:h-full p-4 overflow-hidden">
        <div className="h-full rounded-xl overflow-hidden shadow-2xl border border-gray-300 bg-background flex flex-col">
          {/* Browser Chrome with Toggle */}
          <div className="bg-gray-100 px-3 md:px-4 py-2 md:py-3 flex items-center gap-2 md:gap-3 border-b border-gray-200 shrink-0">
            <div className="flex gap-1.5">
              <div className="w-2.5 h-2.5 md:w-3 md:h-3 rounded-full bg-red-400" />
              <div className="w-2.5 h-2.5 md:w-3 md:h-3 rounded-full bg-yellow-400" />
              <div className="w-2.5 h-2.5 md:w-3 md:h-3 rounded-full bg-green-400" />
            </div>
            
            {/* Preview Mode Toggle */}
            <TooltipProvider delayDuration={200}>
              <div className="flex items-center gap-1 bg-gray-200 rounded-lg p-0.5 ml-2">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      type="button"
                      onClick={() => setPreviewMode('checkout')}
                      className={`flex items-center gap-1.5 px-2 md:px-3 py-1 md:py-1.5 rounded-md text-xs font-medium transition-all ${
                        previewMode === 'checkout'
                          ? 'bg-white text-primary shadow-sm'
                          : 'text-gray-500 hover:text-gray-700'
                      }`}
                    >
                      <CreditCard className="w-3 h-3" />
                      <span className="hidden md:inline">Checkout</span>
                    </button>
                  </TooltipTrigger>
                  <TooltipContent side="bottom" className="max-w-xs text-center">
                    <p className="font-medium">Checkout com Calendário</p>
                    <p className="text-xs text-muted-foreground">Página independente com calendário integrado para agendamento direto</p>
                  </TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      type="button"
                      onClick={() => setPreviewMode('profile')}
                      className={`flex items-center gap-1.5 px-2 md:px-3 py-1 md:py-1.5 rounded-md text-xs font-medium transition-all ${
                        previewMode === 'profile'
                          ? 'bg-white text-primary shadow-sm'
                          : 'text-gray-500 hover:text-gray-700'
                      }`}
                    >
                      <User className="w-3 h-3" />
                      <span className="hidden md:inline">Checkout da Landing Page</span>
                    </button>
                  </TooltipTrigger>
                  <TooltipContent side="bottom" className="max-w-xs text-center">
                    <p className="font-medium">Checkout da Landing Page</p>
                    <p className="text-xs text-muted-foreground">Modal de pagamento usado na sua Landing Page após selecionar data e horário</p>
                  </TooltipContent>
                </Tooltip>
              </div>
            </TooltipProvider>

            <div className="flex-1 ml-2 md:ml-4 flex items-center gap-2">
              <div className="bg-white rounded-full px-3 md:px-4 py-1 md:py-1.5 text-xs md:text-sm text-gray-500 border border-gray-200 flex items-center gap-2 flex-1 max-w-lg truncate">
                <svg className="w-3 h-3 md:w-4 md:h-4 text-green-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                <span className="truncate">
                  {previewMode === 'checkout' 
                    ? `acolheaqui.com.br/checkout/${serviceId.slice(0, 8)}...`
                    : `acolheaqui.com.br/checkout/${serviceId.slice(0, 8)}...?mode=simple`}
                </span>
              </div>
              <button
                type="button"
                onClick={() => window.open(getCheckoutUrl(previewMode), '_blank')}
                className="p-2 rounded-full bg-white border border-gray-200 hover:bg-gray-50 transition-colors shrink-0"
                title="Abrir no navegador"
              >
                <ExternalLink className="w-4 h-4 text-gray-600" />
              </button>
            </div>
          </div>
          
          {/* Preview Content */}
          <div className="flex-1 overflow-auto">
            {previewMode === 'checkout' && service ? (
              <CheckoutPreview
                key={`checkout-${previewKey}`}
                config={config}
                service={service}
                professionalName={professionalName}
                professionalAvatar={professionalAvatar}
              />
            ) : (
              <ProfilePreview
                key={`profile-${previewKey}`}
                profileId={profileId}
                serviceId={serviceId}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutEditorPage;
