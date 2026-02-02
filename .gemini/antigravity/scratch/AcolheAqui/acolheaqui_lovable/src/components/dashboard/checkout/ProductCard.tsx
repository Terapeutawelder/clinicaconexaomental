import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Pencil, Eye, Trash2, ImageOff, ChevronDown, Calendar, FileText, GraduationCap, ExternalLink, Copy, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { getCanonicalUrl } from "@/lib/getCanonicalUrl";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface ProductCardProps {
  id: string;
  name: string;
  price_cents: number;
  image_url?: string | null;
  gateway_type?: string;
  is_active?: boolean;
  service_type?: "session" | "members_area";
  onEdit: () => void;
  onEditCheckout: () => void;
  onCopySimpleLink: () => void;
  onCopyFullLink: () => void;
  onDelete: () => void;
}

const ProductCard = ({
  id,
  name,
  price_cents,
  image_url,
  gateway_type,
  is_active = true,
  service_type = "session",
  onEdit,
  onEditCheckout,
  onCopySimpleLink,
  onCopyFullLink,
  onDelete,
}: ProductCardProps) => {
  const [showActions, setShowActions] = useState(false);
  const [salesLinkCopied, setSalesLinkCopied] = useState(false);

  const isMembersArea = service_type === "members_area";

  const handleCopySalesLink = () => {
    const url = getCanonicalUrl(`/curso/${id}`);
    navigator.clipboard.writeText(url);
    setSalesLinkCopied(true);
    toast.success("Link da página de vendas copiado!");
    setTimeout(() => setSalesLinkCopied(false), 2000);
  };

  const handleOpenSalesPage = () => {
    const url = getCanonicalUrl(`/curso/${id}`);
    window.open(url, "_blank");
  };

  const formatPrice = (cents: number) => {
    return (cents / 100).toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
  };

  const getGatewayInfo = (type: string) => {
    switch (type) {
      case "mercadopago":
      case "mercado_pago": return { label: "MERCADO PAGO", color: "bg-blue-500" };
      case "stripe": return { label: "STRIPE", color: "bg-purple-600" };
      case "pagarme": return { label: "PAGAR.ME", color: "bg-green-600" };
      case "pagseguro": return { label: "PAGSEGURO", color: "bg-yellow-500" };
      case "asaas": return { label: "ASAAS", color: "bg-orange-500" };
      case "pushinpay": 
      default: return { label: "PUSHINPAY", color: "bg-primary" };
    }
  };
  
  const gatewayInfo = getGatewayInfo(gateway_type || "pushinpay");

  return (
    <Card
      className={cn(
        "group relative overflow-hidden border-border shadow-md hover:shadow-xl transition-all duration-300 cursor-pointer bg-card",
        !is_active && "opacity-60"
      )}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      {/* Image area */}
      <div className="relative aspect-[4/3] bg-gradient-to-br from-muted to-muted/80 overflow-hidden">
        {image_url ? (
          <img
            src={image_url}
            alt={name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <div className="text-center text-muted-foreground">
              <ImageOff className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <span className="text-sm">Sem capa</span>
            </div>
          </div>
        )}

        {/* Service Type Badge */}
        {isMembersArea && (
          <Badge className="absolute top-3 left-3 bg-purple-600 text-white border-0 shadow-lg gap-1">
            <GraduationCap className="h-3 w-3" />
            Curso
          </Badge>
        )}

        {/* Gateway Badge */}
        <div className={cn("absolute top-3 right-3 px-2.5 py-1 rounded text-[10px] font-bold text-white shadow-lg", gatewayInfo.color)}>
          {gatewayInfo.label}
        </div>

        {/* Hover Actions */}
        <div
          className={cn(
            "absolute inset-0 bg-black/60 flex items-center justify-center gap-2 transition-opacity duration-200",
            showActions ? "opacity-100" : "opacity-0 pointer-events-none"
          )}
        >
          <Button
            size="icon"
            variant="secondary"
            className="h-10 w-10 rounded-full bg-card hover:bg-card/90 text-foreground"
            onClick={(e) => {
              e.stopPropagation();
              onEdit();
            }}
          >
            <Pencil className="h-4 w-4" />
          </Button>
          <Button
            size="icon"
            variant="secondary"
            className="h-10 w-10 rounded-full bg-primary hover:bg-primary/90 text-primary-foreground"
            onClick={(e) => {
              e.stopPropagation();
              onEditCheckout();
            }}
          >
            <Eye className="h-4 w-4" />
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                size="sm"
                variant="secondary"
                className="h-10 px-3 rounded-full bg-card hover:bg-card/90 text-foreground gap-1"
                onClick={(e) => e.stopPropagation()}
              >
                <span className="text-xs">Link</span>
                <ChevronDown className="h-3 w-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="center" className="w-56">
              {isMembersArea ? (
                <>
                  <DropdownMenuItem 
                    onClick={(e) => {
                      e.stopPropagation();
                      handleCopySalesLink();
                    }}
                    className="cursor-pointer"
                  >
                    {salesLinkCopied ? (
                      <Check className="h-4 w-4 mr-2 text-green-500" />
                    ) : (
                      <Copy className="h-4 w-4 mr-2" />
                    )}
                    <div className="flex flex-col">
                      <span>Copiar Link de Vendas</span>
                      <span className="text-xs text-muted-foreground">Página do curso</span>
                    </div>
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={(e) => {
                      e.stopPropagation();
                      handleOpenSalesPage();
                    }}
                    className="cursor-pointer"
                  >
                    <ExternalLink className="h-4 w-4 mr-2" />
                    <div className="flex flex-col">
                      <span>Abrir Página de Vendas</span>
                      <span className="text-xs text-muted-foreground">Nova aba</span>
                    </div>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem 
                    onClick={(e) => {
                      e.stopPropagation();
                      onCopyFullLink();
                    }}
                    className="cursor-pointer"
                  >
                    <FileText className="h-4 w-4 mr-2" />
                    <div className="flex flex-col">
                      <span>Link Direto de Checkout</span>
                      <span className="text-xs text-muted-foreground">Pagamento direto</span>
                    </div>
                  </DropdownMenuItem>
                </>
              ) : (
                <>
                  <DropdownMenuItem 
                    onClick={(e) => {
                      e.stopPropagation();
                      onCopySimpleLink();
                    }}
                    className="cursor-pointer"
                  >
                    <FileText className="h-4 w-4 mr-2" />
                    <div className="flex flex-col">
                      <span>Checkout da Landing Page</span>
                      <span className="text-xs text-muted-foreground">Sem calendário</span>
                    </div>
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={(e) => {
                      e.stopPropagation();
                      onCopyFullLink();
                    }}
                    className="cursor-pointer"
                  >
                    <Calendar className="h-4 w-4 mr-2" />
                    <div className="flex flex-col">
                      <span>Checkout Completo</span>
                      <span className="text-xs text-muted-foreground">Com calendário</span>
                    </div>
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
          <Button
            size="icon"
            variant="secondary"
            className="h-10 w-10 rounded-full bg-destructive hover:bg-destructive/90 text-destructive-foreground"
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Info */}
      <CardContent className="p-4 bg-card">
        <h3 className="font-semibold text-foreground truncate mb-3">{name}</h3>
        <div className="flex items-center justify-between">
          <div>
            <span className="text-xs text-muted-foreground uppercase tracking-wide">PREÇO</span>
            <p className="text-lg font-bold text-primary">{formatPrice(price_cents)}</p>
          </div>
          <div className="text-muted-foreground/50">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProductCard;
