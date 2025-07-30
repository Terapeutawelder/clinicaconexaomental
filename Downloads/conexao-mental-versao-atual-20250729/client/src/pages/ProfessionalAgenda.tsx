
import { useState, useEffect } from "react";
const logo = "/lovable-uploads/1c4653a3-9aa5-49a8-8b1a-7e182d51255e.png";
import { Button } from "@/components/ui/button";
import { Share2, LogOut, User } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";

import AgendaSummary from "@/components/AgendaSummary";
import AppointmentsSection from "@/components/AppointmentsSection";
import ProfessionalCalendar from "@/components/ProfessionalCalendar";
import ProfessionalProfile from "@/components/ProfessionalProfile";
import { getAppointmentsByProfessional } from "@/utils/appointmentStorage";

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

const ProfessionalAgenda = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { signOut } = useAuth();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [viewMode, setViewMode] = useState<'summary' | 'calendar' | 'list'>('summary');
  
  // Carregar agendamentos do localStorage
  useEffect(() => {
    const professionalId = "1"; // ID do profissional logado
    const storedAppointments = getAppointmentsByProfessional(professionalId);
    
    // Converter para o formato esperado pelo componente
    const formattedAppointments = storedAppointments.map((apt, index) => ({
      id: parseInt(apt.id) || index + 1,
      patientName: apt.patientName,
      patientPhone: apt.patientPhone,
      patientEmail: apt.patientEmail,
      date: apt.date,
      time: apt.time,
      status: apt.status,
      type: apt.type
    }));

    // Adicionar alguns agendamentos de exemplo se não houver nenhum
    if (formattedAppointments.length === 0) {
      const today = new Date();
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      const nextWeek = new Date(today);
      nextWeek.setDate(nextWeek.getDate() + 7);
      
      const exampleAppointments = [
        {
          id: 1,
          patientName: "Maria Silva",
          patientPhone: "(11) 99999-1234",
          patientEmail: "maria.silva@email.com",
          date: today.toLocaleDateString('pt-BR'),
          time: "09:00",
          status: "confirmado" as const,
          type: "consulta" as const
        },
        {
          id: 2,
          patientName: "João Santos",
          patientPhone: "(11) 99999-5678",
          patientEmail: "joao.santos@email.com",
          date: today.toLocaleDateString('pt-BR'),
          time: "14:00",
          status: "agendado" as const,
          type: "retorno" as const
        },
        {
          id: 3,
          patientName: "Ana Costa",
          patientPhone: "(11) 99999-9012",
          patientEmail: "ana.costa@email.com",
          date: tomorrow.toLocaleDateString('pt-BR'),
          time: "10:00",
          status: "confirmado" as const,
          type: "consulta" as const
        },
        {
          id: 4,
          patientName: "Pedro Oliveira",
          patientPhone: "(11) 99999-3456",
          patientEmail: "pedro.oliveira@email.com",
          date: nextWeek.toLocaleDateString('pt-BR'),
          time: "15:00",
          status: "realizado" as const,
          type: "consulta" as const
        }
      ];
      
      setAppointments(exampleAppointments);
    } else {
      setAppointments(formattedAppointments);
    }
  }, []);

  const handleLogout = async () => {
    await signOut();
    navigate("/");
  };

  const handleAppointmentClick = (appointment: Appointment) => {
    toast({
      title: "Agendamento selecionado",
      description: `Paciente: ${appointment.patientName} - ${appointment.date} às ${appointment.time}`,
    });
  };

  const today = new Date().toLocaleDateString('pt-BR');
  const todayAppointments = appointments.filter(apt => apt.date === today);
  const upcomingAppointments = appointments.filter(apt => new Date(apt.date.split('/').reverse().join('-')) > new Date());

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <img src={logo} alt="Clínica Conexão Mental" className="w-12 h-12 mr-1" />
              <span className="font-bold text-xl gradient-text">Clínica Conexão Mental</span>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="ghost" onClick={() => navigate('/afiliados')}>
                <Share2 className="mr-2 h-4 w-4" />
                Programa de Afiliados
              </Button>
              <ProfessionalProfile>
                <Button variant="ghost">
                  <User className="mr-2 h-4 w-4" />
                  Perfil
                </Button>
              </ProfessionalProfile>
              <Button variant="ghost" onClick={handleLogout}>
                <LogOut className="mr-2 h-4 w-4" />
                Sair
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h1 className="text-3xl font-bold gradient-text mb-2">Minha Agenda</h1>
              <p className="text-muted-foreground">Gerencie seus agendamentos e consultas</p>
            </div>
            <div className="flex space-x-2">
              <Button 
                variant={viewMode === 'calendar' ? 'default' : 'outline'}
                onClick={() => setViewMode('calendar')}
              >
                Calendário
              </Button>
              <Button 
                variant={viewMode === 'summary' ? 'default' : 'outline'}
                onClick={() => setViewMode('summary')}
              >
                Resumo
              </Button>
              <Button 
                variant={viewMode === 'list' ? 'default' : 'outline'}
                onClick={() => setViewMode('list')}
              >
                Lista
              </Button>
            </div>
          </div>
        </div>

        {viewMode === 'calendar' ? (
          <ProfessionalCalendar 
            appointments={appointments}
            onAppointmentClick={handleAppointmentClick}
          />
        ) : viewMode === 'list' ? (
          <AppointmentsSection 
            todayAppointments={todayAppointments}
            upcomingAppointments={upcomingAppointments}
          />
        ) : (
          <>
            {/* Resumo da Agenda */}
            <AgendaSummary 
              appointments={appointments}
              todayAppointments={todayAppointments}
              upcomingAppointments={upcomingAppointments}
            />

            {/* Seções de Agendamentos */}
            <AppointmentsSection 
              todayAppointments={todayAppointments}
              upcomingAppointments={upcomingAppointments}
            />
          </>
        )}
      </div>
    </div>
  );
};

export default ProfessionalAgenda;
