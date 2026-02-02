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
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Search,
  MoreHorizontal,
  Eye,
  UserCog,
  Ban,
  CheckCircle,
  Mail,
  Phone,
  Calendar,
  Loader2,
  ExternalLink,
  Trash2,
  Clock,
  UserCheck,
  UserX,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface Professional {
  id: string;
  user_id: string;
  full_name: string | null;
  email: string | null;
  phone: string | null;
  profession?: string | null;
  user_slug: string | null;
  is_verified: boolean | null;
  avatar_url: string | null;
  subscription_plan: string | null;
  subscription_status: string | null;
  professional_status: string | null;
  created_at: string;
  updated_at: string;
}

const AdminProfessionals = () => {
  const [professionals, setProfessionals] = useState<Professional[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedProfessional, setSelectedProfessional] = useState<Professional | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [professionalToDelete, setProfessionalToDelete] = useState<Professional | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchProfessionals();
  }, []);

  const fetchProfessionals = async () => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("is_professional", true)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setProfessionals(data || []);
    } catch (error) {
      console.error("Error fetching professionals:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleVerification = async (professional: Professional) => {
    try {
      const { error } = await supabase
        .from("profiles")
        .update({ is_verified: !professional.is_verified })
        .eq("id", professional.id);

      if (error) throw error;

      setProfessionals(prev =>
        prev.map(p =>
          p.id === professional.id ? { ...p, is_verified: !p.is_verified } : p
        )
      );

      toast({
        title: professional.is_verified ? "Verificação removida" : "Profissional verificado",
        description: `${professional.full_name} foi ${professional.is_verified ? "desverificado" : "verificado"}.`,
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível atualizar a verificação.",
        variant: "destructive",
      });
    }
  };

  const handleChangeStatus = async (professional: Professional, newStatus: string) => {
    const oldStatus = professional.professional_status;
    
    try {
      const { error } = await supabase
        .from("profiles")
        .update({ professional_status: newStatus })
        .eq("id", professional.id);

      if (error) throw error;

      setProfessionals(prev =>
        prev.map(p =>
          p.id === professional.id ? { ...p, professional_status: newStatus } : p
        )
      );

      const statusLabels: Record<string, string> = {
        active: "Ativo",
        pending: "Em análise",
        disabled: "Desativado"
      };

      toast({
        title: "Status atualizado",
        description: `${professional.full_name} agora está ${statusLabels[newStatus]}.`,
      });

      // Send notification to professional
      try {
        await supabase.functions.invoke("admin-notifications", {
          body: {
            action: "professional_status_changed",
            professionalId: professional.id,
            data: {
              newStatus,
              oldStatus,
            },
          },
        });
      } catch (notifError) {
        console.error("Error sending notification:", notifError);
      }
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível atualizar o status.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteProfessional = async () => {
    if (!professionalToDelete) return;

    try {
      const { error } = await supabase
        .from("profiles")
        .delete()
        .eq("id", professionalToDelete.id);

      if (error) throw error;

      setProfessionals(prev => prev.filter(p => p.id !== professionalToDelete.id));

      toast({
        title: "Profissional excluído",
        description: `${professionalToDelete.full_name} foi removido da plataforma.`,
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível excluir o profissional.",
        variant: "destructive",
      });
    } finally {
      setDeleteDialogOpen(false);
      setProfessionalToDelete(null);
    }
  };

  const filteredProfessionals = professionals.filter(
    p =>
      p.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.profession?.toLowerCase().includes(searchTerm.toLowerCase())
  );

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

  const getProfessionalStatusBadge = (status: string | null) => {
    switch (status) {
      case "active":
        return <Badge className="bg-green-500/20 text-green-400 border-green-500/30">Ativo</Badge>;
      case "pending":
        return <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">Em análise</Badge>;
      case "disabled":
        return <Badge className="bg-red-500/20 text-red-400 border-red-500/30">Desativado</Badge>;
      default:
        return <Badge className="bg-slate-500/20 text-slate-400 border-slate-500/30">-</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-white">Profissionais</h1>
          <p className="text-slate-400 mt-1">Gerencie os profissionais da plataforma</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <Input
              placeholder="Buscar..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-64 bg-input border-border text-foreground placeholder:text-muted-foreground"
            />
          </div>
        </div>
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
                    <TableHead className="text-slate-400 hidden md:table-cell">Profissão</TableHead>
                    <TableHead className="text-slate-400 hidden lg:table-cell">Plano</TableHead>
                    <TableHead className="text-slate-400 hidden lg:table-cell">Status</TableHead>
                    <TableHead className="text-slate-400 hidden xl:table-cell">Cadastro</TableHead>
                    <TableHead className="text-slate-400 text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredProfessionals.map((professional) => (
                    <TableRow key={professional.id} className="border-slate-700 hover:bg-slate-700/30">
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center overflow-hidden">
                            {professional.avatar_url ? (
                              <img
                                src={professional.avatar_url}
                                alt={professional.full_name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <span className="text-primary font-medium">
                                {professional.full_name?.charAt(0) || "?"}
                              </span>
                            )}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="font-medium text-white">{professional.full_name || "Sem nome"}</p>
                              {professional.is_verified && (
                                <CheckCircle className="w-4 h-4 text-primary" />
                              )}
                            </div>
                            <p className="text-sm text-slate-400">{professional.email}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="hidden md:table-cell text-slate-300">
                        {professional.profession || "-"}
                      </TableCell>
                      <TableCell className="hidden lg:table-cell">
                        {getPlanBadge(professional.subscription_plan)}
                      </TableCell>
                      <TableCell className="hidden lg:table-cell">
                        {getProfessionalStatusBadge(professional.professional_status)}
                      </TableCell>
                      <TableCell className="hidden xl:table-cell text-slate-400 text-sm">
                        {format(new Date(professional.created_at), "dd/MM/yyyy", { locale: ptBR })}
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
                                setSelectedProfessional(professional);
                                setDetailsOpen(true);
                              }}
                              className="text-slate-300 hover:text-white hover:bg-slate-700 cursor-pointer"
                            >
                              <Eye className="mr-2 h-4 w-4" />
                              Ver detalhes
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleToggleVerification(professional)}
                              className="text-slate-300 hover:text-white hover:bg-slate-700 cursor-pointer"
                            >
                              {professional.is_verified ? (
                                <>
                                  <Ban className="mr-2 h-4 w-4" />
                                  Remover verificação
                                </>
                              ) : (
                                <>
                                  <CheckCircle className="mr-2 h-4 w-4" />
                                  Verificar
                                </>
                              )}
                            </DropdownMenuItem>
                            <DropdownMenuSeparator className="bg-slate-700" />
                            <DropdownMenuItem
                              onClick={() => handleChangeStatus(professional, "active")}
                              className="text-green-400 hover:text-green-300 hover:bg-slate-700 cursor-pointer"
                              disabled={professional.professional_status === "active"}
                            >
                              <UserCheck className="mr-2 h-4 w-4" />
                              Ativar
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleChangeStatus(professional, "pending")}
                              className="text-yellow-400 hover:text-yellow-300 hover:bg-slate-700 cursor-pointer"
                              disabled={professional.professional_status === "pending"}
                            >
                              <Clock className="mr-2 h-4 w-4" />
                              Em análise
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleChangeStatus(professional, "disabled")}
                              className="text-red-400 hover:text-red-300 hover:bg-slate-700 cursor-pointer"
                              disabled={professional.professional_status === "disabled"}
                            >
                              <UserX className="mr-2 h-4 w-4" />
                              Desativar
                            </DropdownMenuItem>
                            <DropdownMenuSeparator className="bg-slate-700" />
                            {professional.user_slug && (
                              <DropdownMenuItem
                                onClick={() => window.open(`/p/${professional.user_slug}`, "_blank")}
                                className="text-slate-300 hover:text-white hover:bg-slate-700 cursor-pointer"
                              >
                                <ExternalLink className="mr-2 h-4 w-4" />
                                Ver perfil público
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuItem
                              onClick={() => {
                                setProfessionalToDelete(professional);
                                setDeleteDialogOpen(true);
                              }}
                              className="text-red-400 hover:text-red-300 hover:bg-slate-700 cursor-pointer"
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Excluir
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                  {filteredProfessionals.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-12 text-slate-400">
                        Nenhum profissional encontrado
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Professional Details Dialog */}
      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent className="bg-slate-800 border-slate-700 text-white max-w-lg">
          <DialogHeader>
            <DialogTitle>Detalhes do Profissional</DialogTitle>
            <DialogDescription className="text-slate-400">
              Informações completas do profissional
            </DialogDescription>
          </DialogHeader>
          {selectedProfessional && (
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center overflow-hidden">
                  {selectedProfessional.avatar_url ? (
                    <img
                      src={selectedProfessional.avatar_url}
                      alt={selectedProfessional.full_name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-2xl text-primary font-medium">
                      {selectedProfessional.full_name?.charAt(0) || "?"}
                    </span>
                  )}
                </div>
                <div>
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    {selectedProfessional.full_name}
                    {selectedProfessional.is_verified && (
                      <CheckCircle className="w-4 h-4 text-primary" />
                    )}
                  </h3>
                  <p className="text-slate-400">{selectedProfessional.profession || "Profissão não informada"}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-sm text-slate-400 flex items-center gap-1">
                    <Mail size={14} /> E-mail
                  </p>
                  <p className="text-sm">{selectedProfessional.email}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-slate-400 flex items-center gap-1">
                    <Phone size={14} /> Telefone
                  </p>
                  <p className="text-sm">{selectedProfessional.phone || "Não informado"}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-slate-400 flex items-center gap-1">
                    <Calendar size={14} /> Cadastro
                  </p>
                  <p className="text-sm">
                    {format(new Date(selectedProfessional.created_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-slate-400">Slug</p>
                  <p className="text-sm">{selectedProfessional.user_slug || "-"}</p>
                </div>
              </div>

              <div className="flex gap-2 pt-4">
                {getPlanBadge(selectedProfessional.subscription_plan)}
                {getProfessionalStatusBadge(selectedProfessional.professional_status)}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent className="bg-slate-800 border-slate-700">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white">Excluir Profissional</AlertDialogTitle>
            <AlertDialogDescription className="text-slate-400">
              Tem certeza que deseja excluir <strong className="text-white">{professionalToDelete?.full_name}</strong>? 
              Esta ação não pode ser desfeita e todos os dados associados serão perdidos.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-card border-border text-foreground hover:bg-accent">
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteProfessional}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default AdminProfessionals;
