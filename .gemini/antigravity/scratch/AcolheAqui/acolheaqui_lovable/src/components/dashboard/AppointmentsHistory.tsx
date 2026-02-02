import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import { Calendar, Loader2, Search, Filter, ArrowUpDown, MoreVertical, Check, Video, FileText } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { AppointmentSessionDetails } from "./AppointmentSessionDetails";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

interface AppointmentsHistoryProps {
  profileId: string;
}

interface TranscriptEntry {
  id: string;
  speaker: "professional" | "patient";
  text: string;
  timestamp: string;
  isFinal: boolean;
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
  virtual_room_code: string | null;
  virtual_room_link: string | null;
  recording_url: string | null;
  transcription: TranscriptEntry[] | null;
  ai_psi_analysis: string | null;
}

const STATUS_OPTIONS = [
  { value: "pending", label: "Novo (ação obrigatória)", color: "border-red-400 text-red-500 bg-red-50" },
  { value: "confirmed", label: "Confirmado", color: "border-blue-400 text-blue-600 bg-blue-50" },
  { value: "completed", label: "Comparecido", color: "border-green-400 text-green-600 bg-green-50" },
  { value: "no_show", label: "Não comparecimento", color: "border-yellow-400 text-yellow-600 bg-yellow-50" },
  { value: "cancelled", label: "Cancelado", color: "border-gray-400 text-gray-600 bg-gray-50" },
  { value: "invalid", label: "Inválido", color: "border-gray-300 text-gray-500 bg-gray-50" },
];

const FILTER_TABS = [
  { value: "upcoming", label: "Próximos" },
  { value: "cancelled", label: "Cancelado" },
  { value: "all", label: "Todos" },
];

const AppointmentsHistory = ({ profileId }: AppointmentsHistoryProps) => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);

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
      
      const parsedData = (data || []).map(apt => ({
        ...apt,
        transcription: apt.transcription as unknown as TranscriptEntry[] | null,
      }));
      
      setAppointments(parsedData);
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

  const getFilteredAppointments = () => {
    let filtered = appointments;
    
    // Filter by status tab
    if (filterStatus === "upcoming") {
      const today = new Date().toISOString().split("T")[0];
      filtered = filtered.filter(a => a.appointment_date >= today && a.status !== "cancelled");
    } else if (filterStatus === "cancelled") {
      filtered = filtered.filter(a => a.status === "cancelled");
    }
    
    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(a => 
        a.client_name.toLowerCase().includes(query) ||
        a.client_email?.toLowerCase().includes(query) ||
        a.session_type?.toLowerCase().includes(query)
      );
    }
    
    return filtered;
  };

  const filteredAppointments = getFilteredAppointments();

  const formatDateTime = (dateString: string, timeString: string) => {
    try {
      const date = new Date(dateString + "T" + timeString);
      return format(date, "MMM dd, yyyy, hh:mm a (xxx)", { locale: ptBR });
    } catch {
      return `${dateString} ${timeString}`;
    }
  };

  const getStatusOption = (status: string) => {
    return STATUS_OPTIONS.find(o => o.value === status) || STATUS_OPTIONS[0];
  };

  const getInitials = (name: string) => {
    return name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
  };

  const getAvatarColor = (name: string) => {
    const colors = [
      "bg-red-500",
      "bg-blue-500",
      "bg-green-500",
      "bg-yellow-500",
      "bg-purple-500",
      "bg-pink-500",
      "bg-indigo-500",
      "bg-teal-500",
    ];
    const index = name.charCodeAt(0) % colors.length;
    return colors[index];
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-border pb-3">
        {FILTER_TABS.map((tab) => (
          <button
            key={tab.value}
            onClick={() => setFilterStatus(tab.value)}
            className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
              filterStatus === tab.value
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:text-foreground hover:bg-muted"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="h-9">
            <Filter className="h-4 w-4 mr-2" />
            Filtros avançados
          </Button>
          <Button variant="outline" size="sm" className="h-9">
            <ArrowUpDown className="h-4 w-4 mr-2" />
            Classificar por
          </Button>
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Pesquisar por título"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 h-9"
            />
          </div>
        </div>
      </div>

      {/* Table */}
      {filteredAppointments.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground border rounded-lg bg-muted/20">
          <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p>Nenhum agendamento encontrado</p>
        </div>
      ) : (
        <div className="border rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/30 hover:bg-muted/30">
                <TableHead className="w-12 text-center">#</TableHead>
                <TableHead>Título</TableHead>
                <TableHead>Contato</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Hora do compromisso</TableHead>
                <TableHead>Serviço</TableHead>
                <TableHead className="w-12"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAppointments.map((appointment, index) => {
                const statusOption = getStatusOption(appointment.status);
                return (
                  <TableRow key={appointment.id} className="hover:bg-muted/20">
                    <TableCell className="text-center text-muted-foreground">
                      {index + 1}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">{appointment.client_name}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Avatar className="h-7 w-7">
                          <AvatarFallback className={`text-xs text-white ${getAvatarColor(appointment.client_name)}`}>
                            {getInitials(appointment.client_name)}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-sm">{appointment.client_name}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Select
                        value={appointment.status}
                        onValueChange={(value) => updateAppointmentStatus(appointment.id, value)}
                      >
                        <SelectTrigger 
                          className={`w-48 h-9 border-2 ${statusOption.color}`}
                        >
                          <SelectValue>
                            {statusOption.label}
                          </SelectValue>
                        </SelectTrigger>
                        <SelectContent>
                          {STATUS_OPTIONS.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              <div className="flex items-center gap-2">
                                {appointment.status === option.value && (
                                  <Check className="h-4 w-4 text-primary" />
                                )}
                                <span>{option.label}</span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {formatDateTime(appointment.appointment_date, appointment.appointment_time)}
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-muted-foreground truncate max-w-[150px] block">
                        {appointment.session_type || "Sessão Padrão"}
                      </span>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          {(appointment.virtual_room_link || appointment.recording_url || (appointment.transcription && appointment.transcription.length > 0)) && (
                            <DropdownMenuItem onClick={() => setSelectedAppointment(appointment)}>
                              <Video className="h-4 w-4 mr-2" />
                              Ver sessão
                            </DropdownMenuItem>
                          )}
                          {appointment.recording_url && (
                            <DropdownMenuItem>
                              <FileText className="h-4 w-4 mr-2" />
                              Ver transcrição
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}

      {selectedAppointment && (
        <AppointmentSessionDetails
          appointment={selectedAppointment}
          isOpen={!!selectedAppointment}
          onClose={() => setSelectedAppointment(null)}
        />
      )}
    </div>
  );
};

export default AppointmentsHistory;
