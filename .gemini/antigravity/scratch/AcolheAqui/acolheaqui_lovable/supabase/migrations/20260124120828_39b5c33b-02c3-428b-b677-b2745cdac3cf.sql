-- Make user_id nullable for demo profiles
-- First, drop the foreign key constraint if it exists
DO $$ 
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'profiles_user_id_fkey'
  ) THEN
    ALTER TABLE public.profiles DROP CONSTRAINT profiles_user_id_fkey;
  END IF;
END $$;

-- Make user_id nullable
ALTER TABLE public.profiles ALTER COLUMN user_id DROP NOT NULL;

-- Re-create the foreign key constraint but without restricting to existing users
-- This allows demo profiles to have NULL user_id
ALTER TABLE public.profiles 
  ADD CONSTRAINT profiles_user_id_fkey 
  FOREIGN KEY (user_id) 
  REFERENCES auth.users(id) 
  ON DELETE CASCADE
  DEFERRABLE INITIALLY DEFERRED;

-- Allow NULL values for demo profiles by making the FK only apply to non-null values
-- (PostgreSQL allows this by default for nullable columns)