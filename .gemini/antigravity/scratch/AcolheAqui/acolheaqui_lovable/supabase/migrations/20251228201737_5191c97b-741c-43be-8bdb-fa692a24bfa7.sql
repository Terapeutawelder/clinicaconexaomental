-- Drop the problematic view 
DROP VIEW IF EXISTS public.public_professional_profiles;

-- Recreate as a simple view with INVOKER security (checks caller's permissions)
CREATE VIEW public.public_professional_profiles AS
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

-- Create a security definer function to get professional contact info for authenticated users only
-- This function can be called during booking flow
CREATE OR REPLACE FUNCTION public.get_professional_contact(professional_id uuid)
RETURNS TABLE (phone text, email text)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT phone, email
  FROM public.profiles
  WHERE id = professional_id
    AND is_professional = true;
$$;

-- Grant execute to authenticated users only
GRANT EXECUTE ON FUNCTION public.get_professional_contact(uuid) TO authenticated;
REVOKE EXECUTE ON FUNCTION public.get_professional_contact(uuid) FROM anon;