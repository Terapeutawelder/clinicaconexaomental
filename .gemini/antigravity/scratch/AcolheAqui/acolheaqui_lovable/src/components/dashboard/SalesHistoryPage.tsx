import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { 
  DollarSign, 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  Search,
  Filter,
  RefreshCw,
  CreditCard,
  QrCode,
  FileText,
  Eye,
  TrendingUp,
  TrendingDown,
  Loader2
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";

interface Transaction {
  id: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string | null;
  customer_cpf: string | null;
  amount_cents: number;
  payment_method: string;
  payment_status: string;
  gateway: string;
  gateway_payment_id: string | null;
  pix_qr_code: string | null;
  pix_code: string | null;
  created_at: string;
  service_id: string | null;
  services?: {
    name: string;
  } | null;
}

interface SalesHistoryPageProps {
  profileId: string;
}

const SalesHistoryPage = ({ profileId }: SalesHistoryPageProps) => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [methodFilter, setMethodFilter] = useState<string>("all");
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    fetchTransactions();
  }, [profileId]);

  const fetchTransactions = async () => {
    try {
      const { data, error } = await supabase
        .from("transactions")
        .select(`
          *,
          services:service_id (name)
        `)
        .eq("professional_id", profileId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setTransactions(data || []);
    } catch (error) {
      console.error("Error fetching transactions:", error);
      toast.error("Erro ao carregar transações");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchTransactions();
    setIsRefreshing(false);
    toast.success("Transações atualizadas");
  };

  const formatPrice = (cents: number) => {
    return (cents / 100).toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusInfo = (status: string) => {
    const statusMap: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
      pending: { label: "Pendente", color: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30", icon: <Clock className="w-3 h-3" /> },
      approved: { label: "Aprovado", color: "bg-green-500/20 text-green-400 border-green-500/30", icon: <CheckCircle className="w-3 h-3" /> },
      paid: { label: "Pago", color: "bg-green-500/20 text-green-400 border-green-500/30", icon: <CheckCircle className="w-3 h-3" /> },
      rejected: { label: "Rejeitado", color: "bg-red-500/20 text-red-400 border-red-500/30", icon: <XCircle className="w-3 h-3" /> },
      cancelled: { label: "Cancelado", color: "bg-gray-500/20 text-gray-400 border-gray-500/30", icon: <XCircle className="w-3 h-3" /> },
      refunded: { label: "Reembolsado", color: "bg-blue-500/20 text-blue-400 border-blue-500/30", icon: <AlertCircle className="w-3 h-3" /> },
      in_process: { label: "Em Processamento", color: "bg-blue-500/20 text-blue-400 border-blue-500/30", icon: <Clock className="w-3 h-3" /> },
    };
    return statusMap[status] || { label: status, color: "bg-gray-500/20 text-gray-400 border-gray-500/30", icon: <AlertCircle className="w-3 h-3" /> };
  };

  const getPaymentMethodInfo = (method: string) => {
    const methodMap: Record<string, { label: string; icon: React.ReactNode }> = {
      pix: { label: "PIX", icon: <QrCode className="w-4 h-4" /> },
      credit_card: { label: "Cartão de Crédito", icon: <CreditCard className="w-4 h-4" /> },
      boleto: { label: "Boleto", icon: <FileText className="w-4 h-4" /> },
    };
    return methodMap[method] || { label: method, icon: <DollarSign className="w-4 h-4" /> };
  };

  const filteredTransactions = transactions.filter((transaction) => {
    const matchesSearch = 
      transaction.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.customer_email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (transaction.gateway_payment_id && transaction.gateway_payment_id.includes(searchTerm));
    
    const matchesStatus = statusFilter === "all" || transaction.payment_status === statusFilter;
    const matchesMethod = methodFilter === "all" || transaction.payment_method === methodFilter;

    return matchesSearch && matchesStatus && matchesMethod;
  });

  // Calculate stats
  const totalSales = transactions.filter(t => ["approved", "paid"].includes(t.payment_status)).reduce((sum, t) => sum + t.amount_cents, 0);
  const pendingSales = transactions.filter(t => t.payment_status === "pending").reduce((sum, t) => sum + t.amount_cents, 0);
  const approvedCount = transactions.filter(t => ["approved", "paid"].includes(t.payment_status)).length;
  const conversionRate = transactions.length > 0 ? (approvedCount / transactions.length) * 100 : 0;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-card rounded-xl p-5 border border-border/50">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total Vendido</p>
              <p className="text-2xl font-bold text-foreground mt-1">{formatPrice(totalSales)}</p>
            </div>
            <div className="p-3 rounded-xl bg-green-500/10">
              <TrendingUp className="w-6 h-6 text-green-500" />
            </div>
          </div>
        </div>

        <div className="bg-card rounded-xl p-5 border border-border/50">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Vendas Pendentes</p>
              <p className="text-2xl font-bold text-foreground mt-1">{formatPrice(pendingSales)}</p>
            </div>
            <div className="p-3 rounded-xl bg-yellow-500/10">
              <Clock className="w-6 h-6 text-yellow-500" />
            </div>
          </div>
        </div>

        <div className="bg-card rounded-xl p-5 border border-border/50">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Transações Aprovadas</p>
              <p className="text-2xl font-bold text-foreground mt-1">{approvedCount}</p>
            </div>
            <div className="p-3 rounded-xl bg-primary/10">
              <CheckCircle className="w-6 h-6 text-primary" />
            </div>
          </div>
        </div>

        <div className="bg-card rounded-xl p-5 border border-border/50">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Taxa de Conversão</p>
              <p className="text-2xl font-bold text-foreground mt-1">{conversionRate.toFixed(1)}%</p>
            </div>
            <div className="p-3 rounded-xl bg-blue-500/10">
              <TrendingUp className="w-6 h-6 text-blue-500" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-card rounded-xl p-4 border border-border/50">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por nome, e-mail ou ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full md:w-48">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os status</SelectItem>
              <SelectItem value="pending">Pendente</SelectItem>
              <SelectItem value="approved">Aprovado</SelectItem>
              <SelectItem value="paid">Pago</SelectItem>
              <SelectItem value="rejected">Rejeitado</SelectItem>
              <SelectItem value="cancelled">Cancelado</SelectItem>
              <SelectItem value="refunded">Reembolsado</SelectItem>
            </SelectContent>
          </Select>
          <Select value={methodFilter} onValueChange={setMethodFilter}>
            <SelectTrigger className="w-full md:w-48">
              <SelectValue placeholder="Método" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os métodos</SelectItem>
              <SelectItem value="pix">PIX</SelectItem>
              <SelectItem value="credit_card">Cartão</SelectItem>
              <SelectItem value="boleto">Boleto</SelectItem>
            </SelectContent>
          </Select>
          <Button 
            variant="outline" 
            onClick={handleRefresh}
            disabled={isRefreshing}
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
            Atualizar
          </Button>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="bg-card rounded-xl border border-border/50 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent border-border/50">
              <TableHead className="text-muted-foreground">Cliente</TableHead>
              <TableHead className="text-muted-foreground">Serviço</TableHead>
              <TableHead className="text-muted-foreground">Valor</TableHead>
              <TableHead className="text-muted-foreground">Método</TableHead>
              <TableHead className="text-muted-foreground">Status</TableHead>
              <TableHead className="text-muted-foreground">Data</TableHead>
              <TableHead className="text-muted-foreground text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredTransactions.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-12 text-muted-foreground">
                  {transactions.length === 0 
                    ? "Nenhuma transação encontrada" 
                    : "Nenhuma transação corresponde aos filtros"
                  }
                </TableCell>
              </TableRow>
            ) : (
              filteredTransactions.map((transaction) => {
                const statusInfo = getStatusInfo(transaction.payment_status);
                const methodInfo = getPaymentMethodInfo(transaction.payment_method);
                
                return (
                  <TableRow key={transaction.id} className="border-border/50">
                    <TableCell>
                      <div>
                        <p className="font-medium text-foreground">{transaction.customer_name}</p>
                        <p className="text-sm text-muted-foreground">{transaction.customer_email}</p>
                      </div>
                    </TableCell>
                    <TableCell className="text-foreground">
                      {transaction.services?.name || "—"}
                    </TableCell>
                    <TableCell className="font-semibold text-foreground">
                      {formatPrice(transaction.amount_cents)}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        {methodInfo.icon}
                        <span className="text-sm">{methodInfo.label}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant="outline" 
                        className={`${statusInfo.color} border gap-1`}
                      >
                        {statusInfo.icon}
                        {statusInfo.label}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      {formatDate(transaction.created_at)}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setSelectedTransaction(transaction)}
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      {/* Transaction Detail Modal */}
      <Dialog open={!!selectedTransaction} onOpenChange={() => setSelectedTransaction(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Detalhes da Transação</DialogTitle>
          </DialogHeader>
          {selectedTransaction && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Cliente</p>
                  <p className="font-medium">{selectedTransaction.customer_name}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">E-mail</p>
                  <p className="font-medium">{selectedTransaction.customer_email}</p>
                </div>
                {selectedTransaction.customer_phone && (
                  <div>
                    <p className="text-sm text-muted-foreground">Telefone</p>
                    <p className="font-medium">{selectedTransaction.customer_phone}</p>
                  </div>
                )}
                {selectedTransaction.customer_cpf && (
                  <div>
                    <p className="text-sm text-muted-foreground">CPF</p>
                    <p className="font-medium">{selectedTransaction.customer_cpf}</p>
                  </div>
                )}
              </div>

              <hr className="border-border" />

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Valor</p>
                  <p className="font-bold text-lg text-primary">{formatPrice(selectedTransaction.amount_cents)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Status</p>
                  <Badge 
                    variant="outline" 
                    className={`${getStatusInfo(selectedTransaction.payment_status).color} border gap-1 mt-1`}
                  >
                    {getStatusInfo(selectedTransaction.payment_status).icon}
                    {getStatusInfo(selectedTransaction.payment_status).label}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Método</p>
                  <div className="flex items-center gap-2 mt-1">
                    {getPaymentMethodInfo(selectedTransaction.payment_method).icon}
                    <span>{getPaymentMethodInfo(selectedTransaction.payment_method).label}</span>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Gateway</p>
                  <p className="font-medium capitalize">{selectedTransaction.gateway}</p>
                </div>
              </div>

              {selectedTransaction.gateway_payment_id && (
                <>
                  <hr className="border-border" />
                  <div>
                    <p className="text-sm text-muted-foreground">ID do Pagamento (Gateway)</p>
                    <p className="font-mono text-sm bg-muted p-2 rounded mt-1 break-all">
                      {selectedTransaction.gateway_payment_id}
                    </p>
                  </div>
                </>
              )}

              <hr className="border-border" />

              <div>
                <p className="text-sm text-muted-foreground">Data da Transação</p>
                <p className="font-medium">{formatDate(selectedTransaction.created_at)}</p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SalesHistoryPage;
