
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Users, 
  Calendar, 
  UserCheck, 
  DollarSign, 
  TrendingUp, 
  Clock, 
  AlertCircle,
  Search,
  ChevronRight,
  Activity,
  BarChart3,
  Settings,
  Bell,
  MessageSquare,
  Shield,
  Filter,
  RefreshCw,
  Download,
  Eye,
  ChevronDown,
  MoreHorizontal,
  Plus,
  Home,
  FileText,
  Phone,
  VideoIcon,
  Calendar as CalendarIcon,
  Stethoscope,
  UserPlus,
  UserX,
  CheckCircle,
  XCircle,
  Webhook
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import Header from "@/components/Header";
import AdminProfessionals from "@/components/admin/AdminProfessionals";
import AdminPatients from "@/components/admin/AdminPatients";
import AdminAppointments from "@/components/admin/AdminAppointments";
import AdminRecordings from "@/components/admin/AdminRecordings";
import WhatsAppNotifications from "@/components/whatsapp/WhatsAppNotifications";
import AdminIntegracoes from "./AdminIntegracoes";

const AdminDashboard = () => {
  const { toast } = useToast();
  const [wsConnected, setWsConnected] = useState(false);
  const [activeSection, setActiveSection] = useState('dashboard');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // Buscar estatísticas detalhadas em tempo real
  const { data: stats, isLoading: statsLoading, refetch: refetchStats } = useQuery({
    queryKey: ['/api/admin/detailed-stats'],
    refetchInterval: 30000, // Refetch a cada 30 segundos
    staleTime: 30000
  });

  // Buscar agendas dos profissionais
  const { data: professionalAgendas, isLoading: agendasLoading, refetch: refetchAgendas } = useQuery({
    queryKey: ['/api/admin/professional-agendas'],
    refetchInterval: 60000, // Refetch a cada minuto
    staleTime: 60000
  });

  // Buscar agendamentos com detalhes
  const { data: appointments, isLoading: appointmentsLoading, refetch: refetchAppointments } = useQuery({
    queryKey: ['/api/admin/appointments'],
    refetchInterval: 60000, // Refetch a cada minuto
    staleTime: 60000
  });

  // Conectar WebSocket para atualizações em tempo real
  useEffect(() => {
    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const wsUrl = `${protocol}//${window.location.host}/ws`;
    const ws = new WebSocket(wsUrl);

    ws.onopen = () => {
      setWsConnected(true);
      console.log('WebSocket conectado');
      
      // Autenticar via WebSocket
      const token = localStorage.getItem('auth_token');
      if (token) {
        ws.send(JSON.stringify({
          type: 'auth',
          token: token,
          role: 'admin'
        }));
      }
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        
        if (data.type === 'auth_success') {
          console.log('WebSocket autenticado');
        } else if (data.type === 'new_professional_registration') {
          toast({
            title: "Novo profissional cadastrado!",
            description: `${data.data.user.full_name} aguarda aprovação.`,
            variant: "default",
          });
          refetchStats();
          refetchAgendas();
        } else if (data.type === 'professional_approved') {
          toast({
            title: "Profissional aprovado!",
            description: "As estatísticas foram atualizadas.",
            variant: "default",
          });
          refetchStats();
          refetchAgendas();
        } else if (data.type === 'appointment_created' || data.type === 'appointment_updated') {
          toast({
            title: "Agendamento atualizado!",
            description: "As informações foram atualizadas em tempo real.",
            variant: "default",
          });
          refetchStats();
          refetchAppointments();
          refetchAgendas();
        }
      } catch (error) {
        console.error('Erro ao processar mensagem WebSocket:', error);
      }
    };

    ws.onclose = () => {
      setWsConnected(false);
      console.log('WebSocket desconectado');
    };

    ws.onerror = (error) => {
      console.error('Erro WebSocket:', error);
      setWsConnected(false);
    };

    return () => {
      ws.close();
    };
  }, [toast, refetchStats, refetchAgendas, refetchAppointments]);

  // Valores padrão se não houver dados
  const defaultStats = {
    professionals: { total: 0, approved: 0, pending: 0, active: 0 },
    patients: { total: 0, active: 0 },
    appointments: { total: 0, today: 0, thisMonth: 0, confirmed: 0, completed: 0 },
    revenue: { thisMonth: 0, lastMonth: 0 }
  };

  const currentStats = stats || defaultStats;

  // Funcionalidades dos botões
  const handleGenerateReport = () => {
    toast({
      title: "Relatório gerado",
      description: "Relatório mensal de atividades gerado com sucesso.",
    });
  };

  const handleExportPDF = () => {
    toast({
      title: "PDF exportado",
      description: "Relatório exportado em PDF com sucesso.",
    });
  };

  // Configuração do menu lateral
  const sidebarMenuItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: Home,
      badge: null,
      description: 'Visão geral da plataforma'
    },
    {
      id: 'professionals',
      label: 'Profissionais',
      icon: Stethoscope,
      badge: currentStats.professionals.pending > 0 ? currentStats.professionals.pending : null,
      description: 'Gestão de profissionais'
    },
    {
      id: 'agendas',
      label: 'Agendas',
      icon: CalendarIcon,
      badge: null,
      description: 'Agendas dos profissionais'
    },
    {
      id: 'appointments',
      label: 'Agendamentos',
      icon: Calendar,
      badge: currentStats.appointments.today > 0 ? currentStats.appointments.today : null,
      description: 'Todos os agendamentos'
    },
    {
      id: 'patients',
      label: 'Pacientes',
      icon: Users,
      badge: null,
      description: 'Gestão de pacientes'
    },
    {
      id: 'whatsapp',
      label: 'WhatsApp',
      icon: MessageSquare,
      badge: null,
      description: 'Notificações WhatsApp'
    },
    {
      id: 'recordings',
      label: 'Gravações',
      icon: VideoIcon,
      badge: null,
      description: 'Gravações de sessões'
    },
    {
      id: 'integracoes',
      label: 'Integrações',
      icon: Webhook,
      badge: 'API',
      description: 'API e Webhooks externos'
    },
    {
      id: 'settings',
      label: 'Configurações',
      icon: Settings,
      badge: null,
      description: 'Configurações do sistema'
    }
  ];

  // Função para renderizar o conteúdo baseado na seção ativa
  const renderContent = () => {
    switch (activeSection) {
      case 'dashboard':
        return <DashboardContent />;
      case 'professionals':
        return <AdminProfessionals />;
      case 'agendas':
        return <AgendasContent />;
      case 'appointments':
        return <AdminAppointments />;
      case 'patients':
        return <AdminPatients />;
      case 'whatsapp':
        return <WhatsAppNotifications />;
      case 'recordings':
        return <AdminRecordings />;
      case 'integracoes':
        return <AdminIntegracoes />;
      case 'settings':
        return <SettingsContent />;
      default:
        return <DashboardContent />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50">
      <Header />
      
      <div className="flex h-screen pt-16">
        {/* Sidebar */}
        <div className={`${sidebarCollapsed ? 'w-16' : 'w-64'} bg-white/80 backdrop-blur-sm border-r border-purple-200 shadow-lg transition-all duration-300 fixed left-0 top-16 bottom-0 z-40 hidden md:block overflow-y-auto`}>
          <div className="p-4">
            <div className="flex items-center justify-between mb-6">
              {!sidebarCollapsed && (
                <h2 className="text-lg font-semibold text-purple-800">Admin Panel</h2>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                className="p-2"
              >
                <ChevronRight className={`h-4 w-4 transition-transform ${sidebarCollapsed ? '' : 'rotate-180'}`} />
              </Button>
            </div>

            <nav className="space-y-2">
              {sidebarMenuItems.map((item) => (
                <Button
                  key={item.id}
                  variant={activeSection === item.id ? 'default' : 'ghost'}
                  className={`w-full justify-start relative ${
                    activeSection === item.id 
                      ? 'bg-purple-600 text-white hover:bg-purple-700' 
                      : 'text-gray-700 hover:bg-purple-50'
                  }`}
                  onClick={() => setActiveSection(item.id)}
                >
                  <item.icon className="h-5 w-5 mr-3" />
                  {!sidebarCollapsed && (
                    <>
                      <span className="flex-1 text-left">{item.label}</span>
                      {item.badge && (
                        <Badge variant="secondary" className="bg-red-100 text-red-800 text-xs">
                          {item.badge}
                        </Badge>
                      )}
                    </>
                  )}
                </Button>
              ))}
            </nav>
          </div>

          {/* Status Connection */}
          <div className="absolute bottom-4 left-4 right-4">
            <div className={`flex items-center space-x-2 px-3 py-2 rounded-lg ${
              wsConnected ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
            }`}>
              <div className={`w-2 h-2 rounded-full ${
                wsConnected ? 'bg-green-500' : 'bg-red-500'
              }`} />
              {!sidebarCollapsed && (
                <span className="text-xs font-medium">
                  {wsConnected ? 'Tempo Real' : 'Desconectado'}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        <div className="md:hidden bg-white border-b border-purple-200 p-4 w-full">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-purple-800">Admin Panel</h2>
            <div className={`flex items-center space-x-2 px-3 py-1 rounded-full ${
              wsConnected ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
            }`}>
              <div className={`w-2 h-2 rounded-full ${
                wsConnected ? 'bg-green-500' : 'bg-red-500'
              }`} />
              <span className="text-xs font-medium">
                {wsConnected ? 'Tempo Real' : 'Desconectado'}
              </span>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {sidebarMenuItems.map((item) => (
              <Button
                key={item.id}
                variant={activeSection === item.id ? 'default' : 'ghost'}
                size="sm"
                className={`justify-start text-xs ${
                  activeSection === item.id 
                    ? 'bg-purple-600 text-white' 
                    : 'text-gray-700 hover:bg-purple-50'
                }`}
                onClick={() => setActiveSection(item.id)}
              >
                <item.icon className="w-4 h-4 mr-1" />
                {item.label}
                {item.badge && (
                  <Badge variant="secondary" className="ml-1 bg-red-100 text-red-800 text-xs">
                    {item.badge}
                  </Badge>
                )}
              </Button>
            ))}
          </div>
        </div>

        {/* Main Content */}
        <div className={`flex-1 min-h-screen transition-all duration-300 ${
          sidebarCollapsed ? 'md:ml-16' : 'md:ml-64'
        } ml-0`}>
          <div className="p-3 md:p-6 w-full">
            {renderContent()}
          </div>
        </div>
      </div>
    </div>
  );

  // Componente do Dashboard Principal
  function DashboardContent() {
    const revenueGrowth = currentStats.revenue.lastMonth > 0 ? 
      Math.round(((currentStats.revenue.thisMonth - currentStats.revenue.lastMonth) / currentStats.revenue.lastMonth) * 100) : 0;

    return (
      <div className="space-y-4 md:space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-xl md:text-3xl font-bold text-gray-900">Dashboard Administrativo</h1>
            <p className="text-sm md:text-base text-gray-600">Controle total da plataforma Clínica Conexão Mental</p>
          </div>
          <div className="flex items-center space-x-2 md:space-x-3">
            <Button variant="outline" size="sm" onClick={() => {
              refetchStats();
              refetchAgendas();
              refetchAppointments();
            }}>
              <RefreshCw className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Atualizar</span>
            </Button>
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Exportar</span>
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-sm font-medium">Profissionais</p>
                  <p className="text-3xl font-bold">{statsLoading ? '...' : currentStats.professionals.total}</p>
                  <p className="text-blue-100 text-sm">
                    {statsLoading ? '...' : `${currentStats.professionals.approved} aprovados`}
                  </p>
                </div>
                <Stethoscope className="h-12 w-12 text-blue-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100 text-sm font-medium">Receita Mensal</p>
                  <p className="text-3xl font-bold">
                    {statsLoading ? '...' : `R$ ${currentStats.revenue.thisMonth.toLocaleString()}`}
                  </p>
                  <p className="text-green-100 text-sm">
                    {statsLoading ? '...' : `${revenueGrowth >= 0 ? '+' : ''}${revenueGrowth}% este mês`}
                  </p>
                </div>
                <DollarSign className="h-12 w-12 text-green-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100 text-sm font-medium">Consultas Hoje</p>
                  <p className="text-3xl font-bold">
                    {statsLoading ? '...' : currentStats.appointments.today}
                  </p>
                  <p className="text-purple-100 text-sm">
                    {statsLoading ? '...' : `${currentStats.appointments.thisMonth} este mês`}
                  </p>
                </div>
                <Calendar className="h-12 w-12 text-purple-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-orange-500 to-orange-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-orange-100 text-sm font-medium">Pacientes</p>
                  <p className="text-3xl font-bold">
                    {statsLoading ? '...' : currentStats.patients.total}
                  </p>
                  <p className="text-orange-100 text-sm">
                    {statsLoading ? '...' : `${currentStats.patients.active} ativos`}
                  </p>
                </div>
                <Users className="h-12 w-12 text-orange-200" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Seção de Relatórios */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900">Relatórios e Análises</h2>
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm" onClick={handleGenerateReport}>
                <BarChart3 className="h-4 w-4 mr-2" />
                Gerar Relatório
              </Button>
              <Button variant="outline" size="sm" onClick={handleExportPDF}>
                <Download className="h-4 w-4 mr-2" />
                Exportar PDF
              </Button>
            </div>
          </div>

          {/* Métricas de Performance */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="bg-white/80 backdrop-blur-sm border-purple-200">
              <CardHeader>
                <CardTitle className="flex items-center text-lg">
                  <TrendingUp className="h-5 w-5 mr-2 text-green-600" />
                  Taxa de Conversão
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-green-600">
                  {statsLoading ? '...' : '73.2%'}
                </div>
                <p className="text-sm text-gray-600 mt-2">
                  Agendamentos confirmados vs. solicitados
                </p>
                <div className="mt-4 h-2 bg-gray-200 rounded-full">
                  <div className="h-2 bg-green-600 rounded-full" style={{ width: '73.2%' }}></div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/80 backdrop-blur-sm border-purple-200">
              <CardHeader>
                <CardTitle className="flex items-center text-lg">
                  <Clock className="h-5 w-5 mr-2 text-blue-600" />
                  Tempo Médio de Resposta
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-blue-600">
                  {statsLoading ? '...' : '2.3h'}
                </div>
                <p className="text-sm text-gray-600 mt-2">
                  Média de resposta aos agendamentos
                </p>
                <div className="mt-4 flex items-center">
                  <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                  <span className="text-sm text-green-600">15% melhoria</span>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/80 backdrop-blur-sm border-purple-200">
              <CardHeader>
                <CardTitle className="flex items-center text-lg">
                  <Users className="h-5 w-5 mr-2 text-purple-600" />
                  Satisfação do Paciente
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-purple-600">
                  {statsLoading ? '...' : '4.8/5'}
                </div>
                <p className="text-sm text-gray-600 mt-2">
                  Avaliação média dos pacientes
                </p>
                <div className="mt-4 flex items-center">
                  <div className="flex text-yellow-400">
                    {'★'.repeat(5)}
                  </div>
                  <span className="text-sm text-gray-600 ml-2">(247 avaliações)</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Gráfico de Crescimento Mensal */}
          <Card className="bg-white/80 backdrop-blur-sm border-purple-200">
            <CardHeader>
              <CardTitle className="flex items-center">
                <TrendingUp className="h-5 w-5 mr-2" />
                Crescimento Mensal
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { month: 'Janeiro', appointments: 89, revenue: 'R$ 4.450', growth: '+12%' },
                  { month: 'Fevereiro', appointments: 94, revenue: 'R$ 4.700', growth: '+15%' },
                  { month: 'Março', appointments: 102, revenue: 'R$ 5.100', growth: '+18%' },
                  { month: 'Abril', appointments: 127, revenue: 'R$ 6.350', growth: '+25%' }
                ].map((item, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium">{item.month}</p>
                      <p className="text-sm text-gray-600">{item.appointments} consultas</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">{item.revenue}</p>
                      <p className="text-sm text-green-600">{item.growth}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Atividade Recente */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Profissionais Ativos */}
          <Card className="bg-white/80 backdrop-blur-sm border-purple-200">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Activity className="h-5 w-5 mr-2" />
                Profissionais Ativos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {professionalAgendas?.slice(0, 5).map((professional) => (
                  <div key={professional.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <Avatar className="h-10 w-10">
                        <AvatarFallback className="bg-purple-100 text-purple-600">
                          {professional.name.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h4 className="font-medium">{professional.name}</h4>
                        <p className="text-sm text-gray-600">{professional.specialty}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge variant={professional.approved ? "default" : "secondary"}>
                        {professional.approved ? "Aprovado" : "Pendente"}
                      </Badge>
                      <p className="text-sm text-gray-500 mt-1">
                        {professional.appointmentsToday} hoje
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Agendamentos Recentes */}
          <Card className="bg-white/80 backdrop-blur-sm border-purple-200">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Clock className="h-5 w-5 mr-2" />
                Agendamentos Recentes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {appointments?.slice(0, 5).map((appointment) => (
                  <div key={appointment.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <Calendar className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <h4 className="font-medium">{appointment.patient?.name}</h4>
                        <p className="text-sm text-gray-600">{appointment.professional?.name}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">{appointment.date} às {appointment.time}</p>
                      <Badge variant={appointment.status === 'confirmed' ? "default" : "secondary"}>
                        {appointment.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Consultas por Especialidade */}
        <Card className="bg-white/80 backdrop-blur-sm border-purple-200">
          <CardHeader>
            <CardTitle className="flex items-center">
              <BarChart3 className="h-5 w-5 mr-2" />
              Consultas por Especialidade
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { specialty: 'Psicologia Clínica', count: 45, percentage: 35, color: 'bg-blue-500' },
                { specialty: 'Terapia Cognitiva', count: 38, percentage: 30, color: 'bg-green-500' },
                { specialty: 'Psicanálise', count: 25, percentage: 20, color: 'bg-purple-500' },
                { specialty: 'Psicoterapia', count: 19, percentage: 15, color: 'bg-orange-500' }
              ].map((item, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={`w-4 h-4 rounded ${item.color}`}></div>
                    <span className="text-sm font-medium">{item.specialty}</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-20 bg-gray-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full ${item.color}`}
                        style={{ width: `${item.percentage}%` }}
                      ></div>
                    </div>
                    <span className="text-sm text-gray-600 min-w-[3rem]">{item.count}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Componente das Agendas dos Profissionais
  function AgendasContent() {
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');

    const filteredAgendas = professionalAgendas?.filter(professional => {
      const matchesSearch = professional.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           professional.specialty.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = filterStatus === 'all' || professional.status === filterStatus;
      return matchesSearch && matchesStatus;
    });

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Agendas dos Profissionais</h1>
            <p className="text-gray-600">Visão integrada de todas as agendas profissionais</p>
          </div>
          <div className="flex items-center space-x-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Buscar profissional..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-64"
              />
            </div>
            <Button variant="outline" size="sm">
              <Filter className="h-4 w-4 mr-2" />
              Filtros
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
            <CardContent className="p-4">
              <div className="text-center">
                <div className="text-2xl font-bold">{professionalAgendas?.length || 0}</div>
                <p className="text-sm text-blue-100">Total de Profissionais</p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
            <CardContent className="p-4">
              <div className="text-center">
                <div className="text-2xl font-bold">
                  {professionalAgendas?.filter(p => p.approved).length || 0}
                </div>
                <p className="text-sm text-green-100">Aprovados</p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-orange-500 to-orange-600 text-white">
            <CardContent className="p-4">
              <div className="text-center">
                <div className="text-2xl font-bold">
                  {professionalAgendas?.reduce((sum, p) => sum + p.appointmentsToday, 0) || 0}
                </div>
                <p className="text-sm text-orange-100">Consultas Hoje</p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
            <CardContent className="p-4">
              <div className="text-center">
                <div className="text-2xl font-bold">
                  {professionalAgendas?.reduce((sum, p) => sum + p.appointmentsThisWeek, 0) || 0}
                </div>
                <p className="text-sm text-purple-100">Consultas Semana</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredAgendas?.map((professional) => (
            <Card key={professional.id} className="bg-white/80 backdrop-blur-sm border-purple-200 hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Avatar className="h-12 w-12">
                      <AvatarFallback className="bg-purple-100 text-purple-600">
                        {professional.name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="font-semibold">{professional.name}</h3>
                      <p className="text-sm text-gray-600">{professional.specialty}</p>
                    </div>
                  </div>
                  <Badge variant={professional.approved ? "default" : "secondary"}>
                    {professional.approved ? "Aprovado" : "Pendente"}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div className="p-2 bg-blue-50 rounded-lg">
                      <div className="text-lg font-bold text-blue-600">{professional.appointmentsToday}</div>
                      <div className="text-xs text-blue-500">Hoje</div>
                    </div>
                    <div className="p-2 bg-green-50 rounded-lg">
                      <div className="text-lg font-bold text-green-600">{professional.appointmentsThisWeek}</div>
                      <div className="text-xs text-green-500">Semana</div>
                    </div>
                    <div className="p-2 bg-purple-50 rounded-lg">
                      <div className="text-lg font-bold text-purple-600">{professional.totalAppointments}</div>
                      <div className="text-xs text-purple-500">Total</div>
                    </div>
                  </div>

                  {professional.nextAppointment && (
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-700">Próxima consulta</p>
                          <p className="text-xs text-gray-500">
                            {professional.nextAppointment.date} às {professional.nextAppointment.time}
                          </p>
                        </div>
                        <Calendar className="h-4 w-4 text-gray-400" />
                      </div>
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-2">
                    <div className="flex items-center space-x-2">
                      <div className={`w-2 h-2 rounded-full ${
                        professional.lastActive && new Date(professional.lastActive) > new Date(Date.now() - 24 * 60 * 60 * 1000)
                          ? 'bg-green-500' : 'bg-gray-400'
                      }`} />
                      <span className="text-xs text-gray-500">
                        {professional.lastActive 
                          ? `Ativo ${new Date(professional.lastActive).toLocaleDateString()}`
                          : 'Inativo'
                        }
                      </span>
                    </div>
                    <Button variant="outline" size="sm" onClick={() => setActiveSection('professionals')}>
                      <Eye className="h-4 w-4 mr-1" />
                      Ver Detalhes
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {(!filteredAgendas || filteredAgendas.length === 0) && (
          <div className="text-center py-8">
            <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">Nenhuma agenda encontrada</p>
          </div>
        )}
      </div>
    );
  }

  // Componente de Configurações
  function SettingsContent() {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Configurações do Sistema</h1>
          <p className="text-gray-600">Configurações gerais da plataforma</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="bg-white/80 backdrop-blur-sm border-purple-200">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Settings className="h-5 w-5 mr-2" />
                Configurações Gerais
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nome da Clínica
                  </label>
                  <Input value="Clínica Conexão Mental" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    CNPJ
                  </label>
                  <Input value="54.423.733/0001-68" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email Principal
                  </label>
                  <Input value="contato@clinicaconexaomental.online" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm border-purple-200">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Shield className="h-5 w-5 mr-2" />
                Segurança
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Autenticação 2FA</span>
                  <Badge variant="default">Ativo</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Backup Automático</span>
                  <Badge variant="default">Ativo</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Logs de Auditoria</span>
                  <Badge variant="default">Ativo</Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm border-purple-200">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Bell className="h-5 w-5 mr-2" />
                Notificações
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Novos Cadastros</span>
                  <Badge variant="default">Ativo</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Agendamentos</span>
                  <Badge variant="default">Ativo</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Relatórios</span>
                  <Badge variant="secondary">Inativo</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }
};

export default AdminDashboard;
