import { useState, useRef, useEffect } from "react";
import { Play, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface VideoThumbnailPreviewProps {
  videoUrl: string;
  className?: string;
  onClick?: () => void;
  showPlayButton?: boolean;
}

const VideoThumbnailPreview = ({
  videoUrl,
  className,
  onClick,
  showPlayButton = true,
}: VideoThumbnailPreviewProps) => {
  const [thumbnailUrl, setThumbnailUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (!videoUrl) {
      setIsLoading(false);
      return;
    }

    const video = document.createElement("video");
    video.crossOrigin = "anonymous";
    video.preload = "metadata";
    
    video.onloadeddata = () => {
      // Seek to 1 second or 10% of the video for a good thumbnail
      video.currentTime = Math.min(1, video.duration * 0.1);
    };

    video.onseeked = () => {
      try {
        const canvas = document.createElement("canvas");
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
          const dataUrl = canvas.toDataURL("image/jpeg", 0.8);
          setThumbnailUrl(dataUrl);
        }
        setIsLoading(false);
      } catch (err) {
        console.error("Error generating thumbnail:", err);
        setError(true);
        setIsLoading(false);
      }
    };

    video.onerror = () => {
      setError(true);
      setIsLoading(false);
    };

    video.src = videoUrl;

    return () => {
      video.src = "";
    };
  }, [videoUrl]);

  if (isLoading) {
    return (
      <div
        className={cn(
          "relative flex items-center justify-center bg-gray-800 rounded-lg overflow-hidden",
          className
        )}
      >
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  if (error || !thumbnailUrl) {
    return (
      <div
        className={cn(
          "relative flex items-center justify-center bg-gradient-to-br from-gray-800 to-gray-900 rounded-lg overflow-hidden",
          className
        )}
        onClick={onClick}
      >
        {showPlayButton && (
          <div className="w-12 h-12 rounded-full bg-primary/80 flex items-center justify-center">
            <Play className="w-5 h-5 text-white fill-white ml-0.5" />
          </div>
        )}
      </div>
    );
  }

  return (
    <div
      className={cn(
        "relative cursor-pointer group rounded-lg overflow-hidden",
        className
      )}
      onClick={onClick}
    >
      <img
        src={thumbnailUrl}
        alt="Video thumbnail"
        className="w-full h-full object-cover"
      />
      {showPlayButton && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="w-12 h-12 rounded-full bg-primary/90 flex items-center justify-center transform group-hover:scale-110 transition-transform">
            <Play className="w-5 h-5 text-white fill-white ml-0.5" />
          </div>
        </div>
      )}
    </div>
  );
};

export default VideoThumbnailPreview;
