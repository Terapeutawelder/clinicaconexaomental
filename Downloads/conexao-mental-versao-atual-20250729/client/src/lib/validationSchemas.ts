import { z } from 'zod';

// CPF validation function
const validateCPF = (cpf: string): boolean => {
  // Remove dots, hyphens and spaces
  const cleanCPF = cpf.replace(/[^\d]/g, '');
  
  // Check if has 11 digits
  if (cleanCPF.length !== 11) return false;
  
  // Check if all digits are the same
  if (/^(\d)\1{10}$/.test(cleanCPF)) return false;
  
  // Calculate verification digits
  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += parseInt(cleanCPF.charAt(i)) * (10 - i);
  }
  let firstDigit = 11 - (sum % 11);
  if (firstDigit >= 10) firstDigit = 0;
  
  sum = 0;
  for (let i = 0; i < 10; i++) {
    sum += parseInt(cleanCPF.charAt(i)) * (11 - i);
  }
  let secondDigit = 11 - (sum % 11);
  if (secondDigit >= 10) secondDigit = 0;
  
  return firstDigit === parseInt(cleanCPF.charAt(9)) && 
         secondDigit === parseInt(cleanCPF.charAt(10));
};

// Phone validation (Brazilian format)
const phoneRegex = /^(?:\+55\s?)?(?:\(?[1-9][1-9]\)?\s?)?(?:9\s?)?[0-9]{4}-?[0-9]{4}$/;

// Strong password validation
const passwordSchema = z.string()
  .min(8, "Senha deve ter pelo menos 8 caracteres")
  .regex(/[A-Z]/, "Senha deve conter pelo menos uma letra maiúscula")
  .regex(/[a-z]/, "Senha deve conter pelo menos uma letra minúscula")
  .regex(/\d/, "Senha deve conter pelo menos um número")
  .regex(/[^A-Za-z0-9]/, "Senha deve conter pelo menos um caractere especial");

// User authentication schemas
export const signUpSchema = z.object({
  email: z.string()
    .email("Email inválido")
    .max(255, "Email muito longo"),
  password: passwordSchema,
  full_name: z.string()
    .min(2, "Nome deve ter pelo menos 2 caracteres")
    .max(100, "Nome muito longo")
    .regex(/^[A-Za-zÀ-ÿ\s]+$/, "Nome deve conter apenas letras e espaços"),
  role: z.enum(['patient', 'professional'], {
    required_error: "Tipo de usuário é obrigatório"
  })
});

export const signInSchema = z.object({
  email: z.string().email("Email inválido"),
  password: z.string().min(1, "Senha é obrigatória")
});

export const resetPasswordSchema = z.object({
  email: z.string().email("Email inválido")
});

// Professional registration schema
export const professionalRegistrationSchema = z.object({
  // Personal data
  name: z.string()
    .min(2, "Nome deve ter pelo menos 2 caracteres")
    .max(100, "Nome muito longo")
    .regex(/^[A-Za-zÀ-ÿ\s]+$/, "Nome deve conter apenas letras e espaços"),
  email: z.string()
    .email("Email inválido")
    .max(255, "Email muito longo"),
  cpf: z.string()
    .refine(validateCPF, "CPF inválido"),
  phone: z.string()
    .regex(phoneRegex, "Telefone inválido")
    .optional(),
  
  // Professional data
  registrationNumber: z.string()
    .min(1, "Número de registro é obrigatório")
    .max(20, "Número de registro muito longo")
    .regex(/^[A-Za-z0-9/-]+$/, "Número de registro deve conter apenas letras, números, / e -"),
  specialties: z.array(z.string()).min(1, "Selecione pelo menos uma especialidade"),
  bio: z.string()
    .max(1000, "Biografia muito longa")
    .optional(),
  hourlyRate: z.number()
    .min(0, "Valor deve ser positivo")
    .max(9999.99, "Valor muito alto")
    .optional(),
  
  // Address data
  cep: z.string()
    .regex(/^\d{5}-?\d{3}$/, "CEP inválido"),
  street: z.string()
    .min(1, "Rua é obrigatória")
    .max(200, "Rua muito longa"),
  number: z.string()
    .min(1, "Número é obrigatório")
    .max(10, "Número muito longo"),
  complement: z.string()
    .max(100, "Complemento muito longo")
    .optional(),
  neighborhood: z.string()
    .min(1, "Bairro é obrigatório")
    .max(100, "Bairro muito longo"),
  city: z.string()
    .min(1, "Cidade é obrigatória")
    .max(100, "Cidade muito longa"),
  state: z.string()
    .length(2, "Estado deve ter 2 caracteres"),
  
  // Password and confirmations
  password: passwordSchema,
  confirmPassword: z.string(),
  acceptedContract: z.boolean().refine(val => val, "Você deve aceitar o contrato"),
  acceptedTerms: z.boolean().refine(val => val, "Você deve aceitar os termos de uso"),
  acceptedPrivacy: z.boolean().refine(val => val, "Você deve aceitar a política de privacidade")
}).refine(
  (data) => data.password === data.confirmPassword,
  {
    message: "Senhas não coincidem",
    path: ["confirmPassword"]
  }
);

// Patient appointment booking schema
export const appointmentBookingSchema = z.object({
  patientName: z.string()
    .min(2, "Nome deve ter pelo menos 2 caracteres")
    .max(100, "Nome muito longo")
    .regex(/^[A-Za-zÀ-ÿ\s]+$/, "Nome deve conter apenas letras e espaços"),
  patientEmail: z.string()
    .email("Email inválido")
    .max(255, "Email muito longo"),
  patientPhone: z.string()
    .regex(phoneRegex, "Telefone inválido"),
  preferredDate: z.string()
    .min(1, "Data é obrigatória"),
  preferredTime: z.string()
    .min(1, "Horário é obrigatório"),
  professionalId: z.string()
    .min(1, "Profissional é obrigatório"),
  notes: z.string()
    .max(500, "Observações muito longas")
    .optional()
});

// Contact form schema
export const contactFormSchema = z.object({
  name: z.string()
    .min(2, "Nome deve ter pelo menos 2 caracteres")
    .max(100, "Nome muito longo")
    .regex(/^[A-Za-zÀ-ÿ\s]+$/, "Nome deve conter apenas letras e espaços"),
  email: z.string()
    .email("Email inválido")
    .max(255, "Email muito longo"),
  phone: z.string()
    .regex(phoneRegex, "Telefone inválido")
    .optional(),
  subject: z.string()
    .min(1, "Assunto é obrigatório")
    .max(200, "Assunto muito longo"),
  message: z.string()
    .min(10, "Mensagem deve ter pelo menos 10 caracteres")
    .max(1000, "Mensagem muito longa")
});

// Profile update schema
export const profileUpdateSchema = z.object({
  full_name: z.string()
    .min(2, "Nome deve ter pelo menos 2 caracteres")
    .max(100, "Nome muito longo")
    .regex(/^[A-Za-zÀ-ÿ\s]+$/, "Nome deve conter apenas letras e espaços"),
  phone: z.string()
    .regex(phoneRegex, "Telefone inválido")
    .optional()
});

// Generic sanitization function
export const sanitizeInput = (input: string): string => {
  return input
    .trim()
    .replace(/[<>'"]/g, '') // Remove potentially dangerous characters
    .substring(0, 1000); // Limit length
};

// Export types for TypeScript
export type SignUpFormData = z.infer<typeof signUpSchema>;
export type SignInFormData = z.infer<typeof signInSchema>;
export type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;
export type ProfessionalRegistrationFormData = z.infer<typeof professionalRegistrationSchema>;
export type AppointmentBookingFormData = z.infer<typeof appointmentBookingSchema>;
export type ContactFormData = z.infer<typeof contactFormSchema>;
export type ProfileUpdateFormData = z.infer<typeof profileUpdateSchema>;