import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Star, Clock } from "lucide-react";

const AgendarConsulta = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [selectedTime, setSelectedTime] = useState<string>("");
  
  const professionalId = searchParams.get('professional') || '1';
  
  // Dados do profissional (normalmente viriam de uma API)
  const professional = {
    id: professionalId,
    name: "Dra. Ana Paula Silva",
    specialty: "Psicóloga Cognitivo-Comportamental",
    rating: 4.8,
    image: "/images/professional1.jpg",
    initials: "DAPS"
  };

  const handleVoltar = () => {
    navigate('/');
  };

  const handleConfirmarAgendamento = () => {
    if (selectedDate && selectedTime) {
      const dateStr = selectedDate.toLocaleDateString('pt-BR');
      navigate(`/finalizar-agendamento?professional=${professionalId}&date=${dateStr}&time=${selectedTime}`);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-white">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center gap-4 mb-8">
          <Button 
            variant="ghost" 
            onClick={handleVoltar}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-800"
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar
          </Button>
          <h1 className="text-2xl font-bold text-gray-900">Agendar Consulta</h1>
        </div>

        <div className="flex justify-center mb-8">
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
                1
              </div>
              <span className="font-medium text-purple-600">Data e Horário</span>
            </div>
            <div className="w-16 h-px bg-gray-300"></div>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center text-gray-600 font-semibold">
                2
              </div>
              <span className="text-gray-500">Dados e Pagamento</span>
            </div>
          </div>
        </div>

        <div className="max-w-6xl mx-auto">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-4">
                <Avatar className="w-16 h-16">
                  <AvatarImage src={professional.image} alt={professional.name} />
                  <AvatarFallback className="text-lg bg-purple-600 text-white">
                    {professional.initials}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">{professional.name}</h3>
                  <p className="text-purple-600 font-medium">{professional.specialty}</p>
                  <div className="flex items-center gap-1 mt-1">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    <span className="font-medium text-sm">{professional.rating}</span>
                  </div>
                </div>
                <div className="ml-auto">
                  <div className="bg-green-50 p-4 rounded-lg">
                    <div className="text-center">
                      <p className="text-green-800 font-semibold text-lg">Valor da Consulta</p>
                      <div className="text-green-600 font-bold text-2xl">R$ 37,90</div>
                    </div>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div>
                  <h3 className="font-semibold mb-4">Selecione a Data</h3>
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={setSelectedDate}
                    disabled={(date) => date < new Date()}
                    className="rounded-md border"
                  />
                </div>
                
                <div>
                  <h3 className="font-semibold mb-4">Horários Disponíveis</h3>
                   <div className="grid grid-cols-3 gap-2">
                    {["08:00", "08:30", "09:00", "09:30", "10:00", "10:30", "14:00", "14:30", "15:00", "15:30", "16:00", "16:30"].map((time) => (
                      <Button
                        key={time}
                        variant={selectedTime === time ? "default" : "outline"}
                        className="text-sm h-10"
                        onClick={() => setSelectedTime(time)}
                      >
                        {time}
                      </Button>
                    ))}
                  </div>
                  
                   <Button 
                    onClick={handleConfirmarAgendamento}
                    className="w-full mt-6 bg-purple-600 hover:bg-purple-700 text-white"
                    disabled={!selectedDate || !selectedTime}
                  >
                    Confirmar Agendamento
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AgendarConsulta;