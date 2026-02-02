-- Add is_demo column to profiles table
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS is_demo boolean DEFAULT false;

-- Add comment explaining the column
COMMENT ON COLUMN public.profiles.is_demo IS 'Flag to identify demo/fake professionals for demonstration purposes';

-- Update existing RLS policies to include demo profiles in public view
-- Demo profiles should be visible to everyone in the directory