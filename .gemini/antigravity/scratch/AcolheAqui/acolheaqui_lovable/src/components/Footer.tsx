import { Link } from "react-router-dom";
import Logo from "./Logo";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="py-8 px-4 bg-background border-t border-border">
      <div className="container mx-auto flex flex-col items-center gap-6">
        <Logo size="sm" />
        
        <div className="flex flex-wrap items-center justify-center gap-6 text-sm">
          <Link 
            to="/politica-de-privacidade" 
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            Política de Privacidade
          </Link>
          <Link 
            to="/termos-de-uso" 
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            Termos e Condições
          </Link>
        </div>
        
        <p className="text-sm text-muted-foreground">
          © Copyright {currentYear} - Todos os direitos reservados.
        </p>
      </div>
    </footer>
  );
};

export default Footer;
