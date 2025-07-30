
import ProfessionalCard from "@/components/ProfessionalCard";

interface Professional {
  id: string;
  name: string;
  specialty: string;
  experience: string;
  rating?: number;
  image?: string;
  available?: boolean;
  description?: string;
  email: string;
  phone?: string;
  approach?: string;
  approved: boolean;
}

interface ProfessionalsSectionProps {
  professionals: Professional[];
  onBookProfessional: (professional: Professional) => void;
  onCadastroClick: () => void;
}

const ProfessionalsSection = ({ professionals, onBookProfessional, onCadastroClick }: ProfessionalsSectionProps) => {
  return (
    <section id="professionals-section" className="container mx-auto px-4 py-6 md:py-8">
      <div className="text-center mb-6 md:mb-8">
        <p className="text-sm md:text-lg text-gray-600 mb-4">
          Encontramos <strong>{professionals.length} especialistas</strong> em
        </p>
        <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-4 text-gray-900">Nossos Profissionais</h2>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6 lg:gap-8 max-w-6xl mx-auto">
        {professionals.map((professional) => (
          <ProfessionalCard 
            key={professional.id} 
            professional={professional} 
            onBook={() => onBookProfessional(professional)} 
          />
        ))}
      </div>
    </section>
  );
};

export default ProfessionalsSection;
