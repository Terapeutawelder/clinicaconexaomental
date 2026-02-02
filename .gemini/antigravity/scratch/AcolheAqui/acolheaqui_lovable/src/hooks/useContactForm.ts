import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { z } from "zod";

const contactSchema = z.object({
  name: z.string().trim().min(2, "Nome deve ter pelo menos 2 caracteres").max(100, "Nome muito longo"),
  email: z.string().trim().email("E-mail inválido").max(255, "E-mail muito longo"),
  phone: z.string().optional().transform(val => val?.replace(/\D/g, '')),
  message: z.string().trim().min(10, "Mensagem deve ter pelo menos 10 caracteres").max(2000, "Mensagem muito longa"),
});

interface ContactFormData {
  name: string;
  email: string;
  phone: string;
  message: string;
}

interface UseContactFormProps {
  professionalId: string;
}

export const useContactForm = ({ professionalId }: UseContactFormProps) => {
  const [formData, setFormData] = useState<ContactFormData>({
    name: "",
    email: "",
    phone: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Partial<ContactFormData>>({});

  const updateField = (field: keyof ContactFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const validateForm = (): boolean => {
    try {
      contactSchema.parse(formData);
      setErrors({});
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        const newErrors: Partial<ContactFormData> = {};
        error.errors.forEach(err => {
          const field = err.path[0] as keyof ContactFormData;
          newErrors[field] = err.message;
        });
        setErrors(newErrors);
      }
      return false;
    }
  };

  const submitForm = async (): Promise<boolean> => {
    if (!validateForm()) {
      return false;
    }

    setIsSubmitting(true);

    try {
      const { data, error } = await supabase.functions.invoke("send-contact-message", {
        body: {
          professionalId,
          name: formData.name.trim(),
          email: formData.email.trim(),
          phone: formData.phone,
          message: formData.message.trim(),
        },
      });

      if (error) {
        console.error("Error sending contact message:", error);
        toast.error("Erro ao enviar mensagem. Tente novamente.");
        return false;
      }

      toast.success("Mensagem enviada com sucesso! O profissional entrará em contato em breve.");
      
      // Reset form
      setFormData({
        name: "",
        email: "",
        phone: "",
        message: "",
      });

      return true;
    } catch (error) {
      console.error("Error submitting contact form:", error);
      toast.error("Erro ao enviar mensagem. Tente novamente.");
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    formData,
    updateField,
    errors,
    isSubmitting,
    submitForm,
  };
};
