import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Search,
  Loader2,
  Download,
  CreditCard,
  Banknote,
  Receipt,
} from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface Payment {
  id: string;
  subscription_id: string;
  professional_id: string;
  amount_cents: number;
  gateway: string;
  gateway_payment_id: string;
  payment_method: string;
  status: string;
  paid_at: string;
  created_at: string;
  profiles?: {
    full_name: string;
    email: string;
  };
}

const AdminPayments = () => {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterGateway, setFilterGateway] = useState<string>("all");

  useEffect(() => {
    fetchPayments();
  }, []);

  const fetchPayments = async () => {
    try {
      const { data, error } = await supabase
        .from("subscription_payments")
        .select(`
          *,
          profiles:professional_id (
            full_name,
            email
          )
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setPayments(data || []);
    } catch (error) {
      console.error("Error fetching payments:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredPayments = payments.filter(p => {
    const matchesSearch =
      p.profiles?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.profiles?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.gateway_payment_id?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === "all" || p.status === filterStatus;
    const matchesGateway = filterGateway === "all" || p.gateway === filterGateway;
    return matchesSearch && matchesStatus && matchesGateway;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "approved":
        return <Badge className="bg-green-500/20 text-green-400 border-green-500/30">Aprovado</Badge>;
      case "pending":
        return <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">Pendente</Badge>;
      case "rejected":
        return <Badge className="bg-red-500/20 text-red-400 border-red-500/30">Rejeitado</Badge>;
      case "refunded":
        return <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30">Reembolsado</Badge>;
      default:
        return <Badge className="bg-slate-500/20 text-slate-400 border-slate-500/30">{status}</Badge>;
    }
  };

  const getPaymentMethodIcon = (method: string) => {
    switch (method) {
      case "pix":
        return <Banknote className="w-4 h-4 text-green-400" />;
      case "card":
        return <CreditCard className="w-4 h-4 text-blue-400" />;
      default:
        return <Receipt className="w-4 h-4 text-slate-400" />;
    }
  };

  const formatCurrency = (cents: number) => {
    return (cents / 100).toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
  };

  const totalApproved = filteredPayments
    .filter(p => p.status === "approved")
    .reduce((acc, p) => acc + p.amount_cents, 0);

  const totalPending = filteredPayments
    .filter(p => p.status === "pending")
    .reduce((acc, p) => acc + p.amount_cents, 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-white">Pagamentos</h1>
          <p className="text-slate-400 mt-1">Histórico de pagamentos das assinaturas</p>
        </div>
        <Button variant="outline" className="border-slate-700 text-slate-300 hover:bg-slate-700">
          <Download className="mr-2 h-4 w-4" />
          Exportar
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="bg-slate-800/50 border-slate-700">
          <CardContent className="p-4">
            <p className="text-sm text-slate-400">Total Aprovado</p>
            <p className="text-2xl font-bold text-green-400">{formatCurrency(totalApproved)}</p>
          </CardContent>
        </Card>
        <Card className="bg-slate-800/50 border-slate-700">
          <CardContent className="p-4">
            <p className="text-sm text-slate-400">Pendente</p>
            <p className="text-2xl font-bold text-yellow-400">{formatCurrency(totalPending)}</p>
          </CardContent>
        </Card>
        <Card className="bg-slate-800/50 border-slate-700">
          <CardContent className="p-4">
            <p className="text-sm text-slate-400">Total de Transações</p>
            <p className="text-2xl font-bold text-white">{filteredPayments.length}</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <Input
            placeholder="Buscar por nome, email ou ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 bg-input border-border text-foreground placeholder:text-muted-foreground"
          />
        </div>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-40 bg-input border-border text-foreground">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent className="bg-card border-border">
            <SelectItem value="all">Todos os status</SelectItem>
            <SelectItem value="approved">Aprovado</SelectItem>
            <SelectItem value="pending">Pendente</SelectItem>
            <SelectItem value="rejected">Rejeitado</SelectItem>
            <SelectItem value="refunded">Reembolsado</SelectItem>
          </SelectContent>
        </Select>
        <Select value={filterGateway} onValueChange={setFilterGateway}>
          <SelectTrigger className="w-40 bg-input border-border text-foreground">
            <SelectValue placeholder="Gateway" />
          </SelectTrigger>
          <SelectContent className="bg-card border-border">
            <SelectItem value="all">Todos os gateways</SelectItem>
            <SelectItem value="stripe">Stripe</SelectItem>
            <SelectItem value="mercadopago">Mercado Pago</SelectItem>
            <SelectItem value="asaas">Asaas</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card className="bg-slate-800/50 border-slate-700">
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-slate-700 hover:bg-transparent">
                    <TableHead className="text-slate-400">Profissional</TableHead>
                    <TableHead className="text-slate-400">Valor</TableHead>
                    <TableHead className="text-slate-400 hidden md:table-cell">Método</TableHead>
                    <TableHead className="text-slate-400 hidden md:table-cell">Gateway</TableHead>
                    <TableHead className="text-slate-400">Status</TableHead>
                    <TableHead className="text-slate-400 hidden lg:table-cell">Data</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPayments.map((payment) => (
                    <TableRow key={payment.id} className="border-slate-700 hover:bg-slate-700/30">
                      <TableCell>
                        <div>
                          <p className="font-medium text-white">
                            {payment.profiles?.full_name || "Sem nome"}
                          </p>
                          <p className="text-sm text-slate-400">
                            {payment.profiles?.email}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell className="font-medium text-white">
                        {formatCurrency(payment.amount_cents)}
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        <div className="flex items-center gap-2 text-slate-300 capitalize">
                          {getPaymentMethodIcon(payment.payment_method)}
                          {payment.payment_method || "-"}
                        </div>
                      </TableCell>
                      <TableCell className="hidden md:table-cell text-slate-400 capitalize">
                        {payment.gateway || "-"}
                      </TableCell>
                      <TableCell>{getStatusBadge(payment.status)}</TableCell>
                      <TableCell className="hidden lg:table-cell text-slate-400 text-sm">
                        {format(new Date(payment.created_at), "dd/MM/yyyy HH:mm", { locale: ptBR })}
                      </TableCell>
                    </TableRow>
                  ))}
                  {filteredPayments.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-12 text-slate-400">
                        Nenhum pagamento encontrado
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminPayments;
