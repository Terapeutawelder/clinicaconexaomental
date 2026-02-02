-- Create google_calendar_settings table for storing OAuth tokens and settings
CREATE TABLE public.google_calendar_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  professional_id UUID NOT NULL UNIQUE,
  is_connected BOOLEAN DEFAULT false,
  google_email TEXT,
  access_token TEXT,
  refresh_token TEXT,
  token_expires_at TIMESTAMP WITH TIME ZONE,
  sync_enabled BOOLEAN DEFAULT true,
  auto_create_meet BOOLEAN DEFAULT true,
  sync_direction TEXT DEFAULT 'two_way' CHECK (sync_direction IN ('one_way', 'two_way')),
  last_sync_at TIMESTAMP WITH TIME ZONE,
  calendar_id TEXT DEFAULT 'primary',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.google_calendar_settings ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Professionals can view their own google settings"
  ON public.google_calendar_settings
  FOR SELECT
  USING (professional_id IN (
    SELECT id FROM profiles WHERE user_id = auth.uid()
  ));

CREATE POLICY "Professionals can insert their own google settings"
  ON public.google_calendar_settings
  FOR INSERT
  WITH CHECK (professional_id IN (
    SELECT id FROM profiles WHERE user_id = auth.uid()
  ));

CREATE POLICY "Professionals can update their own google settings"
  ON public.google_calendar_settings
  FOR UPDATE
  USING (professional_id IN (
    SELECT id FROM profiles WHERE user_id = auth.uid()
  ));

CREATE POLICY "Professionals can delete their own google settings"
  ON public.google_calendar_settings
  FOR DELETE
  USING (professional_id IN (
    SELECT id FROM profiles WHERE user_id = auth.uid()
  ));

-- Trigger for updated_at
CREATE TRIGGER update_google_calendar_settings_updated_at
  BEFORE UPDATE ON public.google_calendar_settings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Index for faster lookups
CREATE INDEX idx_google_calendar_settings_professional ON public.google_calendar_settings(professional_id);