import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Calendar,
  Clock,
  Users,
  Video,
  Plus,
  MoreVertical,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  ExternalLink,
  CalendarDays,
  Sparkles,
} from "lucide-react";
import { MemberEvent, useMemberEvents } from "@/hooks/useMemberEvents";
import EventFormModal from "./EventFormModal";
import DeleteConfirmModal from "./DeleteConfirmModal";
import { cn } from "@/lib/utils";
import { format, isPast, isToday, isTomorrow, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useToast } from "@/hooks/use-toast";

interface EventsTabProps {
  professionalId: string | null;
}

const EventsTab = ({ professionalId }: EventsTabProps) => {
  const { events, loading, createEvent, updateEvent, deleteEvent } = useMemberEvents(professionalId);
  const { toast } = useToast();
  
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<MemberEvent | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deletingEvent, setDeletingEvent] = useState<MemberEvent | null>(null);

  const handleOpenCreateModal = () => {
    setEditingEvent(null);
    setIsFormModalOpen(true);
  };

  const handleOpenEditModal = (event: MemberEvent) => {
    setEditingEvent(event);
    setIsFormModalOpen(true);
  };

  const handleOpenDeleteModal = (event: MemberEvent) => {
    setDeletingEvent(event);
    setIsDeleteModalOpen(true);
  };

  const handleSaveEvent = async (data: {
    title: string;
    description?: string;
    eventDate: string;
    eventTime: string;
    durationMinutes: number;
    eventType: string;
    meetingUrl?: string;
    maxParticipants?: number;
    isPublished?: boolean;
  }) => {
    try {
      if (editingEvent) {
        await updateEvent(editingEvent.id, data);
        toast({ title: "Evento atualizado!", description: "As alterações foram salvas." });
      } else {
        await createEvent(data);
        toast({ title: "Evento criado!", description: "O evento foi adicionado com sucesso." });
      }
    } catch (error) {
      toast({ 
        title: "Erro", 
        description: "Não foi possível salvar o evento.", 
        variant: "destructive" 
      });
    }
  };

  const handleDeleteEvent = async () => {
    if (deletingEvent) {
      try {
        await deleteEvent(deletingEvent.id);
        toast({ title: "Evento excluído", description: "O evento foi removido." });
      } catch (error) {
        toast({ 
          title: "Erro", 
          description: "Não foi possível excluir o evento.", 
          variant: "destructive" 
        });
      }
    }
  };

  const handleTogglePublish = async (event: MemberEvent) => {
    try {
      await updateEvent(event.id, { isPublished: !event.isPublished });
      toast({ 
        title: event.isPublished ? "Evento despublicado" : "Evento publicado",
        description: event.isPublished 
          ? "O evento não está mais visível para membros." 
          : "O evento agora está visível para membros." 
      });
    } catch (error) {
      toast({ 
        title: "Erro", 
        description: "Não foi possível alterar o status.", 
        variant: "destructive" 
      });
    }
  };

  const getEventTypeLabel = (type: string) => {
    switch (type) {
      case "live":
        return { label: "Aula ao Vivo", color: "bg-red-500/20 text-red-400 border-red-500/30" };
      case "webinar":
        return { label: "Webinar", color: "bg-blue-500/20 text-blue-400 border-blue-500/30" };
      case "workshop":
        return { label: "Workshop", color: "bg-purple-500/20 text-purple-400 border-purple-500/30" };
      default:
        return { label: "Evento", color: "bg-gray-500/20 text-gray-400 border-gray-500/30" };
    }
  };

  const getDateLabel = (dateStr: string) => {
    const date = parseISO(dateStr);
    if (isToday(date)) return "Hoje";
    if (isTomorrow(date)) return "Amanhã";
    return format(date, "dd 'de' MMMM", { locale: ptBR });
  };

  const isEventPast = (dateStr: string, timeStr: string) => {
    const eventDateTime = new Date(`${dateStr}T${timeStr}`);
    return isPast(eventDateTime);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  const upcomingEvents = events.filter(e => !isEventPast(e.eventDate, e.eventTime));
  const pastEvents = events.filter(e => isEventPast(e.eventDate, e.eventTime));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-white flex items-center gap-2">
            <CalendarDays className="w-5 h-5 text-primary" />
            Eventos e Aulas ao Vivo
          </h2>
          <p className="text-sm text-gray-500">
            Gerencie seus eventos, webinars e aulas ao vivo
          </p>
        </div>
        <Button onClick={handleOpenCreateModal} className="bg-primary hover:bg-primary/90">
          <Plus className="w-4 h-4 mr-2" />
          Novo Evento
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <Card className="bg-gray-900/50 border-gray-800 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
              <Calendar className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{events.length}</p>
              <p className="text-xs text-gray-500">Total de Eventos</p>
            </div>
          </div>
        </Card>

        <Card className="bg-gray-900/50 border-gray-800 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center">
              <CalendarDays className="w-5 h-5 text-green-500" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{upcomingEvents.length}</p>
              <p className="text-xs text-gray-500">Próximos Eventos</p>
            </div>
          </div>
        </Card>

        <Card className="bg-gray-900/50 border-gray-800 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
              <Users className="w-5 h-5 text-blue-500" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">
                {events.reduce((acc, e) => acc + e.registrationsCount, 0)}
              </p>
              <p className="text-xs text-gray-500">Total Inscrições</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Events List */}
      {events.length === 0 ? (
        <Card className="bg-gray-900/30 border-gray-800 p-12 text-center">
          <Sparkles className="w-12 h-12 text-gray-600 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-400 mb-2">
            Nenhum evento criado
          </h3>
          <p className="text-sm text-gray-500 mb-4">
            Crie seu primeiro evento ou aula ao vivo para seus membros
          </p>
          <Button onClick={handleOpenCreateModal}>
            <Plus className="w-4 h-4 mr-2" />
            Criar Primeiro Evento
          </Button>
        </Card>
      ) : (
        <div className="space-y-6">
          {/* Upcoming Events */}
          {upcomingEvents.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-sm font-medium text-gray-400 uppercase tracking-wider">
                Próximos Eventos
              </h3>
              {upcomingEvents.map((event) => (
                <EventCard
                  key={event.id}
                  event={event}
                  onEdit={() => handleOpenEditModal(event)}
                  onDelete={() => handleOpenDeleteModal(event)}
                  onTogglePublish={() => handleTogglePublish(event)}
                  getEventTypeLabel={getEventTypeLabel}
                  getDateLabel={getDateLabel}
                />
              ))}
            </div>
          )}

          {/* Past Events */}
          {pastEvents.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider">
                Eventos Anteriores
              </h3>
              {pastEvents.slice(0, 5).map((event) => (
                <EventCard
                  key={event.id}
                  event={event}
                  isPast
                  onEdit={() => handleOpenEditModal(event)}
                  onDelete={() => handleOpenDeleteModal(event)}
                  onTogglePublish={() => handleTogglePublish(event)}
                  getEventTypeLabel={getEventTypeLabel}
                  getDateLabel={getDateLabel}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Modals */}
      <EventFormModal
        isOpen={isFormModalOpen}
        onClose={() => {
          setIsFormModalOpen(false);
          setEditingEvent(null);
        }}
        event={editingEvent}
        professionalId={professionalId || ""}
        onSave={handleSaveEvent}
      />

      <DeleteConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setDeletingEvent(null);
        }}
        onConfirm={handleDeleteEvent}
        title="Excluir evento"
        description="Esta ação não pode ser desfeita. Todas as inscrições também serão removidas."
        itemName={deletingEvent?.title}
      />
    </div>
  );
};

interface EventCardProps {
  event: MemberEvent;
  isPast?: boolean;
  onEdit: () => void;
  onDelete: () => void;
  onTogglePublish: () => void;
  getEventTypeLabel: (type: string) => { label: string; color: string };
  getDateLabel: (date: string) => string;
}

const EventCard = ({
  event,
  isPast = false,
  onEdit,
  onDelete,
  onTogglePublish,
  getEventTypeLabel,
  getDateLabel,
}: EventCardProps) => {
  const typeInfo = getEventTypeLabel(event.eventType);
  const isFull = event.maxParticipants && event.registrationsCount >= event.maxParticipants;

  return (
    <Card
      className={cn(
        "p-4 transition-all hover:bg-gray-800/50",
        isPast 
          ? "bg-gray-900/20 border-gray-800/50 opacity-60" 
          : "bg-gray-900/50 border-gray-800",
        !event.isPublished && "border-dashed"
      )}
    >
      <div className="flex items-center gap-4">
        {/* Date */}
        <div className="flex-shrink-0 text-center bg-gray-800/50 rounded-xl p-3 w-20">
          <div className="text-xl font-bold text-white">
            {format(parseISO(event.eventDate), "dd")}
          </div>
          <div className="text-xs text-gray-400 uppercase">
            {format(parseISO(event.eventDate), "MMM", { locale: ptBR })}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <Badge className={cn("border", typeInfo.color)}>
              {typeInfo.label}
            </Badge>
            {!event.isPublished && (
              <Badge variant="outline" className="border-gray-600 text-gray-400">
                <EyeOff className="w-3 h-3 mr-1" />
                Rascunho
              </Badge>
            )}
            {isFull && (
              <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">
                Esgotado
              </Badge>
            )}
          </div>

          <h3 className="font-semibold text-white truncate">{event.title}</h3>

          <div className="flex flex-wrap items-center gap-3 mt-1 text-sm text-gray-500">
            <div className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              <span>{event.eventTime.slice(0, 5)} • {event.durationMinutes} min</span>
            </div>
            <div className="flex items-center gap-1">
              <Users className="w-3.5 h-3.5" />
              <span>
                {event.registrationsCount}
                {event.maxParticipants && ` / ${event.maxParticipants}`} inscritos
              </span>
            </div>
            {event.meetingUrl && (
              <div className="flex items-center gap-1 text-primary">
                <Video className="w-3.5 h-3.5" />
                <span>Link configurado</span>
              </div>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          {event.meetingUrl && !isPast && (
            <Button
              size="sm"
              variant="outline"
              className="border-primary/50 text-primary hover:bg-primary/10"
              onClick={() => window.open(event.meetingUrl!, "_blank")}
            >
              <ExternalLink className="w-4 h-4 mr-1" />
              Abrir
            </Button>
          )}

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button size="icon" variant="ghost" className="text-gray-400 hover:text-white">
                <MoreVertical className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-gray-900 border-gray-800">
              <DropdownMenuItem onClick={onEdit}>
                <Edit className="w-4 h-4 mr-2" />
                Editar
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onTogglePublish}>
                {event.isPublished ? (
                  <>
                    <EyeOff className="w-4 h-4 mr-2" />
                    Despublicar
                  </>
                ) : (
                  <>
                    <Eye className="w-4 h-4 mr-2" />
                    Publicar
                  </>
                )}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onDelete} className="text-red-400 focus:text-red-400">
                <Trash2 className="w-4 h-4 mr-2" />
                Excluir
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </Card>
  );
};

export default EventsTab;
