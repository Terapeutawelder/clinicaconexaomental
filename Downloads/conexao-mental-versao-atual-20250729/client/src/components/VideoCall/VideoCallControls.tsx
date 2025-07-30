import { Button } from "@/components/ui/button";
import { 
  Video, 
  VideoOff, 
  Mic, 
  MicOff, 
  PhoneOff,
  MessageSquare,
  Monitor,
  Circle,
  Square
} from "lucide-react";

interface VideoCallControlsProps {
  isAudioOn: boolean;
  isVideoOn: boolean;
  isRecording: boolean;
  toggleAudio: () => void;
  toggleVideo: () => void;
  handleEndCall: () => void;
  startRecording: () => void;
  stopRecording: () => void;
  showChat: boolean;
  setShowChat: (show: boolean) => void;
}

export const VideoCallControls = ({
  isAudioOn,
  isVideoOn,
  isRecording,
  toggleAudio,
  toggleVideo,
  handleEndCall,
  startRecording,
  stopRecording,
  showChat,
  setShowChat
}: VideoCallControlsProps) => {
  return (
    <div className="bg-gray-900 p-4">
      <div className="flex justify-center space-x-4">
        <Button
          variant={isAudioOn ? "default" : "destructive"}
          size="icon"
          onClick={toggleAudio}
          className="rounded-full w-12 h-12"
        >
          {isAudioOn ? <Mic className="h-5 w-5" /> : <MicOff className="h-5 w-5" />}
        </Button>
        
        <Button
          variant={isVideoOn ? "default" : "destructive"}
          size="icon"
          onClick={toggleVideo}
          className="rounded-full w-12 h-12"
        >
          {isVideoOn ? <Video className="h-5 w-5" /> : <VideoOff className="h-5 w-5" />}
        </Button>

        <Button
          variant="ghost"
          size="icon"
          onClick={() => setShowChat(!showChat)}
          className="rounded-full w-12 h-12 text-white hover:bg-gray-700"
        >
          <MessageSquare className="h-5 w-5" />
        </Button>

        <Button
          variant={isRecording ? "destructive" : "default"}
          size="icon"
          onClick={isRecording ? stopRecording : startRecording}
          className="rounded-full w-12 h-12"
        >
          {isRecording ? <Square className="h-5 w-5" /> : <Circle className="h-5 w-5" />}
        </Button>

        <Button
          variant="ghost"
          size="icon"
          className="rounded-full w-12 h-12 text-white hover:bg-gray-700"
        >
          <Monitor className="h-5 w-5" />
        </Button>

        <Button
          variant="destructive"
          size="icon"
          onClick={handleEndCall}
          className="rounded-full w-12 h-12"
        >
          <PhoneOff className="h-5 w-5" />
        </Button>
      </div>
    </div>
  );
};