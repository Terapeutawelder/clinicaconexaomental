import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";
import {
  CalendarIcon,
  Clock,
  Save,
  Loader2,
  Send,
  Pause,
  Play,
  Smartphone,
  MessageCircle,
  User,
} from "lucide-react";

interface WhatsAppDispatchesProps {
  profileId: string;
  connections: any[];
}

interface DispatchConfig {
  schedule_enabled: boolean;
  scheduled_at: Date | null;
  delay_min_seconds: number;
  delay_max_seconds: number;
  pause_after_messages: number;
  pause_minutes: number;
  start_time: string;
  end_time: string;
  active_days: number[];
}

const WEEKDAYS = [
  { value: 0, label: "DOMINGO", short: "DOM" },
  { value: 1, label: "SEGUNDA", short: "SEG" },
  { value: 2, label: "TERÇA", short: "TER" },
  { value: 3, label: "QUARTA", short: "QUA" },
  { value: 4, label: "QUINTA", short: "QUI" },
  { value: 5, label: "SEXTA", short: "SEX" },
  { value: 6, label: "SÁBADO", short: "SÁB" },
];

export const WhatsAppDispatches = ({ profileId, connections }: WhatsAppDispatchesProps) => {
  const [selectedConnection, setSelectedConnection] = useState<string>("");
  const [config, setConfig] = useState<DispatchConfig>({
    schedule_enabled: false,
    scheduled_at: null,
    delay_min_seconds: 30,
    delay_max_seconds: 60,
    pause_after_messages: 50,
    pause_minutes: 10,
    start_time: "08:00",
    end_time: "18:00",
    active_days: [1, 2, 3, 4, 5],
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [previewMessage, setPreviewMessage] = useState("");

  useEffect(() => {
    if (selectedConnection) {
      fetchConfig();
    }
  }, [selectedConnection, profileId]);

  const fetchConfig = async () => {
    if (!selectedConnection) return;

    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("whatsapp_dispatch_config")
        .select("*")
        .eq("professional_id", profileId)
        .eq("connection_id", selectedConnection)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        setConfig({
          schedule_enabled: data.schedule_enabled || false,
          scheduled_at: data.scheduled_at ? new Date(data.scheduled_at) : null,
          delay_min_seconds: data.delay_min_seconds || 30,
          delay_max_seconds: data.delay_max_seconds || 60,
          pause_after_messages: data.pause_after_messages || 50,
          pause_minutes: data.pause_minutes || 10,
          start_time: data.start_time || "08:00",
          end_time: data.end_time || "18:00",
          active_days: data.active_days || [1, 2, 3, 4, 5],
        });
      }
    } catch (error) {
      console.error("Error fetching config:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    if (!selectedConnection) {
      toast.error("Selecione uma conexão");
      return;
    }

    setIsSaving(true);
    try {
      const payload = {
        professional_id: profileId,
        connection_id: selectedConnection,
        schedule_enabled: config.schedule_enabled,
        scheduled_at: config.scheduled_at?.toISOString() || null,
        delay_min_seconds: config.delay_min_seconds,
        delay_max_seconds: config.delay_max_seconds,
        pause_after_messages: config.pause_after_messages,
        pause_minutes: config.pause_minutes,
        start_time: config.start_time,
        end_time: config.end_time,
        active_days: config.active_days,
      };

      const { error } = await supabase
        .from("whatsapp_dispatch_config")
        .upsert(payload, {
          onConflict: "professional_id,connection_id",
        });

      if (error) throw error;

      toast.success("Configurações salvas!");
    } catch (error) {
      console.error("Error saving config:", error);
      toast.error("Erro ao salvar configurações");
    } finally {
      setIsSaving(false);
    }
  };

  const toggleDay = (day: number) => {
    setConfig(prev => ({
      ...prev,
      active_days: prev.active_days.includes(day)
        ? prev.active_days.filter(d => d !== day)
        : [...prev.active_days, day].sort(),
    }));
  };

  const baileysConnections = connections.filter(c => c.driver_type === "baileys");

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Disparos</h1>
          <p className="text-muted-foreground">
            Configure os parâmetros anti-bloqueio para seus envios
          </p>
        </div>
      </div>

      {/* Connection Selector */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Conexão</CardTitle>
          <CardDescription>
            Selecione a conexão WhatsApp para configurar
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Select value={selectedConnection} onValueChange={setSelectedConnection}>
            <SelectTrigger className="max-w-md">
              <SelectValue placeholder="Selecione uma conexão..." />
            </SelectTrigger>
            <SelectContent>
              {baileysConnections.map((conn) => (
                <SelectItem key={conn.id} value={conn.id}>
                  <div className="flex items-center gap-2">
                    <MessageCircle className="h-4 w-4 text-green-500" />
                    <span>{conn.name}</span>
                    {conn.phone_number && (
                      <span className="text-muted-foreground">({conn.phone_number})</span>
                    )}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {baileysConnections.length === 0 && (
            <p className="text-sm text-muted-foreground mt-2">
              Nenhuma conexão Baileys (QR Code) disponível. As configurações de disparo são apenas para conexões via QR Code.
            </p>
          )}
        </CardContent>
      </Card>

      {selectedConnection && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Configuration Panel */}
          <div className="lg:col-span-2 space-y-6">
            {/* Schedule */}
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <div className="w-1 h-6 bg-green-500 rounded" />
                    <h3 className="font-semibold">Agendar disparo</h3>
                  </div>
                  <Switch
                    checked={config.schedule_enabled}
                    onCheckedChange={(checked) => 
                      setConfig(prev => ({ ...prev, schedule_enabled: checked }))
                    }
                  />
                </div>
                <p className="text-sm text-muted-foreground mb-4">
                  Agendar para data específica
                </p>
                
                {config.schedule_enabled && (
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="w-full justify-start">
                        <CalendarIcon className="h-4 w-4 mr-2" />
                        {config.scheduled_at 
                          ? format(config.scheduled_at, "PPP 'às' HH:mm", { locale: ptBR })
                          : "Selecione data e hora"
                        }
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={config.scheduled_at || undefined}
                        onSelect={(date) => setConfig(prev => ({ ...prev, scheduled_at: date || null }))}
                        locale={ptBR}
                      />
                    </PopoverContent>
                  </Popover>
                )}
              </CardContent>
            </Card>

            {/* Delay Interval */}
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-1 h-6 bg-green-500 rounded" />
                  <h3 className="font-semibold">Intervalo entre mensagens</h3>
                </div>
                
                <div className="flex items-center gap-3">
                  <Input
                    type="number"
                    value={config.delay_min_seconds}
                    onChange={(e) => setConfig(prev => ({ 
                      ...prev, 
                      delay_min_seconds: parseInt(e.target.value) || 0 
                    }))}
                    className="w-20"
                  />
                  <span className="text-muted-foreground">e</span>
                  <Input
                    type="number"
                    value={config.delay_max_seconds}
                    onChange={(e) => setConfig(prev => ({ 
                      ...prev, 
                      delay_max_seconds: parseInt(e.target.value) || 0 
                    }))}
                    className="w-20"
                  />
                  <span className="text-muted-foreground">segundos</span>
                </div>
              </CardContent>
            </Card>

            {/* Auto Pause */}
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-1 h-6 bg-green-500 rounded" />
                  <h3 className="font-semibold">Pausa automática</h3>
                </div>
                
                <div className="flex items-center gap-3">
                  <span className="text-muted-foreground">Após</span>
                  <Input
                    type="number"
                    value={config.pause_after_messages}
                    onChange={(e) => setConfig(prev => ({ 
                      ...prev, 
                      pause_after_messages: parseInt(e.target.value) || 0 
                    }))}
                    className="w-20"
                  />
                  <span className="text-muted-foreground">mensagens, aguardar</span>
                  <Input
                    type="number"
                    value={config.pause_minutes}
                    onChange={(e) => setConfig(prev => ({ 
                      ...prev, 
                      pause_minutes: parseInt(e.target.value) || 0 
                    }))}
                    className="w-20"
                  />
                  <span className="text-muted-foreground">minutos</span>
                </div>
              </CardContent>
            </Card>

            {/* Time Window */}
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-1 h-6 bg-green-500 rounded" />
                  <h3 className="font-semibold">Horário de envio</h3>
                </div>
                
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    <Input
                      type="time"
                      value={config.start_time}
                      onChange={(e) => setConfig(prev => ({ ...prev, start_time: e.target.value }))}
                      className="w-28"
                    />
                    <Clock className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <span className="text-muted-foreground">às</span>
                  <div className="flex items-center gap-2">
                    <Input
                      type="time"
                      value={config.end_time}
                      onChange={(e) => setConfig(prev => ({ ...prev, end_time: e.target.value }))}
                      className="w-28"
                    />
                    <Clock className="h-4 w-4 text-muted-foreground" />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Active Days */}
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-1 h-6 bg-green-500 rounded" />
                  <h3 className="font-semibold">Dias da semana</h3>
                </div>
                
                <div className="flex flex-wrap gap-2">
                  {WEEKDAYS.map((day) => (
                    <button
                      key={day.value}
                      type="button"
                      onClick={() => toggleDay(day.value)}
                      className={cn(
                        "px-4 py-2 rounded-lg border transition-colors text-sm",
                        config.active_days.includes(day.value)
                          ? "bg-green-500/10 border-green-500 text-green-600"
                          : "bg-muted border-border text-muted-foreground hover:bg-muted/80"
                      )}
                    >
                      <div className="font-medium">{day.label}</div>
                      <div className="text-xs">{day.short}</div>
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Save Button */}
            <Button
              onClick={handleSave}
              disabled={isSaving}
              className="w-full bg-green-500 hover:bg-green-600 text-white"
            >
              {isSaving ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Salvando...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Salvar Configurações
                </>
              )}
            </Button>
          </div>

          {/* Preview Panel */}
          <div className="lg:col-span-1">
            <Card className="sticky top-6">
              <CardContent className="pt-6">
                <div className="relative mx-auto w-full max-w-[280px]">
                  {/* Phone Frame */}
                  <div className="rounded-[2.5rem] bg-gray-900 p-2">
                    <div className="rounded-[2rem] bg-white overflow-hidden">
                      {/* Phone Header */}
                      <div className="bg-green-600 px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                            <User className="h-5 w-5 text-white" />
                          </div>
                          <div className="text-white">
                            <div className="font-medium">Contato Exemplo</div>
                            <div className="text-xs opacity-80">online</div>
                          </div>
                        </div>
                      </div>

                      {/* Chat Area */}
                      <div className="h-[350px] bg-[#e5ddd5] p-4 flex items-center justify-center">
                        {previewMessage ? (
                          <div className="bg-white rounded-lg p-3 shadow-sm max-w-[90%]">
                            <p className="text-sm">{previewMessage}</p>
                          </div>
                        ) : (
                          <p className="text-center text-sm text-gray-500">
                            Digite uma mensagem para ver o preview
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Preview Input */}
                <div className="mt-4">
                  <Label className="text-sm text-muted-foreground">
                    Prévia da mensagem
                  </Label>
                  <Textarea
                    placeholder="Digite uma mensagem de teste..."
                    value={previewMessage}
                    onChange={(e) => setPreviewMessage(e.target.value)}
                    className="mt-2"
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
};
