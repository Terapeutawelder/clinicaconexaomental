import { useState, useRef } from "react";
import { Upload, Video, X, Loader2, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

interface VideoUploaderProps {
  onUploadComplete: (url: string, duration: number) => void;
  currentVideoUrl?: string | null;
  className?: string;
}

const VideoUploader = ({
  onUploadComplete,
  currentVideoUrl,
  className,
}: VideoUploaderProps) => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [previewUrl, setPreviewUrl] = useState<string | null>(currentVideoUrl || null);
  const [videoDuration, setVideoDuration] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("video/")) {
      toast({
        title: "Arquivo inválido",
        description: "Por favor, selecione um arquivo de vídeo.",
        variant: "destructive",
      });
      return;
    }

    // Validate file size (500MB max)
    const maxSize = 500 * 1024 * 1024;
    if (file.size > maxSize) {
      toast({
        title: "Arquivo muito grande",
        description: "O tamanho máximo permitido é 500MB.",
        variant: "destructive",
      });
      return;
    }

    // Get video duration
    const duration = await getVideoDuration(file);
    setVideoDuration(duration);

    // Start upload
    await uploadVideo(file, duration);
  };

  const getVideoDuration = (file: File): Promise<number> => {
    return new Promise((resolve) => {
      const video = document.createElement("video");
      video.preload = "metadata";
      video.onloadedmetadata = () => {
        window.URL.revokeObjectURL(video.src);
        resolve(Math.floor(video.duration));
      };
      video.src = URL.createObjectURL(file);
    });
  };

  const uploadVideo = async (file: File, duration: number) => {
    setIsUploading(true);
    setUploadProgress(0);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Usuário não autenticado");

      const fileExt = file.name.split(".").pop();
      const fileName = `${user.id}/${Date.now()}.${fileExt}`;

      // Simulate progress for better UX
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return prev;
          }
          return prev + 10;
        });
      }, 500);

      const { data, error } = await supabase.storage
        .from("member-videos")
        .upload(fileName, file, {
          cacheControl: "3600",
          upsert: false,
        });

      clearInterval(progressInterval);

      if (error) throw error;

      // Get signed URL for playback
      const { data: urlData } = await supabase.storage
        .from("member-videos")
        .createSignedUrl(data.path, 60 * 60 * 24 * 365); // 1 year

      if (!urlData?.signedUrl) throw new Error("Failed to get signed URL");

      setUploadProgress(100);
      setPreviewUrl(urlData.signedUrl);
      onUploadComplete(urlData.signedUrl, duration);

      toast({
        title: "Upload concluído!",
        description: "O vídeo foi enviado com sucesso.",
      });
    } catch (error: any) {
      console.error("Upload error:", error);
      toast({
        title: "Erro no upload",
        description: error.message || "Tente novamente mais tarde.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemoveVideo = () => {
    setPreviewUrl(null);
    setUploadProgress(0);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className={cn("space-y-4", className)}>
      <input
        ref={fileInputRef}
        type="file"
        accept="video/*"
        onChange={handleFileSelect}
        className="hidden"
      />

      {previewUrl ? (
        <div className="relative rounded-xl overflow-hidden bg-gray-900">
          <video
            src={previewUrl}
            className="w-full aspect-video"
            controls
          />
          <Button
            variant="destructive"
            size="sm"
            className="absolute top-2 right-2"
            onClick={handleRemoveVideo}
          >
            <X className="w-4 h-4" />
          </Button>
          <div className="absolute bottom-2 left-2 flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-green-500" />
            <span className="text-xs text-white bg-black/50 px-2 py-1 rounded">
              {Math.floor(videoDuration / 60)}:{(videoDuration % 60).toString().padStart(2, "0")}
            </span>
          </div>
        </div>
      ) : isUploading ? (
        <div className="rounded-xl border-2 border-dashed border-gray-700 p-8 text-center">
          <Loader2 className="w-12 h-12 mx-auto text-primary animate-spin mb-4" />
          <p className="text-white font-medium mb-2">Enviando vídeo...</p>
          <Progress value={uploadProgress} className="h-2 max-w-xs mx-auto" />
          <p className="text-gray-400 text-sm mt-2">{uploadProgress}%</p>
        </div>
      ) : (
        <button
          onClick={() => fileInputRef.current?.click()}
          className="w-full rounded-xl border-2 border-dashed border-gray-700 hover:border-primary/50 p-8 text-center transition-colors group"
        >
          <div className="w-16 h-16 mx-auto rounded-full bg-gray-800 group-hover:bg-primary/20 flex items-center justify-center mb-4 transition-colors">
            <Upload className="w-8 h-8 text-gray-500 group-hover:text-primary transition-colors" />
          </div>
          <p className="text-white font-medium mb-1">
            Clique para fazer upload do vídeo
          </p>
          <p className="text-gray-500 text-sm">
            MP4, WebM ou MOV até 500MB
          </p>
        </button>
      )}
    </div>
  );
};

export default VideoUploader;
