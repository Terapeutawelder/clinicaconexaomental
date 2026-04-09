import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Loader2, Plus } from "lucide-react";
import ProductCard from "../dashboard/checkout/ProductCard";
import AdminProductEditModal from "./AdminProductEditModal";
import CheckoutEditorPage from "../dashboard/checkout/CheckoutEditorPage";

interface Service {
  id: string;
  name: string;
  description: string | null;
  duration_minutes: number;
  price_cents: number;
  is_active: boolean;
  service_type: "session" | "members_area";
  product_config?: Record<string, unknown>;
  checkout_config?: Record<string, unknown>;
}

const AdminServices = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [services, setServices] = useState<Service[]>([]);
  const [userId, setUserId] = useState<string>("");
  const [gatewayType, setGatewayType] = useState("pushinpay");
  
  // Modal states
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  
  // Editor state
  const [editingCheckoutServiceId, setEditingCheckoutServiceId] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // Get user ID
      const { data: { user } } = await supabase.auth.getUser();
      if (user) setUserId(user.id);

      // Fetch global services (professional_id IS NULL)
      const { data: servicesData, error: servicesError } = await supabase
        .from("services")
        .select("*")
        .is("professional_id", null)
        .order("created_at", { ascending: false });

      if (servicesError) throw servicesError;
      
      // Type-safe mapping
      const typedServices: Service[] = (servicesData || []).map(s => ({
        id: s.id,
        name: s.name,
        description: s.description,
        duration_minutes: s.duration_minutes,
        price_cents: s.price_cents,
        is_active: s.is_active ?? true,
        service_type: (s.service_type as "session" | "members_area") || "session",
        product_config: typeof s.product_config === 'object' ? s.product_config as Record<string, unknown> : undefined,
        checkout_config: typeof s.checkout_config === 'object' ? s.checkout_config as Record<string, unknown> : undefined,
      }));
      
      setServices(typedServices);
      
      // Default gateway UI
      setGatewayType("mercadopago");
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (serviceId: string) => {
    if (!confirm("Tem certeza que deseja excluir este serviço?")) return;

    try {
      const { error } = await supabase
        .from("services")
        .delete()
        .eq("id", serviceId);

      if (error) throw error;

      setServices(prev => prev.filter(s => s.id !== serviceId));
      toast.success("Serviço excluído com sucesso!");
    } catch (error) {
      console.error("Error deleting service:", error);
      toast.error("Erro ao excluir serviço");
    }
  };

  const getServiceCheckoutUrl = (service: Service, mode: "simple" | "full") => {
    // Always copy the canonical production domain (avoids preview/staging origins)
    const baseUrl = "https://www.acolheaqui.com.br";
    const domainType = String((service.checkout_config as any)?.domainType || "default");
    const userSlug = String((service.checkout_config as any)?.userSlug || "");

    const hasSubpath = domainType === "subpath" && !!userSlug;
    let url = hasSubpath
      ? `${baseUrl}/${userSlug}/checkout/${service.id}`
      : `${baseUrl}/checkout/${service.id}`;

    if (mode === "simple") url += "?mode=simple";
    return url;
  };

  const handleCopySimpleLink = (service: Service) => {
    const url = getServiceCheckoutUrl(service, "simple");
    navigator.clipboard.writeText(url);
    toast.success("Link do Checkout da Landing Page copiado!");
  };

  const handleCopyFullLink = (service: Service) => {
    const url = getServiceCheckoutUrl(service, "full");
    navigator.clipboard.writeText(url);
    toast.success("Link do Checkout Completo copiado!");
  };

  const openNewProductModal = () => {
    setEditingService(null);
    setEditModalOpen(true);
  };

  const openEditProductModal = (service: Service) => {
    setEditingService(service);
    setEditModalOpen(true);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Show Checkout Editor
  if (editingCheckoutServiceId) {
    return (
      <CheckoutEditorPage
        profileId={userId} // We pass userId but it's ignored due to isGlobalService
        serviceId={editingCheckoutServiceId}
        isGlobalService={true}
        onBack={() => setEditingCheckoutServiceId(null)}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Serviços Globais da Clínica</h2>
          <p className="text-muted-foreground">Estes serviços estarão disponíveis nos checkouts de todos os profissionais.</p>
        </div>
        <Button
          onClick={openNewProductModal}
          className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold px-6"
        >
          <Plus className="h-4 w-4 mr-2" />
          Novo Serviço
        </Button>
      </div>

      {/* Services Grid */}
      {services.length === 0 ? (
        <div className="bg-card rounded-xl border border-border/50 p-12 text-center">
          <div className="text-6xl mb-4">📦</div>
          <h3 className="text-lg font-medium text-foreground mb-2">Nenhum serviço cadastrado</h3>
          <p className="text-muted-foreground mb-6">Crie seu primeiro serviço para começar a vender</p>
          <Button
            onClick={openNewProductModal}
            className="bg-primary hover:bg-primary/90 text-primary-foreground"
          >
            <Plus className="h-4 w-4 mr-2" />
            Criar Primeiro Serviço
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((service) => (
            <ProductCard
              key={service.id}
              id={service.id}
              name={service.name}
              price_cents={service.price_cents}
              image_url={(service.product_config as Record<string, unknown> | undefined)?.image_url as string | undefined}
              gateway_type={gatewayType}
              is_active={service.is_active}
              service_type={service.service_type}
              onEdit={() => openEditProductModal(service)}
              onEditCheckout={() => setEditingCheckoutServiceId(service.id)}
              onCopySimpleLink={() => handleCopySimpleLink(service)}
              onCopyFullLink={() => handleCopyFullLink(service)}
              onDelete={() => handleDelete(service.id)}
            />
          ))}
        </div>
      )}

      {/* Edit Modal */}
      <AdminProductEditModal
        open={editModalOpen}
        onOpenChange={setEditModalOpen}
        service={editingService ? {
          id: editingService.id,
          name: editingService.name,
          description: editingService.description || "",
          price_cents: editingService.price_cents,
          duration_minutes: editingService.duration_minutes,
          is_active: editingService.is_active,
          image_url: (editingService.product_config as Record<string, unknown> | undefined)?.image_url as string | undefined,
          product_config: editingService.product_config ? {
            delivery_type: ((editingService.product_config as Record<string, unknown>)?.delivery_type as "none" | "pdf" | "link") || "none",
            pdf_url: (editingService.product_config as Record<string, unknown>)?.pdf_url as string | undefined,
            pdf_name: (editingService.product_config as Record<string, unknown>)?.pdf_name as string | undefined,
            redirect_url: (editingService.product_config as Record<string, unknown>)?.redirect_url as string | undefined,
          } : undefined,
        } : null}
        userId={userId}
        onSave={fetchData}
      />
    </div>
  );
};

export default AdminServices;
