
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import ErrorBoundary from "@/components/ErrorBoundary";
import { queryClient } from "@/lib/queryClient";
import Index from "./pages/Index";
import ProfessionalRegistration from "./pages/ProfessionalRegistration";
import CadastroPaciente from "./pages/CadastroPaciente";
import Auth from "./pages/Auth";
import LoginPaciente from "./pages/LoginPaciente";
import LoginProfissional from "./pages/LoginProfissional";
import LoginAdmin from "./pages/LoginAdmin";
import ProfessionalDashboard from "./pages/ProfessionalDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import AdminProfessionals from "./pages/AdminProfessionals";
import ComoFunciona from "./pages/ComoFunciona";
import SobreNos from "./pages/SobreNos";
import Contrato from "./pages/Contrato";
import TermosDeUso from "./pages/TermosDeUso";
import PoliticaDePrivacidade from "./pages/PoliticaDePrivacidade";
import TermsAndConditions from "./pages/TermsAndConditions";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import Contato from "./pages/Contato";
import Afiliados from "./pages/Afiliados";
import VideoConsultation from "./pages/VideoConsultation";
import AgendarConsulta from "./pages/AgendarConsulta";
import FinalizarAgendamento from "./pages/FinalizarAgendamento";
import ConfirmacaoAgendamento from "./pages/ConfirmacaoAgendamento";
import PagamentoSucesso from "./pages/PagamentoSucesso";
import PagamentoErro from "./pages/PagamentoErro";
import PagamentoPendente from "./pages/PagamentoPendente";

const App = () => (
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/cadastro-profissional" element={<ProfessionalRegistration />} />
          <Route path="/cadastro-paciente" element={<CadastroPaciente />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/login-paciente" element={<LoginPaciente />} />
          <Route path="/login-profissional" element={<LoginProfissional />} />
          <Route path="/login-admin" element={<LoginAdmin />} />
          <Route path="/agenda-profissional" element={
            <ProtectedRoute requiredRole="professional">
              <ProfessionalDashboard />
            </ProtectedRoute>
          } />
          <Route path="/admin" element={
            <ProtectedRoute requiredRole="admin">
              <AdminDashboard />
            </ProtectedRoute>
          } />
          <Route path="/admin/professionals" element={
            <ProtectedRoute requiredRole="admin">
              <AdminProfessionals />
            </ProtectedRoute>
          } />
          <Route path="/como-funciona" element={<ComoFunciona />} />
          <Route path="/sobre-nos" element={<SobreNos />} />
          <Route path="/contrato" element={<Contrato />} />
          <Route path="/termos-de-uso" element={<TermosDeUso />} />
          <Route path="/politica-de-privacidade" element={<PoliticaDePrivacidade />} />
          <Route path="/terms" element={<TermsAndConditions />} />
          <Route path="/privacy" element={<PrivacyPolicy />} />
          <Route path="/contato" element={<Contato />} />
          <Route path="/afiliados" element={<Afiliados />} />
          <Route path="/agendar-consulta" element={<AgendarConsulta />} />
          <Route path="/finalizar-agendamento" element={<FinalizarAgendamento />} />
          <Route path="/confirmacao-agendamento" element={<ConfirmacaoAgendamento />} />
          <Route path="/pagamento/sucesso" element={<PagamentoSucesso />} />
          <Route path="/pagamento/erro" element={<PagamentoErro />} />
          <Route path="/pagamento/pendente" element={<PagamentoPendente />} />
          <Route path="/video-consulta" element={<VideoConsultation />} />
        </Routes>
      </BrowserRouter>
      </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  </ErrorBoundary>
);

export default App;
