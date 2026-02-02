import { Heart, Instagram, Facebook, Linkedin, Sparkles } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-charcoal text-white py-16 relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-teal via-gold to-teal" />
      <div className="absolute top-20 right-10 w-40 h-40 bg-teal/10 rounded-full blur-3xl" />
      <div className="absolute bottom-10 left-10 w-32 h-32 bg-gold/10 rounded-full blur-3xl" />
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="grid md:grid-cols-3 gap-12 mb-12">
          {/* Brand */}
          <div>
            <a href="#" className="flex items-center gap-2 mb-4 group">
              <div className="relative w-11 h-11 rounded-xl bg-gradient-to-br from-teal to-teal-dark flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform duration-300">
                <Heart className="w-5 h-5 text-white" />
                <Sparkles className="absolute -top-1 -right-1 w-3 h-3 text-gold" />
              </div>
              <span className="font-serif text-xl">Dra. Maria Silva</span>
            </a>
            <p className="text-white/70 text-sm leading-relaxed font-medium">
              Psicóloga clínica especializada em Terapia Cognitivo-Comportamental. 
              Atendimento humanizado e personalizado para adultos e casais.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold mb-4 flex items-center gap-2">
              <span className="w-8 h-0.5 bg-gradient-to-r from-teal to-gold" />
              Links Rápidos
            </h4>
            <div className="space-y-2">
              <a href="#servicos" className="block text-white/70 hover:text-teal transition-colors text-sm font-medium hover:translate-x-1 transform duration-200">
                Serviços
              </a>
              <a href="#sobre" className="block text-white/70 hover:text-teal transition-colors text-sm font-medium hover:translate-x-1 transform duration-200">
                Sobre
              </a>
              <a href="#agenda" className="block text-white/70 hover:text-teal transition-colors text-sm font-medium hover:translate-x-1 transform duration-200">
                Agendar Consulta
              </a>
              <a href="#contato" className="block text-white/70 hover:text-teal transition-colors text-sm font-medium hover:translate-x-1 transform duration-200">
                Contato
              </a>
            </div>
          </div>

          {/* Social */}
          <div>
            <h4 className="font-semibold mb-4 flex items-center gap-2">
              <span className="w-8 h-0.5 bg-gradient-to-r from-gold to-teal" />
              Redes Sociais
            </h4>
            <div className="flex items-center gap-3">
              <a 
                href="#" 
                className="w-11 h-11 rounded-xl bg-white/10 hover:bg-gradient-to-br hover:from-teal hover:to-teal-dark flex items-center justify-center transition-all duration-300 hover:scale-110 hover:shadow-lg hover:shadow-teal/30"
              >
                <Instagram className="w-5 h-5" />
              </a>
              <a 
                href="#" 
                className="w-11 h-11 rounded-xl bg-white/10 hover:bg-gradient-to-br hover:from-teal hover:to-teal-dark flex items-center justify-center transition-all duration-300 hover:scale-110 hover:shadow-lg hover:shadow-teal/30"
              >
                <Facebook className="w-5 h-5" />
              </a>
              <a 
                href="#" 
                className="w-11 h-11 rounded-xl bg-white/10 hover:bg-gradient-to-br hover:from-teal hover:to-teal-dark flex items-center justify-center transition-all duration-300 hover:scale-110 hover:shadow-lg hover:shadow-teal/30"
              >
                <Linkedin className="w-5 h-5" />
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-white/50 text-sm font-medium">
            © 2024 Dra. Maria Silva. Todos os direitos reservados.
          </p>
          <p className="text-white/50 text-sm flex items-center gap-2 font-medium">
            <span className="w-2 h-2 rounded-full bg-gradient-to-r from-teal to-gold" />
            CRP 06/123456
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
