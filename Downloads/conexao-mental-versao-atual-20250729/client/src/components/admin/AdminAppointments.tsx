import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Search, Eye, X, CheckCircle, AlertCircle, Edit, Trash, Calendar, Clock, User, FileText } from "lucide-react";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

interface Appointment {
  id: number;
  patient: string;
  professional: string;
  date: string;
  time: string;
  type: 'online' | 'presencial';
  status: 'scheduled' | 'completed' | 'cancelled' | 'no-show';
  price: number;
  notes?: string;
}

const AdminAppointments = () => {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [editingAppointment, setEditingAppointment] = useState<Appointment | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [appointments, setAppointments] = useState<Appointment[]>([
    {
      id: 1,
      patient: "Maria Silva Santos",
      professional: "Dra. Ana Paula Silva",
      date: "2024-06-30",
      time: "14:00",
      type: 'online',
      status: 'scheduled',
      price: 150,
      notes: "Primeira consulta"
    },
    {
      id: 2,
      patient: "João Carlos Oliveira",
      professional: "Dr. Carlos Roberto",
      date: "2024-06-30",
      time: "15:30",
      type: 'online',
      status: 'completed',
      price: 180,
      notes: "Consulta de retorno"
    },
    {
      id: 3,
      patient: "Ana Beatriz Costa",
      professional: "Dra. Mariana Souza",
      date: "2024-06-29",
      time: "10:00",
      type: 'presencial',
      status: 'cancelled',
      price: 160,
      notes: "Cancelado pelo paciente"
    },
    {
      id: 4,
      patient: "Pedro Henrique Lima",
      professional: "Dra. Ana Paula Silva",
      date: "2024-06-28",
      time: "16:00",
      type: 'online',
      status: 'no-show',
      price: 150,
      notes: "Paciente não compareceu"
    },
    {
      id: 5,
      patient: "Carla Fernandes",
      professional: "Dr. Carlos Roberto",
      date: "2024-06-30",
      time: "09:00",
      type: 'online',
      status: 'scheduled',
      price: 180
    }
  ]);

  const handleCancelAppointment = (appointmentId: number) => {
    setAppointments(prev => 
      prev.map(appointment => 
        appointment.id === appointmentId 
          ? { ...appointment, status: 'cancelled' as const }
          : appointment
      )
    );
    toast({
      title: "Consulta cancelada",
      description: "A consulta foi cancelada e os envolvidos foram notificados.",
      variant: "destructive",
    });
  };

  const handleCompleteAppointment = (appointmentId: number) => {
    setAppointments(prev => 
      prev.map(appointment => 
        appointment.id === appointmentId 
          ? { ...appointment, status: 'completed' as const }
          : appointment
      )
    );
    toast({
      title: "Consulta concluída",
      description: "A consulta foi marcada como concluída.",
    });
  };

  const handleMarkNoShow = (appointmentId: number) => {
    setAppointments(prev => 
      prev.map(appointment => 
        appointment.id === appointmentId 
          ? { ...appointment, status: 'no-show' as const }
          : appointment
      )
    );
    toast({
      title: "Falta registrada",
      description: "A consulta foi marcada como falta do paciente.",
      variant: "destructive",
    });
  };

  const handleDeleteAppointment = (appointmentId: number) => {
    setAppointments(prev => prev.filter(appointment => appointment.id !== appointmentId));
    toast({
      title: "Consulta excluída",
      description: "A consulta foi removida permanentemente do sistema.",
      variant: "destructive",
    });
  };

  const handleEditAppointment = (appointmentId: number) => {
    const appointment = appointments.find(a => a.id === appointmentId);
    if (appointment) {
      setEditingAppointment({ ...appointment });
      setIsEditDialogOpen(true);
    }
  };

  const handleViewAppointment = (appointmentId: number) => {
    const appointment = appointments.find(a => a.id === appointmentId);
    if (appointment) {
      setSelectedAppointment(appointment);
      setIsViewDialogOpen(true);
    }
  };

  const handleSaveEdit = () => {
    if (editingAppointment) {
      setAppointments(prev => 
        prev.map(appointment => 
          appointment.id === editingAppointment.id 
            ? editingAppointment
            : appointment
        )
      );
      setIsEditDialogOpen(false);
      setEditingAppointment(null);
      toast({
        title: "Consulta atualizada",
        description: "As alterações foram salvas com sucesso.",
      });
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'scheduled':
        return <Badge className="bg-blue-100 text-blue-800">Agendada</Badge>;
      case 'completed':
        return <Badge className="bg-green-100 text-green-800">Concluída</Badge>;
      case 'cancelled':
        return <Badge className="bg-red-100 text-red-800">Cancelada</Badge>;
      case 'no-show':
        return <Badge className="bg-orange-100 text-orange-800">Faltou</Badge>;
      default:
        return <Badge>Desconhecido</Badge>;
    }
  };

  const getTypeBadge = (type: string) => {
    switch (type) {
      case 'online':
        return <Badge variant="outline" className="bg-purple-50 text-purple-700">Online</Badge>;
      case 'presencial':
        return <Badge variant="outline" className="bg-gray-50 text-gray-700">Presencial</Badge>;
      default:
        return <Badge variant="outline">-</Badge>;
    }
  };

  const filteredAppointments = appointments.filter(appointment =>
    appointment.patient.toLowerCase().includes(searchTerm.toLowerCase()) ||
    appointment.professional.toLowerCase().includes(searchTerm.toLowerCase()) ||
    appointment.date.includes(searchTerm)
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          Gestão de Consultas
          <div className="flex items-center space-x-2">
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar consultas..."
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
              <TableHead>Paciente</TableHead>
              <TableHead>Profissional</TableHead>
              <TableHead>Data</TableHead>
              <TableHead>Hora</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Valor</TableHead>
              <TableHead>Observações</TableHead>
              <TableHead>Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredAppointments.map((appointment) => (
              <TableRow key={appointment.id}>
                <TableCell className="font-medium">{appointment.patient}</TableCell>
                <TableCell>{appointment.professional}</TableCell>
                <TableCell>
                  {new Date(appointment.date).toLocaleDateString('pt-BR')}
                </TableCell>
                <TableCell>{appointment.time}</TableCell>
                <TableCell>{getTypeBadge(appointment.type)}</TableCell>
                <TableCell>{getStatusBadge(appointment.status)}</TableCell>
                <TableCell>R$ {appointment.price}</TableCell>
                <TableCell className="max-w-32 truncate">
                  {appointment.notes || '-'}
                </TableCell>
                <TableCell>
                  <div className="flex space-x-1">
                    <Button variant="ghost" size="sm" onClick={() => handleViewAppointment(appointment.id)}>
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => handleEditAppointment(appointment.id)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    
                    {appointment.status === 'scheduled' && (
                      <>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleCompleteAppointment(appointment.id)}
                          className="text-green-600 hover:text-green-700"
                        >
                          <CheckCircle className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleMarkNoShow(appointment.id)}
                          className="text-orange-600 hover:text-orange-700"
                        >
                          <AlertCircle className="h-4 w-4" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-red-600 hover:text-red-700"
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Cancelar consulta?</AlertDialogTitle>
                              <AlertDialogDescription>
                                A consulta será cancelada e os envolvidos serão notificados.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Não cancelar</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleCancelAppointment(appointment.id)}>
                                Cancelar consulta
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </>
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
                          <AlertDialogTitle>Excluir consulta?</AlertDialogTitle>
                          <AlertDialogDescription>
                            Esta ação não pode ser desfeita. A consulta será permanentemente removida do sistema.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancelar</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleDeleteAppointment(appointment.id)}>
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

      {/* Modal de Visualização */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Detalhes da Consulta</DialogTitle>
            <DialogDescription>
              Informações completas da consulta selecionada
            </DialogDescription>
          </DialogHeader>
          {selectedAppointment && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Paciente</Label>
                  <div className="flex items-center space-x-2">
                    <User className="h-4 w-4 text-gray-500" />
                    <span>{selectedAppointment.patient}</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Profissional</Label>
                  <div className="flex items-center space-x-2">
                    <User className="h-4 w-4 text-gray-500" />
                    <span>{selectedAppointment.professional}</span>
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Data</Label>
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-4 w-4 text-gray-500" />
                    <span>{new Date(selectedAppointment.date).toLocaleDateString('pt-BR')}</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Horário</Label>
                  <div className="flex items-center space-x-2">
                    <Clock className="h-4 w-4 text-gray-500" />
                    <span>{selectedAppointment.time}</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Tipo</Label>
                  <div>{getTypeBadge(selectedAppointment.type)}</div>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Status</Label>
                  <div>{getStatusBadge(selectedAppointment.status)}</div>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium">Valor</Label>
                <div className="text-lg font-semibold text-green-600">
                  R$ {selectedAppointment.price.toFixed(2)}
                </div>
              </div>

              {selectedAppointment.notes && (
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Observações</Label>
                  <div className="flex items-start space-x-2">
                    <FileText className="h-4 w-4 text-gray-500 mt-0.5" />
                    <span className="text-sm text-gray-600">{selectedAppointment.notes}</span>
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Modal de Edição */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Editar Consulta</DialogTitle>
            <DialogDescription>
              Altere as informações da consulta conforme necessário
            </DialogDescription>
          </DialogHeader>
          {editingAppointment && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="patient">Paciente</Label>
                  <Input
                    id="patient"
                    value={editingAppointment.patient}
                    onChange={(e) => setEditingAppointment({
                      ...editingAppointment,
                      patient: e.target.value
                    })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="professional">Profissional</Label>
                  <Input
                    id="professional"
                    value={editingAppointment.professional}
                    onChange={(e) => setEditingAppointment({
                      ...editingAppointment,
                      professional: e.target.value
                    })}
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="date">Data</Label>
                  <Input
                    id="date"
                    type="date"
                    value={editingAppointment.date}
                    onChange={(e) => setEditingAppointment({
                      ...editingAppointment,
                      date: e.target.value
                    })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="time">Horário</Label>
                  <Input
                    id="time"
                    type="time"
                    value={editingAppointment.time}
                    onChange={(e) => setEditingAppointment({
                      ...editingAppointment,
                      time: e.target.value
                    })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="type">Tipo</Label>
                  <Select
                    value={editingAppointment.type}
                    onValueChange={(value) => setEditingAppointment({
                      ...editingAppointment,
                      type: value as 'online' | 'presencial'
                    })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="online">Online</SelectItem>
                      <SelectItem value="presencial">Presencial</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <Select
                    value={editingAppointment.status}
                    onValueChange={(value) => setEditingAppointment({
                      ...editingAppointment,
                      status: value as 'scheduled' | 'completed' | 'cancelled' | 'no-show'
                    })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="scheduled">Agendada</SelectItem>
                      <SelectItem value="completed">Concluída</SelectItem>
                      <SelectItem value="cancelled">Cancelada</SelectItem>
                      <SelectItem value="no-show">Faltou</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="price">Valor (R$)</Label>
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  value={editingAppointment.price}
                  onChange={(e) => setEditingAppointment({
                    ...editingAppointment,
                    price: parseFloat(e.target.value) || 0
                  })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Observações</Label>
                <Textarea
                  id="notes"
                  placeholder="Adicione observações sobre a consulta..."
                  value={editingAppointment.notes || ''}
                  onChange={(e) => setEditingAppointment({
                    ...editingAppointment,
                    notes: e.target.value
                  })}
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSaveEdit}>
              Salvar Alterações
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
};

export default AdminAppointments;
