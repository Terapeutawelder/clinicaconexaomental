import { 
  MessageCircle, 
  Clock, 
  ArrowLeft, 
  Calendar, 
  Users, 
  CreditCard, 
  Video, 
  Headphones, 
  Crown,
  Bot,
  ChevronRight,
  Star,
  CheckCircle,
  Zap,
  Award,
  TrendingUp,
  Brain,
  Shield,
  Sparkles,
  Play,
  BookOpen,
  GraduationCap,
  MessageSquare,
  Heart,
  Target,
  Wifi,
  Palette,
  Layout,
  Eye,
  Instagram,
  Camera,
  Mic,
  MonitorPlay,
  PhoneCall,
  Quote,
  HelpCircle,
  Rocket,
  Clock3,
  Lock,
  Smile,
  BadgeCheck,
  ThumbsUp,
  Gift
} from "lucide-react";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Logo from "@/components/Logo";
import { Button } from "@/components/ui/button";
import Marquee from "@/components/Marquee";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import membersAreaMockup from "@/assets/members-area-mockup-acolheaqui-v3.png";
import landingPageMockup from "@/assets/feature-landing-page.jpg";
import virtualRoomMockup from "@/assets/feature-virtual-room.jpg";
import checkoutMockup from "@/assets/feature-checkout-proprio.png";
import instagramAgentMockup from "@/assets/feature-instagram-agent.png";
import crmAgendaMockup from "@/assets/feature-crm-agenda.webp";
import PlanComparisonSection from "@/components/pro/PlanComparisonSection";

// Use public folder avatars for faster loading
const avatar1 = "/avatars/avatar-1.jpg";
const avatar2 = "/avatars/avatar-2.jpg";
const avatar3 = "/avatars/avatar-3.jpg";

const highlights = [
  {
    icon: Bot,
    title: "Agente IA de Agendamento",
    description: "Automatize seus agendamentos via WhatsApp com IA."
  },
  {
    icon: Video,
    title: "Área de Membros Netflix",
    description: "Interface moderna para cursos, aulas e materiais."
  },
  {
    icon: MessageSquare,
    title: "Comunidade e Eventos",
    description: "Fórum de discussão e aulas ao vivo com seus alunos."
  },
  {
    icon: CreditCard,
    title: "Checkout + Certificados",
    description: "Receba pagamentos e emita certificados PDF automáticos."
  }
];

const faqs = [
  {
    question: "O que é o AcolheAqui?",
    answer: "O AcolheAqui é uma plataforma digital que conecta psicoterapeutas (psicólogos, psicanalistas e terapeutas) a pessoas em busca de terapia online. Cada profissional tem seu próprio perfil com informações sobre sua prática e um botão direto para contato via WhatsApp."
  },
  {
    question: "Como o paciente entra em contato comigo?",
    answer: "O contato é feito diretamente pelo WhatsApp, através do seu perfil na plataforma. O AcolheAqui não intermedeia conversas, agendamentos ou pagamentos — o vínculo é direto entre você e o paciente."
  },
  {
    question: "O que está incluso no Plano Premium?",
    answer: "O Plano Premium inclui TODOS os recursos da plataforma: perfil profissional, CRM com agenda, controle financeiro, integração com WhatsApp e Google Agenda/Meet, agentes de IA para agendamento automático, Instagram e follow-up, checkout de pagamento personalizado, notificações automáticas e suporte VIP 24/7."
  },
  {
    question: "O que são os Agentes de IA?",
    answer: "Os Agentes de IA são assistentes virtuais inteligentes que automatizam tarefas: o Agente de Agendamento marca consultas automaticamente, o Agente de Instagram responde mensagens do seu perfil profissional, e o Agente de Follow-up mantém contato com pacientes para lembretes e acompanhamento."
  },
  {
    question: "Como funciona o checkout personalizado?",
    answer: "Com o Plano Premium, você tem seu próprio checkout de pagamento integrado. Seus pacientes podem pagar diretamente através do seu link personalizado, e você recebe os valores diretamente na sua conta, sem intermediários."
  },
  {
    question: "Posso editar meu perfil depois de publicado?",
    answer: "Sim. Você pode editar suas informações, foto, bio, abordagens e outras informações do seu perfil a qualquer momento através do painel do profissional."
  },
  {
    question: "Quanto tempo leva para meu perfil ficar ativo?",
    answer: "Após a aprovação do cadastro, seu perfil fica ativo em até 24 horas. Você receberá uma notificação assim que estiver disponível para receber pacientes."
  },
  {
    question: "Posso cancelar a qualquer momento?",
    answer: "Sim, você pode cancelar sua assinatura a qualquer momento sem multas ou taxas adicionais. O acesso continua até o fim do período pago."
  }
];

const CadastroPremium = () => {
  const navigate = useNavigate();
  const whatsappLink = "https://chat.whatsapp.com/KxbbUiKKg8v3f3FB89nCV1";
  const targetDate = new Date("2026-01-30T00:00:00").getTime();

  const calculateTimeLeft = () => {
    const now = new Date().getTime();
    const difference = targetDate - now;

    if (difference <= 0) {
      return { days: 0, hours: 0, minutes: 0, seconds: 0 };
    }

    return {
      days: Math.floor(difference / (1000 * 60 * 60 * 24)),
      hours: Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
      minutes: Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)),
      seconds: Math.floor((difference % (1000 * 60)) / 1000),
    };
  };

  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());
  const [bgLoaded, setBgLoaded] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    const img = new Image();
    img.src = '/hero-bg-pro.jpg';
    img.onload = () => setBgLoaded(true);

    return () => clearInterval(timer);
  }, []);

  const handleScrollToPricing = () => {
    const el = document.querySelector("#precos");
    el?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div className="min-h-screen pro-theme">
      {/* Fixed Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <button
            onClick={() => {
              if (window.history.length > 1) {
                navigate(-1);
              } else {
                navigate("/");
              }
            }}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="font-medium">Voltar</span>
          </button>
          <Logo className="h-8" />
          <div className="w-20" />
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative min-h-screen flex flex-col items-center justify-center text-center px-4 py-20 pt-28">
        <div
          className={`absolute inset-0 bg-cover bg-center bg-no-repeat transition-opacity duration-700 ${
            bgLoaded ? "opacity-100" : "opacity-0"
          }`}
          style={{ backgroundImage: `url('/hero-bg-pro.jpg')` }}
        />
        
        <div
          className={`absolute inset-0 bg-gradient-to-br from-primary/20 to-muted transition-opacity duration-700 ${
            bgLoaded ? "opacity-0" : "opacity-100"
          }`}
        />
        
        <div className="absolute inset-0 bg-gradient-to-b from-background/40 via-background/50 to-background/75" />

        <div className="relative z-10 max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-amber-500/30 text-amber-400 rounded-full text-sm font-bold mb-6 animate-fade-in">
            <Crown className="w-4 h-4" />
            PLANO MAIS COMPLETO
          </div>

          <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6 leading-tight animate-fade-in-up">
            Desbloqueie todo o potencial com o{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-500">Plano Premium</span>!
          </h1>

          <p className="text-lg md:text-xl text-muted-foreground mb-10 max-w-2xl mx-auto animate-fade-in-up animate-delay-100">
            Recursos completos: CRM, integrações, agentes de IA, checkout próprio e muito mais para você crescer.
          </p>

          <a
            href={whatsappLink}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-3 px-8 py-4 text-lg font-semibold bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-full transition-all duration-300 hover:scale-105 hover:shadow-xl animate-pulse-glow animate-fade-in-up animate-delay-200"
          >
            <MessageCircle className="w-6 h-6" />
            ENTRAR NO GRUPO DE ESPERA!
          </a>

          <div className="mt-8 animate-fade-in-up animate-delay-300">
            <div className="inline-flex items-center gap-2 px-6 py-3 bg-amber-500/10 border border-amber-500/30 rounded-full">
              <Clock className="w-5 h-5 text-amber-400 animate-pulse" />
              <span className="text-foreground font-medium">Inscrições encerram em:</span>
            </div>
            <div className="mt-4 flex items-center justify-center gap-3 md:gap-4">
              <div className="flex flex-col items-center bg-background/50 backdrop-blur-sm border border-amber-500/30 rounded-lg px-4 py-3 min-w-[70px]">
                <span className="text-2xl md:text-3xl font-bold text-amber-400">{timeLeft.days}</span>
                <span className="text-xs text-muted-foreground uppercase">Dias</span>
              </div>
              <span className="text-2xl font-bold text-amber-400">:</span>
              <div className="flex flex-col items-center bg-background/50 backdrop-blur-sm border border-amber-500/30 rounded-lg px-4 py-3 min-w-[70px]">
                <span className="text-2xl md:text-3xl font-bold text-amber-400">{String(timeLeft.hours).padStart(2, '0')}</span>
                <span className="text-xs text-muted-foreground uppercase">Horas</span>
              </div>
              <span className="text-2xl font-bold text-amber-400">:</span>
              <div className="flex flex-col items-center bg-background/50 backdrop-blur-sm border border-amber-500/30 rounded-lg px-4 py-3 min-w-[70px]">
                <span className="text-2xl md:text-3xl font-bold text-amber-400">{String(timeLeft.minutes).padStart(2, '0')}</span>
                <span className="text-xs text-muted-foreground uppercase">Min</span>
              </div>
              <span className="text-2xl font-bold text-amber-400">:</span>
              <div className="flex flex-col items-center bg-background/50 backdrop-blur-sm border border-amber-500/30 rounded-lg px-4 py-3 min-w-[70px]">
                <span className="text-2xl md:text-3xl font-bold text-amber-400">{String(timeLeft.seconds).padStart(2, '0')}</span>
                <span className="text-xs text-muted-foreground uppercase">Seg</span>
              </div>
            </div>
          </div>

          <p className="mt-4 text-sm text-muted-foreground italic animate-fade-in-up animate-delay-400">
            <strong>Vagas limitadas</strong> • Acesso prioritário • Benefícios exclusivos
          </p>
        </div>
      </section>

      {/* Marquee */}
      <Marquee />

      {/* Recursos Exclusivos Premium Section */}
      <section className="py-20 px-4 bg-gradient-to-b from-background to-muted/20 overflow-hidden">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <span className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-500/20 to-orange-500/20 text-amber-600 rounded-full text-sm font-medium mb-4 animate-fade-in">
              <Rocket className="w-4 h-4 animate-bounce" />
              Recursos Exclusivos Premium
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4 animate-fade-in">
              Vantagens que fazem a <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-500 to-orange-500">diferença</span>
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto animate-fade-in">
              Descubra como o Plano Premium pode transformar e automatizar sua prática profissional
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { icon: Bot, label: "IA Integrada", color: "from-amber-500 to-orange-600", delay: 0 },
              { icon: Heart, label: "Atendimento Humanizado", color: "from-pink-500 to-fuchsia-600", delay: 100 },
              { icon: Award, label: "Qualidade Premium", color: "from-amber-500 to-yellow-600", delay: 200 },
              { icon: TrendingUp, label: "Crescimento Rápido", color: "from-green-500 to-emerald-600", delay: 300 },
              { icon: Clock3, label: "Economia de Tempo", color: "from-blue-500 to-cyan-600", delay: 400 },
              { icon: CreditCard, label: "Checkout Próprio", color: "from-violet-500 to-purple-600", delay: 500 },
              { icon: Lock, label: "Dados Seguros", color: "from-slate-500 to-gray-600", delay: 600 },
              { icon: Video, label: "Área de Membros", color: "from-pink-500 to-rose-600", delay: 700 }
            ].map((item, index) => (
              <div
                key={index}
                className="group relative bg-card border border-border rounded-2xl p-6 text-center hover:border-transparent transition-all duration-500 hover:shadow-2xl hover:-translate-y-2 animate-fade-in cursor-pointer overflow-hidden"
                style={{ animationDelay: `${item.delay}ms` }}
              >
                {/* Hover gradient background */}
                <div className={`absolute inset-0 bg-gradient-to-br ${item.color} opacity-0 group-hover:opacity-10 transition-opacity duration-500`} />
                
                {/* Glow effect on hover */}
                <div className={`absolute -inset-1 bg-gradient-to-br ${item.color} opacity-0 group-hover:opacity-20 blur-xl transition-opacity duration-500`} />
                
                <div className={`relative w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br ${item.color} flex items-center justify-center mb-4 group-hover:scale-110 group-hover:rotate-3 transition-all duration-500 shadow-lg`}>
                  <item.icon className="w-8 h-8 text-white group-hover:animate-pulse" />
                </div>
                <p className="relative font-semibold text-foreground group-hover:text-foreground transition-colors">
                  {item.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Members Area Section */}
      <section className="py-24 bg-[hsl(215_35%_14%)]">
        <div className="container mx-auto px-4">
          <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-16">
            <div className="flex-1 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/20 text-primary rounded-full text-sm font-medium mb-6">
                <Video className="w-4 h-4" />
                Área de Membros
              </div>
              
              <h2 className="text-3xl md:text-5xl font-extrabold text-white mb-6">
                Sua própria plataforma{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-violet-400">estilo Netflix</span>
              </h2>

              <div className="flex flex-wrap gap-6 mb-8 justify-center lg:justify-start">
                <div className="flex items-center gap-2 text-white/75">
                  <Video size={18} className="text-primary" />
                  <span className="font-medium">Estilo Netflix</span>
                </div>
                <div className="flex items-center gap-2 text-white/75">
                  <Users size={18} className="text-amber-500" />
                  <span className="font-medium">Sem custos extras</span>
                </div>
                <div className="flex items-center gap-2 text-white/75">
                  <Star size={18} className="text-primary" />
                  <span className="font-medium">Personalizável</span>
                </div>
              </div>

              <p className="text-lg text-white/75 mb-4 max-w-lg mx-auto lg:mx-0">
                Crie cursos, módulos e aulas organizadas em uma interface moderna e profissional. Seus alunos terão acesso a uma experiência premium.
              </p>
              <p className="text-lg text-white/60 mb-8 max-w-lg mx-auto lg:mx-0">
                Emita certificados PDF automáticos, crie comunidades e organize eventos ao vivo com integração Google Meet.
              </p>

              <Button
                size="lg"
                onClick={handleScrollToPricing}
                className="h-14 px-8 text-lg font-bold rounded-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 shadow-lg hover:shadow-xl transition-all duration-300"
              >
                Começar Agora
                <ChevronRight className="ml-2" size={20} />
              </Button>
            </div>

            <div className="flex-[1.5]">
              <div className="overflow-hidden">
                <img
                  src={membersAreaMockup}
                  alt="Área de Membros AcolheAqui"
                  loading="lazy"
                  className="block w-full max-w-none transform-gpu scale-[1.04]"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Courses & Certificates Section */}
      <section className="py-24 bg-gradient-to-b from-background to-muted/30">
        <div className="container mx-auto px-4">
          <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-20">
            <div className="flex-1 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-500/20 to-orange-500/20 text-amber-400 rounded-full text-sm font-medium mb-6">
                <GraduationCap className="w-4 h-4" />
                Cursos & Certificados
              </div>
              
              <h2 className="text-3xl md:text-5xl font-extrabold text-foreground mb-6">
                Monte cursos profissionais e emita{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-500">certificados automaticamente</span>
              </h2>

              <p className="text-lg text-muted-foreground mb-4 max-w-lg mx-auto lg:mx-0">
                Estruture seu conhecimento em módulos e aulas com player de vídeo profissional. Ao concluir, seus alunos recebem certificados PDF personalizados com sua assinatura.
              </p>
              <p className="text-base text-muted-foreground/80 mb-8 max-w-lg mx-auto lg:mx-0">
                Acompanhe o progresso de cada aluno em tempo real e identifique oportunidades de melhoria no seu conteúdo.
              </p>

              <div className="space-y-4 mb-8">
                {[
                  { icon: BookOpen, text: "Crie módulos e aulas ilimitadas" },
                  { icon: Play, text: "Player de vídeo otimizado para streaming" },
                  { icon: Award, text: "Certificados PDF com design personalizado" },
                  { icon: TrendingUp, text: "Dashboard de progresso por aluno" }
                ].map((item, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-500/20 to-orange-500/20 flex items-center justify-center">
                      <item.icon className="w-4 h-4 text-amber-400" />
                    </div>
                    <span className="text-muted-foreground">{item.text}</span>
                  </div>
                ))}
              </div>

              <Button
                size="lg"
                onClick={handleScrollToPricing}
                className="h-14 px-8 text-lg font-bold rounded-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 shadow-lg hover:shadow-xl transition-all duration-300"
              >
                Criar Meus Cursos
                <GraduationCap className="ml-2" size={20} />
              </Button>
            </div>

            <div className="flex-1">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-amber-500/20 to-orange-500/20 rounded-3xl blur-3xl" />
                <div className="relative bg-gradient-to-br from-[hsl(215_35%_18%)] to-[hsl(215_35%_12%)] rounded-3xl p-8 border border-amber-500/20">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h4 className="text-white font-bold text-lg">Gestão da Ansiedade</h4>
                      <p className="text-white/50 text-sm">12 módulos • 48 aulas • 8h de conteúdo</p>
                    </div>
                    <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center">
                      <BookOpen className="w-7 h-7 text-white" />
                    </div>
                  </div>

                  <div className="mb-6">
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-white/60">Progresso do aluno</span>
                      <span className="text-amber-400 font-bold">100% concluído</span>
                    </div>
                    <div className="h-3 bg-white/10 rounded-full overflow-hidden">
                      <div className="h-full w-full bg-gradient-to-r from-amber-500 to-orange-500 rounded-full" />
                    </div>
                  </div>

                  <div className="bg-gradient-to-r from-amber-500/10 to-orange-500/10 rounded-xl p-5 border border-amber-500/20">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center">
                        <Award className="w-7 h-7 text-white" />
                      </div>
                      <div>
                        <p className="text-amber-400 font-bold text-lg">Certificado Disponível!</p>
                        <p className="text-white/60 text-sm">PDF pronto para download</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* AI Agents Section */}
      <section className="py-24 bg-[hsl(215_35%_14%)]">
        <div className="container mx-auto px-4">
          <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-20">
            <div className="flex-1 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 text-cyan-400 rounded-full text-sm font-medium mb-6">
                <Bot className="w-4 h-4" />
                Agentes de IA
              </div>
              
              <h2 className="text-3xl md:text-5xl font-extrabold text-white mb-6">
                Automatize sua clínica com{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">Inteligência Artificial avançada</span>
              </h2>

              <p className="text-lg text-white/75 mb-4 max-w-lg mx-auto lg:mx-0">
                Nossos agentes de IA trabalham incansavelmente para você. Agendam consultas, respondem pacientes no WhatsApp e fazem follow-up automático.
              </p>
              <p className="text-base text-white/60 mb-8 max-w-lg mx-auto lg:mx-0">
                Configure uma vez e deixe a tecnologia trabalhar 24/7 enquanto você foca no que realmente importa: seus pacientes.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
                <div className="flex items-start gap-3 p-4 bg-white/5 rounded-xl border border-cyan-500/20 hover:border-cyan-500/40 transition-all duration-300">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-cyan-500/20 to-blue-500/20 flex items-center justify-center shrink-0">
                    <MessageCircle className="w-5 h-5 text-cyan-400" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-white mb-1">Agendamento Inteligente</h4>
                    <p className="text-sm text-white/60">IA agenda consultas via WhatsApp automaticamente</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-4 bg-white/5 rounded-xl border border-cyan-500/20 hover:border-cyan-500/40 transition-all duration-300">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-cyan-500/20 to-blue-500/20 flex items-center justify-center shrink-0">
                    <Heart className="w-5 h-5 text-cyan-400" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-white mb-1">Follow-up Personalizado</h4>
                    <p className="text-sm text-white/60">Acompanhamento automático pós-sessão</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-4 bg-white/5 rounded-xl border border-cyan-500/20 hover:border-cyan-500/40 transition-all duration-300">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-cyan-500/20 to-blue-500/20 flex items-center justify-center shrink-0">
                    <Brain className="w-5 h-5 text-cyan-400" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-white mb-1">Análise de Sessões</h4>
                    <p className="text-sm text-white/60">Transcrição e insights com IA generativa</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-4 bg-white/5 rounded-xl border border-cyan-500/20 hover:border-cyan-500/40 transition-all duration-300">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-cyan-500/20 to-blue-500/20 flex items-center justify-center shrink-0">
                    <Zap className="w-5 h-5 text-cyan-400" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-white mb-1">Respostas Instantâneas</h4>
                    <p className="text-sm text-white/60">Atendimento humanizado 24 horas</p>
                  </div>
                </div>
              </div>

              <Button
                size="lg"
                onClick={handleScrollToPricing}
                className="h-14 px-8 text-lg font-bold rounded-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 shadow-lg hover:shadow-xl transition-all duration-300"
              >
                Quero Automatizar
                <Bot className="ml-2" size={20} />
              </Button>
            </div>

            <div className="flex-1">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 rounded-3xl blur-3xl" />
                <div className="relative bg-gradient-to-br from-[hsl(215_35%_18%)] to-[hsl(215_35%_12%)] rounded-3xl p-8 border border-cyan-500/20">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center">
                      <Bot className="w-8 h-8 text-white" />
                    </div>
                    <div>
                      <h4 className="text-xl font-bold text-white">Agente AcolheAqui</h4>
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                        <p className="text-cyan-400 text-sm">Online 24/7</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="bg-white/5 rounded-2xl rounded-tl-sm p-4 max-w-[80%]">
                      <p className="text-white/80 text-sm">Olá! Gostaria de agendar uma consulta para próxima semana.</p>
                    </div>
                    <div className="bg-gradient-to-r from-cyan-500/20 to-blue-500/20 rounded-2xl rounded-tr-sm p-4 max-w-[80%] ml-auto">
                      <p className="text-cyan-300 text-sm">Claro! Temos horários disponíveis na terça às 14h ou quinta às 16h. Qual prefere? 🗓️</p>
                    </div>
                    <div className="bg-white/5 rounded-2xl rounded-tl-sm p-4 max-w-[80%]">
                      <p className="text-white/80 text-sm">Terça às 14h está ótimo!</p>
                    </div>
                    <div className="bg-gradient-to-r from-cyan-500/20 to-blue-500/20 rounded-2xl rounded-tr-sm p-4 max-w-[80%] ml-auto">
                      <p className="text-cyan-300 text-sm">Perfeito! Agendamento confirmado ✅ Enviarei um lembrete no dia anterior.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CRM Section */}
      <section className="py-24 bg-gradient-to-b from-background to-muted/30">
        <div className="container mx-auto px-4">
          <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-20">
            <div className="flex-1 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500/20 to-pink-500/20 text-purple-400 rounded-full text-sm font-medium mb-6">
                <Calendar className="w-4 h-4" />
                CRM Profissional
              </div>
              
              <h2 className="text-3xl md:text-5xl font-extrabold text-foreground mb-6">
                Gerencie toda sua clínica com{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-500">CRM completo e intuitivo</span>
              </h2>

              <p className="text-lg text-muted-foreground mb-4 max-w-lg mx-auto lg:mx-0">
                Agenda inteligente com sincronização Google Calendar, prontuário digital estruturado por paciente e histórico completo de sessões.
              </p>
              <p className="text-base text-muted-foreground/80 mb-8 max-w-lg mx-auto lg:mx-0">
                Tenha controle financeiro total com relatórios detalhados e métricas de desempenho da sua prática.
              </p>

              <div className="space-y-4 mb-8">
                {[
                  { icon: Calendar, text: "Agenda integrada com Google Calendar e Meet" },
                  { icon: Users, text: "Prontuário digital completo por paciente" },
                  { icon: TrendingUp, text: "Dashboard com métricas e relatórios financeiros" },
                  { icon: Shield, text: "Dados protegidos com criptografia de ponta" }
                ].map((item, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center">
                      <item.icon className="w-4 h-4 text-purple-400" />
                    </div>
                    <span className="text-muted-foreground">{item.text}</span>
                  </div>
                ))}
              </div>

              <Button
                size="lg"
                onClick={handleScrollToPricing}
                className="h-14 px-8 text-lg font-bold rounded-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 shadow-lg hover:shadow-xl transition-all duration-300"
              >
                Organizar Minha Clínica
                <Calendar className="ml-2" size={20} />
              </Button>
            </div>

            <div className="flex-[1.5]">
              <div className="relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-3xl blur-3xl" />
                <img 
                  src={crmAgendaMockup} 
                  alt="CRM e Agenda Profissional com visão mobile e desktop" 
                  loading="lazy"
                  className="relative w-full max-w-none transform-gpu scale-[1.1] -scale-x-100"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Checkout Section */}
      <section className="py-24 bg-[hsl(215_35%_14%)]">
        <div className="container mx-auto px-4">
          <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-20">
            <div className="flex-1 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-500/20 to-orange-500/20 text-amber-400 rounded-full text-sm font-medium mb-6">
                <CreditCard className="w-4 h-4" />
                Checkout Profissional
              </div>
              
              <h2 className="text-3xl md:text-5xl font-extrabold text-white mb-6">
                Receba pagamentos com seu{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-500">checkout profissional</span>
              </h2>

              <p className="text-lg text-white/75 mb-4 max-w-lg mx-auto lg:mx-0">
                Checkout totalmente personalizado com sua marca. Aceite Pix instantâneo, cartão de crédito em até 12x e boleto bancário.
              </p>
              <p className="text-base text-white/60 mb-8 max-w-lg mx-auto lg:mx-0">
                O dinheiro cai diretamente na sua conta, sem intermediários. Você tem controle total sobre suas vendas.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
                <div className="flex items-center gap-3 p-4 bg-white/5 rounded-xl border border-green-500/20">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <span className="text-white/80">Pix instantâneo 24h</span>
                </div>
                <div className="flex items-center gap-3 p-4 bg-white/5 rounded-xl border border-green-500/20">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <span className="text-white/80">Cartão em até 12x</span>
                </div>
                <div className="flex items-center gap-3 p-4 bg-white/5 rounded-xl border border-green-500/20">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <span className="text-white/80">Sem taxas ocultas</span>
                </div>
                <div className="flex items-center gap-3 p-4 bg-white/5 rounded-xl border border-green-500/20">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <span className="text-white/80">Dinheiro na sua conta</span>
                </div>
              </div>

              <Button
                size="lg"
                onClick={handleScrollToPricing}
                className="h-14 px-8 text-lg font-bold rounded-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 shadow-lg hover:shadow-xl transition-all duration-300"
              >
                Quero Meu Checkout
                <CreditCard className="ml-2" size={20} />
              </Button>
            </div>

            <div className="flex-1">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-green-500/20 to-emerald-500/20 rounded-3xl blur-3xl" />
                <img 
                  src={checkoutMockup} 
                  alt="Dashboard de receita com notificações de vendas aprovadas" 
                  className="relative rounded-3xl border border-green-500/20 shadow-2xl w-full h-auto"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Community & Events Section */}
      <section className="py-24 bg-gradient-to-b from-background to-muted/30">
        <div className="container mx-auto px-4">
          <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-20">
            <div className="flex-1 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-rose-500/20 to-pink-500/20 text-rose-400 rounded-full text-sm font-medium mb-6">
                <MessageSquare className="w-4 h-4" />
                Comunidade & Eventos
              </div>
              
              <h2 className="text-3xl md:text-5xl font-extrabold text-foreground mb-6">
                Conecte-se com seus alunos em{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-400 to-pink-500">comunidade exclusiva</span>
              </h2>

              <p className="text-lg text-muted-foreground mb-4 max-w-lg mx-auto lg:mx-0">
                Crie um espaço de discussão vibrante para seus alunos. Fórum com likes, comentários e posts fixados para conteúdos importantes.
              </p>
              <p className="text-base text-muted-foreground/80 mb-8 max-w-lg mx-auto lg:mx-0">
                Organize eventos ao vivo com integração automática ao Google Meet. Supervisões, mentorias e aulas especiais.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
                <div className="flex items-start gap-3 p-4 bg-card rounded-xl border border-border hover:border-rose-500/30 transition-all duration-300">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-rose-500/20 to-pink-500/20 flex items-center justify-center shrink-0">
                    <MessageSquare className="w-5 h-5 text-rose-400" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground mb-1">Fórum Interativo</h4>
                    <p className="text-sm text-muted-foreground">Espaço para dúvidas e networking</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-4 bg-card rounded-xl border border-border hover:border-rose-500/30 transition-all duration-300">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-rose-500/20 to-pink-500/20 flex items-center justify-center shrink-0">
                    <Video className="w-5 h-5 text-rose-400" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground mb-1">Eventos ao Vivo</h4>
                    <p className="text-sm text-muted-foreground">Integração nativa com Google Meet</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-4 bg-card rounded-xl border border-border hover:border-rose-500/30 transition-all duration-300">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-rose-500/20 to-pink-500/20 flex items-center justify-center shrink-0">
                    <Heart className="w-5 h-5 text-rose-400" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground mb-1">Engajamento Real</h4>
                    <p className="text-sm text-muted-foreground">Likes, comentários e interações</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-4 bg-card rounded-xl border border-border hover:border-rose-500/30 transition-all duration-300">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-rose-500/20 to-pink-500/20 flex items-center justify-center shrink-0">
                    <Target className="w-5 h-5 text-rose-400" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground mb-1">Posts em Destaque</h4>
                    <p className="text-sm text-muted-foreground">Fixe conteúdos importantes</p>
                  </div>
                </div>
              </div>

              <Button
                size="lg"
                onClick={handleScrollToPricing}
                className="h-14 px-8 text-lg font-bold rounded-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 shadow-lg hover:shadow-xl transition-all duration-300"
              >
                Criar Minha Comunidade
                <Users className="ml-2" size={20} />
              </Button>
            </div>

            <div className="flex-1">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-rose-500/20 to-pink-500/20 rounded-3xl blur-3xl" />
                <div className="relative bg-gradient-to-br from-[hsl(215_35%_18%)] to-[hsl(215_35%_12%)] rounded-3xl p-6 border border-rose-500/20">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-14 h-14 rounded-full bg-gradient-to-br from-rose-500 to-pink-500 flex items-center justify-center">
                      <Users className="w-7 h-7 text-white" />
                    </div>
                    <div>
                      <h4 className="text-white font-bold text-lg">Comunidade Premium</h4>
                      <p className="text-white/50 text-sm">127 membros ativos</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="bg-white/5 rounded-xl p-4">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-rose-500 to-pink-500" />
                        <span className="text-white font-medium">Ana Paula</span>
                        <span className="text-white/40 text-sm">há 2h</span>
                      </div>
                      <p className="text-white/70 text-sm">Amei a aula sobre técnicas de respiração! Já estou aplicando com meus pacientes 🙏</p>
                      <div className="flex items-center gap-4 mt-3">
                        <button className="flex items-center gap-1 text-rose-400 text-sm font-medium">
                          <Heart className="w-4 h-4 fill-rose-400" /> 24
                        </button>
                        <button className="flex items-center gap-1 text-white/50 text-sm">
                          <MessageSquare className="w-4 h-4" /> 8
                        </button>
                      </div>
                    </div>

                    <div className="bg-gradient-to-r from-rose-500/10 to-pink-500/10 rounded-xl p-4 border border-rose-500/20">
                      <div className="flex items-center gap-2 mb-2">
                        <Video className="w-4 h-4 text-rose-400" />
                        <span className="text-rose-400 font-semibold text-sm">Evento ao vivo</span>
                      </div>
                      <p className="text-white font-semibold">Supervisão em Grupo</p>
                      <p className="text-white/50 text-sm">Amanhã às 19h • Google Meet</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Landing Page Section */}
      <section className="py-24 bg-gradient-to-b from-background to-muted/30">
        <div className="container mx-auto px-4">
          <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-20">
            <div className="flex-1 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-fuchsia-500/20 to-violet-500/20 text-fuchsia-400 rounded-full text-sm font-medium mb-6">
                <Palette className="w-4 h-4" />
                Landing Page Personalizada
              </div>
              
              <h2 className="text-3xl md:text-5xl font-extrabold text-foreground mb-6">
                Sua página profissional com{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-fuchsia-400 to-violet-500">design exclusivo</span>
              </h2>

              <p className="text-lg text-muted-foreground mb-4 max-w-lg mx-auto lg:mx-0">
                Crie uma landing page impactante com editor visual intuitivo. Personalize cores, textos, imagens e organize seções do seu jeito.
              </p>
              <p className="text-base text-muted-foreground/80 mb-8 max-w-lg mx-auto lg:mx-0">
                Integração com agendamento online, formulário de contato e links para suas redes sociais. Tudo em um só lugar.
              </p>

              <div className="space-y-4 mb-8">
                {[
                  { icon: Palette, text: "Editor visual drag-and-drop" },
                  { icon: Layout, text: "Templates profissionais pré-configurados" },
                  { icon: Eye, text: "Preview em tempo real" },
                  { icon: Calendar, text: "Integração nativa com agendamento" }
                ].map((item, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-fuchsia-500/20 to-violet-500/20 flex items-center justify-center">
                      <item.icon className="w-4 h-4 text-fuchsia-400" />
                    </div>
                    <span className="text-muted-foreground">{item.text}</span>
                  </div>
                ))}
              </div>

              <Button
                size="lg"
                onClick={handleScrollToPricing}
                className="h-14 px-8 text-lg font-bold rounded-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 shadow-lg hover:shadow-xl transition-all duration-300"
              >
                Criar Minha Página
                <Palette className="ml-2" size={20} />
              </Button>
            </div>

            <div className="flex-1">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-fuchsia-500/20 to-violet-500/20 rounded-3xl blur-3xl" />
                <div className="relative overflow-hidden rounded-3xl border border-fuchsia-500/20 shadow-2xl">
                  <img
                    src={landingPageMockup}
                    alt="Landing Page Personalizada para Profissionais"
                    loading="lazy"
                    className="w-full h-auto object-cover"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Instagram AI Agent Section */}
      <section className="py-24 bg-[hsl(215_35%_14%)]">
        <div className="container mx-auto px-4">
          <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-20">
            <div className="flex-1 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-pink-500/20 to-orange-500/20 text-pink-400 rounded-full text-sm font-medium mb-6">
                <Instagram className="w-4 h-4" />
                Agente IA Instagram
              </div>
              
              <h2 className="text-3xl md:text-5xl font-extrabold text-white mb-6">
                Converta seguidores em pacientes com{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-400 via-rose-500 to-orange-500">IA no Instagram</span>
              </h2>

              <p className="text-lg text-white/75 mb-4 max-w-lg mx-auto lg:mx-0">
                Nosso agente de IA responde automaticamente às mensagens do Instagram Direct, qualifica leads e direciona para agendamento.
              </p>
              <p className="text-base text-white/60 mb-8 max-w-lg mx-auto lg:mx-0">
                Nunca mais perca uma oportunidade por responder tarde demais. A IA trabalha 24 horas por você.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
                <div className="flex items-start gap-3 p-4 bg-white/5 rounded-xl border border-pink-500/20 hover:border-pink-500/40 transition-all duration-300">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-pink-500/20 to-orange-500/20 flex items-center justify-center shrink-0">
                    <MessageCircle className="w-5 h-5 text-pink-400" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-white mb-1">Respostas Automáticas</h4>
                    <p className="text-sm text-white/60">DMs respondidas em segundos</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-4 bg-white/5 rounded-xl border border-pink-500/20 hover:border-pink-500/40 transition-all duration-300">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-pink-500/20 to-orange-500/20 flex items-center justify-center shrink-0">
                    <Target className="w-5 h-5 text-pink-400" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-white mb-1">Qualificação de Leads</h4>
                    <p className="text-sm text-white/60">Identifica clientes ideais</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-4 bg-white/5 rounded-xl border border-pink-500/20 hover:border-pink-500/40 transition-all duration-300">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-pink-500/20 to-orange-500/20 flex items-center justify-center shrink-0">
                    <Calendar className="w-5 h-5 text-pink-400" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-white mb-1">Agendamento Direto</h4>
                    <p className="text-sm text-white/60">Converte em consultas agendadas</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-4 bg-white/5 rounded-xl border border-pink-500/20 hover:border-pink-500/40 transition-all duration-300">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-pink-500/20 to-orange-500/20 flex items-center justify-center shrink-0">
                    <Zap className="w-5 h-5 text-pink-400" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-white mb-1">Atendimento 24/7</h4>
                    <p className="text-sm text-white/60">Nunca perde uma oportunidade</p>
                  </div>
                </div>
              </div>

              <Button
                size="lg"
                onClick={handleScrollToPricing}
                className="h-14 px-8 text-lg font-bold rounded-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 shadow-lg hover:shadow-xl transition-all duration-300"
              >
                Ativar IA no Instagram
                <Instagram className="ml-2" size={20} />
              </Button>
            </div>

            <div className="flex-1">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-pink-500/20 to-orange-500/20 rounded-3xl blur-3xl" />
                <div className="relative overflow-hidden rounded-3xl border border-pink-500/20 shadow-2xl">
                  <img
                    src={instagramAgentMockup}
                    alt="Agente de IA no Instagram"
                    loading="lazy"
                    className="w-full h-auto object-cover"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Virtual Room / Telehealth Section */}
      <section className="py-24 bg-gradient-to-b from-background to-muted/30">
        <div className="container mx-auto px-4">
          <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-20">
            <div className="flex-1 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-sky-500/20 to-teal-500/20 text-sky-400 rounded-full text-sm font-medium mb-6">
                <Video className="w-4 h-4" />
                Sala Virtual de Tele Atendimento
              </div>
              
              <h2 className="text-3xl md:text-5xl font-extrabold text-foreground mb-6">
                Atenda seus pacientes de qualquer lugar com{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-teal-500">videochamadas profissionais</span>
              </h2>

              <p className="text-lg text-muted-foreground mb-4 max-w-lg mx-auto lg:mx-0">
                Sala virtual integrada com gravação automática, transcrição por IA e análise de sessão. Tudo em uma interface segura e fácil de usar.
              </p>
              <p className="text-base text-muted-foreground/80 mb-8 max-w-lg mx-auto lg:mx-0">
                Também sincroniza automaticamente com Google Meet para quem já usa a ferramenta do Google.
              </p>

              <div className="space-y-4 mb-8">
                {[
                  { icon: Video, text: "Videochamada HD com áudio cristalino" },
                  { icon: Camera, text: "Gravação automática das sessões" },
                  { icon: Mic, text: "Transcrição inteligente com IA" },
                  { icon: Brain, text: "Análise psicológica assistida" }
                ].map((item, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-sky-500/20 to-teal-500/20 flex items-center justify-center">
                      <item.icon className="w-4 h-4 text-sky-400" />
                    </div>
                    <span className="text-muted-foreground">{item.text}</span>
                  </div>
                ))}
              </div>

              <Button
                size="lg"
                onClick={handleScrollToPricing}
                className="h-14 px-8 text-lg font-bold rounded-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 shadow-lg hover:shadow-xl transition-all duration-300"
              >
                Ativar Sala Virtual
                <Video className="ml-2" size={20} />
              </Button>
            </div>

            <div className="flex-1">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-sky-500/20 to-teal-500/20 rounded-3xl blur-3xl" />
                <div className="relative overflow-hidden rounded-3xl border border-sky-500/20 shadow-2xl">
                  <img
                    src={virtualRoomMockup}
                    alt="Sala Virtual de Tele Atendimento"
                    loading="lazy"
                    className="w-full h-auto object-cover"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* VIP Support Section */}
      <section className="py-24 bg-[hsl(215_35%_14%)]">
        <div className="container mx-auto px-4">
          <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-20">
            <div className="flex-1 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-indigo-500/20 to-violet-500/20 text-indigo-400 rounded-full text-sm font-medium mb-6">
                <Headphones className="w-4 h-4" />
                Suporte VIP
              </div>
              
              <h2 className="text-3xl md:text-5xl font-extrabold text-white mb-6">
                Atendimento prioritário{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-violet-500">disponível 24 horas</span>
              </h2>

              <p className="text-lg text-white/75 mb-4 max-w-lg mx-auto lg:mx-0">
                Como membro Premium, você tem acesso exclusivo a uma equipe dedicada que responde suas dúvidas em minutos, não horas.
              </p>
              <p className="text-base text-white/60 mb-8 max-w-lg mx-auto lg:mx-0">
                Receba onboarding personalizado e tenha prioridade em todas as novas funcionalidades da plataforma.
              </p>

              <div className="space-y-4 mb-8">
                {[
                  { icon: Zap, text: "Resposta garantida em até 15 minutos" },
                  { icon: Wifi, text: "Chat ao vivo exclusivo para Premium" },
                  { icon: Sparkles, text: "Onboarding personalizado com especialista" },
                  { icon: Award, text: "Acesso antecipado a novas features" }
                ].map((item, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500/20 to-violet-500/20 flex items-center justify-center">
                      <item.icon className="w-4 h-4 text-indigo-400" />
                    </div>
                    <span className="text-white/80">{item.text}</span>
                  </div>
                ))}
              </div>

              <Button
                size="lg"
                onClick={handleScrollToPricing}
                className="h-14 px-8 text-lg font-bold rounded-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 shadow-lg hover:shadow-xl transition-all duration-300"
              >
                Quero Suporte VIP
                <Headphones className="ml-2" size={20} />
              </Button>
            </div>

            <div className="flex-1">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/20 to-violet-500/20 rounded-3xl blur-3xl" />
                <div className="relative bg-gradient-to-br from-[hsl(215_35%_18%)] to-[hsl(215_35%_12%)] rounded-3xl p-8 border border-indigo-500/20">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center">
                      <Headphones className="w-8 h-8 text-white" />
                    </div>
                    <div>
                      <h4 className="text-white font-bold text-lg">Suporte Premium</h4>
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                        <span className="text-green-400 text-sm">Online agora</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4 mb-6">
                    <div className="bg-white/5 rounded-2xl rounded-tl-sm p-4 max-w-[85%]">
                      <p className="text-white/80 text-sm">Olá! Como posso ajudar você hoje?</p>
                    </div>
                    <div className="bg-gradient-to-r from-indigo-500/20 to-violet-500/20 rounded-2xl rounded-tr-sm p-4 max-w-[85%] ml-auto">
                      <p className="text-indigo-300 text-sm">Preciso de ajuda para configurar meu checkout.</p>
                    </div>
                    <div className="bg-white/5 rounded-2xl rounded-tl-sm p-4 max-w-[85%]">
                      <p className="text-white/80 text-sm">Claro! Vou te guiar passo a passo. Primeiro, acesse Configurações &gt; Checkout...</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-gradient-to-r from-indigo-500/10 to-violet-500/10 rounded-xl border border-indigo-500/20">
                    <div className="flex items-center gap-2">
                      <Zap className="w-4 h-4 text-indigo-400" />
                      <span className="text-white/80 text-sm">Tempo médio de resposta</span>
                    </div>
                    <span className="text-indigo-400 font-bold text-lg">~5 min</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 px-4 bg-background">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <span className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-500/20 to-orange-500/20 text-amber-500 rounded-full text-sm font-medium mb-4 animate-fade-in">
              <Quote className="w-4 h-4" />
              Depoimentos
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4 animate-fade-in">
              O que dizem os <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-500">profissionais</span>
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto animate-fade-in">
              Veja o que psicoterapeutas que já usam a plataforma têm a dizer
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Testimonial 1 */}
            <div className="bg-card border border-border rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
              <Quote className="w-8 h-8 text-amber-500/30 mb-4" />
              <p className="text-foreground mb-6 leading-relaxed">
                "Os agentes de IA mudaram minha rotina! Não preciso mais responder mensagens manualmente, tudo é automatizado."
              </p>
              <div className="flex items-center gap-4">
                <img 
                  src={avatar1} 
                  alt="Dra. Mariana Silva" 
                  loading="lazy"
                  decoding="async"
                  className="w-12 h-12 rounded-full object-cover border-2 border-amber-500/20"
                />
                <div>
                  <p className="font-semibold text-foreground">Dra. Mariana Silva</p>
                  <p className="text-sm text-muted-foreground">Psicóloga Clínica • SP</p>
                </div>
              </div>
              <div className="flex gap-1 mt-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-amber-500 text-amber-500" />
                ))}
              </div>
            </div>

            {/* Testimonial 2 */}
            <div className="bg-card border border-border rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
              <Quote className="w-8 h-8 text-amber-500/30 mb-4" />
              <p className="text-foreground mb-6 leading-relaxed">
                "O checkout próprio foi um diferencial enorme! Meus pacientes pagam diretamente e eu recebo sem intermediários."
              </p>
              <div className="flex items-center gap-4">
                <img 
                  src={avatar2} 
                  alt="Dr. Rafael Costa" 
                  loading="lazy"
                  decoding="async"
                  className="w-12 h-12 rounded-full object-cover border-2 border-amber-500/20"
                />
                <div>
                  <p className="font-semibold text-foreground">Dr. Rafael Costa</p>
                  <p className="text-sm text-muted-foreground">Neuropsicólogo • RJ</p>
                </div>
              </div>
              <div className="flex gap-1 mt-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-amber-500 text-amber-500" />
                ))}
              </div>
            </div>

            {/* Testimonial 3 */}
            <div className="bg-card border border-border rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
              <Quote className="w-8 h-8 text-amber-500/30 mb-4" />
              <p className="text-foreground mb-6 leading-relaxed">
                "A integração com Google Agenda e Meet facilitou demais. Tudo sincronizado automaticamente!"
              </p>
              <div className="flex items-center gap-4">
                <img 
                  src={avatar3} 
                  alt="Dra. Carolina Mendes" 
                  loading="lazy"
                  decoding="async"
                  className="w-12 h-12 rounded-full object-cover border-2 border-amber-500/20"
                />
                <div>
                  <p className="font-semibold text-foreground">Dra. Carolina Mendes</p>
                  <p className="text-sm text-muted-foreground">Psicóloga TCC • MG</p>
                </div>
              </div>
              <div className="flex gap-1 mt-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-amber-500 text-amber-500" />
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Process Steps Section - Como Funciona */}
      <section className="py-20 px-4 bg-muted/20">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <span className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500/20 to-indigo-500/20 text-blue-600 rounded-full text-sm font-medium mb-4 animate-fade-in">
              <Brain className="w-4 h-4" />
              Como Funciona
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4 animate-fade-in">
              Simples assim para <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-500 to-orange-500">começar</span>
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto animate-fade-in">
              Em apenas 3 passos você estará atendendo pacientes de todo o Brasil com automação
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                step: "01",
                icon: BadgeCheck,
                title: "Faça seu Cadastro",
                description: "Preencha seus dados profissionais, CRP e informações da sua prática clínica.",
                color: "from-emerald-500 to-teal-600"
              },
              {
                step: "02",
                icon: Crown,
                title: "Ative o Plano Premium",
                description: "Desbloqueie todos os recursos: agentes de IA, checkout próprio e integrações completas.",
                color: "from-amber-500 to-orange-600"
              },
              {
                step: "03",
                icon: Smile,
                title: "Automatize e Cresça",
                description: "Deixe a IA trabalhar por você enquanto foca no que realmente importa: seus pacientes.",
                color: "from-violet-500 to-purple-600"
              }
            ].map((item, index) => (
              <div
                key={index}
                className="group relative animate-fade-in"
                style={{ animationDelay: `${index * 150}ms` }}
              >
                {/* Connection line */}
                {index < 2 && (
                  <div className="hidden md:block absolute top-16 left-[60%] w-[80%] h-0.5 bg-gradient-to-r from-amber-500/50 to-transparent" />
                )}
                
                <div className="relative bg-card border border-border rounded-3xl p-8 hover:border-amber-500/50 transition-all duration-500 hover:shadow-2xl hover:shadow-amber-500/10 hover:-translate-y-2">
                  {/* Step number */}
                  <div className="absolute -top-4 -left-4 w-12 h-12 bg-background border-2 border-amber-500 rounded-full flex items-center justify-center">
                    <span className="text-amber-500 font-bold text-lg">{item.step}</span>
                  </div>
                  
                  {/* Icon */}
                  <div className={`w-20 h-20 mx-auto rounded-2xl bg-gradient-to-br ${item.color} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500 shadow-xl`}>
                    <item.icon className="w-10 h-10 text-white" />
                  </div>
                  
                  <h3 className="text-xl font-bold text-foreground mb-3 text-center group-hover:text-amber-500 transition-colors">
                    {item.title}
                  </h3>
                  <p className="text-muted-foreground text-center leading-relaxed">
                    {item.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Guarantee & Trust Section */}
      <section className="py-20 px-4 bg-gradient-to-b from-background via-amber-500/5 to-background overflow-hidden">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left side - Trust badges */}
            <div className="space-y-6">
              <span className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-500/20 to-emerald-500/20 text-green-600 rounded-full text-sm font-medium animate-fade-in">
                <ThumbsUp className="w-4 h-4" />
                Garantia e Confiança
              </span>
              <h2 className="text-3xl md:text-4xl font-bold text-foreground animate-fade-in">
                Sua satisfação é nossa <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-500 to-orange-500">prioridade</span>
              </h2>
              <p className="text-muted-foreground text-lg animate-fade-in">
                Oferecemos suporte VIP e garantia de satisfação para que você possa focar no que realmente importa: seus pacientes.
              </p>

              <div className="space-y-4">
                {[
                  { icon: Shield, text: "Dados protegidos com criptografia de ponta", color: "from-blue-500 to-cyan-500" },
                  { icon: Headphones, text: "Suporte VIP 24/7 via WhatsApp", color: "from-green-500 to-emerald-500" },
                  { icon: Gift, text: "7 dias grátis para testar todos os recursos", color: "from-purple-500 to-violet-500" },
                  { icon: CheckCircle, text: "Cancele a qualquer momento sem taxas", color: "from-orange-500 to-amber-500" }
                ].map((item, index) => (
                  <div
                    key={index}
                    className="group flex items-center gap-4 p-4 bg-card border border-border rounded-xl hover:border-amber-500/30 transition-all duration-300 hover:shadow-lg hover:-translate-x-1 animate-fade-in cursor-pointer"
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${item.color} flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform duration-300`}>
                      <item.icon className="w-6 h-6 text-white" />
                    </div>
                    <p className="text-foreground font-medium group-hover:text-amber-500 transition-colors">{item.text}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Right side - Pricing card with effects */}
            <div className="relative">
              {/* Animated background blobs */}
              <div className="absolute -top-10 -right-10 w-40 h-40 bg-gradient-to-br from-amber-500/30 to-orange-500/10 rounded-full blur-3xl animate-pulse" />
              <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-gradient-to-br from-amber-500/30 to-orange-500/10 rounded-full blur-2xl animate-pulse" style={{ animationDelay: '1s' }} />
              <div className="absolute top-1/2 right-0 w-24 h-24 bg-gradient-to-br from-green-500/20 to-emerald-500/10 rounded-full blur-xl animate-pulse" style={{ animationDelay: '2s' }} />

              <div className="relative bg-gradient-to-br from-card via-card to-amber-500/5 border-2 border-amber-500/30 rounded-3xl p-8 shadow-2xl hover:shadow-amber-500/20 transition-all duration-500">
                {/* Premium badge */}
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <span className="inline-flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-full text-sm font-bold shadow-lg">
                    <Crown className="w-4 h-4" />
                    PLANO PREMIUM
                  </span>
                </div>

                <div className="text-center mt-4 mb-8">
                  <p className="text-muted-foreground text-sm mb-2">Investimento mensal</p>
                  <div className="flex items-baseline justify-center gap-1">
                    <span className="text-2xl text-muted-foreground">R$</span>
                    <span className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-500">297</span>
                    <span className="text-3xl text-amber-500">,00</span>
                  </div>
                  <p className="text-muted-foreground text-sm mt-2">ou 12x de R$ 97,00 <span className="text-green-500 font-medium">(plano anual)</span></p>
                </div>

                <div className="space-y-3 mb-8">
                  {[
                    "Todos os recursos do Plano Pro",
                    "Agentes de IA completos",
                    "Checkout de pagamento próprio",
                    "Integração Google Agenda/Meet",
                    "Notificações automáticas",
                    "Suporte VIP prioritário 24/7"
                  ].map((feature, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-3 animate-fade-in"
                      style={{ animationDelay: `${index * 50}ms` }}
                    >
                      <div className="w-6 h-6 rounded-full bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shrink-0">
                        <CheckCircle className="w-4 h-4 text-white" />
                      </div>
                      <span className="text-foreground">{feature}</span>
                    </div>
                  ))}
                </div>

                <a
                  href={whatsappLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group w-full inline-flex items-center justify-center gap-3 px-8 py-4 text-lg font-bold bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-full transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-amber-500/30"
                >
                  <MessageCircle className="w-6 h-6 group-hover:animate-bounce" />
                  QUERO O PLANO PREMIUM!
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing CTA Section */}
      <section id="precos" className="py-24 bg-gradient-to-b from-background via-primary/5 to-background">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-500/20 to-orange-500/20 text-amber-400 rounded-full text-sm font-bold mb-6">
              <Crown className="w-4 h-4" />
              OFERTA ESPECIAL
            </div>

            <h2 className="text-3xl md:text-5xl font-extrabold text-foreground mb-6">
              Comece sua jornada{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-500">Premium hoje</span>
            </h2>

            <p className="text-lg text-muted-foreground mb-10 max-w-2xl mx-auto">
              Tudo que você precisa para crescer sua prática: CRM, agentes de IA, área de membros, checkout e suporte VIP.
            </p>

            <div className="relative bg-gradient-to-br from-amber-500/20 via-orange-500/10 to-transparent rounded-3xl p-8 border border-amber-500/20 max-w-md mx-auto mb-10">
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                <span className="inline-flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-full text-sm font-bold shadow-lg">
                  <Crown className="w-4 h-4" />
                  PREMIUM
                </span>
              </div>

              <div className="text-center mb-8 mt-4">
                <span className="text-sm text-muted-foreground">A partir de</span>
                <div className="flex items-baseline justify-center gap-1 mt-1">
                  <span className="text-lg text-muted-foreground">R$</span>
                  <span className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-500">297</span>
                  <span className="text-2xl text-amber-500">,00</span>
                  <span className="text-muted-foreground">/mês</span>
                </div>
              </div>

              <a
                href={whatsappLink}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full inline-flex items-center justify-center gap-3 px-8 py-4 text-lg font-semibold bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-full transition-all duration-300 hover:scale-105 hover:shadow-xl"
              >
                <MessageCircle className="w-6 h-6" />
                ENTRAR NO GRUPO DE ESPERA
              </a>
            </div>

            <p className="text-sm text-muted-foreground">
              <strong>Vagas limitadas</strong> • Garantia de 7 dias • Cancele quando quiser
            </p>
          </div>
        </div>
      </section>

      {/* Plan Comparison Section */}
      <PlanComparisonSection currentPlan="premium" />

      {/* FAQ Section */}
      <section className="py-20 px-4 bg-muted/30">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <span className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-500/20 to-orange-500/20 text-amber-500 rounded-full text-sm font-medium mb-4 animate-fade-in">
              <HelpCircle className="w-4 h-4" />
              Dúvidas Frequentes
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4 animate-fade-in">
              Perguntas <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-500">Frequentes</span>
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto animate-fade-in">
              Tire suas principais dúvidas sobre o Plano Premium
            </p>
          </div>

          <Accordion type="single" collapsible className="space-y-4">
            {faqs.map((faq, index) => (
              <AccordionItem
                key={index}
                value={`item-${index}`}
                className="bg-card border border-border rounded-xl px-6 data-[state=open]:border-amber-500/50 transition-all duration-300 hover:shadow-md animate-fade-in"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <AccordionTrigger className="text-left hover:no-underline py-5 text-foreground">
                  <span className="font-semibold text-base md:text-lg">{faq.question}</span>
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground pb-5 text-base leading-relaxed">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 bg-muted/50 border-t border-border">
        <div className="max-w-4xl mx-auto flex flex-col items-center gap-4">
          <Logo className="h-8" />
          <p className="text-sm text-muted-foreground">
            © Copyright {new Date().getFullYear()} - Todos os direitos reservados.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default CadastroPremium;
