import { Star, Quote } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LandingPageConfig } from "../LandingPagePreview";

interface TestimonialsSectionProps {
  config: LandingPageConfig;
  testimonials: any[];
}

const TestimonialsSection = ({ config, testimonials }: TestimonialsSectionProps) => {
  if (testimonials.length === 0) return null;

  return (
    <section 
      className="py-20 relative overflow-hidden"
      style={{ backgroundColor: `hsl(${config.colors.secondary})` }}
    >
      {/* Background decoration */}
      <div 
        className="absolute top-10 right-10 w-40 h-40 rounded-full blur-3xl" 
        style={{ backgroundColor: `hsl(${config.colors.primary} / 0.1)` }}
      />
      <div 
        className="absolute bottom-10 left-10 w-48 h-48 rounded-full blur-3xl" 
        style={{ backgroundColor: `hsl(${config.colors.accent} / 0.1)` }}
      />
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <Badge 
            className="px-4 py-1.5 text-sm font-semibold mb-4"
            style={{ 
              backgroundColor: `hsl(${config.colors.secondary})`,
              color: `hsl(${config.colors.primary})`,
              borderColor: `hsl(${config.colors.primary} / 0.2)`,
              borderWidth: '1px'
            }}
          >
            Depoimentos
          </Badge>
          <h2 className="font-serif text-3xl md:text-4xl text-charcoal mb-4">
            {config.testimonials.title}
          </h2>
          <p className="text-slate font-medium">{config.testimonials.subtitle}</p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {testimonials.slice(0, 6).map((testimonial, index) => (
            <Card 
              key={testimonial.id || index} 
              className="bg-white border border-border shadow-lg hover:shadow-xl transition-all duration-500 hover:-translate-y-1"
              style={testimonial.is_featured ? { 
                boxShadow: `0 0 0 2px hsl(${config.colors.accent} / 0.5)` 
              } : undefined}
            >
              <CardContent className="p-6 relative">
                <Quote 
                  className="absolute top-4 right-4 w-8 h-8" 
                  style={{ color: `hsl(${config.colors.primary} / 0.1)` }}
                />
                
                <div className="flex mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star 
                      key={i} 
                      className="w-4 h-4"
                      style={{ 
                        fill: i < testimonial.rating ? `hsl(${config.colors.accent})` : 'transparent',
                        color: i < testimonial.rating ? `hsl(${config.colors.accent})` : '#d1d5db'
                      }}
                    />
                  ))}
                </div>
                
                <p className="text-slate mb-6 text-sm leading-relaxed italic">
                  "{testimonial.content}"
                </p>
                
                <div className="flex items-center gap-3 pt-4 border-t border-border">
                  <div 
                    className="w-10 h-10 rounded-full flex items-center justify-center"
                    style={{ background: `linear-gradient(to bottom right, hsl(${config.colors.primary}), hsl(${config.colors.primary} / 0.8))` }}
                  >
                    <span className="text-white font-bold text-sm">
                      {testimonial.client_name?.charAt(0) || "?"}
                    </span>
                  </div>
                  <div>
                    <p className="font-semibold text-charcoal text-sm">{testimonial.client_name}</p>
                    <p className="text-xs text-slate">Paciente</p>
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

export default TestimonialsSection;
