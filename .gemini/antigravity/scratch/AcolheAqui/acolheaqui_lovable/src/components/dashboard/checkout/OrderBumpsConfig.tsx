import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Plus, 
  Trash2, 
  GripVertical, 
  Tag,
  Loader2,
  Package
} from "lucide-react";

interface OrderBumpsConfigProps {
  profileId: string;
  mainServiceId: string;
}

interface Service {
  id: string;
  name: string;
  price_cents: number;
}

interface OrderBump {
  id: string;
  offer_service_id: string;
  headline: string;
  description: string;
  is_active: boolean;
  order: number;
}

const OrderBumpsConfig = ({ profileId, mainServiceId }: OrderBumpsConfigProps) => {
  const [isLoading, setIsLoading] = useState(true);
  const [services, setServices] = useState<Service[]>([]);
  const [orderBumps, setOrderBumps] = useState<OrderBump[]>([]);

  useEffect(() => {
    fetchServices();
  }, [profileId, mainServiceId]);

  const fetchServices = async () => {
    try {
      const { data, error } = await supabase
        .from("services")
        .select("id, name, price_cents")
        .eq("professional_id", profileId)
        .eq("is_active", true)
        .neq("id", mainServiceId);

      if (error) throw error;

      setServices(data || []);
    } catch (error) {
      console.error("Error fetching services:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatPrice = (cents: number) => {
    return (cents / 100).toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
  };

  const addOrderBump = () => {
    const newBump: OrderBump = {
      id: `temp-${Date.now()}`,
      offer_service_id: "",
      headline: "Sim, quero aproveitar esta oferta!",
      description: "",
      is_active: true,
      order: orderBumps.length,
    };
    setOrderBumps([...orderBumps, newBump]);
  };

  const removeOrderBump = (id: string) => {
    setOrderBumps(orderBumps.filter(b => b.id !== id));
  };

  const updateOrderBump = (id: string, field: keyof OrderBump, value: any) => {
    setOrderBumps(orderBumps.map(b => 
      b.id === id ? { ...b, [field]: value } : b
    ));
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <Card className="bg-card border-border/50">
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Tag className="h-5 w-5 text-primary" />
          Order Bumps
        </CardTitle>
        <CardDescription>
          Adicione ofertas extras que aparecem antes do pagamento
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {services.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Package className="h-10 w-10 mx-auto mb-3 opacity-50" />
            <p>Cadastre mais serviços para usar como Order Bumps</p>
          </div>
        ) : (
          <>
            {orderBumps.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground border border-dashed border-border rounded-lg">
                <Tag className="h-10 w-10 mx-auto mb-3 opacity-50" />
                <p className="mb-4">Nenhum Order Bump configurado</p>
                <Button onClick={addOrderBump} variant="outline">
                  <Plus className="h-4 w-4 mr-2" />
                  Adicionar Oferta
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {orderBumps.map((bump, index) => (
                  <Card key={bump.id} className="bg-muted/30 border-border/30">
                    <CardContent className="pt-4 space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <GripVertical className="h-5 w-5 text-muted-foreground cursor-grab" />
                          <span className="font-medium">Oferta #{index + 1}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Switch
                            checked={bump.is_active}
                            onCheckedChange={v => updateOrderBump(bump.id, "is_active", v)}
                          />
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => removeOrderBump(bump.id)}
                            className="text-destructive hover:text-destructive hover:bg-destructive/10"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label>Serviço da Oferta</Label>
                        <Select
                          value={bump.offer_service_id}
                          onValueChange={v => updateOrderBump(bump.id, "offer_service_id", v)}
                        >
                          <SelectTrigger className="bg-background border-border/50">
                            <SelectValue placeholder="Selecione um serviço" />
                          </SelectTrigger>
                          <SelectContent>
                            {services.map(service => (
                              <SelectItem key={service.id} value={service.id}>
                                {service.name} - {formatPrice(service.price_cents)}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label>Título da Oferta</Label>
                        <Input
                          value={bump.headline}
                          onChange={e => updateOrderBump(bump.id, "headline", e.target.value)}
                          placeholder="Sim, quero aproveitar esta oferta!"
                          className="bg-background border-border/50"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>Descrição (opcional)</Label>
                        <Textarea
                          value={bump.description}
                          onChange={e => updateOrderBump(bump.id, "description", e.target.value)}
                          placeholder="Descreva os benefícios desta oferta..."
                          className="bg-background border-border/50 resize-none"
                          rows={2}
                        />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {orderBumps.length > 0 && orderBumps.length < services.length && (
              <Button onClick={addOrderBump} variant="outline" className="w-full">
                <Plus className="h-4 w-4 mr-2" />
                Adicionar Mais Ofertas
              </Button>
            )}
          </>
        )}

        {/* Info */}
        <div className="bg-primary/10 rounded-lg p-4 text-sm">
          <p className="text-foreground">
            <strong>Dica:</strong> Order Bumps são ofertas exibidas antes do pagamento. 
            Elas aumentam o ticket médio oferecendo serviços complementares.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default OrderBumpsConfig;
