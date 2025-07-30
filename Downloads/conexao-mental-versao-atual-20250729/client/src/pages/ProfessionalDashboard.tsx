import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import GoogleCalendarIntegration from "@/components/GoogleCalendarIntegration";
import ProfessionalCalendar from "@/components/ProfessionalCalendar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  LayoutDashboard, 
  Calendar, 
  Users, 
  MessageSquare, 
  Database, 
  DollarSign, 
  TrendingUp, 
  UserPlus, 
  Settings, 
  LogOut,
  Bell,
  Search,
  Plus,
  Eye,
  ChevronRight,
  User,
  Mail,
  Phone,
  MapPin,
  Award,
  Edit,
  Save,
  X,
  Camera,
  Star,
  BookOpen,
  Briefcase,
  Clock
} from "lucide-react";

const logo = "/lovable-uploads/1c4653a3-9aa5-49a8-8b1a-7e182d51255e.png";

interface SidebarItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
}

const sidebarItems: SidebarItem[] = [
  { id: 'painel', label: 'Painel', icon: LayoutDashboard },
  { id: 'agenda', label: 'Agenda', icon: Calendar, badge: '3' },
  { id: 'agendamento', label: 'Agendamento', icon: Clock },
  { id: 'atendimentos', label: 'Atendimentos', icon: Users, badge: '12' },
  { id: 'contato', label: 'Contato', icon: MessageSquare },
  { id: 'crm', label: 'CRM', icon: Database },
  { id: 'financeiro', label: 'Financeiro', icon: DollarSign },
  { id: 'assinatura', label: 'Assinatura', icon: Award },
  { id: 'marketing', label: 'Marketing', icon: TrendingUp },
  { id: 'afiliados', label: 'Afiliados', icon: UserPlus },
  { id: 'configuracao', label: 'Configuração do Perfil', icon: Settings },
];

const ProfessionalDashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { signOut, user } = useAuth();
  const [activeSection, setActiveSection] = useState('painel');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [wsConnected, setWsConnected] = useState(false);
  const [marketingSubSection, setMarketingSubSection] = useState('campaigns');

  // Buscar estatísticas do dashboard profissional
  const { data: stats, isLoading: statsLoading, refetch: refetchStats } = useQuery({
    queryKey: ['/api/professionals/dashboard-stats'],
    refetchInterval: 60000, // Refetch a cada minuto
    staleTime: 60000
  });

  // Rastrear atividade do profissional
  const trackActivity = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      if (!token) return;

      await fetch('/api/professionals/activity', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
    } catch (error) {
      console.error('Erro ao rastrear atividade:', error);
    }
  };

  // Conectar WebSocket para sincronização em tempo real
  useEffect(() => {
    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const wsUrl = `${protocol}//${window.location.host}/ws`;
    const ws = new WebSocket(wsUrl);

    ws.onopen = () => {
      setWsConnected(true);
      console.log('WebSocket conectado (Profissional)');
      
      // Autenticar via WebSocket
      const token = localStorage.getItem('auth_token');
      if (token) {
        ws.send(JSON.stringify({
          type: 'auth',
          token: token,
          role: 'professional'
        }));
      }
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        
        if (data.type === 'auth_success') {
          console.log('WebSocket autenticado (Profissional)');
          // Rastrear atividade quando conectado
          trackActivity();
        }
      } catch (error) {
        console.error('Erro ao processar mensagem WebSocket:', error);
      }
    };

    ws.onclose = () => {
      setWsConnected(false);
      console.log('WebSocket desconectado (Profissional)');
    };

    ws.onerror = (error) => {
      console.error('Erro WebSocket:', error);
      setWsConnected(false);
    };

    return () => {
      ws.close();
    };
  }, []);

  // Rastrear atividade periodicamente
  useEffect(() => {
    const interval = setInterval(trackActivity, 5 * 60 * 1000); // A cada 5 minutos
    return () => clearInterval(interval);
  }, []);

  // Valores padrão se não houver dados
  const defaultStats = {
    appointments: { total: 0, today: 0, thisWeek: 0, thisMonth: 0, confirmed: 0, completed: 0, pending: 0 },
    revenue: { thisMonth: 0, lastMonth: 0 },
    rating: 0,
    totalConsultations: 0,
    availableHours: 0
  };

  const currentStats = stats || defaultStats;

  const handleLogout = async () => {
    try {
      await signOut();
      navigate('/login-profissional');
    } catch (error) {
      toast({
        title: "Erro ao sair",
        description: "Ocorreu um erro ao fazer logout.",
        variant: "destructive",
      });
    }
  };

  // AgendaContent - Definido dentro do componente
  const AgendaContent = () => {
    console.log('AgendaContent renderizado - verificando re-renderização desnecessária');
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [selectedWeek, setSelectedWeek] = useState(new Date());
    const [viewMode, setViewMode] = useState<'day' | 'week' | 'month'>('week');
    const [availabilitySettings, setAvailabilitySettings] = useState(() => {
      try {
        const saved = localStorage.getItem('professionalAvailabilitySettings');
        return saved ? JSON.parse(saved) : {
          monday: { enabled: true, start: '09:00', end: '17:00' },
          tuesday: { enabled: true, start: '09:00', end: '17:00' },
          wednesday: { enabled: true, start: '09:00', end: '17:00' },
          thursday: { enabled: true, start: '09:00', end: '17:00' },
          friday: { enabled: true, start: '09:00', end: '17:00' },
          saturday: { enabled: false, start: '09:00', end: '13:00' },
          sunday: { enabled: false, start: '09:00', end: '13:00' },
        };
      } catch {
        return {
          monday: { enabled: true, start: '09:00', end: '17:00' },
          tuesday: { enabled: true, start: '09:00', end: '17:00' },
          wednesday: { enabled: true, start: '09:00', end: '17:00' },
          thursday: { enabled: true, start: '09:00', end: '17:00' },
          friday: { enabled: true, start: '09:00', end: '17:00' },
          saturday: { enabled: false, start: '09:00', end: '13:00' },
          sunday: { enabled: false, start: '09:00', end: '13:00' },
        };
      }
    });
    const [specificDateSettings, setSpecificDateSettings] = useState<{[key: string]: string[]}>({});
    const [selectedDateForSettings, setSelectedDateForSettings] = useState(() => {
      // Manter a data selecionada no localStorage para persistir entre re-renderizações
      const savedDate = localStorage.getItem('professionalSelectedDateForSettings');
      return savedDate ? new Date(savedDate) : new Date();
    });
    const [activeTab, setActiveTab] = useState<'general' | 'specific'>('specific');
    const [agendaSubTab, setAgendaSubTab] = useState<'calendar' | 'availability'>('availability');
    
    // Log para monitorar mudanças na aba
    const originalSetAgendaSubTab = setAgendaSubTab;
    const setAgendaSubTabWithLog = (tab: 'calendar' | 'availability') => {
      console.log('MUDANÇA DE ABA DETECTADA:', tab);
      console.log('Data selecionada atual:', selectedDateForSettings.toLocaleDateString('pt-BR'));
      originalSetAgendaSubTab(tab);
    };
    const setAgendaSubTabRef = setAgendaSubTabWithLog;
    const [editingTimeSlot, setEditingTimeSlot] = useState<string | null>(null);
    const [customTimeSlots, setCustomTimeSlots] = useState<{[key: string]: string[]}>(() => {
      try {
        const saved = localStorage.getItem('professionalCustomTimeSlots');
        return saved ? JSON.parse(saved) : {};
      } catch {
        return {};
      }
    });

    const daysOfWeek = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
    const dayLabels = ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado', 'Domingo'];

    const generateTimeSlots = () => {
      const slots = [];
      for (let hour = 8; hour < 20; hour++) {
        for (let minute = 0; minute < 60; minute += 30) {
          const time = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
          slots.push(time);
        }
      }
      return slots;
    };

    const timeSlots = generateTimeSlots();

    // Buscar agendamentos reais da API
    const { data: realAppointments = [], isLoading: appointmentsLoading, refetch: refetchAppointments } = useQuery({
      queryKey: ['/api/professionals/calendar-appointments'],
      refetchInterval: 30000, // Atualizar a cada 30 segundos
      staleTime: 30000
    });

    // Buscar horários de disponibilidade salvos
    const { data: availabilityData, refetch: refetchAvailability } = useQuery({
      queryKey: ['/api/professionals/availability'],
      staleTime: 300000 // 5 minutos
    });

    // Salvar horários de disponibilidade - APENAS QUANDO EXPLICITAMENTE SOLICITADO
    const saveAvailabilityMutation = useMutation({
      mutationFn: async (availability: any) => {
        console.log("🚨 SALVAMENTO INICIADO - Usuário clicou em salvar explicitamente");
        const token = localStorage.getItem('auth_token');
        const response = await fetch('/api/professionals/availability', {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': token ? `Bearer ${token}` : '',
          },
          credentials: 'include', // Incluir cookies de sessão
          body: JSON.stringify({ availability })
        });
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Erro ao salvar disponibilidade');
        }
        
        return response.json();
      },
      onSuccess: () => {
        console.log("✅ SALVAMENTO MANUAL CONCLUÍDO - Dados enviados para servidor");
        toast({
          title: "Horários salvos!",
          description: "Seus horários de disponibilidade foram atualizados com sucesso.",
        });
        refetchAvailability();
      },
      onError: (error: any) => {
        console.error('❌ ERRO NO SALVAMENTO MANUAL:', error);
        toast({
          title: "Erro ao salvar",
          description: error.message || "Não foi possível salvar os horários. Tente novamente.",
          variant: "destructive",
        });
      }
    });

    const updateAvailability = (day: string, field: string, value: any) => {
      const newSettings = {
        ...availabilitySettings,
        [day]: {
          ...availabilitySettings[day as keyof typeof availabilitySettings],
          [field]: value
        }
      };
      
      setAvailabilitySettings(newSettings);
      
      // REMOVIDO: Salvamento automático no localStorage
      // Agora só salva quando usuário clicar explicitamente em "Salvar"
    };

    const formatDateKey = (date: Date) => {
      return date.toISOString().split('T')[0];
    };

    const getSelectedDateTimeSlots = () => {
      const dateKey = formatDateKey(selectedDateForSettings);
      return customTimeSlots[dateKey] || [];
    };

    const addCustomTimeSlot = (timeSlot: string) => {
      console.log('🚫 addCustomTimeSlot chamado - APENAS localStorage, SEM servidor:', timeSlot);
      const dateKey = formatDateKey(selectedDateForSettings);
      console.log('dateKey:', dateKey);
      const currentSlots = customTimeSlots[dateKey] || [];
      console.log('currentSlots:', currentSlots);
      
      if (!currentSlots.includes(timeSlot)) {
        console.log('✅ Adicionando horário APENAS NO FRONT-END:', timeSlot);
        const newTimeSlots = {
          ...customTimeSlots,
          [dateKey]: [...currentSlots, timeSlot].sort()
        };
        setCustomTimeSlots(newTimeSlots);
        
        // CRÍTICO: Apenas salvar no localStorage - NUNCA no servidor automaticamente
        localStorage.setItem('professionalCustomTimeSlots', JSON.stringify(newTimeSlots));
        console.log('💾 Horário salvo APENAS no localStorage - aguardando clique em Salvar para enviar ao servidor');
        
        return true; // Retorna true se foi adicionado com sucesso
      } else {
        console.log('⚠️ Horário já existe:', timeSlot);
        return false; // Retorna false se já existe
      }
    };

    const removeCustomTimeSlot = (timeSlot: string) => {
      console.log('🚫 removeCustomTimeSlot chamado - APENAS localStorage, SEM servidor:', timeSlot);
      const dateKey = formatDateKey(selectedDateForSettings);
      const currentSlots = customTimeSlots[dateKey] || [];
      
      const newTimeSlots = {
        ...customTimeSlots,
        [dateKey]: currentSlots.filter(slot => slot !== timeSlot)
      };
      
      setCustomTimeSlots(newTimeSlots);
      
      // CRÍTICO: Apenas salvar no localStorage - NUNCA no servidor automaticamente
      localStorage.setItem('professionalCustomTimeSlots', JSON.stringify(newTimeSlots));
      console.log('💾 Horário removido APENAS no localStorage - aguardando clique em Salvar para sincronizar com servidor');
    };

    const editTimeSlot = (oldTimeSlot: string, newTimeSlot: string) => {
      const dateKey = formatDateKey(selectedDateForSettings);
      const currentSlots = customTimeSlots[dateKey] || [];
      
      const updatedSlots = currentSlots.map(slot => slot === oldTimeSlot ? newTimeSlot : slot).sort();
      
      const newTimeSlots = {
        ...customTimeSlots,
        [dateKey]: updatedSlots
      };
      
      setCustomTimeSlots(newTimeSlots);
      setEditingTimeSlot(null);
      
      // Apenas salvar no localStorage para visualização - NÃO enviar para servidor
      localStorage.setItem('professionalCustomTimeSlots', JSON.stringify(newTimeSlots));
    };

    const clearAllTimeSlotsForDate = () => {
      const dateKey = formatDateKey(selectedDateForSettings);
      const newTimeSlots = {
        ...customTimeSlots,
        [dateKey]: []
      };
      
      setCustomTimeSlots(newTimeSlots);
      
      // Apenas salvar no localStorage para visualização - NÃO enviar para servidor
      localStorage.setItem('professionalCustomTimeSlots', JSON.stringify(newTimeSlots));
    };

    const getNextAvailableHour = () => {
      const currentSlots = getSelectedDateTimeSlots().sort();
      if (currentSlots.length === 0) return '09:00';
      
      // Pegar o último horário e adicionar 30 minutos
      const lastSlot = currentSlots[currentSlots.length - 1];
      const [hours, minutes] = lastSlot.split(':').map(Number);
      
      // Calcular próximo horário (adicionar 30 minutos)
      let nextMinutes = minutes + 30;
      let nextHours = hours;
      
      if (nextMinutes >= 60) {
        nextMinutes = 0;
        nextHours += 1;
      }
      
      // Verificar se não ultrapassou o horário comercial (17:30)
      if (nextHours > 17 || (nextHours === 17 && nextMinutes > 30)) {
        // Se ultrapassou, procurar o primeiro horário disponível desde 09:00
        for (let hour = 9; hour <= 17; hour++) {
          for (let minute = 0; minute < 60; minute += 30) {
            if (hour === 17 && minute > 30) break; // Não ultrapassar 17:30
            const timeSlot = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
            if (!currentSlots.includes(timeSlot)) {
              return timeSlot;
            }
          }
        }
        return '18:00'; // Fallback se todos os horários estão ocupados
      }
      
      const nextTimeSlot = `${nextHours.toString().padStart(2, '0')}:${nextMinutes.toString().padStart(2, '0')}`;
      
      // Verificar se o próximo horário já existe, se sim, procurar o próximo disponível
      if (currentSlots.includes(nextTimeSlot)) {
        for (let hour = nextHours; hour <= 17; hour++) {
          const startMinute = (hour === nextHours) ? nextMinutes : 0;
          for (let minute = startMinute; minute < 60; minute += 30) {
            if (hour === 17 && minute > 30) break;
            const timeSlot = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
            if (!currentSlots.includes(timeSlot)) {
              return timeSlot;
            }
          }
        }
        return '18:00';
      }
      
      return nextTimeSlot;
    };



    const saveAvailabilitySettings = () => {
      // Simular salvamento no localStorage por enquanto
      if (activeTab === 'general') {
        localStorage.setItem('professionalAvailabilitySettings', JSON.stringify(availabilitySettings));
        toast({
          title: "Disponibilidades salvas",
          description: "Seus horários padrão foram atualizados com sucesso.",
        });
      } else {
        localStorage.setItem('professionalCustomTimeSlots', JSON.stringify(customTimeSlots));
        toast({
          title: "Disponibilidades salvas",
          description: `Horários para ${selectedDateForSettings.toLocaleDateString('pt-BR')} foram salvos.`,
        });
      }
    };

    const saveAndExit = (e?: React.MouseEvent) => {
      e?.preventDefault();
      e?.stopPropagation();
      
      // Salvar todas as configurações
      localStorage.setItem('professionalAvailabilitySettings', JSON.stringify(availabilitySettings));
      localStorage.setItem('professionalCustomTimeSlots', JSON.stringify(customTimeSlots));
      
      toast({
        title: "Configurações salvas",
        description: "Todas as disponibilidades foram salvas com sucesso.",
      });
    };

    // Função para sincronizar dados com o calendário principal
    const syncWithMainCalendar = () => {
      // Disparar evento personalizado para notificar outras partes da aplicação
      window.dispatchEvent(new CustomEvent('availabilityUpdated', {
        detail: {
          general: availabilitySettings,
          specific: customTimeSlots
        }
      }));
    };

    // Sincronizar sempre que houver mudanças - REMOVIDO TEMPORARIAMENTE PARA DEBUG
    // useEffect(() => {
    //   syncWithMainCalendar();
    // }, [availabilitySettings, customTimeSlots]);

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">Agenda Profissional</h2>
          <div className="flex space-x-2">
            <Button
              variant={viewMode === 'day' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('day')}
              className={viewMode === 'day' ? 'bg-purple-600 hover:bg-purple-700' : ''}
            >
              Dia
            </Button>
            <Button
              variant={viewMode === 'week' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('week')}
              className={viewMode === 'week' ? 'bg-purple-600 hover:bg-purple-700' : ''}
            >
              Semana
            </Button>
            <Button
              variant={viewMode === 'month' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('month')}
              className={viewMode === 'month' ? 'bg-purple-600 hover:bg-purple-700' : ''}
            >
              Mês
            </Button>
          </div>
        </div>

        {/* Abas de Funcionalidades da Agenda */}
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8">
            <button
              onClick={() => setAgendaSubTabRef('calendar')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                agendaSubTab === 'calendar'
                  ? 'border-purple-500 text-purple-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Calendário
            </button>
            <button
              onClick={() => setAgendaSubTabRef('availability')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                agendaSubTab === 'availability'
                  ? 'border-purple-500 text-purple-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Disponibilidade de Horários
            </button>
          </nav>
        </div>

        {/* Conteúdo das Abas */}
        {agendaSubTab === 'calendar' && (
          <div className="space-y-6">
            {/* Estatísticas da Agenda */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold">
                    {appointmentsLoading ? '...' : realAppointments.filter(a => a.date === new Date().toLocaleDateString('pt-BR')).length}
                  </div>
                  <p className="text-sm text-blue-100">Consultas Hoje</p>
                </CardContent>
              </Card>
              <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold">
                    {appointmentsLoading ? '...' : realAppointments.filter(a => a.status === 'confirmado').length}
                  </div>
                  <p className="text-sm text-green-100">Confirmadas</p>
                </CardContent>
              </Card>
              <Card className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-white">
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold">
                    {appointmentsLoading ? '...' : realAppointments.filter(a => a.status === 'agendado').length}
                  </div>
                  <p className="text-sm text-yellow-100">Pendentes</p>
                </CardContent>
              </Card>
              <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold">
                    {appointmentsLoading ? '...' : Math.max(0, 40 - realAppointments.length)}h
                  </div>
                  <p className="text-sm text-purple-100">Horas Disponíveis</p>
                </CardContent>
              </Card>
            </div>
            
            {/* Calendário Profissional Completo */}
            <div className="space-y-6">
              {appointmentsLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-600"></div>
                </div>
              ) : (
                <ProfessionalCalendar 
                  appointments={realAppointments}
                  onAppointmentClick={(appointment) => {
                    toast({
                      title: "Agendamento selecionado",
                      description: `Paciente: ${appointment.patientName} - ${appointment.date} às ${appointment.time}`,
                    });
                  }}
                />
              )}
            </div>
          </div>
        )}

        {/* Aba Disponibilidade de Horários */}
        {agendaSubTab === 'availability' && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Configurar Disponibilidade de Horários</CardTitle>
                <p className="text-sm text-gray-600">
                  Configure seus horários disponíveis para que os pacientes possam agendar consultas.
                </p>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {/* Apenas Datas Específicas */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Configuração de Datas Específicas</h3>
                      <div className="flex items-center space-x-4">
                        <label className="text-sm font-medium">Selecionar Data:</label>
                        <input
                          type="date"
                          value={selectedDateForSettings.toISOString().split('T')[0]}
                          onChange={(e) => {
                            const newDate = new Date(e.target.value);
                            setSelectedDateForSettings(newDate);
                            // Salvar no localStorage para persistir a data selecionada
                            localStorage.setItem('professionalSelectedDateForSettings', newDate.toISOString());
                            console.log('Data alterada para:', newDate.toLocaleDateString('pt-BR'));
                          }}
                          className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                        />
                      </div>

                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <h4 className="text-md font-medium">
                            Horários para {selectedDateForSettings.toLocaleDateString('pt-BR')}
                          </h4>
                          <div className="flex space-x-2">
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                console.log('Botão Adicionar Horário clicado');
                                const nextHour = getSelectedDateTimeSlots().length > 0 
                                  ? getNextAvailableHour() 
                                  : '09:00';
                                console.log('Próximo horário disponível:', nextHour);
                                
                                // Verificar se o horário já existe antes de adicionar
                                const currentSlots = getSelectedDateTimeSlots();
                                if (!currentSlots.includes(nextHour)) {
                                  addCustomTimeSlot(nextHour);
                                  setEditingTimeSlot(nextHour);
                                  console.log('Novo horário adicionado e entrando em modo de edição:', nextHour);
                                } else {
                                  console.log('Horário já existe, buscando próximo disponível');
                                  // Buscar o próximo horário realmente disponível
                                  let foundAvailable = false;
                                  for (let hour = 9; hour <= 17 && !foundAvailable; hour++) {
                                    for (let minute = 0; minute < 60 && !foundAvailable; minute += 30) {
                                      const testTime = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
                                      if (!currentSlots.includes(testTime)) {
                                        addCustomTimeSlot(testTime);
                                        setEditingTimeSlot(testTime);
                                        console.log('Novo horário único encontrado:', testTime);
                                        foundAvailable = true;
                                      }
                                    }
                                  }
                                  if (!foundAvailable) {
                                    console.log('Todos os horários ocupados');
                                    toast({
                                      title: "Limite atingido",
                                      description: "Todos os horários disponíveis já foram configurados para esta data.",
                                      variant: "destructive",
                                    });
                                  }
                                }
                              }}
                              className="text-xs bg-purple-600 text-white hover:bg-purple-700 border-purple-600"
                            >
                              + Adicionar Horário
                            </Button>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                clearAllTimeSlotsForDate();
                              }}
                              className="text-xs"
                            >
                              Limpar Todos
                            </Button>
                          </div>
                        </div>

                        <div className="max-h-48 overflow-y-auto border rounded-lg p-3">
                          <div className="space-y-2">
                            {getSelectedDateTimeSlots().length === 0 ? (
                              <div className="text-center py-8 text-gray-500">
                                <p className="text-sm">Nenhum horário configurado para esta data</p>
                                <p className="text-xs">Clique em "Adicionar Horário" para começar</p>
                              </div>
                            ) : (
                              getSelectedDateTimeSlots().map((timeSlot, index) => (
                                <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded border">
                                  {editingTimeSlot === timeSlot ? (
                                    <div className="flex items-center space-x-2 flex-1">
                                      <input
                                        type="time"
                                        defaultValue={timeSlot}
                                        className="px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                                        onBlur={(e) => {
                                          if (e.target.value && e.target.value !== timeSlot) {
                                            editTimeSlot(timeSlot, e.target.value);
                                          } else {
                                            setEditingTimeSlot(null);
                                          }
                                        }}
                                        onKeyPress={(e) => {
                                          if (e.key === 'Enter') {
                                            const target = e.target as HTMLInputElement;
                                            if (target.value && target.value !== timeSlot) {
                                              editTimeSlot(timeSlot, target.value);
                                            } else {
                                              setEditingTimeSlot(null);
                                            }
                                          }
                                        }}
                                        autoFocus
                                      />
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setEditingTimeSlot(null)}
                                        className="text-xs"
                                      >
                                        Cancelar
                                      </Button>
                                    </div>
                                  ) : (
                                    <>
                                      <span
                                        className="text-sm font-medium cursor-pointer hover:text-purple-600 flex-1"
                                        onClick={() => setEditingTimeSlot(timeSlot)}
                                      >
                                        {timeSlot}
                                      </span>
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => removeCustomTimeSlot(timeSlot)}
                                        className="text-xs text-red-600 hover:text-red-700 hover:bg-red-50"
                                      >
                                        Remover
                                      </Button>
                                    </>
                                  )}
                                </div>
                              ))
                            )}
                          </div>
                        </div>

                        <div className="text-xs text-gray-600">
                          {getSelectedDateTimeSlots().length} horários configurados para esta data
                        </div>
                        
                        <div className="mt-4 flex justify-end space-x-2">
                          <Button
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              console.log('Botão Salvar clicado - permanecendo na mesma tela');
                              console.log('Data atual antes de salvar:', selectedDateForSettings.toLocaleDateString('pt-BR'));
                              
                              try {
                                const currentTimeSlots = customTimeSlots;
                                
                                // Salvar no localStorage imediatamente
                                localStorage.setItem('professionalCustomTimeSlots', JSON.stringify(currentTimeSlots));
                                localStorage.setItem('professionalSelectedDateForSettings', selectedDateForSettings.toISOString());
                                
                                // Mostrar confirmação imediata
                                toast({
                                  title: "Horários salvos localmente!",
                                  description: `Horários para ${selectedDateForSettings.toLocaleDateString('pt-BR')} foram salvos.`,
                                });
                                
                                // Salvar no servidor APENAS quando usuário clicar explicitamente
                                console.log('🔥 BOTÃO SALVAR CLICADO - Enviando para servidor:', {
                                  ...availabilitySettings,
                                  customTimeSlots: currentTimeSlots
                                });
                                
                                // ESTE É O ÚNICO LOCAL ONDE DEVE ACONTECER SALVAMENTO NO SERVIDOR
                                saveAvailabilityMutation.mutate({
                                  ...availabilitySettings,
                                  customTimeSlots: currentTimeSlots
                                });
                                
                                console.log('Salvo com sucesso - data mantida:', selectedDateForSettings.toLocaleDateString('pt-BR'));
                              } catch (error) {
                                console.error('Erro ao salvar:', error);
                                toast({
                                  title: "Erro ao salvar",
                                  description: "Erro interno. Dados salvos localmente.",
                                  variant: "destructive",
                                });
                              }
                            }}
                            disabled={saveAvailabilityMutation.isPending}
                            className="bg-green-600 hover:bg-green-700 text-white disabled:opacity-50"
                          >
                            {saveAvailabilityMutation.isPending ? 'Salvando...' : 'Salvar'}
                          </Button>
                          
                          <div className="text-xs text-gray-500 flex items-center">
                            {getSelectedDateTimeSlots().length > 0 ? 
                              `${getSelectedDateTimeSlots().length} horário(s) configurado(s)` : 
                              'Nenhum horário configurado'
                            }
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    );
  };

  // AssinaturaContent - Definido dentro do componente
  const AssinaturaContent = () => {
    const [currentPlan, setCurrentPlan] = useState('premium');
    const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
    const [showCancelModal, setShowCancelModal] = useState(false);

  const handleDownloadPDF = (invoiceId: string) => {
    toast({
      title: "Download iniciado",
      description: `PDF da fatura ${invoiceId} baixado com sucesso.`,
    });
  };

    const plans = [
      {
        id: 'basic',
        name: 'Básico',
        price: { monthly: 97, yearly: 970 },
        features: [
          'Até 20 consultas por mês',
          'Agenda básica',
          'Suporte por email',
          'Relatórios simples',
          'Videoconferência básica'
        ],
        popular: false
      },
      {
        id: 'premium',
        name: 'Premium',
        price: { monthly: 197, yearly: 1970 },
        features: [
          'Consultas ilimitadas',
          'Agenda avançada com Google Calendar',
          'Suporte prioritário',
          'Relatórios detalhados',
          'Videoconferência HD',
          'CRM integrado',
          'Marketing digital',
          'Sistema de afiliados'
        ],
        popular: true
      },
      {
        id: 'enterprise',
        name: 'Empresarial',
        price: { monthly: 397, yearly: 3970 },
        features: [
          'Todos os recursos Premium',
          'Múltiplos profissionais',
          'White label',
          'API personalizada',
          'Suporte 24/7',
          'Treinamento exclusivo',
          'Consultoria especializada'
        ],
        popular: false
      }
    ];

    const currentPlanData = plans.find(p => p.id === currentPlan);
    const nextBillingDate = new Date();
    nextBillingDate.setMonth(nextBillingDate.getMonth() + (billingCycle === 'monthly' ? 1 : 12));

    const handleUpgrade = (planId: string) => {
      setCurrentPlan(planId);
      toast({
        title: "Plano atualizado",
        description: `Seu plano foi alterado para ${plans.find(p => p.id === planId)?.name} com sucesso.`,
      });
    };

    const handleCancelSubscription = () => {
      setShowCancelModal(true);
    };

    const confirmCancel = () => {
      setShowCancelModal(false);
      toast({
        title: "Assinatura cancelada",
        description: "Sua assinatura será cancelada no final do período atual.",
        variant: "destructive",
      });
    };

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">Assinatura</h2>
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600">Ciclo de cobrança:</span>
            <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
              <button
                onClick={() => setBillingCycle('monthly')}
                className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                  billingCycle === 'monthly'
                    ? 'bg-purple-600 text-white'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                Mensal
              </button>
              <button
                onClick={() => setBillingCycle('yearly')}
                className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                  billingCycle === 'yearly'
                    ? 'bg-purple-600 text-white'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                Anual
              </button>
            </div>
          </div>
        </div>

        {/* Plano Atual */}
        <Card className="border-purple-200">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Plano Atual</span>
              <Badge className="bg-purple-600 text-white">
                {currentPlanData?.name}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-purple-600">
                  R$ {currentPlanData?.price[billingCycle].toFixed(2)}
                </p>
                <p className="text-sm text-gray-600">
                  por {billingCycle === 'monthly' ? 'mês' : 'ano'}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium">Próxima cobrança</p>
                <p className="text-sm text-gray-600">
                  {nextBillingDate.toLocaleDateString('pt-BR')}
                </p>
              </div>
            </div>
            <div className="mt-4 flex space-x-2">
              <Button
                variant="outline"
                onClick={handleCancelSubscription}
                className="text-red-600 border-red-600 hover:bg-red-50"
              >
                Cancelar Assinatura
              </Button>
              <Button className="bg-purple-600 hover:bg-purple-700">
                Gerenciar Pagamento
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Planos Disponíveis */}
        <div className="space-y-4">
          <h3 className="text-xl font-semibold">Planos Disponíveis</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {plans.map((plan) => (
              <Card
                key={plan.id}
                className={`relative ${
                  plan.popular ? 'border-purple-500 shadow-lg' : 'border-gray-200'
                } ${plan.id === currentPlan ? 'ring-2 ring-purple-500' : ''}`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <Badge className="bg-purple-600 text-white">POPULAR</Badge>
                  </div>
                )}
                <CardHeader className="text-center">
                  <CardTitle className="text-lg">{plan.name}</CardTitle>
                  <div className="text-3xl font-bold text-purple-600">
                    R$ {plan.price[billingCycle].toFixed(2)}
                  </div>
                  <p className="text-sm text-gray-600">
                    por {billingCycle === 'monthly' ? 'mês' : 'ano'}
                  </p>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-purple-600 rounded-full"></div>
                        <span className="text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Button
                    className={`w-full mt-4 ${
                      plan.id === currentPlan
                        ? 'bg-gray-400 cursor-not-allowed'
                        : 'bg-purple-600 hover:bg-purple-700'
                    }`}
                    onClick={() => handleUpgrade(plan.id)}
                    disabled={plan.id === currentPlan}
                  >
                    {plan.id === currentPlan ? 'Plano Atual' : 'Escolher Plano'}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Histórico de Pagamentos */}
        <Card>
          <CardHeader>
            <CardTitle>Histórico de Pagamentos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                { date: '2025-01-16', amount: 197, status: 'Pago', invoice: 'INV-2025-001' },
                { date: '2024-12-16', amount: 197, status: 'Pago', invoice: 'INV-2024-012' },
                { date: '2024-11-16', amount: 197, status: 'Pago', invoice: 'INV-2024-011' },
                { date: '2024-10-16', amount: 197, status: 'Pago', invoice: 'INV-2024-010' },
              ].map((payment) => (
                <div
                  key={payment.invoice}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div>
                    <p className="font-medium">{payment.invoice}</p>
                    <p className="text-sm text-gray-600">
                      {new Date(payment.date).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">R$ {payment.amount.toFixed(2)}</p>
                    <Badge
                      variant={payment.status === 'Pago' ? 'default' : 'destructive'}
                      className={payment.status === 'Pago' ? 'bg-green-500' : ''}
                    >
                      {payment.status}
                    </Badge>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => handleDownloadPDF(payment.invoice)}>
                    Baixar PDF
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Modal de Cancelamento */}
        {showCancelModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
              <h3 className="text-lg font-semibold mb-4">Cancelar Assinatura</h3>
              <p className="text-gray-600 mb-6">
                Tem certeza que deseja cancelar sua assinatura? Você ainda terá acesso até o final do período atual.
              </p>
              <div className="flex space-x-3">
                <Button
                  variant="outline"
                  onClick={() => setShowCancelModal(false)}
                  className="flex-1"
                >
                  Manter Assinatura
                </Button>
                <Button
                  onClick={confirmCancel}
                  className="flex-1 bg-red-600 hover:bg-red-700"
                >
                  Cancelar
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  // ConfiguracaoContent - Definido dentro do componente
  const ConfiguracaoContent = () => {
    const [isEditing, setIsEditing] = useState(false);
    const [activeTab, setActiveTab] = useState("info");
    
    const [professionalData, setProfessionalData] = useState({
      id: "1",
      name: "Dr. João Silva",
      email: "joao.silva@conexaomental.com",
      phone: "(11) 99999-0000",
      cpf: "000.000.000-00",
      specialty: "psicologo",
      therapeuticApproach: "Terapia Cognitivo-Comportamental",
      description: "Especialista em terapia cognitivo-comportamental com mais de 10 anos de experiência.",
      experience: "10+ anos",
      rating: 4.9,
      totalConsultations: 1250,
      address: "São Paulo, SP",
      crp: "CRP 06/123456",
      gender: "masculino",
      company: {
        name: "Clínica ConexãoMental",
        cnpj: "54.423.733/0001-68",
        phone: "(11) 3456-7890",
        email: "contato@clinicaconexaomental.online",
        website: "https://clinicaconexaomental.online"
      },
      googleCalendarEmail: ""
    });

    const [editData, setEditData] = useState(professionalData);

    const handleSave = () => {
      setProfessionalData(editData);
      setIsEditing(false);
      toast({
        title: "Perfil atualizado",
        description: "Suas informações foram salvas com sucesso.",
      });
    };

    const handleCancel = () => {
      setEditData(professionalData);
      setIsEditing(false);
    };

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">Configuração do Perfil</h2>
          <div className="flex space-x-2">
            {isEditing ? (
              <>
                <Button variant="outline" size="sm" onClick={handleCancel}>
                  <X className="h-4 w-4 mr-2" />
                  Cancelar
                </Button>
                <Button size="sm" onClick={handleSave} className="bg-purple-600 hover:bg-purple-700">
                  <Save className="h-4 w-4 mr-2" />
                  Salvar
                </Button>
              </>
            ) : (
              <Button size="sm" onClick={() => setIsEditing(true)} className="bg-purple-600 hover:bg-purple-700">
                <Edit className="h-4 w-4 mr-2" />
                Editar
              </Button>
            )}
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4 bg-white/80 backdrop-blur-sm border-purple-200">
            <TabsTrigger value="info" className="data-[state=active]:bg-purple-600 data-[state=active]:text-white">Informações</TabsTrigger>
            <TabsTrigger value="company" className="data-[state=active]:bg-purple-600 data-[state=active]:text-white">Empresa</TabsTrigger>
            <TabsTrigger value="calendar" className="data-[state=active]:bg-purple-600 data-[state=active]:text-white">Google Calendar</TabsTrigger>
            <TabsTrigger value="stats" className="data-[state=active]:bg-purple-600 data-[state=active]:text-white">Estatísticas</TabsTrigger>
          </TabsList>

          <TabsContent value="info" className="space-y-6">
            <Card className="bg-white/80 backdrop-blur-sm border-purple-200 shadow-lg">
              <CardHeader className="bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-t-lg">
                <CardTitle className="text-xl">Informações Pessoais</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">Nome Completo</Label>
                    <Input
                      id="name"
                      value={editData.name}
                      onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                      disabled={!isEditing}
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={editData.email}
                      onChange={(e) => setEditData({ ...editData, email: e.target.value })}
                      disabled={!isEditing}
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone">Telefone</Label>
                    <Input
                      id="phone"
                      value={editData.phone}
                      onChange={(e) => setEditData({ ...editData, phone: e.target.value })}
                      disabled={!isEditing}
                    />
                  </div>
                  <div>
                    <Label htmlFor="cpf">CPF</Label>
                    <Input
                      id="cpf"
                      value={editData.cpf}
                      onChange={(e) => setEditData({ ...editData, cpf: e.target.value })}
                      disabled={!isEditing}
                    />
                  </div>
                  <div>
                    <Label htmlFor="crp">Identificação Profissional</Label>
                    <Input
                      id="crp"
                      value={editData.crp}
                      onChange={(e) => setEditData({ ...editData, crp: e.target.value })}
                      disabled={!isEditing}
                    />
                  </div>
                  <div>
                    <Label htmlFor="specialty">Especialidade</Label>
                    <Select value={editData.specialty} onValueChange={(value) => setEditData({ ...editData, specialty: value })} disabled={!isEditing}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione a especialidade" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="psicologo">Psicólogo</SelectItem>
                        <SelectItem value="psicanalista">Psicanalista</SelectItem>
                        <SelectItem value="terapeuta">Terapeuta</SelectItem>
                        <SelectItem value="psicoterapeuta">Psicoterapeuta</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="therapeuticApproach">Abordagem Terapêutica</Label>
                    <Select value={editData.therapeuticApproach} onValueChange={(value) => setEditData({ ...editData, therapeuticApproach: value })} disabled={!isEditing}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione a abordagem" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Terapia Cognitivo-Comportamental">Terapia Cognitivo-Comportamental</SelectItem>
                        <SelectItem value="Psicanálise">Psicanálise</SelectItem>
                        <SelectItem value="Terapia Humanista">Terapia Humanista</SelectItem>
                        <SelectItem value="Gestalt-Terapia">Gestalt-Terapia</SelectItem>
                        <SelectItem value="Terapia Sistêmica">Terapia Sistêmica</SelectItem>
                        <SelectItem value="Terapia Integrativa">Terapia Integrativa</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="address">Localização</Label>
                    <Input
                      id="address"
                      value={editData.address}
                      onChange={(e) => setEditData({ ...editData, address: e.target.value })}
                      disabled={!isEditing}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="description">Descrição Profissional</Label>
                  <Textarea
                    id="description"
                    value={editData.description}
                    onChange={(e) => setEditData({ ...editData, description: e.target.value })}
                    disabled={!isEditing}
                    rows={4}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="company" className="space-y-6">
            <Card className="bg-white/80 backdrop-blur-sm border-purple-200 shadow-lg">
              <CardHeader className="bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-t-lg">
                <CardTitle className="text-xl flex items-center space-x-2">
                  <Briefcase className="h-5 w-5" />
                  <span>Informações da Empresa</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="companyName">Nome da Empresa</Label>
                    <Input
                      id="companyName"
                      value={editData.company.name}
                      onChange={(e) => setEditData({ ...editData, company: { ...editData.company, name: e.target.value } })}
                      disabled={!isEditing}
                    />
                  </div>
                  <div>
                    <Label htmlFor="companyCnpj">CNPJ</Label>
                    <Input
                      id="companyCnpj"
                      value={editData.company.cnpj}
                      onChange={(e) => setEditData({ ...editData, company: { ...editData.company, cnpj: e.target.value } })}
                      disabled={!isEditing}
                      placeholder="00.000.000/0000-00"
                    />
                  </div>
                  <div>
                    <Label htmlFor="companyPhone">Telefone da Empresa</Label>
                    <Input
                      id="companyPhone"
                      value={editData.company.phone}
                      onChange={(e) => setEditData({ ...editData, company: { ...editData.company, phone: e.target.value } })}
                      disabled={!isEditing}
                      placeholder="(11) 0000-0000"
                    />
                  </div>
                  <div>
                    <Label htmlFor="companyEmail">Email da Empresa</Label>
                    <Input
                      id="companyEmail"
                      type="email"
                      value={editData.company.email}
                      onChange={(e) => setEditData({ ...editData, company: { ...editData.company, email: e.target.value } })}
                      disabled={!isEditing}
                      placeholder="contato@empresa.com"
                    />
                  </div>
                  <div className="col-span-2">
                    <Label htmlFor="companyWebsite">Website</Label>
                    <Input
                      id="companyWebsite"
                      value={editData.company.website}
                      onChange={(e) => setEditData({ ...editData, company: { ...editData.company, website: e.target.value } })}
                      disabled={!isEditing}
                      placeholder="https://www.empresa.com"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="calendar" className="space-y-6">
            <Card className="bg-white/80 backdrop-blur-sm border-purple-200 shadow-lg">
              <CardHeader className="bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-t-lg">
                <CardTitle className="text-xl">Integração Google Calendar</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6 p-6">
                <div>
                  <Label htmlFor="googleCalendarEmail">Email do Google Calendar</Label>
                  <Input
                    id="googleCalendarEmail"
                    type="email"
                    placeholder="seu-email@gmail.com"
                    value={isEditing ? editData.googleCalendarEmail : professionalData.googleCalendarEmail}
                    onChange={(e) => isEditing && setEditData({...editData, googleCalendarEmail: e.target.value})}
                    disabled={!isEditing}
                    className="mt-2"
                  />
                  <p className="text-sm text-gray-600 mt-2">
                    Digite o email da sua conta do Google que você deseja conectar ao Calendar.
                  </p>
                </div>
                
                <div className="p-4 bg-blue-50 rounded-lg">
                  <p className="text-sm text-blue-700">
                    <strong>Instruções:</strong> Após salvar seu email, você poderá conectar sua conta do Google Calendar para sincronizar seus agendamentos automaticamente.
                  </p>
                </div>

                <div className="space-y-4">
                  <Label className="text-sm font-medium">Configuração de Sincronização</Label>
                  <GoogleCalendarIntegration 
                    googleEmail={professionalData.googleCalendarEmail}
                    onIntegrationChange={(isConnected) => {
                      console.log('Google Calendar integração:', isConnected);
                      if (isConnected) {
                        toast({
                          title: "Integração ativada",
                          description: "Seus agendamentos serão sincronizados com a agenda da plataforma.",
                        });
                      }
                    }}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="stats" className="space-y-6">
            <Card className="bg-white/80 backdrop-blur-sm border-purple-200 shadow-lg">
              <CardHeader className="bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-t-lg">
                <CardTitle className="text-xl">Estatísticas do Perfil</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 p-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-gradient-to-r from-purple-100 to-purple-200 rounded-lg">
                    <div className="text-2xl font-bold text-purple-800">{professionalData.rating}</div>
                    <div className="text-sm text-purple-600">Avaliação Média</div>
                  </div>
                  <div className="text-center p-4 bg-gradient-to-r from-blue-100 to-blue-200 rounded-lg">
                    <div className="text-2xl font-bold text-blue-800">{professionalData.totalConsultations}</div>
                    <div className="text-sm text-blue-600">Total de Consultas</div>
                  </div>
                  <div className="text-center p-4 bg-gradient-to-r from-green-100 to-green-200 rounded-lg">
                    <div className="text-2xl font-bold text-green-800">{professionalData.experience}</div>
                    <div className="text-sm text-green-600">Experiência</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    );
  };

  const renderDashboardContent = () => {
    switch (activeSection) {
      case 'painel':
        return <PainelContent currentStats={currentStats} statsLoading={statsLoading} wsConnected={wsConnected} />;
      case 'agenda':
        return <AgendaContent />;
      case 'agendamento':
        return <AgendamentoContent />;
      case 'atendimentos':
        return <AtendimentosContent />;
      case 'contato':
        return <ContatoContent />;
      case 'crm':
        return <CRMContent />;
      case 'financeiro':
        return <FinanceiroContent />;
      case 'assinatura':
        return <AssinaturaContent />;
      case 'marketing':
        return <MarketingContent />;
      case 'afiliados':
        return <AfiliadosContent />;
      case 'configuracao':
        return <ConfiguracaoContent />;
      default:
        return <PainelContent currentStats={currentStats} statsLoading={statsLoading} wsConnected={wsConnected} />;
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <div className={`${sidebarCollapsed ? 'w-20' : 'w-64'} bg-gradient-to-br from-purple-800 to-purple-900 text-white transition-all duration-300 flex-col shadow-xl hidden md:flex`}>
        {/* Logo */}
        <div className="p-6 border-b border-purple-700">
          <div className="flex items-center space-x-3">
            <img src={logo} alt="Logo" className="w-8 h-8 rounded-full" />
            {!sidebarCollapsed && (
              <div>
                <h1 className="text-lg font-bold">ConexãoMental</h1>
                <p className="text-sm text-purple-200">Área Profissional</p>
              </div>
            )}
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2">
          {sidebarItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveSection(item.id)}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 group ${
                activeSection === item.id
                  ? 'bg-purple-600 text-white shadow-lg'
                  : 'text-purple-200 hover:bg-purple-700 hover:text-white'
              }`}
            >
              <item.icon className="w-5 h-5" />
              {!sidebarCollapsed && (
                <>
                  <span className="flex-1 text-left text-sm font-medium">{item.label}</span>
                  {item.badge && (
                    <Badge variant="secondary" className="bg-purple-500 text-white text-xs">
                      {item.badge}
                    </Badge>
                  )}
                </>
              )}
            </button>
          ))}
        </nav>

        {/* User Info & Logout */}
        <div className="p-4 border-t border-purple-700">
          {!sidebarCollapsed && (
            <div className="mb-4">
              <p className="text-sm font-medium text-purple-200">
                {user?.full_name || 'Profissional'}
              </p>
              <p className="text-xs text-purple-300">{user?.email}</p>
            </div>
          )}
          <Button
            onClick={handleLogout}
            className="w-full justify-start bg-purple-600 hover:bg-purple-700 text-white hover:text-white"
          >
            <LogOut className="w-4 h-4 mr-2" />
            {!sidebarCollapsed && "Sair"}
          </Button>
        </div>
      </div>

      {/* Mobile Menu */}
      <div className="md:hidden bg-white border-b border-gray-200 p-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-purple-800">
            {user?.full_name || 'Profissional'}
          </h2>
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
          {sidebarItems.map((item) => (
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
                <Badge variant="secondary" className="ml-1 bg-purple-500 text-white text-xs">
                  {item.badge}
                </Badge>
              )}
            </Button>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="bg-white shadow-sm border-b border-gray-200 px-3 md:px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                className="text-gray-600 hover:text-purple-600 hidden md:flex"
              >
                <ChevronRight className={`w-4 h-4 transition-transform ${sidebarCollapsed ? '' : 'rotate-180'}`} />
              </Button>
              <h1 className="text-lg md:text-2xl font-bold text-gray-900 capitalize">
                {activeSection === 'configuracao' ? 'Configuração do Perfil' : activeSection}
              </h1>
            </div>
            
            <div className="flex items-center space-x-2 md:space-x-4">
              <div className="relative hidden md:block">
                <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Buscar..."
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
              <Button variant="ghost" size="sm" className="text-gray-600 hover:text-purple-600">
                <Bell className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <main className="flex-1 overflow-y-auto p-3 md:p-6">
          {renderDashboardContent()}
        </main>
      </div>
    </div>
  );
};

// Componente do Painel Principal
const PainelContent = ({ currentStats, statsLoading, wsConnected }) => {
  const revenueGrowth = currentStats.revenue.lastMonth > 0 ? 
    Math.round(((currentStats.revenue.thisMonth - currentStats.revenue.lastMonth) / currentStats.revenue.lastMonth) * 100) : 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold">Painel Principal</h2>
        <div className="flex items-center space-x-2">
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
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {/* Cards de Estatísticas */}
        <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:shadow-lg transition-shadow">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center">
              <Calendar className="w-5 h-5 mr-2" />
              Consultas Hoje
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {statsLoading ? '...' : currentStats.appointments.today}
            </div>
            <p className="text-blue-100">
              {statsLoading ? '...' : `${currentStats.appointments.thisWeek} esta semana`}
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white hover:shadow-lg transition-shadow">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center">
              <DollarSign className="w-5 h-5 mr-2" />
              Receita Mensal
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {statsLoading ? '...' : `R$ ${currentStats.revenue.thisMonth.toLocaleString()}`}
            </div>
            <p className="text-green-100">
              {statsLoading ? '...' : `${revenueGrowth >= 0 ? '+' : ''}${revenueGrowth}% este mês`}
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white hover:shadow-lg transition-shadow">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center">
              <Users className="w-5 h-5 mr-2" />
              Consultas Totais
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {statsLoading ? '...' : currentStats.totalConsultations}
            </div>
            <p className="text-purple-100">
              {statsLoading ? '...' : `${currentStats.appointments.thisMonth} este mês`}
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-orange-500 to-orange-600 text-white hover:shadow-lg transition-shadow">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center">
              <TrendingUp className="w-5 h-5 mr-2" />
              Avaliação
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {statsLoading ? '...' : currentStats.rating.toFixed(1)}
            </div>
            <p className="text-orange-100">
              {statsLoading ? '...' : `${currentStats.appointments.confirmed} confirmadas`}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Próximos Agendamentos */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Próximos Agendamentos</CardTitle>
          <CardDescription>Suas consultas do dia</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                    <Users className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="font-medium">Maria Silva</h3>
                    <p className="text-sm text-gray-600">Terapia Cognitivo-Comportamental</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-medium">14:00</p>
                  <Badge variant="outline" className="text-xs">Confirmado</Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Atividades Recentes */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Atividades Recentes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex items-center space-x-4">
                <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                <div>
                  <p className="text-sm">
                    <span className="font-medium">João Santos</span> agendou uma consulta
                  </p>
                  <p className="text-xs text-gray-500">2 horas atrás</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// Componentes de conteúdo para cada seção
const AgendamentoContent = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [agendamentos, setAgendamentos] = useState([
    {
      id: 1,
      paciente: "Maria Silva",
      data: "2025-07-16",
      hora: "14:00",
      status: "confirmado",
      tipo: "consulta",
      origem: "plataforma"
    },
    {
      id: 2,
      paciente: "João Santos",
      data: "2025-07-16",
      hora: "15:00",
      status: "agendado",
      tipo: "retorno",
      origem: "google_calendar"
    },
    {
      id: 3,
      paciente: "Ana Costa",
      data: "2025-07-17",
      hora: "10:00",
      status: "confirmado",
      tipo: "consulta",
      origem: "plataforma"
    }
  ]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmado': return 'bg-green-500';
      case 'agendado': return 'bg-blue-500';
      case 'cancelado': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getOriginIcon = (origem: string) => {
    return origem === 'google_calendar' ? '📅' : '🏥';
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Agendamentos</h2>
        <div className="flex space-x-2">
          <Button variant="outline" className="border-purple-200 text-purple-600 hover:bg-purple-50">
            <Calendar className="w-4 h-4 mr-2" />
            Sincronizar Google Calendar
          </Button>
          <Button className="bg-purple-600 hover:bg-purple-700">
            <Plus className="w-4 h-4 mr-2" />
            Novo Agendamento
          </Button>
        </div>
      </div>

      {/* Integração com Google Calendar */}
      <Card className="bg-gradient-to-r from-purple-50 to-blue-50 border-purple-200">
        <CardHeader>
          <CardTitle className="text-lg flex items-center space-x-2">
            <Calendar className="h-5 w-5 text-purple-600" />
            <span>Integração Google Calendar</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-gray-600 mb-4">
            Seus agendamentos são sincronizados automaticamente entre a plataforma e o Google Calendar.
            Eventos marcados com 📅 vieram do Google Calendar, eventos com 🏥 foram criados na plataforma.
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span className="text-sm">Sincronização ativa</span>
            </div>
            <Button variant="outline" size="sm" className="border-purple-200 text-purple-600 hover:bg-purple-50">
              Configurar Integração
            </Button>
          </div>
        </CardContent>
      </Card>
      
      {/* Filtros */}
      <div className="flex space-x-4">
        <Button variant="outline" className="border-purple-200 text-purple-600 hover:bg-purple-50">
          Hoje
        </Button>
        <Button variant="outline" className="border-purple-200 text-purple-600 hover:bg-purple-50">
          Amanhã
        </Button>
        <Button variant="outline" className="border-purple-200 text-purple-600 hover:bg-purple-50">
          Esta Semana
        </Button>
        <Button variant="outline" className="border-purple-200 text-purple-600 hover:bg-purple-50">
          Próximo Mês
        </Button>
      </div>

      {/* Lista de Agendamentos */}
      <div className="grid gap-4">
        {agendamentos.map((agendamento) => (
          <Card key={agendamento.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <span className="text-lg">{getOriginIcon(agendamento.origem)}</span>
                    <div>
                      <h3 className="font-semibold">{agendamento.paciente}</h3>
                      <p className="text-sm text-gray-600">{agendamento.data} - {agendamento.hora}</p>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge 
                    variant={agendamento.status === 'confirmado' ? "default" : "secondary"}
                    className={`${getStatusColor(agendamento.status)} text-white`}
                  >
                    {agendamento.status}
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    {agendamento.tipo}
                  </Badge>
                  <Button variant="outline" size="sm" className="border-purple-200 text-purple-600 hover:bg-purple-50">
                    <Eye className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

const AtendimentosContent = () => {
  return (
  <div className="space-y-6">
    <div className="flex justify-between items-center">
      <h2 className="text-2xl font-bold">Atendimentos</h2>
      <div className="flex space-x-2">
        <Button variant="outline" className="border-purple-200 text-purple-600 hover:bg-purple-50">
          Filtrar
        </Button>
        <Button variant="outline" className="border-purple-200 text-purple-600 hover:bg-purple-50">
          Exportar
        </Button>
      </div>
    </div>

    {/* Estatísticas de Atendimentos */}
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <Card className="bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200">
        <CardContent className="p-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">156</div>
            <p className="text-sm text-blue-600">Total de Atendimentos</p>
          </div>
        </CardContent>
      </Card>
      <Card className="bg-gradient-to-r from-green-50 to-green-100 border-green-200">
        <CardContent className="p-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">142</div>
            <p className="text-sm text-green-600">Concluídos</p>
          </div>
        </CardContent>
      </Card>
      <Card className="bg-gradient-to-r from-purple-50 to-purple-100 border-purple-200">
        <CardContent className="p-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">91%</div>
            <p className="text-sm text-purple-600">Taxa de Sucesso</p>
          </div>
        </CardContent>
      </Card>
    </div>

    {/* Histórico de Atendimentos */}
    <Card>
      <CardHeader>
        <CardTitle>Histórico Recente</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                  <Users className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <h4 className="font-medium">Ana Costa {i}</h4>
                  <p className="text-sm text-gray-600">Sessão de Terapia - 45 min</p>
                  <p className="text-xs text-gray-500">15/07/2025</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                  Concluído
                </Badge>
                <Button variant="ghost" size="sm">
                  <Eye className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  </div>
  );
};

const ContatoContent = () => (
  <div className="space-y-6">
    <div className="flex justify-between items-center">
      <h2 className="text-2xl font-bold">Contato</h2>
      <Button className="bg-purple-600 hover:bg-purple-700">
        <Plus className="w-4 h-4 mr-2" />
        Novo Contato
      </Button>
    </div>

    {/* Estatísticas de Contatos */}
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <Card className="bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200">
        <CardContent className="p-4 text-center">
          <div className="text-2xl font-bold text-blue-600">24</div>
          <p className="text-sm text-blue-600">Mensagens Hoje</p>
        </CardContent>
      </Card>
      <Card className="bg-gradient-to-r from-green-50 to-green-100 border-green-200">
        <CardContent className="p-4 text-center">
          <div className="text-2xl font-bold text-green-600">18</div>
          <p className="text-sm text-green-600">Respondidas</p>
        </CardContent>
      </Card>
      <Card className="bg-gradient-to-r from-orange-50 to-orange-100 border-orange-200">
        <CardContent className="p-4 text-center">
          <div className="text-2xl font-bold text-orange-600">6</div>
          <p className="text-sm text-orange-600">Pendentes</p>
        </CardContent>
      </Card>
    </div>

    {/* Lista de Contatos */}
    <Card>
      <CardHeader>
        <CardTitle>Mensagens Recentes</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                  <MessageSquare className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <h4 className="font-medium">Pedro Santos {i}</h4>
                  <p className="text-sm text-gray-600">Gostaria de agendar uma consulta para...</p>
                  <p className="text-xs text-gray-500">Há 2 horas</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Badge variant={i % 2 === 0 ? "default" : "secondary"}>
                  {i % 2 === 0 ? "Novo" : "Lida"}
                </Badge>
                <Button variant="ghost" size="sm">
                  <Eye className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  </div>
);

const CRMContent = () => (
  <div className="space-y-6">
    <div className="flex justify-between items-center">
      <h2 className="text-2xl font-bold">CRM - Gestão de Relacionamento</h2>
      <Button className="bg-purple-600 hover:bg-purple-700">
        <Plus className="w-4 h-4 mr-2" />
        Novo Paciente
      </Button>
    </div>

    {/* Métricas do CRM */}
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <Card className="bg-gradient-to-r from-indigo-500 to-indigo-600 text-white">
        <CardContent className="p-4 text-center">
          <div className="text-2xl font-bold">127</div>
          <p className="text-sm text-indigo-100">Total de Pacientes</p>
        </CardContent>
      </Card>
      <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
        <CardContent className="p-4 text-center">
          <div className="text-2xl font-bold">45</div>
          <p className="text-sm text-green-100">Ativos</p>
        </CardContent>
      </Card>
      <Card className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-white">
        <CardContent className="p-4 text-center">
          <div className="text-2xl font-bold">8</div>
          <p className="text-sm text-yellow-100">Novos Este Mês</p>
        </CardContent>
      </Card>
      <Card className="bg-gradient-to-r from-red-500 to-red-600 text-white">
        <CardContent className="p-4 text-center">
          <div className="text-2xl font-bold">3</div>
          <p className="text-sm text-red-100">Necessitam Atenção</p>
        </CardContent>
      </Card>
    </div>

    {/* Lista de Pacientes */}
    <Card>
      <CardHeader>
        <CardTitle>Pacientes Recentes</CardTitle>
        <CardDescription>Atividades e informações dos seus pacientes</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                  <Users className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <h4 className="font-semibold">Paciente {i}</h4>
                  <p className="text-sm text-gray-600">Última consulta: 12/07/2025</p>
                  <p className="text-xs text-gray-500">Próxima: 19/07/2025 às 14:00</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                  Ativo
                </Badge>
                <Button variant="ghost" size="sm">
                  <Eye className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  </div>
);

const FinanceiroContent = () => (
  <div className="space-y-6">
    <div className="flex justify-between items-center">
      <h2 className="text-2xl font-bold">Financeiro</h2>
      <div className="flex space-x-2">
        <Button variant="outline" className="border-purple-200 text-purple-600 hover:bg-purple-50">
          Gerar Relatório
        </Button>
        <Button className="bg-purple-600 hover:bg-purple-700">
          <Plus className="w-4 h-4 mr-2" />
          Nova Cobrança
        </Button>
      </div>
    </div>

    {/* Resumo Financeiro */}
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
        <CardContent className="p-4">
          <div className="text-center">
            <div className="text-2xl font-bold">R$ 8.450</div>
            <p className="text-sm text-green-100">Receita Este Mês</p>
          </div>
        </CardContent>
      </Card>
      <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
        <CardContent className="p-4">
          <div className="text-center">
            <div className="text-2xl font-bold">R$ 2.340</div>
            <p className="text-sm text-blue-100">Pendente</p>
          </div>
        </CardContent>
      </Card>
      <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
        <CardContent className="p-4">
          <div className="text-center">
            <div className="text-2xl font-bold">R$ 6.110</div>
            <p className="text-sm text-purple-100">Recebido</p>
          </div>
        </CardContent>
      </Card>
      <Card className="bg-gradient-to-r from-orange-500 to-orange-600 text-white">
        <CardContent className="p-4">
          <div className="text-center">
            <div className="text-2xl font-bold">R$ 890</div>
            <p className="text-sm text-orange-100">Comissões</p>
          </div>
        </CardContent>
      </Card>
    </div>

    {/* Transações Recentes */}
    <Card>
      <CardHeader>
        <CardTitle>Transações Recentes</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                  <DollarSign className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <h4 className="font-medium">Consulta - Maria Silva {i}</h4>
                  <p className="text-sm text-gray-600">Pagamento via PIX</p>
                  <p className="text-xs text-gray-500">15/07/2025</p>
                </div>
              </div>
              <div className="text-right">
                <div className="font-bold text-green-600">+ R$ 150,00</div>
                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                  Recebido
                </Badge>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  </div>
);

const MarketingContent = () => {
  const [marketingSubSection, setMarketingSubSection] = useState('campaigns');

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Marketing</h2>
          <p className="text-gray-600">Ferramentas e recursos para divulgar seu trabalho</p>
        </div>
        <Button className="bg-purple-600 hover:bg-purple-700">
          <Plus className="w-4 h-4 mr-2" />
          Nova Campanha
        </Button>
      </div>

      {/* Marketing Navigation Buttons */}
      <div className="flex flex-wrap gap-3 mb-6">
        <button
          onClick={() => setMarketingSubSection('campaigns')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            marketingSubSection === 'campaigns'
              ? 'bg-purple-600 text-white shadow-md'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          Campanhas Ativas
        </button>
        <button
          onClick={() => setMarketingSubSection('templates')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            marketingSubSection === 'templates'
              ? 'bg-purple-600 text-white shadow-md'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          Templates Canva Pro
        </button>
        <button
          onClick={() => setMarketingSubSection('tools')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            marketingSubSection === 'tools'
              ? 'bg-purple-600 text-white shadow-md'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          Ferramentas de Marketing
        </button>
        <button
          onClick={() => setMarketingSubSection('analytics')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            marketingSubSection === 'analytics'
              ? 'bg-purple-600 text-white shadow-md'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          Análises
        </button>
      </div>

      {/* Campanhas Ativas */}
      {marketingSubSection === 'campaigns' && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Campanhas Ativas</CardTitle>
              <CardDescription>Suas campanhas de marketing em andamento</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                        <TrendingUp className="w-6 h-6 text-purple-600" />
                      </div>
                      <div>
                        <h4 className="font-semibold">Campanha de Terapia Online {i}</h4>
                        <p className="text-sm text-gray-600">Iniciada em 10/07/2025</p>
                        <p className="text-xs text-gray-500">Orçamento: R$ 500,00</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                        Ativa
                      </Badge>
                      <Button variant="ghost" size="sm">
                        <Eye className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Templates Canva Pro */}
      {marketingSubSection === 'templates' && (
        <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <span>Templates Canva Pro</span>
          <Badge className="bg-orange-500 text-white">PREMIUM</Badge>
        </CardTitle>
        <CardDescription>Templates profissionais prontos para usar - integrados com seu Canva Pro</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Template 1 - TDAH Ebook */}
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-all duration-300 group">
            <div className="relative overflow-hidden rounded-t-lg">
              <img 
                src="/attached_assets/Cópia%20de%20Ebook%20TDAH_1752875100624.png"
                alt="Template Ebook TDAH" 
                className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute top-2 right-2">
                <Badge className="bg-purple-500 text-white text-xs">E-book</Badge>
              </div>
            </div>
            <div className="p-4">
              <h3 className="font-semibold text-gray-900 mb-2">Guia TDAH</h3>
              <p className="text-sm text-gray-600 mb-3">Template para e-book sobre TDAH com design profissional e moderno</p>
              <Button 
                onClick={() => {
                  console.log('Abrindo template TDAH no Canva');
                  window.open('https://www.canva.com/design/DAGiAxQCilQ/nXXOiYm_YFip1cDC_18iJQ/view?utm_content=DAGiAxQCilQ&utm_campaign=designshare&utm_medium=link2&utm_source=uniquelinks&utlId=h12d731ace1', '_blank');
                }}
                className="w-full bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white"
              >
                Abrir Template
              </Button>
            </div>
          </div>

          {/* Template 2 - Página Link Bio */}
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-all duration-300 group">
            <div className="relative overflow-hidden rounded-t-lg">
              <img 
                src="/attached_assets/Cópia%20de%20Cópia%20de%20Cópia%20de%20Cópia%20de%20Página%20de%20Link%2002_1752875382603.png"
                alt="Template Página Link Bio" 
                className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute top-2 right-2">
                <Badge className="bg-pink-500 text-white text-xs">Link Bio</Badge>
              </div>
            </div>
            <div className="p-4">
              <h3 className="font-semibold text-gray-900 mb-2">Página de Links</h3>
              <p className="text-sm text-gray-600 mb-3">Template elegante para organizar todos seus links importantes</p>
              <Button 
                onClick={() => {
                  console.log('Abrindo template Página de Links no Canva');
                  window.open('https://www.canva.com/design/DAGh8BB4LpQ/UHf_De0MLcAtahVobfd1-A/view?utm_content=DAGh8BB4LpQ&utm_campaign=share_your_design&utm_medium=link2&utm_source=shareyourdesignpanel', '_blank');
                }}
                className="w-full bg-gradient-to-r from-pink-600 to-pink-700 hover:from-pink-700 hover:to-pink-800 text-white"
              >
                Abrir Template
              </Button>
            </div>
          </div>

          {/* Template 3 - Templates Link Bio */}
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-all duration-300 group">
            <div className="relative overflow-hidden rounded-t-lg">
              <img 
                src="/attached_assets/Cópia%20de%20Cópia%20de%20Cópia%20de%20Templates%20-%20link%20na%20bio_1752875386852.png"
                alt="Template Link na Bio" 
                className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute top-2 right-2">
                <Badge className="bg-yellow-500 text-white text-xs">Social</Badge>
              </div>
            </div>
            <div className="p-4">
              <h3 className="font-semibold text-gray-900 mb-2">Link na Bio</h3>
              <p className="text-sm text-gray-600 mb-3">Template estiloso para barbeiros e profissionais de beleza</p>
              <Button 
                onClick={() => {
                  console.log('Abrindo template Link na Bio no Canva');
                  window.open('https://www.canva.com/design/DAGh8BB4LpQ/UHf_De0MLcAtahVobfd1-A/view?utm_content=DAGh8BB4LpQ&utm_campaign=share_your_design&utm_medium=link2&utm_source=shareyourdesignpanel', '_blank');
                }}
                className="w-full bg-gradient-to-r from-yellow-600 to-yellow-700 hover:from-yellow-700 hover:to-yellow-800 text-white"
              >
                Abrir Template
              </Button>
            </div>
          </div>

          {/* Template 4 - Método Profissional */}
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-all duration-300 group">
            <div className="relative overflow-hidden rounded-t-lg">
              <img 
                src="/attached_assets/Cópia%20de%20MÉTODO%201_1752875392989.png"
                alt="Template Método Profissional" 
                className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute top-2 right-2">
                <Badge className="bg-blue-500 text-white text-xs">Método</Badge>
              </div>
            </div>
            <div className="p-4">
              <h3 className="font-semibold text-gray-900 mb-2">Método Profissional</h3>
              <p className="text-sm text-gray-600 mb-3">Template para apresentar seu método de trabalho exclusivo</p>
              <Button 
                onClick={() => {
                  console.log('Abrindo template Método Profissional no Canva');
                  window.open('https://www.canva.com/design/DAGiAxQCilQ/nXXOiYm_YFip1cDC_18iJQ/view?utm_content=DAGiAxQCilQ&utm_campaign=designshare&utm_medium=link2&utm_source=uniquelinks&utlId=h12d731ace1', '_blank');
                }}
                className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white"
              >
                Abrir Template
              </Button>
            </div>
          </div>

          {/* Template 5 - Renda Extra */}
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-all duration-300 group">
            <div className="relative overflow-hidden rounded-t-lg">
              <img 
                src="/attached_assets/Cópia%20de%20Renda%20Extra%20Modelo%201_1752875396815.png"
                alt="Template Renda Extra" 
                className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute top-2 right-2">
                <Badge className="bg-green-500 text-white text-xs">Negócio</Badge>
              </div>
            </div>
            <div className="p-4">
              <h3 className="font-semibold text-gray-900 mb-2">Renda Extra</h3>
              <p className="text-sm text-gray-600 mb-3">Template para promover oportunidades de renda extra</p>
              <Button 
                onClick={() => {
                  console.log('Abrindo template Renda Extra no Canva');
                  window.open('https://www.canva.com/design/DAGh8BB4LpQ/UHf_De0MLcAtahVobfd1-A/view?utm_content=DAGh8BB4LpQ&utm_campaign=share_your_design&utm_medium=link2&utm_source=shareyourdesignpanel', '_blank');
                }}
                className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white"
              >
                Abrir Template
              </Button>
            </div>
          </div>
        </div>

        {/* Informações sobre os templates */}
        <div className="mt-6 p-4 bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg border border-purple-200">
          <div className="flex items-center space-x-2 mb-2">
            <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
            <h4 className="font-semibold text-purple-800">Como usar os templates</h4>
          </div>
          <p className="text-sm text-purple-700 mb-3">
            Clique em "Abrir Template" para visualizar o template no Canva. 
            Você pode usar como referência ou duplicar para personalizar com suas informações.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-xs text-purple-600">
            <div className="flex items-center space-x-2">
              <span className="w-1 h-1 bg-purple-400 rounded-full"></span>
              <span>Edição direta no Canva</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="w-1 h-1 bg-purple-400 rounded-full"></span>
              <span>Templates profissionais</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="w-1 h-1 bg-purple-400 rounded-full"></span>
              <span>Personalizável para sua marca</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
      )}

      {/* Ferramentas de Marketing */}
      {marketingSubSection === 'tools' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card className="hover:shadow-md transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <TrendingUp className="h-5 w-5 text-purple-600" />
                  <span>Gerador de Posts</span>
                </CardTitle>
                <CardDescription>Crie posts profissionais para redes sociais</CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full bg-purple-600 hover:bg-purple-700">
                  Criar Post
                </Button>
              </CardContent>
            </Card>

            <Card className="hover:shadow-md transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Mail className="h-5 w-5 text-blue-600" />
                  <span>E-mail Marketing</span>
                </CardTitle>
                <CardDescription>Envie newsletters e campanhas por e-mail</CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full bg-blue-600 hover:bg-blue-700">
                  Nova Campanha
                </Button>
              </CardContent>
            </Card>

            <Card className="hover:shadow-md transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Search className="h-5 w-5 text-green-600" />
                  <span>SEO Local</span>
                </CardTitle>
                <CardDescription>Otimize sua presença online local</CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full bg-green-600 hover:bg-green-700">
                  Configurar SEO
                </Button>
              </CardContent>
            </Card>

            <Card className="hover:shadow-md transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <TrendingUp className="h-5 w-5 text-orange-600" />
                  <span>Link de Compartilhamento</span>
                </CardTitle>
                <CardDescription>Compartilhe seu perfil nas redes sociais</CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full bg-orange-600 hover:bg-orange-700">
                  Copiar Link
                </Button>
              </CardContent>
            </Card>

            <Card className="hover:shadow-md transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <BookOpen className="h-5 w-5 text-indigo-600" />
                  <span>Materiais Promocionais</span>
                </CardTitle>
                <CardDescription>Baixe cards e banners personalizados</CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full bg-indigo-600 hover:bg-indigo-700">
                  Download
                </Button>
              </CardContent>
            </Card>

            <Card className="hover:shadow-md transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Calendar className="h-5 w-5 text-teal-600" />
                  <span>Agendamento Online</span>
                </CardTitle>
                <CardDescription>Configure links de agendamento automático</CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full bg-teal-600 hover:bg-teal-700">
                  Configurar
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* Análises de Marketing */}
      {marketingSubSection === 'analytics' && (
        <div className="space-y-6">
          {/* Métricas de Marketing */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="bg-gradient-to-r from-pink-500 to-pink-600 text-white">
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold">1,234</div>
                <p className="text-sm text-pink-100">Visualizações Perfil</p>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-r from-teal-500 to-teal-600 text-white">
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold">89</div>
                <p className="text-sm text-teal-100">Cliques no Botão</p>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-r from-violet-500 to-violet-600 text-white">
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold">12</div>
                <p className="text-sm text-violet-100">Conversões</p>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-r from-cyan-500 to-cyan-600 text-white">
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold">13.5%</div>
                <p className="text-sm text-cyan-100">Taxa de Conversão</p>
              </CardContent>
            </Card>
          </div>

          {/* Gráfico de Performance */}
          <Card>
            <CardHeader>
              <CardTitle>Performance de Marketing</CardTitle>
              <CardDescription>Análise detalhada dos últimos 30 dias</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
                <p className="text-gray-500">Gráfico de performance será implementado aqui</p>
              </div>
            </CardContent>
          </Card>

          {/* Relatórios Detalhados */}
          <Card>
            <CardHeader>
              <CardTitle>Relatórios Detalhados</CardTitle>
              <CardDescription>Análises completas de performance</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Button variant="outline" className="h-16 flex flex-col items-center justify-center">
                  <span className="font-semibold">Relatório Semanal</span>
                  <span className="text-sm text-gray-500">Performance dos últimos 7 dias</span>
                </Button>
                <Button variant="outline" className="h-16 flex flex-col items-center justify-center">
                  <span className="font-semibold">Relatório Mensal</span>
                  <span className="text-sm text-gray-500">Análise completa do mês</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

const AfiliadosContent = () => (
  <div className="space-y-6">
    <div className="flex justify-between items-center">
      <h2 className="text-2xl font-bold">Programa de Afiliados</h2>
      <Button className="bg-purple-600 hover:bg-purple-700">
        <Plus className="w-4 h-4 mr-2" />
        Convidar Afiliado
      </Button>
    </div>

    {/* Resumo do Programa */}
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <Card className="bg-gradient-to-r from-emerald-500 to-emerald-600 text-white">
        <CardContent className="p-4 text-center">
          <div className="text-2xl font-bold">15</div>
          <p className="text-sm text-emerald-100">Afiliados Ativos</p>
        </CardContent>
      </Card>
      <Card className="bg-gradient-to-r from-amber-500 to-amber-600 text-white">
        <CardContent className="p-4 text-center">
          <div className="text-2xl font-bold">R$ 2.340</div>
          <p className="text-sm text-amber-100">Comissões Pagas</p>
        </CardContent>
      </Card>
      <Card className="bg-gradient-to-r from-rose-500 to-rose-600 text-white">
        <CardContent className="p-4 text-center">
          <div className="text-2xl font-bold">48</div>
          <p className="text-sm text-rose-100">Indicações</p>
        </CardContent>
      </Card>
      <Card className="bg-gradient-to-r from-sky-500 to-sky-600 text-white">
        <CardContent className="p-4 text-center">
          <div className="text-2xl font-bold">23</div>
          <p className="text-sm text-sky-100">Conversões</p>
        </CardContent>
      </Card>
    </div>

    {/* Afiliados Ativos */}
    <Card>
      <CardHeader>
        <CardTitle>Afiliados Ativos</CardTitle>
        <CardDescription>Seus parceiros de indicação</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                  <UserPlus className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <h4 className="font-semibold">Afiliado {i}</h4>
                  <p className="text-sm text-gray-600">Cadastrado em 10/07/2025</p>
                  <p className="text-xs text-gray-500">Indicações: {i * 3} | Conversões: {i * 2}</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <div className="text-right">
                  <div className="font-bold text-green-600">R$ {i * 150},00</div>
                  <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                    Ativo
                  </Badge>
                </div>
                <Button variant="ghost" size="sm">
                  <Eye className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>

    {/* Configurações do Programa */}
    <Card>
      <CardHeader>
        <CardTitle>Configurações do Programa</CardTitle>
        <CardDescription>Defina as regras e comissões</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Comissão por Indicação (%)</label>
            <input 
              type="number" 
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
              defaultValue="15"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Valor Mínimo para Saque</label>
            <input 
              type="number" 
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
              defaultValue="100"
            />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Mensagem de Convite</label>
          <textarea 
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
            rows={3}
            placeholder="Convite para participar do programa de afiliados..."
          />
        </div>
        <Button className="bg-purple-600 hover:bg-purple-700">
          Salvar Configurações
        </Button>
      </CardContent>
    </Card>
  </div>
);


export default ProfessionalDashboard;
