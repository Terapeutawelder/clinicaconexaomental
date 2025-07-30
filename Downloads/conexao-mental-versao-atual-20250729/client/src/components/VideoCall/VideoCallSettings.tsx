import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";

interface VideoCallSettingsProps {
  audioLevel: number;
  setAudioLevel: (level: number) => void;
  videoQuality: string;
  setVideoQuality: (quality: string) => void;
}

export const VideoCallSettings = ({
  audioLevel,
  setAudioLevel,
  videoQuality,
  setVideoQuality
}: VideoCallSettingsProps) => {
  return (
    <div className="grid gap-4 py-4">
      <div className="space-y-2">
        <Label htmlFor="videoQuality">Qualidade do Vídeo</Label>
        <Select value={videoQuality} onValueChange={setVideoQuality}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="SD">SD (480p)</SelectItem>
            <SelectItem value="HD">HD (720p)</SelectItem>
            <SelectItem value="FHD">Full HD (1080p)</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <Label htmlFor="audioLevel">Volume do Áudio: {audioLevel}%</Label>
        <Slider
          value={[audioLevel]}
          onValueChange={(value) => setAudioLevel(value[0])}
          max={100}
          step={1}
          className="w-full"
        />
      </div>
      <div className="flex items-center justify-between">
        <Label htmlFor="autoRecord">Gravação Automática</Label>
        <Switch id="autoRecord" />
      </div>
    </div>
  );
};