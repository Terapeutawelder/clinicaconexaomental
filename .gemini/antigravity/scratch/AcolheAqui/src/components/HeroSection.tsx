import Logo from "./Logo";
import WhatsAppButton from "./WhatsAppButton";
import heroBg from "@/assets/hero-bg.jpg";

const HeroSection = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16">
      {/* Background Image */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${heroBg})` }}
      />
      
      {/* Overlay */}
      <div className="absolute inset-0 hero-gradient" />

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 py-12 text-center">
        <div className="flex flex-col items-center gap-8 max-w-4xl mx-auto">
          {/* Logo */}
          <div className="opacity-0 animate-fade-in-up">
            <Logo size="lg" />
          </div>

          {/* Main Heading */}
          <h1 className="opacity-0 animate-fade-in-up animate-delay-100 text-3xl md:text-4xl lg:text-5xl font-bold leading-tight">
            Participe da nova plataforma que valoriza{" "}
            <span className="text-primary">profissionais</span> que querem{" "}
            <span className="text-primary">crescer</span> e atrair mais clientes!
          </h1>

          {/* Subtitle */}
          <p className="opacity-0 animate-fade-in-up animate-delay-200 text-lg md:text-xl opacity-80 max-w-2xl leading-relaxed">
            Mais visibilidade para o seu trabalho, reconhecimento pelo seu 
            compromisso e conexão com quem mais precisa dos seus serviços.
          </p>

          {/* CTA Button */}
          <div className="opacity-0 animate-fade-in-up animate-delay-300">
            <WhatsAppButton />
          </div>

          {/* Badge Text */}
          <p className="opacity-0 animate-fade-in-up animate-delay-400 text-sm md:text-base opacity-70 italic">
            <span className="font-semibold opacity-100">Vagas limitadas</span> •{" "}
            <span className="font-semibold opacity-100">Acesso prioritário</span> •{" "}
            <span className="font-semibold opacity-100">Benefícios exclusivos</span>
          </p>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
