import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Circle, Settings } from "lucide-react";
import { VideoCallSettings } from "./VideoCallSettings";

interface VideoCallHeaderProps {
  professionalName: string;
  callDuration: string;
  isRecording: boolean;
  showSettings: boolean;
  setShowSettings: (show: boolean) => void;
  audioLevel: number;
  setAudioLevel: (level: number) => void;
  videoQuality: string;
  setVideoQuality: (quality: string) => void;
}

export const VideoCallHeader = ({
  professionalName,
  callDuration,
  isRecording,
  showSettings,
  setShowSettings,
  audioLevel,
  setAudioLevel,
  videoQuality,
  setVideoQuality
}: VideoCallHeaderProps) => {
  return (
    <div className="bg-gray-900 text-white p-4 flex justify-between items-center">
      <div className="flex items-center space-x-4">
        <div className="w-10 h-10 bg-purple-600 rounded-full flex items-center justify-center">
          <span className="text-white text-sm font-bold">
            {professionalName.split(' ')[0][0]}{professionalName.split(' ')[1]?.[0]}
          </span>
        </div>
        <div>
          <h2 className="text-lg font-semibold">{professionalName}</h2>
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-green-400 rounded-full"></div>
            <span className="text-sm text-green-400">Conectado • {callDuration}</span>
          </div>
        </div>
      </div>
      <div className="flex items-center space-x-2">
        {isRecording && (
          <div className="flex items-center space-x-2 bg-red-600 px-3 py-1 rounded-full">
            <Circle className="h-3 w-3 fill-current animate-pulse" />
            <span className="text-sm font-medium">Gravando</span>
          </div>
        )}
        <Dialog open={showSettings} onOpenChange={setShowSettings}>
          <DialogTrigger asChild>
            <Button variant="ghost" size="icon" className="text-white hover:bg-gray-700">
              <Settings className="h-5 w-5" />
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Configurações da Chamada</DialogTitle>
            </DialogHeader>
            <VideoCallSettings
              audioLevel={audioLevel}
              setAudioLevel={setAudioLevel}
              videoQuality={videoQuality}
              setVideoQuality={setVideoQuality}
            />
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};