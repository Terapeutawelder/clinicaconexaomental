-- Allow public to view professional profiles
CREATE POLICY "Anyone can view professional profiles"
ON public.profiles
FOR SELECT
TO public
USING (is_professional = true);

-- Allow public to view available hours of professionals
CREATE POLICY "Anyone can view professional available hours"
ON public.available_hours
FOR SELECT
TO public
USING (
  professional_id IN (
    SELECT id FROM profiles WHERE is_professional = true
  )
);