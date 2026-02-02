import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Image as ImageIcon, 
  Upload, 
  Trash2, 
  User, 
  ImagePlus,
  Loader2,
  Crop,
  Save
} from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { LandingPageConfig } from "./LandingPagePreview";
import ImageCropModal from "./ImageCropModal";

interface ImageEditorProps {
  config: LandingPageConfig;
  onConfigChange: (config: LandingPageConfig) => void;
  onSaveNow?: () => Promise<void>;
  isSaving?: boolean;
  profileId: string;
  currentAvatarUrl?: string;
}

type ImageType = "aboutPhoto" | "heroBanner";

const ASPECT_RATIOS: Record<ImageType, number> = {
  aboutPhoto: 4 / 5,   // Portrait
  heroBanner: 16 / 9,  // Landscape
};

const ImageEditor = ({ config, onConfigChange, onSaveNow, isSaving, profileId, currentAvatarUrl }: ImageEditorProps) => {
  const [isUploadingAbout, setIsUploadingAbout] = useState(false);
  const [isUploadingHero, setIsUploadingHero] = useState(false);
  const [cropModalOpen, setCropModalOpen] = useState(false);
  const [imageToCrop, setImageToCrop] = useState<string>("");
  const [currentImageType, setCurrentImageType] = useState<ImageType>("aboutPhoto");
  
  const aboutPhotoInputRef = useRef<HTMLInputElement>(null);
  const heroInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (file: File, type: ImageType) => {
    if (!file.type.startsWith("image/")) {
      toast.error("Por favor, selecione uma imagem");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast.error("A imagem deve ter no máximo 10MB");
      return;
    }

    // Create object URL for cropping
    const imageUrl = URL.createObjectURL(file);
    setImageToCrop(imageUrl);
    setCurrentImageType(type);
    setCropModalOpen(true);
  };

  const handleUploadCroppedImage = async (blob: Blob) => {
    const setLoading = currentImageType === "aboutPhoto" ? setIsUploadingAbout : setIsUploadingHero;
    setLoading(true);

    try {
      // Get the current user's ID for storage path (required by RLS policy)
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error("Usuário não autenticado");
        setLoading(false);
        return;
      }

      // Generate unique filename with timestamp to avoid cache issues
      // Use user.id (auth.uid()) as folder name to comply with storage RLS policies
      const timestamp = Date.now();
      const fileName = `${user.id}/landing-${currentImageType}-${timestamp}.jpg`;

      console.log("Uploading cropped image to:", fileName);

      const { error: uploadError, data: uploadData } = await supabase.storage
        .from("avatars")
        .upload(fileName, blob, { 
          upsert: true,
          contentType: "image/jpeg"
        });


      if (uploadError) {
        console.error("Upload error:", uploadError);
        throw uploadError;
      }

      console.log("Upload successful:", uploadData);

      const { data: { publicUrl } } = supabase.storage
        .from("avatars")
        .getPublicUrl(fileName);

      const imageUrl = `${publicUrl}?t=${timestamp}`;
      console.log("Public URL:", imageUrl);

      // Create new config with updated image
      const newConfig = {
        ...config,
        images: {
          ...config.images,
          [currentImageType]: imageUrl,
        },
      };

      // Update config state
      onConfigChange(newConfig);

      // Force save immediately after upload
      if (onSaveNow) {
        console.log("Forcing save after upload...");
        // Wait a bit for state to update then trigger save
        setTimeout(async () => {
          await onSaveNow();
        }, 100);
      }

      toast.success("Imagem recortada e salva com sucesso!");
    } catch (error) {
      console.error("Error uploading image:", error);
      toast.error("Erro ao fazer upload da imagem. Tente novamente.");
    } finally {
      setLoading(false);
      // Cleanup object URL
      if (imageToCrop) {
        URL.revokeObjectURL(imageToCrop);
        setImageToCrop("");
      }
    }
  };

  const handleAboutPhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file, "aboutPhoto");
    }
    // Reset input to allow selecting the same file again
    e.target.value = "";
  };

  const handleHeroChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file, "heroBanner");
    }
    // Reset input to allow selecting the same file again
    e.target.value = "";
  };

  const removeImage = (type: ImageType) => {
    onConfigChange({
      ...config,
      images: {
        ...config.images,
        [type]: "",
      },
    });
    toast.success("Imagem removida");
  };

  const aboutPhotoUrl = config.images.aboutPhoto || currentAvatarUrl;

  return (
    <div className="space-y-4">
      <input
        ref={aboutPhotoInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleAboutPhotoChange}
      />
      <input
        ref={heroInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleHeroChange}
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
        title={currentImageType === "aboutPhoto" ? "Recortar Foto (4:5)" : "Recortar Banner (16:9)"}
      />

      {/* Foto Sobre Mim */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <User className="h-4 w-4 text-primary" />
            Foto - Seção "Sobre Mim"
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-xs text-muted-foreground">
            Esta imagem aparece na seção "Sobre Mim" da sua landing page. Recomendamos uma foto profissional em formato retrato (4:5).
          </p>
          
          <div className="flex gap-3">
            {/* Preview */}
            <div className="w-24 h-28 rounded-lg overflow-hidden bg-muted border border-border flex-shrink-0">
              {aboutPhotoUrl ? (
                <img 
                  src={aboutPhotoUrl}
                  alt="Preview Sobre Mim"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <User className="w-8 h-8 text-muted-foreground" />
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex flex-col gap-2 flex-1">
              <Button 
                size="sm" 
                variant="outline"
                onClick={() => aboutPhotoInputRef.current?.click()}
                disabled={isUploadingAbout}
                className="w-full justify-start gap-2"
              >
                {isUploadingAbout ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    <Crop className="h-4 w-4" />
                  </>
                )}
                {config.images.aboutPhoto ? "Alterar e recortar" : "Enviar e recortar"}
              </Button>
              
              {config.images.aboutPhoto && (
                <Button 
                  size="sm" 
                  variant="ghost"
                  onClick={() => removeImage("aboutPhoto")}
                  className="w-full justify-start gap-2 text-destructive hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                  Usar foto do perfil
                </Button>
              )}

              <p className="text-[10px] text-muted-foreground mt-1">
                {config.images.aboutPhoto 
                  ? "✓ Foto personalizada ativa" 
                  : "Usando foto do perfil"}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Banner Hero */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <ImagePlus className="h-4 w-4 text-primary" />
            Banner Hero (Opcional)
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-xs text-muted-foreground">
            Imagem de fundo para a seção principal. Deixe em branco para usar o gradiente padrão.
          </p>
          
          <div className="flex gap-3">
            {/* Preview */}
            <div className="w-28 h-16 rounded-lg overflow-hidden bg-muted border border-border flex-shrink-0">
              {config.images.heroBanner ? (
                <img 
                  src={config.images.heroBanner}
                  alt="Preview Hero"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-teal-200/50 to-gold-200/30">
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
                {config.images.heroBanner ? "Alterar e recortar" : "Enviar e recortar"}
              </Button>
              
              {config.images.heroBanner && (
                <Button 
                  size="sm" 
                  variant="ghost"
                  onClick={() => removeImage("heroBanner")}
                  className="w-full justify-start gap-2 text-destructive hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                  Remover banner
                </Button>
              )}

              <p className="text-[10px] text-muted-foreground mt-1">
                {config.images.heroBanner 
                  ? "✓ Banner personalizado ativo" 
                  : "Usando gradiente padrão"}
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
              <p className="text-xs font-medium text-foreground mb-1">Editor de Imagens</p>
              <ul className="text-[10px] text-muted-foreground space-y-0.5">
                <li>• Recorte e ajuste suas imagens antes de enviar</li>
                <li>• Use o zoom para ajustar o enquadramento</li>
                <li>• Foto "Sobre Mim": proporção 4:5 (retrato)</li>
                <li>• Banner Hero: proporção 16:9 (paisagem)</li>
                <li>• Tamanho máximo: 10MB</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ImageEditor;