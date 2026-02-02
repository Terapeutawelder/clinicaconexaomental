-- Enable pg_net extension for HTTP calls from triggers
CREATE EXTENSION IF NOT EXISTS pg_net WITH SCHEMA extensions;

-- Create function to sync appointment to Google Calendar
CREATE OR REPLACE FUNCTION public.sync_appointment_to_google_calendar()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  google_settings RECORD;
  supabase_url TEXT;
  supabase_anon_key TEXT;
BEGIN
  -- Get Google Calendar settings for this professional
  SELECT * INTO google_settings
  FROM google_calendar_settings
  WHERE professional_id = NEW.professional_id
    AND is_connected = true
    AND sync_enabled = true;
  
  -- If no connected Google Calendar, skip
  IF NOT FOUND THEN
    RETURN NEW;
  END IF;
  
  -- Get Supabase URL and anon key from vault or use hardcoded values
  supabase_url := 'https://dctapmbdsfmzhtbpgigc.supabase.co';
  supabase_anon_key := 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRjdGFwbWJkc2Ztemh0YnBnaWdjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY4Mzg3MjIsImV4cCI6MjA4MjQxNDcyMn0.TdAMzml6AKavQ5FM9mgbqezfVbNE8rkjS4C9qvNikbs';
  
  -- Call the edge function asynchronously using pg_net
  PERFORM net.http_post(
    url := supabase_url || '/functions/v1/google-calendar-sync',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || supabase_anon_key
    ),
    body := jsonb_build_object(
      'action', 'sync-appointment',
      'appointmentId', NEW.id,
      'professionalId', NEW.professional_id
    )
  );
  
  RETURN NEW;
END;
$$;

-- Create trigger for new appointments
DROP TRIGGER IF EXISTS trigger_sync_appointment_to_google ON appointments;
CREATE TRIGGER trigger_sync_appointment_to_google
  AFTER INSERT ON appointments
  FOR EACH ROW
  EXECUTE FUNCTION sync_appointment_to_google_calendar();

-- Also create trigger for when appointment status changes to confirmed
CREATE OR REPLACE FUNCTION public.sync_updated_appointment_to_google_calendar()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  google_settings RECORD;
  supabase_url TEXT;
  supabase_anon_key TEXT;
BEGIN
  -- Only sync if status changed to 'confirmed' or 'pending'
  IF OLD.status IS DISTINCT FROM NEW.status AND NEW.status IN ('confirmed', 'pending') THEN
    -- Get Google Calendar settings for this professional
    SELECT * INTO google_settings
    FROM google_calendar_settings
    WHERE professional_id = NEW.professional_id
      AND is_connected = true
      AND sync_enabled = true;
    
    -- If no connected Google Calendar, skip
    IF NOT FOUND THEN
      RETURN NEW;
    END IF;
    
    supabase_url := 'https://dctapmbdsfmzhtbpgigc.supabase.co';
    supabase_anon_key := 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRjdGFwbWJkc2Ztemh0YnBnaWdjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY4Mzg3MjIsImV4cCI6MjA4MjQxNDcyMn0.TdAMzml6AKavQ5FM9mgbqezfVbNE8rkjS4C9qvNikbs';
    
    -- Call the edge function asynchronously
    PERFORM net.http_post(
      url := supabase_url || '/functions/v1/google-calendar-sync',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer ' || supabase_anon_key
      ),
      body := jsonb_build_object(
        'action', 'sync-appointment',
        'appointmentId', NEW.id,
        'professionalId', NEW.professional_id
      )
    );
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger for updated appointments
DROP TRIGGER IF EXISTS trigger_sync_updated_appointment_to_google ON appointments;
CREATE TRIGGER trigger_sync_updated_appointment_to_google
  AFTER UPDATE ON appointments
  FOR EACH ROW
  EXECUTE FUNCTION sync_updated_appointment_to_google_calendar();