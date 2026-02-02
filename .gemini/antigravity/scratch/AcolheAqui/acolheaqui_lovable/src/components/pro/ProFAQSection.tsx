import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
  {
    question: "O que é o AcolheAqui?",
    answer: "O AcolheAqui é uma plataforma digital que conecta psicoterapeutas (psicólogos, psicanalistas e terapeutas) a pessoas em busca de terapia. Cada profissional tem seu próprio perfil com informações sobre sua prática e um botão direto para contato via WhatsApp.",
  },
  {
    question: "Como o paciente entra em contato comigo?",
    answer: "O contato é feito diretamente pelo WhatsApp, através do seu perfil na plataforma. O AcolheAqui não intermedeia conversas, agendamentos ou pagamentos — o vínculo é direto entre você e o paciente.",
  },
  {
    question: "O que está incluso no plano?",
    answer: "Dependendo do plano escolhido, você tem acesso ao perfil na plataforma, CRM com agenda e controle financeiro, integrações com WhatsApp e Google, agentes de IA para agendamento e follow-up, entre outros recursos.",
  },
  {
    question: "Qual a diferença entre o Plano Pro e Premium?",
    answer: "O Plano Pro oferece o essencial: perfil na plataforma, CRM com agenda e controle financeiro. O Plano Premium inclui tudo do Pro mais integrações avançadas com WhatsApp, Google Agenda e Meet, além de agentes de IA para agendamento, Instagram e follow-up.",
  },
  {
    question: "Como funciona a exibição dos perfis?",
    answer: "Os perfis são exibidos conforme os filtros de busca usados pelos pacientes (como cidade, tipo de atendimento e abordagem). A ordem é organizada para dar visibilidade equilibrada a todos os profissionais.",
  },
  {
    question: "Posso editar meu perfil depois de publicado?",
    answer: "Sim. Você pode editar suas informações, foto, bio, abordagens e outras informações do seu perfil a qualquer momento através do painel do profissional.",
  },
  {
    question: "O AcolheAqui realiza atendimentos psicológicos?",
    answer: "Não. O AcolheAqui não realiza atendimentos nem intermedia consultas. Ele é apenas um espaço de conexão entre quem busca terapia e profissionais que oferecem seus serviços.",
  },
  {
    question: "O AcolheAqui garante pacientes?",
    answer: "Não. O AcolheAqui não oferece garantia de quantidade de contatos ou pacientes. O número de pessoas que chegam até o seu perfil depende de fatores como região, tipo de atendimento, especialidade e momento da busca.",
  },
];

const ProFAQSection = () => {
  const scrollToSection = (href: string) => {
    const element = document.querySelector(href);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <section id="faq" className="py-20 bg-[hsl(215,35%,14%)]">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-white">
            Dúvidas frequentes
          </h2>
          <p className="text-white/70 text-lg">
            Tire suas principais dúvidas sobre a plataforma
          </p>
        </div>

        <Accordion type="single" collapsible className="space-y-4">
          {faqs.map((faq, index) => (
            <AccordionItem
              key={index}
              value={`item-${index}`}
              className="bg-[hsl(215,35%,18%)] border border-white/10 rounded-xl px-6 data-[state=open]:border-primary/50"
            >
              <AccordionTrigger className="text-left hover:no-underline py-5 text-white">
                <span className="font-semibold">{faq.question}</span>
              </AccordionTrigger>
              <AccordionContent className="text-white/70 pb-5">
                {faq.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>

        <div className="text-center mt-12">
          <p className="text-white/70 mb-6">
            Ainda tem dúvidas? Entre em contato conosco!
          </p>
          <button
            onClick={() => scrollToSection("#precos")}
            className="px-8 py-4 bg-primary text-white font-semibold rounded-full hover:bg-primary/90 transition-all hover:scale-105"
          >
            Quero fazer parte
          </button>
        </div>
      </div>
    </section>
  );
};

export default ProFAQSection;
