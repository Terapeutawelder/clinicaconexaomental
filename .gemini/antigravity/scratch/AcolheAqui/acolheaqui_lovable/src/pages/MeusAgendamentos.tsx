import { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Calendar, Clock, User, Video, ArrowLeft, Search, CheckCircle, XCircle, AlertCircle } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface Appointment {
  id: string;
  client_name: string;
  client_email: string;
  appointment_date: string;
  appointment_time: string;
  duration_minutes: number;
  status: string;
  payment_status: string;
  session_type: string;
  virtual_room_link: string | null;
  notes: string | null;
  professional: {
    full_name: string;
    specialty: string;
    avatar_url: string | null;
  };
}

const statusConfig: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline"; icon: React.ReactNode }> = {
  pending: { label: "Pendente", variant: "secondary", icon: <AlertCircle className="w-3 h-3" /> },
  confirmed: { label: "Confirmado", variant: "default", icon: <CheckCircle className="w-3 h-3" /> },
  completed: { label: "Concluído", variant: "outline", icon: <CheckCircle className="w-3 h-3" /> },
  cancelled: { label: "Cancelado", variant: "destructive", icon: <XCircle className="w-3 h-3" /> },
};

const paymentStatusConfig: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  pending: { label: "Aguardando", variant: "secondary" },
  paid: { label: "Pago", variant: "default" },
  failed: { label: "Falhou", variant: "destructive" },
  refunded: { label: "Reembolsado", variant: "outline" },
};

export default function MeusAgendamentos() {
  const [searchParams] = useSearchParams();
  const tokenFromUrl = searchParams.get("token");

  const [token, setToken] = useState(tokenFromUrl || "");
  const [appointment, setAppointment] = useState<Appointment | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searched, setSearched] = useState(false);

  useEffect(() => {
    if (tokenFromUrl) {
      fetchAppointment(tokenFromUrl);
    }
  }, [tokenFromUrl]);

  const fetchAppointment = async (accessToken: string) => {
    setLoading(true);
    setError(null);
    setSearched(true);

    try {
      // First, find the token and check if it's valid
      const { data: tokenData, error: tokenError } = await supabase
        .from("appointment_access_tokens")
        .select("appointment_id, expires_at")
        .eq("token", accessToken)
        .maybeSingle();

      if (tokenError) throw tokenError;

      if (!tokenData) {
        setError("Token inválido ou não encontrado.");
        setAppointment(null);
        return;
      }

      // Check if token is expired
      if (new Date(tokenData.expires_at) < new Date()) {
        setError("Este link expirou. Solicite um novo link ao profissional.");
        setAppointment(null);
        return;
      }

      // Fetch appointment details using service role via edge function
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/get-client-appointment`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "apikey": import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
          },
          body: JSON.stringify({ token: accessToken }),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Erro ao buscar agendamento");
      }

      setAppointment(result.appointment);
    } catch (err) {
      console.error("Error fetching appointment:", err);
      setError("Erro ao buscar agendamento. Tente novamente.");
      setAppointment(null);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (token.trim()) {
      fetchAppointment(token.trim());
    }
  };

  const formatDate = (dateStr: string) => {
    return format(new Date(dateStr + "T00:00:00"), "EEEE, d 'de' MMMM 'de' yyyy", { locale: ptBR });
  };

  const formatTime = (timeStr: string) => {
    return timeStr.slice(0, 5);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <Link to="/" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-8">
          <ArrowLeft className="w-4 h-4" />
          Voltar ao início
        </Link>

        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Meus Agendamentos</h1>
          <p className="text-muted-foreground">
            Visualize os detalhes do seu agendamento usando o token enviado por email
          </p>
        </div>

        {!tokenFromUrl && (
          <Card className="mb-8 border-border/50 shadow-lg">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Search className="w-5 h-5 text-primary" />
                Buscar Agendamento
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSearch} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="token">Token de Acesso</Label>
                  <Input
                    id="token"
                    type="text"
                    placeholder="Cole seu token aqui..."
                    value={token}
                    onChange={(e) => setToken(e.target.value)}
                    className="font-mono text-sm"
                  />
                  <p className="text-xs text-muted-foreground">
                    Você recebeu este token no email de confirmação do agendamento
                  </p>
                </div>
                <Button type="submit" className="w-full" disabled={!token.trim() || loading}>
                  {loading ? "Buscando..." : "Buscar Agendamento"}
                </Button>
              </form>
            </CardContent>
          </Card>
        )}

        {loading && (
          <Card className="border-border/50 shadow-lg">
            <CardContent className="p-6 space-y-4">
              <div className="flex items-center gap-4">
                <Skeleton className="w-16 h-16 rounded-full" />
                <div className="space-y-2">
                  <Skeleton className="h-5 w-40" />
                  <Skeleton className="h-4 w-32" />
                </div>
              </div>
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-10 w-full" />
            </CardContent>
          </Card>
        )}

        {error && searched && !loading && (
          <Card className="border-destructive/50 bg-destructive/5">
            <CardContent className="p-6 text-center">
              <XCircle className="w-12 h-12 text-destructive mx-auto mb-4" />
              <p className="text-destructive font-medium">{error}</p>
            </CardContent>
          </Card>
        )}

        {appointment && !loading && (
          <Card className="border-border/50 shadow-lg overflow-hidden">
            <div className="bg-primary/10 p-6 border-b border-border/50">
              <div className="flex items-center gap-4">
                {appointment.professional.avatar_url ? (
                  <img
                    src={appointment.professional.avatar_url}
                    alt={appointment.professional.full_name}
                    className="w-16 h-16 rounded-full object-cover border-2 border-primary/20"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center">
                    <User className="w-8 h-8 text-primary" />
                  </div>
                )}
                <div>
                  <h2 className="text-xl font-semibold text-foreground">
                    {appointment.professional.full_name}
                  </h2>
                  <p className="text-muted-foreground">{appointment.professional.specialty}</p>
                </div>
              </div>
            </div>

            <CardContent className="p-6 space-y-6">
              <div className="flex flex-wrap gap-2">
                <Badge variant={statusConfig[appointment.status]?.variant || "secondary"} className="gap-1">
                  {statusConfig[appointment.status]?.icon}
                  {statusConfig[appointment.status]?.label || appointment.status}
                </Badge>
                <Badge variant={paymentStatusConfig[appointment.payment_status]?.variant || "secondary"}>
                  {paymentStatusConfig[appointment.payment_status]?.label || appointment.payment_status}
                </Badge>
                {appointment.session_type && (
                  <Badge variant="outline">{appointment.session_type}</Badge>
                )}
              </div>

              <div className="grid gap-4">
                <div className="flex items-center gap-3 p-4 bg-muted/50 rounded-lg">
                  <Calendar className="w-5 h-5 text-primary" />
                  <div>
                    <p className="text-sm text-muted-foreground">Data</p>
                    <p className="font-medium capitalize">{formatDate(appointment.appointment_date)}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-4 bg-muted/50 rounded-lg">
                  <Clock className="w-5 h-5 text-primary" />
                  <div>
                    <p className="text-sm text-muted-foreground">Horário</p>
                    <p className="font-medium">
                      {formatTime(appointment.appointment_time)} ({appointment.duration_minutes} minutos)
                    </p>
                  </div>
                </div>

                {appointment.virtual_room_link && appointment.status === "confirmed" && (
                  <a
                    href={appointment.virtual_room_link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 p-4 bg-primary/10 rounded-lg hover:bg-primary/20 transition-colors"
                  >
                    <Video className="w-5 h-5 text-primary" />
                    <div>
                      <p className="text-sm text-muted-foreground">Sala Virtual</p>
                      <p className="font-medium text-primary">Clique para acessar a sessão</p>
                    </div>
                  </a>
                )}
              </div>

              {appointment.notes && (
                <div className="p-4 bg-muted/30 rounded-lg">
                  <p className="text-sm text-muted-foreground mb-1">Observações</p>
                  <p className="text-foreground">{appointment.notes}</p>
                </div>
              )}

              <div className="pt-4 border-t border-border/50">
                <p className="text-xs text-muted-foreground text-center">
                  Agendamento para: <strong>{appointment.client_name}</strong> ({appointment.client_email})
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {searched && !loading && !error && !appointment && (
          <Card className="border-border/50">
            <CardContent className="p-6 text-center">
              <Search className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">Nenhum agendamento encontrado com este token.</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
