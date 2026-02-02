-- Add resume_url column to profiles table for curriculum upload
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS resume_url TEXT;