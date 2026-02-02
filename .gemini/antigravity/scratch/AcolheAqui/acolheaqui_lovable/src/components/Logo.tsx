import { Brain } from "lucide-react";

interface LogoProps {
  className?: string;
  size?: "sm" | "md" | "lg";
  variant?: "default" | "light";
  colorScheme?: "default" | "amber" | "gradient";
}

const Logo = ({ className = "", size = "md", variant = "default", colorScheme = "default" }: LogoProps) => {
  const sizeClasses = {
    sm: "text-xl",
    md: "text-2xl",
    lg: "text-4xl",
  };

  const iconSizes = {
    sm: 20,
    md: 28,
    lg: 40,
  };

  // Esquemas de cores para "Acolhe"
  const acolheColors = {
    default: "text-white", // Branco (padrão)
    amber: "text-amber-500", // Dourado/âmbar elegante
    gradient: "text-purple-300", // Lilás claro para gradiente
  };

  // "Aqui" sempre em roxo primary
  const aquiColor = "text-primary";

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <Brain className="text-primary animate-pulse" size={iconSizes[size]} strokeWidth={2} />
      <span className={`font-bold ${sizeClasses[size]}`}>
        <span className={acolheColors[colorScheme]}>{colorScheme === "gradient" ? "Acolhe" : "Acolhe"}</span>
        <span className={aquiColor}>Aqui</span>
      </span>
    </div>
  );
};

export default Logo;
