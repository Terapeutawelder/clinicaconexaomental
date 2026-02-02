import { Badge } from "@/components/ui/badge";
import { Award, GraduationCap, Clock, Star } from "lucide-react";

const About = () => {
  return (
    <section id="sobre" className="py-16 bg-background relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-teal-light/40 to-transparent" />
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          {/* Image */}
          <div className="relative opacity-0 animate-fade-in max-w-sm mx-auto lg:mx-0" style={{ animationDelay: "0.2s" }}>
            <div className="aspect-[4/5] rounded-3xl overflow-hidden bg-gradient-to-br from-teal-light to-sand relative shadow-2xl">
              <img 
                src="https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=600&q=80" 
                alt="Psicóloga profissional"
                className="w-full h-full object-cover"
              />
              {/* Overlay gradient */}
              <div className="absolute inset-0 bg-gradient-to-t from-charcoal/20 via-transparent to-transparent" />
            </div>
            
            {/* Floating card */}
            <div className="absolute -bottom-6 -right-6 bg-card p-6 rounded-2xl shadow-2xl max-w-[220px] border border-border">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-gold to-gold/80 flex items-center justify-center">
                  <Clock className="w-5 h-5 text-white" />
                </div>
                <span className="font-serif text-3xl text-charcoal">10+</span>
              </div>
              <p className="text-sm text-slate font-medium">Anos de experiência em psicoterapia</p>
            </div>
            
            {/* Rating badge */}
            <div className="absolute -top-4 -left-4 bg-card px-4 py-2 rounded-full shadow-xl border border-border flex items-center gap-2">
              <div className="flex">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-gold text-gold" />
                ))}
              </div>
              <span className="text-sm font-bold text-charcoal">5.0</span>
            </div>
          </div>

          {/* Content */}
          <div className="opacity-0 animate-fade-in-up" style={{ animationDelay: "0.4s" }}>
            <Badge className="bg-teal-light border border-teal/20 text-teal-dark hover:bg-teal-light mb-6 px-4 py-1.5 text-sm font-semibold">
              Sobre Mim
            </Badge>
            
            <h2 className="font-serif text-3xl md:text-4xl lg:text-5xl mb-6 text-charcoal">
              Dra. Maria <span className="text-teal">Silva</span>
            </h2>
            
            <p className="text-slate text-lg leading-relaxed mb-6 font-medium">
              Sou psicóloga clínica com especialização em Terapia Cognitivo-Comportamental 
              e Psicoterapia Humanista. Minha abordagem é integrativa, combinando diferentes 
              técnicas para atender às necessidades únicas de cada pessoa.
            </p>
            
            <p className="text-slate leading-relaxed mb-8 font-medium">
              Acredito que cada indivíduo possui recursos internos para superar desafios 
              e alcançar uma vida mais plena. Meu papel é criar um espaço seguro e acolhedor 
              para que essa transformação aconteça.
            </p>

            <div className="space-y-4">
              <div className="flex items-center gap-4 p-4 rounded-2xl bg-teal-light/50 hover:bg-teal-light transition-all duration-300 group border border-teal/10">
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-teal to-teal-dark flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <GraduationCap className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h4 className="font-semibold text-charcoal text-lg">Formação Acadêmica</h4>
                  <p className="text-sm text-slate font-medium">Mestrado em Psicologia Clínica - USP</p>
                </div>
              </div>
              
              <div className="flex items-center gap-4 p-4 rounded-2xl bg-gold-light/50 hover:bg-gold-light transition-all duration-300 group border border-gold/10">
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-gold to-gold/80 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <Award className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h4 className="font-semibold text-charcoal text-lg">Registro Profissional</h4>
                  <p className="text-sm text-slate font-medium">CRP 06/123456</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;
