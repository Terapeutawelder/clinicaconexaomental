-- Remove the policy that exposes sensitive contact information to all authenticated users
DROP POLICY IF EXISTS "Authenticated users can view professional profiles for booking" ON public.profiles;

-- Drop the existing function first to allow changing return type
DROP FUNCTION IF EXISTS public.get_professional_contact(UUID);

-- Create a secure function to get professional contact info only when authorized
-- This function can be called by edge functions with service role or by the professional themselves
CREATE OR REPLACE FUNCTION public.get_professional_contact(professional_id UUID)
RETURNS TABLE (email TEXT, phone TEXT)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Only return contact info if:
  -- 1. The requester is the professional themselves
  -- 2. Or this is called from a service role context (edge functions)
  IF auth.uid() IS NULL THEN
    -- Service role context - allow access
    RETURN QUERY
    SELECT p.email, p.phone
    FROM profiles p
    WHERE p.id = professional_id AND p.is_professional = true;
  ELSIF auth.uid() = (SELECT user_id FROM profiles WHERE id = professional_id) THEN
    -- Professional accessing their own info
    RETURN QUERY
    SELECT p.email, p.phone
    FROM profiles p
    WHERE p.id = professional_id;
  ELSE
    -- Unauthorized access - return empty
    RETURN;
  END IF;
END;
$$;

-- Grant execute permission to authenticated users and service role
GRANT EXECUTE ON FUNCTION public.get_professional_contact(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_professional_contact(UUID) TO service_role;

-- Add a comment explaining the security model
COMMENT ON FUNCTION public.get_professional_contact IS 'Secure function to access professional contact information. Only returns data for the professional themselves or service role (edge functions).';