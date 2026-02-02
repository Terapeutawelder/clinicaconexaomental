import { 
  Calendar, 
  Bot, 
  Instagram, 
  UserCheck, 
  Sparkles
} from "lucide-react";

interface ComingSoonPageProps {
  title: string;
  description: string;
  icon: React.ElementType;
  isPremium?: boolean;
}

const ComingSoonPage = ({ title, description, icon: Icon, isPremium }: ComingSoonPageProps) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
      <div className={`w-20 h-20 rounded-2xl flex items-center justify-center mb-6 ${
        isPremium ? "bg-gradient-to-br from-primary/30 to-primary/10" : "bg-white/10"
      }`}>
        <Icon className={`w-10 h-10 ${isPremium ? "text-primary" : "text-white/70"}`} />
      </div>
      
      {isPremium && (
        <div className="flex items-center gap-2 mb-4 px-4 py-2 rounded-full bg-primary/20 text-primary">
          <Sparkles size={16} />
          <span className="text-sm font-medium">Recurso Premium</span>
        </div>
      )}
      
      <h2 className="text-2xl font-bold text-white mb-3">{title}</h2>
      <p className="text-white/60 max-w-md mb-8">{description}</p>
      
      <div className="flex items-center gap-3 px-6 py-3 rounded-xl bg-white/5 border border-white/10">
        <div className="w-2 h-2 rounded-full bg-yellow-500 animate-pulse" />
        <span className="text-white/70 text-sm">Em desenvolvimento</span>
      </div>
    </div>
  );
};

export const GoogleIntegrationPage = () => (
  <ComingSoonPage
    title="Google Agenda & Meet"
    description="Sincronize sua agenda com Google Calendar e gere links automáticos do Google Meet."
    icon={Calendar}
  />
);

export const AISchedulingPage = () => (
  <ComingSoonPage
    title="Agente IA de Agendamento"
    description="Assistente de IA que agenda consultas automaticamente respondendo seus clientes."
    icon={Bot}
    isPremium
  />
);

export const AIInstagramPage = () => (
  <ComingSoonPage
    title="Agente IA Instagram"
    description="IA que responde mensagens do Instagram e direciona clientes para agendamento."
    icon={Instagram}
    isPremium
  />
);

export const AIFollowupPage = () => (
  <ComingSoonPage
    title="Agente IA Follow-up"
    description="IA que faz follow-up automático com clientes que não agendaram ou faltaram."
    icon={UserCheck}
    isPremium
  />
);
