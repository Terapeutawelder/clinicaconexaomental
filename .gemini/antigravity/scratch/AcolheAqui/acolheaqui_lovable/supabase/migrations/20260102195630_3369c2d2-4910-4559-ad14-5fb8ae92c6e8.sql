-- Create table for WebRTC signaling (virtual room sessions)
CREATE TABLE public.virtual_rooms (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  room_code TEXT NOT NULL UNIQUE,
  professional_id UUID NOT NULL,
  offer JSONB,
  answer JSONB,
  patient_name TEXT,
  status TEXT DEFAULT 'waiting' CHECK (status IN ('waiting', 'connected', 'closed')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (now() + INTERVAL '24 hours'),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.virtual_rooms ENABLE ROW LEVEL SECURITY;

-- Policy for professionals to manage their rooms
CREATE POLICY "Professionals can manage their own rooms" 
ON public.virtual_rooms 
FOR ALL 
USING (auth.uid() IN (
  SELECT user_id FROM public.profiles WHERE id = professional_id
))
WITH CHECK (auth.uid() IN (
  SELECT user_id FROM public.profiles WHERE id = professional_id
));

-- Policy for anyone to read rooms by code (for patients joining)
CREATE POLICY "Anyone can read rooms by code" 
ON public.virtual_rooms 
FOR SELECT 
USING (true);

-- Policy for anyone to update answer (for patients to join)
CREATE POLICY "Anyone can update room answer" 
ON public.virtual_rooms 
FOR UPDATE 
USING (true)
WITH CHECK (true);

-- Create index for faster lookups
CREATE INDEX idx_virtual_rooms_room_code ON public.virtual_rooms(room_code);
CREATE INDEX idx_virtual_rooms_professional_id ON public.virtual_rooms(professional_id);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_virtual_rooms_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_virtual_rooms_updated_at
BEFORE UPDATE ON public.virtual_rooms
FOR EACH ROW
EXECUTE FUNCTION public.update_virtual_rooms_updated_at();

-- Enable realtime for virtual_rooms table
ALTER PUBLICATION supabase_realtime ADD TABLE public.virtual_rooms;