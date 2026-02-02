import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Users,
  CreditCard,
  TrendingUp,
  DollarSign,
  UserCheck,
  UserX,
  Calendar,
  Activity,
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts";

interface Stats {
  totalProfessionals: number;
  activeProfessionals: number;
  totalSubscriptions: number;
  activeSubscriptions: number;
  monthlyRevenue: number;
  totalRevenue: number;
  newUsersThisMonth: number;
  churnRate: number;
}

const AdminOverview = () => {
  const [stats, setStats] = useState<Stats>({
    totalProfessionals: 0,
    activeProfessionals: 0,
    totalSubscriptions: 0,
    activeSubscriptions: 0,
    monthlyRevenue: 0,
    totalRevenue: 0,
    newUsersThisMonth: 0,
    churnRate: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [recentActivity, setRecentActivity] = useState<any[]>([]);

  useEffect(() => {
    fetchStats();
    fetchRecentActivity();
  }, []);

  const fetchStats = async () => {
    try {
      // Fetch total professionals
      const { count: totalProfessionals } = await supabase
        .from("profiles")
        .select("*", { count: "exact", head: true })
        .eq("is_professional", true);

      // Fetch active professionals (logged in last 30 days)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      const { count: activeProfessionals } = await supabase
        .from("profiles")
        .select("*", { count: "exact", head: true })
        .eq("is_professional", true)
        .gte("updated_at", thirtyDaysAgo.toISOString());

      // Fetch subscriptions
      const { data: subscriptions } = await supabase
        .from("subscriptions")
        .select("*");

      const activeSubscriptions = subscriptions?.filter(s => s.status === "active").length || 0;
      const monthlyRevenue = subscriptions
        ?.filter(s => s.status === "active")
        .reduce((acc, s) => acc + (s.amount_cents || 0), 0) || 0;

      // Fetch payments for total revenue
      const { data: payments } = await supabase
        .from("subscription_payments")
        .select("amount_cents")
        .eq("status", "approved");

      const totalRevenue = payments?.reduce((acc, p) => acc + p.amount_cents, 0) || 0;

      // New users this month
      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      startOfMonth.setHours(0, 0, 0, 0);

      const { count: newUsersThisMonth } = await supabase
        .from("profiles")
        .select("*", { count: "exact", head: true })
        .eq("is_professional", true)
        .gte("created_at", startOfMonth.toISOString());

      setStats({
        totalProfessionals: totalProfessionals || 0,
        activeProfessionals: activeProfessionals || 0,
        totalSubscriptions: subscriptions?.length || 0,
        activeSubscriptions,
        monthlyRevenue: monthlyRevenue / 100,
        totalRevenue: totalRevenue / 100,
        newUsersThisMonth: newUsersThisMonth || 0,
        churnRate: subscriptions?.length ? 
          ((subscriptions.filter(s => s.status === "cancelled").length / subscriptions.length) * 100) : 0,
      });
    } catch (error) {
      console.error("Error fetching stats:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchRecentActivity = async () => {
    try {
      const { data } = await supabase
        .from("admin_activity_log")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(10);

      setRecentActivity(data || []);
    } catch (error) {
      console.error("Error fetching activity:", error);
    }
  };

  // Mock chart data - replace with real data
  const revenueData = [
    { month: "Jan", revenue: 4500 },
    { month: "Fev", revenue: 5200 },
    { month: "Mar", revenue: 6100 },
    { month: "Abr", revenue: 7800 },
    { month: "Mai", revenue: 8500 },
    { month: "Jun", revenue: 9200 },
  ];

  const subscriptionData = [
    { month: "Jan", pro: 45, premium: 12 },
    { month: "Fev", pro: 52, premium: 18 },
    { month: "Mar", pro: 61, premium: 24 },
    { month: "Abr", pro: 78, premium: 32 },
    { month: "Mai", pro: 85, premium: 38 },
    { month: "Jun", pro: 92, premium: 45 },
  ];

  const statCards = [
    {
      title: "Total Profissionais",
      value: stats.totalProfessionals,
      icon: Users,
      color: "text-blue-400",
      bgColor: "bg-blue-400/10",
    },
    {
      title: "Assinaturas Ativas",
      value: stats.activeSubscriptions,
      icon: CreditCard,
      color: "text-green-400",
      bgColor: "bg-green-400/10",
    },
    {
      title: "Receita Mensal",
      value: `R$ ${stats.monthlyRevenue.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`,
      icon: DollarSign,
      color: "text-yellow-400",
      bgColor: "bg-yellow-400/10",
    },
    {
      title: "Novos este mês",
      value: stats.newUsersThisMonth,
      icon: TrendingUp,
      color: "text-purple-400",
      bgColor: "bg-purple-400/10",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-white">Dashboard</h1>
        <p className="text-slate-400 mt-1">Visão geral da plataforma AcolheAqui</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat, index) => (
          <Card key={index} className="bg-slate-800/50 border-slate-700">
            <CardContent className="p-4 md:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-400">{stat.title}</p>
                  <p className="text-xl md:text-2xl font-bold text-white mt-1">
                    {isLoading ? "..." : stat.value}
                  </p>
                </div>
                <div className={`p-3 rounded-xl ${stat.bgColor}`}>
                  <stat.icon className={`w-5 h-5 md:w-6 md:h-6 ${stat.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Chart */}
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-green-400" />
              Receita Mensal
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 md:h-80">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={revenueData}>
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis dataKey="month" stroke="#94a3b8" fontSize={12} />
                  <YAxis stroke="#94a3b8" fontSize={12} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#1e293b",
                      border: "1px solid #334155",
                      borderRadius: "8px",
                    }}
                    formatter={(value: number) => [`R$ ${value.toLocaleString("pt-BR")}`, "Receita"]}
                  />
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    stroke="#22c55e"
                    fillOpacity={1}
                    fill="url(#colorRevenue)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Subscriptions Chart */}
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-blue-400" />
              Assinaturas por Plano
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 md:h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={subscriptionData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis dataKey="month" stroke="#94a3b8" fontSize={12} />
                  <YAxis stroke="#94a3b8" fontSize={12} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#1e293b",
                      border: "1px solid #334155",
                      borderRadius: "8px",
                    }}
                  />
                  <Bar dataKey="pro" fill="#3b82f6" name="Plano Pro" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="premium" fill="#a855f7" name="Plano Premium" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-slate-800/50 border-slate-700">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-400/10">
                <UserCheck className="w-5 h-5 text-green-400" />
              </div>
              <div>
                <p className="text-sm text-slate-400">Ativos (30 dias)</p>
                <p className="text-lg font-bold text-white">{stats.activeProfessionals}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800/50 border-slate-700">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-red-400/10">
                <UserX className="w-5 h-5 text-red-400" />
              </div>
              <div>
                <p className="text-sm text-slate-400">Taxa de Churn</p>
                <p className="text-lg font-bold text-white">{stats.churnRate.toFixed(1)}%</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800/50 border-slate-700">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-yellow-400/10">
                <DollarSign className="w-5 h-5 text-yellow-400" />
              </div>
              <div>
                <p className="text-sm text-slate-400">Receita Total</p>
                <p className="text-lg font-bold text-white">
                  R$ {stats.totalRevenue.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800/50 border-slate-700">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-400/10">
                <Activity className="w-5 h-5 text-blue-400" />
              </div>
              <div>
                <p className="text-sm text-slate-400">Total Assinaturas</p>
                <p className="text-lg font-bold text-white">{stats.totalSubscriptions}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminOverview;
