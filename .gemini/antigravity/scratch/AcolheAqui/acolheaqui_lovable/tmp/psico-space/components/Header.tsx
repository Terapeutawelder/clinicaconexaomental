import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Menu, X, Heart, Sparkles } from "lucide-react";

const navLinks = [
  { label: "Início", href: "#" },
  { label: "Serviços", href: "#servicos" },
  { label: "Sobre", href: "#sobre" },
  { label: "Agenda", href: "#agenda" },
  { label: "Contato", href: "#contato" },
];

const Header = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        isScrolled
          ? "bg-background/95 backdrop-blur-xl shadow-lg shadow-charcoal/5 py-3"
          : "bg-transparent py-5"
      }`}
    >
      <div className="container mx-auto px-4">
        <nav className="flex items-center justify-between">
          {/* Logo */}
          <a href="#" className="flex items-center gap-2 group">
            <div className="relative w-11 h-11 rounded-xl bg-gradient-to-br from-teal to-teal-dark flex items-center justify-center shadow-lg group-hover:shadow-xl group-hover:shadow-teal/30 transition-all duration-300 group-hover:scale-105">
              <Heart className="w-5 h-5 text-white" />
              <Sparkles className="absolute -top-1 -right-1 w-3 h-3 text-gold" />
            </div>
            <span className="font-serif text-xl text-charcoal">Dra. Maria Silva</span>
          </a>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="relative text-slate hover:text-teal transition-colors duration-300 text-sm font-semibold group"
              >
                {link.label}
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-teal group-hover:w-full transition-all duration-300" />
              </a>
            ))}
          </div>

          {/* CTA Button */}
          <div className="hidden md:block">
            <Button 
              onClick={() => document.getElementById('agenda')?.scrollIntoView({ behavior: 'smooth' })}
              className="bg-gradient-to-r from-teal to-teal-dark hover:from-teal-dark hover:to-teal text-white shadow-lg hover:shadow-xl hover:shadow-teal/25 transition-all duration-300 hover:-translate-y-0.5 font-semibold"
            >
              Agendar Consulta
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 text-charcoal rounded-lg hover:bg-teal-light transition-colors"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </nav>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden absolute top-full left-0 right-0 bg-background/98 backdrop-blur-xl border-b border-border shadow-xl animate-fade-in">
            <div className="container mx-auto px-4 py-6 space-y-4">
              {navLinks.map((link, index) => (
                <a
                  key={link.label}
                  href={link.href}
                  className="block text-charcoal hover:text-teal transition-colors duration-200 py-2 text-lg font-semibold opacity-0 animate-fade-in-up"
                  style={{ animationDelay: `${index * 0.1}s` }}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {link.label}
                </a>
              ))}
              <Button 
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  document.getElementById('agenda')?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="w-full bg-gradient-to-r from-teal to-teal-dark text-white mt-4 shadow-lg font-semibold"
              >
                Agendar Consulta
              </Button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
