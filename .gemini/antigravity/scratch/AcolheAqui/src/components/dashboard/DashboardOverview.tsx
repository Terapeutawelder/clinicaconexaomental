import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Calendar, Clock, CreditCard, TrendingUp, ArrowUpRight, ArrowDownRight } from "lucide-react";

interface DashboardOverviewProps {
  profileId: string;
}

interface Stats {
  totalAppointments: number;
  pendingAppointments: number;
  completedAppointments: number;
  totalRevenue: number;
}

const DashboardOverview = ({ profileId }: DashboardOverviewProps) => {
  const [stats, setStats] = useState<Stats>({
    totalAppointments: 0,
    pendingAppointments: 0,
    completedAppointments: 0,
    totalRevenue: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, [profileId]);

  const fetchStats = async () => {
    try {
      const { data: appointments, error } = await supabase
        .from("appointments")
        .select("*")
        .eq("professional_id", profileId);

      if (error) throw error;

      const total = appointments?.length || 0;
      const pending = appointments?.filter(a => a.status === "pending" || a.status === "confirmed").length || 0;
      const completed = appointments?.filter(a => a.status === "completed").length || 0;
      const revenue = appointments
        ?.filter(a => a.payment_status === "paid")
        .reduce((sum, a) => sum + (a.amount_cents || 0), 0) || 0;

      setStats({
        totalAppointments: total,
        pendingAppointments: pending,
        completedAppointments: completed,
        totalRevenue: revenue / 100,
      });
    } catch (error) {
      console.error("Error fetching stats:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const statsCards = [
    {
      title: "Receita Total",
      value: `R$ ${stats.totalRevenue.toFixed(2).replace(".", ",")}`,
      icon: CreditCard,
      trend: "+12.5%",
      trendUp: true,
      gradient: "from-[hsl(200,80%,50%)] to-[hsl(200,80%,35%)]",
      shadowColor: "shadow-[0_8px_30px_hsl(200,80%,50%,0.3)]",
    },
    {
      title: "Total de Sessões",
      value: stats.totalAppointments.toString(),
      icon: Calendar,
      trend: "+8.2%",
      trendUp: true,
      gradient: "from-[hsl(145,70%,45%)] to-[hsl(145,70%,30%)]",
      shadowColor: "shadow-[0_8px_30px_hsl(145,70%,45%,0.3)]",
    },
    {
      title: "Pendentes",
      value: stats.pendingAppointments.toString(),
      icon: Clock,
      trend: stats.pendingAppointments > 0 ? "ativo" : "ok",
      trendUp: stats.pendingAppointments === 0,
      gradient: "from-[hsl(45,100%,55%)] to-[hsl(35,100%,45%)]",
      shadowColor: "shadow-[0_8px_30px_hsl(45,100%,55%,0.3)]",
    },
    {
      title: "Concluídos",
      value: stats.completedAppointments.toString(),
      icon: TrendingUp,
      trend: "+15.3%",
      trendUp: true,
      gradient: "from-[hsl(0,75%,55%)] to-[hsl(0,75%,40%)]",
      shadowColor: "shadow-[0_8px_30px_hsl(0,75%,55%,0.3)]",
    },
  ];

  if (isLoading) {
    return (
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-32 rounded-2xl bg-white/5 animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Stats Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {statsCards.map((card, index) => (
          <div
            key={index}
            className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${card.gradient} ${card.shadowColor} p-6 transition-transform hover:scale-[1.02]`}
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-white/80">{card.title}</p>
                <p className="text-3xl font-bold text-white mt-2">{card.value}</p>
              </div>
              <div className="p-2 bg-white/20 rounded-xl">
                <card.icon className="h-5 w-5 text-white" />
              </div>
            </div>
            <div className="mt-4 flex items-center gap-1">
              {card.trendUp ? (
                <ArrowUpRight className="h-4 w-4 text-white/80" />
              ) : (
                <ArrowDownRight className="h-4 w-4 text-white/80" />
              )}
              <span className="text-sm font-medium text-white/80">{card.trend}</span>
            </div>
            {/* Decorative glow */}
            <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-white/10 blur-2xl" />
          </div>
        ))}
      </div>

      {/* Quick Stats Row */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Welcome Card */}
        <div className="lg:col-span-2 rounded-2xl bg-[hsl(215,40%,12%)] border border-white/5 p-6">
          <h3 className="text-xl font-bold text-white mb-4">Bem-vindo ao seu Dashboard!</h3>
          <p className="text-white/60 mb-6">
            Aqui você pode gerenciar todos os aspectos do seu atendimento online.
          </p>
          <div className="grid sm:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl bg-white/5 border border-white/5">
              <CreditCard className="h-5 w-5 text-primary mb-2" />
              <p className="text-sm font-medium text-white">Pagamentos</p>
              <p className="text-xs text-white/50 mt-1">Configure PIX e cartão</p>
            </div>
            <div className="p-4 rounded-xl bg-white/5 border border-white/5">
              <Clock className="h-5 w-5 text-[hsl(145,70%,45%)] mb-2" />
              <p className="text-sm font-medium text-white">Horários</p>
              <p className="text-xs text-white/50 mt-1">Defina sua disponibilidade</p>
            </div>
            <div className="p-4 rounded-xl bg-white/5 border border-white/5">
              <Calendar className="h-5 w-5 text-[hsl(45,100%,55%)] mb-2" />
              <p className="text-sm font-medium text-white">Agendamentos</p>
              <p className="text-xs text-white/50 mt-1">Histórico de sessões</p>
            </div>
          </div>
        </div>

        {/* Mini Stats */}
        <div className="rounded-2xl bg-[hsl(215,40%,12%)] border border-white/5 p-6">
          <h3 className="text-lg font-bold text-white mb-4">Resumo Rápido</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 rounded-xl bg-gradient-to-r from-primary/20 to-transparent">
              <span className="text-sm text-white/70">Taxa de Conversão</span>
              <span className="text-lg font-bold text-primary">
                {stats.totalAppointments > 0 
                  ? Math.round((stats.completedAppointments / stats.totalAppointments) * 100) 
                  : 0}%
              </span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-xl bg-gradient-to-r from-[hsl(145,70%,45%)]/20 to-transparent">
              <span className="text-sm text-white/70">Sessões Concluídas</span>
              <span className="text-lg font-bold text-[hsl(145,70%,45%)]">{stats.completedAppointments}</span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-xl bg-gradient-to-r from-[hsl(200,80%,50%)]/20 to-transparent">
              <span className="text-sm text-white/70">Média por Sessão</span>
              <span className="text-lg font-bold text-[hsl(200,80%,50%)]">
                R$ {stats.completedAppointments > 0 
                  ? (stats.totalRevenue / stats.completedAppointments).toFixed(2).replace(".", ",")
                  : "0,00"}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardOverview;
