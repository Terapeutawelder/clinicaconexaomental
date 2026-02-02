import { Card, CardContent } from "@/components/ui/card";
import { Quote, Star } from "lucide-react";

const testimonials = [
  {
    name: "Carlos M.",
    role: "Terapia Individual",
    content: "A Dra. Maria me ajudou a superar um momento muito difícil da minha vida. Seu acolhimento e profissionalismo fizeram toda a diferença no meu processo de autoconhecimento.",
    rating: 5,
    initials: "CM",
  },
  {
    name: "Ana Paula S.",
    role: "Terapia de Casal",
    content: "Depois de anos de conflitos, finalmente conseguimos nos comunicar de verdade. As sessões transformaram nosso relacionamento e nos trouxeram de volta.",
    rating: 5,
    initials: "AS",
  },
  {
    name: "Roberto L.",
    role: "Ansiedade",
    content: "Sofri com ansiedade por anos. Com o tratamento, aprendi técnicas que me ajudam diariamente. Hoje tenho uma qualidade de vida que não imaginava ser possível.",
    rating: 5,
    initials: "RL",
  },
];

const Testimonials = () => {
  return (
    <section className="py-16 bg-secondary relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-10 right-10 w-32 h-32 bg-teal/5 rounded-full blur-3xl" />
      <div className="absolute bottom-10 left-10 w-40 h-40 bg-gold/5 rounded-full blur-3xl" />
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="inline-block px-4 py-1.5 bg-teal-light border border-teal/20 text-teal-dark font-semibold text-sm rounded-full mb-4">
            Depoimentos
          </span>
          <h2 className="font-serif text-3xl md:text-4xl lg:text-5xl mb-4 text-charcoal">
            O Que Dizem Nossos <span className="text-teal">Pacientes</span>
          </h2>
          <p className="text-slate text-lg font-medium">
            Histórias reais de transformação e superação
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <Card 
              key={testimonial.name}
              className="bg-card border border-border shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 opacity-0 animate-fade-in-up relative overflow-hidden group"
              style={{ animationDelay: `${index * 0.15}s` }}
            >
              {/* Quote decoration */}
              <div className="absolute top-4 right-4 opacity-10 group-hover:opacity-20 transition-opacity duration-300">
                <Quote className="w-16 h-16 text-teal" />
              </div>
              
              <CardContent className="p-8 relative z-10">
                {/* Rating */}
                <div className="flex gap-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-gold text-gold" />
                  ))}
                </div>
                
                {/* Content */}
                <p className="text-slate font-medium leading-relaxed mb-6 italic">
                  "{testimonial.content}"
                </p>
                
                {/* Author */}
                <div className="flex items-center gap-4 pt-4 border-t border-border">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-teal to-teal-dark flex items-center justify-center text-white font-bold text-sm shadow-lg">
                    {testimonial.initials}
                  </div>
                  <div>
                    <h4 className="font-semibold text-charcoal">{testimonial.name}</h4>
                    <p className="text-sm text-slate">{testimonial.role}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
