import { useState, useEffect, useRef, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { CalendarIcon, Loader2, User, Mail, Phone, Clock, Send, Copy, CheckCircle, Link, Search, Users } from "lucide-react";
import { cn } from "@/lib/utils";

interface Service {
  id: string;
  name: string;
  price_cents: number;
  checkout_config?: any;
}

interface ExistingClient {
  client_name: string;
  client_email: string | null;
  client_phone: string | null;
  session_type: string | null;
}

interface QuickAppointmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  profileId: string;
  onSuccess?: () => void;
  defaultDate?: Date;
  defaultTime?: string;
}

const TIME_OPTIONS = Array.from({ length: 28 }, (_, i) => {
  const hour = Math.floor(i / 2) + 7;
  const minute = (i % 2) * 30;
  const value = `${hour.toString().padStart(2, "0")}:${minute.toString().padStart(2, "0")}:00`;
  const label = `${hour.toString().padStart(2, "0")}:${minute.toString().padStart(2, "0")}`;
  return { value, label };
});

const DURATION_OPTIONS = [
  { value: 30, label: "30 minutos" },
  { value: 50, label: "50 minutos" },
  { value: 60, label: "1 hora" },
  { value: 90, label: "1h 30min" },
  { value: 120, label: "2 horas" },
];

const STATUS_OPTIONS = [
  { value: "pending", label: "Pendente" },
  { value: "confirmed", label: "Confirmado" },
];

const QuickAppointmentModal = ({
  isOpen,
  onClose,
  profileId,
  onSuccess,
  defaultDate,
  defaultTime,
}: QuickAppointmentModalProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [sendNotification, setSendNotification] = useState(true);
  const [services, setServices] = useState<Service[]>([]);
  const [selectedServiceId, setSelectedServiceId] = useState<string>("");
  const [showSuccessState, setShowSuccessState] = useState(false);
  const [createdAppointmentData, setCreatedAppointmentData] = useState<{
    clientName: string;
    clientEmail: string;
    clientPhone: string;
    date: string;
    time: string;
    sessionType: string;
    checkoutUrl: string;
  } | null>(null);

  // Client autocomplete state
  const [existingClients, setExistingClients] = useState<ExistingClient[]>([]);
  const [showClientSuggestions, setShowClientSuggestions] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const clientInputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  const [formData, setFormData] = useState({
    client_name: "",
    client_email: "",
    client_phone: "",
    appointment_date: defaultDate || new Date(),
    appointment_time: defaultTime || "09:00:00",
    duration_minutes: 50,
    session_type: "",
    status: "confirmed",
    notes: "",
  });

  // Fetch existing clients for autocomplete
  useEffect(() => {
    const fetchExistingClients = async () => {
      const { data } = await supabase
        .from("appointments")
        .select("client_name, client_email, client_phone, session_type")
        .eq("professional_id", profileId)
        .order("created_at", { ascending: false });

      if (data) {
        // Deduplicate by client_name (keeping the most recent)
        const uniqueClients = data.reduce((acc: ExistingClient[], curr) => {
          const existing = acc.find(
            (c) => c.client_name.toLowerCase() === curr.client_name.toLowerCase()
          );
          if (!existing) {
            acc.push(curr);
          }
          return acc;
        }, []);
        setExistingClients(uniqueClients);
      }
    };

    if (isOpen && profileId) {
      fetchExistingClients();
    }
  }, [isOpen, profileId]);

  // Fetch services for checkout link
  useEffect(() => {
    const fetchServices = async () => {
      const { data } = await supabase
        .from("services")
        .select("id, name, price_cents, checkout_config")
        .eq("professional_id", profileId)
        .eq("is_active", true);
      
      if (data) {
        setServices(data);
        if (data.length > 0) {
          setSelectedServiceId(data[0].id);
        }
      }
    };

    if (isOpen && profileId) {
      fetchServices();
    }
  }, [isOpen, profileId]);

  // Filter clients based on search query
  const filteredClients = useMemo(() => {
    if (!searchQuery.trim()) return existingClients.slice(0, 5);
    
    const query = searchQuery.toLowerCase();
    return existingClients
      .filter((client) =>
        client.client_name.toLowerCase().includes(query) ||
        client.client_email?.toLowerCase().includes(query) ||
        client.client_phone?.includes(query)
      )
      .slice(0, 5);
  }, [existingClients, searchQuery]);

  // Handle click outside to close suggestions
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(event.target as Node) &&
        clientInputRef.current &&
        !clientInputRef.current.contains(event.target as Node)
      ) {
        setShowClientSuggestions(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const getCheckoutUrl = (serviceId: string) => {
    const service = services.find(s => s.id === serviceId);
    if (!service) return "";

    const baseUrl = "https://www.acolheaqui.com.br";
    const config = service.checkout_config as any;
    const domainType = config?.domainType || "default";
    const userSlug = config?.userSlug || "";

    if (domainType === "subpath" && userSlug) {
      return `${baseUrl}/${userSlug}/checkout/${serviceId}`;
    }
    return `${baseUrl}/checkout/${serviceId}`;
  };

  const formatPrice = (cents: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(cents / 100);
  };

  const handleSelectClient = (client: ExistingClient) => {
    setFormData((prev) => ({
      ...prev,
      client_name: client.client_name,
      client_email: client.client_email || "",
      client_phone: client.client_phone || "",
      session_type: client.session_type || prev.session_type,
    }));
    setSearchQuery(client.client_name);
    setShowClientSuggestions(false);
  };

  const handleClientNameChange = (value: string) => {
    setSearchQuery(value);
    updateField("client_name", value);
    setShowClientSuggestions(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.client_name.trim()) {
      toast.error("Nome do paciente é obrigatório");
      return;
    }

    if (!formData.appointment_date) {
      toast.error("Data é obrigatória");
      return;
    }

    if (sendNotification && (!formData.client_email.trim() && !formData.client_phone.trim())) {
      toast.error("Para enviar notificação, informe email ou telefone");
      return;
    }

    setIsSubmitting(true);
    try {
      const appointmentDate = format(formData.appointment_date, "yyyy-MM-dd");
      const appointmentTime = formData.appointment_time;

      const { error } = await supabase.from("appointments").insert({
        professional_id: profileId,
        client_name: formData.client_name.trim(),
        client_email: formData.client_email.trim() || null,
        client_phone: formData.client_phone.trim() || null,
        appointment_date: appointmentDate,
        appointment_time: appointmentTime,
        duration_minutes: formData.duration_minutes,
        session_type: formData.session_type.trim() || "Sessão Individual",
        status: formData.status,
        payment_status: "pending",
        notes: formData.notes.trim() || null,
      });

      if (error) throw error;

      const checkoutUrl = selectedServiceId ? getCheckoutUrl(selectedServiceId) : "";
      const formattedDate = format(formData.appointment_date, "dd/MM/yyyy", { locale: ptBR });
      const formattedTime = appointmentTime.slice(0, 5);

      // Store created appointment data for copy function
      setCreatedAppointmentData({
        clientName: formData.client_name.trim(),
        clientEmail: formData.client_email.trim(),
        clientPhone: formData.client_phone.trim(),
        date: formattedDate,
        time: formattedTime,
        sessionType: formData.session_type.trim() || "Sessão Individual",
        checkoutUrl,
      });

      // Send notification if enabled
      if (sendNotification && (formData.client_email.trim() || formData.client_phone.trim())) {
        const selectedService = services.find(s => s.id === selectedServiceId);
        
        supabase.functions.invoke("send-appointment-notification", {
          body: {
            professionalId: profileId,
            clientName: formData.client_name.trim(),
            clientEmail: formData.client_email.trim(),
            clientPhone: formData.client_phone.trim(),
            appointmentDate: appointmentDate,
            appointmentTime: appointmentTime,
            serviceName: selectedService?.name || formData.session_type.trim() || "Sessão Individual",
            amountCents: selectedService?.price_cents,
            notes: formData.notes.trim() || null,
            checkoutUrl: checkoutUrl,
          },
        }).then((result) => {
          if (result.error) {
            console.error("Error sending notifications:", result.error);
            toast.error("Agendamento criado, mas houve erro ao enviar notificação");
          } else {
            console.log("Notifications sent:", result.data);
            toast.success("Notificação enviada para o paciente!");
          }
        });
      }

      setShowSuccessState(true);
      toast.success("Agendamento criado com sucesso!");
      onSuccess?.();
    } catch (error) {
      console.error("Error creating appointment:", error);
      toast.error("Erro ao criar agendamento");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCopyAppointmentData = () => {
    if (!createdAppointmentData) return;

    const text = `📅 *Agendamento Confirmado*

👤 *Paciente:* ${createdAppointmentData.clientName}
${createdAppointmentData.clientEmail ? `📧 *Email:* ${createdAppointmentData.clientEmail}` : ""}
${createdAppointmentData.clientPhone ? `📱 *Telefone:* ${createdAppointmentData.clientPhone}` : ""}

📆 *Data:* ${createdAppointmentData.date}
⏰ *Horário:* ${createdAppointmentData.time}
🏷️ *Tipo:* ${createdAppointmentData.sessionType}

${createdAppointmentData.checkoutUrl ? `💳 *Link de Pagamento:*\n${createdAppointmentData.checkoutUrl}` : ""}

---
AcolheAqui`.trim();

    navigator.clipboard.writeText(text);
    toast.success("Dados copiados para a área de transferência!");
  };

  const handleCopyCheckoutLink = () => {
    if (!createdAppointmentData?.checkoutUrl) return;
    navigator.clipboard.writeText(createdAppointmentData.checkoutUrl);
    toast.success("Link de pagamento copiado!");
  };

  const handleClose = () => {
    setShowSuccessState(false);
    setCreatedAppointmentData(null);
    setSearchQuery("");
    setShowClientSuggestions(false);
    setFormData({
      client_name: "",
      client_email: "",
      client_phone: "",
      appointment_date: defaultDate || new Date(),
      appointment_time: defaultTime || "09:00:00",
      duration_minutes: 50,
      session_type: "",
      status: "confirmed",
      notes: "",
    });
    onClose();
  };

  const handleNewAppointment = () => {
    setShowSuccessState(false);
    setCreatedAppointmentData(null);
    setSearchQuery("");
    setShowClientSuggestions(false);
    setFormData({
      client_name: "",
      client_email: "",
      client_phone: "",
      appointment_date: defaultDate || new Date(),
      appointment_time: defaultTime || "09:00:00",
      duration_minutes: 50,
      session_type: "",
      status: "confirmed",
      notes: "",
    });
  };

  const updateField = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  // Success State View
  if (showSuccessState && createdAppointmentData) {
    return (
      <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
        <DialogContent className="max-w-lg max-h-[90vh] p-0 overflow-hidden">
          <DialogHeader className="p-6 pb-0">
            <div className="flex items-start gap-4">
              <div className="h-16 w-16 rounded-full bg-green-500/20 flex items-center justify-center border-2 border-green-500/30">
                <CheckCircle className="w-8 h-8 text-green-500" />
              </div>
              <div className="flex-1">
                <DialogTitle className="text-xl">Agendamento Criado!</DialogTitle>
                <p className="text-muted-foreground text-sm mt-2">
                  {sendNotification ? "Notificação enviada para o paciente." : "O paciente foi cadastrado com sucesso."}
                </p>
              </div>
            </div>
          </DialogHeader>

          <div className="p-6 space-y-4">
            <div className="bg-muted/50 rounded-lg p-4 space-y-3 border border-border">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Paciente:
                </span>
                <span className="font-medium">{createdAppointmentData.clientName}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground flex items-center gap-2">
                  <CalendarIcon className="h-4 w-4" />
                  Data:
                </span>
                <span className="font-medium">{createdAppointmentData.date}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  Horário:
                </span>
                <span className="font-medium">{createdAppointmentData.time}</span>
              </div>
              {createdAppointmentData.checkoutUrl && (
                <div className="pt-3 border-t border-border mt-2">
                  <p className="text-xs text-muted-foreground mb-2 flex items-center gap-2">
                    <Link className="h-4 w-4" />
                    Link de pagamento:
                  </p>
                  <div className="flex items-center gap-2">
                    <Input 
                      value={createdAppointmentData.checkoutUrl} 
                      readOnly 
                      className="text-xs h-8 bg-background"
                    />
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="h-8 px-2"
                      onClick={handleCopyCheckoutLink}
                    >
                      <Link className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </div>

            <div className="flex flex-col gap-2">
              <Button onClick={handleCopyAppointmentData} variant="outline" className="w-full">
                <Copy className="h-4 w-4 mr-2" />
                Copiar Todos os Dados
              </Button>
              <div className="grid grid-cols-2 gap-2">
                <Button variant="ghost" onClick={handleNewAppointment}>
                  Novo Agendamento
                </Button>
                <Button onClick={handleClose}>
                  Fechar
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="max-w-lg max-h-[90vh] p-0 overflow-hidden">
        <DialogHeader className="p-6 pb-0">
          <div className="flex items-start gap-4">
            <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center border-2 border-primary/20">
              <CalendarIcon className="w-8 h-8 text-primary" />
            </div>
            <div className="flex-1">
              <DialogTitle className="text-xl">Novo Agendamento</DialogTitle>
              <p className="text-muted-foreground text-sm mt-2">
                Preencha os dados para criar um agendamento manual.
              </p>
            </div>
          </div>
        </DialogHeader>

        <ScrollArea className="max-h-[60vh] px-6 pb-6">
          <form onSubmit={handleSubmit} className="space-y-4 mt-4">
            {/* Client Name with Autocomplete */}
            <div className="space-y-2 relative">
              <Label htmlFor="client_name" className="flex items-center gap-2">
                <User className="h-4 w-4 text-muted-foreground" />
                Nome do Paciente *
              </Label>
              <div className="relative">
                <Input
                  ref={clientInputRef}
                  id="client_name"
                  placeholder="Digite para buscar ou adicionar..."
                  value={formData.client_name}
                  onChange={(e) => handleClientNameChange(e.target.value)}
                  onFocus={() => setShowClientSuggestions(true)}
                  autoComplete="off"
                  required
                />
                {existingClients.length > 0 && (
                  <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                )}
              </div>

              {/* Autocomplete Suggestions */}
              {showClientSuggestions && filteredClients.length > 0 && (
                <div
                  ref={suggestionsRef}
                  className="absolute z-50 w-full mt-1 bg-background border border-border rounded-lg shadow-lg max-h-[200px] overflow-y-auto"
                >
                  <div className="p-2 border-b border-border">
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      <Users className="h-3 w-3" />
                      Pacientes cadastrados ({existingClients.length})
                    </p>
                  </div>
                  {filteredClients.map((client, index) => (
                    <button
                      key={`${client.client_name}-${index}`}
                      type="button"
                      className="w-full text-left px-3 py-2 hover:bg-muted/50 transition-colors flex flex-col gap-0.5"
                      onClick={() => handleSelectClient(client)}
                    >
                      <span className="font-medium text-sm">{client.client_name}</span>
                      <span className="text-xs text-muted-foreground">
                        {client.client_email && <span>{client.client_email}</span>}
                        {client.client_email && client.client_phone && <span> • </span>}
                        {client.client_phone && <span>{client.client_phone}</span>}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Email and Phone */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="client_email" className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  Email
                </Label>
                <Input
                  id="client_email"
                  type="email"
                  placeholder="email@exemplo.com"
                  value={formData.client_email}
                  onChange={(e) => updateField("client_email", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="client_phone" className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  Telefone
                </Label>
                <Input
                  id="client_phone"
                  placeholder="(00) 00000-0000"
                  value={formData.client_phone}
                  onChange={(e) => updateField("client_phone", e.target.value)}
                />
              </div>
            </div>

            {/* Date and Time */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                  Data *
                </Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !formData.appointment_date && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {formData.appointment_date
                        ? format(formData.appointment_date, "dd/MM/yyyy", { locale: ptBR })
                        : "Selecione"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={formData.appointment_date}
                      onSelect={(date) => date && updateField("appointment_date", date)}
                      locale={ptBR}
                      className="pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>
              </div>
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  Horário *
                </Label>
                <Select
                  value={formData.appointment_time}
                  onValueChange={(v) => updateField("appointment_time", v)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {TIME_OPTIONS.map((time) => (
                      <SelectItem key={time.value} value={time.value}>
                        {time.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Duration and Status */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Duração</Label>
                <Select
                  value={String(formData.duration_minutes)}
                  onValueChange={(v) => updateField("duration_minutes", parseInt(v))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {DURATION_OPTIONS.map((opt) => (
                      <SelectItem key={opt.value} value={String(opt.value)}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Status</Label>
                <Select
                  value={formData.status}
                  onValueChange={(v) => updateField("status", v)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {STATUS_OPTIONS.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Session Type */}
            <div className="space-y-2">
              <Label htmlFor="session_type">Tipo de Sessão</Label>
              <Input
                id="session_type"
                placeholder="Ex: Sessão Individual, Terapia de Casal..."
                value={formData.session_type}
                onChange={(e) => updateField("session_type", e.target.value)}
              />
            </div>

            {/* Service for Checkout Link */}
            {services.length > 0 && (
              <div className="space-y-2">
                <Label>Serviço (para link de pagamento)</Label>
                <Select
                  value={selectedServiceId}
                  onValueChange={setSelectedServiceId}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um serviço" />
                  </SelectTrigger>
                  <SelectContent>
                    {services.map((service) => (
                      <SelectItem key={service.id} value={service.id}>
                        {service.name} - {formatPrice(service.price_cents)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Notes */}
            <div className="space-y-2">
              <Label htmlFor="notes">Observações</Label>
              <Textarea
                id="notes"
                placeholder="Notas sobre o agendamento..."
                value={formData.notes}
                onChange={(e) => updateField("notes", e.target.value)}
                rows={3}
              />
            </div>

            {/* Send Notification Toggle */}
            <div className="flex items-center space-x-2 p-3 bg-muted/50 rounded-lg">
              <Checkbox
                id="send_notification"
                checked={sendNotification}
                onCheckedChange={(checked) => setSendNotification(checked === true)}
              />
              <Label 
                htmlFor="send_notification" 
                className="text-sm font-normal cursor-pointer flex items-center gap-2"
              >
                <Send className="h-4 w-4 text-primary" />
                Enviar notificação (WhatsApp + Email) com link de pagamento
              </Label>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3 pt-4">
              <Button type="button" variant="outline" onClick={handleClose}>
                Cancelar
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                Criar Agendamento
              </Button>
            </div>
          </form>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

export default QuickAppointmentModal;
