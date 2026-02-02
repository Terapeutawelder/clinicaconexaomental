import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import { 
  Search, 
  Send, 
  Paperclip, 
  Smile, 
  MoreVertical,
  Phone,
  Video,
  Star,
  Archive,
  Trash2,
  Check,
  CheckCheck,
  Clock,
  Image as ImageIcon,
  Mic,
  Filter,
  RefreshCw,
  MessageCircle,
  User,
  Bot
} from "lucide-react";
import { cn } from "@/lib/utils";
import { format, formatDistanceToNow, isToday, isYesterday } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface WhatsAppConversationsProps {
  profileId: string;
  connections: any[];
}

interface Conversation {
  id: string;
  contact_name: string;
  contact_phone: string;
  contact_avatar?: string;
  last_message: string;
  last_message_time: string;
  unread_count: number;
  is_starred: boolean;
  is_archived: boolean;
  connection_id: string;
  is_ai_active: boolean;
}

interface Message {
  id: string;
  content: string;
  message_type: "text" | "image" | "audio" | "document" | "video";
  direction: "incoming" | "outgoing";
  status: "sent" | "delivered" | "read" | "failed";
  created_at: string;
  sender_name?: string;
  media_url?: string;
  is_from_ai?: boolean;
}

export const WhatsAppConversations = ({ profileId, connections }: WhatsAppConversationsProps) => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [activeFilter, setActiveFilter] = useState<"all" | "unread" | "starred" | "archived">("all");
  const [selectedConnectionFilter, setSelectedConnectionFilter] = useState<string>("all");

  useEffect(() => {
    fetchConversations();
  }, [profileId]);

  useEffect(() => {
    if (selectedConversation) {
      fetchMessages(selectedConversation.id);
    }
  }, [selectedConversation]);

  const fetchConversations = async () => {
    setIsLoading(true);
    try {
      // For now, using mock data since the table structure needs to be created
      // In production, this would fetch from whatsapp_conversations table
      const mockConversations: Conversation[] = [
        {
          id: "1",
          contact_name: "Maria Silva",
          contact_phone: "5511999998888",
          last_message: "Olá, gostaria de agendar uma consulta",
          last_message_time: new Date().toISOString(),
          unread_count: 3,
          is_starred: true,
          is_archived: false,
          connection_id: connections[0]?.id || "",
          is_ai_active: false,
        },
        {
          id: "2",
          contact_name: "João Santos",
          contact_phone: "5511988887777",
          last_message: "Perfeito, obrigado pela confirmação!",
          last_message_time: new Date(Date.now() - 3600000).toISOString(),
          unread_count: 0,
          is_starred: false,
          is_archived: false,
          connection_id: connections[0]?.id || "",
          is_ai_active: true,
        },
        {
          id: "3",
          contact_name: "Ana Oliveira",
          contact_phone: "5511977776666",
          last_message: "Boa tarde! Vi seu perfil e gostaria de mais informações",
          last_message_time: new Date(Date.now() - 86400000).toISOString(),
          unread_count: 1,
          is_starred: false,
          is_archived: false,
          connection_id: connections[0]?.id || "",
          is_ai_active: false,
        },
        {
          id: "4",
          contact_name: "Carlos Ferreira",
          contact_phone: "5511966665555",
          last_message: "Preciso remarcar minha sessão de amanhã",
          last_message_time: new Date(Date.now() - 172800000).toISOString(),
          unread_count: 0,
          is_starred: true,
          is_archived: false,
          connection_id: connections[0]?.id || "",
          is_ai_active: false,
        },
      ];
      
      setConversations(mockConversations);
    } catch (error) {
      console.error("Error fetching conversations:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchMessages = async (conversationId: string) => {
    // Mock messages for demonstration
    const mockMessages: Message[] = [
      {
        id: "m1",
        content: "Olá, boa tarde!",
        message_type: "text",
        direction: "incoming",
        status: "read",
        created_at: new Date(Date.now() - 7200000).toISOString(),
      },
      {
        id: "m2",
        content: "Olá! Tudo bem? Como posso ajudar?",
        message_type: "text",
        direction: "outgoing",
        status: "read",
        created_at: new Date(Date.now() - 7000000).toISOString(),
        is_from_ai: true,
      },
      {
        id: "m3",
        content: "Gostaria de agendar uma consulta para a próxima semana",
        message_type: "text",
        direction: "incoming",
        status: "read",
        created_at: new Date(Date.now() - 6800000).toISOString(),
      },
      {
        id: "m4",
        content: "Claro! Temos horários disponíveis na segunda e quarta-feira. Qual prefere?",
        message_type: "text",
        direction: "outgoing",
        status: "read",
        created_at: new Date(Date.now() - 6600000).toISOString(),
      },
      {
        id: "m5",
        content: "Segunda-feira às 14h seria perfeito!",
        message_type: "text",
        direction: "incoming",
        status: "read",
        created_at: new Date(Date.now() - 3600000).toISOString(),
      },
      {
        id: "m6",
        content: selectedConversation?.last_message || "",
        message_type: "text",
        direction: "incoming",
        status: "delivered",
        created_at: selectedConversation?.last_message_time || new Date().toISOString(),
      },
    ];
    
    setMessages(mockMessages);
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation) return;

    setIsSending(true);
    try {
      // Add message to list immediately for UX
      const tempMessage: Message = {
        id: `temp-${Date.now()}`,
        content: newMessage,
        message_type: "text",
        direction: "outgoing",
        status: "sent",
        created_at: new Date().toISOString(),
      };
      
      setMessages(prev => [...prev, tempMessage]);
      setNewMessage("");

      // In production, this would call the WhatsApp API to send the message
      // For now, simulate a delay and update status
      setTimeout(() => {
        setMessages(prev => 
          prev.map(m => 
            m.id === tempMessage.id 
              ? { ...m, status: "delivered" as const } 
              : m
          )
        );
      }, 1000);
    } catch (error) {
      console.error("Error sending message:", error);
    } finally {
      setIsSending(false);
    }
  };

  const formatMessageTime = (dateString: string) => {
    const date = new Date(dateString);
    if (isToday(date)) {
      return format(date, "HH:mm");
    } else if (isYesterday(date)) {
      return "Ontem";
    } else {
      return format(date, "dd/MM/yyyy");
    }
  };

  const formatChatTime = (dateString: string) => {
    return format(new Date(dateString), "HH:mm");
  };

  const getStatusIcon = (status: Message["status"]) => {
    switch (status) {
      case "sent":
        return <Check className="h-3 w-3 text-muted-foreground" />;
      case "delivered":
        return <CheckCheck className="h-3 w-3 text-muted-foreground" />;
      case "read":
        return <CheckCheck className="h-3 w-3 text-blue-500" />;
      case "failed":
        return <Clock className="h-3 w-3 text-destructive" />;
    }
  };

  const filteredConversations = conversations.filter(conv => {
    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      if (!conv.contact_name.toLowerCase().includes(query) && 
          !conv.contact_phone.includes(query) &&
          !conv.last_message.toLowerCase().includes(query)) {
        return false;
      }
    }

    // Tab filter
    switch (activeFilter) {
      case "unread":
        return conv.unread_count > 0;
      case "starred":
        return conv.is_starred;
      case "archived":
        return conv.is_archived;
      default:
        return !conv.is_archived;
    }

    // Connection filter
    if (selectedConnectionFilter !== "all" && conv.connection_id !== selectedConnectionFilter) {
      return false;
    }

    return true;
  });

  const toggleStar = (convId: string) => {
    setConversations(prev =>
      prev.map(c => c.id === convId ? { ...c, is_starred: !c.is_starred } : c)
    );
  };

  const archiveConversation = (convId: string) => {
    setConversations(prev =>
      prev.map(c => c.id === convId ? { ...c, is_archived: !c.is_archived } : c)
    );
  };

  return (
    <div className="flex h-[calc(100vh-180px)] bg-background rounded-lg overflow-hidden border border-border">
      {/* Conversations List */}
      <div className="w-96 border-r border-border flex flex-col bg-card">
        {/* Header */}
        <div className="p-4 border-b border-border space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Conversas</h2>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" onClick={fetchConversations}>
                <RefreshCw className="h-4 w-4" />
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <Filter className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem>Todas as conexões</DropdownMenuItem>
                  <DropdownMenuSeparator />
                  {connections.map(conn => (
                    <DropdownMenuItem key={conn.id}>
                      {conn.name} ({conn.phone_number})
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar conversas..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>

          {/* Filter Tabs */}
          <Tabs value={activeFilter} onValueChange={(v) => setActiveFilter(v as any)}>
            <TabsList className="w-full grid grid-cols-4">
              <TabsTrigger value="all" className="text-xs">Todas</TabsTrigger>
              <TabsTrigger value="unread" className="text-xs">Não lidas</TabsTrigger>
              <TabsTrigger value="starred" className="text-xs">Favoritas</TabsTrigger>
              <TabsTrigger value="archived" className="text-xs">Arquivadas</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* Conversations List */}
        <ScrollArea className="flex-1">
          {isLoading ? (
            <div className="flex items-center justify-center h-32">
              <div className="animate-spin rounded-full h-6 w-6 border-2 border-primary border-t-transparent" />
            </div>
          ) : filteredConversations.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-32 text-muted-foreground">
              <MessageCircle className="h-8 w-8 mb-2 opacity-50" />
              <p className="text-sm">Nenhuma conversa encontrada</p>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {filteredConversations.map((conv) => (
                <button
                  key={conv.id}
                  onClick={() => setSelectedConversation(conv)}
                  className={cn(
                    "w-full p-3 flex items-start gap-3 hover:bg-muted/50 transition-colors text-left",
                    selectedConversation?.id === conv.id && "bg-muted"
                  )}
                >
                  <div className="relative">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={conv.contact_avatar} />
                      <AvatarFallback className="bg-green-500/20 text-green-600">
                        {conv.contact_name.split(" ").map(n => n[0]).join("").substring(0, 2)}
                      </AvatarFallback>
                    </Avatar>
                    {conv.is_ai_active && (
                      <div className="absolute -bottom-1 -right-1 bg-primary rounded-full p-0.5">
                        <Bot className="h-3 w-3 text-primary-foreground" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5">
                        <span className="font-medium text-sm truncate">{conv.contact_name}</span>
                        {conv.is_starred && <Star className="h-3 w-3 text-yellow-500 fill-yellow-500" />}
                      </div>
                      <span className="text-xs text-muted-foreground flex-shrink-0">
                        {formatMessageTime(conv.last_message_time)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between gap-2 mt-0.5">
                      <p className="text-sm text-muted-foreground truncate">
                        {conv.last_message}
                      </p>
                      {conv.unread_count > 0 && (
                        <Badge className="h-5 min-w-5 flex items-center justify-center rounded-full bg-green-500 text-white text-xs">
                          {conv.unread_count}
                        </Badge>
                      )}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </ScrollArea>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col">
        {selectedConversation ? (
          <>
            {/* Chat Header */}
            <div className="p-4 border-b border-border flex items-center justify-between bg-card">
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={selectedConversation.contact_avatar} />
                  <AvatarFallback className="bg-green-500/20 text-green-600">
                    {selectedConversation.contact_name.split(" ").map(n => n[0]).join("").substring(0, 2)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold">{selectedConversation.contact_name}</h3>
                    {selectedConversation.is_ai_active && (
                      <Badge variant="secondary" className="text-xs gap-1">
                        <Bot className="h-3 w-3" />
                        IA Ativa
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    +{selectedConversation.contact_phone.replace(/(\d{2})(\d{2})(\d{5})(\d{4})/, "$1 ($2) $3-$4")}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <Button variant="ghost" size="icon">
                  <Phone className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon">
                  <Video className="h-4 w-4" />
                </Button>
                <Button 
                  variant="ghost" 
                  size="icon"
                  onClick={() => toggleStar(selectedConversation.id)}
                >
                  <Star className={cn(
                    "h-4 w-4",
                    selectedConversation.is_starred && "text-yellow-500 fill-yellow-500"
                  )} />
                </Button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => archiveConversation(selectedConversation.id)}>
                      <Archive className="h-4 w-4 mr-2" />
                      {selectedConversation.is_archived ? "Desarquivar" : "Arquivar"}
                    </DropdownMenuItem>
                    <DropdownMenuItem className="text-destructive">
                      <Trash2 className="h-4 w-4 mr-2" />
                      Excluir conversa
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>

            {/* Messages */}
            <ScrollArea className="flex-1 p-4 bg-muted/20">
              <div className="space-y-3 max-w-3xl mx-auto">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={cn(
                      "flex",
                      message.direction === "outgoing" ? "justify-end" : "justify-start"
                    )}
                  >
                    <div
                      className={cn(
                        "max-w-[70%] rounded-2xl px-4 py-2 shadow-sm",
                        message.direction === "outgoing"
                          ? "bg-green-500 text-white rounded-br-md"
                          : "bg-card rounded-bl-md"
                      )}
                    >
                      {message.is_from_ai && message.direction === "outgoing" && (
                        <div className="flex items-center gap-1 text-xs opacity-80 mb-1">
                          <Bot className="h-3 w-3" />
                          <span>Resposta automática</span>
                        </div>
                      )}
                      <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                      <div className={cn(
                        "flex items-center justify-end gap-1 mt-1",
                        message.direction === "outgoing" ? "text-white/70" : "text-muted-foreground"
                      )}>
                        <span className="text-xs">{formatChatTime(message.created_at)}</span>
                        {message.direction === "outgoing" && getStatusIcon(message.status)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>

            {/* Message Input */}
            <div className="p-4 border-t border-border bg-card">
              <div className="flex items-end gap-2 max-w-3xl mx-auto">
                <Button variant="ghost" size="icon" className="flex-shrink-0">
                  <Smile className="h-5 w-5 text-muted-foreground" />
                </Button>
                <Button variant="ghost" size="icon" className="flex-shrink-0">
                  <Paperclip className="h-5 w-5 text-muted-foreground" />
                </Button>
                <Textarea
                  placeholder="Digite uma mensagem..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage();
                    }
                  }}
                  className="min-h-[44px] max-h-32 resize-none"
                  rows={1}
                />
                {newMessage.trim() ? (
                  <Button 
                    onClick={handleSendMessage} 
                    disabled={isSending}
                    className="flex-shrink-0 bg-green-500 hover:bg-green-600"
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                ) : (
                  <Button variant="ghost" size="icon" className="flex-shrink-0">
                    <Mic className="h-5 w-5 text-muted-foreground" />
                  </Button>
                )}
              </div>
            </div>
          </>
        ) : (
          /* Empty State */
          <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground bg-muted/10">
            <div className="w-64 h-64 mb-6 relative">
              <div className="absolute inset-0 bg-gradient-to-br from-green-500/20 to-green-600/10 rounded-full animate-pulse" />
              <div className="absolute inset-8 bg-gradient-to-br from-green-500/30 to-green-600/20 rounded-full" />
              <div className="absolute inset-16 bg-card rounded-full flex items-center justify-center shadow-lg">
                <MessageCircle className="h-16 w-16 text-green-500" />
              </div>
            </div>
            <h3 className="text-xl font-semibold text-foreground mb-2">
              WhatsApp Conversas
            </h3>
            <p className="text-center max-w-sm">
              Selecione uma conversa para visualizar as mensagens e interagir com seus contatos.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
