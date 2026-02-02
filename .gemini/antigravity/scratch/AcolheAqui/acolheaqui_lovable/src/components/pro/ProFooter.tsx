import Logo from "@/components/Logo";
import { Link } from "react-router-dom";

const ProFooter = () => {
  return (
    <footer className="py-12 bg-[hsl(215,35%,10%)] border-t border-white/10">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <Logo size="sm" />
            <span className="text-white/60">| Para profissionais</span>
          </div>
          
          <div className="flex flex-wrap items-center justify-center gap-6 text-sm">
            <Link to="/" className="text-white/60 hover:text-white transition-colors">
              Para clientes
            </Link>
            <a href="#como-funciona" className="text-white/60 hover:text-white transition-colors">
              Como funciona
            </a>
            <a href="#precos" className="text-white/60 hover:text-white transition-colors">
              Planos
            </a>
            <a href="#faq" className="text-white/60 hover:text-white transition-colors">
              FAQ
            </a>
            <Link to="/termos-de-uso" className="text-white/60 hover:text-white transition-colors">
              Termos de Uso
            </Link>
            <Link to="/politica-de-privacidade" className="text-white/60 hover:text-white transition-colors">
              Privacidade
            </Link>
          </div>
          
          <p className="text-white/50 text-sm">
            © {new Date().getFullYear()} AcolheAqui. Todos os direitos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default ProFooter;
