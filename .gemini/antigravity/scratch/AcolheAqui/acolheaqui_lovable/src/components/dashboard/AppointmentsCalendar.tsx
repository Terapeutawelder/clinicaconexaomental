import { useState, useEffect, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Filter,
  X,
  Search,
  Calendar as CalendarIcon,
  List,
  Settings,
  Loader2,
} from "lucide-react";
import {
  format,
  addDays,
  startOfWeek,
  endOfWeek,
  isSameDay,
  parseISO,
  addWeeks,
  subWeeks,
} from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { AppointmentSessionDetails } from "./AppointmentSessionDetails";
import QuickAppointmentModal from "./QuickAppointmentModal";

interface AppointmentsCalendarProps {
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

interface BlockedInterval {
  id: string;
  day_of_week: number;
  start_time: string;
  end_time: string;
  is_active: boolean;
}

const STATUS_COLORS: Record<string, string> = {
  pending: "bg-yellow-500 hover:bg-yellow-600",
  confirmed: "bg-blue-500 hover:bg-blue-600",
  completed: "bg-green-500 hover:bg-green-600",
  cancelled: "bg-red-500 hover:bg-red-600",
};

const STATUS_LABELS: Record<string, string> = {
  pending: "Pendente",
  confirmed: "Confirmado",
  completed: "Concluído",
  cancelled: "Cancelado",
};

const HOURS = Array.from({ length: 14 }, (_, i) => i + 7); // 7h às 20h

type ViewType = "all" | "appointments" | "blocked";

const AppointmentsCalendar = ({ profileId }: AppointmentsCalendarProps) => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [blockedIntervals, setBlockedIntervals] = useState<BlockedInterval[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentWeekStart, setCurrentWeekStart] = useState(() =>
    startOfWeek(new Date(), { weekStartsOn: 1 })
  );
  const [viewType, setViewType] = useState<ViewType>("all");
  const [showFilters, setShowFilters] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeView, setActiveView] = useState<"calendar" | "list" | "settings">("calendar");
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [showNewAppointmentModal, setShowNewAppointmentModal] = useState(false);

  const weekDays = useMemo(() => {
    return Array.from({ length: 7 }, (_, i) => addDays(currentWeekStart, i));
  }, [currentWeekStart]);

  const weekEnd = endOfWeek(currentWeekStart, { weekStartsOn: 1 });

  useEffect(() => {
    fetchData();
  }, [profileId, currentWeekStart]);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const weekStartStr = format(currentWeekStart, "yyyy-MM-dd");
      const weekEndStr = format(weekEnd, "yyyy-MM-dd");

      const [appointmentsRes, blockedRes] = await Promise.all([
        supabase
          .from("appointments")
          .select("*")
          .eq("professional_id", profileId)
          .gte("appointment_date", weekStartStr)
          .lte("appointment_date", weekEndStr)
          .order("appointment_date", { ascending: true })
          .order("appointment_time", { ascending: true }),
        supabase
          .from("available_hours")
          .select("*")
          .eq("professional_id", profileId),
      ]);

      if (appointmentsRes.error) throw appointmentsRes.error;
      if (blockedRes.error) throw blockedRes.error;

      const parsedAppointments = (appointmentsRes.data || []).map((apt) => ({
        ...apt,
        transcription: apt.transcription as unknown as TranscriptEntry[] | null,
      }));

      setAppointments(parsedAppointments);
      setBlockedIntervals(blockedRes.data || []);
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Erro ao carregar agenda");
    } finally {
      setIsLoading(false);
    }
  };

  const goToToday = () => {
    setCurrentWeekStart(startOfWeek(new Date(), { weekStartsOn: 1 }));
  };

  const goToPreviousWeek = () => {
    setCurrentWeekStart((prev) => subWeeks(prev, 1));
  };

  const goToNextWeek = () => {
    setCurrentWeekStart((prev) => addWeeks(prev, 1));
  };

  const getAppointmentsForDayAndHour = (day: Date, hour: number) => {
    return appointments.filter((apt) => {
      const aptDate = parseISO(apt.appointment_date);
      const aptHour = parseInt(apt.appointment_time.split(":")[0], 10);
      const aptMinute = parseInt(apt.appointment_time.split(":")[1], 10);
      const aptStartMinutes = aptHour * 60 + aptMinute;
      const hourStartMinutes = hour * 60;
      const hourEndMinutes = (hour + 1) * 60;

      return (
        isSameDay(aptDate, day) &&
        aptStartMinutes >= hourStartMinutes &&
        aptStartMinutes < hourEndMinutes
      );
    });
  };

  const getAppointmentStyle = (apt: Appointment, hour: number) => {
    const aptHour = parseInt(apt.appointment_time.split(":")[0], 10);
    const aptMinute = parseInt(apt.appointment_time.split(":")[1], 10);
    const hourStartMinutes = hour * 60;
    const aptStartMinutes = aptHour * 60 + aptMinute;

    const topOffset = aptStartMinutes - hourStartMinutes;
    const topPercentage = (topOffset / 60) * 100;
    const duration = apt.duration_minutes || 50;
    const heightPercentage = (duration / 60) * 100;

    return {
      top: `${topPercentage}%`,
      height: `${Math.max(heightPercentage, 20)}%`,
      minHeight: "24px",
    };
  };

  const filteredAppointments = useMemo(() => {
    let filtered = appointments;

    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (apt) =>
          apt.client_name.toLowerCase().includes(search) ||
          apt.client_email?.toLowerCase().includes(search) ||
          apt.client_phone?.includes(search)
      );
    }

    if (viewType === "appointments") {
      filtered = filtered.filter((apt) => apt.status !== "cancelled");
    }

    return filtered;
  }, [appointments, searchTerm, viewType]);

  const formatWeekRange = () => {
    const start = format(currentWeekStart, "d", { locale: ptBR });
    const end = format(weekEnd, "d 'de' MMM. 'de' yyyy", { locale: ptBR });
    return `${start} – ${end}`;
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
      {/* Header Tabs */}
      <div className="flex flex-wrap items-center gap-4 border-b border-border pb-3">
        <h2 className="text-lg font-semibold text-foreground">Calendários</h2>
        <div className="flex items-center gap-1">
          <Button
            variant={activeView === "calendar" ? "default" : "ghost"}
            size="sm"
            onClick={() => setActiveView("calendar")}
            className="text-sm"
          >
            <CalendarIcon className="h-4 w-4 mr-1" />
            Visualizar de calendário
          </Button>
          <Button
            variant={activeView === "list" ? "default" : "ghost"}
            size="sm"
            onClick={() => setActiveView("list")}
            className="text-sm"
          >
            <List className="h-4 w-4 mr-1" />
            Exibição em lista
          </Button>
          <Button
            variant={activeView === "settings" ? "default" : "ghost"}
            size="sm"
            onClick={() => setActiveView("settings")}
            className="text-sm"
          >
            <Settings className="h-4 w-4 mr-1" />
            Configurações
          </Button>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={goToToday}>
            Hoje
          </Button>
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" onClick={goToPreviousWeek}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm font-medium text-foreground min-w-[180px] text-center">
              {formatWeekRange()}
            </span>
            <Button variant="ghost" size="icon" onClick={goToNextWeek}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter className="h-4 w-4 mr-1" />
            Gerenciar visualização
          </Button>
          <Button 
            size="sm" 
            className="bg-primary hover:bg-primary/90"
            onClick={() => setShowNewAppointmentModal(true)}
          >
            <Plus className="h-4 w-4 mr-1" />
            Novo
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex gap-4">
        {/* Calendar Grid */}
        <Card className="flex-1 overflow-hidden">
          <CardContent className="p-0">
            {/* Days Header */}
            <div className="grid grid-cols-8 border-b border-border">
              <div className="p-2 text-xs text-muted-foreground text-center border-r border-border">
                <span className="block">GMT</span>
                <span className="block">-03:00</span>
              </div>
              {weekDays.map((day, index) => {
                const isToday = isSameDay(day, new Date());
                return (
                  <div
                    key={index}
                    className={cn(
                      "p-2 text-center border-r border-border last:border-r-0",
                      isToday && "bg-primary/10"
                    )}
                  >
                    <span className="text-xs text-muted-foreground block">
                      {format(day, "EEE", { locale: ptBR })}.
                    </span>
                    <span
                      className={cn(
                        "text-lg font-semibold",
                        isToday ? "text-primary" : "text-foreground"
                      )}
                    >
                      {format(day, "d")}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* All Day Row */}
            <div className="grid grid-cols-8 border-b border-border bg-muted/30">
              <div className="p-2 text-xs text-muted-foreground text-center border-r border-border">
                O dia<br />todo
              </div>
              {weekDays.map((_, index) => (
                <div
                  key={index}
                  className="p-1 min-h-[32px] border-r border-border last:border-r-0"
                />
              ))}
            </div>

            {/* Hours Grid */}
            <ScrollArea className="h-[600px]">
              <div className="relative">
                {HOURS.map((hour) => (
                  <div key={hour} className="grid grid-cols-8 border-b border-border">
                    <div className="p-2 text-xs text-muted-foreground text-right border-r border-border w-16">
                      {hour.toString().padStart(2, "0")}
                    </div>
                    {weekDays.map((day, dayIndex) => {
                      const dayAppointments = getAppointmentsForDayAndHour(day, hour);
                      const displayedApts =
                        viewType === "blocked" ? [] : dayAppointments;

                      return (
                        <div
                          key={dayIndex}
                          className="relative min-h-[60px] border-r border-border last:border-r-0 hover:bg-muted/30 transition-colors"
                        >
                          {displayedApts.map((apt, aptIndex) => {
                            const style = getAppointmentStyle(apt, hour);
                            const colorClass =
                              STATUS_COLORS[apt.status] || "bg-gray-500";

                            return (
                              <div
                                key={apt.id}
                                className={cn(
                                  "absolute left-1 right-1 rounded px-1 py-0.5 text-white text-xs cursor-pointer overflow-hidden shadow-sm transition-transform hover:scale-[1.02] hover:shadow-md z-10",
                                  colorClass
                                )}
                                style={{
                                  ...style,
                                  left: `${aptIndex * 4 + 4}px`,
                                  right: `${4}px`,
                                }}
                                onClick={() => setSelectedAppointment(apt)}
                                title={`${apt.client_name}\n${apt.appointment_time} - ${STATUS_LABELS[apt.status]}`}
                              >
                                <div className="font-medium truncate leading-tight">
                                  {apt.client_name}
                                </div>
                                <div className="text-[10px] opacity-90 truncate leading-tight">
                                  {apt.appointment_time.slice(0, 5)} -{" "}
                                  {format(
                                    new Date(
                                      `2000-01-01T${apt.appointment_time}`
                                    ).getTime() +
                                      (apt.duration_minutes || 50) * 60000,
                                    "HH:mm"
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Filters Sidebar */}
        {showFilters && (
          <Card className="w-72 shrink-0">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-foreground">
                  Gerenciar visualização
                </h3>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowFilters(false)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              <div className="space-y-6">
                {/* View Type */}
                <div className="space-y-3">
                  <Label className="text-sm font-medium">Visualizar por tipo</Label>
                  <RadioGroup
                    value={viewType}
                    onValueChange={(v) => setViewType(v as ViewType)}
                    className="space-y-2"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="all" id="all" />
                      <Label htmlFor="all" className="text-sm cursor-pointer">
                        Todos
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="appointments" id="appointments" />
                      <Label
                        htmlFor="appointments"
                        className="text-sm cursor-pointer"
                      >
                        Agendamentos
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="blocked" id="blocked" />
                      <Label htmlFor="blocked" className="text-sm cursor-pointer">
                        Intervalos bloqueados
                      </Label>
                    </div>
                  </RadioGroup>
                </div>

                <Separator />

                {/* Filters */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm font-medium">Filtros</Label>
                    <Button
                      variant="link"
                      size="sm"
                      className="text-red-500 h-auto p-0"
                      onClick={() => setSearchTerm("")}
                    >
                      <X className="h-3 w-3 mr-1" />
                      Limpar tudo
                    </Button>
                  </div>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Pesquisar pacientes..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-9"
                    />
                  </div>
                </div>

                <Separator />

                {/* Status Legend */}
                <div className="space-y-3">
                  <Label className="text-sm font-medium">Status</Label>
                  <div className="space-y-2">
                    {Object.entries(STATUS_LABELS).map(([key, label]) => (
                      <div key={key} className="flex items-center gap-2">
                        <div
                          className={cn(
                            "w-3 h-3 rounded",
                            STATUS_COLORS[key]?.replace("hover:bg-", "")
                          )}
                        />
                        <span className="text-sm text-muted-foreground">
                          {label}
                        </span>
                        <Badge variant="secondary" className="ml-auto text-xs">
                          {
                            appointments.filter((a) => a.status === key).length
                          }
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Appointment Details Modal */}
      {selectedAppointment && (
        <AppointmentSessionDetails
          appointment={selectedAppointment}
          isOpen={!!selectedAppointment}
          onClose={() => setSelectedAppointment(null)}
        />
      )}

      {/* Quick Appointment Modal */}
      <QuickAppointmentModal
        isOpen={showNewAppointmentModal}
        onClose={() => setShowNewAppointmentModal(false)}
        profileId={profileId}
        onSuccess={fetchData}
      />
    </div>
  );
};

export default AppointmentsCalendar;
