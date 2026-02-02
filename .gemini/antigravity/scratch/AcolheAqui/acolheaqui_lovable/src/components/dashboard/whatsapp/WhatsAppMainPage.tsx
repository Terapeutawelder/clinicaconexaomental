import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";
import { 
  LayoutDashboard, 
  Bot, 
  Filter, 
  Link2, 
  Send, 
  List, 
  MessageCircle,
  MessageSquare,
  Settings,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import { WhatsAppDashboard } from "./WhatsAppDashboard";
import { WhatsAppAgents } from "./WhatsAppAgents";
import { WhatsAppCRM } from "./WhatsAppCRM";
import { WhatsAppConnections } from "./WhatsAppConnections";
import { WhatsAppDispatches } from "./WhatsAppDispatches";
import { WhatsAppLists } from "./WhatsAppLists";
import { WhatsAppSettings } from "./WhatsAppSettings";
import { WhatsAppConversations } from "./WhatsAppConversations";

interface WhatsAppMainPageProps {
  profileId: string;
}

type WhatsAppTab = 
  | "dashboard" 
  | "conversations"
  | "agents" 
  | "crm" 
  | "connections" 
  | "dispatches" 
  | "lists" 
  | "settings";

const menuItems: { id: WhatsAppTab; label: string; icon: React.ComponentType<any> }[] = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "conversations", label: "Conversas", icon: MessageSquare },
  { id: "agents", label: "Agentes IA", icon: Bot },
  { id: "crm", label: "CRM", icon: Filter },
  { id: "connections", label: "Conexões", icon: Link2 },
  { id: "dispatches", label: "Disparos", icon: Send },
  { id: "lists", label: "Listas / Histórico", icon: List },
  { id: "settings", label: "Configurações", icon: Settings },
];

export const WhatsAppMainPage = ({ profileId }: WhatsAppMainPageProps) => {
  const [activeTab, setActiveTab] = useState<WhatsAppTab>("dashboard");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [connections, setConnections] = useState<any[]>([]);
  const [isLoadingConnections, setIsLoadingConnections] = useState(true);

  useEffect(() => {
    fetchConnections();
  }, [profileId]);

  const fetchConnections = async () => {
    try {
      const { data, error } = await supabase
        .from("whatsapp_connections")
        .select("*")
        .eq("professional_id", profileId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setConnections(data || []);
    } catch (error) {
      console.error("Error fetching connections:", error);
    } finally {
      setIsLoadingConnections(false);
    }
  };

  const renderContent = () => {
    switch (activeTab) {
      case "dashboard":
        return <WhatsAppDashboard profileId={profileId} connections={connections} />;
      case "conversations":
        return <WhatsAppConversations profileId={profileId} connections={connections} />;
      case "agents":
        return <WhatsAppAgents profileId={profileId} connections={connections} />;
      case "crm":
        return <WhatsAppCRM profileId={profileId} connections={connections} />;
      case "connections":
        return (
          <WhatsAppConnections 
            profileId={profileId} 
            connections={connections} 
            onConnectionsChange={fetchConnections} 
          />
        );
      case "dispatches":
        return <WhatsAppDispatches profileId={profileId} connections={connections} />;
      case "lists":
        return <WhatsAppLists profileId={profileId} />;
      case "settings":
        return <WhatsAppSettings profileId={profileId} />;
      default:
        return <WhatsAppDashboard profileId={profileId} connections={connections} />;
    }
  };

  return (
    <div className="flex h-full min-h-[calc(100vh-120px)]">
      {/* Sidebar */}
      <aside
        className={cn(
          "bg-card border-r border-border transition-all duration-300 flex flex-col",
          sidebarCollapsed ? "w-16" : "w-56"
        )}
      >
        {/* Logo / Header */}
        <div className="p-4 border-b border-border flex items-center justify-between">
          {!sidebarCollapsed && (
            <div className="flex items-center gap-2">
              <MessageCircle className="h-6 w-6 text-green-500" />
              <span className="font-semibold text-sm">WhatsApp</span>
            </div>
          )}
          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="p-1.5 hover:bg-muted rounded-lg transition-colors"
          >
            {sidebarCollapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <ChevronLeft className="h-4 w-4" />
            )}
          </button>
        </div>

        {/* Menu */}
        <nav className="flex-1 p-2 space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={cn(
                  "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200",
                  isActive
                    ? "bg-green-500/10 text-green-600 border-l-4 border-green-500"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                <Icon className={cn("h-5 w-5 flex-shrink-0", sidebarCollapsed && "mx-auto")} />
                {!sidebarCollapsed && (
                  <span className="text-sm font-medium truncate">{item.label}</span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="p-3 border-t border-border">
          {!sidebarCollapsed && (
            <div className="text-xs text-muted-foreground text-center">
              Versão 1.0
            </div>
          )}
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        {renderContent()}
      </main>
    </div>
  );
};
