-- Add WhatsApp number field to profiles for AI agent identification
ALTER TABLE public.profiles 
ADD COLUMN whatsapp_number TEXT;

-- Create index for faster lookups by WhatsApp number
CREATE INDEX idx_profiles_whatsapp_number ON public.profiles(whatsapp_number) WHERE whatsapp_number IS NOT NULL;