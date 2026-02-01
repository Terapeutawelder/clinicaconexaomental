import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { User, Session } from "@supabase/supabase-js";
import { toast } from "sonner";
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
      .select("id")
      .eq("user_id", userId)
      .maybeSingle();

    if (data) {
      setProfileId(data.id);
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
