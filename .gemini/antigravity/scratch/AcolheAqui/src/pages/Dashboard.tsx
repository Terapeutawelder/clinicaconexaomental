import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { User, Session } from "@supabase/supabase-js";
import { toast } from "sonner";
import { Clock, CheckCircle2, LogOut } from "lucide-react";
import DashboardSidebar from "@/components/dashboard/DashboardSidebar";
import DashboardOverview from "@/components/dashboard/DashboardOverview";
import AvailableHoursConfig from "@/components/dashboard/AvailableHoursConfig";
import AppointmentsHistory from "@/components/dashboard/AppointmentsHistory";
import ProfilePage from "@/components/dashboard/ProfilePage";
import FinancesPage from "@/components/dashboard/FinancesPage";
import WhatsAppIntegrationPage from "@/components/dashboard/WhatsAppIntegrationPage";
import CheckoutConfigPage from "@/components/dashboard/CheckoutConfigPage";
import NotificationsConfigPage from "@/components/dashboard/NotificationsConfigPage";
import {
  GoogleIntegrationPage,
  AISchedulingPage,
  AIInstagramPage,
  AIFollowupPage,
} from "@/components/dashboard/ComingSoonPages";
import AutomacoesPage from "@/components/dashboard/AutomacoesPage";
import { cn } from "@/lib/utils";

const Dashboard = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [profileId, setProfileId] = useState<string | null>(null);
  const [professionalStatus, setProfessionalStatus] = useState<string | null>(null);
  const [isProfessional, setIsProfessional] = useState<boolean>(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const currentTab = searchParams.get("tab") || "overview";

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setSession(session);
      setUser(session?.user ?? null);

      if (!session?.user) {
        navigate("/auth");
      }
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);

      if (!session?.user) {
        navigate("/auth");
      } else {
        fetchProfile(session.user.id);
      }

      setIsLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const fetchProfile = async (userId: string) => {
    const { data, error } = await supabase
      .from("profiles")
      .select("id, professional_status, is_professional")
      .eq("user_id", userId)
      .maybeSingle();

    if (data) {
      setProfileId(data.id);
      setProfessionalStatus(data.professional_status);
      setIsProfessional(data.is_professional);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast.success("Logout realizado com sucesso");
    navigate("/auth");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen dashboard-theme flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user || !profileId) {
    return null;
  }

  // Show "Pending Approval" screen for professionals not yet approved
  const allowedStatuses = ["approved", "active", "paid"];
  if (isProfessional && !allowedStatuses.includes(professionalStatus || "")) {
    return (
      <div className="min-h-screen dashboard-theme flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-[hsl(215,40%,12%)] border border-primary/20 rounded-2xl p-8 text-center space-y-6 shadow-2xl">
          <div className="flex justify-center">
            <div className="p-4 bg-primary/10 rounded-full">
              <Clock className="w-12 h-12 text-primary animate-pulse" />
            </div>
          </div>
          
          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-white">Cadastro em Análise</h2>
            <p className="text-white/60">
              Seu cadastro foi recebido com sucesso! Nossa equipe está revisando suas informações. 
              Seu acesso será liberado em breve.
            </p>
          </div>

          <div className="bg-white/5 rounded-xl p-6 text-left space-y-4 border border-white/5">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-[hsl(145,70%,45%)]" />
              <span className="text-sm text-white/80 font-medium">Etapa 1: Cadastro realizado</span>
            </div>
            <div className="flex items-center gap-3">
              <Clock className="w-5 h-5 text-primary" />
              <span className="text-sm text-white/80 font-medium">Etapa 2: Aprovação pelo administrador</span>
            </div>
          </div>

          <p className="text-primary text-sm font-medium">
            A Equipe Conexão Mental agradece o seu cadastro! 💜
          </p>

          <button
            onClick={handleLogout}
            className="flex items-center gap-2 mx-auto text-white/50 hover:text-white transition-colors text-sm pt-4"
          >
            <LogOut className="w-4 h-4" />
            Voltar para o login
          </button>
        </div>
      </div>
    );
  }

  const renderContent = () => {
    switch (currentTab) {
      case "hours":
        return <AvailableHoursConfig profileId={profileId} />;
      case "appointments":
        return <AppointmentsHistory profileId={profileId} />;
      case "profile":
        return <ProfilePage profileId={profileId} userId={user.id} />;
      case "finances":
        return <FinancesPage profileId={profileId} />;
      case "checkout":
        return <CheckoutConfigPage profileId={profileId} />;
      case "whatsapp":
        return <WhatsAppIntegrationPage profileId={profileId} />;
      case "google":
        return <GoogleIntegrationPage />;
      case "ai-scheduling":
        return <AISchedulingPage />;
      case "ai-notifications":
        return <NotificationsConfigPage profileId={profileId} />;
      case "ai-instagram":
        return <AIInstagramPage />;
      case "ai-followup":
        return <AIFollowupPage />;
      case "automacoes":
        return <AutomacoesPage profileId={profileId} />;
      default:
        return <DashboardOverview profileId={profileId} />;
    }
  };

  const getPageTitle = () => {
    const titles: Record<string, string> = {
      overview: "Dashboard",
      profile: "Meu Perfil",
      appointments: "Agenda / CRM",
      finances: "Controle Financeiro",
      hours: "Horários Disponíveis",
      checkout: "Checkout Personalizado",
      whatsapp: "Integração WhatsApp",
      google: "Google Agenda & Meet",
      "ai-scheduling": "Agente IA Agendamento",
      "ai-notifications": "Notificações WhatsApp",
      "ai-instagram": "Agente IA Instagram",
      "ai-followup": "Agente IA Follow-up",
      "automacoes": "Automações",
    };
    return titles[currentTab] || "Dashboard";
  };

  return (
    <div className="min-h-screen dashboard-theme">
      <DashboardSidebar
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
        onLogout={handleLogout}
        userEmail={user.email}
      />

      {/* Main Content */}
      <main
        className={cn(
          "min-h-screen transition-all duration-300",
          sidebarCollapsed ? "ml-16" : "ml-64"
        )}
      >
        {/* Top Header */}
        <header className="sticky top-0 z-40 bg-[hsl(215,40%,10%)]/80 backdrop-blur-md border-b border-white/5 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-white">{getPageTitle()}</h1>
              <p className="text-sm text-white/50 mt-1">
                Bem-vindo de volta, {user.email?.split("@")[0]}
              </p>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-xs text-white/40">Última atualização</p>
                <p className="text-sm text-white/70">{new Date().toLocaleDateString("pt-BR")}</p>
              </div>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <div className="p-6">
          {renderContent()}
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
