import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface Lesson {
  id: string;
  moduleId: string;
  title: string;
  description: string | null;
  videoUrl: string | null;
  durationSeconds: number;
  orderIndex: number;
  isFree: boolean;
  attachments: { name: string; url: string; type: string }[];
}

export type ThumbnailFocus = 'top' | 'center' | 'bottom';

export interface Module {
  id: string;
  professionalId: string;
  title: string;
  description: string | null;
  thumbnailUrl: string | null;
  thumbnailFocus: ThumbnailFocus;
  isPublished: boolean;
  orderIndex: number;
  lessons: Lesson[];
}

export const useMemberModules = (professionalId: string | null) => {
  const [modules, setModules] = useState<Module[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const fetchModules = useCallback(async () => {
    if (!professionalId) return;

    setLoading(true);
    try {
      const { data: modulesData, error: modulesError } = await supabase
        .from("member_modules")
        .select("*")
        .eq("professional_id", professionalId)
        .order("order_index");

      if (modulesError) throw modulesError;

      const { data: lessonsData, error: lessonsError } = await supabase
        .from("member_lessons")
        .select("*")
        .eq("professional_id", professionalId)
        .order("order_index");

      if (lessonsError) throw lessonsError;

      const modulesWithLessons: Module[] = (modulesData || []).map((mod: any) => ({
        id: mod.id,
        professionalId: mod.professional_id,
        title: mod.title,
        description: mod.description,
        thumbnailUrl: mod.thumbnail_url,
        thumbnailFocus: mod.thumbnail_focus || 'center',
        isPublished: mod.is_published,
        orderIndex: mod.order_index,
        lessons: (lessonsData || [])
          .filter((lesson: any) => lesson.module_id === mod.id)
          .map((lesson: any) => ({
            id: lesson.id,
            moduleId: lesson.module_id,
            title: lesson.title,
            description: lesson.description,
            videoUrl: lesson.video_url,
            durationSeconds: lesson.duration_seconds,
            orderIndex: lesson.order_index,
            isFree: lesson.is_free,
            attachments: lesson.attachments || [],
          })),
      }));

      setModules(modulesWithLessons);
    } catch (error) {
      console.error("Error fetching modules:", error);
      toast({
        title: "Erro ao carregar módulos",
        description: "Tente novamente mais tarde.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [professionalId, toast]);

  useEffect(() => {
    fetchModules();
  }, [fetchModules]);

  const createModule = async (data: {
    title: string;
    description?: string;
    thumbnailUrl?: string;
    thumbnailFocus?: ThumbnailFocus;
  }) => {
    if (!professionalId) return null;

    try {
      const { data: newModule, error } = await supabase
        .from("member_modules")
        .insert({
          professional_id: professionalId,
          title: data.title,
          description: data.description,
          thumbnail_url: data.thumbnailUrl,
          thumbnail_focus: data.thumbnailFocus || 'center',
          order_index: modules.length,
        })
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Módulo criado!",
        description: "O módulo foi criado com sucesso.",
      });

      await fetchModules();
      return newModule;
    } catch (error) {
      console.error("Error creating module:", error);
      toast({
        title: "Erro ao criar módulo",
        description: "Tente novamente mais tarde.",
        variant: "destructive",
      });
      return null;
    }
  };

  const updateModule = async (
    moduleId: string,
    data: Partial<{
      title: string;
      description: string;
      thumbnailUrl: string;
      thumbnailFocus: ThumbnailFocus;
      isPublished: boolean;
    }>
  ) => {
    try {
      const updateData: Record<string, any> = {};
      if (data.title !== undefined) updateData.title = data.title;
      if (data.description !== undefined) updateData.description = data.description;
      if (data.thumbnailUrl !== undefined) updateData.thumbnail_url = data.thumbnailUrl;
      if (data.thumbnailFocus !== undefined) updateData.thumbnail_focus = data.thumbnailFocus;
      if (data.isPublished !== undefined) updateData.is_published = data.isPublished;

      const { error } = await supabase
        .from("member_modules")
        .update(updateData)
        .eq("id", moduleId);

      if (error) throw error;

      toast({
        title: "Módulo atualizado!",
      });

      await fetchModules();
    } catch (error) {
      console.error("Error updating module:", error);
      toast({
        title: "Erro ao atualizar módulo",
        variant: "destructive",
      });
    }
  };

  const deleteModule = async (moduleId: string) => {
    try {
      const { error } = await supabase
        .from("member_modules")
        .delete()
        .eq("id", moduleId);

      if (error) throw error;

      toast({
        title: "Módulo excluído!",
      });

      await fetchModules();
    } catch (error) {
      console.error("Error deleting module:", error);
      toast({
        title: "Erro ao excluir módulo",
        variant: "destructive",
      });
    }
  };

  const createLesson = async (
    moduleId: string,
    data: {
      title: string;
      description?: string;
      videoUrl?: string;
      durationSeconds?: number;
    }
  ) => {
    if (!professionalId) return null;

    const module = modules.find((m) => m.id === moduleId);
    const orderIndex = module?.lessons.length || 0;

    try {
      const { data: newLesson, error } = await supabase
        .from("member_lessons")
        .insert({
          module_id: moduleId,
          professional_id: professionalId,
          title: data.title,
          description: data.description,
          video_url: data.videoUrl,
          duration_seconds: data.durationSeconds || 0,
          order_index: orderIndex,
        })
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Aula criada!",
      });

      await fetchModules();
      return newLesson;
    } catch (error) {
      console.error("Error creating lesson:", error);
      toast({
        title: "Erro ao criar aula",
        variant: "destructive",
      });
      return null;
    }
  };

  const updateLesson = async (
    lessonId: string,
    data: Partial<{
      title: string;
      description: string;
      videoUrl: string;
      durationSeconds: number;
      isFree: boolean;
      attachments: any[];
    }>
  ) => {
    try {
      const updateData: Record<string, any> = {};
      if (data.title !== undefined) updateData.title = data.title;
      if (data.description !== undefined) updateData.description = data.description;
      if (data.videoUrl !== undefined) updateData.video_url = data.videoUrl;
      if (data.durationSeconds !== undefined) updateData.duration_seconds = data.durationSeconds;
      if (data.isFree !== undefined) updateData.is_free = data.isFree;
      if (data.attachments !== undefined) updateData.attachments = data.attachments;

      const { error } = await supabase
        .from("member_lessons")
        .update(updateData)
        .eq("id", lessonId);

      if (error) throw error;

      toast({
        title: "Aula atualizada!",
      });

      await fetchModules();
    } catch (error) {
      console.error("Error updating lesson:", error);
      toast({
        title: "Erro ao atualizar aula",
        variant: "destructive",
      });
    }
  };

  const deleteLesson = async (lessonId: string) => {
    try {
      const { error } = await supabase
        .from("member_lessons")
        .delete()
        .eq("id", lessonId);

      if (error) throw error;

      toast({
        title: "Aula excluída!",
      });

      await fetchModules();
    } catch (error) {
      console.error("Error deleting lesson:", error);
      toast({
        title: "Erro ao excluir aula",
        variant: "destructive",
      });
    }
  };

  return {
    modules,
    loading,
    createModule,
    updateModule,
    deleteModule,
    createLesson,
    updateLesson,
    deleteLesson,
    refetch: fetchModules,
  };
};
