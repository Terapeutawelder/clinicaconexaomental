
import { Button } from "@/components/ui/button";
import { MessageCircle, Mail, MapPin, Phone } from "lucide-react";
import { useNavigate } from "react-router-dom";
const logo = "/lovable-uploads/1c4653a3-9aa5-49a8-8b1a-7e182d51255e.png";

const Footer = () => {
  const navigate = useNavigate();

  const handleWhatsAppClick = () => {
    window.open('https://wa.me/5527998703988', '_blank');
  };

  const handleNavigateToTop = (path: string) => {
    navigate(path);
    // Scroll to top after navigation
    setTimeout(() => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 100);
  };

  return (
    <footer id="footer-section" className="purple-bg text-white py-8 md:py-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 items-start">
          {/* Informações da Clínica */}
          <div className="text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start mb-4">
              <img src={logo} alt="Clínica Conexão Mental" className="w-12 h-12 mr-1" />
              <h3 className="text-xl font-bold">Clínica Conexão Mental</h3>
            </div>
            <div className="space-y-2 text-purple-100">
              <div className="flex items-start gap-2 justify-center md:justify-start">
                <MapPin className="h-4 w-4 mt-1 flex-shrink-0" />
                <div>
                  <p>Avenida Nossa Senhora da Penha, 2598</p>
                  <p>Santa Luzia, Vitória/ES - Brasil</p>
                  <p>CEP: 29045-402</p>
                </div>
              </div>
            </div>
          </div>

          {/* Contato */}
          <div className="text-center md:text-left">
            <h3 className="text-xl font-bold mb-4">Entre em Contato</h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3 justify-center md:justify-start">
                <Mail className="h-5 w-5 text-blue-200" />
                <a 
                  href="mailto:contato@conexaomental.online" 
                  className="text-purple-100 hover:text-white transition-colors"
                >
                  contato@conexaomental.online
                </a>
              </div>
              <div className="flex items-center gap-3 justify-center md:justify-start">
                <Phone className="h-5 w-5 text-green-200" />
                <div className="space-y-1">
                  <a 
                    href="tel:+5527998703988" 
                    className="block text-purple-100 hover:text-white transition-colors"
                  >
                    (27) 99870-3988
                  </a>
                  <a 
                    href="tel:+5527981415026" 
                    className="block text-purple-100 hover:text-white transition-colors"
                  >
                    (27) 98141-5026
                  </a>
                </div>
              </div>
              <div className="flex justify-center md:justify-start">
                <Button 
                  variant="outline" 
                  className="mt-4 border-green-400 text-green-400 hover:bg-green-400 hover:text-white bg-green-500 text-white hover:bg-green-600"
                  onClick={handleWhatsAppClick}
                >
                  <MessageCircle className="mr-2 h-4 w-4" />
                  Enviar mensagem WhatsApp
                </Button>
              </div>
            </div>
          </div>

          {/* Links Rápidos */}
          <div className="text-center md:text-left">
            <h3 className="text-xl font-bold mb-4">Links Rápidos</h3>
            <div className="space-y-2">
              <button 
                onClick={() => handleNavigateToTop('/como-funciona')}
                className="block text-purple-100 hover:text-white transition-colors text-left mx-auto md:mx-0"
              >
                Como Funciona
              </button>
              <button 
                onClick={() => handleNavigateToTop('/sobre-nos')}
                className="block text-purple-100 hover:text-white transition-colors text-left mx-auto md:mx-0"
              >
                Sobre Nós
              </button>
              <button 
                onClick={() => handleNavigateToTop('/contato')}
                className="block text-purple-100 hover:text-white transition-colors text-left mx-auto md:mx-0"
              >
                Contato
              </button>
            </div>
          </div>
        </div>

        {/* Bottom Footer */}
        <div className="border-t border-purple-400 mt-8 pt-8 bg-white/90 rounded-lg p-6 -mx-4">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <p className="text-gray-700 text-sm">
              © 2024 Clínica Conexão Mental. Todos os direitos reservados.
            </p>
            <div className="flex flex-wrap justify-center md:justify-end space-x-4 text-sm">
              <button 
                onClick={() => handleNavigateToTop('/politica-de-privacidade')}
                className="text-gray-700 hover:text-purple-600 transition-colors"
              >
                Política de Privacidade
              </button>
              <button 
                onClick={() => handleNavigateToTop('/termos-de-uso')}
                className="text-gray-700 hover:text-purple-600 transition-colors"
              >
                Termos de Uso
              </button>
              <button 
                onClick={() => handleNavigateToTop('/politica-de-reembolso')}
                className="text-gray-700 hover:text-purple-600 transition-colors"
              >
                Política de Reembolso
              </button>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
