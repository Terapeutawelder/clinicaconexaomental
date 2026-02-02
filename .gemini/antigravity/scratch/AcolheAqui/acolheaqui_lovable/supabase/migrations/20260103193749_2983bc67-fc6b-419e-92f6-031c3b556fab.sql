-- Drop the overly permissive INSERT policy that allows anyone to insert
DROP POLICY IF EXISTS "Anyone can insert transactions" ON public.transactions;

-- Create a more restrictive INSERT policy
-- Transactions can be inserted by:
-- 1. Authenticated users (customers making payments)
-- 2. Service role (edge functions processing payments)
CREATE POLICY "Authenticated users or service role can insert transactions"
ON public.transactions
AS PERMISSIVE
FOR INSERT
WITH CHECK (
  auth.uid() IS NOT NULL 
  OR (current_setting('request.jwt.claims', true)::json ->> 'role') = 'service_role'
);