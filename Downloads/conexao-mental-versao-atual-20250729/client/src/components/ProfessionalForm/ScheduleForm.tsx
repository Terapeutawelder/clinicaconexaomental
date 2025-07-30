
import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import { Calendar as CalendarIcon, Clock, Plus, X } from "lucide-react";

interface ScheduleFormProps {
  availableDates: Date[];
  selectedDate: Date | undefined;
  timeSlots: { [key: string]: string[] };
  currentTimeSlot: string;
  setSelectedDate: (date: Date | undefined) => void;
  setCurrentTimeSlot: (time: string) => void;
  addAvailableDate: (date: Date | undefined) => void;
  removeAvailableDate: (date: Date) => void;
  addTimeSlot: (date: Date) => void;
  removeTimeSlot: (date: Date, timeSlot: string) => void;
}

const ScheduleForm = ({
  availableDates,
  selectedDate,
  timeSlots,
  currentTimeSlot,
  setSelectedDate,
  setCurrentTimeSlot,
  addAvailableDate,
  removeAvailableDate,
  addTimeSlot,
  removeTimeSlot,
}: ScheduleFormProps) => {
  const [selectedDateForTime, setSelectedDateForTime] = useState<Date | null>(null);

  const predefinedTimeSlots = [
    "08:00", "08:30", "09:00", "09:30", "10:00", "10:30",
    "11:00", "11:30", "14:00", "14:30", "15:00", "15:30",
    "16:00", "16:30", "17:00", "17:30", "18:00", "18:30"
  ];

  const addPredefinedTimeSlot = (date: Date, time: string) => {
    const dateKey = date.toDateString();
    const existingSlots = timeSlots[dateKey] || [];
    if (!existingSlots.includes(time)) {
      setCurrentTimeSlot(time);
      addTimeSlot(date);
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <Label>Selecionar Datas Disponíveis</Label>
          <div className="mt-2">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={setSelectedDate}
              disabled={(date) => date < new Date()}
              className="rounded-md border"
            />
            <Button
              type="button"
              onClick={() => addAvailableDate(selectedDate)}
              disabled={!selectedDate}
              className="mt-2 w-full"
            >
              <Plus className="h-4 w-4 mr-2" />
              Adicionar Data
            </Button>
          </div>
        </div>

        <div>
          <Label>Datas Selecionadas</Label>
          <div className="mt-2 space-y-3 max-h-96 overflow-y-auto">
            {availableDates.map((date, index) => (
              <Card key={index} className="p-3">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center">
                    <CalendarIcon className="h-4 w-4 mr-2" />
                    <span className="font-medium">
                      {date.toLocaleDateString('pt-BR')}
                    </span>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeAvailableDate(date)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                
                {/* Horários Pré-definidos */}
                <div className="space-y-3">
                  <div>
                    <Label className="text-sm font-medium">Horários Disponíveis:</Label>
                    <div className="grid grid-cols-3 gap-2 mt-2">
                      {predefinedTimeSlots.map((time) => {
                        const dateKey = date.toDateString();
                        const isSelected = timeSlots[dateKey]?.includes(time);
                        return (
                          <Button
                            key={time}
                            type="button"
                            variant={isSelected ? "default" : "outline"}
                            size="sm"
                            className="text-xs h-8"
                            onClick={() => {
                              if (isSelected) {
                                removeTimeSlot(date, time);
                              } else {
                                addPredefinedTimeSlot(date, time);
                              }
                            }}
                          >
                            {time}
                          </Button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Horário Personalizado */}
                  <div>
                    <Label className="text-sm font-medium">Horário Personalizado:</Label>
                    <div className="flex gap-2 mt-2">
                      <Input
                        type="time"
                        value={selectedDateForTime === date ? currentTimeSlot : ""}
                        onChange={(e) => {
                          setSelectedDateForTime(date);
                          setCurrentTimeSlot(e.target.value);
                        }}
                        className="flex-1"
                      />
                      <Button
                        type="button"
                        size="sm"
                        onClick={() => {
                          setSelectedDateForTime(date);
                          addTimeSlot(date);
                        }}
                        disabled={!currentTimeSlot || selectedDateForTime !== date}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  
                  {/* Horários Selecionados */}
                  {timeSlots[date.toDateString()] && timeSlots[date.toDateString()].length > 0 && (
                    <div>
                      <Label className="text-sm font-medium">Horários Selecionados:</Label>
                      <div className="flex flex-wrap gap-1 mt-2">
                        {timeSlots[date.toDateString()].map((slot, slotIndex) => (
                          <Badge key={slotIndex} variant="secondary" className="text-xs">
                            <Clock className="h-3 w-3 mr-1" />
                            {slot}
                            <X 
                              className="h-3 w-3 ml-1 cursor-pointer" 
                              onClick={() => removeTimeSlot(date, slot)}
                            />
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </Card>
            ))}
            
            {availableDates.length === 0 && (
              <p className="text-muted-foreground text-center py-4">
                Nenhuma data selecionada
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ScheduleForm;
