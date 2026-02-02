-- Drop the existing restrictive policy and create a proper permissive one
-- Restrictive policies only restrict access already granted - they don't grant access
-- We need a PERMISSIVE policy to grant access to professionals for their own appointments

DROP POLICY IF EXISTS "Professionals can view their own appointments" ON public.appointments;

-- Create a PERMISSIVE policy that grants SELECT access only to professionals for their own appointments
CREATE POLICY "Professionals can view their own appointments"
ON public.appointments
AS PERMISSIVE
FOR SELECT
TO authenticated
USING (
  professional_id IN (
    SELECT id FROM profiles WHERE user_id = auth.uid()
  )
);