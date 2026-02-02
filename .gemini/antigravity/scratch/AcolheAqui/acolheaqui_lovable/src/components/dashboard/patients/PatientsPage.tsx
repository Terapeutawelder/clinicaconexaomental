import { useState, useEffect, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Search, Users, TrendingUp, DollarSign, Calendar, Download, FileSpreadsheet, FileText } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { differenceInDays } from "date-fns";
import PatientCard from "./PatientCard";
import PatientDetailModal from "./PatientDetailModal";
import { exportPatientsToCSV, exportPatientsToExcel } from "@/lib/exportPatients";

interface PatientsPageProps {
  profileId: string;
}

interface Appointment {
  id: string;
  client_name: string;
  client_email: string | null;
  client_phone: string | null;
  appointment_date: string;
  appointment_time: string;
  status: string;
  payment_status: string;
  amount_cents: number | null;
  session_type: string | null;
  notes: string | null;
  duration_minutes: number | null;
}

interface Patient {
  name: string;
  email: string | null;
  phone: string | null;
  totalAppointments: number;
  completedAppointments: number;
  totalSpent: number;
  lastAppointment: string | null;
  status: "active" | "inactive" | "new";
}

const PatientsPage = ({ profileId }: PatientsPageProps) => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [selectedPatientAppointments, setSelectedPatientAppointments] = useState<Appointment[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    fetchAppointments();
  }, [profileId]);

  const fetchAppointments = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("appointments")
        .select("*")
        .eq("professional_id", profileId)
        .order("appointment_date", { ascending: false });

      if (error) throw error;
      setAppointments(data || []);
    } catch (error) {
      console.error("Error fetching appointments:", error);
      toast.error("Erro ao carregar pacientes");
    } finally {
      setIsLoading(false);
    }
  };

  // Group appointments by patient
  const patients = useMemo(() => {
    const patientMap = new Map<string, Patient & { appointments: Appointment[] }>();

    appointments.forEach((apt) => {
      const key = apt.client_email || apt.client_name.toLowerCase();
      
      if (!patientMap.has(key)) {
        patientMap.set(key, {
          name: apt.client_name,
          email: apt.client_email,
          phone: apt.client_phone,
          totalAppointments: 0,
          completedAppointments: 0,
          totalSpent: 0,
          lastAppointment: null,
          status: "new",
          appointments: [],
        });
      }

      const patient = patientMap.get(key)!;
      patient.appointments.push(apt);
      patient.totalAppointments++;

      if (apt.status === "confirmed" || apt.status === "completed") {
        patient.completedAppointments++;
      }

      if (apt.payment_status === "approved" && apt.amount_cents) {
        patient.totalSpent += apt.amount_cents;
      }

      // Update last appointment date
      if (
        !patient.lastAppointment ||
        new Date(apt.appointment_date) > new Date(patient.lastAppointment)
      ) {
        patient.lastAppointment = apt.appointment_date;
      }

      // Update contact info if available
      if (apt.client_email && !patient.email) patient.email = apt.client_email;
      if (apt.client_phone && !patient.phone) patient.phone = apt.client_phone;
    });

    // Calculate status
    patientMap.forEach((patient) => {
      if (patient.completedAppointments === 0) {
        patient.status = "new";
      } else if (patient.lastAppointment) {
        const daysSinceLast = differenceInDays(
          new Date(),
          new Date(patient.lastAppointment)
        );
        patient.status = daysSinceLast > 60 ? "inactive" : "active";
      }
    });

    return Array.from(patientMap.values());
  }, [appointments]);

  // Filter patients
  const filteredPatients = useMemo(() => {
    return patients.filter((patient) => {
      const matchesSearch =
        patient.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        patient.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        patient.phone?.includes(searchQuery);

      const matchesStatus =
        statusFilter === "all" || patient.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [patients, searchQuery, statusFilter]);

  // Calculate metrics
  const metrics = useMemo(() => {
    const totalPatients = patients.length;
    const activePatients = patients.filter((p) => p.status === "active").length;
    const totalRevenue = patients.reduce((sum, p) => sum + p.totalSpent, 0);
    const avgTicket =
      patients.length > 0
        ? patients.reduce((sum, p) => sum + p.totalSpent, 0) /
          patients.filter((p) => p.completedAppointments > 0).length || 0
        : 0;

    return { totalPatients, activePatients, totalRevenue, avgTicket };
  }, [patients]);

  const formatCurrency = (cents: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(cents / 100);
  };

  const handlePatientClick = (patient: Patient & { appointments?: Appointment[] }) => {
    setSelectedPatient(patient);
    setSelectedPatientAppointments(
      appointments.filter(
        (apt) =>
          apt.client_email === patient.email ||
          apt.client_name.toLowerCase() === patient.name.toLowerCase()
      )
    );
    setIsModalOpen(true);
  };

  const handleUpdateNotes = async (appointmentId: string, notes: string) => {
    try {
      const { error } = await supabase
        .from("appointments")
        .update({ notes })
        .eq("id", appointmentId);

      if (error) throw error;

      toast.success("Notas salvas com sucesso");
      
      // Update local state
      setAppointments((prev) =>
        prev.map((apt) =>
          apt.id === appointmentId ? { ...apt, notes } : apt
        )
      );
      setSelectedPatientAppointments((prev) =>
        prev.map((apt) =>
          apt.id === appointmentId ? { ...apt, notes } : apt
        )
      );
    } catch (error) {
      console.error("Error updating notes:", error);
      toast.error("Erro ao salvar notas");
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <Card className="border-border/50 overflow-hidden">
      {/* Header with Large Icon */}
      <div className="bg-gradient-to-r from-primary/10 to-primary/5 p-6 border-b border-border/50">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-primary/20 flex items-center justify-center">
            <Users className="h-8 w-8 text-primary" />
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-bold text-foreground">Pacientes</h2>
            <p className="text-sm text-muted-foreground mt-0.5">
              Gerencie seus pacientes e acompanhe o histórico de atendimentos
            </p>
          </div>
        </div>
      </div>

      <CardContent className="p-6 space-y-6">
        {/* Metrics Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="border-border/50">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                  <Users className="h-5 w-5 text-blue-500" />
                </div>
                <div>
                  <div className="text-2xl font-bold">{metrics.totalPatients}</div>
                  <div className="text-sm text-muted-foreground">Total Pacientes</div>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-border/50">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center">
                  <TrendingUp className="h-5 w-5 text-green-500" />
                </div>
                <div>
                  <div className="text-2xl font-bold">{metrics.activePatients}</div>
                  <div className="text-sm text-muted-foreground">Ativos</div>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-border/50">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center">
                  <DollarSign className="h-5 w-5 text-purple-500" />
                </div>
                <div>
                  <div className="text-2xl font-bold">{formatCurrency(metrics.totalRevenue)}</div>
                  <div className="text-sm text-muted-foreground">Receita Total</div>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-border/50">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-orange-500/10 flex items-center justify-center">
                  <Calendar className="h-5 w-5 text-orange-500" />
                </div>
                <div>
                  <div className="text-2xl font-bold">{formatCurrency(metrics.avgTicket)}</div>
                  <div className="text-sm text-muted-foreground">Ticket Médio</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar paciente por nome, email ou telefone..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-40">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="active">Ativos</SelectItem>
              <SelectItem value="inactive">Inativos</SelectItem>
              <SelectItem value="new">Novos</SelectItem>
            </SelectContent>
          </Select>
          
          {/* Export Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="gap-2">
                <Download className="h-4 w-4" />
                Exportar
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => {
                exportPatientsToCSV(filteredPatients);
                toast.success(`${filteredPatients.length} pacientes exportados para CSV`);
              }}>
                <FileText className="h-4 w-4 mr-2" />
                Exportar CSV
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => {
                exportPatientsToExcel(filteredPatients);
                toast.success(`${filteredPatients.length} pacientes exportados para Excel`);
              }}>
                <FileSpreadsheet className="h-4 w-4 mr-2" />
                Exportar Excel
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Patients Grid */}
        {filteredPatients.length === 0 ? (
          <div className="text-center py-12">
            <Users className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-1">
              Nenhum paciente encontrado
            </h3>
            <p className="text-muted-foreground">
              {searchQuery || statusFilter !== "all"
                ? "Tente ajustar os filtros de busca"
                : "Os pacientes aparecerão aqui quando houver agendamentos"}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredPatients.map((patient, index) => (
              <PatientCard
                key={`${patient.email || patient.name}-${index}`}
                patient={patient}
                onClick={() => handlePatientClick(patient)}
              />
            ))}
          </div>
        )}
      </CardContent>

      {/* Patient Detail Modal */}
      <PatientDetailModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        patient={selectedPatient}
        appointments={selectedPatientAppointments}
        onUpdateNotes={handleUpdateNotes}
        professionalId={profileId}
      />
    </Card>
  );
};

export default PatientsPage;
