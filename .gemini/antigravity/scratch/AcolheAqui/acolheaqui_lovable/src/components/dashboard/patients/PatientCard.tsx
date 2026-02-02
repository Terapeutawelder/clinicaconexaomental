import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Calendar, Phone, Mail, TrendingUp } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface PatientCardProps {
  patient: {
    name: string;
    email: string | null;
    phone: string | null;
    totalAppointments: number;
    completedAppointments: number;
    totalSpent: number;
    lastAppointment: string | null;
    status: "active" | "inactive" | "new";
  };
  onClick: () => void;
}

const PatientCard = ({ patient, onClick }: PatientCardProps) => {
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-500/10 text-green-500 border-green-500/20";
      case "inactive":
        return "bg-yellow-500/10 text-yellow-500 border-yellow-500/20";
      case "new":
        return "bg-blue-500/10 text-blue-500 border-blue-500/20";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "active":
        return "Ativo";
      case "inactive":
        return "Inativo";
      case "new":
        return "Novo";
      default:
        return status;
    }
  };

  const formatCurrency = (cents: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(cents / 100);
  };

  return (
    <Card
      className="cursor-pointer hover:shadow-md hover:border-primary/30 transition-all duration-200"
      onClick={onClick}
    >
      <CardContent className="p-4">
        <div className="flex items-start gap-4">
          <Avatar className="h-12 w-12 border-2 border-primary/20">
            <AvatarFallback className="bg-primary/10 text-primary font-semibold">
              {getInitials(patient.name)}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-semibold text-foreground truncate">
                {patient.name}
              </h3>
              <Badge variant="outline" className={getStatusColor(patient.status)}>
                {getStatusLabel(patient.status)}
              </Badge>
            </div>

            <div className="flex flex-col gap-1 text-sm text-muted-foreground">
              {patient.email && (
                <div className="flex items-center gap-1.5">
                  <Mail className="h-3.5 w-3.5" />
                  <span className="truncate">{patient.email}</span>
                </div>
              )}
              {patient.phone && (
                <div className="flex items-center gap-1.5">
                  <Phone className="h-3.5 w-3.5" />
                  <span>{patient.phone}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3 mt-4 pt-4 border-t border-border/50">
          <div className="text-center">
            <div className="text-lg font-bold text-foreground">
              {patient.completedAppointments}
            </div>
            <div className="text-xs text-muted-foreground">Sessões</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-green-500">
              {formatCurrency(patient.totalSpent)}
            </div>
            <div className="text-xs text-muted-foreground">Total</div>
          </div>
          <div className="text-center">
            <div className="text-sm font-medium text-foreground">
              {patient.lastAppointment
                ? format(new Date(patient.lastAppointment), "dd/MM", {
                    locale: ptBR,
                  })
                : "-"}
            </div>
            <div className="text-xs text-muted-foreground">Última</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PatientCard;
