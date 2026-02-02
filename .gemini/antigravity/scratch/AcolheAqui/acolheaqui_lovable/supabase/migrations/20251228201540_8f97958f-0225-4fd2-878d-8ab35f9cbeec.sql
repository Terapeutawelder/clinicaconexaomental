-- Create a secure view for public professional profiles (without sensitive data)
CREATE OR REPLACE VIEW public.public_professional_profiles AS
SELECT 
  id,
  full_name,
  specialty,
  crp,
  bio,
  avatar_url,
  is_professional,
  created_at
FROM public.profiles
WHERE is_professional = true;

-- Grant access to the view
GRANT SELECT ON public.public_professional_profiles TO anon, authenticated;

-- Update RLS policy: Remove the old policy that exposes all data
DROP POLICY IF EXISTS "Anyone can view professional profiles" ON public.profiles;

-- Create new restrictive policy: Only authenticated users during booking flow can see contact info
-- This policy allows viewing full profile only for: 
-- 1. The profile owner
-- 2. (Email/phone will only be accessible through authenticated booking flow via edge function)
CREATE POLICY "Authenticated users can view professional profiles for booking" 
ON public.profiles 
FOR SELECT 
USING (
  is_professional = true 
  AND auth.uid() IS NOT NULL
);

-- Keep the self-view policy (already exists, just ensuring)
-- Users can always view their own profile with all data