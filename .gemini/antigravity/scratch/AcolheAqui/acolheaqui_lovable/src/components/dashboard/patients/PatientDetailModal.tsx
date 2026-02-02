import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Calendar,
  Phone,
  Mail,
  Clock,
  DollarSign,
  FileText,
  TrendingUp,
  Plus,
  Save,
  User,
  Activity,
  ClipboardList,
} from "lucide-react";
import { format, differenceInDays } from "date-fns";
import { ptBR } from "date-fns/locale";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import PatientRecordTab from "./PatientRecordTab";

interface Appointment {
  id: string;
  appointment_date: string;
  appointment_time: string;
  status: string;
  payment_status: string;
  amount_cents: number | null;
  session_type: string | null;
  notes: string | null;
  duration_minutes: number | null;
}

interface PatientDetailModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  patient: {
    name: string;
    email: string | null;
    phone: string | null;
    totalAppointments: number;
    completedAppointments: number;
    totalSpent: number;
    lastAppointment: string | null;
    status: "active" | "inactive" | "new";
  } | null;
  appointments: Appointment[];
  onUpdateNotes: (appointmentId: string, notes: string) => void;
  professionalId: string;
}

const PatientDetailModal = ({
  open,
  onOpenChange,
  patient,
  appointments,
  onUpdateNotes,
  professionalId,
}: PatientDetailModalProps) => {
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [noteText, setNoteText] = useState("");

  if (!patient) return null;

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const formatCurrency = (cents: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(cents / 100);
  };

  const getStatusBadge = (status: string) => {
    const colors: Record<string, string> = {
      confirmed: "bg-green-500/10 text-green-500",
      pending: "bg-yellow-500/10 text-yellow-500",
      cancelled: "bg-red-500/10 text-red-500",
      completed: "bg-blue-500/10 text-blue-500",
    };
    const labels: Record<string, string> = {
      confirmed: "Confirmado",
      pending: "Pendente",
      cancelled: "Cancelado",
      completed: "Realizado",
    };
    return (
      <Badge className={colors[status] || "bg-muted"}>
        {labels[status] || status}
      </Badge>
    );
  };

  const getPaymentBadge = (status: string) => {
    const colors: Record<string, string> = {
      approved: "bg-green-500/10 text-green-500",
      pending: "bg-yellow-500/10 text-yellow-500",
      rejected: "bg-red-500/10 text-red-500",
    };
    const labels: Record<string, string> = {
      approved: "Pago",
      pending: "Pendente",
      rejected: "Recusado",
    };
    return (
      <Badge variant="outline" className={colors[status] || "bg-muted"}>
        {labels[status] || status}
      </Badge>
    );
  };

  const handleSaveNote = async (appointmentId: string) => {
    onUpdateNotes(appointmentId, noteText);
    setEditingNoteId(null);
    setNoteText("");
  };

  const startEditingNote = (appointmentId: string, currentNote: string | null) => {
    setEditingNoteId(appointmentId);
    setNoteText(currentNote || "");
  };

  // Calculate metrics
  const avgSessionValue =
    patient.completedAppointments > 0
      ? patient.totalSpent / patient.completedAppointments
      : 0;

  const daysSinceLastAppointment = patient.lastAppointment
    ? differenceInDays(new Date(), new Date(patient.lastAppointment))
    : null;

  const attendanceRate =
    patient.totalAppointments > 0
      ? Math.round(
          (patient.completedAppointments / patient.totalAppointments) * 100
        )
      : 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] p-0 overflow-hidden">
        <DialogHeader className="p-6 pb-0">
          <div className="flex items-start gap-4">
            <Avatar className="h-16 w-16 border-2 border-primary/20">
              <AvatarFallback className="bg-primary/10 text-primary text-xl font-bold">
                {getInitials(patient.name)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <DialogTitle className="text-xl">{patient.name}</DialogTitle>
              <div className="flex flex-col gap-1 mt-2 text-sm text-muted-foreground">
                {patient.email && (
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    <span>{patient.email}</span>
                  </div>
                )}
                {patient.phone && (
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4" />
                    <span>{patient.phone}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </DialogHeader>

        <Tabs defaultValue="overview" className="flex-1">
          <TabsList className="mx-6 mt-4 grid grid-cols-4 w-auto">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <Activity className="h-4 w-4" />
              <span className="hidden sm:inline">Visão Geral</span>
              <span className="sm:hidden">Geral</span>
            </TabsTrigger>
            <TabsTrigger value="record" className="flex items-center gap-2">
              <ClipboardList className="h-4 w-4" />
              Prontuário
            </TabsTrigger>
            <TabsTrigger value="history" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Histórico
            </TabsTrigger>
            <TabsTrigger value="notes" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Notas
            </TabsTrigger>
          </TabsList>

          <ScrollArea className="h-[50vh] px-6 pb-6">
            <TabsContent value="overview" className="mt-4 space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card>
                  <CardContent className="p-4 text-center">
                    <div className="text-3xl font-bold text-primary">
                      {patient.completedAppointments}
                    </div>
                    <div className="text-sm text-muted-foreground mt-1">
                      Sessões Realizadas
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 text-center">
                    <div className="text-3xl font-bold text-green-500">
                      {formatCurrency(patient.totalSpent)}
                    </div>
                    <div className="text-sm text-muted-foreground mt-1">
                      Total Investido
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 text-center">
                    <div className="text-3xl font-bold text-blue-500">
                      {attendanceRate}%
                    </div>
                    <div className="text-sm text-muted-foreground mt-1">
                      Taxa de Presença
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 text-center">
                    <div className="text-3xl font-bold text-purple-500">
                      {formatCurrency(avgSessionValue)}
                    </div>
                    <div className="text-sm text-muted-foreground mt-1">
                      Ticket Médio
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <TrendingUp className="h-4 w-4" />
                    Resumo do Paciente
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between items-center py-2 border-b border-border/50">
                    <span className="text-muted-foreground">Total de agendamentos</span>
                    <span className="font-medium">{patient.totalAppointments}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-border/50">
                    <span className="text-muted-foreground">Sessões realizadas</span>
                    <span className="font-medium">{patient.completedAppointments}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-border/50">
                    <span className="text-muted-foreground">Última sessão</span>
                    <span className="font-medium">
                      {patient.lastAppointment
                        ? format(new Date(patient.lastAppointment), "dd/MM/yyyy", {
                            locale: ptBR,
                          })
                        : "-"}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-2">
                    <span className="text-muted-foreground">Dias desde última sessão</span>
                    <span className="font-medium">
                      {daysSinceLastAppointment !== null
                        ? `${daysSinceLastAppointment} dias`
                        : "-"}
                    </span>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="record" className="mt-4">
              <PatientRecordTab
                patientEmail={patient.email}
                patientName={patient.name}
                professionalId={professionalId}
              />
            </TabsContent>

            <TabsContent value="history" className="mt-4 space-y-3">
              {appointments.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  Nenhum agendamento encontrado
                </div>
              ) : (
                appointments.map((apt) => (
                  <Card key={apt.id}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                            <Calendar className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <div className="font-medium">
                              {format(new Date(apt.appointment_date), "dd/MM/yyyy", {
                                locale: ptBR,
                              })}
                            </div>
                            <div className="text-sm text-muted-foreground flex items-center gap-2">
                              <Clock className="h-3.5 w-3.5" />
                              {apt.appointment_time.slice(0, 5)}
                              {apt.duration_minutes && (
                                <span>• {apt.duration_minutes}min</span>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {getStatusBadge(apt.status || "pending")}
                          {getPaymentBadge(apt.payment_status || "pending")}
                          {apt.amount_cents && (
                            <span className="font-medium text-green-500">
                              {formatCurrency(apt.amount_cents)}
                            </span>
                          )}
                        </div>
                      </div>
                      {apt.session_type && (
                        <div className="mt-2 text-sm text-muted-foreground">
                          Tipo: {apt.session_type}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))
              )}
            </TabsContent>

            <TabsContent value="notes" className="mt-4 space-y-3">
              {appointments.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  Nenhum agendamento encontrado
                </div>
              ) : (
                appointments.map((apt) => (
                  <Card key={apt.id}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-primary" />
                          <span className="font-medium">
                            {format(new Date(apt.appointment_date), "dd/MM/yyyy", {
                              locale: ptBR,
                            })}
                          </span>
                          <span className="text-muted-foreground">
                            às {apt.appointment_time.slice(0, 5)}
                          </span>
                        </div>
                        {editingNoteId !== apt.id && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => startEditingNote(apt.id, apt.notes)}
                          >
                            <FileText className="h-4 w-4 mr-1" />
                            {apt.notes ? "Editar" : "Adicionar nota"}
                          </Button>
                        )}
                      </div>

                      {editingNoteId === apt.id ? (
                        <div className="space-y-2">
                          <Textarea
                            value={noteText}
                            onChange={(e) => setNoteText(e.target.value)}
                            placeholder="Escreva suas notas sobre esta sessão..."
                            rows={4}
                          />
                          <div className="flex gap-2 justify-end">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setEditingNoteId(null)}
                            >
                              Cancelar
                            </Button>
                            <Button
                              size="sm"
                              onClick={() => handleSaveNote(apt.id)}
                            >
                              <Save className="h-4 w-4 mr-1" />
                              Salvar
                            </Button>
                          </div>
                        </div>
                      ) : apt.notes ? (
                        <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                          {apt.notes}
                        </p>
                      ) : (
                        <p className="text-sm text-muted-foreground italic">
                          Nenhuma nota registrada
                        </p>
                      )}
                    </CardContent>
                  </Card>
                ))
              )}
            </TabsContent>
          </ScrollArea>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default PatientDetailModal;
