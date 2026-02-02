-- Add explicit protection for appointments table
-- Ensure only authenticated professionals can access their own appointments

-- Create a more restrictive SELECT policy that requires authentication
-- The existing policy already checks professional ownership, but we add defense in depth
CREATE POLICY "Block unauthenticated access to appointments"
ON public.appointments
AS RESTRICTIVE
FOR SELECT
USING (auth.uid() IS NOT NULL);

-- Recreate INSERT policy with proper restrictive clause
DROP POLICY IF EXISTS "Appointments can only be inserted via Edge Functions or authent" ON public.appointments;

CREATE POLICY "Only authenticated users or service role can insert appointments"
ON public.appointments
AS RESTRICTIVE
FOR INSERT
WITH CHECK (
  auth.uid() IS NOT NULL 
  OR (current_setting('request.jwt.claims', true)::json ->> 'role') = 'service_role'
);

-- Add explicit protection for DELETE
CREATE POLICY "Block unauthenticated delete on appointments"
ON public.appointments
AS RESTRICTIVE
FOR DELETE
USING (auth.uid() IS NOT NULL);

-- Add explicit protection for UPDATE
CREATE POLICY "Block unauthenticated update on appointments"
ON public.appointments
AS RESTRICTIVE
FOR UPDATE
USING (auth.uid() IS NOT NULL);