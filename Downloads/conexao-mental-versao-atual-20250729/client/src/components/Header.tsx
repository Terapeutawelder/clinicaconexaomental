
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Calendar, Menu, X, UserPlus, Video, ChevronDown, Heart, Settings, LogOut, User } from "lucide-react";
import { useState } from "react";
const logo = "/lovable-uploads/1c4653a3-9aa5-49a8-8b1a-7e182d51255e.png";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();
  const { user, signOut } = useAuth();

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
    setIsMenuOpen(false);
  };

  const handleComoFuncionaClick = () => {
    navigate('/como-funciona');
    setIsMenuOpen(false);
  };

  const handleScheduleClick = () => {
    scrollToSection('professionals-section');
  };

  const handleIniciarConsultaClick = () => {
    // Gerar link de acesso direto para teste
    navigate(`/video-consulta?direct=true&patient=Paciente%20Teste&professional=Dr.%20Ana%20Paula%20Silva&time=14:00&date=Hoje`);
    setIsMenuOpen(false);
  };

  const handleSobreNosClick = () => {
    navigate('/sobre-nos');
    setIsMenuOpen(false);
  };

  const handleContatoClick = () => {
    navigate('/contato');
    setIsMenuOpen(false);
  };

  const handleLoginClick = () => {
    navigate('/auth');
    setIsMenuOpen(false);
  };

  const handlePlanosClick = () => {
    scrollToSection('pricing-section');
    setIsMenuOpen(false);
  };

  const handleLogout = async () => {
    await signOut();
    navigate('/');
    setIsMenuOpen(false);
  };

  return (
    <header className="bg-white/90 backdrop-blur-md border-b sticky top-0 z-50 shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div 
            className="flex items-center cursor-pointer"
            onClick={() => navigate('/')}
          >
            <img src={logo} alt="Clínica Conexão Mental" className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 mr-1" />
            <span className="font-bold text-sm sm:text-base md:text-xl gradient-text hidden sm:block">Clínica Conexão Mental</span>
            <span className="font-bold text-sm gradient-text sm:hidden">Conexão Mental</span>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <button 
              onClick={handleSobreNosClick}
              className="text-gray-700 hover:text-purple-600 transition-colors font-medium"
            >
              Sobre Nós
            </button>
            <button 
              onClick={handleContatoClick}
              className="text-gray-700 hover:text-purple-600 transition-colors font-medium"
            >
              Contato
            </button>
            <button 
              onClick={handlePlanosClick}
              className="text-purple-600 hover:text-purple-700 transition-colors font-medium flex items-center"
            >
              <Heart className="mr-1 h-4 w-4" />
              Planos
            </button>
          </nav>

          {/* Desktop CTA */}
          <div className="hidden md:flex items-center space-x-2 lg:space-x-4">
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="text-purple-600 hover:text-purple-700 hover:bg-purple-50 font-medium text-sm lg:text-base">
                    <User className="mr-2 h-4 w-4" />
                    <span className="hidden lg:inline">{user.full_name}</span>
                    <span className="lg:hidden">{user.full_name.split(' ')[0]}</span>
                    <ChevronDown className="ml-1 h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {user.role === 'professional' && (
                    <DropdownMenuItem onClick={() => navigate('/agenda-profissional')}>
                      <Calendar className="mr-2 h-4 w-4" />
                      Minha Agenda
                    </DropdownMenuItem>
                  )}
                  {user.role === 'admin' && (
                    <DropdownMenuItem onClick={() => navigate('/admin')}>
                      <Settings className="mr-2 h-4 w-4" />
                      Painel Admin
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem onClick={handleLogout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    Sair
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="text-purple-600 hover:text-purple-700 hover:bg-purple-50 font-medium text-sm lg:text-base">
                    Para você
                    <ChevronDown className="ml-1 h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => navigate('/login-paciente')}>
                    <Heart className="mr-2 h-4 w-4" />
                    Paciente
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate('/login-profissional')}>
                    <img src={logo} alt="Logo Clínica" className="mr-2 h-4 w-4" />
                    Profissional
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate('/login-admin')}>
                    <Settings className="mr-2 h-4 w-4" />
                    Administrador
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}

            <Button onClick={handleIniciarConsultaClick} className="bg-purple-600 hover:bg-purple-700 text-white shadow-md text-xs lg:text-sm px-2 lg:px-4">
              <Video className="mr-1 h-4 w-4" />
              <span className="hidden lg:inline">Iniciar Consulta</span>
              <span className="lg:hidden">Consulta</span>
            </Button>
            <Button onClick={handleScheduleClick} className="bg-purple-600 hover:bg-purple-700 text-white shadow-md text-xs lg:text-sm px-2 lg:px-4">
              <Calendar className="mr-1 h-4 w-4" />
              <span className="hidden lg:inline">Agendar</span>
              <span className="lg:hidden">Agenda</span>
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden border-t py-4">
            <nav className="flex flex-col space-y-4">
              <button 
                onClick={handleSobreNosClick}
                className="text-gray-700 hover:text-purple-600 transition-colors text-left font-medium"
              >
                Sobre Nós
              </button>
              <button 
                onClick={handleContatoClick}
                className="text-gray-700 hover:text-purple-600 transition-colors text-left font-medium"
              >
                Contato
              </button>
              <button 
                onClick={handlePlanosClick}
                className="text-purple-600 hover:text-purple-700 transition-colors text-left font-medium flex items-center"
              >
                <Heart className="mr-1 h-4 w-4" />
                Planos
              </button>
              <div className="flex flex-col space-y-2 pt-4 border-t">
                {user ? (
                  <>
                    <div className="text-sm text-gray-600 px-3 py-2">
                      Logado como: {user.full_name}
                    </div>
                    {user.role === 'professional' && (
                      <Button variant="ghost" className="justify-start" onClick={() => navigate('/agenda-profissional')}>
                        <Calendar className="mr-2 h-4 w-4" />
                        Minha Agenda
                      </Button>
                    )}
                    {user.role === 'admin' && (
                      <Button variant="ghost" className="justify-start" onClick={() => navigate('/admin')}>
                        <Settings className="mr-2 h-4 w-4" />
                        Painel Admin
                      </Button>
                    )}
                    <Button variant="ghost" className="justify-start text-red-600 hover:text-red-700" onClick={handleLogout}>
                      <LogOut className="mr-2 h-4 w-4" />
                      Sair
                    </Button>
                  </>
                ) : (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="justify-start text-purple-600 hover:text-purple-700 hover:bg-purple-50">
                        Para você
                        <ChevronDown className="ml-1 h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start">
                      <DropdownMenuItem onClick={() => navigate('/login-paciente')}>
                        <Heart className="mr-2 h-4 w-4" />
                        Paciente
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => navigate('/login-profissional')}>
                        <img src={logo} alt="Logo Clínica" className="mr-2 h-4 w-4" />
                        Profissional
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => navigate('/login-admin')}>
                        <Settings className="mr-2 h-4 w-4" />
                        Administrador
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}

                <Button 
                  className="justify-start bg-purple-600 hover:bg-purple-700 text-white"
                  onClick={handleIniciarConsultaClick}
                >
                  <Video className="mr-1 h-4 w-4" />
                  Iniciar Consulta
                </Button>
                <Button 
                  className="justify-start bg-purple-600 hover:bg-purple-700 text-white"
                  onClick={handleScheduleClick}
                >
                  <Calendar className="mr-1 h-4 w-4" />
                  Agendar
                </Button>
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
