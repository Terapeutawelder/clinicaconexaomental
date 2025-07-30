
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Calendar } from "@/components/ui/calendar";
import { ArrowLeft, Calendar as CalendarIcon, Clock, User, CheckCircle, CreditCard, MessageCircle, Star } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useToast } from "@/hooks/use-toast";

interface Professional {
  id: string;
  name: string;
  specialty: string;
  experience: string;
  rating: number;
  price?: string;
  image: string;
  available: boolean;
  description: string;
}

interface BookingFlowProps {
  professional: Professional;
  onBack: () => void;
}

const BookingFlow = ({ professional, onBack }: BookingFlowProps) => {
  const [step, setStep] = useState(1);
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [selectedTime, setSelectedTime] = useState("");
  const [patientData, setPatientData] = useState({
    name: "",
    email: "",
    phone: "",
    notes: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [availableTimeSlots, setAvailableTimeSlots] = useState<string[]>([]);
  const { toast } = useToast();

  // Buscar horários disponíveis do profissional selecionado
  const { data: professionalAvailability } = useQuery({
    queryKey: [`/api/professionals/${professional.id}/availability`],
    enabled: !!professional.id,
    staleTime: 300000, // 5 minutos
    retry: false
  });

  // Atualizar horários disponíveis quando a data for selecionada
  useEffect(() => {
    if (selectedDate && professionalAvailability) {
      const dateKey = selectedDate.toISOString().split('T')[0];
      const dayOfWeek = selectedDate.toLocaleDateString('pt-BR', { weekday: 'long' });
      
      // Buscar horários customizados para a data específica
      const customSlots = professionalAvailability.customTimeSlots?.[dateKey] || [];
      
      // Se não há horários customizados, usar horários padrão do dia da semana
      if (customSlots.length === 0) {
        const daySettings = professionalAvailability[dayOfWeek.toLowerCase()];
        if (daySettings?.available) {
          const defaultSlots = generateTimeSlotsForDay(daySettings.startTime, daySettings.endTime);
          setAvailableTimeSlots(defaultSlots);
        } else {
          setAvailableTimeSlots([]);
        }
      } else {
        setAvailableTimeSlots(customSlots);
      }
    } else {
      // Horários padrão como fallback
      setAvailableTimeSlots(["09:00", "10:00", "11:00", "14:00", "15:00", "16:00", "17:00"]);
    }
  }, [selectedDate, professionalAvailability]);

  const generateTimeSlotsForDay = (startTime: string, endTime: string) => {
    const slots = [];
    const start = parseInt(startTime.split(':')[0]);
    const end = parseInt(endTime.split(':')[0]);
    
    for (let hour = start; hour < end; hour++) {
      slots.push(`${hour.toString().padStart(2, '0')}:00`);
      if (hour < end - 1) {
        slots.push(`${hour.toString().padStart(2, '0')}:30`);
      }
    }
    
    return slots;
  };

  const handlePatientDataChange = (field: string, value: string) => {
    setPatientData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    
    // Simulate API call
    setTimeout(() => {
      setStep(3);
      setIsSubmitting(false);
      toast({
        title: "Consulta agendada com sucesso!",
        description: "Você receberá um e-mail de confirmação em breve.",
      });
    }, 1500);
  };

  const renderStepContent = () => {
    switch (step) {
      case 1:
        return (
          <div className="max-w-6xl mx-auto">
            <div className="grid lg:grid-cols-3 gap-8">
              {/* Professional Card */}
              <div className="lg:col-span-1">
                <Card className="sticky top-4">
                  <CardHeader>
                    <div className="flex items-center gap-4">
                      <Avatar className="w-16 h-16">
                        <AvatarImage src={professional.image} alt={professional.name} />
                        <AvatarFallback className="gradient-bg text-white">
                          {professional.name.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="font-bold text-lg">{professional.name}</h3>
                        <p className="text-purple-600 text-sm">{professional.specialty}</p>
                        <div className="flex items-center gap-1 mt-1">
                          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                          <span className="text-sm font-medium">{professional.rating}</span>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                        <div className="flex items-center justify-between">
                          <span className="text-green-700 font-medium">Valor da Consulta</span>
                          <span className="text-2xl font-bold text-green-600">R$ 37,90</span>
                        </div>
                        <p className="text-sm text-green-600 mt-1">Pagamento facilitado</p>
                      </div>
                      
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Booking Form */}
              <div className="lg:col-span-2">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <CalendarIcon className="h-5 w-5" />
                      Agendar Consulta
                    </CardTitle>
                    <CardDescription>
                      Escolha a data e horário ideal para sua consulta
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Date Selection */}
                    <div>
                      <Label className="text-base font-semibold mb-3 block">Selecione a Data</Label>
                      <div className="flex justify-center lg:justify-start">
                        <Calendar
                          mode="single"
                          selected={selectedDate}
                          onSelect={setSelectedDate}
                          disabled={(date) => date < new Date() || date.getDay() === 0}
                          className="rounded-md border pointer-events-auto"
                          locale={ptBR}
                        />
                      </div>
                    </div>

                    {/* Time Selection */}
                    {selectedDate && (
                      <div>
                        <Label className="text-base font-semibold mb-3 block">
                          Horários disponíveis para {format(selectedDate, "dd/MM/yyyy", { locale: ptBR })}
                        </Label>
                        <div className="grid grid-cols-3 md:grid-cols-4 gap-3">
                          {availableTimeSlots.map((time) => (
                            <Button
                              key={time}
                              variant={selectedTime === time ? "default" : "outline"}
                              onClick={() => setSelectedTime(time)}
                              className="h-12 bg-white border-purple-200 hover:bg-purple-50 data-[state=on]:bg-purple-600"
                            >
                              {time}
                            </Button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Continue Button */}
                    {selectedDate && selectedTime && (
                      <div className="pt-4 border-t">
                        <Button 
                          onClick={() => setStep(2)} 
                          className="w-full lg:w-auto bg-purple-600 hover:bg-purple-700"
                          size="lg"
                        >
                          Continuar
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="max-w-4xl mx-auto">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Finalize seu Agendamento
                </CardTitle>
                <CardDescription>
                  Confirme os dados e finalize sua consulta
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Booking Summary */}
                <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                  <h3 className="font-semibold mb-2">Resumo da Consulta</h3>
                  <div className="space-y-2 text-sm">
                    <p><strong>Profissional:</strong> {professional.name}</p>
                    <p><strong>Data:</strong> {selectedDate && format(selectedDate, "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}</p>
                    <p><strong>Horário:</strong> {selectedTime}</p>
                    <p><strong>Valor:</strong> <span className="text-green-600 font-semibold">R$ 37,90</span></p>
                  </div>
                </div>
                
                {/* Patient Data Form */}
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Nome Completo *</Label>
                    <Input
                      id="name"
                      value={patientData.name}
                      onChange={(e) => handlePatientDataChange("name", e.target.value)}
                      placeholder="Digite seu nome completo"
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="phone">WhatsApp *</Label>
                    <Input
                      id="phone"
                      value={patientData.phone}
                      onChange={(e) => handlePatientDataChange("phone", e.target.value)}
                      placeholder="(11) 99999-9999"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">E-mail *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={patientData.email}
                    onChange={(e) => handlePatientDataChange("email", e.target.value)}
                    placeholder="Digite seu e-mail"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="notes">Como podemos te ajudar? (opcional)</Label>
                  <Textarea
                    id="notes"
                    value={patientData.notes}
                    onChange={(e) => handlePatientDataChange("notes", e.target.value)}
                    placeholder="Conte um pouco sobre o que você gostaria de trabalhar na terapia..."
                    rows={3}
                  />
                </div>
                
                <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t">
                  <Button 
                    variant="outline" 
                    onClick={() => setStep(1)}
                    className="sm:w-auto"
                  >
                    Voltar
                  </Button>
                  <Button 
                    onClick={handleSubmit}
                    disabled={!patientData.name || !patientData.email || !patientData.phone || isSubmitting}
                    className="flex-1 sm:flex-none bg-purple-600 hover:bg-purple-700"
                    size="lg"
                  >
                    {isSubmitting ? "Finalizando..." : "Confirmar e Pagar"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        );

      case 3:
        return (
          <div className="max-w-2xl mx-auto text-center">
            <Card>
              <CardHeader>
                <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                  <CheckCircle className="h-8 w-8 text-green-600" />
                </div>
                <CardTitle className="text-2xl text-green-600">
                  Consulta Agendada!
                </CardTitle>
                <CardDescription className="text-lg">
                  Sua consulta foi confirmada com sucesso
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="bg-muted p-4 rounded-lg space-y-2">
                  <h3 className="font-semibold">Detalhes do Agendamento:</h3>
                  <p><strong>Profissional:</strong> {professional.name}</p>
                  <p><strong>Data:</strong> {selectedDate && format(selectedDate, "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}</p>
                  <p><strong>Horário:</strong> {selectedTime}</p>
                  <p><strong>Paciente:</strong> {patientData.name}</p>
                  <p className="text-lg font-semibold text-green-600"><strong>Valor pago:</strong> R$ 37,90</p>
                </div>
                
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                  <h4 className="font-semibold mb-2">Próximos Passos:</h4>
                  <ul className="text-sm text-left list-disc list-inside space-y-1">
                    <li>Você receberá um e-mail de confirmação</li>
                    <li>Link da videochamada será enviado 30 min antes</li>
                    <li>Você pode entrar em contato via chat a qualquer momento</li>
                  </ul>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <Button variant="outline" onClick={onBack}>
                    Voltar ao Início
                  </Button>
                  <Button className="bg-purple-600 hover:bg-purple-700">
                    <MessageCircle className="mr-2 h-4 w-4" />
                    Conversar com o Profissional
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-white py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button variant="ghost" size="sm" onClick={onBack}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
          
          <div className="flex items-center gap-4 flex-1">
            <h1 className="text-2xl font-bold">Agendar Consulta</h1>
          </div>
        </div>

        {/* Progress Steps */}
        {step < 3 && (
          <div className="flex justify-center mb-8">
            <div className="flex items-center space-x-4">
              {[1, 2].map((stepNumber) => (
                <div key={stepNumber} className="flex items-center">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium ${
                    stepNumber <= step 
                      ? 'bg-purple-600 text-white' 
                      : 'bg-gray-200 text-gray-600'
                  }`}>
                    {stepNumber}
                  </div>
                  <div className="ml-2 text-sm font-medium">
                    {stepNumber === 1 ? 'Data e Horário' : 'Dados e Pagamento'}
                  </div>
                  {stepNumber < 2 && (
                    <div className={`w-12 h-px mx-4 ${
                      stepNumber < step ? 'bg-purple-600' : 'bg-gray-300'
                    }`} />
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Step Content */}
        {renderStepContent()}
      </div>
    </div>
  );
};

export default BookingFlow;

