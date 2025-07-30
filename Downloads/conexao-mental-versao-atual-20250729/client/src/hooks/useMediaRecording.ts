import { useState, useRef } from "react";

interface UseMediaRecordingProps {
  streamRef: React.RefObject<MediaStream | null>;
  patientName: string;
  professionalName: string;
  callDuration: string;
}

export const useMediaRecording = ({ streamRef, patientName, professionalName, callDuration }: UseMediaRecordingProps) => {
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);

  const startRecording = () => {
    if (streamRef.current && !isRecording) {
      try {
        recordedChunksRef.current = [];
        
        // Verifica se MediaRecorder está disponível
        if (!window.MediaRecorder) {
          console.warn("MediaRecorder não está disponível neste navegador");
          return;
        }
        
        mediaRecorderRef.current = new MediaRecorder(streamRef.current);
        
        mediaRecorderRef.current.ondataavailable = (event) => {
          if (event.data.size > 0) {
            recordedChunksRef.current.push(event.data);
          }
        };
        
        mediaRecorderRef.current.onstop = () => {
          const blob = new Blob(recordedChunksRef.current, { type: 'video/webm' });
          saveRecording(blob);
        };
        
        mediaRecorderRef.current.start();
        setIsRecording(true);
      } catch (error) {
        console.error("Erro ao iniciar gravação:", error);
      }
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const saveRecording = (blob: Blob) => {
    const recording = {
      id: Date.now().toString(),
      patient: patientName,
      professional: professionalName,
      date: new Date().toLocaleDateString('pt-BR'),
      time: new Date().toLocaleTimeString('pt-BR'),
      duration: callDuration,
      size: blob.size,
      blob: blob
    };
    
    const professionalRecordings = JSON.parse(localStorage.getItem(`professional_recordings_${professionalName}`) || '[]');
    professionalRecordings.push({
      ...recording,
      blobUrl: URL.createObjectURL(blob)
    });
    localStorage.setItem(`professional_recordings_${professionalName}`, JSON.stringify(professionalRecordings));
  };

  return {
    isRecording,
    startRecording,
    stopRecording
  };
};