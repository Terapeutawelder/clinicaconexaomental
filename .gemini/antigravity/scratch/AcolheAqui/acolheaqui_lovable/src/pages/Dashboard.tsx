import { useState, useEffect, lazy, Suspense, memo } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { User, Session } from "@supabase/supabase-js";
import { toast } from "sonner";
import DashboardSidebar from "@/components/dashboard/DashboardSidebarNew";
import DashboardOverview from "@/components/dashboard/DashboardOverviewNew";
import { cn } from "@/lib/utils";
import { Bell, Search, Settings, Sun, Moon } from "lucide-react";
import { useTheme } from "@/hooks/useTheme";
import { useAppointmentNotifications } from "@/hooks/useAppointmentNotifications";

// Lazy load dashboard pages for better performance
const AvailableHoursConfig = lazy(() => import("@/components/dashboard/AvailableHoursConfig"));
const AppointmentsPage = lazy(() => import("@/components/dashboard/AppointmentsPage"));
const ProfilePage = lazy(() => import("@/components/dashboard/ProfilePage"));
const FinancesPage = lazy(() => import("@/components/dashboard/FinancesPage"));
const WhatsAppDashboard = lazy(() => import("@/components/dashboard/whatsapp/WhatsAppDashboard").then(m => ({ default: m.WhatsAppDashboard })));
const WhatsAppConversations = lazy(() => import("@/components/dashboard/whatsapp/WhatsAppConversations").then(m => ({ default: m.WhatsAppConversations })));
const WhatsAppAgents = lazy(() => import("@/components/dashboard/whatsapp/WhatsAppAgents").then(m => ({ default: m.WhatsAppAgents })));
const WhatsAppCRM = lazy(() => import("@/components/dashboard/whatsapp/WhatsAppCRM").then(m => ({ default: m.WhatsAppCRM })));
const WhatsAppConnections = lazy(() => import("@/components/dashboard/whatsapp/WhatsAppConnections").then(m => ({ default: m.WhatsAppConnections })));
const WhatsAppDispatches = lazy(() => import("@/components/dashboard/whatsapp/WhatsAppDispatches").then(m => ({ default: m.WhatsAppDispatches })));
const WhatsAppLists = lazy(() => import("@/components/dashboard/whatsapp/WhatsAppLists").then(m => ({ default: m.WhatsAppLists })));
const WhatsAppSettings = lazy(() => import("@/components/dashboard/whatsapp/WhatsAppSettings").then(m => ({ default: m.WhatsAppSettings })));
const CheckoutConfigPage = lazy(() => import("@/components/dashboard/CheckoutConfigPage"));
const SettingsPage = lazy(() => import("@/components/dashboard/SettingsPage"));
const SalesHistoryPage = lazy(() => import("@/components/dashboard/SalesHistoryPage"));
const SalesReportsPage = lazy(() => import("@/components/dashboard/SalesReportsPage"));
const VirtualRoomPage = lazy(() => import("@/components/dashboard/VirtualRoomPage"));
const AIChatWidget = lazy(() => import("@/components/dashboard/AIChatWidget"));
const GoogleCalendarPage = lazy(() => import("@/components/dashboard/GoogleCalendarPage"));
const WebhooksPage = lazy(() => import("@/components/dashboard/WebhooksPage"));
const AIConfigPage = lazy(() => import("@/components/dashboard/AIConfigPage"));
const LandingPageEditorPage = lazy(() => import("@/components/dashboard/landing-page"));
const AISchedulingPage = lazy(() => import("@/components/dashboard/AISchedulingPage"));
const TutorialsPage = lazy(() => import("@/components/dashboard/TutorialsPage"));
const MembersAreaPage = lazy(() => import("@/components/dashboard/MembersAreaPage"));
const AIInstagramPage = lazy(() => import("@/components/dashboard/ComingSoonPages").then(m => ({ default: m.AIInstagramPage })));
const AIFollowupPage = lazy(() => import("@/components/dashboard/ComingSoonPages").then(m => ({ default: m.AIFollowupPage })));

// Loading component for lazy loaded pages
const PageLoader = memo(() => (
  <div className="flex items-center justify-center min-h-[400px]">
    <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
  </div>
));

PageLoader.displayName = "PageLoader";

const Dashboard = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [profileId, setProfileId] = useState<string | null>(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const { theme, toggleTheme } = useTheme();
  
  // Enable realtime notifications for new appointments
  useAppointmentNotifications({ profileId, enabled: !!profileId });

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
    const content = (() => {
      switch (currentTab) {
        case "hours":
          return <AvailableHoursConfig profileId={profileId} />;
        case "appointments":
          return <AppointmentsPage profileId={profileId} />;
        case "profile":
          return <ProfilePage profileId={profileId} userId={user.id} />;
        case "landing-page":
          return <LandingPageEditorPage profileId={profileId} />;
        case "sales":
          return <SalesHistoryPage profileId={profileId} />;
        case "reports":
          return <SalesReportsPage profileId={profileId} />;
        case "finances":
          return <FinancesPage profileId={profileId} />;
        case "checkout":
          return <CheckoutConfigPage profileId={profileId} />;
        case "settings":
          return <SettingsPage profileId={profileId} />;
        case "whatsapp-dashboard":
          return <WhatsAppDashboard profileId={profileId} connections={[]} />;
        case "whatsapp-conversations":
          return <WhatsAppConversations profileId={profileId} connections={[]} />;
        case "whatsapp-agents":
          return <WhatsAppAgents profileId={profileId} connections={[]} />;
        case "whatsapp-crm":
          return <WhatsAppCRM profileId={profileId} connections={[]} />;
        case "whatsapp-connections":
          return <WhatsAppConnections profileId={profileId} connections={[]} onConnectionsChange={() => {}} />;
        case "whatsapp-dispatches":
          return <WhatsAppDispatches profileId={profileId} connections={[]} />;
        case "whatsapp-lists":
          return <WhatsAppLists profileId={profileId} />;
        case "whatsapp-settings":
          return <WhatsAppSettings profileId={profileId} />;
        case "google":
          return <GoogleCalendarPage profileId={profileId} />;
        case "webhooks":
          return <WebhooksPage profileId={profileId} />;
        case "ai-config":
          return <AIConfigPage profileId={profileId} />;
        case "virtual-room":
          return <VirtualRoomPage profileId={profileId} />;
        case "ai-scheduling":
          return <AISchedulingPage profileId={profileId} />;
        case "ai-instagram":
          return <AIInstagramPage />;
        case "ai-followup":
          return <AIFollowupPage />;
        case "tutorials":
          return <TutorialsPage />;
        case "members-area":
          return <MembersAreaPage />;
        default:
          return <DashboardOverview profileId={profileId} />;
      }
    })();

    // Wrap lazy-loaded components with Suspense
    if (currentTab !== "overview") {
      return <Suspense fallback={<PageLoader />}>{content}</Suspense>;
    }
    return content;
  };

  const getPageTitle = () => {
    const titles: Record<string, string> = {
      overview: "Dashboard",
      profile: "Dados do Perfil",
      "landing-page": "Landing Page",
      appointments: "Agenda / CRM",
      sales: "Histórico de Vendas",
      reports: "Relatórios Financeiros",
      finances: "Visão Geral Financeira",
      hours: "Horários Disponíveis",
      checkout: "Checkout Personalizado",
      settings: "Configurações",
      "whatsapp-dashboard": "WhatsApp - Dashboard",
      "whatsapp-conversations": "WhatsApp - Conversas",
      "whatsapp-agents": "WhatsApp - Agentes IA",
      "whatsapp-crm": "WhatsApp - CRM",
      "whatsapp-connections": "WhatsApp - Conexões",
      "whatsapp-dispatches": "WhatsApp - Disparos",
      "whatsapp-lists": "WhatsApp - Listas / Histórico",
      "whatsapp-settings": "WhatsApp - Configurações",
      google: "Google Agenda & Meet",
      webhooks: "Webhooks",
      "ai-config": "Configuração IA",
      "virtual-room": "Sala Virtual",
      "ai-scheduling": "Agente IA Agendamento",
      "ai-instagram": "Agente IA Instagram",
      "ai-followup": "Agente IA Follow-up",
      "tutorials": "Central de Tutoriais",
      "members-area": "Área de Membros",
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
          sidebarCollapsed ? "md:ml-16" : "md:ml-16 lg:ml-64"
        )}
      >
        {/* Top Header */}
        <header className="sticky top-0 z-40 bg-card/80 backdrop-blur-xl border-b border-border/50 px-4 md:px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="ml-10 md:ml-0">
              <h1 className="text-lg md:text-2xl font-bold text-foreground">{getPageTitle()}</h1>
              <p className="text-xs md:text-sm text-muted-foreground mt-0.5 hidden sm:block">
                Bem-vindo de volta, <span className="text-primary font-medium">{user.email?.split("@")[0]}</span>
              </p>
            </div>
            <div className="flex items-center gap-2 md:gap-3">
              {/* Search - hidden on mobile */}
              <div className="hidden lg:flex items-center gap-2 px-4 py-2 rounded-xl bg-muted/50 border border-border/50">
                <Search className="h-4 w-4 text-muted-foreground" />
                <input 
                  type="text" 
                  placeholder="Buscar..." 
                  className="bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none w-40"
                />
              </div>
              {/* Theme Toggle */}
              <button 
                onClick={toggleTheme}
                className="p-2 md:p-2.5 rounded-xl bg-muted/50 border border-border/50 hover:bg-muted transition-colors group"
                title={theme === "dark" ? "Modo claro" : "Modo escuro"}
              >
                {theme === "dark" ? (
                  <Sun className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors" />
                ) : (
                  <Moon className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors" />
                )}
              </button>
              {/* Notifications */}
              <button className="relative p-2 md:p-2.5 rounded-xl bg-muted/50 border border-border/50 hover:bg-muted transition-colors group">
                <Bell className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-primary rounded-full animate-pulse" />
              </button>
              {/* Settings */}
              <button className="p-2 md:p-2.5 rounded-xl bg-muted/50 border border-border/50 hover:bg-muted transition-colors group">
                <Settings className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors" />
              </button>
              {/* Date - hidden on mobile */}
              <div className="hidden xl:block text-right px-4 py-2 rounded-xl bg-primary/10 border border-primary/20">
                <p className="text-xs text-muted-foreground">Hoje</p>
                <p className="text-sm font-medium text-primary">{new Date().toLocaleDateString("pt-BR")}</p>
              </div>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <div className={cn(currentTab === "landing-page" ? "p-0" : "p-4 md:p-6")}>
          {renderContent()}
        </div>
      </main>

      {/* AI Chat Widget */}
      <Suspense fallback={null}>
        <AIChatWidget />
      </Suspense>
    </div>
  );
};

export default Dashboard;
