import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import {
  Calendar,
  Clock,
  Users,
  Video,
  CheckCircle,
  ExternalLink,
  CalendarDays,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { format, isPast, isToday, isTomorrow, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";

interface MemberEvent {
  id: string;
  title: string;
  description: string | null;
  eventDate: string;
  eventTime: string;
  durationMinutes: number;
  eventType: string;
  meetingUrl: string | null;
  maxParticipants: number | null;
  isRegistered: boolean;
  registrationsCount: number;
}

interface StudentEventsProps {
  professionalId: string;
}

const StudentEvents = ({ professionalId }: StudentEventsProps) => {
  const [events, setEvents] = useState<MemberEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchEvents();
  }, [professionalId]);

  const fetchEvents = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      const { data: eventsData, error } = await supabase
        .from("member_events")
        .select("*")
        .eq("professional_id", professionalId)
        .eq("is_published", true)
        .order("event_date", { ascending: true })
        .order("event_time", { ascending: true });

      if (error) throw error;

      // Get registrations count for each event
      const eventIds = (eventsData || []).map(e => e.id);
      const { data: registrations } = await supabase
        .from("member_event_registrations")
        .select("event_id, user_id")
        .in("event_id", eventIds);

      const formattedEvents: MemberEvent[] = (eventsData || []).map(event => {
        const eventRegistrations = (registrations || []).filter(r => r.event_id === event.id);
        return {
          id: event.id,
          title: event.title,
          description: event.description,
          eventDate: event.event_date,
          eventTime: event.event_time,
          durationMinutes: event.duration_minutes || 60,
          eventType: event.event_type || "live",
          meetingUrl: event.meeting_url,
          maxParticipants: event.max_participants,
          isRegistered: eventRegistrations.some(r => r.user_id === user?.id),
          registrationsCount: eventRegistrations.length,
        };
      });

      setEvents(formattedEvents);
    } catch (error) {
      console.error("Error fetching events:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (eventId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Usuário não autenticado");

      const { error } = await supabase
        .from("member_event_registrations")
        .insert({
          event_id: eventId,
          user_id: user.id,
        });

      if (error) throw error;

      fetchEvents();
      toast({
        title: "Inscrição confirmada!",
        description: "Você receberá um lembrete antes do evento.",
      });
    } catch (error) {
      console.error("Error registering:", error);
      toast({
        title: "Erro",
        description: "Não foi possível confirmar sua inscrição.",
        variant: "destructive",
      });
    }
  };

  const handleUnregister = async (eventId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from("member_event_registrations")
        .delete()
        .eq("event_id", eventId)
        .eq("user_id", user.id);

      if (error) throw error;

      fetchEvents();
      toast({
        title: "Inscrição cancelada",
        description: "Você foi removido do evento.",
      });
    } catch (error) {
      console.error("Error unregistering:", error);
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
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  const upcomingEvents = events.filter(e => !isEventPast(e.eventDate, e.eventTime));
  const pastEvents = events.filter(e => isEventPast(e.eventDate, e.eventTime));

  return (
    <div className="max-w-3xl mx-auto py-8 px-4">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary mb-4">
          <Calendar className="w-4 h-4" />
          <span className="text-sm font-medium">Eventos</span>
        </div>
        <h1 className="text-2xl font-bold text-white mb-2">
          Aulas ao Vivo e Eventos
        </h1>
        <p className="text-gray-400">
          Participe de encontros exclusivos e aulas em tempo real
        </p>
      </div>

      {/* Upcoming Events */}
      {upcomingEvents.length > 0 ? (
        <div className="space-y-4 mb-10">
          <h2 className="text-lg font-semibold text-white flex items-center gap-2">
            <CalendarDays className="w-5 h-5 text-primary" />
            Próximos Eventos
          </h2>

          {upcomingEvents.map((event) => {
            const typeInfo = getEventTypeLabel(event.eventType);
            const isFull = event.maxParticipants && event.registrationsCount >= event.maxParticipants;

            return (
              <Card
                key={event.id}
                className="bg-gray-900/50 border-gray-800 p-5 hover:bg-gray-900/70 transition-all"
              >
                <div className="flex flex-col md:flex-row md:items-center gap-4">
                  {/* Date column */}
                  <div className="flex-shrink-0 text-center bg-gray-800/50 rounded-xl p-4 w-24">
                    <div className="text-2xl font-bold text-white">
                      {format(parseISO(event.eventDate), "dd")}
                    </div>
                    <div className="text-xs text-gray-400 uppercase">
                      {format(parseISO(event.eventDate), "MMM", { locale: ptBR })}
                    </div>
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge className={cn("border", typeInfo.color)}>
                        {typeInfo.label}
                      </Badge>
                      {event.isRegistered && (
                        <Badge className="bg-green-500/20 text-green-400 border border-green-500/30">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Inscrito
                        </Badge>
                      )}
                    </div>

                    <h3 className="text-lg font-semibold text-white mb-1">
                      {event.title}
                    </h3>

                    {event.description && (
                      <p className="text-sm text-gray-400 mb-3 line-clamp-2">
                        {event.description}
                      </p>
                    )}

                    <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-4 h-4" />
                        <span>{event.eventTime.slice(0, 5)} • {event.durationMinutes} min</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Users className="w-4 h-4" />
                        <span>
                          {event.registrationsCount}
                          {event.maxParticipants && ` / ${event.maxParticipants}`} inscritos
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col gap-2 md:flex-shrink-0">
                    {event.isRegistered ? (
                      <>
                        {event.meetingUrl && isToday(parseISO(event.eventDate)) && (
                          <Button
                            onClick={() => window.open(event.meetingUrl!, "_blank")}
                            className="gap-2"
                          >
                            <Video className="w-4 h-4" />
                            Entrar
                          </Button>
                        )}
                        <Button
                          variant="outline"
                          onClick={() => handleUnregister(event.id)}
                          className="text-gray-400 border-gray-700"
                        >
                          Cancelar Inscrição
                        </Button>
                      </>
                    ) : (
                      <Button
                        onClick={() => handleRegister(event.id)}
                        disabled={isFull}
                        className="gap-2"
                      >
                        {isFull ? "Esgotado" : "Inscrever-se"}
                      </Button>
                    )}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-12 mb-10">
          <Sparkles className="w-12 h-12 text-gray-600 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-400 mb-2">
            Nenhum evento programado
          </h3>
          <p className="text-sm text-gray-500">
            Fique atento, novos eventos serão anunciados em breve!
          </p>
        </div>
      )}

      {/* Past Events */}
      {pastEvents.length > 0 && (
        <div className="space-y-4 opacity-60">
          <h2 className="text-lg font-semibold text-gray-400">
            Eventos Anteriores
          </h2>

          {pastEvents.slice(0, 3).map((event) => {
            const typeInfo = getEventTypeLabel(event.eventType);

            return (
              <Card
                key={event.id}
                className="bg-gray-900/30 border-gray-800/50 p-4"
              >
                <div className="flex items-center gap-4">
                  <div className="text-center bg-gray-800/30 rounded-lg p-3 w-16">
                    <div className="text-lg font-bold text-gray-500">
                      {format(parseISO(event.eventDate), "dd")}
                    </div>
                    <div className="text-xs text-gray-600 uppercase">
                      {format(parseISO(event.eventDate), "MMM", { locale: ptBR })}
                    </div>
                  </div>

                  <div className="flex-1">
                    <Badge className={cn("border mb-1", typeInfo.color)} variant="outline">
                      {typeInfo.label}
                    </Badge>
                    <h3 className="text-sm font-medium text-gray-400">
                      {event.title}
                    </h3>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default StudentEvents;
