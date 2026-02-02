import { useState, useEffect, useCallback } from "react";
import {
  ArrowLeft,
  Check,
  CheckCircle,
  Clock,
  ChevronDown,
  ChevronUp,
  Download,
  FileText,
  Play,
  Award,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useMemberProgress } from "@/hooks/useMemberProgress";
import { useToast } from "@/hooks/use-toast";
import { generateCertificatePDF } from "@/lib/generateCertificatePDF";
import VideoPlayer from "@/components/dashboard/members-area/VideoPlayer";
import VideoThumbnailPreview from "@/components/dashboard/members-area/VideoThumbnailPreview";

interface Lesson {
  id: string;
  title: string;
  description: string | null;
  videoUrl: string | null;
  durationSeconds: number;
  isFree: boolean;
  attachments: { name: string; url: string; type: string }[];
}

interface Module {
  id: string;
  title: string;
  description: string | null;
  thumbnailUrl: string | null;
  lessons: Lesson[];
}

interface StudentModuleViewProps {
  moduleId: string;
  professionalId: string;
  onBack: () => void;
}

const formatDuration = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  if (mins >= 60) {
    const hours = Math.floor(mins / 60);
    const remainingMins = mins % 60;
    return `${hours}h ${remainingMins}min`;
  }
  return secs > 0 ? `${mins}:${secs.toString().padStart(2, "0")}` : `${mins}min`;
};

const StudentModuleView = ({ moduleId, professionalId, onBack }: StudentModuleViewProps) => {
  const [module, setModule] = useState<Module | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentLessonId, setCurrentLessonId] = useState<string | null>(null);
  const [showDescription, setShowDescription] = useState(true);

  const {
    getProgressForLesson,
    getCompletedLessons,
    updateProgress,
    markAsComplete,
    markAsIncomplete,
  } = useMemberProgress(professionalId);

  const completedLessons = getCompletedLessons();

  useEffect(() => {
    const fetchModule = async () => {
      try {
        const { data: moduleData, error: moduleError } = await supabase
          .from("member_modules")
          .select("id, title, description, thumbnail_url")
          .eq("id", moduleId)
          .single();

        if (moduleError) throw moduleError;

        const { data: lessonsData, error: lessonsError } = await supabase
          .from("member_lessons")
          .select("*")
          .eq("module_id", moduleId)
          .order("order_index", { ascending: true });

        if (lessonsError) throw lessonsError;

        const lessons: Lesson[] = (lessonsData || []).map((l) => ({
          id: l.id,
          title: l.title,
          description: l.description,
          videoUrl: l.video_url,
          durationSeconds: l.duration_seconds || 0,
          isFree: l.is_free || false,
          attachments: (l.attachments as any[]) || [],
        }));

        setModule({
          id: moduleData.id,
          title: moduleData.title,
          description: moduleData.description,
          thumbnailUrl: moduleData.thumbnail_url,
          lessons,
        });

        // Set initial lesson
        if (lessons.length > 0) {
          const firstIncomplete = lessons.find((l) => !completedLessons.has(l.id));
          setCurrentLessonId(firstIncomplete?.id || lessons[0].id);
        }
      } catch (error) {
        console.error("Error fetching module:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchModule();
  }, [moduleId, completedLessons]);

  const currentLesson = module?.lessons.find((l) => l.id === currentLessonId);
  const currentLessonIndex = module?.lessons.findIndex((l) => l.id === currentLessonId) ?? -1;
  const hasPrevious = currentLessonIndex > 0;
  const hasNext = currentLessonIndex < (module?.lessons.length || 0) - 1;

  const totalLessons = module?.lessons.length || 0;
  const completedCount = module?.lessons.filter((l) => completedLessons.has(l.id)).length || 0;
  const progressPercentage = totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0;

  const handleLessonClick = (lesson: Lesson) => {
    setCurrentLessonId(lesson.id);
  };

  const handleMarkComplete = async () => {
    if (!currentLesson) return;
    if (completedLessons.has(currentLesson.id)) {
      await markAsIncomplete(currentLesson.id);
    } else {
      await markAsComplete(currentLesson.id);
    }
  };

  const handleVideoProgress = useCallback(
    (currentTime: number, duration: number) => {
      if (!currentLesson) return;
      if (Math.floor(currentTime) % 10 === 0) {
        updateProgress(currentLesson.id, Math.floor(currentTime), false);
      }
    },
    [currentLesson, updateProgress]
  );

  const handleVideoComplete = async () => {
    if (!currentLesson) return;
    await markAsComplete(currentLesson.id);
    if (hasNext && module) {
      const nextLesson = module.lessons[currentLessonIndex + 1];
      setCurrentLessonId(nextLesson.id);
    }
  };

  const handlePrevLesson = () => {
    if (hasPrevious && module) {
      setCurrentLessonId(module.lessons[currentLessonIndex - 1].id);
    }
  };

  const handleNextLesson = () => {
    if (hasNext && module) {
      setCurrentLessonId(module.lessons[currentLessonIndex + 1].id);
    }
  };

  const getInitialTime = (): number => {
    if (!currentLesson) return 0;
    const progress = getProgressForLesson(currentLesson.id);
    return progress?.progressSeconds || 0;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="animate-spin w-10 h-10 border-3 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!module) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-400 mb-4">Módulo não encontrado</p>
          <Button onClick={onBack}>Voltar</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950">
      {/* Top Navigation */}
      <div className="sticky top-0 z-50 bg-gray-950/95 backdrop-blur-xl border-b border-gray-800">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={onBack}
              className="text-gray-400 hover:text-white"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Voltar
            </Button>
            <div className="h-6 w-px bg-gray-800" />
            <div>
              <h1 className="text-white font-semibold text-sm md:text-base line-clamp-1">
                {module.title}
              </h1>
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <span>
                  {completedCount}/{totalLessons} aulas
                </span>
                <span>•</span>
                <span>{progressPercentage}% concluído</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {/* Inline Certificate Button */}
            {totalLessons > 0 && completedCount === totalLessons ? (
              <Button
                variant="outline"
                size="sm"
                className="border-green-600/50 text-green-400 hover:bg-green-600/20 hover:text-green-300"
              >
                <Award className="w-4 h-4 mr-2" />
                Baixar Certificado
              </Button>
            ) : (
              <Button
                variant="outline"
                size="sm"
                disabled
                className="border-gray-700 text-gray-500 cursor-not-allowed"
              >
                <Award className="w-4 h-4 mr-2" />
                Certificado ({completedCount}/{totalLessons})
              </Button>
            )}
          </div>
        </div>
        <Progress value={progressPercentage} className="h-1 bg-gray-800 rounded-none" />
      </div>

      <div className="flex flex-col lg:flex-row">
        {/* Video Player Section */}
        <div className="flex-1 lg:max-w-[calc(100%-380px)]">
          <VideoPlayer
            src={currentLesson?.videoUrl || null}
            poster={module.thumbnailUrl || undefined}
            title={currentLesson?.title}
            onProgress={handleVideoProgress}
            onComplete={handleVideoComplete}
            onPrevious={handlePrevLesson}
            onNext={handleNextLesson}
            initialTime={getInitialTime()}
            hasPrevious={hasPrevious}
            hasNext={hasNext}
          />

          {/* Lesson Info */}
          {currentLesson && (
            <div className="p-4 md:p-6">
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant="secondary" className="bg-primary/20 text-primary text-xs">
                      Aula {currentLessonIndex + 1}
                    </Badge>
                    <Badge variant="secondary" className="bg-gray-800 text-gray-400 text-xs">
                      <Clock className="w-3 h-3 mr-1" />
                      {formatDuration(currentLesson.durationSeconds)}
                    </Badge>
                  </div>
                  <h2 className="text-xl md:text-2xl font-bold text-white mb-2">
                    {currentLesson.title}
                  </h2>
                </div>
                <Button
                  variant={completedLessons.has(currentLesson.id) ? "default" : "outline"}
                  size="sm"
                  onClick={handleMarkComplete}
                  className={cn(
                    completedLessons.has(currentLesson.id)
                      ? "bg-green-600 hover:bg-green-700 text-white"
                      : "border-gray-700 text-gray-300 hover:text-white hover:bg-gray-800"
                  )}
                >
                  {completedLessons.has(currentLesson.id) ? (
                    <>
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Concluída
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4 mr-2" />
                      Marcar como concluída
                    </>
                  )}
                </Button>
              </div>

              {/* Description */}
              <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-4">
                <button
                  className="flex items-center justify-between w-full text-left"
                  onClick={() => setShowDescription(!showDescription)}
                >
                  <span className="font-medium text-white">Sobre esta aula</span>
                  {showDescription ? (
                    <ChevronUp className="w-5 h-5 text-gray-400" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-gray-400" />
                  )}
                </button>
                {showDescription && (
                  <div className="mt-3 space-y-4">
                    <p className="text-gray-400 text-sm leading-relaxed">
                      {currentLesson.description || "Nenhuma descrição disponível."}
                    </p>

                    {currentLesson.attachments && currentLesson.attachments.length > 0 && (
                      <div className="pt-3 border-t border-gray-800">
                        <h4 className="text-sm font-medium text-white mb-2">
                          Materiais de apoio
                        </h4>
                        <div className="space-y-2">
                          {currentLesson.attachments.map((attachment, index) => (
                            <a
                              key={index}
                              href={attachment.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-3 p-2 rounded-lg bg-gray-800/50 hover:bg-gray-800 transition-colors"
                            >
                              <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center">
                                <FileText className="w-4 h-4 text-primary" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm text-white truncate">{attachment.name}</p>
                                <p className="text-xs text-gray-500 uppercase">{attachment.type}</p>
                              </div>
                              <Download className="w-4 h-4 text-gray-400" />
                            </a>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Lessons Sidebar */}
        <div className="w-full lg:w-[380px] border-t lg:border-t-0 lg:border-l border-gray-800 bg-gray-950/50">
          <div className="sticky top-[73px]">
            <div className="p-4 border-b border-gray-800">
              <h3 className="font-semibold text-white">Conteúdo do módulo</h3>
              <p className="text-xs text-gray-500 mt-1">
                {totalLessons} aulas • {completedCount} concluídas
              </p>
            </div>

            <ScrollArea className="h-[calc(100vh-180px)]">
              <div className="p-2 space-y-1">
                {module.lessons.map((lesson, index) => {
                  const isCompleted = completedLessons.has(lesson.id);
                  const isCurrent = lesson.id === currentLessonId;

                  return (
                    <button
                      key={lesson.id}
                      onClick={() => handleLessonClick(lesson)}
                      className={cn(
                        "w-full flex gap-3 p-3 rounded-xl text-left transition-all",
                        isCurrent
                          ? "bg-primary/20 border border-primary/30"
                          : "hover:bg-gray-800/50 border border-transparent"
                      )}
                    >
                      {/* Thumbnail */}
                      <div className="relative w-28 aspect-video rounded-lg overflow-hidden flex-shrink-0 bg-gray-800">
                        <VideoThumbnailPreview
                          videoUrl={lesson.videoUrl}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 flex items-center justify-center">
                          {isCompleted ? (
                            <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center">
                              <Check className="w-4 h-4 text-white" />
                            </div>
                          ) : isCurrent ? (
                            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                              <Play className="w-4 h-4 text-white ml-0.5" fill="currentColor" />
                            </div>
                          ) : null}
                        </div>
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs text-gray-500">Aula {index + 1}</span>
                          {isCompleted && (
                            <Badge className="bg-green-500/20 text-green-400 text-[10px] px-1.5 py-0">
                              Concluída
                            </Badge>
                          )}
                        </div>
                        <h4
                          className={cn(
                            "text-sm font-medium line-clamp-2",
                            isCurrent ? "text-white" : "text-gray-300"
                          )}
                        >
                          {lesson.title}
                        </h4>
                        <p className="text-xs text-gray-500 mt-1">
                          {formatDuration(lesson.durationSeconds)}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </ScrollArea>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentModuleView;
