import { Brain } from "lucide-react";

interface LogoProps {
  className?: string;
  size?: "sm" | "md" | "lg";
  variant?: "default" | "light";
}

const Logo = ({ className = "", size = "md", variant = "default" }: LogoProps) => {
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

  const textColor = variant === "light" ? "text-white" : "text-foreground";

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <Brain className="text-primary" size={iconSizes[size]} strokeWidth={2} />
      <span className={`font-bold ${textColor} ${sizeClasses[size]}`}>
        mindset
      </span>
    </div>
  );
};

export default Logo;
