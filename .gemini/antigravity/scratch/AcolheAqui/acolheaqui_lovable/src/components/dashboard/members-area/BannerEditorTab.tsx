import { useState, useEffect, useRef } from "react";
import {
  Palette,
  Eye,
  Sparkles,
  Image as ImageIcon,
  Upload,
  X,
  Save,
  Loader2,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface BannerConfig {
  title: string;
  subtitle: string;
  ctaText: string;
  accentColor: string;
  gradientPreset: string;
  showAvatar: boolean;
  avatarPosition: "left" | "right";
  backgroundImage?: string;
  backgroundOverlay: number;
}

interface BannerEditorTabProps {
  professionalId: string | null;
  professionalName: string;
  professionalAvatarUrl?: string | null;
}

const GRADIENT_PRESETS = [
  { id: "purple", label: "Roxo", from: "from-primary", via: "via-purple-600", to: "to-pink-600" },
  { id: "blue", label: "Azul", from: "from-blue-600", via: "via-cyan-500", to: "to-teal-500" },
  { id: "green", label: "Verde", from: "from-emerald-500", via: "via-teal-500", to: "to-cyan-500" },
  { id: "orange", label: "Laranja", from: "from-orange-500", via: "via-red-500", to: "to-pink-500" },
  { id: "pink", label: "Rosa", from: "from-pink-500", via: "via-rose-500", to: "to-red-500" },
  { id: "gold", label: "Dourado", from: "from-yellow-500", via: "via-amber-500", to: "to-orange-500" },
];

const BannerEditorTab = ({
  professionalId,
  professionalName,
  professionalAvatarUrl,
}: BannerEditorTabProps) => {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [config, setConfig] = useState<BannerConfig>({
    title: "Bem-vindo à sua jornada!",
    subtitle: `Continue aprendendo com ${professionalName}`,
    ctaText: "Continuar Assistindo",
    accentColor: "primary",
    gradientPreset: "purple",
    showAvatar: true,
    avatarPosition: "right",
    backgroundImage: "",
    backgroundOverlay: 60,
  });

  // Load saved config
  useEffect(() => {
    const loadConfig = async () => {
      if (!professionalId) return;

      const { data } = await supabase
        .from("landing_page_config")
        .select("config")
        .eq("professional_id", professionalId)
        .single();

      if (data?.config && typeof data.config === "object") {
        const savedConfig = data.config as Record<string, any>;
        if (savedConfig.memberBanner) {
          setConfig((prev) => ({ ...prev, ...savedConfig.memberBanner }));
        }
      }
    };

    loadConfig();
  }, [professionalId]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !professionalId) return;

    setIsUploading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Usuário não autenticado");

      const fileExt = file.name.split(".").pop();
      const fileName = `${user.id}/banner-bg-${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("professional-images")
        .upload(fileName, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: publicUrl } = supabase.storage
        .from("professional-images")
        .getPublicUrl(fileName);

      setConfig((prev) => ({ ...prev, backgroundImage: publicUrl.publicUrl }));

      toast({
        title: "Imagem carregada!",
        description: "A imagem de fundo foi atualizada.",
      });
    } catch (error) {
      console.error("Error uploading background image:", error);
      toast({
        title: "Erro ao carregar imagem",
        description: "Não foi possível fazer upload da imagem.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleRemoveBackground = () => {
    setConfig((prev) => ({ ...prev, backgroundImage: "" }));
  };

  const handleSave = async () => {
    if (!professionalId) return;

    setIsSaving(true);

    try {
      // Get current config
      const { data: existingData } = await supabase
        .from("landing_page_config")
        .select("config")
        .eq("professional_id", professionalId)
        .single();

      const existingConfig = (existingData?.config as Record<string, unknown>) || {};
      const newConfig = { ...existingConfig, memberBanner: config };

      // Check if config exists
      if (existingData) {
        const { error } = await supabase
          .from("landing_page_config")
          .update({ config: newConfig as never })
          .eq("professional_id", professionalId);

        if (error) throw error;
      } else {
        // Manual insert for new config
        const { error } = await supabase
          .from("landing_page_config")
          .insert([
            {
              professional_id: professionalId,
              config: newConfig as never,
            },
          ]);

        if (error) throw error;
      }

      toast({
        title: "Configurações salvas!",
        description: "As personalizações do banner foram aplicadas.",
      });
    } catch (error) {
      console.error("Error saving banner config:", error);
      toast({
        title: "Erro ao salvar",
        description: "Não foi possível salvar as configurações.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const selectedGradient = GRADIENT_PRESETS.find((g) => g.id === config.gradientPreset) || GRADIENT_PRESETS[0];

  return (
    <div className="space-y-6">
      {/* Preview */}
      <Card className="bg-gray-900/50 border-gray-800">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg text-white flex items-center gap-2">
            <Eye className="w-5 h-5 text-primary" />
            Preview do Banner
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative w-full h-[200px] md:h-[280px] overflow-hidden rounded-xl">
            {/* Background */}
            <div className="absolute inset-0 bg-gray-900">
              {/* Custom Background Image */}
              {config.backgroundImage && (
                <img
                  src={config.backgroundImage}
                  alt=""
                  className="absolute inset-0 w-full h-full object-cover"
                />
              )}

              {/* Avatar (only show if no background image) */}
              {!config.backgroundImage && config.showAvatar && professionalAvatarUrl && (
                <img
                  src={professionalAvatarUrl}
                  alt=""
                  className={cn(
                    "absolute top-0 h-full w-2/3 object-cover object-top opacity-40",
                    config.avatarPosition === "right" ? "right-0" : "left-0"
                  )}
                  style={{
                    maskImage: config.avatarPosition === "right" 
                      ? "linear-gradient(to left, black 30%, transparent 100%)"
                      : "linear-gradient(to right, black 30%, transparent 100%)",
                    WebkitMaskImage: config.avatarPosition === "right"
                      ? "linear-gradient(to left, black 30%, transparent 100%)"
                      : "linear-gradient(to right, black 30%, transparent 100%)",
                  }}
                />
              )}
              
              {/* Gradient overlay */}
              <div
                className={cn(
                  "absolute inset-0 bg-gradient-to-r",
                  selectedGradient.from,
                  selectedGradient.via,
                  selectedGradient.to
                )}
                style={{ opacity: config.backgroundImage ? 0.4 : 0.3 }}
              />
              
              {/* Dark overlay */}
              <div 
                className={cn(
                  "absolute inset-0 bg-gradient-to-r from-gray-950 via-gray-950/70 to-transparent",
                  config.avatarPosition === "left" && "from-transparent via-gray-950/70 to-gray-950"
                )}
                style={{ opacity: config.backgroundOverlay / 100 }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-gray-950 via-transparent to-gray-950/30" />
            </div>

            {/* Content */}
            <div className={cn(
              "relative h-full flex flex-col justify-center px-6 md:px-10",
              config.avatarPosition === "left" && "items-end text-right"
            )}>
              <div className="flex items-center gap-2 mb-3">
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full backdrop-blur-sm border bg-white/5 border-white/10">
                  <Sparkles className="w-3.5 h-3.5 text-primary" />
                  <span className="text-xs font-medium text-white/80 uppercase tracking-wider">
                    Área de Membros
                  </span>
                </div>
              </div>

              <h2 className="text-xl md:text-2xl lg:text-3xl font-bold text-white mb-2 max-w-md">
                {config.title}
              </h2>

              <p className="text-sm md:text-base text-gray-300 mb-4 max-w-md">
                {config.subtitle}
              </p>

              <Button className="w-fit bg-white hover:bg-gray-100 text-gray-900 font-semibold">
                {config.ctaText}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Editor */}
      <Card className="bg-gray-900/50 border-gray-800">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg text-white flex items-center gap-2">
            <Palette className="w-5 h-5 text-primary" />
            Personalizar Banner
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Texts */}
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label className="text-gray-300">Título principal</Label>
              <Input
                value={config.title}
                onChange={(e) => setConfig((prev) => ({ ...prev, title: e.target.value }))}
                placeholder="Bem-vindo à sua jornada!"
                className="bg-gray-800 border-gray-700 text-white"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-gray-300">Texto do botão</Label>
              <Input
                value={config.ctaText}
                onChange={(e) => setConfig((prev) => ({ ...prev, ctaText: e.target.value }))}
                placeholder="Continuar Assistindo"
                className="bg-gray-800 border-gray-700 text-white"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-gray-300">Subtítulo</Label>
            <Textarea
              value={config.subtitle}
              onChange={(e) => setConfig((prev) => ({ ...prev, subtitle: e.target.value }))}
              placeholder="Continue aprendendo..."
              className="bg-gray-800 border-gray-700 text-white min-h-[60px]"
            />
          </div>

          {/* Gradient Preset */}
          <div className="space-y-2">
            <Label className="text-gray-300">Paleta de cores</Label>
            <div className="grid grid-cols-6 gap-2">
              {GRADIENT_PRESETS.map((preset) => (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => setConfig((prev) => ({ ...prev, gradientPreset: preset.id }))}
                  className={cn(
                    "h-10 rounded-lg transition-all border-2",
                    `bg-gradient-to-r ${preset.from} ${preset.via} ${preset.to}`,
                    config.gradientPreset === preset.id
                      ? "border-white scale-105"
                      : "border-transparent opacity-70 hover:opacity-100"
                  )}
                  title={preset.label}
                />
              ))}
            </div>
          </div>

          {/* Background Image Upload */}
          <div className="space-y-3">
            <Label className="text-gray-300 flex items-center gap-2">
              <ImageIcon className="w-4 h-4" />
              Imagem de fundo personalizada
            </Label>
            
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
            />

            {config.backgroundImage ? (
              <div className="space-y-3">
                <div className="relative w-full h-24 rounded-lg overflow-hidden border border-gray-700">
                  <img
                    src={config.backgroundImage}
                    alt="Background preview"
                    className="w-full h-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={handleRemoveBackground}
                    className="absolute top-2 right-2 p-1.5 rounded-full bg-red-500/80 hover:bg-red-500 text-white transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Overlay control */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="text-gray-400 text-sm">Intensidade do overlay</Label>
                    <span className="text-gray-400 text-sm">{config.backgroundOverlay}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={config.backgroundOverlay}
                    onChange={(e) => setConfig((prev) => ({ ...prev, backgroundOverlay: Number(e.target.value) }))}
                    className="w-full accent-primary"
                  />
                </div>
              </div>
            ) : (
              <Button
                type="button"
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                className="w-full border-dashed border-gray-700 text-gray-400 hover:text-white hover:border-gray-500 h-20"
              >
                {isUploading ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Carregando...
                  </>
                ) : (
                  <>
                    <Upload className="w-5 h-5 mr-2" />
                    Clique para carregar uma imagem
                  </>
                )}
              </Button>
            )}
          </div>

          {/* Avatar Settings (only show if no background image) */}
          {!config.backgroundImage && (
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3">
                <Label className="text-gray-300">Mostrar foto</Label>
                <button
                  type="button"
                  onClick={() => setConfig((prev) => ({ ...prev, showAvatar: !prev.showAvatar }))}
                  className={cn(
                    "w-10 h-6 rounded-full transition-colors relative",
                    config.showAvatar ? "bg-primary" : "bg-gray-700"
                  )}
                >
                  <div
                    className={cn(
                      "absolute top-1 w-4 h-4 rounded-full bg-white transition-transform",
                      config.showAvatar ? "left-5" : "left-1"
                    )}
                  />
                </button>
              </div>

              {config.showAvatar && (
                <div className="flex items-center gap-3">
                  <Label className="text-gray-300">Posição</Label>
                  <Select
                    value={config.avatarPosition}
                    onValueChange={(value: "left" | "right") =>
                      setConfig((prev) => ({ ...prev, avatarPosition: value }))
                    }
                  >
                    <SelectTrigger className="w-32 bg-gray-800 border-gray-700 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-800 border-gray-700">
                      <SelectItem value="right">Direita</SelectItem>
                      <SelectItem value="left">Esquerda</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>
          )}

          {/* Save Button */}
          <div className="flex justify-end pt-4 border-t border-gray-800">
            <Button
              onClick={handleSave}
              disabled={isSaving}
              className="bg-primary hover:bg-primary/90"
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Salvando...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Salvar Configurações
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default BannerEditorTab;
