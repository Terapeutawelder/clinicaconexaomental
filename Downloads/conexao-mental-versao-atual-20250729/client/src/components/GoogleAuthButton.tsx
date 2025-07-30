import { Button } from "@/components/ui/button";

interface GoogleAuthButtonProps {
  text?: string;
  className?: string;
}

export default function GoogleAuthButton({ 
  text = "Continuar com Google", 
  className = "" 
}: GoogleAuthButtonProps) {
  // Temporariamente desabilitado até as credenciais do Google serem configuradas
  return null;
}