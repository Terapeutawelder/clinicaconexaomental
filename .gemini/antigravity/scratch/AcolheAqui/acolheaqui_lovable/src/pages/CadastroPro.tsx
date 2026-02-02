import { 
  MessageCircle, 
  Clock, 
  Star, 
  Quote, 
  ArrowLeft, 
  Calendar, 
  Users, 
  Shield, 
  CreditCard, 
  Video, 
  BarChart3, 
  Headphones, 
  Sparkles,
  CheckCircle,
  Zap,
  Globe,
  Bell,
  HelpCircle,
  Rocket,
  Target,
  Heart,
  Award,
  TrendingUp,
  Clock3,
  Laptop,
  Lock,
  Wifi,
  Brain,
  Smile,
  ThumbsUp,
  Crown,
  Gift,
  BadgeCheck
} from "lucide-react";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Logo from "@/components/Logo";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import Marquee from "@/components/Marquee";
import PlanComparisonSection from "@/components/pro/PlanComparisonSection";
// Use public folder avatars for faster loading
const avatar1 = "/avatars/avatar-1.jpg";
const avatar2 = "/avatars/avatar-2.jpg";
const avatar3 = "/avatars/avatar-3.jpg";

const benefits = [
  {
    icon: Users,
    title: "Perfil Profissional",
    description: "Seu perfil completo visível para pacientes que buscam terapia online.",
    color: "from-blue-500 to-cyan-500"
  },
  {
    icon: Calendar,
    title: "Agenda + CRM de Pacientes",
    description: "CRM completo com agenda, histórico de sessões e prontuário de pacientes.",
    color: "from-purple-500 to-pink-500"
  },
  {
    icon: CreditCard,
    title: "Controle Financeiro",
    description: "Gerencie pagamentos, recebimentos e tenha relatórios detalhados.",
    color: "from-green-500 to-emerald-500"
  },
  {
    icon: Video,
    title: "Sala Virtual",
    description: "Atenda seus pacientes com nossa sala de videochamada integrada.",
    color: "from-orange-500 to-amber-500"
  },
  {
    icon: Shield,
    title: "Landing Page Personalizada",
    description: "Crie sua página profissional com editor visual e cores personalizadas.",
    color: "from-red-500 to-rose-500"
  },
  {
    icon: Headphones,
    title: "Suporte Dedicado",
    description: "Equipe de suporte exclusiva para ajudar você sempre que precisar.",
    color: "from-indigo-500 to-violet-500"
  }
];

const highlights = [
  {
    icon: Zap,
    title: "Ativação Imediata",
    description: "Seu perfil fica ativo em até 24 horas após aprovação."
  },
  {
    icon: Globe,
    title: "Integração WhatsApp",
    description: "Conecte via QR Code e receba notificações automáticas."
  },
  {
    icon: Bell,
    title: "Google Agenda e Meet",
    description: "Sincronize sua agenda e crie reuniões automaticamente."
  },
  {
    icon: BarChart3,
    title: "Métricas e Relatórios",
    description: "Acompanhe seu desempenho com relatórios detalhados."
  }
];

const includedFeatures = [
  "Perfil profissional completo",
  "CRM com agenda e pacientes",
  "Controle financeiro",
  "Sala de videochamada",
  "Landing Page personalizada",
  "Integração WhatsApp (QR Code)",
  "Google Agenda e Meet",
  "Suporte prioritário"
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
    question: "O que está incluso no Plano Pro?",
    answer: "O Plano Pro oferece: perfil profissional completo na plataforma, CRM com agenda integrada, sala de videochamada para atendimentos, controle financeiro, notificações por WhatsApp, suporte prioritário, relatórios mensais e visibilidade nas buscas."
  },
  {
    question: "Como funciona a exibição dos perfis?",
    answer: "Os perfis são exibidos conforme os filtros de busca usados pelos pacientes (como cidade, tipo de atendimento e abordagem). A ordem é organizada para dar visibilidade equilibrada a todos os profissionais."
  },
  {
    question: "Posso editar meu perfil depois de publicado?",
    answer: "Sim. Você pode editar suas informações, foto, bio, abordagens e outras informações do seu perfil a qualquer momento através do painel do profissional."
  },
  {
    question: "O AcolheAqui garante pacientes?",
    answer: "Não. O AcolheAqui não oferece garantia de quantidade de contatos ou pacientes. O número de pessoas que chegam até o seu perfil depende de fatores como região, tipo de atendimento, especialidade e momento da busca."
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

const CadastroPro = () => {
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

    // Preload background image
    const img = new Image();
    img.src = '/hero-bg-pro.jpg';
    img.onload = () => setBgLoaded(true);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="min-h-screen pro-theme">
      {/* Fixed Header with Back Button */}
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
          <div className="w-20" /> {/* Spacer for centering logo */}
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative min-h-screen flex flex-col items-center justify-center text-center px-4 py-20 pt-28">
        {/* Background Image with lazy load */}
        <div
          className={`absolute inset-0 bg-cover bg-center bg-no-repeat transition-opacity duration-700 ${
            bgLoaded ? "opacity-100" : "opacity-0"
          }`}
          style={{ backgroundImage: `url('/hero-bg-pro.jpg')` }}
        />
        
        {/* Placeholder gradient while loading */}
        <div
          className={`absolute inset-0 bg-gradient-to-br from-primary/20 to-muted transition-opacity duration-700 ${
            bgLoaded ? "opacity-0" : "opacity-100"
          }`}
        />
        
        {/* Dark overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-background/40 via-background/50 to-background/75" />

        {/* Content */}
        <div className="relative z-10 max-w-4xl mx-auto">

          {/* Title */}
          <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6 leading-tight animate-fade-in-up">
            Comece sua jornada com o{" "}
            <span className="text-primary">Plano Pro</span> e atraia mais pacientes!
          </h1>

          {/* Subtitle */}
          <p className="text-lg md:text-xl text-muted-foreground mb-10 max-w-2xl mx-auto animate-fade-in-up animate-delay-100">
            Perfil na plataforma, CRM com agenda e controle financeiro para você começar com tudo.
          </p>

          {/* CTA Button */}
          <a
            href={whatsappLink}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-3 px-8 py-4 text-lg font-semibold bg-primary text-primary-foreground rounded-full transition-all duration-300 hover:scale-105 hover:shadow-xl animate-pulse-glow animate-fade-in-up animate-delay-200"
          >
            <MessageCircle className="w-6 h-6" />
            ENTRAR NO GRUPO DE ESPERA!
          </a>

          {/* Countdown Timer */}
          <div className="mt-8 animate-fade-in-up animate-delay-300">
            <div className="inline-flex items-center gap-2 px-6 py-3 bg-primary/10 border border-primary/30 rounded-full">
              <Clock className="w-5 h-5 text-primary animate-pulse" />
              <span className="text-foreground font-medium">Inscrições encerram em:</span>
            </div>
            <div className="mt-4 flex items-center justify-center gap-3 md:gap-4">
              <div className="flex flex-col items-center bg-background/50 backdrop-blur-sm border border-border/50 rounded-lg px-4 py-3 min-w-[70px]">
                <span className="text-2xl md:text-3xl font-bold text-primary">{timeLeft.days}</span>
                <span className="text-xs text-muted-foreground uppercase">Dias</span>
              </div>
              <span className="text-2xl font-bold text-primary">:</span>
              <div className="flex flex-col items-center bg-background/50 backdrop-blur-sm border border-border/50 rounded-lg px-4 py-3 min-w-[70px]">
                <span className="text-2xl md:text-3xl font-bold text-primary">{String(timeLeft.hours).padStart(2, '0')}</span>
                <span className="text-xs text-muted-foreground uppercase">Horas</span>
              </div>
              <span className="text-2xl font-bold text-primary">:</span>
              <div className="flex flex-col items-center bg-background/50 backdrop-blur-sm border border-border/50 rounded-lg px-4 py-3 min-w-[70px]">
                <span className="text-2xl md:text-3xl font-bold text-primary">{String(timeLeft.minutes).padStart(2, '0')}</span>
                <span className="text-xs text-muted-foreground uppercase">Min</span>
              </div>
              <span className="text-2xl font-bold text-primary">:</span>
              <div className="flex flex-col items-center bg-background/50 backdrop-blur-sm border border-border/50 rounded-lg px-4 py-3 min-w-[70px]">
                <span className="text-2xl md:text-3xl font-bold text-primary">{String(timeLeft.seconds).padStart(2, '0')}</span>
                <span className="text-xs text-muted-foreground uppercase">Seg</span>
              </div>
            </div>
          </div>

          {/* Extra info */}
          <p className="mt-4 text-sm text-muted-foreground italic animate-fade-in-up animate-delay-400">
            <strong>Acesso prioritário</strong> • Benefícios exclusivos • Suporte dedicado
          </p>
        </div>
      </section>

      {/* Marquee */}
      <Marquee />

      {/* Benefits Section */}
      <section className="py-20 px-4 bg-background">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <span className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary rounded-full text-sm font-medium mb-4 animate-fade-in">
              <Sparkles className="w-4 h-4" />
              Benefícios Exclusivos
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4 animate-fade-in">
              Tudo que você precisa no <span className="text-primary">Plano Pro</span>
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto animate-fade-in">
              Ferramentas profissionais para impulsionar sua carreira como psicoterapeuta
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {benefits.map((benefit, index) => (
              <div
                key={index}
                className="group relative bg-card border border-border rounded-2xl p-6 hover:border-primary/50 transition-all duration-500 hover:shadow-xl hover:shadow-primary/10 hover:-translate-y-1 animate-fade-in"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${benefit.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                  <benefit.icon className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-xl font-bold text-foreground mb-2 group-hover:text-primary transition-colors">
                  {benefit.title}
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  {benefit.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Highlights Section with Pricing */}
      <section className="py-20 px-4 bg-muted/30">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <span className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary rounded-full text-sm font-medium mb-4">
                <Zap className="w-4 h-4" />
                Por que escolher o Pro?
              </span>
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">
                Destaque-se entre os <span className="text-primary">profissionais</span>
              </h2>
              <p className="text-muted-foreground text-lg mb-8">
                Com o Plano Pro, você tem acesso a ferramentas exclusivas que vão transformar sua prática clínica e aumentar sua visibilidade para pacientes em todo o Brasil.
              </p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {highlights.map((highlight, index) => (
                  <div
                    key={index}
                    className="flex items-start gap-3 p-4 bg-background rounded-xl border border-border hover:border-primary/30 transition-all duration-300 hover:shadow-md"
                  >
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                      <highlight.icon className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-foreground mb-1">{highlight.title}</h4>
                      <p className="text-sm text-muted-foreground">{highlight.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative">
              <div className="bg-gradient-to-br from-primary/20 via-primary/10 to-transparent rounded-3xl p-8 border border-primary/20">
                <div className="text-center mb-8">
                  <span className="text-sm text-muted-foreground">A partir de</span>
                  <div className="flex items-baseline justify-center gap-1 mt-1">
                    <span className="text-lg text-muted-foreground">R$</span>
                    <span className="text-5xl font-bold text-primary">127</span>
                    <span className="text-2xl text-primary">,00</span>
                    <span className="text-muted-foreground">/mês</span>
                  </div>
                </div>

                <div className="space-y-3 mb-8">
                  {includedFeatures.map((feature, index) => (
                    <div key={index} className="flex items-center gap-3 animate-fade-in" style={{ animationDelay: `${index * 50}ms` }}>
                      <CheckCircle className="w-5 h-5 text-primary shrink-0" />
                      <span className="text-foreground">{feature}</span>
                    </div>
                  ))}
                </div>

                <a
                  href={whatsappLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full inline-flex items-center justify-center gap-3 px-8 py-4 text-lg font-semibold bg-primary text-primary-foreground rounded-full transition-all duration-300 hover:scale-105 hover:shadow-xl"
                >
                  <MessageCircle className="w-6 h-6" />
                  ENTRAR NO GRUPO DE ESPERA!
                </a>
              </div>

              {/* Floating elements */}
              <div className="absolute -top-4 -right-4 w-20 h-20 bg-gradient-to-br from-primary/30 to-primary/10 rounded-full blur-xl animate-pulse" />
              <div className="absolute -bottom-4 -left-4 w-16 h-16 bg-gradient-to-br from-primary/20 to-transparent rounded-full blur-lg animate-pulse" style={{ animationDelay: '1s' }} />
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 px-4 bg-background">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-4xl font-bold text-foreground mb-4">
              O que dizem os <span className="text-primary">profissionais</span>
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Veja como a AcolheAqui está transformando a carreira de psicólogos em todo o Brasil
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Testimonial 1 */}
            <div className="bg-card border border-border rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
              <Quote className="w-8 h-8 text-primary/30 mb-4" />
              <p className="text-foreground mb-6 leading-relaxed">
                "A plataforma me ajudou a organizar minha agenda e atrair novos pacientes. Em 3 meses, dobrei meus atendimentos!"
              </p>
              <div className="flex items-center gap-4">
                <img 
                  src={avatar1} 
                  alt="Dra. Mariana Silva" 
                  loading="lazy"
                  decoding="async"
                  className="w-12 h-12 rounded-full object-cover border-2 border-primary/20"
                />
                <div>
                  <p className="font-semibold text-foreground">Dra. Mariana Silva</p>
                  <p className="text-sm text-muted-foreground">Psicóloga Clínica • SP</p>
                </div>
              </div>
              <div className="flex gap-1 mt-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-primary text-primary" />
                ))}
              </div>
            </div>

            {/* Testimonial 2 */}
            <div className="bg-card border border-border rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
              <Quote className="w-8 h-8 text-primary/30 mb-4" />
              <p className="text-foreground mb-6 leading-relaxed">
                "O CRM integrado é incrível! Consigo acompanhar o histórico dos pacientes e ter controle financeiro em um só lugar."
              </p>
              <div className="flex items-center gap-4">
                <img 
                  src={avatar2} 
                  alt="Dr. Rafael Costa" 
                  loading="lazy"
                  decoding="async"
                  className="w-12 h-12 rounded-full object-cover border-2 border-primary/20"
                />
                <div>
                  <p className="font-semibold text-foreground">Dr. Rafael Costa</p>
                  <p className="text-sm text-muted-foreground">Neuropsicólogo • RJ</p>
                </div>
              </div>
              <div className="flex gap-1 mt-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-primary text-primary" />
                ))}
              </div>
            </div>

            {/* Testimonial 3 */}
            <div className="bg-card border border-border rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
              <Quote className="w-8 h-8 text-primary/30 mb-4" />
              <p className="text-foreground mb-6 leading-relaxed">
                "Finalmente uma plataforma pensada para nós! O suporte é excelente e a visibilidade do meu perfil aumentou muito."
              </p>
              <div className="flex items-center gap-4">
                <img 
                  src={avatar3} 
                  alt="Dra. Carolina Mendes" 
                  loading="lazy"
                  decoding="async"
                  className="w-12 h-12 rounded-full object-cover border-2 border-primary/20"
                />
                <div>
                  <p className="font-semibold text-foreground">Dra. Carolina Mendes</p>
                  <p className="text-sm text-muted-foreground">Psicóloga TCC • MG</p>
                </div>
              </div>
              <div className="flex gap-1 mt-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-primary text-primary" />
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Why Us Section - Animated Icons */}
      <section className="py-20 px-4 bg-gradient-to-b from-background to-muted/20 overflow-hidden">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <span className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-500/20 to-orange-500/20 text-amber-600 rounded-full text-sm font-medium mb-4 animate-fade-in">
              <Rocket className="w-4 h-4 animate-bounce" />
              Por Que Nos Escolher
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4 animate-fade-in">
              Vantagens que fazem a <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-500 to-orange-500">diferença</span>
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto animate-fade-in">
              Descubra como o AcolheAqui pode transformar sua prática profissional
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { icon: Target, label: "Foco no Paciente", color: "from-red-500 to-rose-600", delay: 0 },
              { icon: Heart, label: "Atendimento Humanizado", color: "from-pink-500 to-fuchsia-600", delay: 100 },
              { icon: Award, label: "Qualidade Premium", color: "from-amber-500 to-yellow-600", delay: 200 },
              { icon: TrendingUp, label: "Crescimento Rápido", color: "from-green-500 to-emerald-600", delay: 300 },
              { icon: Clock3, label: "Economia de Tempo", color: "from-blue-500 to-cyan-600", delay: 400 },
              { icon: Laptop, label: "100% Digital", color: "from-violet-500 to-purple-600", delay: 500 },
              { icon: Lock, label: "Dados Seguros", color: "from-slate-500 to-gray-600", delay: 600 },
              { icon: Wifi, label: "Sempre Online", color: "from-teal-500 to-cyan-600", delay: 700 }
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

      {/* Process Steps Section */}
      <section className="py-20 px-4 bg-muted/20">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <span className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500/20 to-indigo-500/20 text-blue-600 rounded-full text-sm font-medium mb-4 animate-fade-in">
              <Brain className="w-4 h-4" />
              Como Funciona
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4 animate-fade-in">
              Simples assim para <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-indigo-500">começar</span>
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto animate-fade-in">
              Em apenas 3 passos você estará atendendo pacientes de todo o Brasil
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
                title: "Ative o Plano Pro",
                description: "Escolha o plano que melhor se adapta às suas necessidades e comece a receber pacientes.",
                color: "from-amber-500 to-orange-600"
              },
              {
                step: "03",
                icon: Smile,
                title: "Receba Pacientes",
                description: "Seu perfil ficará visível e você começará a receber contatos de pacientes interessados.",
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
                  <div className="hidden md:block absolute top-16 left-[60%] w-[80%] h-0.5 bg-gradient-to-r from-primary/50 to-transparent" />
                )}
                
                <div className="relative bg-card border border-border rounded-3xl p-8 hover:border-primary/50 transition-all duration-500 hover:shadow-2xl hover:shadow-primary/10 hover:-translate-y-2">
                  {/* Step number */}
                  <div className="absolute -top-4 -left-4 w-12 h-12 bg-background border-2 border-primary rounded-full flex items-center justify-center">
                    <span className="text-primary font-bold text-lg">{item.step}</span>
                  </div>
                  
                  {/* Icon */}
                  <div className={`w-20 h-20 mx-auto rounded-2xl bg-gradient-to-br ${item.color} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500 shadow-xl`}>
                    <item.icon className="w-10 h-10 text-white" />
                  </div>
                  
                  <h3 className="text-xl font-bold text-foreground mb-3 text-center group-hover:text-primary transition-colors">
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
      <section className="py-20 px-4 bg-gradient-to-b from-background via-primary/5 to-background overflow-hidden">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left side - Trust badges */}
            <div className="space-y-6">
              <span className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-500/20 to-emerald-500/20 text-green-600 rounded-full text-sm font-medium animate-fade-in">
                <ThumbsUp className="w-4 h-4" />
                Garantia e Confiança
              </span>
              <h2 className="text-3xl md:text-4xl font-bold text-foreground animate-fade-in">
                Sua satisfação é nossa <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-500 to-emerald-500">prioridade</span>
              </h2>
              <p className="text-muted-foreground text-lg animate-fade-in">
                Oferecemos suporte completo e garantia de satisfação para que você possa focar no que realmente importa: seus pacientes.
              </p>

              <div className="space-y-4">
                {[
                  { icon: Shield, text: "Dados protegidos com criptografia de ponta", color: "from-blue-500 to-cyan-500" },
                  { icon: Headphones, text: "Suporte humanizado via WhatsApp", color: "from-green-500 to-emerald-500" },
                  { icon: Gift, text: "7 dias grátis para testar a plataforma", color: "from-purple-500 to-violet-500" },
                  { icon: CheckCircle, text: "Cancele a qualquer momento sem taxas", color: "from-orange-500 to-amber-500" }
                ].map((item, index) => (
                  <div
                    key={index}
                    className="group flex items-center gap-4 p-4 bg-card border border-border rounded-xl hover:border-primary/30 transition-all duration-300 hover:shadow-lg hover:-translate-x-1 animate-fade-in cursor-pointer"
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${item.color} flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform duration-300`}>
                      <item.icon className="w-6 h-6 text-white" />
                    </div>
                    <p className="text-foreground font-medium group-hover:text-primary transition-colors">{item.text}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Right side - Pricing card with effects */}
            <div className="relative">
              {/* Animated background blobs */}
              <div className="absolute -top-10 -right-10 w-40 h-40 bg-gradient-to-br from-primary/30 to-primary/10 rounded-full blur-3xl animate-pulse" />
              <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-gradient-to-br from-amber-500/30 to-orange-500/10 rounded-full blur-2xl animate-pulse" style={{ animationDelay: '1s' }} />
              <div className="absolute top-1/2 right-0 w-24 h-24 bg-gradient-to-br from-green-500/20 to-emerald-500/10 rounded-full blur-xl animate-pulse" style={{ animationDelay: '2s' }} />

              <div className="relative bg-gradient-to-br from-card via-card to-primary/5 border-2 border-primary/30 rounded-3xl p-8 shadow-2xl hover:shadow-primary/20 transition-all duration-500">
                {/* Popular badge */}
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <span className="inline-flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-primary to-primary/80 text-primary-foreground rounded-full text-sm font-bold shadow-lg">
                    <Crown className="w-4 h-4" />
                    MAIS POPULAR
                  </span>
                </div>

                <div className="text-center mt-4 mb-8">
                  <p className="text-muted-foreground text-sm mb-2">Investimento mensal</p>
                  <div className="flex items-baseline justify-center gap-1">
                    <span className="text-2xl text-muted-foreground">R$</span>
                    <span className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-primary to-primary/70">127</span>
                    <span className="text-3xl text-primary">,00</span>
                  </div>
                  <p className="text-muted-foreground text-sm mt-2">ou R$ 1.270/ano <span className="text-green-500 font-medium">(economize 2 meses!)</span></p>
                </div>

                <div className="space-y-3 mb-8">
                  {[
                    "Perfil profissional destacado",
                    "CRM completo com agenda",
                    "Sala de videochamada HD",
                    "Relatórios financeiros",
                    "Notificações automáticas",
                    "Suporte prioritário 24/7"
                  ].map((feature, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-3 animate-fade-in"
                      style={{ animationDelay: `${index * 50}ms` }}
                    >
                      <div className="w-6 h-6 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center shrink-0">
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
                  className="group w-full inline-flex items-center justify-center gap-3 px-8 py-4 text-lg font-bold bg-gradient-to-r from-primary to-primary/80 text-primary-foreground rounded-full transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-primary/30"
                >
                  <MessageCircle className="w-6 h-6 group-hover:animate-bounce" />
                  QUERO COMEÇAR AGORA!
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 px-4 bg-muted/30">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <span className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary rounded-full text-sm font-medium mb-4 animate-fade-in">
              <HelpCircle className="w-4 h-4" />
              Dúvidas Frequentes
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4 animate-fade-in">
              Perguntas <span className="text-primary">Frequentes</span>
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto animate-fade-in">
              Tire suas principais dúvidas sobre o Plano Pro
            </p>
          </div>

          <Accordion type="single" collapsible className="space-y-4">
            {faqs.map((faq, index) => (
              <AccordionItem
                key={index}
                value={`item-${index}`}
                className="bg-card border border-border rounded-xl px-6 data-[state=open]:border-primary/50 transition-all duration-300 hover:shadow-md animate-fade-in"
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

      {/* Plan Comparison Section */}
      <PlanComparisonSection currentPlan="pro" />

      {/* Final CTA Section */}
      <section className="py-20 px-4 bg-gradient-to-b from-background to-muted/30">
        <div className="max-w-3xl mx-auto text-center">
          <div className="relative inline-block mb-6">
            <div className="absolute -inset-2 bg-gradient-to-r from-primary/30 via-primary/50 to-primary/30 blur-xl animate-pulse rounded-full" />
            <div className="absolute -inset-1 bg-gradient-to-r from-amber-400 via-primary to-amber-400 opacity-75 blur-md animate-pulse" />
            <h2 className="relative text-3xl md:text-5xl lg:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-primary to-amber-400 uppercase tracking-wide animate-[pulse_2s_ease-in-out_infinite] drop-shadow-2xl">
              🚨 Atenção Psicoterapeutas!! 🚨
            </h2>
            <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-3/4 h-1 bg-gradient-to-r from-transparent via-primary to-transparent" />
          </div>
          <p className="text-muted-foreground mb-8 text-lg">
            Se você deseja começar a sua jornada na plataforma AcolheAqui e receber pacientes para sessões de Terapia Online a partir de{" "}
            <strong className="text-foreground">R$ 127,00</strong> com vários benefícios, o Plano Pro é ideal para você.
          </p>

          <a
            href={whatsappLink}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-3 px-8 py-4 text-lg font-semibold bg-primary text-primary-foreground rounded-full transition-all duration-300 hover:scale-105 hover:shadow-xl animate-pulse"
          >
            <MessageCircle className="w-6 h-6" />
            ENTRAR NO GRUPO DE ESPERA!
          </a>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 bg-muted/50 border-t border-border">
        <div className="max-w-4xl mx-auto flex flex-col items-center gap-4">
          <Logo className="h-8" />
          <p className="text-sm text-muted-foreground">
            © Copyright 2025 - Todos os direitos reservados.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default CadastroPro;
