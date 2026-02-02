-- Add gender field to profiles table for Dr./Dra. prefix
ALTER TABLE public.profiles 
ADD COLUMN gender TEXT DEFAULT 'female' CHECK (gender IN ('male', 'female'));