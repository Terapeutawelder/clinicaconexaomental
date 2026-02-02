import { useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Plus,
  Pencil,
  Trash2,
  MessageCircle,
  X,
  Loader2,
  Send,
  CalendarIcon,
  Clock,
  GripVertical,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface WhatsAppCRMProps {
  profileId: string;
  connections: any[];
}

interface Stage {
  id: string;
  name: string;
  color: string;
  order_index: number;
}

interface Lead {
  id: string;
  name: string;
  phone: string;
  value_cents: number;
  tags: string[];
  notes: string | null;
  stage_id: string;
  last_interaction_at: string | null;
  connection_id: string | null;
  scheduled_date: string | null;
  scheduled_time: string | null;
  is_scheduled: boolean;
}

const DEFAULT_STAGES: Omit<Stage, "id">[] = [
  { name: "Novo Lead", color: "#f59e0b", order_index: 0 },
  { name: "Contato Realizado", color: "#3b82f6", order_index: 1 },
  { name: "Agendado", color: "#8b5cf6", order_index: 2 },
  { name: "Venda Realizada", color: "#10b981", order_index: 3 },
  { name: "Perdido", color: "#ef4444", order_index: 4 },
];

const TIME_SLOTS = [
  "08:00", "08:30", "09:00", "09:30", "10:00", "10:30", 
  "11:00", "11:30", "12:00", "12:30", "13:00", "13:30",
  "14:00", "14:30", "15:00", "15:30", "16:00", "16:30",
  "17:00", "17:30", "18:00", "18:30", "19:00", "19:30", "20:00"
];

export const WhatsAppCRM = ({ profileId, connections }: WhatsAppCRMProps) => {
  const [stages, setStages] = useState<Stage[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddingStage, setIsAddingStage] = useState(false);
  const [newStageName, setNewStageName] = useState("");
  const [editingStage, setEditingStage] = useState<Stage | null>(null);
  const [isAddingLead, setIsAddingLead] = useState<string | null>(null);
  const [editingLead, setEditingLead] = useState<Lead | null>(null);
  const [chatLead, setChatLead] = useState<Lead | null>(null);
  const [chatMessages, setChatMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [isSendingMessage, setIsSendingMessage] = useState(false);
  
  // Drag and drop state
  const [draggedLead, setDraggedLead] = useState<Lead | null>(null);
  const [dragOverStage, setDragOverStage] = useState<string | null>(null);

  const [newLead, setNewLead] = useState({
    name: "",
    phone: "",
    value: "",
    notes: "",
  });

  // Scheduling state for edit modal
  const [scheduledDate, setScheduledDate] = useState<Date | undefined>(undefined);
  const [scheduledTime, setScheduledTime] = useState<string>("");

  useEffect(() => {
    fetchData();
  }, [profileId]);

  // Reset scheduling when editing lead changes
  useEffect(() => {
    if (editingLead) {
      setScheduledDate(editingLead.scheduled_date ? new Date(editingLead.scheduled_date) : undefined);
      setScheduledTime(editingLead.scheduled_time || "");
    } else {
      setScheduledDate(undefined);
      setScheduledTime("");
    }
  }, [editingLead]);

  const fetchData = async () => {
    try {
      // Fetch stages
      const { data: stagesData, error: stagesError } = await supabase
        .from("whatsapp_crm_stages")
        .select("*")
        .eq("professional_id", profileId)
        .order("order_index");

      if (stagesError) throw stagesError;

      // If no stages, create defaults
      if (!stagesData || stagesData.length === 0) {
        const { data: newStages, error: createError } = await supabase
          .from("whatsapp_crm_stages")
          .insert(DEFAULT_STAGES.map(s => ({ ...s, professional_id: profileId })))
          .select();

        if (createError) throw createError;
        setStages(newStages || []);
      } else {
        setStages(stagesData);
      }

      // Fetch leads
      const { data: leadsData, error: leadsError } = await supabase
        .from("whatsapp_crm_leads")
        .select("*")
        .eq("professional_id", profileId)
        .order("created_at", { ascending: false });

      if (leadsError) throw leadsError;
      setLeads(leadsData || []);
    } catch (error) {
      console.error("Error fetching CRM data:", error);
      toast.error("Erro ao carregar dados");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddStage = async () => {
    if (!newStageName.trim()) return;

    try {
      const maxOrder = stages.length > 0 ? Math.max(...stages.map(s => s.order_index)) : -1;
      
      const { data, error } = await supabase
        .from("whatsapp_crm_stages")
        .insert({
          professional_id: profileId,
          name: newStageName,
          color: "#10b981",
          order_index: maxOrder + 1,
        })
        .select()
        .single();

      if (error) throw error;

      setStages([...stages, data]);
      setNewStageName("");
      setIsAddingStage(false);
      toast.success("Etapa criada!");
    } catch (error) {
      console.error("Error adding stage:", error);
      toast.error("Erro ao criar etapa");
    }
  };

  const handleUpdateStage = async () => {
    if (!editingStage) return;

    try {
      const { error } = await supabase
        .from("whatsapp_crm_stages")
        .update({ name: editingStage.name, color: editingStage.color })
        .eq("id", editingStage.id);

      if (error) throw error;

      setStages(stages.map(s => s.id === editingStage.id ? editingStage : s));
      setEditingStage(null);
      toast.success("Etapa atualizada!");
    } catch (error) {
      console.error("Error updating stage:", error);
      toast.error("Erro ao atualizar etapa");
    }
  };

  const handleDeleteStage = async (stageId: string) => {
    try {
      const { error } = await supabase
        .from("whatsapp_crm_stages")
        .delete()
        .eq("id", stageId);

      if (error) throw error;

      setStages(stages.filter(s => s.id !== stageId));
      toast.success("Etapa excluída!");
    } catch (error) {
      console.error("Error deleting stage:", error);
      toast.error("Erro ao excluir etapa");
    }
  };

  const handleAddLead = async (stageId: string) => {
    if (!newLead.name.trim() || !newLead.phone.trim()) {
      toast.error("Preencha nome e telefone");
      return;
    }

    try {
      const { data, error } = await supabase
        .from("whatsapp_crm_leads")
        .insert({
          professional_id: profileId,
          stage_id: stageId,
          name: newLead.name,
          phone: newLead.phone,
          value_cents: Math.round(parseFloat(newLead.value || "0") * 100),
          notes: newLead.notes || null,
          tags: [],
        })
        .select()
        .single();

      if (error) throw error;

      setLeads([data, ...leads]);
      setNewLead({ name: "", phone: "", value: "", notes: "" });
      setIsAddingLead(null);
      toast.success("Lead adicionado!");
    } catch (error) {
      console.error("Error adding lead:", error);
      toast.error("Erro ao adicionar lead");
    }
  };

  const handleUpdateLead = async () => {
    if (!editingLead) return;

    try {
      const updateData = {
        name: editingLead.name,
        phone: editingLead.phone,
        value_cents: editingLead.value_cents,
        notes: editingLead.notes,
        scheduled_date: scheduledDate ? format(scheduledDate, "yyyy-MM-dd") : null,
        scheduled_time: scheduledTime || null,
        is_scheduled: !!(scheduledDate && scheduledTime),
      };

      const { error } = await supabase
        .from("whatsapp_crm_leads")
        .update(updateData)
        .eq("id", editingLead.id);

      if (error) throw error;

      setLeads(leads.map(l => l.id === editingLead.id ? { 
        ...editingLead, 
        scheduled_date: updateData.scheduled_date,
        scheduled_time: updateData.scheduled_time,
        is_scheduled: updateData.is_scheduled,
      } : l));
      setEditingLead(null);
      toast.success("Lead atualizado!");
    } catch (error) {
      console.error("Error updating lead:", error);
      toast.error("Erro ao atualizar lead");
    }
  };

  const handleDeleteLead = async (leadId: string) => {
    try {
      const { error } = await supabase
        .from("whatsapp_crm_leads")
        .delete()
        .eq("id", leadId);

      if (error) throw error;

      setLeads(leads.filter(l => l.id !== leadId));
      toast.success("Lead excluído!");
    } catch (error) {
      console.error("Error deleting lead:", error);
      toast.error("Erro ao excluir lead");
    }
  };

  const handleMoveLead = async (leadId: string, newStageId: string) => {
    try {
      const { error } = await supabase
        .from("whatsapp_crm_leads")
        .update({ stage_id: newStageId })
        .eq("id", leadId);

      if (error) throw error;

      setLeads(leads.map(l => l.id === leadId ? { ...l, stage_id: newStageId } : l));
    } catch (error) {
      console.error("Error moving lead:", error);
      toast.error("Erro ao mover lead");
    }
  };

  // Drag and Drop handlers
  const handleDragStart = (e: React.DragEvent, lead: Lead) => {
    setDraggedLead(lead);
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", lead.id);
    
    // Add a slight delay for visual feedback
    setTimeout(() => {
      const element = e.target as HTMLElement;
      element.style.opacity = "0.5";
    }, 0);
  };

  const handleDragEnd = (e: React.DragEvent) => {
    const element = e.target as HTMLElement;
    element.style.opacity = "1";
    setDraggedLead(null);
    setDragOverStage(null);
  };

  const handleDragOver = (e: React.DragEvent, stageId: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    setDragOverStage(stageId);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOverStage(null);
  };

  const handleDrop = async (e: React.DragEvent, stageId: string) => {
    e.preventDefault();
    setDragOverStage(null);
    
    if (draggedLead && draggedLead.stage_id !== stageId) {
      await handleMoveLead(draggedLead.id, stageId);
    }
    setDraggedLead(null);
  };

  const openChat = async (lead: Lead) => {
    setChatLead(lead);
    
    // Fetch messages for this lead
    try {
      const { data, error } = await supabase
        .from("whatsapp_messages")
        .select("*")
        .eq("professional_id", profileId)
        .eq("lead_id", lead.id)
        .order("sent_at", { ascending: true });

      if (error) throw error;
      setChatMessages(data || []);
    } catch (error) {
      console.error("Error fetching messages:", error);
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !chatLead) return;

    setIsSendingMessage(true);
    try {
      const connection = connections.find(c => c.status === "connected");
      
      const { data, error } = await supabase
        .from("whatsapp_messages")
        .insert({
          professional_id: profileId,
          connection_id: connection?.id || chatLead.connection_id,
          lead_id: chatLead.id,
          phone: chatLead.phone,
          content: newMessage,
          direction: "outbound",
          status: "sent",
        })
        .select()
        .single();

      if (error) throw error;

      setChatMessages([...chatMessages, data]);
      setNewMessage("");
      
      // Update last interaction
      await supabase
        .from("whatsapp_crm_leads")
        .update({ last_interaction_at: new Date().toISOString() })
        .eq("id", chatLead.id);

      toast.success("Mensagem enviada!");
    } catch (error) {
      console.error("Error sending message:", error);
      toast.error("Erro ao enviar mensagem");
    } finally {
      setIsSendingMessage(false);
    }
  };

  const getStageTotal = (stageId: string) => {
    const stageLeads = leads.filter(l => l.stage_id === stageId);
    const total = stageLeads.reduce((acc, l) => acc + (l.value_cents || 0), 0);
    return {
      count: stageLeads.length,
      total: total / 100,
    };
  };

  const formatCurrency = (cents: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(cents / 100);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-green-500" />
      </div>
    );
  }

  return (
    <div className="p-6 h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">CRM Kanban</h1>
          <p className="text-muted-foreground">
            Arraste e solte os cards entre as etapas
          </p>
        </div>
        <Button
          onClick={() => setIsAddingStage(true)}
          className="bg-green-500 hover:bg-green-600 text-white"
        >
          <Plus className="h-4 w-4 mr-2" />
          Nova Etapa
        </Button>
      </div>

      {/* Kanban Board */}
      <div className="flex-1 overflow-x-auto">
        <div className="flex gap-4 h-full min-w-max pb-4">
          {stages.map((stage) => {
            const stageStats = getStageTotal(stage.id);
            const stageLeads = leads.filter(l => l.stage_id === stage.id);
            const isDropTarget = dragOverStage === stage.id;

            return (
              <div
                key={stage.id}
                className={cn(
                  "w-80 flex-shrink-0 flex flex-col bg-muted/30 rounded-lg border-2 transition-all duration-200",
                  isDropTarget ? "border-green-500 bg-green-50/10" : "border-transparent"
                )}
                onDragOver={(e) => handleDragOver(e, stage.id)}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, stage.id)}
              >
                {/* Stage Header */}
                <div 
                  className="p-3 border-b border-border rounded-t-lg"
                  style={{ backgroundColor: `${stage.color}15` }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-3 h-3 rounded-full" 
                        style={{ backgroundColor: stage.color }}
                      />
                      <h3 className="font-semibold">{stage.name}</h3>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-6 w-6">
                            <Pencil className="h-3 w-3" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="bg-popover">
                          <DropdownMenuItem onClick={() => setEditingStage(stage)}>
                            <Pencil className="h-4 w-4 mr-2" />
                            Editar
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleDeleteStage(stage.id)}
                            className="text-destructive"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Excluir
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                    <Badge variant="secondary" className="text-xs">
                      {stageStats.count} - R$ {stageStats.total.toLocaleString("pt-BR")}
                    </Badge>
                  </div>
                </div>

                {/* Lead Cards */}
                <div className="flex-1 overflow-y-auto p-2 space-y-2 min-h-[200px]">
                  {stageLeads.map((lead) => (
                    <Card
                      key={lead.id}
                      draggable
                      onDragStart={(e) => handleDragStart(e, lead)}
                      onDragEnd={handleDragEnd}
                      className={cn(
                        "cursor-grab hover:shadow-md transition-all duration-200 active:cursor-grabbing",
                        draggedLead?.id === lead.id && "opacity-50 scale-95"
                      )}
                    >
                      <CardContent className="p-3">
                        <div className="flex items-start gap-2">
                          <GripVertical className="h-4 w-4 text-muted-foreground mt-1 flex-shrink-0" />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between">
                              <div className="flex-1 min-w-0">
                                <h4 className="font-medium truncate">{lead.name}</h4>
                                <p className="text-sm text-muted-foreground truncate">{lead.phone}</p>
                              </div>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                                  <Button variant="ghost" size="icon" className="h-7 w-7 flex-shrink-0">
                                    <MessageCircle className="h-4 w-4 text-green-500" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent className="bg-popover">
                                  <DropdownMenuItem onClick={(e) => {
                                    e.stopPropagation();
                                    openChat(lead);
                                  }}>
                                    <MessageCircle className="h-4 w-4 mr-2" />
                                    Abrir Chat
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={(e) => {
                                    e.stopPropagation();
                                    setEditingLead(lead);
                                  }}>
                                    <Pencil className="h-4 w-4 mr-2" />
                                    Editar
                                  </DropdownMenuItem>
                                  {stages.filter(s => s.id !== lead.stage_id).map(s => (
                                    <DropdownMenuItem
                                      key={s.id}
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleMoveLead(lead.id, s.id);
                                      }}
                                    >
                                      Mover para {s.name}
                                    </DropdownMenuItem>
                                  ))}
                                  <DropdownMenuItem
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleDeleteLead(lead.id);
                                    }}
                                    className="text-destructive"
                                  >
                                    <Trash2 className="h-4 w-4 mr-2" />
                                    Excluir
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                            
                            <p className="text-lg font-bold text-green-600 mt-1">
                              {formatCurrency(lead.value_cents)}
                            </p>
                            
                            {/* Scheduling Info */}
                            {lead.is_scheduled && lead.scheduled_date && (
                              <div className="flex items-center gap-1 mt-2 text-xs text-purple-600 bg-purple-50 dark:bg-purple-500/10 px-2 py-1 rounded">
                                <CalendarIcon className="h-3 w-3" />
                                <span>
                                  {format(new Date(lead.scheduled_date), "dd/MM/yyyy", { locale: ptBR })}
                                  {lead.scheduled_time && ` às ${lead.scheduled_time}`}
                                </span>
                              </div>
                            )}
                            
                            {lead.notes && (
                              <p className="text-xs text-muted-foreground truncate mt-2">
                                {lead.notes}
                              </p>
                            )}
                            
                            {lead.tags && lead.tags.length > 0 && (
                              <div className="flex gap-1 mt-2 flex-wrap">
                                {lead.tags.slice(0, 2).map((tag, i) => (
                                  <Badge key={i} variant="outline" className="text-xs">
                                    {tag}
                                  </Badge>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                  
                  {/* Drop zone indicator */}
                  {isDropTarget && stageLeads.length === 0 && (
                    <div className="h-24 border-2 border-dashed border-green-400 rounded-lg flex items-center justify-center text-green-600 text-sm">
                      Solte aqui
                    </div>
                  )}
                </div>

                {/* Add Card Button */}
                <div className="p-2 border-t border-border/50">
                  {isAddingLead === stage.id ? (
                    <Card className="p-3">
                      <div className="space-y-2">
                        <Input
                          placeholder="Nome"
                          value={newLead.name}
                          onChange={(e) => setNewLead({ ...newLead, name: e.target.value })}
                        />
                        <Input
                          placeholder="Telefone"
                          value={newLead.phone}
                          onChange={(e) => setNewLead({ ...newLead, phone: e.target.value })}
                        />
                        <Input
                          placeholder="Valor (R$)"
                          type="number"
                          value={newLead.value}
                          onChange={(e) => setNewLead({ ...newLead, value: e.target.value })}
                        />
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            onClick={() => handleAddLead(stage.id)}
                            className="flex-1 bg-green-500 hover:bg-green-600"
                          >
                            Adicionar
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setIsAddingLead(null);
                              setNewLead({ name: "", phone: "", value: "", notes: "" });
                            }}
                          >
                            Cancelar
                          </Button>
                        </div>
                      </div>
                    </Card>
                  ) : (
                    <Button
                      variant="ghost"
                      className="w-full text-green-600 hover:text-green-700 hover:bg-green-50 dark:hover:bg-green-500/10"
                      onClick={() => setIsAddingLead(stage.id)}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Adicionar Card
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Add Stage Dialog */}
      <Dialog open={isAddingStage} onOpenChange={setIsAddingStage}>
        <DialogContent className="bg-background">
          <DialogHeader>
            <DialogTitle>Nova Etapa</DialogTitle>
            <DialogDescription>
              Crie uma nova etapa para organizar seus leads
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Nome da Etapa</Label>
              <Input
                placeholder="Ex: Em Negociação"
                value={newStageName}
                onChange={(e) => setNewStageName(e.target.value)}
              />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setIsAddingStage(false)}>
              Cancelar
            </Button>
            <Button onClick={handleAddStage} className="bg-green-500 hover:bg-green-600">
              Criar
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Stage Dialog */}
      <Dialog open={!!editingStage} onOpenChange={() => setEditingStage(null)}>
        <DialogContent className="bg-background">
          <DialogHeader>
            <DialogTitle>Editar Etapa</DialogTitle>
          </DialogHeader>
          {editingStage && (
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Nome da Etapa</Label>
                <Input
                  value={editingStage.name}
                  onChange={(e) => setEditingStage({ ...editingStage, name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Cor</Label>
                <div className="flex gap-2">
                  {["#f59e0b", "#3b82f6", "#8b5cf6", "#10b981", "#ef4444", "#ec4899", "#06b6d4"].map(color => (
                    <button
                      key={color}
                      className={cn(
                        "w-8 h-8 rounded-full border-2 transition-all",
                        editingStage.color === color ? "border-foreground scale-110" : "border-transparent"
                      )}
                      style={{ backgroundColor: color }}
                      onClick={() => setEditingStage({ ...editingStage, color })}
                    />
                  ))}
                </div>
              </div>
            </div>
          )}
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setEditingStage(null)}>
              Cancelar
            </Button>
            <Button onClick={handleUpdateStage} className="bg-green-500 hover:bg-green-600">
              Salvar
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Lead Dialog with Calendar */}
      <Dialog open={!!editingLead} onOpenChange={() => setEditingLead(null)}>
        <DialogContent className="bg-background max-w-md">
          <DialogHeader>
            <DialogTitle>Editar Lead</DialogTitle>
          </DialogHeader>
          {editingLead && (
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Nome</Label>
                <Input
                  value={editingLead.name}
                  onChange={(e) => setEditingLead({ ...editingLead, name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Telefone</Label>
                <Input
                  value={editingLead.phone}
                  onChange={(e) => setEditingLead({ ...editingLead, phone: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Valor (R$)</Label>
                <Input
                  type="number"
                  value={(editingLead.value_cents / 100).toString()}
                  onChange={(e) => setEditingLead({ 
                    ...editingLead, 
                    value_cents: Math.round(parseFloat(e.target.value || "0") * 100) 
                  })}
                />
              </div>
              <div className="space-y-2">
                <Label>Observações</Label>
                <Textarea
                  value={editingLead.notes || ""}
                  onChange={(e) => setEditingLead({ ...editingLead, notes: e.target.value })}
                />
              </div>
              
              {/* Scheduling Section */}
              <div className="space-y-3 pt-4 border-t">
                <Label className="flex items-center gap-2">
                  <CalendarIcon className="h-4 w-4 text-purple-500" />
                  Agendamento
                </Label>
                
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label className="text-xs text-muted-foreground">Data</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !scheduledDate && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {scheduledDate ? format(scheduledDate, "dd/MM/yyyy", { locale: ptBR }) : "Selecionar"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0 bg-popover" align="start">
                        <Calendar
                          mode="single"
                          selected={scheduledDate}
                          onSelect={setScheduledDate}
                          initialFocus
                          className="p-3 pointer-events-auto"
                          locale={ptBR}
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                  
                  <div className="space-y-2">
                    <Label className="text-xs text-muted-foreground">Horário</Label>
                    <Select value={scheduledTime} onValueChange={setScheduledTime}>
                      <SelectTrigger>
                        <SelectValue placeholder="Horário">
                          {scheduledTime ? (
                            <span className="flex items-center gap-2">
                              <Clock className="h-4 w-4" />
                              {scheduledTime}
                            </span>
                          ) : (
                            "Selecionar"
                          )}
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent className="bg-popover max-h-[200px]">
                        {TIME_SLOTS.map((time) => (
                          <SelectItem key={time} value={time}>
                            {time}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                {scheduledDate && scheduledTime && (
                  <div className="flex items-center justify-between p-2 bg-purple-50 dark:bg-purple-500/10 rounded-lg">
                    <span className="text-sm text-purple-700 dark:text-purple-300">
                      Agendado para {format(scheduledDate, "dd/MM/yyyy", { locale: ptBR })} às {scheduledTime}
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setScheduledDate(undefined);
                        setScheduledTime("");
                      }}
                      className="h-6 w-6 p-0 text-purple-600"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>
            </div>
          )}
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setEditingLead(null)}>
              Cancelar
            </Button>
            <Button onClick={handleUpdateLead} className="bg-green-500 hover:bg-green-600">
              Salvar
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Chat Dialog */}
      <Dialog open={!!chatLead} onOpenChange={() => setChatLead(null)}>
        <DialogContent className="max-w-lg h-[600px] flex flex-col bg-background">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center text-white font-semibold">
                {chatLead?.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <div>{chatLead?.name}</div>
                <div className="text-sm font-normal text-muted-foreground">
                  {chatLead?.phone}
                </div>
              </div>
            </DialogTitle>
          </DialogHeader>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto space-y-2 p-4 bg-muted/20 rounded-lg">
            {chatMessages.length === 0 ? (
              <div className="text-center text-muted-foreground py-8">
                Nenhuma mensagem ainda
              </div>
            ) : (
              chatMessages.map((msg) => (
                <div
                  key={msg.id}
                  className={cn(
                    "max-w-[80%] p-3 rounded-lg",
                    msg.direction === "outbound"
                      ? "ml-auto bg-green-500 text-white"
                      : "bg-card"
                  )}
                >
                  <p className="text-sm">{msg.content}</p>
                  <span className="text-xs opacity-70">
                    {format(new Date(msg.sent_at), "HH:mm", { locale: ptBR })}
                  </span>
                </div>
              ))
            )}
          </div>

          {/* Input */}
          <div className="flex gap-2 pt-4">
            <Input
              placeholder="Digite uma mensagem..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
            />
            <Button
              onClick={handleSendMessage}
              disabled={isSendingMessage || !newMessage.trim()}
              className="bg-green-500 hover:bg-green-600"
            >
              {isSendingMessage ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
