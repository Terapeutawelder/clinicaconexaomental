import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, User, AlertCircle, Check, ChevronLeft, ChevronRight, Loader2, Heart, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { format, addDays, startOfWeek, isSameDay, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import { formatProfessionalName } from "@/lib/formatProfessionalName";
import Logo from "@/components/Logo";

interface Appointment {
  id: string;
  client_name: string;
  client_email: string;
  appointment_date: string;
  appointment_time: string;
  status: string;
  professional_id: string;
  session_type: string;
  duration_minutes: number;
}

interface Profile {
  id: string;
  full_name: string;
  gender: "male" | "female" | "other" | null;
  avatar_url: string;
  specialty: string;
}

interface AvailableHour {
  day_of_week: number;
  start_time: string;
  end_time: string;
  is_active: boolean;
}

const Reagendar = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get("token");

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [appointment, setAppointment] = useState<Appointment | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [availableHours, setAvailableHours] = useState<AvailableHour[]>([]);
  const [bookedSlots, setBookedSlots] = useState<{ date: string; time: string }[]>([]);
  
  // Selection state
  const [currentWeekStart, setCurrentWeekStart] = useState(() => startOfWeek(new Date(), { weekStartsOn: 0 }));
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!token) {
      setError("Link de reagendamento inválido.");
      setLoading(false);
      return;
    }

    fetchAppointmentData();
  }, [token]);

  const fetchAppointmentData = async () => {
    try {
      // Verify token and get appointment
      const { data: tokenData, error: tokenError } = await supabase
        .from("appointment_access_tokens")
        .select("appointment_id, expires_at")
        .eq("token", token)
        .maybeSingle();

      if (tokenError || !tokenData) {
        setError("Link de reagendamento inválido ou expirado.");
        setLoading(false);
        return;
      }

      // Check if token is expired
      if (new Date(tokenData.expires_at) < new Date()) {
        setError("Este link de reagendamento expirou.");
        setLoading(false);
        return;
      }

      // Get appointment details
      const { data: appointmentData, error: appointmentError } = await supabase
        .from("appointments")
        .select("*")
        .eq("id", tokenData.appointment_id)
        .single();

      if (appointmentError || !appointmentData) {
        setError("Agendamento não encontrado.");
        setLoading(false);
        return;
      }

      // Check if appointment can be rescheduled
      const appointmentDateTime = new Date(`${appointmentData.appointment_date}T${appointmentData.appointment_time}`);
      const hoursUntilAppointment = (appointmentDateTime.getTime() - Date.now()) / (1000 * 60 * 60);
      
      if (hoursUntilAppointment < 24) {
        setError("Não é possível reagendar com menos de 24 horas de antecedência.");
        setLoading(false);
        return;
      }

      if (appointmentData.status === "cancelled" || appointmentData.status === "completed") {
        setError("Este agendamento não pode ser reagendado.");
        setLoading(false);
        return;
      }

      setAppointment(appointmentData);

      // Get professional profile
      const { data: profileData } = await supabase
        .from("profiles")
        .select("id, full_name, gender, avatar_url, specialty")
        .eq("id", appointmentData.professional_id)
        .single();

      if (profileData) {
        setProfile(profileData as Profile);
      }

      // Get available hours
      const { data: hoursData } = await supabase
        .from("available_hours")
        .select("*")
        .eq("professional_id", appointmentData.professional_id)
        .eq("is_active", true);

      if (hoursData) {
        setAvailableHours(hoursData);
      }

      // Get booked slots for the next 4 weeks
      await fetchBookedSlots(appointmentData.professional_id);

      setLoading(false);
    } catch (err) {
      console.error("Error fetching appointment:", err);
      setError("Erro ao carregar dados do agendamento.");
      setLoading(false);
    }
  };

  const fetchBookedSlots = async (professionalId: string) => {
    const startDate = new Date();
    const endDate = addDays(startDate, 28);

    const { data } = await supabase
      .from("appointments")
      .select("appointment_date, appointment_time")
      .eq("professional_id", professionalId)
      .gte("appointment_date", startDate.toISOString().split("T")[0])
      .lte("appointment_date", endDate.toISOString().split("T")[0])
      .in("status", ["pending", "confirmed"]);

    if (data) {
      setBookedSlots(data.map(a => ({
        date: a.appointment_date,
        time: a.appointment_time
      })));
    }
  };

  const getWeekDays = () => {
    return Array.from({ length: 7 }, (_, i) => addDays(currentWeekStart, i));
  };

  const getAvailableTimesForDate = (date: Date) => {
    const dayOfWeek = date.getDay();
    const dayConfig = availableHours.filter(h => h.day_of_week === dayOfWeek);
    
    if (dayConfig.length === 0) return [];

    const times: string[] = [];
    const dateStr = format(date, "yyyy-MM-dd");
    const now = new Date();
    const isToday = isSameDay(date, now);

    dayConfig.forEach(config => {
      const [startHour, startMinute] = config.start_time.split(":").map(Number);
      const [endHour, endMinute] = config.end_time.split(":").map(Number);
      
      for (let h = startHour; h < endHour || (h === endHour && 0 < endMinute); h++) {
        const timeStr = `${h.toString().padStart(2, "0")}:00`;
        
        // Skip if it's in the past
        if (isToday) {
          const slotTime = new Date(date);
          slotTime.setHours(h, 0, 0, 0);
          if (slotTime <= now) continue;
        }
        
        // Skip if already booked
        const isBooked = bookedSlots.some(
          slot => slot.date === dateStr && slot.time.startsWith(timeStr)
        );
        if (isBooked) continue;
        
        times.push(timeStr);
      }
    });

    return times;
  };

  const isDateAvailable = (date: Date) => {
    if (date < new Date()) return false;
    return getAvailableTimesForDate(date).length > 0;
  };

  const handleReschedule = async () => {
    if (!selectedDate || !selectedTime || !appointment) return;

    setSubmitting(true);

    try {
      const newDate = format(selectedDate, "yyyy-MM-dd");
      
      const { error } = await supabase
        .from("appointments")
        .update({
          appointment_date: newDate,
          appointment_time: selectedTime + ":00",
          updated_at: new Date().toISOString(),
        })
        .eq("id", appointment.id);

      if (error) throw error;

      // Send notification about rescheduling
      await supabase.functions.invoke("send-appointment-notification", {
        body: {
          professionalId: appointment.professional_id,
          clientName: appointment.client_name,
          clientEmail: appointment.client_email,
          appointmentDate: newDate,
          appointmentTime: selectedTime,
          serviceName: appointment.session_type,
        }
      });

      setSuccess(true);
      toast.success("Agendamento reagendado com sucesso!");
    } catch (err) {
      console.error("Error rescheduling:", err);
      toast.error("Erro ao reagendar. Tente novamente.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-cream to-white flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-teal mx-auto mb-4" />
          <p className="text-charcoal/70">Carregando...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-cream to-white flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardContent className="pt-6 text-center">
            <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-8 h-8 text-red-500" />
            </div>
            <h2 className="text-xl font-semibold text-charcoal mb-2">Não foi possível reagendar</h2>
            <p className="text-muted-foreground mb-6">{error}</p>
            <Button variant="outline" onClick={() => navigate("/")}>
              Voltar para o início
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-cream to-white flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardContent className="pt-6 text-center">
            <div className="w-20 h-20 rounded-full bg-teal/10 flex items-center justify-center mx-auto mb-4">
              <div className="w-14 h-14 rounded-full bg-teal flex items-center justify-center">
                <Check className="w-8 h-8 text-white" />
              </div>
            </div>
            <h2 className="text-2xl font-bold text-charcoal mb-2">Reagendamento Confirmado!</h2>
            <p className="text-muted-foreground mb-4">
              Sua consulta foi reagendada para:
            </p>
            <div className="bg-cream rounded-xl p-4 mb-6">
              <p className="font-semibold text-charcoal">
                {selectedDate && format(selectedDate, "EEEE, dd 'de' MMMM", { locale: ptBR })}
              </p>
              <p className="text-teal font-bold text-xl">{selectedTime}</p>
            </div>
            <p className="text-sm text-muted-foreground">
              Você receberá um e-mail com a confirmação.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const weekDays = getWeekDays();
  const availableTimes = selectedDate ? getAvailableTimesForDate(selectedDate) : [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-cream to-white">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-sand sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Logo size="sm" />
            <Badge variant="outline" className="border-teal text-teal">
              Reagendar Consulta
            </Badge>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-3xl">
        {/* Current Appointment Info */}
        <Card className="mb-8 border-sand">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Calendar className="w-5 h-5 text-teal" />
              Agendamento Atual
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              {profile?.avatar_url ? (
                <img
                  src={profile.avatar_url}
                  alt={profile.full_name}
                  className="w-14 h-14 rounded-full object-cover ring-2 ring-teal/20"
                />
              ) : (
                <div className="w-14 h-14 rounded-full bg-teal/10 flex items-center justify-center ring-2 ring-teal/20">
                  <User className="w-7 h-7 text-teal" />
                </div>
              )}
              <div className="flex-1">
                <p className="font-semibold text-charcoal">
                  {profile ? formatProfessionalName(profile.full_name, profile.gender) : "Profissional"}
                </p>
                {profile?.specialty && (
                  <p className="text-sm text-muted-foreground">{profile.specialty}</p>
                )}
              </div>
            </div>
            <div className="mt-4 p-3 bg-red-50 rounded-lg border border-red-200">
              <p className="text-sm text-red-800">
                <strong>Data atual:</strong>{" "}
                {appointment && format(parseISO(appointment.appointment_date), "dd/MM/yyyy")} às{" "}
                {appointment?.appointment_time.substring(0, 5)}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* New Date Selection */}
        <Card className="border-sand">
          <CardHeader>
            <CardTitle className="text-lg">Escolha a nova data e horário</CardTitle>
            <CardDescription>
              Selecione uma data disponível no calendário
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Week Navigation */}
            <div className="flex items-center justify-between mb-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setCurrentWeekStart(addDays(currentWeekStart, -7))}
                disabled={currentWeekStart <= startOfWeek(new Date(), { weekStartsOn: 0 })}
              >
                <ChevronLeft className="w-4 h-4 mr-1" />
                Semana anterior
              </Button>
              <span className="text-sm font-medium text-charcoal">
                {format(currentWeekStart, "MMMM yyyy", { locale: ptBR })}
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setCurrentWeekStart(addDays(currentWeekStart, 7))}
              >
                Próxima semana
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </div>

            {/* Week Days */}
            <div className="grid grid-cols-7 gap-2">
              {weekDays.map((day) => {
                const available = isDateAvailable(day);
                const isSelected = selectedDate && isSameDay(day, selectedDate);

                return (
                  <button
                    key={day.toISOString()}
                    onClick={() => {
                      if (available) {
                        setSelectedDate(day);
                        setSelectedTime(null);
                      }
                    }}
                    disabled={!available}
                    className={`
                      p-3 rounded-xl text-center transition-all duration-200
                      ${available
                        ? isSelected
                          ? "bg-teal text-white shadow-lg"
                          : "bg-white border border-sand hover:border-teal hover:shadow-md"
                        : "bg-slate/5 text-slate/40 cursor-not-allowed"
                      }
                    `}
                  >
                    <p className="text-xs font-medium uppercase">
                      {format(day, "EEE", { locale: ptBR })}
                    </p>
                    <p className="text-lg font-bold">{format(day, "d")}</p>
                  </button>
                );
              })}
            </div>

            {/* Time Slots */}
            {selectedDate && (
              <div className="pt-4 border-t border-sand">
                <h4 className="font-medium text-charcoal mb-3 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-teal" />
                  Horários disponíveis para {format(selectedDate, "dd/MM")}
                </h4>
                {availableTimes.length > 0 ? (
                  <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                    {availableTimes.map((time) => (
                      <button
                        key={time}
                        onClick={() => setSelectedTime(time)}
                        className={`
                          py-2 px-3 rounded-lg text-sm font-medium transition-all
                          ${selectedTime === time
                            ? "bg-teal text-white shadow-md"
                            : "bg-white border border-sand hover:border-teal"
                          }
                        `}
                      >
                        {time}
                      </button>
                    ))}
                  </div>
                ) : (
                  <p className="text-center text-muted-foreground py-4">
                    Nenhum horário disponível nesta data
                  </p>
                )}
              </div>
            )}

            {/* Confirm Button */}
            <Button
              className="w-full bg-teal hover:bg-teal/90 text-white py-6 text-lg font-semibold"
              disabled={!selectedDate || !selectedTime || submitting}
              onClick={handleReschedule}
            >
              {submitting ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Reagendando...
                </>
              ) : (
                <>
                  <Check className="w-5 h-5 mr-2" />
                  Confirmar Reagendamento
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      </main>

      {/* Footer */}
      <footer className="py-8 text-center text-sm text-muted-foreground">
        <div className="flex items-center justify-center gap-2 mb-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-teal to-teal-dark flex items-center justify-center">
            <Heart className="w-4 h-4 text-white" />
          </div>
          <span className="font-medium">AcolheAqui</span>
        </div>
        <p>Plataforma de agendamento para profissionais de saúde mental</p>
      </footer>
    </div>
  );
};

export default Reagendar;
