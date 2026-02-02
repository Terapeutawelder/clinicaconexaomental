import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Calendar, Clock, CreditCard, TrendingUp, ArrowUpRight, ArrowDownRight, CalendarClock, BarChart3 } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, Legend } from "recharts";
import { format, startOfWeek, endOfWeek, addDays } from "date-fns";
import { ptBR } from "date-fns/locale";

interface DashboardOverviewProps {
  profileId: string;
}

interface Stats {
  totalAppointments: number;
  pendingAppointments: number;
  completedAppointments: number;
  totalRevenue: number;
}

interface AvailableHour {
  day_of_week: number;
  start_time: string;
  end_time: string;
  is_active: boolean;
}

interface Appointment {
  appointment_date: string;
  status: string;
}

interface DayAvailability {
  day: number;
  label: string;
  shortLabel: string;
  slotsCount: number;
  isActive: boolean;
}

interface OccupancyData {
  day: string;
  fullDay: string;
  available: number;
  booked: number;
  occupancyRate: number;
}

const DAYS_OF_WEEK = [
  { value: 0, label: "Domingo", short: "Dom" },
  { value: 1, label: "Segunda", short: "Seg" },
  { value: 2, label: "Terça", short: "Ter" },
  { value: 3, label: "Quarta", short: "Qua" },
  { value: 4, label: "Quinta", short: "Qui" },
  { value: 5, label: "Sexta", short: "Sex" },
  { value: 6, label: "Sábado", short: "Sáb" },
];

const DashboardOverview = ({ profileId }: DashboardOverviewProps) => {
  const [stats, setStats] = useState<Stats>({
    totalAppointments: 0,
    pendingAppointments: 0,
    completedAppointments: 0,
    totalRevenue: 0,
  });
  const [availableHours, setAvailableHours] = useState<AvailableHour[]>([]);
  const [weeklyAppointments, setWeeklyAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, [profileId]);

  const fetchData = async () => {
    try {
      // Get current week range
      const today = new Date();
      const weekStart = startOfWeek(today, { weekStartsOn: 0 });
      const weekEnd = endOfWeek(today, { weekStartsOn: 0 });

      // Fetch appointments, available hours, and weekly appointments in parallel
      const [appointmentsResult, hoursResult, weeklyResult] = await Promise.all([
        supabase
          .from("appointments")
          .select("*")
          .eq("professional_id", profileId),
        supabase
          .from("available_hours")
          .select("*")
          .eq("professional_id", profileId)
          .order("day_of_week")
          .order("start_time"),
        supabase
          .from("appointments")
          .select("appointment_date, status")
          .eq("professional_id", profileId)
          .gte("appointment_date", format(weekStart, "yyyy-MM-dd"))
          .lte("appointment_date", format(weekEnd, "yyyy-MM-dd"))
          .in("status", ["pending", "confirmed", "completed"]),
      ]);

      if (appointmentsResult.error) throw appointmentsResult.error;

      const appointments = appointmentsResult.data || [];
      const total = appointments.length;
      const pending = appointments.filter(a => a.status === "pending" || a.status === "confirmed").length;
      const completed = appointments.filter(a => a.status === "completed").length;
      const revenue = appointments
        .filter(a => a.payment_status === "paid")
        .reduce((sum, a) => sum + (a.amount_cents || 0), 0);

      setStats({
        totalAppointments: total,
        pendingAppointments: pending,
        completedAppointments: completed,
        totalRevenue: revenue / 100,
      });

      setAvailableHours(hoursResult.data || []);
      setWeeklyAppointments(weeklyResult.data || []);
    } catch (error) {
      console.error("Error fetching stats:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Calculate slots per day
  const calculateSlotsForTimeRange = (startTime: string, endTime: string): number => {
    const [startHour, startMin] = startTime.split(":").map(Number);
    const [endHour, endMin] = endTime.split(":").map(Number);
    const startMinutes = startHour * 60 + startMin;
    const endMinutes = endHour * 60 + endMin;
    const duration = endMinutes - startMinutes;
    return Math.floor(duration / 60); // 60 min slots (50 min session + 10 min buffer)
  };

  const getDayAvailability = (): DayAvailability[] => {
    return DAYS_OF_WEEK.map(day => {
      const dayHours = availableHours.filter(h => h.day_of_week === day.value && h.is_active);
      const slotsCount = dayHours.reduce((total, hour) => {
        return total + calculateSlotsForTimeRange(hour.start_time, hour.end_time);
      }, 0);

      return {
        day: day.value,
        label: day.label,
        shortLabel: day.short,
        slotsCount,
        isActive: dayHours.length > 0,
      };
    });
  };

  // Calculate weekly occupancy data for chart
  const getWeeklyOccupancyData = (): OccupancyData[] => {
    const today = new Date();
    const weekStart = startOfWeek(today, { weekStartsOn: 0 });

    return DAYS_OF_WEEK.map((day, index) => {
      const currentDate = addDays(weekStart, index);
      const dateStr = format(currentDate, "yyyy-MM-dd");
      
      // Get available slots for this day of week
      const dayHours = availableHours.filter(h => h.day_of_week === day.value && h.is_active);
      const availableSlots = dayHours.reduce((total, hour) => {
        return total + calculateSlotsForTimeRange(hour.start_time, hour.end_time);
      }, 0);

      // Count booked appointments for this date
      const bookedSlots = weeklyAppointments.filter(a => a.appointment_date === dateStr).length;

      const occupancyRate = availableSlots > 0 ? Math.round((bookedSlots / availableSlots) * 100) : 0;

      return {
        day: day.short,
        fullDay: format(currentDate, "EEEE, dd/MM", { locale: ptBR }),
        available: availableSlots,
        booked: bookedSlots,
        occupancyRate,
      };
    });
  };

  const dayAvailability = getDayAvailability();
  const totalWeeklySlots = dayAvailability.reduce((total, day) => total + day.slotsCount, 0);
  const activeDays = dayAvailability.filter(d => d.isActive).length;
  const occupancyData = getWeeklyOccupancyData();
  const totalWeeklyBooked = occupancyData.reduce((total, day) => total + day.booked, 0);
  const weeklyOccupancyRate = totalWeeklySlots > 0 ? Math.round((totalWeeklyBooked / totalWeeklySlots) * 100) : 0;

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

  // Custom tooltip for the chart
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-[hsl(215,40%,15%)] border border-white/10 rounded-lg p-3 shadow-xl">
          <p className="text-white font-medium text-sm mb-2">{data.fullDay}</p>
          <div className="space-y-1">
            <p className="text-xs text-white/70">
              <span className="inline-block w-3 h-3 rounded-sm bg-primary mr-2" />
              Disponíveis: <span className="text-white font-medium">{data.available}</span>
            </p>
            <p className="text-xs text-white/70">
              <span className="inline-block w-3 h-3 rounded-sm bg-[hsl(145,70%,45%)] mr-2" />
              Agendados: <span className="text-white font-medium">{data.booked}</span>
            </p>
            <p className="text-xs text-white/70 mt-2 pt-2 border-t border-white/10">
              Taxa de ocupação: <span className="text-white font-bold">{data.occupancyRate}%</span>
            </p>
          </div>
        </div>
      );
    }
    return null;
  };

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

      {/* Weekly Occupancy Chart */}
      <div className="rounded-2xl bg-[hsl(215,40%,12%)] border border-white/5 p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[hsl(145,70%,45%)]/20 rounded-xl">
              <BarChart3 className="h-5 w-5 text-[hsl(145,70%,45%)]" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Ocupação da Semana</h3>
              <p className="text-sm text-white/50">
                {totalWeeklyBooked} de {totalWeeklySlots} slots agendados • {weeklyOccupancyRate}% ocupação
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4 text-xs">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-sm bg-primary" />
              <span className="text-white/60">Disponíveis</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-sm bg-[hsl(145,70%,45%)]" />
              <span className="text-white/60">Agendados</span>
            </div>
          </div>
        </div>

        {/* Chart */}
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={occupancyData} barGap={4}>
              <XAxis 
                dataKey="day" 
                axisLine={false}
                tickLine={false}
                tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 12 }}
              />
              <YAxis 
                axisLine={false}
                tickLine={false}
                tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 12 }}
                width={30}
              />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.05)' }} />
              <Bar 
                dataKey="available" 
                name="Disponíveis"
                radius={[4, 4, 0, 0]}
                fill="hsl(173, 58%, 39%)"
                opacity={0.4}
              />
              <Bar 
                dataKey="booked" 
                name="Agendados"
                radius={[4, 4, 0, 0]}
                fill="hsl(145, 70%, 45%)"
              >
                {occupancyData.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`}
                    fill={entry.occupancyRate >= 80 ? 'hsl(145, 70%, 45%)' : entry.occupancyRate >= 50 ? 'hsl(45, 100%, 55%)' : 'hsl(200, 80%, 50%)'}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Occupancy Summary */}
        <div className="grid grid-cols-7 gap-2 mt-4 pt-4 border-t border-white/5">
          {occupancyData.map((day, index) => (
            <div key={index} className="text-center">
              <div 
                className={`text-xs font-bold mb-1 ${
                  day.occupancyRate >= 80 ? 'text-[hsl(145,70%,45%)]' : 
                  day.occupancyRate >= 50 ? 'text-[hsl(45,100%,55%)]' : 
                  day.occupancyRate > 0 ? 'text-[hsl(200,80%,50%)]' : 'text-white/30'
                }`}
              >
                {day.occupancyRate}%
              </div>
              <div className="h-1 bg-white/10 rounded-full overflow-hidden">
                <div 
                  className={`h-full rounded-full ${
                    day.occupancyRate >= 80 ? 'bg-[hsl(145,70%,45%)]' : 
                    day.occupancyRate >= 50 ? 'bg-[hsl(45,100%,55%)]' : 
                    'bg-[hsl(200,80%,50%)]'
                  }`}
                  style={{ width: `${day.occupancyRate}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Weekly Availability Card */}
      <div className="rounded-2xl bg-[hsl(215,40%,12%)] border border-white/5 p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/20 rounded-xl">
              <CalendarClock className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Disponibilidade Semanal</h3>
              <p className="text-sm text-white/50">{activeDays} dias ativos • {totalWeeklySlots} slots/semana</p>
            </div>
          </div>
        </div>

        {/* Days Grid */}
        <div className="grid grid-cols-7 gap-2 mb-4">
          {dayAvailability.map((day) => (
            <div
              key={day.day}
              className={`relative text-center p-3 rounded-xl transition-all ${
                day.isActive
                  ? "bg-gradient-to-b from-primary/30 to-primary/10 border border-primary/30"
                  : "bg-white/5 border border-white/5"
              }`}
            >
              <p className={`text-xs font-medium mb-1 ${day.isActive ? "text-primary" : "text-white/40"}`}>
                {day.shortLabel}
              </p>
              <p className={`text-lg font-bold ${day.isActive ? "text-white" : "text-white/20"}`}>
                {day.slotsCount}
              </p>
              <p className={`text-[10px] ${day.isActive ? "text-white/60" : "text-white/20"}`}>
                slots
              </p>
              {day.isActive && (
                <div className="absolute -top-1 -right-1 w-2 h-2 bg-[hsl(145,70%,45%)] rounded-full" />
              )}
            </div>
          ))}
        </div>

        {/* Summary Bar */}
        <div className="flex items-center gap-2 p-3 rounded-xl bg-white/5">
          <div className="flex-1 h-2 bg-white/10 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-primary to-[hsl(145,70%,45%)] rounded-full transition-all"
              style={{ width: `${(activeDays / 7) * 100}%` }}
            />
          </div>
          <span className="text-xs text-white/60 whitespace-nowrap">
            {Math.round((activeDays / 7) * 100)}% da semana
          </span>
        </div>

        {totalWeeklySlots === 0 && (
          <p className="text-sm text-amber-400/80 mt-4 text-center">
            ⚠️ Configure seus horários na aba "Horários Disponíveis"
          </p>
        )}
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
