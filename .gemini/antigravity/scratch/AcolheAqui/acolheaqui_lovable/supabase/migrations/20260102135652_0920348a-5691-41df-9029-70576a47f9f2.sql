-- Add column to store AI Psi analysis in appointments
ALTER TABLE public.appointments 
ADD COLUMN ai_psi_analysis text;