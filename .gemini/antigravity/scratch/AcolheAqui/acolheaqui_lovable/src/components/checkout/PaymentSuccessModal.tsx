import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CheckCircle, Calendar, Clock, MapPin, Video, Copy, MessageCircle, GraduationCap, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import { useState } from "react";
import { getCanonicalUrl } from "@/lib/getCanonicalUrl";

interface PaymentSuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  professional: {
    name: string;
    photo: string;
    slug?: string;
  };
  sessionInfo: {
    date: Date;
    time: string;
    duration: string;
    packageName: string;
    isOnline?: boolean;
    virtualRoomLink?: string;
  };
  serviceType?: "session" | "members_area";
}

export function PaymentSuccessModal({
  isOpen,
  onClose,
  professional,
  sessionInfo,
  serviceType = "session",
}: PaymentSuccessModalProps) {
  const [copied, setCopied] = useState(false);
  const isMembersArea = serviceType === "members_area";

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("pt-BR", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    }).format(date);
  };

  const handleCopyLink = async () => {
    if (sessionInfo.virtualRoomLink) {
      await navigator.clipboard.writeText(sessionInfo.virtualRoomLink);
      setCopied(true);
      toast.success("Link copiado!");
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleShareWhatsApp = () => {
    if (sessionInfo.virtualRoomLink) {
      const message = encodeURIComponent(
        `Olá! Segue o link para nossa sessão online:\n\n📅 ${formatDate(sessionInfo.date)}\n⏰ ${sessionInfo.time}\n\n🔗 ${sessionInfo.virtualRoomLink}\n\nAté breve!`
      );
      window.open(`https://wa.me/?text=${message}`, '_blank');
    }
  };

  const handleAccessMembersArea = () => {
    if (professional.slug) {
      window.open(getCanonicalUrl(`/area-membros/${professional.slug}`), '_blank');
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md text-center">
        <div className="flex flex-col items-center py-6">
          <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mb-6">
            {isMembersArea ? (
              <GraduationCap className="h-10 w-10 text-primary" />
            ) : (
              <CheckCircle className="h-10 w-10 text-primary" />
            )}
          </div>

          <h2 className="text-2xl font-bold text-foreground mb-2">
            {isMembersArea ? "Acesso liberado!" : "Pagamento confirmado!"}
          </h2>
          <p className="text-muted-foreground mb-6">
            {isMembersArea 
              ? "Seu acesso à área de membros foi ativado com sucesso."
              : "Sua sessão foi agendada com sucesso."}
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
                <p className="text-sm text-muted-foreground">
                  {isMembersArea ? "Instrutor" : "Psicoterapeuta"}
                </p>
              </div>
            </div>

            {isMembersArea ? (
              <div className="border-t border-border pt-4 space-y-3">
                <div className="flex items-center gap-3 text-sm">
                  <GraduationCap className="h-4 w-4 text-primary" />
                  <span className="text-foreground">{sessionInfo.packageName}</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span className="text-foreground">Acesso ativo</span>
                </div>
              </div>
            ) : (
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
            )}

            {!isMembersArea && sessionInfo.isOnline && sessionInfo.virtualRoomLink && (
              <div className="border-t border-border pt-4 mt-4">
                <p className="text-sm font-medium text-foreground mb-2">Link da Sala Virtual:</p>
                <div className="bg-background rounded-lg p-3 border border-border">
                  <p className="text-xs text-muted-foreground break-all mb-3">
                    {sessionInfo.virtualRoomLink}
                  </p>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={handleCopyLink}
                    >
                      <Copy className="h-4 w-4 mr-2" />
                      {copied ? "Copiado!" : "Copiar"}
                    </Button>
                    <Button
                      variant="default"
                      size="sm"
                      className="flex-1 bg-green-600 hover:bg-green-700"
                      onClick={handleShareWhatsApp}
                    >
                      <MessageCircle className="h-4 w-4 mr-2" />
                      WhatsApp
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>

          <p className="text-sm text-muted-foreground mb-6">
            {isMembersArea 
              ? "Você receberá um e-mail com os detalhes de acesso à sua área de membros."
              : "Você receberá um e-mail com todos os detalhes da sua sessão e o link de acesso (para sessões online)."}
          </p>

          <div className="flex gap-3 w-full">
            <Button variant="outline" className="flex-1" onClick={onClose}>
              Fechar
            </Button>
            {isMembersArea && professional.slug ? (
              <Button className="flex-1 gap-2" onClick={handleAccessMembersArea}>
                <ExternalLink className="h-4 w-4" />
                Acessar Área de Membros
              </Button>
            ) : (
              <Button className="flex-1" onClick={onClose}>
                Ver meus agendamentos
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
