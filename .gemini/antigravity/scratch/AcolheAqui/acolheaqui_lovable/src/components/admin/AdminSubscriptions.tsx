import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Search,
  MoreHorizontal,
  Eye,
  Edit,
  XCircle,
  RefreshCw,
  Loader2,
  CreditCard,
  Crown,
  Star,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Label } from "@/components/ui/label";

interface Subscription {
  id: string;
  professional_id: string;
  plan: string;
  status: string;
  gateway: string;
  gateway_subscription_id: string;
  amount_cents: number;
  billing_cycle: string;
  current_period_start: string;
  current_period_end: string;
  cancel_at_period_end: boolean;
  created_at: string;
  profiles?: {
    full_name: string;
    email: string;
    avatar_url: string;
  };
}

const AdminSubscriptions = () => {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterPlan, setFilterPlan] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [selectedSubscription, setSelectedSubscription] = useState<Subscription | null>(null);
  const [editOpen, setEditOpen] = useState(false);
  const [editPlan, setEditPlan] = useState("");
  const [editStatus, setEditStatus] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchSubscriptions();
  }, []);

  const fetchSubscriptions = async () => {
    try {
      const { data, error } = await supabase
        .from("subscriptions")
        .select(`
          *,
          profiles:professional_id (
            full_name,
            email,
            avatar_url
          )
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setSubscriptions(data || []);
    } catch (error) {
      console.error("Error fetching subscriptions:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditSubscription = async () => {
    if (!selectedSubscription) return;
    setIsSaving(true);

    try {
      const { error } = await supabase
        .from("subscriptions")
        .update({
          plan: editPlan as "free" | "pro" | "premium",
          status: editStatus as "active" | "cancelled" | "past_due" | "trialing" | "expired",
        })
        .eq("id", selectedSubscription.id);

      if (error) throw error;

      // Update profile subscription info
      await supabase
        .from("profiles")
        .update({
          subscription_plan: editPlan,
          subscription_status: editStatus,
        })
        .eq("id", selectedSubscription.professional_id);

      setSubscriptions(prev =>
        prev.map(s =>
          s.id === selectedSubscription.id
            ? { ...s, plan: editPlan, status: editStatus }
            : s
        )
      );

      toast({
        title: "Assinatura atualizada",
        description: "As alterações foram salvas com sucesso.",
      });

      setEditOpen(false);
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível atualizar a assinatura.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancelSubscription = async (subscription: Subscription) => {
    try {
      const { error } = await supabase
        .from("subscriptions")
        .update({ status: "cancelled", cancel_at_period_end: true })
        .eq("id", subscription.id);

      if (error) throw error;

      await supabase
        .from("profiles")
        .update({ subscription_status: "cancelled" })
        .eq("id", subscription.professional_id);

      setSubscriptions(prev =>
        prev.map(s =>
          s.id === subscription.id
            ? { ...s, status: "cancelled", cancel_at_period_end: true }
            : s
        )
      );

      toast({
        title: "Assinatura cancelada",
        description: "A assinatura foi marcada para cancelamento.",
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível cancelar a assinatura.",
        variant: "destructive",
      });
    }
  };

  const filteredSubscriptions = subscriptions.filter(s => {
    const matchesSearch =
      s.profiles?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.profiles?.email?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesPlan = filterPlan === "all" || s.plan === filterPlan;
    const matchesStatus = filterStatus === "all" || s.status === filterStatus;
    return matchesSearch && matchesPlan && matchesStatus;
  });

  const getPlanIcon = (plan: string) => {
    switch (plan) {
      case "premium":
        return <Crown className="w-4 h-4 text-purple-400" />;
      case "pro":
        return <Star className="w-4 h-4 text-blue-400" />;
      default:
        return <CreditCard className="w-4 h-4 text-slate-400" />;
    }
  };

  const getPlanBadge = (plan: string) => {
    switch (plan) {
      case "premium":
        return <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30">Premium</Badge>;
      case "pro":
        return <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">Pro</Badge>;
      default:
        return <Badge className="bg-slate-500/20 text-slate-400 border-slate-500/30">Free</Badge>;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge className="bg-green-500/20 text-green-400 border-green-500/30">Ativo</Badge>;
      case "cancelled":
        return <Badge className="bg-red-500/20 text-red-400 border-red-500/30">Cancelado</Badge>;
      case "past_due":
        return <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">Pendente</Badge>;
      case "trialing":
        return <Badge className="bg-cyan-500/20 text-cyan-400 border-cyan-500/30">Trial</Badge>;
      case "expired":
        return <Badge className="bg-gray-500/20 text-gray-400 border-gray-500/30">Expirado</Badge>;
      default:
        return <Badge className="bg-slate-500/20 text-slate-400 border-slate-500/30">-</Badge>;
    }
  };

  const formatCurrency = (cents: number) => {
    return (cents / 100).toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-white">Assinaturas</h1>
          <p className="text-slate-400 mt-1">Gerencie as assinaturas dos planos Pro e Premium</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <Input
            placeholder="Buscar por nome ou email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 bg-input border-border text-foreground placeholder:text-muted-foreground"
          />
        </div>
        <Select value={filterPlan} onValueChange={setFilterPlan}>
          <SelectTrigger className="w-40 bg-input border-border text-foreground">
            <SelectValue placeholder="Plano" />
          </SelectTrigger>
          <SelectContent className="bg-card border-border">
            <SelectItem value="all">Todos os planos</SelectItem>
            <SelectItem value="free">Free</SelectItem>
            <SelectItem value="pro">Pro</SelectItem>
            <SelectItem value="premium">Premium</SelectItem>
          </SelectContent>
        </Select>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-40 bg-input border-border text-foreground">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent className="bg-card border-border">
            <SelectItem value="all">Todos os status</SelectItem>
            <SelectItem value="active">Ativo</SelectItem>
            <SelectItem value="cancelled">Cancelado</SelectItem>
            <SelectItem value="past_due">Pendente</SelectItem>
            <SelectItem value="trialing">Trial</SelectItem>
            <SelectItem value="expired">Expirado</SelectItem>
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
                    <TableHead className="text-slate-400">Plano</TableHead>
                    <TableHead className="text-slate-400 hidden md:table-cell">Status</TableHead>
                    <TableHead className="text-slate-400 hidden lg:table-cell">Valor</TableHead>
                    <TableHead className="text-slate-400 hidden lg:table-cell">Gateway</TableHead>
                    <TableHead className="text-slate-400 hidden xl:table-cell">Período</TableHead>
                    <TableHead className="text-slate-400 text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredSubscriptions.map((subscription) => (
                    <TableRow key={subscription.id} className="border-slate-700 hover:bg-slate-700/30">
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center overflow-hidden">
                            {subscription.profiles?.avatar_url ? (
                              <img
                                src={subscription.profiles.avatar_url}
                                alt={subscription.profiles.full_name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <span className="text-primary font-medium">
                                {subscription.profiles?.full_name?.charAt(0) || "?"}
                              </span>
                            )}
                          </div>
                          <div>
                            <p className="font-medium text-white">
                              {subscription.profiles?.full_name || "Sem nome"}
                            </p>
                            <p className="text-sm text-slate-400">
                              {subscription.profiles?.email}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getPlanIcon(subscription.plan)}
                          {getPlanBadge(subscription.plan)}
                        </div>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        {getStatusBadge(subscription.status)}
                      </TableCell>
                      <TableCell className="hidden lg:table-cell text-slate-300">
                        {subscription.amount_cents
                          ? formatCurrency(subscription.amount_cents)
                          : "-"}
                      </TableCell>
                      <TableCell className="hidden lg:table-cell text-slate-400 capitalize">
                        {subscription.gateway || "-"}
                      </TableCell>
                      <TableCell className="hidden xl:table-cell text-slate-400 text-sm">
                        {subscription.current_period_end
                          ? `Até ${format(new Date(subscription.current_period_end), "dd/MM/yyyy", { locale: ptBR })}`
                          : "-"}
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="text-slate-400 hover:text-white">
                              <MoreHorizontal size={18} />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="bg-slate-800 border-slate-700">
                            <DropdownMenuItem
                              onClick={() => {
                                setSelectedSubscription(subscription);
                                setEditPlan(subscription.plan);
                                setEditStatus(subscription.status);
                                setEditOpen(true);
                              }}
                              className="text-slate-300 hover:text-white hover:bg-slate-700 cursor-pointer"
                            >
                              <Edit className="mr-2 h-4 w-4" />
                              Editar
                            </DropdownMenuItem>
                            {subscription.status === "active" && (
                              <DropdownMenuItem
                                onClick={() => handleCancelSubscription(subscription)}
                                className="text-red-400 hover:text-red-300 hover:bg-red-500/10 cursor-pointer"
                              >
                                <XCircle className="mr-2 h-4 w-4" />
                                Cancelar
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                  {filteredSubscriptions.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-12 text-slate-400">
                        Nenhuma assinatura encontrada
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Subscription Dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="bg-slate-800 border-slate-700 text-white">
          <DialogHeader>
            <DialogTitle>Editar Assinatura</DialogTitle>
            <DialogDescription className="text-slate-400">
              Altere o plano ou status da assinatura
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Plano</Label>
              <Select value={editPlan} onValueChange={setEditPlan}>
                <SelectTrigger className="bg-input border-border text-foreground">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-card border-border">
                  <SelectItem value="free">Free</SelectItem>
                  <SelectItem value="pro">Pro</SelectItem>
                  <SelectItem value="premium">Premium</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Status</Label>
              <Select value={editStatus} onValueChange={setEditStatus}>
                <SelectTrigger className="bg-input border-border text-foreground">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-card border-border">
                  <SelectItem value="active">Ativo</SelectItem>
                  <SelectItem value="cancelled">Cancelado</SelectItem>
                  <SelectItem value="past_due">Pendente</SelectItem>
                  <SelectItem value="trialing">Trial</SelectItem>
                  <SelectItem value="expired">Expirado</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setEditOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleEditSubscription} disabled={isSaving}>
              {isSaving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Salvando...
                </>
              ) : (
                "Salvar"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminSubscriptions;
