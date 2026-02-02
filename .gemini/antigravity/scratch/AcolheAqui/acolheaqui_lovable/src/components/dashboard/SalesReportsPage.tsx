import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
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
  LineChart,
  Line,
  Legend,
} from "recharts";
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Calendar,
  CreditCard,
  Loader2,
  Download,
  FileSpreadsheet,
  FileText,
  Filter,
  BarChart3,
  PieChartIcon,
  Activity,
  Users,
  ShoppingBag,
  Clock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
  format,
  subDays,
  subMonths,
  startOfDay,
  endOfDay,
  parseISO,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  eachWeekOfInterval,
  eachMonthOfInterval,
  isWithinInterval,
} from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface SalesReportsPageProps {
  profileId: string;
}

interface Transaction {
  id: string;
  customer_name: string;
  customer_email: string;
  amount_cents: number;
  payment_method: string;
  payment_status: string;
  gateway: string;
  created_at: string;
  services?: { name: string } | null;
}

type PeriodType = "7d" | "30d" | "90d" | "12m" | "custom";
type ChartType = "area" | "bar" | "line";

const SalesReportsPage = ({ profileId }: SalesReportsPageProps) => {
  const [isLoading, setIsLoading] = useState(true);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [period, setPeriod] = useState<PeriodType>("30d");
  const [customStartDate, setCustomStartDate] = useState("");
  const [customEndDate, setCustomEndDate] = useState("");
  const [chartType, setChartType] = useState<ChartType>("area");
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    fetchTransactions();
  }, [profileId, period, customStartDate, customEndDate]);

  const getDateRange = () => {
    const now = new Date();
    switch (period) {
      case "7d":
        return { start: subDays(now, 7), end: now };
      case "30d":
        return { start: subDays(now, 30), end: now };
      case "90d":
        return { start: subDays(now, 90), end: now };
      case "12m":
        return { start: subMonths(now, 12), end: now };
      case "custom":
        return {
          start: customStartDate ? parseISO(customStartDate) : subDays(now, 30),
          end: customEndDate ? parseISO(customEndDate) : now,
        };
      default:
        return { start: subDays(now, 30), end: now };
    }
  };

  const fetchTransactions = async () => {
    setIsLoading(true);
    try {
      const { start, end } = getDateRange();

      const { data, error } = await supabase
        .from("transactions")
        .select(`*, services:service_id (name)`)
        .eq("professional_id", profileId)
        .gte("created_at", startOfDay(start).toISOString())
        .lte("created_at", endOfDay(end).toISOString())
        .order("created_at", { ascending: true });

      if (error) throw error;
      setTransactions(data || []);
    } catch (error) {
      console.error("Error fetching transactions:", error);
      toast.error("Erro ao carregar dados");
    } finally {
      setIsLoading(false);
    }
  };

  const formatCurrency = (value: number) => {
    return value.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
  };

  // Calculate statistics
  const approvedTransactions = transactions.filter((t) =>
    ["approved", "paid"].includes(t.payment_status)
  );
  const totalRevenue = approvedTransactions.reduce(
    (sum, t) => sum + t.amount_cents,
    0
  ) / 100;
  const totalTransactions = transactions.length;
  const approvedCount = approvedTransactions.length;
  const pendingCount = transactions.filter(
    (t) => t.payment_status === "pending"
  ).length;
  const rejectedCount = transactions.filter((t) =>
    ["rejected", "cancelled"].includes(t.payment_status)
  ).length;
  const conversionRate =
    totalTransactions > 0 ? (approvedCount / totalTransactions) * 100 : 0;
  const averageTicket = approvedCount > 0 ? totalRevenue / approvedCount : 0;

  // Time series data
  const getTimeSeriesData = () => {
    const { start, end } = getDateRange();
    const daysDiff = Math.ceil(
      (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)
    );

    let intervals: Date[];
    let formatStr: string;
    let groupBy: "day" | "week" | "month";

    if (daysDiff <= 14) {
      intervals = eachDayOfInterval({ start, end });
      formatStr = "dd/MM";
      groupBy = "day";
    } else if (daysDiff <= 90) {
      intervals = eachWeekOfInterval({ start, end });
      formatStr = "dd/MM";
      groupBy = "week";
    } else {
      intervals = eachMonthOfInterval({ start, end });
      formatStr = "MMM/yy";
      groupBy = "month";
    }

    return intervals.map((date) => {
      let intervalStart: Date;
      let intervalEnd: Date;

      if (groupBy === "day") {
        intervalStart = startOfDay(date);
        intervalEnd = endOfDay(date);
      } else if (groupBy === "week") {
        intervalStart = startOfWeek(date, { weekStartsOn: 1 });
        intervalEnd = endOfWeek(date, { weekStartsOn: 1 });
      } else {
        intervalStart = startOfMonth(date);
        intervalEnd = endOfMonth(date);
      }

      const periodTransactions = approvedTransactions.filter((t) => {
        const tDate = parseISO(t.created_at);
        return isWithinInterval(tDate, { start: intervalStart, end: intervalEnd });
      });

      const revenue =
        periodTransactions.reduce((sum, t) => sum + t.amount_cents, 0) / 100;
      const count = periodTransactions.length;

      return {
        date: format(date, formatStr, { locale: ptBR }),
        revenue,
        transactions: count,
        average: count > 0 ? revenue / count : 0,
      };
    });
  };

  // Payment methods breakdown
  const getPaymentMethodsData = () => {
    const methodCounts: Record<string, { count: number; revenue: number }> = {};

    approvedTransactions.forEach((t) => {
      const method = t.payment_method;
      if (!methodCounts[method]) {
        methodCounts[method] = { count: 0, revenue: 0 };
      }
      methodCounts[method].count++;
      methodCounts[method].revenue += t.amount_cents / 100;
    });

    const colors = [
      "hsl(262, 83%, 58%)",
      "hsl(145, 70%, 45%)",
      "hsl(200, 80%, 50%)",
      "hsl(45, 100%, 55%)",
    ];

    return Object.entries(methodCounts).map(([method, data], index) => ({
      name:
        method === "pix"
          ? "PIX"
          : method === "credit_card"
          ? "Cartão"
          : method === "boleto"
          ? "Boleto"
          : method,
      count: data.count,
      revenue: data.revenue,
      color: colors[index % colors.length],
    }));
  };

  // Gateway breakdown
  const getGatewayData = () => {
    const gatewayCounts: Record<string, { count: number; revenue: number }> = {};

    approvedTransactions.forEach((t) => {
      const gateway = t.gateway;
      if (!gatewayCounts[gateway]) {
        gatewayCounts[gateway] = { count: 0, revenue: 0 };
      }
      gatewayCounts[gateway].count++;
      gatewayCounts[gateway].revenue += t.amount_cents / 100;
    });

    const colors = [
      "hsl(200, 80%, 50%)",
      "hsl(262, 83%, 58%)",
      "hsl(145, 70%, 45%)",
      "hsl(45, 100%, 55%)",
    ];

    return Object.entries(gatewayCounts).map(([gateway, data], index) => ({
      name: gateway.charAt(0).toUpperCase() + gateway.slice(1),
      count: data.count,
      revenue: data.revenue,
      color: colors[index % colors.length],
    }));
  };

  // Status breakdown
  const getStatusData = () => {
    return [
      { name: "Aprovadas", value: approvedCount, color: "hsl(145, 70%, 45%)" },
      { name: "Pendentes", value: pendingCount, color: "hsl(45, 100%, 55%)" },
      { name: "Rejeitadas", value: rejectedCount, color: "hsl(0, 70%, 55%)" },
    ].filter((d) => d.value > 0);
  };

  // Export functions
  const exportToCSV = () => {
    const headers = [
      "Data",
      "Cliente",
      "Email",
      "Valor",
      "Método",
      "Status",
      "Gateway",
      "Serviço",
    ];
    const rows = transactions.map((t) => [
      format(parseISO(t.created_at), "dd/MM/yyyy HH:mm", { locale: ptBR }),
      t.customer_name,
      t.customer_email,
      formatCurrency(t.amount_cents / 100),
      t.payment_method === "pix"
        ? "PIX"
        : t.payment_method === "credit_card"
        ? "Cartão"
        : t.payment_method,
      t.payment_status,
      t.gateway,
      t.services?.name || "-",
    ]);

    const csvContent = [headers.join(";"), ...rows.map((row) => row.join(";"))].join(
      "\n"
    );

    const blob = new Blob(["\uFEFF" + csvContent], {
      type: "text/csv;charset=utf-8;",
    });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `relatorio-vendas-${format(new Date(), "yyyy-MM-dd")}.csv`;
    link.click();

    toast.success("Relatório exportado com sucesso!");
  };

  const exportToPDF = () => {
    const { start, end } = getDateRange();
    const timeSeriesData = getTimeSeriesData();
    const paymentMethods = getPaymentMethodsData();

    const printContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Relatório de Vendas</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 40px; color: #333; }
          h1 { color: #7c3aed; margin-bottom: 10px; }
          h2 { color: #666; font-size: 14px; font-weight: normal; margin-bottom: 30px; }
          h3 { color: #333; font-size: 16px; margin-top: 30px; margin-bottom: 15px; }
          .stats { display: flex; gap: 20px; margin-bottom: 30px; flex-wrap: wrap; }
          .stat-card { background: #f5f5f5; padding: 20px; border-radius: 12px; min-width: 150px; flex: 1; }
          .stat-title { font-size: 12px; color: #666; margin-bottom: 5px; }
          .stat-value { font-size: 24px; font-weight: bold; color: #333; }
          table { width: 100%; border-collapse: collapse; margin-top: 20px; }
          th, td { padding: 12px; text-align: left; border-bottom: 1px solid #eee; }
          th { background: #f5f5f5; font-weight: 600; }
          .footer { margin-top: 40px; font-size: 12px; color: #999; text-align: center; }
        </style>
      </head>
      <body>
        <h1>Relatório de Vendas</h1>
        <h2>Período: ${format(start, "dd/MM/yyyy", { locale: ptBR })} - ${format(
      end,
      "dd/MM/yyyy",
      { locale: ptBR }
    )} • Gerado em ${format(new Date(), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}</h2>
        
        <div class="stats">
          <div class="stat-card">
            <div class="stat-title">Receita Total</div>
            <div class="stat-value">${formatCurrency(totalRevenue)}</div>
          </div>
          <div class="stat-card">
            <div class="stat-title">Total de Transações</div>
            <div class="stat-value">${totalTransactions}</div>
          </div>
          <div class="stat-card">
            <div class="stat-title">Taxa de Conversão</div>
            <div class="stat-value">${conversionRate.toFixed(1)}%</div>
          </div>
          <div class="stat-card">
            <div class="stat-title">Ticket Médio</div>
            <div class="stat-value">${formatCurrency(averageTicket)}</div>
          </div>
        </div>

        <h3>Resumo por Período</h3>
        <table>
          <thead>
            <tr>
              <th>Período</th>
              <th>Transações</th>
              <th>Receita</th>
              <th>Ticket Médio</th>
            </tr>
          </thead>
          <tbody>
            ${timeSeriesData
              .map(
                (d) => `
              <tr>
                <td>${d.date}</td>
                <td>${d.transactions}</td>
                <td>${formatCurrency(d.revenue)}</td>
                <td>${formatCurrency(d.average)}</td>
              </tr>
            `
              )
              .join("")}
          </tbody>
        </table>

        <h3>Por Método de Pagamento</h3>
        <table>
          <thead>
            <tr>
              <th>Método</th>
              <th>Transações</th>
              <th>Receita</th>
            </tr>
          </thead>
          <tbody>
            ${paymentMethods
              .map(
                (m) => `
              <tr>
                <td>${m.name}</td>
                <td>${m.count}</td>
                <td>${formatCurrency(m.revenue)}</td>
              </tr>
            `
              )
              .join("")}
          </tbody>
        </table>

        <h3>Transações Detalhadas</h3>
        <table>
          <thead>
            <tr>
              <th>Data</th>
              <th>Cliente</th>
              <th>Valor</th>
              <th>Método</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            ${transactions
              .map(
                (t) => `
              <tr>
                <td>${format(parseISO(t.created_at), "dd/MM/yyyy HH:mm")}</td>
                <td>${t.customer_name}</td>
                <td>${formatCurrency(t.amount_cents / 100)}</td>
                <td>${
                  t.payment_method === "pix"
                    ? "PIX"
                    : t.payment_method === "credit_card"
                    ? "Cartão"
                    : t.payment_method
                }</td>
                <td>${t.payment_status}</td>
              </tr>
            `
              )
              .join("")}
          </tbody>
        </table>

        <div class="footer">
          AcolheAqui • Plataforma para Profissionais de Saúde Mental
        </div>
      </body>
      </html>
    `;

    const printWindow = window.open("", "_blank");
    if (printWindow) {
      printWindow.document.write(printContent);
      printWindow.document.close();
      printWindow.print();
    }

    toast.success("PDF gerado com sucesso!");
  };

  const timeSeriesData = getTimeSeriesData();
  const paymentMethodsData = getPaymentMethodsData();
  const gatewayData = getGatewayData();
  const statusData = getStatusData();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const renderChart = () => {
    switch (chartType) {
      case "bar":
        return (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={timeSeriesData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis
                dataKey="date"
                stroke="hsl(var(--muted-foreground))"
                tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
              />
              <YAxis
                stroke="hsl(var(--muted-foreground))"
                tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
                tickFormatter={(value) => `R$${value}`}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "12px",
                }}
                formatter={(value: number, name: string) => [
                  name === "revenue"
                    ? formatCurrency(value)
                    : value,
                  name === "revenue" ? "Receita" : "Transações",
                ]}
              />
              <Bar
                dataKey="revenue"
                fill="hsl(var(--primary))"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        );
      case "line":
        return (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={timeSeriesData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis
                dataKey="date"
                stroke="hsl(var(--muted-foreground))"
                tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
              />
              <YAxis
                yAxisId="left"
                stroke="hsl(var(--muted-foreground))"
                tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
                tickFormatter={(value) => `R$${value}`}
              />
              <YAxis
                yAxisId="right"
                orientation="right"
                stroke="hsl(var(--muted-foreground))"
                tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "12px",
                }}
              />
              <Legend />
              <Line
                yAxisId="left"
                type="monotone"
                dataKey="revenue"
                name="Receita"
                stroke="hsl(var(--primary))"
                strokeWidth={2}
                dot={{ fill: "hsl(var(--primary))" }}
              />
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="transactions"
                name="Transações"
                stroke="hsl(145, 70%, 45%)"
                strokeWidth={2}
                dot={{ fill: "hsl(145, 70%, 45%)" }}
              />
            </LineChart>
          </ResponsiveContainer>
        );
      default:
        return (
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={timeSeriesData}>
              <defs>
                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="5%"
                    stopColor="hsl(var(--primary))"
                    stopOpacity={0.4}
                  />
                  <stop
                    offset="95%"
                    stopColor="hsl(var(--primary))"
                    stopOpacity={0}
                  />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis
                dataKey="date"
                stroke="hsl(var(--muted-foreground))"
                tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
              />
              <YAxis
                stroke="hsl(var(--muted-foreground))"
                tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
                tickFormatter={(value) => `R$${value}`}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "12px",
                }}
                formatter={(value: number) => [formatCurrency(value), "Receita"]}
              />
              <Area
                type="monotone"
                dataKey="revenue"
                stroke="hsl(var(--primary))"
                strokeWidth={3}
                fillOpacity={1}
                fill="url(#colorRevenue)"
              />
            </AreaChart>
          </ResponsiveContainer>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Header with filters */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-foreground">
            Relatórios de Vendas
          </h2>
          <p className="text-muted-foreground">
            Análise detalhada das suas vendas
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Select value={period} onValueChange={(v) => setPeriod(v as PeriodType)}>
            <SelectTrigger className="w-36">
              <SelectValue placeholder="Período" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Últimos 7 dias</SelectItem>
              <SelectItem value="30d">Últimos 30 dias</SelectItem>
              <SelectItem value="90d">Últimos 90 dias</SelectItem>
              <SelectItem value="12m">Últimos 12 meses</SelectItem>
              <SelectItem value="custom">Personalizado</SelectItem>
            </SelectContent>
          </Select>

          {period === "custom" && (
            <div className="flex items-center gap-2">
              <Input
                type="date"
                value={customStartDate}
                onChange={(e) => setCustomStartDate(e.target.value)}
                className="w-36"
              />
              <span className="text-muted-foreground">até</span>
              <Input
                type="date"
                value={customEndDate}
                onChange={(e) => setCustomEndDate(e.target.value)}
                className="w-36"
              />
            </div>
          )}

          <Button variant="outline" size="sm" onClick={exportToCSV}>
            <FileSpreadsheet className="h-4 w-4 mr-2" />
            Excel
          </Button>
          <Button variant="outline" size="sm" onClick={exportToPDF}>
            <FileText className="h-4 w-4 mr-2" />
            PDF
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl bg-gradient-to-br from-[hsl(262,83%,58%)] to-[hsl(262,83%,45%)] p-6 shadow-[0_8px_30px_hsl(262,83%,58%,0.3)]">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-white/80">Receita Total</p>
              <p className="text-2xl font-bold text-white mt-2">
                {formatCurrency(totalRevenue)}
              </p>
            </div>
            <div className="p-2 bg-white/20 rounded-xl">
              <DollarSign className="h-5 w-5 text-white" />
            </div>
          </div>
        </div>

        <div className="rounded-2xl bg-gradient-to-br from-[hsl(145,70%,45%)] to-[hsl(145,70%,30%)] p-6 shadow-[0_8px_30px_hsl(145,70%,45%,0.3)]">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-white/80">
                Taxa de Conversão
              </p>
              <p className="text-2xl font-bold text-white mt-2">
                {conversionRate.toFixed(1)}%
              </p>
            </div>
            <div className="p-2 bg-white/20 rounded-xl">
              <TrendingUp className="h-5 w-5 text-white" />
            </div>
          </div>
        </div>

        <div className="rounded-2xl bg-gradient-to-br from-[hsl(200,80%,50%)] to-[hsl(200,80%,35%)] p-6 shadow-[0_8px_30px_hsl(200,80%,50%,0.3)]">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-white/80">
                Total Transações
              </p>
              <p className="text-2xl font-bold text-white mt-2">
                {totalTransactions}
              </p>
            </div>
            <div className="p-2 bg-white/20 rounded-xl">
              <ShoppingBag className="h-5 w-5 text-white" />
            </div>
          </div>
        </div>

        <div className="rounded-2xl bg-gradient-to-br from-[hsl(45,100%,55%)] to-[hsl(35,100%,45%)] p-6 shadow-[0_8px_30px_hsl(45,100%,55%,0.3)]">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-white/80">Ticket Médio</p>
              <p className="text-2xl font-bold text-white mt-2">
                {formatCurrency(averageTicket)}
              </p>
            </div>
            <div className="p-2 bg-white/20 rounded-xl">
              <Activity className="h-5 w-5 text-white" />
            </div>
          </div>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-muted/50">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4" />
            Visão Geral
          </TabsTrigger>
          <TabsTrigger value="breakdown" className="flex items-center gap-2">
            <PieChartIcon className="w-4 h-4" />
            Detalhamento
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-6 space-y-6">
          {/* Revenue Chart */}
          <div className="rounded-2xl bg-card border border-border/50 p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-foreground">
                Receita por Período
              </h3>
              <div className="flex items-center gap-2">
                <Button
                  variant={chartType === "area" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setChartType("area")}
                >
                  Área
                </Button>
                <Button
                  variant={chartType === "bar" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setChartType("bar")}
                >
                  Barras
                </Button>
                <Button
                  variant={chartType === "line" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setChartType("line")}
                >
                  Linhas
                </Button>
              </div>
            </div>

            {timeSeriesData.some((d) => d.revenue > 0) ? (
              renderChart()
            ) : (
              <div className="flex flex-col items-center justify-center h-[300px] text-muted-foreground">
                <TrendingUp className="h-12 w-12 mb-4 opacity-30" />
                <p>Nenhum dado no período selecionado</p>
              </div>
            )}
          </div>

          {/* Status breakdown */}
          <div className="grid gap-6 lg:grid-cols-2">
            <div className="rounded-2xl bg-card border border-border/50 p-6">
              <h3 className="text-lg font-bold text-foreground mb-6">
                Status das Transações
              </h3>
              {statusData.length > 0 ? (
                <>
                  <ResponsiveContainer width="100%" height={200}>
                    <PieChart>
                      <Pie
                        data={statusData}
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {statusData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "hsl(var(--card))",
                          border: "1px solid hsl(var(--border))",
                          borderRadius: "12px",
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="space-y-2 mt-4">
                    {statusData.map((status, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between"
                      >
                        <div className="flex items-center gap-2">
                          <div
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: status.color }}
                          />
                          <span className="text-sm text-muted-foreground">
                            {status.name}
                          </span>
                        </div>
                        <span className="text-sm font-medium text-foreground">
                          {status.value}
                        </span>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center justify-center h-[260px] text-muted-foreground">
                  <Clock className="h-12 w-12 mb-4 opacity-30" />
                  <p>Sem transações</p>
                </div>
              )}
            </div>

            <div className="rounded-2xl bg-card border border-border/50 p-6">
              <h3 className="text-lg font-bold text-foreground mb-6">
                Métodos de Pagamento
              </h3>
              {paymentMethodsData.length > 0 ? (
                <>
                  <ResponsiveContainer width="100%" height={200}>
                    <BarChart
                      data={paymentMethodsData}
                      layout="vertical"
                      margin={{ left: 20 }}
                    >
                      <CartesianGrid
                        strokeDasharray="3 3"
                        stroke="hsl(var(--border))"
                      />
                      <XAxis
                        type="number"
                        stroke="hsl(var(--muted-foreground))"
                        tickFormatter={(value) => `R$${value}`}
                      />
                      <YAxis
                        type="category"
                        dataKey="name"
                        stroke="hsl(var(--muted-foreground))"
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "hsl(var(--card))",
                          border: "1px solid hsl(var(--border))",
                          borderRadius: "12px",
                        }}
                        formatter={(value: number) => [
                          formatCurrency(value),
                          "Receita",
                        ]}
                      />
                      <Bar dataKey="revenue" radius={[0, 4, 4, 0]}>
                        {paymentMethodsData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </>
              ) : (
                <div className="flex flex-col items-center justify-center h-[260px] text-muted-foreground">
                  <CreditCard className="h-12 w-12 mb-4 opacity-30" />
                  <p>Sem dados de pagamento</p>
                </div>
              )}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="breakdown" className="mt-6 space-y-6">
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Gateway breakdown */}
            <div className="rounded-2xl bg-card border border-border/50 p-6">
              <h3 className="text-lg font-bold text-foreground mb-6">
                Por Gateway
              </h3>
              {gatewayData.length > 0 ? (
                <>
                  <ResponsiveContainer width="100%" height={200}>
                    <PieChart>
                      <Pie
                        data={gatewayData}
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="revenue"
                      >
                        {gatewayData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "hsl(var(--card))",
                          border: "1px solid hsl(var(--border))",
                          borderRadius: "12px",
                        }}
                        formatter={(value: number) => [
                          formatCurrency(value),
                          "Receita",
                        ]}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="space-y-2 mt-4">
                    {gatewayData.map((gateway, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between"
                      >
                        <div className="flex items-center gap-2">
                          <div
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: gateway.color }}
                          />
                          <span className="text-sm text-muted-foreground">
                            {gateway.name}
                          </span>
                        </div>
                        <div className="text-right">
                          <span className="text-sm font-medium text-foreground">
                            {formatCurrency(gateway.revenue)}
                          </span>
                          <span className="text-xs text-muted-foreground ml-2">
                            ({gateway.count} vendas)
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center justify-center h-[260px] text-muted-foreground">
                  <Activity className="h-12 w-12 mb-4 opacity-30" />
                  <p>Sem dados de gateway</p>
                </div>
              )}
            </div>

            {/* Revenue table by period */}
            <div className="rounded-2xl bg-card border border-border/50 p-6">
              <h3 className="text-lg font-bold text-foreground mb-6">
                Resumo por Período
              </h3>
              <div className="overflow-x-auto max-h-[300px]">
                <table className="w-full">
                  <thead className="sticky top-0 bg-card">
                    <tr className="border-b border-border">
                      <th className="text-left py-2 px-2 text-sm font-medium text-muted-foreground">
                        Período
                      </th>
                      <th className="text-right py-2 px-2 text-sm font-medium text-muted-foreground">
                        Vendas
                      </th>
                      <th className="text-right py-2 px-2 text-sm font-medium text-muted-foreground">
                        Receita
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {timeSeriesData.map((row, index) => (
                      <tr
                        key={index}
                        className="border-b border-border/50 hover:bg-muted/30"
                      >
                        <td className="py-2 px-2 text-sm text-foreground">
                          {row.date}
                        </td>
                        <td className="py-2 px-2 text-sm text-right text-muted-foreground">
                          {row.transactions}
                        </td>
                        <td className="py-2 px-2 text-sm text-right font-medium text-foreground">
                          {formatCurrency(row.revenue)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SalesReportsPage;
