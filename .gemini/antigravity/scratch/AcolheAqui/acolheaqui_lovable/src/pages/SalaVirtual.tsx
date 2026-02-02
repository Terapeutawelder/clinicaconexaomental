import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { 
  Video, 
  VideoOff, 
  Mic, 
  MicOff, 
  PhoneOff, 
  Users,
  Maximize,
  Minimize,
  LogIn
} from "lucide-react";
import { cn } from "@/lib/utils";

const SalaVirtual = () => {
  const { roomCode } = useParams();
  const navigate = useNavigate();
  const [patientName, setPatientName] = useState("");
  const [inputRoomCode, setInputRoomCode] = useState("");
  const [isJoining, setIsJoining] = useState(false);
  const [isInRoom, setIsInRoom] = useState(false);
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [peerConnected, setPeerConnected] = useState(false);
  const [virtualRoomDbId, setVirtualRoomDbId] = useState<string | null>(null);
  const [effectiveRoomCode, setEffectiveRoomCode] = useState<string>("");
  
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
  const roomContainerRef = useRef<HTMLDivElement>(null);

  const startLocalStream = async () => {
    try {
      console.log("Requesting media devices...");
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: "user"
        },
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }
      });
      
      console.log("Got media stream:", stream.getTracks().map(t => `${t.kind}: ${t.label}`));
      setLocalStream(stream);
      
      return stream;
    } catch (error) {
      console.error("Error accessing media devices:", error);
      toast.error("Não foi possível acessar câmera/microfone. Verifique as permissões.");
      throw error;
    }
  };

  // Effect to attach stream to video element when both are ready
  useEffect(() => {
    if (localStream && localVideoRef.current) {
      console.log("Attaching local stream to video element");
      localVideoRef.current.srcObject = localStream;
    }
  }, [localStream, isInRoom]);

  // Fetch TURN credentials from edge function
  const getTurnCredentials = async (): Promise<RTCIceServer[]> => {
    try {
      console.log("Fetching TURN credentials...");
      const { data, error } = await supabase.functions.invoke('get-turn-credentials');
      
      if (error) {
        console.error("Error fetching TURN credentials:", error);
        throw error;
      }
      
      console.log("Got ICE servers:", data.iceServers?.length || 0, "servers");
      return data.iceServers || [
        { urls: "stun:stun.l.google.com:19302" },
        { urls: "stun:stun1.l.google.com:19302" },
      ];
    } catch (error) {
      console.error("Failed to get TURN credentials, using STUN fallback:", error);
      return [
        { urls: "stun:stun.l.google.com:19302" },
        { urls: "stun:stun1.l.google.com:19302" },
        { urls: "stun:stun2.l.google.com:19302" },
      ];
    }
  };

  const createPeerConnection = async (stream: MediaStream): Promise<RTCPeerConnection> => {
    const iceServers = await getTurnCredentials();
    
    const configuration: RTCConfiguration = {
      iceServers,
      iceTransportPolicy: "all", // Use both TURN and direct connections
    };
    
    console.log("Creating peer connection with", iceServers.length, "ICE servers");
    const pc = new RTCPeerConnection(configuration);
    
    stream.getTracks().forEach(track => {
      pc.addTrack(track, stream);
    });
    
    pc.ontrack = (event) => {
      console.log("Remote track received:", event.streams[0]);
      setRemoteStream(event.streams[0]);
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = event.streams[0];
      }
      setPeerConnected(true);
    };
    
    pc.onconnectionstatechange = () => {
      console.log("Connection state:", pc.connectionState);
      if (pc.connectionState === "connected") {
        setPeerConnected(true);
        toast.success("Conectado à sessão!");
      } else if (pc.connectionState === "disconnected" || pc.connectionState === "failed") {
        setPeerConnected(false);
        toast.info("Profissional desconectado");
      }
    };

    pc.onicecandidate = (event) => {
      if (event.candidate) {
        console.log("ICE candidate:", event.candidate.type, event.candidate.protocol);
      }
    };

    pc.onicegatheringstatechange = () => {
      console.log("ICE gathering state:", pc.iceGatheringState);
    };
    
    return pc;
  };

  const joinRoom = async () => {
    if (!patientName.trim()) {
      toast.error("Por favor, digite seu nome");
      return;
    }
    
    const codeToUse = roomCode || inputRoomCode;
    if (!codeToUse) {
      toast.error("Código da sala inválido");
      return;
    }
    
    setIsJoining(true);
    try {
      // First check if room exists at all (any status)
      const roomCodeUpper = codeToUse.toUpperCase();
      console.log("Looking for room:", roomCodeUpper);
      
      const { data: allRooms, error: searchError } = await supabase
        .from("virtual_rooms")
        .select("*")
        .eq("room_code", roomCodeUpper)
        .order("created_at", { ascending: false })
        .limit(1);
      
      if (searchError) {
        console.error("Database error:", searchError);
        toast.error("Erro ao buscar sala. Tente novamente.");
        setIsJoining(false);
        return;
      }
      
      console.log("Search results:", allRooms);
      
      if (!allRooms || allRooms.length === 0) {
        console.log("Room code not found in database");
        toast.error("Sala não encontrada. Verifique o código e tente novamente.");
        setIsJoining(false);
        return;
      }
      
      const roomData = allRooms[0];
      
      // Check if room is expired
      const expiresAt = new Date(roomData.expires_at);
      const now = new Date();
      if (expiresAt < now) {
        console.log("Room has expired:", roomData.expires_at);
        toast.error("Esta sala expirou. Peça ao profissional para criar uma nova sala.");
        setIsJoining(false);
        return;
      }
      
      // Check room status
      if (roomData.status === "closed") {
        console.log("Room is closed");
        toast.error("Esta sala já foi encerrada. Peça ao profissional para criar uma nova sala.");
        setIsJoining(false);
        return;
      }
      
      if (roomData.status === "connected" && roomData.answer) {
        console.log("Room already has a patient connected");
        toast.error("Esta sala já possui um participante conectado.");
        setIsJoining(false);
        return;
      }
      
      if (!roomData.offer) {
        console.error("Room has no offer");
        toast.error("Sala não está pronta. Peça ao profissional para criar uma nova sala.");
        setIsJoining(false);
        return;
      }
      
      // Room is valid, start media and connect
      const stream = await startLocalStream();
      
      console.log("Found valid room:", roomData);
      setVirtualRoomDbId(roomData.id);
      setEffectiveRoomCode(roomCodeUpper);
      
      const pc = await createPeerConnection(stream);
      peerConnectionRef.current = pc;
      
      const offerData = roomData.offer as { type: RTCSdpType; sdp: string };
      await pc.setRemoteDescription(new RTCSessionDescription(offerData));
      
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);
      
      // Wait for ICE gathering
      await new Promise<void>((resolve) => {
        if (pc.iceGatheringState === "complete") {
          resolve();
        } else {
          const checkState = () => {
            if (pc.iceGatheringState === "complete") {
              pc.removeEventListener("icegatheringstatechange", checkState);
              resolve();
            }
          };
          pc.addEventListener("icegatheringstatechange", checkState);
          setTimeout(() => resolve(), 5000);
        }
      });
      
      console.log("ICE gathering complete, updating room with answer...");
      
      // Convert localDescription to JSON-compatible format
      const answerJson = pc.localDescription ? {
        type: pc.localDescription.type,
        sdp: pc.localDescription.sdp
      } : null;
      
      // Update room with answer and patient name
      const { error: updateError } = await supabase
        .from("virtual_rooms")
        .update({
          answer: answerJson,
          patient_name: patientName,
          status: 'connected'
        })
        .eq("id", roomData.id);
      
      if (updateError) {
        console.error("Error updating room:", updateError);
        toast.error("Erro ao conectar à sala");
        return;
      }
      
      console.log("Room updated with answer successfully");
      setIsInRoom(true);
      toast.success("Conectado à sala!");
      
    } catch (error) {
      console.error("Error joining room:", error);
      toast.error("Erro ao entrar na sala");
    } finally {
      setIsJoining(false);
    }
  };

  const toggleAudio = () => {
    if (localStream) {
      const audioTrack = localStream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsMuted(!audioTrack.enabled);
      }
    }
  };

  const toggleVideo = () => {
    if (localStream) {
      const videoTrack = localStream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setIsVideoOff(!videoTrack.enabled);
      }
    }
  };

  const leaveRoom = async () => {
    if (localStream) {
      localStream.getTracks().forEach(track => track.stop());
      setLocalStream(null);
    }
    
    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
      peerConnectionRef.current = null;
    }
    
    // Update room status
    if (virtualRoomDbId) {
      await supabase
        .from("virtual_rooms")
        .update({ status: 'closed' })
        .eq("id", virtualRoomDbId);
    }
    
    setIsInRoom(false);
    setRemoteStream(null);
    setPeerConnected(false);
    
    toast.info("Você saiu da sala");
    navigate("/");
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      roomContainerRef.current?.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  useEffect(() => {
    return () => {
      if (localStream) {
        localStream.getTracks().forEach(track => track.stop());
      }
      if (peerConnectionRef.current) {
        peerConnectionRef.current.close();
      }
    };
  }, []);

  // Pre-room view (join form)
  if (!isInRoom) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 flex items-center justify-center p-4">
        <Card className="w-full max-w-md bg-card border-border/50 shadow-xl">
          <CardHeader className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-primary/10 flex items-center justify-center">
              <Video className="h-8 w-8 text-primary" />
            </div>
            <CardTitle className="text-2xl">Sala Virtual</CardTitle>
            <CardDescription>
              {roomCode ? (
                <>Entre na sala <strong className="text-primary">{roomCode}</strong></>
              ) : (
                "Digite o código da sala para entrar"
              )}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="patientName">Seu nome</Label>
              <Input
                id="patientName"
                placeholder="Digite seu nome completo"
                value={patientName}
                onChange={(e) => setPatientName(e.target.value)}
              />
            </div>
            
            {!roomCode && (
              <div className="space-y-2">
                <Label htmlFor="roomCodeInput">Código da sala</Label>
                <Input
                  id="roomCodeInput"
                  placeholder="Ex: ABC12345"
                  className="uppercase"
                  maxLength={8}
                  value={inputRoomCode}
                  onChange={(e) => setInputRoomCode(e.target.value.toUpperCase())}
                />
              </div>
            )}
            
            <Button 
              onClick={joinRoom} 
              disabled={isJoining || !patientName.trim() || (!roomCode && !inputRoomCode.trim())}
              className="w-full"
              size="lg"
            >
              {isJoining ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                  Conectando...
                </>
              ) : (
                <>
                  <LogIn className="mr-2 h-4 w-4" />
                  Entrar na Sala
                </>
              )}
            </Button>
            
            <p className="text-xs text-center text-muted-foreground">
              Ao entrar, você concorda em permitir acesso à sua câmera e microfone
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // In-room view
  return (
    <div 
      ref={roomContainerRef}
      className={cn(
        "min-h-screen bg-background p-4",
        isFullscreen && "fixed inset-0 z-50 bg-background"
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/30">
            <span className="w-2 h-2 rounded-full bg-green-500 mr-2 animate-pulse" />
            Ao vivo
          </Badge>
          <span className="text-sm text-muted-foreground">Sala: {effectiveRoomCode || roomCode}</span>
        </div>
        <Badge variant={peerConnected ? "default" : "secondary"}>
          <Users className="h-3 w-3 mr-1" />
          {peerConnected ? "Conectado" : "Aguardando..."}
        </Badge>
      </div>

      {/* Video grid */}
      <div className={cn(
        "grid gap-4 mb-20",
        peerConnected ? "md:grid-cols-2" : "grid-cols-1"
      )}>
        {/* Remote video (professional) */}
        {peerConnected && (
          <div className="relative aspect-video bg-muted rounded-xl overflow-hidden border border-border/50">
            <video
              ref={remoteVideoRef}
              autoPlay
              playsInline
              className="w-full h-full object-cover"
            />
            <div className="absolute bottom-3 left-3">
              <Badge variant="secondary" className="bg-background/80 backdrop-blur-sm">
                Profissional
              </Badge>
            </div>
          </div>
        )}

        {/* Local video */}
        <div className={cn(
          "relative aspect-video bg-muted rounded-xl overflow-hidden border border-border/50",
          peerConnected ? "" : "max-w-2xl mx-auto w-full"
        )}>
          <video
            ref={localVideoRef}
            autoPlay
            playsInline
            muted
            className={cn(
              "w-full h-full object-cover",
              isVideoOff && "hidden"
            )}
          />
          {isVideoOff && (
            <div className="absolute inset-0 flex items-center justify-center bg-muted">
              <div className="text-center">
                <VideoOff className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground">Câmera desligada</p>
              </div>
            </div>
          )}
          <div className="absolute bottom-3 left-3">
            <Badge variant="secondary" className="bg-background/80 backdrop-blur-sm">
              Você ({patientName})
            </Badge>
          </div>
        </div>
      </div>

      {/* Waiting message */}
      {!peerConnected && (
        <div className="text-center p-6 rounded-xl bg-muted/30 border border-border/50">
          <Users className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
          <h3 className="text-lg font-medium mb-2">Aguardando profissional</h3>
          <p className="text-sm text-muted-foreground">
            O profissional será notificado da sua chegada
          </p>
        </div>
      )}

      {/* Controls */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-3 p-3 rounded-2xl bg-card/90 backdrop-blur-xl border border-border/50 shadow-lg">
        <Button
          size="lg"
          variant={isMuted ? "destructive" : "secondary"}
          className="rounded-xl"
          onClick={toggleAudio}
        >
          {isMuted ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
        </Button>
        
        <Button
          size="lg"
          variant={isVideoOff ? "destructive" : "secondary"}
          className="rounded-xl"
          onClick={toggleVideo}
        >
          {isVideoOff ? <VideoOff className="h-5 w-5" /> : <Video className="h-5 w-5" />}
        </Button>
        
        <Button
          size="lg"
          variant="secondary"
          className="rounded-xl"
          onClick={toggleFullscreen}
        >
          {isFullscreen ? <Minimize className="h-5 w-5" /> : <Maximize className="h-5 w-5" />}
        </Button>
        
        <div className="w-px h-8 bg-border" />
        
        <Button
          size="lg"
          variant="destructive"
          className="rounded-xl px-6"
          onClick={leaveRoom}
        >
          <PhoneOff className="h-5 w-5 mr-2" />
          Sair
        </Button>
      </div>
    </div>
  );
};

export default SalaVirtual;