import Logo from "@/components/Logo";
import { Button } from "@/components/ui/button";
import { Link, useNavigate } from "react-router-dom";
import { User, Menu, X, ArrowLeft, LayoutDashboard, LogOut } from "lucide-react";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { User as SupabaseUser } from "@supabase/supabase-js";

const navItems = [
  { label: "Início", href: "#inicio" },
  { label: "Como funciona?", href: "#como-funciona" },
  { label: "Plano e preço", href: "#precos" },
  { label: "Cadastro simples", href: "#cadastro" },
  { label: "Dúvidas frequentes", href: "#faq" },
];

const ProHeader = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setUser(session?.user ?? null);
      }
    );

    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const scrollToSection = (href: string) => {
    const element = document.querySelector(href);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
    setMobileMenuOpen(false);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/profissionais");
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-[hsl(215,35%,14%)] border-b border-white/10">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link to="/">
            <Logo size="sm" />
          </Link>
          <span className="text-sm text-white/70 font-medium">| Para profissionais</span>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center gap-6">
          {navItems.map((item) => (
            <button
              key={item.href}
              onClick={() => scrollToSection(item.href)}
              className="text-sm font-medium text-white/70 hover:text-white transition-colors"
            >
              {item.label}
            </button>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          {user ? (
            <>
              <Link to="/dashboard">
                <Button size="sm" className="hidden sm:flex items-center gap-2 bg-primary hover:bg-primary/90 text-white">
                  <LayoutDashboard size={16} />
                  Dashboard
                </Button>
              </Link>
              <button
                onClick={handleLogout}
                className="hidden sm:flex items-center gap-2 text-white/70 hover:text-white transition-colors text-sm"
              >
                <LogOut size={16} />
                Sair
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => window.history.back()}
                className="hidden sm:flex items-center gap-2 text-white/70 hover:text-white transition-colors text-sm"
              >
                <ArrowLeft size={16} />
                Voltar
              </button>
              <Link to="/" className="hidden sm:block">
                <Button variant="outline" size="sm" className="flex items-center gap-2 border-white/30 text-white hover:bg-white/10 hover:text-white bg-transparent">
                  <User size={16} />
                  Sou cliente
                </Button>
              </Link>
              <Link to="/auth">
                <button className="hidden sm:block px-5 py-2.5 bg-primary text-white text-sm font-semibold rounded-full hover:bg-primary/90 transition-all hover:scale-105">
                  Entrar
                </button>
              </Link>
            </>
          )}

          {/* Mobile menu button */}
          <button
            className="lg:hidden p-2 text-white"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-[hsl(215,35%,14%)] border-t border-white/10">
          <nav className="container mx-auto px-4 py-4 flex flex-col gap-3">
            {navItems.map((item) => (
              <button
                key={item.href}
                onClick={() => scrollToSection(item.href)}
                className="text-sm font-medium text-white/70 hover:text-white transition-colors text-left py-2"
              >
                {item.label}
              </button>
            ))}
            {user ? (
              <>
                <Link to="/dashboard" className="mt-2">
                  <Button size="sm" className="w-full flex items-center justify-center gap-2 bg-primary hover:bg-primary/90 text-white">
                    <LayoutDashboard size={16} />
                    Dashboard
                  </Button>
                </Link>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center justify-center gap-2 text-white/70 hover:text-white transition-colors text-sm py-2"
                >
                  <LogOut size={16} />
                  Sair
                </button>
              </>
            ) : (
              <>
                <Link to="/" className="mt-2">
                  <Button variant="outline" size="sm" className="w-full flex items-center justify-center gap-2 border-white/30 text-white hover:bg-white/10 bg-transparent">
                    <User size={16} />
                    Sou cliente
                  </Button>
                </Link>
                <Link to="/auth">
                  <Button size="sm" className="w-full mt-2">
                    Entrar
                  </Button>
                </Link>
              </>
            )}
          </nav>
        </div>
      )}
    </header>
  );
};

export default ProHeader;
