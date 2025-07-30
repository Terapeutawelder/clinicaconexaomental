import { useState } from "react";
import { useVideoCall } from "@/hooks/useVideoCall";
import { useMediaRecording } from "@/hooks/useMediaRecording";
import { VideoCallHeader } from "./VideoCallHeader";
import { VideoCallStream } from "./VideoCallStream";
import { VideoCallControls } from "./VideoCallControls";
import { VideoCallChat } from "./VideoCallChat";

interface VideoCallInterfaceProps {
  patientName?: string;
  professionalName?: string;
  onEndCall: () => void;
  callStartTime?: Date;
}

export const VideoCallInterface = ({ 
  patientName = "Paciente", 
  professionalName = "Dr. Ana Paula Silva",
  onEndCall,
  callStartTime = new Date()
}: VideoCallInterfaceProps) => {
  const [showChat, setShowChat] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  const {
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
  } = useVideoCall({ callStartTime, patientName, professionalName, onEndCall });

  const {
    isRecording,
    startRecording,
    stopRecording
  } = useMediaRecording({ streamRef, patientName, professionalName, callDuration });

  return (
    <div className="fixed inset-0 bg-black z-50 flex flex-col">
      <VideoCallHeader
        professionalName={professionalName}
        callDuration={callDuration}
        isRecording={isRecording}
        showSettings={showSettings}
        setShowSettings={setShowSettings}
        audioLevel={audioLevel}
        setAudioLevel={setAudioLevel}
        videoQuality={videoQuality}
        setVideoQuality={setVideoQuality}
      />

      <VideoCallStream
        isCallActive={isCallActive}
        isVideoOn={isVideoOn}
        professionalName={professionalName}
        localVideoRef={localVideoRef}
        remoteVideoRef={remoteVideoRef}
        handleStartCall={handleStartCall}
      />

      <VideoCallChat showChat={showChat} />

      <VideoCallControls
        isAudioOn={isAudioOn}
        isVideoOn={isVideoOn}
        isRecording={isRecording}
        toggleAudio={toggleAudio}
        toggleVideo={toggleVideo}
        handleEndCall={handleEndCall}
        startRecording={startRecording}
        stopRecording={stopRecording}
        showChat={showChat}
        setShowChat={setShowChat}
      />
    </div>
  );
};