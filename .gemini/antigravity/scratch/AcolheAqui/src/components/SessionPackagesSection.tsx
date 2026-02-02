import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Clock, Package, Calendar, ChevronRight, Star, Quote } from "lucide-react";

export interface SessionPackage {
  id: string;
  name: string;
  duration: number;
  sessions: number;
  price: number;
  type: "single" | "pack-2" | "pack-4";
}

export const sessionPackages: SessionPackage[] = [
  {
    id: "single-30",
    name: "Sessão de 30 minutos",
    duration: 30,
    sessions: 1,
    price: 37.90,
    type: "single",
  },
  {
    id: "pack-2-30",
    name: "Pacote de 2 sessões de 30 min",
    duration: 30,
    sessions: 2,
    price: 69.80,
    type: "pack-2",
  },
  {
    id: "pack-4-30",
    name: "Pacote mensal com 4 sessões de 30 min",
    duration: 30,
    sessions: 4,
    price: 129.80,
    type: "pack-4",
  },
  {
    id: "single-45",
    name: "Sessão de 45 minutos",
    duration: 45,
    sessions: 1,
    price: 57.90,
    type: "single",
  },
  {
    id: "pack-2-45",
    name: "Pacote de 2 sessões de 45 min",
    duration: 45,
    sessions: 2,
    price: 99.80,
    type: "pack-2",
  },
  {
    id: "pack-4-45",
    name: "Pacote mensal com 4 sessões de 45 min",
    duration: 45,
    sessions: 4,
    price: 189.80,
    type: "pack-4",
  },
];

const testimonials = [
  {
    id: 1,
    name: "Carolina M.",
    photo: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&crop=face",
    rating: 5,
    text: "A terapia online mudou minha vida. Consigo encaixar as sessões na minha rotina corrida e o atendimento é excelente!",
  },
  {
    id: 2,
    name: "Ricardo S.",
    photo: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face",
    rating: 5,
    text: "Estava cético no início, mas a praticidade e a qualidade dos profissionais me surpreenderam. Super recomendo!",
  },
  {
    id: 3,
    name: "Fernanda L.",
    photo: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face",
    rating: 5,
    text: "O pacote mensal tem um ótimo custo-benefício. Minha psicóloga é incrível e os preços são muito acessíveis.",
  },
];

const formatPrice = (price: number) => {
  return price.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
};

const getIcon = (type: SessionPackage["type"]) => {
  switch (type) {
    case "single":
      return Clock;
    case "pack-2":
      return Package;
    case "pack-4":
      return Calendar;
  }
};

const SessionPackagesSection = () => {
  const packages30 = sessionPackages.filter((p) => p.duration === 30);
  const packages45 = sessionPackages.filter((p) => p.duration === 45);

  return (
    <section className="py-10 sm:py-16 md:py-24 bg-gradient-to-b from-background via-primary/5 to-background">
      <div className="container mx-auto px-4">
        <h2 className="text-xl sm:text-2xl md:text-4xl font-bold text-center text-foreground mb-3 sm:mb-4">
          Escolha o plano ideal para você
        </h2>
        <p className="text-center text-muted-foreground mb-8 sm:mb-12 max-w-2xl mx-auto text-sm sm:text-base">
          Sessões individuais ou pacotes com desconto. Escolha a opção que melhor se adapta à sua rotina.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-8 max-w-5xl mx-auto">
          {/* 30 min packages */}
          <div className="bg-card rounded-2xl sm:rounded-3xl border-2 border-primary/20 p-4 sm:p-8 shadow-xl shadow-primary/10 hover:shadow-2xl hover:shadow-primary/20 transition-all duration-300">
            <div className="flex items-center gap-3 mb-4 sm:mb-8">
              <div className="w-10 h-10 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center shadow-lg">
                <Clock size={20} className="sm:w-7 sm:h-7 text-primary-foreground" />
              </div>
              <div>
                <h3 className="text-lg sm:text-2xl font-bold text-foreground">30 minutos</h3>
                <p className="text-xs sm:text-sm text-muted-foreground">Sessões rápidas e objetivas</p>
              </div>
            </div>

            <div className="space-y-3 sm:space-y-4">
              {packages30.map((pkg, index) => {
                const Icon = getIcon(pkg.type);
                const isPopular = pkg.type === "pack-2";
                return (
                  <Link
                    key={pkg.id}
                    to={`/psicoterapeutas?pacote=${pkg.id}`}
                    className="block"
                  >
                    <div className={`relative flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 sm:p-5 rounded-xl sm:rounded-2xl border-2 transition-all group ${
                      isPopular 
                        ? "border-green-500 bg-green-50 dark:bg-green-950/30 hover:shadow-lg" 
                        : "border-border hover:border-primary/50 hover:bg-primary/5"
                    }`}>
                      {isPopular && (
                        <div className="absolute -top-2 sm:-top-3 left-3 sm:left-4 px-2 sm:px-3 py-0.5 sm:py-1 bg-green-500 text-white text-[10px] sm:text-xs font-bold rounded-full">
                          MAIS POPULAR
                        </div>
                      )}
                      <div className="flex items-center gap-3 sm:gap-4 mb-2 sm:mb-0">
                        <div className={`w-9 h-9 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl flex items-center justify-center ${
                          isPopular ? "bg-green-100 dark:bg-green-900/50" : "bg-muted"
                        }`}>
                          <Icon size={18} className="sm:w-[22px] sm:h-[22px]" />
                        </div>
                        <div>
                          <p className={`font-bold text-sm sm:text-lg ${isPopular ? "text-green-700 dark:text-green-400" : "text-foreground group-hover:text-primary"}`}>
                            {pkg.sessions === 1 ? "1 sessão" : `${pkg.sessions} sessões`}
                          </p>
                          <p className="text-xs sm:text-sm text-muted-foreground">
                            {pkg.type === "pack-4" ? "Pacote mensal" : pkg.type === "pack-2" ? "Pacote duplo" : "Sessão única"}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center justify-between sm:justify-end gap-2 sm:gap-3 pl-12 sm:pl-0">
                        <span className={`font-bold text-base sm:text-xl ${isPopular ? "text-green-600" : "text-primary"}`}>
                          {formatPrice(pkg.price)}
                        </span>
                        <ChevronRight size={18} className="sm:w-5 sm:h-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>

          {/* 45 min packages */}
          <div className="bg-card rounded-2xl sm:rounded-3xl border-2 border-accent/20 p-4 sm:p-8 shadow-xl shadow-accent/10 hover:shadow-2xl hover:shadow-accent/20 transition-all duration-300">
            <div className="flex items-center gap-3 mb-4 sm:mb-8">
              <div className="w-10 h-10 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl bg-gradient-to-br from-accent to-accent/70 flex items-center justify-center shadow-lg">
                <Clock size={20} className="sm:w-7 sm:h-7 text-accent-foreground" />
              </div>
              <div>
                <h3 className="text-lg sm:text-2xl font-bold text-foreground">45 minutos</h3>
                <p className="text-xs sm:text-sm text-muted-foreground">Sessões completas e aprofundadas</p>
              </div>
            </div>

            <div className="space-y-3 sm:space-y-4">
              {packages45.map((pkg) => {
                const Icon = getIcon(pkg.type);
                const isPopular = pkg.type === "pack-2";
                return (
                  <Link
                    key={pkg.id}
                    to={`/psicoterapeutas?pacote=${pkg.id}`}
                    className="block"
                  >
                    <div className={`relative flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 sm:p-5 rounded-xl sm:rounded-2xl border-2 transition-all group ${
                      isPopular 
                        ? "border-green-500 bg-green-50 dark:bg-green-950/30 hover:shadow-lg" 
                        : "border-border hover:border-accent/50 hover:bg-accent/5"
                    }`}>
                      {isPopular && (
                        <div className="absolute -top-2 sm:-top-3 left-3 sm:left-4 px-2 sm:px-3 py-0.5 sm:py-1 bg-green-500 text-white text-[10px] sm:text-xs font-bold rounded-full">
                          MAIS POPULAR
                        </div>
                      )}
                      <div className="flex items-center gap-3 sm:gap-4 mb-2 sm:mb-0">
                        <div className={`w-9 h-9 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl flex items-center justify-center ${
                          isPopular ? "bg-green-100 dark:bg-green-900/50" : "bg-muted"
                        }`}>
                          <Icon size={18} className="sm:w-[22px] sm:h-[22px]" />
                        </div>
                        <div>
                          <p className={`font-bold text-sm sm:text-lg ${isPopular ? "text-green-700 dark:text-green-400" : "text-foreground group-hover:text-accent"}`}>
                            {pkg.sessions === 1 ? "1 sessão" : `${pkg.sessions} sessões`}
                          </p>
                          <p className="text-xs sm:text-sm text-muted-foreground">
                            {pkg.type === "pack-4" ? "Pacote mensal" : pkg.type === "pack-2" ? "Pacote duplo" : "Sessão única"}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center justify-between sm:justify-end gap-2 sm:gap-3 pl-12 sm:pl-0">
                        <span className={`font-bold text-base sm:text-xl ${isPopular ? "text-green-600" : "text-accent"}`}>
                          {formatPrice(pkg.price)}
                        </span>
                        <ChevronRight size={18} className="sm:w-5 sm:h-5 text-muted-foreground group-hover:text-accent group-hover:translate-x-1 transition-all" />
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>

        <div className="text-center mt-6 sm:mt-10">
          <Link to="/psicoterapeutas">
            <Button size="lg" className="gap-2 bg-green-600 hover:bg-green-700 text-white shadow-lg shadow-green-600/30 text-sm sm:text-base px-6 sm:px-8 py-4 sm:py-6">
              Agendar minha sessão
              <ChevronRight size={18} />
            </Button>
          </Link>
        </div>

        {/* Testimonials */}
        <div className="mt-12 sm:mt-20">
          <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-center text-foreground mb-6 sm:mb-8">
            O que nossos pacientes dizem
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 max-w-5xl mx-auto">
            {testimonials.map((testimonial) => (
              <div
                key={testimonial.id}
                className="bg-card rounded-xl sm:rounded-2xl border border-border p-4 sm:p-6 shadow-sm hover:shadow-md transition-all"
              >
                <Quote size={20} className="sm:w-6 sm:h-6 text-primary/30 mb-3 sm:mb-4" />
                <p className="text-muted-foreground mb-4 sm:mb-6 italic text-sm sm:text-base">"{testimonial.text}"</p>
                <div className="flex items-center gap-3">
                  <img
                    src={testimonial.photo}
                    alt={testimonial.name}
                    className="w-10 h-10 sm:w-12 sm:h-12 rounded-full object-cover"
                  />
                  <div>
                    <p className="font-semibold text-foreground text-sm sm:text-base">{testimonial.name}</p>
                    <div className="flex gap-0.5">
                      {Array.from({ length: testimonial.rating }).map((_, i) => (
                        <Star key={i} size={12} className="sm:w-[14px] sm:h-[14px] text-yellow-500 fill-yellow-500" />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default SessionPackagesSection;
