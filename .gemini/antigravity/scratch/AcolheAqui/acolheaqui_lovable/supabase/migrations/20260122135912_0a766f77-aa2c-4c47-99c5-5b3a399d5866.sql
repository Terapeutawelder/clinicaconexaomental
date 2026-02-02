-- Create patient_records table for medical records
CREATE TABLE public.patient_records (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  professional_id UUID NOT NULL,
  patient_email TEXT NOT NULL,
  patient_name TEXT NOT NULL,
  chief_complaint TEXT,
  diagnosis TEXT,
  treatment_plan TEXT,
  medications JSONB DEFAULT '[]'::jsonb,
  allergies TEXT,
  medical_history TEXT,
  risk_level TEXT DEFAULT 'low',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(professional_id, patient_email)
);

-- Enable Row Level Security
ALTER TABLE public.patient_records ENABLE ROW LEVEL SECURITY;

-- Create RLS policies - professionals can only access their own patients' records
CREATE POLICY "Professionals can view their own patient records"
ON public.patient_records
FOR SELECT
USING (professional_id IN (
  SELECT profiles.id FROM profiles WHERE profiles.user_id = auth.uid()
));

CREATE POLICY "Professionals can insert their own patient records"
ON public.patient_records
FOR INSERT
WITH CHECK (professional_id IN (
  SELECT profiles.id FROM profiles WHERE profiles.user_id = auth.uid()
));

CREATE POLICY "Professionals can update their own patient records"
ON public.patient_records
FOR UPDATE
USING (professional_id IN (
  SELECT profiles.id FROM profiles WHERE profiles.user_id = auth.uid()
));

CREATE POLICY "Professionals can delete their own patient records"
ON public.patient_records
FOR DELETE
USING (professional_id IN (
  SELECT profiles.id FROM profiles WHERE profiles.user_id = auth.uid()
));

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_patient_records_updated_at
BEFORE UPDATE ON public.patient_records
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();