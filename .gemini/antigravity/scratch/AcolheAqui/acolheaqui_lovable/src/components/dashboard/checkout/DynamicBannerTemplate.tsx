import { Video, Calendar, Clock, User } from "lucide-react";

interface DynamicBannerTemplateProps {
  professionalName: string;
  professionalAvatar?: string | null;
  serviceName: string;
  serviceDuration: number;
  gradientFrom?: string;
  gradientVia?: string;
  gradientTo?: string;
  textColor?: string;
}

const DynamicBannerTemplate = ({
  professionalName,
  professionalAvatar,
  serviceName,
  serviceDuration,
  gradientFrom = "#9333ea",
  gradientVia = "#7c3aed",
  gradientTo = "#581c87",
  textColor = "#ffffff",
}: DynamicBannerTemplateProps) => {
  const formatDuration = (minutes: number) => {
    if (minutes >= 60) {
      const hours = Math.floor(minutes / 60);
      const remainingMinutes = minutes % 60;
      if (remainingMinutes > 0) {
        return `Sessão de ${hours}h ${remainingMinutes} minutos`;
      }
      return `Sessão de ${hours} hora${hours > 1 ? 's' : ''}`;
    }
    return `Sessão de ${minutes} minutos`;
  };

  const bannerStyle = {
    background: `linear-gradient(to bottom right, ${gradientFrom}, ${gradientVia}, ${gradientTo})`,
  };

  return (
    <div 
      className="relative w-full h-32 rounded-xl overflow-hidden"
      style={bannerStyle}
    >
      {/* Glow effect */}
      <div className="absolute bottom-1/3 left-1/2 -translate-x-1/2 w-32 h-8 bg-yellow-400/30 blur-2xl rounded-full" />
      
      {/* Content Container */}
      <div className="relative z-10 flex items-center h-full px-4 gap-4">
        {/* Avatar Section */}
        <div className="relative flex-shrink-0">
          {professionalAvatar ? (
            <img
              src={professionalAvatar}
              alt={professionalName}
              className="w-24 h-28 object-cover rounded-lg shadow-lg ring-4 ring-white"
            />
          ) : (
            <div className="w-24 h-28 bg-purple-400/30 rounded-lg flex items-center justify-center ring-4 ring-white">
              <User className="w-12 h-12 text-white/50" />
            </div>
          )}
        </div>

        {/* Info Section */}
        <div className="flex-1 flex flex-col justify-center gap-2">
          {/* Service Type Badge */}
          <div className="inline-flex items-center gap-1.5 bg-white rounded-full px-3 py-1 w-fit shadow-md">
            <Video className="w-4 h-4 text-purple-600" />
            <span className="text-sm font-semibold text-gray-800 truncate max-w-[160px]">
              {serviceName}
            </span>
          </div>

          {/* Duration with Clock Icon */}
          <div className="flex items-center gap-1.5" style={{ color: textColor, opacity: 0.9 }}>
            <Clock className="w-4 h-4" />
            <span className="text-sm font-medium">{formatDuration(serviceDuration)}</span>
          </div>

          {/* Professional Name */}
          <h3 
            className="text-lg font-bold truncate max-w-[200px]"
            style={{ color: textColor }}
          >
            {professionalName}
          </h3>
        </div>

        {/* Calendar Icon */}
        <div className="absolute top-2 right-4 flex items-center">
          <div className="relative">
            <Calendar className="w-10 h-10 text-yellow-500 drop-shadow-lg" />
            <Clock className="w-5 h-5 text-green-500 absolute -bottom-1 -right-1 bg-white rounded-full p-0.5 shadow" />
          </div>
        </div>
      </div>

      {/* Decorative sparkle */}
      <div className="absolute top-1/2 right-1/3 text-white/40 text-xl">✦</div>
    </div>
  );
};

export default DynamicBannerTemplate;
