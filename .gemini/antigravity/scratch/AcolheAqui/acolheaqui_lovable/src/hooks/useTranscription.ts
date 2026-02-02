import { useState, useRef, useCallback, useEffect } from "react";

interface TranscriptEntry {
  id: string;
  speaker: "professional" | "patient";
  text: string;
  timestamp: Date;
  isFinal: boolean;
}

interface UseTranscriptionReturn {
  isTranscribing: boolean;
  transcripts: TranscriptEntry[];
  startTranscription: () => void;
  stopTranscription: () => void;
  clearTranscripts: () => void;
  exportTranscripts: () => string;
}

export const useTranscription = (speaker: "professional" | "patient"): UseTranscriptionReturn => {
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [transcripts, setTranscripts] = useState<TranscriptEntry[]>([]);
  const recognitionRef = useRef<any>(null);
  const currentTranscriptRef = useRef<string>("");

  const startTranscription = useCallback(() => {
    const SpeechRecognitionAPI = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    
    if (!SpeechRecognitionAPI) {
      console.error("Speech recognition not supported");
      return;
    }

    recognitionRef.current = new SpeechRecognitionAPI();
    
    recognitionRef.current.continuous = true;
    recognitionRef.current.interimResults = true;
    recognitionRef.current.lang = "pt-BR";

    recognitionRef.current.onstart = () => {
      setIsTranscribing(true);
    };

    recognitionRef.current.onresult = (event) => {
      let interimTranscript = "";
      let finalTranscript = "";

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcript;
        } else {
          interimTranscript += transcript;
        }
      }

      if (finalTranscript) {
        const entry: TranscriptEntry = {
          id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          speaker,
          text: finalTranscript.trim(),
          timestamp: new Date(),
          isFinal: true,
        };
        setTranscripts((prev) => [...prev, entry]);
        currentTranscriptRef.current = "";
      } else {
        currentTranscriptRef.current = interimTranscript;
      }
    };

    recognitionRef.current.onerror = (event) => {
      console.error("Speech recognition error:", event.error);
      if (event.error !== "no-speech" && event.error !== "aborted") {
        // Restart on recoverable errors
        setTimeout(() => {
          if (isTranscribing && recognitionRef.current) {
            recognitionRef.current.start();
          }
        }, 1000);
      }
    };

    recognitionRef.current.onend = () => {
      // Auto-restart if still transcribing
      if (isTranscribing && recognitionRef.current) {
        setTimeout(() => {
          try {
            recognitionRef.current?.start();
          } catch (e) {
            console.error("Error restarting recognition:", e);
          }
        }, 100);
      }
    };

    try {
      recognitionRef.current.start();
    } catch (e) {
      console.error("Error starting recognition:", e);
    }
  }, [speaker, isTranscribing]);

  const stopTranscription = useCallback(() => {
    setIsTranscribing(false);
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      recognitionRef.current = null;
    }
  }, []);

  const clearTranscripts = useCallback(() => {
    setTranscripts([]);
  }, []);

  const exportTranscripts = useCallback((): string => {
    const lines = transcripts.map((t) => {
      const time = t.timestamp.toLocaleTimeString("pt-BR", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      });
      const speakerLabel = t.speaker === "professional" ? "Profissional" : "Paciente";
      return `[${time}] ${speakerLabel}: ${t.text}`;
    });
    return lines.join("\n");
  }, [transcripts]);

  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  return {
    isTranscribing,
    transcripts,
    startTranscription,
    stopTranscription,
    clearTranscripts,
    exportTranscripts,
  };
};
