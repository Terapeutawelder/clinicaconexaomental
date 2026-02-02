import { useState } from "react";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Calendar, Clock } from "lucide-react";

interface AvailableHour {
  day_of_week: number;
  start_time: string;
  end_time: string;
  is_active: boolean;
}

interface Service {
  id: string;
  name: string;
  description: string | null;
  duration_minutes: number;
  price_cents: number;
}

interface ScheduleModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: (date: Date, time: string) => void;
  availableHours: AvailableHour[];
  service: Service;
  accentColor?: string;
}

const ScheduleModal = ({ 
  open, 
  onClose, 
  onConfirm, 
  availableHours,
  service,
  accentColor = "#dc2626"
}: ScheduleModalProps) => {
  const [calendarDate, setCalendarDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    return { daysInMonth: lastDay.getDate(), startingDay: firstDay.getDay() };
  };

  const formatMonthYear = (date: Date) => {
    return date.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
  };

  const getAvailableTimesForDay = (date: Date): string[] => {
    const dayOfWeek = date.getDay();
    const hoursForDay = availableHours.filter(h => h.day_of_week === dayOfWeek && h.is_active);
    const times: string[] = [];
    
    hoursForDay.forEach(h => {
      const [startH, startM] = h.start_time.split(':').map(Number);
      const [endH, endM] = h.end_time.split(':').map(Number);
      let current = startH * 60 + startM;
      const end = endH * 60 + endM;
      
      while (current < end) {
        const hours = Math.floor(current / 60);
        const minutes = current % 60;
        times.push(`${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`);
        current += 60;
      }
    });
    
    return times.sort();
  };

  const isDateAvailable = (date: Date): boolean => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (date < today) return false;
    
    const dayOfWeek = date.getDay();
    return availableHours.some(h => h.day_of_week === dayOfWeek && h.is_active);
  };

  const handleConfirm = () => {
    if (selectedDate && selectedTime) {
      onConfirm(selectedDate, selectedTime);
    }
  };

  const formatPrice = (cents: number) => {
    return (cents / 100).toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
  };

  const { daysInMonth, startingDay } = getDaysInMonth(calendarDate);
  const availableTimes = selectedDate ? getAvailableTimesForDay(selectedDate) : [];

  return (
    <Dialog open={open} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-lg p-0 overflow-hidden">
        <div className="p-6">
          <DialogHeader className="mb-6">
            <DialogTitle className="text-xl font-bold text-center">
              Agende sua sessão
            </DialogTitle>
          </DialogHeader>

          {/* Service Info */}
          <div 
            className="rounded-xl p-4 mb-6"
            style={{ backgroundColor: `${accentColor}10` }}
          >
            <h3 className="font-semibold text-gray-900">{service.name}</h3>
            <div className="flex items-center justify-between mt-2">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Clock className="w-4 h-4" />
                <span>{service.duration_minutes} minutos</span>
              </div>
              <span className="font-bold text-lg" style={{ color: accentColor }}>
                {formatPrice(service.price_cents)}
              </span>
            </div>
          </div>

          {/* Calendar */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <button 
                onClick={() => setCalendarDate(new Date(calendarDate.getFullYear(), calendarDate.getMonth() - 1))}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <ChevronLeft className="w-5 h-5 text-gray-600" />
              </button>
              <h4 className="font-semibold text-gray-800 capitalize">{formatMonthYear(calendarDate)}</h4>
              <button 
                onClick={() => setCalendarDate(new Date(calendarDate.getFullYear(), calendarDate.getMonth() + 1))}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <ChevronRight className="w-5 h-5 text-gray-600" />
              </button>
            </div>
            
            <div className="grid grid-cols-7 gap-1 text-center">
              {['D', 'S', 'T', 'Q', 'Q', 'S', 'S'].map((day, i) => (
                <div key={i} className="py-2 text-sm text-gray-500 font-medium">{day}</div>
              ))}
              
              {Array.from({ length: startingDay }).map((_, i) => (
                <div key={`empty-${i}`} className="py-2" />
              ))}
              
              {Array.from({ length: daysInMonth }).map((_, i) => {
                const day = i + 1;
                const date = new Date(calendarDate.getFullYear(), calendarDate.getMonth(), day);
                const isAvailable = isDateAvailable(date);
                const isSelected = selectedDate?.toDateString() === date.toDateString();
                const isToday = new Date().toDateString() === date.toDateString();

                return (
                  <button
                    key={day}
                    onClick={() => {
                      if (isAvailable) {
                        setSelectedDate(date);
                        setSelectedTime(null);
                      }
                    }}
                    disabled={!isAvailable}
                    className={`
                      aspect-square rounded-full flex items-center justify-center text-sm font-medium transition-all
                      ${isSelected 
                        ? 'text-white' 
                        : isAvailable 
                          ? 'hover:bg-gray-100 text-gray-700' 
                          : 'text-gray-300 cursor-not-allowed'
                      }
                      ${isToday && !isSelected ? 'ring-2 ring-offset-2' : ''}
                    `}
                    style={{ 
                      backgroundColor: isSelected ? accentColor : undefined,
                      ...(isToday && !isSelected ? { boxShadow: `0 0 0 2px ${accentColor}` } : {})
                    }}
                  >
                    {day}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Time Selection */}
          {selectedDate && availableTimes.length > 0 && (
            <div className="mb-6">
              <p className="text-sm text-gray-600 mb-3">
                Horários disponíveis para {selectedDate.toLocaleDateString('pt-BR', { day: '2-digit', month: 'long' })}:
              </p>
              <div className="grid grid-cols-4 gap-2">
                {availableTimes.map((time) => (
                  <button
                    key={time}
                    onClick={() => setSelectedTime(time)}
                    className={`
                      py-2.5 px-3 rounded-lg border text-sm font-medium transition-all
                      ${selectedTime === time
                        ? 'text-white border-transparent'
                        : 'border-gray-200 text-gray-700 hover:border-gray-400'
                      }
                    `}
                    style={{ 
                      backgroundColor: selectedTime === time ? accentColor : undefined,
                    }}
                  >
                    {time}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Confirm Button */}
          <Button
            onClick={handleConfirm}
            disabled={!selectedDate || !selectedTime}
            className="w-full h-12 text-base font-semibold"
            style={{ backgroundColor: accentColor }}
          >
            <Calendar className="w-5 h-5 mr-2" />
            Confirmar Agendamento
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ScheduleModal;
