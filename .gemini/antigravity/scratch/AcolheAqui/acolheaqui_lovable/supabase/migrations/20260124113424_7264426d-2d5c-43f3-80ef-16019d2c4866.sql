-- Add public read policy for active services (needed for professional landing pages)
CREATE POLICY "Anyone can view active services"
  ON public.services
  FOR SELECT
  USING (is_active = true);