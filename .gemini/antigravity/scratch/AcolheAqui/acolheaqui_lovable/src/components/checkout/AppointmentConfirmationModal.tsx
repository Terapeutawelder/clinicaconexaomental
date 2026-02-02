import { useState, useEffect, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Check,
  Copy,
  Calendar,
  Clock,
  User,
  Video,
  ExternalLink,
  MessageCircle,
  Sparkles,
  CalendarPlus,
} from "lucide-react";
import { toast } from "sonner";
import { formatProfessionalName } from "@/lib/formatProfessionalName";
import { createAppointmentICS } from "@/lib/generateICS";
import confetti from "canvas-confetti";

interface AppointmentConfirmationModalProps {
  open: boolean;
  onClose: () => void;
  professional: {
    full_name: string | null;
    gender?: 'male' | 'female' | 'other' | null;
    avatar_url: string | null;
  };
  appointmentDetails: {
    date: Date;
    time: string;
    serviceName: string;
    duration: number;
    clientName: string;
    clientEmail: string;
    meetLink?: string | null;
    virtualRoomLink?: string | null;
  };
}

const AppointmentConfirmationModal = ({
  open,
  onClose,
  professional,
  appointmentDetails,
}: AppointmentConfirmationModalProps) => {
  const [copied, setCopied] = useState(false);
  const hasLaunchedConfetti = useRef(false);

  // Launch confetti when modal opens
  useEffect(() => {
    if (open && !hasLaunchedConfetti.current) {
      hasLaunchedConfetti.current = true;
      
      // Fire multiple confetti bursts for a celebratory effect
      const duration = 3000;
      const end = Date.now() + duration;

      const colors = ['#2A9D8F', '#D4A853', '#ffffff', '#f0f9ff'];

      const frame = () => {
        confetti({
          particleCount: 3,
          angle: 60,
          spread: 55,
          origin: { x: 0, y: 0.7 },
          colors: colors,
        });
        confetti({
          particleCount: 3,
          angle: 120,
          spread: 55,
          origin: { x: 1, y: 0.7 },
          colors: colors,
        });

        if (Date.now() < end) {
          requestAnimationFrame(frame);
        }
      };

      // Initial big burst
      confetti({
        particleCount: 100,
        spread: 100,
        origin: { y: 0.6 },
        colors: colors,
      });

      // Continuous side bursts
      frame();
    }
    
    // Reset when modal closes
    if (!open) {
      hasLaunchedConfetti.current = false;
    }
  }, [open]);

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('pt-BR', {
      weekday: 'long',
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    }).format(date);
  };

  const formatDuration = (minutes: number) => {
    if (minutes >= 60) {
      const hours = Math.floor(minutes / 60);
      const mins = minutes % 60;
      return mins > 0 ? `${hours}h ${mins}min` : `${hours} hora${hours > 1 ? 's' : ''}`;
    }
    return `${minutes} minutos`;
  };

  // Use Google Meet link if available, otherwise use virtual room link
  const sessionLink = appointmentDetails.meetLink || appointmentDetails.virtualRoomLink;

  const handleCopyLink = async () => {
    if (sessionLink) {
      await navigator.clipboard.writeText(sessionLink);
      setCopied(true);
      toast.success("Link copiado!");
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleOpenLink = () => {
    if (sessionLink) {
      window.open(sessionLink, '_blank');
    }
  };

  const handleShareWhatsApp = () => {
    const message = `🗓️ *Agendamento Confirmado!*

📋 *Serviço:* ${appointmentDetails.serviceName}
👨‍⚕️ *Profissional:* ${formatProfessionalName(professional.full_name, professional.gender)}
📅 *Data:* ${formatDate(appointmentDetails.date)}
⏰ *Horário:* ${appointmentDetails.time}
⏱️ *Duração:* ${formatDuration(appointmentDetails.duration)}

${sessionLink ? `🔗 *Link da Sessão:* ${sessionLink}` : ''}

Até breve!`;

    const encodedMessage = encodeURIComponent(message);
    window.open(`https://wa.me/?text=${encodedMessage}`, '_blank');
  };

  const handleAddToCalendar = () => {
    createAppointmentICS(
      appointmentDetails.serviceName,
      formatProfessionalName(professional.full_name, professional.gender),
      appointmentDetails.date,
      appointmentDetails.time,
      appointmentDetails.duration,
      sessionLink
    );
    toast.success("Arquivo de calendário baixado!");
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="max-w-lg p-0 overflow-hidden">
        {/* Header with gradient */}
        <div className="relative bg-gradient-to-br from-teal to-teal/80 px-6 py-8 text-white">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%23ffffff%22%20fill-opacity%3D%220.08%22%3E%3Cpath%20d%3D%22M36%2034v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6%2034v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6%204V0H4v4H0v2h4v4h2V6h4V4H6z%22%2F%3E%3C%2Fg%3E%3C%2Fg%3E%3C%2Fsvg%3E')] opacity-50" />
          
          <div className="relative flex flex-col items-center text-center">
            {/* Success icon */}
            <div className="w-20 h-20 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center mb-4 animate-pulse">
              <div className="w-14 h-14 rounded-full bg-white flex items-center justify-center">
                <Check className="w-8 h-8 text-teal" strokeWidth={3} />
              </div>
            </div>
            
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-5 h-5 text-gold" />
              <h2 className="text-2xl font-bold font-serif">Agendamento Confirmado!</h2>
              <Sparkles className="w-5 h-5 text-gold" />
            </div>
            
            <p className="text-white/90 text-sm">
              Você receberá um e-mail com todos os detalhes
            </p>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Professional Info */}
          <div className="flex items-center gap-4 p-4 bg-cream rounded-xl border border-sand">
            <div className="w-14 h-14 rounded-full overflow-hidden bg-teal/10 flex-shrink-0 ring-2 ring-teal/20">
              {professional.avatar_url ? (
                <img 
                  src={professional.avatar_url} 
                  alt={professional.full_name || ''} 
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-teal font-bold text-xl">
                  {(professional.full_name || 'P').charAt(0)}
                </div>
              )}
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Profissional</p>
              <p className="font-semibold text-charcoal font-serif text-lg">
                {formatProfessionalName(professional.full_name, professional.gender)}
              </p>
            </div>
          </div>

          {/* Appointment Details */}
          <div className="bg-white rounded-xl border border-border shadow-sm overflow-hidden">
            <div className="p-4 bg-slate/5 border-b border-border">
              <h3 className="font-semibold text-charcoal flex items-center gap-2">
                <Calendar className="w-4 h-4 text-teal" />
                Detalhes do Agendamento
              </h3>
            </div>
            
            <div className="p-4 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-lg bg-teal/10 flex items-center justify-center flex-shrink-0">
                    <Calendar className="w-5 h-5 text-teal" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wide">Data</p>
                    <p className="font-medium text-charcoal capitalize">
                      {formatDate(appointmentDetails.date)}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-lg bg-gold/10 flex items-center justify-center flex-shrink-0">
                    <Clock className="w-5 h-5 text-gold" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wide">Horário</p>
                    <p className="font-medium text-charcoal">{appointmentDetails.time}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatDuration(appointmentDetails.duration)}
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-3 pt-2 border-t border-border">
                <div className="w-10 h-10 rounded-lg bg-teal/10 flex items-center justify-center flex-shrink-0">
                  <User className="w-5 h-5 text-teal" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wide">Serviço</p>
                  <p className="font-medium text-charcoal">{appointmentDetails.serviceName}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Session Link */}
          {sessionLink && (
            <div className="bg-gradient-to-br from-teal/5 to-gold/5 rounded-xl border-2 border-teal/20 p-4">
              <div className="flex items-center gap-2 mb-3">
                <Video className="w-5 h-5 text-teal" />
                <h3 className="font-semibold text-charcoal">Link da Sessão Online</h3>
              </div>
              
              <div className="bg-white rounded-lg p-3 border border-border mb-3">
                <p className="text-sm text-muted-foreground break-all font-mono">
                  {sessionLink}
                </p>
              </div>
              
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1 border-teal/30 hover:bg-teal/10"
                  onClick={handleCopyLink}
                >
                  {copied ? (
                    <Check className="w-4 h-4 mr-2 text-green-600" />
                  ) : (
                    <Copy className="w-4 h-4 mr-2" />
                  )}
                  {copied ? "Copiado!" : "Copiar Link"}
                </Button>
                
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1 border-teal/30 hover:bg-teal/10"
                  onClick={handleOpenLink}
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Abrir
                </Button>
                
                <Button
                  size="sm"
                  className="bg-green-600 hover:bg-green-700 text-white"
                  onClick={handleShareWhatsApp}
                >
                  <MessageCircle className="w-4 h-4 mr-2" />
                  Compartilhar
                </Button>
              </div>
            </div>
          )}

          {/* Add to Calendar Button */}
          <Button
            variant="outline"
            className="w-full py-5 border-gold/30 hover:bg-gold/10 text-charcoal font-semibold"
            onClick={handleAddToCalendar}
          >
            <CalendarPlus className="w-5 h-5 mr-2 text-gold" />
            Salvar no Calendário
          </Button>

          {/* Close Button */}
          <Button
            className="w-full bg-teal hover:bg-teal/90 text-white py-6 text-lg font-semibold"
            onClick={onClose}
          >
            Fechar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AppointmentConfirmationModal;
