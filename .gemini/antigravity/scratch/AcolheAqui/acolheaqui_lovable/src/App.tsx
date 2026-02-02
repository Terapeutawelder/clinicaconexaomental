import { useState, lazy, Suspense } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, useParams } from "react-router-dom";
import CookieConsent from "./components/CookieConsent";

// Critical pages - loaded immediately
import Index from "./pages/Index";

// Lazy loaded pages - loaded on demand
const Profissionais = lazy(() => import("./pages/Profissionais"));
const Psicoterapeutas = lazy(() => import("./pages/Psicoterapeutas"));
const CadastroPro = lazy(() => import("./pages/CadastroPro"));
const CadastroPremium = lazy(() => import("./pages/ProfissionalPremium"));
const PoliticaPrivacidade = lazy(() => import("./pages/PoliticaPrivacidade"));
const TermosUso = lazy(() => import("./pages/TermosUso"));
const Auth = lazy(() => import("./pages/Auth"));
const ResetPassword = lazy(() => import("./pages/ResetPassword"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const ProfessionalProfile = lazy(() => import("./pages/ProfessionalProfile"));
const Checkout = lazy(() => import("./pages/Checkout"));
const SalaVirtual = lazy(() => import("./pages/SalaVirtual"));
const NotFound = lazy(() => import("./pages/NotFound"));
const MeusAgendamentos = lazy(() => import("./pages/MeusAgendamentos"));
const Reagendar = lazy(() => import("./pages/Reagendar"));
const StudentArea = lazy(() => import("./pages/StudentArea"));
const CursoVenda = lazy(() => import("./pages/CursoVenda"));
const AdminLogin = lazy(() => import("./pages/AdminLogin"));
const Admin = lazy(() => import("./pages/Admin"));
const Assinar = lazy(() => import("./pages/Assinar"));
const AssinarPix = lazy(() => import("./pages/AssinarPix"));

// Loading fallback component
const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-background">
    <div className="flex flex-col items-center gap-4">
      <div className="w-10 h-10 border-3 border-primary border-t-transparent rounded-full animate-spin" />
      <p className="text-sm text-muted-foreground">Carregando...</p>
    </div>
  </div>
);

const LegacyCheckoutRedirect = () => {
  const { slug, serviceId } = useParams();
  if (!slug || !serviceId) return <Navigate to="/" replace />;
  return <Navigate to={`/${slug}/checkout/${serviceId}`} replace />;
};

const App = () => {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 1000 * 60 * 5, // 5 minutes
        gcTime: 1000 * 60 * 30, // 30 minutes (previously cacheTime)
        refetchOnWindowFocus: false,
        retry: 1,
      },
    },
  }));

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Suspense fallback={<PageLoader />}>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/profissionais" element={<Profissionais />} />
              <Route path="/profissional-premium" element={<Navigate to="/cadastro/premium" replace />} />
              <Route path="/psicoterapeutas" element={<Psicoterapeutas />} />
              <Route path="/profissional/:id" element={<ProfessionalProfile />} />
              <Route path="/site/:slug" element={<ProfessionalProfile />} />
              <Route path="/p/:slug" element={<ProfessionalProfile />} />
              <Route path="/cadastro/pro" element={<CadastroPro />} />
              <Route path="/cadastro/premium" element={<CadastroPremium />} />
              <Route path="/politica-de-privacidade" element={<PoliticaPrivacidade />} />
              <Route path="/termos-de-uso" element={<TermosUso />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/checkout/:serviceId" element={<Checkout />} />
              <Route path="/:slug/checkout/:serviceId" element={<Checkout />} />
              <Route path="/u/:slug/checkout/:serviceId" element={<LegacyCheckoutRedirect />} />
              <Route path="/sala/:roomCode" element={<SalaVirtual />} />
              <Route path="/sala" element={<SalaVirtual />} />
              <Route path="/meus-agendamentos" element={<MeusAgendamentos />} />
              <Route path="/reagendar" element={<Reagendar />} />
              <Route path="/area-membros/:slug" element={<StudentArea />} />
              <Route path="/curso/:serviceId" element={<CursoVenda />} />
              <Route path="/admin/login" element={<AdminLogin />} />
              <Route path="/admin" element={<Admin />} />
              <Route path="/assinar" element={<Assinar />} />
              <Route path="/assinar/pix" element={<AssinarPix />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
          <CookieConsent />
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
