
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, User, Phone, Mail } from "lucide-react";

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

interface AppointmentCardProps {
  appointment: Appointment;
  showDate?: boolean;
}

const AppointmentCard = ({ appointment, showDate = false }: AppointmentCardProps) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "agendado":
        return "bg-yellow-100 text-yellow-800";
      case "confirmado":
        return "bg-green-100 text-green-800";
      case "realizado":
        return "bg-blue-100 text-blue-800";
      case "cancelado":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="border rounded-lg p-4 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {showDate ? (
            <Calendar className="h-4 w-4 text-muted-foreground" />
          ) : (
            <Clock className="h-4 w-4 text-muted-foreground" />
          )}
          <span className="font-medium">
            {showDate 
              ? `${new Date(appointment.date).toLocaleDateString('pt-BR')} - ${appointment.time}`
              : appointment.time
            }
          </span>
        </div>
        <Badge className={getStatusColor(appointment.status)}>
          {appointment.status}
        </Badge>
      </div>
      
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <User className="h-4 w-4 text-muted-foreground" />
          <span className="font-medium">{appointment.patientName}</span>
          <Badge variant="outline" className="text-xs">
            {appointment.type}
          </Badge>
        </div>
        
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Phone className="h-3 w-3" />
          <span>{appointment.patientPhone}</span>
        </div>
        
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Mail className="h-3 w-3" />
          <span>{appointment.patientEmail}</span>
        </div>
      </div>
    </div>
  );
};

export default AppointmentCard;
