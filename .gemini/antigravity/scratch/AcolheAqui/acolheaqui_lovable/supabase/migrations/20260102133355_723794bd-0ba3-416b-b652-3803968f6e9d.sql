-- Add columns for virtual room and session recordings to appointments table
ALTER TABLE public.appointments 
ADD COLUMN IF NOT EXISTS virtual_room_code text,
ADD COLUMN IF NOT EXISTS virtual_room_link text,
ADD COLUMN IF NOT EXISTS recording_url text,
ADD COLUMN IF NOT EXISTS transcription jsonb DEFAULT '[]'::jsonb;

-- Create index for virtual room code lookup
CREATE INDEX IF NOT EXISTS idx_appointments_virtual_room_code ON public.appointments(virtual_room_code);

-- Create storage bucket for session recordings
INSERT INTO storage.buckets (id, name, public) 
VALUES ('session-recordings', 'session-recordings', false)
ON CONFLICT (id) DO NOTHING;

-- Create RLS policies for session recordings bucket
CREATE POLICY "Professionals can upload their own session recordings"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'session-recordings' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Professionals can view their own session recordings"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'session-recordings' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Professionals can delete their own session recordings"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'session-recordings' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);