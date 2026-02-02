-- Drop the existing ALL policy that's too restrictive for INSERT
DROP POLICY IF EXISTS "Professionals can manage their own rooms" ON public.virtual_rooms;

-- Create separate policies for each operation
CREATE POLICY "Professionals can insert rooms" 
ON public.virtual_rooms 
FOR INSERT 
WITH CHECK (
  professional_id IN (
    SELECT id FROM profiles WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Professionals can update their own rooms" 
ON public.virtual_rooms 
FOR UPDATE 
USING (
  professional_id IN (
    SELECT id FROM profiles WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Professionals can delete their own rooms" 
ON public.virtual_rooms 
FOR DELETE 
USING (
  professional_id IN (
    SELECT id FROM profiles WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Professionals can view their own rooms" 
ON public.virtual_rooms 
FOR SELECT 
USING (
  professional_id IN (
    SELECT id FROM profiles WHERE user_id = auth.uid()
  )
);