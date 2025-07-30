
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Search, Check, X, Edit, Trash, Eye, UserPlus, UserMinus, RefreshCw } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
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
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Professional {
  id: string;
  name: string;
  email: string;
  specialty: string;
  crp?: string;
  status: 'pending' | 'approved' | 'suspended' | 'inactive';
  approved: boolean;
  totalAppointments: number;
  rating: number;
  appointmentsToday: number;
  appointmentsThisWeek: number;
  nextAppointment: any;
  lastActive: string;
  phone?: string;
  cpf?: string;
  gender?: string;
  therapeutic_approach?: string;
  experience?: string;
  address?: string;
  curriculum_file?: string;
  bio?: string;
  company_name?: string;
  company_cnpj?: string;
  company_phone?: string;
  company_email?: string;
  company_website?: string;
  google_calendar_email?: string;
}

const AdminProfessionals = () => {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedProfessional, setSelectedProfessional] = useState<Professional | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newProfessional, setNewProfessional] = useState({
    name: '',
    email: '',
    password: '',
    specialty: '',
    crp: '',
    phone: '',
    cpf: '',
    gender: '',
    therapeutic_approach: '',
    experience: '',
    description: '',
    address: ''
  });

  const queryClient = useQueryClient();

  const { data: professionals = [], isLoading, error, refetch } = useQuery({
    queryKey: ['/api/admin/professional-agendas'],
    staleTime: 0,
    cacheTime: 0,
    gcTime: 0,
    refetchOnMount: true,
    refetchOnWindowFocus: true,
    retry: 2,
    queryFn: async () => {
      const token = localStorage.getItem('auth_token');
      const response = await fetch('/api/admin/professional-agendas', {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token ? `Bearer ${token}` : '',
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        },
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`${response.status}: ${errorText}`);
      }
      
      const data = await response.json();
      console.log('Fresh data from API:', data);
      return data;
    },
    onError: (error) => {
      console.error('Error loading professionals:', error);
      toast({
        title: "Erro ao carregar profissionais",
        description: error.message || "Erro desconhecido",
        variant: "destructive",
      });
    },
  });

  console.log('AdminProfessionals render:', { professionals, isLoading, error });
  
  useEffect(() => {
    console.log('Professionals data changed:', professionals);
  }, [professionals]);

  const approveProfessionalMutation = useMutation({
    mutationFn: async (professionalId: string) => {
      return await apiRequest('POST', `/api/admin/professionals/${professionalId}/approve`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/professional-agendas'] });
      refetch();
      toast({
        title: "Profissional aprovado!",
        description: "O profissional foi aprovado e pode começar a atender pacientes.",
      });
    },
    onError: (error) => {
      toast({
        title: "Erro",
        description: "Erro ao aprovar profissional. Tente novamente.",
        variant: "destructive",
      });
    }
  });

  const suspendProfessionalMutation = useMutation({
    mutationFn: async (professionalId: string) => {
      return await apiRequest('POST', `/api/admin/professionals/${professionalId}/suspend`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/professional-agendas'] });
      queryClient.removeQueries({ queryKey: ['/api/admin/professional-agendas'] });
      refetch();
      toast({
        title: "Profissional suspenso",
        description: "O profissional foi suspenso temporariamente.",
        variant: "destructive",
      });
    },
    onError: (error) => {
      toast({
        title: "Erro",
        description: "Erro ao suspender profissional. Tente novamente.",
        variant: "destructive",
      });
    }
  });

  const deleteProfessionalMutation = useMutation({
    mutationFn: async (professionalId: string) => {
      return await apiRequest('DELETE', `/api/admin/professionals/${professionalId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/professional-agendas'] });
      refetch();
      toast({
        title: "Profissional excluído",
        description: "O profissional foi removido permanentemente do sistema.",
        variant: "destructive",
      });
    },
    onError: (error) => {
      toast({
        title: "Erro",
        description: "Erro ao excluir profissional. Tente novamente.",
        variant: "destructive",
      });
    }
  });

  const setAnalysisMutation = useMutation({
    mutationFn: async (professionalId: string) => {
      return await apiRequest('PUT', `/api/admin/professionals/${professionalId}/status`, {
        status: 'pending'
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/professional-agendas'] });
      refetch();
      toast({
        title: "Status atualizado",
        description: "O profissional foi colocado em análise.",
      });
    },
    onError: (error) => {
      toast({
        title: "Erro",
        description: "Erro ao atualizar status. Tente novamente.",
        variant: "destructive",
      });
    }
  });



  const handleView = (professionalId: string) => {
    const professional = professionals.find(p => p.id === professionalId);
    if (professional) {
      setSelectedProfessional(professional);
      setIsViewDialogOpen(true);
    }
  };

  const specialties = [
    'Psicólogo',
    'Psicanalista',
    'Psiquiatra',
    'Psicoterapeuta',
    'Terapeuta Familiar',
    'Terapeuta Cognitivo-Comportamental',
    'Neuropsicólogo',
    'Psicólogo Clínico',
    'Psicólogo Organizacional',
    'Psicopedagogo',
  ];

  const getStatusBadge = (professional: any) => {
    const status = professional.status || 'pending';
    switch (status) {
      case 'approved':
        return <Badge className="bg-green-100 text-green-800">Ativo</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800">Em análise</Badge>;
      case 'rejected':
        return <Badge className="bg-red-100 text-red-800">Reprovado</Badge>;
      case 'suspended':
        return <Badge className="bg-gray-100 text-gray-800">Suspenso</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800">Indefinido</Badge>;
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-40">
          <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-40">
          <div className="text-red-600">Erro ao carregar profissionais</div>
        </CardContent>
      </Card>
    );
  }

  const filteredProfessionals = professionals.filter(prof =>
    prof.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    prof.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    prof.specialty.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          Gestão de Profissionais
          <div className="flex items-center space-x-2">
            <Button
              variant="default"
              size="sm"
              onClick={() => setIsCreateDialogOpen(true)}
              className="flex items-center space-x-1 bg-purple-600 hover:bg-purple-700"
            >
              <UserPlus className="h-4 w-4" />
              <span>Cadastrar Profissional</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => refetch()}
              disabled={isLoading}
              className="flex items-center space-x-1"
            >
              <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
              <span>Atualizar</span>
            </Button>
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar profissionais..."
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
              <TableHead>Especialidade</TableHead>
              <TableHead>Registro</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Currículo</TableHead>
              <TableHead>Consultas</TableHead>
              <TableHead>Avaliação</TableHead>
              <TableHead>Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredProfessionals.map((professional) => (
              <TableRow key={professional.id}>
                <TableCell className="font-medium">{professional.name}</TableCell>
                <TableCell>{professional.email}</TableCell>
                <TableCell>{professional.specialty}</TableCell>
                <TableCell>{professional.crp || 'N/A'}</TableCell>
                <TableCell>{getStatusBadge(professional)}</TableCell>
                <TableCell>
                  {professional.curriculum_file ? (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        // Aqui você pode implementar a visualização do currículo
                        toast({
                          title: "Currículo disponível",
                          description: `Currículo de ${professional.name} está disponível para download.`,
                        });
                      }}
                      className="text-xs"
                    >
                      Ver Currículo
                    </Button>
                  ) : (
                    <span className="text-gray-400 text-xs">Não enviado</span>
                  )}
                </TableCell>
                <TableCell>{professional.totalAppointments}</TableCell>
                <TableCell>
                  {professional.rating > 0 ? professional.rating.toFixed(1) : '-'}
                </TableCell>
                <TableCell>
                  <div className="flex space-x-1">
                    <Button variant="ghost" size="sm" onClick={() => handleView(professional.id)}>
                      <Eye className="h-4 w-4" />
                    </Button>
                    
                    {/* Botão Aprovar */}
                    {!professional.approved && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => approveProfessionalMutation.mutate(professional.id)}
                        className="text-green-600 hover:text-green-700"
                        disabled={approveProfessionalMutation.isPending}
                        title="Aprovar profissional"
                      >
                        <Check className="h-4 w-4" />
                      </Button>
                    )}
                    
                    {/* Botão Suspender */}
                    {professional.approved && (
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-orange-600 hover:text-orange-700"
                            disabled={suspendProfessionalMutation.isPending}
                            title="Suspender profissional"
                          >
                            <UserMinus className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Suspender profissional?</AlertDialogTitle>
                            <AlertDialogDescription>
                              O profissional será suspenso temporariamente e não poderá atender pacientes.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction onClick={() => suspendProfessionalMutation.mutate(professional.id)}>
                              Suspender
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    )}
                    
                    {/* Botão Colocar em Análise */}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setAnalysisMutation.mutate(professional.id)}
                      className="text-blue-600 hover:text-blue-700"
                      disabled={setAnalysisMutation.isPending}
                      title="Colocar em análise"
                    >
                      <RefreshCw className="h-4 w-4" />
                    </Button>
                    
                    {/* Botão Excluir */}
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-red-600 hover:text-red-700"
                          disabled={deleteProfessionalMutation.isPending}
                          title="Excluir profissional"
                        >
                          <Trash className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Excluir profissional?</AlertDialogTitle>
                          <AlertDialogDescription>
                            Esta ação não pode ser desfeita. Todos os dados do profissional serão permanentemente removidos.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancelar</AlertDialogCancel>
                          <AlertDialogAction onClick={() => deleteProfessionalMutation.mutate(professional.id)}>
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
      
      {/* Dialog de Visualização */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Visualizar Profissional</DialogTitle>
            <DialogDescription>
              Informações detalhadas do profissional
            </DialogDescription>
          </DialogHeader>
          {selectedProfessional && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium">Nome:</h4>
                  <p className="text-sm text-gray-600">{selectedProfessional.name}</p>
                </div>
                <div>
                  <h4 className="font-medium">Email:</h4>
                  <p className="text-sm text-gray-600">{selectedProfessional.email}</p>
                </div>
                <div>
                  <h4 className="font-medium">Especialidade:</h4>
                  <p className="text-sm text-gray-600">{selectedProfessional.specialty}</p>
                </div>
                <div>
                  <h4 className="font-medium">Status:</h4>
                  <p className="text-sm text-gray-600">{selectedProfessional.approved ? 'Aprovado' : 'Pendente'}</p>
                </div>
                <div>
                  <h4 className="font-medium">Total de Consultas:</h4>
                  <p className="text-sm text-gray-600">{selectedProfessional.totalAppointments}</p>
                </div>
                <div>
                  <h4 className="font-medium">Avaliação:</h4>
                  <p className="text-sm text-gray-600">{selectedProfessional.rating > 0 ? selectedProfessional.rating.toFixed(1) : 'Sem avaliação'}</p>
                </div>
                <div>
                  <h4 className="font-medium">Telefone:</h4>
                  <p className="text-sm text-gray-600">{selectedProfessional.phone || 'Não informado'}</p>
                </div>
                <div>
                  <h4 className="font-medium">CPF:</h4>
                  <p className="text-sm text-gray-600">{selectedProfessional.cpf || 'Não informado'}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium">Gênero:</h4>
                  <p className="text-sm text-gray-600">{selectedProfessional.gender || 'Não informado'}</p>
                </div>
                <div>
                  <h4 className="font-medium">Abordagem Terapêutica:</h4>
                  <p className="text-sm text-gray-600">{selectedProfessional.therapeutic_approach || 'Não informado'}</p>
                </div>
                <div>
                  <h4 className="font-medium">Experiência:</h4>
                  <p className="text-sm text-gray-600">{selectedProfessional.experience || 'Não informado'}</p>
                </div>
                <div>
                  <h4 className="font-medium">CRP:</h4>
                  <p className="text-sm text-gray-600">{selectedProfessional.crp || 'Não informado'}</p>
                </div>
              </div>
              
              {selectedProfessional.bio && (
                <div className="pt-4 border-t">
                  <h4 className="font-medium mb-2">Descrição:</h4>
                  <p className="text-sm text-gray-600">{selectedProfessional.bio}</p>
                </div>
              )}
              
              {selectedProfessional.address && (
                <div className="pt-4 border-t">
                  <h4 className="font-medium mb-2">Endereço:</h4>
                  <p className="text-sm text-gray-600">{selectedProfessional.address}</p>
                </div>
              )}
              
              {selectedProfessional.curriculum_file && (
                <div className="pt-4 border-t">
                  <h4 className="font-medium mb-2">Currículo:</h4>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      toast({
                        title: "Download do currículo",
                        description: `Iniciando download do currículo de ${selectedProfessional.name}`,
                      });
                    }}
                  >
                    Baixar Currículo
                  </Button>
                </div>
              )}
              
              {(selectedProfessional.company_name || selectedProfessional.company_cnpj) && (
                <div className="pt-4 border-t">
                  <h4 className="font-medium mb-2">Dados da Empresa:</h4>
                  <div className="grid grid-cols-2 gap-4">
                    {selectedProfessional.company_name && (
                      <div>
                        <h5 className="text-sm font-medium">Nome:</h5>
                        <p className="text-sm text-gray-600">{selectedProfessional.company_name}</p>
                      </div>
                    )}
                    {selectedProfessional.company_cnpj && (
                      <div>
                        <h5 className="text-sm font-medium">CNPJ:</h5>
                        <p className="text-sm text-gray-600">{selectedProfessional.company_cnpj}</p>
                      </div>
                    )}
                    {selectedProfessional.company_phone && (
                      <div>
                        <h5 className="text-sm font-medium">Telefone:</h5>
                        <p className="text-sm text-gray-600">{selectedProfessional.company_phone}</p>
                      </div>
                    )}
                    {selectedProfessional.company_email && (
                      <div>
                        <h5 className="text-sm font-medium">Email:</h5>
                        <p className="text-sm text-gray-600">{selectedProfessional.company_email}</p>
                      </div>
                    )}
                    {selectedProfessional.company_website && (
                      <div>
                        <h5 className="text-sm font-medium">Website:</h5>
                        <p className="text-sm text-gray-600">{selectedProfessional.company_website}</p>
                      </div>
                    )}
                    {selectedProfessional.google_calendar_email && (
                      <div>
                        <h5 className="text-sm font-medium">Google Calendar:</h5>
                        <p className="text-sm text-gray-600">{selectedProfessional.google_calendar_email}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
              
              <div className="pt-4 border-t">
                <h4 className="font-medium mb-2">Estatísticas de Agendamento:</h4>
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">{selectedProfessional.appointmentsToday}</div>
                    <div className="text-xs text-gray-500">Hoje</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">{selectedProfessional.appointmentsThisWeek}</div>
                    <div className="text-xs text-gray-500">Esta semana</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">{selectedProfessional.totalAppointments}</div>
                    <div className="text-xs text-gray-500">Total</div>
                  </div>
                </div>
              </div>
              
              {selectedProfessional.nextAppointment && (
                <div className="pt-4 border-t">
                  <h4 className="font-medium mb-2">Próximo Agendamento:</h4>
                  <div className="bg-gray-50 p-3 rounded">
                    <p className="text-sm">
                      <span className="font-medium">Data:</span> {selectedProfessional.nextAppointment.date}
                    </p>
                    <p className="text-sm">
                      <span className="font-medium">Horário:</span> {selectedProfessional.nextAppointment.time}
                    </p>
                    <p className="text-sm">
                      <span className="font-medium">Paciente:</span> {selectedProfessional.nextAppointment.patient}
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Dialog de Cadastro */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Cadastrar Novo Profissional</DialogTitle>
            <DialogDescription>
              Preencha os dados do profissional para criar uma nova conta
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Dados Pessoais */}
            <div className="space-y-4">
              <h4 className="font-medium text-purple-700">Dados Pessoais</h4>
              <div>
                <Label htmlFor="name">Nome Completo *</Label>
                <Input
                  id="name"
                  value={newProfessional.name}
                  onChange={(e) => setNewProfessional(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Digite o nome completo"
                />
              </div>
              <div>
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  value={newProfessional.email}
                  onChange={(e) => setNewProfessional(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="exemplo@email.com"
                />
              </div>
              <div>
                <Label htmlFor="password">Senha *</Label>
                <Input
                  id="password"
                  type="password"
                  value={newProfessional.password}
                  onChange={(e) => setNewProfessional(prev => ({ ...prev, password: e.target.value }))}
                  placeholder="Digite uma senha segura"
                />
              </div>
              <div>
                <Label htmlFor="phone">Telefone</Label>
                <Input
                  id="phone"
                  value={newProfessional.phone}
                  onChange={(e) => setNewProfessional(prev => ({ ...prev, phone: e.target.value }))}
                  placeholder="(11) 99999-9999"
                />
              </div>
              <div>
                <Label htmlFor="cpf">CPF</Label>
                <Input
                  id="cpf"
                  value={newProfessional.cpf}
                  onChange={(e) => setNewProfessional(prev => ({ ...prev, cpf: e.target.value }))}
                  placeholder="000.000.000-00"
                />
              </div>
              <div>
                <Label htmlFor="gender">Gênero</Label>
                <Select
                  value={newProfessional.gender}
                  onValueChange={(value) => setNewProfessional(prev => ({ ...prev, gender: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o gênero" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Masculino">Masculino</SelectItem>
                    <SelectItem value="Feminino">Feminino</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Dados Profissionais */}
            <div className="space-y-4">
              <h4 className="font-medium text-purple-700">Dados Profissionais</h4>
              <div>
                <Label htmlFor="specialty">Especialidade *</Label>
                <Select
                  value={newProfessional.specialty}
                  onValueChange={(value) => setNewProfessional(prev => ({ ...prev, specialty: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a especialidade" />
                  </SelectTrigger>
                  <SelectContent>
                    {specialties.map((specialty) => (
                      <SelectItem key={specialty} value={specialty}>
                        {specialty}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="crp">Identificação Profissional (CRP)</Label>
                <Input
                  id="crp"
                  value={newProfessional.crp}
                  onChange={(e) => setNewProfessional(prev => ({ ...prev, crp: e.target.value }))}
                  placeholder="Ex: CRP 06/123456"
                />
              </div>
              <div>
                <Label htmlFor="therapeutic_approach">Abordagem Terapêutica</Label>
                <Select
                  value={newProfessional.therapeutic_approach}
                  onValueChange={(value) => setNewProfessional(prev => ({ ...prev, therapeutic_approach: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a abordagem" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Terapia Cognitivo-Comportamental">Terapia Cognitivo-Comportamental</SelectItem>
                    <SelectItem value="Psicanálise">Psicanálise</SelectItem>
                    <SelectItem value="Terapia Humanística">Terapia Humanística</SelectItem>
                    <SelectItem value="Terapia Gestalt">Terapia Gestalt</SelectItem>
                    <SelectItem value="Terapia Sistêmica">Terapia Sistêmica</SelectItem>
                    <SelectItem value="Terapia Comportamental">Terapia Comportamental</SelectItem>
                    <SelectItem value="Terapia de Aceitação e Compromisso">Terapia de Aceitação e Compromisso</SelectItem>
                    <SelectItem value="Terapia Breve">Terapia Breve</SelectItem>
                    <SelectItem value="Neuropsicologia">Neuropsicologia</SelectItem>
                    <SelectItem value="Psicologia Analítica">Psicologia Analítica</SelectItem>
                    <SelectItem value="Terapia do Esquema">Terapia do Esquema</SelectItem>
                    <SelectItem value="Hipnoterapia">Hipnoterapia</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="experience">Experiência</Label>
                <Input
                  id="experience"
                  value={newProfessional.experience}
                  onChange={(e) => setNewProfessional(prev => ({ ...prev, experience: e.target.value }))}
                  placeholder="Ex: Formado em 2020, 5 anos de experiência"
                />
              </div>
              <div>
                <Label htmlFor="description">Descrição Profissional</Label>
                <Textarea
                  id="description"
                  value={newProfessional.description}
                  onChange={(e) => setNewProfessional(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Descreva sua experiência, áreas de atuação, etc."
                  rows={3}
                />
              </div>
              <div>
                <Label htmlFor="address">Endereço</Label>
                <Textarea
                  id="address"
                  value={newProfessional.address}
                  onChange={(e) => setNewProfessional(prev => ({ ...prev, address: e.target.value }))}
                  placeholder="Endereço completo"
                  rows={2}
                />
              </div>
            </div>
          </div>

          <DialogFooter className="mt-6">
            <Button
              variant="outline"
              onClick={() => {
                setIsCreateDialogOpen(false);
                setNewProfessional({
                  name: '',
                  email: '',
                  password: '',
                  specialty: '',
                  crp: '',
                  phone: '',
                  cpf: '',
                  gender: '',
                  therapeutic_approach: '',
                  experience: '',
                  description: '',
                  address: ''
                });
              }}
            >
              Cancelar
            </Button>
            <Button
              onClick={async () => {
                try {
                  if (!newProfessional.name || !newProfessional.email || !newProfessional.password || !newProfessional.specialty) {
                    toast({
                      title: "Erro",
                      description: "Preencha todos os campos obrigatórios (*)",
                      variant: "destructive",
                    });
                    return;
                  }

                  const response = await fetch('/api/professionals/register', {
                    method: 'POST',
                    headers: {
                      'Content-Type': 'application/json',
                    },
                    credentials: 'include',
                    body: JSON.stringify(newProfessional),
                  });

                  if (response.ok) {
                    toast({
                      title: "Sucesso",
                      description: "Profissional cadastrado com sucesso!",
                    });
                    setIsCreateDialogOpen(false);
                    setNewProfessional({
                      name: '',
                      email: '',
                      password: '',
                      specialty: '',
                      crp: '',
                      phone: '',
                      cpf: '',
                      gender: '',
                      therapeutic_approach: '',
                      experience: '',
                      description: '',
                      address: ''
                    });
                    refetch();
                  } else {
                    const error = await response.json();
                    toast({
                      title: "Erro",
                      description: error.error || "Erro ao cadastrar profissional",
                      variant: "destructive",
                    });
                  }
                } catch (error) {
                  toast({
                    title: "Erro",
                    description: "Erro de conexão. Tente novamente.",
                    variant: "destructive",
                  });
                }
              }}
              className="bg-purple-600 hover:bg-purple-700"
            >
              Cadastrar Profissional
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </Card>
  );
};

export default AdminProfessionals;
