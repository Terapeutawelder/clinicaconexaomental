import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { startOfWeek, endOfWeek, format, addDays } from "date-fns";
import { ptBR } from "date-fns/locale";
import { 
  DollarSign, 
  Users, 
  CalendarCheck, 
  TrendingUp, 
  ArrowUpRight, 
  Clock,
  CreditCard,
  Target,
  Activity,
  BarChart3,
  Calendar
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
} from "recharts";
import MyCoursesSection from "./MyCoursesSection";

interface DashboardOverviewProps {
  profileId: string;
}

interface Stats {
  totalAppointments: number;
  pendingAppointments: number;
  completedAppointments: number;
  totalRevenue: number;
  todayAppointments: number;
  weekAppointments: number;
}

interface MonthlyData {
  month: string;
  revenue: number;
  sessions: number;
}

interface WeeklyOccupancy {
  day: string;
  dayShort: string;
  available: number;
  booked: number;
  occupancyRate: number;
}

const DashboardOverview = ({ profileId }: DashboardOverviewProps) => {
  const [stats, setStats] = useState<Stats>({
    totalAppointments: 0,
    pendingAppointments: 0,
    completedAppointments: 0,
    totalRevenue: 0,
    todayAppointments: 0,
    weekAppointments: 0,
  });
  const [monthlyData, setMonthlyData] = useState<MonthlyData[]>([]);
  const [weeklyOccupancy, setWeeklyOccupancy] = useState<WeeklyOccupancy[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, [profileId]);

  const fetchStats = async () => {
    try {
      // Get week range
      const now = new Date();
      const weekStart = startOfWeek(now, { weekStartsOn: 0 });
      const weekEnd = endOfWeek(now, { weekStartsOn: 0 });
      const weekStartStr = format(weekStart, "yyyy-MM-dd");
      const weekEndStr = format(weekEnd, "yyyy-MM-dd");

      // Fetch appointments and available hours in parallel
      const [appointmentsRes, hoursRes] = await Promise.all([
        supabase
          .from("appointments")
          .select("*")
          .eq("professional_id", profileId),
        supabase
          .from("available_hours")
          .select("*")
          .eq("professional_id", profileId)
          .eq("is_active", true)
      ]);

      if (appointmentsRes.error) throw appointmentsRes.error;
      
      const appointments = appointmentsRes.data || [];
      const availableHours = hoursRes.data || [];

      const today = new Date().toISOString().split('T')[0];
      const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

      const total = appointments.length;
      const pending = appointments.filter(a => a.status === "pending" || a.status === "confirmed").length;
      const completed = appointments.filter(a => a.status === "completed").length;
      const revenue = appointments
        .filter(a => a.payment_status === "paid")
        .reduce((sum, a) => sum + (a.amount_cents || 0), 0);
      const todayCount = appointments.filter(a => a.appointment_date === today).length;
      const weekCount = appointments.filter(a => a.appointment_date >= weekAgo).length;

      setStats({
        totalAppointments: total,
        pendingAppointments: pending,
        completedAppointments: completed,
        totalRevenue: revenue / 100,
        todayAppointments: todayCount,
        weekAppointments: weekCount,
      });

      // Calculate weekly occupancy
      const weekAppointments = appointments.filter(a => 
        a.appointment_date >= weekStartStr && 
        a.appointment_date <= weekEndStr &&
        (a.status === "pending" || a.status === "confirmed" || a.status === "completed")
      );

      const calculateSlotsForTimeRange = (startTime: string, endTime: string): number => {
        const [startHour, startMin] = startTime.split(":").map(Number);
        const [endHour, endMin] = endTime.split(":").map(Number);
        const startMinutes = startHour * 60 + startMin;
        const endMinutes = endHour * 60 + endMin;
        return Math.max(0, Math.floor((endMinutes - startMinutes) / 60));
      };

      const dayNames = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
      const occupancyData: WeeklyOccupancy[] = [];

      for (let i = 0; i < 7; i++) {
        const currentDate = addDays(weekStart, i);
        const dateStr = format(currentDate, "yyyy-MM-dd");
        const dayOfWeek = currentDate.getDay();

        const dayHours = availableHours.filter(h => h.day_of_week === dayOfWeek);
        const availableSlots = dayHours.reduce((sum, h) => 
          sum + calculateSlotsForTimeRange(h.start_time, h.end_time), 0
        );

        const bookedSlots = weekAppointments.filter(a => a.appointment_date === dateStr).length;
        const occupancyRate = availableSlots > 0 ? Math.round((bookedSlots / availableSlots) * 100) : 0;

        occupancyData.push({
          day: format(currentDate, "dd/MM"),
          dayShort: dayNames[dayOfWeek],
          available: availableSlots,
          booked: bookedSlots,
          occupancyRate
        });
      }

      setWeeklyOccupancy(occupancyData);

      // Generate monthly data
      const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun'];
      const mockMonthlyData = months.map((month) => ({
        month,
        revenue: Math.floor(Math.random() * 5000) + 1000 + (revenue / 100 / 6),
        sessions: Math.floor(Math.random() * 20) + 5 + Math.floor(total / 6),
      }));
      setMonthlyData(mockMonthlyData);

    } catch (error) {
      console.error("Error fetching stats:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const kpiCards = [
    {
      title: "Receita Total",
      value: formatCurrency(stats.totalRevenue),
      icon: DollarSign,
      trend: "+12.5%",
      trendUp: true,
      description: "vs. mês anterior",
      color: "from-primary to-primary/70",
      iconBg: "bg-primary/20",
      iconColor: "text-primary",
    },
    {
      title: "Total de Sessões",
      value: stats.totalAppointments.toString(),
      icon: CalendarCheck,
      trend: "+8.2%",
      trendUp: true,
      description: "sessões realizadas",
      color: "from-[hsl(145,70%,45%)] to-[hsl(145,70%,35%)]",
      iconBg: "bg-[hsl(145,70%,45%)]/20",
      iconColor: "text-[hsl(145,70%,45%)]",
    },
    {
      title: "Clientes Atendidos",
      value: stats.completedAppointments.toString(),
      icon: Users,
      trend: "+15.3%",
      trendUp: true,
      description: "clientes únicos",
      color: "from-[hsl(200,80%,50%)] to-[hsl(200,80%,40%)]",
      iconBg: "bg-[hsl(200,80%,50%)]/20",
      iconColor: "text-[hsl(200,80%,50%)]",
    },
    {
      title: "Taxa de Conversão",
      value: `${stats.totalAppointments > 0 
        ? Math.round((stats.completedAppointments / stats.totalAppointments) * 100) 
        : 0}%`,
      icon: TrendingUp,
      trend: "+5.1%",
      trendUp: true,
      description: "de conclusão",
      color: "from-[hsl(25,100%,55%)] to-[hsl(25,100%,45%)]",
      iconBg: "bg-[hsl(25,100%,55%)]/20",
      iconColor: "text-[hsl(25,100%,55%)]",
    },
  ];

  const pieData = [
    { name: "Concluídos", value: stats.completedAppointments, color: "hsl(145, 70%, 45%)" },
    { name: "Pendentes", value: stats.pendingAppointments, color: "hsl(45, 100%, 55%)" },
    { name: "Cancelados", value: Math.max(0, stats.totalAppointments - stats.completedAppointments - stats.pendingAppointments), color: "hsl(0, 75%, 55%)" },
  ].filter(item => item.value > 0);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-36 rounded-2xl bg-card/50 animate-pulse" />
          ))}
        </div>
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="h-80 rounded-2xl bg-card/50 animate-pulse" />
          <div className="h-80 rounded-2xl bg-card/50 animate-pulse" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {kpiCards.map((card, index) => (
          <Card 
            key={index} 
            className="dashboard-card-hover bg-card border-border/50 overflow-hidden relative group"
          >
            <CardContent className="p-5">
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">{card.title}</p>
                  <p className="text-2xl font-bold text-foreground">{card.value}</p>
                  <div className="flex items-center gap-1.5">
                    <span className={`flex items-center text-xs font-medium ${card.trendUp ? 'text-[hsl(145,70%,45%)]' : 'text-destructive'}`}>
                      <ArrowUpRight className="h-3 w-3" />
                      {card.trend}
                    </span>
                    <span className="text-xs text-muted-foreground">{card.description}</span>
                  </div>
                </div>
                <div className={`p-3 rounded-xl ${card.iconBg} group-hover:scale-110 transition-transform`}>
                  <card.icon className={`h-5 w-5 ${card.iconColor}`} />
                </div>
              </div>
              {/* Neon accent bar */}
              <div className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r ${card.color} opacity-60 group-hover:opacity-100 transition-opacity`} />
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Revenue Chart */}
        <Card className="bg-card border-border/50 neon-border">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg font-semibold text-foreground flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-primary" />
                Receita Mensal
              </CardTitle>
              <span className="text-xs text-muted-foreground">Últimos 6 meses</span>
            </div>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <AreaChart data={monthlyData}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(262, 83%, 58%)" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="hsl(262, 83%, 58%)" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 15%, 20%)" />
                <XAxis 
                  dataKey="month" 
                  stroke="hsl(220, 10%, 50%)" 
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis 
                  stroke="hsl(220, 10%, 50%)" 
                  fontSize={12}
                  tickFormatter={(value) => `R$${value/1000}k`}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(220, 20%, 14%)', 
                    border: '1px solid hsl(262, 83%, 58%, 0.3)',
                    borderRadius: '12px',
                    boxShadow: '0 0 20px hsl(262, 83%, 58%, 0.2)'
                  }}
                  labelStyle={{ color: 'white' }}
                  formatter={(value: number) => [formatCurrency(value), 'Receita']}
                />
                <Area 
                  type="monotone" 
                  dataKey="revenue" 
                  stroke="hsl(262, 83%, 58%)" 
                  strokeWidth={2}
                  fillOpacity={1} 
                  fill="url(#colorRevenue)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Sessions Distribution */}
        <Card className="bg-card border-border/50 neon-border">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg font-semibold text-foreground flex items-center gap-2">
                <Activity className="h-5 w-5 text-primary" />
                Status das Sessões
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center">
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={pieData.length > 0 ? pieData : [{ name: "Sem dados", value: 1, color: "hsl(220, 15%, 30%)" }]}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {(pieData.length > 0 ? pieData : [{ name: "Sem dados", value: 1, color: "hsl(220, 15%, 30%)" }]).map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(220, 20%, 14%)', 
                      border: '1px solid hsl(262, 83%, 58%, 0.3)',
                      borderRadius: '12px'
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            {/* Legend */}
            <div className="flex justify-center gap-6 mt-2">
              {pieData.map((item, index) => (
                <div key={index} className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-xs text-muted-foreground">{item.name}: {item.value}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Stats Row */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Today Stats */}
        <Card className="bg-card border-border/50 dashboard-card-hover">
          <CardContent className="p-5">
            <div className="flex items-center gap-4">
              <div className="p-4 rounded-2xl bg-primary/10 neon-glow">
                <Clock className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Sessões Hoje</p>
                <p className="text-3xl font-bold text-foreground">{stats.todayAppointments}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Week Stats */}
        <Card className="bg-card border-border/50 dashboard-card-hover">
          <CardContent className="p-5">
            <div className="flex items-center gap-4">
              <div className="p-4 rounded-2xl bg-[hsl(145,70%,45%)]/10">
                <Target className="h-6 w-6 text-[hsl(145,70%,45%)]" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Esta Semana</p>
                <p className="text-3xl font-bold text-foreground">{stats.weekAppointments}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Avg Revenue */}
        <Card className="bg-card border-border/50 dashboard-card-hover">
          <CardContent className="p-5">
            <div className="flex items-center gap-4">
              <div className="p-4 rounded-2xl bg-[hsl(200,80%,50%)]/10">
                <CreditCard className="h-6 w-6 text-[hsl(200,80%,50%)]" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Ticket Médio</p>
                <p className="text-3xl font-bold text-foreground">
                  {stats.completedAppointments > 0 
                    ? formatCurrency(stats.totalRevenue / stats.completedAppointments)
                    : "R$ 0,00"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Weekly Occupancy Chart */}
      <Card className="bg-card border-border/50 neon-border">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-semibold text-foreground flex items-center gap-2">
              <Calendar className="h-5 w-5 text-primary" />
              Ocupação Semanal
            </CardTitle>
            <span className="text-xs text-muted-foreground">Disponíveis vs Agendados</span>
          </div>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={weeklyOccupancy} barGap={2}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 15%, 20%)" vertical={false} />
              <XAxis 
                dataKey="dayShort" 
                stroke="hsl(220, 10%, 50%)" 
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <YAxis 
                stroke="hsl(220, 10%, 50%)" 
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'hsl(220, 20%, 14%)', 
                  border: '1px solid hsl(262, 83%, 58%, 0.3)',
                  borderRadius: '12px',
                  boxShadow: '0 0 20px hsl(262, 83%, 58%, 0.2)'
                }}
                labelStyle={{ color: 'white' }}
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload as WeeklyOccupancy;
                    return (
                      <div className="bg-card border border-border/50 rounded-xl p-3 shadow-lg">
                        <p className="text-sm font-medium text-foreground mb-2">{label} - {data.day}</p>
                        <div className="space-y-1 text-xs">
                          <p className="text-muted-foreground">
                            Disponíveis: <span className="text-[hsl(200,80%,50%)] font-medium">{data.available}</span>
                          </p>
                          <p className="text-muted-foreground">
                            Agendados: <span className="text-[hsl(145,70%,45%)] font-medium">{data.booked}</span>
                          </p>
                          <p className="text-muted-foreground">
                            Taxa: <span className={`font-medium ${
                              data.occupancyRate >= 80 ? 'text-[hsl(145,70%,45%)]' : 
                              data.occupancyRate >= 50 ? 'text-[hsl(45,100%,55%)]' : 
                              'text-[hsl(200,80%,50%)]'
                            }`}>{data.occupancyRate}%</span>
                          </p>
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Bar 
                dataKey="available" 
                fill="hsl(200, 80%, 50%)" 
                radius={[4, 4, 0, 0]}
                name="Disponíveis"
              />
              <Bar 
                dataKey="booked" 
                fill="hsl(145, 70%, 45%)" 
                radius={[4, 4, 0, 0]}
                name="Agendados"
              />
            </BarChart>
          </ResponsiveContainer>
          
          {/* Occupancy Summary */}
          <div className="mt-4 flex items-center justify-between px-2">
            <div className="flex items-center gap-4 text-xs">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-[hsl(200,80%,50%)]" />
                <span className="text-muted-foreground">Disponíveis</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-[hsl(145,70%,45%)]" />
                <span className="text-muted-foreground">Agendados</span>
              </div>
            </div>
            <div className="flex gap-1">
              {weeklyOccupancy.map((day, i) => (
                <div 
                  key={i}
                  className="w-6 h-2 rounded-full"
                  style={{
                    backgroundColor: day.occupancyRate >= 80 
                      ? 'hsl(145, 70%, 45%)' 
                      : day.occupancyRate >= 50 
                        ? 'hsl(45, 100%, 55%)' 
                        : day.available > 0 
                          ? 'hsl(200, 80%, 50%)' 
                          : 'hsl(220, 15%, 30%)'
                  }}
                  title={`${day.dayShort}: ${day.occupancyRate}%`}
                />
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Sessions Bar Chart */}
      <Card className="bg-card border-border/50 neon-border">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-semibold text-foreground flex items-center gap-2">
            <CalendarCheck className="h-5 w-5 text-primary" />
            Sessões por Mês
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 15%, 20%)" />
              <XAxis 
                dataKey="month" 
                stroke="hsl(220, 10%, 50%)" 
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <YAxis 
                stroke="hsl(220, 10%, 50%)" 
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'hsl(220, 20%, 14%)', 
                  border: '1px solid hsl(262, 83%, 58%, 0.3)',
                  borderRadius: '12px'
                }}
                labelStyle={{ color: 'white' }}
              />
              <Bar 
                dataKey="sessions" 
                fill="hsl(262, 83%, 58%)" 
                radius={[6, 6, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* My Courses Section - for students */}
      <MyCoursesSection />
    </div>
  );
};

export default DashboardOverview;
