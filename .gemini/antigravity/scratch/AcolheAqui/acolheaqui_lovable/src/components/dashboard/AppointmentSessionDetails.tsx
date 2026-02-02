import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Video, FileText, Download, Play, ExternalLink, Copy, Loader2, Brain, Sparkles, FileDown, Link2, Calendar, Clock, Mail, Phone, TrendingUp, DollarSign } from "lucide-react";
import { generateSessionPDF } from "@/lib/generateSessionPDF";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface TranscriptEntry {
  id: string;
  speaker: "professional" | "patient";
  text: string;
  timestamp: string;
  isFinal: boolean;
}

interface AppointmentSessionDetailsProps {
  appointment: {
    id: string;
    client_name: string;
    client_email?: string | null;
    client_phone?: string | null;
    appointment_date: string;
    appointment_time?: string;
    duration_minutes?: number;
    status?: string;
    payment_status?: string;
    amount_cents?: number | null;
    session_type?: string | null;
    virtual_room_code?: string | null;
    virtual_room_link?: string | null;
    recording_url?: string | null;
    transcription?: TranscriptEntry[] | null;
    ai_psi_analysis?: string | null;
  };
  isOpen: boolean;
  onClose: () => void;
}

export function AppointmentSessionDetails({
  appointment,
  isOpen,
  onClose,
}: AppointmentSessionDetailsProps) {
  const [isDownloading, setIsDownloading] = useState(false);

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const formatCurrency = (cents: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(cents / 100);
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      pending: "Pendente",
      confirmed: "Confirmado",
      completed: "Concluído",
      cancelled: "Cancelado",
    };
    return labels[status] || status;
  };

  const getPaymentStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      pending: "Pendente",
      approved: "Pago",
      rejected: "Recusado",
    };
    return labels[status] || status;
  };

  const handleCopyLink = async () => {
    if (appointment.virtual_room_link) {
      await navigator.clipboard.writeText(appointment.virtual_room_link);
      toast.success("Link copiado!");
    }
  };

  const handleDownloadRecording = async () => {
    if (!appointment.recording_url) return;

    setIsDownloading(true);
    try {
      const { data, error } = await supabase.storage
        .from("session-recordings")
        .download(appointment.recording_url);

      if (error) throw error;

      const url = URL.createObjectURL(data);
      const a = document.createElement("a");
      a.href = url;
      a.download = `gravacao_${appointment.client_name}_${appointment.appointment_date}.webm`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success("Download iniciado!");
    } catch (error) {
      console.error("Error downloading recording:", error);
      toast.error("Erro ao baixar gravação");
    } finally {
      setIsDownloading(false);
    }
  };

  const handleExportTranscription = () => {
    if (!appointment.transcription || appointment.transcription.length === 0) return;

    const text = appointment.transcription
      .map((t) => {
        const time = new Date(t.timestamp).toLocaleTimeString("pt-BR", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        });
        const speakerLabel = t.speaker === "professional" ? "Profissional" : "Paciente";
        return `[${time}] ${speakerLabel}: ${t.text}`;
      })
      .join("\n");

    const blob = new Blob([text], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `transcricao_${appointment.client_name}_${appointment.appointment_date}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success("Transcrição exportada!");
  };

  const hasSessionData = appointment.recording_url || (appointment.transcription && appointment.transcription.length > 0) || appointment.ai_psi_analysis;

  const canGeneratePDF = appointment.transcription?.length || appointment.ai_psi_analysis;

  const handleGeneratePDF = () => {
    generateSessionPDF({
      clientName: appointment.client_name,
      appointmentDate: appointment.appointment_date,
      appointmentTime: appointment.appointment_time,
      durationMinutes: appointment.duration_minutes,
      transcription: appointment.transcription,
      aiPsiAnalysis: appointment.ai_psi_analysis,
    });
    toast.success("Relatório PDF gerado com sucesso!");
  };

  const handleExportAnalysis = () => {
    if (!appointment.ai_psi_analysis) return;

    const blob = new Blob([appointment.ai_psi_analysis], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `analise_ia_psi_${appointment.client_name}_${appointment.appointment_date}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success("Análise IA Psi exportada!");
  };

  const formattedDate = format(new Date(appointment.appointment_date), "dd 'de' MMMM 'de' yyyy", { locale: ptBR });

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] p-0 overflow-hidden">
        <DialogHeader className="p-6 pb-0">
          <div className="flex items-start gap-4">
            <Avatar className="h-16 w-16 border-2 border-primary/20">
              <AvatarFallback className="bg-primary/10 text-primary text-xl font-bold">
                {getInitials(appointment.client_name)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <DialogTitle className="text-xl">{appointment.client_name}</DialogTitle>
              <div className="flex flex-col gap-1 mt-2 text-sm text-muted-foreground">
                {appointment.client_email && (
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    <span>{appointment.client_email}</span>
                  </div>
                )}
                {appointment.client_phone && (
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4" />
                    <span>{appointment.client_phone}</span>
                  </div>
                )}
              </div>
            </div>
            {canGeneratePDF && (
              <Button variant="default" size="sm" onClick={handleGeneratePDF}>
                <FileDown className="h-4 w-4 mr-1" />
                Gerar PDF
              </Button>
            )}
          </div>
        </DialogHeader>

        <Tabs defaultValue="overview" className="flex-1">
          <TabsList className="mx-6 mt-4 grid grid-cols-4 w-auto">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <Video className="h-4 w-4" />
              <span className="hidden sm:inline">Visão Geral</span>
              <span className="sm:hidden">Geral</span>
            </TabsTrigger>
            <TabsTrigger value="recording" className="flex items-center gap-2">
              <Play className="h-4 w-4" />
              Gravação
            </TabsTrigger>
            <TabsTrigger value="transcription" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Transcrição
            </TabsTrigger>
            <TabsTrigger value="analysis" className="flex items-center gap-2">
              <Brain className="h-4 w-4" />
              IA Psi
            </TabsTrigger>
          </TabsList>

          <ScrollArea className="h-[50vh] px-6 pb-6">
            <TabsContent value="overview" className="mt-4 space-y-4">
              {/* Overview Cards */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card>
                  <CardContent className="p-4 text-center">
                    <div className="text-3xl font-bold text-primary">
                      {appointment.transcription?.length || 0}
                    </div>
                    <div className="text-sm text-muted-foreground mt-1">
                      Mensagens
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 text-center">
                    <div className="text-3xl font-bold text-green-500">
                      {appointment.duration_minutes || 0}
                    </div>
                    <div className="text-sm text-muted-foreground mt-1">
                      Minutos
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 text-center">
                    <div className="text-3xl font-bold text-blue-500">
                      {appointment.recording_url ? "Sim" : "Não"}
                    </div>
                    <div className="text-sm text-muted-foreground mt-1">
                      Gravação
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 text-center">
                    <div className="text-3xl font-bold text-purple-500">
                      {appointment.ai_psi_analysis ? "Sim" : "Não"}
                    </div>
                    <div className="text-sm text-muted-foreground mt-1">
                      Análise IA
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Appointment Summary Card */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <TrendingUp className="h-4 w-4" />
                    Resumo do Agendamento
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between items-center py-2 border-b border-border/50">
                    <span className="text-muted-foreground flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      Data
                    </span>
                    <span className="font-medium">{formattedDate}</span>
                  </div>
                  {appointment.appointment_time && (
                    <div className="flex justify-between items-center py-2 border-b border-border/50">
                      <span className="text-muted-foreground flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        Horário
                      </span>
                      <span className="font-medium">
                        {appointment.appointment_time.slice(0, 5)}
                        {appointment.duration_minutes && (
                          <span className="text-muted-foreground ml-1">({appointment.duration_minutes} min)</span>
                        )}
                      </span>
                    </div>
                  )}
                  {appointment.session_type && (
                    <div className="flex justify-between items-center py-2 border-b border-border/50">
                      <span className="text-muted-foreground">Tipo de Sessão</span>
                      <span className="font-medium">{appointment.session_type}</span>
                    </div>
                  )}
                  {appointment.status && (
                    <div className="flex justify-between items-center py-2 border-b border-border/50">
                      <span className="text-muted-foreground">Status</span>
                      <Badge variant="outline">{getStatusLabel(appointment.status)}</Badge>
                    </div>
                  )}
                  {appointment.payment_status && (
                    <div className="flex justify-between items-center py-2 border-b border-border/50">
                      <span className="text-muted-foreground">Pagamento</span>
                      <Badge variant="outline">{getPaymentStatusLabel(appointment.payment_status)}</Badge>
                    </div>
                  )}
                  {appointment.amount_cents && (
                    <div className="flex justify-between items-center py-2">
                      <span className="text-muted-foreground flex items-center gap-2">
                        <DollarSign className="h-4 w-4" />
                        Valor
                      </span>
                      <span className="font-medium text-green-500">{formatCurrency(appointment.amount_cents)}</span>
                    </div>
                  )}
                </CardContent>
              </Card>

              {appointment.virtual_room_link && (
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-primary/10 rounded-lg">
                          <Link2 className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-foreground">Link da Sala Virtual</p>
                          <p className="text-xs text-muted-foreground break-all">
                            {appointment.virtual_room_link}
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-2 shrink-0">
                        <Button variant="outline" size="sm" onClick={handleCopyLink}>
                          <Copy className="h-4 w-4 mr-1" />
                          Copiar
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => window.open(appointment.virtual_room_link!, "_blank")}
                        >
                          <ExternalLink className="h-4 w-4 mr-1" />
                          Abrir
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* No Session Data */}
              {!hasSessionData && !appointment.virtual_room_link && (
                <div className="text-center py-8 text-muted-foreground">
                  <Video className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Nenhum dado de sessão disponível</p>
                  <p className="text-sm">A gravação e transcrição aparecerão aqui após a sessão.</p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="recording" className="mt-4 space-y-4">
              {appointment.recording_url ? (
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-primary/10 rounded-lg">
                          <Play className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-foreground">Gravação da Sessão</p>
                          <p className="text-xs text-muted-foreground">
                            Arquivo de vídeo disponível para download
                          </p>
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleDownloadRecording}
                        disabled={isDownloading}
                      >
                        {isDownloading ? (
                          <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                        ) : (
                          <Download className="h-4 w-4 mr-1" />
                        )}
                        Baixar
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Play className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Nenhuma gravação disponível</p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="transcription" className="mt-4 space-y-4">
              {appointment.transcription && appointment.transcription.length > 0 ? (
                <>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="text-xs">
                        {appointment.transcription.length} mensagens
                      </Badge>
                    </div>
                    <Button variant="outline" size="sm" onClick={handleExportTranscription}>
                      <Download className="h-4 w-4 mr-1" />
                      Exportar TXT
                    </Button>
                  </div>

                  <div className="space-y-3">
                    {appointment.transcription.map((entry) => (
                      <div
                        key={entry.id}
                        className={`flex gap-3 ${
                          entry.speaker === "professional" ? "" : "flex-row-reverse"
                        }`}
                      >
                        <div
                          className={`max-w-[80%] p-3 rounded-lg ${
                            entry.speaker === "professional"
                              ? "bg-primary/10 text-foreground"
                              : "bg-muted text-foreground"
                          }`}
                        >
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-xs font-medium">
                              {entry.speaker === "professional" ? "Profissional" : "Paciente"}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              {new Date(entry.timestamp).toLocaleTimeString("pt-BR", {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </span>
                          </div>
                          <p className="text-sm">{entry.text}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Nenhuma transcrição disponível</p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="analysis" className="mt-4 space-y-4">
              {appointment.ai_psi_analysis ? (
                <>
                  <div className="flex items-center justify-between">
                    <Badge variant="secondary" className="text-xs bg-purple-500/10 border-purple-500/30">
                      <Sparkles className="h-3 w-3 mr-1" />
                      Neurociência & Psicologia
                    </Badge>
                    <Button variant="outline" size="sm" onClick={handleExportAnalysis}>
                      <Download className="h-4 w-4 mr-1" />
                      Exportar
                    </Button>
                  </div>

                  <Card className="border-purple-500/20 bg-gradient-to-br from-card to-purple-950/10">
                    <CardContent className="p-4">
                      <div 
                        className="prose prose-sm dark:prose-invert max-w-none text-sm whitespace-pre-wrap leading-relaxed"
                        dangerouslySetInnerHTML={{ 
                          __html: appointment.ai_psi_analysis
                            .replace(/\*\*(.*?)\*\*/g, '<strong class="text-purple-400">$1</strong>')
                            .replace(/🧠|💭|💡|⚠️/g, '<span class="text-lg">$&</span>')
                            .replace(/\n/g, '<br/>')
                        }}
                      />
                    </CardContent>
                  </Card>
                </>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Brain className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Nenhuma análise IA disponível</p>
                  <p className="text-sm">A análise será gerada automaticamente após a sessão.</p>
                </div>
              )}
            </TabsContent>
          </ScrollArea>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}