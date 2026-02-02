import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import SalesPagePreview, { 
  SalesPageConfig, 
  defaultSalesPageConfig 
} from "@/components/dashboard/sales-page/SalesPagePreview";
import { normalizeSalesPageConfig } from "@/components/dashboard/sales-page/configNormalization";

interface Service {
  id: string;
  name: string;
  description: string | null;
  price_cents: number;
  product_config?: Record<string, unknown>;
}

interface Profile {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  bio: string | null;
  specialty: string | null;
  crp: string | null;
}

interface Module {
  id: string;
  title: string;
  description: string | null;
  lessons_count: number;
}

const CursoVenda = () => {
  const { serviceId } = useParams();
  const navigate = useNavigate();
  const [service, setService] = useState<Service | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [modules, setModules] = useState<Module[]>([]);
  const [config, setConfig] = useState<SalesPageConfig>(defaultSalesPageConfig);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (serviceId) {
      fetchData();
    }
  }, [serviceId]);

  const fetchData = async () => {
    try {
      // Fetch service
      const { data: serviceData, error: serviceError } = await supabase
        .from("public_services")
        .select("*")
        .eq("id", serviceId)
        .eq("is_active", true)
        .maybeSingle();

      if (serviceError) throw serviceError;
      if (!serviceData) {
        toast.error("Serviço não encontrado");
        navigate("/");
        return;
      }

      setService({
        id: serviceData.id,
        name: serviceData.name || "",
        description: serviceData.description,
        price_cents: serviceData.price_cents || 0,
        product_config: serviceData.product_config as Record<string, unknown> | undefined,
      });

      // Fetch professional profile
      // Try public view first, fallback to profiles table if empty
      if (serviceData.professional_id) {
        let profileData = null;
        
        // First try public view
        const { data: publicProfile } = await supabase
          .from("public_professional_profiles")
          .select("*")
          .eq("id", serviceData.professional_id)
          .maybeSingle();
        
        if (publicProfile) {
          profileData = publicProfile;
        } else {
          // Fallback: fetch from profiles table directly
          const { data: directProfile } = await supabase
            .from("profiles")
            .select("id, full_name, avatar_url, bio, specialty, crp")
            .eq("id", serviceData.professional_id)
            .eq("is_professional", true)
            .maybeSingle();
          
          profileData = directProfile;
        }

        if (profileData) {
          setProfile({
            id: profileData.id || "",
            full_name: profileData.full_name,
            avatar_url: profileData.avatar_url,
            bio: profileData.bio,
            specialty: profileData.specialty,
            crp: profileData.crp,
          });
        }

        // Fetch modules (only published ones)
        const { data: modulesData } = await supabase
          .from("member_modules")
          .select("id, title, description, is_published, order_index")
          .eq("professional_id", serviceData.professional_id)
          .eq("is_published", true)
          .order("order_index");

        if (modulesData) {
          // Fetch lessons to count per module
          const { data: lessonsData } = await supabase
            .from("member_lessons")
            .select("id, module_id")
            .eq("professional_id", serviceData.professional_id);

          const lessonsCount: Record<string, number> = {};
          (lessonsData || []).forEach((lesson: any) => {
            lessonsCount[lesson.module_id] = (lessonsCount[lesson.module_id] || 0) + 1;
          });

          setModules(modulesData.map((mod: any) => ({
            id: mod.id,
            title: mod.title,
            description: mod.description,
            lessons_count: lessonsCount[mod.id] || 0,
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
          const mergedConfig: SalesPageConfig = {
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
          };
          setConfig(normalizeSalesPageConfig(mergedConfig));
        }
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Erro ao carregar dados");
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
      </div>
    );
  }

  if (!service) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-2">Curso não encontrado</h1>
          <p className="text-gray-400 mb-4">O curso que você está procurando não existe ou foi removido.</p>
          <Button onClick={() => navigate("/")}>Voltar ao início</Button>
        </div>
      </div>
    );
  }

  return (
    <SalesPagePreview
      service={service}
      profile={profile}
      modules={modules}
      config={config}
    />
  );
};

export default CursoVenda;
