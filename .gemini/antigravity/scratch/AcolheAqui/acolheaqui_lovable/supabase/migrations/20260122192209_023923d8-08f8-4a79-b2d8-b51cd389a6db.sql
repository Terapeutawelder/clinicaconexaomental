-- Add specialties (services like anxiety, depression, phobias) and approaches columns to profiles
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS specialties text[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS approaches text[] DEFAULT '{}';