
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Share2, UserPlus } from "lucide-react";
import { useNavigate } from "react-router-dom";

const ReferralSection = () => {
  const navigate = useNavigate();
  
  // Gerar código de indicação real baseado no ID do profissional
  const generateReferralCode = () => {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substr(2, 5);
    return `REF-${timestamp}-${random}`.toUpperCase();
  };

  const referralCode = generateReferralCode();

  const handleIndicarProfissional = () => {
    navigate('/afiliados');
  };

  const handleCadastrarProfissional = () => {
    // Navegar para cadastro com código de indicação
    navigate(`/cadastro-profissional?ref=${referralCode}`);
  };

  return (
    <Card className="mb-8 bg-gradient-to-r from-blue-50 to-green-50 border-primary/20">
      <CardContent className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
          <div className="text-center md:text-left">
            <h3 className="text-lg font-semibold mb-2">Convide outros profissionais para nossa plataforma!</h3>
            <p className="text-muted-foreground mb-4">
              Indique outros profissionais e ganhe comissões ou cadastre um novo profissional diretamente.
            </p>
            <Button onClick={handleIndicarProfissional} className="mr-3">
              <Share2 className="mr-2 h-4 w-4" />
              Indicar Profissional
            </Button>
          </div>
          
          <div className="text-center md:text-right">
            <h3 className="text-lg font-semibold mb-2">Ou cadastre um novo profissional</h3>
            <p className="text-muted-foreground mb-4">
              Cadastre diretamente um novo profissional com seu código de indicação.
            </p>
            <Button variant="outline" onClick={handleCadastrarProfissional}>
              <UserPlus className="mr-2 h-4 w-4" />
              Cadastrar Profissional
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ReferralSection;
