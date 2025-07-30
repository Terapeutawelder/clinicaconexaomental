import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Search, Eye, Edit, Trash, Ban, UserPlus, UserMinus } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface Patient {
  id: number;
  name: string;
  email: string;
  phone: string;
  registrationDate: string;
  lastAppointment: string;
  totalAppointments: number;
  status: 'active' | 'inactive' | 'blocked';
  preferredProfessional?: string;
}

const AdminPatients = () => {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [patients, setPatients] = useState<Patient[]>([
    {
      id: 1,
      name: "Maria Silva Santos",
      email: "maria.santos@email.com",
      phone: "(11) 99999-1234",
      registrationDate: "2024-01-20",
      lastAppointment: "2024-06-15",
      totalAppointments: 12,
      status: 'active',
      preferredProfessional: "Dra. Ana Paula Silva"
    },
    {
      id: 2,
      name: "João Carlos Oliveira",
      email: "joao.oliveira@email.com",
      phone: "(11) 88888-5678",
      registrationDate: "2024-02-10",
      lastAppointment: "2024-06-20",
      totalAppointments: 8,
      status: 'active',
      preferredProfessional: "Dr. Carlos Roberto"
    },
    {
      id: 3,
      name: "Ana Beatriz Costa",
      email: "ana.costa@email.com",
      phone: "(11) 77777-9012",
      registrationDate: "2024-03-05",
      lastAppointment: "2024-04-30",
      totalAppointments: 3,
      status: 'inactive'
    },
    {
      id: 4,
      name: "Pedro Henrique Lima",
      email: "pedro.lima@email.com",
      phone: "(11) 66666-3456",
      registrationDate: "2024-01-15",
      lastAppointment: "2024-05-10",
      totalAppointments: 15,
      status: 'blocked'
    }
  ]);

  const handleBlockPatient = (patientId: number) => {
    setPatients(prev => 
      prev.map(patient => 
        patient.id === patientId 
          ? { ...patient, status: 'blocked' as const }
          : patient
      )
    );
    toast({
      title: "Paciente bloqueado",
      description: "O paciente foi bloqueado e não poderá mais agendar consultas.",
      variant: "destructive",
    });
  };

  const handleUnblockPatient = (patientId: number) => {
    setPatients(prev => 
      prev.map(patient => 
        patient.id === patientId 
          ? { ...patient, status: 'active' as const }
          : patient
      )
    );
    toast({
      title: "Paciente desbloqueado",
      description: "O paciente foi desbloqueado e pode voltar a agendar consultas.",
    });
  };

  const handleActivatePatient = (patientId: number) => {
    setPatients(prev => 
      prev.map(patient => 
        patient.id === patientId 
          ? { ...patient, status: 'active' as const }
          : patient
      )
    );
    toast({
      title: "Paciente ativado",
      description: "O paciente foi ativado com sucesso.",
    });
  };

  const handleDeactivatePatient = (patientId: number) => {
    setPatients(prev => 
      prev.map(patient => 
        patient.id === patientId 
          ? { ...patient, status: 'inactive' as const }
          : patient
      )
    );
    toast({
      title: "Paciente desativado",
      description: "O paciente foi desativado.",
      variant: "destructive",
    });
  };

  const handleDeletePatient = (patientId: number) => {
    setPatients(prev => prev.filter(patient => patient.id !== patientId));
    toast({
      title: "Paciente excluído",
      description: "O paciente foi removido permanentemente do sistema.",
      variant: "destructive",
    });
  };

  const handleEditPatient = (patientId: number) => {
    const patient = patients.find(p => p.id === patientId);
    if (patient) {
      toast({
        title: "Editar paciente",
        description: `Abrindo editor para ${patient.name} - ${patient.totalAppointments} consultas`,
      });
    }
  };

  const handleViewPatient = (patientId: number) => {
    const patient = patients.find(p => p.id === patientId);
    if (patient) {
      toast({
        title: "Visualizar paciente",
        description: `Perfil: ${patient.name} - Status: ${patient.status === 'active' ? 'Ativo' : 'Inativo'}`,
      });
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-100 text-green-800">Ativo</Badge>;
      case 'inactive':
        return <Badge className="bg-gray-100 text-gray-800">Inativo</Badge>;
      case 'blocked':
        return <Badge className="bg-red-100 text-red-800">Bloqueado</Badge>;
      default:
        return <Badge>Desconhecido</Badge>;
    }
  };

  const filteredPatients = patients.filter(patient =>
    patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.phone.includes(searchTerm)
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          Gestão de Pacientes
          <div className="flex items-center space-x-2">
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar pacientes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8 w-64"
              />
            </div>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Telefone</TableHead>
              <TableHead>Cadastro</TableHead>
              <TableHead>Última Consulta</TableHead>
              <TableHead>Total Consultas</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Profissional Preferido</TableHead>
              <TableHead>Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredPatients.map((patient) => (
              <TableRow key={patient.id}>
                <TableCell className="font-medium">{patient.name}</TableCell>
                <TableCell>{patient.email}</TableCell>
                <TableCell>{patient.phone}</TableCell>
                <TableCell>
                  {new Date(patient.registrationDate).toLocaleDateString('pt-BR')}
                </TableCell>
                <TableCell>
                  {new Date(patient.lastAppointment).toLocaleDateString('pt-BR')}
                </TableCell>
                <TableCell>{patient.totalAppointments}</TableCell>
                <TableCell>{getStatusBadge(patient.status)}</TableCell>
                <TableCell>{patient.preferredProfessional || '-'}</TableCell>
                <TableCell>
                  <div className="flex space-x-1">
                    <Button variant="ghost" size="sm" onClick={() => handleViewPatient(patient.id)}>
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => handleEditPatient(patient.id)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    
                    {patient.status === 'active' && (
                      <>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeactivatePatient(patient.id)}
                          className="text-orange-600 hover:text-orange-700"
                        >
                          <UserMinus className="h-4 w-4" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-red-600 hover:text-red-700"
                            >
                              <Ban className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Bloquear paciente?</AlertDialogTitle>
                              <AlertDialogDescription>
                                O paciente será bloqueado e não poderá mais agendar consultas.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancelar</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleBlockPatient(patient.id)}>
                                Bloquear
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </>
                    )}
                    
                    {patient.status === 'blocked' && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleUnblockPatient(patient.id)}
                        className="text-green-600 hover:text-green-700"
                      >
                        <UserPlus className="h-4 w-4" />
                      </Button>
                    )}
                    
                    {patient.status === 'inactive' && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleActivatePatient(patient.id)}
                        className="text-green-600 hover:text-green-700"
                      >
                        <UserPlus className="h-4 w-4" />
                      </Button>
                    )}

                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Excluir paciente?</AlertDialogTitle>
                          <AlertDialogDescription>
                            Esta ação não pode ser desfeita. Todos os dados do paciente serão permanentemente removidos.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancelar</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleDeletePatient(patient.id)}>
                            Excluir
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default AdminPatients;
