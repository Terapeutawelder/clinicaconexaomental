import { useMemo } from "react";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Trash2, AlertTriangle } from "lucide-react";
import { toast } from "sonner";

interface AvailableHour {
  id?: string;
  day_of_week: number;
  start_time: string;
  end_time: string;
  is_active: boolean;
}

interface AvailableHoursEditorProps {
  hours: AvailableHour[];
  onHoursChange: (hours: AvailableHour[]) => void;
}

const DAYS_OF_WEEK = [
  { value: 0, label: "Dom" },
  { value: 1, label: "Seg" },
  { value: 2, label: "Ter" },
  { value: 3, label: "Qua" },
  { value: 4, label: "Qui" },
  { value: 5, label: "Sex" },
  { value: 6, label: "Sáb" },
];

const TIME_OPTIONS = Array.from({ length: 24 }, (_, i) => {
  const hour = i.toString().padStart(2, "0");
  return [
    { value: `${hour}:00:00`, label: `${hour}:00` },
    { value: `${hour}:30:00`, label: `${hour}:30` },
  ];
}).flat();

// Convert time string to minutes for comparison
const timeToMinutes = (time: string): number => {
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes;
};

// Check if two time ranges overlap
const rangesOverlap = (start1: string, end1: string, start2: string, end2: string): boolean => {
  const s1 = timeToMinutes(start1);
  const e1 = timeToMinutes(end1);
  const s2 = timeToMinutes(start2);
  const e2 = timeToMinutes(end2);
  
  // Check if ranges overlap (excluding touching boundaries)
  return s1 < e2 && s2 < e1;
};

// Validate time range (end must be after start)
const isValidTimeRange = (start: string, end: string): boolean => {
  return timeToMinutes(end) > timeToMinutes(start);
};

const AvailableHoursEditor = ({ hours, onHoursChange }: AvailableHoursEditorProps) => {
  
  // Find overlapping hours for each entry
  const overlappingIndexes = useMemo(() => {
    const overlaps = new Set<number>();
    
    hours.forEach((hour, i) => {
      if (!hour.is_active) return;
      
      hours.forEach((other, j) => {
        if (i >= j || !other.is_active) return;
        if (hour.day_of_week !== other.day_of_week) return;
        
        if (rangesOverlap(hour.start_time, hour.end_time, other.start_time, other.end_time)) {
          overlaps.add(i);
          overlaps.add(j);
        }
      });
    });
    
    return overlaps;
  }, [hours]);

  // Find invalid time ranges (end <= start)
  const invalidRangeIndexes = useMemo(() => {
    const invalid = new Set<number>();
    hours.forEach((hour, i) => {
      if (!isValidTimeRange(hour.start_time, hour.end_time)) {
        invalid.add(i);
      }
    });
    return invalid;
  }, [hours]);

  const hasValidationErrors = overlappingIndexes.size > 0 || invalidRangeIndexes.size > 0;

  const addNewHour = () => {
    onHoursChange([
      ...hours,
      {
        day_of_week: 1,
        start_time: "08:00:00",
        end_time: "18:00:00",
        is_active: true,
      },
    ]);
  };

  const updateHour = (index: number, field: keyof AvailableHour, value: any) => {
    const updated = [...hours];
    updated[index] = { ...updated[index], [field]: value };
    
    // Check for new overlaps after update
    const newHour = updated[index];
    if (field === 'day_of_week' || field === 'start_time' || field === 'end_time') {
      if (newHour.is_active) {
        const hasOverlap = updated.some((other, j) => {
          if (j === index || !other.is_active) return false;
          if (newHour.day_of_week !== other.day_of_week) return false;
          return rangesOverlap(newHour.start_time, newHour.end_time, other.start_time, other.end_time);
        });
        
        if (hasOverlap) {
          toast.warning("Atenção: Este horário sobrepõe outro existente", {
            duration: 2000
          });
        }
      }
      
      // Check for invalid range
      if (field === 'end_time' || field === 'start_time') {
        if (!isValidTimeRange(updated[index].start_time, updated[index].end_time)) {
          toast.error("Horário final deve ser maior que o inicial", {
            duration: 2000
          });
        }
      }
    }
    
    onHoursChange(updated);
  };

  const removeHour = (index: number) => {
    onHoursChange(hours.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-3 mt-4">
      {/* Validation Warning */}
      {hasValidationErrors && (
        <div className="flex items-start gap-2 p-2 bg-amber-50 border border-amber-200 rounded-lg text-amber-700">
          <AlertTriangle className="h-4 w-4 mt-0.5 shrink-0" />
          <div className="text-xs">
            {overlappingIndexes.size > 0 && (
              <p>Existem horários sobrepostos no mesmo dia.</p>
            )}
            {invalidRangeIndexes.size > 0 && (
              <p>Alguns horários têm fim antes do início.</p>
            )}
          </div>
        </div>
      )}

      {hours.length === 0 ? (
        <div className="text-center py-6 text-gray-500">
          <p className="text-sm">Nenhum horário configurado</p>
          <p className="text-xs mt-1">Clique abaixo para adicionar</p>
        </div>
      ) : (
        <div className="space-y-2">
          {hours.map((hour, index) => {
            const hasOverlap = overlappingIndexes.has(index);
            const hasInvalidRange = invalidRangeIndexes.has(index);
            const hasError = hasOverlap || hasInvalidRange;
            
            return (
              <div
                key={hour.id || index}
                className={`
                  flex items-center gap-2 p-2 rounded-lg border transition-colors
                  ${hasError 
                    ? "bg-red-50 border-red-300" 
                    : "bg-gray-50 border-gray-200"
                  }
                `}
              >
                <Switch
                  checked={hour.is_active}
                  onCheckedChange={(checked) => updateHour(index, "is_active", checked)}
                  className="scale-75"
                />

                <Select
                  value={String(hour.day_of_week)}
                  onValueChange={(value) => updateHour(index, "day_of_week", parseInt(value))}
                >
                  <SelectTrigger className={`w-16 h-8 text-xs bg-white ${hasOverlap ? "border-red-300" : "border-gray-200"}`}>
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

                <div className="flex items-center gap-1">
                  <Select
                    value={hour.start_time}
                    onValueChange={(value) => updateHour(index, "start_time", value)}
                  >
                    <SelectTrigger className={`w-16 h-8 text-xs bg-white ${hasError ? "border-red-300" : "border-gray-200"}`}>
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

                  <span className={`text-xs ${hasError ? "text-red-400" : "text-gray-400"}`}>→</span>

                  <Select
                    value={hour.end_time}
                    onValueChange={(value) => updateHour(index, "end_time", value)}
                  >
                    <SelectTrigger className={`w-16 h-8 text-xs bg-white ${hasError ? "border-red-300" : "border-gray-200"}`}>
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

                {hasError && (
                  <AlertTriangle className="h-4 w-4 text-red-500 shrink-0" />
                )}

                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => removeHour(index)}
                  className="h-7 w-7 text-destructive hover:text-destructive hover:bg-destructive/10 ml-auto"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            );
          })}
        </div>
      )}

      <Button
        type="button"
        variant="outline"
        onClick={addNewHour}
        className="w-full h-8 text-xs border-dashed border-gray-300 text-gray-600"
      >
        <Plus className="h-3.5 w-3.5 mr-1" />
        Adicionar Horário
      </Button>

      {/* Quick preview of configured days */}
      {hours.length > 0 && (
        <div className="flex justify-center gap-1 pt-2">
          {DAYS_OF_WEEK.map((day) => {
            const dayHours = hours.filter(h => h.day_of_week === day.value && h.is_active);
            const hasHours = dayHours.length > 0;
            const dayHasOverlap = dayHours.some((_, i) => {
              const idx = hours.findIndex(h => h === dayHours[i]);
              return overlappingIndexes.has(idx);
            });
            
            return (
              <div
                key={day.value}
                className={`
                  w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-medium transition-colors
                  ${dayHasOverlap 
                    ? "bg-red-500 text-white"
                    : hasHours 
                      ? "bg-primary text-primary-foreground" 
                      : "bg-gray-100 text-gray-400"
                  }
                `}
              >
                {day.label.charAt(0)}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default AvailableHoursEditor;
