const steps = [
  {
    number: "1",
    title: "Criação do Perfil",
    description: "Você cria seu perfil em poucos minutos e envia seus documentos para verificação.",
  },
  {
    number: "2",
    title: "Visibilidade",
    description: "Seu perfil aparece nas buscas por cidade, especialidade e abordagem.",
  },
  {
    number: "3",
    title: "Descoberta",
    description: "Pessoas que buscam terapia encontram seu perfil e conhecem seu trabalho.",
  },
  {
    number: "4",
    title: "Contato Direto",
    description: "O contato acontece diretamente pelo WhatsApp, sem intermediários.",
  },
];

const HowItWorksSection = () => {
  const scrollToSection = (href: string) => {
    const element = document.querySelector(href);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <section id="como-funciona" className="py-20 bg-[hsl(215,35%,12%)]">
      <div className="container mx-auto px-4">

        {/* Steps Section */}
        <div className="bg-[hsl(215,35%,18%)] rounded-3xl border border-white/10 p-8 md:p-12">
          <h3 className="text-2xl md:text-3xl font-bold text-center mb-12 text-white">
            Cadastro simples e rápido
          </h3>
          
          <div className="grid md:grid-cols-4 gap-8">
            {steps.map((step, index) => (
              <div key={index} className="relative text-center">
                <div className="w-16 h-16 bg-primary text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                  {step.number}
                </div>
                <h4 className="text-lg font-bold mb-2 text-white">{step.title}</h4>
                <p className="text-sm text-white/70">{step.description}</p>
                
                {/* Connector line */}
                {index < steps.length - 1 && (
                  <div className="hidden md:block absolute top-8 left-[60%] w-[80%] h-0.5 bg-white/20" />
                )}
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <button
              onClick={() => scrollToSection("#precos")}
              className="px-8 py-4 bg-primary text-white font-semibold rounded-full hover:bg-primary/90 transition-all hover:scale-105"
            >
              Quero fazer parte
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorksSection;
