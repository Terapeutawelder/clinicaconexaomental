import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Plus,
  Bot,
  MoreVertical,
  Pencil,
  Trash2,
  Power,
  Loader2,
  MessageCircle,
  Bold,
  Italic,
  Heading1,
  Heading2,
  Heading3,
  List,
  Link as LinkIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface WhatsAppAgentsProps {
  profileId: string;
  connections: any[];
}

interface Agent {
  id: string;
  name: string;
  avatar_color: string;
  avatar_icon: string;
  connection_id: string | null;
  system_prompt: string | null;
  is_active: boolean;
  knowledge_base: any;
  settings: any;
}

const AGENT_COLORS = [
  "#10b981", // green
  "#3b82f6", // blue
  "#8b5cf6", // purple
  "#f59e0b", // amber
  "#ef4444", // red
  "#ec4899", // pink
];

export const WhatsAppAgents = ({ profileId, connections }: WhatsAppAgentsProps) => {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [editingAgent, setEditingAgent] = useState<Agent | null>(null);
  const [activeTab, setActiveTab] = useState("identity");

  const [formData, setFormData] = useState({
    name: "",
    avatar_color: "#10b981",
    connection_id: "",
    system_prompt: "",
  });

  useEffect(() => {
    fetchAgents();
  }, [profileId]);

  const fetchAgents = async () => {
    try {
      const { data, error } = await supabase
        .from("whatsapp_ai_agents")
        .select("*")
        .eq("professional_id", profileId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setAgents(data || []);
    } catch (error) {
      console.error("Error fetching agents:", error);
      toast.error("Erro ao carregar agentes");
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenDialog = (agent?: Agent) => {
    if (agent) {
      setEditingAgent(agent);
      setFormData({
        name: agent.name,
        avatar_color: agent.avatar_color,
        connection_id: agent.connection_id || "",
        system_prompt: agent.system_prompt || "",
      });
    } else {
      setEditingAgent(null);
      setFormData({
        name: "",
        avatar_color: "#10b981",
        connection_id: "",
        system_prompt: "",
      });
    }
    setActiveTab("identity");
    setIsDialogOpen(true);
  };

  const handleSave = async () => {
    if (!formData.name.trim()) {
      toast.error("Informe o nome do agente");
      return;
    }

    if (!formData.connection_id) {
      toast.error("Selecione uma conexão");
      return;
    }

    setIsCreating(true);

    try {
      if (editingAgent) {
        // Update existing agent
        const { error } = await supabase
          .from("whatsapp_ai_agents")
          .update({
            name: formData.name,
            avatar_color: formData.avatar_color,
            connection_id: formData.connection_id,
            system_prompt: formData.system_prompt,
          })
          .eq("id", editingAgent.id);

        if (error) throw error;

        setAgents(agents.map(a => 
          a.id === editingAgent.id 
            ? { ...a, ...formData }
            : a
        ));
        toast.success("Agente atualizado!");
      } else {
        // Create new agent
        const { data, error } = await supabase
          .from("whatsapp_ai_agents")
          .insert({
            professional_id: profileId,
            name: formData.name,
            avatar_color: formData.avatar_color,
            connection_id: formData.connection_id,
            system_prompt: formData.system_prompt,
            is_active: true,
            knowledge_base: [],
            settings: {},
          })
          .select()
          .single();

        if (error) throw error;

        setAgents([data, ...agents]);
        toast.success("Agente criado!");
      }

      setIsDialogOpen(false);
    } catch (error) {
      console.error("Error saving agent:", error);
      toast.error("Erro ao salvar agente");
    } finally {
      setIsCreating(false);
    }
  };

  const handleToggleActive = async (agent: Agent) => {
    try {
      const { error } = await supabase
        .from("whatsapp_ai_agents")
        .update({ is_active: !agent.is_active })
        .eq("id", agent.id);

      if (error) throw error;

      setAgents(agents.map(a => 
        a.id === agent.id 
          ? { ...a, is_active: !a.is_active }
          : a
      ));
      toast.success(agent.is_active ? "Agente desativado" : "Agente ativado");
    } catch (error) {
      console.error("Error toggling agent:", error);
      toast.error("Erro ao atualizar agente");
    }
  };

  const handleDelete = async (agentId: string) => {
    try {
      const { error } = await supabase
        .from("whatsapp_ai_agents")
        .delete()
        .eq("id", agentId);

      if (error) throw error;

      setAgents(agents.filter(a => a.id !== agentId));
      toast.success("Agente excluído!");
    } catch (error) {
      console.error("Error deleting agent:", error);
      toast.error("Erro ao excluir agente");
    }
  };

  const insertFormatting = (format: string) => {
    const textarea = document.querySelector('textarea[name="system_prompt"]') as HTMLTextAreaElement;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = formData.system_prompt;
    const selectedText = text.substring(start, end);

    let newText = "";
    let cursorOffset = 0;

    switch (format) {
      case "bold":
        newText = text.substring(0, start) + `**${selectedText}**` + text.substring(end);
        cursorOffset = selectedText ? 4 : 2;
        break;
      case "italic":
        newText = text.substring(0, start) + `*${selectedText}*` + text.substring(end);
        cursorOffset = selectedText ? 2 : 1;
        break;
      case "h1":
        newText = text.substring(0, start) + `# ${selectedText}` + text.substring(end);
        cursorOffset = 2;
        break;
      case "h2":
        newText = text.substring(0, start) + `## ${selectedText}` + text.substring(end);
        cursorOffset = 3;
        break;
      case "h3":
        newText = text.substring(0, start) + `### ${selectedText}` + text.substring(end);
        cursorOffset = 4;
        break;
      case "list":
        newText = text.substring(0, start) + `- ${selectedText}` + text.substring(end);
        cursorOffset = 2;
        break;
      case "link":
        newText = text.substring(0, start) + `[${selectedText}](url)` + text.substring(end);
        cursorOffset = selectedText ? selectedText.length + 7 : 1;
        break;
      default:
        return;
    }

    setFormData({ ...formData, system_prompt: newText });
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(end + cursorOffset, end + cursorOffset);
    }, 0);
  };

  const getConnectionName = (connectionId: string | null) => {
    if (!connectionId) return "Não vinculado";
    const connection = connections.find(c => c.id === connectionId);
    return connection?.name || "Conexão desconhecida";
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-green-500" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Agentes IA</h1>
          <p className="text-muted-foreground">
            Crie e gerencie seus agentes de inteligência artificial
          </p>
        </div>
        <Button
          onClick={() => handleOpenDialog()}
          className="bg-green-500 hover:bg-green-600 text-white"
        >
          <Plus className="h-4 w-4 mr-2" />
          Criar Agente
        </Button>
      </div>

      {/* Agents Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {agents.map((agent) => (
          <Card key={agent.id} className="relative overflow-hidden">
            <div
              className="absolute top-0 left-0 w-1 h-full"
              style={{ backgroundColor: agent.avatar_color }}
            />
            <CardContent className="p-4 pl-5">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className="w-12 h-12 rounded-lg flex items-center justify-center"
                    style={{ backgroundColor: agent.avatar_color }}
                  >
                    <Bot className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold">{agent.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      {getConnectionName(agent.connection_id)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge
                    variant={agent.is_active ? "default" : "secondary"}
                    className={cn(
                      agent.is_active && "bg-green-500"
                    )}
                  >
                    {agent.is_active ? "Ativo" : "Inativo"}
                  </Badge>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleOpenDialog(agent)}>
                        <Pencil className="h-4 w-4 mr-2" />
                        Editar
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleToggleActive(agent)}>
                        <Power className="h-4 w-4 mr-2" />
                        {agent.is_active ? "Desativar" : "Ativar"}
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleDelete(agent.id)}
                        className="text-destructive"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Excluir
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>

              {agent.system_prompt && (
                <p className="text-sm text-muted-foreground mt-3 line-clamp-2">
                  {agent.system_prompt}
                </p>
              )}
            </CardContent>
          </Card>
        ))}

        {agents.length === 0 && (
          <Card className="col-span-full">
            <CardContent className="py-12 text-center">
              <Bot className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="font-semibold mb-2">Nenhum agente</h3>
              <p className="text-muted-foreground mb-4">
                Crie seu primeiro agente de IA
              </p>
              <Button
                onClick={() => handleOpenDialog()}
                className="bg-green-500 hover:bg-green-600"
              >
                <Plus className="h-4 w-4 mr-2" />
                Criar Agente
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Create/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingAgent ? "Editar Agente" : "Criar Novo Agente"}
            </DialogTitle>
            <DialogDescription>
              Preencha os dados abaixo para {editingAgent ? "atualizar o" : "criar um novo"} agente de IA
            </DialogDescription>
          </DialogHeader>

          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="identity" className="text-green-600 data-[state=active]:text-green-600">
                Identidade e Instruções
              </TabsTrigger>
              <TabsTrigger value="knowledge">Conhecimento</TabsTrigger>
              <TabsTrigger value="config">Configurações</TabsTrigger>
            </TabsList>

            <TabsContent value="identity" className="space-y-6 py-4">
              <div className="flex gap-6">
                {/* Avatar Color */}
                <div className="space-y-3">
                  <div
                    className="w-20 h-20 rounded-xl flex items-center justify-center"
                    style={{ backgroundColor: formData.avatar_color }}
                  >
                    <Bot className="h-10 w-10 text-white" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs">Cor do Agente</Label>
                    <div className="flex gap-1 flex-wrap w-20">
                      {AGENT_COLORS.map((color) => (
                        <button
                          key={color}
                          type="button"
                          className={cn(
                            "w-6 h-6 rounded-md transition-all",
                            formData.avatar_color === color && "ring-2 ring-offset-2 ring-black"
                          )}
                          style={{ backgroundColor: color }}
                          onClick={() => setFormData({ ...formData, avatar_color: color })}
                        />
                      ))}
                    </div>
                  </div>
                </div>

                {/* Name and Connection */}
                <div className="flex-1 space-y-4">
                  <div className="space-y-2">
                    <Label>Nome do Agente *</Label>
                    <Input
                      placeholder="Digite o nome do agente"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>WhatsApp vinculado *</Label>
                    <Select
                      value={formData.connection_id}
                      onValueChange={(value) => setFormData({ ...formData, connection_id: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione uma conexão..." />
                      </SelectTrigger>
                      <SelectContent>
                        {connections.map((conn) => (
                          <SelectItem key={conn.id} value={conn.id}>
                            <div className="flex items-center gap-2">
                              <MessageCircle className="h-4 w-4 text-green-500" />
                              <span>{conn.name}</span>
                              <Badge variant="outline" className="ml-2 text-xs">
                                {conn.status === "connected" ? "Conectado" : "Desconectado"}
                              </Badge>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {/* System Prompt */}
              <div className="space-y-2">
                <Label>Instruções do Agente</Label>
                <div className="border rounded-lg">
                  <div className="flex gap-1 p-2 border-b bg-muted/30">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => insertFormatting("bold")}
                    >
                      <Bold className="h-4 w-4" />
                      <span className="ml-1 text-xs">Negrito</span>
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => insertFormatting("italic")}
                    >
                      <Italic className="h-4 w-4" />
                      <span className="ml-1 text-xs">Itálico</span>
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => insertFormatting("h1")}
                    >
                      <Heading1 className="h-4 w-4" />
                      <span className="ml-1 text-xs">H1</span>
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => insertFormatting("h2")}
                    >
                      <Heading2 className="h-4 w-4" />
                      <span className="ml-1 text-xs">H2</span>
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => insertFormatting("h3")}
                    >
                      <Heading3 className="h-4 w-4" />
                      <span className="ml-1 text-xs">H3</span>
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => insertFormatting("list")}
                    >
                      <List className="h-4 w-4" />
                      <span className="ml-1 text-xs">Lista</span>
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => insertFormatting("link")}
                    >
                      <LinkIcon className="h-4 w-4" />
                      <span className="ml-1 text-xs">Link</span>
                    </Button>
                  </div>
                  <Textarea
                    name="system_prompt"
                    placeholder="Digite as instruções para o agente... Use os botões acima para formatar o texto."
                    value={formData.system_prompt}
                    onChange={(e) => setFormData({ ...formData, system_prompt: e.target.value })}
                    className="min-h-[200px] border-0 focus-visible:ring-0 rounded-t-none"
                  />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="knowledge" className="py-4">
              <div className="text-center py-12">
                <p className="text-muted-foreground">
                  Em breve: Upload de documentos para base de conhecimento
                </p>
              </div>
            </TabsContent>

            <TabsContent value="config" className="py-4">
              <div className="text-center py-12">
                <p className="text-muted-foreground">
                  Em breve: Configurações avançadas do agente
                </p>
              </div>
            </TabsContent>
          </Tabs>

          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancelar
            </Button>
            <Button
              onClick={handleSave}
              disabled={isCreating}
              className="bg-green-500 hover:bg-green-600"
            >
              {isCreating ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Salvando...
                </>
              ) : (
                <>
                  <Bot className="h-4 w-4 mr-2" />
                  {editingAgent ? "Salvar Alterações" : "Criar Agente"}
                </>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
