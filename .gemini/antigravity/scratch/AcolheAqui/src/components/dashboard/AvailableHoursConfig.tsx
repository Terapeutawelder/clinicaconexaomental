import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Clock, Plus, Trash2, Loader2, Save } from "lucide-react";

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

const DAYS_OF_WEEK = [
  { value: 0, label: "Domingo" },
  { value: 1, label: "Segunda-feira" },
  { value: 2, label: "Terça-feira" },
  { value: 3, label: "Quarta-feira" },
  { value: 4, label: "Quinta-feira" },
  { value: 5, label: "Sexta-feira" },
  { value: 6, label: "Sábado" },
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

  const addNewHour = () => {
    setHours(prev => [
      ...prev,
      {
        day_of_week: 1,
        start_time: "08:00:00",
        end_time: "18:00:00",
        is_active: true,
      },
    ]);
  };

  const updateHour = (index: number, field: keyof AvailableHour, value: any) => {
    setHours(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const removeHour = async (index: number) => {
    const hour = hours[index];
    
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

    setHours(prev => prev.filter((_, i) => i !== index));
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

  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Clock className="h-6 w-6 text-primary" />
            </div>
            <div>
              <CardTitle className="text-foreground">Horários Disponíveis</CardTitle>
              <CardDescription className="text-muted-foreground">
                Configure os horários em que você está disponível para atendimento
              </CardDescription>
            </div>
          </div>
          <Button onClick={addNewHour} variant="outline" size="sm" className="border-border">
            <Plus className="h-4 w-4 mr-2" />
            Adicionar
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {hours.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Nenhum horário configurado</p>
            <p className="text-sm">Clique em "Adicionar" para configurar seus horários</p>
          </div>
        ) : (
          <div className="space-y-4">
            {hours.map((hour, index) => (
              <div
                key={hour.id || index}
                className="flex flex-col sm:flex-row items-start sm:items-center gap-4 p-4 bg-muted/50 rounded-lg border border-border"
              >
                <div className="flex items-center gap-2">
                  <Switch
                    checked={hour.is_active}
                    onCheckedChange={(checked) => updateHour(index, "is_active", checked)}
                  />
                </div>

                <Select
                  value={String(hour.day_of_week)}
                  onValueChange={(value) => updateHour(index, "day_of_week", parseInt(value))}
                >
                  <SelectTrigger className="w-40 bg-muted border-border text-foreground">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {DAYS_OF_WEEK.map((day) => (
                      <SelectItem key={day.value} value={String(day.value)}>
                        {day.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <div className="flex items-center gap-2">
                  <Select
                    value={hour.start_time}
                    onValueChange={(value) => updateHour(index, "start_time", value)}
                  >
                    <SelectTrigger className="w-24 bg-muted border-border text-foreground">
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

                  <span className="text-muted-foreground">até</span>

                  <Select
                    value={hour.end_time}
                    onValueChange={(value) => updateHour(index, "end_time", value)}
                  >
                    <SelectTrigger className="w-24 bg-muted border-border text-foreground">
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

                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => removeHour(index)}
                  className="text-destructive hover:text-destructive hover:bg-destructive/10 ml-auto"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        )}

        {hours.length > 0 && (
          <Button onClick={saveAllHours} disabled={isSaving} className="w-full mt-4">
            {isSaving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
            Salvar Todos os Horários
          </Button>
        )}
      </CardContent>
    </Card>
  );
};

export default AvailableHoursConfig;
