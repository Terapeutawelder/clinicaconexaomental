
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Share2, UserPlus } from "lucide-react";
import { useNavigate } from "react-router-dom";

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

interface AgendaSummaryProps {
  appointments: Appointment[];
  todayAppointments: Appointment[];
  upcomingAppointments: Appointment[];
}

const AgendaSummary = ({ appointments, todayAppointments, upcomingAppointments }: AgendaSummaryProps) => {
  const navigate = useNavigate();

  return (
    <Card className="mb-8">
      <CardHeader>
        <CardTitle>Resumo da Agenda</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid md:grid-cols-4 gap-4 mb-6">
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">{todayAppointments.length}</div>
            <div className="text-sm text-muted-foreground">Hoje</div>
          </div>
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <div className="text-2xl font-bold text-green-600">{upcomingAppointments.length}</div>
            <div className="text-sm text-muted-foreground">Próximos</div>
          </div>
          <div className="text-center p-4 bg-yellow-50 rounded-lg">
            <div className="text-2xl font-bold text-yellow-600">
              {appointments.filter(apt => apt.status === "agendado").length}
            </div>
            <div className="text-sm text-muted-foreground">Agendados</div>
          </div>
          <div className="text-center p-4 bg-purple-50 rounded-lg">
            <div className="text-2xl font-bold text-purple-600">{appointments.length}</div>
            <div className="text-sm text-muted-foreground">Total</div>
          </div>
        </div>
        
        {/* Links de Ação */}
        <div className="border-t pt-4">
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <div className="text-center">
              <p className="text-muted-foreground mb-2">
                Convide outros profissionais para nossa plataforma!
              </p>
              <Button onClick={() => navigate('/afiliados')} className="mr-2">
                <Share2 className="mr-2 h-4 w-4" />
                Indicar Profissional
              </Button>
            </div>
            <div className="text-center sm:border-l sm:pl-4">
              <p className="text-muted-foreground mb-2">
                Ou cadastre um novo profissional
              </p>
              <Button variant="outline" onClick={() => navigate('/cadastro-profissional')}>
                <UserPlus className="mr-2 h-4 w-4" />
                Cadastrar Profissional
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default AgendaSummary;
