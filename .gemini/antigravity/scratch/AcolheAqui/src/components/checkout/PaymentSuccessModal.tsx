import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CheckCircle, Calendar, Clock, MapPin, Video } from "lucide-react";

interface PaymentSuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  professional: {
    name: string;
    photo: string;
  };
  sessionInfo: {
    date: Date;
    time: string;
    duration: string;
    packageName: string;
    isOnline?: boolean;
  };
}

export function PaymentSuccessModal({
  isOpen,
  onClose,
  professional,
  sessionInfo,
}: PaymentSuccessModalProps) {
  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("pt-BR", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    }).format(date);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md text-center">
        <div className="flex flex-col items-center py-6">
          <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mb-6">
            <CheckCircle className="h-10 w-10 text-primary" />
          </div>

          <h2 className="text-2xl font-bold text-foreground mb-2">
            Pagamento confirmado!
          </h2>
          <p className="text-muted-foreground mb-6">
            Sua sessão foi agendada com sucesso.
          </p>

          <div className="w-full bg-muted/50 rounded-xl p-4 space-y-4 mb-6">
            <div className="flex items-center gap-3">
              <img
                src={professional.photo}
                alt={professional.name}
                className="w-12 h-12 rounded-full object-cover"
              />
              <div className="text-left">
                <p className="font-medium text-foreground">{professional.name}</p>
                <p className="text-sm text-muted-foreground">Psicoterapeuta</p>
              </div>
            </div>

            <div className="border-t border-border pt-4 space-y-3">
              <div className="flex items-center gap-3 text-sm">
                <Calendar className="h-4 w-4 text-primary" />
                <span className="text-foreground capitalize">{formatDate(sessionInfo.date)}</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Clock className="h-4 w-4 text-primary" />
                <span className="text-foreground">{sessionInfo.time} • {sessionInfo.duration}</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                {sessionInfo.isOnline ? (
                  <>
                    <Video className="h-4 w-4 text-primary" />
                    <span className="text-foreground">Sessão online</span>
                  </>
                ) : (
                  <>
                    <MapPin className="h-4 w-4 text-primary" />
                    <span className="text-foreground">Sessão presencial</span>
                  </>
                )}
              </div>
            </div>
          </div>

          <p className="text-sm text-muted-foreground mb-6">
            Você receberá um e-mail com todos os detalhes da sua sessão e o link de acesso (para sessões online).
          </p>

          <div className="flex gap-3 w-full">
            <Button variant="outline" className="flex-1" onClick={onClose}>
              Fechar
            </Button>
            <Button className="flex-1" onClick={onClose}>
              Ver meus agendamentos
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
