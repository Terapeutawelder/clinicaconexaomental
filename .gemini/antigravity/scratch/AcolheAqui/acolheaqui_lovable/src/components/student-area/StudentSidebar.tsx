import { useState } from "react";
import {
  Home,
  BookOpen,
  Trophy,
  Users,
  Calendar,
  Settings,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  LogOut,
  Palette,
  MessageSquare,
  Bell,
  HelpCircle,
  User,
  Sparkles,
  GraduationCap,
  Search,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";

interface Module {
  id: string;
  title: string;
  lessonsCount: number;
}

interface Professional {
  id: string;
  fullName: string;
  avatarUrl: string | null;
}

interface StudentSidebarProps {
  professional: Professional;
  modules: Module[];
  collapsed: boolean;
  onToggleCollapse: () => void;
  onSelectModule: (moduleId: string) => void;
  overallProgress: number;
  activeSection?: string;
  onSectionChange?: (section: string) => void;
}

const StudentSidebar = ({
  professional,
  modules,
  collapsed,
  onToggleCollapse,
  onSelectModule,
  overallProgress,
  activeSection = "home",
  onSectionChange,
}: StudentSidebarProps) => {
  const navigate = useNavigate();
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  const handleSectionClick = (section: string) => {
    if (onSectionChange) {
      onSectionChange(section);
    }
  };

  const mainMenuItems = [
    { 
      id: "home",
      icon: Home, 
      label: "Início", 
      action: () => handleSectionClick("home"),
      badge: null,
    },
    { 
      id: "courses",
      icon: GraduationCap, 
      label: "Curso", 
      action: () => handleSectionClick("courses"),
      badge: modules.length > 0 ? modules.length.toString() : null,
    },
    { 
      id: "community",
      icon: Users, 
      label: "Comunidade", 
      action: () => handleSectionClick("community"),
      badge: null,
    },
    { 
      id: "events",
      icon: Calendar, 
      label: "Aulas ao Vivo", 
      action: () => handleSectionClick("events"),
      badge: null,
    },
  ];

  const extraMenuItems = [
    { 
      id: "certificates",
      icon: Trophy, 
      label: "Certificados", 
      action: () => handleSectionClick("certificates"),
    },
    { 
      id: "profile",
      icon: User, 
      label: "Meu Perfil", 
      action: () => handleSectionClick("profile"),
    },
    { 
      id: "help",
      icon: HelpCircle, 
      label: "Ajuda", 
      action: () => handleSectionClick("help"),
    },
  ];

  const settingsItems = [
    { icon: Bell, label: "Notificações", action: () => {} },
    { icon: Palette, label: "Aparência", action: () => {} },
    { icon: MessageSquare, label: "Preferências", action: () => {} },
  ];

  const filteredModules = modules.filter((module) =>
    module.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 h-screen bg-gradient-to-b from-gray-900 via-gray-900 to-gray-950 backdrop-blur-xl border-r border-gray-800/50 z-50 transition-all duration-300 flex flex-col shadow-2xl",
        collapsed ? "w-20" : "w-72"
      )}
    >
      {/* Header */}
      <div className="p-4">
        <div className={cn("flex items-center gap-3", collapsed && "justify-center")}>
          <div className="relative">
            <Avatar className="w-11 h-11 ring-2 ring-primary/30 ring-offset-2 ring-offset-gray-900">
              <AvatarImage src={professional.avatarUrl || undefined} />
              <AvatarFallback className="bg-gradient-to-br from-primary to-primary/60 text-white font-bold">
                {professional.fullName.slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-green-500 rounded-full border-2 border-gray-900" />
          </div>
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <h2 className="text-white font-semibold text-sm truncate">
                {professional.fullName}
              </h2>
              <div className="flex items-center gap-1.5 mt-0.5">
                <Sparkles className="w-3 h-3 text-primary" />
                <p className="text-xs text-primary font-medium">Área de Membros</p>
              </div>
            </div>
          )}
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={onToggleCollapse}
          className={cn(
            "absolute text-gray-400 hover:text-white hover:bg-gray-800/80 transition-all",
            collapsed 
              ? "-right-3 top-6 bg-gray-900 border border-gray-700 rounded-full w-6 h-6 shadow-lg" 
              : "right-2 top-4"
          )}
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </Button>
      </div>

      {/* Progress Card */}
      {!collapsed && (
        <div className="px-4 pb-4">
          <div className="bg-gradient-to-r from-primary/10 to-transparent rounded-xl p-3 border border-primary/20">
            <div className="flex items-center justify-between text-xs mb-2">
              <div className="flex items-center gap-1.5 text-gray-300">
                <GraduationCap className="w-3.5 h-3.5" />
                <span>Progresso Geral</span>
              </div>
              <span className="text-primary font-bold">{overallProgress}%</span>
            </div>
            <Progress value={overallProgress} className="h-2 bg-gray-800" />
            <p className="text-[10px] text-gray-500 mt-1.5">
              Continue aprendendo para desbloquear certificados
            </p>
          </div>
        </div>
      )}

      {collapsed && (
        <div className="px-3 pb-4 flex justify-center">
          <div className="relative w-10 h-10">
            <svg className="w-10 h-10 transform -rotate-90">
              <circle
                cx="20"
                cy="20"
                r="16"
                stroke="currentColor"
                strokeWidth="3"
                fill="none"
                className="text-gray-800"
              />
              <circle
                cx="20"
                cy="20"
                r="16"
                stroke="currentColor"
                strokeWidth="3"
                fill="none"
                strokeDasharray={100}
                strokeDashoffset={100 - overallProgress}
                className="text-primary"
                strokeLinecap="round"
              />
            </svg>
            <span className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-primary">
              {overallProgress}%
            </span>
          </div>
        </div>
      )}

      <Separator className="bg-gray-800/50" />

      {/* Search (when not collapsed) */}
      {!collapsed && (
        <div className="px-4 py-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <Input
              placeholder="Buscar..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 bg-gray-800/50 border-gray-700/50 text-sm h-9 focus:ring-primary/30"
            />
          </div>
        </div>
      )}

      {/* Main Navigation */}
      <nav className="flex-1 py-2 px-2 space-y-1 overflow-y-auto scrollbar-thin scrollbar-track-transparent scrollbar-thumb-gray-800">
        {/* Main Menu */}
        {mainMenuItems.map((item) => (
          <button
            key={item.id}
            onClick={item.action}
            className={cn(
              "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group",
              collapsed && "justify-center px-0",
              activeSection === item.id
                ? "bg-primary/10 text-primary"
                : "text-gray-400 hover:text-white hover:bg-gray-800/60"
            )}
          >
            <item.icon className={cn(
              "w-5 h-5 flex-shrink-0 transition-transform group-hover:scale-110",
              activeSection === item.id && "text-primary"
            )} />
            {!collapsed && (
              <>
                <span className="text-sm flex-1 text-left">{item.label}</span>
                {item.badge && (
                  <Badge 
                    variant="default"
                    className="text-[10px] px-1.5 py-0 bg-primary/20 text-primary border-primary/30"
                  >
                    {item.badge}
                  </Badge>
                )}
              </>
            )}
          </button>
        ))}

        {!collapsed && (
          <>
            <Separator className="bg-gray-800/50 my-3" />
            
            {/* Modules Section */}
            <div className="px-1 mb-2">
              <p className="text-[11px] text-gray-500 uppercase tracking-wider font-medium flex items-center gap-2">
                <BookOpen className="w-3 h-3" />
                Módulos
              </p>
            </div>
            
            <div className="space-y-0.5 max-h-40 overflow-y-auto scrollbar-thin scrollbar-track-transparent scrollbar-thumb-gray-800">
              {filteredModules.length > 0 ? (
                filteredModules.map((module) => (
                  <button
                    key={module.id}
                    onClick={() => onSelectModule(module.id)}
                    className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800/40 transition-colors text-left group"
                  >
                    <div className="w-2 h-2 rounded-full bg-gradient-to-r from-primary to-primary/60 flex-shrink-0 group-hover:scale-125 transition-transform" />
                    <span className="text-sm truncate flex-1">{module.title}</span>
                    <span className="text-[10px] text-gray-600">{module.lessonsCount}</span>
                  </button>
                ))
              ) : (
                <p className="text-xs text-gray-600 px-3 py-2">
                  {searchQuery ? "Nenhum módulo encontrado" : "Nenhum módulo disponível"}
                </p>
              )}
            </div>

            <Separator className="bg-gray-800/50 my-3" />

            {/* Extra Menu */}
            {extraMenuItems.map((item) => (
              <button
                key={item.id}
                onClick={item.action}
                className={cn(
                  "w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors",
                  activeSection === item.id
                    ? "bg-primary/10 text-primary"
                    : "text-gray-400 hover:text-white hover:bg-gray-800/40"
                )}
              >
                <item.icon className="w-4 h-4 flex-shrink-0" />
                <span className="text-sm">{item.label}</span>
              </button>
            ))}

            {/* Settings Collapsible */}
            <Collapsible open={settingsOpen} onOpenChange={setSettingsOpen}>
              <CollapsibleTrigger className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800/40 transition-colors">
                <Settings className="w-4 h-4 flex-shrink-0" />
                <span className="text-sm flex-1 text-left">Configurações</span>
                <ChevronDown className={cn(
                  "w-4 h-4 transition-transform duration-200",
                  settingsOpen && "rotate-180"
                )} />
              </CollapsibleTrigger>
              <CollapsibleContent className="pl-4 space-y-0.5 mt-1">
                {settingsItems.map((item, index) => (
                  <button
                    key={index}
                    onClick={item.action}
                    className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-gray-500 hover:text-white hover:bg-gray-800/30 transition-colors text-sm"
                  >
                    <item.icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </button>
                ))}
              </CollapsibleContent>
            </Collapsible>
          </>
        )}

        {collapsed && (
          <div className="space-y-1 pt-2">
            {extraMenuItems.map((item) => (
              <button
                key={item.id}
                onClick={item.action}
                className={cn(
                  "w-full flex items-center justify-center py-2.5 rounded-lg transition-colors",
                  activeSection === item.id
                    ? "bg-primary/10 text-primary"
                    : "text-gray-400 hover:text-white hover:bg-gray-800/40"
                )}
              >
                <item.icon className="w-5 h-5" />
              </button>
            ))}
            <button
              className="w-full flex items-center justify-center py-2.5 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800/40 transition-colors"
            >
              <Settings className="w-5 h-5" />
            </button>
          </div>
        )}
      </nav>

      {/* Footer */}
      <div className="p-3 border-t border-gray-800/50">
        <button
          onClick={handleLogout}
          className={cn(
            "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-red-400/80 hover:text-red-400 hover:bg-red-500/10 transition-all group",
            collapsed && "justify-center px-0"
          )}
        >
          <LogOut className="w-5 h-5 group-hover:translate-x-0.5 transition-transform" />
          {!collapsed && <span className="text-sm font-medium">Sair da conta</span>}
        </button>
      </div>
    </aside>
  );
};

export default StudentSidebar;
