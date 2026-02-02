-- Create table for landing page configurations
CREATE TABLE public.landing_page_config (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  professional_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  config JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(professional_id)
);

-- Enable RLS
ALTER TABLE public.landing_page_config ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Professionals can view their own config"
ON public.landing_page_config
FOR SELECT
USING (professional_id IN (
  SELECT id FROM profiles WHERE user_id = auth.uid()
));

CREATE POLICY "Professionals can insert their own config"
ON public.landing_page_config
FOR INSERT
WITH CHECK (professional_id IN (
  SELECT id FROM profiles WHERE user_id = auth.uid()
));

CREATE POLICY "Professionals can update their own config"
ON public.landing_page_config
FOR UPDATE
USING (professional_id IN (
  SELECT id FROM profiles WHERE user_id = auth.uid()
));

CREATE POLICY "Professionals can delete their own config"
ON public.landing_page_config
FOR DELETE
USING (professional_id IN (
  SELECT id FROM profiles WHERE user_id = auth.uid()
));

-- Trigger for updated_at
CREATE TRIGGER update_landing_page_config_updated_at
BEFORE UPDATE ON public.landing_page_config
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();