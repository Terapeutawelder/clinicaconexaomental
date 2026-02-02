import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from "recharts";
import {
  TrendingUp,
  Users,
  DollarSign,
  Calendar,
  Loader2,
} from "lucide-react";
import { format, subDays, subMonths, eachDayOfInterval, eachMonthOfInterval } from "date-fns";
import { ptBR } from "date-fns/locale";

const AdminAnalytics = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [period, setPeriod] = useState("30d");
  const [stats, setStats] = useState({
    newUsers: [] as any[],
    revenue: [] as any[],
    planDistribution: [] as any[],
    appointments: [] as any[],
  });

  useEffect(() => {
    fetchAnalytics();
  }, [period]);

  const fetchAnalytics = async () => {
    setIsLoading(true);

    try {
      const endDate = new Date();
      let startDate: Date;
      let dateInterval: Date[];

      switch (period) {
        case "7d":
          startDate = subDays(endDate, 7);
          dateInterval = eachDayOfInterval({ start: startDate, end: endDate });
          break;
        case "30d":
          startDate = subDays(endDate, 30);
          dateInterval = eachDayOfInterval({ start: startDate, end: endDate });
          break;
        case "90d":
          startDate = subDays(endDate, 90);
          dateInterval = eachDayOfInterval({ start: startDate, end: endDate });
          break;
        case "12m":
          startDate = subMonths(endDate, 12);
          dateInterval = eachMonthOfInterval({ start: startDate, end: endDate });
          break;
        default:
          startDate = subDays(endDate, 30);
          dateInterval = eachDayOfInterval({ start: startDate, end: endDate });
      }

      // Fetch new users
      const { data: profiles } = await supabase
        .from("profiles")
        .select("created_at")
        .eq("is_professional", true)
        .gte("created_at", startDate.toISOString())
        .order("created_at", { ascending: true });

      // Fetch revenue
      const { data: payments } = await supabase
        .from("subscription_payments")
        .select("amount_cents, created_at")
        .eq("status", "approved")
        .gte("created_at", startDate.toISOString())
        .order("created_at", { ascending: true });

      // Fetch plan distribution
      const { data: subscriptions } = await supabase
        .from("subscriptions")
        .select("plan, status");

      // Fetch appointments
      const { data: appointments } = await supabase
        .from("appointments")
        .select("created_at, status")
        .gte("created_at", startDate.toISOString());

      // Process new users data
      const newUsersData = dateInterval.map((date) => {
        const dateStr = period === "12m" 
          ? format(date, "MMM/yy", { locale: ptBR })
          : format(date, "dd/MM", { locale: ptBR });
        
        const count = profiles?.filter((p) => {
          const pDate = new Date(p.created_at);
          if (period === "12m") {
            return pDate.getMonth() === date.getMonth() && pDate.getFullYear() === date.getFullYear();
          }
          return format(pDate, "yyyy-MM-dd") === format(date, "yyyy-MM-dd");
        }).length || 0;

        return { date: dateStr, users: count };
      });

      // Process revenue data
      const revenueData = dateInterval.map((date) => {
        const dateStr = period === "12m"
          ? format(date, "MMM/yy", { locale: ptBR })
          : format(date, "dd/MM", { locale: ptBR });

        const total = payments?.filter((p) => {
          const pDate = new Date(p.created_at);
          if (period === "12m") {
            return pDate.getMonth() === date.getMonth() && pDate.getFullYear() === date.getFullYear();
          }
          return format(pDate, "yyyy-MM-dd") === format(date, "yyyy-MM-dd");
        }).reduce((acc, p) => acc + (p.amount_cents / 100), 0) || 0;

        return { date: dateStr, revenue: total };
      });

      // Process plan distribution
      const planCounts: Record<string, number> = { free: 0, pro: 0, premium: 0 };
      subscriptions?.forEach((s) => {
        if (s.status === "active" && planCounts[s.plan] !== undefined) {
          planCounts[s.plan]++;
        }
      });

      const planDistribution = [
        { name: "Free", value: planCounts.free, color: "#64748b" },
        { name: "Pro", value: planCounts.pro, color: "#3b82f6" },
        { name: "Premium", value: planCounts.premium, color: "#a855f7" },
      ];

      // Process appointments data
      const appointmentsData = dateInterval.map((date) => {
        const dateStr = period === "12m"
          ? format(date, "MMM/yy", { locale: ptBR })
          : format(date, "dd/MM", { locale: ptBR });

        const count = appointments?.filter((a) => {
          const aDate = new Date(a.created_at);
          if (period === "12m") {
            return aDate.getMonth() === date.getMonth() && aDate.getFullYear() === date.getFullYear();
          }
          return format(aDate, "yyyy-MM-dd") === format(date, "yyyy-MM-dd");
        }).length || 0;

        return { date: dateStr, appointments: count };
      });

      setStats({
        newUsers: newUsersData,
        revenue: revenueData,
        planDistribution,
        appointments: appointmentsData,
      });
    } catch (error) {
      console.error("Error fetching analytics:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const totalNewUsers = stats.newUsers.reduce((acc, d) => acc + d.users, 0);
  const totalRevenue = stats.revenue.reduce((acc, d) => acc + d.revenue, 0);
  const totalAppointments = stats.appointments.reduce((acc, d) => acc + d.appointments, 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-white">Analytics</h1>
          <p className="text-slate-400 mt-1">Métricas e relatórios da plataforma</p>
        </div>
        <Select value={period} onValueChange={setPeriod}>
          <SelectTrigger className="w-40 bg-input border-border text-foreground">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-card border-border">
            <SelectItem value="7d">Últimos 7 dias</SelectItem>
            <SelectItem value="30d">Últimos 30 dias</SelectItem>
            <SelectItem value="90d">Últimos 90 dias</SelectItem>
            <SelectItem value="12m">Últimos 12 meses</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="bg-slate-800/50 border-slate-700">
          <CardContent className="p-4 md:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">Novos Usuários</p>
                <p className="text-2xl font-bold text-white">{totalNewUsers}</p>
              </div>
              <div className="p-3 rounded-xl bg-blue-400/10">
                <Users className="w-6 h-6 text-blue-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800/50 border-slate-700">
          <CardContent className="p-4 md:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">Receita Total</p>
                <p className="text-2xl font-bold text-white">
                  R$ {totalRevenue.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                </p>
              </div>
              <div className="p-3 rounded-xl bg-green-400/10">
                <DollarSign className="w-6 h-6 text-green-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800/50 border-slate-700">
          <CardContent className="p-4 md:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">Agendamentos</p>
                <p className="text-2xl font-bold text-white">{totalAppointments}</p>
              </div>
              <div className="p-3 rounded-xl bg-purple-400/10">
                <Calendar className="w-6 h-6 text-purple-400" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* New Users Chart */}
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Users className="w-5 h-5 text-blue-400" />
              Novos Usuários
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={stats.newUsers}>
                  <defs>
                    <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis dataKey="date" stroke="#94a3b8" fontSize={11} />
                  <YAxis stroke="#94a3b8" fontSize={11} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#1e293b",
                      border: "1px solid #334155",
                      borderRadius: "8px",
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="users"
                    stroke="#3b82f6"
                    fillOpacity={1}
                    fill="url(#colorUsers)"
                    name="Usuários"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Revenue Chart */}
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-green-400" />
              Receita
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.revenue}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis dataKey="date" stroke="#94a3b8" fontSize={11} />
                  <YAxis stroke="#94a3b8" fontSize={11} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#1e293b",
                      border: "1px solid #334155",
                      borderRadius: "8px",
                    }}
                    formatter={(value: number) => [`R$ ${value.toFixed(2)}`, "Receita"]}
                  />
                  <Bar dataKey="revenue" fill="#22c55e" radius={[4, 4, 0, 0]} name="Receita" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Plan Distribution */}
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-purple-400" />
              Distribuição de Planos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={stats.planDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {stats.planDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#1e293b",
                      border: "1px solid #334155",
                      borderRadius: "8px",
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex flex-col gap-2">
                {stats.planDistribution.map((plan) => (
                  <div key={plan.name} className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: plan.color }}
                    />
                    <span className="text-sm text-slate-300">
                      {plan.name}: {plan.value}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Appointments Chart */}
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Calendar className="w-5 h-5 text-cyan-400" />
              Agendamentos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={stats.appointments}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis dataKey="date" stroke="#94a3b8" fontSize={11} />
                  <YAxis stroke="#94a3b8" fontSize={11} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#1e293b",
                      border: "1px solid #334155",
                      borderRadius: "8px",
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="appointments"
                    stroke="#06b6d4"
                    strokeWidth={2}
                    dot={{ fill: "#06b6d4" }}
                    name="Agendamentos"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminAnalytics;
