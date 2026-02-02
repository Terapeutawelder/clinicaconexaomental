import { useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Plus,
  Trash2,
  RefreshCw,
  QrCode,
  Link2,
  Smartphone,
  User,
  CheckCircle,
  XCircle,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface WhatsAppConnectionsProps {
  profileId: string;
  connections: any[];
  onConnectionsChange: () => void;
}

interface NewConnection {
  name: string;
  driverType: "baileys" | "official";
  phoneNumber: string;
  // Official API fields
  accessToken: string;
  wabaId: string;
  phoneNumberId: string;
}

export const WhatsAppConnections = ({
  profileId,
  connections,
  onConnectionsChange,
}: WhatsAppConnectionsProps) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [connectingId, setConnectingId] = useState<string | null>(null);
  const [verifyingId, setVerifyingId] = useState<string | null>(null);
  const [qrCodeData, setQrCodeData] = useState<{ id: string; qr: string; sessionToken?: string } | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [isDeletingDisconnected, setIsDeletingDisconnected] = useState(false);
  const pollingRef = useRef<boolean>(false);

  const [newConnection, setNewConnection] = useState<NewConnection>({
    name: "",
    driverType: "baileys",
    phoneNumber: "",
    accessToken: "",
    wabaId: "",
    phoneNumberId: "",
  });

  // Cleanup polling on unmount
  useEffect(() => {
    return () => {
      pollingRef.current = false;
    };
  }, []);

  const callWhatsAppManager = async (action: string, connectionId: string, data?: any) => {
    const { data: response, error } = await supabase.functions.invoke("whatsapp-manager", {
      body: { action, connectionId, data },
    });

    if (error) {
      console.error("WhatsApp Manager error:", error);
      throw error;
    }

    return response;
  };

  const handleCreateConnection = async () => {
    if (!newConnection.name.trim()) {
      toast.error("Informe um nome para a conexão");
      return;
    }

    if (newConnection.driverType === "official") {
      if (!newConnection.accessToken || !newConnection.phoneNumberId) {
        toast.error("Preencha as credenciais da API Oficial");
        return;
      }
    }

    setIsCreating(true);

    try {
      // Create connection in database
      const { data, error } = await supabase
        .from("whatsapp_connections")
        .insert({
          professional_id: profileId,
          name: newConnection.name,
          driver_type: newConnection.driverType,
          phone_number: newConnection.phoneNumber || null,
          access_token: newConnection.driverType === "official" ? newConnection.accessToken : null,
          waba_id: newConnection.driverType === "official" ? newConnection.wabaId : null,
          phone_number_id: newConnection.driverType === "official" ? newConnection.phoneNumberId : null,
          session_data: null,
          status: "disconnected",
        })
        .select()
        .single();

      if (error) throw error;

      toast.success("Conexão criada com sucesso!");
      setIsDialogOpen(false);
      setNewConnection({
        name: "",
        driverType: "baileys",
        phoneNumber: "",
        accessToken: "",
        wabaId: "",
        phoneNumberId: "",
      });
      onConnectionsChange();
    } catch (error) {
      console.error("Error creating connection:", error);
      toast.error("Erro ao criar conexão");
    } finally {
      setIsCreating(false);
    }
  };

  const handleConnect = async (connection: any) => {
    setConnectingId(connection.id);
    setQrCodeData(null);
    pollingRef.current = false;

    try {
      if (connection.driver_type === "baileys") {
        // Generate QR Code via edge function
        const response = await callWhatsAppManager("generate-qr", connection.id);
        
        if (response.success && response.qrCode) {
          // For now, we'll show a placeholder QR code
          // In production, this would be the actual WhatsApp Web QR
          setQrCodeData({ 
            id: connection.id, 
            qr: response.qrCode,
            sessionToken: response.sessionToken
          });
          toast.info("Escaneie o QR Code com seu WhatsApp");
          
          // Start polling for connection status
          startPolling(connection.id);
        } else {
          toast.error("Erro ao gerar QR Code");
          setConnectingId(null);
        }
      } else {
        // Official API - verify credentials
        toast.info("Verificando credenciais da API Oficial...");
        
        const response = await callWhatsAppManager("verify-official", connection.id, {
          accessToken: connection.access_token,
          phoneNumberId: connection.phone_number_id,
          wabaId: connection.waba_id,
        });
        
        if (response.success) {
          toast.success("Conectado via API Oficial!");
          onConnectionsChange();
        } else {
          toast.error(response.error || "Erro ao verificar credenciais");
        }
        setConnectingId(null);
      }
    } catch (error) {
      console.error("Error connecting:", error);
      toast.error("Erro ao conectar");
      setConnectingId(null);
    }
  };

  const startPolling = (connectionId: string) => {
    let attempts = 0;
    const maxAttempts = 60;
    pollingRef.current = true;

    const poll = async () => {
      if (!pollingRef.current) return;
      
      attempts++;
      if (attempts > maxAttempts) {
        setQrCodeData(null);
        setConnectingId(null);
        pollingRef.current = false;
        toast.error("Tempo esgotado. Tente novamente.");
        return;
      }

      try {
        const response = await callWhatsAppManager("check-status", connectionId);
        
        if (response.status === "connected") {
          pollingRef.current = false;
          setQrCodeData(null);
          setConnectingId(null);
          toast.success("WhatsApp conectado com sucesso!");
          onConnectionsChange();
          return;
        }
      } catch (err) {
        console.error("Polling error:", err);
      }

      if (pollingRef.current) {
        setTimeout(poll, 2000);
      }
    };

    setTimeout(poll, 2000);
  };

  const handleVerify = async (connection: any) => {
    setVerifyingId(connection.id);

    try {
      if (connection.driver_type === "baileys") {
        const response = await callWhatsAppManager("check-status", connection.id);
        
        if (response.status === "connected") {
          toast.success("Conexão ativa!");
        } else {
          toast.warning("Conexão desconectada");
        }
        onConnectionsChange();
      } else {
        // Official API verification
        const response = await callWhatsAppManager("verify-official", connection.id, {
          accessToken: connection.access_token,
          phoneNumberId: connection.phone_number_id,
          wabaId: connection.waba_id,
        });
        
        if (response.success) {
          toast.success("Credenciais verificadas!");
        } else {
          toast.warning(response.error || "Credenciais inválidas");
        }
        onConnectionsChange();
      }
    } catch (error) {
      console.error("Error verifying:", error);
      toast.error("Erro ao verificar conexão");
    } finally {
      setVerifyingId(null);
    }
  };

  const handleDisconnect = async (connectionId: string) => {
    try {
      await callWhatsAppManager("disconnect", connectionId);
      toast.success("Desconectado!");
      onConnectionsChange();
    } catch (error) {
      console.error("Error disconnecting:", error);
      toast.error("Erro ao desconectar");
    }
  };

  const handleDelete = async (connectionId: string) => {
    try {
      // Disconnect first
      await callWhatsAppManager("disconnect", connectionId);

      const { error } = await supabase
        .from("whatsapp_connections")
        .delete()
        .eq("id", connectionId);

      if (error) throw error;

      toast.success("Conexão excluída!");
      setDeleteConfirmId(null);
      onConnectionsChange();
    } catch (error) {
      console.error("Error deleting connection:", error);
      toast.error("Erro ao excluir conexão");
    }
  };

  const handleDeleteDisconnected = async () => {
    setIsDeletingDisconnected(true);
    try {
      const disconnected = connections.filter(c => c.status === "disconnected");

      const { error } = await supabase
        .from("whatsapp_connections")
        .delete()
        .eq("professional_id", profileId)
        .eq("status", "disconnected");

      if (error) throw error;

      toast.success(`${disconnected.length} conexões excluídas!`);
      onConnectionsChange();
    } catch (error) {
      console.error("Error deleting disconnected:", error);
      toast.error("Erro ao excluir conexões");
    } finally {
      setIsDeletingDisconnected(false);
    }
  };

  const handleCloseQrModal = () => {
    pollingRef.current = false;
    setQrCodeData(null);
    setConnectingId(null);
  };

  const disconnectedCount = connections.filter(c => c.status === "disconnected").length;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Conexões WhatsApp</h1>
          <p className="text-muted-foreground">
            Gerencie todas as suas conexões do WhatsApp em um só lugar
          </p>
        </div>
        <div className="flex gap-2">
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-green-500 hover:bg-green-600 text-white">
                <Plus className="h-4 w-4 mr-2" />
                Criar conexão
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Nova Conexão</DialogTitle>
                <DialogDescription>
                  Configure uma nova conexão do WhatsApp
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>Nome da Conexão *</Label>
                  <Input
                    placeholder="Ex: Atendimento Principal"
                    value={newConnection.name}
                    onChange={(e) => setNewConnection({ ...newConnection, name: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Tipo de Conexão *</Label>
                  <Select
                    value={newConnection.driverType}
                    onValueChange={(value: "baileys" | "official") =>
                      setNewConnection({ ...newConnection, driverType: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="baileys">
                        <div className="flex items-center gap-2">
                          <QrCode className="h-4 w-4" />
                          <span>WhatsApp Web (QR Code)</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="official">
                        <div className="flex items-center gap-2">
                          <Link2 className="h-4 w-4" />
                          <span>API Oficial (Meta)</span>
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {newConnection.driverType === "baileys" && (
                  <div className="space-y-2">
                    <Label>Número do WhatsApp</Label>
                    <Input
                      placeholder="Ex: 11999999999"
                      value={newConnection.phoneNumber}
                      onChange={(e) => setNewConnection({ ...newConnection, phoneNumber: e.target.value })}
                    />
                    <p className="text-xs text-muted-foreground">
                      Opcional. Será detectado automaticamente após conexão.
                    </p>
                  </div>
                )}

                {newConnection.driverType === "official" && (
                  <>
                    <div className="space-y-2">
                      <Label>Access Token *</Label>
                      <Input
                        placeholder="Token de acesso da Meta"
                        value={newConnection.accessToken}
                        onChange={(e) => setNewConnection({ ...newConnection, accessToken: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>WABA ID *</Label>
                      <Input
                        placeholder="ID da conta Business"
                        value={newConnection.wabaId}
                        onChange={(e) => setNewConnection({ ...newConnection, wabaId: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Phone Number ID *</Label>
                      <Input
                        placeholder="ID do número de telefone"
                        value={newConnection.phoneNumberId}
                        onChange={(e) => setNewConnection({ ...newConnection, phoneNumberId: e.target.value })}
                      />
                    </div>
                  </>
                )}
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button onClick={handleCreateConnection} disabled={isCreating}>
                  {isCreating ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Criando...
                    </>
                  ) : (
                    "Criar Conexão"
                  )}
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          {disconnectedCount > 0 && (
            <Button
              variant="destructive"
              onClick={handleDeleteDisconnected}
              disabled={isDeletingDisconnected}
            >
              {isDeletingDisconnected ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Trash2 className="h-4 w-4 mr-2" />
              )}
              Excluir desconectados ({disconnectedCount})
            </Button>
          )}
        </div>
      </div>

      {/* Connections Grid */}
      {connections.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Smartphone className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">Nenhuma conexão</h3>
            <p className="text-muted-foreground text-center mb-4">
              Crie sua primeira conexão do WhatsApp para começar a enviar mensagens
            </p>
            <Button onClick={() => setIsDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Criar conexão
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {connections.map((connection) => (
            <Card key={connection.id} className="relative">
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      "w-10 h-10 rounded-full flex items-center justify-center",
                      connection.status === "connected" ? "bg-green-100 dark:bg-green-900" : "bg-gray-100 dark:bg-gray-800"
                    )}>
                      {connection.avatar_url ? (
                        <img 
                          src={connection.avatar_url} 
                          alt={connection.name}
                          className="w-10 h-10 rounded-full object-cover"
                        />
                      ) : (
                        <User className={cn(
                          "h-5 w-5",
                          connection.status === "connected" ? "text-green-600" : "text-gray-500"
                        )} />
                      )}
                    </div>
                    <div>
                      <h3 className="font-medium">{connection.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        {connection.phone_number || "Não conectado"}
                      </p>
                    </div>
                  </div>
                  <Badge 
                    variant={connection.status === "connected" ? "default" : "secondary"}
                    className={cn(
                      connection.status === "connected" && "bg-green-500 hover:bg-green-600"
                    )}
                  >
                    {connection.status === "connected" ? "Conectado" : "Desconectado"}
                  </Badge>
                </div>

                <div className="flex items-center gap-1 text-xs text-muted-foreground mb-4">
                  {connection.driver_type === "baileys" ? (
                    <>
                      <QrCode className="h-3 w-3" />
                      <span>QR Code</span>
                    </>
                  ) : (
                    <>
                      <Link2 className="h-3 w-3" />
                      <span>API Oficial</span>
                    </>
                  )}
                </div>

                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleVerify(connection)}
                    disabled={verifyingId === connection.id}
                  >
                    {verifyingId === connection.id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <RefreshCw className="h-4 w-4" />
                    )}
                  </Button>

                  {connection.status === "connected" ? (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDisconnect(connection.id)}
                      className="flex-1"
                    >
                      <XCircle className="h-4 w-4 mr-2" />
                      Desconectar
                    </Button>
                  ) : (
                    <Button
                      size="sm"
                      onClick={() => handleConnect(connection)}
                      disabled={connectingId === connection.id}
                      className="flex-1"
                    >
                      {connectingId === connection.id ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Conectando...
                        </>
                      ) : (
                        <>
                          <QrCode className="h-4 w-4 mr-2" />
                          Conectar
                        </>
                      )}
                    </Button>
                  )}

                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => setDeleteConfirmId(connection.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* QR Code Modal */}
      <Dialog open={!!qrCodeData} onOpenChange={(open) => !open && handleCloseQrModal()}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Escaneie o QR Code</DialogTitle>
            <DialogDescription>
              Abra o WhatsApp no seu celular e escaneie o código abaixo
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col items-center py-6">
            {qrCodeData?.qr && (
              <div className="bg-white p-4 rounded-lg">
                {qrCodeData.qr.startsWith("data:") ? (
                  <img 
                    src={qrCodeData.qr} 
                    alt="QR Code" 
                    className="w-64 h-64"
                  />
                ) : (
                  <div className="w-64 h-64 flex flex-col items-center justify-center bg-gray-100 rounded-lg">
                    <QrCode className="h-24 w-24 text-green-600 mb-4" />
                    <p className="text-sm text-center text-gray-600 px-4">
                      Aguardando integração do servidor Baileys...
                    </p>
                    <p className="text-xs text-center text-gray-400 mt-2 px-4">
                      O QR Code será exibido quando o servidor estiver configurado
                    </p>
                  </div>
                )}
              </div>
            )}
            <div className="flex items-center gap-2 mt-4 text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Aguardando conexão...</span>
            </div>
          </div>
          <div className="flex justify-center">
            <Button variant="outline" onClick={handleCloseQrModal}>
              Cancelar
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteConfirmId} onOpenChange={(open) => !open && setDeleteConfirmId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir conexão?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. A conexão será permanentemente removida.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteConfirmId && handleDelete(deleteConfirmId)}
              className="bg-destructive hover:bg-destructive/90"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
