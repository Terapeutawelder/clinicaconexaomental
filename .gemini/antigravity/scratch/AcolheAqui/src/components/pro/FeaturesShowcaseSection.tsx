import { useEffect, useState } from "react";
import { Heart, Users, ThumbsUp, ChevronLeft, ChevronRight } from "lucide-react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from "@/components/ui/carousel";

import featureDashboard from "@/assets/feature-dashboard.jpg";
import featureWhatsapp from "@/assets/feature-whatsapp.jpg";
import featureAiAgent from "@/assets/feature-ai-agent.jpg";
import featureCalendar from "@/assets/feature-calendar.jpg";
import featureWhatsappQrcode from "@/assets/feature-whatsapp-qrcode.jpg";
import featureGoogleCalendar from "@/assets/feature-google-calendar.jpg";
import featureVideoCall from "@/assets/feature-video-call.jpg";
import featureCheckout from "@/assets/feature-checkout.jpg";

const stats = [
  {
    icon: Heart,
    title: "Todas as abordagens, infinitas possibilidades",
    description: "De braços abertos para você. Independente da sua abordagem, o Mindset é o destino ideal para profissionais que buscam crescer.",
    highlight: true,
  },
  {
    icon: Users,
    title: "+ de 1 milhão de usuários",
    description: "Uma comunidade que não para de crescer.",
    highlight: false,
  },
  {
    icon: ThumbsUp,
    title: "+ 90% de profissionais satisfeitos",
    description: "Profissionais que recomendam nossa plataforma.",
    highlight: false,
  },
];

const carouselImages = [
  {
    src: featureDashboard,
    alt: "Dashboard de gerenciamento",
    title: "Dashboard Completo",
  },
  {
    src: featureCalendar,
    alt: "Calendário de agendamentos",
    title: "Calendário Inteligente",
  },
  {
    src: featureAiAgent,
    alt: "Agente IA de agendamento",
    title: "Agente IA",
  },
  {
    src: featureWhatsapp,
    alt: "Notificações WhatsApp",
    title: "Notificações WhatsApp",
  },
  {
    src: featureWhatsappQrcode,
    alt: "Conexão WhatsApp via QR Code",
    title: "Conexão WhatsApp",
  },
  {
    src: featureGoogleCalendar,
    alt: "Integração com Google Agenda",
    title: "Google Agenda",
  },
  {
    src: featureVideoCall,
    alt: "Atendimento por videoconferência",
    title: "Videoconferência",
  },
  {
    src: featureCheckout,
    alt: "Checkout de pagamento personalizado",
    title: "Checkout Personalizado",
  },
];

const FeaturesShowcaseSection = () => {
  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    if (!api) return;

    setCurrent(api.selectedScrollSnap());

    api.on("select", () => {
      setCurrent(api.selectedScrollSnap());
    });
  }, [api]);

  // Auto-play carousel
  useEffect(() => {
    if (!api) return;

    const interval = setInterval(() => {
      api.scrollNext();
    }, 4000);

    return () => clearInterval(interval);
  }, [api]);

  return (
    <section id="funcionalidades" className="py-20 bg-[hsl(215,35%,95%)] overflow-hidden">
      <div className="container mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left side - Text and Stats */}
          <div>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6 text-[hsl(215,35%,15%)] leading-tight">
              Por que investir na sua carreira é a melhor opção?
            </h2>
            <p className="text-[hsl(215,35%,40%)] text-lg mb-10 max-w-xl">
              Invista na sua carreira e dê o primeiro passo rumo ao seu crescimento e bem-estar profissional.
              Veja, em números, o que temos a oferecer.
            </p>

            {/* Stats cards */}
            <div className="space-y-4">
              {stats.map((stat, index) => (
                <div
                  key={index}
                  className={`
                    p-5 rounded-2xl transition-all duration-300 hover:translate-x-2
                    ${stat.highlight 
                      ? 'bg-white shadow-lg border-l-4 border-primary' 
                      : 'bg-white/70 hover:bg-white hover:shadow-md'
                    }
                  `}
                >
                  <div className="flex items-start gap-4">
                    <div className={`
                      w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0
                      ${stat.highlight ? 'bg-primary/10' : 'bg-[hsl(215,35%,90%)]'}
                    `}>
                      <stat.icon className={`w-5 h-5 ${stat.highlight ? 'text-primary' : 'text-[hsl(215,35%,40%)]'}`} />
                    </div>
                    <div>
                      <h3 className={`font-bold mb-1 ${stat.highlight ? 'text-[hsl(215,35%,15%)]' : 'text-[hsl(215,35%,25%)]'}`}>
                        {stat.title}
                      </h3>
                      {stat.highlight && (
                        <p className="text-[hsl(215,35%,50%)] text-sm">{stat.description}</p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right side - Carousel */}
          <div className="relative">
            {/* Background decoration */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-primary/10 to-transparent rounded-3xl -rotate-3 scale-105" />
            <div className="absolute inset-0 bg-gradient-to-tl from-primary/10 via-transparent to-primary/5 rounded-3xl rotate-2 scale-105" />
            
            {/* Grid pattern overlay */}
            <div 
              className="absolute inset-0 rounded-3xl opacity-30"
              style={{
                backgroundImage: `
                  linear-gradient(to right, hsl(var(--primary) / 0.3) 1px, transparent 1px),
                  linear-gradient(to bottom, hsl(var(--primary) / 0.3) 1px, transparent 1px)
                `,
                backgroundSize: '40px 40px'
              }}
            />

            {/* Carousel */}
            <div className="relative z-10 p-4">
              <Carousel
                setApi={setApi}
                opts={{
                  align: "center",
                  loop: true,
                }}
                className="w-full"
              >
                <CarouselContent>
                  {carouselImages.map((image, index) => (
                    <CarouselItem key={index}>
                      <div className="p-2">
                        <div className="relative group">
                          {/* Image container with effects */}
                          <div className="relative overflow-hidden rounded-2xl shadow-2xl transform transition-all duration-500 group-hover:scale-[1.02]">
                            <img
                              src={image.src}
                              alt={image.alt}
                              className="w-full h-auto object-cover"
                            />
                            
                            {/* Gradient overlay */}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                            
                            {/* Title overlay */}
                            <div className="absolute bottom-0 left-0 right-0 p-4 transform translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                              <span className="inline-block px-4 py-2 bg-primary text-white rounded-full text-sm font-medium">
                                {image.title}
                              </span>
                            </div>
                          </div>
                          
                          {/* Glow effect */}
                          <div className="absolute -inset-2 bg-primary/20 rounded-3xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-10" />
                        </div>
                      </div>
                    </CarouselItem>
                  ))}
                </CarouselContent>

                {/* Custom navigation buttons */}
                <div className="flex items-center justify-center gap-4 mt-6">
                  <CarouselPrevious className="static translate-y-0 bg-white hover:bg-primary hover:text-white border-none shadow-lg" />
                  
                  {/* Dots indicator */}
                  <div className="flex gap-2">
                    {carouselImages.map((_, index) => (
                      <button
                        key={index}
                        onClick={() => api?.scrollTo(index)}
                        className={`
                          w-2.5 h-2.5 rounded-full transition-all duration-300
                          ${current === index 
                            ? 'bg-primary w-8' 
                            : 'bg-primary/30 hover:bg-primary/50'
                          }
                        `}
                        aria-label={`Go to slide ${index + 1}`}
                      />
                    ))}
                  </div>
                  
                  <CarouselNext className="static translate-y-0 bg-white hover:bg-primary hover:text-white border-none shadow-lg" />
                </div>
              </Carousel>
            </div>

            {/* Floating badges */}
            <div className="absolute -top-4 -right-4 px-4 py-2 bg-white rounded-full shadow-lg z-20 animate-bounce">
              <span className="text-sm font-medium text-primary">✨ Novo</span>
            </div>
            
            <div className="absolute -bottom-4 -left-4 px-4 py-2 bg-primary text-white rounded-full shadow-lg z-20">
              <span className="text-sm font-medium">100% Online</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FeaturesShowcaseSection;
