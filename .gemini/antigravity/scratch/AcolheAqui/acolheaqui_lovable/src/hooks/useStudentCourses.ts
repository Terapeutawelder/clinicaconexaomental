import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface StudentCourse {
  id: string;
  professionalId: string;
  professionalName: string;
  professionalSlug: string;
  professionalAvatar: string | null;
  expiresAt: string | null;
  isActive: boolean;
  createdAt: string;
  totalModules: number;
  totalLessons: number;
  completedLessons: number;
  progressPercent: number;
}

export const useStudentCourses = () => {
  const [courses, setCourses] = useState<StudentCourse[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchCourses = useCallback(async () => {
    try {
      setLoading(true);
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setCourses([]);
        return;
      }

      // Get all member access records for this user
      const { data: accessRecords, error: accessError } = await supabase
        .from("member_access")
        .select(`
          id,
          professional_id,
          expires_at,
          is_active,
          created_at
        `)
        .eq("user_id", user.id);

      if (accessError) throw accessError;
      if (!accessRecords || accessRecords.length === 0) {
        setCourses([]);
        return;
      }

      // Get professional info for each access
      const professionalIds = accessRecords.map(a => a.professional_id);
      const { data: professionals, error: profError } = await supabase
        .from("profiles")
        .select("id, full_name, user_slug, avatar_url")
        .in("id", professionalIds);

      if (profError) throw profError;

      // Get modules and lessons count for each professional
      const { data: modules, error: modulesError } = await supabase
        .from("member_modules")
        .select("id, professional_id")
        .in("professional_id", professionalIds)
        .eq("is_published", true);

      if (modulesError) throw modulesError;

      const moduleIds = modules?.map(m => m.id) || [];
      
      // Get lessons count
      const { data: lessons, error: lessonsError } = await supabase
        .from("member_lessons")
        .select("id, module_id")
        .in("module_id", moduleIds);

      if (lessonsError) throw lessonsError;

      // Get user's progress (use is_completed column)
      const { data: progress, error: progressError } = await supabase
        .from("member_progress")
        .select("lesson_id, is_completed")
        .eq("user_id", user.id)
        .eq("is_completed", true);

      if (progressError) throw progressError;

      // Build courses data
      const coursesData: StudentCourse[] = accessRecords.map(access => {
        const professional = professionals?.find(p => p.id === access.professional_id);
        const profModules = modules?.filter(m => m.professional_id === access.professional_id) || [];
        const profModuleIds = profModules.map(m => m.id);
        const profLessons = lessons?.filter(l => profModuleIds.includes(l.module_id)) || [];
        const completedLessonIds = new Set(progress?.map(p => p.lesson_id) || []);
        const completedCount = profLessons.filter(l => completedLessonIds.has(l.id)).length;
        const totalLessons = profLessons.length;
        const progressPercent = totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0;

        // Check if access is expired
        const isExpired = access.expires_at ? new Date(access.expires_at) < new Date() : false;
        const isActive = access.is_active && !isExpired;

        return {
          id: access.id,
          professionalId: access.professional_id,
          professionalName: professional?.full_name || "Profissional",
          professionalSlug: professional?.user_slug || "",
          professionalAvatar: professional?.avatar_url || null,
          expiresAt: access.expires_at,
          isActive,
          createdAt: access.created_at,
          totalModules: profModules.length,
          totalLessons,
          completedLessons: completedCount,
          progressPercent,
        };
      });

      // Sort: active first, then by progress
      coursesData.sort((a, b) => {
        if (a.isActive !== b.isActive) return a.isActive ? -1 : 1;
        return b.progressPercent - a.progressPercent;
      });

      setCourses(coursesData);
    } catch (error) {
      console.error("Error fetching student courses:", error);
      setCourses([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCourses();
  }, [fetchCourses]);

  return { courses, loading, refetch: fetchCourses };
};
