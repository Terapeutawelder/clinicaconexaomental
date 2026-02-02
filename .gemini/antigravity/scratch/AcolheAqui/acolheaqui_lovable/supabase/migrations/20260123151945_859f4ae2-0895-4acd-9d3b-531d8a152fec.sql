-- Add verification fields to profiles
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS is_verified boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS verified_at timestamp with time zone,
ADD COLUMN IF NOT EXISTS user_slug text;

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_profiles_is_verified ON public.profiles(is_verified) WHERE is_verified = true;

-- Update existing profiles: mark as verified if they have completed registration (full_name, crp, specialty, avatar_url, phone)
UPDATE public.profiles 
SET is_verified = true, verified_at = now()
WHERE is_professional = true 
  AND full_name IS NOT NULL 
  AND full_name != ''
  AND crp IS NOT NULL 
  AND crp != ''
  AND specialty IS NOT NULL 
  AND specialty != ''
  AND avatar_url IS NOT NULL 
  AND avatar_url != ''
  AND phone IS NOT NULL 
  AND phone != '';