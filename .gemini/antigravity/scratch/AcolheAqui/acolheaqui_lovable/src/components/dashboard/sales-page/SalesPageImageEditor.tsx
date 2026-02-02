import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Image as ImageIcon, 
  Trash2, 
  Loader2,
  Crop,
  Save,
  Play,
  Sparkles
} from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { SalesPageConfig } from "./SalesPagePreview";
import ImageCropModal from "../landing-page/ImageCropModal";

interface SalesPageImageEditorProps {
  config: SalesPageConfig;
  onConfigChange: (config: SalesPageConfig) => void;
  onSaveNow?: () => Promise<void>;
  isSaving?: boolean;
  professionalId: string;
}

type ImageType = "heroImage" | "videoThumbnail";

const ASPECT_RATIOS: Record<ImageType, number> = {
  heroImage: 16 / 9,     // Video/course preview
  videoThumbnail: 16 / 9, // Video thumbnail
};

const SalesPageImageEditor = ({ 
  config, 
  onConfigChange, 
  onSaveNow, 
  isSaving, 
  professionalId 
}: SalesPageImageEditorProps) => {
  const [isUploadingHero, setIsUploadingHero] = useState(false);
  const [isUploadingThumbnail, setIsUploadingThumbnail] = useState(false);
  const [cropModalOpen, setCropModalOpen] = useState(false);
  const [imageToCrop, setImageToCrop] = useState<string>("");
  const [currentImageType, setCurrentImageType] = useState<ImageType>("heroImage");
  
  const heroInputRef = useRef<HTMLInputElement>(null);
  const thumbnailInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (file: File, type: ImageType) => {
    if (!file.type.startsWith("image/")) {
      toast.error("Por favor, selecione uma imagem");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast.error("A imagem deve ter no máximo 10MB");
      return;
    }

    const imageUrl = URL.createObjectURL(file);
    setImageToCrop(imageUrl);
    setCurrentImageType(type);
    setCropModalOpen(true);
  };

  const handleUploadCroppedImage = async (blob: Blob) => {
    const setLoading = currentImageType === "heroImage" ? setIsUploadingHero : setIsUploadingThumbnail;
    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error("Usuário não autenticado");
        setLoading(false);
        return;
      }

      const timestamp = Date.now();
      const fileName = `${user.id}/sales-page-${currentImageType}-${timestamp}.jpg`;

      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(fileName, blob, { 
          upsert: true,
          contentType: "image/jpeg"
        });

      if (uploadError) {
        console.error("Upload error:", uploadError);
        throw uploadError;
      }

      const { data: { publicUrl } } = supabase.storage
        .from("avatars")
        .getPublicUrl(fileName);

      const imageUrl = `${publicUrl}?t=${timestamp}`;

      const currentImages = config.images || { heroImage: "", videoThumbnail: "" };
      const newConfig = {
        ...config,
        images: {
          ...currentImages,
          [currentImageType]: imageUrl,
        },
      };

      onConfigChange(newConfig);

      if (onSaveNow) {
        setTimeout(async () => {
          await onSaveNow();
        }, 100);
      }

      toast.success("Imagem salva com sucesso!");
    } catch (error) {
      console.error("Error uploading image:", error);
      toast.error("Erro ao fazer upload da imagem. Tente novamente.");
    } finally {
      setLoading(false);
      if (imageToCrop) {
        URL.revokeObjectURL(imageToCrop);
        setImageToCrop("");
      }
    }
  };

  const handleHeroChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file, "heroImage");
    }
    e.target.value = "";
  };

  const handleThumbnailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file, "videoThumbnail");
    }
    e.target.value = "";
  };

  const removeImage = (type: ImageType) => {
    const currentImages = config.images || { heroImage: "", videoThumbnail: "" };
    onConfigChange({
      ...config,
      images: {
        ...currentImages,
        [type]: "",
      },
    });
    toast.success("Imagem removida");
  };

  const heroImageUrl = config.images?.heroImage || "";
  const thumbnailUrl = config.images?.videoThumbnail || "";

  return (
    <div className="space-y-4">
      <input
        ref={heroInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleHeroChange}
      />
      <input
        ref={thumbnailInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleThumbnailChange}
      />

      {/* Crop Modal */}
      <ImageCropModal
        open={cropModalOpen}
        onOpenChange={(open) => {
          setCropModalOpen(open);
          if (!open && imageToCrop) {
            URL.revokeObjectURL(imageToCrop);
            setImageToCrop("");
          }
        }}
        imageSrc={imageToCrop}
        aspectRatio={ASPECT_RATIOS[currentImageType]}
        onCropComplete={handleUploadCroppedImage}
        title={currentImageType === "heroImage" ? "Recortar Imagem Hero (16:9)" : "Recortar Thumbnail (16:9)"}
      />

      {/* Hero Image */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary" />
            Imagem Principal do Curso
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-xs text-muted-foreground">
            Esta imagem aparece na seção principal (Hero) da página de vendas. Use uma imagem representativa do curso ou uma capa atraente.
          </p>
          
          <div className="flex gap-3">
            {/* Preview */}
            <div className="w-32 h-20 rounded-lg overflow-hidden bg-muted border border-border flex-shrink-0">
              {heroImageUrl ? (
                <img 
                  src={heroImageUrl}
                  alt="Preview Hero"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/20 to-accent/20">
                  <ImageIcon className="w-6 h-6 text-muted-foreground" />
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex flex-col gap-2 flex-1">
              <Button 
                size="sm" 
                variant="outline"
                onClick={() => heroInputRef.current?.click()}
                disabled={isUploadingHero}
                className="w-full justify-start gap-2"
              >
                {isUploadingHero ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Crop className="h-4 w-4" />
                )}
                {heroImageUrl ? "Alterar imagem" : "Enviar imagem"}
              </Button>
              
              {heroImageUrl && (
                <Button 
                  size="sm" 
                  variant="ghost"
                  onClick={() => removeImage("heroImage")}
                  className="w-full justify-start gap-2 text-destructive hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                  Remover imagem
                </Button>
              )}

              <p className="text-[10px] text-muted-foreground mt-1">
                {heroImageUrl 
                  ? "✓ Imagem personalizada ativa" 
                  : "Usando gradiente padrão"}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Video Thumbnail */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <Play className="h-4 w-4 text-primary" />
            Thumbnail do Vídeo (Opcional)
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-xs text-muted-foreground">
            Miniatura para o vídeo de apresentação. Se não definido, usa a imagem principal.
          </p>
          
          <div className="flex gap-3">
            {/* Preview */}
            <div className="w-32 h-20 rounded-lg overflow-hidden bg-muted border border-border flex-shrink-0 relative">
              {thumbnailUrl ? (
                <>
                  <img 
                    src={thumbnailUrl}
                    alt="Preview Thumbnail"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                    <div className="w-8 h-8 rounded-full bg-white/90 flex items-center justify-center">
                      <Play className="w-4 h-4 text-gray-900 ml-0.5" fill="currentColor" />
                    </div>
                  </div>
                </>
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-200 to-gray-300 relative">
                  <div className="w-8 h-8 rounded-full bg-white/90 flex items-center justify-center">
                    <Play className="w-4 h-4 text-gray-600 ml-0.5" fill="currentColor" />
                  </div>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex flex-col gap-2 flex-1">
              <Button 
                size="sm" 
                variant="outline"
                onClick={() => thumbnailInputRef.current?.click()}
                disabled={isUploadingThumbnail}
                className="w-full justify-start gap-2"
              >
                {isUploadingThumbnail ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Crop className="h-4 w-4" />
                )}
                {thumbnailUrl ? "Alterar thumbnail" : "Enviar thumbnail"}
              </Button>
              
              {thumbnailUrl && (
                <Button 
                  size="sm" 
                  variant="ghost"
                  onClick={() => removeImage("videoThumbnail")}
                  className="w-full justify-start gap-2 text-destructive hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                  Remover thumbnail
                </Button>
              )}

              <p className="text-[10px] text-muted-foreground mt-1">
                {thumbnailUrl 
                  ? "✓ Thumbnail personalizada" 
                  : "Usando imagem principal"}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Save Button */}
      {onSaveNow && (
        <Button
          onClick={onSaveNow}
          disabled={isSaving}
          className="w-full gap-2"
          size="lg"
        >
          {isSaving ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Salvando...
            </>
          ) : (
            <>
              <Save className="h-4 w-4" />
              Salvar Imagens
            </>
          )}
        </Button>
      )}

      {/* Info Card */}
      <Card className="border-dashed">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
              <Crop className="h-4 w-4 text-primary" />
            </div>
            <div>
              <p className="text-xs font-medium text-foreground mb-1">Dicas de Imagens</p>
              <ul className="text-[10px] text-muted-foreground space-y-0.5">
                <li>• Use imagens de alta qualidade (mín. 1280x720)</li>
                <li>• Proporção 16:9 para melhor visualização</li>
                <li>• Evite textos pequenos nas imagens</li>
                <li>• Tamanho máximo: 10MB</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SalesPageImageEditor;
