import { useState, useEffect } from "react";
import { Award, Download, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { generateCertificatePDF } from "@/lib/generateCertificatePDF";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import type { Module } from "@/hooks/useMemberModules";
import { cn } from "@/lib/utils";

interface CertificateButtonProps {
  module: Module;
  completedLessonsCount: number;
  className?: string;
}

const CertificateButton = ({
  module,
  completedLessonsCount,
  className,
}: CertificateButtonProps) => {
  const { toast } = useToast();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [studentName, setStudentName] = useState("");
  const [professionalName, setProfessionalName] = useState("");

  const totalLessons = module.lessons.length;
  const isComplete = totalLessons > 0 && completedLessonsCount === totalLessons;
  const totalDurationSeconds = module.lessons.reduce((acc, l) => acc + l.durationSeconds, 0);
  const totalDurationHours = totalDurationSeconds / 3600;

  useEffect(() => {
    const fetchNames = async () => {
      // Get current user's name
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: userProfile } = await supabase
          .from("profiles")
          .select("full_name")
          .eq("user_id", user.id)
          .single();
        
        if (userProfile?.full_name) {
          setStudentName(userProfile.full_name);
        } else if (user.email) {
          setStudentName(user.email.split("@")[0]);
        }
      }

      // Get professional's name
      const { data: professionalProfile } = await supabase
        .from("profiles")
        .select("full_name")
        .eq("id", module.professionalId)
        .single();
      
      if (professionalProfile?.full_name) {
        setProfessionalName(professionalProfile.full_name);
      }
    };

    if (isModalOpen) {
      fetchNames();
    }
  }, [isModalOpen, module.professionalId]);

  const handleGenerateCertificate = () => {
    setIsGenerating(true);

    try {
      generateCertificatePDF({
        studentName: studentName || "Aluno",
        moduleTitle: module.title,
        professionalName: professionalName || "Instrutor",
        completionDate: new Date(),
        totalLessons,
        totalDurationHours,
      });

      toast({
        title: "Certificado gerado!",
        description: "O download do seu certificado começou.",
      });

      setIsModalOpen(false);
    } catch (error) {
      console.error("Error generating certificate:", error);
      toast({
        title: "Erro ao gerar certificado",
        description: "Tente novamente mais tarde.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  if (!isComplete) {
    return (
      <Button
        variant="outline"
        size="sm"
        disabled
        className={cn(
          "border-gray-700 text-gray-500 cursor-not-allowed",
          className
        )}
      >
        <Award className="w-4 h-4 mr-2" />
        Certificado ({completedLessonsCount}/{totalLessons})
      </Button>
    );
  }

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsModalOpen(true)}
        className={cn(
          "border-green-600/50 text-green-400 hover:bg-green-600/20 hover:text-green-300",
          className
        )}
      >
        <Award className="w-4 h-4 mr-2" />
        Baixar Certificado
      </Button>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-md bg-gray-900 border-gray-800 text-white">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl">
              <Award className="w-6 h-6 text-green-400" />
              Parabéns!
            </DialogTitle>
            <DialogDescription className="text-gray-400">
              Você completou todas as aulas deste módulo.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* Module Info */}
            <div className="bg-gray-800/50 rounded-xl p-4 space-y-3">
              <h3 className="font-semibold text-white">{module.title}</h3>
              <div className="flex items-center gap-4 text-sm text-gray-400">
                <span>{totalLessons} aulas concluídas</span>
                <span>•</span>
                <span>{totalDurationHours.toFixed(1)}h de conteúdo</span>
              </div>
            </div>

            {/* Certificate Preview */}
            <div className="relative bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl p-6 border border-primary/30 overflow-hidden">
              {/* Decorative elements */}
              <div className="absolute top-2 left-2 w-8 h-8 border-t-2 border-l-2 border-primary/50 rounded-tl-lg" />
              <div className="absolute top-2 right-2 w-8 h-8 border-t-2 border-r-2 border-primary/50 rounded-tr-lg" />
              <div className="absolute bottom-2 left-2 w-8 h-8 border-b-2 border-l-2 border-primary/50 rounded-bl-lg" />
              <div className="absolute bottom-2 right-2 w-8 h-8 border-b-2 border-r-2 border-primary/50 rounded-br-lg" />

              <div className="text-center space-y-2">
                <p className="text-xs text-primary uppercase tracking-wider">Certificado de Conclusão</p>
                <p className="text-lg font-bold text-white">{studentName || "Seu nome"}</p>
                <p className="text-xs text-gray-400">
                  Concluiu: {module.title}
                </p>
                <p className="text-xs text-gray-500">
                  {new Date().toLocaleDateString("pt-BR")}
                </p>
              </div>
            </div>

            {/* Generate Button */}
            <Button
              onClick={handleGenerateCertificate}
              disabled={isGenerating}
              className="w-full bg-green-600 hover:bg-green-700 text-white"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Gerando...
                </>
              ) : (
                <>
                  <Download className="w-4 h-4 mr-2" />
                  Baixar Certificado em PDF
                </>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default CertificateButton;
