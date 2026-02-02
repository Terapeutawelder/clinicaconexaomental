import { useState } from "react";
import {
  Sparkles,
  Loader2,
  RefreshCw,
  Wand2,
  Palette,
  Image as ImageIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface AIThumbnailGeneratorProps {
  moduleTitle: string;
  onGenerate: (imageUrl: string) => void;
  disabled?: boolean;
}

const STYLE_PRESETS = [
  { id: "professional", label: "Profissional", description: "Clean e corporativo" },
  { id: "creative", label: "Criativo", description: "Artístico e vibrante" },
  { id: "minimal", label: "Minimalista", description: "Simples e elegante" },
  { id: "nature", label: "Natureza", description: "Calmo e orgânico" },
  { id: "tech", label: "Tecnologia", description: "Moderno e digital" },
  { id: "wellness", label: "Bem-estar", description: "Suave e acolhedor" },
];

const AIThumbnailGenerator = ({
  moduleTitle,
  onGenerate,
  disabled,
}: AIThumbnailGeneratorProps) => {
  const { toast } = useToast();
  const [isGenerating, setIsGenerating] = useState(false);
  const [customPrompt, setCustomPrompt] = useState("");
  const [selectedStyle, setSelectedStyle] = useState("professional");
  const [isOpen, setIsOpen] = useState(false);

  const generateThumbnail = async () => {
    if (!moduleTitle.trim() && !customPrompt.trim()) {
      toast({
        title: "Título necessário",
        description: "Adicione um título ao módulo antes de gerar a thumbnail.",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);

    try {
      // Build prompt based on style and custom input
      const styleDescriptions: Record<string, string> = {
        professional: "Professional, clean, modern corporate design with soft blue and gray gradients",
        creative: "Creative, artistic, vibrant colors with dynamic abstract shapes and textures",
        minimal: "Minimalist, simple, elegant design with lots of white space and subtle accents",
        nature: "Nature-inspired, calm, organic with soft greens and earth tones, peaceful atmosphere",
        tech: "High-tech, digital, futuristic with neon accents and geometric patterns",
        wellness: "Wellness, therapeutic, soft pastel colors, calming and nurturing atmosphere",
      };

      const basePrompt = customPrompt.trim() || 
        `Educational course thumbnail for "${moduleTitle}". ${styleDescriptions[selectedStyle]}. High-quality digital art, 4:3 aspect ratio. No text or words.`;

      const { data, error } = await supabase.functions.invoke("generate-thumbnail", {
        body: { prompt: basePrompt, moduleTitle },
      });

      if (error) throw error;

      if (data?.imageUrl) {
        // Upload the base64 image to storage
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error("Usuário não autenticado");

        // Convert base64 to blob
        const base64Data = data.imageUrl.split(",")[1];
        const byteCharacters = atob(base64Data);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        const blob = new Blob([byteArray], { type: "image/png" });

        // Upload to storage
        const fileName = `${user.id}/thumbnails/ai-${Date.now()}.png`;
        const { error: uploadError } = await supabase.storage
          .from("member-videos")
          .upload(fileName, blob);

        if (uploadError) throw uploadError;

        // Get signed URL
        const { data: urlData, error: urlError } = await supabase.storage
          .from("member-videos")
          .createSignedUrl(fileName, 60 * 60 * 24 * 365);

        if (urlError) throw urlError;

        onGenerate(urlData.signedUrl);
        setIsOpen(false);
        
        toast({
          title: "Thumbnail gerada!",
          description: "A imagem foi criada e salva com sucesso.",
        });
      }
    } catch (error: any) {
      console.error("Thumbnail generation error:", error);
      toast({
        title: "Erro ao gerar",
        description: error.message || "Não foi possível gerar a thumbnail.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={disabled || isGenerating}
          className="border-primary/50 text-primary hover:bg-primary/10"
        >
          {isGenerating ? (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <Wand2 className="w-4 h-4 mr-2" />
          )}
          Gerar com IA
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 bg-gray-900 border-gray-700 p-4" align="start">
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-primary">
            <Sparkles className="w-4 h-4" />
            <span className="text-sm font-semibold">Gerar Thumbnail com IA</span>
          </div>

          {/* Style Presets */}
          <div className="space-y-2">
            <Label className="text-gray-300 text-xs">Estilo Visual</Label>
            <div className="grid grid-cols-2 gap-2">
              {STYLE_PRESETS.map((style) => (
                <button
                  key={style.id}
                  type="button"
                  onClick={() => setSelectedStyle(style.id)}
                  className={cn(
                    "p-2 rounded-lg text-left transition-all border",
                    selectedStyle === style.id
                      ? "bg-primary/20 border-primary text-white"
                      : "bg-gray-800 border-gray-700 text-gray-400 hover:border-gray-600"
                  )}
                >
                  <p className="text-xs font-medium">{style.label}</p>
                  <p className="text-[10px] opacity-70">{style.description}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Custom Prompt */}
          <div className="space-y-2">
            <Label className="text-gray-300 text-xs">Prompt personalizado (opcional)</Label>
            <Input
              value={customPrompt}
              onChange={(e) => setCustomPrompt(e.target.value)}
              placeholder="Descreva a imagem desejada..."
              className="bg-gray-800 border-gray-700 text-white text-sm"
            />
          </div>

          {/* Generate Button */}
          <Button
            type="button"
            onClick={generateThumbnail}
            disabled={isGenerating || (!moduleTitle.trim() && !customPrompt.trim())}
            className="w-full bg-primary hover:bg-primary/90"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Gerando...
              </>
            ) : (
              <>
                <ImageIcon className="w-4 h-4 mr-2" />
                Gerar Thumbnail
              </>
            )}
          </Button>

          <p className="text-[10px] text-gray-500 text-center">
            A IA criará uma imagem baseada no título e estilo selecionado
          </p>
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default AIThumbnailGenerator;
