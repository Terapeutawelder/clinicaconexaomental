import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Trophy,
  Download,
  Lock,
  CheckCircle,
  GraduationCap,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { generateCertificatePDF } from "@/lib/generateCertificatePDF";

interface ModuleCertificate {
  moduleId: string;
  moduleTitle: string;
  totalLessons: number;
  completedLessons: number;
  progressPercent: number;
  isCompleted: boolean;
  completedAt: string | null;
}

interface StudentCertificatesProps {
  professionalId: string;
  professionalName: string;
}

const StudentCertificates = ({ professionalId, professionalName }: StudentCertificatesProps) => {
  const [certificates, setCertificates] = useState<ModuleCertificate[]>([]);
  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState("");

  useEffect(() => {
    fetchCertificates();
  }, [professionalId]);

  const fetchCertificates = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Get user name
      const { data: profile } = await supabase
        .from("profiles")
        .select("full_name")
        .eq("user_id", user.id)
        .single();

      if (profile?.full_name) {
        setUserName(profile.full_name);
      }

      // Get modules
      const { data: modules, error: modulesError } = await supabase
        .from("member_modules")
        .select("id, title")
        .eq("professional_id", professionalId)
        .eq("is_published", true)
        .order("order_index", { ascending: true });

      if (modulesError) throw modulesError;

      // Get lessons for each module
      const moduleIds = (modules || []).map(m => m.id);
      const { data: lessons } = await supabase
        .from("member_lessons")
        .select("id, module_id")
        .in("module_id", moduleIds);

      // Get user progress
      const lessonIds = (lessons || []).map(l => l.id);
      const { data: progress } = await supabase
        .from("member_progress")
        .select("lesson_id, is_completed, completed_at")
        .eq("user_id", user.id)
        .in("lesson_id", lessonIds)
        .eq("is_completed", true);

      const completedLessonIds = new Set((progress || []).map(p => p.lesson_id));

      const certificatesData: ModuleCertificate[] = (modules || []).map(module => {
        const moduleLessons = (lessons || []).filter(l => l.module_id === module.id);
        const completedCount = moduleLessons.filter(l => completedLessonIds.has(l.id)).length;
        const totalCount = moduleLessons.length;
        const progressPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;
        const isCompleted = totalCount > 0 && completedCount === totalCount;

        // Find the latest completion date for this module
        const moduleCompletionDates = moduleLessons
          .map(l => progress?.find(p => p.lesson_id === l.id)?.completed_at)
          .filter(Boolean)
          .sort()
          .reverse();

        return {
          moduleId: module.id,
          moduleTitle: module.title,
          totalLessons: totalCount,
          completedLessons: completedCount,
          progressPercent,
          isCompleted,
          completedAt: isCompleted && moduleCompletionDates[0] ? moduleCompletionDates[0] : null,
        };
      });

      setCertificates(certificatesData);
    } catch (error) {
      console.error("Error fetching certificates:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadCertificate = async (cert: ModuleCertificate) => {
    if (!cert.isCompleted) return;

    try {
      generateCertificatePDF({
        studentName: userName,
        moduleTitle: cert.moduleTitle,
        professionalName: professionalName,
        completionDate: cert.completedAt ? new Date(cert.completedAt) : new Date(),
        totalLessons: cert.totalLessons,
        totalDurationHours: cert.totalLessons * 0.5, // Estimate 30 min per lesson
      });
    } catch (error) {
      console.error("Error generating certificate:", error);
    }
  };

  const completedCount = certificates.filter(c => c.isCompleted).length;
  const totalCount = certificates.length;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto py-8 px-4">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary mb-4">
          <Trophy className="w-4 h-4" />
          <span className="text-sm font-medium">Certificados</span>
        </div>
        <h1 className="text-2xl font-bold text-white mb-2">
          Meus Certificados
        </h1>
        <p className="text-gray-400">
          Complete os módulos para desbloquear seus certificados
        </p>
      </div>

      {/* Stats */}
      <Card className="bg-gradient-to-r from-primary/10 to-purple-600/10 border-primary/20 p-6 mb-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-primary/20 flex items-center justify-center">
              <GraduationCap className="w-7 h-7 text-primary" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">
                {completedCount} de {totalCount}
              </h3>
              <p className="text-sm text-gray-400">Certificados Conquistados</p>
            </div>
          </div>

          {completedCount > 0 && (
            <Badge className="bg-green-500/20 text-green-400 border-green-500/30 px-3 py-1">
              <Sparkles className="w-3 h-3 mr-1" />
              Parabéns!
            </Badge>
          )}
        </div>
      </Card>

      {/* Certificates List */}
      {certificates.length === 0 ? (
        <div className="text-center py-12">
          <Trophy className="w-12 h-12 text-gray-600 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-400 mb-2">
            Nenhum módulo disponível
          </h3>
          <p className="text-sm text-gray-500">
            Os certificados aparecerão aqui quando houver módulos.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {certificates.map((cert) => (
            <Card
              key={cert.moduleId}
              className={cn(
                "p-5 transition-all",
                cert.isCompleted
                  ? "bg-gradient-to-r from-green-500/5 to-emerald-500/5 border-green-500/20 hover:border-green-500/40"
                  : "bg-gray-900/50 border-gray-800 hover:bg-gray-900/70"
              )}
            >
              <div className="flex items-center gap-4">
                {/* Icon */}
                <div
                  className={cn(
                    "w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0",
                    cert.isCompleted
                      ? "bg-green-500/20"
                      : "bg-gray-800"
                  )}
                >
                  {cert.isCompleted ? (
                    <CheckCircle className="w-6 h-6 text-green-400" />
                  ) : (
                    <Lock className="w-5 h-5 text-gray-500" />
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-white truncate">
                      {cert.moduleTitle}
                    </h3>
                    {cert.isCompleted && (
                      <Badge className="bg-green-500/20 text-green-400 border-green-500/30 text-xs">
                        Concluído
                      </Badge>
                    )}
                  </div>

                  <div className="flex items-center gap-3">
                    <Progress
                      value={cert.progressPercent}
                      className={cn(
                        "h-2 flex-1",
                        cert.isCompleted ? "bg-green-500/10" : "bg-gray-800"
                      )}
                    />
                    <span className={cn(
                      "text-sm font-medium",
                      cert.isCompleted ? "text-green-400" : "text-gray-400"
                    )}>
                      {cert.progressPercent}%
                    </span>
                  </div>

                  <p className="text-xs text-gray-500 mt-1">
                    {cert.completedLessons} de {cert.totalLessons} aulas concluídas
                  </p>
                </div>

                {/* Download Button */}
                {cert.isCompleted && (
                  <Button
                    onClick={() => handleDownloadCertificate(cert)}
                    className="gap-2 bg-green-500/20 hover:bg-green-500/30 text-green-400 border border-green-500/30"
                    variant="outline"
                  >
                    <Download className="w-4 h-4" />
                    Baixar
                  </Button>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default StudentCertificates;
