import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, ChevronLeft, ChevronRight, Check, CalendarDays, Package } from "lucide-react";
import { format, addDays, startOfWeek, isSameDay } from "date-fns";
import { ptBR } from "date-fns/locale";

const timeSlots = [
  { time: "08:00", available: true },
  { time: "09:00", available: false },
  { time: "10:00", available: true },
  { time: "11:00", available: true },
  { time: "14:00", available: false },
  { time: "15:00", available: true },
  { time: "16:00", available: true },
  { time: "17:00", available: false },
  { time: "18:00", available: true },
];

const plans = [
  {
    id: "30min-single",
    name: "Sessão individual",
    description: "1 sessão de 30 minutos",
    duration: "30 min",
    price: 37.90,
    sessions: 1,
    isPackage: false,
  },
  {
    id: "30min-package",
    name: "Pacote econômico",
    description: "4 sessões de 30 minutos",
    duration: "30 min",
    price: 137.90,
    sessions: 4,
    isPackage: true,
  },
  {
    id: "45min-single",
    name: "Sessão individual",
    description: "1 sessão de 45 minutos",
    duration: "45 min",
    price: 57.90,
    sessions: 1,
    isPackage: false,
  },
  {
    id: "45min-package",
    name: "Pacote econômico",
    description: "4 sessões de 45 minutos",
    duration: "45 min",
    price: 198.90,
    sessions: 4,
    isPackage: true,
  },
];

const Schedule = () => {
  const [currentWeekStart, setCurrentWeekStart] = useState(startOfWeek(new Date(), { weekStartsOn: 1 }));
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);

  const weekDays = Array.from({ length: 5 }, (_, i) => addDays(currentWeekStart, i));

  const goToPreviousWeek = () => {
    setCurrentWeekStart(addDays(currentWeekStart, -7));
    setSelectedDate(null);
    setSelectedTime(null);
  };

  const goToNextWeek = () => {
    setCurrentWeekStart(addDays(currentWeekStart, 7));
    setSelectedDate(null);
    setSelectedTime(null);
  };

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
    setSelectedTime(null);
  };

  const handleTimeSelect = (time: string) => {
    setSelectedTime(time);
  };

  const handlePlanSelect = (planId: string) => {
    setSelectedPlan(planId);
  };

  const selectedPlanData = plans.find(p => p.id === selectedPlan);

  return (
    <section id="agenda" className="py-16 bg-gradient-to-b from-teal-dark via-teal to-teal-dark relative overflow-hidden">
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-10 left-10 w-40 h-40 border border-white/20 rounded-full" />
        <div className="absolute bottom-20 right-20 w-60 h-60 border border-white/20 rounded-full" />
        <div className="absolute top-1/2 left-1/4 w-20 h-20 border border-white/20 rounded-full" />
      </div>
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <Badge className="bg-white/20 backdrop-blur-sm border border-white/30 text-white hover:bg-white/30 mb-4 px-4 py-2">
            <CalendarDays className="w-4 h-4 mr-2" />
            <span className="font-semibold">Agenda Online</span>
          </Badge>
          <h2 className="font-serif text-3xl md:text-4xl lg:text-5xl mb-4 text-white">
            Agende Sua Consulta
          </h2>
          <p className="text-white/90 text-lg font-medium">
            Escolha seu plano, dia e horário para iniciar sua jornada de autoconhecimento
          </p>
        </div>

        <div className="max-w-5xl mx-auto">
          <Card className="border-none shadow-2xl opacity-0 animate-scale-in bg-white" style={{ animationDelay: "0.2s" }}>
            {/* Accent bar */}
            <div className="h-2 bg-gradient-to-r from-teal via-teal-dark to-teal rounded-t-lg" />
            
            <CardHeader className="pb-4 pt-6">
              <CardTitle className="font-serif text-2xl text-charcoal flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-gold to-gold/80 flex items-center justify-center">
                  <Package className="w-5 h-5 text-white" />
                </div>
                1. Escolha o Plano
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6 pb-6">
              {/* Plans selector */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {plans.map((plan) => (
                  <button
                    key={plan.id}
                    onClick={() => handlePlanSelect(plan.id)}
                    className={`p-3 rounded-xl text-left transition-all duration-300 border-2 ${
                      selectedPlan === plan.id
                        ? "bg-gradient-to-br from-teal to-teal-dark text-white shadow-lg shadow-teal/30 border-transparent"
                        : "bg-teal-light/30 border-teal/20 hover:bg-teal-light hover:border-teal/40 text-charcoal hover:shadow-md"
                    }`}
                  >
                    <div className="flex justify-between items-start mb-1">
                      <span className={`text-[10px] uppercase tracking-wider font-bold ${selectedPlan === plan.id ? 'text-white/80' : 'text-teal'}`}>
                        {plan.duration} • {plan.isPackage ? `${plan.sessions}x` : '1x'}
                      </span>
                      {plan.isPackage && (
                        <Badge className={`text-[9px] px-1.5 py-0 ${selectedPlan === plan.id ? 'bg-white/20 text-white' : 'bg-gold/20 text-gold'}`}>
                          Economia
                        </Badge>
                      )}
                    </div>
                    <h3 className="text-sm font-bold leading-tight">{plan.name}</h3>
                    <p className={`text-[10px] mt-0.5 ${selectedPlan === plan.id ? 'text-white/80' : 'text-slate'}`}>
                      {plan.description}
                    </p>
                    <div className="flex items-baseline gap-1 mt-1">
                      <span className="text-lg font-bold">R$ {plan.price.toFixed(2).replace('.', ',')}</span>
                    </div>
                  </button>
                ))}
              </div>

              {/* Date selector - only show if plan is selected */}
              {selectedPlan && (
                <div className="pt-6 border-t border-teal/10 animate-fade-in">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-serif text-xl text-charcoal flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal to-teal-dark flex items-center justify-center">
                        <Calendar className="w-5 h-5 text-white" />
                      </div>
                      2. Selecione a Data
                    </h3>
                    <div className="flex items-center gap-2">
                      <Button 
                        variant="outline" 
                        size="icon"
                        onClick={goToPreviousWeek}
                        className="h-9 w-9 rounded-xl border-2 border-teal/30 hover:bg-teal hover:text-white hover:border-teal"
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </Button>
                      <span className="text-sm font-bold text-charcoal min-w-[130px] text-center capitalize px-3 py-1.5 bg-teal-light rounded-xl">
                        {format(currentWeekStart, "MMMM yyyy", { locale: ptBR })}
                      </span>
                      <Button 
                        variant="outline" 
                        size="icon"
                        onClick={goToNextWeek}
                        className="h-9 w-9 rounded-xl border-2 border-teal/30 hover:bg-teal hover:text-white hover:border-teal"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-5 gap-2">
                    {weekDays.map((day) => (
                      <button
                        key={day.toISOString()}
                        onClick={() => handleDateSelect(day)}
                        className={`p-3 md:p-4 rounded-xl text-center transition-all duration-500 border-2 ${
                          selectedDate && isSameDay(selectedDate, day)
                            ? "bg-gradient-to-br from-teal to-teal-dark text-white shadow-xl shadow-teal/40 scale-105 border-transparent"
                            : "bg-teal-light/50 border-teal/20 hover:bg-teal-light hover:border-teal/40 text-charcoal hover:shadow-lg"
                        }`}
                      >
                        <div className="text-xs uppercase tracking-wider font-bold opacity-80">
                          {format(day, "EEE", { locale: ptBR })}
                        </div>
                        <div className="text-xl md:text-2xl font-serif mt-1">
                          {format(day, "dd")}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Time slots */}
              {selectedPlan && selectedDate && (
                <div className="space-y-4 animate-fade-in pt-4">
                  <div className="flex items-center gap-2 text-charcoal font-semibold">
                    <Clock className="w-5 h-5 text-teal" />
                    <span>3. Horários disponíveis para {format(selectedDate, "dd 'de' MMMM", { locale: ptBR })}</span>
                  </div>
                  <div className="grid grid-cols-3 md:grid-cols-5 gap-2">
                    {timeSlots.map((slot) => (
                      <button
                        key={slot.time}
                        onClick={() => slot.available && handleTimeSelect(slot.time)}
                        disabled={!slot.available}
                        className={`p-3 rounded-xl text-center transition-all duration-300 font-bold text-base ${
                          !slot.available
                            ? "bg-muted text-muted-foreground/40 cursor-not-allowed line-through"
                            : selectedTime === slot.time
                            ? "bg-gradient-to-r from-gold to-gold/90 text-white shadow-lg shadow-gold/40"
                            : "bg-card border-2 border-teal/20 hover:border-teal hover:bg-teal-light text-charcoal"
                        }`}
                      >
                        {slot.time}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Confirmation */}
              {selectedPlan && selectedDate && selectedTime && (
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-5 bg-gradient-to-r from-teal-light via-gold-light/50 to-teal-light rounded-2xl animate-fade-in border-2 border-teal/20">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-teal to-teal-dark flex items-center justify-center shadow-lg">
                      <Check className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <p className="font-bold text-charcoal text-base">Consulta selecionada</p>
                      <p className="text-sm text-slate font-medium">
                        {selectedPlanData?.name} • {format(selectedDate, "EEEE, dd 'de' MMMM", { locale: ptBR })} às {selectedTime}
                      </p>
                      <p className="text-teal font-bold text-lg mt-1">
                        R$ {selectedPlanData?.price.toFixed(2).replace('.', ',')}
                      </p>
                    </div>
                  </div>
                  <Button className="bg-gradient-to-r from-teal to-teal-dark hover:from-teal-dark hover:to-teal text-white px-6 py-5 text-base shadow-xl hover:shadow-2xl hover:shadow-teal/25 transition-all duration-300 hover:-translate-y-1 font-bold">
                    Confirmar Agendamento
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
};

export default Schedule;
