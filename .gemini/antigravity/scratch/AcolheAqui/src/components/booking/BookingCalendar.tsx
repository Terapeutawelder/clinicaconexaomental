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
}

interface TimeSlot {
  time: string;
  available: boolean;
}

const BookingCalendar = ({ professionalId, professionalName, professionalPhone, availableHours }: BookingCalendarProps) => {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [isLoadingSlots, setIsLoadingSlots] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(false);
  
  const [clientName, setClientName] = useState("");
  const [clientEmail, setClientEmail] = useState("");
  const [clientPhone, setClientPhone] = useState("");
  const [notes, setNotes] = useState("");

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

      const updatedSlots = slots.map(slot => ({
        ...slot,
        available: !bookedTimes.includes(slot.time)
      }));

      setTimeSlots(updatedSlots);
      setIsLoadingSlots(false);
    };

    fetchAvailableSlots();
  }, [selectedDate, professionalId, availableHours]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedDate || !selectedTime) {
      toast.error("Selecione uma data e horário");
      return;
    }

    if (!clientName.trim() || !clientEmail.trim() || !clientPhone.trim()) {
      toast.error("Preencha todos os campos obrigatórios");
      return;
    }

    setIsSubmitting(true);

    try {
      const appointmentDate = format(selectedDate, "yyyy-MM-dd");
      
      const { error } = await supabase.from("appointments").insert({
        professional_id: professionalId,
        appointment_date: appointmentDate,
        appointment_time: selectedTime,
        client_name: clientName.trim(),
        client_email: clientEmail.trim(),
        client_phone: clientPhone.trim(),
        notes: notes.trim() || null,
        status: "pending",
        payment_status: "pending",
        duration_minutes: 50,
      });

      if (error) throw error;

      // Send notifications via edge function (fire and forget)
      supabase.functions.invoke("send-appointment-notification", {
        body: {
          clientName: clientName.trim(),
          clientEmail: clientEmail.trim(),
          clientPhone: clientPhone.trim(),
          professionalName,
          professionalPhone,
          appointmentDate,
          appointmentTime: selectedTime,
          notes: notes.trim() || null,
        },
      }).then((result) => {
        if (result.error) {
          console.error("Error sending notifications:", result.error);
        } else {
          console.log("Notifications sent:", result.data);
        }
      });

      setBookingSuccess(true);
      toast.success("Agendamento realizado com sucesso!");
    } catch (error) {
      console.error("Error creating appointment:", error);
      toast.error("Erro ao realizar agendamento. Tente novamente.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetBooking = () => {
    setBookingSuccess(false);
    setSelectedDate(undefined);
    setSelectedTime(null);
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
      <h2 className="text-xl font-bold text-foreground mb-6 flex items-center gap-2">
        <CalendarIcon className="h-5 w-5 text-primary" />
        Agendar Sessão
      </h2>

      <div className="space-y-6">
        {/* Calendar */}
        <div>
          <Label className="text-sm font-medium mb-2 block">Escolha uma data</Label>
          <div className="flex justify-center">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={setSelectedDate}
              disabled={isDateDisabled}
              locale={ptBR}
              fromDate={new Date()}
              toDate={addDays(new Date(), 60)}
              className={cn("rounded-md border pointer-events-auto")}
            />
          </div>
        </div>

        {/* Time Slots */}
        {selectedDate && (
          <div>
            <Label className="text-sm font-medium mb-2 block flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Horários disponíveis para {format(selectedDate, "dd/MM")}
            </Label>
            
            {isLoadingSlots ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
              </div>
            ) : timeSlots.length > 0 ? (
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                {timeSlots.map((slot) => (
                  <Button
                    key={slot.time}
                    variant={selectedTime === slot.time ? "default" : "outline"}
                    size="sm"
                    disabled={!slot.available}
                    onClick={() => setSelectedTime(slot.time)}
                    className={cn(
                      "text-sm",
                      !slot.available && "opacity-50 line-through"
                    )}
                  >
                    {slot.time}
                  </Button>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-sm text-center py-4">
                Nenhum horário disponível nesta data.
              </p>
            )}
          </div>
        )}

        {/* Client Form */}
        {selectedTime && (
          <form onSubmit={handleSubmit} className="space-y-4 pt-4 border-t border-border">
            <h3 className="font-medium text-foreground">Seus dados</h3>
            
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

            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Agendando...
                </>
              ) : (
                <>
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Confirmar Agendamento
                </>
              )}
            </Button>

            <p className="text-xs text-muted-foreground text-center">
              Sessão de 50 minutos • {format(selectedDate, "dd 'de' MMMM", { locale: ptBR })} às {selectedTime}
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
