
import { Button } from "@/components/ui/button";

interface CTASectionProps {
  onAgendarConsultaClick: () => void;
}

const CTASection = ({ onAgendarConsultaClick }: CTASectionProps) => {
  return (
    <section className="container mx-auto px-4 py-16">
      <div className="purple-bg rounded-2xl p-8 md:p-12 text-center text-white">
        <h2 className="text-3xl md:text-4xl font-bold mb-4">
          Pronto para começar sua jornada de bem-estar?
        </h2>
        <p className="text-xl mb-8 opacity-90">
          Encontre o profissional ideal para você em poucos cliques.
        </p>
        <Button size="lg" variant="secondary" className="text-lg px-8 py-6 bg-white text-purple-700 hover:bg-purple-50" onClick={onAgendarConsultaClick}>
          Agendar Consulta
        </Button>
      </div>
    </section>
  );
};

export default CTASection;
