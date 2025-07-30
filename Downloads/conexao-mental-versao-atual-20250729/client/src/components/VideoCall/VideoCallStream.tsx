import { Button } from "@/components/ui/button";
import { Phone, VideoOff } from "lucide-react";

interface VideoCallStreamProps {
  isCallActive: boolean;
  isVideoOn: boolean;
  professionalName: string;
  localVideoRef: React.RefObject<HTMLVideoElement>;
  remoteVideoRef: React.RefObject<HTMLVideoElement>;
  handleStartCall: () => void;
}

export const VideoCallStream = ({
  isCallActive,
  isVideoOn,
  professionalName,
  localVideoRef,
  remoteVideoRef,
  handleStartCall
}: VideoCallStreamProps) => {
  return (
    <div className="flex-1 relative bg-gray-900">
      <div className="w-full h-full relative">
        {isCallActive ? (
          <div className="w-full h-full bg-black">
            {/* Tela preta limpa durante a consulta */}
          </div>
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-800">
            <div className="text-center text-white">
              <p className="text-gray-300 mb-4">Aguardando conexão...</p>
              <Button onClick={handleStartCall} className="bg-green-600 hover:bg-green-700">
                <Phone className="mr-2 h-4 w-4" />
                Iniciar Chamada
              </Button>
            </div>
          </div>
        )}

        {/* Vídeo local do usuário */}
        <div className="absolute bottom-4 right-4 w-48 h-36 bg-gray-800 rounded-lg overflow-hidden border-2 border-white">
          {isVideoOn ? (
            <video
              ref={localVideoRef}
              className="w-full h-full object-cover"
              autoPlay
              muted
              playsInline
              onError={(e) => console.error("Erro no vídeo local:", e)}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gray-700">
              <VideoOff className="h-8 w-8 text-gray-400" />
            </div>
          )}
        </div>

        {/* Vídeo remoto do profissional (quando conectado) */}
        {isCallActive && (
          <div className="absolute top-4 left-4 w-48 h-36 bg-gray-800 rounded-lg overflow-hidden border-2 border-green-500">
            <video
              ref={remoteVideoRef}
              className="w-full h-full object-cover"
              autoPlay
              playsInline
              onError={(e) => console.error("Erro no vídeo remoto:", e)}
            />
            <div className="absolute bottom-2 left-2 text-white text-sm bg-black bg-opacity-50 px-2 py-1 rounded">
              {professionalName}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};