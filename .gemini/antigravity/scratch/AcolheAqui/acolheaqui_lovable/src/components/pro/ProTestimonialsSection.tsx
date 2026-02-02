import { Star, Quote } from "lucide-react";
import avatar1 from "@/assets/avatar-1.jpg";
import avatar2 from "@/assets/avatar-2.jpg";
import avatar3 from "@/assets/avatar-3.jpg";

const testimonials = [
  {
    name: "Dra. Camila Ferreira",
    role: "Psicóloga Clínica | CRP 06/123456",
    avatar: avatar1,
    quote: "Desde que entrei na plataforma, minha agenda nunca mais ficou vazia. Recebo contatos qualificados direto no WhatsApp, sem intermediários.",
    rating: 5,
  },
  {
    name: "Dr. Lucas Mendes",
    role: "Psicanalista | CRP 05/789012",
    avatar: avatar2,
    quote: "A praticidade do checkout próprio e da sala virtual mudou completamente minha rotina. Consigo focar 100% no que importa: meus pacientes.",
    rating: 5,
  },
  {
    name: "Dra. Ana Beatriz Costa",
    role: "Terapeuta Cognitivo-Comportamental | CRP 04/345678",
    avatar: avatar3,
    quote: "O CRM integrado me ajuda a acompanhar cada paciente de forma organizada. A plataforma é intuitiva e o suporte é excelente!",
    rating: 5,
  },
];

const ProTestimonialsSection = () => {
  return (
    <section className="py-20 bg-[hsl(215,35%,12%)]">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <span className="inline-block px-4 py-2 bg-primary/20 text-primary rounded-full text-sm font-medium mb-4">
            Depoimentos
          </span>
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-white">
            O que dizem os profissionais
          </h2>
          <p className="text-white/70 text-lg max-w-2xl mx-auto">
            Psicólogos e terapeutas que já fazem parte da nossa comunidade
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <div
              key={index}
              className="group relative p-8 bg-[hsl(215,35%,16%)] rounded-2xl border border-white/10 hover:border-primary/50 transition-all duration-300 hover:shadow-xl hover:shadow-primary/10 hover:-translate-y-2"
            >
              {/* Quote icon */}
              <div className="absolute -top-4 -left-2 w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center group-hover:bg-primary/30 transition-colors">
                <Quote className="w-6 h-6 text-primary" />
              </div>

              {/* Stars */}
              <div className="flex gap-1 mb-4 pt-4">
                {Array.from({ length: testimonial.rating }).map((_, i) => (
                  <Star
                    key={i}
                    className="w-5 h-5 fill-primary text-primary"
                  />
                ))}
              </div>

              {/* Quote text */}
              <p className="text-white/80 text-lg leading-relaxed mb-6 italic">
                "{testimonial.quote}"
              </p>

              {/* Author */}
              <div className="flex items-center gap-4 pt-4 border-t border-white/10">
                <img
                  src={testimonial.avatar}
                  alt={testimonial.name}
                  className="w-14 h-14 rounded-full object-cover border-2 border-primary/30 group-hover:border-primary/60 transition-colors"
                />
                <div>
                  <h4 className="text-white font-semibold group-hover:text-primary transition-colors">
                    {testimonial.name}
                  </h4>
                  <p className="text-white/60 text-sm">{testimonial.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ProTestimonialsSection;
