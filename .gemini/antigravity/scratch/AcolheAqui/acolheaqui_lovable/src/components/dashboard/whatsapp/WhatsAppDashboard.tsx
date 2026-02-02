import { useState, useEffect, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format, subDays, startOfDay, endOfDay } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";
import {
  CalendarIcon,
  FileText,
  Link2,
  Smartphone,
  TrendingUp,
  RefreshCw,
  Activity
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart,
} from "recharts";

interface WhatsAppDashboardProps {
  profileId: string;
  connections: any[];
}

interface DateRange {
  from: Date;
  to: Date;
}

export const WhatsAppDashboard = ({ profileId, connections }: WhatsAppDashboardProps) => {
  const [dateRange, setDateRange] = useState<DateRange>({
    from: subDays(new Date(), 30),
    to: new Date(),
  });
  const [dispatches, setDispatches] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    fetchData();
  }, [profileId, dateRange]);

  const fetchData = async () => {
    try {
      const { data, error } = await supabase
        .from("whatsapp_dispatches")
        .select("*")
        .eq("professional_id", profileId)
        .gte("created_at", startOfDay(dateRange.from).toISOString())
        .lte("created_at", endOfDay(dateRange.to).toISOString())
        .order("created_at", { ascending: true });

      if (error) throw error;
      setDispatches(data || []);
    } catch (error) {
      console.error("Error fetching dispatches:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchData();
    setIsRefreshing(false);
  };

  // Calculate KPIs
  const kpis = useMemo(() => {
    const totalDispatches = dispatches.reduce((acc, d) => acc + (d.sent_count || 0), 0);
    const activeConnections = connections.filter(c => c.status === "connected").length;
    const totalConnections = connections.length;
    const averagePerConnection = totalConnections > 0 
      ? Math.round(totalDispatches / totalConnections) 
      : 0;

    return {
      totalDispatches,
      activeConnections,
      totalConnections,
      averagePerConnection,
    };
  }, [dispatches, connections]);

  // Generate chart data
  const chartData = useMemo(() => {
    const dayMap = new Map<string, number>();
    
    dispatches.forEach(d => {
      const day = format(new Date(d.created_at), "dd/MM");
      dayMap.set(day, (dayMap.get(day) || 0) + (d.sent_count || 0));
    });

    // Fill in missing days
    const result = [];
    let currentDate = new Date(dateRange.from);
    while (currentDate <= dateRange.to) {
      const key = format(currentDate, "dd/MM");
      result.push({
        date: key,
        disparos: dayMap.get(key) || 0,
      });
      currentDate = new Date(currentDate.getTime() + 24 * 60 * 60 * 1000);
    }

    return result;
  }, [dispatches, dateRange]);

  const kpiCards = [
    {
      title: "DISPAROS",
      value: kpis.totalDispatches,
      change: "+0%",
      changeText: "vs período anterior",
      icon: FileText,
      color: "text-green-600",
      trend: "up"
    },
    {
      title: "CONEXÕES ATIVAS",
      value: kpis.activeConnections,
      change: "+0%",
      changeText: "vs período anterior",
      icon: Link2,
      color: "text-green-600",
      trend: "up"
    },
    {
      title: "TOTAL DE CONEXÕES",
      value: kpis.totalConnections,
      change: "+0%",
      changeText: "vs período anterior",
      icon: Smartphone,
      color: "text-green-600",
      trend: "up"
    },
    {
      title: "MÉDIA POR CONEXÃO",
      value: kpis.averagePerConnection,
      change: "+33.3%",
      changeText: "vs período anterior",
      icon: Activity,
      color: "text-green-600",
      trend: "up"
    },
  ];

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">
            Métricas e performance em tempo real
          </p>
        </div>
        <Button
          onClick={handleRefresh}
          disabled={isRefreshing}
          className="bg-green-500 hover:bg-green-600 text-white"
        >
          <RefreshCw className={cn("h-4 w-4 mr-2", isRefreshing && "animate-spin")} />
          Atualizar
        </Button>
      </div>

      {/* Date Filter */}
      <div className="flex items-center gap-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setDateRange({ from: subDays(new Date(), 30), to: new Date() })}
        >
          30 dias
        </Button>
        
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Data Inicial</span>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm" className="w-[140px]">
                <CalendarIcon className="h-4 w-4 mr-2" />
                {format(dateRange.from, "dd/MM/yyyy")}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={dateRange.from}
                onSelect={(date) => date && setDateRange(prev => ({ ...prev, from: date }))}
                locale={ptBR}
              />
            </PopoverContent>
          </Popover>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Data Final</span>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm" className="w-[140px]">
                <CalendarIcon className="h-4 w-4 mr-2" />
                {format(dateRange.to, "dd/MM/yyyy")}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={dateRange.to}
                onSelect={(date) => date && setDateRange(prev => ({ ...prev, to: date }))}
                locale={ptBR}
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpiCards.map((kpi, index) => {
          const Icon = kpi.icon;
          return (
            <Card key={index} className="border-t-4 border-t-green-500">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  {kpi.title}
                </CardTitle>
                <Icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-green-600">{kpi.value}</div>
                <p className="text-xs text-green-600 mt-1">
                  {kpi.change} <span className="text-muted-foreground">{kpi.changeText}</span>
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Disparos por Dia</CardTitle>
          <p className="text-sm text-muted-foreground">
            Evolução dos seus disparos ao longo do tempo
          </p>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorDisparos" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis 
                  dataKey="date" 
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis 
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="disparos"
                  stroke="#10b981"
                  strokeWidth={2}
                  fill="url(#colorDisparos)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
