import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Building2, Plus, MoreHorizontal, Users, Package, Globe, Pencil, Trash2, Eye } from "lucide-react";
import { toast } from "sonner";

interface Whitelabel {
  id: string;
  name: string;
  slug: string;
  logo_url: string | null;
  primary_color: string;
  secondary_color: string;
  custom_domain: string | null;
  email: string | null;
  phone: string | null;
  description: string | null;
  is_active: boolean;
  created_at: string;
  owner_id: string;
}

const AdminWhitelabels = () => {
  const queryClient = useQueryClient();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingWhitelabel, setEditingWhitelabel] = useState<Whitelabel | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    email: "",
    phone: "",
    description: "",
    primary_color: "#10b981",
    secondary_color: "#059669",
    custom_domain: "",
    owner_email: "",
  });

  const { data: whitelabels, isLoading } = useQuery({
    queryKey: ["admin-whitelabels"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("whitelabels")
        .select("*")
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      return data as Whitelabel[];
    },
  });

  const { data: whitelabelStats } = useQuery({
    queryKey: ["admin-whitelabel-stats"],
    queryFn: async () => {
      const { data: professionals } = await supabase
        .from("whitelabel_professionals")
        .select("whitelabel_id");
      
      const stats: Record<string, number> = {};
      professionals?.forEach((p) => {
        stats[p.whitelabel_id] = (stats[p.whitelabel_id] || 0) + 1;
      });
      return stats;
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      // First, find or create the owner user
      let ownerId: string;
      
      // Check if user exists with this email
      const { data: existingProfile } = await supabase
        .from("profiles")
        .select("id, user_id")
        .eq("email", data.owner_email)
        .maybeSingle();
      
      if (existingProfile) {
        ownerId = existingProfile.user_id!;
      } else {
        throw new Error("Usuário com este e-mail não encontrado. O usuário precisa estar cadastrado na plataforma.");
      }
      
      // Create the whitelabel
      const { data: whitelabel, error } = await supabase
        .from("whitelabels")
        .insert({
          name: data.name,
          slug: data.slug.toLowerCase().replace(/[^a-z0-9-]/g, "-"),
          email: data.email || null,
          phone: data.phone || null,
          description: data.description || null,
          primary_color: data.primary_color,
          secondary_color: data.secondary_color,
          custom_domain: data.custom_domain || null,
          owner_id: ownerId,
        })
        .select()
        .single();
      
      if (error) throw error;
      
      // Add the whitelabel_admin role to the owner
      await supabase.from("user_roles").upsert({
        user_id: ownerId,
        role: "whitelabel_admin" as any,
      });
      
      return whitelabel;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-whitelabels"] });
      setIsCreateOpen(false);
      resetForm();
      toast.success("Whitelabel criado com sucesso!");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<Whitelabel> }) => {
      const { error } = await supabase
        .from("whitelabels")
        .update(data)
        .eq("id", id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-whitelabels"] });
      setEditingWhitelabel(null);
      toast.success("Whitelabel atualizado!");
    },
    onError: () => {
      toast.error("Erro ao atualizar whitelabel");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("whitelabels")
        .delete()
        .eq("id", id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-whitelabels"] });
      toast.success("Whitelabel excluído!");
    },
    onError: () => {
      toast.error("Erro ao excluir whitelabel");
    },
  });

  const resetForm = () => {
    setFormData({
      name: "",
      slug: "",
      email: "",
      phone: "",
      description: "",
      primary_color: "#10b981",
      secondary_color: "#059669",
      custom_domain: "",
      owner_email: "",
    });
  };

  const handleCreate = () => {
    if (!formData.name || !formData.slug || !formData.owner_email) {
      toast.error("Preencha os campos obrigatórios");
      return;
    }
    createMutation.mutate(formData);
  };

  const handleToggleActive = (whitelabel: Whitelabel) => {
    updateMutation.mutate({
      id: whitelabel.id,
      data: { is_active: !whitelabel.is_active },
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Whitelabels</h1>
          <p className="text-muted-foreground">
            Gerencie clínicas e organizações whitelabel
          </p>
        </div>
        <Button onClick={() => setIsCreateOpen(true)} className="gap-2">
          <Plus size={16} />
          Novo Whitelabel
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-card border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total de Whitelabels
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Building2 className="h-5 w-5 text-primary" />
              <span className="text-2xl font-bold">{whitelabels?.length || 0}</span>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-card border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Whitelabels Ativos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Globe className="h-5 w-5 text-green-500" />
              <span className="text-2xl font-bold">
                {whitelabels?.filter((w) => w.is_active).length || 0}
              </span>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-card border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total de Profissionais
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-blue-500" />
              <span className="text-2xl font-bold">
                {Object.values(whitelabelStats || {}).reduce((a, b) => a + b, 0)}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Whitelabels Table */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle>Lista de Whitelabels</CardTitle>
          <CardDescription>
            Todas as clínicas e organizações cadastradas
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">
              Carregando...
            </div>
          ) : whitelabels?.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              Nenhum whitelabel cadastrado
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Slug</TableHead>
                  <TableHead>Domínio</TableHead>
                  <TableHead>Profissionais</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {whitelabels?.map((whitelabel) => (
                  <TableRow key={whitelabel.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div
                          className="w-8 h-8 rounded-lg flex items-center justify-center"
                          style={{ backgroundColor: whitelabel.primary_color }}
                        >
                          <Building2 className="h-4 w-4 text-white" />
                        </div>
                        <div>
                          <p className="font-medium">{whitelabel.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {whitelabel.email}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <code className="text-sm bg-muted px-2 py-1 rounded">
                        /{whitelabel.slug}
                      </code>
                    </TableCell>
                    <TableCell>
                      {whitelabel.custom_domain ? (
                        <span className="text-primary">{whitelabel.custom_domain}</span>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">
                        {whitelabelStats?.[whitelabel.id] || 0} profissionais
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={whitelabel.is_active ? "default" : "secondary"}>
                        {whitelabel.is_active ? "Ativo" : "Inativo"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => setEditingWhitelabel(whitelabel)}>
                            <Pencil className="h-4 w-4 mr-2" />
                            Editar
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleToggleActive(whitelabel)}>
                            <Eye className="h-4 w-4 mr-2" />
                            {whitelabel.is_active ? "Desativar" : "Ativar"}
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-destructive"
                            onClick={() => {
                              if (confirm("Tem certeza que deseja excluir este whitelabel?")) {
                                deleteMutation.mutate(whitelabel.id);
                              }
                            }}
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Excluir
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Create Dialog */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Novo Whitelabel</DialogTitle>
            <DialogDescription>
              Crie uma nova clínica ou organização whitelabel
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Nome *</Label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Clínica Exemplo"
                />
              </div>
              <div className="space-y-2">
                <Label>Slug *</Label>
                <Input
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                  placeholder="clinica-exemplo"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label>E-mail do Administrador *</Label>
              <Input
                type="email"
                value={formData.owner_email}
                onChange={(e) => setFormData({ ...formData, owner_email: e.target.value })}
                placeholder="admin@clinica.com"
              />
              <p className="text-xs text-muted-foreground">
                Este usuário terá acesso ao painel administrativo do whitelabel
              </p>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>E-mail de Contato</Label>
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="contato@clinica.com"
                />
              </div>
              <div className="space-y-2">
                <Label>Telefone</Label>
                <Input
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="(11) 99999-9999"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label>Descrição</Label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Descrição da clínica..."
                rows={3}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Cor Primária</Label>
                <div className="flex gap-2">
                  <Input
                    type="color"
                    value={formData.primary_color}
                    onChange={(e) => setFormData({ ...formData, primary_color: e.target.value })}
                    className="w-12 h-10 p-1"
                  />
                  <Input
                    value={formData.primary_color}
                    onChange={(e) => setFormData({ ...formData, primary_color: e.target.value })}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Cor Secundária</Label>
                <div className="flex gap-2">
                  <Input
                    type="color"
                    value={formData.secondary_color}
                    onChange={(e) => setFormData({ ...formData, secondary_color: e.target.value })}
                    className="w-12 h-10 p-1"
                  />
                  <Input
                    value={formData.secondary_color}
                    onChange={(e) => setFormData({ ...formData, secondary_color: e.target.value })}
                  />
                </div>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label>Domínio Personalizado</Label>
              <Input
                value={formData.custom_domain}
                onChange={(e) => setFormData({ ...formData, custom_domain: e.target.value })}
                placeholder="clinica.com.br"
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleCreate} disabled={createMutation.isPending}>
              {createMutation.isPending ? "Criando..." : "Criar Whitelabel"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={!!editingWhitelabel} onOpenChange={() => setEditingWhitelabel(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Editar Whitelabel</DialogTitle>
            <DialogDescription>
              Atualize as informações do whitelabel
            </DialogDescription>
          </DialogHeader>
          
          {editingWhitelabel && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Nome</Label>
                  <Input
                    value={editingWhitelabel.name}
                    onChange={(e) => setEditingWhitelabel({ ...editingWhitelabel, name: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Slug</Label>
                  <Input
                    value={editingWhitelabel.slug}
                    onChange={(e) => setEditingWhitelabel({ ...editingWhitelabel, slug: e.target.value })}
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>E-mail</Label>
                  <Input
                    type="email"
                    value={editingWhitelabel.email || ""}
                    onChange={(e) => setEditingWhitelabel({ ...editingWhitelabel, email: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Telefone</Label>
                  <Input
                    value={editingWhitelabel.phone || ""}
                    onChange={(e) => setEditingWhitelabel({ ...editingWhitelabel, phone: e.target.value })}
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label>Descrição</Label>
                <Textarea
                  value={editingWhitelabel.description || ""}
                  onChange={(e) => setEditingWhitelabel({ ...editingWhitelabel, description: e.target.value })}
                  rows={3}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Cor Primária</Label>
                  <div className="flex gap-2">
                    <Input
                      type="color"
                      value={editingWhitelabel.primary_color}
                      onChange={(e) => setEditingWhitelabel({ ...editingWhitelabel, primary_color: e.target.value })}
                      className="w-12 h-10 p-1"
                    />
                    <Input
                      value={editingWhitelabel.primary_color}
                      onChange={(e) => setEditingWhitelabel({ ...editingWhitelabel, primary_color: e.target.value })}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Cor Secundária</Label>
                  <div className="flex gap-2">
                    <Input
                      type="color"
                      value={editingWhitelabel.secondary_color}
                      onChange={(e) => setEditingWhitelabel({ ...editingWhitelabel, secondary_color: e.target.value })}
                      className="w-12 h-10 p-1"
                    />
                    <Input
                      value={editingWhitelabel.secondary_color}
                      onChange={(e) => setEditingWhitelabel({ ...editingWhitelabel, secondary_color: e.target.value })}
                    />
                  </div>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label>Domínio Personalizado</Label>
                <Input
                  value={editingWhitelabel.custom_domain || ""}
                  onChange={(e) => setEditingWhitelabel({ ...editingWhitelabel, custom_domain: e.target.value })}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <Label>Whitelabel Ativo</Label>
                <Switch
                  checked={editingWhitelabel.is_active}
                  onCheckedChange={(checked) => setEditingWhitelabel({ ...editingWhitelabel, is_active: checked })}
                />
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingWhitelabel(null)}>
              Cancelar
            </Button>
            <Button
              onClick={() => {
                if (editingWhitelabel) {
                  updateMutation.mutate({
                    id: editingWhitelabel.id,
                    data: {
                      name: editingWhitelabel.name,
                      slug: editingWhitelabel.slug,
                      email: editingWhitelabel.email,
                      phone: editingWhitelabel.phone,
                      description: editingWhitelabel.description,
                      primary_color: editingWhitelabel.primary_color,
                      secondary_color: editingWhitelabel.secondary_color,
                      custom_domain: editingWhitelabel.custom_domain,
                      is_active: editingWhitelabel.is_active,
                    },
                  });
                }
              }}
              disabled={updateMutation.isPending}
            >
              {updateMutation.isPending ? "Salvando..." : "Salvar Alterações"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminWhitelabels;
