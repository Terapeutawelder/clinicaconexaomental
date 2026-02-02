import { MessageCircle, Eye, Zap } from "lucide-react";

const benefits = [
  {
    icon: MessageCircle,
    label: "Pacientes no WhatsApp",
    title: "Receba contatos direto no WhatsApp",
    description: "Mensagens chegam pelo seu WhatsApp, sem formulários ou intermediação. Conexão simples entre quem busca.",
  },
  {
    icon: Eye,
    label: "Visível",
    title: "Presença em várias páginas de busca",
    description: "Seu perfil aparece por cidade, abordagem e tipo de atendimento. Mais pontos de entrada, mais visibilidade real.",
  },
  {
    icon: Zap,
    label: "Qualificados",
    title: "Visibilidade que trabalha por você",
    description: "Mesmo quando você não está online, seu perfil continua sendo visto. Cada acesso é uma nova oportunidade de contato.",
  },
];

const BenefitsSection = () => {
  return (
    <section id="cadastro" className="py-20 bg-[hsl(215,35%,14%)]">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-white">
            Faça parte do Mindset
          </h2>
          <p className="text-white/70 text-lg max-w-2xl mx-auto">
            Uma plataforma que valoriza quem cuida da saúde mental
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
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
