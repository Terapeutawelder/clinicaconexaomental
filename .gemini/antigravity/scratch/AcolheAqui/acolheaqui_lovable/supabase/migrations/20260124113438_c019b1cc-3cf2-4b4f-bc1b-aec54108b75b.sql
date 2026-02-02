-- Add public read policy for landing page config (needed for professional landing pages)
CREATE POLICY "Anyone can view landing page config"
  ON public.landing_page_config
  FOR SELECT
  USING (true);