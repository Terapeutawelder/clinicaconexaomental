
import { useState, lazy, Suspense, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import HeroSection from "@/components/sections/HeroSection";
import SectionSkeleton from "@/components/ui/section-skeleton";

// Import components directly to avoid lazy loading issues
import BookingFlow from "@/components/BookingFlow";
import OnlineTherapySection from "@/components/sections/OnlineTherapySection";
import SearchSection from "@/components/sections/SearchSection";
import ProfessionalsSection from "@/components/sections/ProfessionalsSection";
import PricingSection from "@/components/sections/PricingSection";
import TreatmentTypesSection from "@/components/sections/TreatmentTypesSection";
import CTASection from "@/components/sections/CTASection";
import FAQSection from "@/components/sections/FAQSection";

interface Professional {
  id: string;
  name: string;
  specialty: string;
  experience: string;
  rating?: number;
  image?: string;
  available?: boolean;
  description?: string;
  email: string;
  phone?: string;
  approach?: string;
  approved: boolean;
}

const Index = () => {
  const navigate = useNavigate();
  const [showBookingFlow, setShowBookingFlow] = useState(false);
  const [selectedProfessional, setSelectedProfessional] = useState<Professional | null>(null);
  
  // Preload components after initial render for better UX
  useEffect(() => {
    const timer = setTimeout(() => {
      import("@/components/sections/OnlineTherapySection");
      import("@/components/sections/SearchSection");
      import("@/components/sections/ProfessionalsSection");
    }, 100);
    
    return () => clearTimeout(timer);
  }, []);
  
  // Buscar profissionais aprovados da API
  const { data: professionals = [], isLoading: loadingProfessionals } = useQuery({
    queryKey: ['/api/professionals'],
    queryFn: async () => {
      const response = await fetch('/api/professionals');
      if (!response.ok) {
        throw new Error('Falha ao carregar profissionais');
      }
      return response.json();
    }
  });

  const handleBookProfessional = (professional: Professional) => {
    // Redirecionar para a página de agendamento
    navigate(`/agendar-consulta?professional=${professional.id}`);
  };

  const handleBackFromBooking = () => {
    setShowBookingFlow(false);
    setSelectedProfessional(null);
  };

  const handleComoFuncionaClick = () => {
    navigate('/como-funciona');
  };

  const handleScrollToProfessionals = () => {
    document.getElementById('professionals-section')?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleCadastroClick = () => {
    navigate('/login');
  };

  const handleIniciarTeleconsulta = () => {
    navigate('/login-paciente');
  };

  if (showBookingFlow && selectedProfessional) {
    return (
      <Suspense fallback={
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 flex items-center justify-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
        </div>
      }>
        <BookingFlow professional={selectedProfessional} onBack={handleBackFromBooking} />
      </Suspense>
    );
  }

  return (
    <div className="min-h-screen">
      <Header />
      
      <HeroSection 
        onFindProfessionalClick={handleScrollToProfessionals}
        onComoFuncionaClick={handleComoFuncionaClick}
        onIniciarTeleconsultaClick={handleIniciarTeleconsulta}
      />

      <OnlineTherapySection onAgendarConsultaClick={handleScrollToProfessionals} />
      
      <PricingSection onAgendarConsultaClick={handleScrollToProfessionals} />

      <div className="bg-gradient-to-br from-purple-50 to-white">
        <SearchSection />
        
        {loadingProfessionals ? (
          <SectionSkeleton height="h-96" />
        ) : (
          <ProfessionalsSection 
            professionals={professionals}
            onBookProfessional={handleBookProfessional}
            onCadastroClick={handleCadastroClick}
          />
        )}
      </div>

      <TreatmentTypesSection />

      <div className="bg-gradient-to-br from-purple-50 to-white">
        <CTASection onAgendarConsultaClick={handleScrollToProfessionals} />
      </div>

      <FAQSection />

      <Footer />
    </div>
  );
};

export default Index;
