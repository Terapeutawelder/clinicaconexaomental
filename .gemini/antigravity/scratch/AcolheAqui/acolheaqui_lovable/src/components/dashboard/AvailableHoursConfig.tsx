import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Clock, Plus, Trash2, Loader2, Save, Copy } from "lucide-react";

interface AvailableHoursConfigProps {
  profileId: string;
}

interface AvailableHour {
  id?: string;
  day_of_week: number;
  start_time: string;
  end_time: string;
  is_active: boolean;
}

interface DaySchedule {
  day: number;
  label: string;
  shortLabel: string;
  isActive: boolean;
  timeSlots: AvailableHour[];
}

const DAYS_OF_WEEK = [
  { value: 0, label: "Domingo", short: "Dom" },
  { value: 1, label: "Segunda-feira", short: "Seg" },
  { value: 2, label: "Terça-feira", short: "Ter" },
  { value: 3, label: "Quarta-feira", short: "Qua" },
  { value: 4, label: "Quinta-feira", short: "Qui" },
  { value: 5, label: "Sexta-feira", short: "Sex" },
  { value: 6, label: "Sábado", short: "Sáb" },
];

const TIME_OPTIONS = Array.from({ length: 24 }, (_, i) => {
  const hour = i.toString().padStart(2, "0");
  return [
    { value: `${hour}:00:00`, label: `${hour}:00` },
    { value: `${hour}:30:00`, label: `${hour}:30` },
  ];
}).flat();

const AvailableHoursConfig = ({ profileId }: AvailableHoursConfigProps) => {
  const [hours, setHours] = useState<AvailableHour[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetchHours();
  }, [profileId]);

  const fetchHours = async () => {
    try {
      const { data, error } = await supabase
        .from("available_hours")
        .select("*")
        .eq("professional_id", profileId)
        .order("day_of_week")
        .order("start_time");

      if (error) throw error;
      setHours(data || []);
    } catch (error) {
      console.error("Error fetching hours:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Group hours by day of week
  const getScheduleByDay = (): DaySchedule[] => {
    return DAYS_OF_WEEK.map(day => {
      const dayHours = hours.filter(h => h.day_of_week === day.value);
      const isActive = dayHours.some(h => h.is_active);
      return {
        day: day.value,
        label: day.label,
        shortLabel: day.short,
        isActive: dayHours.length > 0 && isActive,
        timeSlots: dayHours,
      };
    });
  };

  const toggleDayActive = async (dayValue: number) => {
    const dayHours = hours.filter(h => h.day_of_week === dayValue);
    
    if (dayHours.length === 0) {
      // Add a default time slot for this day
      setHours(prev => [
        ...prev,
        {
          day_of_week: dayValue,
          start_time: "08:00:00",
          end_time: "18:00:00",
          is_active: true,
        },
      ]);
    } else {
      const allActive = dayHours.every(h => h.is_active);
      
      if (allActive) {
        // Desativar: marcar todos como inativo
        setHours(prev =>
          prev.map(h =>
            h.day_of_week === dayValue ? { ...h, is_active: false } : h
          )
        );
      } else {
        // Ativar: marcar todos como ativo
        setHours(prev =>
          prev.map(h =>
            h.day_of_week === dayValue ? { ...h, is_active: true } : h
          )
        );
      }
    }
  };

  const addTimeSlotToDay = (dayValue: number) => {
    setHours(prev => [
      ...prev,
      {
        day_of_week: dayValue,
        start_time: "08:00:00",
        end_time: "18:00:00",
        is_active: true,
      },
    ]);
  };

  const updateTimeSlot = (hourId: string | undefined, index: number, dayValue: number, field: "start_time" | "end_time", value: string) => {
    setHours(prev => {
      // Find the actual index in the full array
      let dayIndex = 0;
      return prev.map(h => {
        if (h.day_of_week === dayValue) {
          if (dayIndex === index) {
            dayIndex++;
            return { ...h, [field]: value };
          }
          dayIndex++;
        }
        return h;
      });
    });
  };

  const removeTimeSlot = async (hour: AvailableHour, dayValue: number, slotIndex: number) => {
    // Delete from database if exists
    if (hour.id) {
      try {
        const { error } = await supabase
          .from("available_hours")
          .delete()
          .eq("id", hour.id);
        
        if (error) throw error;
        toast.success("Horário removido");
      } catch (error) {
        toast.error("Erro ao remover horário");
        return;
      }
    }

    // Remove from state
    setHours(prev => {
      let dayIndex = 0;
      return prev.filter(h => {
        if (h.day_of_week === dayValue) {
          if (dayIndex === slotIndex) {
            dayIndex++;
            return false; // Remove this item
          }
          dayIndex++;
        }
        return true;
      });
    });
  };

  const copyTimeSlots = async (fromDay: number) => {
    const dayHours = hours.filter(h => h.day_of_week === fromDay && h.is_active);
    if (dayHours.length === 0) {
      toast.error("Não há horários ativos para copiar");
      return;
    }

    // Copy to next day
    const nextDay = (fromDay + 1) % 7;
    
    // Delete existing hours for next day from database
    const existingNextDayHours = hours.filter(h => h.day_of_week === nextDay && h.id);
    for (const hour of existingNextDayHours) {
      try {
        await supabase.from("available_hours").delete().eq("id", hour.id);
      } catch (error) {
        console.error("Error deleting hour:", error);
      }
    }

    const newSlots = dayHours.map(h => ({
      day_of_week: nextDay,
      start_time: h.start_time,
      end_time: h.end_time,
      is_active: true,
    }));

    // Remove existing slots for next day from state and add new ones
    setHours(prev => [
      ...prev.filter(h => h.day_of_week !== nextDay),
      ...newSlots,
    ]);
    toast.success(`Horários copiados para ${DAYS_OF_WEEK[nextDay].label}`);
  };

  const saveAllHours = async () => {
    setIsSaving(true);
    try {
      for (const hour of hours) {
        const payload = {
          professional_id: profileId,
          day_of_week: hour.day_of_week,
          start_time: hour.start_time,
          end_time: hour.end_time,
          is_active: hour.is_active,
        };

        if (hour.id) {
          const { error } = await supabase
            .from("available_hours")
            .update(payload)
            .eq("id", hour.id);
          if (error) throw error;
        } else {
          const { data, error } = await supabase
            .from("available_hours")
            .insert(payload)
            .select()
            .single();
          if (error) throw error;
          hour.id = data.id;
        }
      }

      toast.success("Horários salvos com sucesso!");
      fetchHours();
    } catch (error: any) {
      if (error.code === "23505") {
        toast.error("Já existe um horário com essa configuração");
      } else {
        toast.error("Erro ao salvar horários");
      }
      console.error(error);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const schedule = getScheduleByDay();

  return (
    <div className="space-y-4">
      {/* Clean card design without duplicate header */}
      <Card className="bg-card border-border/50">
        <CardHeader className="pb-2">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Clock className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-base text-foreground">Horário de Trabalho Semanal</CardTitle>
              <CardDescription className="text-muted-foreground text-sm">
                Defina dias e horários de trabalho para determinar quando a disponibilidade aparecerá
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-1">
          {schedule.map((daySchedule) => (
            <div
              key={daySchedule.day}
              className="py-3 border-b border-border/50 last:border-b-0"
            >
              <div className="flex items-start gap-4">
                {/* Day checkbox and label */}
                <div className="flex items-center gap-3 min-w-[80px]">
                  <Checkbox
                    checked={daySchedule.isActive}
                    onCheckedChange={() => toggleDayActive(daySchedule.day)}
                    className="data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                  />
                  <span className="font-medium text-foreground text-sm">
                    {daySchedule.shortLabel}
                  </span>
                </div>

                {/* Time slots or "Indisponível" */}
                <div className="flex-1">
                  {!daySchedule.isActive || daySchedule.timeSlots.length === 0 ? (
                    <span className="text-sm text-blue-500">Indisponível</span>
                  ) : (
                    <div className="space-y-2">
                      {daySchedule.timeSlots.map((slot, slotIndex) => (
                        <div key={slot.id || `${daySchedule.day}-${slotIndex}`} className="flex items-center gap-2 flex-wrap">
                          <div className="flex items-center gap-1">
                            <span className="text-xs text-muted-foreground hidden sm:inline">Início</span>
                            <Select
                              value={slot.start_time}
                              onValueChange={(value) => updateTimeSlot(slot.id, slotIndex, daySchedule.day, "start_time", value)}
                            >
                              <SelectTrigger className="w-[100px] h-8 text-sm bg-background border-border">
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

                          <div className="flex items-center gap-1">
                            <span className="text-xs text-muted-foreground hidden sm:inline">Término</span>
                            <Select
                              value={slot.end_time}
                              onValueChange={(value) => updateTimeSlot(slot.id, slotIndex, daySchedule.day, "end_time", value)}
                            >
                              <SelectTrigger className="w-[100px] h-8 text-sm bg-background border-border">
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

                          {/* Delete button */}
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => removeTimeSlot(slot, daySchedule.day, slotIndex)}
                            className="h-8 w-8 text-muted-foreground hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>

                          {/* Copy button - only on first slot */}
                          {slotIndex === 0 && (
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => copyTimeSlots(daySchedule.day)}
                              className="h-8 w-8 text-muted-foreground hover:text-primary"
                              title="Copiar para próximo dia"
                            >
                              <Copy className="h-4 w-4" />
                            </Button>
                          )}

                          {/* Add slot button - only on last slot */}
                          {slotIndex === daySchedule.timeSlots.length - 1 && (
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => addTimeSlotToDay(daySchedule.day)}
                              className="h-8 w-8 text-muted-foreground hover:text-primary"
                              title="Adicionar horário"
                            >
                              <Plus className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}

          <Button onClick={saveAllHours} disabled={isSaving} className="w-full mt-6">
            {isSaving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
            Salvar
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default AvailableHoursConfig;
