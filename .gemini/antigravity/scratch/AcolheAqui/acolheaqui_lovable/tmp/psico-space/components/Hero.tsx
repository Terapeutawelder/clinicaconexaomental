import { Button } from "@/components/ui/button";
import { Heart, Calendar, Sparkles } from "lucide-react";

const Hero = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-b from-background via-teal-light/40 to-background">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-gradient-to-br from-teal/15 to-gold/10 rounded-full blur-3xl animate-float" />
        <div className="absolute top-1/3 -left-32 w-80 h-80 bg-gradient-to-br from-sand/40 to-teal/10 rounded-full blur-3xl animate-float" style={{ animationDelay: "2s" }} />
        <div className="absolute bottom-20 right-1/4 w-64 h-64 bg-gradient-to-br from-gold/10 to-teal/10 rounded-full blur-3xl animate-float" style={{ animationDelay: "4s" }} />
        
        {/* Floating shapes */}
        <div className="absolute top-1/4 right-1/4 w-4 h-4 bg-teal rounded-full animate-pulse-glow opacity-60" />
        <div className="absolute top-2/3 left-1/3 w-3 h-3 bg-gold rounded-full animate-pulse-glow opacity-50" style={{ animationDelay: "1s" }} />
        <div className="absolute bottom-1/3 right-1/3 w-5 h-5 bg-teal-dark rounded-full animate-pulse-glow opacity-40" style={{ animationDelay: "2s" }} />
      </div>

      <div className="container mx-auto px-4 py-20 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-teal-light border border-teal/20 px-5 py-2.5 rounded-full mb-8 opacity-0 animate-fade-in shadow-lg">
            <Sparkles className="w-4 h-4 text-teal" />
            <span className="text-sm font-semibold text-charcoal">Cuidando da sua saúde mental</span>
            <Heart className="w-4 h-4 text-teal" />
          </div>
          
          <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl xl:text-7xl leading-tight mb-6 opacity-0 animate-fade-in-up text-charcoal" style={{ animationDelay: "0.2s" }}>
            Encontre o equilíbrio e a{" "}
            <span className="bg-gradient-to-r from-teal to-teal-dark bg-clip-text text-transparent">paz interior</span>{" "}
            que você merece
          </h1>
          
          <p className="text-lg md:text-xl text-slate max-w-2xl mx-auto mb-10 opacity-0 animate-fade-in-up font-medium leading-relaxed" style={{ animationDelay: "0.4s" }}>
            A psicoterapia é um caminho de autoconhecimento e transformação. 
            Juntos, vamos construir uma vida mais leve e significativa.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center opacity-0 animate-fade-in-up" style={{ animationDelay: "0.6s" }}>
            <Button 
              size="lg" 
              className="text-lg px-8 py-6 bg-gradient-to-r from-teal to-teal-dark hover:from-teal-dark hover:to-teal text-white shadow-xl hover:shadow-2xl hover:shadow-teal/25 transition-all duration-500 hover:-translate-y-1"
              onClick={() => document.getElementById('agenda')?.scrollIntoView({ behavior: 'smooth' })}
            >
              <Calendar className="w-5 h-5 mr-2" />
              Agendar Consulta
            </Button>
            <Button size="lg" variant="outline" className="text-lg px-8 py-6 border-2 border-charcoal/20 text-charcoal hover:bg-charcoal hover:text-white hover:border-charcoal transition-all duration-500 hover:-translate-y-1 hover:shadow-xl">
              Saiba Mais
            </Button>
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 opacity-0 animate-fade-in" style={{ animationDelay: "1s" }}>
        <div className="w-7 h-11 border-2 border-teal/40 rounded-full flex justify-center p-1">
          <div className="w-2 h-3 bg-gradient-to-b from-teal to-teal-dark rounded-full animate-bounce" />
        </div>
      </div>
    </section>
  );
};

export default Hero;
