
import { Checkbox } from "@/components/ui/checkbox";
import { Link } from "react-router-dom";
import { FileText, ScrollText, Shield } from "lucide-react";

interface TermsAcceptanceProps {
  acceptedContract: boolean;
  acceptedTerms: boolean;
  acceptedPrivacy: boolean;
  setAcceptedContract: (accepted: boolean) => void;
  setAcceptedTerms: (accepted: boolean) => void;
  setAcceptedPrivacy: (accepted: boolean) => void;
}

const TermsAcceptance = ({
  acceptedContract,
  acceptedTerms,
  acceptedPrivacy,
  setAcceptedContract,
  setAcceptedTerms,
  setAcceptedPrivacy,
}: TermsAcceptanceProps) => {
  return (
    <div className="space-y-4">
      <div className="flex items-start space-x-3">
        <Checkbox 
          id="contract"
          checked={acceptedContract}
          onCheckedChange={(checked) => setAcceptedContract(checked as boolean)}
        />
        <div className="grid gap-1.5 leading-none">
          <label htmlFor="contract" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
            Aceito o contrato de prestação de serviços *
          </label>
          <p className="text-xs text-muted-foreground">
            <Link to="/contrato" className="text-blue-600 hover:underline inline-flex items-center gap-1">
              <FileText className="h-3 w-3" />
              Ler contrato completo
            </Link>
          </p>
        </div>
      </div>

      <div className="flex items-start space-x-3">
        <Checkbox 
          id="terms"
          checked={acceptedTerms}
          onCheckedChange={(checked) => setAcceptedTerms(checked as boolean)}
        />
        <div className="grid gap-1.5 leading-none">
          <label htmlFor="terms" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
            Aceito os termos de uso da plataforma *
          </label>
          <p className="text-xs text-muted-foreground">
            <Link to="/termos-de-uso" className="text-blue-600 hover:underline inline-flex items-center gap-1">
              <ScrollText className="h-3 w-3" />
              Ler termos de uso
            </Link>
          </p>
        </div>
      </div>

      <div className="flex items-start space-x-3">
        <Checkbox 
          id="privacy"
          checked={acceptedPrivacy}
          onCheckedChange={(checked) => setAcceptedPrivacy(checked as boolean)}
        />
        <div className="grid gap-1.5 leading-none">
          <label htmlFor="privacy" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
            Aceito a política de privacidade *
          </label>
          <p className="text-xs text-muted-foreground">
            <Link to="/politica-de-privacidade" className="text-blue-600 hover:underline inline-flex items-center gap-1">
              <Shield className="h-3 w-3" />
              Ler política de privacidade
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default TermsAcceptance;
