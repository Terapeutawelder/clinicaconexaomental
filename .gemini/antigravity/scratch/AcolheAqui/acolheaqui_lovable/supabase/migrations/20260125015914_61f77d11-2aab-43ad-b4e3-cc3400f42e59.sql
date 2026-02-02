-- Drop the existing overly permissive policy
DROP POLICY IF EXISTS "Anyone can view professional profiles" ON public.profiles;

-- Create a restricted policy: public can only view non-sensitive fields via view
-- Direct table access requires authentication
CREATE POLICY "Authenticated users can view professional profiles"
ON public.profiles
FOR SELECT
USING (
  -- Authenticated users can see professional profiles
  (auth.uid() IS NOT NULL AND is_professional = true)
  OR
  -- Users can always see their own profile
  (auth.uid() IS NOT NULL AND user_id = auth.uid())
);

-- Drop the old view if it exists
DROP VIEW IF EXISTS public.public_professional_profiles;

-- Create a secure view that only exposes non-sensitive fields
CREATE VIEW public.public_professional_profiles
WITH (security_invoker = false) AS
SELECT 
  id,
  full_name,
  specialty,
  specialties,
  approaches,
  crp,
  bio,
  avatar_url,
  is_professional,
  is_verified,
  verified_at,
  gender,
  user_slug,
  professional_status,
  created_at
  -- Explicitly excluding: email, phone, whatsapp_number, 
  -- facebook_url, instagram_url, linkedin_url, twitter_url, tiktok_url, youtube_url,
  -- resume_url, user_id, subscription_plan, subscription_status, subscription_expires_at
FROM public.profiles
WHERE is_professional = true 
  AND professional_status = 'active';

-- Grant SELECT on the view to anon and authenticated roles
GRANT SELECT ON public.public_professional_profiles TO anon;
GRANT SELECT ON public.public_professional_profiles TO authenticated;