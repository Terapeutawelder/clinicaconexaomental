import { useState, useRef, useCallback, useEffect } from "react";
import { Upload, Image as ImageIcon, Loader2, Trash2, AlignVerticalJustifyStart, AlignVerticalJustifyCenter, AlignVerticalJustifyEnd } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import AIContentEditor from "./AIContentEditor";
import AIThumbnailGenerator from "./AIThumbnailGenerator";
import type { Module, ThumbnailFocus } from "@/hooks/useMemberModules";

interface ModuleFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  module?: Module | null;
  professionalId: string;
  onSave: (data: {
    title: string;
    description?: string;
    thumbnailUrl?: string;
    thumbnailFocus?: ThumbnailFocus;
    isPublished?: boolean;
  }) => Promise<any>;
}

const ModuleFormModal = ({
  isOpen,
  onClose,
  module,
  professionalId,
  onSave,
}: ModuleFormModalProps) => {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [thumbnailUrl, setThumbnailUrl] = useState("");
  const [thumbnailFocus, setThumbnailFocus] = useState<ThumbnailFocus>("center");
  const [isPublished, setIsPublished] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  const isEditing = !!module;

  // Reset form when modal opens or module changes
  useEffect(() => {
    if (isOpen) {
      setTitle(module?.title || "");
      setDescription(module?.description || "");
      setThumbnailUrl(module?.thumbnailUrl || "");
      setThumbnailFocus(module?.thumbnailFocus || "center");
      setIsPublished(module?.isPublished || false);
    }
  }, [isOpen, module]);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const uploadThumbnail = async (file: File) => {
    if (!file.type.startsWith("image/")) {
      toast({
        title: "Formato inválido",
        description: "Por favor, selecione uma imagem (JPG, PNG, WebP).",
        variant: "destructive",
      });
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "Arquivo muito grande",
        description: "O tamanho máximo é 5MB.",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);

    try {
      // Get current user id to match RLS policy (auth.uid())
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error("Usuário não autenticado");
      }

      const fileExt = file.name.split(".").pop();
      // Use user.id (auth.uid()) in path to comply with RLS policy
      const fileName = `${user.id}/thumbnails/${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("member-videos")
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      // Store the file path (not URL) so we can generate signed URLs when needed
      // The bucket is private, so we need to use signed URLs for display
      const { data: signedUrlData, error: signedUrlError } = await supabase.storage
        .from("member-videos")
        .createSignedUrl(fileName, 60 * 60 * 24 * 365); // 1 year expiry
      
      if (signedUrlError) throw signedUrlError;
      
      setThumbnailUrl(signedUrlData.signedUrl);
      toast({
        title: "Thumbnail enviada!",
        description: "A imagem foi carregada com sucesso.",
      });
    } catch (error) {
      console.error("Error uploading thumbnail:", error);
      toast({
        title: "Erro no upload",
        description: "Não foi possível enviar a imagem. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setDragActive(false);

      const files = e.dataTransfer.files;
      if (files && files[0]) {
        uploadThumbnail(files[0]);
      }
    },
    [professionalId]
  );

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files[0]) {
      uploadThumbnail(files[0]);
    }
  };

  const handleRemoveThumbnail = () => {
    setThumbnailUrl("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      toast({
        title: "Título obrigatório",
        description: "Por favor, insira um título para o módulo.",
        variant: "destructive",
      });
      return;
    }

    setIsSaving(true);

    try {
      await onSave({
        title: title.trim(),
        description: description.trim() || undefined,
        thumbnailUrl: thumbnailUrl || undefined,
        thumbnailFocus,
        isPublished,
      });
      onClose();
    } catch (error) {
      console.error("Error saving module:", error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg bg-gray-900 border-gray-800 text-white">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">
            {isEditing ? "Editar Módulo" : "Novo Módulo"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 mt-4">
          {/* Thumbnail Upload */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-gray-300">Thumbnail</Label>
              <AIThumbnailGenerator
                moduleTitle={title}
                onGenerate={(url) => setThumbnailUrl(url)}
                disabled={isUploading}
              />
            </div>
            <div
              className={cn(
                "relative border-2 border-dashed rounded-xl overflow-hidden transition-all",
                dragActive
                  ? "border-primary bg-primary/10"
                  : thumbnailUrl
                  ? "border-gray-700"
                  : "border-gray-700 hover:border-gray-600"
              )}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              {thumbnailUrl ? (
                <div className="relative aspect-video">
                  <img
                    src={thumbnailUrl}
                    alt="Thumbnail"
                    className="w-full h-full object-cover"
                    style={{ 
                      objectPosition: thumbnailFocus === 'top' ? 'center top' : 
                                       thumbnailFocus === 'bottom' ? 'center bottom' : 
                                       'center center' 
                    }}
                  />
                  <div className="absolute inset-0 bg-black/50 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <Button
                      type="button"
                      size="sm"
                      variant="secondary"
                      onClick={() => fileInputRef.current?.click()}
                      className="bg-white/20 hover:bg-white/30 text-white"
                    >
                      <Upload className="w-4 h-4 mr-2" />
                      Alterar
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="destructive"
                      onClick={handleRemoveThumbnail}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ) : (
                <div
                  className="aspect-video flex flex-col items-center justify-center cursor-pointer"
                  onClick={() => fileInputRef.current?.click()}
                >
                  {isUploading ? (
                    <Loader2 className="w-8 h-8 text-primary animate-spin" />
                  ) : (
                    <>
                      <div className="w-16 h-16 rounded-full bg-gray-800 flex items-center justify-center mb-3">
                        <ImageIcon className="w-8 h-8 text-gray-500" />
                      </div>
                      <p className="text-gray-400 text-sm">
                        Arraste uma imagem ou{" "}
                        <span className="text-primary">clique aqui</span>
                      </p>
                      <p className="text-gray-600 text-xs mt-1">
                        PNG, JPG ou WebP (max. 5MB)
                      </p>
                    </>
                  )}
                </div>
              )}
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileChange}
            />
          </div>

          {/* Thumbnail Focus Point - Only show when thumbnail is set */}
          {thumbnailUrl && (
            <div className="space-y-2">
              <Label className="text-gray-300">Ponto de foco</Label>
              <ToggleGroup
                type="single"
                value={thumbnailFocus}
                onValueChange={(value) => value && setThumbnailFocus(value as ThumbnailFocus)}
                className="justify-start"
              >
                <ToggleGroupItem
                  value="top"
                  aria-label="Topo"
                  className="data-[state=on]:bg-primary data-[state=on]:text-white border-gray-700 text-gray-400"
                >
                  <AlignVerticalJustifyStart className="w-4 h-4 mr-2" />
                  Topo
                </ToggleGroupItem>
                <ToggleGroupItem
                  value="center"
                  aria-label="Centro"
                  className="data-[state=on]:bg-primary data-[state=on]:text-white border-gray-700 text-gray-400"
                >
                  <AlignVerticalJustifyCenter className="w-4 h-4 mr-2" />
                  Centro
                </ToggleGroupItem>
                <ToggleGroupItem
                  value="bottom"
                  aria-label="Base"
                  className="data-[state=on]:bg-primary data-[state=on]:text-white border-gray-700 text-gray-400"
                >
                  <AlignVerticalJustifyEnd className="w-4 h-4 mr-2" />
                  Base
                </ToggleGroupItem>
              </ToggleGroup>
              <p className="text-gray-500 text-xs">
                Escolha qual parte da imagem será priorizada no card
              </p>
            </div>
          )}

          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title" className="text-gray-300">
              Título *
            </Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ex: Introdução à Terapia Cognitivo-Comportamental"
              className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-500"
            />
          </div>

          {/* Description with AI Editor */}
          <div className="space-y-2">
            <AIContentEditor
              label="Descrição"
              value={description}
              onChange={setDescription}
              placeholder="Descreva o conteúdo do módulo..."
              minHeight="120px"
            />
          </div>

          {/* Published Switch */}
          <div className="flex items-center justify-between bg-gray-800/50 rounded-lg p-4">
            <div>
              <p className="text-white font-medium">Publicar módulo</p>
              <p className="text-gray-500 text-sm">
                Módulos publicados ficam visíveis para os membros
              </p>
            </div>
            <Switch
              checked={isPublished}
              onCheckedChange={setIsPublished}
              className="data-[state=checked]:bg-primary"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-800">
            <Button
              type="button"
              variant="ghost"
              onClick={onClose}
              className="text-gray-400 hover:text-white"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isSaving || !title.trim()}
              className="bg-primary hover:bg-primary/90"
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Salvando...
                </>
              ) : isEditing ? (
                "Salvar alterações"
              ) : (
                "Criar módulo"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ModuleFormModal;
