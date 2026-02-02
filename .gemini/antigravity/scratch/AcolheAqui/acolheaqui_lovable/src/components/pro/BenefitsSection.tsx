import { MessageCircle, Eye, Zap, GraduationCap, Video, Users, Store } from "lucide-react";

const benefits = [
  {
    icon: Store,
    label: "Vitrine Principal",
    title: "Seu perfil em destaque na plataforma",
    description: "Apareça na vitrine da página principal e seja encontrado por pacientes que buscam terapia online na sua região.",
  },
  {
    icon: MessageCircle,
    label: "WhatsApp Integrado",
    title: "Conecte via QR Code e API Oficial",
    description: "Escolha entre QR Code (simples e rápido) ou API Oficial do WhatsApp Business para envio de notificações automáticas.",
  },
  {
    icon: GraduationCap,
    label: "Área de Membros",
    title: "Crie cursos e materiais exclusivos",
    description: "Monte módulos de conteúdo, acompanhe o progresso dos alunos e emita certificados PDF automaticamente.",
  },
  {
    icon: Video,
    label: "Sala Virtual",
    title: "Atendimentos por videochamada",
    description: "Sala virtual integrada com gravação e transcrição. Também sincroniza com Google Meet para sua preferência.",
  },
  {
    icon: Eye,
    label: "Landing Page",
    title: "Sua página profissional personalizada",
    description: "Editor visual completo para criar uma landing page atrativa com suas cores, textos e serviços.",
  },
  {
    icon: Users,
    label: "Comunidade",
    title: "Eventos ao vivo e fórum de discussão",
    description: "Crie eventos, aulas ao vivo e mantenha uma comunidade engajada com seus alunos e pacientes.",
  },
  {
    icon: Zap,
    label: "Agentes de IA",
    title: "Automatize agendamentos e follow-up",
    description: "Agentes inteligentes para responder mensagens, agendar sessões e manter contato com pacientes automaticamente.",
  },
];

const BenefitsSection = () => {
  return (
    <section id="cadastro" className="py-20 bg-[hsl(215,35%,14%)]">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-white">
            Faça parte do AcolheAqui
          </h2>
          <p className="text-white/70 text-lg max-w-2xl mx-auto">
            Uma plataforma que valoriza quem cuida da saúde mental
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {benefits.map((benefit, index) => (
            <div
              key={index}
              className="group p-8 bg-[hsl(215,35%,18%)] rounded-2xl border border-white/10 hover:border-primary/50 transition-all hover:shadow-xl hover:shadow-primary/10"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-primary/20 rounded-lg flex items-center justify-center">
                  <benefit.icon className="w-5 h-5 text-primary" />
                </div>
                <span className="text-sm font-medium text-primary">{benefit.label}</span>
              </div>
              
              <h3 className="text-xl font-bold mb-3 text-white group-hover:text-primary transition-colors">
                {benefit.title}
              </h3>
              
              <p className="text-white/70 leading-relaxed">
                {benefit.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default BenefitsSection;
