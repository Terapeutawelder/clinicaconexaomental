
// Legacy validation hook - deprecated in favor of Zod schemas
// This file is kept for backwards compatibility but should be migrated to use
// the new validation schemas in @/lib/validationSchemas.ts

import { useToast } from "@/hooks/use-toast";

interface FormData {
  name: string;
  email: string;
  cpf: string;
  registrationNumber: string;
  password: string;
  confirmPassword: string;
}

/**
 * @deprecated Use validation schemas from @/lib/validationSchemas.ts instead
 */
export const useFormValidation = () => {
  const { toast } = useToast();

  const validateForm = (
    formData: FormData,
    selectedSpecialties: string[],
    acceptedContract: boolean,
    acceptedTerms: boolean,
    acceptedPrivacy: boolean
  ): boolean => {
    // Basic validation - consider migrating to Zod schemas
    if (!formData.name || !formData.email || !formData.cpf || !formData.registrationNumber || !formData.password || !formData.confirmPassword) {
      toast({
        title: "Erro",
        description: "Por favor, preencha todos os campos obrigatórios.",
        variant: "destructive"
      });
      return false;
    }

    if (formData.password !== formData.confirmPassword) {
      toast({
        title: "Erro",
        description: "As senhas não coincidem.",
        variant: "destructive"
      });
      return false;
    }

    if (formData.password.length < 8) {
      toast({
        title: "Erro",
        description: "A senha deve ter pelo menos 8 caracteres.",
        variant: "destructive"
      });
      return false;
    }

    if (selectedSpecialties.length === 0) {
      toast({
        title: "Erro",
        description: "Selecione pelo menos uma especialidade.",
        variant: "destructive"
      });
      return false;
    }

    if (!acceptedContract || !acceptedTerms || !acceptedPrivacy) {
      toast({
        title: "Erro",
        description: "Você deve aceitar o contrato, termos de uso e política de privacidade.",
        variant: "destructive"
      });
      return false;
    }

    return true;
  };

  return { validateForm };
};
