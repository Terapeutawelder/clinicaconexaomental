import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface LessonProgress {
  lessonId: string;
  isCompleted: boolean;
  progressSeconds: number;
  lastWatchedAt: string | null;
}

export const useMemberProgress = (professionalId: string | null) => {
  const [progress, setProgress] = useState<Map<string, LessonProgress>>(new Map());
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const fetchProgress = useCallback(async () => {
    if (!professionalId) return;
    
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("member_progress")
        .select("*")
        .eq("user_id", user.id)
        .eq("professional_id", professionalId);

      if (error) throw error;

      const progressMap = new Map<string, LessonProgress>();
      data?.forEach((item: any) => {
        progressMap.set(item.lesson_id, {
          lessonId: item.lesson_id,
          isCompleted: item.is_completed,
          progressSeconds: item.progress_seconds,
          lastWatchedAt: item.last_watched_at,
        });
      });
      setProgress(progressMap);
    } catch (error) {
      console.error("Error fetching progress:", error);
    } finally {
      setLoading(false);
    }
  }, [professionalId]);

  useEffect(() => {
    fetchProgress();
  }, [fetchProgress]);

  const updateProgress = async (
    lessonId: string,
    progressSeconds: number,
    isCompleted: boolean = false
  ) => {
    if (!professionalId) return;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from("member_progress")
        .upsert({
          user_id: user.id,
          lesson_id: lessonId,
          professional_id: professionalId,
          progress_seconds: progressSeconds,
          is_completed: isCompleted,
          completed_at: isCompleted ? new Date().toISOString() : null,
          last_watched_at: new Date().toISOString(),
        }, {
          onConflict: "user_id,lesson_id",
        });

      if (error) throw error;

      setProgress((prev) => {
        const newMap = new Map(prev);
        newMap.set(lessonId, {
          lessonId,
          isCompleted,
          progressSeconds,
          lastWatchedAt: new Date().toISOString(),
        });
        return newMap;
      });
    } catch (error) {
      console.error("Error updating progress:", error);
    }
  };

  const markAsComplete = async (lessonId: string) => {
    const current = progress.get(lessonId);
    await updateProgress(lessonId, current?.progressSeconds || 0, true);
    toast({
      title: "Aula concluída!",
      description: "Seu progresso foi salvo.",
    });
  };

  const markAsIncomplete = async (lessonId: string) => {
    const current = progress.get(lessonId);
    await updateProgress(lessonId, current?.progressSeconds || 0, false);
  };

  const getProgressForLesson = (lessonId: string): LessonProgress | undefined => {
    return progress.get(lessonId);
  };

  const getCompletedLessons = (): Set<string> => {
    const completed = new Set<string>();
    progress.forEach((value, key) => {
      if (value.isCompleted) {
        completed.add(key);
      }
    });
    return completed;
  };

  return {
    progress,
    loading,
    updateProgress,
    markAsComplete,
    markAsIncomplete,
    getProgressForLesson,
    getCompletedLessons,
    refetch: fetchProgress,
  };
};
