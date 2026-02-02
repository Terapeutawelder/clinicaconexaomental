import { Badge } from "@/components/ui/badge";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { HelpCircle } from "lucide-react";

const faqs = [
  {
    question: "Como funciona a terapia online?",
    answer: "A terapia online funciona através de videochamada em uma plataforma segura. Você terá a mesma qualidade de atendimento que em sessões presenciais, com total privacidade e confidencialidade. Basta ter um dispositivo com câmera e internet estável."
  },
  {
    question: "Qual a duração de cada sessão?",
    answer: "Oferecemos sessões de 30 minutos e 45 minutos. A escolha depende das suas necessidades e preferências. Sessões mais longas permitem aprofundar temas complexos, enquanto sessões mais curtas são ideais para acompanhamento regular."
  },
  {
    question: "Com que frequência devo fazer terapia?",
    answer: "A frequência ideal varia de pessoa para pessoa. Geralmente, recomendamos sessões semanais no início do tratamento. Com o tempo, podemos ajustar para quinzenal ou mensal, conforme sua evolução."
  },
  {
    question: "A terapia online é tão eficaz quanto a presencial?",
    answer: "Sim! Diversos estudos científicos comprovam que a terapia online é tão eficaz quanto a presencial para a maioria dos casos. Além disso, oferece praticidade e flexibilidade, permitindo que você faça suas sessões de qualquer lugar."
  },
  {
    question: "Como funciona o sigilo profissional?",
    answer: "O sigilo é um pilar fundamental da psicoterapia. Tudo o que for compartilhado durante as sessões é absolutamente confidencial, protegido pelo Código de Ética dos Psicólogos. Sua privacidade é nossa prioridade."
  },
  {
    question: "Posso cancelar ou remarcar uma sessão?",
    answer: "Sim, você pode cancelar ou remarcar com até 24 horas de antecedência sem custo adicional. Cancelamentos com menos de 24 horas podem ter cobrança parcial, exceto em casos de emergência."
  },
];

const FAQ = () => {
  return (
    <section id="faq" className="py-12 pb-6 bg-gradient-to-b from-sand/30 to-background">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <Badge className="bg-teal-light border border-teal/20 text-teal-dark hover:bg-teal-light mb-4 px-4 py-1.5 text-sm font-semibold">
            <HelpCircle className="w-4 h-4 mr-2" />
            Dúvidas Frequentes
          </Badge>
          <h2 className="font-serif text-3xl md:text-4xl lg:text-5xl mb-4 text-charcoal">
            Perguntas <span className="text-teal">Frequentes</span>
          </h2>
          <p className="text-slate text-lg font-medium">
            Tire suas dúvidas sobre psicoterapia e nosso atendimento
          </p>
        </div>

        <div className="max-w-3xl mx-auto">
          <Accordion type="single" collapsible className="space-y-3">
            {faqs.map((faq, index) => (
              <AccordionItem
                key={index}
                value={`item-${index}`}
                className="bg-card border border-border rounded-2xl px-6 shadow-sm hover:shadow-md transition-shadow duration-300 data-[state=open]:shadow-lg data-[state=open]:border-teal/30"
              >
                <AccordionTrigger className="text-left text-charcoal font-semibold hover:text-teal hover:no-underline py-5 text-base">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-slate leading-relaxed pb-5">
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

export default FAQ;
