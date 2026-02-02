import { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import SalesPagePreview, { defaultSalesPageConfig, SalesPageConfig } from "./SalesPagePreview";
import SalesPageEditorSidebar from "./SalesPageEditorSidebar";
import { Monitor, Tablet, Smartphone, ExternalLink, Save, Loader2, ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";
// NOTE: For previewing inside the app (including Lovable preview), we must use the current origin.
import { Button } from "@/components/ui/button";
import { normalizeSalesPageConfig } from "./configNormalization";

interface SalesPageEditorPageProps {
  serviceId: string;
  professionalId: string;
  onBack: () => void;
}

type DeviceMode = "desktop" | "tablet" | "mobile";

const deviceWidths: Record<DeviceMode, string> = {
  desktop: "100%",
  tablet: "768px",
  mobile: "375px",
};

interface Service {
  id: string;
  name: string;
  description: string | null;
  price_cents: number;
  product_config?: Record<string, unknown>;
}

interface Module {
  id: string;
  title: string;
  description: string | null;
  lessons_count: number;
}

const SalesPageEditorPage = ({ serviceId, professionalId, onBack }: SalesPageEditorPageProps) => {
  const navigate = useNavigate();
  const [service, setService] = useState<Service | null>(null);
  const [modules, setModules] = useState<Module[]>([]);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [config, setConfig] = useState<SalesPageConfig>(defaultSalesPageConfig);
  const [deviceMode, setDeviceMode] = useState<DeviceMode>("desktop");
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const initialLoadRef = useRef(true);
  const configRef = useRef<SalesPageConfig>(defaultSalesPageConfig);

  useEffect(() => {
    fetchData();
  }, [serviceId, professionalId]);

  // Auto-save with debounce when config changes
  useEffect(() => {
    if (initialLoadRef.current) return;

    setHasUnsavedChanges(true);

    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    saveTimeoutRef.current = setTimeout(() => {
      saveConfig(config);
    }, 1500);

    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [config]);

  const saveConfig = useCallback(async (configToSave: SalesPageConfig) => {
    try {
      setSaving(true);

      const { error } = await supabase
        .from("sales_page_config")
        .upsert({
          service_id: serviceId,
          professional_id: professionalId,
          config: configToSave as any,
          updated_at: new Date().toISOString(),
        }, {
          onConflict: 'service_id'
        });

      if (error) throw error;

      setHasUnsavedChanges(false);
      return true;
    } catch (error) {
      console.error("Error saving config:", error);
      toast.error("Erro ao salvar configurações");
      return false;
    } finally {
      setSaving(false);
    }
  }, [serviceId, professionalId]);

  const handleSaveNow = useCallback(async () => {
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
    const success = await saveConfig(configRef.current);
    if (success) {
      toast.success("Configurações salvas com sucesso!");
    }
  }, [saveConfig]);

  const handleConfigChange = useCallback((newConfig: SalesPageConfig) => {
    configRef.current = newConfig;
    setConfig(newConfig);
  }, []);

  const fetchData = async () => {
    try {
      // Fetch service
      const { data: serviceData, error: serviceError } = await supabase
        .from("services")
        .select("id, name, description, price_cents, product_config")
        .eq("id", serviceId)
        .single();

      if (serviceError) throw serviceError;
      setService({
        id: serviceData.id,
        name: serviceData.name,
        description: serviceData.description,
        price_cents: serviceData.price_cents,
        product_config: typeof serviceData.product_config === 'object' && serviceData.product_config !== null
          ? serviceData.product_config as Record<string, unknown>
          : undefined,
      });

      // Fetch profile
      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("id, full_name, avatar_url, bio, specialty, crp")
        .eq("id", professionalId)
        .single();

      if (!profileError && profileData) {
        setProfile(profileData);
      }

      // Fetch modules
      const { data: modulesData } = await supabase
        .from("member_modules")
        .select("id, title, description, is_published, order_index")
        .eq("professional_id", professionalId)
        .eq("is_published", true)
        .order("order_index");

      if (modulesData) {
        const { data: lessonsData } = await supabase
          .from("member_lessons")
          .select("id, module_id")
          .eq("professional_id", professionalId);

        const lessonsCount: Record<string, number> = {};
        (lessonsData || []).forEach((l: any) => {
          lessonsCount[l.module_id] = (lessonsCount[l.module_id] || 0) + 1;
        });

        setModules(modulesData.map((m: any) => ({
          id: m.id,
          title: m.title,
          description: m.description,
          lessons_count: lessonsCount[m.id] || 0,
        })));
      }

      // Fetch saved sales page config
      const { data: savedConfig, error: configError } = await supabase
        .from("sales_page_config")
        .select("config")
        .eq("service_id", serviceId)
        .maybeSingle();

      if (!configError && savedConfig?.config) {
        const saved = savedConfig.config as any;
        const mergedConfig: SalesPageConfig = normalizeSalesPageConfig({
          ...defaultSalesPageConfig,
          ...saved,
          colors: { ...defaultSalesPageConfig.colors, ...(saved.colors || {}) },
          layout: { ...defaultSalesPageConfig.layout, ...(saved.layout || {}) },
          hero: { ...defaultSalesPageConfig.hero, ...(saved.hero || {}) },
          content: { ...defaultSalesPageConfig.content, ...(saved.content || {}) },
          cta: { ...defaultSalesPageConfig.cta, ...(saved.cta || {}) },
          benefits: { ...defaultSalesPageConfig.benefits, ...(saved.benefits || {}) },
          guarantee: { ...defaultSalesPageConfig.guarantee, ...(saved.guarantee || {}) },
          instructor: { ...defaultSalesPageConfig.instructor, ...(saved.instructor || {}) },
          images: { ...defaultSalesPageConfig.images, ...(saved.images || {}) },
        });
        setConfig(mergedConfig);
        configRef.current = mergedConfig;
      }

      setTimeout(() => {
        initialLoadRef.current = false;
      }, 100);

    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Erro ao carregar dados");
    } finally {
      setLoading(false);
    }
  };

  const getSalesPageUrl = () => {
    return new URL(`/curso/${serviceId}`, window.location.origin).toString();
  };

  const openPreview = () => {
    window.open(getSalesPageUrl(), "_blank");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!service) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <p className="text-muted-foreground">Serviço não encontrado</p>
        <Button variant="outline" onClick={onBack}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Voltar
        </Button>
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-73px)]">
      {/* Editor Sidebar */}
      <div className="w-[340px] flex-shrink-0 overflow-y-auto border-r border-border bg-card">
        <SalesPageEditorSidebar
          config={config}
          onConfigChange={handleConfigChange}
          salesPageUrl={getSalesPageUrl()}
          onPreview={openPreview}
          onSaveNow={handleSaveNow}
          isSaving={saving}
          onBack={onBack}
          serviceName={service.name}
          professionalId={professionalId}
        />
      </div>

      {/* Preview Area */}
      <div className="flex-1 min-w-0 bg-muted/30 flex flex-col">
        {/* Device Mode Toolbar */}
        <div className="h-12 bg-card border-b border-border flex items-center justify-between px-4 flex-shrink-0">
          <div className="flex items-center gap-1 bg-muted/50 p-1 rounded-lg">
            <button
              onClick={() => setDeviceMode("desktop")}
              className={cn(
                "flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-all",
                deviceMode === "desktop"
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
              )}
            >
              <Monitor className="w-4 h-4" />
              <span className="hidden sm:inline">Desktop</span>
            </button>
            <button
              onClick={() => setDeviceMode("tablet")}
              className={cn(
                "flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-all",
                deviceMode === "tablet"
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
              )}
            >
              <Tablet className="w-4 h-4" />
              <span className="hidden sm:inline">Tablet</span>
            </button>
            <button
              onClick={() => setDeviceMode("mobile")}
              className={cn(
                "flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-all",
                deviceMode === "mobile"
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
              )}
            >
              <Smartphone className="w-4 h-4" />
              <span className="hidden sm:inline">Mobile</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            {/* Save Status Indicator */}
            <div className="flex items-center gap-1.5 text-xs">
              {saving ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-muted-foreground" />
                  <span className="text-muted-foreground">Salvando...</span>
                </>
              ) : hasUnsavedChanges ? (
                <>
                  <div className="w-2 h-2 rounded-full bg-amber-500" />
                  <span className="text-muted-foreground">Alterações não salvas</span>
                </>
              ) : (
                <>
                  <Save className="w-3.5 h-3.5 text-green-500" />
                  <span className="text-green-600">Salvo</span>
                </>
              )}
            </div>

            <button
              onClick={openPreview}
              className="flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-all"
            >
              <ExternalLink className="w-4 h-4" />
              <span className="hidden sm:inline">Abrir em nova aba</span>
            </button>
          </div>
        </div>

        {/* Preview Container */}
        <div className="flex-1 overflow-hidden flex items-start justify-center p-4 bg-muted/20">
          <div
            className={cn(
              "h-full bg-white rounded-xl overflow-hidden border border-border",
              "transition-all duration-500 ease-out transform-gpu",
              deviceMode === "desktop" && "shadow-2xl scale-100",
              deviceMode === "tablet" && "shadow-xl scale-100",
              deviceMode === "mobile" && "shadow-lg scale-100"
            )}
            style={{
              width: deviceWidths[deviceMode],
              maxWidth: "100%",
            }}
          >
            {/* Browser Mock Header */}
            <div className={cn(
              "bg-gray-100 border-b border-gray-200 flex items-center px-3 gap-2 flex-shrink-0 transition-all duration-300",
              deviceMode === "mobile" ? "h-7" : "h-8"
            )}>
              <div className="flex gap-1.5">
                <div className={cn(
                  "rounded-full bg-red-400 transition-all duration-300",
                  deviceMode === "mobile" ? "w-2 h-2" : "w-2.5 h-2.5"
                )}></div>
                <div className={cn(
                  "rounded-full bg-yellow-400 transition-all duration-300",
                  deviceMode === "mobile" ? "w-2 h-2" : "w-2.5 h-2.5"
                )}></div>
                <div className={cn(
                  "rounded-full bg-green-400 transition-all duration-300",
                  deviceMode === "mobile" ? "w-2 h-2" : "w-2.5 h-2.5"
                )}></div>
              </div>
              <div className="flex-1 mx-2">
                <div className={cn(
                  "bg-white rounded py-0.5 text-gray-500 mx-auto text-center truncate border border-gray-200 transition-all duration-300",
                  deviceMode === "mobile" ? "text-[8px] px-1.5 max-w-[140px]" : "text-[10px] px-2 max-w-xs"
                )}>
                  {getSalesPageUrl()}
                </div>
              </div>
            </div>

            {/* Preview Content */}
            <div className={cn(
              "overflow-hidden relative isolate transform-gpu transition-all duration-300",
              deviceMode === "mobile" ? "h-[calc(100%-28px)]" : "h-[calc(100%-32px)]"
            )}>
              <div className="h-full overflow-auto">
                <SalesPagePreview
                  service={service}
                  profile={profile}
                  modules={modules}
                  config={config}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SalesPageEditorPage;
