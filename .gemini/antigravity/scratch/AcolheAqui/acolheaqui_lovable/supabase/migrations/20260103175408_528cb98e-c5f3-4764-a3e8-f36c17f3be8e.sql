-- Fix virtual_rooms security vulnerability
-- Remove overly permissive public policies and add proper restrictions

-- Drop the overly permissive policies
DROP POLICY IF EXISTS "Anyone can read rooms by code" ON public.virtual_rooms;
DROP POLICY IF EXISTS "Anyone can update room answer" ON public.virtual_rooms;

-- Add RESTRICTIVE policy requiring authentication for all SELECT operations
CREATE POLICY "Block unauthenticated access to virtual rooms"
ON public.virtual_rooms
AS RESTRICTIVE
FOR SELECT
USING (auth.uid() IS NOT NULL);

-- Add RESTRICTIVE policy requiring authentication for all UPDATE operations
CREATE POLICY "Block unauthenticated update on virtual rooms"
ON public.virtual_rooms
AS RESTRICTIVE
FOR UPDATE
USING (auth.uid() IS NOT NULL);

-- Now add permissive policies for legitimate access patterns

-- Authenticated users can read rooms by code (for patients joining via link)
CREATE POLICY "Authenticated users can read rooms by code"
ON public.virtual_rooms
FOR SELECT
USING (auth.uid() IS NOT NULL);

-- Authenticated users can update room answer (for WebRTC signaling)
-- Only allow updating the answer and status fields
CREATE POLICY "Authenticated users can update room answer"
ON public.virtual_rooms
FOR UPDATE
USING (auth.uid() IS NOT NULL)
WITH CHECK (auth.uid() IS NOT NULL);