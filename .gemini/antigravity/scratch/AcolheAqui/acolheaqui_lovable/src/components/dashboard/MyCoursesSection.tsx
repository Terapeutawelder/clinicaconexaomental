import { useNavigate } from "react-router-dom";
import { useStudentCourses, StudentCourse } from "@/hooks/useStudentCourses";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  GraduationCap, 
  PlayCircle, 
  Clock, 
  BookOpen,
  ArrowRight,
  Trophy,
  Sparkles
} from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

const CourseCard = ({ course }: { course: StudentCourse }) => {
  const navigate = useNavigate();

  const handleAccess = () => {
    if (course.professionalSlug) {
      navigate(`/area-membros/${course.professionalSlug}`);
    }
  };

  const isCompleted = course.progressPercent === 100;

  return (
    <Card 
      className={`group bg-card border-border/50 overflow-hidden transition-all duration-300 hover:border-primary/50 hover:shadow-lg hover:shadow-primary/5 ${
        !course.isActive ? "opacity-60" : ""
      }`}
    >
      <CardContent className="p-4">
        <div className="flex items-start gap-4">
          {/* Professional Avatar */}
          <Avatar className="h-12 w-12 ring-2 ring-primary/20">
            <AvatarImage src={course.professionalAvatar || undefined} />
            <AvatarFallback className="bg-primary/10 text-primary">
              {course.professionalName.charAt(0)}
            </AvatarFallback>
          </Avatar>

          {/* Course Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h4 className="font-semibold text-foreground truncate">
                {course.professionalName}
              </h4>
              {isCompleted && (
                <Badge className="bg-[hsl(145,70%,45%)]/20 text-[hsl(145,70%,45%)] border-0 shrink-0">
                  <Trophy className="h-3 w-3 mr-1" />
                  Concluído
                </Badge>
              )}
              {!course.isActive && (
                <Badge variant="destructive" className="shrink-0">
                  Expirado
                </Badge>
              )}
            </div>

            {/* Stats */}
            <div className="flex items-center gap-3 text-xs text-muted-foreground mb-3">
              <span className="flex items-center gap-1">
                <BookOpen className="h-3 w-3" />
                {course.totalModules} módulos
              </span>
              <span className="flex items-center gap-1">
                <PlayCircle className="h-3 w-3" />
                {course.totalLessons} aulas
              </span>
              {course.expiresAt && (
                <span className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  Até {format(new Date(course.expiresAt), "dd/MM/yyyy", { locale: ptBR })}
                </span>
              )}
            </div>

            {/* Progress */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">
                  {course.completedLessons} de {course.totalLessons} aulas
                </span>
                <span className="font-medium text-primary">{course.progressPercent}%</span>
              </div>
              <Progress 
                value={course.progressPercent} 
                className="h-1.5 bg-muted"
              />
            </div>
          </div>

          {/* Access Button */}
          <Button
            onClick={handleAccess}
            disabled={!course.isActive}
            size="sm"
            className="shrink-0 group-hover:bg-primary group-hover:text-primary-foreground transition-colors"
            variant={course.isActive ? "outline" : "ghost"}
          >
            {course.isActive ? (
              <>
                Acessar
                <ArrowRight className="h-4 w-4 ml-1 group-hover:translate-x-0.5 transition-transform" />
              </>
            ) : (
              "Indisponível"
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

const MyCoursesSection = () => {
  const { courses, loading } = useStudentCourses();

  // Don't show section if user has no courses
  if (!loading && courses.length === 0) {
    return null;
  }

  return (
    <Card className="bg-card border-border/50 neon-border">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold text-foreground flex items-center gap-2">
            <div className="p-2 rounded-lg bg-primary/10">
              <GraduationCap className="h-5 w-5 text-primary" />
            </div>
            Meus Cursos
            {courses.length > 0 && (
              <Badge variant="secondary" className="ml-2">
                {courses.length}
              </Badge>
            )}
          </CardTitle>
          {courses.filter(c => c.isActive).length > 0 && (
            <div className="flex items-center gap-1 text-xs text-primary">
              <Sparkles className="h-3 w-3" />
              <span>{courses.filter(c => c.isActive).length} ativos</span>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {loading ? (
          <div className="space-y-3">
            {[1, 2].map((i) => (
              <div key={i} className="h-24 rounded-xl bg-muted/50 animate-pulse" />
            ))}
          </div>
        ) : (
          courses.map((course) => (
            <CourseCard key={course.id} course={course} />
          ))
        )}
      </CardContent>
    </Card>
  );
};

export default MyCoursesSection;
