-- Add user_slug column to profiles table for unique checkout URLs
ALTER TABLE public.profiles 
ADD COLUMN user_slug text;

-- Create unique index for user_slug (allows NULL values, but unique when set)
CREATE UNIQUE INDEX idx_profiles_user_slug_unique 
ON public.profiles (user_slug) 
WHERE user_slug IS NOT NULL AND user_slug != '';

-- Create index for faster lookups
CREATE INDEX idx_profiles_user_slug 
ON public.profiles (user_slug);

-- Function to generate a unique slug from a name
CREATE OR REPLACE FUNCTION public.generate_unique_slug(base_name text, exclude_profile_id uuid DEFAULT NULL)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  base_slug text;
  final_slug text;
  counter int := 0;
BEGIN
  -- Generate base slug from name
  base_slug := lower(
    regexp_replace(
      regexp_replace(
        unaccent(coalesce(base_name, 'user')),
        '[^a-zA-Z0-9]+', '-', 'g'
      ),
      '^-+|-+$', '', 'g'
    )
  );
  
  -- Limit length
  base_slug := substring(base_slug from 1 for 25);
  
  -- If empty, use default
  IF base_slug = '' THEN
    base_slug := 'user';
  END IF;
  
  final_slug := base_slug;
  
  -- Check for uniqueness and add suffix if needed
  WHILE EXISTS (
    SELECT 1 FROM profiles 
    WHERE user_slug = final_slug 
    AND (exclude_profile_id IS NULL OR id != exclude_profile_id)
  ) LOOP
    counter := counter + 1;
    final_slug := base_slug || '-' || counter::text;
  END LOOP;
  
  RETURN final_slug;
END;
$$;

-- Function to check if a slug is available
CREATE OR REPLACE FUNCTION public.check_slug_available(slug text, profile_id uuid DEFAULT NULL)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT NOT EXISTS (
    SELECT 1 FROM profiles 
    WHERE user_slug = slug 
    AND (profile_id IS NULL OR id != profile_id)
  );
$$;