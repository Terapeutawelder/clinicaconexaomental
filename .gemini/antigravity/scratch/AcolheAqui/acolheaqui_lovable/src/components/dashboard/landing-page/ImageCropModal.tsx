import { useState, useRef, useCallback } from "react";
import ReactCrop, { Crop, PixelCrop, centerCrop, makeAspectCrop } from "react-image-crop";
import "react-image-crop/dist/ReactCrop.css";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { ZoomIn, ZoomOut, RotateCcw, Crop as CropIcon, Loader2, Eraser, Sun, Contrast, Palette } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface ImageCropModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  imageSrc: string;
  aspectRatio: number;
  onCropComplete: (croppedBlob: Blob) => void;
  title?: string;
}

interface ImageAdjustments {
  brightness: number;
  contrast: number;
  saturation: number;
}

const defaultAdjustments: ImageAdjustments = {
  brightness: 100,
  contrast: 100,
  saturation: 100,
};

function centerAspectCrop(
  mediaWidth: number,
  mediaHeight: number,
  aspect: number
): Crop {
  return centerCrop(
    makeAspectCrop(
      {
        unit: "%",
        width: 90,
      },
      aspect,
      mediaWidth,
      mediaHeight
    ),
    mediaWidth,
    mediaHeight
  );
}

const ImageCropModal = ({
  open,
  onOpenChange,
  imageSrc,
  aspectRatio,
  onCropComplete,
  title = "Recortar Imagem",
}: ImageCropModalProps) => {
  const [crop, setCrop] = useState<Crop>();
  const [completedCrop, setCompletedCrop] = useState<PixelCrop>();
  const [scale, setScale] = useState(1);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isRemovingBg, setIsRemovingBg] = useState(false);
  const [processedImageSrc, setProcessedImageSrc] = useState<string>("");
  const [adjustments, setAdjustments] = useState<ImageAdjustments>(defaultAdjustments);
  const imgRef = useRef<HTMLImageElement>(null);

  // Use processed image if available, otherwise use original
  const currentImageSrc = processedImageSrc || imageSrc;

  // Generate CSS filter string from adjustments
  const getFilterStyle = () => {
    return `brightness(${adjustments.brightness}%) contrast(${adjustments.contrast}%) saturate(${adjustments.saturation}%)`;
  };

  const onImageLoad = useCallback(
    (e: React.SyntheticEvent<HTMLImageElement>) => {
      const { width, height } = e.currentTarget;
      setCrop(centerAspectCrop(width, height, aspectRatio));
    },
    [aspectRatio]
  );

  const resetCrop = () => {
    if (imgRef.current) {
      const { width, height } = imgRef.current;
      setCrop(centerAspectCrop(width, height, aspectRatio));
      setScale(1);
    }
  };

  const resetAdjustments = () => {
    setAdjustments(defaultAdjustments);
  };

  const resetAll = () => {
    setProcessedImageSrc("");
    setAdjustments(defaultAdjustments);
    resetCrop();
  };

  const getImageAsBase64 = async (): Promise<string> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = img.naturalWidth;
        canvas.height = img.naturalHeight;
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          reject(new Error("Could not get canvas context"));
          return;
        }
        ctx.drawImage(img, 0, 0);
        const base64 = canvas.toDataURL("image/jpeg", 0.9);
        resolve(base64);
      };
      img.onerror = () => reject(new Error("Failed to load image"));
      img.src = currentImageSrc;
    });
  };

  const handleRemoveBackground = async () => {
    setIsRemovingBg(true);
    try {
      // Get current image as base64
      const imageBase64 = await getImageAsBase64();
      
      console.log("Calling remove-background function...");
      
      const { data, error } = await supabase.functions.invoke("remove-background", {
        body: { imageBase64 }
      });

      if (error) {
        console.error("Edge function error:", error);
        throw new Error(error.message || "Erro ao remover fundo");
      }

      if (!data?.success || !data?.processedImage) {
        throw new Error(data?.error || "Erro ao processar imagem");
      }

      console.log("Background removed successfully");
      setProcessedImageSrc(data.processedImage);
      toast.success("Fundo removido com sucesso!");
      
    } catch (error) {
      console.error("Error removing background:", error);
      const message = error instanceof Error ? error.message : "Erro ao remover fundo";
      toast.error(message);
    } finally {
      setIsRemovingBg(false);
    }
  };

  const getCroppedImage = useCallback(async (): Promise<Blob | null> => {
    if (!completedCrop || !imgRef.current) return null;

    const image = imgRef.current;
    
    // The image is displayed with CSS scale, but the crop coordinates are based on the displayed size
    // We need to calculate based on the natural (original) image dimensions
    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;

    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;

    // Calculate the crop dimensions based on natural image size
    const cropX = completedCrop.x * scaleX;
    const cropY = completedCrop.y * scaleY;
    const cropWidth = completedCrop.width * scaleX;
    const cropHeight = completedCrop.height * scaleY;

    // Set canvas size to crop dimensions
    canvas.width = cropWidth;
    canvas.height = cropHeight;

    ctx.imageSmoothingQuality = "high";

    // Apply filters to canvas context
    ctx.filter = getFilterStyle();

    ctx.drawImage(
      image,
      cropX,
      cropY,
      cropWidth,
      cropHeight,
      0,
      0,
      cropWidth,
      cropHeight
    );

    // Use PNG if background was removed (to preserve transparency), otherwise JPEG
    const format = processedImageSrc ? "image/png" : "image/jpeg";
    const quality = processedImageSrc ? undefined : 0.92;

    return new Promise((resolve) => {
      canvas.toBlob(
        (blob) => resolve(blob),
        format,
        quality
      );
    });
  }, [completedCrop, processedImageSrc, adjustments]);

  const handleConfirm = async () => {
    setIsProcessing(true);
    try {
      const croppedBlob = await getCroppedImage();
      if (croppedBlob) {
        onCropComplete(croppedBlob);
        onOpenChange(false);
        // Reset state after closing
        setProcessedImageSrc("");
        setAdjustments(defaultAdjustments);
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCancel = () => {
    setCrop(undefined);
    setCompletedCrop(undefined);
    setScale(1);
    setProcessedImageSrc("");
    setAdjustments(defaultAdjustments);
    onOpenChange(false);
  };

  const hasAdjustments = adjustments.brightness !== 100 || 
                         adjustments.contrast !== 100 || 
                         adjustments.saturation !== 100;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[95vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CropIcon className="h-5 w-5 text-primary" />
            {title}
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-auto py-4">
          {/* Crop Area */}
          <div className="flex justify-center items-center bg-muted/30 rounded-lg p-4 min-h-[450px]">
            <ReactCrop
              crop={crop}
              onChange={(_, percentCrop) => setCrop(percentCrop)}
              onComplete={(c) => setCompletedCrop(c)}
              aspect={aspectRatio}
              className="max-w-full"
            >
              <img
                ref={imgRef}
                src={currentImageSrc}
                alt="Imagem para recortar"
                onLoad={onImageLoad}
                style={{ 
                  transform: `scale(${scale})`,
                  maxHeight: "420px",
                  maxWidth: "100%",
                  width: "auto",
                  filter: getFilterStyle()
                }}
                className="transition-all duration-200"
              />
            </ReactCrop>
          </div>

          {/* Controls */}
          <div className="mt-4 space-y-4">
            {/* Zoom Control */}
            <div className="flex items-center gap-3">
              <Label className="text-sm font-medium w-20 flex items-center gap-2">
                <ZoomIn className="h-4 w-4 text-muted-foreground" />
                Zoom
              </Label>
              <ZoomOut className="h-4 w-4 text-muted-foreground" />
              <Slider
                value={[scale]}
                onValueChange={([value]) => setScale(value)}
                min={0.5}
                max={2}
                step={0.1}
                className="flex-1"
              />
              <ZoomIn className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground w-12 text-right">
                {Math.round(scale * 100)}%
              </span>
            </div>

            {/* Brightness Control */}
            <div className="flex items-center gap-3">
              <Label className="text-sm font-medium w-20 flex items-center gap-2">
                <Sun className="h-4 w-4 text-muted-foreground" />
                Brilho
              </Label>
              <span className="text-xs text-muted-foreground">-</span>
              <Slider
                value={[adjustments.brightness]}
                onValueChange={([value]) => setAdjustments(prev => ({ ...prev, brightness: value }))}
                min={50}
                max={150}
                step={1}
                className="flex-1"
              />
              <span className="text-xs text-muted-foreground">+</span>
              <span className="text-sm text-muted-foreground w-12 text-right">
                {adjustments.brightness}%
              </span>
            </div>

            {/* Contrast Control */}
            <div className="flex items-center gap-3">
              <Label className="text-sm font-medium w-20 flex items-center gap-2">
                <Contrast className="h-4 w-4 text-muted-foreground" />
                Contraste
              </Label>
              <span className="text-xs text-muted-foreground">-</span>
              <Slider
                value={[adjustments.contrast]}
                onValueChange={([value]) => setAdjustments(prev => ({ ...prev, contrast: value }))}
                min={50}
                max={150}
                step={1}
                className="flex-1"
              />
              <span className="text-xs text-muted-foreground">+</span>
              <span className="text-sm text-muted-foreground w-12 text-right">
                {adjustments.contrast}%
              </span>
            </div>

            {/* Saturation Control */}
            <div className="flex items-center gap-3">
              <Label className="text-sm font-medium w-20 flex items-center gap-2">
                <Palette className="h-4 w-4 text-muted-foreground" />
                Saturação
              </Label>
              <span className="text-xs text-muted-foreground">-</span>
              <Slider
                value={[adjustments.saturation]}
                onValueChange={([value]) => setAdjustments(prev => ({ ...prev, saturation: value }))}
                min={0}
                max={200}
                step={1}
                className="flex-1"
              />
              <span className="text-xs text-muted-foreground">+</span>
              <span className="text-sm text-muted-foreground w-12 text-right">
                {adjustments.saturation}%
              </span>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-center gap-3 pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleRemoveBackground}
                disabled={isRemovingBg || isProcessing}
                className="gap-2"
              >
                {isRemovingBg ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Removendo...
                  </>
                ) : (
                  <>
                    <Eraser className="h-4 w-4" />
                    Remover Fundo
                  </>
                )}
              </Button>

              {hasAdjustments && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={resetAdjustments}
                  className="gap-2"
                >
                  <RotateCcw className="h-4 w-4" />
                  Resetar Ajustes
                </Button>
              )}
              
              <Button
                variant="ghost"
                size="sm"
                onClick={processedImageSrc ? resetAll : resetCrop}
                className="gap-2"
              >
                <RotateCcw className="h-4 w-4" />
                {processedImageSrc ? "Resetar Tudo" : "Resetar Recorte"}
              </Button>
            </div>

            {/* Status indicators */}
            <div className="flex justify-center gap-2 flex-wrap">
              {processedImageSrc && (
                <span className="text-xs text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/30 px-2 py-1 rounded-full">
                  ✓ Fundo removido
                </span>
              )}
              {hasAdjustments && (
                <span className="text-xs text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/30 px-2 py-1 rounded-full">
                  ✓ Ajustes aplicados
                </span>
              )}
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={handleCancel}>
            Cancelar
          </Button>
          <Button onClick={handleConfirm} disabled={!completedCrop || isProcessing || isRemovingBg}>
            {isProcessing ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Processando...
              </>
            ) : (
              <>
                <CropIcon className="h-4 w-4 mr-2" />
                Aplicar
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ImageCropModal;
