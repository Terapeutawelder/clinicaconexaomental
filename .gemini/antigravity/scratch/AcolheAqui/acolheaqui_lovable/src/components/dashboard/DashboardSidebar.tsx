import { Link, useLocation } from "react-router-dom";
import { 
  LayoutDashboard, 
  CreditCard, 
  Calendar, 
  LogOut, 
  ChevronLeft, 
  ChevronRight, 
  User,
  MessageCircle,
  DollarSign,
  CalendarCheck,
  Bot,
  Bell,
  Instagram,
  UserCheck,
  ShoppingCart,
  UserCircle,
  Settings,
  Receipt
} from "lucide-react";
import Logo from "@/components/Logo";
import { cn } from "@/lib/utils";
import { getCanonicalUrl } from "@/lib/getCanonicalUrl";

interface DashboardSidebarProps {
  collapsed: boolean;
  onToggle: () => void;
  onLogout: () => void;
  userEmail?: string;
}

const menuItems = [
  { id: "overview", label: "Visão Geral", icon: LayoutDashboard, section: "principal" },
  { id: "profile", label: "Meu Perfil", icon: UserCircle, section: "principal" },
  { id: "appointments", label: "Agenda / CRM", icon: CalendarCheck, section: "principal" },
  { id: "sales", label: "Vendas", icon: Receipt, section: "principal" },
  { id: "finances", label: "Controle Financeiro", icon: DollarSign, section: "principal" },
  { id: "checkout", label: "Checkout Personalizado", icon: ShoppingCart, section: "premium" },
  { id: "settings", label: "Configurações", icon: Settings, section: "premium" },
  { id: "whatsapp", label: "WhatsApp & Notificações", icon: MessageCircle, section: "integrações" },
  { id: "google", label: "Google Agenda / Meet", icon: Calendar, section: "integrações" },
  { id: "ai-scheduling", label: "Agente IA Agendamento", icon: Bot, section: "ia" },
  { id: "ai-instagram", label: "Agente IA Instagram", icon: Instagram, section: "ia" },
  { id: "ai-followup", label: "Agente IA Follow-up", icon: UserCheck, section: "ia" },
];

const DashboardSidebar = ({ collapsed, onToggle, onLogout, userEmail }: DashboardSidebarProps) => {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const currentTab = searchParams.get("tab") || "overview";

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 h-screen bg-[hsl(215,35%,12%)] border-r border-white/10 flex flex-col transition-all duration-300 z-50",
        collapsed ? "w-16" : "w-64"
      )}
    >
      {/* Logo */}
      <div className="p-4 border-b border-white/10 flex items-center justify-between">
        <a href={getCanonicalUrl("/")} className={cn(collapsed && "mx-auto")}>
          <Logo size="sm" variant="light" />
        </a>
        <button
          onClick={onToggle}
          className={cn(
            "p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white/70 hover:text-white transition-colors",
            collapsed && "hidden"
          )}
        >
          <ChevronLeft size={18} />
        </button>
      </div>

      {/* Expand button when collapsed */}
      {collapsed && (
        <button
          onClick={onToggle}
          className="mx-auto mt-4 p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white/70 hover:text-white transition-colors"
        >
          <ChevronRight size={18} />
        </button>
      )}

      {/* Navigation */}
      <nav className="flex-1 py-4 px-3 space-y-6 overflow-y-auto">
        {/* Principal */}
        <div>
          {!collapsed && (
            <p className="text-xs uppercase text-white/40 font-semibold px-3 mb-2">Principal</p>
          )}
          <div className="space-y-1">
            {menuItems.filter(item => item.section === "principal").map((item) => (
              <Link
                key={item.id}
                to={`/dashboard?tab=${item.id}`}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200",
                  currentTab === item.id
                    ? "bg-gradient-to-r from-primary/20 to-primary/5 text-primary border-l-2 border-primary"
                    : "text-white/70 hover:bg-white/5 hover:text-white"
                )}
              >
                <item.icon size={18} className={cn(collapsed && "mx-auto")} />
                {!collapsed && <span className="text-sm font-medium">{item.label}</span>}
              </Link>
            ))}
          </div>
        </div>

        {/* Premium */}
        <div>
          {!collapsed && (
            <p className="text-xs uppercase text-white/40 font-semibold px-3 mb-2">Premium</p>
          )}
          <div className="space-y-1">
            {menuItems.filter(item => item.section === "premium").map((item) => (
              <Link
                key={item.id}
                to={`/dashboard?tab=${item.id}`}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200",
                  currentTab === item.id
                    ? "bg-gradient-to-r from-primary/20 to-primary/5 text-primary border-l-2 border-primary"
                    : "text-white/70 hover:bg-white/5 hover:text-white"
                )}
              >
                <item.icon size={18} className={cn(collapsed && "mx-auto")} />
                {!collapsed && <span className="text-sm font-medium">{item.label}</span>}
              </Link>
            ))}
          </div>
        </div>

        {/* Integrações */}
        <div>
          {!collapsed && (
            <p className="text-xs uppercase text-white/40 font-semibold px-3 mb-2">Integrações</p>
          )}
          <div className="space-y-1">
            {menuItems.filter(item => item.section === "integrações").map((item) => (
              <Link
                key={item.id}
                to={`/dashboard?tab=${item.id}`}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200",
                  currentTab === item.id
                    ? "bg-gradient-to-r from-primary/20 to-primary/5 text-primary border-l-2 border-primary"
                    : "text-white/70 hover:bg-white/5 hover:text-white"
                )}
              >
                <item.icon size={18} className={cn(collapsed && "mx-auto")} />
                {!collapsed && <span className="text-sm font-medium">{item.label}</span>}
              </Link>
            ))}
          </div>
        </div>

        {/* IA */}
        <div>
          {!collapsed && (
            <p className="text-xs uppercase text-white/40 font-semibold px-3 mb-2">Agentes IA</p>
          )}
          <div className="space-y-1">
            {menuItems.filter(item => item.section === "ia").map((item) => (
              <Link
                key={item.id}
                to={`/dashboard?tab=${item.id}`}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200",
                  currentTab === item.id
                    ? "bg-gradient-to-r from-primary/20 to-primary/5 text-primary border-l-2 border-primary"
                    : "text-white/70 hover:bg-white/5 hover:text-white"
                )}
              >
                <item.icon size={18} className={cn(collapsed && "mx-auto")} />
                {!collapsed && <span className="text-sm font-medium">{item.label}</span>}
              </Link>
            ))}
          </div>
        </div>
      </nav>

      {/* User info and logout */}
      <div className="p-4 border-t border-white/10 space-y-3">
        {!collapsed && userEmail && (
          <div className="flex items-center gap-3 px-3 py-2 rounded-lg bg-white/5">
            <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
              <User size={16} className="text-primary" />
            </div>
            <span className="text-sm text-white/70 truncate">{userEmail}</span>
          </div>
        )}
        <button
          onClick={onLogout}
          className={cn(
            "flex items-center gap-3 px-3 py-3 rounded-xl text-white/70 hover:bg-red-500/10 hover:text-red-400 transition-all w-full",
            collapsed && "justify-center"
          )}
        >
          <LogOut size={20} />
          {!collapsed && <span className="font-medium">Sair</span>}
        </button>
      </div>
    </aside>
  );
};

export default DashboardSidebar;
