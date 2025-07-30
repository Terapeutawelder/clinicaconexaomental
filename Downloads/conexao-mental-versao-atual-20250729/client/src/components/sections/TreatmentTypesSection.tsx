import { Brain, Home, Heart, Smile, Utensils, Cloud, Zap, Ghost, Sun, Users, BookOpen, HandHeart } from "lucide-react";

const TreatmentTypesSection = () => {
  const treatments = [
    {
      icon: Brain,
      title: "Transtorno de Personalidade",
      description: "Tratamento especializado para transtornos de personalidade"
    },
    {
      icon: Home,
      title: "Problemas familiares",
      description: "Mediação e terapia familiar"
    },
    {
      icon: Heart,
      title: "Depressão",
      description: "Acompanhamento para quadros depressivos"
    },
    {
      icon: Smile,
      title: "Ansiedade",
      description: "Tratamento para transtornos de ansiedade"
    },
    {
      icon: Utensils,
      title: "Transtornos alimentares",
      description: "Suporte para distúrbios alimentares"
    },
    {
      icon: Cloud,
      title: "Distúrbios emocionais",
      description: "Regulação emocional e bem-estar"
    },
    {
      icon: Zap,
      title: "Estresse",
      description: "Manejo do estresse e burnout"
    },
    {
      icon: Ghost,
      title: "Luto",
      description: "Apoio no processo de luto"
    },
    {
      icon: Sun,
      title: "Autoestima",
      description: "Fortalecimento da autoestima"
    },
    {
      icon: Users,
      title: "Sexualidade",
      description: "Terapia sexual e relacionamentos"
    },
    {
      icon: BookOpen,
      title: "Autoconhecimento",
      description: "Jornada de descoberta pessoal"
    },
    {
      icon: HandHeart,
      title: "Problemas de relacionamento",
      description: "Melhoria das relações interpessoais"
    }
  ];

  return (
    <section className="py-16 purple-bg">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            O que você procura tratar?
          </h2>
        </div>

        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {treatments.map((treatment, index) => (
              <button
                key={index}
                type="button"
                className="p-4 rounded-lg border-2 border-white/30 bg-white text-gray-700 hover:bg-purple-600 hover:text-white hover:border-purple-400 transition-all duration-300 shadow-md hover:shadow-lg transform hover:scale-105"
              >
                <div className="flex flex-col items-center">
                  <treatment.icon className="h-8 w-8 mx-auto mb-2" />
                  <div className="text-xs font-medium text-center">{treatment.title}</div>
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="text-center mt-12">
          <p className="text-white/90 mb-6 text-lg">
            Encontre o profissional ideal para sua necessidade
          </p>
          <button 
            className="bg-white text-purple-600 hover:bg-purple-50 font-semibold px-8 py-3 rounded-lg transition-all duration-300 hover:scale-105 shadow-lg"
            onClick={() => document.getElementById('professionals-section')?.scrollIntoView({ behavior: 'smooth' })}
          >
            Encontrar Profissional
          </button>
        </div>
      </div>
    </section>
  );
};

export default TreatmentTypesSection;