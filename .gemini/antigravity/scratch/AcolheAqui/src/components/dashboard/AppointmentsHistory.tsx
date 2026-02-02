import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Calendar, Loader2, User, Phone, Mail, Clock, CheckCircle, XCircle, AlertCircle } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface AppointmentsHistoryProps {
  profileId: string;
}

interface Appointment {
  id: string;
  client_name: string;
  client_email: string | null;
  client_phone: string | null;
  appointment_date: string;
  appointment_time: string;
  duration_minutes: number;
  session_type: string | null;
  status: string;
  payment_status: string;
  payment_method: string | null;
  amount_cents: number | null;
  notes: string | null;
  created_at: string;
}

const STATUS_OPTIONS = [
  { value: "pending", label: "Pendente", color: "bg-yellow-500/20 text-yellow-400" },
  { value: "confirmed", label: "Confirmado", color: "bg-blue-500/20 text-blue-400" },
  { value: "completed", label: "Concluído", color: "bg-green-500/20 text-green-400" },
  { value: "cancelled", label: "Cancelado", color: "bg-red-500/20 text-red-400" },
];

const PAYMENT_STATUS_OPTIONS = [
  { value: "pending", label: "Aguardando", color: "bg-yellow-500/20 text-yellow-400" },
  { value: "paid", label: "Pago", color: "bg-green-500/20 text-green-400" },
  { value: "refunded", label: "Reembolsado", color: "bg-gray-500/20 text-gray-400" },
];

const AppointmentsHistory = ({ profileId }: AppointmentsHistoryProps) => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>("all");

  useEffect(() => {
    fetchAppointments();
  }, [profileId]);

  const fetchAppointments = async () => {
    try {
      const { data, error } = await supabase
        .from("appointments")
        .select("*")
        .eq("professional_id", profileId)
        .order("appointment_date", { ascending: false })
        .order("appointment_time", { ascending: false });

      if (error) throw error;
      setAppointments(data || []);
    } catch (error) {
      console.error("Error fetching appointments:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const updateAppointmentStatus = async (appointmentId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from("appointments")
        .update({ status: newStatus })
        .eq("id", appointmentId);

      if (error) throw error;
      
      setAppointments(prev => 
        prev.map(a => a.id === appointmentId ? { ...a, status: newStatus } : a)
      );
      toast.success("Status atualizado");
    } catch (error) {
      toast.error("Erro ao atualizar status");
    }
  };

  const updatePaymentStatus = async (appointmentId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from("appointments")
        .update({ payment_status: newStatus })
        .eq("id", appointmentId);

      if (error) throw error;
      
      setAppointments(prev => 
        prev.map(a => a.id === appointmentId ? { ...a, payment_status: newStatus } : a)
      );
      toast.success("Status de pagamento atualizado");
    } catch (error) {
      toast.error("Erro ao atualizar status de pagamento");
    }
  };

  const filteredAppointments = filterStatus === "all" 
    ? appointments 
    : appointments.filter(a => a.status === filterStatus);

  const getStatusBadge = (status: string) => {
    const option = STATUS_OPTIONS.find(o => o.value === status);
    return option ? (
      <Badge className={option.color}>{option.label}</Badge>
    ) : (
      <Badge>{status}</Badge>
    );
  };

  const getPaymentStatusBadge = (status: string) => {
    const option = PAYMENT_STATUS_OPTIONS.find(o => o.value === status);
    return option ? (
      <Badge className={option.color}>{option.label}</Badge>
    ) : (
      <Badge>{status}</Badge>
    );
  };

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "dd 'de' MMMM 'de' yyyy", { locale: ptBR });
    } catch {
      return dateString;
    }
  };

  const formatTime = (timeString: string) => {
    return timeString.slice(0, 5);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Calendar className="h-6 w-6 text-primary" />
            </div>
            <div>
              <CardTitle className="text-foreground">Histórico de Agendamentos</CardTitle>
              <CardDescription className="text-muted-foreground">
                Visualize e gerencie todos os seus agendamentos
              </CardDescription>
            </div>
          </div>
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-40 bg-muted border-border text-foreground">
              <SelectValue placeholder="Filtrar" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              {STATUS_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        {filteredAppointments.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Nenhum agendamento encontrado</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredAppointments.map((appointment) => (
              <div
                key={appointment.id}
                className="p-4 bg-muted/50 rounded-lg border border-border space-y-4"
              >
                <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-primary" />
                      <span className="font-medium text-foreground">{appointment.client_name}</span>
                    </div>
                    {appointment.client_email && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Mail className="h-3 w-3" />
                        <span>{appointment.client_email}</span>
                      </div>
                    )}
                    {appointment.client_phone && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Phone className="h-3 w-3" />
                        <span>{appointment.client_phone}</span>
                      </div>
                    )}
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {getStatusBadge(appointment.status)}
                    {getPaymentStatusBadge(appointment.payment_status)}
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    <span>{formatDate(appointment.appointment_date)}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    <span>{formatTime(appointment.appointment_time)}</span>
                  </div>
                  {appointment.amount_cents && (
                    <span className="font-medium text-foreground">
                      R$ {(appointment.amount_cents / 100).toFixed(2).replace(".", ",")}
                    </span>
                  )}
                </div>

                <div className="flex flex-wrap gap-2 pt-2 border-t border-border">
                  <Select
                    value={appointment.status}
                    onValueChange={(value) => updateAppointmentStatus(appointment.id, value)}
                  >
                    <SelectTrigger className="w-36 h-8 text-xs bg-muted border-border">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      {STATUS_OPTIONS.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Select
                    value={appointment.payment_status}
                    onValueChange={(value) => updatePaymentStatus(appointment.id, value)}
                  >
                    <SelectTrigger className="w-36 h-8 text-xs bg-muted border-border">
                      <SelectValue placeholder="Pagamento" />
                    </SelectTrigger>
                    <SelectContent>
                      {PAYMENT_STATUS_OPTIONS.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AppointmentsHistory;
