-- Table for WhatsApp integration settings
CREATE TABLE public.whatsapp_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  professional_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  evolution_api_url TEXT,
  evolution_api_key TEXT,
  evolution_instance_name TEXT,
  is_active BOOLEAN DEFAULT false,
  reminder_enabled BOOLEAN DEFAULT true,
  reminder_hours_before INTEGER DEFAULT 24,
  confirmation_enabled BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(professional_id)
);

-- Table for professional services/products (for checkout)
CREATE TABLE public.services (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  professional_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  duration_minutes INTEGER NOT NULL DEFAULT 50,
  price_cents INTEGER NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.whatsapp_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;

-- RLS Policies for whatsapp_settings
CREATE POLICY "Professionals can view their own whatsapp settings"
ON public.whatsapp_settings
FOR SELECT
USING (professional_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));

CREATE POLICY "Professionals can insert their own whatsapp settings"
ON public.whatsapp_settings
FOR INSERT
WITH CHECK (professional_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));

CREATE POLICY "Professionals can update their own whatsapp settings"
ON public.whatsapp_settings
FOR UPDATE
USING (professional_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));

CREATE POLICY "Professionals can delete their own whatsapp settings"
ON public.whatsapp_settings
FOR DELETE
USING (professional_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));

-- RLS Policies for services
CREATE POLICY "Professionals can view their own services"
ON public.services
FOR SELECT
USING (professional_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));

CREATE POLICY "Anyone can view active services"
ON public.services
FOR SELECT
USING (is_active = true);

CREATE POLICY "Professionals can insert their own services"
ON public.services
FOR INSERT
WITH CHECK (professional_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));

CREATE POLICY "Professionals can update their own services"
ON public.services
FOR UPDATE
USING (professional_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));

CREATE POLICY "Professionals can delete their own services"
ON public.services
FOR DELETE
USING (professional_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));

-- Triggers for updated_at
CREATE TRIGGER update_whatsapp_settings_updated_at
BEFORE UPDATE ON public.whatsapp_settings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_services_updated_at
BEFORE UPDATE ON public.services
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();