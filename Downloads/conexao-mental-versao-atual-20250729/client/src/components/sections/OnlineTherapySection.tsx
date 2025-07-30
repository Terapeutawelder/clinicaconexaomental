
import { Button } from "@/components/ui/button";

interface OnlineTherapySectionProps {
  onAgendarConsultaClick: () => void;
}

const OnlineTherapySection = ({ onAgendarConsultaClick }: OnlineTherapySectionProps) => {
  return (
    <section className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto text-center">
        <p className="text-lg text-gray-700 mb-8">
          A terapia online oferece a flexibilidade de cuidar da sua saúde mental de onde estiver. Nossos profissionais estão prontos para te atender com a mesma qualidade e acolhimento de um consultório físico.
        </p>
        
        <div className="grid md:grid-cols-3 gap-8 mb-8">
          <div className="text-center">
            <h3 className="font-bold text-lg mb-2 text-purple-700">Conveniência</h3>
            <p className="text-gray-600">Agende e participe de sessões no conforto da sua casa.</p>
          </div>
          <div className="text-center">
            <h3 className="font-bold text-lg mb-2 text-purple-700">Acessibilidade</h3>
            <p className="text-gray-600">Cuidado de saúde mental ao alcance de todos, independentemente da localização.</p>
          </div>
          <div className="text-center">
            <h3 className="font-bold text-lg mb-2 text-purple-700">Privacidade</h3>
            <p className="text-gray-600">Ambiente seguro e confidencial para você se sentir à vontade.</p>
          </div>
        </div>
        
        <Button size="lg" className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-6" onClick={onAgendarConsultaClick}>
          Agendar Consulta Online
        </Button>
      </div>
    </section>
  );
};

export default OnlineTherapySection;
