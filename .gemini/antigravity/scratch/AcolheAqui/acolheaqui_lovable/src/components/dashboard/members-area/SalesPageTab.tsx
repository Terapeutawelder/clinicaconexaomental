import { useState, useEffect } from "react";
import {
  ShoppingCart,
  ExternalLink,
  Copy,
  Check,
  Plus,
  Eye,
  Edit,
  MoreVertical,
  Tag,
  Loader2,
  ImageOff,
  Palette,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { getCanonicalUrl } from "@/lib/getCanonicalUrl";
import { useNavigate } from "react-router-dom";
import { SalesPageEditorPage } from "../sales-page";

interface Service {
  id: string;
  name: string;
  description: string | null;
  price_cents: number;
  is_active: boolean;
  product_config?: Record<string, unknown> | null;
}

interface SalesPageTabProps {
  professionalId: string | null;
}

const SalesPageTab = ({ professionalId }: SalesPageTabProps) => {
  const navigate = useNavigate();
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [editingServiceId, setEditingServiceId] = useState<string | null>(null);

  useEffect(() => {
    if (professionalId) {
      fetchServices();
    }
  }, [professionalId]);

  const fetchServices = async () => {
    try {
      const { data, error } = await supabase
        .from("services")
        .select("id, name, description, price_cents, is_active, product_config")
        .eq("professional_id", professionalId)
        .eq("service_type", "members_area")
        .order("created_at", { ascending: false });

      if (error) throw error;

      const typedServices: Service[] = (data || []).map((s) => ({
        id: s.id,
        name: s.name,
        description: s.description,
        price_cents: s.price_cents,
        is_active: s.is_active ?? true,
        product_config:
          typeof s.product_config === "object" && s.product_config !== null
            ? (s.product_config as Record<string, unknown>)
            : undefined,
      }));
      setServices(typedServices);
    } catch (error) {
      console.error("Error fetching services:", error);
      toast.error("Erro ao carregar serviços");
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (cents: number) => {
    return (cents / 100).toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
  };

  const handleCopyLink = async (serviceId: string) => {
    const url = getCanonicalUrl(`/curso/${serviceId}`);
    try {
      await navigator.clipboard.writeText(url);
      setCopiedId(serviceId);
      toast.success("Link copiado!");
      setTimeout(() => setCopiedId(null), 2000);
    } catch (error) {
      toast.error("Erro ao copiar link");
    }
  };

  const handleOpenSalesPage = (serviceId: string) => {
    const url = getCanonicalUrl(`/curso/${serviceId}`);
    window.open(url, "_blank");
  };

  const handleCreateProduct = () => {
    navigate("/dashboard?tab=checkout");
    toast.info(
      "Crie um novo produto do tipo 'Área de Membros' para gerar uma página de vendas."
    );
  };

  const handleEditProduct = (serviceId: string) => {
    navigate(`/dashboard?tab=checkout&edit=${serviceId}`);
  };

  const handleEditSalesPage = (serviceId: string) => {
    setEditingServiceId(serviceId);
  };

  // Show editor if editing a sales page
  if (editingServiceId && professionalId) {
    return (
      <SalesPageEditorPage
        serviceId={editingServiceId}
        professionalId={professionalId}
        onBack={() => setEditingServiceId(null)}
      />
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (services.length === 0) {
    return (
      <div className="text-center py-16 bg-gray-900/30 rounded-xl border border-dashed border-gray-700">
        <ShoppingCart className="w-16 h-16 text-gray-600 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-white mb-2">
          Nenhuma página de vendas
        </h3>
        <p className="text-gray-400 mb-6 max-w-md mx-auto">
          Crie um produto do tipo "Área de Membros" no Checkout para gerar
          automaticamente uma página de vendas para seu curso.
        </p>
        <Button
          onClick={handleCreateProduct}
          className="bg-primary hover:bg-primary/90"
        >
          <Plus className="w-4 h-4 mr-2" />
          Criar Produto
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-white">Páginas de Vendas</h3>
          <p className="text-sm text-gray-400">
            Gerencie e personalize as páginas de vendas dos seus cursos
          </p>
        </div>
        <Button
          onClick={handleCreateProduct}
          variant="outline"
          className="border-gray-700 text-gray-300 hover:text-white hover:bg-gray-800"
        >
          <Plus className="w-4 h-4 mr-2" />
          Novo Produto
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {services.map((service) => {
          const imageUrl = (service.product_config?.image_url as string) || null;
          const isCopied = copiedId === service.id;

          return (
            <Card
              key={service.id}
              className="bg-gray-900/50 border-gray-800 hover:border-gray-700 transition-colors overflow-hidden group"
            >
              {/* Image */}
              <div className="aspect-video relative bg-gray-800">
                {imageUrl ? (
                  <img
                    src={imageUrl}
                    alt={service.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/20 to-purple-600/20">
                    <ImageOff className="w-12 h-12 text-gray-600" />
                  </div>
                )}

                {/* Status Badge */}
                <Badge
                  className={`absolute top-3 right-3 ${
                    service.is_active
                      ? "bg-green-500/90 text-white"
                      : "bg-gray-600/90 text-gray-200"
                  }`}
                >
                  {service.is_active ? "Ativo" : "Inativo"}
                </Badge>

                {/* Hover overlay */}
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <Button
                    size="sm"
                    className="bg-primary hover:bg-primary/90"
                    onClick={() => handleEditSalesPage(service.id)}
                  >
                    <Palette className="w-4 h-4 mr-1" />
                    Editar Página
                  </Button>
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => handleOpenSalesPage(service.id)}
                  >
                    <Eye className="w-4 h-4 mr-1" />
                    Ver
                  </Button>
                </div>
              </div>

              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <h4 className="text-white font-semibold truncate">
                      {service.name}
                    </h4>
                    <p className="text-sm text-gray-400 truncate mt-1">
                      {service.description || "Sem descrição"}
                    </p>
                    <div className="flex items-center gap-2 mt-3">
                      <Tag className="w-4 h-4 text-primary" />
                      <span className="text-lg font-bold text-primary">
                        {formatPrice(service.price_cents)}
                      </span>
                    </div>
                  </div>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-gray-400 hover:text-white"
                      >
                        <MoreVertical className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                      align="end"
                      className="bg-gray-900 border-gray-800"
                    >
                      <DropdownMenuItem
                        onClick={() => handleEditSalesPage(service.id)}
                        className="cursor-pointer"
                      >
                        <Palette className="w-4 h-4 mr-2" />
                        Editar Página de Vendas
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleOpenSalesPage(service.id)}
                        className="cursor-pointer"
                      >
                        <ExternalLink className="w-4 h-4 mr-2" />
                        Abrir Página de Vendas
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleCopyLink(service.id)}
                        className="cursor-pointer"
                      >
                        <Copy className="w-4 h-4 mr-2" />
                        Copiar Link
                      </DropdownMenuItem>
                      <DropdownMenuSeparator className="bg-gray-800" />
                      <DropdownMenuItem
                        onClick={() => handleEditProduct(service.id)}
                        className="cursor-pointer"
                      >
                        <Edit className="w-4 h-4 mr-2" />
                        Editar Produto
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Info card */}
      <Card className="bg-primary/10 border-primary/20">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center shrink-0">
              <Palette className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h4 className="text-white font-medium mb-1">
                Personalize sua Página de Vendas
              </h4>
              <p className="text-sm text-gray-300">
                Clique em "Editar Página" para customizar cores, textos, benefícios e muito mais.
                A página exibe automaticamente os módulos e aulas publicados na sua Área de Membros.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SalesPageTab;
