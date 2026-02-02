import { useState, useEffect, useCallback, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import LandingPagePreview, { defaultConfig, LandingPageConfig } from "./LandingPagePreview";
import EditorSidebar from "./EditorSidebar";
import { Monitor, Tablet, Smartphone, ExternalLink, Save, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { getProfileUrl as getCanonicalProfileUrl } from "@/lib/getCanonicalUrl";

interface LandingPageEditorPageProps {
  profileId: string;
}

type DeviceMode = "desktop" | "tablet" | "mobile";

const deviceWidths: Record<DeviceMode, string> = {
  desktop: "100%",
  tablet: "768px",
  mobile: "375px",
};

const LandingPageEditorPage = ({ profileId }: LandingPageEditorPageProps) => {
  const [profile, setProfile] = useState<any>(null);
  const [services, setServices] = useState<any[]>([]);
  const [testimonials, setTestimonials] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [config, setConfig] = useState<LandingPageConfig>(defaultConfig);
  const [deviceMode, setDeviceMode] = useState<DeviceMode>("desktop");
  const [customDomain, setCustomDomain] = useState<string | null>(null);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const initialLoadRef = useRef(true);
  const configRef = useRef<LandingPageConfig>(defaultConfig);
  
  useEffect(() => {
    fetchData();
    fetchCustomDomain();
  }, [profileId]);

  // Auto-save with debounce when config changes
  useEffect(() => {
    if (initialLoadRef.current) return;
    
    setHasUnsavedChanges(true);
    
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
    
    saveTimeoutRef.current = setTimeout(() => {
      saveConfig(config);
    }, 1500); // Auto-save after 1.5 seconds of inactivity
    
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [config]);

  const saveConfig = useCallback(async (configToSave: LandingPageConfig) => {
    try {
      setSaving(true);
      
      const { error } = await supabase
        .from("landing_page_config")
        .upsert({
          professional_id: profileId,
          config: configToSave as any,
          updated_at: new Date().toISOString(),
        }, {
          onConflict: 'professional_id'
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
  }, [profileId]);

  const handleSaveNow = useCallback(async () => {
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
    // Use configRef to always get the latest config
    const success = await saveConfig(configRef.current);
    if (success) {
      toast.success("Configurações salvas com sucesso!");
    }
  }, [saveConfig]);

  // Keep configRef in sync with config state
  const handleConfigChange = useCallback((newConfig: LandingPageConfig) => {
    configRef.current = newConfig;
    setConfig(newConfig);
  }, []);
  const fetchData = async () => {
    try {
      // Fetch profile
      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", profileId)
        .single();

      if (profileError) throw profileError;
      setProfile(profileData);

      // Fetch services
      const { data: servicesData, error: servicesError } = await supabase
        .from("services")
        .select("*")
        .eq("professional_id", profileId)
        .eq("is_active", true)
        .order("price_cents", { ascending: true });

      if (servicesError) throw servicesError;
      setServices(servicesData || []);

      // Fetch testimonials
      const { data: testimonialsData, error: testimonialsError } = await supabase
        .from("testimonials")
        .select("*")
        .eq("professional_id", profileId)
        .eq("is_approved", true)
        .order("is_featured", { ascending: false })
        .limit(6);

      if (!testimonialsError && testimonialsData) {
        setTestimonials(testimonialsData);
      }

      // Fetch saved landing page config
      const { data: savedConfig, error: configError } = await supabase
        .from("landing_page_config")
        .select("config")
        .eq("professional_id", profileId)
        .maybeSingle();

      if (!configError && savedConfig?.config) {
        // Merge saved config with defaults to ensure new fields are included
        const saved = savedConfig.config as any;
        const mergedConfig: LandingPageConfig = {
          ...defaultConfig,
          ...saved,
          colors: { ...defaultConfig.colors, ...(saved.colors || {}) },
          hero: { ...defaultConfig.hero, ...(saved.hero || {}) },
          services: { ...defaultConfig.services, ...(saved.services || {}) },
          about: { ...defaultConfig.about, ...(saved.about || {}) },
          testimonials: { ...defaultConfig.testimonials, ...(saved.testimonials || {}) },
          faq: { 
            ...defaultConfig.faq, 
            ...(saved.faq || {}),
            items: saved.faq?.items || defaultConfig.faq.items,
          },
          contact: { ...defaultConfig.contact, ...(saved.contact || {}) },
          footer: { 
            description: saved.footer?.description ?? defaultConfig.footer?.description ?? "",
            copyright: saved.footer?.copyright ?? defaultConfig.footer?.copyright ?? "Todos os direitos reservados.",
          },
          images: { ...defaultConfig.images, ...(saved.images || {}) },
          layout: { 
            ...defaultConfig.layout, 
            ...(saved.layout || {}),
            sectionOrder: saved.layout?.sectionOrder || defaultConfig.layout?.sectionOrder,
          },
        };
        setConfig(mergedConfig);
        configRef.current = mergedConfig;
      } else if (profileData) {
        // No saved config, set defaults with profile contact info
        const newConfig = {
          ...defaultConfig,
          contact: {
            ...defaultConfig.contact,
            phone: profileData.phone || defaultConfig.contact.phone,
            email: profileData.email || defaultConfig.contact.email,
          }
        };
        setConfig(newConfig);
        configRef.current = newConfig;
      }

      // Mark initial load as complete
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

  const fetchCustomDomain = async () => {
    try {
      const { data, error } = await supabase
        .from("custom_domains")
        .select("domain")
        .eq("professional_id", profileId)
        .eq("status", "active")
        .eq("is_primary", true)
        .maybeSingle();

      if (!error && data?.domain) {
        setCustomDomain(data.domain);
      }
    } catch (error) {
      console.error("Error fetching custom domain:", error);
    }
  };

  const getProfileUrl = () => {
    // Use custom domain if available and active
    if (customDomain) {
      const slug = profile?.user_slug || profileId;
      return `https://${customDomain}/site/${slug}`;
    }
    
    // Fallback to published URL
    if (profile?.user_slug) {
      return getCanonicalProfileUrl(profile.user_slug);
    }
    return getCanonicalProfileUrl(profileId);
  };

  const openPreview = () => {
    window.open(getProfileUrl(), "_blank");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-73px)]">
      {/* Editor Sidebar */}
      <div className="w-[340px] flex-shrink-0 overflow-y-auto p-4 border-r border-border bg-card">
        <EditorSidebar 
          config={config}
          onConfigChange={handleConfigChange}
          profileUrl={getProfileUrl()}
          onPreview={openPreview}
          onSaveNow={handleSaveNow}
          isSaving={saving}
          profileId={profileId}
          currentAvatarUrl={profile?.avatar_url}
        />
      </div>

      {/* Preview Area - Full bleed */}
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
                  {getProfileUrl()}
                </div>
              </div>
            </div>

            {/* Preview Content - Scoped so fixed elements don't escape */}
            <div className={cn(
              "overflow-hidden relative isolate preview-light-theme transform-gpu transition-all duration-300",
              deviceMode === "mobile" ? "h-[calc(100%-28px)]" : "h-[calc(100%-32px)]"
            )}>
              <div className="h-full overflow-auto">
                <LandingPagePreview
                  profile={profile}
                  services={services}
                  testimonials={testimonials}
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

export default LandingPageEditorPage;
