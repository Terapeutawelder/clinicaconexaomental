import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Loader2,
  Plus,
  Pencil,
  Trash2,
  Tag,
  Calendar,
  Users,
  Percent,
  DollarSign,
  Copy,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface AdminCouponsProps {
  userRole?: string | null;
}

interface Coupon {
  id: string;
  code: string;
  description: string | null;
  discount_type: string;
  discount_value: number;
  max_uses: number | null;
  current_uses: number;
  valid_from: string | null;
  valid_until: string | null;
  applicable_plans: string[];
  applicable_billing_cycles: string[];
  min_amount_cents: number;
  is_active: boolean;
  created_at: string;
}

const defaultCoupon: Partial<Coupon> = {
  code: "",
  description: "",
  discount_type: "percentage",
  discount_value: 10,
  max_uses: null,
  applicable_plans: ["pro", "premium"],
  applicable_billing_cycles: ["monthly", "semiannual", "annual"],
  min_amount_cents: 0,
  is_active: true,
};

const AdminCoupons = ({ userRole }: AdminCouponsProps) => {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<Partial<Coupon> | null>(null);
  const [deletingCouponId, setDeletingCouponId] = useState<string | null>(null);
  const { toast } = useToast();

  const isSuperAdmin = userRole === "super_admin";

  useEffect(() => {
    fetchCoupons();
  }, []);

  const fetchCoupons = async () => {
    try {
      const { data, error } = await supabase
        .from("subscription_coupons")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setCoupons(data || []);
    } catch (error) {
      console.error("Error fetching coupons:", error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os cupons.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    if (!editingCoupon?.code) {
      toast({
        title: "Erro",
        description: "O código do cupom é obrigatório.",
        variant: "destructive",
      });
      return;
    }

    setIsSaving(true);

    try {
      const couponData = {
        code: editingCoupon.code.toUpperCase().replace(/\s/g, ""),
        description: editingCoupon.description || null,
        discount_type: editingCoupon.discount_type || "percentage",
        discount_value: editingCoupon.discount_value || 0,
        max_uses: editingCoupon.max_uses || null,
        valid_from: editingCoupon.valid_from || new Date().toISOString(),
        valid_until: editingCoupon.valid_until || null,
        applicable_plans: editingCoupon.applicable_plans || [],
        applicable_billing_cycles: editingCoupon.applicable_billing_cycles || [],
        min_amount_cents: editingCoupon.min_amount_cents || 0,
        is_active: editingCoupon.is_active ?? true,
      };

      if (editingCoupon.id) {
        const { error } = await supabase
          .from("subscription_coupons")
          .update(couponData)
          .eq("id", editingCoupon.id);

        if (error) throw error;
        toast({ title: "Cupom atualizado com sucesso!" });
      } else {
        const { error } = await supabase
          .from("subscription_coupons")
          .insert(couponData);

        if (error) throw error;
        toast({ title: "Cupom criado com sucesso!" });
      }

      setIsDialogOpen(false);
      setEditingCoupon(null);
      fetchCoupons();
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message || "Não foi possível salvar o cupom.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingCouponId) return;

    try {
      const { error } = await supabase
        .from("subscription_coupons")
        .delete()
        .eq("id", deletingCouponId);

      if (error) throw error;
      toast({ title: "Cupom excluído com sucesso!" });
      setIsDeleteDialogOpen(false);
      setDeletingCouponId(null);
      fetchCoupons();
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível excluir o cupom.",
        variant: "destructive",
      });
    }
  };

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    toast({ title: "Código copiado!" });
  };

  const togglePlan = (plan: string) => {
    const current = editingCoupon?.applicable_plans || [];
    const updated = current.includes(plan)
      ? current.filter((p) => p !== plan)
      : [...current, plan];
    setEditingCoupon({ ...editingCoupon, applicable_plans: updated });
  };

  const toggleBillingCycle = (cycle: string) => {
    const current = editingCoupon?.applicable_billing_cycles || [];
    const updated = current.includes(cycle)
      ? current.filter((c) => c !== cycle)
      : [...current, cycle];
    setEditingCoupon({ ...editingCoupon, applicable_billing_cycles: updated });
  };

  const formatDiscount = (coupon: Coupon) => {
    if (coupon.discount_type === "percentage") {
      return `${coupon.discount_value}%`;
    }
    return `R$ ${(coupon.discount_value / 100).toFixed(2)}`;
  };

  const isExpired = (coupon: Coupon) => {
    if (!coupon.valid_until) return false;
    return new Date(coupon.valid_until) < new Date();
  };

  const isLimitReached = (coupon: Coupon) => {
    if (!coupon.max_uses) return false;
    return coupon.current_uses >= coupon.max_uses;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-white">Cupons de Desconto</h1>
          <p className="text-slate-400 mt-1">Gerencie cupons para assinaturas Pro e Premium</p>
        </div>
        {isSuperAdmin && (
          <Button
            onClick={() => {
              setEditingCoupon({ ...defaultCoupon });
              setIsDialogOpen(true);
            }}
          >
            <Plus className="mr-2 h-4 w-4" />
            Novo Cupom
          </Button>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-slate-800/50 border-slate-700">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/20 rounded-lg">
                <Tag className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">{coupons.length}</p>
                <p className="text-sm text-slate-400">Total de Cupons</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800/50 border-slate-700">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-500/20 rounded-lg">
                <CheckCircle className="w-5 h-5 text-green-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">
                  {coupons.filter((c) => c.is_active && !isExpired(c) && !isLimitReached(c)).length}
                </p>
                <p className="text-sm text-slate-400">Ativos</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800/50 border-slate-700">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-500/20 rounded-lg">
                <Users className="w-5 h-5 text-blue-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">
                  {coupons.reduce((acc, c) => acc + c.current_uses, 0)}
                </p>
                <p className="text-sm text-slate-400">Usos Totais</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800/50 border-slate-700">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-500/20 rounded-lg">
                <XCircle className="w-5 h-5 text-red-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">
                  {coupons.filter((c) => isExpired(c) || isLimitReached(c)).length}
                </p>
                <p className="text-sm text-slate-400">Expirados/Esgotados</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Coupons Table */}
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white">Todos os Cupons</CardTitle>
          <CardDescription className="text-slate-400">
            Lista completa de cupons de desconto
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-slate-700">
                  <TableHead className="text-slate-300">Código</TableHead>
                  <TableHead className="text-slate-300">Desconto</TableHead>
                  <TableHead className="text-slate-300">Planos</TableHead>
                  <TableHead className="text-slate-300">Usos</TableHead>
                  <TableHead className="text-slate-300">Validade</TableHead>
                  <TableHead className="text-slate-300">Status</TableHead>
                  <TableHead className="text-slate-300 text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {coupons.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center text-slate-400 py-8">
                      Nenhum cupom cadastrado
                    </TableCell>
                  </TableRow>
                ) : (
                  coupons.map((coupon) => (
                    <TableRow key={coupon.id} className="border-slate-700">
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <code className="bg-slate-700 px-2 py-1 rounded text-primary font-mono text-sm">
                            {coupon.code}
                          </code>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6"
                            onClick={() => copyCode(coupon.code)}
                          >
                            <Copy className="w-3 h-3" />
                          </Button>
                        </div>
                        {coupon.description && (
                          <p className="text-xs text-slate-400 mt-1">{coupon.description}</p>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge
                          className={
                            coupon.discount_type === "percentage"
                              ? "bg-purple-500/20 text-purple-300 border-purple-500/30"
                              : "bg-green-500/20 text-green-300 border-green-500/30"
                          }
                        >
                          {coupon.discount_type === "percentage" ? (
                            <Percent className="w-3 h-3 mr-1" />
                          ) : (
                            <DollarSign className="w-3 h-3 mr-1" />
                          )}
                          {formatDiscount(coupon)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1 flex-wrap">
                          {coupon.applicable_plans.map((plan) => (
                            <Badge key={plan} variant="outline" className="text-xs border-slate-600">
                              {plan}
                            </Badge>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell className="text-white">
                        {coupon.current_uses}
                        {coupon.max_uses && ` / ${coupon.max_uses}`}
                      </TableCell>
                      <TableCell>
                        {coupon.valid_until ? (
                          <span className={isExpired(coupon) ? "text-red-400" : "text-slate-300"}>
                            {format(new Date(coupon.valid_until), "dd/MM/yyyy", { locale: ptBR })}
                          </span>
                        ) : (
                          <span className="text-slate-400">Sem limite</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {!coupon.is_active ? (
                          <Badge className="bg-slate-500/20 text-slate-400 border-slate-500/30">
                            Inativo
                          </Badge>
                        ) : isExpired(coupon) ? (
                          <Badge className="bg-red-500/20 text-red-400 border-red-500/30">
                            Expirado
                          </Badge>
                        ) : isLimitReached(coupon) ? (
                          <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">
                            Esgotado
                          </Badge>
                        ) : (
                          <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                            Ativo
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          {isSuperAdmin && (
                            <>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => {
                                  setEditingCoupon(coupon);
                                  setIsDialogOpen(true);
                                }}
                              >
                                <Pencil className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="text-red-400 hover:text-red-300"
                                onClick={() => {
                                  setDeletingCouponId(coupon.id);
                                  setIsDeleteDialogOpen(true);
                                }}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Create/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="bg-slate-800 border-slate-700 max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-white">
              {editingCoupon?.id ? "Editar Cupom" : "Novo Cupom"}
            </DialogTitle>
            <DialogDescription className="text-slate-400">
              Configure os detalhes do cupom de desconto
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-slate-300">Código do Cupom *</Label>
                <Input
                  value={editingCoupon?.code || ""}
                  onChange={(e) =>
                    setEditingCoupon({
                      ...editingCoupon,
                      code: e.target.value.toUpperCase().replace(/\s/g, ""),
                    })
                  }
                  placeholder="DESCONTO10"
                  className="bg-input border-border text-foreground placeholder:text-muted-foreground uppercase"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-slate-300">Tipo de Desconto</Label>
                <Select
                  value={editingCoupon?.discount_type || "percentage"}
                  onValueChange={(value) =>
                    setEditingCoupon({ ...editingCoupon, discount_type: value })
                  }
                >
                  <SelectTrigger className="bg-input border-border text-foreground">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-card border-border">
                    <SelectItem value="percentage">Porcentagem (%)</SelectItem>
                    <SelectItem value="fixed">Valor Fixo (R$)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-slate-300">
                  Valor do Desconto {editingCoupon?.discount_type === "percentage" ? "(%)" : "(centavos)"}
                </Label>
                <Input
                  type="number"
                  value={editingCoupon?.discount_value || 0}
                  onChange={(e) =>
                    setEditingCoupon({
                      ...editingCoupon,
                      discount_value: parseInt(e.target.value) || 0,
                    })
                  }
                  placeholder={editingCoupon?.discount_type === "percentage" ? "10" : "5000"}
                  className="bg-input border-border text-foreground placeholder:text-muted-foreground"
                />
                {editingCoupon?.discount_type === "fixed" && (
                  <p className="text-xs text-slate-400">
                    = R$ {((editingCoupon?.discount_value || 0) / 100).toFixed(2)}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label className="text-slate-300">Limite de Usos (opcional)</Label>
                <Input
                  type="number"
                  value={editingCoupon?.max_uses || ""}
                  onChange={(e) =>
                    setEditingCoupon({
                      ...editingCoupon,
                      max_uses: e.target.value ? parseInt(e.target.value) : null,
                    })
                  }
                  placeholder="Ilimitado"
                  className="bg-input border-border text-foreground placeholder:text-muted-foreground"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-slate-300">Descrição</Label>
              <Input
                value={editingCoupon?.description || ""}
                onChange={(e) =>
                  setEditingCoupon({ ...editingCoupon, description: e.target.value })
                }
                placeholder="Descrição do cupom"
                className="bg-input border-border text-foreground placeholder:text-muted-foreground"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-slate-300">Válido a partir de</Label>
                <Input
                  type="date"
                  value={
                    editingCoupon?.valid_from
                      ? new Date(editingCoupon.valid_from).toISOString().split("T")[0]
                      : new Date().toISOString().split("T")[0]
                  }
                  onChange={(e) =>
                    setEditingCoupon({
                      ...editingCoupon,
                      valid_from: new Date(e.target.value).toISOString(),
                    })
                  }
                  className="bg-input border-border text-foreground placeholder:text-muted-foreground"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-slate-300">Válido até (opcional)</Label>
                <Input
                  type="date"
                  value={
                    editingCoupon?.valid_until
                      ? new Date(editingCoupon.valid_until).toISOString().split("T")[0]
                      : ""
                  }
                  onChange={(e) =>
                    setEditingCoupon({
                      ...editingCoupon,
                      valid_until: e.target.value ? new Date(e.target.value).toISOString() : null,
                    })
                  }
                  className="bg-input border-border text-foreground placeholder:text-muted-foreground"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-slate-300">Planos Aplicáveis</Label>
              <div className="flex gap-4">
                {["pro", "premium"].map((plan) => (
                  <div key={plan} className="flex items-center space-x-2">
                    <Checkbox
                      id={`plan-${plan}`}
                      checked={editingCoupon?.applicable_plans?.includes(plan)}
                      onCheckedChange={() => togglePlan(plan)}
                    />
                    <label
                      htmlFor={`plan-${plan}`}
                      className="text-sm text-slate-300 capitalize cursor-pointer"
                    >
                      {plan}
                    </label>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-slate-300">Ciclos de Cobrança</Label>
              <div className="flex gap-4">
                {[
                  { id: "monthly", label: "Mensal" },
                  { id: "semiannual", label: "Semestral" },
                  { id: "annual", label: "Anual" },
                ].map((cycle) => (
                  <div key={cycle.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={`cycle-${cycle.id}`}
                      checked={editingCoupon?.applicable_billing_cycles?.includes(cycle.id)}
                      onCheckedChange={() => toggleBillingCycle(cycle.id)}
                    />
                    <label
                      htmlFor={`cycle-${cycle.id}`}
                      className="text-sm text-slate-300 cursor-pointer"
                    >
                      {cycle.label}
                    </label>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between p-4 bg-slate-700/30 rounded-lg">
              <div>
                <p className="text-white font-medium">Cupom Ativo</p>
                <p className="text-sm text-slate-400">Ativar ou desativar este cupom</p>
              </div>
              <Switch
                checked={editingCoupon?.is_active ?? true}
                onCheckedChange={(checked) =>
                  setEditingCoupon({ ...editingCoupon, is_active: checked })
                }
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSave} disabled={isSaving}>
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

      {/* Delete Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="bg-slate-800 border-slate-700">
          <DialogHeader>
            <DialogTitle className="text-white">Excluir Cupom</DialogTitle>
            <DialogDescription className="text-slate-400">
              Tem certeza que deseja excluir este cupom? Esta ação não pode ser desfeita.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Excluir
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminCoupons;
