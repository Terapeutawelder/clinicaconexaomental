import { useState, useRef, useCallback } from "react";
import { toast } from "sonner";

interface UseRecordingReturn {
  isRecording: boolean;
  recordingTime: number;
  startRecording: (stream: MediaStream) => void;
  stopRecording: () => Promise<Blob | null>;
  downloadRecording: (blob: Blob, filename?: string) => void;
}

export const useRecording = (): UseRecordingReturn => {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const startRecording = useCallback((stream: MediaStream) => {
    if (!stream) {
      toast.error("Stream de mídia não disponível");
      return;
    }

    try {
      // Try to get video+audio, fallback to audio only
      const mimeType = MediaRecorder.isTypeSupported("video/webm;codecs=vp9,opus")
        ? "video/webm;codecs=vp9,opus"
        : MediaRecorder.isTypeSupported("video/webm")
        ? "video/webm"
        : "audio/webm";

      const mediaRecorder = new MediaRecorder(stream, {
        mimeType,
        videoBitsPerSecond: 2500000,
        audioBitsPerSecond: 128000,
      });

      chunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstart = () => {
        setIsRecording(true);
        setRecordingTime(0);
        timerRef.current = setInterval(() => {
          setRecordingTime((prev) => prev + 1);
        }, 1000);
        toast.success("Gravação iniciada");
      };

      mediaRecorder.onstop = () => {
        setIsRecording(false);
        if (timerRef.current) {
          clearInterval(timerRef.current);
          timerRef.current = null;
        }
      };

      mediaRecorder.onerror = (event) => {
        console.error("MediaRecorder error:", event);
        toast.error("Erro na gravação");
        setIsRecording(false);
      };

      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.start(1000); // Collect data every second
    } catch (error) {
      console.error("Error starting recording:", error);
      toast.error("Não foi possível iniciar a gravação");
    }
  }, []);

  const stopRecording = useCallback(async (): Promise<Blob | null> => {
    return new Promise((resolve) => {
      if (!mediaRecorderRef.current || mediaRecorderRef.current.state === "inactive") {
        resolve(null);
        return;
      }

      mediaRecorderRef.current.onstop = () => {
        setIsRecording(false);
        if (timerRef.current) {
          clearInterval(timerRef.current);
          timerRef.current = null;
        }

        if (chunksRef.current.length > 0) {
          const blob = new Blob(chunksRef.current, {
            type: mediaRecorderRef.current?.mimeType || "video/webm",
          });
          toast.success("Gravação finalizada");
          resolve(blob);
        } else {
          resolve(null);
        }
      };

      mediaRecorderRef.current.stop();
    });
  }, []);

  const downloadRecording = useCallback((blob: Blob, filename?: string) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename || `sessao_${new Date().toISOString().slice(0, 10)}.webm`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success("Gravação baixada");
  }, []);

  return {
    isRecording,
    recordingTime,
    startRecording,
    stopRecording,
    downloadRecording,
  };
};

export const formatRecordingTime = (seconds: number): string => {
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  
  if (hrs > 0) {
    return `${hrs.toString().padStart(2, "0")}:${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  }
  return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
};
