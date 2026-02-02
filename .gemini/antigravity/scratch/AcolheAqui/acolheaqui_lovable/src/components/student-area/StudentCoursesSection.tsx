import { useState } from "react";
import { 
  BookOpen, 
  Play, 
  Clock, 
  CheckCircle,
  Filter,
  Grid3X3,
  List,
  Search,
  Star,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

interface Module {
  id: string;
  title: string;
  description: string | null;
  thumbnailUrl: string | null;
  lessonsCount: number;
}

interface StudentCoursesSectionProps {
  modules: Module[];
  onSelectModule: (moduleId: string) => void;
  completedLessons: Set<string>;
}

const StudentCoursesSection = ({
  modules,
  onSelectModule,
  completedLessons,
}: StudentCoursesSectionProps) => {
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [searchQuery, setSearchQuery] = useState("");
  const [filter, setFilter] = useState<"all" | "in-progress" | "completed">("all");

  const filteredModules = modules.filter((module) => {
    const matchesSearch = module.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      module.description?.toLowerCase().includes(searchQuery.toLowerCase());
    
    // For now, simple filter - you can enhance this with actual progress tracking
    return matchesSearch;
  });

  const gradients = [
    "from-primary via-primary/60 to-purple-900",
    "from-purple-600 via-purple-600/60 to-blue-900",
    "from-blue-600 via-blue-600/60 to-cyan-900",
    "from-pink-600 via-pink-600/60 to-rose-900",
    "from-teal-600 via-teal-600/60 to-emerald-900",
    "from-orange-600 via-orange-600/60 to-amber-900",
  ];

  return (
    <div className="max-w-6xl mx-auto py-8 px-4">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary mb-4">
            <BookOpen className="w-4 h-4" />
            <span className="text-sm font-medium">Meus Cursos</span>
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">
            Biblioteca de Conteúdos
          </h1>
          <p className="text-gray-400">
            Explore todos os módulos e aulas disponíveis para você
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <Input
              placeholder="Buscar..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 bg-gray-900/50 border-gray-800 w-64"
            />
          </div>

          {/* View Toggle */}
          <div className="flex items-center bg-gray-900/50 rounded-lg p-1 border border-gray-800">
            <Button
              variant="ghost"
              size="icon"
              className={cn(
                "w-8 h-8",
                viewMode === "grid" ? "bg-gray-800 text-white" : "text-gray-500"
              )}
              onClick={() => setViewMode("grid")}
            >
              <Grid3X3 className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className={cn(
                "w-8 h-8",
                viewMode === "list" ? "bg-gray-800 text-white" : "text-gray-500"
              )}
              onClick={() => setViewMode("list")}
            >
              <List className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 mb-6">
        {[
          { id: "all", label: "Todos", count: modules.length },
          { id: "in-progress", label: "Em Progresso", count: 0 },
          { id: "completed", label: "Concluídos", count: 0 },
        ].map((tab) => (
          <Button
            key={tab.id}
            variant="ghost"
            size="sm"
            className={cn(
              "rounded-full px-4",
              filter === tab.id
                ? "bg-primary/10 text-primary hover:bg-primary/20"
                : "text-gray-400 hover:text-white"
            )}
            onClick={() => setFilter(tab.id as any)}
          >
            {tab.label}
            <Badge 
              variant="secondary" 
              className={cn(
                "ml-2 text-xs",
                filter === tab.id ? "bg-primary/20 text-primary" : "bg-gray-800 text-gray-400"
              )}
            >
              {tab.count}
            </Badge>
          </Button>
        ))}
      </div>

      {/* Content Grid/List */}
      {filteredModules.length > 0 ? (
        viewMode === "grid" ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredModules.map((module, index) => (
              <ModuleGridCard
                key={module.id}
                module={module}
                index={index}
                gradient={gradients[index % gradients.length]}
                onClick={() => onSelectModule(module.id)}
              />
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredModules.map((module, index) => (
              <ModuleListCard
                key={module.id}
                module={module}
                index={index}
                gradient={gradients[index % gradients.length]}
                onClick={() => onSelectModule(module.id)}
              />
            ))}
          </div>
        )
      ) : (
        <div className="text-center py-16">
          <div className="w-16 h-16 rounded-full bg-gray-800 flex items-center justify-center mx-auto mb-4">
            <BookOpen className="w-8 h-8 text-gray-600" />
          </div>
          <h3 className="text-lg font-medium text-gray-400 mb-2">
            {searchQuery ? "Nenhum resultado encontrado" : "Nenhum curso disponível"}
          </h3>
          <p className="text-sm text-gray-500">
            {searchQuery 
              ? "Tente buscar por outro termo" 
              : "Novos cursos serão adicionados em breve"
            }
          </p>
        </div>
      )}
    </div>
  );
};

interface ModuleCardProps {
  module: Module;
  index: number;
  gradient: string;
  onClick: () => void;
}

const ModuleGridCard = ({ module, index, gradient, onClick }: ModuleCardProps) => {
  const [isHovered, setIsHovered] = useState(false);
  const [imageError, setImageError] = useState(false);
  const estimatedHours = Math.ceil((module.lessonsCount * 30) / 60);

  return (
    <div
      className={cn(
        "relative rounded-2xl overflow-hidden cursor-pointer group transition-all duration-300",
        isHovered && "scale-[1.02] z-10"
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onClick}
    >
      <div className="aspect-[4/3] relative">
        {/* Background */}
        {module.thumbnailUrl && !imageError ? (
          <>
            <img
              src={module.thumbnailUrl}
              alt={module.title}
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              onError={() => setImageError(true)}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-gray-950 via-gray-950/60 to-gray-950/20" />
          </>
        ) : (
          <div className={cn("absolute inset-0 bg-gradient-to-br", gradient)}>
            <div className="absolute inset-0 bg-gradient-to-t from-gray-950 via-transparent to-transparent" />
          </div>
        )}

        {/* Module Badge */}
        <div className="absolute top-3 left-3 z-10">
          <Badge className="bg-black/60 backdrop-blur-sm text-white text-xs border-0">
            Módulo {index + 1}
          </Badge>
        </div>

        {/* Play Button */}
        <div
          className={cn(
            "absolute inset-0 flex items-center justify-center transition-all duration-300",
            isHovered ? "opacity-100" : "opacity-0"
          )}
        >
          <div className="w-14 h-14 rounded-full bg-white/95 flex items-center justify-center shadow-2xl transform transition-all duration-300 group-hover:scale-110">
            <Play className="w-6 h-6 text-gray-900 ml-1" fill="currentColor" />
          </div>
        </div>

        {/* Content */}
        <div className="absolute bottom-0 left-0 right-0 p-4 z-10">
          <h3 className="text-lg font-bold text-white mb-2 line-clamp-2">
            {module.title}
          </h3>
          
          {module.description && (
            <p className="text-sm text-gray-300 line-clamp-2 mb-3">
              {module.description}
            </p>
          )}

          <div className="flex items-center gap-3 text-xs text-gray-400">
            <div className="flex items-center gap-1">
              <BookOpen className="w-3.5 h-3.5" />
              <span>{module.lessonsCount} aulas</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              <span>{estimatedHours}h</span>
            </div>
          </div>
        </div>

        {/* Border Effect */}
        <div
          className={cn(
            "absolute inset-0 rounded-2xl border-2 transition-all duration-300 pointer-events-none",
            isHovered ? "border-primary shadow-xl shadow-primary/20" : "border-transparent"
          )}
        />
      </div>
    </div>
  );
};

const ModuleListCard = ({ module, index, gradient, onClick }: ModuleCardProps) => {
  const [imageError, setImageError] = useState(false);
  const estimatedHours = Math.ceil((module.lessonsCount * 30) / 60);

  return (
    <div
      className="flex items-center gap-4 p-4 rounded-xl bg-gray-900/50 border border-gray-800 hover:bg-gray-900/70 hover:border-gray-700 transition-all cursor-pointer group"
      onClick={onClick}
    >
      {/* Thumbnail */}
      <div className="relative w-32 h-20 rounded-lg overflow-hidden flex-shrink-0">
        {module.thumbnailUrl && !imageError ? (
          <img
            src={module.thumbnailUrl}
            alt={module.title}
            className="w-full h-full object-cover"
            onError={() => setImageError(true)}
          />
        ) : (
          <div className={cn("w-full h-full bg-gradient-to-br", gradient)} />
        )}
        <div className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity">
          <Play className="w-6 h-6 text-white" fill="currentColor" />
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <Badge variant="outline" className="border-gray-700 text-gray-400 text-xs">
            Módulo {index + 1}
          </Badge>
        </div>
        <h3 className="font-semibold text-white truncate">{module.title}</h3>
        {module.description && (
          <p className="text-sm text-gray-500 line-clamp-1">{module.description}</p>
        )}
      </div>

      {/* Stats */}
      <div className="flex items-center gap-4 text-sm text-gray-500">
        <div className="flex items-center gap-1">
          <BookOpen className="w-4 h-4" />
          <span>{module.lessonsCount}</span>
        </div>
        <div className="flex items-center gap-1">
          <Clock className="w-4 h-4" />
          <span>{estimatedHours}h</span>
        </div>
      </div>

      {/* Arrow */}
      <div className="text-gray-600 group-hover:text-primary transition-colors">
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </div>
    </div>
  );
};

export default StudentCoursesSection;
