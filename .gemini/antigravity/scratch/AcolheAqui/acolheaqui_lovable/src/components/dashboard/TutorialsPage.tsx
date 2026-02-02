import { useState, memo, useMemo, useCallback } from "react";
import { 
  Play, 
  Clock, 
  CheckCircle2, 
  BookOpen,
  User,
  Users,
  Calendar,
  ShoppingCart,
  MessageCircle,
  Bot,
  Video,
  DollarSign,
  Settings,
  Webhook,
  ChevronRight,
  ExternalLink,
  Sparkles,
  GraduationCap
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

interface Tutorial {
  id: string;
  title: string;
  description: string;
  duration: string;
  category: string;
  difficulty: "iniciante" | "intermediário" | "avançado";
  videoUrl?: string;
  steps: string[];
  completed?: boolean;
}

const tutorials: Tutorial[] = [
  // Perfil e Landing Page
  {
    id: "profile-setup",
    title: "Como configurar seu Perfil Profissional",
    description: "Aprenda a preencher todos os dados do seu perfil para transmitir credibilidade aos pacientes.",
    duration: "5 min",
    category: "perfil",
    difficulty: "iniciante",
    videoUrl: "https://www.youtube.com/watch?v=exemplo-perfil",
    steps: [
      "Acesse o menu 'Dados do Perfil' no sidebar",
      "Preencha seu nome completo e registro profissional (CRP/CRM)",
      "Adicione uma foto profissional de qualidade",
      "Escreva uma bio envolvente sobre sua experiência",
      "Selecione suas especialidades e abordagens terapêuticas",
      "Configure suas redes sociais",
      "Defina um slug personalizado para sua URL"
    ]
  },
  {
    id: "landing-page",
    title: "Personalizando sua Landing Page",
    description: "Crie uma página profissional atraente para conquistar novos pacientes.",
    duration: "8 min",
    category: "perfil",
    difficulty: "iniciante",
    videoUrl: "https://www.youtube.com/watch?v=exemplo-landing",
    steps: [
      "Acesse o menu 'Landing Page' no sidebar",
      "Use o painel lateral para editar cada seção",
      "Personalize as cores para combinar com sua marca",
      "Adicione depoimentos de pacientes (com permissão)",
      "Configure as perguntas frequentes (FAQ)",
      "Reorganize as seções arrastando e soltando",
      "Visualize as alterações em tempo real no preview"
    ]
  },
  // Agenda e CRM
  {
    id: "schedule-config",
    title: "Configurando seus Horários de Atendimento",
    description: "Defina seus horários disponíveis para que pacientes possam agendar.",
    duration: "4 min",
    category: "agenda",
    difficulty: "iniciante",
    steps: [
      "Acesse 'Agenda / CRM' no menu principal",
      "Clique na aba 'Horários'",
      "Adicione intervalos para cada dia da semana",
      "Defina horário de início e término",
      "Ative ou desative dias específicos",
      "Configure múltiplos turnos se necessário (manhã e tarde)"
    ]
  },
  {
    id: "appointments-management",
    title: "Gerenciando Agendamentos",
    description: "Aprenda a visualizar, criar e gerenciar todos os seus agendamentos.",
    duration: "6 min",
    category: "agenda",
    difficulty: "iniciante",
    steps: [
      "Acesse 'Agenda / CRM' no menu principal",
      "Visualize todos os agendamentos no calendário",
      "Clique em um agendamento para ver detalhes",
      "Use o botão '+' para criar agendamentos manuais",
      "Altere o status: pending, confirmed, completed, cancelled",
      "Adicione notas e observações ao agendamento"
    ]
  },
  {
    id: "patient-crm",
    title: "Utilizando o CRM de Pacientes",
    description: "Gerencie sua base de pacientes e acompanhe o histórico de cada um.",
    duration: "7 min",
    category: "agenda",
    difficulty: "intermediário",
    steps: [
      "Acesse a lista de pacientes na aba 'Pacientes'",
      "Visualize todos os pacientes atendidos",
      "Clique em um paciente para ver a ficha completa",
      "Acesse o histórico de sessões do paciente",
      "Adicione notas e observações ao prontuário",
      "Exporte a lista de pacientes em CSV"
    ]
  },
  // Área de Membros
  {
    id: "members-area-setup",
    title: "Configurando a Área de Membros",
    description: "Crie sua área de cursos estilo Netflix para seus alunos.",
    duration: "10 min",
    category: "membros",
    difficulty: "intermediário",
    videoUrl: "https://www.youtube.com/watch?v=exemplo-membros",
    steps: [
      "Acesse 'Área de Membros' no menu principal",
      "Personalize o banner principal da área",
      "Crie seu primeiro módulo de conteúdo",
      "Adicione aulas com vídeos e materiais de apoio",
      "Configure a ordem das aulas arrastando",
      "Publique o módulo para ficar visível aos alunos",
      "Use 'Visualizar como Aluno' para testar"
    ]
  },
  {
    id: "members-content",
    title: "Criando Conteúdo com IA",
    description: "Use a IA para escrever descrições e gerar capas automaticamente.",
    duration: "6 min",
    category: "membros",
    difficulty: "intermediário",
    videoUrl: "https://www.youtube.com/watch?v=exemplo-ia-conteudo",
    steps: [
      "Ao criar um módulo, clique no ícone de IA ao lado da descrição",
      "Escolha o tom de voz desejado (Profissional, Amigável, etc.)",
      "A IA vai aprimorar ou criar o texto automaticamente",
      "Para gerar capas, clique em 'Gerar com IA' no campo de imagem",
      "Escolha o estilo visual da capa",
      "A imagem é gerada e salva automaticamente"
    ]
  },
  {
    id: "members-certificates",
    title: "Certificados PDF Automáticos",
    description: "Configure certificados para seus alunos ao concluir módulos.",
    duration: "5 min",
    category: "membros",
    difficulty: "iniciante",
    videoUrl: "https://www.youtube.com/watch?v=exemplo-certificados",
    steps: [
      "Os certificados são gerados automaticamente",
      "O aluno precisa completar 100% do módulo",
      "O botão 'Certificado' aparece no header do módulo",
      "O certificado contém nome, módulo, duração e data",
      "O PDF é gerado em formato paisagem A4",
      "O aluno pode baixar e compartilhar"
    ]
  },
  {
    id: "members-community",
    title: "Comunidade e Eventos ao Vivo",
    description: "Crie eventos e mantenha uma comunidade engajada.",
    duration: "7 min",
    category: "membros",
    difficulty: "intermediário",
    videoUrl: "https://www.youtube.com/watch?v=exemplo-comunidade",
    steps: [
      "Acesse a aba 'Eventos' na Área de Membros",
      "Clique em 'Novo Evento' para criar",
      "Defina título, descrição, data e horário",
      "Adicione o link do Google Meet ou sala virtual",
      "Os alunos podem se inscrever nos eventos",
      "Acompanhe as inscrições e presença"
    ]
  },
  // Checkout e Pagamentos
  {
    id: "checkout-setup",
    title: "Configurando seu Checkout Personalizado",
    description: "Crie um checkout profissional para receber pagamentos online.",
    duration: "10 min",
    category: "pagamentos",
    difficulty: "intermediário",
    videoUrl: "https://www.youtube.com/watch?v=exemplo-checkout",
    steps: [
      "Acesse o menu 'Checkout' no sidebar",
      "Personalize as cores e layout do checkout",
      "Configure seus serviços com preços e durações",
      "Adicione fotos e descrições atrativas",
      "Configure order bumps (produtos adicionais)",
      "Copie o link do checkout para compartilhar",
      "Teste o checkout antes de divulgar"
    ]
  },
  {
    id: "payment-gateway",
    title: "Configurando Gateway de Pagamento",
    description: "Conecte sua conta para receber pagamentos automaticamente.",
    duration: "8 min",
    category: "pagamentos",
    difficulty: "intermediário",
    videoUrl: "https://www.youtube.com/watch?v=exemplo-gateway",
    steps: [
      "Acesse 'Finanças' > 'Visão Geral'",
      "Escolha seu gateway: Stripe, MercadoPago, PagSeguro, etc.",
      "Crie uma conta no gateway escolhido (se não tiver)",
      "Copie as chaves de API do gateway",
      "Cole as chaves na configuração da AcolheAqui",
      "Teste uma transação para validar a integração",
      "Ative o recebimento automático"
    ]
  },
  // WhatsApp e Notificações
  {
    id: "whatsapp-integration",
    title: "Integrando o WhatsApp via QR Code e API Oficial",
    description: "Configure o WhatsApp para enviar notificações automáticas aos pacientes.",
    duration: "5 min",
    category: "conexoes",
    difficulty: "iniciante",
    videoUrl: "https://www.youtube.com/watch?v=exemplo-whatsapp",
    steps: [
      "Acesse o menu 'WhatsApp' no sidebar",
      "Escolha entre QR Code (simples) ou API Oficial (empresarial)",
      "Para QR Code: clique em 'Gerar QR Code' e escaneie com seu celular",
      "Para API Oficial: configure as credenciais do WhatsApp Business",
      "Aguarde a confirmação de conexão",
      "Configure os templates de mensagens",
      "Teste enviando uma mensagem para seu número"
    ]
  },
  {
    id: "notification-templates",
    title: "Personalizando Templates de Notificação",
    description: "Crie mensagens personalizadas para cada tipo de notificação.",
    duration: "5 min",
    category: "conexoes",
    difficulty: "intermediário",
    videoUrl: "https://www.youtube.com/watch?v=exemplo-templates",
    steps: [
      "Acesse 'WhatsApp' > 'Templates'",
      "Edite o template de confirmação de agendamento",
      "Personalize o lembrete pré-sessão",
      "Configure mensagem de cancelamento",
      "Use variáveis: {nome}, {data}, {horario}, {servico}",
      "Salve e teste cada template"
    ]
  },
  // Agente IA
  {
    id: "ai-agent-setup",
    title: "Configurando o Agente IA de Agendamento",
    description: "Ative a IA para atender pacientes automaticamente via WhatsApp.",
    duration: "8 min",
    category: "ia",
    difficulty: "avançado",
    videoUrl: "https://www.youtube.com/watch?v=exemplo-agente-ia",
    steps: [
      "Primeiro configure a integração com WhatsApp",
      "Acesse 'IA Agendamento' no menu",
      "Defina o nome do seu agente virtual",
      "Escreva uma saudação personalizada",
      "Adicione instruções específicas para a IA",
      "Ative o agente",
      "Teste enviando uma mensagem no WhatsApp"
    ]
  },
  {
    id: "ai-custom-key",
    title: "Usando sua Própria Chave de IA",
    description: "Configure sua chave de API para modelos avançados.",
    duration: "4 min",
    category: "ia",
    difficulty: "avançado",
    videoUrl: "https://www.youtube.com/watch?v=exemplo-api-key",
    steps: [
      "Acesse 'Config. IA' no menu de integrações",
      "Escolha o provedor: OpenAI, Google ou Anthropic",
      "Gere uma API Key no painel do provedor",
      "Cole a chave na configuração",
      "Teste a conexão",
      "Selecione o modelo desejado"
    ]
  },
  // Sala Virtual
  {
    id: "virtual-room",
    title: "Realizando Sessões na Sala Virtual",
    description: "Aprenda a usar a sala virtual para atendimentos online.",
    duration: "6 min",
    category: "atendimento",
    difficulty: "iniciante",
    videoUrl: "https://www.youtube.com/watch?v=exemplo-sala-virtual",
    steps: [
      "Acesse 'Agenda / CRM' e selecione um agendamento",
      "Clique em 'Iniciar Sessão' ou 'Entrar na Sala'",
      "Permita acesso à câmera e microfone",
      "Aguarde o paciente entrar (ele recebe o link por email/WhatsApp)",
      "Use o chat para trocar mensagens",
      "Compartilhe sua tela se necessário",
      "Encerre a sessão quando terminar"
    ]
  },
  // Integrações
  {
    id: "google-calendar",
    title: "Sincronizando com Google Calendar",
    description: "Mantenha sua agenda sincronizada com o Google automaticamente.",
    duration: "5 min",
    category: "conexoes",
    difficulty: "intermediário",
    videoUrl: "https://www.youtube.com/watch?v=exemplo-google-agenda",
    steps: [
      "Acesse 'Google Agenda' no menu de integrações",
      "Clique em 'Conectar conta Google'",
      "Autorize o acesso ao Google Calendar",
      "Selecione o calendário que deseja sincronizar",
      "Ative a sincronização bidirecional",
      "Novos agendamentos aparecerão automaticamente no Google"
    ]
  },
  {
    id: "webhooks-setup",
    title: "Configurando Webhooks para Integrações",
    description: "Conecte a AcolheAqui com outros sistemas externos.",
    duration: "10 min",
    category: "conexoes",
    difficulty: "avançado",
    videoUrl: "https://www.youtube.com/watch?v=exemplo-webhooks",
    steps: [
      "Acesse 'Webhooks' no menu de integrações",
      "Clique em 'Novo Webhook'",
      "Cole a URL do sistema destino",
      "Defina uma Secret Key para segurança",
      "Selecione os eventos que disparam o webhook",
      "Salve e teste o webhook",
      "Verifique os logs de envio"
    ]
  }
];

const categories = [
  { id: "todos", label: "Todos", icon: BookOpen },
  { id: "perfil", label: "Perfil", icon: User },
  { id: "agenda", label: "Agenda", icon: Calendar },
  { id: "membros", label: "Membros", icon: Users },
  { id: "pagamentos", label: "Pagamentos", icon: DollarSign },
  { id: "conexoes", label: "Conexões", icon: MessageCircle },
  { id: "ia", label: "IA", icon: Bot },
  { id: "atendimento", label: "Atendimento", icon: Video },
];

const getDifficultyColor = (difficulty: string) => {
  switch (difficulty) {
    case "iniciante":
      return "bg-green-500/20 text-green-400 border-green-500/30";
    case "intermediário":
      return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
    case "avançado":
      return "bg-red-500/20 text-red-400 border-red-500/30";
    default:
      return "bg-muted text-muted-foreground";
  }
};

// Memoized tutorial card component
const TutorialCard = memo(({ 
  tutorial, 
  isExpanded, 
  isCompleted, 
  onToggleExpand, 
  onToggleComplete 
}: { 
  tutorial: Tutorial;
  isExpanded: boolean;
  isCompleted: boolean;
  onToggleExpand: () => void;
  onToggleComplete: () => void;
}) => (
  <Card 
    className={cn(
      "transition-all duration-300 cursor-pointer hover:shadow-lg",
      isCompleted && "border-green-500/30 bg-green-500/5",
      isExpanded && "ring-2 ring-primary/50"
    )}
  >
    <CardHeader 
      className="pb-2"
      onClick={onToggleExpand}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <Badge variant="outline" className={getDifficultyColor(tutorial.difficulty)}>
              {tutorial.difficulty}
            </Badge>
            <div className="flex items-center gap-1 text-muted-foreground text-sm">
              <Clock className="h-3.5 w-3.5" />
              {tutorial.duration}
            </div>
          </div>
          <CardTitle className="text-lg flex items-center gap-2">
            {isCompleted && (
              <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0" />
            )}
            {tutorial.title}
          </CardTitle>
          <CardDescription className="mt-1">
            {tutorial.description}
          </CardDescription>
        </div>
        <ChevronRight 
          className={cn(
            "h-5 w-5 text-muted-foreground transition-transform flex-shrink-0",
            isExpanded && "rotate-90"
          )} 
        />
      </div>
    </CardHeader>
    
    {isExpanded && (
      <CardContent className="pt-4 border-t border-border/50">
        <div className="space-y-4">
          <div>
            <h4 className="font-semibold text-foreground mb-3 flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary" />
              Passo a Passo
            </h4>
            <ol className="space-y-2">
              {tutorial.steps.map((step, index) => (
                <li 
                  key={index} 
                  className="flex items-start gap-3 text-sm text-muted-foreground"
                >
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-medium">
                    {index + 1}
                  </span>
                  <span className="pt-0.5">{step}</span>
                </li>
              ))}
            </ol>
          </div>
          
          <div className="flex items-center gap-3 pt-4 border-t border-border/50">
            <Button
              variant={isCompleted ? "outline" : "default"}
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onToggleComplete();
              }}
              className={cn(
                isCompleted && "border-green-500/50 text-green-500 hover:bg-green-500/10"
              )}
            >
              <CheckCircle2 className="h-4 w-4 mr-2" />
              {isCompleted ? "Concluído" : "Marcar como concluído"}
            </Button>
            
            {tutorial.videoUrl && (
              <Button variant="outline" size="sm" asChild>
                <a href={tutorial.videoUrl} target="_blank" rel="noopener noreferrer">
                  <Play className="h-4 w-4 mr-2" />
                  Assistir vídeo
                  <ExternalLink className="h-3 w-3 ml-2" />
                </a>
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    )}
  </Card>
));

TutorialCard.displayName = "TutorialCard";

// Progress circle component
const ProgressCircle = memo(({ progress, completed, total }: { progress: number; completed: number; total: number }) => (
  <Card className="bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20">
    <CardContent className="p-4 flex items-center gap-4">
      <div className="relative">
        <svg className="w-16 h-16 transform -rotate-90">
          <circle
            cx="32"
            cy="32"
            r="28"
            className="stroke-muted fill-none"
            strokeWidth="4"
          />
          <circle
            cx="32"
            cy="32"
            r="28"
            className="stroke-primary fill-none"
            strokeWidth="4"
            strokeDasharray={`${progress * 1.76} 176`}
            strokeLinecap="round"
          />
        </svg>
        <span className="absolute inset-0 flex items-center justify-center text-sm font-bold text-primary">
          {progress}%
        </span>
      </div>
      <div>
        <p className="text-sm text-muted-foreground">Progresso</p>
        <p className="text-lg font-semibold text-foreground">
          {completed} de {total} tutoriais
        </p>
      </div>
    </CardContent>
  </Card>
));

ProgressCircle.displayName = "ProgressCircle";

const TutorialsPage = () => {
  const [selectedCategory, setSelectedCategory] = useState("todos");
  const [expandedTutorial, setExpandedTutorial] = useState<string | null>(null);
  const [completedTutorials, setCompletedTutorials] = useState<Set<string>>(new Set());

  const filteredTutorials = useMemo(() => 
    selectedCategory === "todos" 
      ? tutorials 
      : tutorials.filter(t => t.category === selectedCategory),
    [selectedCategory]
  );

  const toggleComplete = useCallback((tutorialId: string) => {
    setCompletedTutorials(prev => {
      const newSet = new Set(prev);
      if (newSet.has(tutorialId)) {
        newSet.delete(tutorialId);
      } else {
        newSet.add(tutorialId);
      }
      return newSet;
    });
  }, []);

  const handleToggleExpand = useCallback((tutorialId: string) => {
    setExpandedTutorial(prev => prev === tutorialId ? null : tutorialId);
  }, []);

  const progress = useMemo(() => 
    Math.round((completedTutorials.size / tutorials.length) * 100),
    [completedTutorials.size]
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <BookOpen className="h-7 w-7 text-primary" />
            Central de Tutoriais
          </h2>
          <p className="text-muted-foreground mt-1">
            Guias passo a passo para dominar todas as funcionalidades da plataforma
          </p>
        </div>
        
        <ProgressCircle 
          progress={progress} 
          completed={completedTutorials.size} 
          total={tutorials.length} 
        />
      </div>

      {/* Category Tabs */}
      <Tabs value={selectedCategory} onValueChange={setSelectedCategory} className="w-full">
        <TabsList className="w-full justify-start overflow-x-auto flex-nowrap bg-muted/50 p-1 h-auto">
          {categories.map((cat) => (
            <TabsTrigger 
              key={cat.id} 
              value={cat.id}
              className="flex items-center gap-2 px-4 py-2.5 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground whitespace-nowrap"
            >
              <cat.icon className="h-4 w-4" />
              <span className="hidden sm:inline">{cat.label}</span>
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value={selectedCategory} className="mt-6">
          <div className="grid gap-4">
            {filteredTutorials.map((tutorial) => (
              <TutorialCard
                key={tutorial.id}
                tutorial={tutorial}
                isExpanded={expandedTutorial === tutorial.id}
                isCompleted={completedTutorials.has(tutorial.id)}
                onToggleExpand={() => handleToggleExpand(tutorial.id)}
                onToggleComplete={() => toggleComplete(tutorial.id)}
              />
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Quick Help */}
      <Card className="bg-muted/30 border-dashed">
        <CardContent className="p-6 text-center">
          <p className="text-muted-foreground mb-4">
            Precisa de ajuda adicional? Nossa equipe está pronta para te auxiliar.
          </p>
          <Button variant="outline" asChild>
            <a 
              href="https://wa.me/5527998703988?text=Olá! Preciso de ajuda com a plataforma AcolheAqui."
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2"
            >
              <MessageCircle className="h-4 w-4" />
              Falar com Suporte
            </a>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default TutorialsPage;
