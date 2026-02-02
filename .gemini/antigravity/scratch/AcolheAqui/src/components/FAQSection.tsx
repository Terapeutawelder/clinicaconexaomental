import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
  {
    question: "Como encontrar o psicoterapeuta ideal para mim?",
    answer: "Considere a especialidade do profissional, a abordagem terapêutica (TCC, Psicanálise, Gestalt, etc.), a disponibilidade de horários, se oferece atendimento online ou presencial, e principalmente se você se sente confortável durante a primeira conversa. É importante que haja uma boa conexão terapêutica.",
  },
  {
    question: "Qual a diferença entre psicólogo, psicanalista e terapeuta?",
    answer: "O psicólogo possui graduação em Psicologia e registro no CRP. O psicanalista é formado em Psicanálise (pode ou não ser psicólogo). O terapeuta pode ter diferentes formações em áreas terapêuticas. Todos podem oferecer psicoterapia, mas com abordagens e formações distintas.",
  },
  {
    question: "Como funciona o primeiro contato com o profissional?",
    answer: "Você pode entrar em contato diretamente pelo WhatsApp do profissional. Nesse primeiro contato, vocês podem alinhar horários, valores, forma de atendimento (online ou presencial) e tirar dúvidas sobre o processo terapêutico.",
  },
  {
    question: "O atendimento pode ser online?",
    answer: "Sim! A maioria dos profissionais oferece atendimento online através de videochamada. Essa modalidade é regulamentada pelos conselhos profissionais e oferece a mesma qualidade do atendimento presencial.",
  },
  {
    question: "Posso trocar de profissional se não me adaptar?",
    answer: "Absolutamente. É muito importante que você se sinta à vontade com seu psicoterapeuta. Se não houver uma boa conexão, você pode buscar outro profissional a qualquer momento.",
  },
  {
    question: "Quanto tempo dura o processo terapêutico?",
    answer: "Isso varia muito de pessoa para pessoa e depende dos objetivos do tratamento. Algumas questões podem ser trabalhadas em poucas sessões, enquanto outras podem levar mais tempo. O importante é respeitar seu ritmo.",
  },
];

const FAQSection = () => {
  return (
    <section className="py-10 sm:py-16 md:py-24 bg-card">
      <div className="container mx-auto px-4">
        <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-center text-foreground mb-3 sm:mb-4">
          Perguntas frequentes
        </h2>
        <p className="text-center text-muted-foreground mb-8 sm:mb-12 max-w-2xl mx-auto text-sm sm:text-base">
          Tire suas dúvidas sobre psicoterapia e nossa plataforma
        </p>

        <div className="max-w-3xl mx-auto">
          <Accordion type="single" collapsible className="space-y-2 sm:space-y-3">
            {faqs.map((faq, index) => (
              <AccordionItem
                key={index}
                value={`item-${index}`}
                className="bg-background rounded-lg sm:rounded-xl border border-border px-4 sm:px-6 data-[state=open]:border-primary/30"
              >
                <AccordionTrigger className="text-left font-medium text-foreground hover:text-primary hover:no-underline py-3 sm:py-5 text-sm sm:text-base">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground pb-3 sm:pb-5 text-xs sm:text-sm">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </section>
  );
};

export default FAQSection;
