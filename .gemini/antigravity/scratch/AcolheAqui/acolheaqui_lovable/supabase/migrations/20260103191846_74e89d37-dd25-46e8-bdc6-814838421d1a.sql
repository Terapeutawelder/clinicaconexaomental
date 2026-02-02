-- Drop the overly permissive SELECT policy that allows any authenticated user to view all appointments
DROP POLICY IF EXISTS "Block unauthenticated access to appointments" ON public.appointments;

-- The "Professionals can view their own appointments" policy already exists and correctly restricts access
-- This ensures only professionals can see their own appointments (via professional_id match)