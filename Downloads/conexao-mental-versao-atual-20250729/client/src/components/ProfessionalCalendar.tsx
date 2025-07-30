import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CalendarDays, Clock, User, Phone, Mail, Video, CheckCircle, XCircle, AlertCircle } from "lucide-react";
import { format, addDays, startOfWeek, endOfWeek, isSameDay, isSameMonth, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import AppointmentDetailsModal from "@/components/AppointmentDetailsModal";

interface Appointment {
  id: number;
  patientName: string;
  patientPhone: string;
  patientEmail: string;
  date: string;
  time: string;
  status: "agendado" | "confirmado" | "realizado" | "cancelado";
  type: "consulta" | "retorno";
}

interface TimeSlot {
  time: string;
  available: boolean;
  appointment?: Appointment;
}

interface ProfessionalCalendarProps {
  appointments: Appointment[];
  onAppointmentClick?: (appointment: Appointment) => void;
}

const ProfessionalCalendar = ({ appointments, onAppointmentClick }: ProfessionalCalendarProps) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [viewMode, setViewMode] = useState<'month' | 'week'>('week');

  // Buscar horários configurados pelo profissional
  const getAvailableHoursForDate = (date: Date) => {
    const savedCustomTimeSlots = localStorage.getItem('professionalCustomTimeSlots');
    const customTimeSlots = savedCustomTimeSlots ? JSON.parse(savedCustomTimeSlots) : {};
    
    const dateKey = date.toISOString().split('T')[0];
    const configuredSlots = customTimeSlots[dateKey] || [];
    
    // Se há horários configurados para esta data específica, usar apenas esses
    if (configuredSlots.length > 0) {
      return configuredSlots.sort();
    }
    
    // Caso contrário, retornar array vazio (profissional precisa configurar)
    return [];
  };

  // Horários de trabalho baseados na configuração do profissional
  const workingHours = selectedDate ? getAvailableHoursForDate(selectedDate) : [];

  // Gerar calendário do mês atual
  const generateCalendarDays = () => {
    const startDate = startOfWeek(new Date(currentDate.getFullYear(), currentDate.getMonth(), 1));
    const days = [];
    
    for (let i = 0; i < 35; i++) {
      const day = addDays(startDate, i);
      const dayAppointments = appointments.filter(apt => {
        // Converter data do formato dd/mm/yyyy para comparação
        const [dayPart, monthPart, yearPart] = apt.date.split('/');
        const appointmentDate = new Date(parseInt(yearPart), parseInt(monthPart) - 1, parseInt(dayPart));
        return isSameDay(day, appointmentDate);
      });
      
      days.push({
        date: day,
        appointments: dayAppointments,
        isCurrentMonth: isSameMonth(day, currentDate),
        isToday: isSameDay(day, new Date())
      });
    }
    
    return days;
  };

  // Gerar dias da semana atual
  const generateWeekDays = () => {
    const startDate = startOfWeek(currentDate);
    const days = [];
    
    for (let i = 0; i < 7; i++) {
      const day = addDays(startDate, i);
      const dayAppointments = appointments.filter(apt => {
        // Converter data do formato dd/mm/yyyy para comparação
        const [dayPart, monthPart, yearPart] = apt.date.split('/');
        const appointmentDate = new Date(parseInt(yearPart), parseInt(monthPart) - 1, parseInt(dayPart));
        return isSameDay(day, appointmentDate);
      });
      
      days.push({
        date: day,
        appointments: dayAppointments,
        isToday: isSameDay(day, new Date())
      });
    }
    
    return days;
  };

  // Gerar slots de horário para um dia específico
  const generateTimeSlots = (date: Date): TimeSlot[] => {
    const dateStr = format(date, 'dd/MM/yyyy');
    const dayAppointments = appointments.filter(apt => apt.date === dateStr);
    
    return workingHours.map(time => {
      const appointment = dayAppointments.find(apt => apt.time === time);
      return {
        time,
        available: !appointment,
        appointment
      };
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'agendado': return 'bg-blue-500';
      case 'confirmado': return 'bg-green-500';
      case 'realizado': return 'bg-gray-500';
      case 'cancelado': return 'bg-red-500';
      default: return 'bg-gray-400';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'agendado': return <AlertCircle className="h-4 w-4" />;
      case 'confirmado': return <CheckCircle className="h-4 w-4" />;
      case 'realizado': return <CheckCircle className="h-4 w-4" />;
      case 'cancelado': return <XCircle className="h-4 w-4" />;
      default: return <AlertCircle className="h-4 w-4" />;
    }
  };

  const calendarDays = generateCalendarDays();
  const weekDays = generateWeekDays();
  const timeSlots = selectedDate ? generateTimeSlots(selectedDate) : [];

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      if (direction === 'prev') {
        newDate.setMonth(prev.getMonth() - 1);
      } else {
        newDate.setMonth(prev.getMonth() + 1);
      }
      return newDate;
    });
  };

  const navigateWeek = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      if (direction === 'prev') {
        newDate.setDate(prev.getDate() - 7);
      } else {
        newDate.setDate(prev.getDate() + 7);
      }
      return newDate;
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-2">
        <CalendarDays className="h-6 w-6 text-primary" />
        <h2 className="text-2xl font-bold">Agenda Profissional</h2>
      </div>

      <div className="flex gap-6">
          {/* Calendário */}
          <Card className="flex-1">
            <CardHeader>
              <div className="flex justify-between items-center mb-4">
                <CardTitle>
                  {viewMode === 'week' 
                    ? `Semana de ${format(startOfWeek(currentDate), 'dd/MM', { locale: ptBR })} a ${format(endOfWeek(currentDate), 'dd/MM/yyyy', { locale: ptBR })}`
                    : format(currentDate, 'MMMM yyyy', { locale: ptBR })
                  }
                </CardTitle>
                <div className="flex space-x-2">
                  <Button 
                    variant={viewMode === 'week' ? 'default' : 'outline'} 
                    size="sm" 
                    onClick={() => setViewMode('week')}
                  >
                    Semana
                  </Button>
                  <Button 
                    variant={viewMode === 'month' ? 'default' : 'outline'} 
                    size="sm" 
                    onClick={() => setViewMode('month')}
                  >
                    Mês
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => viewMode === 'week' ? navigateWeek('prev') : navigateMonth('prev')}>
                    ←
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => viewMode === 'week' ? navigateWeek('next') : navigateMonth('next')}>
                    →
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {viewMode === 'week' ? (
                // Visualização Semanal
                <div>
                  {/* Cabeçalho da semana */}
                  <div className="grid grid-cols-8 gap-1 mb-4">
                    <div className="text-center text-sm font-medium text-muted-foreground p-2">
                      Horário
                    </div>
                    {weekDays.map((day, index) => (
                      <div key={index} className="text-center p-2">
                        <div className="text-sm font-medium text-muted-foreground">
                          {format(day.date, 'EEE', { locale: ptBR })}
                        </div>
                        <div className={`text-lg font-bold ${day.isToday ? 'text-primary' : ''}`}>
                          {format(day.date, 'd')}
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  {/* Grade de horários */}
                  <div className="max-h-96 overflow-y-auto">
                    {(() => {
                      // Coletar todos os horários únicos configurados para a semana
                      const allConfiguredHours = new Set<string>();
                      weekDays.forEach(day => {
                        const dayHours = getAvailableHoursForDate(day.date);
                        dayHours.forEach(hour => allConfiguredHours.add(hour));
                      });
                      
                      const sortedHours = Array.from(allConfiguredHours).sort();
                      
                      if (sortedHours.length === 0) {
                        return (
                          <div className="text-center py-8 text-gray-500">
                            <p className="text-sm">Nenhum horário configurado para esta semana</p>
                            <p className="text-xs">Configure seus horários na aba "Disponibilidade de Horários"</p>
                          </div>
                        );
                      }
                      
                      return sortedHours.map((hour, hourIndex) => (
                        <div key={hourIndex} className="grid grid-cols-8 gap-1 mb-1">
                          <div className="text-sm text-muted-foreground p-2 text-center border-r">
                            {hour}
                          </div>
                          {weekDays.map((day, dayIndex) => {
                            const dayStr = format(day.date, 'dd/MM/yyyy');
                            const appointment = appointments.find(apt => apt.date === dayStr && apt.time === hour);
                            const hasThisHourAvailable = getAvailableHoursForDate(day.date).includes(hour);
                            
                            return (
                              <div
                                key={dayIndex}
                                className={`
                                  p-1 h-12 border rounded text-xs cursor-pointer transition-colors
                                  ${!hasThisHourAvailable ? 'bg-gray-100 border-gray-200' : 
                                    appointment ? getStatusColor(appointment.status) : 'bg-green-50 border-green-200 hover:bg-green-100'}
                                  ${day.isToday ? 'border-primary border-2' : ''}
                                `}
                                onClick={() => {
                                  if (hasThisHourAvailable && appointment && onAppointmentClick) {
                                    onAppointmentClick(appointment);
                                  } else if (hasThisHourAvailable) {
                                    setSelectedDate(day.date);
                                  }
                                }}
                              >
                                {!hasThisHourAvailable ? (
                                  <div className="text-center text-gray-400 font-medium h-full flex items-center justify-center text-xs">
                                    —
                                  </div>
                                ) : appointment ? (
                                  <div className="truncate text-white">
                                    <div className="font-medium text-xs">{appointment.patientName}</div>
                                    <div className="text-xs opacity-90">{appointment.type}</div>
                                  </div>
                                ) : (
                                  <div className="text-center text-green-600 font-medium h-full flex items-center justify-center">
                                    Livre
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      ));
                    })()}
                  </div>
                </div>
              ) : (
                // Visualização Mensal
                <div>
                  {/* Dias da semana */}
                  <div className="grid grid-cols-7 gap-1 mb-2">
                    {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map(day => (
                      <div key={day} className="text-center text-sm font-medium text-muted-foreground p-2">
                        {day}
                      </div>
                    ))}
                  </div>
                  
                  {/* Dias do mês */}
                  <div className="grid grid-cols-7 gap-1">
                    {calendarDays.map((day, index) => (
                      <div
                        key={index}
                        className={`
                          relative p-2 h-16 border rounded cursor-pointer transition-colors
                          ${day.isCurrentMonth ? 'bg-background' : 'bg-muted/50'}
                          ${day.isToday ? 'bg-primary/10 border-primary' : ''}
                          ${selectedDate && isSameDay(day.date, selectedDate) ? 'bg-primary/20' : ''}
                          hover:bg-muted/50
                        `}
                        onClick={() => setSelectedDate(day.date)}
                      >
                        <div className="text-sm font-medium">
                          {format(day.date, 'd')}
                        </div>
                        {day.appointments.length > 0 && (
                          <div className="absolute bottom-1 left-1 right-1">
                            <div className="flex flex-wrap gap-1">
                              {day.appointments.slice(0, 2).map((apt, idx) => (
                                <div
                                  key={idx}
                                  className={`w-2 h-2 rounded-full ${getStatusColor(apt.status)}`}
                                />
                              ))}
                              {day.appointments.length > 2 && (
                                <div className="text-xs text-muted-foreground">
                                  +{day.appointments.length - 2}
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Detalhes do dia selecionado */}
          <Card className="w-80">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-lg">
                <Clock className="h-5 w-5" />
                <span>
                  {selectedDate ? format(selectedDate, 'dd/MM/yyyy') : 'Selecione um dia'}
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {selectedDate ? (
                <div className="space-y-1">
                  {timeSlots.map((slot, index) => (
                    <div
                      key={index}
                      className={`
                        p-2 rounded-md border transition-colors
                        ${slot.available ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'}
                      `}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <Clock className="h-3 w-3" />
                          <span className="font-medium text-sm">{slot.time}</span>
                        </div>
                        {slot.appointment ? (
                          <div className="flex items-center space-x-1">
                            {getStatusIcon(slot.appointment.status)}
                            <Badge variant="secondary" className="text-xs">
                              {slot.appointment.status}
                            </Badge>
                          </div>
                        ) : (
                          <Badge variant="outline" className="text-green-600 text-xs">
                            Disponível
                          </Badge>
                        )}
                      </div>
                      
                      {slot.appointment && (
                        <div className="mt-2 space-y-1">
                          <div className="flex items-center space-x-2 text-xs">
                            <User className="h-3 w-3" />
                            <span>{slot.appointment.patientName}</span>
                          </div>
                          <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                            <Phone className="h-3 w-3" />
                            <span>{slot.appointment.patientPhone}</span>
                          </div>
                          <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                            <Mail className="h-3 w-3" />
                            <span>{slot.appointment.patientEmail}</span>
                          </div>
                          <div className="flex items-center space-x-2 text-xs">
                            <Video className="h-3 w-3" />
                            <span>{slot.appointment.type === 'consulta' ? 'Consulta' : 'Retorno'}</span>
                          </div>
                          <AppointmentDetailsModal appointment={slot.appointment}>
                            <Button
                              size="sm"
                              variant="outline"
                              className="mt-2 w-full text-xs"
                            >
                              Ver Detalhes
                            </Button>
                          </AppointmentDetailsModal>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center text-muted-foreground py-8">
                  <CalendarDays className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p className="text-sm">Selecione um dia no calendário para ver os horários</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
    </div>
  );
};

export default ProfessionalCalendar;