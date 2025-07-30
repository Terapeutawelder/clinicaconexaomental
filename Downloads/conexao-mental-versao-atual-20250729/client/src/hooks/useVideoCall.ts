import { useState, useRef, useEffect } from "react";

interface UseVideoCallProps {
  callStartTime: Date;
  patientName: string;
  professionalName: string;
  onEndCall: () => void;
}

export const useVideoCall = ({ callStartTime, patientName, professionalName, onEndCall }: UseVideoCallProps) => {
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [isAudioOn, setIsAudioOn] = useState(true);
  const [isCallActive, setIsCallActive] = useState(false);
  const [callDuration, setCallDuration] = useState("00:00");
  const [audioLevel, setAudioLevel] = useState(50);
  const [videoQuality, setVideoQuality] = useState("HD");

  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    const initMedia = async () => {
      try {
        // Verifica se getUserMedia está disponível
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
          console.warn("getUserMedia não está disponível neste navegador");
          return;
        }

        const stream = await navigator.mediaDevices.getUserMedia({ 
          video: { width: 1280, height: 720 }, 
          audio: { echoCancellation: true, noiseSuppression: true } 
        });
        
        console.log("Stream criado com sucesso:", stream.getTracks().length, "tracks");
        
        streamRef.current = stream;
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
          console.log("Vídeo local configurado");
        }
        
        const videoTrack = stream.getVideoTracks()[0];
        if (videoTrack) {
          videoTrack.enabled = isVideoOn;
        }
        
        const audioTrack = stream.getAudioTracks()[0];
        if (audioTrack) {
          audioTrack.enabled = isAudioOn;
        }
      } catch (err) {
        console.error("Erro ao acessar mídia:", err);
        try {
          const audioStream = await navigator.mediaDevices.getUserMedia({ audio: true });
          streamRef.current = audioStream;
        } catch (audioErr) {
          console.error("Erro ao acessar áudio:", audioErr);
        }
      }
    };
    
    initMedia();
    
    // Cleanup na desmontagem do componente
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => {
          track.stop();
          console.log("Track parado durante cleanup:", track.kind);
        });
      }
    };
  }, []);  // Remove as dependências para evitar reinicialização

  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      const diff = now.getTime() - callStartTime.getTime();
      const minutes = Math.floor(diff / 60000);
      const seconds = Math.floor((diff % 60000) / 1000);
      setCallDuration(`${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`);
    }, 1000);

    return () => clearInterval(interval);
  }, [callStartTime]);

  const handleStartCall = () => {
    setIsCallActive(true);
  };

  const handleEndCall = () => {
    // Parar todos os tracks para desligar completamente câmera e microfone
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => {
        track.stop();
        streamRef.current?.removeTrack(track);
      });
      streamRef.current = null;
    }
    
    // Limpar referências de vídeo
    if (localVideoRef.current) {
      localVideoRef.current.srcObject = null;
    }
    if (remoteVideoRef.current) {
      remoteVideoRef.current.srcObject = null;
    }
    
    setIsCallActive(false);
    setIsVideoOn(false);
    setIsAudioOn(false);
    onEndCall();
  };

  const toggleVideo = () => {
    const newVideoState = !isVideoOn;
    setIsVideoOn(newVideoState);
    
    if (streamRef.current) {
      const videoTracks = streamRef.current.getVideoTracks();
      
      if (newVideoState) {
        // Ligar vídeo - verificar se já existe track ou criar novo
        if (videoTracks.length === 0) {
          navigator.mediaDevices.getUserMedia({ video: { width: 1280, height: 720 } })
            .then(newStream => {
              const newVideoTrack = newStream.getVideoTracks()[0];
              if (newVideoTrack && streamRef.current) {
                streamRef.current.addTrack(newVideoTrack);
                if (localVideoRef.current) {
                  localVideoRef.current.srcObject = streamRef.current;
                }
              }
            })
            .catch(err => console.error("Erro ao ligar vídeo:", err));
        } else {
          // Reabilitar tracks existentes
          videoTracks.forEach(track => {
            track.enabled = true;
          });
          if (localVideoRef.current) {
            localVideoRef.current.srcObject = streamRef.current;
          }
        }
      } else {
        // Desligar vídeo - parar e remover tracks para desligar a luz da câmera
        videoTracks.forEach(track => {
          console.log("Desligando track de vídeo:", track.readyState);
          track.enabled = false;
          track.stop(); // Importante: parar o track para desligar a câmera
          streamRef.current?.removeTrack(track);
          console.log("Track parado:", track.readyState);
        });
        
        // Limpar o vídeo local
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = null;
          console.log("Vídeo local limpo");
        }
      }
    }
  };

  const toggleAudio = () => {
    const newAudioState = !isAudioOn;
    setIsAudioOn(newAudioState);
    
    if (streamRef.current) {
      const audioTracks = streamRef.current.getAudioTracks();
      audioTracks.forEach(track => {
        track.enabled = newAudioState;
      });
    }
  };

  return {
    isVideoOn,
    isAudioOn,
    isCallActive,
    callDuration,
    audioLevel,
    setAudioLevel,
    videoQuality,
    setVideoQuality,
    localVideoRef,
    remoteVideoRef,
    streamRef,
    handleStartCall,
    handleEndCall,
    toggleVideo,
    toggleAudio
  };
};