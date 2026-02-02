import { Play, Trophy, BookOpen, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

interface Module {
  id: string;
  title: string;
  thumbnailUrl: string | null;
}

interface StudentHeroProps {
  userName: string;
  professionalName: string;
  continueModule: Module | undefined;
  onContinue: (moduleId: string) => void;
  overallProgress: number;
  totalLessons: number;
  completedLessons: number;
}

const StudentHero = ({
  userName,
  professionalName,
  continueModule,
  onContinue,
  overallProgress,
  totalLessons,
  completedLessons,
}: StudentHeroProps) => {
  return (
    <div className="relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/30 via-purple-900/20 to-gray-950" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary/20 via-transparent to-transparent" />
      
      {/* Decorative elements */}
      <div className="absolute top-10 right-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-1/3 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />

      {/* Content */}
      <div className="relative px-8 py-16">
        <div className="max-w-4xl">
          {/* Welcome Message */}
          <div className="flex items-center gap-2 mb-4">
            <div className="px-3 py-1 rounded-full bg-primary/20 border border-primary/30">
              <span className="text-primary text-sm font-medium">
                👋 Bem-vindo de volta
              </span>
            </div>
          </div>

          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4">
            {userName ? (
              <>
                Olá, <span className="text-primary">{userName}</span>!
              </>
            ) : (
              <>
                Seja <span className="text-primary">Bem-vindo</span>!
              </>
            )}
          </h1>

          <p className="text-lg text-gray-300 mb-8 max-w-2xl">
            Continue sua jornada de aprendizado com {professionalName}. 
            Explore os conteúdos exclusivos preparados especialmente para você.
          </p>

          {/* Stats */}
          <div className="flex flex-wrap gap-6 mb-8">
            <div className="flex items-center gap-3 bg-gray-900/50 backdrop-blur-sm rounded-xl px-4 py-3 border border-gray-800">
              <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
                <BookOpen className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-xl font-bold text-white">{totalLessons}</p>
                <p className="text-xs text-gray-400">Aulas Disponíveis</p>
              </div>
            </div>

            <div className="flex items-center gap-3 bg-gray-900/50 backdrop-blur-sm rounded-xl px-4 py-3 border border-gray-800">
              <div className="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center">
                <Trophy className="w-5 h-5 text-green-500" />
              </div>
              <div>
                <p className="text-xl font-bold text-white">{completedLessons}</p>
                <p className="text-xs text-gray-400">Aulas Concluídas</p>
              </div>
            </div>

            <div className="flex items-center gap-3 bg-gray-900/50 backdrop-blur-sm rounded-xl px-4 py-3 border border-gray-800">
              <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center">
                <Clock className="w-5 h-5 text-purple-500" />
              </div>
              <div>
                <p className="text-xl font-bold text-white">{overallProgress}%</p>
                <p className="text-xs text-gray-400">Progresso Total</p>
              </div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="max-w-lg mb-8">
            <div className="flex items-center justify-between text-sm mb-2">
              <span className="text-gray-400">Seu progresso geral</span>
              <span className="text-primary font-medium">{overallProgress}% completo</span>
            </div>
            <Progress value={overallProgress} className="h-3 bg-gray-800" />
          </div>

          {/* Continue Button */}
          {continueModule && (
            <Button
              size="lg"
              className="bg-primary hover:bg-primary/90 text-white px-8 py-6 text-lg rounded-xl shadow-lg shadow-primary/25 group"
              onClick={() => onContinue(continueModule.id)}
            >
              <Play className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform" />
              Continuar Assistindo
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default StudentHero;
