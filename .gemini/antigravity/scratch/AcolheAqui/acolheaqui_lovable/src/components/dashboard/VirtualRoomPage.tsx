import { useState, useEffect, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { getVirtualRoomUrl } from "@/lib/getCanonicalUrl";
import { 
  Video, 
  VideoOff, 
  Mic, 
  MicOff, 
  Phone, 
  PhoneOff, 
  Copy, 
  Users, 
  MonitorUp,
  Settings,
  MessageSquare,
  Maximize,
  Minimize,
  Circle,
  Square,
  FileText,
  Download,
  Save,
  Loader2,
  Brain
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useTranscription } from "@/hooks/useTranscription";
import { useRecording, formatRecordingTime } from "@/hooks/useRecording";
import AIPsiAnalysis from "./AIPsiAnalysis";

interface VirtualRoomPageProps {
  profileId: string;
}

interface TranscriptEntry {
  id: string;
  speaker: "professional" | "patient";
  text: string;
  timestamp: Date;
  isFinal: boolean;
}

const VirtualRoomPage = ({ profileId }: VirtualRoomPageProps) => {
  const [roomId, setRoomId] = useState<string>("");
  const [isInRoom, setIsInRoom] = useState(false);
  const [isHost, setIsHost] = useState(false);
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [peerConnected, setPeerConnected] = useState(false);
  const [showTranscripts, setShowTranscripts] = useState(false);
  const [combinedTranscripts, setCombinedTranscripts] = useState<TranscriptEntry[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [currentAppointmentId, setCurrentAppointmentId] = useState<string | null>(null);
  const [showAIPsi, setShowAIPsi] = useState(true);
  const [currentPatientName, setCurrentPatientName] = useState<string | undefined>();
  const [currentAIAnalysis, setCurrentAIAnalysis] = useState<string>("");
  const [virtualRoomDbId, setVirtualRoomDbId] = useState<string | null>(null);
  
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
  const dataChannelRef = useRef<RTCDataChannel | null>(null);
  const roomContainerRef = useRef<HTMLDivElement>(null);
  const transcriptsEndRef = useRef<HTMLDivElement>(null);

  // Transcription hook
  const {
    isTranscribing,
    transcripts,
    startTranscription,
    stopTranscription,
    exportTranscripts,
  } = useTranscription("professional");

  // Recording hook
  const {
    isRecording,
    recordingTime,
    startRecording,
    stopRecording,
    downloadRecording,
  } = useRecording();

  // Update combined transcripts when local transcripts change
  useEffect(() => {
    setCombinedTranscripts(prev => {
      const existingIds = new Set(prev.map(t => t.id));
      const newTranscripts = transcripts.filter(t => !existingIds.has(t.id));
      if (newTranscripts.length === 0) return prev;
      return [...prev, ...newTranscripts].sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
    });
  }, [transcripts]);

  // Auto-scroll transcripts
  useEffect(() => {
    transcriptsEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [combinedTranscripts]);

  // Find appointment by room code
  const findAppointmentByRoomCode = async (code: string) => {
    try {
      const { data, error } = await supabase
        .from("appointments")
        .select("id, client_name")
        .eq("virtual_room_code", code)
        .maybeSingle();

      if (error) throw error;
      if (data) {
        setCurrentAppointmentId(data.id);
        setCurrentPatientName(data.client_name);
      }
    } catch (error) {
      console.error("Error finding appointment:", error);
    }
  };

  // Save session data to database
  const saveSessionData = async (recordingBlob?: Blob) => {
    if (!currentAppointmentId && !roomId) {
      toast.error("Nenhum agendamento vinculado a esta sala");
      return;
    }

    setIsSaving(true);
    try {
      let recordingPath: string | null = null;

      // Upload recording if provided
      if (recordingBlob) {
        const { data: userData } = await supabase.auth.getUser();
        if (userData?.user) {
          const fileName = `${userData.user.id}/${roomId}_${Date.now()}.webm`;
          const { error: uploadError } = await supabase.storage
            .from("session-recordings")
            .upload(fileName, recordingBlob);

          if (uploadError) {
            console.error("Error uploading recording:", uploadError);
            toast.error("Erro ao salvar gravação");
          } else {
            recordingPath = fileName;
          }
        }
      }

      // Format transcripts for storage
      const transcriptsForStorage = combinedTranscripts.map(t => ({
        ...t,
        timestamp: t.timestamp.toISOString(),
      }));

      // Update appointment with session data
      const updateData: Record<string, unknown> = {
        transcription: transcriptsForStorage,
      };

      if (recordingPath) {
        updateData.recording_url = recordingPath;
      }

      // Save AI Psi analysis if available
      if (currentAIAnalysis) {
        updateData.ai_psi_analysis = currentAIAnalysis;
      }

      // Try to find and update the appointment by room code
      const { error: updateError } = await supabase
        .from("appointments")
        .update(updateData)
        .eq("virtual_room_code", roomId);

      if (updateError) {
        console.error("Error saving session data:", updateError);
        toast.error("Erro ao salvar dados da sessão");
      } else {
        toast.success("Dados da sessão salvos no prontuário!");
      }
    } catch (error) {
      console.error("Error saving session:", error);
      toast.error("Erro ao salvar sessão");
    } finally {
      setIsSaving(false);
    }
  };

  // Generate unique room ID
  const generateRoomId = () => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let result = "";
    for (let i = 0; i < 8; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  };

  // Get user media
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

  // Create room as host
  const createRoom = async () => {
    setIsConnecting(true);
    try {
      const stream = await startLocalStream();
      const newRoomId = generateRoomId();
      setRoomId(newRoomId);
      setIsHost(true);
      
      const pc = await createPeerConnection(stream);
      peerConnectionRef.current = pc;
      
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);
      
      // Wait for ICE gathering to complete
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
          // Timeout after 5 seconds
          setTimeout(() => resolve(), 5000);
        }
      });
      
      console.log("ICE gathering complete, saving offer to database...");
      
      // Convert localDescription to JSON-compatible format
      const offerJson = pc.localDescription ? {
        type: pc.localDescription.type,
        sdp: pc.localDescription.sdp
      } : null;
      
      // Save the room and offer to database
      const { data: roomData, error: roomError } = await supabase
        .from("virtual_rooms")
        .insert({
          room_code: newRoomId,
          professional_id: profileId,
          offer: offerJson,
          status: 'waiting'
        })
        .select()
        .single();
      
      if (roomError) {
        console.error("Error creating room in database:", roomError);
        toast.error("Erro ao criar sala no servidor");
        return;
      }
      
      console.log("Room created in database:", roomData);
      setVirtualRoomDbId(roomData.id);
      setIsInRoom(true);
      
      toast.success("Sala criada com sucesso!");
      toast.info("Compartilhe o código da sala com seu paciente.");
      
    } catch (error) {
      console.error("Error creating room:", error);
      toast.error("Erro ao criar sala");
    } finally {
      setIsConnecting(false);
    }
  };

  // Listen for answer from patient (realtime)
  useEffect(() => {
    if (!isHost || !isInRoom || !roomId) return;
    
    console.log("Setting up realtime subscription for room:", roomId);
    
    const channel = supabase
      .channel(`room-${roomId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'virtual_rooms',
          filter: `room_code=eq.${roomId}`
        },
        async (payload) => {
          console.log("Room updated:", payload);
          const newData = payload.new as { answer?: RTCSessionDescriptionInit; patient_name?: string };
          
          if (newData.answer && peerConnectionRef.current) {
            try {
              if (peerConnectionRef.current.signalingState === "have-local-offer") {
                console.log("Processing answer from patient...");
                await peerConnectionRef.current.setRemoteDescription(
                  new RTCSessionDescription(newData.answer)
                );
                console.log("Remote description set successfully");
                
                if (newData.patient_name) {
                  setCurrentPatientName(newData.patient_name);
                }
              }
            } catch (error) {
              console.error("Error processing answer:", error);
            }
          }
        }
      )
      .subscribe((status) => {
        console.log("Realtime subscription status:", status);
      });
    
    return () => {
      console.log("Cleaning up realtime subscription");
      supabase.removeChannel(channel);
    };
  }, [isHost, isInRoom, roomId]);

  // Join existing room
  const joinRoom = async () => {
    if (!roomId.trim()) {
      toast.error("Digite o código da sala");
      return;
    }
    
    setIsConnecting(true);
    try {
      const stream = await startLocalStream();
      
      // Get the room and offer from database
      const { data: roomData, error: roomError } = await supabase
        .from("virtual_rooms")
        .select("*")
        .eq("room_code", roomId.toUpperCase())
        .eq("status", "waiting")
        .maybeSingle();
      
      if (roomError || !roomData) {
        console.error("Room not found:", roomError);
        toast.error("Sala não encontrada ou expirada");
        setIsConnecting(false);
        return;
      }
      
      console.log("Found room:", roomData);
      setVirtualRoomDbId(roomData.id);
      setIsHost(false);
      
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
      
      // Convert localDescription to JSON-compatible format
      const answerJson = pc.localDescription ? {
        type: pc.localDescription.type,
        sdp: pc.localDescription.sdp
      } : null;
      
      // Update room with answer
      const { error: updateError } = await supabase
        .from("virtual_rooms")
        .update({
          answer: answerJson,
          status: 'connected'
        })
        .eq("id", roomData.id);
      
      if (updateError) {
        console.error("Error updating room:", updateError);
        toast.error("Erro ao conectar à sala");
        return;
      }
      
      setIsInRoom(true);
      toast.success("Conectado à sala!");
      
    } catch (error) {
      console.error("Error joining room:", error);
      toast.error("Erro ao entrar na sala");
    } finally {
      setIsConnecting(false);
    }
  };

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

  // Create peer connection with TURN support
  const createPeerConnection = async (stream: MediaStream): Promise<RTCPeerConnection> => {
    const iceServers = await getTurnCredentials();
    
    const configuration: RTCConfiguration = {
      iceServers,
      iceTransportPolicy: "all", // Use both TURN and direct connections
    };
    
    console.log("Creating peer connection with", iceServers.length, "ICE servers");
    const pc = new RTCPeerConnection(configuration);
    
    // Add local tracks
    stream.getTracks().forEach(track => {
      pc.addTrack(track, stream);
    });
    
    // Handle remote tracks
    pc.ontrack = (event) => {
      console.log("Remote track received:", event.streams[0]);
      setRemoteStream(event.streams[0]);
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = event.streams[0];
      }
      setPeerConnected(true);
    };
    
    // Handle connection state
    pc.onconnectionstatechange = () => {
      console.log("Connection state:", pc.connectionState);
      if (pc.connectionState === "connected") {
        setPeerConnected(true);
        toast.success("Participante conectado!");
      } else if (pc.connectionState === "disconnected" || pc.connectionState === "failed") {
        setPeerConnected(false);
        toast.info("Participante desconectado");
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

  // Toggle audio
  const toggleAudio = () => {
    if (localStream) {
      const audioTrack = localStream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsMuted(!audioTrack.enabled);
      }
    }
  };

  // Toggle video
  const toggleVideo = () => {
    if (localStream) {
      const videoTrack = localStream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setIsVideoOff(!videoTrack.enabled);
      }
    }
  };

  // Toggle transcription
  const toggleTranscription = () => {
    if (isTranscribing) {
      stopTranscription();
      toast.info("Transcrição pausada");
    } else {
      startTranscription();
      toast.success("Transcrição iniciada");
    }
  };

  // Toggle recording
  const toggleRecording = async () => {
    if (isRecording) {
      const blob = await stopRecording();
      if (blob) {
        downloadRecording(blob, `sessao_${roomId}_${new Date().toISOString().slice(0, 10)}.webm`);
      }
    } else if (localStream) {
      // Combine local and remote streams for recording
      const combinedStream = new MediaStream();
      localStream.getTracks().forEach(track => combinedStream.addTrack(track));
      if (remoteStream) {
        remoteStream.getTracks().forEach(track => combinedStream.addTrack(track));
      }
      startRecording(combinedStream);
    }
  };

  // Export transcripts
  const handleExportTranscripts = () => {
    const text = combinedTranscripts.map((t) => {
      const time = t.timestamp.toLocaleTimeString("pt-BR", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      });
      const speakerLabel = t.speaker === "professional" ? "Profissional" : "Paciente";
      return `[${time}] ${speakerLabel}: ${t.text}`;
    }).join("\n");

    const blob = new Blob([text], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `transcricao_${roomId}_${new Date().toISOString().slice(0, 10)}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success("Transcrição exportada");
  };

  // Leave room with auto-save
  const leaveRoom = async () => {
    let recordingBlob: Blob | undefined;

    // Stop recording if active
    if (isRecording) {
      recordingBlob = await stopRecording();
      if (recordingBlob) {
        downloadRecording(recordingBlob, `sessao_${roomId}_${new Date().toISOString().slice(0, 10)}.webm`);
      }
    }

    // Stop transcription
    if (isTranscribing) {
      stopTranscription();
    }

    // Auto-save session data if we have transcripts or recording
    if (combinedTranscripts.length > 0 || recordingBlob) {
      await saveSessionData(recordingBlob);
    }

    // Export transcripts if any
    if (combinedTranscripts.length > 0) {
      handleExportTranscripts();
    }

    // Stop all tracks
    if (localStream) {
      localStream.getTracks().forEach(track => track.stop());
      setLocalStream(null);
    }
    
    // Close peer connection
    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
      peerConnectionRef.current = null;
    }
    
    // Update room status in database
    if (virtualRoomDbId) {
      await supabase
        .from("virtual_rooms")
        .update({ status: 'closed' })
        .eq("id", virtualRoomDbId);
    }
    
    setIsInRoom(false);
    setRoomId("");
    setRemoteStream(null);
    setPeerConnected(false);
    setIsHost(false);
    setCombinedTranscripts([]);
    setCurrentAppointmentId(null);
    setCurrentPatientName(undefined);
    setShowAIPsi(true);
    setCurrentAIAnalysis("");
    setVirtualRoomDbId(null);
    
    toast.info("Você saiu da sala");
  };

  // Manual save button
  const handleManualSave = async () => {
    if (combinedTranscripts.length === 0) {
      toast.info("Nenhuma transcrição para salvar");
      return;
    }
    await saveSessionData();
  };

  // Copy room link
  const copyRoomLink = () => {
    const link = getVirtualRoomUrl(roomId);
    navigator.clipboard.writeText(link);
    toast.success("Link da sala copiado!");
  };

  // Toggle fullscreen
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      roomContainerRef.current?.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (localStream) {
        localStream.getTracks().forEach(track => track.stop());
      }
      if (peerConnectionRef.current) {
        peerConnectionRef.current.close();
      }
      if (isTranscribing) {
        stopTranscription();
      }
    };
  }, []);

  // Pre-room view
  if (!isInRoom) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-foreground mb-2">Sala Virtual</h2>
          <p className="text-muted-foreground">
            Realize atendimentos online diretamente pela plataforma
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Create Room */}
          <Card className="bg-card border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Video className="h-5 w-5 text-primary" />
                Criar Nova Sala
              </CardTitle>
              <CardDescription>
                Crie uma sala de videoconferência e compartilhe o código com seu paciente
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                onClick={createRoom} 
                disabled={isConnecting}
                className="w-full"
              >
                {isConnecting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                    Criando sala...
                  </>
                ) : (
                  <>
                    <Video className="mr-2 h-4 w-4" />
                    Criar Sala
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Join Room */}
          <Card className="bg-card border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-primary" />
                Entrar em Sala
              </CardTitle>
              <CardDescription>
                Digite o código da sala para entrar em uma videoconferência existente
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="roomCode">Código da Sala</Label>
                <Input
                  id="roomCode"
                  placeholder="Digite o código (ex: ABC12345)"
                  value={roomId}
                  onChange={(e) => setRoomId(e.target.value.toUpperCase())}
                  className="uppercase"
                  maxLength={8}
                />
              </div>
              <Button 
                onClick={joinRoom} 
                disabled={isConnecting || !roomId.trim()}
                variant="secondary"
                className="w-full"
              >
                {isConnecting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2" />
                    Conectando...
                  </>
                ) : (
                  <>
                    <Users className="mr-2 h-4 w-4" />
                    Entrar na Sala
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Instructions */}
        <Card className="bg-muted/30 border-border/50">
          <CardHeader>
            <CardTitle className="text-lg">Como funciona?</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-start gap-3">
              <Badge variant="outline" className="mt-0.5">1</Badge>
              <p className="text-sm text-muted-foreground">
                Clique em <strong>"Criar Sala"</strong> para iniciar uma nova videoconferência
              </p>
            </div>
            <div className="flex items-start gap-3">
              <Badge variant="outline" className="mt-0.5">2</Badge>
              <p className="text-sm text-muted-foreground">
                Copie o <strong>link da sala</strong> e envie para seu paciente via WhatsApp ou e-mail
              </p>
            </div>
            <div className="flex items-start gap-3">
              <Badge variant="outline" className="mt-0.5">3</Badge>
              <p className="text-sm text-muted-foreground">
                O paciente entra na sala acessando o link compartilhado
              </p>
            </div>
            <div className="flex items-start gap-3">
              <Badge variant="outline" className="mt-0.5">4</Badge>
              <p className="text-sm text-muted-foreground">
                Use a <strong>transcrição automática</strong> e <strong>gravação</strong> para documentar a sessão
              </p>
            </div>
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
        "relative",
        isFullscreen && "fixed inset-0 z-50 bg-background p-4"
      )}
    >
      {/* Room header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/30">
            <span className="w-2 h-2 rounded-full bg-green-500 mr-2 animate-pulse" />
            Ao vivo
          </Badge>
          {isRecording && (
            <Badge variant="destructive" className="animate-pulse">
              <Circle className="h-3 w-3 mr-1 fill-current" />
              REC {formatRecordingTime(recordingTime)}
            </Badge>
          )}
          {isTranscribing && (
            <Badge variant="secondary">
              <FileText className="h-3 w-3 mr-1" />
              Transcrevendo
            </Badge>
          )}
          <span className="text-sm text-muted-foreground">Sala: {roomId}</span>
          <Button size="sm" variant="ghost" onClick={copyRoomLink}>
            <Copy className="h-4 w-4" />
          </Button>
        </div>
        <div className="flex items-center gap-2">
          <Button 
            size="sm" 
            variant={showTranscripts ? "default" : "outline"} 
            onClick={() => setShowTranscripts(!showTranscripts)}
          >
            <MessageSquare className="h-4 w-4 mr-1" />
            Transcrição
          </Button>
          <Badge variant={peerConnected ? "default" : "secondary"}>
            <Users className="h-3 w-3 mr-1" />
            {peerConnected ? "2 participantes" : "Aguardando..."}
          </Badge>
        </div>
      </div>

      <div className="flex gap-4">
        {/* Video grid */}
        <div className={cn(
          "flex-1 grid gap-4",
          peerConnected ? "md:grid-cols-2" : "grid-cols-1"
        )}>
          {/* Remote video (main) */}
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
                  Paciente
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
                Você {isHost && "(Anfitrião)"}
              </Badge>
            </div>
          </div>
        </div>

        {/* Transcripts panel */}
        {showTranscripts && (
          <div className="w-80 flex flex-col bg-card border border-border/50 rounded-xl overflow-hidden">
            <div className="p-3 border-b border-border/50 flex items-center justify-between">
              <h3 className="font-medium text-sm">Transcrição</h3>
              <div className="flex gap-1">
                <Button 
                  size="sm" 
                  variant="ghost"
                  onClick={handleExportTranscripts}
                  disabled={combinedTranscripts.length === 0}
                >
                  <Download className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <ScrollArea className="flex-1 p-3">
              {combinedTranscripts.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  {isTranscribing ? "Aguardando fala..." : "Inicie a transcrição para capturar a conversa"}
                </p>
              ) : (
                <div className="space-y-3">
                  {combinedTranscripts.map((t) => (
                    <div 
                      key={t.id} 
                      className={cn(
                        "text-sm p-2 rounded-lg",
                        t.speaker === "professional" 
                          ? "bg-primary/10 ml-2" 
                          : "bg-muted mr-2"
                      )}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-xs">
                          {t.speaker === "professional" ? "Você" : "Paciente"}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {t.timestamp.toLocaleTimeString("pt-BR", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>
                      <p className="text-foreground">{t.text}</p>
                    </div>
                  ))}
                  <div ref={transcriptsEndRef} />
                </div>
              )}

              {/* AI Psi Analysis - Only visible to professional */}
              {isHost && (
                <AIPsiAnalysis
                  transcripts={combinedTranscripts}
                  patientName={currentPatientName}
                  isVisible={showAIPsi}
                  onToggleVisibility={() => setShowAIPsi(!showAIPsi)}
                  onAnalysisUpdate={setCurrentAIAnalysis}
                />
              )}
            </ScrollArea>
          </div>
        )}
      </div>

      {/* Waiting message */}
      {!peerConnected && (
        <div className="mt-6 text-center p-6 rounded-xl bg-muted/30 border border-border/50">
          <Users className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
          <h3 className="text-lg font-medium mb-2">Aguardando participante</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Compartilhe o link <strong className="text-primary">{getVirtualRoomUrl(roomId)}</strong> com seu paciente
          </p>
          <Button variant="outline" size="sm" onClick={copyRoomLink}>
            <Copy className="h-4 w-4 mr-2" />
            Copiar link
          </Button>
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

        <div className="w-px h-8 bg-border" />

        <Button
          size="lg"
          variant={isTranscribing ? "default" : "secondary"}
          className="rounded-xl"
          onClick={toggleTranscription}
          title={isTranscribing ? "Parar transcrição" : "Iniciar transcrição"}
        >
          <FileText className="h-5 w-5" />
        </Button>

        <Button
          size="lg"
          variant={isRecording ? "destructive" : "secondary"}
          className="rounded-xl"
          onClick={toggleRecording}
          title={isRecording ? "Parar gravação" : "Iniciar gravação"}
        >
          {isRecording ? <Square className="h-5 w-5" /> : <Circle className="h-5 w-5" />}
        </Button>

        <Button
          size="lg"
          variant="outline"
          className="rounded-xl"
          onClick={handleManualSave}
          disabled={isSaving || combinedTranscripts.length === 0}
          title="Salvar no prontuário"
        >
          {isSaving ? <Loader2 className="h-5 w-5 animate-spin" /> : <Save className="h-5 w-5" />}
        </Button>

        {isHost && (
          <Button
            size="lg"
            variant={showAIPsi ? "default" : "outline"}
            className={cn(
              "rounded-xl",
              showAIPsi && "bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
            )}
            onClick={() => setShowAIPsi(!showAIPsi)}
            title="IA Psi - Análise em tempo real"
          >
            <Brain className="h-5 w-5" />
          </Button>
        )}

        <div className="w-px h-8 bg-border" />
        
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
          Encerrar
        </Button>
      </div>
    </div>
  );
};

export default VirtualRoomPage;