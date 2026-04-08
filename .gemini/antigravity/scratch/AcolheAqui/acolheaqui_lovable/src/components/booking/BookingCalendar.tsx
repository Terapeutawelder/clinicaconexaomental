import { useState, useEffect } from "react";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { format, addDays, isBefore, startOfDay } from "date-fns";
import { ptBR } from "date-fns/locale";
import { toast } from "sonner";
import { Loader2, Calendar as CalendarIcon, Clock, User, Mail, Phone, CheckCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface AvailableHour {
  day_of_week: number;
  start_time: string;
  end_time: string;
  is_active: boolean;
}

interface BookingCalendarProps {
  professionalId: string;
  professionalName: string;
  professionalPhone?: string;
  availableHours: AvailableHour[];
  requiredSessions?: number;
  onComplete?: (selections: { date: string; time: string }[], clientData: { name: string; email: string; phone: string; notes: string }) => void;
}

interface TimeSlot {
  time: string;
  available: boolean;
}

const BookingCalendar = ({ professionalId, professionalName, professionalPhone, availableHours, requiredSessions = 1, onComplete }: BookingCalendarProps) => {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [selections, setSelections] = useState<{ date: string; time: string }[]>([]);
  
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [isLoadingSlots, setIsLoadingSlots] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(false);
  
  const [clientName, setClientName] = useState("");
  const [clientEmail, setClientEmail] = useState("");
  const [clientPhone, setClientPhone] = useState("");
  const [notes, setNotes] = useState("");

  const isLastSession = selections.length === requiredSessions - 1;
  const isSelectionComplete = selections.length === requiredSessions;

  // Get available days of week from professional's schedule
  const availableDaysOfWeek = [...new Set(
    availableHours.filter(h => h.is_active).map(h => h.day_of_week)
  )];

  // Function to check if a date should be disabled
  const isDateDisabled = (date: Date) => {
    const today = startOfDay(new Date());
    if (isBefore(date, today)) return true;
    
    const dayOfWeek = date.getDay();
    return !availableDaysOfWeek.includes(dayOfWeek);
  };

  // Generate time slots for selected date
  useEffect(() => {
    if (!selectedDate) {
      setTimeSlots([]);
      return;
    }

    const fetchAvailableSlots = async () => {
      setIsLoadingSlots(true);
      setSelectedTime(null);

      const dayOfWeek = selectedDate.getDay();
      const dayHours = availableHours.filter(h => h.day_of_week === dayOfWeek && h.is_active);

      if (dayHours.length === 0) {
        setTimeSlots([]);
        setIsLoadingSlots(false);
        return;
      }

      // Generate 50-minute slots
      const slots: TimeSlot[] = [];
      
      for (const hours of dayHours) {
        const [startHour, startMin] = hours.start_time.split(":").map(Number);
        const [endHour, endMin] = hours.end_time.split(":").map(Number);
        
        let currentHour = startHour;
        let currentMin = startMin;
        
        while (currentHour < endHour || (currentHour === endHour && currentMin < endMin)) {
          const timeStr = `${String(currentHour).padStart(2, "0")}:${String(currentMin).padStart(2, "0")}`;
          slots.push({ time: timeStr, available: true });
          
          // Add 60 minutes (50 min session + 10 min buffer)
          currentMin += 60;
          if (currentMin >= 60) {
            currentHour += Math.floor(currentMin / 60);
            currentMin = currentMin % 60;
          }
        }
      }

      // Check for existing appointments on this date
      const dateStr = format(selectedDate, "yyyy-MM-dd");
      const { data: existingAppointments } = await supabase
        .from("appointments")
        .select("appointment_time")
        .eq("professional_id", professionalId)
        .eq("appointment_date", dateStr)
        .in("status", ["pending", "confirmed"]);

      const bookedTimes = existingAppointments?.map(a => a.appointment_time.slice(0, 5)) || [];

      // Fetch Google Calendar busy times (if connected)
      let googleBusyTimes: { start: string; end: string }[] = [];
      try {
        const startOfDayISO = new Date(`${dateStr}T00:00:00-03:00`).toISOString();
        const endOfDayISO = new Date(`${dateStr}T23:59:59-03:00`).toISOString();
        
        const { data: busyData } = await supabase.functions.invoke('google-calendar-sync', {
          body: {
            action: 'get-busy-times',
            professionalId,
            startDate: startOfDayISO,
            endDate: endOfDayISO,
          },
        });

        if (busyData?.busyTimes) {
          googleBusyTimes = busyData.busyTimes;
        }
      } catch (error) {
        // Google Calendar not connected or error - continue without blocking
        console.log('Google Calendar busy times not available');
      }

      // Check if a slot overlaps with Google Calendar busy times
      const isSlotBusyOnGoogle = (slotTime: string): boolean => {
        const slotStart = new Date(`${dateStr}T${slotTime}:00-03:00`);
        const slotEnd = new Date(slotStart.getTime() + 50 * 60 * 1000); // 50 min session

        return googleBusyTimes.some(busy => {
          const busyStart = new Date(busy.start);
          const busyEnd = new Date(busy.end);
          // Check for overlap: slot starts before busy ends AND slot ends after busy starts
          return slotStart < busyEnd && slotEnd > busyStart;
        });
      };

      const updatedSlots = slots.map(slot => {
        const isSelectedInQueue = selections.some(s => s.date === dateStr && s.time === slot.time);
        return {
          ...slot,
          available: !bookedTimes.includes(slot.time) && !isSlotBusyOnGoogle(slot.time) && !isSelectedInQueue
        };
      });

      setTimeSlots(updatedSlots);
      setIsLoadingSlots(false);
    };

    fetchAvailableSlots();
  }, [selectedDate, professionalId, availableHours, selections]);

  const handleAddSession = () => {
    if (!selectedDate || !selectedTime) return;
    
    const dateStr = format(selectedDate, "yyyy-MM-dd");
    setSelections([...selections, { date: dateStr, time: selectedTime }]);
    setSelectedDate(undefined);
    setSelectedTime(null);
  };

  const handleRemoveSession = (index: number) => {
    setSelections(selections.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isSelectionComplete) {
      toast.error(`Selecione todas as ${requiredSessions} sessões`);
      return;
    }

    if (!clientName.trim() || !clientEmail.trim() || !clientPhone.trim()) {
      toast.error("Preencha todos os campos obrigatórios");
      return;
    }

    // Basic client-side validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(clientEmail.trim())) {
      toast.error("Por favor, insira um e-mail válido");
      return;
    }

    const phoneDigits = clientPhone.replace(/\D/g, "");
    if (phoneDigits.length < 10 || phoneDigits.length > 15) {
      toast.error("Por favor, insira um telefone válido");
      return;
    }

    if (onComplete) {
      onComplete(selections, {
        name: clientName.trim(),
        email: clientEmail.trim(),
        phone: clientPhone.trim(),
        notes: notes.trim()
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Logic for single session direct booking (keeping compatibility)
      const appointmentDate = selections[0].date;
      const appointmentTime = selections[0].time;
      
      const { data, error } = await supabase.functions.invoke("create-appointment", {
        body: {
          professional_id: professionalId,
          appointment_date: appointmentDate,
          appointment_time: appointmentTime,
          client_name: clientName.trim(),
          client_email: clientEmail.trim(),
          client_phone: clientPhone.trim(),
          notes: notes.trim() || null,
          duration_minutes: 50,
        },
      });

      if (error) throw error;

      if (data?.error) {
        toast.error(data.error);
        return;
      }

      setBookingSuccess(true);
      toast.success("Agendamento realizado com sucesso!");
    } catch (error) {
      console.error("Error creating appointment:", error);
      toast.error("Erro ao realizar agendamento.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetBooking = () => {
    setBookingSuccess(false);
    setSelectedDate(undefined);
    setSelectedTime(null);
    setSelections([]);
    setClientName("");
    setClientEmail("");
    setClientPhone("");
    setNotes("");
  };

  if (bookingSuccess) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-border p-8 text-center">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle className="w-8 h-8 text-green-600" />
        </div>
        <h3 className="text-xl font-bold text-foreground mb-2">Agendamento Confirmado!</h3>
        <p className="text-muted-foreground mb-4">
          Sua sessão com {professionalName} foi agendada para{" "}
          <strong>{format(selectedDate!, "dd 'de' MMMM", { locale: ptBR })}</strong> às{" "}
          <strong>{selectedTime}</strong>.
        </p>
        <p className="text-sm text-muted-foreground mb-6">
          Você receberá uma confirmação por e-mail em breve.
        </p>
        <Button onClick={resetBooking} variant="outline">
          Fazer outro agendamento
        </Button>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-border p-6">
      <h2 className="text-xl font-bold text-foreground mb-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <CalendarIcon className="h-5 w-5 text-primary" />
          {requiredSessions > 1 ? `Agendar Pacote (${requiredSessions} sessões)` : "Agendar Sessão"}
        </div>
        {requiredSessions > 1 && (
          <div className="text-xs font-semibold px-2 py-1 bg-primary/10 text-primary rounded-full">
            {selections.length} de {requiredSessions} selecionadas
          </div>
        )}
      </h2>

      {/* Selected Slots Summary */}
      {selections.length > 0 && (
        <div className="mb-6 space-y-2">
          <Label className="text-xs font-semibold text-primary uppercase tracking-wider">Sessões Selecionadas</Label>
          <div className="grid grid-cols-1 gap-2">
            {selections.map((sel, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 bg-primary/5 rounded-lg border border-primary/10">
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full bg-primary text-white flex items-center justify-center text-[10px] font-bold">
                    {idx + 1}
                  </div>
                  <span className="text-sm font-medium text-foreground">
                    {format(new Date(sel.date + 'T12:00:00'), "dd/MM/yyyy")} às {sel.time}
                  </span>
                </div>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
                  onClick={() => handleRemoveSession(idx)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="space-y-6">
        {/* Calendar Selection Flow */}
        {!isSelectionComplete && (
          <div className="animate-in fade-in slide-in-from-top-2 duration-300">
            <div className="bg-muted/30 rounded-xl p-4 border border-border/50">
              <Label className="text-sm font-semibold mb-3 block">
                {requiredSessions > 1 
                  ? `Selecione a ${selections.length + 1}ª sessão` 
                  : "Selecione a data e horário"}
              </Label>
              
              <div className="flex flex-col items-center">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={setSelectedDate}
                  disabled={isDateDisabled}
                  locale={ptBR}
                  fromDate={new Date()}
                  toDate={addDays(new Date(), 60)}
                  className={cn("rounded-md border bg-background")}
                />
              </div>

              {selectedDate && (
                <div className="mt-4 space-y-3 animate-in fade-in duration-300">
                  <Label className="text-xs font-medium text-muted-foreground flex items-center gap-2">
                    <Clock className="h-3 w-3" />
                    Horários para {format(selectedDate, "dd/MM")}
                  </Label>
                  
                  {isLoadingSlots ? (
                    <div className="flex items-center justify-center py-4">
                      <Loader2 className="h-5 w-5 animate-spin text-primary" />
                    </div>
                  ) : timeSlots.length > 0 ? (
                    <div className="grid grid-cols-4 gap-2">
                      {timeSlots.map((slot) => (
                        <Button
                          key={slot.time}
                          variant={selectedTime === slot.time ? "default" : "outline"}
                          size="sm"
                          disabled={!slot.available}
                          onClick={() => setSelectedTime(slot.time)}
                          className={cn(
                            "text-xs px-1",
                            !slot.available && "opacity-30"
                          )}
                        >
                          {slot.time}
                        </Button>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-muted-foreground text-center py-2">Sem horários</p>
                  )}

                  {selectedTime && (
                    <Button 
                      onClick={handleAddSession} 
                      className="w-full mt-2 bg-primary group"
                    >
                      {requiredSessions > 1 ? `Confirmar ${selections.length + 1}ª Sessão` : "Confirmar Horário"}
                      <ChevronRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Client Form - Only shows when all sessions are selected */}
        {isSelectionComplete && (
          <form onSubmit={handleSubmit} className="space-y-4 pt-4 border-t border-border animate-in zoom-in-95 duration-300">
            <h3 className="font-bold text-lg text-primary flex items-center gap-2">
              <CheckCircle className="h-5 w-5" />
              Finalizar Agendamento
            </h3>
            <p className="text-sm text-muted-foreground">Preencha seus dados para prosseguir para o pagamento.</p>
            
            <div className="space-y-3">
              <div>
                <Label htmlFor="clientName" className="text-sm flex items-center gap-2">
                  <User className="h-3 w-3" />
                  Nome completo *
                </Label>
                <Input
                  id="clientName"
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  placeholder="Seu nome"
                  required
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="clientEmail" className="text-sm flex items-center gap-2">
                  <Mail className="h-3 w-3" />
                  E-mail *
                </Label>
                <Input
                  id="clientEmail"
                  type="email"
                  value={clientEmail}
                  onChange={(e) => setClientEmail(e.target.value)}
                  placeholder="seu@email.com"
                  required
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="clientPhone" className="text-sm flex items-center gap-2">
                  <Phone className="h-3 w-3" />
                  WhatsApp *
                </Label>
                <Input
                  id="clientPhone"
                  type="tel"
                  value={clientPhone}
                  onChange={(e) => setClientPhone(e.target.value)}
                  placeholder="(11) 99999-9999"
                  required
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="notes" className="text-sm">
                  Observações (opcional)
                </Label>
                <Textarea
                  id="notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Alguma informação adicional..."
                  rows={3}
                  className="mt-1"
                />
              </div>
            </div>

            <Button type="submit" className="w-full bg-primary hover:bg-primary/90 text-white font-bold h-12" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Processando...
                </>
              ) : (
                <>
                  <CreditCard className="mr-2 h-5 w-5" />
                  Ir para Pagamento
                </>
              )}
            </Button>

            <p className="text-xs text-muted-foreground text-center">
              Você está agendando {requiredSessions} sessão(ões) de 50 minutos.
            </p>
          </form>
        )}

        {/* No available hours message */}
        {availableHours.filter(h => h.is_active).length === 0 && (
          <p className="text-muted-foreground text-sm text-center py-4">
            Este profissional ainda não configurou seus horários disponíveis.
          </p>
        )}
      </div>
    </div>
  );
};

export default BookingCalendar;
