import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface MemberWithProgress {
  id: string;
  userId: string;
  email: string;
  fullName: string | null;
  avatarUrl: string | null;
  isActive: boolean;
  expiresAt: string | null;
  createdAt: string;
  completedLessons: number;
  totalLessons: number;
  lastAccessAt: string | null;
}

export interface MemberAccessStats {
  totalMembers: number;
  activeMembers: number;
  expiredMembers: number;
  totalCompletedLessons: number;
  averageProgress: number;
}

export const useMemberAccess = (professionalId: string | null) => {
  const [members, setMembers] = useState<MemberWithProgress[]>([]);
  const [stats, setStats] = useState<MemberAccessStats>({
    totalMembers: 0,
    activeMembers: 0,
    expiredMembers: 0,
    totalCompletedLessons: 0,
    averageProgress: 0,
  });
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const fetchMembers = useCallback(async () => {
    if (!professionalId) return;

    setLoading(true);
    try {
      // Get all member access records for this professional
      const { data: accessData, error: accessError } = await supabase
        .from("member_access")
        .select("*")
        .eq("professional_id", professionalId);

      if (accessError) throw accessError;

      if (!accessData || accessData.length === 0) {
        setMembers([]);
        setStats({
          totalMembers: 0,
          activeMembers: 0,
          expiredMembers: 0,
          totalCompletedLessons: 0,
          averageProgress: 0,
        });
        setLoading(false);
        return;
      }

      // Get total lessons count for this professional
      const { data: lessonsData, error: lessonsError } = await supabase
        .from("member_lessons")
        .select("id")
        .eq("professional_id", professionalId);

      if (lessonsError) throw lessonsError;

      const totalLessons = lessonsData?.length || 0;

      // Get progress data for all members
      const { data: progressData, error: progressError } = await supabase
        .from("member_progress")
        .select("*")
        .eq("professional_id", professionalId)
        .eq("is_completed", true);

      if (progressError) throw progressError;

      // Group progress by user
      const progressByUser = new Map<string, { count: number; lastAccess: string | null }>();
      progressData?.forEach((p) => {
        const current = progressByUser.get(p.user_id) || { count: 0, lastAccess: null };
        progressByUser.set(p.user_id, {
          count: current.count + 1,
          lastAccess: p.last_watched_at && (!current.lastAccess || p.last_watched_at > current.lastAccess) 
            ? p.last_watched_at 
            : current.lastAccess,
        });
      });

      // Get user profiles for all members
      const userIds = accessData.map((a) => a.user_id);
      const { data: profilesData, error: profilesError } = await supabase
        .from("profiles")
        .select("user_id, full_name, email, avatar_url")
        .in("user_id", userIds);

      if (profilesError) throw profilesError;

      const profilesMap = new Map(profilesData?.map((p) => [p.user_id, p]));

      // Build members list
      const now = new Date();
      const membersList: MemberWithProgress[] = accessData.map((access) => {
        const profile = profilesMap.get(access.user_id);
        const userProgress = progressByUser.get(access.user_id);
        const isExpired = access.expires_at && new Date(access.expires_at) < now;

        return {
          id: access.id,
          userId: access.user_id,
          email: profile?.email || "Email não disponível",
          fullName: profile?.full_name || null,
          avatarUrl: profile?.avatar_url || null,
          isActive: access.is_active && !isExpired,
          expiresAt: access.expires_at,
          createdAt: access.created_at,
          completedLessons: userProgress?.count || 0,
          totalLessons,
          lastAccessAt: userProgress?.lastAccess || null,
        };
      });

      // Sort by most recent first
      membersList.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

      setMembers(membersList);

      // Calculate stats
      const activeCount = membersList.filter((m) => m.isActive).length;
      const expiredCount = membersList.filter((m) => !m.isActive).length;
      const totalCompleted = membersList.reduce((acc, m) => acc + m.completedLessons, 0);
      const avgProgress = totalLessons > 0 && membersList.length > 0
        ? Math.round((totalCompleted / (totalLessons * membersList.length)) * 100)
        : 0;

      setStats({
        totalMembers: membersList.length,
        activeMembers: activeCount,
        expiredMembers: expiredCount,
        totalCompletedLessons: totalCompleted,
        averageProgress: avgProgress,
      });
    } catch (error) {
      console.error("Error fetching members:", error);
      toast({
        title: "Erro ao carregar membros",
        description: "Tente novamente mais tarde.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [professionalId, toast]);

  useEffect(() => {
    fetchMembers();
  }, [fetchMembers]);

  const addMember = async (email: string, expiresAt?: Date) => {
    if (!professionalId) return null;

    try {
      // First, find the user by email in profiles
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("user_id, full_name, email, avatar_url")
        .eq("email", email)
        .single();

      if (profileError || !profile) {
        toast({
          title: "Usuário não encontrado",
          description: "Nenhum usuário cadastrado com este email.",
          variant: "destructive",
        });
        return null;
      }

      // Check if member already exists
      const { data: existing } = await supabase
        .from("member_access")
        .select("id")
        .eq("professional_id", professionalId)
        .eq("user_id", profile.user_id)
        .single();

      if (existing) {
        toast({
          title: "Membro já existe",
          description: "Este usuário já tem acesso à área de membros.",
          variant: "destructive",
        });
        return null;
      }

      // Add member access
      const { data, error } = await supabase
        .from("member_access")
        .insert({
          user_id: profile.user_id,
          professional_id: professionalId,
          is_active: true,
          expires_at: expiresAt?.toISOString() || null,
        })
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Membro adicionado!",
        description: `${profile.full_name || email} agora tem acesso à área de membros.`,
      });

      await fetchMembers();
      return data;
    } catch (error) {
      console.error("Error adding member:", error);
      toast({
        title: "Erro ao adicionar membro",
        description: "Tente novamente mais tarde.",
        variant: "destructive",
      });
      return null;
    }
  };

  const updateMemberAccess = async (memberId: string, updates: { isActive?: boolean; expiresAt?: string | null }) => {
    try {
      const { error } = await supabase
        .from("member_access")
        .update({
          is_active: updates.isActive,
          expires_at: updates.expiresAt,
        })
        .eq("id", memberId);

      if (error) throw error;

      toast({
        title: "Acesso atualizado!",
        description: "As permissões do membro foram atualizadas.",
      });

      await fetchMembers();
    } catch (error) {
      console.error("Error updating member access:", error);
      toast({
        title: "Erro ao atualizar acesso",
        description: "Tente novamente mais tarde.",
        variant: "destructive",
      });
    }
  };

  const removeMember = async (memberId: string) => {
    try {
      const { error } = await supabase
        .from("member_access")
        .delete()
        .eq("id", memberId);

      if (error) throw error;

      toast({
        title: "Membro removido",
        description: "O acesso foi revogado com sucesso.",
      });

      await fetchMembers();
    } catch (error) {
      console.error("Error removing member:", error);
      toast({
        title: "Erro ao remover membro",
        description: "Tente novamente mais tarde.",
        variant: "destructive",
      });
    }
  };

  return {
    members,
    stats,
    loading,
    addMember,
    updateMemberAccess,
    removeMember,
    refetch: fetchMembers,
  };
};
