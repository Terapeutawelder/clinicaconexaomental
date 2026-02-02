import { useEffect, useState, useCallback } from "react";
import { ShoppingBag, X } from "lucide-react";

interface Sale {
  id: string;
  name: string;
  location: string;
  product: string;
  timeAgo: string;
}

// Nomes brasileiros aleatórios para simulação
const firstNames = [
  "Ana", "Maria", "João", "Pedro", "Lucas", "Fernanda", "Juliana", "Carlos", 
  "Marcos", "Patricia", "Rafael", "Camila", "Bruno", "Amanda", "Felipe",
  "Larissa", "Rodrigo", "Beatriz", "Thiago", "Vanessa", "Gustavo", "Letícia"
];

const cities = [
  "São Paulo, SP", "Rio de Janeiro, RJ", "Belo Horizonte, MG", "Curitiba, PR",
  "Porto Alegre, RS", "Salvador, BA", "Brasília, DF", "Fortaleza, CE",
  "Recife, PE", "Campinas, SP", "Goiânia, GO", "Manaus, AM", "Florianópolis, SC"
];

const timeAgoOptions = [
  "agora mesmo", "há 1 minuto", "há 2 minutos", "há 3 minutos", 
  "há 5 minutos", "há 8 minutos", "há 10 minutos"
];

interface SalesNotificationProps {
  productName?: string;
  accentColor?: string;
  enabled?: boolean;
}

export const SalesNotification = ({ 
  productName = "este serviço",
  accentColor = "#5521ea",
  enabled = true 
}: SalesNotificationProps) => {
  const [currentNotification, setCurrentNotification] = useState<Sale | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [isExiting, setIsExiting] = useState(false);

  const generateRandomSale = useCallback((): Sale => {
    const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
    const lastName = firstName.charAt(0) + ".";
    const city = cities[Math.floor(Math.random() * cities.length)];
    const timeAgo = timeAgoOptions[Math.floor(Math.random() * timeAgoOptions.length)];

    return {
      id: `sale-${Date.now()}`,
      name: `${firstName} ${lastName}`,
      location: city,
      product: productName,
      timeAgo
    };
  }, [productName]);

  const hideNotification = useCallback(() => {
    setIsExiting(true);
    setTimeout(() => {
      setIsVisible(false);
      setIsExiting(false);
      setCurrentNotification(null);
    }, 300);
  }, []);

  const showNotification = useCallback(() => {
    if (isVisible) return;
    
    const sale = generateRandomSale();
    setCurrentNotification(sale);
    setIsVisible(true);

    // Auto-hide after 5 seconds
    setTimeout(() => {
      hideNotification();
    }, 5000);
  }, [isVisible, generateRandomSale, hideNotification]);

  useEffect(() => {
    if (!enabled) return;

    // Show first notification after 3-8 seconds
    const initialDelay = 3000 + Math.random() * 5000;
    const initialTimeout = setTimeout(showNotification, initialDelay);

    // Then show notifications every 15-30 seconds
    const interval = setInterval(() => {
      const shouldShow = Math.random() > 0.3; // 70% chance
      if (shouldShow) {
        showNotification();
      }
    }, 15000 + Math.random() * 15000);

    return () => {
      clearTimeout(initialTimeout);
      clearInterval(interval);
    };
  }, [enabled, showNotification]);

  if (!enabled || !isVisible || !currentNotification) return null;

  return (
    <div 
      className={`fixed bottom-4 left-4 z-50 max-w-xs w-full transition-all duration-300 ${
        isExiting 
          ? 'opacity-0 translate-y-2 scale-95' 
          : 'opacity-100 translate-y-0 scale-100'
      }`}
      style={{ animation: isExiting ? '' : 'slideInUp 0.3s ease-out' }}
    >
      <style>{`
        @keyframes slideInUp {
          from {
            opacity: 0;
            transform: translateY(20px) scale(0.95);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
        @keyframes pulse-ring {
          0% {
            transform: scale(0.8);
            opacity: 1;
          }
          100% {
            transform: scale(1.3);
            opacity: 0;
          }
        }
      `}</style>
      
      <div className="bg-white rounded-xl shadow-2xl border border-gray-100 overflow-hidden">
        {/* Progress bar */}
        <div 
          className="h-1 animate-pulse"
          style={{ 
            background: `linear-gradient(90deg, ${accentColor}, ${accentColor}80)`,
            animation: 'shrink 5s linear forwards'
          }}
        />
        <style>{`
          @keyframes shrink {
            from { width: 100%; }
            to { width: 0%; }
          }
        `}</style>
        
        <div className="p-3 flex items-start gap-3">
          {/* Icon with pulse */}
          <div className="relative flex-shrink-0">
            <div 
              className="w-10 h-10 rounded-full flex items-center justify-center"
              style={{ backgroundColor: `${accentColor}15` }}
            >
              <ShoppingBag className="w-5 h-5" style={{ color: accentColor }} />
            </div>
            <span 
              className="absolute -top-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white"
              style={{ backgroundColor: '#22c55e' }}
            />
          </div>
          
          {/* Content */}
          <div className="flex-1 min-w-0">
            <p className="text-sm text-gray-800">
              <span className="font-semibold">{currentNotification.name}</span>
              {" "}comprou
            </p>
            <p 
              className="text-sm font-medium truncate"
              style={{ color: accentColor }}
            >
              {currentNotification.product}
            </p>
            <p className="text-xs text-gray-500 mt-0.5 flex items-center gap-1">
              📍 {currentNotification.location} • {currentNotification.timeAgo}
            </p>
          </div>
          
          {/* Close button */}
          <button 
            onClick={hideNotification}
            className="flex-shrink-0 p-1 rounded-full hover:bg-gray-100 transition-colors"
          >
            <X className="w-4 h-4 text-gray-400" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default SalesNotification;
