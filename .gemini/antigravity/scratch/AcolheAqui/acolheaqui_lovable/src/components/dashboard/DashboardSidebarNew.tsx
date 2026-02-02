import { Link, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import { 
  LayoutDashboard, 
  CreditCard, 
  Calendar, 
  LogOut, 
  ChevronLeft, 
  ChevronRight, 
  ChevronDown,
  User,
  MessageCircle,
  MessageSquare,
  DollarSign,
  CalendarCheck,
  Bot,
  Bell,
  Instagram,
  UserCheck,
  ShoppingCart,
  UserCircle,
  Settings,
  Menu,
  X,
  Video,
  Webhook,
  Plug,
  Brain,
  BarChart3,
  FileText,
  GraduationCap,
  Crown,
  Link2,
  Send,
  List,
  Filter
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import Logo from "@/components/Logo";

interface DashboardSidebarProps {
  collapsed: boolean;
  onToggle: () => void;
  onLogout: () => void;
  userEmail?: string;
}

// Menu items without submenu items
// Premium order: Área de Membros, Sala Virtual, Checkout, Tutoriais, Configurações
const menuItems = [
  { id: "members-area", label: "Área de Membros", icon: Crown, section: "premium" },
  { id: "virtual-room", label: "Sala Virtual", icon: Video, section: "premium" },
  { id: "checkout", label: "Checkout", icon: ShoppingCart, section: "premium" },
  { id: "tutorials", label: "Tutoriais", icon: GraduationCap, section: "premium" },
  { id: "settings", label: "Configurações", icon: Settings, section: "premium" },
  { id: "ai-scheduling", label: "Agente IA Agendamento", icon: Bot, section: "ia" },
  { id: "ai-instagram", label: "IA Instagram", icon: Instagram, section: "ia" },
  { id: "ai-followup", label: "IA Follow-up", icon: UserCheck, section: "ia" },
];

// Meu Perfil submenu items
const profileSubItems = [
  { id: "profile", label: "Dados do Perfil", icon: UserCircle },
  { id: "landing-page", label: "Landing Page", icon: LayoutDashboard },
];

// Financeiro submenu items
const financeSubItems = [
  { id: "finances", label: "Visão Geral", icon: BarChart3 },
  { id: "sales", label: "Histórico de Vendas", icon: ShoppingCart },
  { id: "reports", label: "Relatórios", icon: FileText },
];

// Agenda/CRM submenu items
const agendaSubItems = [
  { id: "appointments", label: "Agenda / CRM", icon: CalendarCheck },
  { id: "whatsapp-crm", label: "CRM WhatsApp (Kanban)", icon: Filter },
];

// Integrations submenu items
const integrationSubItems = [
  { id: "webhooks", label: "Webhooks", icon: Webhook },
  { id: "ai-config", label: "Configuração IA", icon: Brain },
];

// WhatsApp submenu items
const whatsappSubItems = [
  { id: "whatsapp-dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "whatsapp-conversations", label: "Conversas", icon: MessageSquare },
  { id: "whatsapp-agents", label: "Agentes IA", icon: Bot },
  { id: "whatsapp-connections", label: "Conexões", icon: Link2 },
  { id: "whatsapp-dispatches", label: "Disparos", icon: Send },
  { id: "whatsapp-lists", label: "Listas / Histórico", icon: List },
  { id: "whatsapp-settings", label: "Configurações", icon: Settings },
];

const DashboardSidebar = ({ collapsed, onToggle, onLogout, userEmail }: DashboardSidebarProps) => {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const currentTab = searchParams.get("tab") || "overview";
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  
  // Keep profile submenu open if any of its items is active
  const isProfileActive = profileSubItems.some(item => item.id === currentTab);
  const [profileOpen, setProfileOpen] = useState(isProfileActive);

  // Keep finance submenu open if any of its items is active
  const isFinanceActive = financeSubItems.some(item => item.id === currentTab);
  const [financeOpen, setFinanceOpen] = useState(isFinanceActive);

  // Keep agenda submenu open if any of its items is active
  const isAgendaActive = agendaSubItems.some(item => item.id === currentTab);
  const [agendaOpen, setAgendaOpen] = useState(isAgendaActive);

  // Keep integrations submenu open if any of its items is active
  const isIntegrationsActive = integrationSubItems.some(item => item.id === currentTab);
  const [integrationsOpen, setIntegrationsOpen] = useState(isIntegrationsActive);

  // Keep whatsapp submenu open if any of its items is active
  const isWhatsappActive = whatsappSubItems.some(item => item.id === currentTab);
  const [whatsappOpen, setWhatsappOpen] = useState(isWhatsappActive);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Keep submenu open when navigating to its items
  useEffect(() => {
    if (isProfileActive) {
      setProfileOpen(true);
    }
    if (isFinanceActive) {
      setFinanceOpen(true);
    }
    if (isAgendaActive) {
      setAgendaOpen(true);
    }
    if (isIntegrationsActive) {
      setIntegrationsOpen(true);
    }
    if (isWhatsappActive) {
      setWhatsappOpen(true);
    }
  }, [isProfileActive, isFinanceActive, isAgendaActive, isIntegrationsActive, isWhatsappActive]);

  const SidebarContent = ({ onItemClick }: { onItemClick?: () => void }) => (
    <>
      {/* Logo */}
      <div className="p-4 border-b border-border/50">
        <Link to="/" className={cn("flex items-center gap-3", collapsed && !isMobile && "justify-center")} onClick={onItemClick}>
          {collapsed && !isMobile ? (
            <Brain className="h-8 w-8 text-primary animate-pulse" />
          ) : (
            <div className="flex flex-col">
              <Logo size="sm" variant="light" />
              <span className="text-xs text-muted-foreground ml-10 -mt-1">Dashboard</span>
            </div>
          )}
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 px-2 space-y-6 overflow-y-auto">
        {/* Principal */}
        <div>
          {(!collapsed || isMobile) && (
            <p className="text-xs uppercase text-muted-foreground font-semibold px-3 mb-2 tracking-wider">
              Principal
            </p>
          )}
          <div className="space-y-1">
            {/* Dashboard link */}
            <Link
              to={`/dashboard?tab=overview`}
              onClick={onItemClick}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group",
                currentTab === "overview"
                  ? "bg-primary/10 text-primary neon-border"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <LayoutDashboard 
                size={18} 
                className={cn(
                  "transition-transform group-hover:scale-110",
                  collapsed && !isMobile && "mx-auto",
                  currentTab === "overview" && "drop-shadow-[0_0_8px_hsl(262,83%,58%)]"
                )} 
              />
              {(!collapsed || isMobile) && (
                <span className="text-sm font-medium">Dashboard</span>
              )}
              {currentTab === "overview" && (!collapsed || isMobile) && (
                <div className="ml-auto w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
              )}
            </Link>


            {/* Meu Perfil with submenu */}
            <Collapsible open={profileOpen} onOpenChange={setProfileOpen}>
              <CollapsibleTrigger asChild>
                <button
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group w-full",
                    isProfileActive
                      ? "bg-primary/10 text-primary neon-border"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  )}
                >
                  <UserCircle 
                    size={18} 
                    className={cn(
                      "transition-transform group-hover:scale-110",
                      collapsed && !isMobile && "mx-auto",
                      isProfileActive && "drop-shadow-[0_0_8px_hsl(262,83%,58%)]"
                    )} 
                  />
                  {(!collapsed || isMobile) && (
                    <>
                      <span className="text-sm font-medium">Meu Perfil</span>
                      <ChevronDown 
                        size={16} 
                        className={cn(
                          "ml-auto transition-transform duration-200",
                          profileOpen && "rotate-180"
                        )}
                      />
                    </>
                  )}
                </button>
              </CollapsibleTrigger>
              <CollapsibleContent className="space-y-1 mt-1">
                {profileSubItems.map((subItem) => (
                  <Link
                    key={subItem.id}
                    to={`/dashboard?tab=${subItem.id}`}
                    onClick={onItemClick}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2 rounded-xl transition-all duration-200 group",
                      (!collapsed || isMobile) && "ml-4",
                      currentTab === subItem.id
                        ? "bg-primary/10 text-primary"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    )}
                  >
                    <subItem.icon 
                      size={16} 
                      className={cn(
                        "transition-transform group-hover:scale-110",
                        collapsed && !isMobile && "mx-auto"
                      )} 
                    />
                    {(!collapsed || isMobile) && (
                      <span className="text-sm">{subItem.label}</span>
                    )}
                    {currentTab === subItem.id && (!collapsed || isMobile) && (
                      <div className="ml-auto w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                    )}
                  </Link>
                ))}
              </CollapsibleContent>
            </Collapsible>

            {/* Agenda/CRM with submenu - MOVED RIGHT AFTER PERFIL */}
            <Collapsible open={agendaOpen} onOpenChange={setAgendaOpen}>
              <CollapsibleTrigger asChild>
                <button
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group w-full",
                    isAgendaActive
                      ? "bg-primary/10 text-primary neon-border"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  )}
                >
                  <CalendarCheck 
                    size={18} 
                    className={cn(
                      "transition-transform group-hover:scale-110",
                      collapsed && !isMobile && "mx-auto",
                      isAgendaActive && "drop-shadow-[0_0_8px_hsl(262,83%,58%)]"
                    )} 
                  />
                  {(!collapsed || isMobile) && (
                    <>
                      <span className="text-sm font-medium">Agenda / CRM</span>
                      <ChevronDown 
                        size={16} 
                        className={cn(
                          "ml-auto transition-transform duration-200",
                          agendaOpen && "rotate-180"
                        )}
                      />
                    </>
                  )}
                </button>
              </CollapsibleTrigger>
              <CollapsibleContent className="space-y-1 mt-1">
                {agendaSubItems.map((subItem) => (
                  <Link
                    key={subItem.id}
                    to={`/dashboard?tab=${subItem.id}`}
                    onClick={onItemClick}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2 rounded-xl transition-all duration-200 group",
                      (!collapsed || isMobile) && "ml-4",
                      currentTab === subItem.id
                        ? "bg-primary/10 text-primary"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    )}
                  >
                    <subItem.icon 
                      size={16} 
                      className={cn(
                        "transition-transform group-hover:scale-110",
                        collapsed && !isMobile && "mx-auto"
                      )} 
                    />
                    {(!collapsed || isMobile) && (
                      <span className="text-sm">{subItem.label}</span>
                    )}
                    {currentTab === subItem.id && (!collapsed || isMobile) && (
                      <div className="ml-auto w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                    )}
                  </Link>
                ))}
              </CollapsibleContent>
            </Collapsible>

            {/* Financeiro with submenu */}
            <Collapsible open={financeOpen} onOpenChange={setFinanceOpen}>
              <CollapsibleTrigger asChild>
                <button
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group w-full",
                    isFinanceActive
                      ? "bg-primary/10 text-primary neon-border"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  )}
                >
                  <DollarSign 
                    size={18} 
                    className={cn(
                      "transition-transform group-hover:scale-110",
                      collapsed && !isMobile && "mx-auto",
                      isFinanceActive && "drop-shadow-[0_0_8px_hsl(262,83%,58%)]"
                    )} 
                  />
                  {(!collapsed || isMobile) && (
                    <>
                      <span className="text-sm font-medium">Financeiro</span>
                      <ChevronDown 
                        size={16} 
                        className={cn(
                          "ml-auto transition-transform duration-200",
                          financeOpen && "rotate-180"
                        )}
                      />
                    </>
                  )}
                </button>
              </CollapsibleTrigger>
              <CollapsibleContent className="space-y-1 mt-1">
                {financeSubItems.map((subItem) => (
                  <Link
                    key={subItem.id}
                    to={`/dashboard?tab=${subItem.id}`}
                    onClick={onItemClick}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2 rounded-xl transition-all duration-200 group",
                      (!collapsed || isMobile) && "ml-4",
                      currentTab === subItem.id
                        ? "bg-primary/10 text-primary"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    )}
                  >
                    <subItem.icon 
                      size={16} 
                      className={cn(
                        "transition-transform group-hover:scale-110",
                        collapsed && !isMobile && "mx-auto"
                      )} 
                    />
                    {(!collapsed || isMobile) && (
                      <span className="text-sm">{subItem.label}</span>
                    )}
                    {currentTab === subItem.id && (!collapsed || isMobile) && (
                      <div className="ml-auto w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                    )}
                  </Link>
                ))}
              </CollapsibleContent>
            </Collapsible>
          </div>
        </div>

        {/* Premium */}
        <div>
          {(!collapsed || isMobile) && (
            <p className="text-xs uppercase text-muted-foreground font-semibold px-3 mb-2 tracking-wider flex items-center gap-2">
              Premium
              <span className="px-1.5 py-0.5 text-[10px] bg-primary/20 text-primary rounded-full">PRO</span>
            </p>
          )}
          <div className="space-y-1">
            {menuItems.filter(item => item.section === "premium").map((item) => (
              <Link
                key={item.id}
                to={`/dashboard?tab=${item.id}`}
                onClick={onItemClick}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group",
                  currentTab === item.id
                    ? "bg-primary/10 text-primary neon-border"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                <item.icon 
                  size={18} 
                  className={cn(
                    "transition-transform group-hover:scale-110",
                    collapsed && !isMobile && "mx-auto"
                  )} 
                />
                {(!collapsed || isMobile) && <span className="text-sm font-medium">{item.label}</span>}
              </Link>
            ))}
          </div>
        </div>

        {/* Conexões */}
        <div>
          {(!collapsed || isMobile) && (
            <p className="text-xs uppercase text-muted-foreground font-semibold px-3 mb-2 tracking-wider">
              Conexões
            </p>
          )}
          <div className="space-y-1">
            {/* WhatsApp with submenu */}
            <Collapsible open={whatsappOpen} onOpenChange={setWhatsappOpen}>
              <CollapsibleTrigger asChild>
                <button
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group w-full",
                    isWhatsappActive
                      ? "bg-primary/10 text-primary neon-border"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  )}
                >
                  <MessageCircle 
                    size={18} 
                    className={cn(
                      "transition-transform group-hover:scale-110",
                      collapsed && !isMobile && "mx-auto",
                      isWhatsappActive && "drop-shadow-[0_0_8px_hsl(262,83%,58%)]"
                    )} 
                  />
                  {(!collapsed || isMobile) && (
                    <>
                      <span className="text-sm font-medium">WhatsApp</span>
                      <ChevronDown 
                        size={16} 
                        className={cn(
                          "ml-auto transition-transform duration-200",
                          whatsappOpen && "rotate-180"
                        )}
                      />
                    </>
                  )}
                </button>
              </CollapsibleTrigger>
              <CollapsibleContent className="space-y-1 mt-1">
                {whatsappSubItems.map((subItem) => (
                  <Link
                    key={subItem.id}
                    to={`/dashboard?tab=${subItem.id}`}
                    onClick={onItemClick}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2 rounded-xl transition-all duration-200 group",
                      (!collapsed || isMobile) && "ml-4",
                      currentTab === subItem.id
                        ? "bg-primary/10 text-primary"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    )}
                  >
                    <subItem.icon 
                      size={16} 
                      className={cn(
                        "transition-transform group-hover:scale-110",
                        collapsed && !isMobile && "mx-auto"
                      )} 
                    />
                    {(!collapsed || isMobile) && (
                      <span className="text-sm">{subItem.label}</span>
                    )}
                    {currentTab === subItem.id && (!collapsed || isMobile) && (
                      <div className="ml-auto w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                    )}
                  </Link>
                ))}
              </CollapsibleContent>
            </Collapsible>

            {/* Integrações with submenu */}
            <Collapsible open={integrationsOpen} onOpenChange={setIntegrationsOpen}>
              <CollapsibleTrigger asChild>
                <button
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group w-full",
                    isIntegrationsActive
                      ? "bg-primary/10 text-primary neon-border"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  )}
                >
                  <Plug 
                    size={18} 
                    className={cn(
                      "transition-transform group-hover:scale-110",
                      collapsed && !isMobile && "mx-auto",
                      isIntegrationsActive && "drop-shadow-[0_0_8px_hsl(262,83%,58%)]"
                    )} 
                  />
                  {(!collapsed || isMobile) && (
                    <>
                      <span className="text-sm font-medium">Integrações</span>
                      <ChevronDown 
                        size={16} 
                        className={cn(
                          "ml-auto transition-transform duration-200",
                          integrationsOpen && "rotate-180"
                        )}
                      />
                    </>
                  )}
                </button>
              </CollapsibleTrigger>
              <CollapsibleContent className="space-y-1 mt-1">
                {integrationSubItems.map((subItem) => (
                  <Link
                    key={subItem.id}
                    to={`/dashboard?tab=${subItem.id}`}
                    onClick={onItemClick}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2 rounded-xl transition-all duration-200 group",
                      (!collapsed || isMobile) && "ml-4",
                      currentTab === subItem.id
                        ? "bg-primary/10 text-primary"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    )}
                  >
                    <subItem.icon 
                      size={16} 
                      className={cn(
                        "transition-transform group-hover:scale-110",
                        collapsed && !isMobile && "mx-auto"
                      )} 
                    />
                    {(!collapsed || isMobile) && (
                      <span className="text-sm">{subItem.label}</span>
                    )}
                    {currentTab === subItem.id && (!collapsed || isMobile) && (
                      <div className="ml-auto w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                    )}
                  </Link>
                ))}
              </CollapsibleContent>
            </Collapsible>
          </div>
        </div>

        {/* IA */}
        <div>
          {(!collapsed || isMobile) && (
            <p className="text-xs uppercase text-muted-foreground font-semibold px-3 mb-2 tracking-wider flex items-center gap-2">
              Agentes IA
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
              </span>
            </p>
          )}
          <div className="space-y-1">
            {menuItems.filter(item => item.section === "ia").map((item) => (
              <Link
                key={item.id}
                to={`/dashboard?tab=${item.id}`}
                onClick={onItemClick}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group",
                  currentTab === item.id
                    ? "bg-primary/10 text-primary neon-border"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                <item.icon 
                  size={18} 
                  className={cn(
                    "transition-transform group-hover:scale-110",
                    collapsed && !isMobile && "mx-auto"
                  )} 
                />
                {(!collapsed || isMobile) && <span className="text-sm font-medium">{item.label}</span>}
              </Link>
            ))}
          </div>
        </div>
      </nav>

      {/* User info and logout */}
      <div className="p-3 border-t border-border/50 space-y-2">
        {(!collapsed || isMobile) && userEmail && (
          <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-muted/50">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center">
              <User size={14} className="text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <span className="text-sm text-foreground font-medium truncate block">
                {userEmail.split("@")[0]}
              </span>
              <span className="text-xs text-muted-foreground truncate block">
                {userEmail}
              </span>
            </div>
          </div>
        )}
        <button
          onClick={() => {
            onItemClick?.();
            onLogout();
          }}
          className={cn(
            "flex items-center gap-3 px-3 py-2.5 rounded-xl text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-all w-full group",
            collapsed && !isMobile && "justify-center"
          )}
        >
          <LogOut size={18} className="group-hover:scale-110 transition-transform" />
          {(!collapsed || isMobile) && <span className="text-sm font-medium">Sair</span>}
        </button>
      </div>
    </>
  );

  // Mobile: use Sheet
  if (isMobile) {
    return (
      <>
        {/* Mobile trigger button */}
        <button
          onClick={() => setMobileOpen(true)}
          className="fixed top-4 left-4 z-50 p-2.5 rounded-xl bg-card border border-border/50 text-foreground shadow-lg md:hidden"
        >
          <Menu size={20} />
        </button>

        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
          <SheetContent side="left" className="p-0 w-72 bg-card border-border/50">
            <SidebarContent onItemClick={() => setMobileOpen(false)} />
          </SheetContent>
        </Sheet>
      </>
    );
  }

  // Desktop: original sidebar
  return (
    <aside
      className={cn(
        "fixed left-0 top-0 h-screen bg-card border-r border-border/50 flex flex-col transition-all duration-300 z-50 hidden md:flex",
        collapsed ? "w-16" : "w-64"
      )}
    >
      {/* Toggle button */}
      <button
        onClick={onToggle}
        className={cn(
          "absolute -right-3 top-20 p-1.5 rounded-full bg-primary text-white shadow-lg hover:bg-primary/90 transition-colors z-10",
          "neon-glow"
        )}
      >
        {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
      </button>

      <SidebarContent />
    </aside>
  );
};

export default DashboardSidebar;
