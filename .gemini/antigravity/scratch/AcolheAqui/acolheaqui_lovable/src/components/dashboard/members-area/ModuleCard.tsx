import { useState } from "react";
import { Play, Lock, Clock, Video, Edit, Trash2, MoreVertical, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import type { Module } from "@/hooks/useMemberModules";

interface ModuleCardProps {
  module: Module;
  index: number;
  onEdit: () => void;
  onDelete: () => void;
  onView: () => void;
}

const formatDuration = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  if (mins >= 60) {
    const hours = Math.floor(mins / 60);
    const remainingMins = mins % 60;
    return `${hours}h ${remainingMins}min`;
  }
  return `${mins}min`;
};

const ModuleCard = ({ module, index, onEdit, onDelete, onView }: ModuleCardProps) => {
  const [isHovered, setIsHovered] = useState(false);

  const totalDuration = module.lessons.reduce((acc, l) => acc + l.durationSeconds, 0);
  const lessonsCount = module.lessons.length;

  const [imageError, setImageError] = useState(false);

  return (
    <div
      className="group relative aspect-[3/4] rounded-xl overflow-hidden cursor-pointer transition-all duration-500"
      style={{
        animationDelay: `${index * 100}ms`,
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Background - Gradient Fallback */}
      {(!module.thumbnailUrl || imageError) && (
        <div 
          className="absolute inset-0 z-0"
          style={{
            background: "linear-gradient(135deg, hsl(var(--primary)/0.3) 0%, hsl(var(--primary)/0.1) 100%)",
          }}
        />
      )}
      
      {/* Thumbnail Image */}
      {module.thumbnailUrl && !imageError && (
        <div
          className={cn(
            "absolute inset-0 z-0 overflow-hidden transition-transform duration-700",
            isHovered && "scale-[1.03]"
          )}
        >
          <img
            src={module.thumbnailUrl}
            alt={module.title}
            className="absolute inset-0 h-full w-full object-cover"
            style={{ 
              objectPosition: module.thumbnailFocus === 'top' ? 'center top' : 
                               module.thumbnailFocus === 'bottom' ? 'center bottom' : 
                               'center center' 
            }}
            loading="lazy"
            onError={() => setImageError(true)}
          />
        </div>
      )}

      {/* Gradient Overlay */}
      <div
        className={cn(
          "absolute inset-0 transition-opacity duration-500",
          "bg-gradient-to-t from-black via-black/60 to-transparent",
          isHovered && "opacity-90"
        )}
      />

      {/* Red/Purple Accent Glow */}
      <div
        className={cn(
          "absolute inset-0 opacity-0 transition-opacity duration-500",
          "bg-gradient-to-br from-primary/40 via-transparent to-primary/20",
          isHovered && "opacity-100"
        )}
      />

      {/* Status Badge */}
      <div className="absolute top-3 right-3 z-10">
        {module.isPublished ? (
          <Badge className="bg-green-500/90 hover:bg-green-500 text-white text-xs">
            Publicado
          </Badge>
        ) : (
          <Badge variant="secondary" className="bg-gray-800/90 text-gray-300 text-xs">
            <Lock className="w-3 h-3 mr-1" />
            Rascunho
          </Badge>
        )}
      </div>

      {/* Module Order Badge */}
      <div className="absolute top-3 left-3 z-10">
        <div className="w-8 h-8 rounded-lg bg-primary/90 flex items-center justify-center">
          <span className="text-white text-sm font-bold">{index + 1}</span>
        </div>
      </div>

      {/* Content */}
      <div className="absolute inset-x-0 bottom-0 p-4 z-10">
        {/* Play Button on Hover */}
        <div
          className={cn(
            "absolute -top-12 left-1/2 -translate-x-1/2 transition-all duration-300",
            isHovered ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
          )}
        >
          <button
            className="w-14 h-14 rounded-full bg-primary flex items-center justify-center shadow-lg shadow-primary/50 hover:scale-110 transition-transform"
            onClick={onView}
          >
            <Play className="w-6 h-6 text-white fill-white ml-1" />
          </button>
        </div>

        {/* Module Title */}
        <h3 className="text-white font-bold text-lg mb-2 line-clamp-2 group-hover:text-primary transition-colors">
          {module.title}
        </h3>

        {/* Description - Shows on hover */}
        <p
          className={cn(
            "text-gray-300 text-sm mb-3 line-clamp-2 transition-all duration-300",
            isHovered ? "opacity-100 max-h-20" : "opacity-0 max-h-0 overflow-hidden"
          )}
        >
          {module.description || "Sem descrição"}
        </p>

        {/* Meta Info */}
        <div className="flex items-center gap-3 text-gray-400 text-xs">
          <div className="flex items-center gap-1">
            <Video className="w-3.5 h-3.5" />
            <span>{lessonsCount} aulas</span>
          </div>
          <div className="flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" />
            <span>{formatDuration(totalDuration)}</span>
          </div>
        </div>

        {/* Actions on Hover */}
        <div
          className={cn(
            "flex items-center gap-2 mt-3 transition-all duration-300",
            isHovered ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
          )}
        >
          <Button
            size="sm"
            variant="secondary"
            className="flex-1 bg-white/10 hover:bg-white/20 text-white text-xs"
            onClick={(e) => {
              e.stopPropagation();
              onEdit();
            }}
          >
            <Edit className="w-3.5 h-3.5 mr-1" />
            Editar
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                size="sm"
                variant="ghost"
                className="text-white hover:bg-white/10"
                onClick={(e) => e.stopPropagation()}
              >
                <MoreVertical className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-gray-900 border-gray-800">
              <DropdownMenuItem
                className="text-gray-300 hover:text-white focus:text-white focus:bg-gray-800"
                onClick={onView}
              >
                <Eye className="w-4 h-4 mr-2" />
                Visualizar
              </DropdownMenuItem>
              <DropdownMenuItem
                className="text-red-400 hover:text-red-300 focus:text-red-300 focus:bg-gray-800"
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete();
                }}
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Excluir
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  );
};

export default ModuleCard;
