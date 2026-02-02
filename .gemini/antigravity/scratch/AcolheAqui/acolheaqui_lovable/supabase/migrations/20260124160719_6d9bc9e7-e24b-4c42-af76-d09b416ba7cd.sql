-- Add professional_status column to profiles table
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS professional_status TEXT DEFAULT 'pending' CHECK (professional_status IN ('active', 'pending', 'disabled'));

-- Update existing professionals to active status
UPDATE public.profiles SET professional_status = 'active' WHERE is_professional = true AND professional_status IS NULL;