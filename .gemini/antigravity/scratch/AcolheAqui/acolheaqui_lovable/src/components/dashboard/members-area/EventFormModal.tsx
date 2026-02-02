import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar, Clock, Users, Video, Save, Loader2, Sparkles, ExternalLink, Check } from "lucide-react";
import { MemberEvent } from "@/hooks/useMemberEvents";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface EventFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  event: MemberEvent | null;
  professionalId: string;
  onSave: (data: {
    title: string;
    description?: string;
    eventDate: string;
    eventTime: string;
    durationMinutes: number;
    eventType: string;
    meetingUrl?: string;
    maxParticipants?: number;
    isPublished?: boolean;
  }) => Promise<void>;
}

const EventFormModal = ({ isOpen, onClose, event, professionalId, onSave }: EventFormModalProps) => {
  const { toast } = useToast();
  const [title, setTitle] = useState(event?.title || "");
  const [description, setDescription] = useState(event?.description || "");
  const [eventDate, setEventDate] = useState(event?.eventDate || "");
  const [eventTime, setEventTime] = useState(event?.eventTime?.slice(0, 5) || "");
  const [durationMinutes, setDurationMinutes] = useState(event?.durationMinutes || 60);
  const [eventType, setEventType] = useState(event?.eventType || "live");
  const [meetingUrl, setMeetingUrl] = useState(event?.meetingUrl || "");
  const [maxParticipants, setMaxParticipants] = useState<string>(
    event?.maxParticipants?.toString() || ""
  );
  const [isPublished, setIsPublished] = useState(event?.isPublished ?? true);
  const [saving, setSaving] = useState(false);
  const [generatingMeet, setGeneratingMeet] = useState(false);
  const [googleConnected, setGoogleConnected] = useState(false);
  const [autoGenerateMeet, setAutoGenerateMeet] = useState(true);

  // Check if Google Calendar is connected
  useEffect(() => {
    const checkGoogleConnection = async () => {
      if (!professionalId) return;
      
      const { data } = await supabase
        .from("google_calendar_settings")
        .select("is_connected, auto_create_meet")
        .eq("professional_id", professionalId)
        .single();
      
      if (data?.is_connected) {
        setGoogleConnected(true);
        setAutoGenerateMeet(data.auto_create_meet ?? true);
      }
    };

    checkGoogleConnection();
  }, [professionalId]);

  const generateGoogleMeetLink = async (): Promise<string | null> => {
    if (!googleConnected || !title || !eventDate || !eventTime) {
      return null;
    }

    try {
      setGeneratingMeet(true);

      // Create a temporary event in Google Calendar to get the Meet link
      const startDateTime = new Date(`${eventDate}T${eventTime}:00`);
      const endDateTime = new Date(startDateTime.getTime() + durationMinutes * 60000);

      const { data, error } = await supabase.functions.invoke('google-calendar-sync', {
        body: {
          action: 'create-member-event',
          professionalId,
          eventData: {
            title: `[Área de Membros] ${title}`,
            description: description || `Evento da Área de Membros: ${title}`,
            startDateTime: startDateTime.toISOString(),
            endDateTime: endDateTime.toISOString(),
            eventType,
          },
        },
      });

      if (error) throw error;

      if (data?.meetLink) {
        toast({
          title: "Link gerado com sucesso!",
          description: "Link do Google Meet criado automaticamente.",
        });
        return data.meetLink;
      }

      return null;
    } catch (error) {
      console.error("Error generating Meet link:", error);
      toast({
        title: "Erro ao gerar link",
        description: "Não foi possível gerar o link do Google Meet automaticamente.",
        variant: "destructive",
      });
      return null;
    } finally {
      setGeneratingMeet(false);
    }
  };

  const handleGenerateMeet = async () => {
    if (!title || !eventDate || !eventTime) {
      toast({
        title: "Preencha os campos",
        description: "Título, data e horário são necessários para gerar o link.",
        variant: "destructive",
      });
      return;
    }

    const link = await generateGoogleMeetLink();
    if (link) {
      setMeetingUrl(link);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !eventDate || !eventTime) return;

    try {
      setSaving(true);

      let finalMeetingUrl = meetingUrl;

      // Auto-generate Meet link if enabled and no URL provided
      if (autoGenerateMeet && googleConnected && !meetingUrl) {
        const generatedLink = await generateGoogleMeetLink();
        if (generatedLink) {
          finalMeetingUrl = generatedLink;
        }
      }

      await onSave({
        title,
        description: description || undefined,
        eventDate,
        eventTime,
        durationMinutes,
        eventType,
        meetingUrl: finalMeetingUrl || undefined,
        maxParticipants: maxParticipants ? parseInt(maxParticipants) : undefined,
        isPublished,
      });
      onClose();
    } catch (error) {
      console.error("Error saving event:", error);
    } finally {
      setSaving(false);
    }
  };

  const resetForm = () => {
    setTitle(event?.title || "");
    setDescription(event?.description || "");
    setEventDate(event?.eventDate || "");
    setEventTime(event?.eventTime?.slice(0, 5) || "");
    setDurationMinutes(event?.durationMinutes || 60);
    setEventType(event?.eventType || "live");
    setMeetingUrl(event?.meetingUrl || "");
    setMaxParticipants(event?.maxParticipants?.toString() || "");
    setIsPublished(event?.isPublished ?? true);
  };

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) {
          resetForm();
          onClose();
        }
      }}
    >
      <DialogContent className="bg-gray-900 border-gray-800 text-white max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-primary" />
            {event ? "Editar Evento" : "Novo Evento"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">Título do Evento *</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ex: Aula ao Vivo - Introdução"
              className="bg-gray-800 border-gray-700"
              required
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Descrição</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Descreva o conteúdo do evento..."
              className="bg-gray-800 border-gray-700 min-h-[80px]"
            />
          </div>

          {/* Date and Time */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="eventDate" className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Data *
              </Label>
              <Input
                id="eventDate"
                type="date"
                value={eventDate}
                onChange={(e) => setEventDate(e.target.value)}
                className="bg-gray-800 border-gray-700"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="eventTime" className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                Horário *
              </Label>
              <Input
                id="eventTime"
                type="time"
                value={eventTime}
                onChange={(e) => setEventTime(e.target.value)}
                className="bg-gray-800 border-gray-700"
                required
              />
            </div>
          </div>

          {/* Duration and Type */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="duration">Duração (minutos)</Label>
              <Select
                value={durationMinutes.toString()}
                onValueChange={(v) => setDurationMinutes(parseInt(v))}
              >
                <SelectTrigger className="bg-gray-800 border-gray-700">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-700">
                  <SelectItem value="30">30 minutos</SelectItem>
                  <SelectItem value="45">45 minutos</SelectItem>
                  <SelectItem value="60">1 hora</SelectItem>
                  <SelectItem value="90">1h30</SelectItem>
                  <SelectItem value="120">2 horas</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="eventType">Tipo de Evento</Label>
              <Select value={eventType} onValueChange={setEventType}>
                <SelectTrigger className="bg-gray-800 border-gray-700">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-700">
                  <SelectItem value="live">Aula ao Vivo</SelectItem>
                  <SelectItem value="webinar">Webinar</SelectItem>
                  <SelectItem value="workshop">Workshop</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Meeting URL with Auto-generate */}
          <div className="space-y-3">
            <Label htmlFor="meetingUrl" className="flex items-center gap-2">
              <Video className="w-4 h-4" />
              Link da Reunião
            </Label>

            {/* Auto-generate option */}
            {googleConnected && (
              <div className="flex items-center justify-between p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center">
                    <svg className="w-4 h-4 text-green-400" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-green-400">Google Meet Conectado</p>
                    <p className="text-xs text-gray-400">Link será gerado automaticamente</p>
                  </div>
                </div>
                <Switch
                  checked={autoGenerateMeet}
                  onCheckedChange={setAutoGenerateMeet}
                />
              </div>
            )}

            <div className="flex gap-2">
              <Input
                id="meetingUrl"
                value={meetingUrl}
                onChange={(e) => setMeetingUrl(e.target.value)}
                placeholder={googleConnected ? "Será gerado automaticamente..." : "https://meet.google.com/..."}
                className="bg-gray-800 border-gray-700 flex-1"
              />
              {googleConnected && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleGenerateMeet}
                  disabled={generatingMeet || !title || !eventDate || !eventTime}
                  className="border-primary/50 text-primary hover:bg-primary/10"
                >
                  {generatingMeet ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : meetingUrl ? (
                    <Check className="w-4 h-4" />
                  ) : (
                    <Sparkles className="w-4 h-4" />
                  )}
                </Button>
              )}
            </div>

            {meetingUrl && (
              <a
                href={meetingUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-primary hover:underline flex items-center gap-1"
              >
                <ExternalLink className="w-3 h-3" />
                Testar link
              </a>
            )}

            {!googleConnected && (
              <p className="text-xs text-gray-500">
                💡 Conecte o Google Calendar em Integrações para gerar links automaticamente
              </p>
            )}
          </div>

          {/* Max Participants */}
          <div className="space-y-2">
            <Label htmlFor="maxParticipants" className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              Limite de Participantes
            </Label>
            <Input
              id="maxParticipants"
              type="number"
              min="1"
              value={maxParticipants}
              onChange={(e) => setMaxParticipants(e.target.value)}
              placeholder="Deixe vazio para ilimitado"
              className="bg-gray-800 border-gray-700"
            />
          </div>

          {/* Published Switch */}
          <div className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg">
            <div>
              <Label htmlFor="published" className="font-medium">
                Publicar Evento
              </Label>
              <p className="text-xs text-gray-500">
                Eventos publicados são visíveis para membros
              </p>
            </div>
            <Switch
              id="published"
              checked={isPublished}
              onCheckedChange={setIsPublished}
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1 border-gray-700"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-primary hover:bg-primary/90"
              disabled={saving || !title || !eventDate || !eventTime}
            >
              {saving ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Save className="w-4 h-4 mr-2" />
              )}
              {event ? "Salvar Alterações" : "Criar Evento"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EventFormModal;
