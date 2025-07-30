
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Star, Video, Clock, VideoIcon } from "lucide-react";

interface Professional {
  id: string;
  name: string;
  specialty: string;
  experience: string;
  rating?: number;
  image?: string;
  available?: boolean;
  description?: string;
  email: string;
  phone?: string;
  approach?: string;
  approved: boolean;
}

interface ProfessionalCardProps {
  professional: Professional;
  onBook: () => void;
}

const ProfessionalCard = ({ professional, onBook }: ProfessionalCardProps) => {
  return (
    <Card className="h-full hover:shadow-lg transition-all duration-300 hover:-translate-y-1 bg-white">
      <CardHeader className="pb-4 p-3 md:p-6">
        <div className="flex items-start gap-3 md:gap-4">
          <Avatar className="w-12 h-12 md:w-16 md:h-16 flex-shrink-0">
            <AvatarImage src={professional.image} alt={professional.name} />
            <AvatarFallback className="text-sm md:text-lg gradient-bg text-white">
              {professional.name ? professional.name.split(' ').map(n => n[0]).join('') : 'P'}
            </AvatarFallback>
          </Avatar>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-bold text-base md:text-lg text-gray-900 truncate">{professional.name}</h3>
              <Badge variant="secondary" className="text-xs bg-purple-100 text-purple-600 border-purple-200 hidden sm:inline-flex">
                Verificado
              </Badge>
            </div>
            <p className="text-purple-600 font-medium text-xs md:text-sm mb-1">{professional.specialty || 'Especialista em Saúde Mental'}</p>
            <p className="text-xs text-gray-600 mb-2">{professional.experience || 'Profissional experiente'}</p>
            
            <div className="flex items-center gap-3 mb-2">
              <div className="flex items-center gap-1">
                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                <span className="font-medium text-sm">{professional.rating || '4.8'}</span>
                <span className="text-xs text-gray-500 hidden sm:inline">(Avaliações positivas)</span>
              </div>
            </div>

            <div className="flex items-center gap-1 mb-2 hidden sm:flex">
              <VideoIcon className="h-4 w-4 text-gray-400" />
              <span className="text-xs text-gray-600">Meus vídeos de apresentação</span>
            </div>

            <div className="flex flex-wrap gap-1 mb-3">
              {professional.approach && (
                <Badge variant="outline" className="text-xs px-2 py-1 bg-gray-50 border-gray-200 text-gray-700">
                  {professional.approach}
                </Badge>
              )}
              <Badge variant="outline" className="text-xs px-2 py-1 bg-gray-50 border-gray-200 text-gray-700">
                {professional.specialty || 'Terapia Online'}
              </Badge>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="px-6 pb-4">
        <p className="text-sm text-gray-700 leading-relaxed mb-4">
          {professional.description || 'Profissional especializado em atendimento de saúde mental com foco em bem-estar e qualidade de vida dos pacientes.'}
        </p>
        
        <div className="flex items-center text-sm">
          <div className="flex items-center gap-1">
            <Clock className="h-4 w-4 text-gray-400" />
            <span className="text-gray-600">Sessão 50 min</span>
          </div>
        </div>
      </CardContent>

      <CardFooter className="px-6 pt-0">
        <Button 
          onClick={onBook}
          className="w-full bg-purple-600 hover:bg-purple-700 text-white"
          disabled={!professional.approved}
        >
          Selecione uma data
        </Button>
      </CardFooter>
    </Card>
  );
};

export default ProfessionalCard;
