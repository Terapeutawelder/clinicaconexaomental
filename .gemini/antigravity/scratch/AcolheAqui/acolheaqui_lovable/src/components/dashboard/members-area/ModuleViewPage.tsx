import { useState, useEffect, useCallback } from "react";
import {
  ArrowLeft,
  Check,
  CheckCircle,
  Lock,
  Clock,
  ChevronDown,
  ChevronUp,
  Download,
  FileText,
  MessageCircle,
  ThumbsUp,
  Share2,
  Bookmark,
  Plus,
  Edit,
  Trash2,
  MoreVertical,
  Settings,
  Play,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import VideoPlayer from "./VideoPlayer";
import VideoThumbnailPreview from "./VideoThumbnailPreview";
import LessonFormModal from "./LessonFormModal";
import DeleteConfirmModal from "./DeleteConfirmModal";
import CertificateButton from "./CertificateButton";
import { useMemberProgress } from "@/hooks/useMemberProgress";
import { useMemberModules, type Module, type Lesson } from "@/hooks/useMemberModules";

interface ModuleViewPageProps {
  moduleId?: string;
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

const ModuleViewPage = ({ moduleId, professionalId, onBack }: ModuleViewPageProps) => {
  const { 
    modules, 
    loading: modulesLoading,
    createLesson,
    updateLesson,
    deleteLesson,
  } = useMemberModules(professionalId);
  const { 
    getProgressForLesson, 
    getCompletedLessons, 
    updateProgress, 
    markAsComplete, 
    markAsIncomplete 
  } = useMemberProgress(professionalId);

  const [currentLessonId, setCurrentLessonId] = useState<string | null>(null);
  const [showDescription, setShowDescription] = useState(true);

  // Lesson management states
  const [isLessonModalOpen, setIsLessonModalOpen] = useState(false);
  const [editingLesson, setEditingLesson] = useState<Lesson | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deletingLesson, setDeletingLesson] = useState<Lesson | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);

  const module = modules.find((m) => m.id === moduleId);
  const currentLesson = module?.lessons.find((l) => l.id === currentLessonId);
  const completedLessons = getCompletedLessons();

  // Set initial lesson when module loads
  useEffect(() => {
    if (module && module.lessons.length > 0 && !currentLessonId) {
      const firstIncomplete = module.lessons.find((l) => !completedLessons.has(l.id));
      setCurrentLessonId(firstIncomplete?.id || module.lessons[0].id);
    }
  }, [module, currentLessonId, completedLessons]);

  const totalLessons = module?.lessons.length || 0;
  const completedCount = module?.lessons.filter((l) => completedLessons.has(l.id)).length || 0;
  const progressPercentage = totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0;

  const currentLessonIndex = module?.lessons.findIndex((l) => l.id === currentLessonId) ?? -1;
  const hasPrevious = currentLessonIndex > 0;
  const hasNext = currentLessonIndex < (module?.lessons.length || 0) - 1;

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

  const handleVideoProgress = useCallback((currentTime: number, duration: number) => {
    if (!currentLesson) return;
    
    if (Math.floor(currentTime) % 10 === 0) {
      updateProgress(currentLesson.id, Math.floor(currentTime), false);
    }
  }, [currentLesson, updateProgress]);

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

  // Lesson management handlers
  const handleOpenCreateLesson = () => {
    setEditingLesson(null);
    setIsLessonModalOpen(true);
  };

  const handleOpenEditLesson = (lesson: Lesson) => {
    setEditingLesson(lesson);
    setIsLessonModalOpen(true);
  };

  const handleOpenDeleteLesson = (lesson: Lesson) => {
    setDeletingLesson(lesson);
    setIsDeleteModalOpen(true);
  };

  const handleSaveLesson = async (data: {
    title: string;
    description?: string;
    videoUrl?: string;
    durationSeconds?: number;
    isFree?: boolean;
    attachments?: { name: string; url: string; type: string }[];
  }) => {
    if (!moduleId) return;

    if (editingLesson) {
      await updateLesson(editingLesson.id, data);
    } else {
      const newLesson = await createLesson(moduleId, data);
      if (newLesson) {
        setCurrentLessonId(newLesson.id);
      }
    }
  };

  const handleDeleteLesson = async () => {
    if (deletingLesson) {
      await deleteLesson(deletingLesson.id);
      if (currentLessonId === deletingLesson.id && module && module.lessons.length > 1) {
        const remainingLessons = module.lessons.filter(l => l.id !== deletingLesson.id);
        setCurrentLessonId(remainingLessons[0]?.id || null);
      }
    }
  };

  if (modulesLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-950 via-gray-900 to-gray-950 flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!module) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-950 via-gray-900 to-gray-950 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-400 mb-4">Módulo não encontrado</p>
          <Button onClick={onBack}>Voltar</Button>
        </div>
      </div>
    );
  }

  const totalDuration = module.lessons.reduce((acc, l) => acc + l.durationSeconds, 0);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-950 via-gray-900 to-gray-950">
      {/* Top Navigation */}
      <div className="sticky top-0 z-50 bg-gray-950/90 backdrop-blur-xl border-b border-gray-800">
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
            <Separator orientation="vertical" className="h-6 bg-gray-800" />
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
            <Button
              variant={isEditMode ? "default" : "ghost"}
              size="sm"
              onClick={() => setIsEditMode(!isEditMode)}
              className={cn(
                isEditMode 
                  ? "bg-primary text-white" 
                  : "text-gray-400 hover:text-white"
              )}
            >
              <Settings className="w-4 h-4 mr-2" />
              {isEditMode ? "Modo Edição" : "Editar"}
            </Button>
            <CertificateButton
              module={module}
              completedLessonsCount={completedCount}
            />
            <Button
              variant="ghost"
              size="sm"
              className="text-gray-400 hover:text-white"
            >
              <Bookmark className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="text-gray-400 hover:text-white"
            >
              <Share2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
        <Progress
          value={progressPercentage}
          className="h-1 bg-gray-800 rounded-none"
        />
      </div>

      <div className="flex flex-col lg:flex-row">
        {/* Video Player Section */}
        <div className="flex-1 lg:max-w-[calc(100%-380px)]">
          {module.lessons.length === 0 ? (
            <div className="aspect-video bg-gray-900 flex flex-col items-center justify-center">
              <div className="w-20 h-20 rounded-full bg-gray-800 flex items-center justify-center mb-4">
                <Plus className="w-10 h-10 text-gray-600" />
              </div>
              <p className="text-gray-400 mb-4">Nenhuma aula neste módulo</p>
              <Button onClick={handleOpenCreateLesson} className="bg-primary hover:bg-primary/90">
                <Plus className="w-4 h-4 mr-2" />
                Adicionar primeira aula
              </Button>
            </div>
          ) : (
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
          )}

          {/* Lesson Info */}
          {currentLesson && (
            <div className="p-4 md:p-6">
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge
                      variant="secondary"
                      className="bg-primary/20 text-primary text-xs"
                    >
                      Aula {currentLessonIndex + 1}
                    </Badge>
                    <Badge
                      variant="secondary"
                      className="bg-gray-800 text-gray-400 text-xs"
                    >
                      <Clock className="w-3 h-3 mr-1" />
                      {formatDuration(currentLesson.durationSeconds)}
                    </Badge>
                    {currentLesson.isFree && (
                      <Badge
                        variant="secondary"
                        className="bg-green-500/20 text-green-400 text-xs"
                      >
                        Grátis
                      </Badge>
                    )}
                  </div>
                  <h2 className="text-xl md:text-2xl font-bold text-white mb-2">
                    {currentLesson.title}
                  </h2>
                </div>
                <div className="flex items-center gap-2">
                  {isEditMode && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleOpenEditLesson(currentLesson)}
                      className="border-gray-700 text-gray-300 hover:text-white hover:bg-gray-800"
                    >
                      <Edit className="w-4 h-4 mr-2" />
                      Editar aula
                    </Button>
                  )}
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
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-3 mb-6">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-gray-400 hover:text-white"
                >
                  <ThumbsUp className="w-4 h-4 mr-2" />
                  Gostei
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-gray-400 hover:text-white"
                >
                  <MessageCircle className="w-4 h-4 mr-2" />
                  Comentários
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-gray-400 hover:text-white"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Baixar
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
                                <p className="text-sm text-white truncate">
                                  {attachment.name}
                                </p>
                                <p className="text-xs text-gray-500 uppercase">
                                  {attachment.type}
                                </p>
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
            <div className="p-4 border-b border-gray-800 flex items-center justify-between">
              <div>
                <h3 className="text-white font-semibold">Conteúdo do módulo</h3>
                <p className="text-xs text-gray-500 mt-1">
                  {module.lessons.length} aulas • {formatDuration(totalDuration)}
                </p>
              </div>
              {isEditMode && (
                <Button
                  size="sm"
                  onClick={handleOpenCreateLesson}
                  className="bg-primary hover:bg-primary/90"
                >
                  <Plus className="w-4 h-4" />
                </Button>
              )}
            </div>
            <ScrollArea className="h-[calc(100vh-200px)]">
              <div className="p-2">
                {module.lessons.map((lesson, index) => {
                  const isActive = lesson.id === currentLessonId;
                  const isCompleted = completedLessons.has(lesson.id);
                  const isLocked = false;

                  return (
                    <div
                      key={lesson.id}
                      className={cn(
                        "relative group flex items-start gap-3 p-3 rounded-lg text-left transition-all",
                        isActive
                          ? "bg-primary/20 border border-primary/30"
                          : "hover:bg-gray-800/50",
                        isLocked && "opacity-50"
                      )}
                    >
                      <button
                        onClick={() => !isLocked && handleLessonClick(lesson)}
                        disabled={isLocked}
                        className="flex items-start gap-3 flex-1 text-left"
                      >
                        {/* Video Thumbnail or Status Icon */}
                        {lesson.videoUrl ? (
                          <div className="relative w-16 h-10 rounded-lg overflow-hidden flex-shrink-0 bg-gray-800">
                            <VideoThumbnailPreview
                              videoUrl={lesson.videoUrl}
                              className="w-full h-full"
                              showPlayButton={false}
                            />
                            {isCompleted && (
                              <div className="absolute inset-0 bg-green-500/30 flex items-center justify-center">
                                <CheckCircle className="w-4 h-4 text-green-400" />
                              </div>
                            )}
                            {isActive && !isCompleted && (
                              <div className="absolute inset-0 bg-primary/30 flex items-center justify-center">
                                <Play className="w-4 h-4 text-white fill-white" />
                              </div>
                            )}
                          </div>
                        ) : (
                          <div
                            className={cn(
                              "w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5",
                              isCompleted
                                ? "bg-green-500/20 text-green-500"
                                : isLocked
                                ? "bg-gray-800 text-gray-500"
                                : isActive
                                ? "bg-primary text-white"
                                : "bg-gray-800 text-gray-400"
                            )}
                          >
                            {isCompleted ? (
                              <CheckCircle className="w-4 h-4" />
                            ) : isLocked ? (
                              <Lock className="w-4 h-4" />
                            ) : (
                              <span className="text-xs font-medium">{index + 1}</span>
                            )}
                          </div>
                        )}

                        {/* Lesson Info */}
                        <div className="flex-1 min-w-0">
                          <p
                            className={cn(
                              "text-sm font-medium line-clamp-2",
                              isActive ? "text-white" : "text-gray-300"
                            )}
                          >
                            {lesson.title}
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            <Clock className="w-3 h-3 text-gray-500" />
                            <span className="text-xs text-gray-500">
                              {formatDuration(lesson.durationSeconds)}
                            </span>
                            {lesson.isFree && (
                              <Badge
                                variant="secondary"
                                className="text-[10px] bg-green-500/20 text-green-400"
                              >
                                Grátis
                              </Badge>
                            )}
                          </div>
                        </div>
                      </button>

                      {/* Edit Actions */}
                      {isEditMode && (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-white h-8 w-8 p-0"
                            >
                              <MoreVertical className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="bg-gray-900 border-gray-800">
                            <DropdownMenuItem
                              onClick={() => handleOpenEditLesson(lesson)}
                              className="text-gray-300 hover:text-white focus:text-white focus:bg-gray-800"
                            >
                              <Edit className="w-4 h-4 mr-2" />
                              Editar
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleOpenDeleteLesson(lesson)}
                              className="text-red-400 hover:text-red-300 focus:text-red-300 focus:bg-gray-800"
                            >
                              <Trash2 className="w-4 h-4 mr-2" />
                              Excluir
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      )}
                    </div>
                  );
                })}

                {/* Add Lesson Button in Edit Mode */}
                {isEditMode && (
                  <button
                    onClick={handleOpenCreateLesson}
                    className="w-full flex items-center justify-center gap-2 p-3 mt-2 rounded-lg border border-dashed border-gray-700 hover:border-primary/50 text-gray-400 hover:text-white transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    <span className="text-sm">Adicionar aula</span>
                  </button>
                )}
              </div>
            </ScrollArea>
          </div>
        </div>
      </div>

      {/* Lesson Form Modal */}
      {moduleId && (
        <LessonFormModal
          isOpen={isLessonModalOpen}
          onClose={() => {
            setIsLessonModalOpen(false);
            setEditingLesson(null);
          }}
          lesson={editingLesson}
          moduleId={moduleId}
          professionalId={professionalId}
          onSave={handleSaveLesson}
        />
      )}

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setDeletingLesson(null);
        }}
        onConfirm={handleDeleteLesson}
        title="Excluir aula"
        description="Esta ação não pode ser desfeita. O vídeo e materiais de apoio também serão excluídos."
        itemName={deletingLesson?.title}
      />
    </div>
  );
};

export default ModuleViewPage;
