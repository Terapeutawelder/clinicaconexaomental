import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { LandingPageConfig } from "../LandingPagePreview";

interface FAQSectionProps {
  config: LandingPageConfig;
}

const FAQSection = ({ config }: FAQSectionProps) => {
  return (
    <section 
      className="py-20"
      style={{ backgroundColor: `hsl(${config.colors.background} / 0.5)` }}
    >
      <div className="container mx-auto px-4">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="font-serif text-3xl md:text-4xl text-charcoal mb-4">
            Perguntas <span style={{ color: `hsl(${config.colors.primary})` }}>Frequentes</span>
          </h2>
          <p className="text-slate font-medium">{config.faq.subtitle}</p>
        </div>

        <div className="max-w-3xl mx-auto">
          <Accordion type="single" collapsible className="space-y-3">
            {config.faq.items.map((faq, index) => (
              <AccordionItem
                key={index}
                value={`item-${index}`}
                className="bg-white border border-gray-200 rounded-xl px-6 shadow-sm hover:shadow-md transition-shadow duration-300"
              >
                <AccordionTrigger className="text-left font-medium hover:no-underline py-5 text-charcoal [&>svg]:text-gray-400">
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

export default FAQSection;
