-- Remove the overly permissive insert policy
DROP POLICY IF EXISTS "Anyone can insert appointments" ON public.appointments;

-- Create a more restrictive insert policy that only allows inserts from authenticated users OR via service role (Edge Functions)
-- This means public bookings MUST go through an Edge Function for validation
CREATE POLICY "Appointments can only be inserted via Edge Functions or authenticated users"
ON public.appointments
FOR INSERT
WITH CHECK (
  -- Allow authenticated users (professionals creating appointments)
  auth.uid() IS NOT NULL 
  OR 
  -- Allow service role (Edge Functions) - this is checked at the connection level
  -- For now, we keep the table writable but enforce validation via Edge Function
  current_setting('request.jwt.claims', true)::json->>'role' = 'service_role'
);

-- Add a policy for clients to view their own appointments via email token verification
-- This uses a secure token approach - clients get a unique link to view their appointments
CREATE TABLE IF NOT EXISTS public.appointment_access_tokens (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  appointment_id uuid NOT NULL REFERENCES public.appointments(id) ON DELETE CASCADE,
  client_email text NOT NULL,
  token text NOT NULL UNIQUE DEFAULT encode(gen_random_bytes(32), 'hex'),
  expires_at timestamp with time zone NOT NULL DEFAULT (now() + interval '7 days'),
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS on the tokens table
ALTER TABLE public.appointment_access_tokens ENABLE ROW LEVEL SECURITY;

-- Only service role can manage tokens (via Edge Functions)
CREATE POLICY "Tokens managed by service role only"
ON public.appointment_access_tokens
FOR ALL
USING (false)
WITH CHECK (false);

-- Add index for faster token lookups
CREATE INDEX IF NOT EXISTS idx_appointment_access_tokens_token ON public.appointment_access_tokens(token);
CREATE INDEX IF NOT EXISTS idx_appointment_access_tokens_email ON public.appointment_access_tokens(client_email);
CREATE INDEX IF NOT EXISTS idx_appointment_access_tokens_expires ON public.appointment_access_tokens(expires_at);

-- Add comment explaining the security model
COMMENT ON TABLE public.appointment_access_tokens IS 'Secure tokens for clients to access their appointments without requiring authentication. Tokens are generated when appointments are created and sent via email.';