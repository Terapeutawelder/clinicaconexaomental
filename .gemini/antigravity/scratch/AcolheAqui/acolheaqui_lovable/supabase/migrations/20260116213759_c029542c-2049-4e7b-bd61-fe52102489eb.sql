-- Add unique constraint on professional_id for google_calendar_settings if not exists
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'google_calendar_settings_professional_id_key'
  ) THEN
    ALTER TABLE public.google_calendar_settings 
    ADD CONSTRAINT google_calendar_settings_professional_id_key UNIQUE (professional_id);
  END IF;
END $$;