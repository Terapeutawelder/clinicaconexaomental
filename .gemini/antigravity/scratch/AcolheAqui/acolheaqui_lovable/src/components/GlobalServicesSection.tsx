import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Loader2, Clock, ChevronRight, User } from "lucide-react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import BookingCalendar from "@/components/booking/BookingCalendar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useNavigate } from "react-router-dom";

interface GlobalService {
  id: string;
  name: string;
  description: string | null;
  price_cents: number;
  duration_minutes: number;
  product_config: any;
}

interface Professional {
  id: string;
  full_name: string;
  avatar_url: string | null;
  specialty: string | null;
  availableHours?: any[];
}

const GlobalServicesSection = () => {
  const navigate = useNavigate();
  const [services, setServices] = useState<GlobalService[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [selectedService, setSelectedService] = useState<GlobalService | null>(null);
  const [step, setStep] = useState<"service" | "professional" | "booking">("service");
  
  const [professionals, setProfessionals] = useState<Professional[]>([]);
  const [isLoadingProfessionals, setIsLoadingProfessionals] = useState(false);
  const [selectedProfessional, setSelectedProfessional] = useState<Professional | null>(null);

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const { data, error } = await (supabase
          .from("services") as any)
          .select("*")
          .is("professional_id", null)
          .eq("is_active", true)
          .eq("service_type", "session");

        if (error) throw error;
        setServices(data || []);
      } catch (error) {
        console.error("Error fetching global services:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchServices();
  }, []);

  const handleAgendarClick = async (service: GlobalService) => {
    setSelectedService(service);
    setStep("professional");
    setIsLoadingProfessionals(true);
    
    try {
      const allowedIds = service.product_config?.allowed_professionals || [];
      
      let query = (supabase
        .from("profiles") as any)
        .select("id, full_name, avatar_url, specialty")
        .eq("role", "professional");
      
      if (allowedIds.length > 0) {
        query = query.in("id", allowedIds);
      }

      const { data, error } = await query;
      if (error) throw error;
      
      // Fetch availability for these professionals
      const { data: availability } = await supabase
        .from("available_hours")
        .select("*")
        .in("professional_id", data?.map(p => p.id) || [])
        .eq("is_active", true);

      const proWithAvailability = (data || []).map(p => ({
        ...p,
        availableHours: availability?.filter(a => a.professional_id === p.id) || []
      }));

      setProfessionals(proWithAvailability);
    } catch (error) {
      console.error("Error fetching professionals:", error);
      toast.error("Erro ao carregar profissionais");
    } finally {
      setIsLoadingProfessionals(false);
    }
  };

  const handleSelectProfessional = (prof: Professional) => {
    if (!prof.availableHours || prof.availableHours.length === 0) {
      toast.error("Este profissional não possui horários configurados");
      return;
    }
    setSelectedProfessional(prof);
    setStep("booking");
  };

  const handleBookingComplete = (selections: { date: string; time: string }[], clientData: { name: string; email: string; phone: string; notes: string }) => {
    if (!selectedService || !selectedProfessional) return;
    
    // Store in session storage or pass via state to checkout
    // For now, redirect to checkout with params
    const slotsParam = encodeURIComponent(JSON.stringify(selections));
    const clientParam = encodeURIComponent(JSON.stringify(clientData));
    
    navigate(`/checkout/${selectedService.id}?professionalId=${selectedProfessional.id}&slots=${slotsParam}&client=${clientParam}`);
  };

  const formatPrice = (cents: number) => {
    return (cents / 100).toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
  };

  if (isLoading) {
    return (
      <div className="py-20 flex justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (services.length === 0) return null;

  return (
    <section className="py-20 bg-background overflow-hidden">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">Serviços de Psicoterapia</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Atendimento especializado para o seu bem-estar emocional e mental.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((service) => (
            <div 
              key={service.id}
              className="group bg-card rounded-2xl border border-border/50 p-6 hover:border-primary/50 transition-all duration-300 hover:shadow-xl flex flex-col"
            >
              {service.product_config?.image_url && (
                <div className="aspect-[16/9] rounded-xl overflow-hidden mb-6">
                  <img 
                    src={service.product_config.image_url} 
                    alt={service.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
              )}
              
              <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-xl font-bold text-foreground">{service.name}</h3>
                  {service.product_config?.is_package && (
                    <span className="px-2 py-1 bg-primary/10 text-primary rounded-full text-[10px] font-bold uppercase">
                      Pacote
                    </span>
                  )}
                </div>
                <p className="text-muted-foreground text-sm mb-4 line-clamp-3">
                  {service.description}
                </p>
                
                <div className="flex items-center gap-4 text-sm text-muted-foreground mb-6">
                  <div className="flex items-center gap-1.5">
                    <Clock size={16} className="text-primary" />
                    <span>{service.duration_minutes} min</span>
                  </div>
                  {service.product_config?.is_package && (
                    <div className="flex items-center gap-1.5 text-primary font-medium">
                      <span>{service.product_config.package_sessions} sessões</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-between pt-6 border-t border-border/50">
                <div className="text-2xl font-bold text-primary">
                  {formatPrice(service.price_cents)}
                </div>
                <Button 
                  onClick={() => handleAgendarClick(service)}
                  className="bg-primary hover:bg-primary/90 text-white rounded-full group/btn"
                >
                  Agendar
                  <ChevronRight size={18} className="ml-1 group-hover/btn:translate-x-1 transition-transform" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Selection Modal */}
      <Dialog 
        open={!!selectedService} 
        onOpenChange={(open) => {
          if (!open) {
            setSelectedService(null);
            setStep("service");
            setSelectedProfessional(null);
          }
        }}
      >
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-primary">
              {step === "professional" ? "Escolha um Profissional" : "Selecione data e horário"}
            </DialogTitle>
          </DialogHeader>

          {step === "professional" && (
            <div className="space-y-4 py-4">
              {isLoadingProfessionals ? (
                <div className="flex justify-center py-10">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-3">
                  {professionals.map((prof) => (
                    <div 
                      key={prof.id}
                      onClick={() => handleSelectProfessional(prof)}
                      className="flex items-center gap-4 p-4 rounded-xl border border-border hover:border-primary/50 hover:bg-primary/5 transition-all cursor-pointer group"
                    >
                      <Avatar className="h-14 w-14 border-2 border-primary/10">
                        <AvatarImage src={prof.avatar_url || ""} />
                        <AvatarFallback className="bg-primary/10 text-primary font-bold">
                          {prof.full_name?.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <h4 className="font-bold text-foreground group-hover:text-primary transition-colors">
                          {prof.full_name}
                        </h4>
                        <p className="text-sm text-muted-foreground">{prof.specialty || "Psicoterapeuta"}</p>
                      </div>
                      <ChevronRight className="text-muted-foreground group-hover:text-primary transition-all group-hover:translate-x-1" />
                    </div>
                  ))}
                  {professionals.length === 0 && (
                    <p className="text-center text-muted-foreground py-10">Nenhum profissional disponível para este serviço no momento.</p>
                  )}
                </div>
              )}
            </div>
          )}

          {step === "booking" && selectedProfessional && selectedService && (
            <div className="py-4">
              <BookingCalendar 
                professionalId={selectedProfessional.id}
                professionalName={selectedProfessional.full_name}
                availableHours={selectedProfessional.availableHours || []}
                requiredSessions={selectedService.product_config?.package_sessions || 1}
                onComplete={handleBookingComplete}
              />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </section>
  );
};

export default GlobalServicesSection;
