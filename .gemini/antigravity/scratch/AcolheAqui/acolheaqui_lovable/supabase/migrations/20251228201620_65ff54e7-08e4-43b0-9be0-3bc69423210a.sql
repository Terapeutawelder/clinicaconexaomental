-- Drop the view and recreate without security definer issue
DROP VIEW IF EXISTS public.public_professional_profiles;

-- Create the view with SECURITY INVOKER (default, safe)
CREATE VIEW public.public_professional_profiles 
WITH (security_invoker = true) AS
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

-- Grant access to the view for both anonymous and authenticated users
GRANT SELECT ON public.public_professional_profiles TO anon, authenticated;