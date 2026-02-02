-- Add thumbnail_focus column to member_modules table
-- Options: 'top', 'center', 'bottom' (default: 'center')
ALTER TABLE public.member_modules 
ADD COLUMN IF NOT EXISTS thumbnail_focus TEXT DEFAULT 'center';