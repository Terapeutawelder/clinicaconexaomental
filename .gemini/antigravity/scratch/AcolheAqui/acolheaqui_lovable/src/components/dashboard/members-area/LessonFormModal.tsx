import { useState, useRef, useEffect } from "react";
import { Upload, FileText, Loader2, Trash2, X, Plus, Video } from "lucide-react";
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
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import AIContentEditor from "./AIContentEditor";
import type { Lesson } from "@/hooks/useMemberModules";

interface Attachment {
  name: string;
  url: string;
  type: string;
}

interface LessonFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  lesson?: Lesson | null;
  moduleId: string;
  professionalId: string;
  onSave: (data: {
    title: string;
    description?: string;
    videoUrl?: string;
    durationSeconds?: number;
    isFree?: boolean;
    attachments?: Attachment[];
  }) => Promise<any>;
}

const LessonFormModal = ({
  isOpen,
  onClose,
  lesson,
  moduleId,
  professionalId,
  onSave,
}: LessonFormModalProps) => {
  const { toast } = useToast();
  const videoInputRef = useRef<HTMLInputElement>(null);
  const attachmentInputRef = useRef<HTMLInputElement>(null);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [durationSeconds, setDurationSeconds] = useState(0);
  const [isFree, setIsFree] = useState(false);
  const [attachments, setAttachments] = useState<Attachment[]>([]);

  const [isUploadingVideo, setIsUploadingVideo] = useState(false);
  const [videoUploadProgress, setVideoUploadProgress] = useState(0);
  const [isUploadingAttachment, setIsUploadingAttachment] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const isEditing = !!lesson;

  // Reset form when modal opens or lesson changes
  useEffect(() => {
    if (isOpen) {
      setTitle(lesson?.title || "");
      setDescription(lesson?.description || "");
      setVideoUrl(lesson?.videoUrl || "");
      setDurationSeconds(lesson?.durationSeconds || 0);
      setIsFree(lesson?.isFree || false);
      setAttachments(lesson?.attachments || []);
    }
  }, [isOpen, lesson]);

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

  const handleVideoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("video/")) {
      toast({
        title: "Arquivo inválido",
        description: "Por favor, selecione um arquivo de vídeo.",
        variant: "destructive",
      });
      return;
    }

    const maxSize = 500 * 1024 * 1024;
    if (file.size > maxSize) {
      toast({
        title: "Arquivo muito grande",
        description: "O tamanho máximo permitido é 500MB.",
        variant: "destructive",
      });
      return;
    }

    setIsUploadingVideo(true);
    setVideoUploadProgress(0);

    try {
      // Get current user id to match RLS policy (auth.uid())
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error("Usuário não autenticado");
      }

      const duration = await getVideoDuration(file);
      setDurationSeconds(duration);

      const progressInterval = setInterval(() => {
        setVideoUploadProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return prev;
          }
          return prev + 10;
        });
      }, 500);

      const fileExt = file.name.split(".").pop();
      // Use user.id (auth.uid()) in path to comply with RLS policy
      const fileName = `${user.id}/videos/${Date.now()}.${fileExt}`;

      const { data, error } = await supabase.storage
        .from("member-videos")
        .upload(fileName, file, { cacheControl: "3600", upsert: false });

      clearInterval(progressInterval);

      if (error) throw error;

      const { data: urlData } = await supabase.storage
        .from("member-videos")
        .createSignedUrl(data.path, 60 * 60 * 24 * 365);

      if (!urlData?.signedUrl) throw new Error("Falha ao obter URL do vídeo");

      setVideoUploadProgress(100);
      setVideoUrl(urlData.signedUrl);

      toast({
        title: "Vídeo enviado!",
        description: "O vídeo foi carregado com sucesso.",
      });
    } catch (error: any) {
      console.error("Video upload error:", error);
      toast({
        title: "Erro no upload",
        description: error.message || "Tente novamente mais tarde.",
        variant: "destructive",
      });
    } finally {
      setIsUploadingVideo(false);
    }
  };

  const handleAttachmentUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const maxSize = 50 * 1024 * 1024; // 50MB for attachments
    if (file.size > maxSize) {
      toast({
        title: "Arquivo muito grande",
        description: "O tamanho máximo para anexos é 50MB.",
        variant: "destructive",
      });
      return;
    }

    setIsUploadingAttachment(true);

    try {
      // Get current user id to match RLS policy (auth.uid())
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error("Usuário não autenticado");
      }

      const fileExt = file.name.split(".").pop() || "file";
      // Use user.id (auth.uid()) in path to comply with RLS policy
      const fileName = `${user.id}/attachments/${Date.now()}-${file.name}`;

      const { data, error } = await supabase.storage
        .from("member-videos")
        .upload(fileName, file, { cacheControl: "3600", upsert: false });

      if (error) throw error;

      const { data: urlData } = await supabase.storage
        .from("member-videos")
        .createSignedUrl(data.path, 60 * 60 * 24 * 365);

      if (!urlData?.signedUrl) throw new Error("Falha ao obter URL do anexo");

      setAttachments((prev) => [
        ...prev,
        { name: file.name, url: urlData.signedUrl, type: fileExt.toUpperCase() },
      ]);

      toast({
        title: "Anexo enviado!",
      });
    } catch (error: any) {
      console.error("Attachment upload error:", error);
      toast({
        title: "Erro no upload",
        description: error.message || "Tente novamente mais tarde.",
        variant: "destructive",
      });
    } finally {
      setIsUploadingAttachment(false);
      if (attachmentInputRef.current) {
        attachmentInputRef.current.value = "";
      }
    }
  };

  const handleRemoveAttachment = (index: number) => {
    setAttachments((prev) => prev.filter((_, i) => i !== index));
  };

  const handleRemoveVideo = () => {
    setVideoUrl("");
    setDurationSeconds(0);
    if (videoInputRef.current) {
      videoInputRef.current.value = "";
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      toast({
        title: "Título obrigatório",
        description: "Por favor, insira um título para a aula.",
        variant: "destructive",
      });
      return;
    }

    setIsSaving(true);

    try {
      await onSave({
        title: title.trim(),
        description: description.trim() || undefined,
        videoUrl: videoUrl || undefined,
        durationSeconds,
        isFree,
        attachments,
      });
      onClose();
    } catch (error) {
      console.error("Error saving lesson:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl bg-gray-900 border-gray-800 text-white max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">
            {isEditing ? "Editar Aula" : "Nova Aula"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 mt-4">
          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="lesson-title" className="text-gray-300">
              Título da aula *
            </Label>
            <Input
              id="lesson-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ex: Introdução ao módulo"
              className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-500"
            />
          </div>

          {/* Description with AI Editor */}
          <div className="space-y-2">
            <AIContentEditor
              label="Descrição"
              value={description}
              onChange={setDescription}
              placeholder="Descreva o conteúdo da aula..."
              minHeight="80px"
            />
          </div>

          {/* Video Upload */}
          <div className="space-y-2">
            <Label className="text-gray-300">Vídeo da aula</Label>
            <input
              ref={videoInputRef}
              type="file"
              accept="video/*"
              onChange={handleVideoUpload}
              className="hidden"
            />

            {videoUrl ? (
              <div className="relative rounded-xl overflow-hidden bg-gray-800">
                <video
                  src={videoUrl}
                  className="w-full aspect-video object-cover"
                  controls
                  preload="metadata"
                  poster=""
                />
                <div className="absolute top-2 right-2 flex gap-2">
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    className="bg-black/50 hover:bg-black/70 text-white"
                    onClick={() => videoInputRef.current?.click()}
                  >
                    Alterar
                  </Button>
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    onClick={handleRemoveVideo}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
                <div className="absolute bottom-2 left-2 bg-black/50 px-2 py-1 rounded text-xs text-white">
                  Duração: {formatDuration(durationSeconds)}
                </div>
              </div>
            ) : isUploadingVideo ? (
              <div className="rounded-xl border-2 border-dashed border-gray-700 p-8 text-center">
                <Loader2 className="w-10 h-10 mx-auto text-primary animate-spin mb-3" />
                <p className="text-white font-medium mb-2">Enviando vídeo...</p>
                <Progress value={videoUploadProgress} className="h-2 max-w-xs mx-auto" />
                <p className="text-gray-400 text-sm mt-2">{videoUploadProgress}%</p>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => videoInputRef.current?.click()}
                className="w-full rounded-xl border-2 border-dashed border-gray-700 hover:border-primary/50 p-6 text-center transition-colors group"
              >
                <div className="w-12 h-12 mx-auto rounded-full bg-gray-800 group-hover:bg-primary/20 flex items-center justify-center mb-3 transition-colors">
                  <Video className="w-6 h-6 text-gray-500 group-hover:text-primary transition-colors" />
                </div>
                <p className="text-white font-medium text-sm mb-1">
                  Clique para fazer upload
                </p>
                <p className="text-gray-500 text-xs">
                  MP4, WebM ou MOV até 500MB
                </p>
              </button>
            )}
          </div>

          {/* Attachments */}
          <div className="space-y-2">
            <Label className="text-gray-300">Materiais de apoio</Label>
            <input
              ref={attachmentInputRef}
              type="file"
              accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.zip,.rar"
              onChange={handleAttachmentUpload}
              className="hidden"
            />

            <div className="space-y-2">
              {attachments.map((attachment, index) => (
                <div
                  key={index}
                  className="flex items-center gap-3 p-3 rounded-lg bg-gray-800 border border-gray-700"
                >
                  <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
                    <FileText className="w-5 h-5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-white truncate">{attachment.name}</p>
                    <p className="text-xs text-gray-500">{attachment.type}</p>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveAttachment(index)}
                    className="text-gray-400 hover:text-red-400"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              ))}

              <button
                type="button"
                onClick={() => attachmentInputRef.current?.click()}
                disabled={isUploadingAttachment}
                className="w-full flex items-center justify-center gap-2 p-3 rounded-lg border border-dashed border-gray-700 hover:border-primary/50 text-gray-400 hover:text-white transition-colors disabled:opacity-50"
              >
                {isUploadingAttachment ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Plus className="w-4 h-4" />
                )}
                <span className="text-sm">
                  {isUploadingAttachment ? "Enviando..." : "Adicionar material"}
                </span>
              </button>
              <p className="text-xs text-gray-500">
                PDF, DOC, XLS, PPT, ZIP (máx. 50MB)
              </p>
            </div>
          </div>

          {/* Free Lesson Switch */}
          <div className="flex items-center justify-between bg-gray-800/50 rounded-lg p-4">
            <div>
              <p className="text-white font-medium">Aula gratuita</p>
              <p className="text-gray-500 text-sm">
                Permitir acesso a esta aula sem assinatura
              </p>
            </div>
            <Switch
              checked={isFree}
              onCheckedChange={setIsFree}
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
                "Criar aula"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default LessonFormModal;
